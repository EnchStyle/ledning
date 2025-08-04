import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
} from '@mui/material';
import { useLending } from '../context/LendingContext';
import UserPositions from './UserPositions';

const MyLoans: React.FC = () => {
  const { loans } = useLending();
  const activeLoans = loans.filter(loan => loan.status === 'active');
  const hasLoans = loans.length > 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          My Loans
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Monitor and manage your active loans
        </Typography>
      </Box>

      {!hasLoans ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No loans yet
          </Typography>
          <Typography color="text.secondary">
            Create your first loan in the Borrow tab to get started
          </Typography>
        </Paper>
      ) : (
        <>
          {activeLoans.length > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Tip:</strong> Click the expand arrow (↓) next to loans with LTV &gt; 55% to see liquidation previews.
                Monitor your loans regularly and repay early to reduce risk.
              </Typography>
            </Alert>
          )}
          
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <UserPositions />
          </Paper>
        </>
      )}
    </Container>
  );
};

export default MyLoans;