/**
 * Currency utilities for converting and displaying values
 */

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

// Top 10 most used currencies
export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
];

// Cache for historical exchange rates: Map<date_string, rates>
const exchangeRateCache = new Map<string, Record<string, number>>();

/**
 * Fetch historical exchange rates from USD to other currencies for a specific date
 * Uses frankfurter.app API which provides free historical rates back to 1999
 * @param date - Date string in YYYY-MM-DD format
 */
export async function fetchExchangeRates(date?: string): Promise<Record<string, number>> {
  try {
    // If no date provided, use current rates
    if (!date) {
      const response = await fetch('https://api.frankfurter.app/latest?from=USD');
      const data = await response.json();
      return data.rates;
    }

    // Check cache first
    const cacheKey = date;
    const cachedRates = exchangeRateCache.get(cacheKey);
    if (cachedRates) {
      console.log(`Using cached exchange rates for ${date}`);
      return cachedRates;
    }

    // Fetch historical rates from frankfurter.app (free, no API key needed)
    // Supports dates from 1999-01-04 onwards
    const response = await fetch(`https://api.frankfurter.app/${date}?from=USD`);

    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.status}`);
    }

    const data = await response.json();
    const rates = data.rates;

    // Cache the rates
    exchangeRateCache.set(cacheKey, rates);
    console.log(`Cached exchange rates for ${date}:`, rates);

    return rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    // Return default rates (1:1) if fetch fails
    const defaultRates: Record<string, number> = {};
    CURRENCIES.forEach(currency => {
      defaultRates[currency.code] = 1;
    });
    return defaultRates;
  }
}

/**
 * Convert USD amount to target currency
 */
export function convertCurrency(
  amountInUSD: number,
  targetCurrency: string,
  exchangeRates: Record<string, number>
): number {
  if (targetCurrency === 'USD') {
    return amountInUSD;
  }
  const rate = exchangeRates[targetCurrency] || 1;
  return amountInUSD * rate;
}

/**
 * Format currency value with proper symbol and decimals
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  const symbol = currency?.symbol || '$';

  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });

  // For currencies like JPY and KRW that don't use decimals
  if (currencyCode === 'JPY' || currencyCode === 'KRW') {
    return `${symbol}${Math.round(amount).toLocaleString('en-US')}`;
  }

  return `${symbol}${formatted}`;
}

/**
 * Get currency object by code
 */
export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code);
}
