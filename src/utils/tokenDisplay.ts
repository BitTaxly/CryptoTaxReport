/**
 * Utility functions for token display
 */

// Known USDC/USDT addresses on different chains
const SOLANA_USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const ETHEREUM_USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const ETHEREUM_USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

/**
 * Gets the display symbol for a token
 * USDC and USDT are shown with their chain info
 */
export function getTokenDisplaySymbol(tokenSymbol: string, tokenAddress: string): string {
  // Solana USDC
  if (tokenAddress === SOLANA_USDC ||
      (tokenSymbol === 'USDC' && tokenAddress.length > 40)) {
    return 'USDC (SOL)';
  }

  // Ethereum USDC
  if (tokenAddress === ETHEREUM_USDC ||
      (tokenSymbol === 'USDC' && tokenAddress.startsWith('0x'))) {
    return 'USDC (ETH)';
  }

  // Ethereum USDT
  if (tokenAddress === ETHEREUM_USDT ||
      (tokenSymbol === 'USDT' && tokenAddress.startsWith('0x'))) {
    return 'USDT (ETH)';
  }

  // Generic USDC/USDT fallback
  if (tokenSymbol === 'USDC') {
    return 'USDC';
  }
  if (tokenSymbol === 'USDT') {
    return 'USDT';
  }

  return tokenSymbol;
}

/**
 * Gets a description for USD stablecoins
 */
export function getTokenDisplayName(tokenSymbol: string, tokenName: string): string {
  if (tokenSymbol === 'USDC') {
    return 'USD Coin (USDC)';
  }
  if (tokenSymbol === 'USDT') {
    return 'Tether USD (USDT)';
  }

  return tokenName;
}
