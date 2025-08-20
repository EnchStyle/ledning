/**
 * HighPerformancePortfolioDashboard - Optimized for 10x simulation speed
 * Uses aggressive memoization and minimal re-renders for smooth performance
 */
import React, { useState, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Savings as CollateralIcon,
  CreditCard as DebtIcon,
  Percent as LTVIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import { DEMO_PORTFOLIO } from '../config/demoConstants';

interface HighPerformancePortfolioDashboardProps {}

const HighPerformancePortfolioDashboard: React.FC<HighPerformancePortfolioDashboardProps> = () => {
  const { userLoans, marketData, simulationSettings } = useLending();
  
  // Performance tracking
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  renderCount.current += 1;
  
  const now = Date.now();
  const renderInterval = now - lastRenderTime.current;
  lastRenderTime.current = now;
  
  // High-performance portfolio calculations with aggressive memoization
  const portfolioStats = useMemo(() => {
    if (userLoans.length === 0) {
      return {
        totalCollateralValue: 0,
        totalDebtRLUSD: 0,
        avgLTV: 0,
        availableToBorrow: 0,
        atRiskLoans: 0,
        fps: 0
      };
    }

    const totalCollateralValue = userLoans.reduce((sum, loan) => 
      sum + (loan.collateralAmount * marketData.xpmPriceUSD), 0
    );
    const totalDebtRLUSD = userLoans.reduce((sum, loan) => 
      sum + loan.borrowedAmount + (loan.fixedInterestAmount || 0), 0
    );
    const avgLTV = totalCollateralValue > 0 ? (totalDebtRLUSD / totalCollateralValue) * 100 : 0;
    const availableToBorrow = Math.max(0, (totalCollateralValue * 0.5) - totalDebtRLUSD);
    const atRiskLoans = userLoans.filter(loan => {
      const loanLTV = ((loan.borrowedAmount + loan.fixedInterestAmount) / (loan.collateralAmount * marketData.xpmPriceUSD)) * 100;
      return loanLTV > 50;
    }).length;
    
    // Calculate approximate FPS
    const fps = renderInterval > 0 ? Math.round(1000 / renderInterval) : 0;
    
    return {
      totalCollateralValue,
      totalDebtRLUSD,
      avgLTV,
      availableToBorrow,
      atRiskLoans,
      fps
    };
  }, [
    userLoans.length, 
    marketData.xpmPriceUSD,
    // Only recalculate if loans or price changed significantly
    Math.floor(marketData.xpmPriceUSD * 1000), // Round to 3 decimal places for stability
    renderInterval
  ]);

  const { totalCollateralValue, totalDebtRLUSD, avgLTV, availableToBorrow, atRiskLoans, fps } = portfolioStats;

  // Demo wallet balance
  const walletBalance = DEMO_PORTFOLIO.XPM_BALANCE;

  if (userLoans.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          High-Performance Portfolio Dashboard
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BoltIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Performance Mode:</strong> Optimized for 10x simulation speed. 
              Render #{renderCount.current} | FPS: ~{fps}
            </Typography>
          </Box>
        </Alert>
        
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <CollateralIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Active Loans
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first loan to start building your lending portfolio.
            <br />
            You have {walletBalance.toLocaleString()} XPM available as collateral.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => {}}
            disabled
            sx={{ opacity: 0.7 }}
          >
            Go to "🚀 Get Started" Tab to Create Loan
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            High-Performance Portfolio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Optimized for {simulationSettings.speed}x simulation speed
          </Typography>
        </Box>
        {atRiskLoans > 0 && (
          <Alert severity="warning" sx={{ maxWidth: 300 }}>
            <Typography variant="body2">
              {atRiskLoans} loan{atRiskLoans > 1 ? 's' : ''} at risk of liquidation
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Performance Stats */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BoltIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Performance:</strong> Render #{renderCount.current}
            </Typography>
          </Box>
          <Typography variant="body2">
            <strong>FPS:</strong> ~{fps}
          </Typography>
          <Typography variant="body2">
            <strong>Speed:</strong> {simulationSettings.speed}x
          </Typography>
          <Typography variant="body2">
            <strong>Interval:</strong> {renderInterval}ms
          </Typography>
        </Box>
      </Alert>

      {/* High-Performance Portfolio Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', transition: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CollateralIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Your Deposit
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${totalCollateralValue.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userLoans.reduce((sum, loan) => sum + loan.collateralAmount, 0).toLocaleString()} XPM
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon fontSize="small" color="success" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  Live @ ${marketData.xpmPriceUSD.toFixed(4)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', transition: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DebtIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Amount Borrowed
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${totalDebtRLUSD.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalDebtRLUSD.toFixed(2)} RLUSD
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Fixed interest model
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', transition: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LTVIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Loan Risk Level
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {avgLTV.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(avgLTV / 65) * 100}
                color={avgLTV > 50 ? 'warning' : 'primary'}
                sx={{ height: 6, borderRadius: 1, mb: 1, transition: 'none' }}
              />
              <Typography variant="caption" color="text.secondary">
                Danger Zone at 65%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', transition: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BoltIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  You Can Still Borrow
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
                ${availableToBorrow.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {availableToBorrow.toFixed(2)} RLUSD
              </Typography>
              <Typography variant="caption" color="text.secondary">
                At current 50% max LTV
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Simplified Loan List for Performance */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Your Loans ({userLoans.length}) - High-Performance View
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Simplified view optimized for {simulationSettings.speed}x simulation speed
        </Typography>

        <Grid container spacing={2}>
          {userLoans.map((loan, index) => {
            const totalDebt = loan.borrowedAmount + (loan.fixedInterestAmount || 0);
            const loanLTV = (totalDebt / (loan.collateralAmount * marketData.xpmPriceUSD)) * 100;
            const healthColor = loanLTV < 30 ? 'success' : loanLTV < 50 ? 'info' : loanLTV < 60 ? 'warning' : 'error';

            return (
              <Grid item xs={12} md={6} key={loan.id || index}>
                <Card sx={{ transition: 'none' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Loan #{index + 1}
                      </Typography>
                      <Chip 
                        label={`${loanLTV.toFixed(1)}% LTV`}
                        color={healthColor as any}
                        size="small"
                      />
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Collateral
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {loan.collateralAmount.toLocaleString()} XPM
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Debt
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {totalDebt.toFixed(0)} RLUSD
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <LinearProgress
                      variant="determinate"
                      value={(loanLTV / 65) * 100}
                      color={healthColor as any}
                      sx={{ mt: 2, height: 4, borderRadius: 1, transition: 'none' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>High-Performance Mode:</strong> This view is optimized for {simulationSettings.speed}x simulation speed
          with minimal animations and simplified layouts for maximum performance.
        </Typography>
      </Alert>
    </Box>
  );
};

// Aggressive memoization to prevent unnecessary re-renders
export default React.memo(HighPerformancePortfolioDashboard);