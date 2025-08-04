import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Slider,
  Alert,
} from '@mui/material';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrow } from '../utils/lendingCalculations';

const LoanCreation: React.FC = () => {
  const { createLoan, marketData } = useLending();
  const [collateralAmount, setCollateralAmount] = useState<string>('1000');
  const [ltv, setLtv] = useState<number>(30);
  const [error, setError] = useState<string>('');

  const maxBorrow = calculateMaxBorrow(
    parseFloat(collateralAmount) || 0,
    marketData.xpmPrice,
    ltv
  );

  const handleCreateLoan = () => {
    const collateral = parseFloat(collateralAmount);
    
    if (!collateral || collateral <= 0) {
      setError('Please enter a valid collateral amount');
      return;
    }

    setError('');
    createLoan({
      collateralAmount: collateral,
      borrowAmount: maxBorrow,
      interestRate: 15, // 15% APR for higher risk altcoin
      liquidationThreshold: 65, // 65% LTV for altcoins
    });
    
    setCollateralAmount('');
    setLtv(30);
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Collateral Amount (XPM)"
        type="number"
        value={collateralAmount}
        onChange={(e) => setCollateralAmount(e.target.value)}
        margin="normal"
      />
      
      <Box sx={{ mt: 3 }}>
        <Typography gutterBottom>
          Loan-to-Value Ratio: {ltv}%
        </Typography>
        <Slider
          value={ltv}
          onChange={(_, value) => setLtv(value as number)}
          min={10}
          max={50}
          step={5}
          marks
          valueLabelDisplay="auto"
        />
      </Box>
      
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Max Borrow Amount: {maxBorrow.toFixed(2)} XRP
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Interest Rate: 15% APR
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Liquidation at: 65% LTV
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Button
        fullWidth
        variant="contained"
        onClick={handleCreateLoan}
        disabled={!collateralAmount || parseFloat(collateralAmount) <= 0}
      >
        Create Loan
      </Button>
    </Box>
  );
};

export default LoanCreation;