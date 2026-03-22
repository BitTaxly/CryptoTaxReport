import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import axios from 'axios';
import {
  BlockchainType,
  TokenBalance,
  WalletHoldings,
  BlockchainAPIError,
} from '@/types';

// Cache for Solana token metadata
let tokenListCache: Map<string, { symbol: string; name: string }> | null = null;

/**
 * Fetches Solana token metadata from the official token list
 */
async function fetchSolanaTokenList(): Promise<Map<string, { symbol: string; name: string }>> {
  if (tokenListCache) {
    return tokenListCache;
  }

  try {
    const response = await axios.get('https://token.jup.ag/all', { timeout: 10000 });
    const tokens = response.data;

    const tokenMap = new Map<string, { symbol: string; name: string }>();

    for (const token of tokens) {
      if (token.address && token.symbol) {
        tokenMap.set(token.address, {
          symbol: token.symbol,
          name: token.name || token.symbol,
        });
      }
    }

    tokenListCache = tokenMap;
    console.log(`Loaded ${tokenMap.size} Solana tokens from Jupiter`);
    return tokenMap;
  } catch (error) {
    console.error('Failed to fetch Solana token list:', error);
    // Return empty map on error
    return new Map();
  }
}

/**
 * Gets token metadata for a Solana token
 */
async function getSolanaTokenMetadata(mintAddress: string): Promise<{ symbol: string; name: string }> {
  const tokenList = await fetchSolanaTokenList();

  const metadata = tokenList.get(mintAddress);
  if (metadata) {
    return metadata;
  }

  // Fallback for unknown tokens
  return {
    symbol: mintAddress.slice(0, 4) + '...' + mintAddress.slice(-4),
    name: 'Token',
  };
}

/**
 * Fetches token balances for a Solana wallet
 * Uses Solana RPC methods to get SPL token accounts
 */
export const fetchSolanaBalances = async (
  walletAddress: string
): Promise<TokenBalance[]> => {
  try {
    const rpcEndpoint =
      process.env.SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcEndpoint, 'confirmed');

    const publicKey = new PublicKey(walletAddress);

    // Get SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const balances: TokenBalance[] = [];

    // Add SOL (native token)
    if (solBalance > 0) {
      balances.push({
        tokenAddress: 'So11111111111111111111111111111111111111112', // Wrapped SOL
        tokenName: 'Solana',
        tokenSymbol: 'SOL',
        balance: solBalance / 1e9, // Convert lamports to SOL
        decimals: 9,
      });
    }

    // Get SPL token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      }
    );

    // Process token accounts with metadata lookup
    for (const { account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info;
      const balance = parsedInfo.tokenAmount.uiAmount;

      // Only include tokens with non-zero balance
      if (balance > 0) {
        const mintAddress = parsedInfo.mint;

        // Fetch token metadata
        const metadata = await getSolanaTokenMetadata(mintAddress);

        balances.push({
          tokenAddress: mintAddress,
          tokenName: metadata.name,
          tokenSymbol: metadata.symbol,
          balance,
          decimals: parsedInfo.tokenAmount.decimals,
        });
      }
    }

    return balances;
  } catch (error) {
    console.error('Solana balance fetch error:', error);
    throw new BlockchainAPIError(
      `Failed to fetch Solana balances: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'solana'
    );
  }
};

// Popular ERC20 token addresses on Ethereum mainnet
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
 * Fetches balance for a single ERC20 token with retry logic
 */
const fetchERC20BalanceWithRetry = async (
  provider: ethers.JsonRpcProvider,
  walletAddress: string,
  tokenInfo: typeof POPULAR_ERC20_TOKENS[0],
  maxRetries: number = 3
): Promise<TokenBalance | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const contract = new ethers.Contract(tokenInfo.address, ERC20_ABI, provider);
      const balance = await contract.balanceOf(walletAddress);

      if (balance > 0n) {
        const decimals = tokenInfo.decimals;
        const formattedBalance = Number(ethers.formatUnits(balance, decimals));

        return {
          tokenAddress: tokenInfo.address,
          tokenName: tokenInfo.name,
          tokenSymbol: tokenInfo.symbol,
          balance: formattedBalance,
          decimals: decimals,
        };
      }

      // Balance is 0, no need to retry
      return null;
    } catch (tokenError) {
      if (attempt === maxRetries) {
        // Final attempt failed, log warning
        console.warn(`Failed to fetch balance for ${tokenInfo.symbol} after ${maxRetries} attempts:`, tokenError);
        return null;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 100 * attempt));
    }
  }
  return null;
};

/**
 * Fetches token balances for an Ethereum wallet
 * Uses Ethers.js and ERC20 standard with QuikNode RPC
 */
export const fetchEthereumBalances = async (
  walletAddress: string
): Promise<TokenBalance[]> => {
  try {
    const rpcEndpoint = process.env.ETHEREUM_RPC_ENDPOINT || 'https://eth.public-rpc.com';
    const provider = new ethers.JsonRpcProvider(rpcEndpoint);

    const balances: TokenBalance[] = [];

    // Get ETH balance with retry
    let ethBalance: bigint | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        ethBalance = await provider.getBalance(walletAddress);
        break;
      } catch (error) {
        if (attempt === 3) {
          console.error('Failed to fetch ETH balance after 3 attempts:', error);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }

    if (ethBalance && ethBalance > 0n) {
      balances.push({
        tokenAddress: '0x0000000000000000000000000000000000000000',
        tokenName: 'Ethereum',
        tokenSymbol: 'ETH',
        balance: Number(ethers.formatEther(ethBalance)),
        decimals: 18,
      });
    }

    // Check popular ERC20 tokens with retry logic
    const tokenPromises = POPULAR_ERC20_TOKENS.map(tokenInfo =>
      fetchERC20BalanceWithRetry(provider, walletAddress, tokenInfo)
    );

    const tokenResults = await Promise.allSettled(tokenPromises);

    tokenResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        balances.push(result.value);
      } else if (result.status === 'rejected') {
        console.warn(`Promise rejected for ${POPULAR_ERC20_TOKENS[index].symbol}:`, result.reason);
      }
    });

    return balances;
  } catch (error) {
    console.error('Ethereum balance fetch error:', error);
    throw new BlockchainAPIError(
      `Failed to fetch Ethereum balances: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'ethereum'
    );
  }
};

/**
 * Enhanced Ethereum balance fetcher using Alchemy's getTokenBalances
 * This requires @alchemy/sdk package
 */
export const fetchEthereumBalancesWithAlchemy = async (
  walletAddress: string
): Promise<TokenBalance[]> => {
  try {
    const { Alchemy, Network } = await import('alchemy-sdk');

    const config = {
      apiKey: process.env.ALCHEMY_API_KEY || 'demo',
      network: Network.ETH_MAINNET,
    };
    const alchemy = new Alchemy(config);

    const balances: TokenBalance[] = [];

    // Get ETH balance
    const ethBalance = await alchemy.core.getBalance(walletAddress, 'latest');
    if (BigInt(ethBalance.toString()) > 0n) {
      balances.push({
        tokenAddress: '0x0000000000000000000000000000000000000000',
        tokenName: 'Ethereum',
        tokenSymbol: 'ETH',
        balance: Number(ethers.formatEther(ethBalance.toString())),
        decimals: 18,
      });
    }

    // Get ERC20 token balances
    const tokenBalances = await alchemy.core.getTokenBalances(walletAddress);

    // Process each token with non-zero balance
    for (const token of tokenBalances.tokenBalances) {
      if (token.tokenBalance && BigInt(token.tokenBalance) > 0n) {
        try {
          // Get token metadata
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);

          const decimals = metadata.decimals || 18;
          const balance = Number(ethers.formatUnits(token.tokenBalance, decimals));

          balances.push({
            tokenAddress: token.contractAddress,
            tokenName: metadata.name || 'Token',
            tokenSymbol: metadata.symbol || 'UNKNOWN',
            balance,
            decimals,
            logoUri: metadata.logo || undefined,
          });
        } catch (metadataError) {
          console.error(`Failed to fetch metadata for ${token.contractAddress}:`, metadataError);
          // Skip tokens that fail metadata fetch
          continue;
        }
      }
    }

    return balances;
  } catch (error) {
    console.error('Ethereum (Alchemy) balance fetch error:', error);
    throw new BlockchainAPIError(
      `Failed to fetch Ethereum balances: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'ethereum'
    );
  }
};

/**
 * Fetches Bitcoin balance using Blockchain.info API
 */
export const fetchBitcoinBalances = async (
  walletAddress: string
): Promise<TokenBalance[]> => {
  try {
    // Using Blockchain.info free API
    const response = await axios.get(
      `https://blockchain.info/balance?active=${walletAddress}`,
      { timeout: 10000 }
    );

    const balances: TokenBalance[] = [];
    const addressData = response.data[walletAddress];

    if (addressData && addressData.final_balance > 0) {
      // Convert satoshis to BTC
      const btcBalance = addressData.final_balance / 100000000;

      balances.push({
        tokenAddress: 'bitcoin-native',
        tokenName: 'Bitcoin',
        tokenSymbol: 'BTC',
        balance: btcBalance,
        decimals: 8,
      });
    }

    return balances;
  } catch (error) {
    console.error('Bitcoin balance fetch error:', error);
    throw new BlockchainAPIError(
      `Failed to fetch Bitcoin balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'bitcoin'
    );
  }
};

/**
 * Fetches balances for any supported blockchain
 */
export const fetchBalances = async (
  walletAddress: string,
  blockchain: BlockchainType
): Promise<TokenBalance[]> => {
  switch (blockchain) {
    case 'solana':
      return fetchSolanaBalances(walletAddress);
    case 'ethereum':
      // Use QuikNode RPC with ethers.js (no Alchemy required)
      return fetchEthereumBalances(walletAddress);
    case 'bitcoin':
      return fetchBitcoinBalances(walletAddress);
    default:
      throw new BlockchainAPIError(
        `Unsupported blockchain: ${blockchain}`,
        blockchain
      );
  }
};

/**
 * Fetches holdings for a single wallet
 */
export const fetchWalletHoldings = async (
  walletAddress: string,
  blockchain: BlockchainType
): Promise<WalletHoldings> => {
  try {
    const tokens = await fetchBalances(walletAddress, blockchain);

    return {
      walletAddress,
      blockchain,
      tokens,
    };
  } catch (error) {
    console.error(`Error fetching holdings for ${walletAddress}:`, error);

    return {
      walletAddress,
      blockchain,
      tokens: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Fetches holdings for multiple wallets in parallel
 */
export const fetchMultipleWalletHoldings = async (
  wallets: Array<{ address: string; blockchain: BlockchainType }>
): Promise<WalletHoldings[]> => {
  const promises = wallets.map(wallet =>
    fetchWalletHoldings(wallet.address, wallet.blockchain)
  );

  return Promise.all(promises);
};
