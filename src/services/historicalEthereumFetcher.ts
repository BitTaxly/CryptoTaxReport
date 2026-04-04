import { ethers } from 'ethers';
import { TokenBalance } from '@/types';
import { getTransactionCache } from './transactionCache';

interface HistoricalEthereumResult {
  balances: TokenBalance[];
  transactionsProcessed: number;
  targetDate: Date;
}

// Popular ERC20 tokens to check (same as current implementation)
const POPULAR_ERC20_TOKENS = [
  { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
  { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18 },
  { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18 },
  { address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', symbol: 'MATIC', name: 'Polygon', decimals: 18 },
  { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
  { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', symbol: 'AAVE', name: 'Aave', decimals: 18 },
  { address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381', symbol: 'APE', name: 'ApeCoin', decimals: 18 },
  { address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', symbol: 'SHIB', name: 'Shiba Inu', decimals: 18 },
];

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

/**
 * Fetches historical Ethereum balances by querying state at a specific block.
 * Converts target date to block number, then queries ETH and ERC20 balances at that block.
 */
export class HistoricalEthereumFetcher {
  private provider: ethers.JsonRpcProvider;

  constructor(rpcEndpoint?: string) {
    const endpoint = rpcEndpoint || process.env.ETHEREUM_RPC_ENDPOINT || 'https://eth.public-rpc.com';
    this.provider = new ethers.JsonRpcProvider(endpoint);
  }

  /**
   * Get historical Ethereum balances for a wallet at a specific date
   */
  async getHistoricalBalances(
    walletAddress: string,
    targetDate: Date
  ): Promise<HistoricalEthereumResult> {
    console.log(`[Ethereum Historical] Fetching balances for ${walletAddress} at ${targetDate.toISOString()}`);

    const targetTimestamp = Math.floor(targetDate.getTime() / 1000);

    // Check cache first
    const cache = getTransactionCache();
    const cached = cache.get(walletAddress, targetTimestamp);
    if (cached) {
      return {
        balances: cached.balances,
        transactionsProcessed: 0, // Not applicable for Ethereum (we use block queries, not tx processing)
        targetDate,
      };
    }

    try {
      // Step 1: Convert target date to block number
      const blockNumber = await this.getBlockNumberAtTimestamp(targetTimestamp);
      console.log(`[Ethereum Historical] Target date ${targetDate.toISOString()} corresponds to block ${blockNumber}`);

      // Step 2: Get ETH balance at that block
      const balances: TokenBalance[] = [];
      const ethBalance = await this.getEthBalanceAtBlock(walletAddress, blockNumber);

      if (ethBalance > 0) {
        balances.push({
          tokenAddress: 'ethereum-native',
          tokenName: 'Ethereum',
          tokenSymbol: 'ETH',
          balance: ethBalance,
          decimals: 18,
        });
      }

      // Step 3: Check popular ERC20 tokens at that block
      const tokenBalances = await this.getERC20BalancesAtBlock(walletAddress, blockNumber);
      balances.push(...tokenBalances);

      console.log(`[Ethereum Historical] Found ${balances.length} tokens with non-zero balance`);

      // Store in cache
      cache.set(walletAddress, targetTimestamp, balances, 1);

      return {
        balances,
        transactionsProcessed: 0,
        targetDate,
      };
    } catch (error) {
      console.error('[Ethereum Historical] Error fetching historical balances:', error);
      throw error;
    }
  }

  /**
   * Convert Unix timestamp to Ethereum block number using binary search
   */
  private async getBlockNumberAtTimestamp(targetTimestamp: number): Promise<number> {
    try {
      // Get latest block as upper bound
      const latestBlock = await this.provider.getBlock('latest');
      if (!latestBlock) {
        throw new Error('Unable to fetch latest block');
      }

      // If target is after latest block, return latest
      if (targetTimestamp >= latestBlock.timestamp) {
        return latestBlock.number;
      }

      // Binary search for the block
      let low = 0;
      let high = latestBlock.number;
      let closestBlock = latestBlock.number;

      console.log(`[Ethereum Historical] Binary searching for block between 0 and ${high}`);

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const block = await this.provider.getBlock(mid);

        if (!block) {
          high = mid - 1;
          continue;
        }

        const blockTimestamp = block.timestamp;

        if (blockTimestamp === targetTimestamp) {
          return mid;
        } else if (blockTimestamp < targetTimestamp) {
          closestBlock = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return closestBlock;
    } catch (error) {
      console.error('[Ethereum Historical] Error finding block number:', error);
      // Fallback: estimate based on average block time (12 seconds)
      const latestBlock = await this.provider.getBlock('latest');
      if (latestBlock) {
        const secondsDiff = latestBlock.timestamp - targetTimestamp;
        const blocksDiff = Math.floor(secondsDiff / 12);
        const estimatedBlock = Math.max(0, latestBlock.number - blocksDiff);
        console.log(`[Ethereum Historical] Using estimated block ${estimatedBlock} based on 12s block time`);
        return estimatedBlock;
      }
      throw error;
    }
  }

  /**
   * Get ETH balance at a specific block
   */
  private async getEthBalanceAtBlock(address: string, blockNumber: number): Promise<number> {
    try {
      const balanceWei = await this.provider.getBalance(address, blockNumber);
      return parseFloat(ethers.formatEther(balanceWei));
    } catch (error) {
      console.error('[Ethereum Historical] Error fetching ETH balance:', error);
      return 0;
    }
  }

  /**
   * Get ERC20 token balances at a specific block
   */
  private async getERC20BalancesAtBlock(
    walletAddress: string,
    blockNumber: number
  ): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = [];

    for (const token of POPULAR_ERC20_TOKENS) {
      try {
        const contract = new ethers.Contract(token.address, ERC20_ABI, this.provider);

        // Query balance at specific block with retry logic
        let balance: bigint | null = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            balance = await contract.balanceOf(walletAddress, { blockTag: blockNumber });
            break;
          } catch (error: any) {
            if (attempt === 3) throw error;
            await new Promise(resolve => setTimeout(resolve, 100 * attempt));
          }
        }

        if (balance && balance > 0n) {
          const decimals = token.decimals;
          const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));

          if (formattedBalance > 0) {
            balances.push({
              tokenAddress: token.address,
              tokenName: token.name,
              tokenSymbol: token.symbol,
              balance: formattedBalance,
              decimals,
            });
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[Ethereum Historical] Error checking ${token.symbol}:`, error);
        // Continue with other tokens
      }
    }

    return balances;
  }

  /**
   * Get current balances (fallback for non-historical queries)
   */
  async getCurrentBalances(walletAddress: string): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = [];

    try {
      // Get ETH balance
      const ethBalance = await this.getEthBalanceAtBlock(walletAddress, 'latest' as any);
      if (ethBalance > 0) {
        balances.push({
          tokenAddress: 'ethereum-native',
          tokenName: 'Ethereum',
          tokenSymbol: 'ETH',
          balance: ethBalance,
          decimals: 18,
        });
      }

      // Get ERC20 balances
      const tokenBalances = await this.getERC20BalancesAtBlock(walletAddress, 'latest' as any);
      balances.push(...tokenBalances);

      return balances;
    } catch (error) {
      console.error('[Ethereum] Error fetching current balances:', error);
      throw error;
    }
  }
}
