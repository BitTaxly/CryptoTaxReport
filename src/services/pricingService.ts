import axios from 'axios';
import { TokenPrice, PricingAPIError } from '@/types';
import { format } from 'date-fns';

// In-memory price cache for historical prices: Map<cacheKey, price>
// cacheKey format: "{tokenId}_{date}"
const priceCache = new Map<string, number>();

// Separate cache for TokenPrice objects
const tokenPriceCache = new Map<string, TokenPrice>();

/**
 * Generates cache key for price lookups
 */
const getCacheKey = (tokenId: string, date: string): string => {
  return `${tokenId}_${date}`;
};

// Token ID mappings for popular tokens
const TOKEN_ID_MAPPINGS: Record<string, string> = {
  // Solana native and wrapped
  So11111111111111111111111111111111111111112: 'solana',

  // Solana stablecoins
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'usd-coin', // USDC
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: 'tether', // USDT

  // Popular Solana tokens
  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: 'msol', // mSOL
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'lido-staked-sol', // stSOL
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: 'bonk', // BONK
  jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL: 'jito-staked-sol', // jitoSOL
  J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: 'jito-governance-token', // JTO

  // Ethereum
  '0x0000000000000000000000000000000000000000': 'ethereum',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin', // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether', // USDT
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'wrapped-bitcoin', // WBTC
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink', // LINK
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': 'matic-network', // MATIC
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'uniswap', // UNI

  // Bitcoin
  'bitcoin-native': 'bitcoin',
};

// Symbol to CoinGecko ID mappings for common tokens
const SYMBOL_TO_COINGECKO: Record<string, string> = {
  'SOL': 'solana',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'mSOL': 'msol',
  'stSOL': 'lido-staked-sol',
  'BONK': 'bonk',
  'jitoSOL': 'jito-staked-sol',
  'JTO': 'jito-governance-token',
  'RAY': 'raydium',
  'SRM': 'serum',
  'ORCA': 'orca',
  'STEP': 'step-finance',
  'SAMO': 'samoyedcoin',
  'ETH': 'ethereum',
  'WBTC': 'wrapped-bitcoin',
  'LINK': 'chainlink',
  'MATIC': 'matic-network',
  'UNI': 'uniswap',
  'BTC': 'bitcoin',
};

/**
 * Gets CoinGecko token ID from token address
 * @param tokenAddress - Token contract address or mint
 * @param tokenSymbol - Token symbol as fallback
 */
const getCoinGeckoId = (
  tokenAddress: string,
  tokenSymbol: string
): string | null => {
  // Check address mapping first
  const mappedId =
    TOKEN_ID_MAPPINGS[tokenAddress] ||
    TOKEN_ID_MAPPINGS[tokenAddress.toLowerCase()];
  if (mappedId) return mappedId;

  // Check symbol mapping
  const symbolMapped = SYMBOL_TO_COINGECKO[tokenSymbol] || SYMBOL_TO_COINGECKO[tokenSymbol.toUpperCase()];
  if (symbolMapped) return symbolMapped;

  // Fallback: try to use symbol (lowercase)
  // This may not always work accurately
  const lowerSymbol = tokenSymbol.toLowerCase();

  // Don't try to fetch prices for obviously unknown tokens
  if (lowerSymbol.includes('...') || lowerSymbol.includes('unknown')) {
    return null;
  }

  return lowerSymbol;
};

/**
 * Fetches historical price from CoinGecko with caching
 * Free tier: 10-30 calls/minute
 */
export const fetchHistoricalPriceFromCoinGecko = async (
  tokenId: string,
  date: Date
): Promise<number> => {
  try {
    const formattedDate = format(date, 'dd-MM-yyyy'); // CoinGecko format

    // Check cache first
    const cacheKey = getCacheKey(tokenId, formattedDate);
    const cachedPrice = priceCache.get(cacheKey);
    if (cachedPrice !== undefined) {
      console.log(`Cache hit for ${tokenId} on ${formattedDate}: $${cachedPrice}`);
      return cachedPrice;
    }

    const apiKey = process.env.COINGECKO_API_KEY;

    const baseUrl = apiKey
      ? 'https://pro-api.coingecko.com/api/v3'
      : 'https://api.coingecko.com/api/v3';

    const url = `${baseUrl}/coins/${tokenId}/history`;

    const response = await axios.get(url, {
      params: {
        date: formattedDate,
        localization: false,
      },
      headers: apiKey
        ? {
            'x-cg-pro-api-key': apiKey,
          }
        : {},
      timeout: 15000,
    });

    const price = response.data?.market_data?.current_price?.usd;

    if (typeof price !== 'number') {
      throw new Error(`No price data available for ${tokenId} on ${formattedDate}`);
    }

    // Cache the price
    priceCache.set(cacheKey, price);
    console.log(`Cached price for ${tokenId} on ${formattedDate}: $${price}`);

    return price;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new PricingAPIError('Rate limit exceeded. Please try again later.');
      }
      if (error.response?.status === 404) {
        throw new PricingAPIError(`Token ${tokenId} not found on CoinGecko`);
      }
    }

    throw new PricingAPIError(
      `Failed to fetch price for ${tokenId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Fetches current price from CoinGecko (fallback for recent dates)
 */
export const fetchCurrentPriceFromCoinGecko = async (
  tokenId: string
): Promise<number> => {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;

    const baseUrl = apiKey
      ? 'https://pro-api.coingecko.com/api/v3'
      : 'https://api.coingecko.com/api/v3';

    const url = `${baseUrl}/simple/price`;

    const response = await axios.get(url, {
      params: {
        ids: tokenId,
        vs_currencies: 'usd',
      },
      headers: apiKey
        ? {
            'x-cg-pro-api-key': apiKey,
          }
        : {},
      timeout: 15000,
    });

    const price = response.data?.[tokenId]?.usd;

    if (typeof price !== 'number') {
      throw new Error(`No price data available for ${tokenId}`);
    }

    return price;
  } catch (error) {
    throw new PricingAPIError(
      `Failed to fetch current price for ${tokenId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Fetches historical price for a token on a specific date
 */
export const fetchTokenPrice = async (
  tokenAddress: string,
  tokenSymbol: string,
  date: Date
): Promise<TokenPrice> => {
  const coinGeckoId = getCoinGeckoId(tokenAddress, tokenSymbol);

  if (!coinGeckoId) {
    console.warn(`No CoinGecko ID found for ${tokenSymbol} (${tokenAddress})`);
    return {
      tokenAddress,
      tokenSymbol,
      price: 0,
      date: date.toISOString(),
      currency: 'USD',
    };
  }

  try {
    // ALWAYS use historical price for the exact date specified
    // This ensures the user gets prices for their selected date, not current prices
    const price = await fetchHistoricalPriceFromCoinGecko(coinGeckoId, date);

    return {
      tokenAddress,
      tokenSymbol,
      price,
      date: date.toISOString(),
      currency: 'USD',
    };
  } catch (error) {
    console.error(`Error fetching price for ${tokenSymbol}:`, error);

    // Return zero price instead of failing
    return {
      tokenAddress,
      tokenSymbol,
      price: 0,
      date: date.toISOString(),
      currency: 'USD',
    };
  }
};

/**
 * Fetches prices for multiple tokens with rate limiting
 * @param tokens - Array of token addresses and symbols
 * @param date - Date for historical prices
 * @param delayMs - Delay between requests (rate limiting)
 */
export const fetchMultipleTokenPrices = async (
  tokens: Array<{ address: string; symbol: string }>,
  date: Date,
  delayMs: number = 1200 // ~50 requests/minute for free tier
): Promise<TokenPrice[]> => {
  const prices: TokenPrice[] = [];

  for (const token of tokens) {
    try {
      const price = await fetchTokenPrice(token.address, token.symbol, date);
      prices.push(price);

      // Rate limiting delay
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Failed to fetch price for ${token.symbol}:`, error);
      // Continue with other tokens
      prices.push({
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        price: 0,
        date: date.toISOString(),
        currency: 'USD',
      });
    }
  }

  return prices;
};

/**
 * Fetches prices in batches to avoid overwhelming the API
 */
export const fetchTokenPricesInBatches = async (
  tokens: Array<{ address: string; symbol: string }>,
  date: Date,
  batchSize: number = 10,
  delayBetweenBatches: number = 5000
): Promise<TokenPrice[]> => {
  const allPrices: TokenPrice[] = [];

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);

    console.log(
      `Fetching prices for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tokens.length / batchSize)}`
    );

    const batchPrices = await fetchMultipleTokenPrices(batch, date, 1200);
    allPrices.push(...batchPrices);

    // Delay between batches
    if (i + batchSize < tokens.length && delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return allPrices;
};

export const getPriceCacheKey = (
  tokenAddress: string,
  date: string
): string => {
  return `${tokenAddress}_${date}`;
};

export const fetchTokenPriceWithCache = async (
  tokenAddress: string,
  tokenSymbol: string,
  date: Date
): Promise<TokenPrice> => {
  const cacheKey = getPriceCacheKey(tokenAddress, date.toISOString());

  // Check cache
  if (tokenPriceCache.has(cacheKey)) {
    return tokenPriceCache.get(cacheKey)!;
  }

  // Fetch and cache
  const price = await fetchTokenPrice(tokenAddress, tokenSymbol, date);
  tokenPriceCache.set(cacheKey, price);

  return price;
};
