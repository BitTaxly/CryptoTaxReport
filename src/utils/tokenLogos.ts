// Token logo mappings
export const TOKEN_LOGOS: Record<string, string> = {
  // Solana tokens
  'So11111111111111111111111111111111111111112': '/logos/solana-sol-logo.png', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': '/logos/usd-coin-usdc-logo.png', // USDC (Solana)
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': '/logos/tether-usdt-logo.png', // USDT (Solana)

  // Ethereum tokens
  '0x0000000000000000000000000000000000000000': '/logos/ethereum-eth-logo.png', // ETH
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '/logos/usd-coin-usdc-logo.png', // USDC (Ethereum)
  '0xdac17f958d2ee523a2206206994597c13d831ec7': '/logos/tether-usdt-logo.png', // USDT (Ethereum)
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': '/logos/bitcoin-btc-logo.png', // WBTC
};

// Symbol-based fallback
export const SYMBOL_TO_LOGO: Record<string, string> = {
  'SOL': '/logos/solana-sol-logo.png',
  'USDC': '/logos/usd-coin-usdc-logo.png',
  'USDT': '/logos/tether-usdt-logo.png',
  'ETH': '/logos/ethereum-eth-logo.png',
  'WETH': '/logos/ethereum-eth-logo.png',
  'WBTC': '/logos/bitcoin-btc-logo.png',
  'BTC': '/logos/bitcoin-btc-logo.png',
  'XRP': '/logos/xrp-xrp-logo.png',
};

export function getTokenLogo(tokenAddress: string, tokenSymbol: string): string | null {
  // Try address mapping first
  const logoByAddress = TOKEN_LOGOS[tokenAddress] || TOKEN_LOGOS[tokenAddress.toLowerCase()];
  if (logoByAddress) return logoByAddress;

  // Try symbol mapping
  const logoBySymbol = SYMBOL_TO_LOGO[tokenSymbol] || SYMBOL_TO_LOGO[tokenSymbol.toUpperCase()];
  if (logoBySymbol) return logoBySymbol;

  return null;
}
