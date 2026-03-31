import { NextRequest, NextResponse } from 'next/server';
import { analyzeWalletsSchema } from '@/utils/validators';
import { analyzeWallets } from '@/services/blockchainDetector';
import { fetchMultipleWalletHoldings } from '@/services/balanceFetcher';
import { fetchTokenPricesInBatches } from '@/services/pricingService';
import { fetchHistoricalExchangeRates } from '@/services/exchangeRateService';
import {
  enrichTokenWithPrice,
  enrichDeFiPositionWithPrice,
  calculateWalletTotal,
  calculateWalletTotalWithDeFi,
  calculateGrandTotal,
} from '@/services/reportGenerator';
import { fetchAllSolanaDefiPositions } from '@/services/defiDetector';
import {
  AnalyzeWalletsRequest,
  AnalyzeWalletsResponse,
  TaxReport,
  WalletReport,
  DeFiPosition,
} from '@/types';
import { MAX_WALLETS } from '@/utils/constants';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimiter';

export const maxDuration = 60; // 60 seconds timeout

/**
 * POST /api/analyze-wallets
 * Analyzes wallet addresses and generates tax report data
 * Security: Rate limited to prevent abuse
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<AnalyzeWalletsResponse>> {
  try {
    // Rate limiting for security (GDPR-compliant - only hashed IPs)
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.analysis);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many analysis requests. Please wait before trying again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
        }
      );
    }

    const body: AnalyzeWalletsRequest = await request.json();

    // Validate request
    const validation = analyzeWalletsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { addresses, date } = validation.data;

    // Additional validation
    if (addresses.length > MAX_WALLETS) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum ${MAX_WALLETS} wallets allowed`,
        },
        { status: 400 }
      );
    }

    // Step 1: Detect blockchain for each wallet
    console.log('Step 1: Detecting blockchains...');
    const walletInfos = analyzeWallets(addresses);

    // Check for invalid wallets
    const invalidWallets = walletInfos.filter(w => !w.isValid);
    if (invalidWallets.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid wallets: ${invalidWallets.map((w, i) => `Wallet ${addresses.indexOf(w.address) + 1}: ${w.error}`).join('; ')}`,
        },
        { status: 400 }
      );
    }

    // Step 2: Fetch balances for all wallets
    console.log('Step 2: Fetching balances...');
    const walletsWithBlockchains = walletInfos.map(w => ({
      address: w.address,
      blockchain: w.blockchain,
    }));

    const holdings = await fetchMultipleWalletHoldings(walletsWithBlockchains);

    // Check for errors
    const walletsWithErrors = holdings.filter(h => h.error);
    if (walletsWithErrors.length > 0) {
      console.error('Errors fetching balances:', walletsWithErrors);
    }

    // Step 2.5: Detect DeFi positions - DISABLED (premium feature)
    // console.log('Step 2.5: Detecting DeFi positions...');
    const defiPositionsByWallet = new Map<string, DeFiPosition[]>();
    const defiTokensByWallet = new Map<string, Set<string>>();

    // DeFi detection disabled - will be premium feature
    // for (const holding of holdings) {
    //   if (holding.blockchain === 'solana') {
    //     const defiPositions = await fetchAllSolanaDefiPositions(
    //       holding.walletAddress,
    //       holding.tokens
    //     );
    //     if (defiPositions.length > 0) {
    //       defiPositionsByWallet.set(holding.walletAddress, defiPositions);
    //       console.log(`Found ${defiPositions.length} DeFi positions for ${holding.walletAddress}`);
    //
    //       // Track DeFi token addresses to exclude from regular token list
    //       const defiTokenAddresses = new Set(defiPositions.map(p => p.tokenAddress));
    //       defiTokensByWallet.set(holding.walletAddress, defiTokenAddresses);
    //     }
    //   }
    // }

    // Step 3: Collect all unique tokens (including DeFi positions) and filter out dust/spam
    console.log('Step 3: Collecting unique tokens...');
    const allTokens = new Map<string, { address: string; symbol: string; maxBalance: number }>();

    holdings.forEach(holding => {
      holding.tokens.forEach(token => {
        const existing = allTokens.get(token.tokenAddress);
        if (!existing) {
          allTokens.set(token.tokenAddress, {
            address: token.tokenAddress,
            symbol: token.tokenSymbol,
            maxBalance: token.balance,
          });
        } else if (token.balance > existing.maxBalance) {
          // Track the maximum balance across all wallets
          existing.maxBalance = token.balance;
        }
      });
    });

    // Also collect DeFi position tokens for pricing - DISABLED
    // defiPositionsByWallet.forEach(positions => {
    //   positions.forEach(position => {
    //     const existing = allTokens.get(position.tokenAddress);
    //     if (!existing) {
    //       allTokens.set(position.tokenAddress, {
    //         address: position.tokenAddress,
    //         symbol: position.tokenSymbol,
    //         maxBalance: position.balance,
    //       });
    //     } else if (position.balance > existing.maxBalance) {
    //       existing.maxBalance = position.balance;
    //     }
    //   });
    // });

    // Filter out dust/spam tokens
    // Skip tokens with very small balances (likely spam/airdrops)
    const MINIMUM_BALANCE_THRESHOLD = 1.0; // Minimum token balance to consider (increased to filter spam more aggressively)
    const filteredTokens = Array.from(allTokens.values()).filter(token => {
      // Always include native tokens (SOL, ETH, BTC)
      const isNativeToken =
        token.symbol === 'SOL' ||
        token.symbol === 'ETH' ||
        token.symbol === 'BTC' ||
        token.address === 'So11111111111111111111111111111111111111112' ||
        token.address === '0x0000000000000000000000000000000000000000' ||
        token.address === 'bitcoin-native';

      // Always include major stablecoins (USDC, USDT)
      const isStablecoin =
        token.symbol === 'USDC' ||
        token.symbol === 'USDT' ||
        token.symbol === 'DAI' ||
        token.symbol === 'BUSD';

      // Include if native/stablecoin OR has meaningful balance
      return isNativeToken || isStablecoin || token.maxBalance >= MINIMUM_BALANCE_THRESHOLD;
    });

    const totalTokens = allTokens.size;
    const filteredCount = filteredTokens.length;
    const skippedCount = totalTokens - filteredCount;

    console.log(`Filtered ${totalTokens} tokens -> ${filteredCount} tokens (skipped ${skippedCount} dust/spam tokens)`);

    // Step 4: Fetch historical prices for filtered tokens
    console.log(`Step 4: Fetching prices for ${filteredCount} tokens...`);
    const reportDate = new Date(date);

    const prices = await fetchTokenPricesInBatches(filteredTokens, reportDate, 10, 3000);

    // Create price map for quick lookup
    const priceMap = new Map<string, number>();
    prices.forEach(p => priceMap.set(p.tokenAddress, p.price));

    // Step 5: Enrich tokens with prices and calculate values
    console.log('Step 5: Calculating values...');
    const walletReports: WalletReport[] = holdings.map(holding => {
      // DeFi filtering disabled - show all tokens
      // const defiTokenAddresses = defiTokensByWallet.get(holding.walletAddress) || new Set<string>();
      // const regularTokens = holding.tokens.filter(t => !defiTokenAddresses.has(t.tokenAddress));

      const enrichedTokens = holding.tokens
        .map(token =>
          enrichTokenWithPrice(
            token,
            priceMap.get(token.tokenAddress) || 0,
            date
          )
        )
        // Filter out tokens with $0 value (unknown prices or worthless tokens)
        .filter(token => token.totalValue > 0);

      // DeFi positions disabled - premium feature
      // const defiPositions = defiPositionsByWallet.get(holding.walletAddress) || [];
      // const enrichedDeFiPositions = defiPositions
      //   .map(position =>
      //     enrichDeFiPositionWithPrice(
      //       position,
      //       priceMap.get(position.tokenAddress) || 0,
      //       date
      //     )
      //   )
      //   .filter(position => position.totalValue > 0);

      return {
        walletAddress: holding.walletAddress,
        blockchain: holding.blockchain,
        tokens: enrichedTokens,
        defiPositions: undefined, // Disabled
        totalValue: enrichedTokens.reduce((sum, token) => sum + token.totalValue, 0),
      };
    });

    // Step 6: Fetch historical exchange rates for the report date
    console.log('Step 6: Fetching historical exchange rates...');
    const exchangeRates = await fetchHistoricalExchangeRates(date);

    // Step 7: Generate final report
    const taxReport: TaxReport = {
      wallets: walletReports,
      grandTotal: calculateGrandTotal(walletReports),
      reportDate: date,
      generatedAt: new Date().toISOString(),
    };

    console.log('Analysis complete!');
    console.log(`Total value: $${taxReport.grandTotal.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      data: {
        ...taxReport,
        exchangeRates, // Include exchange rates in the response
      },
    });
  } catch (error) {
    console.error('Error analyzing wallets:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze-wallets
 * Returns API information
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Analyze Wallets API',
    version: '1.0.0',
    description: 'Analyzes wallet addresses and generates tax holdings report',
    usage: {
      method: 'POST',
      body: {
        addresses: ['array of wallet addresses'],
        date: 'ISO 8601 date string',
      },
    },
  });
}
