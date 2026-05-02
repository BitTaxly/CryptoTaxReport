import { Connection, PublicKey, ParsedTransactionWithMeta, ConfirmedSignatureInfo } from '@solana/web3.js';
import { TokenBalance } from '@/types';
import { getTransactionCache } from './transactionCache';

interface TransactionProgress {
  total: number;
  processed: number;
  percentage: number;
}

interface HistoricalBalanceResult {
  balances: TokenBalance[];
  transactionsProcessed: number;
  targetDate: Date;
}

/**
 * Fetches historical token balances for a Solana wallet by parsing all transactions
 * up to a specific date. This is the only accurate way to get portfolio value at a past date.
 */
export class HistoricalBalanceFetcher {
  private connection: Connection;
  private progressCallback?: (progress: TransactionProgress) => void;

  constructor(rpcEndpoint?: string, progressCallback?: (progress: TransactionProgress) => void) {
    this.connection = new Connection(
      rpcEndpoint || process.env.SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
    this.progressCallback = progressCallback;
  }

  /**
   * Main entry point: Get historical balances for a wallet at a specific date
   */
  async getHistoricalBalances(
    walletAddress: string,
    targetDate: Date
  ): Promise<HistoricalBalanceResult> {
    console.log(`[Historical] Fetching balances for ${walletAddress} at ${targetDate.toISOString()}`);

    const targetTimestamp = Math.floor(targetDate.getTime() / 1000);

    // Check cache first
    const cache = getTransactionCache();
    const cached = cache.get(walletAddress, targetTimestamp);
    if (cached) {
      return {
        balances: cached.balances,
        transactionsProcessed: cached.transactionsProcessed,
        targetDate,
      };
    }

    const publicKey = new PublicKey(walletAddress);

    // Step 1: Fetch all transaction signatures up to target date
    const signatures = await this.fetchAllSignaturesUntil(publicKey, targetTimestamp);
    console.log(`[Historical] Found ${signatures.length} transactions to process`);

    // CRITICAL: Reverse to process chronologically (oldest first)
    // Signatures come from RPC in descending order (newest first)
    signatures.reverse();
    console.log(`[Historical] Reversed to chronological order (oldest → newest)`);

    // Step 2: Process transactions in batches and build up token balances
    const tokenBalances = await this.processTransactions(publicKey, signatures);

    // Step 3: Convert to TokenBalance array (only wallet-owned accounts)
    const balances = await this.convertToTokenBalances(tokenBalances, walletAddress);

    // Store in cache before returning
    cache.set(walletAddress, targetTimestamp, balances, signatures.length);

    return {
      balances,
      transactionsProcessed: signatures.length,
      targetDate,
    };
  }

  /**
   * Fetch all transaction signatures from beginning until target timestamp
   */
  private async fetchAllSignaturesUntil(
    publicKey: PublicKey,
    untilTimestamp: number
  ): Promise<ConfirmedSignatureInfo[]> {
    const allSignatures: ConfirmedSignatureInfo[] = [];
    let lastSignature: string | undefined;
    let hasMore = true;

    console.log(`[Historical] Fetching signatures until ${new Date(untilTimestamp * 1000).toISOString()}`);

    while (hasMore) {
      const options: any = {
        limit: 1000,
      };

      if (lastSignature) {
        options.before = lastSignature;
      }

      try {
        const signatures = await this.connection.getSignaturesForAddress(publicKey, options);

        if (signatures.length === 0) {
          break;
        }

        // Filter signatures that are before or at target date
        // Note: signatures come in descending order (newest first)
        // We need to collect all transactions <= target date
        let foundOlderThanTarget = false;

        for (const sig of signatures) {
          if (sig.blockTime && sig.blockTime <= untilTimestamp) {
            allSignatures.push(sig);
            foundOlderThanTarget = true;
          }
          // Skip transactions newer than target date but continue collecting
        }

        // If we got less than 1000, we've reached the end of the wallet's history
        if (signatures.length < 1000) {
          break;
        }

        // If all transactions in this batch were older than target date,
        // we can stop (we've collected everything we need)
        const allOlderThanTarget = signatures.every(
          sig => sig.blockTime && sig.blockTime <= untilTimestamp
        );
        if (allOlderThanTarget) {
          break;
        }

        lastSignature = signatures[signatures.length - 1].signature;

        // Delay to avoid rate limiting on public RPC endpoints
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('[Historical] Error fetching signatures:', error);
        throw error;
      }
    }

    return allSignatures;
  }

  /**
   * Process all transactions and build up token balance changes
   * Returns a map of token account addresses to their final balances
   */
  private async processTransactions(
    walletPublicKey: PublicKey,
    signatures: ConfirmedSignatureInfo[]
  ): Promise<Map<string, { balance: number; mint: string; owner: string }>> {
    const tokenAccounts = new Map<string, { balance: number; mint: string; owner: string }>();
    const walletAddress = walletPublicKey.toBase58();

    // Process in batches of 50 to avoid overwhelming the RPC (reduced from 100)
    const BATCH_SIZE = 50;
    let processed = 0;

    for (let i = 0; i < signatures.length; i += BATCH_SIZE) {
      const batch = signatures.slice(i, i + BATCH_SIZE);

      // Fetch transactions in parallel within the batch
      const txPromises = batch.map(sig =>
        this.connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        })
      );

      const transactions = await Promise.all(txPromises);

      // Process each transaction
      for (const tx of transactions) {
        if (tx) {
          this.extractTokenChanges(tx, walletAddress, tokenAccounts);
        }
      }

      processed += batch.length;

      // Report progress
      if (this.progressCallback) {
        this.progressCallback({
          total: signatures.length,
          processed,
          percentage: Math.floor((processed / signatures.length) * 100),
        });
      }

      console.log(`[Historical] Processed ${processed}/${signatures.length} transactions (${Math.floor((processed / signatures.length) * 100)}%)`);

      // Longer delay between batches to avoid rate limiting on public RPC
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return tokenAccounts;
  }

  /**
   * Extract token balance changes from a transaction
   * Now tracks balances per token ACCOUNT (not just per mint) to handle Jupiter routing correctly
   */
  private extractTokenChanges(
    tx: ParsedTransactionWithMeta,
    walletAddress: string,
    tokenAccounts: Map<string, { balance: number; mint: string; owner: string }>
  ): void {
    if (!tx.meta) return;

    // Handle SOL balance changes (native SOL, not wrapped)
    const walletIndex = tx.transaction.message.accountKeys.findIndex(
      key => key.pubkey.toBase58() === walletAddress
    );

    if (walletIndex !== -1) {
      const postBalance = tx.meta.postBalances[walletIndex] || 0;
      const solBalance = postBalance / 1e9; // Absolute SOL balance after this tx

      // Store absolute SOL balance (same approach as SPL tokens)
      const SOL_MINT = 'So11111111111111111111111111111111111111112';
      tokenAccounts.set(walletAddress, {
        balance: solBalance,
        mint: SOL_MINT,
        owner: walletAddress,
      });
    }

    // Handle SPL token balance changes - track by TOKEN ACCOUNT address
    if (tx.meta.preTokenBalances && tx.meta.postTokenBalances) {
      // Create maps for easier lookup by account index
      const preBalances = new Map<number, { amount: number; mint: string; owner: string }>();

      // Index pre-balances by account index
      for (const preToken of tx.meta.preTokenBalances) {
        if (preToken.uiTokenAmount.uiAmount !== null) {
          preBalances.set(preToken.accountIndex, {
            amount: preToken.uiTokenAmount.uiAmount,
            mint: preToken.mint,
            owner: preToken.owner || '',
          });
        }
      }

      // Process post-balances - store ABSOLUTE balances for wallet-owned accounts
      // NOTE: uiAmount is null when balance is 0 - we must handle this, not skip it
      for (const postToken of tx.meta.postTokenBalances) {
        const accountAddress = tx.transaction.message.accountKeys[postToken.accountIndex].pubkey.toBase58();
        const preBal = preBalances.get(postToken.accountIndex);
        const preOwner = preBal?.owner || '';
        const postOwner = postToken.owner || '';

        if (postOwner === walletAddress) {
          // uiAmount is null when balance is 0 - treat null as 0
          const balance = postToken.uiTokenAmount.uiAmount ?? 0;
          tokenAccounts.set(accountAddress, {
            balance,
            mint: postToken.mint,
            owner: walletAddress,
          });
        } else if (preOwner === walletAddress && postOwner !== walletAddress) {
          tokenAccounts.delete(accountAddress);
        }
      }

      // Handle CLOSED accounts: present in preTokenBalances but absent in postTokenBalances
      // When a token account is closed via closeAccount instruction, it vanishes from post balances
      const postAccountIndices = new Set(tx.meta.postTokenBalances.map(b => b.accountIndex));
      for (const [index, preBal] of preBalances.entries()) {
        if (!postAccountIndices.has(index) && preBal.owner === walletAddress) {
          const accountAddress = tx.transaction.message.accountKeys[index].pubkey.toBase58();
          tokenAccounts.delete(accountAddress);
        }
      }
    }
  }

  /**
   * Convert token account map to TokenBalance array
   * Filters for wallet-owned accounts only, then aggregates by mint address
   * This prevents Jupiter routing accounts from inflating balances
   */
  private async convertToTokenBalances(
    tokenAccounts: Map<string, { balance: number; mint: string; owner: string }>,
    walletAddress: string
  ): Promise<TokenBalance[]> {
    // First, aggregate balances by mint address, only including wallet-owned accounts
    const mintBalances = new Map<string, { balance: number; accounts: string[] }>();

    console.log(`[Historical] Final token accounts snapshot:`);
    let totalAccounts = 0;
    let walletOwnedAccounts = 0;

    for (const [accountAddress, accountInfo] of tokenAccounts.entries()) {
      totalAccounts++;
      // Only include accounts with positive balances
      if (accountInfo.balance > 0) {
        walletOwnedAccounts++;
        const current = mintBalances.get(accountInfo.mint) || { balance: 0, accounts: [] };
        current.balance += accountInfo.balance;
        current.accounts.push(accountAddress.slice(0, 8));
        mintBalances.set(accountInfo.mint, current);

        // Special logging for USDC
        const isUSDC = accountInfo.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
        if (isUSDC) {
          console.log(`[Historical] 💰 USDC Account ${accountAddress.slice(0, 12)}...: ${accountInfo.balance.toFixed(2)}`);
        }
      }
    }

    console.log(`[Historical] Found ${walletOwnedAccounts} wallet-owned accounts`);

    // Log USDC totals
    const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    const usdcInfo = mintBalances.get(usdcMint);
    if (usdcInfo) {
      console.log(`[Historical] 🎯 TOTAL USDC: ${usdcInfo.balance.toFixed(2)} across ${usdcInfo.accounts.length} accounts: ${usdcInfo.accounts.join(', ')}`);
    }

    // Now convert to TokenBalance array with metadata
    const balances: TokenBalance[] = [];

    for (const [mintAddress, info] of mintBalances.entries()) {
      if (info.balance > 0) {
        // Get token metadata
        const metadata = await this.getTokenMetadata(mintAddress);

        balances.push({
          tokenAddress: mintAddress,
          tokenName: metadata.name,
          tokenSymbol: metadata.symbol,
          balance: info.balance,
          decimals: metadata.decimals,
        });
      }
    }

    return balances;
  }

  /**
   * Get token metadata (symbol, name, decimals)
   */
  private async getTokenMetadata(mintAddress: string): Promise<{
    symbol: string;
    name: string;
    decimals: number;
  }> {
    // Special case for SOL
    if (mintAddress === 'So11111111111111111111111111111111111111112') {
      return {
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
      };
    }

    try {
      // Try to get on-chain metadata
      const mintPubkey = new PublicKey(mintAddress);
      const mintInfo = await this.connection.getParsedAccountInfo(mintPubkey);

      if (mintInfo.value && 'parsed' in mintInfo.value.data) {
        const parsed = mintInfo.value.data.parsed;
        if (parsed.type === 'mint') {
          return {
            symbol: mintAddress.slice(0, 4) + '...' + mintAddress.slice(-4),
            name: 'Token',
            decimals: parsed.info.decimals || 9,
          };
        }
      }
    } catch (error) {
      console.error(`[Historical] Error fetching metadata for ${mintAddress}:`, error);
    }

    // Fallback
    return {
      symbol: mintAddress.slice(0, 4) + '...' + mintAddress.slice(-4),
      name: 'Token',
      decimals: 9,
    };
  }
}
