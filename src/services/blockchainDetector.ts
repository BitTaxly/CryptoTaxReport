import { BlockchainType, WalletInfo } from '@/types';
import {
  isValidSolanaAddress,
  isValidEthereumAddress,
  isValidBitcoinAddress,
} from '@/utils/validators';
import { BLOCKCHAIN_LOGOS, BLOCKCHAIN_NAMES } from '@/utils/constants';

/**
 * Detects the blockchain type based on wallet address format
 * @param address - Wallet address to analyze
 * @returns BlockchainType
 */
export const detectBlockchain = (address: string): BlockchainType => {
  const trimmedAddress = address.trim();

  // Check Ethereum format first (most specific with 0x prefix)
  if (isValidEthereumAddress(trimmedAddress)) {
    return 'ethereum';
  }

  // Check Bitcoin format (various formats)
  if (isValidBitcoinAddress(trimmedAddress)) {
    return 'bitcoin';
  }

  // Check Solana format (base58, 32-44 chars)
  if (isValidSolanaAddress(trimmedAddress)) {
    return 'solana';
  }

  return 'unknown';
};

/**
 * Validates and detects blockchain for a single wallet
 * @param address - Wallet address
 * @returns WalletInfo with validation status
 */
export const analyzeWallet = (address: string): WalletInfo => {
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    return {
      address: trimmedAddress,
      blockchain: 'unknown',
      isValid: false,
      error: 'Address cannot be empty',
    };
  }

  const blockchain = detectBlockchain(trimmedAddress);

  if (blockchain === 'unknown') {
    return {
      address: trimmedAddress,
      blockchain: 'unknown',
      isValid: false,
      error: 'Unsupported blockchain or invalid address format',
    };
  }

  return {
    address: trimmedAddress,
    blockchain,
    isValid: true,
  };
};

/**
 * Analyzes multiple wallet addresses
 * @param addresses - Array of wallet addresses
 * @returns Array of WalletInfo
 */
export const analyzeWallets = (addresses: string[]): WalletInfo[] => {
  return addresses.map(address => analyzeWallet(address));
};

/**
 * Gets blockchain logo URL
 * @param blockchain - Blockchain type
 * @returns Logo URL path
 */
export const getBlockchainLogo = (blockchain: BlockchainType): string => {
  return BLOCKCHAIN_LOGOS[blockchain] || BLOCKCHAIN_LOGOS.unknown;
};

/**
 * Gets blockchain display name
 * @param blockchain - Blockchain type
 * @returns Display name
 */
export const getBlockchainName = (blockchain: BlockchainType): string => {
  return BLOCKCHAIN_NAMES[blockchain] || BLOCKCHAIN_NAMES.unknown;
};

/**
 * Checks if all wallets are valid
 * @param walletInfos - Array of WalletInfo
 * @returns boolean
 */
export const areAllWalletsValid = (walletInfos: WalletInfo[]): boolean => {
  return walletInfos.every(wallet => wallet.isValid);
};

/**
 * Gets invalid wallets with their errors
 * @param walletInfos - Array of WalletInfo
 * @returns Array of invalid wallets
 */
export const getInvalidWallets = (walletInfos: WalletInfo[]): WalletInfo[] => {
  return walletInfos.filter(wallet => !wallet.isValid);
};
