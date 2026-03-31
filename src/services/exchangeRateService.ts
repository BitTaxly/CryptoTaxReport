/**
 * Exchange Rate Service - Server-side only
 * Fetches historical exchange rates for currency conversion
 */

import { CURRENCIES } from '@/utils/currency';

// Cache for exchange rates: Map<date_string, rates>
const exchangeRateCache = new Map<string, Record<string, number>>();

/**
 * Fetch historical exchange rates from USD to other currencies for a specific date
 * Uses frankfurter.app API which provides free historical rates back to 1999
 *
 * IMPORTANT: This function should only be called SERVER-SIDE
 *
 * @param date - Date string in YYYY-MM-DD format
 * @returns Record of currency codes to exchange rates
 */
export async function fetchHistoricalExchangeRates(
  date: string
): Promise<Record<string, number>> {
  try {
    // Check cache first
    const cachedRates = exchangeRateCache.get(date);
    if (cachedRates) {
      console.log(`[ExchangeRates] Using cached rates for ${date}`);
      return cachedRates;
    }

    console.log(`[ExchangeRates] Fetching rates for ${date} from frankfurter.app...`);

    // Fetch historical rates from frankfurter.app (free, no API key needed)
    // Supports dates from 1999-01-04 onwards
    const response = await fetch(`https://api.frankfurter.app/${date}?from=USD`);

    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.status}`);
    }

    const data = await response.json();
    const rates = data.rates as Record<string, number>;

    // Ensure USD is in the rates (set to 1.0)
    rates['USD'] = 1.0;

    // Cache the rates
    exchangeRateCache.set(date, rates);
    console.log(`[ExchangeRates] Cached rates for ${date}:`, Object.keys(rates).length, 'currencies');

    return rates;
  } catch (error) {
    console.error('[ExchangeRates] Failed to fetch exchange rates:', error);

    // Return default rates (1:1) if fetch fails
    const defaultRates: Record<string, number> = {};
    CURRENCIES.forEach(currency => {
      defaultRates[currency.code] = 1.0;
    });

    console.warn('[ExchangeRates] Using fallback 1:1 rates');
    return defaultRates;
  }
}

/**
 * Clear the exchange rate cache
 * Useful for testing or manual cache invalidation
 */
export function clearExchangeRateCache(): void {
  exchangeRateCache.clear();
  console.log('[ExchangeRates] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getExchangeRateCacheStats(): { size: number; dates: string[] } {
  return {
    size: exchangeRateCache.size,
    dates: Array.from(exchangeRateCache.keys()),
  };
}
