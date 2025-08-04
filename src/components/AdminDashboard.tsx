import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import { useLending } from '../context/LendingContext';
import TimeSimulator from './TimeSimulator';
import DualAssetMarketSimulator from './DualAssetMarketSimulator';

const AdminDashboard: React.FC = () => {
  const { 
    marketData, 
    updateXpmPrice, 
    updateXrpPrice, 
    loans,
    checkMarginCalls,
    checkMaturedLoans,
    processMaturedLoans,
    currentTime
  } = useLending();

  const activeLoans = loans.filter(loan => loan.status === 'active');
  const marginCallLoans = checkMarginCalls();
  const maturedLoans = checkMaturedLoans();

  // Quick stats for admin overview
  const totalCollateralUSD = activeLoans.reduce((sum, loan) => 
    sum + (loan.collateralAmount * marketData.xpmPriceUSD), 0
  );
  const totalDebtUSD = activeLoans.reduce((sum, loan) => 
    sum + ((loan.borrowedAmount + loan.accruedInterest) * marketData.xrpPriceUSD), 0
  );
  const avgLTV = activeLoans.length > 0 
    ? activeLoans.reduce((sum, loan) => sum + loan.currentLTV, 0) / activeLoans.length 
    : 0;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          🔧 Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Simulation and administration tools for testing the lending protocol
        </Typography>

        {/* Alert for admin mode */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Admin Mode:</strong> Use these tools to simulate market conditions, 
            time progression, and test liquidation scenarios for demonstration purposes.
          </Typography>
        </Alert>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {activeLoans.length}
              </Typography>
              <Typography variant="caption">Active Loans</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="secondary">
                ${totalCollateralUSD.toFixed(0)}
              </Typography>
              <Typography variant="caption">Total Collateral USD</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                ${totalDebtUSD.toFixed(0)}
              </Typography>
              <Typography variant="caption">Total Debt USD</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color={avgLTV > 55 ? "error.main" : "success.main"}>
                {avgLTV.toFixed(1)}%
              </Typography>
              <Typography variant="caption">Average LTV</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Risk Alerts */}
        {marginCallLoans.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>⚠️ Margin Call Alert:</strong> {marginCallLoans.length} loan(s) 
              are eligible for liquidation (LTV ≥ 65%). 
              Test liquidation scenarios or adjust prices to resolve.
            </Typography>
          </Alert>
        )}

        {maturedLoans.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>📅 Matured Loans:</strong> {maturedLoans.length} loan(s) 
              have reached maturity and need processing.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Time Simulation */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom>
                ⏰ Time Simulator
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fast-forward time to test interest accrual, loan maturity, and compound effects
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TimeSimulator />
            </Paper>
          </Grid>

          {/* Market Price Simulation */}
          <Grid item xs={12} md={8}>
            <DualAssetMarketSimulator
              currentXpmPrice={marketData.xpmPriceUSD}
              currentXrpPrice={marketData.xrpPriceUSD}
              onXpmPriceChange={updateXpmPrice}
              onXrpPriceChange={updateXrpPrice}
            />
          </Grid>
        </Grid>

        {/* Loan Risk Analysis */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            📊 Loan Risk Analysis
          </Typography>
          
          {activeLoans.length > 0 ? (
            <Grid container spacing={2}>
              {activeLoans.map((loan) => {
                const daysUntilMaturity = Math.ceil(
                  (loan.maturityDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24)
                );
                const isAtRisk = loan.currentLTV >= 55;
                const isLiquidatable = loan.currentLTV >= 65;
                const isNearMaturity = daysUntilMaturity <= 7;

                return (
                  <Grid item xs={12} sm={6} md={4} key={loan.id}>
                    <Paper 
                      sx={{ 
                        p: 2,
                        border: isLiquidatable ? '2px solid' : '1px solid',
                        borderColor: isLiquidatable 
                          ? 'error.main' 
                          : isAtRisk 
                            ? 'warning.main' 
                            : 'divider'
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Loan #{loan.id.slice(-4)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        LTV: <strong style={{ 
                          color: isLiquidatable ? '#d32f2f' : isAtRisk ? '#ed6c02' : '#2e7d32' 
                        }}>
                          {loan.currentLTV.toFixed(1)}%
                        </strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Collateral: {loan.collateralAmount.toLocaleString()} XPM
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Debt: {(loan.borrowedAmount + loan.accruedInterest).toFixed(2)} XRP
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Maturity: {daysUntilMaturity} days
                      </Typography>
                      {(isLiquidatable || isNearMaturity) && (
                        <Box sx={{ mt: 1 }}>
                          {isLiquidatable && (
                            <Typography variant="caption" color="error" display="block">
                              🚨 LIQUIDATABLE
                            </Typography>
                          )}
                          {isNearMaturity && (
                            <Typography variant="caption" color="warning.main" display="block">
                              ⏰ Near maturity
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No active loans to analyze. Create some loans to test the system.
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Testing Scenarios */}
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🧪 Recommended Testing Scenarios
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="success.main">Normal Operation</Typography>
                <Typography variant="body2" fontSize="small">
                  • Create loan at 50% LTV<br/>
                  • Simulate 30 days<br/>
                  • Test repayment
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="warning.main">Price Volatility</Typography>
                <Typography variant="body2" fontSize="small">
                  • XPM price -30%<br/>
                  • XRP price +20%<br/>
                  • Monitor LTV changes
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="error.main">Liquidation Test</Typography>
                <Typography variant="body2" fontSize="small">
                  • Push LTV above 65%<br/>
                  • Test liquidation process<br/>
                  • Verify fee calculations
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="info.main">Maturity System</Typography>
                <Typography variant="body2" fontSize="small">
                  • Create 30-day loan<br/>
                  • Simulate 35 days<br/>
                  • Test auto-renewal
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;