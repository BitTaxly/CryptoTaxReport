import { z } from 'zod';
import { MAX_WALLETS, ADDRESS_PATTERNS } from './constants';

// Wallet address validator
export const isValidSolanaAddress = (address: string): boolean => {
  return ADDRESS_PATTERNS.solana.test(address);
};

export const isValidEthereumAddress = (address: string): boolean => {
  return ADDRESS_PATTERNS.ethereum.test(address);
};

export const isValidBitcoinAddress = (address: string): boolean => {
  return ADDRESS_PATTERNS.bitcoin.test(address);
};

export const isValidWalletAddress = (address: string): boolean => {
  return isValidSolanaAddress(address) || isValidEthereumAddress(address) || isValidBitcoinAddress(address);
};

// Date validator
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date <= new Date();
};

// Zod schemas for API validation
export const analyzeWalletsSchema = z.object({
  addresses: z
    .array(z.string().trim().min(1, 'Address cannot be empty'))
    .min(1, 'At least one wallet address is required')
    .max(MAX_WALLETS, `Maximum ${MAX_WALLETS} wallets allowed`),
  date: z.string().refine(isValidDate, {
    message: 'Invalid date or future date not allowed',
  }),
});

export const generateReportSchema = z.object({
  reportData: z.object({
    wallets: z.array(z.any()),
    grandTotal: z.number(),
    reportDate: z.string(),
    generatedAt: z.string(),
  }),
});

// Validate addresses format
export const validateAddresses = (addresses: string[]): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (addresses.length === 0) {
    errors.push('At least one wallet address is required');
  }

  if (addresses.length > MAX_WALLETS) {
    errors.push(`Maximum ${MAX_WALLETS} wallets allowed per request`);
  }

  addresses.forEach((address, index) => {
    const trimmed = address.trim();
    if (!trimmed) {
      errors.push(`Wallet ${index + 1}: Address cannot be empty`);
    } else if (!isValidWalletAddress(trimmed)) {
      errors.push(`Wallet ${index + 1}: Invalid address format`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Sanitize input
export const sanitizeAddress = (address: string): string => {
  return address.trim();
};

export const sanitizeAddresses = (addresses: string[]): string[] => {
  return addresses
    .map(addr => sanitizeAddress(addr))
    .filter(addr => addr.length > 0);
};
