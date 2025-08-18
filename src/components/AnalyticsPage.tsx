import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';

const AnalyticsPage: React.FC = () => {
  const { userLoans, marketData } = useLending();

  // Market analytics
  const xpmPrice24hChange = 2.34; // Demo data
  const totalVolumeUSD = 1250000; // Demo data
  const activeLoansCount = userLoans.length;
  const totalTVL = 45600000; // Total Value Locked demo data

  // Protocol statistics
  const protocolStats = {
    totalLoans: 1247,
    averageLTV: 42.5,
    totalCollateralLocked: 89500000, // XPM
    liquidationRate: 0.8, // 0.8% of loans liquidated
    totalInterestPaid: 245000, // RLUSD
  };

  // Risk distribution
  const riskDistribution = {
    conservative: 65, // percentage of loans
    moderate: 28,
    aggressive: 7,
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Market Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Market insights and protocol statistics
        </Typography>
      </Box>

      {/* Market Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  XPM Price
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${marketData.xpmPriceUSD.toFixed(4)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon fontSize="small" color="success" />
                <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                  +{xpmPrice24hChange}% (24h)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Protocol TVL
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${(totalTVL / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Value Locked
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  24h Volume
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${(totalVolumeUSD / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lending volume
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShieldIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Active Loans
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {protocolStats.totalLoans.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Protocol wide
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Protocol Health */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Protocol Health
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Average LTV Across All Loans
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {protocolStats.averageLTV}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(protocolStats.averageLTV / 65) * 100}
                color="primary"
                sx={{ height: 8, borderRadius: 1, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Healthy range: Below 50%
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Liquidation Rate
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {protocolStats.liquidationRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={protocolStats.liquidationRate * 10} // Scale for visibility
                color="success"
                sx={{ height: 8, borderRadius: 1, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Low liquidation rate indicates healthy protocol
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Risk Distribution
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckIcon color="success" sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="body2">Conservative (&lt;30% LTV)</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {riskDistribution.conservative}%
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon color="warning" sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="body2">Moderate (30-45% LTV)</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {riskDistribution.moderate}%
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon color="error" sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="body2">Aggressive (&gt;45% LTV)</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {riskDistribution.aggressive}%
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Your Portfolio Performance */}
      {activeLoansCount > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Your Portfolio Performance
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
                  {activeLoansCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Loans
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Liquidations
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="info.main" sx={{ fontWeight: 700 }}>
                  {(Math.random() * 500).toFixed(0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interest Paid (RLUSD)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Market Insights */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Market Insights
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>RLUSD Stability:</strong> RLUSD maintains its 1:1 USD peg, eliminating debt-side volatility risk for borrowers.
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Healthy Protocol:</strong> Low liquidation rates and conservative average LTV indicate protocol stability.
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>XPM Volatility:</strong> Monitor XPM price movements as they directly impact collateral value and liquidation risk.
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'surface.main', borderRadius: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Interest Rates:</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="30d: 14% APR" size="small" />
                <Chip label="60d: 15% APR" size="small" />
                <Chip label="90d: 16% APR" size="small" />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AnalyticsPage;