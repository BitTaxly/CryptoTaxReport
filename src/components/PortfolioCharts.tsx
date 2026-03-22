'use client';

import { TaxReport } from '@/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBlockchainLogo } from '@/services/blockchainDetector';
import { getTokenDisplaySymbol } from '@/utils/tokenDisplay';
import { convertCurrency, formatCurrency, CURRENCIES } from '@/utils/currency';

interface PortfolioChartsProps {
  reportData: TaxReport;
  currency: string;
  exchangeRates: Record<string, number>;
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

// Helper to get CSS variable value
const getCSSVariable = (variable: string): string => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }
  return '#000000';
};

export default function PortfolioCharts({ reportData, currency, exchangeRates }: PortfolioChartsProps) {
  // Helper to convert and format currency
  const displayValue = (usdValue: number) => {
    const converted = convertCurrency(usdValue, currency, exchangeRates);
    return formatCurrency(converted, currency);
  };
  // Prepare data for pie chart (top tokens by value)
  const allTokens = reportData.wallets.flatMap(wallet =>
    wallet.tokens.map(token => ({
      name: token.tokenSymbol,
      address: token.tokenAddress,
      value: token.totalValue,
    }))
  );

  // Group tokens by symbol and sum their values
  const tokenMap = new Map<string, { value: number; address: string }>();
  allTokens.forEach(token => {
    const current = tokenMap.get(token.name);
    if (!current) {
      tokenMap.set(token.name, { value: token.value, address: token.address });
    } else {
      current.value += token.value;
    }
  });

  // Convert to array and sort by value
  const tokenData = Array.from(tokenMap.entries())
    .map(([name, data]) => ({
      name,
      displayName: getTokenDisplaySymbol(name, data.address),
      value: data.value
    }))
    .sort((a, b) => b.value - a.value);

  // Take top 8 tokens and group the rest as "Others"
  const topTokens = tokenData.slice(0, 8);
  const othersValue = tokenData.slice(8).reduce((sum, token) => sum + token.value, 0);

  const pieData = othersValue > 0
    ? [...topTokens, { name: 'Others', displayName: 'Others', value: othersValue }]
    : topTokens;

  // Prepare data for bar chart (wallets comparison)
  const walletData = reportData.wallets.map(wallet => ({
    name: wallet.walletAddress.slice(0, 6),
    value: wallet.totalValue,
    blockchain: wallet.blockchain,
    fullAddress: wallet.walletAddress,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const displayLabel = data.displayName || payload[0].name;
      const percentage = ((payload[0].value / reportData.grandTotal) * 100).toFixed(1);

      return (
        <div
          className="card p-4 shadow-xl"
          style={{
            backgroundColor: 'var(--surface-container-high)',
            border: '2px solid var(--outline-variant)',
            minWidth: '180px'
          }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--on-surface)' }}>
            {displayLabel}
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
              {displayValue(payload[0].value)}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>
            {percentage}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart with theme-aware colors
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, displayName }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="var(--on-surface)"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${displayName} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Distribution (Pie Chart) */}
      <div className="card p-6">
        <h3 className="text-xl font-medium mb-4" style={{ color: 'var(--on-surface)' }}>
          Portfolio Distribution
        </h3>
        <div className="text-sm mb-2" style={{ color: 'var(--on-surface-variant)' }}>
          Top holdings by value
        </div>
        <ResponsiveContainer width="100%" height={450}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={{
                stroke: 'var(--on-surface-variant)',
                strokeWidth: 1,
              }}
              label={renderPieLabel}
              outerRadius={130}
              fill="#8884d8"
              dataKey="value"
              animationDuration={800}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => (
                <span style={{ color: 'var(--on-surface)' }}>
                  {entry.payload.displayName}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Wallet Values (Bar Chart) */}
      {walletData.length > 1 && (
        <div className="card p-6">
          <h3 className="text-xl font-medium mb-4" style={{ color: 'var(--on-surface)' }}>
            Wallet Comparison
          </h3>
          <div className="text-sm mb-2" style={{ color: 'var(--on-surface-variant)' }}>
            Total value by wallet address
          </div>
          <style>{`
            .recharts-bar-rectangle {
              transition: opacity 0.2s ease;
              cursor: pointer;
              outline: none !important;
            }
            .recharts-bar-rectangle:hover {
              opacity: 0.8;
              filter: brightness(1.1);
            }
            .recharts-bar-rectangle:focus,
            .recharts-bar-rectangle:active {
              outline: none !important;
            }
            .recharts-wrapper {
              cursor: default !important;
            }
            .recharts-wrapper * {
              outline: none !important;
              -webkit-tap-highlight-color: transparent;
            }
            .recharts-surface {
              outline: none !important;
              user-select: none;
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
            }
            .recharts-layer,
            .recharts-sector,
            .recharts-cell {
              outline: none !important;
              pointer-events: auto;
            }
            .recharts-sector:focus,
            .recharts-cell:focus,
            .recharts-sector:active,
            .recharts-cell:active {
              outline: none !important;
            }
          `}</style>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={walletData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#764ba2" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tick={(props: any) => {
                  const { x, y, payload } = props;
                  const data = walletData.find(w => w.name === payload.value);
                  if (!data) return null;

                  // Get computed style for current theme
                  const onSurface = typeof window !== 'undefined'
                    ? getComputedStyle(document.documentElement).getPropertyValue('--on-surface').trim()
                    : '#000000';
                  const onSurfaceVariant = typeof window !== 'undefined'
                    ? getComputedStyle(document.documentElement).getPropertyValue('--on-surface-variant').trim()
                    : '#666666';

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <image
                        href={getBlockchainLogo(data.blockchain)}
                        x={-16}
                        y={10}
                        height="32"
                        width="32"
                      />
                      <text
                        x={0}
                        y={52}
                        textAnchor="middle"
                        fill={onSurface}
                        fontSize={13}
                        fontWeight={500}
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
                height={85}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={(props: any) => {
                  const onSurface = typeof window !== 'undefined'
                    ? getComputedStyle(document.documentElement).getPropertyValue('--on-surface').trim()
                    : '#000000';

                  // Convert the USD value to selected currency
                  const convertedValue = convertCurrency(props.payload.value, currency, exchangeRates);
                  const currencyInfo = CURRENCIES.find(c => c.code === currency);
                  const symbol = currencyInfo?.symbol || '$';

                  // Format with M/k abbreviations
                  let formattedValue: string;
                  if (convertedValue >= 1000000) {
                    formattedValue = `${symbol}${(convertedValue / 1000000).toFixed(1)}M`;
                  } else if (convertedValue >= 1000) {
                    formattedValue = `${symbol}${(convertedValue / 1000).toFixed(0)}k`;
                  } else {
                    formattedValue = `${symbol}${Math.round(convertedValue)}`;
                  }

                  return (
                    <text
                      x={props.x}
                      y={props.y}
                      textAnchor="end"
                      fill={onSurface}
                      fontSize={12}
                    >
                      {formattedValue}
                    </text>
                  );
                }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={false}
              />
              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                radius={[12, 12, 0, 0]}
                animationDuration={800}
                maxBarSize={100}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
