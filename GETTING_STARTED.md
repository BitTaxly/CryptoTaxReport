# Getting Started - Quick Setup Guide

Get your Crypto Tax Reporter running in 5 minutes!

## Quick Start

### Step 1: Install Dependencies

```bash
cd TAX
npm install
```

This will install all required packages including Next.js, React, Solana SDK, Ethers, and more.

### Step 2: Setup Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and add your API keys:

```env
# Alchemy (Required for Ethereum)
ETHEREUM_RPC_ENDPOINT=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE
ALCHEMY_API_KEY=your_alchemy_api_key

# Optional: Enhanced Solana performance
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Optional: CoinGecko API (free tier works fine)
COINGECKO_API_KEY=
```

### Step 3: Get Alchemy API Key (Required)

1. Visit [https://www.alchemy.com/](https://www.alchemy.com/)
2. Sign up (free)
3. Create new app → Select "Ethereum" → "Mainnet"
4. Copy API key
5. Paste into `.env.local`

### Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Using the App

### 1. Enter Wallet Address

Paste a wallet address (Solana or Ethereum):
- **Solana**: Base58 format (32-44 chars)
- **Ethereum**: 0x followed by 40 hex chars

Example Solana wallet:
```
CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq
```

Example Ethereum wallet:
```
0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

### 2. Select Date

Choose the date for the report (default: Dec 31 of last year).

The app will fetch token prices for that specific date.

### 3. Generate Report

Click "Analyze Wallets" to:
- Detect blockchain
- Fetch token balances
- Get historical prices
- Calculate total value

### 4. Download Excel

Click "Download Excel Report" to get your tax report.

## Example Test Run

Try with this Ethereum wallet (Vitalik Buterin's public wallet):

```
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

1. Paste address
2. Select date: `2023-12-31`
3. Click "Analyze Wallets"
4. Wait ~30 seconds
5. Download report

## What You'll Get

Your Excel report includes:

1. **Summary Sheet**
   - All wallets
   - Total value per wallet
   - Grand total

2. **Holdings Details**
   - Every token
   - Balances
   - Prices on selected date
   - Total values

3. **Individual Wallet Sheets** (if ≤5 wallets)
   - Detailed breakdown per wallet

## Troubleshooting

### "Failed to fetch Ethereum balances"

**Fix**: Check your Alchemy API key in `.env.local`

### "Rate limit exceeded"

**Fix**:
- Wait a few minutes
- Add CoinGecko API key for higher limits
- Reduce number of wallets

### No tokens showing

**Possible reasons**:
- Wallet has no tokens on that date
- RPC endpoint issues
- Network connectivity

**Try**:
- Different date
- Check wallet on blockchain explorer
- Verify API keys

### App won't start

**Fix**:
```bash
rm -rf node_modules .next
npm install
npm run dev
```

## Adding More Wallets

Click "+ Add Another Wallet" to add up to 10 wallets.

Each wallet is analyzed separately, then totaled.

## Understanding the Results

### Token Balance
The amount of each token held in the wallet.

### Price at Date
The USD price of the token on your selected date (not current price).

### Total Value
Balance × Price at Date

### Wallet Total
Sum of all token values in that wallet

### Grand Total
Sum across all wallets

## Tips for Best Results

1. **Use specific dates**: December 31 is common for tax reporting

2. **One blockchain per run**: For speed, separate Solana and Ethereum wallets into different runs

3. **Check popular tokens first**: Start with wallets containing major tokens (ETH, SOL, USDC)

4. **Save reports**: Download immediately - reports are not stored

5. **Verify amounts**: Cross-check with blockchain explorers for accuracy

## Next Steps

Once comfortable:

1. Read [README.md](./README.md) for full documentation
2. Review [PRODUCTION_HARDENING.md](./PRODUCTION_HARDENING.md) for production deployment
3. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for hosting options

## Common Use Cases

### Year-End Tax Reporting
```
Date: December 31, 2023
Wallets: All your wallets
Purpose: Tax filing
```

### Quarterly Portfolio Review
```
Date: End of quarter
Wallets: Investment wallets
Purpose: Performance tracking
```

### Specific Transaction Date
```
Date: Date of large transaction
Wallets: Relevant wallet
Purpose: Record keeping
```

## Understanding Blockchain Detection

The app automatically detects blockchain:

- **Solana**: Base58 encoded, 32-44 characters
  - Example: `CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq`

- **Ethereum**: 0x prefix, 40 hex characters
  - Example: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

You'll see the blockchain logo next to each address.

## API Rate Limits

### Free Tier (Default)

**CoinGecko**: 10-30 calls/minute
- ~10 unique tokens per run
- Delays between requests

**Alchemy**: 300M compute units/month (free tier)
- Enough for thousands of queries

### If You Need More

Get API keys for higher limits:
- CoinGecko Pro: $129/month (500 calls/min)
- Alchemy Growth: $49/month (1.5B compute units)

## Data Privacy

Important notes:

- **No data stored**: Everything is processed in real-time
- **No accounts needed**: No signup or login
- **Wallet addresses are public**: We only query public blockchain data
- **Reports are temporary**: Download immediately

## Legal Disclaimer

This tool provides informational data only.

- Not financial advice
- Not tax advice
- Historical prices may vary by source
- Always consult a tax professional
- Verify all amounts independently

## Getting Help

If stuck:

1. Check browser console for errors (F12)
2. Verify API keys are correct
3. Test with known wallet address
4. Check network connectivity
5. Review error messages

## File Structure Reference

```
TAX/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main UI
│   │   └── api/                  # Backend endpoints
│   ├── services/                 # Core logic
│   ├── types/                    # TypeScript types
│   └── utils/                    # Helpers
├── public/logos/                 # Blockchain logos
├── .env.local                    # Your API keys (not in git)
├── package.json                  # Dependencies
└── README.md                     # Full docs
```

## Performance Notes

Processing time depends on:

- Number of wallets
- Number of tokens per wallet
- API response times
- Network speed

Typical times:
- 1 wallet with 5 tokens: 10-20 seconds
- 5 wallets with 20 tokens: 60-90 seconds
- 10 wallets with 50 tokens: 2-3 minutes

## What's Not Included

This app does NOT:

- Calculate transaction history
- Track cost basis
- Calculate capital gains
- Store historical reports
- Require user accounts
- Track NFTs (tokens only)

For these features, use dedicated tax software like Koinly or CoinTracker.

## Upgrading

To update dependencies:

```bash
npm update
npm audit fix
```

Check for major updates quarterly.

## Contributing

To modify or extend:

1. Read code in `src/services/` to understand logic
2. Check `src/types/` for data structures
3. Test changes locally
4. Update documentation

## Support

For questions:
- Review [README.md](./README.md)
- Check [TROUBLESHOOTING.md](./README.md#troubleshooting)
- Open GitHub issue (if applicable)

## Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env.local`)
- [ ] Alchemy API key added
- [ ] App running (`npm run dev`)
- [ ] Test wallet analyzed successfully
- [ ] Report downloaded successfully

You're ready to generate tax reports!

## Quick Commands Reference

```bash
# Install
npm install

# Development
npm run dev

# Production build
npm run build
npm start

# Type check
npm run type-check

# Lint
npm run lint

# Clean rebuild
rm -rf .next node_modules && npm install
```

Happy tax reporting! 🎉
