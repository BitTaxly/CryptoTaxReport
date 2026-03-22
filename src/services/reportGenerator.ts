import * as XLSX from 'xlsx';
import { TaxReport, WalletReport, EnrichedToken, DeFiPosition, EnrichedDeFiPosition } from '@/types';
import { format } from 'date-fns';
import { EXCEL_CONFIG } from '@/utils/constants';
import { getBlockchainName } from './blockchainDetector';

/**
 * Formats a number as USD currency
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a number with decimals
 */
const formatNumber = (value: number, decimals: number = 8): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Generates Excel workbook from tax report data
 */
export const generateExcelReport = (reportData: TaxReport): Buffer => {
  const workbook = XLSX.utils.book_new();

  // Create detailed holdings sheet FIRST (default view)
  const detailsData = createDetailsSheet(reportData);
  const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
  XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Token Details');

  // Create summary sheet as second sheet
  const summaryData = createSummarySheet(reportData);
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Create individual wallet sheets (optional, if not too many wallets)
  if (reportData.wallets.length <= 5) {
    reportData.wallets.forEach((wallet, index) => {
      const walletData = createWalletSheet(wallet, reportData.reportDate);
      const walletSheet = XLSX.utils.aoa_to_sheet(walletData);
      XLSX.utils.book_append_sheet(
        workbook,
        walletSheet,
        `Wallet ${index + 1}`
      );
    });
  }

  // Apply column widths
  applyColumnWidths(detailsSheet);
  applyColumnWidths(summarySheet);

  // Convert to buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

/**
 * Creates summary sheet data
 */
const createSummarySheet = (reportData: TaxReport): any[][] => {
  const data: any[][] = [
    ['Crypto Tax Holdings Report'],
    [''],
    ['Report Date:', format(new Date(reportData.reportDate), 'MMMM dd, yyyy')],
    ['Generated:', format(new Date(reportData.generatedAt), 'MMMM dd, yyyy HH:mm:ss')],
    ['Total Wallets:', reportData.wallets.length],
    [''],
    ['Summary by Wallet'],
    [''],
    ['#', 'Wallet Address', 'Blockchain', 'Token Count', 'Total Value (USD)'],
  ];

  reportData.wallets.forEach((wallet, index) => {
    data.push([
      index + 1,
      wallet.walletAddress,
      getBlockchainName(wallet.blockchain),
      wallet.tokens.length,
      parseFloat(wallet.totalValue.toFixed(2)),
    ]);
  });

  data.push(['']);
  data.push(['Grand Total:', '', '', '', parseFloat(reportData.grandTotal.toFixed(2))]);
  data.push(['']);
  data.push(['Note: All values are in USD as of ' + format(new Date(reportData.reportDate), 'MMMM dd, yyyy')]);

  return data;
};

/**
 * Creates detailed holdings sheet data with all tokens
 */
const createDetailsSheet = (reportData: TaxReport): any[][] => {
  const data: any[][] = [
    ['CRYPTO TAX REPORT - TOKEN DETAILS'],
    [''],
    ['Report Date:', format(new Date(reportData.reportDate), 'MMMM dd, yyyy')],
    ['Generated:', format(new Date(reportData.generatedAt), 'MMMM dd, yyyy HH:mm:ss')],
    ['Total Wallets:', reportData.wallets.length],
    ['Total Tokens:', reportData.wallets.reduce((sum, w) => sum + w.tokens.length, 0)],
    [''],
    ['All prices are as of ' + format(new Date(reportData.reportDate), 'MMMM dd, yyyy')],
    [''],
    [
      'Wallet Address',
      'Blockchain',
      'Token Name',
      'Token Symbol',
      'Token Address',
      'Balance',
      'Price (USD)',
      'Total Value (USD)',
    ],
  ];

  reportData.wallets.forEach((wallet, walletIndex) => {
    wallet.tokens.forEach(token => {
      data.push([
        wallet.walletAddress,
        getBlockchainName(wallet.blockchain),
        token.tokenName,
        token.tokenSymbol,
        token.tokenAddress,
        parseFloat(token.balance.toFixed(2)),
        parseFloat(token.priceAtDate.toFixed(2)),
        parseFloat(token.totalValue.toFixed(2)),
      ]);
    });

    // Add wallet subtotal
    data.push([
      '',
      '',
      '',
      '',
      '',
      '',
      `Wallet ${walletIndex + 1} Total:`,
      parseFloat(wallet.totalValue.toFixed(2)),
    ]);
    data.push(['']); // Empty row between wallets
  });

  // Add grand total
  data.push([
    '',
    '',
    '',
    '',
    '',
    '',
    'GRAND TOTAL:',
    parseFloat(reportData.grandTotal.toFixed(2)),
  ]);

  return data;
};

/**
 * Creates individual wallet sheet data
 */
const createWalletSheet = (
  wallet: WalletReport,
  reportDate: string
): any[][] => {
  const data: any[][] = [
    ['Wallet Holdings Report'],
    [''],
    ['Wallet Address:', wallet.walletAddress],
    ['Blockchain:', getBlockchainName(wallet.blockchain)],
    ['Report Date:', format(new Date(reportDate), 'MMMM dd, yyyy')],
    [''],
    [
      'Token Name',
      'Symbol',
      'Balance',
      'Price (USD)',
      'Total Value (USD)',
      'Token Address',
    ],
  ];

  wallet.tokens.forEach(token => {
    data.push([
      token.tokenName,
      token.tokenSymbol,
      parseFloat(token.balance.toFixed(2)),
      parseFloat(token.priceAtDate.toFixed(2)),
      parseFloat(token.totalValue.toFixed(2)),
      token.tokenAddress,
    ]);
  });

  data.push(['']);
  data.push(['Total Portfolio Value:', '', '', '', parseFloat(wallet.totalValue.toFixed(2))]);

  return data;
};

/**
 * Applies column widths to a worksheet
 */
const applyColumnWidths = (sheet: XLSX.WorkSheet) => {
  const cols = [
    { wch: 15 }, // Column A
    { wch: 45 }, // Column B (wallet addresses)
    { wch: 15 }, // Column C
    { wch: 15 }, // Column D
    { wch: 45 }, // Column E (token addresses)
    { wch: 20 }, // Column F
    { wch: 20 }, // Column G
    { wch: 20 }, // Column H
  ];

  sheet['!cols'] = cols;
};

/**
 * Generates filename for the report
 */
export const generateReportFilename = (reportDate: string): string => {
  const dateStr = format(new Date(reportDate), 'yyyy-MM-dd');
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  return `${EXCEL_CONFIG.fileName}_${dateStr}_${timestamp}.xlsx`;
};

/**
 * Calculates total value for a wallet
 */
export const calculateWalletTotal = (tokens: EnrichedToken[]): number => {
  return tokens.reduce((sum, token) => sum + token.totalValue, 0);
};

/**
 * Calculates grand total across all wallets
 */
export const calculateGrandTotal = (wallets: WalletReport[]): number => {
  return wallets.reduce((sum, wallet) => sum + wallet.totalValue, 0);
};

/**
 * Enriches token with price and calculates value
 */
export const enrichTokenWithPrice = (
  token: {
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
    balance: number;
    decimals: number;
  },
  price: number,
  date: string
): EnrichedToken => {
  return {
    ...token,
    priceAtDate: price,
    totalValue: token.balance * price,
    date,
  };
};

/**
 * Enriches DeFi position with price and calculates value
 */
export const enrichDeFiPositionWithPrice = (
  position: DeFiPosition,
  price: number,
  date: string
): EnrichedDeFiPosition => {
  return {
    ...position,
    priceAtDate: price,
    totalValue: position.balance * price,
    date,
  };
};

/**
 * Calculates total value including DeFi positions
 */
export const calculateWalletTotalWithDeFi = (
  tokens: EnrichedToken[],
  defiPositions: EnrichedDeFiPosition[] = []
): number => {
  const tokenValue = tokens.reduce((sum, token) => sum + token.totalValue, 0);
  const defiValue = defiPositions.reduce((sum, position) => sum + position.totalValue, 0);
  return tokenValue + defiValue;
};

/**
 * Validates report data before generation
 */
export const validateReportData = (reportData: TaxReport): boolean => {
  if (!reportData.wallets || reportData.wallets.length === 0) {
    throw new Error('No wallet data in report');
  }

  if (!reportData.reportDate) {
    throw new Error('Report date is required');
  }

  return true;
};

/**
 * Generates a CSV report (alternative format)
 */
export const generateCSVReport = (reportData: TaxReport): string => {
  const headers = [
    'Wallet Address',
    'Blockchain',
    'Token Name',
    'Token Symbol',
    'Token Address',
    'Balance',
    'Price (USD)',
    'Total Value (USD)',
  ];

  const rows: string[][] = [headers];

  reportData.wallets.forEach(wallet => {
    wallet.tokens.forEach(token => {
      rows.push([
        wallet.walletAddress,
        getBlockchainName(wallet.blockchain),
        token.tokenName,
        token.tokenSymbol,
        token.tokenAddress,
        token.balance.toFixed(2),
        token.priceAtDate.toFixed(2),
        token.totalValue.toFixed(2),
      ]);
    });
  });

  return rows.map(row => row.join(',')).join('\n');
};

/**
 * Generates Excel workbook for comparison reports (multiple dates)
 */
export const generateComparisonExcelReport = (
  comparisonReports: Array<{ date: string; data: TaxReport }>
): Buffer => {
  const workbook = XLSX.utils.book_new();

  // Create comparison summary sheet
  const comparisonData = createComparisonSummarySheet(comparisonReports);
  const comparisonSheet = XLSX.utils.aoa_to_sheet(comparisonData);
  XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'Date Comparison');

  // Create individual sheets for each date
  comparisonReports.forEach((report, index) => {
    const dateStr = format(new Date(report.date), 'MMM dd yyyy');
    const detailsData = createDetailsSheet(report.data);
    const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
    XLSX.utils.book_append_sheet(workbook, detailsSheet, dateStr);
    applyColumnWidths(detailsSheet);
  });

  applyColumnWidths(comparisonSheet);

  // Convert to buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

/**
 * Creates comparison summary sheet showing portfolio values across dates
 */
const createComparisonSummarySheet = (
  comparisonReports: Array<{ date: string; data: TaxReport }>
): any[][] => {
  const data: any[][] = [
    ['CRYPTO PORTFOLIO COMPARISON REPORT'],
    [''],
    ['Portfolio Value Comparison Across Dates'],
    [''],
    ['Date', 'Total Portfolio Value (USD)', 'Change from Previous', 'Change %'],
  ];

  comparisonReports.forEach((report, index) => {
    const currentTotal = report.data.grandTotal;
    let changeAmount = 0;
    let changePercent = 0;

    if (index > 0) {
      const prevTotal = comparisonReports[index - 1].data.grandTotal;
      changeAmount = currentTotal - prevTotal;
      changePercent = (changeAmount / prevTotal) * 100;
    }

    data.push([
      format(new Date(report.date), 'MMMM dd, yyyy'),
      parseFloat(currentTotal.toFixed(2)),
      index > 0 ? parseFloat(changeAmount.toFixed(2)) : '-',
      index > 0 ? parseFloat(changePercent.toFixed(2)) + '%' : '-',
    ]);
  });

  data.push(['']);
  data.push(['Wallet Breakdown by Date']);
  data.push(['']);

  // Add wallet-level comparison
  comparisonReports.forEach((report, reportIndex) => {
    data.push([
      `Date: ${format(new Date(report.date), 'MMMM dd, yyyy')}`,
      '',
      '',
      '',
    ]);
    data.push(['Wallet Address', 'Blockchain', 'Token Count', 'Total Value (USD)']);

    report.data.wallets.forEach((wallet) => {
      data.push([
        wallet.walletAddress,
        getBlockchainName(wallet.blockchain),
        wallet.tokens.length,
        parseFloat(wallet.totalValue.toFixed(2)),
      ]);
    });

    data.push([
      'Total:',
      '',
      '',
      parseFloat(report.data.grandTotal.toFixed(2)),
    ]);
    data.push(['']);
  });

  data.push(['']);
  data.push([
    'Generated:',
    format(new Date(), 'MMMM dd, yyyy HH:mm:ss'),
  ]);

  return data;
};
