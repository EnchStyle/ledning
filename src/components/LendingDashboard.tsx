import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  LinearProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useLending } from '../context/LendingContext';
import LoanCreation from './LoanCreation';
import MarginCallAlert from './MarginCallAlert';

const LendingDashboard: React.FC = () => {
  const { userPosition, marketData } = useLending();
  const totalCollateralValue = userPosition.totalCollateral * marketData.xpmPrice;
  const totalDebt = userPosition.totalBorrowed + userPosition.totalInterest;
  const utilizationRate = totalCollateralValue > 0 ? (totalDebt / totalCollateralValue) * 100 : 0;

  return (
    <Container maxWidth="lg">
      <MarginCallAlert />
      
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Borrow XRP with XPM Collateral
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Unlock liquidity from your XPM holdings with competitive rates
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Key Features */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <TrendingUpIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                15% APR
              </Typography>
              <Typography color="text.secondary">
                Competitive interest rates for altcoin collateral
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <SecurityIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Up to 50% LTV
              </Typography>
              <Typography color="text.secondary">
                Conservative loan-to-value ratio for your security
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <AccountBalanceIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Instant Loans
              </Typography>
              <Typography color="text.secondary">
                Get XRP liquidity immediately upon collateral deposit
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Overview */}
        {userPosition.totalCollateral > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Your Portfolio
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total Collateral
                    </Typography>
                    <Typography variant="h5">
                      {userPosition.totalCollateral.toLocaleString()} XPM
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      ≈ {totalCollateralValue.toFixed(2)} XRP
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Outstanding Debt
                    </Typography>
                    <Typography variant="h5">
                      {totalDebt.toFixed(2)} XRP
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Principal + Interest
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Available to Borrow
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {Math.max(0, (totalCollateralValue * 0.5) - totalDebt).toFixed(2)} XRP
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      At 50% LTV
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Utilization Rate
                    </Typography>
                    <Typography variant="h5">
                      {utilizationRate.toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(utilizationRate, 100)}
                      color={utilizationRate > 60 ? 'warning' : 'primary'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Loan Creation */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Create New Loan
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>How it works:</strong> Deposit XPM tokens as collateral to borrow XRP instantly. 
                Your loan will be liquidated if the value drops below 65% LTV.
              </Typography>
            </Alert>
            <LoanCreation />
          </Paper>
        </Grid>

        {/* Risk Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom color="warning.main">
              ⚠️ Important Risks
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" paragraph>
                <strong>Liquidation Risk:</strong> If your loan's LTV reaches 65%, it may be liquidated with a 10% penalty.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Interest Accrual:</strong> Interest compounds daily at 15% APR.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Price Volatility:</strong> XPM price changes affect your liquidation risk.
              </Typography>
            </Box>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                Always monitor your loan's health and consider partial repayments to reduce risk.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LendingDashboard;