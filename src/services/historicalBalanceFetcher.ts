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

    // Step 2: Process transactions in batches and build up token balances
    const tokenBalances = await this.processTransactions(publicKey, signatures);

    // Step 3: Convert to TokenBalance array
    const balances = await this.convertToTokenBalances(tokenBalances);

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
   */
  private async processTransactions(
    walletPublicKey: PublicKey,
    signatures: ConfirmedSignatureInfo[]
  ): Promise<Map<string, number>> {
    const tokenBalances = new Map<string, number>();
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
          this.extractTokenChanges(tx, walletAddress, tokenBalances);
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

    return tokenBalances;
  }

  /**
   * Extract token balance changes from a transaction
   */
  private extractTokenChanges(
    tx: ParsedTransactionWithMeta,
    walletAddress: string,
    tokenBalances: Map<string, number>
  ): void {
    if (!tx.meta) return;

    // Handle SOL balance changes
    const walletIndex = tx.transaction.message.accountKeys.findIndex(
      key => key.pubkey.toBase58() === walletAddress
    );

    if (walletIndex !== -1) {
      const preBalance = tx.meta.preBalances[walletIndex] || 0;
      const postBalance = tx.meta.postBalances[walletIndex] || 0;
      const solChange = (postBalance - preBalance) / 1e9; // Convert lamports to SOL

      if (solChange !== 0) {
        const SOL_ADDRESS = 'So11111111111111111111111111111111111111112';
        const currentSolBalance = tokenBalances.get(SOL_ADDRESS) || 0;
        tokenBalances.set(SOL_ADDRESS, currentSolBalance + solChange);
      }
    }

    // Handle SPL token balance changes
    if (tx.meta.preTokenBalances && tx.meta.postTokenBalances) {
      // Create maps for easier lookup
      const preBalances = new Map<string, number>();
      const postBalances = new Map<string, number>();

      // Index pre-balances by account
      for (const preToken of tx.meta.preTokenBalances) {
        if (preToken.owner === walletAddress && preToken.uiTokenAmount.uiAmount !== null) {
          const key = `${preToken.accountIndex}_${preToken.mint}`;
          preBalances.set(key, preToken.uiTokenAmount.uiAmount);
        }
      }

      // Process post-balances and calculate changes
      for (const postToken of tx.meta.postTokenBalances) {
        if (postToken.owner === walletAddress && postToken.uiTokenAmount.uiAmount !== null) {
          const key = `${postToken.accountIndex}_${postToken.mint}`;
          const preBal = preBalances.get(key) || 0;
          const postBal = postToken.uiTokenAmount.uiAmount;
          const change = postBal - preBal;

          if (change !== 0) {
            const currentBalance = tokenBalances.get(postToken.mint) || 0;
            tokenBalances.set(postToken.mint, currentBalance + change);
          }
        }
      }
    }
  }

  /**
   * Convert token balance map to TokenBalance array
   */
  private async convertToTokenBalances(
    tokenBalances: Map<string, number>
  ): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = [];

    for (const [mintAddress, balance] of tokenBalances.entries()) {
      if (balance > 0) {
        // Get token metadata
        const metadata = await this.getTokenMetadata(mintAddress);

        balances.push({
          tokenAddress: mintAddress,
          tokenName: metadata.name,
          tokenSymbol: metadata.symbol,
          balance,
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
