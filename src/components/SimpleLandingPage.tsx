import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  LinearProgress,
  FormControl,
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
import {
  Assignment as DetailsIcon,
  Warning as WarningIcon,
  GpsFixed as TargetIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import SmartTooltip from './SmartTooltip';
import StepIndicator from './StepIndicator';
import ProgressCelebration from './ProgressCelebration';
import { calculateMaxBorrowRLUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';
import { LoanTermDays } from '../types/lending';
import { FINANCIAL_CONSTANTS } from '../config/demoConstants';

const SimpleLandingPage: React.FC = () => {
  const { createLoan, marketData, walletBalances } = useLending();
  const [collateralPercentage, setCollateralPercentage] = useState<number>(7.5); // 7.5% = 150,000 XPM out of 2M
  const [selectedTerm, setSelectedTerm] = useState<LoanTermDays>(60);
  const [targetLTV, setTargetLTV] = useState<number>(40);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Enter Collateral', 'Choose Terms', 'Review Risk', 'Confirm Loan'];
  const [completedSteps, setCompletedSteps] = useState([false, false, false, false]);
  
  const collateral = Math.floor((collateralPercentage / 100) * walletBalances.xpm);
  const collateralValueUSD = collateral * marketData.xpmPriceUSD;
  const maxBorrowRLUSD = calculateMaxBorrowRLUSD(collateral, marketData.xpmPriceUSD, targetLTV);
  const borrowValueUSD = maxBorrowRLUSD;
  const liquidationPriceUSD = calculateLiquidationPriceUSD(maxBorrowRLUSD, collateral, FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV);
  const priceDropToLiquidation = collateral > 0 ? ((marketData.xpmPriceUSD - liquidationPriceUSD) / marketData.xpmPriceUSD) * 100 : 0;
  
  useEffect(() => {
    const newCompleted = [...completedSteps];
    newCompleted[0] = collateral >= 1000;
    newCompleted[1] = selectedTerm > 0;
    newCompleted[2] = targetLTV > 0;
    newCompleted[3] = newCompleted[0] && newCompleted[1] && newCompleted[2];
    setCompletedSteps(newCompleted);
    
    if (newCompleted[3]) setCurrentStep(3);
    else if (newCompleted[2]) setCurrentStep(2);
    else if (newCompleted[1]) setCurrentStep(1);
    else if (newCompleted[0]) setCurrentStep(1);
    else setCurrentStep(0);
  }, [collateral, selectedTerm, targetLTV]);

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
    setCollateralAmount('150000');
  };

  const termOptions = [
    { days: 30 as LoanTermDays, label: '30 Days', rate: `${FINANCIAL_CONSTANTS.INTEREST_RATES[30]}%` },
    { days: 60 as LoanTermDays, label: '60 Days', rate: `${FINANCIAL_CONSTANTS.INTEREST_RATES[60]}%` }, 
    { days: 90 as LoanTermDays, label: '90 Days', rate: `${FINANCIAL_CONSTANTS.INTEREST_RATES[90]}%` }
  ];

  return (
    <Container maxWidth="md">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            mb: 2
          }}
        >
          Borrow RLUSD
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, mb: 3 }}
        >
          Use your XPM as collateral to instantly borrow stablecoins
        </Typography>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          justifyContent: 'center',
          fontSize: '1rem',
          color: 'text.secondary'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4caf50' }}></div>
            {FINANCIAL_CONSTANTS.INTEREST_RATES[90]}-{FINANCIAL_CONSTANTS.INTEREST_RATES[30]}% APR
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4caf50' }}></div>
            Up to {FINANCIAL_CONSTANTS.LTV_LIMITS.MAX_LTV}% LTV
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4caf50' }}></div>
            Instant Settlement
          </div>
        </div>
      </div>

      <StepIndicator 
        currentStep={currentStep}
        steps={steps}
        completedSteps={completedSteps}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Paper 
          elevation={currentStep === 0 ? 4 : 2} 
          sx={{ 
            p: 4, 
            mb: 3, 
            borderRadius: 3, 
            bgcolor: currentStep === 0 ? 'primary.light' : 'background.paper',
            border: currentStep === 0 ? '2px solid' : '1px solid',
            borderColor: currentStep === 0 ? 'primary.main' : 'divider',
            transition: 'all 0.3s ease',
            opacity: completedSteps[0] && currentStep > 0 ? 0.8 : 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: completedSteps[0] ? '#4caf50' : '#1976d2',
              color: 'white',
              marginRight: '16px',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {completedSteps[0] ? '✓' : '1'}
            </div>
            <div>
              <Typography variant="h5" sx={{ fontWeight: 700, color: completedSteps[0] ? 'success.main' : 'primary.main' }}>
                Enter Your Collateral
              </Typography>
              <Typography variant="body2" color="text.secondary">
                How much XPM do you want to use as collateral?
              </Typography>
            </div>
          </div>
            
          <div style={{ marginBottom: '32px' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select percentage of your balance: {collateralPercentage.toFixed(1)}%
            </Typography>
            <Slider
              value={collateralPercentage}
              onChange={(event, value: number | number[]) => setCollateralPercentage(value as number)}
              min={0}
              max={100}
              step={0.1}
              marks={[
                { value: 0, label: '0%' },
                { value: 25, label: '25%' },
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' }
              ]}
              sx={{ 
                mb: 2,
                '& .MuiSlider-mark': {
                  backgroundColor: 'primary.main',
                  height: 8,
                  width: 2,
                },
                '& .MuiSlider-markLabel': {
                  fontSize: '0.875rem',
                }
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" color="primary">
                {collateral.toLocaleString()} XPM
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Worth ${collateralValueUSD.toFixed(0)} USD
              </Typography>
            </div>
            <Typography variant="caption" color="text.secondary">
              Available balance: {walletBalances.xpm.toLocaleString()} XPM
            </Typography>
            {collateral > 0 && collateral < 1000 && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                Minimum 1,000 XPM required
              </Typography>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[10, 25, 50, 75, 100].map((percentage) => (
              <Button
                key={percentage}
                variant={Math.abs(collateralPercentage - percentage) < 0.1 ? "contained" : "outlined"}
                size="small"
                onClick={() => setCollateralPercentage(percentage)}
                sx={{ 
                  minWidth: { xs: 50, sm: 'auto' },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 }
                }}
              >
                {percentage}%
              </Button>
            ))}
          </div>
        </Paper>

        <Paper 
          elevation={currentStep === 1 ? 4 : 2} 
          sx={{ 
            p: 4, 
            mb: 3, 
            borderRadius: 3, 
            bgcolor: currentStep === 1 ? 'primary.light' : 'background.paper',
            border: currentStep === 1 ? '2px solid' : '1px solid',
            borderColor: currentStep === 1 ? 'primary.main' : 'divider',
            transition: 'all 0.3s ease',
            opacity: completedSteps[1] && currentStep > 1 ? 0.8 : 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: completedSteps[1] ? '#4caf50' : '#1976d2',
              color: 'white',
              marginRight: '16px',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {completedSteps[1] ? '✓' : '2'}
            </div>
            <div>
              <Typography variant="h5" sx={{ fontWeight: 700, color: completedSteps[1] ? 'success.main' : 'primary.main' }}>
                Choose Your Loan Term
              </Typography>
              <Typography variant="body2" color="text.secondary">
                How long do you want to borrow for?
              </Typography>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {termOptions.map((option) => (
              <Button
                key={option.days}
                variant={selectedTerm === option.days ? "contained" : "outlined"}
                onClick={() => setSelectedTerm(option.days)}
                sx={{
                  flex: { xs: '1 1 calc(33.333% - 5.33px)', sm: '1 1 auto' },
                  minWidth: { xs: 0, sm: 120 },
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 1, sm: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {option.label}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 700, 
                    mt: 0.5,
                    color: selectedTerm === option.days ? 'primary.contrastText' : 'primary.main'
                  }}
                >
                  {option.rate} APR
                </Typography>
              </Button>
            ))}
          </div>
        </Paper>

        <Paper 
          elevation={currentStep === 2 ? 4 : 2} 
          sx={{ 
            p: 4, 
            mb: 3, 
            borderRadius: 3, 
            bgcolor: currentStep === 2 ? 'primary.light' : 'background.paper',
            border: currentStep === 2 ? '2px solid' : '1px solid',
            borderColor: currentStep === 2 ? 'primary.main' : 'divider',
            transition: 'all 0.3s ease',
            opacity: completedSteps[2] && currentStep > 2 ? 0.8 : 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: completedSteps[2] ? '#4caf50' : '#1976d2',
              color: 'white',
              marginRight: '16px',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {completedSteps[2] ? '✓' : '3'}
            </div>
            <div>
              <Typography variant="h5" sx={{ fontWeight: 700, color: completedSteps[2] ? 'success.main' : 'primary.main' }}>
                Set Your Loan Amount
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose how much you want to borrow (LTV ratio)
              </Typography>
            </div>
            <SmartTooltip 
              helpText="LTV (Loan-to-Value) ratio determines how much you can borrow. Lower LTV is safer but gives you less cash. Higher LTV gives more cash but increases liquidation risk."
              placement="top"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Loan-to-Value ratio: {targetLTV}%
            </Typography>
            <Slider
              value={targetLTV}
              onChange={(event, value: number | number[]) => setTargetLTV(value as number)}
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
          </div>

          {collateral > 0 && (
            <div>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Loan Health ({targetLTV}% LTV)
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(targetLTV / FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV) * 100}
                color={targetLTV < 40 ? "success" : targetLTV <= 50 ? "warning" : "error"}
                sx={{ height: 8, borderRadius: 1, mb: 1 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Typography variant="caption" color={targetLTV < 40 ? "success.main" : targetLTV <= 50 ? "warning.main" : "error.main"} sx={{ fontWeight: 600 }}>
                  {targetLTV < 40 ? "✓ Safe Zone" : targetLTV <= 50 ? "⚠ Monitor Closely" : "⚠ Near Liquidation"} • {priceDropToLiquidation.toFixed(0)}% price drop buffer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Liquidation at ${liquidationPriceUSD.toFixed(4)} XPM price
                </Typography>
              </div>
            </div>
          )}
        </Paper>

        {completedSteps[3] && collateral > 0 && (
          <ProgressCelebration
            borrowAmount={maxBorrowRLUSD}
            onConfirm={handleCreateLoan}
            isLoading={false}
          />
        )}
      </div>

      <Alert severity="warning" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Your loan will be liquidated if XPM price falls too much. 
          Since RLUSD is stable at $1, only XPM price affects your loan health. Monitor your position regularly.
        </Typography>
      </Alert>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <div style={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main">1</Typography>
              <Typography variant="body2">
                Deposit XPM tokens as collateral
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={4}>
            <div style={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main">2</Typography>
              <Typography variant="body2">
                Receive RLUSD instantly at {FINANCIAL_CONSTANTS.INTEREST_RATES[90]}-{FINANCIAL_CONSTANTS.INTEREST_RATES[30]}% APR
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={4}>
            <div style={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main">3</Typography>
              <Typography variant="body2">
                Repay anytime to get collateral back
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Paper>

      <Dialog 
        open={confirmDialog} 
        onClose={() => setConfirmDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 3 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TargetIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Final Confirmation
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              You're about to receive {maxBorrowRLUSD.toFixed(0)} RLUSD instantly!
            </Typography>
          </Alert>

          <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <DetailsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Loan Summary:
              </Typography>
            </div>
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
          
          <Paper 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'error.dark',
              color: 'error.contrastText',
              border: '1px solid',
              borderColor: 'error.main'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <WarningIcon sx={{ mr: 1, mt: 0.1, fontSize: 16, color: 'error.contrastText' }} />
              <Typography variant="body2" sx={{ color: 'error.contrastText' }}>
                <strong>Important:</strong> Your collateral will be liquidated if XPM price drops to ${liquidationPriceUSD.toFixed(4)} or below.
              </Typography>
            </div>
          </Paper>
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
            startIcon={<CheckIcon />}
          >
            Yes, Create My Loan!
          </Button>
        </DialogActions>
      </Dialog>

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