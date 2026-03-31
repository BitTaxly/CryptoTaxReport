'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/authHelpers';
import { useRouter } from 'next/navigation';
import { TaxReport } from '@/types';
import { MAX_WALLETS, getDefaultReportDate } from '@/utils/constants';
import { detectBlockchain, getBlockchainLogo } from '@/services/blockchainDetector';
import { getTokenLogo } from '@/utils/tokenLogos';
import PortfolioCharts from '@/components/PortfolioCharts';
import { detectDeFiPosition, getDeFiBadgeColor, getDeFiTypeLabel } from '@/utils/defiDetector';
import { getTokenDisplaySymbol } from '@/utils/tokenDisplay';
import { CURRENCIES, fetchExchangeRates, convertCurrency, formatCurrency } from '@/utils/currency';
import { useToast } from '@/components/ToastContainer';
import ProgressIndicator from '@/components/ProgressIndicator';
import { AnalysisLoadingSkeleton } from '@/components/SkeletonLoader';
import LoadingSpinner from '@/components/LoadingSpinner';
import Tooltip from '@/components/Tooltip';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [wallets, setWallets] = useState<string[]>(['']);
  const [reportDate, setReportDate] = useState<string>(
    getDefaultReportDate().toISOString().split('T')[0]
  );
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonDates, setComparisonDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState<'excel' | 'pdf' | null>(null);
  const [reportData, setReportData] = useState<TaxReport | null>(null);
  const [comparisonReports, setComparisonReports] = useState<Array<{ date: string; data: TaxReport }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [minValueFilterEnabled, setMinValueFilterEnabled] = useState(false);
  const [minValueThreshold, setMinValueThreshold] = useState(1.00);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveSetName, setSaveSetName] = useState('');
  const [savedWalletSets, setSavedWalletSets] = useState<Record<string, string[]>>({});
  const [currency, setCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Load wallet sets from API when user is authenticated
  useEffect(() => {
    if (user) {
      fetchWalletSets();
    }
  }, [user]);

  // Load initial exchange rates (fallback - will be replaced by API response)
  useEffect(() => {
    const loadExchangeRates = async () => {
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
    };
    loadExchangeRates();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Fetch wallet sets from API
  const fetchWalletSets = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/wallet-sets');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSavedWalletSets(result.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch wallet sets:', err);
    }
  };

  // Open save wallet modal
  const handleOpenSaveModal = () => {
    if (!user) {
      toast.error('Please sign in to save wallet sets');
      return;
    }

    const validWallets = wallets.filter(w => w.trim().length > 0);
    if (validWallets.length === 0) {
      toast.error('No wallets to save');
      return;
    }
    setSaveSetName('');
    setShowSaveModal(true);
  };

  // Save wallet set via API
  const handleSaveWalletSet = async () => {
    if (!saveSetName.trim() || !user) {
      return;
    }

    const validWallets = wallets.filter(w => w.trim().length > 0);

    try {
      const response = await fetch('/api/wallet-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setName: saveSetName.trim(),
          wallets: validWallets,
        }),
      });

      if (response.ok) {
        await fetchWalletSets();
        setShowSaveModal(false);
        setSaveSetName('');
        toast.success('Wallet set saved successfully!');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to save wallet set');
      }
    } catch (err) {
      toast.error('Failed to save wallet set. Please try again.');
    }
  };

  // Open load wallet modal
  const handleOpenLoadModal = () => {
    if (!user) {
      toast.error('Please sign in to load wallet sets');
      return;
    }

    if (Object.keys(savedWalletSets).length === 0) {
      toast.info('No saved wallet sets found. Create one first!');
      return;
    }
    setShowLoadModal(true);
  };

  // Load wallet set from saved sets
  const handleLoadWalletSet = (setName: string) => {
    const walletSet = savedWalletSets[setName];
    if (walletSet) {
      setWallets(walletSet);
      setShowLoadModal(false);
    }
  };

  // Delete a saved wallet set via API
  const handleDeleteWalletSet = async (setName: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/wallet-sets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ setName }),
      });

      if (response.ok) {
        await fetchWalletSets();
        toast.success('Wallet set deleted successfully');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete wallet set');
      }
    } catch (err) {
      toast.error('Failed to delete wallet set. Please try again.');
    }
  };

  const handleAddWallet = () => {
    if (wallets.length < MAX_WALLETS) {
      setWallets([...wallets, '']);
    }
  };

  const handleRemoveWallet = (index: number) => {
    if (wallets.length > 1) {
      const newWallets = wallets.filter((_, i) => i !== index);
      setWallets(newWallets);
    }
  };

  const handleWalletChange = (index: number, value: string) => {
    const newWallets = [...wallets];
    newWallets[index] = value;
    setWallets(newWallets);
  };

  const handleAddComparisonDate = () => {
    if (comparisonDates.length < 3) {
      setComparisonDates([...comparisonDates, getDefaultReportDate().toISOString().split('T')[0]]);
    }
  };

  const handleRemoveComparisonDate = (index: number) => {
    setComparisonDates(comparisonDates.filter((_, i) => i !== index));
  };

  const handleComparisonDateChange = (index: number, value: string) => {
    const newDates = [...comparisonDates];
    newDates[index] = value;
    setComparisonDates(newDates);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setShowResults(false);

    try {
      const validWallets = wallets.filter(w => w.trim().length > 0);

      if (validWallets.length === 0) {
        toast.error('Please enter at least one wallet address');
        setLoading(false);
        return;
      }

      if (validWallets.length > MAX_WALLETS) {
        toast.error(`Maximum ${MAX_WALLETS} wallets allowed`);
        setLoading(false);
        return;
      }

      if (comparisonMode) {
        // Fetch data for all comparison dates
        const allDates = [reportDate, ...comparisonDates].sort();
        const reports: Array<{ date: string; data: TaxReport }> = [];

        for (const date of allDates) {
          const response = await fetch('/api/analyze-wallets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              addresses: validWallets,
              date: date,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || `Analysis failed for ${date}`);
          }

          reports.push({ date, data: data.data });

          // Use exchange rates from the first report (main date)
          if (reports.length === 1 && data.data.exchangeRates) {
            setExchangeRates(data.data.exchangeRates);
          }
        }

        setComparisonReports(reports);
        setReportData(null);
      } else {
        // Single date analysis
        const response = await fetch('/api/analyze-wallets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addresses: validWallets,
            date: reportDate,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Analysis failed');
        }

        // Extract exchange rates from API response if available
        if (data.data.exchangeRates) {
          setExchangeRates(data.data.exchangeRates);
        }

        setReportData(data.data);
        setComparisonReports([]);
      }

      setShowResults(true);
      toast.success('Analysis complete!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis';
      toast.error(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReportData = (data: TaxReport): TaxReport => {
    if (!minValueFilterEnabled || minValueThreshold <= 0) {
      return data;
    }

    // Filter tokens and DeFi positions in each wallet
    const filteredWallets = data.wallets.map(wallet => {
      const filteredTokens = wallet.tokens.filter(token => token.totalValue >= minValueThreshold);
      const filteredDeFiPositions = wallet.defiPositions?.filter(position => position.totalValue >= minValueThreshold);

      // Recalculate wallet total with filtered tokens and DeFi positions
      const tokenValue = filteredTokens.reduce((sum, token) => sum + token.totalValue, 0);
      const defiValue = filteredDeFiPositions?.reduce((sum, position) => sum + position.totalValue, 0) || 0;
      const totalValue = tokenValue + defiValue;

      return {
        ...wallet,
        tokens: filteredTokens,
        defiPositions: filteredDeFiPositions,
        totalValue
      };
    });

    // Recalculate grand total
    const grandTotal = filteredWallets.reduce((sum, wallet) => sum + wallet.totalValue, 0);

    return {
      ...data,
      wallets: filteredWallets,
      grandTotal
    };
  };

  // Helper to convert and format currency
  const displayValue = (usdValue: number, options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }) => {
    const converted = convertCurrency(usdValue, currency, exchangeRates);
    return formatCurrency(converted, currency, options);
  };

  const handleDownloadReport = async (format: 'excel' | 'pdf' = 'excel') => {
    if (!reportData && comparisonReports.length === 0) return;

    try {
      setDownloadLoading(format);

      const endpoint = format === 'pdf' ? '/api/generate-pdf-report' : '/api/generate-report';
      const fileExtension = format === 'pdf' ? 'pdf' : 'xlsx';

      if (comparisonMode && comparisonReports.length > 0) {
        // Download comparison report
        const filteredReports = comparisonReports.map(report => ({
          date: report.date,
          data: getFilteredReportData(report.data)
        }));

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportData: filteredReports[0].data,
            comparisonReports: filteredReports,
            isComparison: true
          }),
        });

        if (!response.ok) {
          throw new Error('Report generation failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crypto-tax-comparison-report.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (reportData) {
        // Download single date report
        const filteredData = getFilteredReportData(reportData);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reportData: filteredData }),
        });

        if (!response.ok) {
          throw new Error('Report generation failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crypto-tax-report-${reportDate}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      toast.success(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed. Please try again.');
    } finally {
      setDownloadLoading(null);
    }
  };

  return (
    <>
      {/* Background Shapes */}
      <div className="bg-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div className="min-h-screen px-4 py-6 md:py-12 relative z-10">
        <div className="container mx-auto max-w-5xl">
        {/* Header with authentication and theme toggle */}
        <div className="flex items-center justify-between mb-8 md:mb-12 lg:mb-16 gap-3">
          <div className="flex-1 min-w-0">
            <AnimatedTitle />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* User Info / Login Button */}
            {authLoading ? (
              <div className="px-4 py-2" style={{ color: 'var(--on-surface-variant)' }}>
                Loading...
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>
                    {user.name || user.email}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    router.push('/auth/login');
                  }}
                  className="btn-secondary text-xs sm:text-sm whitespace-nowrap"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="btn-primary text-xs sm:text-sm whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.5C14.7614 17.5 17 15.2614 17 12.5C17 9.73858 14.7614 7.5 12 7.5C9.23858 7.5 7 9.73858 7 12.5C7 15.2614 9.23858 17.5 12 17.5Z" />
                  <path d="M12 1.5V3.5M12 21.5V23.5M4.22 4.72L5.64 6.14M18.36 18.86L19.78 20.28M1.5 12.5H3.5M20.5 12.5H22.5M4.22 20.28L5.64 18.86M18.36 6.14L19.78 4.72"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="card p-6 md:p-8 mb-6">
          {/* Wallet Inputs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <label className="block text-sm font-medium" style={{ color: 'var(--on-surface)' }}>
                Wallet Addresses ({wallets.filter(w => w.trim()).length}/{MAX_WALLETS})
              </label>
              <Tooltip content="Enter wallet addresses from Solana, Ethereum, or Bitcoin. The blockchain type will be auto-detected based on the address format.">
                <svg className="w-4 h-4 opacity-50 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Tooltip>
            </div>

            {wallets.map((wallet, index) => (
              <div key={index} className="wallet-input-container">
                {/* Blockchain Logo */}
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'var(--surface-variant)' }}
                >
                  {wallet.trim() && (
                    <img
                      src={getBlockchainLogo(detectBlockchain(wallet))}
                      alt="blockchain"
                      className="blockchain-logo w-6 h-6 sm:w-8 sm:h-8"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Input */}
                <input
                  type="text"
                  value={wallet}
                  onChange={e => handleWalletChange(index, e.target.value)}
                  placeholder={`Wallet ${index + 1}`}
                  className="input-field flex-1 text-xs sm:text-sm md:text-base font-mono"
                />

                {/* Remove Button */}
                {wallets.length > 1 && (
                  <button
                    onClick={() => handleRemoveWallet(index)}
                    className="btn-icon flex-shrink-0"
                    type="button"
                    aria-label="Remove wallet"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {/* Wallet Actions Row */}
            <div className="flex flex-wrap gap-2 mt-2">
              {/* Add Wallet Button */}
              {wallets.length < MAX_WALLETS && (
                <button
                  onClick={handleAddWallet}
                  className="btn-secondary text-xs sm:text-sm"
                  type="button"
                >
                  <svg className="w-4 h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Add wallet</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}

              {/* Save Wallet Set Button */}
              <button
                onClick={handleOpenSaveModal}
                className="btn-secondary text-xs sm:text-sm"
                type="button"
                title="Save current wallet addresses as a set"
              >
                <svg className="w-4 h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="hidden sm:inline">Save Set</span>
                <span className="sm:hidden">Save</span>
              </button>

              {/* Load Wallet Set Button */}
              <button
                onClick={handleOpenLoadModal}
                className="btn-secondary text-xs sm:text-sm"
                type="button"
                title="Load a previously saved wallet set"
              >
                <svg className="w-4 h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">Load Set</span>
                <span className="sm:hidden">Load</span>
              </button>
            </div>
          </div>

          {/* Date Picker, Comparison Mode, and Filter */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="block text-sm font-medium" style={{ color: 'var(--on-surface)' }}>
                    Report Date
                  </label>
                  <Tooltip content="Select the date for which you want to calculate your portfolio value. Historical prices will be fetched for this date.">
                    <svg className="w-4 h-4 opacity-50 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--on-surface)' }}>
                    Currency
                  </label>
                  <Tooltip content="Choose your preferred currency for displaying portfolio values. All amounts will be converted from USD at current exchange rates.">
                    <svg className="w-4 h-4 opacity-50 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input-field text-sm py-2 px-3"
                    style={{ width: 'auto', minWidth: '100px' }}
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--on-surface)' }}>
                    Compare dates
                  </label>
                  <Tooltip content="Enable this to analyze your portfolio across multiple dates and see how your holdings have changed over time.">
                    <svg className="w-4 h-4 opacity-50 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
                  <button
                    onClick={() => {
                      setComparisonMode(!comparisonMode);
                      if (!comparisonMode && comparisonDates.length === 0) {
                        handleAddComparisonDate();
                      }
                    }}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0"
                    style={{
                      backgroundColor: comparisonMode ? 'var(--primary)' : 'var(--border)'
                    }}
                    aria-label="Toggle comparison mode"
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                      style={{
                        transform: comparisonMode ? 'translateX(1.5rem)' : 'translateX(0.25rem)'
                      }}
                    />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--on-surface)' }}>
                  Filter low-value
                </label>
                <Tooltip content="Hide tokens and DeFi positions below a certain USD value to focus on significant holdings and reduce clutter.">
                  <svg className="w-4 h-4 opacity-50 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
                <button
                  onClick={() => setMinValueFilterEnabled(!minValueFilterEnabled)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0"
                  style={{
                    backgroundColor: minValueFilterEnabled ? 'var(--primary)' : 'var(--border)'
                  }}
                  aria-label="Toggle minimum value filter"
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    style={{
                      transform: minValueFilterEnabled ? 'translateX(1.5rem)' : 'translateX(0.25rem)'
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Primary Date */}
            <div className="flex gap-3 mb-3">
              <div className={minValueFilterEnabled ? 'flex-1' : 'w-full'}>
                <input
                  type="date"
                  value={reportDate}
                  onChange={e => setReportDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="input-field w-full text-sm md:text-base"
                  placeholder="Primary date"
                />
              </div>
              {minValueFilterEnabled && (
                <div className="flex-1 relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--on-surface)' }}>
                    $
                  </span>
                  <Tooltip content="Tokens and DeFi positions with a total value below this amount will be hidden from the report.">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={minValueThreshold}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        if (value === '' || value === '.') {
                          setMinValueThreshold(0);
                        } else {
                          const parsed = parseFloat(value);
                          if (!isNaN(parsed)) {
                            setMinValueThreshold(parsed);
                          }
                        }
                      }}
                      className="input-field w-full pl-8 text-sm md:text-base"
                      placeholder="Min value (USD)"
                    />
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Comparison Dates */}
            {comparisonMode && (
              <div className="space-y-3">
                {comparisonDates.map((date, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <input
                      type="date"
                      value={date}
                      onChange={e => handleComparisonDateChange(index, e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="input-field flex-1 text-sm md:text-base"
                      placeholder={`Comparison date ${index + 1}`}
                    />
                    <button
                      onClick={() => handleRemoveComparisonDate(index)}
                      className="btn-icon flex-shrink-0"
                      type="button"
                      aria-label="Remove comparison date"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {comparisonDates.length < 3 && (
                  <button
                    onClick={handleAddComparisonDate}
                    className="btn-secondary text-xs"
                    type="button"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add comparison date
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary flex-1 text-sm md:text-base flex items-center justify-center w-full sm:w-auto"
            >
              {loading ? (
                <>
                  Analyzing
                  <span className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analyze Wallets
                </>
              )}
            </button>

            {(reportData || comparisonReports.length > 0) && (
              <>
                <button
                  onClick={() => handleDownloadReport('excel')}
                  disabled={loading || downloadLoading !== null}
                  className="btn-secondary flex-1 text-sm md:text-base flex items-center justify-center w-full sm:w-auto"
                >
                  {downloadLoading === 'excel' ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Excel Report
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownloadReport('pdf')}
                  disabled={loading || downloadLoading !== null}
                  className="btn-secondary flex-1 text-sm md:text-base flex items-center justify-center w-full sm:w-auto"
                >
                    {downloadLoading === 'pdf' ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Downloading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        PDF Report
                      </>
                    )}
                  </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Indicator (shows during analysis) */}
        <ProgressIndicator isLoading={loading} />

        {/* Loading Skeleton (shows while waiting for results) */}
        {loading && !showResults && (
          <div className="mt-8">
            <AnalysisLoadingSkeleton />
          </div>
        )}

        {/* Comparison Results */}
        {showResults && comparisonMode && comparisonReports.length > 0 && (
          <div className="space-y-6">
            {comparisonReports.map((report, reportIndex) => {
              const displayData = getFilteredReportData(report.data);
              const prevReport = reportIndex > 0 ? comparisonReports[reportIndex - 1] : null;
              const growthPercent = prevReport
                ? ((displayData.grandTotal - prevReport.data.grandTotal) / prevReport.data.grandTotal) * 100
                : 0;

              return (
                <div key={reportIndex} className="card p-5 sm:p-6 md:p-8 lg:p-10 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--on-background)' }}>
                        Portfolio Summary
                      </h2>
                      <p className="text-xs sm:text-sm" style={{ color: 'var(--secondary)' }}>
                        {new Date(report.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      {reportIndex > 0 && (
                        <p className={`text-xs sm:text-sm font-semibold mt-2 ${growthPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {growthPercent >= 0 ? '↑' : '↓'} {Math.abs(growthPercent).toFixed(2)}% from previous date
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm opacity-70 mb-1">Total Value</p>
                      <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" style={{ color: 'var(--on-background)' }}>
                        {displayValue(displayData.grandTotal)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayData.wallets.map((wallet, index) => {
                      const gradientClass = wallet.blockchain === 'solana'
                        ? 'gradient-solana'
                        : wallet.blockchain === 'ethereum'
                        ? 'gradient-ethereum'
                        : wallet.blockchain === 'bitcoin'
                        ? 'gradient-bitcoin'
                        : '';

                      return (
                        <div key={index} className={`rounded-xl p-4 sm:p-6 shadow-lg ${gradientClass || 'card'} ${gradientClass ? 'text-white' : ''}`}>
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)'
                                  }}>
                              {wallet.blockchain}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <p className={`font-mono text-xs sm:text-sm break-all opacity-60 flex-1 ${gradientClass ? 'text-white' : ''}`}>
                              {wallet.walletAddress.slice(0, 6)}...{wallet.walletAddress.slice(-4)}
                            </p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(wallet.walletAddress);
                                toast.success('Address copied to clipboard!');
                              }}
                              className={`btn-icon p-1 flex-shrink-0 ${gradientClass ? 'text-white' : ''}`}
                              aria-label="Copy wallet address"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 ${gradientClass ? 'text-white' : ''}`}>
                            {displayValue(wallet.totalValue)}
                          </p>
                          <p className={`text-xs opacity-60 ${gradientClass ? 'text-white' : ''}`}>
                            {wallet.tokens.length} token{wallet.tokens.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Single Date Results */}
        {showResults && !comparisonMode && reportData && (() => {
          const displayData = getFilteredReportData(reportData);
          const totalTokensOriginal = reportData.wallets.reduce((sum, w) => sum + w.tokens.length, 0);
          const totalTokensFiltered = displayData.wallets.reduce((sum, w) => sum + w.tokens.length, 0);
          const hiddenTokensCount = totalTokensOriginal - totalTokensFiltered;

          return (
          <div className="card p-8 md:p-10 animate-fade-in">
            {minValueFilterEnabled && hiddenTokensCount > 0 && (
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-variant)' }}>
                <p className="text-sm" style={{ color: 'var(--secondary)' }}>
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Hiding {hiddenTokensCount} token{hiddenTokensCount !== 1 ? 's' : ''} worth less than ${minValueThreshold.toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--on-background)' }}>
                  Portfolio Summary
                </h2>
                <p className="text-sm" style={{ color: 'var(--secondary)' }}>
                  Your holdings as of {new Date(displayData.reportDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="hidden md:block">
                <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              {displayData.wallets.map((wallet, index) => {
                const gradientClass = wallet.blockchain === 'solana'
                  ? 'gradient-solana'
                  : wallet.blockchain === 'ethereum'
                  ? 'gradient-ethereum'
                  : wallet.blockchain === 'bitcoin'
                  ? 'gradient-bitcoin'
                  : '';

                return (
                  <div key={index} className={`rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl ${gradientClass || 'card'} transition-all duration-300 hover:shadow-2xl`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  backdropFilter: 'blur(10px)'
                                }}>
                            {wallet.blockchain}
                          </span>
                          <span className="text-xs opacity-60">
                            {wallet.tokens.length} token{wallet.tokens.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono text-xs sm:text-sm break-all opacity-80 flex-1 min-w-0">
                            {wallet.walletAddress}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(wallet.walletAddress);
                              toast.success('Address copied to clipboard!');
                            }}
                            className="btn-icon p-1 flex-shrink-0"
                            aria-label="Copy wallet address"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="text-left lg:text-right">
                        <p className="text-xs sm:text-sm opacity-70 mb-1">Total Value</p>
                        <p className="text-3xl sm:text-4xl md:text-5xl font-bold">
                          {displayValue(wallet.totalValue)}
                        </p>
                      </div>
                    </div>

                    {/* Token List */}
                    <div className="mt-3 sm:mt-4 space-y-2">
                      {wallet.tokens.slice(0, 5).map((token, tokenIndex) => {
                        const tokenLogo = getTokenLogo(token.tokenAddress, token.tokenSymbol);
                        const defiPosition = detectDeFiPosition(token.tokenAddress, token.tokenSymbol);
                        return (
                          <div
                            key={tokenIndex}
                            className="flex flex-col gap-2 text-xs sm:text-sm rounded-lg p-2 sm:p-3"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {tokenLogo && (
                                  <img
                                    src={tokenLogo}
                                    alt={token.tokenSymbol}
                                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                <span className="font-semibold break-all">
                                  {getTokenDisplaySymbol(token.tokenSymbol, token.tokenAddress)}
                                </span>
                                {defiPosition && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                                    style={{
                                      backgroundColor: getDeFiBadgeColor(defiPosition.type),
                                      color: 'white',
                                    }}
                                    title={`${defiPosition.protocol} - ${defiPosition.description}`}
                                  >
                                    {getDeFiTypeLabel(defiPosition.type)}
                                  </span>
                                )}
                              </div>
                              <div className="text-left sm:text-right flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                                <span className="opacity-70 text-xs">
                                  {token.balance.toLocaleString('en-US', {
                                    maximumFractionDigits: 4,
                                  })}
                                </span>
                                <span className="font-semibold">
                                  {displayValue(token.totalValue)}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs opacity-60">
                              Price: {displayValue(token.priceAtDate, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} on {new Date(displayData.reportDate).toLocaleDateString('en-US')}
                            </div>
                          </div>
                        );
                      })}
                      {wallet.tokens.length > 5 && (
                        <p className="text-xs opacity-70 text-center pt-2">
                          +{wallet.tokens.length - 5} more token{wallet.tokens.length - 5 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* DeFi Positions Section */}
                    {wallet.defiPositions && wallet.defiPositions.length > 0 && (
                      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          DeFi Positions
                        </h4>
                        <div className="space-y-2">
                          {wallet.defiPositions.slice(0, 10).map((position, posIndex) => {
                            const positionLogo = getTokenLogo(position.tokenAddress, position.tokenSymbol);
                            const badgeColor = getDeFiBadgeColor(position.positionType);

                            return (
                              <div
                                key={posIndex}
                                className="flex flex-col gap-2 text-xs sm:text-sm rounded-lg p-2 sm:p-3"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                              >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {positionLogo && (
                                      <img
                                        src={positionLogo}
                                        alt={position.tokenSymbol}
                                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <span className="font-semibold break-all">
                                      {getTokenDisplaySymbol(position.tokenSymbol, position.tokenAddress)}
                                    </span>
                                    <span
                                      className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                                      style={{
                                        backgroundColor: badgeColor,
                                        color: 'white',
                                      }}
                                      title={`${position.protocol} - ${getDeFiTypeLabel(position.positionType)}`}
                                    >
                                      {position.positionType.charAt(0).toUpperCase() + position.positionType.slice(1)}
                                    </span>
                                  </div>
                                  <div className="text-left sm:text-right flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                                    <span className="opacity-70 text-xs">
                                      {position.balance.toLocaleString('en-US', {
                                        maximumFractionDigits: 4,
                                      })}
                                    </span>
                                    <span className="font-semibold">
                                      {displayValue(position.totalValue)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-between text-xs opacity-60 gap-1">
                                  <span>Protocol: {position.protocol}</span>
                                  <span>Price: {displayValue(position.priceAtDate, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                                </div>
                              </div>
                            );
                          })}
                          {wallet.defiPositions.length > 10 && (
                            <p className="text-xs opacity-70 text-center pt-2">
                              +{wallet.defiPositions.length - 10} more position{wallet.defiPositions.length - 10 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Grand Total */}
              <div className="pt-6 sm:pt-8 mt-6 sm:mt-8" style={{ borderTop: '2px solid var(--border)' }}>
                <div className="rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl"
                     style={{
                       background: 'linear-gradient(135deg, var(--crypto-gradient-1), var(--crypto-gradient-2))',
                     }}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                    <div className="text-white">
                      <p className="text-xs sm:text-sm opacity-90 mb-1">Total Portfolio Value</p>
                      <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold break-all">
                        {displayValue(displayData.grandTotal)}
                      </p>
                      <p className="text-xs opacity-80 mt-2 sm:mt-3">
                        {displayData.wallets.reduce((sum, w) => sum + w.tokens.length, 0)} tokens across {displayData.wallets.length} wallet{displayData.wallets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <svg className="w-16 h-16 lg:w-20 lg:h-20 opacity-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-xs mt-6 text-center opacity-60" style={{ color: 'var(--secondary)' }}>
                  Portfolio valuation as of {new Date(displayData.reportDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Portfolio Charts */}
            <div className="mt-8">
              <PortfolioCharts
                reportData={displayData}
                currency={currency}
                exchangeRates={exchangeRates}
              />
            </div>
          </div>
          );
        })()}

        {/* Footer - Supported Currencies */}
        <div className="text-center mt-16 mb-8">
          <p className="text-sm mb-6" style={{ color: 'var(--secondary)' }}>
            Supported Networks
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12">
            {/* Solana */}
            <div className="flex flex-col items-center gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl"
                   style={{ backgroundColor: 'var(--surface-variant)' }}>
                <img
                  src="/logos/solana-sol-logo.png"
                  alt="Solana"
                  className="w-8 h-8 md:w-10 md:h-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--on-surface)' }}>
                Solana
              </span>
            </div>

            {/* Ethereum */}
            <div className="flex flex-col items-center gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl"
                   style={{ backgroundColor: 'var(--surface-variant)' }}>
                <img
                  src="/logos/ethereum-eth-logo.png"
                  alt="Ethereum"
                  className="w-8 h-8 md:w-10 md:h-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--on-surface)' }}>
                Ethereum
              </span>
            </div>

            {/* Bitcoin */}
            <div className="flex flex-col items-center gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl"
                   style={{ backgroundColor: 'var(--surface-variant)' }}>
                <img
                  src="/logos/bitcoin-btc-logo.png"
                  alt="Bitcoin"
                  className="w-8 h-8 md:w-10 md:h-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--on-surface)' }}>
                Bitcoin
              </span>
            </div>
          </div>
          <p className="text-xs mt-8 opacity-40" style={{ color: 'var(--secondary)' }}>
            Powered by CoinGecko API
          </p>
        </div>

        {/* Save Wallet Set Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowSaveModal(false)}>
            <div className="card p-5 sm:p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4" style={{ color: 'var(--on-surface)' }}>
                Save Wallet Set
              </h3>
              <input
                type="text"
                value={saveSetName}
                onChange={(e) => setSaveSetName(e.target.value)}
                placeholder="Enter a name"
                className="input-field w-full mb-3 sm:mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveWalletSet()}
              />
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button onClick={() => setShowSaveModal(false)} className="btn-secondary w-full sm:w-auto">
                  Cancel
                </button>
                <button onClick={handleSaveWalletSet} className="btn-primary w-full sm:w-auto" disabled={!saveSetName.trim()}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Load Wallet Set Modal */}
        {showLoadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowLoadModal(false)}>
            <div className="card p-5 sm:p-6 max-w-md w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4" style={{ color: 'var(--on-surface)' }}>
                Load Wallet Set
              </h3>
              <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
                {Object.keys(savedWalletSets).map((setName) => (
                  <div
                    key={setName}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 rounded-lg hover:bg-opacity-10 hover:bg-white transition gap-2"
                    style={{ backgroundColor: 'var(--surface-variant)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--on-surface)' }}>
                        {setName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>
                        {savedWalletSets[setName].length} wallet{savedWalletSets[setName].length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleLoadWalletSet(setName)}
                        className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteWalletSet(setName)}
                        className="btn-icon"
                        title="Delete this set"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end mt-3 sm:mt-4 flex-shrink-0">
                <button onClick={() => setShowLoadModal(false)} className="btn-secondary w-full sm:w-auto">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
