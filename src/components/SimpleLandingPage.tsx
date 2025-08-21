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
import {
  AccountBalanceWallet as CollateralIcon,
  AccessTime as ScheduleIcon,
  TrendingUp as LTVIcon,
  Celebration as CelebrationIcon,
  MonetizationOn as MoneyIcon,
  Assignment as DetailsIcon,
  Warning as WarningIcon,
  RocketLaunch as LaunchIcon,
  TouchApp as PointerIcon,
  GpsFixed as TargetIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import SmartTooltip from './SmartTooltip';
import StepIndicator from './StepIndicator';
import RiskMeterEnhanced from './RiskMeterEnhanced';
import ProgressCelebration from './ProgressCelebration';
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
  
  // REDESIGN: Step progression state for improved UX
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Enter Collateral', 'Choose Terms', 'Review Risk', 'Confirm Loan'];
  const [completedSteps, setCompletedSteps] = useState([false, false, false, false]);
  
  const collateral = parseFloat(collateralAmount) || 0;
  const collateralValueUSD = collateral * marketData.xpmPriceUSD;
  const maxBorrowRLUSD = calculateMaxBorrowRLUSD(collateral, marketData.xpmPriceUSD, targetLTV);
  const borrowValueUSD = maxBorrowRLUSD; // RLUSD is 1:1 USD
  const liquidationPriceUSD = calculateLiquidationPriceUSD(maxBorrowRLUSD, collateral, FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV);
  const priceDropToLiquidation = collateral > 0 ? ((marketData.xpmPriceUSD - liquidationPriceUSD) / marketData.xpmPriceUSD) * 100 : 0;
  
  // REDESIGN: Auto-advance step progression based on user input
  React.useEffect(() => {
    const newCompleted = [...completedSteps];
    newCompleted[0] = collateral >= 1000; // Step 1: Valid collateral
    newCompleted[1] = selectedTerm > 0; // Step 2: Term selected
    newCompleted[2] = targetLTV > 0; // Step 3: LTV set
    newCompleted[3] = newCompleted[0] && newCompleted[1] && newCompleted[2]; // Step 4: All ready
    setCompletedSteps(newCompleted);
    
    // Auto-advance current step
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
    // Reset form
    setCollateralAmount('150000');
  };

  const termOptions = [
    { days: 30 as LoanTermDays, label: '30 Days', rate: `${FINANCIAL_CONSTANTS.INTEREST_RATES[30]}%` },
    { days: 60 as LoanTermDays, label: '60 Days', rate: `${FINANCIAL_CONSTANTS.INTEREST_RATES[60]}%` }, 
    { days: 90 as LoanTermDays, label: '90 Days', rate: `${FINANCIAL_CONSTANTS.INTEREST_RATES[90]}%` }
  ];

  return (
    <Container maxWidth="md">{/* Demo mode hidden for production UI */}

      {/* Simplified Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
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
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: { xs: 1, sm: 3 }, 
          justifyContent: 'center',
          fontSize: { xs: '0.875rem', sm: '1rem' },
          color: 'text.secondary'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
            {FINANCIAL_CONSTANTS.INTEREST_RATES[90]}-{FINANCIAL_CONSTANTS.INTEREST_RATES[30]}% APR
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
            Up to {FINANCIAL_CONSTANTS.LTV_LIMITS.MAX_LTV}% LTV
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
            Instant Settlement
          </Box>
        </Box>
      </Box>

      {/* REDESIGN: Step Indicator for Clear Progression */}
      <StepIndicator 
        currentStep={currentStep}
        steps={steps}
        completedSteps={completedSteps}
      />

      {/* REDESIGN: Single Column Layout for Better Focus */}
      <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
        
        {/* STEP 1: COLLATERAL INPUT CARD - REDESIGNED */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              bgcolor: completedSteps[0] ? 'success.main' : 'primary.main',
              color: 'white',
              mr: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {completedSteps[0] ? '✓' : '1'}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: completedSteps[0] ? 'success.main' : 'primary.main' }}>
                Enter Your Collateral
              </Typography>
              <Typography variant="body2" color="text.secondary">
                How much XPM do you want to use as collateral?
              </Typography>
            </Box>
          </Box>
            
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
                  ? "Minimum 1,000 XPM required" 
                  : collateral > 10000000 
                    ? "Maximum 10,000,000 XPM allowed"
                    : `Worth $${collateralValueUSD.toFixed(0)} USD at $${marketData.xpmPriceUSD.toFixed(4)} per XPM`
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
        </Paper>

        {/* STEP 2: LOAN TERM SELECTION CARD - REDESIGNED */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              bgcolor: completedSteps[1] ? 'success.main' : 'primary.main',
              color: 'white',
              mr: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {completedSteps[1] ? '✓' : '2'}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: completedSteps[1] ? 'success.main' : 'primary.main' }}>
                Choose Your Loan Term
              </Typography>
              <Typography variant="body2" color="text.secondary">
                How long do you want to borrow for?
              </Typography>
            </Box>
          </Box>

          <FormControl component="fieldset" sx={{ width: '100%' }}>
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
        </Paper>

        {/* STEP 3: LTV SELECTION CARD - REDESIGNED */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              bgcolor: completedSteps[2] ? 'success.main' : 'primary.main',
              color: 'white',
              mr: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {completedSteps[2] ? '✓' : '3'}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: completedSteps[2] ? 'success.main' : 'primary.main' }}>
                Set Your Loan Amount
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose how much you want to borrow (LTV ratio)
              </Typography>
            </Box>
            <SmartTooltip 
              helpText="LTV (Loan-to-Value) ratio determines how much you can borrow. Lower LTV is safer but gives you less cash. Higher LTV gives more cash but increases liquidation risk."
              placement="top"
            />
          </Box>

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
                  color={targetLTV < 40 ? "success" : targetLTV <= 50 ? "warning" : "error"}
                  sx={{ height: 8, borderRadius: 1, mb: 1 }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" color={targetLTV < 40 ? "success.main" : targetLTV <= 50 ? "warning.main" : "error.main"} sx={{ fontWeight: 600 }}>
                    {targetLTV < 40 ? "✓ Safe Zone" : targetLTV <= 50 ? "⚠ Monitor Closely" : "⚠ Near Liquidation"} • {priceDropToLiquidation.toFixed(0)}% price drop buffer
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Liquidation at ${liquidationPriceUSD.toFixed(4)} XPM price
                  </Typography>
                </Box>
              </Box>
            )}
        </Paper>

        {/* REMOVED: Overpowering RiskMeterEnhanced - merged into Step 3 loan health section */

        {/* STEP 4: LOAN CONFIRMATION - REDESIGNED */}
        {completedSteps[3] && collateral > 0 && (
          <ProgressCelebration
            borrowAmount={maxBorrowRLUSD}
            onConfirm={handleCreateLoan}
            isLoading={false}
          />
        )}

        {/* CLOSE MAIN CONTAINER */}
      </Box>

      {/* REMOVED: Redundant key information cards - info already shown in step flow above */}

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

      {/* Confirmation Dialog - Mobile Optimized */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TargetIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Final Confirmation
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              You're about to receive {maxBorrowRLUSD.toFixed(0)} RLUSD instantly!
            </Typography>
          </Alert>

          <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DetailsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Loan Summary:
              </Typography>
            </Box>
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
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <WarningIcon color="warning" sx={{ mr: 1, mt: 0.1, fontSize: 16 }} />
              <Typography variant="body2">
                <strong>Important:</strong> Your collateral will be liquidated if XPM price drops to ${liquidationPriceUSD.toFixed(4)} or below.
              </Typography>
            </Box>
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
            startIcon={<CheckIcon />}
          >
            Yes, Create My Loan!
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