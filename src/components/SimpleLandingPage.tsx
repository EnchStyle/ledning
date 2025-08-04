import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
  LinearProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
} from '@mui/material';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrowUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';

const SimpleLandingPage: React.FC = () => {
  const { createLoan, marketData } = useLending();
  const [collateralAmount, setCollateralAmount] = useState<string>('150000');
  const [selectedTerm, setSelectedTerm] = useState<number>(60);
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  
  const collateral = parseFloat(collateralAmount) || 0;
  const collateralValueUSD = collateral * marketData.xpmPriceUSD;
  const maxBorrowXRP = calculateMaxBorrowUSD(collateral, marketData.xpmPriceUSD, marketData.xrpPriceUSD, 50);
  const borrowValueUSD = maxBorrowXRP * marketData.xrpPriceUSD;
  const liquidationPriceUSD = calculateLiquidationPriceUSD(maxBorrowXRP, collateral, marketData.xrpPriceUSD, 65);
  const priceDropToLiquidation = collateral > 0 ? ((marketData.xpmPriceUSD - liquidationPriceUSD) / marketData.xpmPriceUSD) * 100 : 0;

  const handleCreateLoan = () => {
    if (collateral > 0) {
      createLoan({
        collateralAmount: collateral,
        borrowAmount: maxBorrowXRP,
        interestRate: 15,
        liquidationThreshold: 65,
        termDays: selectedTerm,
        autoRenew: autoRenew,
      });
    }
  };

  const termOptions = [
    { days: 30, label: '30 Days', rate: '14%' },
    { days: 60, label: '60 Days', rate: '15%' }, 
    { days: 90, label: '90 Days', rate: '16%' }
  ];

  return (
    <Container maxWidth="md">
      {/* Simple Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
          Borrow XRP with XPM Collateral
        </Typography>
        <Typography variant="h6" color="text.secondary">
          15% APR • Up to 50% LTV • Instant loans
        </Typography>
      </Box>

      {/* Main Loan Calculator */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Input Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              How much XPM do you want to use as collateral?
            </Typography>
            
            <TextField
              fullWidth
              label="XPM Amount"
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              sx={{ mb: 3 }}
              inputProps={{ min: 0, step: 1000 }}
              helperText={`Worth $${collateralValueUSD.toFixed(0)} USD at current price`}
            />

            {/* Loan Term Selection */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Loan Term</FormLabel>
              <RadioGroup
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(Number(e.target.value))}
                row
              >
                {termOptions.map((option) => (
                  <FormControlLabel
                    key={option.days}
                    value={option.days}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.rate} APR
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* Auto-renewal option */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Auto-renew loan</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatically extend if healthy (LTV &lt; 40%)
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {collateral > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Loan Health (50% LTV target)
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={76.9} // 50% of 65% liquidation threshold
                  color="success"
                  sx={{ height: 8, borderRadius: 1, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Safe • {priceDropToLiquidation.toFixed(0)}% price drop buffer
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Output Section */}
          <Grid item xs={12} md={6}>
            {collateral > 0 ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  You'll receive
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h3" color="primary.main" sx={{ fontWeight: 600 }}>
                    {maxBorrowXRP.toFixed(0)}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    XRP (≈ ${borrowValueUSD.toFixed(0)} USD)
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Term: {selectedTerm} days {autoRenew && '(auto-renew enabled)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total interest: ~{(maxBorrowXRP * (selectedTerm === 30 ? 0.14 : selectedTerm === 60 ? 0.15 : 0.16) * selectedTerm / 365).toFixed(2)} XRP
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Liquidation if XPM drops to: ${liquidationPriceUSD.toFixed(4)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCreateLoan}
                  sx={{ py: 1.5 }}
                >
                  Create Loan
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                <Typography variant="h6">
                  Enter collateral amount to see loan details
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Key Information */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">15%</Typography>
            <Typography variant="body2">Annual Interest Rate</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">50%</Typography>
            <Typography variant="body2">Maximum LTV Ratio</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">10%</Typography>
            <Typography variant="body2">Liquidation Fee</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Risk Warning */}
      <Alert severity="warning" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Your loan will be liquidated if XPM price falls too much or XRP price rises significantly. 
          Both asset prices affect your loan health. Monitor your position regularly.
        </Typography>
      </Alert>

      {/* How It Works */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main">1</Typography>
              <Typography variant="body2">
                Deposit XPM tokens as collateral
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main">2</Typography>
              <Typography variant="body2">
                Receive XRP instantly at 15% APR
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main">3</Typography>
              <Typography variant="body2">
                Repay anytime to get collateral back
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SimpleLandingPage;