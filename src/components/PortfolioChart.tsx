import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useLending } from '../context/LendingContext';

interface ChartDataPoint {
  timestamp: string;
  collateralValue: number;
  debtValue: number;
  ltv: number;
}

const PortfolioChart: React.FC = () => {
  const theme = useTheme();
  const { userLoans, marketData } = useLending();

  // Generate mock historical data for demonstration
  const chartData = useMemo(() => {
    const data: ChartDataPoint[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Generate 30 days of historical data
    for (let i = 29; i >= 0; i--) {
      const timestamp = new Date(now - (i * dayMs)).toISOString().split('T')[0];
      
      // Simulate price fluctuations
      const priceVariation = 1 + (Math.sin(i * 0.3) * 0.1) + (Math.random() - 0.5) * 0.05;
      const historicalXmpPrice = marketData.xpmPriceUSD * priceVariation;
      
      // Calculate portfolio values
      const totalCollateral = userLoans.reduce((sum, loan) => sum + loan.collateralAmount, 0);
      const totalDebt = userLoans.reduce((sum, loan) => sum + loan.borrowedAmount + (loan.fixedInterestAmount || 0), 0);
      
      const collateralValue = totalCollateral * historicalXmpPrice;
      const ltv = collateralValue > 0 ? (totalDebt / collateralValue) * 100 : 0;

      data.push({
        timestamp,
        collateralValue,
        debtValue: totalDebt,
        ltv,
      });
    }

    return data;
  }, [userLoans, marketData.xpmPriceUSD]);

  // Chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 60, bottom: 40, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Data ranges
  const maxCollateralValue = Math.max(...chartData.map(d => d.collateralValue));
  const maxDebtValue = Math.max(...chartData.map(d => d.debtValue));
  const maxValue = Math.max(maxCollateralValue, maxDebtValue);
  const minValue = 0;
  
  const maxLTV = Math.max(...chartData.map(d => d.ltv));
  const minLTV = 0;

  // Scale functions
  const xScale = (index: number) => (index / (chartData.length - 1)) * innerWidth;
  const yScale = (value: number) => innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight;
  const ltvScale = (ltv: number) => innerHeight - ((ltv - minLTV) / (Math.max(maxLTV, 65) - minLTV)) * innerHeight;

  // Generate path strings
  const collateralPath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + xScale(i)} ${padding.top + yScale(d.collateralValue)}`)
    .join(' ');

  const debtPath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + xScale(i)} ${padding.top + yScale(d.debtValue)}`)
    .join(' ');

  const ltvPath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + xScale(i)} ${padding.top + ltvScale(d.ltv)}`)
    .join(' ');

  // Grid lines
  const yGridLines = [];
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const y = padding.top + (i / steps) * innerHeight;
    const value = maxValue - (i / steps) * (maxValue - minValue);
    yGridLines.push(
      <g key={i}>
        <line
          x1={padding.left}
          y1={y}
          x2={padding.left + innerWidth}
          y2={y}
          stroke={theme.palette.divider}
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />
        <text
          x={padding.left - 10}
          y={y + 4}
          textAnchor="end"
          fill={theme.palette.text.secondary}
          fontSize="12"
        >
          ${(value / 1000).toFixed(0)}k
        </text>
      </g>
    );
  }

  // X-axis labels
  const xLabels = [];
  const labelStep = Math.floor(chartData.length / 6);
  for (let i = 0; i < chartData.length; i += labelStep) {
    const x = padding.left + xScale(i);
    const date = new Date(chartData[i].timestamp);
    xLabels.push(
      <text
        key={i}
        x={x}
        y={chartHeight - 10}
        textAnchor="middle"
        fill={theme.palette.text.secondary}
        fontSize="12"
      >
        {date.getMonth() + 1}/{date.getDate()}
      </text>
    );
  }

  if (userLoans.length === 0) {
    return (
      <Box sx={{ 
        height: 300, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'surface.main',
        borderRadius: 2,
      }}>
        <Typography color="text.secondary">
          No loan data to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 2, bgcolor: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="body2">Collateral Value</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 2, bgcolor: theme.palette.secondary.main, mr: 1 }} />
            <Typography variant="body2">Debt Value</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 2, bgcolor: theme.palette.warning.main, mr: 1 }} />
            <Typography variant="body2">LTV %</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={chartWidth} height={chartHeight} style={{ background: theme.palette.surface.main, borderRadius: 8 }}>
          {/* Grid */}
          {yGridLines}

          {/* Liquidation line at 65% LTV */}
          <line
            x1={padding.left}
            y1={padding.top + ltvScale(65)}
            x2={padding.left + innerWidth}
            y2={padding.top + ltvScale(65)}
            stroke={theme.palette.error.main}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <text
            x={padding.left + innerWidth + 5}
            y={padding.top + ltvScale(65) + 4}
            fill={theme.palette.error.main}
            fontSize="10"
          >
            Liquidation (65%)
          </text>

          {/* Area fills */}
          <defs>
            <linearGradient id="collateralGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
              <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="debtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.palette.secondary.main} stopOpacity={0.3} />
              <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity={0.1} />
            </linearGradient>
          </defs>

          {/* Collateral area */}
          <path
            d={`${collateralPath} L ${padding.left + xScale(chartData.length - 1)} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`}
            fill="url(#collateralGradient)"
          />

          {/* Debt area */}
          <path
            d={`${debtPath} L ${padding.left + xScale(chartData.length - 1)} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`}
            fill="url(#debtGradient)"
          />

          {/* Lines */}
          <path
            d={collateralPath}
            fill="none"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
          />
          <path
            d={debtPath}
            fill="none"
            stroke={theme.palette.secondary.main}
            strokeWidth={2}
          />
          <path
            d={ltvPath}
            fill="none"
            stroke={theme.palette.warning.main}
            strokeWidth={2}
          />

          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={i}>
              <circle
                cx={padding.left + xScale(i)}
                cy={padding.top + yScale(d.collateralValue)}
                r={2}
                fill={theme.palette.primary.main}
              />
              <circle
                cx={padding.left + xScale(i)}
                cy={padding.top + yScale(d.debtValue)}
                r={2}
                fill={theme.palette.secondary.main}
              />
              <circle
                cx={padding.left + xScale(i)}
                cy={padding.top + ltvScale(d.ltv)}
                r={2}
                fill={theme.palette.warning.main}
              />
            </g>
          ))}

          {/* X-axis labels */}
          {xLabels}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + innerHeight}
            stroke={theme.palette.divider}
            strokeWidth={1}
          />
          <line
            x1={padding.left}
            y1={padding.top + innerHeight}
            x2={padding.left + innerWidth}
            y2={padding.top + innerHeight}
            stroke={theme.palette.divider}
            strokeWidth={1}
          />
        </svg>
      </Box>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Portfolio value and LTV history over the last 30 days
        </Typography>
      </Box>
    </Box>
  );
};

export default PortfolioChart;