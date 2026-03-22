/**
 * DeFi Position Detector
 * Identifies common DeFi positions like liquid staking, lending, and LP tokens
 */

export interface DeFiPosition {
  type: 'liquid-staking' | 'lending' | 'liquidity-pool' | 'yield-farming' | 'other';
  protocol: string;
  description: string;
}

// Known DeFi token mappings
const DEFI_TOKENS: Record<string, DeFiPosition> = {
  // Solana Liquid Staking
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': {
    type: 'liquid-staking',
    protocol: 'Marinade Finance',
    description: 'Staked SOL (mSOL)',
  },
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': {
    type: 'liquid-staking',
    protocol: 'Lido',
    description: 'Staked SOL (stSOL)',
  },
  'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL': {
    type: 'liquid-staking',
    protocol: 'Jito',
    description: 'Staked SOL (jitoSOL)',
  },
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': {
    type: 'liquid-staking',
    protocol: 'BlazeStake',
    description: 'Staked SOL (bSOL)',
  },

  // Ethereum Liquid Staking
  '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84': {
    type: 'liquid-staking',
    protocol: 'Lido',
    description: 'Staked ETH (stETH)',
  },
  '0xac3E018457B222d93114458476f3E3416Abbe38F': {
    type: 'liquid-staking',
    protocol: 'Frax',
    description: 'Staked ETH (sfrxETH)',
  },
  '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704': {
    type: 'liquid-staking',
    protocol: 'Coinbase',
    description: 'Wrapped Staked ETH (cbETH)',
  },

  // Lending Protocols
  '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9': {
    type: 'lending',
    protocol: 'Aave',
    description: 'AAVE Governance Token',
  },
};

// Symbol-based detection for tokens that match patterns
const DEFI_SYMBOL_PATTERNS: Array<{
  pattern: RegExp;
  type: DeFiPosition['type'];
  protocol: string;
}> = [
  { pattern: /^st[A-Z]+$/, type: 'liquid-staking', protocol: 'Lido' },
  { pattern: /^[a-z]+SOL$/i, type: 'liquid-staking', protocol: 'Solana Staking' },
  { pattern: /^a[A-Z]+$/, type: 'lending', protocol: 'Aave' },
  { pattern: /^c[A-Z]+$/, type: 'lending', protocol: 'Compound' },
  { pattern: /LP$/i, type: 'liquidity-pool', protocol: 'DEX' },
];

/**
 * Detects if a token represents a DeFi position
 */
export function detectDeFiPosition(
  tokenAddress: string,
  tokenSymbol: string
): DeFiPosition | null {
  // Check direct address mappings first
  const directMatch = DEFI_TOKENS[tokenAddress] || DEFI_TOKENS[tokenAddress.toLowerCase()];
  if (directMatch) {
    return directMatch;
  }

  // Check symbol patterns
  for (const { pattern, type, protocol } of DEFI_SYMBOL_PATTERNS) {
    if (pattern.test(tokenSymbol)) {
      return {
        type,
        protocol,
        description: `${tokenSymbol} (${type.replace('-', ' ')})`,
      };
    }
  }

  return null;
}

/**
 * Gets a color/badge style for a DeFi position type
 */
export function getDeFiBadgeColor(type: string): string {
  switch (type) {
    case 'liquid-staking':
    case 'staking':
      return '#667eea'; // Purple
    case 'lending':
      return '#f093fb'; // Pink
    case 'borrowing':
      return '#ff6b6b'; // Red
    case 'liquidity-pool':
      return '#4facfe'; // Blue
    case 'yield-farming':
      return '#43e97b'; // Green
    default:
      return '#764ba2'; // Default purple
  }
}

/**
 * Gets a human-readable label for a DeFi position type
 */
export function getDeFiTypeLabel(type: string): string {
  switch (type) {
    case 'liquid-staking':
    case 'staking':
      return 'Liquid Staking';
    case 'lending':
      return 'Lending';
    case 'borrowing':
      return 'Borrowing';
    case 'liquidity-pool':
      return 'Liquidity Pool';
    case 'yield-farming':
      return 'Yield Farming';
    default:
      return 'DeFi';
  }
}
