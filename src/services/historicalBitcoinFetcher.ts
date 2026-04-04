import { TokenBalance } from '@/types';
import { getTransactionCache } from './transactionCache';

interface BitcoinTransaction {
  hash: string;
  time: number;
  result: number; // Change in balance (satoshis)
  balance: number; // Running balance (satoshis)
}

interface HistoricalBitcoinResult {
  balances: TokenBalance[];
  transactionsProcessed: number;
  targetDate: Date;
}

/**
 * Fetches historical Bitcoin balance by analyzing transaction history up to a specific date.
 * Uses Blockchain.info API (free, no API key required).
 */
export class HistoricalBitcoinFetcher {
  private readonly BLOCKCHAIN_INFO_API = 'https://blockchain.info';

  /**
   * Get historical Bitcoin balance for a wallet at a specific date
   */
  async getHistoricalBalance(
    walletAddress: string,
    targetDate: Date
  ): Promise<HistoricalBitcoinResult> {
    console.log(`[Bitcoin Historical] Fetching balance for ${walletAddress} at ${targetDate.toISOString()}`);

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

    try {
      // Fetch all transactions for the address
      const transactions = await this.fetchTransactionHistory(walletAddress);
      console.log(`[Bitcoin Historical] Found ${transactions.length} total transactions`);

      // Filter transactions up to target date and calculate balance
      let balance = 0;
      let txCount = 0;

      for (const tx of transactions) {
        if (tx.time <= targetTimestamp) {
          balance = tx.balance;
          txCount++;
        } else {
          // Transactions are ordered newest first, so we can break early
          break;
        }
      }

      // Convert satoshis to BTC
      const btcBalance = balance / 100000000;

      console.log(`[Bitcoin Historical] Processed ${txCount} transactions, balance: ${btcBalance} BTC`);

      const balances: TokenBalance[] = btcBalance > 0 ? [{
        tokenAddress: 'bitcoin-native',
        tokenName: 'Bitcoin',
        tokenSymbol: 'BTC',
        balance: btcBalance,
        decimals: 8,
      }] : [];

      // Store in cache
      cache.set(walletAddress, targetTimestamp, balances, txCount);

      return {
        balances,
        transactionsProcessed: txCount,
        targetDate,
      };
    } catch (error) {
      console.error('[Bitcoin Historical] Error fetching historical balance:', error);
      throw error;
    }
  }

  /**
   * Fetch complete transaction history from Blockchain.info
   */
  private async fetchTransactionHistory(address: string): Promise<BitcoinTransaction[]> {
    const allTransactions: BitcoinTransaction[] = [];
    let offset = 0;
    const limit = 50; // API limit per request

    while (true) {
      try {
        const url = `${this.BLOCKCHAIN_INFO_API}/rawaddr/${address}?limit=${limit}&offset=${offset}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Blockchain.info API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.txs || data.txs.length === 0) {
          break;
        }

        // Process transactions and calculate running balance
        for (const tx of data.txs) {
          // Calculate the change in balance for this address
          let result = 0;
          let runningBalance = 0;

          // Sum all outputs to this address
          for (const out of tx.out) {
            if (out.addr === address) {
              result += out.value;
            }
          }

          // Subtract all inputs from this address
          for (const input of tx.inputs) {
            if (input.prev_out && input.prev_out.addr === address) {
              result -= input.prev_out.value;
            }
          }

          allTransactions.push({
            hash: tx.hash,
            time: tx.time,
            result,
            balance: 0, // Will calculate running balance below
          });
        }

        offset += limit;

        // If we got fewer transactions than the limit, we've reached the end
        if (data.txs.length < limit) {
          break;
        }

        // Rate limiting - delay between requests
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error('[Bitcoin Historical] Error fetching transaction page:', error);
        throw error;
      }
    }

    // Sort transactions by time (oldest first) and calculate running balance
    allTransactions.sort((a, b) => a.time - b.time);

    let runningBalance = 0;
    for (const tx of allTransactions) {
      runningBalance += tx.result;
      tx.balance = runningBalance;
    }

    // Reverse to newest first for easier filtering
    allTransactions.reverse();

    return allTransactions;
  }

  /**
   * Get current balance (fallback for non-historical queries)
   */
  async getCurrentBalance(walletAddress: string): Promise<TokenBalance[]> {
    try {
      const url = `${this.BLOCKCHAIN_INFO_API}/balance?active=${walletAddress}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Blockchain.info API error: ${response.status}`);
      }

      const data = await response.json();
      const satoshis = data[walletAddress]?.final_balance || 0;
      const btcBalance = satoshis / 100000000;

      return btcBalance > 0 ? [{
        tokenAddress: 'bitcoin-native',
        tokenName: 'Bitcoin',
        tokenSymbol: 'BTC',
        balance: btcBalance,
        decimals: 8,
      }] : [];
    } catch (error) {
      console.error('[Bitcoin] Error fetching current balance:', error);
      throw error;
    }
  }
}
