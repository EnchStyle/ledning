import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  TextField,
  Slider,
  Paper,
  Grid,
  Alert,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrowUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';
import RiskMeter from './RiskMeter';

const LoanWizard: React.FC = () => {
  const { createLoan, marketData } = useLending();
  const [activeStep, setActiveStep] = useState(0);
  const [collateralAmount, setCollateralAmount] = useState<string>('150000');
  const [desiredBorrow, setDesiredBorrow] = useState<string>('');
  const [targetLTV, setTargetLTV] = useState<number>(40);
  const [isCreating, setIsCreating] = useState(false);
  const [showRiskDetails, setShowRiskDetails] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<number>(60); // Default to 60 days

  const collateralValue = parseFloat(collateralAmount) || 0;
  const collateralValueUSD = collateralValue * marketData.xpmPriceUSD;
  const maxBorrowXRP = calculateMaxBorrowUSD(
    collateralValue,
    marketData.xpmPriceUSD,
    marketData.xrpPriceUSD,
    targetLTV
  );
  const liquidationPriceUSD = calculateLiquidationPriceUSD(
    maxBorrowXRP,
    collateralValue,
    marketData.xrpPriceUSD,
    65
  );

  const steps = [
    {
      label: 'How much XPM do you have?',
      description: 'Tell us about your collateral',
      icon: <AccountBalanceWalletIcon />
    },
    {
      label: 'How much XRP do you need?',
      description: 'Set your borrowing amount',
      icon: <TrendingUpIcon />
    },
    {
      label: 'Review your loan terms',
      description: 'Confirm the details',
      icon: <SecurityIcon />
    },
    {
      label: 'Create your loan',
      description: 'All set to go!',
      icon: <CheckCircleIcon />
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreateLoan = async () => {
    setIsCreating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    createLoan({
      collateralAmount: collateralValue,
      borrowAmount: maxBorrowXRP,
      interestRate: selectedTerm === 30 ? 14 : selectedTerm === 60 ? 15 : 16,
      liquidationThreshold: 65,
      termDays: selectedTerm,
    });
    
    setIsCreating(false);
    handleNext();
  };

  const StepOne = () => (
    <Box>
      <Typography variant="body1" gutterBottom>
        XPM tokens will secure your loan. The more you deposit, the more you can borrow safely.
      </Typography>
      
      <TextField
        fullWidth
        label="XPM Amount"
        type="number"
        value={collateralAmount}
        onChange={(e) => setCollateralAmount(e.target.value)}
        margin="normal"
        InputProps={{
          endAdornment: <InputAdornment position="end">XPM</InputAdornment>
        }}
        helperText={`Worth approximately $${collateralValueUSD.toFixed(0)} USD`}
      />

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          💡 <strong>Tip:</strong> Start with smaller amounts if you're new to lending. 
          You can always create additional loans later.
        </Typography>
      </Alert>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled>Back</Button>
        <Button 
          variant="contained" 
          onClick={handleNext}
          disabled={!collateralAmount || parseFloat(collateralAmount) <= 0}
        >
          Next: Set Loan Amount
        </Button>
      </Box>
    </Box>
  );

  const StepTwo = () => (
    <Box>
      <Typography variant="body1" gutterBottom>
        Choose how much XRP you want to borrow. Lower amounts are safer for beginners.
      </Typography>

      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography gutterBottom>
          Target LTV: {targetLTV}% (Loan-to-Value ratio)
        </Typography>
        <Slider
          value={targetLTV}
          onChange={(_, value) => setTargetLTV(value as number)}
          min={20}
          max={50}
          step={5}
          marks={[
            { value: 20, label: '20% (Ultra Safe)' },
            { value: 35, label: '35% (Balanced)' },
            { value: 50, label: '50% (Aggressive)' }
          ]}
          color={targetLTV <= 30 ? 'success' : targetLTV <= 45 ? 'warning' : 'error'}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>
          Loan Term
        </Typography>
        <ToggleButtonGroup
          value={selectedTerm}
          exclusive
          onChange={(_, value) => value && setSelectedTerm(value)}
          fullWidth
        >
          <ToggleButton value={30}>
            <Box>
              <Typography variant="button">30 Days</Typography>
              <Typography variant="caption" display="block">14% APR</Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value={60}>
            <Box>
              <Typography variant="button">60 Days</Typography>
              <Typography variant="caption" display="block">15% APR</Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value={90}>
            <Box>
              <Typography variant="button">90 Days</Typography>
              <Typography variant="caption" display="block">16% APR</Typography>
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>


      <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                You'll receive
              </Typography>
              <Typography variant="h5" color="success.main">
                {maxBorrowXRP.toFixed(0)} XRP
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Monthly interest
              </Typography>
              <Typography variant="h6">
                {(maxBorrowXRP * (selectedTerm === 30 ? 0.14 : selectedTerm === 60 ? 0.15 : 0.16) / 12).toFixed(2)} XRP
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Button 
        variant="outlined" 
        size="small"
        onClick={() => setShowRiskDetails(!showRiskDetails)}
        sx={{ mb: 2 }}
      >
        {showRiskDetails ? 'Hide' : 'Show'} Risk Details
      </Button>

      <Collapse in={showRiskDetails}>
        <RiskMeter currentLTV={targetLTV} liquidationPrice={liquidationPriceUSD} />
      </Collapse>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleBack}>Back</Button>
        <Button variant="contained" onClick={handleNext}>
          Next: Review Terms
        </Button>
      </Box>
    </Box>
  );

  const StepThree = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Loan Terms
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Collateral Details
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Amount:</Typography>
              <Typography variant="body1">{collateralValue.toLocaleString()} XPM</Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">USD Value:</Typography>
              <Typography variant="body1">${collateralValueUSD.toFixed(0)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Current XPM Price:</Typography>
              <Typography variant="body1">${marketData.xpmPriceUSD.toFixed(4)}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Loan Details
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Borrow Amount:</Typography>
              <Typography variant="body1" color="success.main">
                {maxBorrowXRP.toFixed(2)} XRP
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Interest Rate:</Typography>
              <Typography variant="body1">{selectedTerm === 30 ? 14 : selectedTerm === 60 ? 15 : 16}% APR</Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">LTV Ratio:</Typography>
              <Typography variant="body1">{targetLTV}%</Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Loan Term:</Typography>
              <Typography variant="body1">{selectedTerm} Days</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Your loan will be liquidated if XPM price falls to 
          ${liquidationPriceUSD.toFixed(4)} or below. Monitor your position regularly.
        </Typography>
      </Alert>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleBack}>Back</Button>
        <Button 
          variant="contained" 
          onClick={handleNext}
          size="large"
          sx={{ px: 4 }}
        >
          I Understand - Create Loan
        </Button>
      </Box>
    </Box>
  );

  const StepFour = () => (
    <Box>
      {!isCreating ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Ready to Create Your Loan?
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="h4" gutterBottom>
              {maxBorrowXRP.toFixed(0)} XRP
            </Typography>
            <Typography variant="body1">
              Will be transferred to your wallet immediately
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button onClick={handleBack} size="large">
              Back to Review
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCreateLoan}
              size="large"
              sx={{ px: 4 }}
            >
              Create Loan Now
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Creating Your Loan...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we process your loan
          </Typography>
        </Box>
      )}
    </Box>
  );

  const StepFive = () => (
    <Box sx={{ textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom color="success.main">
        Loan Created Successfully!
      </Typography>
      <Typography variant="body1" gutterBottom>
        {maxBorrowXRP.toFixed(2)} XRP has been transferred to your wallet.
      </Typography>
      
      <Alert severity="success" sx={{ mt: 3, mb: 3 }}>
        <Typography variant="body2">
          🎉 <strong>Congratulations!</strong> Remember to monitor your loan's health 
          in the "My Loans" section and consider partial repayments to reduce risk.
        </Typography>
      </Alert>

      <Button variant="outlined" fullWidth>
        View My Loans
      </Button>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0: return <StepOne />;
      case 1: return <StepTwo />;
      case 2: return <StepThree />;
      case 3: return <StepFour />;
      case 4: return <StepFive />;
      default: return null;
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Create Your Loan
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === steps.length - 1 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
              icon={step.icon}
            >
              <Typography variant="h6">{step.label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>
            <StepContent>
              {getStepContent(index)}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

export default LoanWizard;