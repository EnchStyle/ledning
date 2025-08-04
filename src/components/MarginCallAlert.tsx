import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';
import { useLending } from '../context/LendingContext';

const MarginCallAlert: React.FC = () => {
  const { checkMarginCalls } = useLending();
  const marginCallLoans = checkMarginCalls();

  if (marginCallLoans.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="warning">
        <AlertTitle>Margin Call Warning</AlertTitle>
        {marginCallLoans.length} loan(s) are at risk of liquidation (LTV ≥ 65%).
        Please repay or add collateral to avoid liquidation.
      </Alert>
    </Box>
  );
};

export default MarginCallAlert;