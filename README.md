# Crypto Tax Reporter

A production-ready Next.js web application for generating crypto tax holdings reports. Users can input up to 10 wallet addresses and generate comprehensive Excel reports showing token holdings and values on a specific date.

## Features

- **Multi-Chain Support**: Solana and Ethereum (EVM chains)
- **Automatic Blockchain Detection**: Detects blockchain based on address format
- **Historical Pricing**: Fetches token prices for any past date
- **Excel Reports**: Downloadable .xlsx files with detailed holdings
- **User-Friendly UI**: Clean, intuitive interface
- **Production Ready**: Error handling, validation, rate limiting

## Prerequisites

- Node.js 18+ and npm/yarn
- API keys for:
  - Solana RPC (optional - defaults to public endpoint)
  - Alchemy or Infura (for Ethereum)
  - CoinGecko (optional - free tier available)

## Quick Start

### 1. Clone and Install

```bash
cd TAX
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

```env
# Required for Ethereum
ETHEREUM_RPC_ENDPOINT=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ALCHEMY_API_KEY=your_alchemy_key

# Optional - improve Solana performance
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Optional - higher rate limits for pricing
COINGECKO_API_KEY=your_coingecko_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Getting API Keys

### Alchemy (Ethereum) - Required

1. Go to [https://www.alchemy.com/](https://www.alchemy.com/)
2. Sign up for free account
3. Create new app (Ethereum Mainnet)
4. Copy API key to `.env.local`

### Helius/QuickNode (Solana) - Optional

For better Solana performance:

1. [Helius](https://www.helius.dev/) or [QuickNode](https://www.quicknode.com/)
2. Create free account
3. Get RPC endpoint
4. Add to `.env.local`

### CoinGecko (Pricing) - Optional

For higher rate limits:

1. Go to [https://www.coingecko.com/en/api/pricing](https://www.coingecko.com/en/api/pricing)
2. Sign up for API plan
3. Add key to `.env.local`

**Free tier works fine for testing!**

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main UI
│   ├── layout.tsx                  # App layout
│   └── api/
│       ├── analyze-wallets/        # Wallet analysis endpoint
│       └── generate-report/        # Report generation endpoint
├── services/
│   ├── blockchainDetector.ts       # Blockchain detection
│   ├── balanceFetcher.ts           # Token balance fetching
│   ├── pricingService.ts           # Historical pricing
│   └── reportGenerator.ts          # Excel generation
├── types/
│   └── index.ts                    # TypeScript types
└── utils/
    ├── validators.ts               # Input validation
    └── constants.ts                # App constants
```

## Usage

### 1. Enter Wallet Addresses

- Add up to 10 wallet addresses
- Blockchain is automatically detected
- Supports Solana and Ethereum addresses

### 2. Select Report Date

- Default: December 31 of previous year
- Choose any past date
- Prices reflect selected date (not current prices)

### 3. Generate Report

- Click "Analyze Wallets"
- Review summary on screen
- Download Excel report

## Report Contents

The Excel report includes:

### Summary Sheet
- Wallet addresses
- Blockchain types
- Token counts
- Total values per wallet
- Grand total

### Holdings Details
- Complete token list
- Token symbols and names
- Balances
- Historical prices
- Total values

### Individual Wallet Sheets (if ≤5 wallets)
- Detailed breakdown per wallet

## API Endpoints

### POST /api/analyze-wallets

Analyzes wallet addresses and calculates holdings.

**Request:**
```json
{
  "addresses": ["wallet1", "wallet2"],
  "date": "2023-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wallets": [...],
    "grandTotal": 12345.67,
    "reportDate": "2023-12-31",
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### POST /api/generate-report

Generates Excel file from report data.

**Request:**
```json
{
  "reportData": { /* TaxReport object */ }
}
```

**Response:** Excel file download

## Customization

### Adding More Blockchains

1. Update `ADDRESS_PATTERNS` in `src/utils/constants.ts`
2. Add detection logic in `src/services/blockchainDetector.ts`
3. Implement balance fetcher in `src/services/balanceFetcher.ts`
4. Add blockchain logo to `/public/logos/`

### Changing Max Wallets

Edit `MAX_WALLETS` in `src/utils/constants.ts`

### Using Different Price API

Modify `src/services/pricingService.ts` to use alternative provider

## Troubleshooting

### Rate Limiting Errors

- Get CoinGecko API key for higher limits
- Adjust `delayMs` in pricing service
- Use paid tier of RPC providers

### Ethereum Token Balances Not Showing

- Verify Alchemy API key is correct
- Check Alchemy dashboard for quota
- Consider using Alchemy SDK (see code comments)

### Solana Tokens Missing

- Some tokens may not have price data
- Ensure RPC endpoint is responsive
- Check Solana network status

## Production Deployment

### Environment Variables

Set all required variables in production:

```bash
ETHEREUM_RPC_ENDPOINT=...
ALCHEMY_API_KEY=...
COINGECKO_API_KEY=...
```

### Recommended Services

- **Hosting**: Vercel, Railway, or Render
- **RPC**: Alchemy (ETH), Helius (SOL)
- **Pricing**: CoinGecko Pro
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics

### Security Checklist

- [ ] All API keys in environment variables
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] CORS configured properly
- [ ] Error messages don't leak sensitive info

### Performance Optimization

1. **Caching**: Add Redis for price caching
2. **Rate Limiting**: Implement API rate limiting
3. **Batch Processing**: Increase batch sizes for more wallets
4. **CDN**: Use CDN for static assets

## License

MIT

## Support

For issues or questions:
- Check troubleshooting section
- Review API provider documentation
- Check browser console for errors

## Disclaimer

This tool is for informational purposes. Always consult a tax professional for tax advice. Historical price data may not be 100% accurate.
