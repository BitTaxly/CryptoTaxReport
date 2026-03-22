// Blockchain types
export type BlockchainType = 'solana' | 'ethereum' | 'bitcoin' | 'unknown';

// Wallet detection
export interface WalletInfo {
  address: string;
  blockchain: BlockchainType;
  isValid: boolean;
  error?: string;
}

// Token balance
export interface TokenBalance {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  balance: number;
  decimals: number;
  logoUri?: string;
}

// Token price
export interface TokenPrice {
  tokenAddress: string;
  tokenSymbol: string;
  price: number;
  date: string;
  currency: string;
}

// Wallet holdings
export interface WalletHoldings {
  walletAddress: string;
  blockchain: BlockchainType;
  tokens: TokenBalance[];
  error?: string;
}

// Enriched token with price
export interface EnrichedToken extends TokenBalance {
  priceAtDate: number;
  totalValue: number;
  date: string;
}

// DeFi position types
export type DeFiPositionType = 'staking' | 'lending' | 'borrowing';

// DeFi position
export interface DeFiPosition {
  protocol: string; // e.g., 'Jito', 'Marinade', 'Solend', 'Kamino'
  positionType: DeFiPositionType;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balance: number;
  underlyingAsset: string; // e.g., 'SOL', 'USDC'
  decimals: number;
  logoUri?: string;
}

// Enriched DeFi position with price
export interface EnrichedDeFiPosition extends DeFiPosition {
  priceAtDate: number;
  totalValue: number;
  date: string;
}

// Complete wallet report
export interface WalletReport {
  walletAddress: string;
  blockchain: BlockchainType;
  tokens: EnrichedToken[];
  defiPositions?: EnrichedDeFiPosition[];
  totalValue: number;
}

// Full report
export interface TaxReport {
  wallets: WalletReport[];
  grandTotal: number;
  reportDate: string;
  generatedAt: string;
}

// API request/response types
export interface AnalyzeWalletsRequest {
  addresses: string[];
  date: string; // ISO 8601 format
}

export interface AnalyzeWalletsResponse {
  success: boolean;
  data?: TaxReport;
  error?: string;
}

export interface GenerateReportRequest {
  reportData: TaxReport;
}

// Service configurations
export interface BlockchainConfig {
  solana: {
    rpcEndpoint: string;
    apiKey?: string;
  };
  ethereum: {
    rpcEndpoint: string;
    apiKey?: string;
  };
}

export interface PricingConfig {
  provider: 'coingecko' | 'cryptocompare';
  apiKey?: string;
  rateLimit: number; // requests per minute
}

// Error types
export class WalletValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletValidationError';
  }
}

export class BlockchainAPIError extends Error {
  constructor(message: string, public blockchain: BlockchainType) {
    super(message);
    this.name = 'BlockchainAPIError';
  }
}

export class PricingAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PricingAPIError';
  }
}
