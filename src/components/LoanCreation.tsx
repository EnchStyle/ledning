/**
 * LoanCreation Component - Interface for creating new loans
 * 
 * Key features:
 * - Collateral input with real-time USD value calculation
 * - LTV slider for risk management (0-50% range)
 * - Loan term selection (30, 60, 90 days) with fixed interest rates
 * - Step-by-step creation process with visual feedback
 * - Real-time liquidation price calculation
 */
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Slider,
  Alert,
  Paper,
  Divider,
  Tooltip,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrowUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';

/**
 * Loan creation form component
 * Handles the entire loan origination process with validation
 */
const LoanCreation: React.FC = () => {
  const { createLoan, marketData } = useLending();
  
  // Form state
  const [collateralAmount, setCollateralAmount] = useState<string>('150000'); // Default XPM amount
  const [ltv, setLtv] = useState<number>(30); // Conservative 30% LTV default
  const [error, setError] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0); // Creation process step
  const [selectedTerm, setSelectedTerm] = useState<number>(60); // Default 60-day term

  // Calculate loan parameters based on inputs
  const maxBorrow = calculateMaxBorrowUSD(
    parseFloat(collateralAmount) || 0,
    marketData.xpmPriceUSD,
    marketData.xrpPriceUSD,
    ltv
  );

  // Real-time value calculations for user feedback
  const collateralValueUSD = (parseFloat(collateralAmount) || 0) * marketData.xpmPriceUSD;
  const liquidationPriceUSD = maxBorrow > 0 ? calculateLiquidationPriceUSD(
    maxBorrow,
    parseFloat(collateralAmount) || 1,
    marketData.xrpPriceUSD,
    65 // 65% liquidation threshold for altcoin collateral
  ) : 0;

  /**
   * Handle loan creation with validation and visual feedback
   * Steps: Validation -> Processing -> Smart Contract -> Confirmation
   */
  const handleCreateLoan = async () => {
    const collateral = parseFloat(collateralAmount);
    
    // Validation
    if (!collateral || collateral <= 0) {
      setError('Please enter a valid collateral amount');
      return;
    }

    setError('');
    setIsCreating(true);
    
    // Step 1: Validate collateral
    setStep(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Process loan parameters
    setStep(2);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Create loan on-chain
    setStep(3);
    createLoan({
      collateralAmount: collateral,
      borrowAmount: maxBorrow,
      interestRate: selectedTerm === 30 ? 14 : selectedTerm === 60 ? 15 : 16, // Term-based rates
      liquidationThreshold: 65,
      termDays: selectedTerm,
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsCreating(false);
    setStep(0);
    setCollateralAmount('150000');
    setLtv(30);
  };

  const steps = [
    'Review Details',
    'Deposit Collateral',
    'Process Loan',
    'Complete'
  ];

  return (
    <Box>
      {isCreating && (
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={step} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      <TextField
        fullWidth
        label="Collateral Amount"
        type="number"
        value={collateralAmount}
        onChange={(e) => setCollateralAmount(e.target.value)}
        margin="normal"
        disabled={isCreating}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              XPM
              <Tooltip title="Enter the amount of XPM tokens you want to deposit as collateral">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        helperText={`≈ $${collateralValueUSD.toFixed(2)} USD value`}
      />
      
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography gutterBottom>
            Loan-to-Value Ratio: {ltv}%
          </Typography>
          <Tooltip title="Lower LTV means safer loans but less borrowing power">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Slider
          value={ltv}
          onChange={(_, value) => setLtv(value as number)}
          min={10}
          max={50}
          step={5}
          marks={[
            { value: 10, label: '10%' },
            { value: 25, label: '25%' },
            { value: 40, label: '40%' },
            { value: 50, label: '50%' },
          ]}
          valueLabelDisplay="auto"
          disabled={isCreating}
          color={ltv > 40 ? 'warning' : 'primary'}
        />
      </Box>
      
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography gutterBottom>
          Loan Term
        </Typography>
        <ToggleButtonGroup
          value={selectedTerm}
          exclusive
          onChange={(_, value) => value && setSelectedTerm(value)}
          fullWidth
          disabled={isCreating}
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

      
      <Paper sx={{ p: 2, mt: 3, mb: 2, bgcolor: 'background.default' }}>
        <Typography variant="subtitle2" gutterBottom>
          Loan Summary
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">You'll receive:</Typography>
          <Typography variant="body2" fontWeight="bold" color="success.main">
            {maxBorrow.toFixed(2)} XRP
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Interest rate:</Typography>
          <Typography variant="body2">{selectedTerm === 30 ? 14 : selectedTerm === 60 ? 15 : 16}% APR</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Loan term:</Typography>
          <Typography variant="body2">{selectedTerm} days</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Fixed interest:</Typography>
          <Typography variant="body2">Yes (paid even if repaid early)</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Liquidation threshold:</Typography>
          <Typography variant="body2" color="warning.main">65% LTV</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">Liquidation price:</Typography>
          <Typography variant="body2" color="error.main">
            ${liquidationPriceUSD.toFixed(4)} per XPM
          </Typography>
        </Box>
      </Paper>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Button
        fullWidth
        variant="contained"
        onClick={handleCreateLoan}
        disabled={!collateralAmount || parseFloat(collateralAmount) <= 0 || isCreating}
        size="large"
        sx={{ py: 1.5 }}
      >
        {isCreating ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            Creating Loan...
          </Box>
        ) : (
          'Create Loan'
        )}
      </Button>
    </Box>
  );
};

export default LoanCreation;