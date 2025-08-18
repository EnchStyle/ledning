import React, { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Grid,
  Alert,
  Divider,
  LinearProgress,
  Chip,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useLending } from '../context/LendingContext';

const LoanRiskCalculator: React.FC = () => {
  const { marketData } = useLending();
  const [collateralAmount, setCollateralAmount] = useState<string>('150000');
  const [borrowAmount, setBorrowAmount] = useState<string>('500');
  const [testXpmPrice, setTestXpmPrice] = useState<string>(marketData.xpmPriceUSD.toFixed(4));

  const calculations = useMemo(() => {
    const collateral = parseFloat(collateralAmount) || 0;
    const borrowed = parseFloat(borrowAmount) || 0;
    const xpmPrice = parseFloat(testXpmPrice) || 0;
    const rlusdPrice = 1; // RLUSD is 1:1 USD

    if (collateral <= 0 || borrowed <= 0 || xpmPrice <= 0) {
      return null;
    }

    // Current values using USD for accurate dual-asset risk
    const collateralValueUSD = collateral * xpmPrice;
    const debtValueUSD = borrowed * rlusdPrice; // RLUSD is 1:1 USD
    const currentLTV = (debtValueUSD / collateralValueUSD) * 100;

    // Liquidation calculations (65% LTV threshold)
    const liquidationThreshold = 65;
    // Correct liquidation price: when LTV = 65%, what XPM price triggers liquidation?
    const liquidationPriceXPM = (debtValueUSD / collateral) * (100 / liquidationThreshold);
    const priceDropToLiquidation = ((xpmPrice - liquidationPriceXPM) / xpmPrice) * 100;

    // Safety margins using USD calculations
    const maxSafeBorrowUSD = collateralValueUSD * 0.5; // 50% max LTV in USD
    const maxSafeBorrow = maxSafeBorrowUSD / rlusdPrice; // Convert to RLUSD (1:1 USD)
    const availableBorrow = Math.max(0, maxSafeBorrow - borrowed);

    // Risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    let riskColor: 'success' | 'warning' | 'error';
    
    if (currentLTV >= liquidationThreshold) {
      riskLevel = 'critical';
      riskColor = 'error';
    } else if (currentLTV >= liquidationThreshold * 0.9) {
      riskLevel = 'high';
      riskColor = 'error';
    } else if (currentLTV >= liquidationThreshold * 0.75) {
      riskLevel = 'medium';
      riskColor = 'warning';
    } else {
      riskLevel = 'low';
      riskColor = 'success';
    }

    return {
      collateralValueUSD,
      debtValueUSD,
      currentLTV,
      liquidationPriceXPM,
      priceDropToLiquidation: Math.max(0, priceDropToLiquidation),
      maxSafeBorrow,
      availableBorrow,
      riskLevel,
      riskColor,
    };
  }, [collateralAmount, borrowAmount, testXpmPrice]);

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CalculateIcon color="primary" />
        <Typography variant="h5">
          Loan Risk Calculator
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        Calculate your liquidation risk and safety margins for any loan scenario.
      </Typography>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Loan Parameters
            </Typography>
            
            <TextField
              fullWidth
              label="Collateral Amount (XPM)"
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              margin="normal"
              size="small"
            />
            
            <TextField
              fullWidth
              label="Borrow Amount (RLUSD)"
              type="number"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              margin="normal"
              size="small"
            />
            
            <TextField
              fullWidth
              label="Test XPM Price (USD)"
              type="number"
              value={testXpmPrice}
              onChange={(e) => setTestXpmPrice(e.target.value)}
              margin="normal"
              size="small"
              inputProps={{ step: 0.0001 }}
              helperText={`Current: $${marketData.xpmPriceUSD.toFixed(4)}`}
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                RLUSD Price (Fixed): $1.00
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={8}>
          {calculations ? (
            <Box>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Current Position
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Collateral Value
                    </Typography>
                    <Typography variant="h6">
                      ${calculations.collateralValueUSD.toFixed(0)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Debt Value
                    </Typography>
                    <Typography variant="h6">
                      ${calculations.debtValueUSD.toFixed(0)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Current LTV
                    </Typography>
                    <Typography variant="h6" color={calculations.riskColor + '.main'}>
                      {calculations.currentLTV.toFixed(1)}%
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Risk Level
                    </Typography>
                    <Chip 
                      label={calculations.riskLevel.toUpperCase()} 
                      color={calculations.riskColor}
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    LTV Progress to Liquidation (65%)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((calculations.currentLTV / 65) * 100, 100)}
                    color={calculations.riskColor}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Paper>

              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🚨 Liquidation Analysis
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      XPM Liquidation Price
                    </Typography>
                    <Typography variant="h5" color="error.main">
                      ${calculations.liquidationPriceXPM.toFixed(4)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {calculations.priceDropToLiquidation.toFixed(1)}% drop from current price
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Safety Margin
                    </Typography>
                    <Typography variant="h5" color={calculations.priceDropToLiquidation > 20 ? 'success.main' : 'warning.main'}>
                      {calculations.priceDropToLiquidation.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Price buffer before liquidation
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  💰 Borrowing Capacity
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Max Safe Borrow (50% LTV)
                    </Typography>
                    <Typography variant="h6">
                      {calculations.maxSafeBorrow.toFixed(0)} RLUSD
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Additional Available
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {calculations.availableBorrow.toFixed(0)} RLUSD
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {calculations.currentLTV > 50 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>High LTV Warning:</strong> Your loan exceeds the recommended 50% LTV. 
                    Consider repaying {(parseFloat(borrowAmount) - calculations.maxSafeBorrow).toFixed(0)} RLUSD 
                    to reach a safer level.
                  </Typography>
                </Alert>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              Enter loan parameters to see risk analysis
            </Alert>
          )}
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Alert severity="warning">
        <Typography variant="body2">
          <strong>Critical Insight:</strong> XPM price changes directly affect your liquidation risk! 
          Since RLUSD is pegged 1:1 to USD, only XPM price movements impact your liquidation threshold, 
          providing more predictable risk management.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default LoanRiskCalculator;