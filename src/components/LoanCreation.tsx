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
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrowUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';

const LoanCreation: React.FC = () => {
  const { createLoan, marketData } = useLending();
  const [collateralAmount, setCollateralAmount] = useState<string>('150000');
  const [ltv, setLtv] = useState<number>(30);
  const [error, setError] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);

  const maxBorrow = calculateMaxBorrowUSD(
    parseFloat(collateralAmount) || 0,
    marketData.xpmPriceUSD,
    marketData.xrpPriceUSD,
    ltv
  );

  const collateralValueUSD = (parseFloat(collateralAmount) || 0) * marketData.xpmPriceUSD;
  const liquidationPriceUSD = maxBorrow > 0 ? calculateLiquidationPriceUSD(
    maxBorrow,
    parseFloat(collateralAmount) || 1,
    marketData.xrpPriceUSD,
    65 // 65% liquidation threshold
  ) : 0;

  const handleCreateLoan = async () => {
    const collateral = parseFloat(collateralAmount);
    
    if (!collateral || collateral <= 0) {
      setError('Please enter a valid collateral amount');
      return;
    }

    setError('');
    setIsCreating(true);
    
    // Simulate loan creation process with steps
    setStep(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStep(2);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStep(3);
    createLoan({
      collateralAmount: collateral,
      borrowAmount: maxBorrow,
      interestRate: 15,
      liquidationThreshold: 65,
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
          <Typography variant="body2">15% APR</Typography>
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