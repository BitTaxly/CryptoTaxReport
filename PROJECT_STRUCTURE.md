# Crypto Tax Reporting Web App - Project Structure

## Overview
Production-ready Next.js application for generating crypto tax holdings reports.

## Folder Structure

```
crypto-tax-reporter/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main UI page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   └── api/
│   │       ├── analyze-wallets/
│   │       │   └── route.ts            # Wallet analysis endpoint
│   │       └── generate-report/
│   │           └── route.ts            # Report generation endpoint
│   ├── services/
│   │   ├── blockchainDetector.ts       # Detect blockchain from address
│   │   ├── balanceFetcher.ts           # Fetch token balances
│   │   ├── pricingService.ts           # Fetch historical prices
│   │   └── reportGenerator.ts          # Generate Excel reports
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces
│   ├── utils/
│   │   ├── validators.ts               # Input validation
│   │   └── constants.ts                # App constants
│   └── components/
│       ├── WalletInput.tsx             # Wallet address input
│       ├── DatePicker.tsx              # Date selection
│       └── ReportPreview.tsx           # Preview before download
├── public/
│   └── logos/                          # Blockchain logos
│       ├── solana.svg
│       └── ethereum.svg
├── .env.example                        # Environment variables template
├── .env.local                          # Local environment (gitignored)
├── next.config.js                      # Next.js configuration
├── tsconfig.json                       # TypeScript configuration
├── package.json                        # Dependencies
└── README.md                           # Setup instructions
```

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Excel Generation**: xlsx (SheetJS)
- **Blockchain APIs**:
  - Solana: @solana/web3.js + Helius/QuickNode
  - Ethereum: ethers.js + Alchemy/Infura
- **Price Data**: CoinGecko API (or CryptoCompare)

## Data Flow

1. User inputs wallet addresses → Frontend validation
2. Frontend sends addresses + date → `/api/analyze-wallets`
3. API detects blockchain for each wallet
4. API fetches token balances for each wallet
5. API fetches historical prices for all tokens
6. API returns structured data to frontend
7. User clicks "Generate Report" → `/api/generate-report`
8. API generates Excel file
9. Browser downloads .xlsx file
