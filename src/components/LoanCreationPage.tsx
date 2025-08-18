import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  LinearProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Help as HelpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrowRLUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';
import { LoanTermDays } from '../types/lending';

interface LoanParameters {
  collateralAmount: number;
  targetLTV: number;
  termDays: LoanTermDays;
}

const LoanCreationPage: React.FC = () => {
  const { createLoan, marketData } = useLending();
  const [activeStep, setActiveStep] = useState(0);
  const [parameters, setParameters] = useState<LoanParameters>({
    collateralAmount: 150000,
    targetLTV: 40,
    termDays: 60,
  });
  const [showAdvancedRisk, setShowAdvancedRisk] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToRisks, setAgreedToRisks] = useState(false);
  const [isCreatingLoan, setIsCreatingLoan] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Demo wallet balance (2M XPM)
  const walletBalance = 2000000;

  // Calculations
  const collateralValueUSD = parameters.collateralAmount * marketData.xpmPriceUSD;
  const maxBorrowRLUSD = calculateMaxBorrowRLUSD(parameters.collateralAmount, marketData.xpmPriceUSD, 50);
  const targetBorrowAmount = Math.min(maxBorrowRLUSD, (collateralValueUSD * parameters.targetLTV) / 100);
  const actualLTV = collateralValueUSD > 0 ? (targetBorrowAmount / collateralValueUSD) * 100 : 0;
  const liquidationPrice = calculateLiquidationPriceUSD(targetBorrowAmount, parameters.collateralAmount, 65);
  const priceDropBuffer = ((marketData.xpmPriceUSD - liquidationPrice) / marketData.xpmPriceUSD) * 100;
  
  const interestRate = parameters.termDays === 30 ? 14 : parameters.termDays === 60 ? 15 : 16;
  const totalInterest = targetBorrowAmount * (interestRate / 100) * (parameters.termDays / 365);
  const totalRepayment = targetBorrowAmount + totalInterest;

  // Risk assessment
  const getRiskLevel = (ltv: number) => {
    if (ltv < 30) return { level: 'Conservative', color: 'success', description: 'Very safe position' };
    if (ltv < 45) return { level: 'Moderate', color: 'warning', description: 'Balanced risk/reward' };
    return { level: 'Aggressive', color: 'error', description: 'Higher liquidation risk' };
  };

  const riskAssessment = getRiskLevel(actualLTV);

  const steps = [
    {
      label: 'Set Collateral',
      description: 'Choose how much XPM to deposit',
    },
    {
      label: 'Configure Loan',
      description: 'Set loan parameters and term',
    },
    {
      label: 'Review & Confirm',
      description: 'Final review and risk acknowledgment',
    },
  ];

  const handleNext = () => {
    if (activeStep === 0 && parameters.collateralAmount < 1000) return;
    if (activeStep === 0 && parameters.collateralAmount > walletBalance) return;
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      setConfirmationOpen(true);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCreateLoan = async () => {
    if (!agreedToTerms || !agreedToRisks) return;

    setIsCreatingLoan(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      createLoan({
        collateralAmount: parameters.collateralAmount,
        borrowAmount: targetBorrowAmount,
        interestRate: interestRate,
        liquidationThreshold: 65,
        termDays: parameters.termDays,
      });

      setConfirmationOpen(false);
      setShowSuccessMessage(true);
      
      // Reset form after success
      setTimeout(() => {
        setActiveStep(0);
        setParameters({
          collateralAmount: 150000,
          targetLTV: 40,
          termDays: 60,
        });
        setAgreedToTerms(false);
        setAgreedToRisks(false);
        setShowSuccessMessage(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to create loan:', error);
    } finally {
      setIsCreatingLoan(false);
    }
  };

  const CollateralStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        How much XPM do you want to use as collateral?
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Collateral Amount"
          type="number"
          value={parameters.collateralAmount}
          onChange={(e) => setParameters(prev => ({ ...prev, collateralAmount: parseFloat(e.target.value) || 0 }))}
          InputProps={{
            endAdornment: (
              <Typography variant="body2" color="text.secondary">
                XPM
              </Typography>
            ),
          }}
          helperText={
            parameters.collateralAmount < 1000 
              ? "Minimum 1,000 XPM required"
              : parameters.collateralAmount > walletBalance
                ? "Insufficient balance"
                : `Worth $${collateralValueUSD.toFixed(0)} USD • Available: ${walletBalance.toLocaleString()} XPM`
          }
          error={parameters.collateralAmount > 0 && (parameters.collateralAmount < 1000 || parameters.collateralAmount > walletBalance)}
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Quick amounts:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[100000, 250000, 500000, 1000000].map((amount) => (
              <Button
                key={amount}
                variant={parameters.collateralAmount === amount ? "contained" : "outlined"}
                size="small"
                onClick={() => setParameters(prev => ({ ...prev, collateralAmount: amount }))}
                disabled={amount > walletBalance}
              >
                {amount >= 1000000 ? `${amount / 1000000}M` : `${amount / 1000}K`}
              </Button>
            ))}
          </Box>
        </Box>

        {parameters.collateralAmount >= 1000 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Collateral will be locked</strong> in a smart contract until loan repayment.
              Current XPM price: ${marketData.xpmPriceUSD.toFixed(4)}
            </Typography>
          </Alert>
        )}
      </Box>
    </Box>
  );

  const ConfigurationStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure your loan parameters
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1">
                Target LTV: {parameters.targetLTV}%
              </Typography>
              <Tooltip title="Loan-to-Value ratio determines how much you can borrow relative to your collateral value">
                <IconButton size="small">
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Slider
              value={parameters.targetLTV}
              onChange={(_, value) => setParameters(prev => ({ ...prev, targetLTV: value as number }))}
              min={10}
              max={50}
              step={5}
              marks={[
                { value: 10, label: '10%' },
                { value: 25, label: '25%' },
                { value: 40, label: '40%' },
                { value: 50, label: '50%' },
              ]}
              color={parameters.targetLTV > 40 ? 'warning' : 'primary'}
            />
            <Typography variant="caption" color="text.secondary">
              Lower LTV = Safer loan, higher LTV = more borrowing power
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2 }}>
                Loan Term & Interest Rate
              </FormLabel>
              <RadioGroup
                value={parameters.termDays}
                onChange={(e) => setParameters(prev => ({ ...prev, termDays: Number(e.target.value) as LoanTermDays }))}
              >
                {[
                  { days: 30, rate: 14 },
                  { days: 60, rate: 15 },
                  { days: 90, rate: 16 }
                ].map((option) => (
                  <FormControlLabel
                    key={option.days}
                    value={option.days}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 200 }}>
                        <Typography variant="body2">
                          {option.days} days
                        </Typography>
                        <Chip 
                          label={`${option.rate}% APR`}
                          size="small"
                          color={parameters.termDays === option.days ? "primary" : "default"}
                        />
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'surface.main' }}>
            <Typography variant="h6" gutterBottom>
              Loan Preview
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                {targetBorrowAmount.toFixed(0)} RLUSD
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ≈ ${targetBorrowAmount.toFixed(0)} USD
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Interest ({interestRate}% APR)</Typography>
              <Typography variant="body2">{totalInterest.toFixed(2)} RLUSD</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Term</Typography>
              <Typography variant="body2">{parameters.termDays} days</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Repayment</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{totalRepayment.toFixed(2)} RLUSD</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Risk Level</Typography>
                <Chip 
                  label={riskAssessment.level}
                  color={riskAssessment.color as any}
                  size="small"
                />
              </Box>
              <LinearProgress 
                variant="determinate"
                value={(actualLTV / 65) * 100}
                color={riskAssessment.color as any}
                sx={{ height: 8, borderRadius: 1, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {riskAssessment.description} • Liquidation at 65% LTV
              </Typography>
            </Box>

            <Alert 
              severity={priceDropBuffer < 25 ? "warning" : "info"}
            >
              <Typography variant="caption">
                <strong>Liquidation Price:</strong> ${liquidationPrice.toFixed(4)} XPM
                <br />
                <strong>Price Drop Buffer:</strong> {priceDropBuffer.toFixed(1)}%
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setShowAdvancedRisk(!showAdvancedRisk)}
          startIcon={<InfoIcon />}
        >
          {showAdvancedRisk ? 'Hide' : 'Show'} Advanced Risk Analysis
        </Button>
        
        <Collapse in={showAdvancedRisk}>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Risk Factors:</strong>
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>XPM price volatility directly affects your liquidation risk</li>
              <li>RLUSD maintains 1:1 USD peg, eliminating debt-side risk</li>
              <li>Interest is calculated upfront for the entire term</li>
              <li>10% liquidation penalty applies if position becomes underwater</li>
              {priceDropBuffer < 30 && (
                <li><strong>Warning:</strong> Limited price drop protection ({priceDropBuffer.toFixed(1)}%)</li>
              )}
            </ul>
          </Alert>
        </Collapse>
      </Box>
    </Box>
  );

  const ReviewStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review your loan details
      </Typography>

      <Paper sx={{ p: 3, mb: 3, bgcolor: 'surface.main' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">Collateral</Typography>
              <Typography variant="h6">{parameters.collateralAmount.toLocaleString()} XPM</Typography>
              <Typography variant="caption" color="text.secondary">
                ${collateralValueUSD.toFixed(0)} USD
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">You'll Receive</Typography>
              <Typography variant="h6">{targetBorrowAmount.toFixed(0)} RLUSD</Typography>
              <Typography variant="caption" color="text.secondary">
                ≈ ${targetBorrowAmount.toFixed(0)} USD
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">LTV</Typography>
              <Typography variant="h6">{actualLTV.toFixed(1)}%</Typography>
              <Typography variant="caption" color="text.secondary">
                {riskAssessment.level} risk level
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">Term & Rate</Typography>
              <Typography variant="h6">{parameters.termDays} days</Typography>
              <Typography variant="caption" color="text.secondary">
                {interestRate}% APR
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Important Risk Disclosure:</strong>
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Your collateral will be liquidated if LTV reaches 65%</li>
          <li>Liquidation triggers at XPM price of ${liquidationPrice.toFixed(4)}</li>
          <li>10% liquidation penalty will be deducted from your collateral</li>
          <li>Interest is fixed and calculated for the full term</li>
        </ul>
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControlLabel
          control={
            <Radio 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              I have read and agree to the Terms of Service and understand the loan mechanics
            </Typography>
          }
        />
        
        <FormControlLabel
          control={
            <Radio 
              checked={agreedToRisks}
              onChange={(e) => setAgreedToRisks(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              I acknowledge the liquidation risks and understand that I may lose my collateral
            </Typography>
          }
        />
      </Box>
    </Box>
  );

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return parameters.collateralAmount >= 1000 && parameters.collateralAmount <= walletBalance;
      case 1:
        return targetBorrowAmount > 0;
      case 2:
        return agreedToTerms && agreedToRisks;
      default:
        return false;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Create New Loan
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Borrow RLUSD using your XPM as collateral
        </Typography>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ py: 3 }}>
                  {index === 0 && <CollateralStep />}
                  {index === 1 && <ConfigurationStep />}
                  {index === 2 && <ReviewStep />}

                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    {activeStep > 0 && (
                      <Button onClick={handleBack}>
                        Back
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!canProceed()}
                    >
                      {activeStep === steps.length - 1 ? 'Create Loan' : 'Continue'}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmationOpen} 
        onClose={() => setConfirmationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckIcon color="primary" sx={{ mr: 2 }} />
            Final Confirmation
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You're about to create a loan with the following terms:
          </Typography>
          <Box sx={{ bgcolor: 'surface.main', p: 2, borderRadius: 2, my: 2 }}>
            <Typography variant="body2">
              • Deposit: {parameters.collateralAmount.toLocaleString()} XPM (${collateralValueUSD.toFixed(0)})
            </Typography>
            <Typography variant="body2">
              • Receive: {targetBorrowAmount.toFixed(0)} RLUSD (${targetBorrowAmount.toFixed(0)})
            </Typography>
            <Typography variant="body2">
              • Term: {parameters.termDays} days at {interestRate}% APR
            </Typography>
            <Typography variant="body2">
              • Liquidation: ${liquidationPrice.toFixed(4)} XPM ({priceDropBuffer.toFixed(1)}% buffer)
            </Typography>
            <Typography variant="body2">
              • Total to repay: {totalRepayment.toFixed(2)} RLUSD
            </Typography>
          </Box>
          <Alert severity="warning">
            This action cannot be undone. Make sure you understand all risks involved.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateLoan} 
            variant="contained"
            disabled={!agreedToTerms || !agreedToRisks || isCreatingLoan}
            startIcon={isCreatingLoan ? <CircularProgress size={20} /> : null}
          >
            {isCreatingLoan ? 'Creating Loan...' : 'Confirm & Create Loan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSuccessMessage(false)}>
          <Typography variant="body2">
            <strong>Loan Created Successfully!</strong>
            <br />
            You received {targetBorrowAmount.toFixed(0)} RLUSD for {parameters.termDays} days.
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoanCreationPage;