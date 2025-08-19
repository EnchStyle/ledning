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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrowRLUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';
import { LoanTermDays } from '../types/lending';

const SimpleLandingPage: React.FC = () => {
  const { createLoan, marketData } = useLending();
  const [collateralAmount, setCollateralAmount] = useState<string>('150000');
  const [selectedTerm, setSelectedTerm] = useState<LoanTermDays>(60);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const collateral = parseFloat(collateralAmount) || 0;
  const collateralValueUSD = collateral * marketData.xpmPriceUSD;
  const maxBorrowRLUSD = calculateMaxBorrowRLUSD(collateral, marketData.xpmPriceUSD, 50);
  const borrowValueUSD = maxBorrowRLUSD; // RLUSD is 1:1 USD
  const liquidationPriceUSD = calculateLiquidationPriceUSD(maxBorrowRLUSD, collateral, 65);
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
      interestRate: selectedTerm === 30 ? 14 : selectedTerm === 60 ? 15 : 16,
      liquidationThreshold: 65,
      termDays: selectedTerm,
    });
    setConfirmDialog(false);
    setSuccessMessage(`Loan created successfully! You received ${maxBorrowRLUSD.toFixed(0)} RLUSD for ${selectedTerm} days.`);
    setShowSuccess(true);
    // Reset form
    setCollateralAmount('150000');
  };

  const termOptions = [
    { days: 30, label: '30 Days', rate: '19%' },
    { days: 60, label: '60 Days', rate: '16%' }, 
    { days: 90, label: '90 Days', rate: '15%' }
  ];

  return (
    <Container maxWidth="md">
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
          Borrow RLUSD with XPM Collateral
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          15% APR • Up to 50% LTV • Instant loans
        </Typography>
      </Box>

      {/* Main Loan Calculator */}
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
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
              inputProps={{ min: 1000, step: 1000 }}
              helperText={
                collateral < 1000 
                  ? "Minimum 1,000 XPM required" 
                  : collateral > 10000000 
                    ? "Maximum 10,000,000 XPM allowed"
                    : `Worth $${collateralValueUSD.toFixed(0)} USD at current price`
              }
              error={collateral > 0 && (collateral < 1000 || collateral > 10000000)}
            />

            {/* Loan Term Selection */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Loan Term</FormLabel>
              <RadioGroup
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(Number(e.target.value) as LoanTermDays)}
                row={false}
                sx={{
                  '& .MuiFormControlLabel-root': {
                    mb: 1
                  }
                }}
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
                    {maxBorrowRLUSD.toFixed(0)}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    RLUSD (=${borrowValueUSD.toFixed(0)} USD)
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Term: {selectedTerm} days
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total interest: ~{(maxBorrowRLUSD * (selectedTerm === 30 ? 0.14 : selectedTerm === 60 ? 0.15 : 0.16) * selectedTerm / 365).toFixed(2)} RLUSD
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
                  sx={{ 
                    py: 1.5,
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    fontWeight: 600
                  }}
                  disabled={collateral < 1000 || collateral > 10000000}
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
                Receive RLUSD instantly at 15% APR
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
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Loan Creation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Loan Summary:</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Collateral: {collateral.toLocaleString()} XPM (${collateralValueUSD.toFixed(0)} USD)
            </Typography>
            <Typography variant="body2" gutterBottom>
              • You'll receive: {maxBorrowRLUSD.toFixed(0)} RLUSD (${borrowValueUSD.toFixed(0)} USD)
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Term: {selectedTerm} days ({selectedTerm === 30 ? '19%' : selectedTerm === 60 ? '16%' : '15%'} APR)
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Liquidation if XPM drops to: ${liquidationPriceUSD.toFixed(4)}
            </Typography>
            
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                By confirming, you agree to deposit the collateral and receive the RLUSD loan. 
                Fixed interest is calculated upfront for the full term.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancel
          </Button>
          <Button onClick={confirmCreateLoan} variant="contained" size="large">
            Confirm & Create Loan
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