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
  LinearProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrowRLUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';
import { LoanTermDays } from '../types/lending';
import { FINANCIAL_CONSTANTS } from '../config/demoConstants';

const SimpleLandingPage: React.FC = () => {
  const { createLoan, marketData } = useLending();
  const [collateralAmount, setCollateralAmount] = useState<string>('150000');
  const [selectedTerm, setSelectedTerm] = useState<LoanTermDays>(60);
  const [targetLTV, setTargetLTV] = useState<number>(40); // Default to 40% LTV
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const collateral = parseFloat(collateralAmount) || 0;
  const collateralValueUSD = collateral * marketData.xpmPriceUSD;
  const maxBorrowRLUSD = calculateMaxBorrowRLUSD(collateral, marketData.xpmPriceUSD, targetLTV);
  const borrowValueUSD = maxBorrowRLUSD; // RLUSD is 1:1 USD
  const liquidationPriceUSD = calculateLiquidationPriceUSD(maxBorrowRLUSD, collateral, FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV);
  const priceDropToLiquidation = collateral > 0 ? ((marketData.xpmPriceUSD - liquidationPriceUSD) / marketData.xpmPriceUSD) * 100 : 0;

  const handleCreateLoan = () => {
    if (collateral >= 1000 && collateral <= 10000000) {
      setConfirmDialog(true);
    }
  };

  const confirmCreateLoan = () => {
    createLoan({
      collateralAmount: collateral,
      borrowAmount: maxBorrowRLUSD,
      interestRate: FINANCIAL_CONSTANTS.INTEREST_RATES[selectedTerm],
      liquidationThreshold: FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV,
      termDays: selectedTerm,
    });
    setConfirmDialog(false);
    setSuccessMessage(`Loan created successfully! You received ${maxBorrowRLUSD.toFixed(0)} RLUSD for ${selectedTerm} days.`);
    setShowSuccess(true);
    // Reset form
    setCollateralAmount('150000');
  };

  const termOptions = [
    { days: 30 as LoanTermDays, label: '30 Days', rate: `${FINANCIAL_CONSTANTS.INTEREST_RATES[30]}%` },
    { days: 60 as LoanTermDays, label: '60 Days', rate: `${FINANCIAL_CONSTANTS.INTEREST_RATES[60]}%` }, 
    { days: 90 as LoanTermDays, label: '90 Days', rate: `${FINANCIAL_CONSTANTS.INTEREST_RATES[90]}%` }
  ];

  return (
    <Container maxWidth="md">
      {/* Demo Badge */}
      <Alert severity="info" sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          🚀 **DEMO MODE** - This is a simulation environment for testing. No real funds involved!
        </Typography>
      </Alert>

      {/* Simple Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Get Your First Loan in 30 Seconds
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, mb: 2 }}
        >
          Deposit XPM tokens → Instantly borrow RLUSD stablecoins
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
        >
          ✅ {FINANCIAL_CONSTANTS.INTEREST_RATES[90]}-{FINANCIAL_CONSTANTS.INTEREST_RATES[30]}% APR  •  ✅ Up to {FINANCIAL_CONSTANTS.LTV_LIMITS.MAX_LTV}% LTV  •  ✅ No KYC Required  •  ✅ Instant Settlement
        </Typography>
      </Box>

      {/* Main Loan Calculator */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Input Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              💰 Step 1: Choose Your Collateral
            </Typography>
            
            <TextField
              fullWidth
              label="XPM Amount"
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ min: 1000, step: 1000 }}
              helperText={
                collateral < 1000 
                  ? "⚠️ Minimum 1,000 XPM required" 
                  : collateral > 10000000 
                    ? "⚠️ Maximum 10,000,000 XPM allowed"
                    : `💵 Worth $${collateralValueUSD.toFixed(0)} USD at $${marketData.xpmPriceUSD.toFixed(4)} per XPM`
              }
              error={collateral > 0 && (collateral < 1000 || collateral > 10000000)}
            />

            {/* Quick Amount Buttons */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quick amounts:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {[100000, 250000, 500000, 1000000].map((amount) => (
                <Button
                  key={amount}
                  variant={collateral === amount ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setCollateralAmount(amount.toString())}
                  sx={{ 
                    minWidth: { xs: 60, sm: 'auto' },
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  {amount >= 1000000 ? `${amount / 1000000}M` : `${amount / 1000}K`}
                </Button>
              ))}
            </Box>

            {/* Loan Term Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'primary.main' }}>
              ⏰ Step 2: Pick Your Loan Term
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <RadioGroup
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(Number(e.target.value) as LoanTermDays)}
                row={false}
                sx={{
                  '& .MuiFormControlLabel-root': {
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    mr: 0,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }
                }}
              >
                {termOptions.map((option) => (
                  <FormControlLabel
                    key={option.days}
                    value={option.days}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{option.label}</Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                          {option.rate} APR
                        </Typography>
                      </Box>
                    }
                    sx={{ width: '100%' }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* LTV Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 3 }}>
              💹 Choose Your Loan Amount (LTV)
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Loan-to-Value ratio: {targetLTV}%
              </Typography>
              <Slider
                value={targetLTV}
                onChange={(_, value: number | number[]) => setTargetLTV(value as number)}
                min={FINANCIAL_CONSTANTS.LTV_LIMITS.MIN_LTV}
                max={FINANCIAL_CONSTANTS.LTV_LIMITS.MAX_LTV}
                step={5}
                marks={[
                  { value: 20, label: '20%' },
                  { value: 30, label: '30%' },
                  { value: 40, label: '40%' },
                  { value: 50, label: '50%' }
                ]}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Lower LTV = Safer loan with more price drop protection
              </Typography>
            </Box>

            {collateral > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Loan Health ({targetLTV}% LTV)
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(targetLTV / FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV) * 100}
                  color={targetLTV < 40 ? "success" : targetLTV < 55 ? "warning" : "error"}
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
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>
                  🎉 Step 3: Your Loan Preview
                </Typography>
                
                {/* Main Result Card */}
                <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    💵 You'll Instantly Receive:
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    {maxBorrowRLUSD.toFixed(0)}
                  </Typography>
                  <Typography variant="h6">
                    RLUSD ≈ ${borrowValueUSD.toFixed(0)} USD
                  </Typography>
                </Paper>

                {/* Loan Details */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                    📋 Loan Details:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Term:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedTerm} days</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Interest:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {(maxBorrowRLUSD * (FINANCIAL_CONSTANTS.INTEREST_RATES[selectedTerm] / 100) * selectedTerm / 365).toFixed(0)} RLUSD
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">⚠️ Liquidation Price:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: priceDropToLiquidation < 20 ? 'warning.main' : 'text.primary' }}>
                        ${liquidationPriceUSD.toFixed(4)} ({priceDropToLiquidation.toFixed(0)}% buffer)
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCreateLoan}
                  sx={{ 
                    py: 2,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    bgcolor: 'success.main',
                    '&:hover': {
                      bgcolor: 'success.dark'
                    },
                    borderRadius: 3,
                    textTransform: 'none'
                  }}
                  disabled={collateral < 1000 || collateral > 10000000}
                >
                  🚀 Get My Loan Now
                </Button>
                
                {(collateral < 1000 || collateral > 10000000) && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {collateral < 1000 ? "Need at least 1,000 XPM to proceed" : "Maximum 10M XPM allowed"}
                  </Alert>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4, p: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ opacity: 0.7 }}>
                  👆
                </Typography>
                <Typography variant="h6">
                  Enter your collateral amount to see instant loan preview
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  See exactly how much RLUSD you'll receive and all loan terms
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
            <Typography variant="h6" color="primary.main">
              {FINANCIAL_CONSTANTS.INTEREST_RATES[selectedTerm]}%
            </Typography>
            <Typography variant="body2">Annual Interest Rate</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {FINANCIAL_CONSTANTS.LTV_LIMITS.MAX_LTV}%
            </Typography>
            <Typography variant="body2">Maximum LTV Ratio</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {FINANCIAL_CONSTANTS.LIQUIDATION_FEE}%
            </Typography>
            <Typography variant="body2">Liquidation Fee</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Risk Warning */}
      <Alert severity="warning" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Your loan will be liquidated if XPM price falls too much. 
          Since RLUSD is stable at $1, only XPM price affects your loan health. Monitor your position regularly.
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
                Receive RLUSD instantly at {FINANCIAL_CONSTANTS.INTEREST_RATES[90]}-{FINANCIAL_CONSTANTS.INTEREST_RATES[30]}% APR
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            🎯 Final Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              You're about to receive {maxBorrowRLUSD.toFixed(0)} RLUSD instantly!
            </Typography>
          </Alert>

          <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              📋 Loan Summary:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Collateral:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {collateral.toLocaleString()} XPM
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ≈ ${collateralValueUSD.toFixed(0)} USD
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">You Receive:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {maxBorrowRLUSD.toFixed(0)} RLUSD
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ≈ ${borrowValueUSD.toFixed(0)} USD
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Term:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedTerm} days</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Interest:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {(maxBorrowRLUSD * (FINANCIAL_CONSTANTS.INTEREST_RATES[selectedTerm] / 100) * selectedTerm / 365).toFixed(0)} RLUSD
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>⚠️ Important:</strong> Your collateral will be liquidated if XPM price drops to ${liquidationPriceUSD.toFixed(4)} or below.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setConfirmDialog(false)} size="large" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={confirmCreateLoan} 
            variant="contained" 
            size="large"
            sx={{ 
              py: 1.5, 
              px: 4, 
              fontSize: '1.1rem',
              fontWeight: 600,
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' }
            }}
          >
            ✅ Yes, Create My Loan!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SimpleLandingPage;