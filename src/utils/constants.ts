export const MAX_WALLETS = 10;

export const SUPPORTED_BLOCKCHAINS = ['solana', 'ethereum', 'bitcoin'] as const;

export const BLOCKCHAIN_LOGOS = {
  solana: '/logos/solana-sol-logo.png',
  ethereum: '/logos/ethereum-eth-logo.png',
  bitcoin: '/logos/bitcoin-btc-logo.png',
  unknown: '/logos/unknown.svg',
} as const;

export const BLOCKCHAIN_NAMES = {
  solana: 'Solana',
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  unknown: 'Unknown',
} as const;

// Default date: December 31 of previous year
export const getDefaultReportDate = (): Date => {
  const now = new Date();
  const previousYear = now.getFullYear() - 1;
  return new Date(previousYear, 11, 31); // December 31
};

// Regex patterns for address validation
export const ADDRESS_PATTERNS = {
  // Solana: base58, 32-44 characters
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  // Ethereum: 0x followed by 40 hex characters
  ethereum: /^0x[a-fA-F0-9]{40}$/,
  // Bitcoin: Legacy (P2PKH), SegWit (P2SH), Native SegWit (Bech32), Taproot
  bitcoin: /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/,
} as const;

// API timeouts (milliseconds)
export const API_TIMEOUTS = {
  blockchain: 30000, // 30 seconds
  pricing: 15000, // 15 seconds
  report: 60000, // 60 seconds
} as const;

// Rate limiting
export const RATE_LIMITS = {
  coingecko: {
    free: 10, // requests per minute
    pro: 50,
  },
  blockchain: {
    default: 100, // requests per minute
  },
} as const;

// Excel export settings
export const EXCEL_CONFIG = {
  sheetName: 'Tax Holdings Report',
  fileName: 'crypto-tax-report',
  currency: 'USD',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  MAX_WALLETS: `Maximum ${MAX_WALLETS} wallets allowed per request`,
  INVALID_ADDRESS: 'Invalid wallet address format',
  UNSUPPORTED_BLOCKCHAIN: 'Blockchain not supported',
  NO_BALANCES: 'No token balances found',
  PRICE_FETCH_FAILED: 'Failed to fetch historical prices',
  REPORT_GENERATION_FAILED: 'Failed to generate report',
} as const;
