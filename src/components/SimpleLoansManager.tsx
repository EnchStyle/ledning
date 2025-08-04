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
  Snackbar,
  Stack,
} from '@mui/material';
import { useLending } from '../context/LendingContext';
import { Loan } from '../types/lending';

const SimpleLoansManager: React.FC = () => {
  const { loans, repayLoan, liquidateLoan, addCollateral, marketData, extendLoan, currentTime } = useLending();
  const [repayDialog, setRepayDialog] = useState<{ open: boolean; loan: Loan | null }>({ open: false, loan: null });
  const [addCollateralDialog, setAddCollateralDialog] = useState<{ open: boolean; loan: Loan | null }>({ open: false, loan: null });
  const [repayAmount, setRepayAmount] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const activeLoans = loans.filter(loan => loan.status === 'active');
  const hasLoans = loans.length > 0;

  const handleRepay = () => {
    if (repayDialog.loan && repayAmount) {
      const amount = parseFloat(repayAmount);
      const totalDebt = repayDialog.loan.borrowedAmount + repayDialog.loan.accruedInterest;
      
      repayLoan(repayDialog.loan.id, amount);
      setRepayDialog({ open: false, loan: null });
      setRepayAmount('');
      
      if (amount >= totalDebt) {
        setSuccessMessage('Loan fully repaid! Collateral will be returned.');
      } else {
        setSuccessMessage(`Successfully repaid ${amount.toFixed(4)} XRP. Remaining debt: ${(totalDebt - amount).toFixed(4)} XRP`);
      }
      setShowSuccess(true);
    }
  };

  const handleAddCollateral = () => {
    if (addCollateralDialog.loan && collateralAmount) {
      const amount = parseFloat(collateralAmount);
      const oldLTV = addCollateralDialog.loan.currentLTV;
      
      addCollateral(addCollateralDialog.loan.id, amount);
      setAddCollateralDialog({ open: false, loan: null });
      setCollateralAmount('');
      
      setSuccessMessage(`Added ${amount.toLocaleString()} XPM collateral. Your LTV improved from ${oldLTV.toFixed(1)}% to a lower ratio.`);
      setShowSuccess(true);
    }
  };

  const handleExtendLoan = (loanId: string) => {
    extendLoan(loanId);
    setSuccessMessage('Loan successfully extended for another term period.');
    setShowSuccess(true);
  };

  const handleLiquidation = (loanId: string) => {
    liquidateLoan(loanId);
    setSuccessMessage('Loan liquidated. Liquidation fee applied.');
    setShowSuccess(true);
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

  const getDaysUntilMaturity = (maturityDate: Date) => {
    const diffTime = maturityDate.getTime() - currentTime.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMaturityStatus = (loan: Loan) => {
    const daysLeft = getDaysUntilMaturity(loan.maturityDate);
    if (daysLeft < 0) return { text: 'MATURED', color: 'error' };
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, color: 'warning' };
    if (daysLeft <= 7) return { text: `${daysLeft}d left`, color: 'info' };
    return { text: `${daysLeft}d left`, color: 'success' };
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
              <TableCell>Maturity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((loan) => {
              const totalDebt = loan.borrowedAmount + loan.accruedInterest;
              const healthColor = getLoanHealthColor(loan.currentLTV);
              const healthText = getLoanHealthText(loan.currentLTV);
              const maturityStatus = getMaturityStatus(loan);
              const canExtend = loan.extensionsUsed < loan.maxExtensions && loan.currentLTV < 40;
              
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
                    <Box>
                      <Chip 
                        label={maturityStatus.text}
                        color={maturityStatus.color}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        {loan.autoRenew ? 'Auto-renew' : 'Manual'} • {loan.extensionsUsed}/{loan.maxExtensions} ext.
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {loan.status === 'active' && (
                      <Stack direction="column" spacing={1}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setRepayDialog({ open: true, loan })}
                          >
                            Repay
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => setAddCollateralDialog({ open: true, loan })}
                          >
                            Add Collateral
                          </Button>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {canExtend && getDaysUntilMaturity(loan.maturityDate) <= 7 && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              onClick={() => handleExtendLoan(loan.id)}
                            >
                              Extend
                            </Button>
                          )}
                          {loan.currentLTV >= 65 && (
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleLiquidation(loan.id)}
                            >
                              Liquidate
                            </Button>
                          )}
                        </Box>
                      </Stack>
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

      {/* Maturity alerts */}
      {activeLoans.some(loan => getDaysUntilMaturity(loan.maturityDate) <= 3) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Maturity Alert:</strong> You have loans expiring soon. 
            Repay or extend them before they mature to avoid additional fees.
          </Typography>
        </Alert>
      )}

      {activeLoans.some(loan => getDaysUntilMaturity(loan.maturityDate) <= 7 && getDaysUntilMaturity(loan.maturityDate) > 3) && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Extension Available:</strong> Some loans are approaching maturity. 
            You can extend healthy loans (LTV &lt; 40%) for additional terms.
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

      {/* Add Collateral Dialog */}
      <Dialog open={addCollateralDialog.open} onClose={() => setAddCollateralDialog({ open: false, loan: null })}>
        <DialogTitle>Add Collateral</DialogTitle>
        <DialogContent>
          {addCollateralDialog.loan && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Current collateral: {addCollateralDialog.loan.collateralAmount.toLocaleString()} XPM
              </Typography>
              <Typography variant="body2" gutterBottom color="text.secondary">
                Current LTV: {addCollateralDialog.loan.currentLTV.toFixed(1)}%
              </Typography>
              <TextField
                autoFocus
                fullWidth
                label="Additional XPM Amount"
                type="number"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                sx={{ mt: 2 }}
                inputProps={{ step: 1000, min: 1000 }}
                helperText={`Adding collateral will reduce your LTV and liquidation risk. Worth $${parseFloat(collateralAmount || '0') * marketData.xpmPriceUSD} USD`}
              />
              {parseFloat(collateralAmount || '0') > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.dark">
                    New total collateral: {(addCollateralDialog.loan.collateralAmount + parseFloat(collateralAmount || '0')).toLocaleString()} XPM
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    Estimated new LTV: {(((addCollateralDialog.loan.borrowedAmount + addCollateralDialog.loan.accruedInterest) * marketData.xrpPriceUSD) / ((addCollateralDialog.loan.collateralAmount + parseFloat(collateralAmount || '0')) * marketData.xpmPriceUSD) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCollateralDialog({ open: false, loan: null })}>
            Cancel
          </Button>
          <Button onClick={handleAddCollateral} variant="contained" color="secondary">
            Add Collateral
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

export default SimpleLoansManager;