import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useLending } from '../context/LendingContext';
import { Loan } from '../types/lending';

const SimpleLoansManager: React.FC = () => {
  const { loans, repayLoan, liquidateLoan, marketData } = useLending();
  const [repayDialog, setRepayDialog] = useState<{ open: boolean; loan: Loan | null }>({ open: false, loan: null });
  const [repayAmount, setRepayAmount] = useState('');

  const activeLoans = loans.filter(loan => loan.status === 'active');
  const hasLoans = loans.length > 0;

  const handleRepay = () => {
    if (repayDialog.loan && repayAmount) {
      repayLoan(repayDialog.loan.id, parseFloat(repayAmount));
      setRepayDialog({ open: false, loan: null });
      setRepayAmount('');
    }
  };

  const getLoanHealthColor = (ltv: number) => {
    if (ltv >= 65) return 'error';
    if (ltv >= 55) return 'warning';
    return 'success';
  };

  const getLoanHealthText = (ltv: number) => {
    if (ltv >= 65) return 'LIQUIDATED';
    if (ltv >= 55) return 'High Risk';
    if (ltv >= 40) return 'Medium Risk';
    return 'Healthy';
  };

  if (!hasLoans) {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No loans yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create your first loan to start borrowing XRP against your XPM collateral.
          </Typography>
          <Button variant="contained" size="large">
            Create First Loan
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Your Loans
      </Typography>

      {/* Portfolio Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Portfolio Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Collateral
            </Typography>
            <Typography variant="h6">
              {loans.reduce((sum, loan) => sum + (loan.status === 'active' ? loan.collateralAmount : 0), 0).toLocaleString()} XPM
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Borrowed
            </Typography>
            <Typography variant="h6">
              {loans.reduce((sum, loan) => sum + (loan.status === 'active' ? loan.borrowedAmount + loan.accruedInterest : 0), 0).toFixed(2)} XRP
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Active Loans
            </Typography>
            <Typography variant="h6">
              {activeLoans.length}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Loans Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Collateral</TableCell>
              <TableCell>Borrowed</TableCell>
              <TableCell>Interest</TableCell>
              <TableCell>Total Debt</TableCell>
              <TableCell>Health</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((loan) => {
              const totalDebt = loan.borrowedAmount + loan.accruedInterest;
              const healthColor = getLoanHealthColor(loan.currentLTV);
              const healthText = getLoanHealthText(loan.currentLTV);
              
              return (
                <TableRow key={loan.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {loan.collateralAmount.toLocaleString()} XPM
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ≈ ${(loan.collateralAmount * marketData.xpmPriceUSD).toFixed(0)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {loan.borrowedAmount.toFixed(2)} XRP
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {loan.accruedInterest.toFixed(4)} XRP
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {totalDebt.toFixed(2)} XRP
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" color={`${healthColor}.main`} sx={{ fontWeight: 600 }}>
                        {loan.currentLTV.toFixed(1)}%
                      </Typography>
                      <Chip 
                        label={healthText} 
                        color={healthColor} 
                        size="small"
                      />
                      {loan.status === 'active' && (
                        <LinearProgress 
                          variant="determinate" 
                          value={(loan.currentLTV / 65) * 100}
                          color={healthColor}
                          sx={{ mt: 1, height: 4, borderRadius: 1 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={loan.status}
                      color={loan.status === 'active' ? 'success' : loan.status === 'liquidated' ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {loan.status === 'active' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setRepayDialog({ open: true, loan })}
                        >
                          Repay
                        </Button>
                        {loan.currentLTV >= 65 && (
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => liquidateLoan(loan.id)}
                          >
                            Liquidate
                          </Button>
                        )}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Alerts for high-risk loans */}
      {activeLoans.some(loan => loan.currentLTV >= 55) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Risk Alert:</strong> You have loans at risk of liquidation. 
            Consider repaying or adding more collateral to improve loan health.
          </Typography>
        </Alert>
      )}

      {/* Repay Dialog */}
      <Dialog open={repayDialog.open} onClose={() => setRepayDialog({ open: false, loan: null })}>
        <DialogTitle>Repay Loan</DialogTitle>
        <DialogContent>
          {repayDialog.loan && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Total debt: {(repayDialog.loan.borrowedAmount + repayDialog.loan.accruedInterest).toFixed(4)} XRP
              </Typography>
              <TextField
                autoFocus
                fullWidth
                label="Repay Amount (XRP)"
                type="number"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                sx={{ mt: 2 }}
                inputProps={{ step: 0.0001, min: 0 }}
                helperText="Enter amount to repay (partial repayment allowed)"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRepayDialog({ open: false, loan: null })}>
            Cancel
          </Button>
          <Button onClick={handleRepay} variant="contained">
            Repay
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SimpleLoansManager;