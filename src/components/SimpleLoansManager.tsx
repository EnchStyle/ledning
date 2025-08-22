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
  Snackbar,
  Stack,
  Grid,
  Slider,
} from '@mui/material';
import { useLending } from '../context/LendingContext';
import { Loan } from '../types/lending';
import SimpleHealthGauge from './SimpleHealthGauge';

const SimpleLoansManager: React.FC = () => {
  const { loans, repayLoan, liquidateLoan, addCollateral, marketData, currentTime, walletBalances } = useLending();
  const [repayDialog, setRepayDialog] = useState<{ open: boolean; loan: Loan | null }>({ open: false, loan: null });
  const [addCollateralDialog, setAddCollateralDialog] = useState<{ open: boolean; loan: Loan | null }>({ open: false, loan: null });
  const [repayAmount, setRepayAmount] = useState('');
  const [repayPercentage, setRepayPercentage] = useState(100); // Default to full repayment
  const [collateralAmount, setCollateralAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const activeLoans = loans.filter(loan => loan.status === 'active');
  const hasLoans = loans.length > 0;

  const handleRepay = () => {
    if (repayDialog.loan && repayAmount) {
      const amount = parseFloat(repayAmount);
      const totalDebt = repayDialog.loan.borrowedAmount + repayDialog.loan.fixedInterestAmount;
      
      if (amount <= 0 || amount > totalDebt * 1.01) return; // Allow 1% buffer for interest accrual
      
      repayLoan(repayDialog.loan.id, amount);
      setRepayDialog({ open: false, loan: null });
      setRepayAmount('');
      
      if (amount >= totalDebt) {
        setSuccessMessage('Loan fully repaid! Collateral will be returned.');
      } else {
        setSuccessMessage(`Successfully repaid ${amount.toFixed(4)} RLUSD. Remaining debt: ${(totalDebt - amount).toFixed(4)} RLUSD`);
      }
      setShowSuccess(true);
    }
  };

  const handleAddCollateral = () => {
    if (addCollateralDialog.loan && collateralAmount) {
      const amount = parseFloat(collateralAmount);
      const oldLTV = addCollateralDialog.loan.currentLTV;
      
      if (amount < 1000 || amount > 10000000) return; // Same validation as loan creation
      
      addCollateral(addCollateralDialog.loan.id, amount);
      setAddCollateralDialog({ open: false, loan: null });
      setCollateralAmount('');
      
      setSuccessMessage(`Added ${amount.toLocaleString()} XPM collateral. Your LTV improved from ${oldLTV.toFixed(1)}% to a lower ratio.`);
      setShowSuccess(true);
    }
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
    if (daysLeft < 0) return { text: 'MATURED', color: 'error' as const };
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, color: 'warning' as const };
    if (daysLeft <= 7) return { text: `${daysLeft}d left`, color: 'info' as const };
    return { text: `${daysLeft}d left`, color: 'success' as const };
  };

  if (!hasLoans) {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No loans yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create your first loan to start borrowing RLUSD against your XPM collateral.
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
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Portfolio Summary
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 4 }, 
          flexWrap: 'wrap',
          justifyContent: { xs: 'space-between', sm: 'flex-start' }
        }}>
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
              {loans.reduce((sum, loan) => sum + (loan.status === 'active' ? loan.borrowedAmount + loan.fixedInterestAmount : 0), 0).toFixed(2)} RLUSD
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

      {/* Loans Table - Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
          <TableBody>
            {loans.map((loan) => {
              const totalDebt = loan.borrowedAmount + loan.fixedInterestAmount;
              const healthColor = getLoanHealthColor(loan.currentLTV);
              const healthText = getLoanHealthText(loan.currentLTV);
              const maturityStatus = getMaturityStatus(loan);
              
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
                      {loan.borrowedAmount.toFixed(2)} RLUSD
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {loan.fixedInterestAmount.toFixed(4)} RLUSD
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {totalDebt.toFixed(2)} RLUSD
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: 'center' }}>
                    <SimpleHealthGauge 
                      value={loan.currentLTV} 
                      size="small" 
                      showLabel={false}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip 
                        label={maturityStatus.text}
                        color={maturityStatus.color}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
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
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      </Box>

      {/* Loans Cards - Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {loans.map((loan) => {
          const totalDebt = loan.borrowedAmount + loan.fixedInterestAmount;
          const healthColor = getLoanHealthColor(loan.currentLTV);
          const healthText = getLoanHealthText(loan.currentLTV);
          const maturityStatus = getMaturityStatus(loan);
          
          return (
            <Paper key={loan.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Loan #{loan.id.slice(-4)}
                </Typography>
                <Chip 
                  label={maturityStatus.text}
                  color={maturityStatus.color}
                  size="small"
                />
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Collateral</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {loan.collateralAmount.toLocaleString()} XPM
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ≈ ${(loan.collateralAmount * marketData.xpmPriceUSD).toFixed(0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Total Debt</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {totalDebt.toFixed(2)} RLUSD
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Interest: {loan.fixedInterestAmount.toFixed(4)} RLUSD
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ 
                mb: 2, 
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center'
              }}>
                <SimpleHealthGauge 
                  value={loan.currentLTV} 
                  size="medium" 
                  showLabel={true}
                />
              </Box>

              {loan.status === 'active' && (
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setRepayDialog({ open: true, loan })}
                      sx={{ flex: 1 }}
                    >
                      Repay
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={() => setAddCollateralDialog({ open: true, loan })}
                      sx={{ flex: 1 }}
                    >
                      Add Collateral
                    </Button>
                  </Box>
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
                </Stack>
              )}
            </Paper>
          );
        })}
      </Box>

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


      {/* Repay Dialog */}
      <Dialog 
        open={repayDialog.open} 
        onClose={() => {
          setRepayDialog({ open: false, loan: null });
          setRepayAmount('');
          setRepayPercentage(100);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Repay Loan</DialogTitle>
        <DialogContent>
          {repayDialog.loan && (() => {
            const totalDebt = repayDialog.loan.borrowedAmount + repayDialog.loan.fixedInterestAmount;
            const maxRepayable = Math.min(totalDebt, walletBalances.rlusd);
            const currentRepayAmount = parseFloat(repayAmount) || 0;
            const remainingDebt = totalDebt - currentRepayAmount;
            
            return (
              <Box sx={{ pt: 2 }}>
                {/* Wallet Balance Display */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                  <Typography variant="caption" color="text.secondary">
                    Your RLUSD Balance
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {walletBalances.rlusd.toFixed(2)} RLUSD
                  </Typography>
                </Paper>

                {/* Debt Information */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Debt
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {totalDebt.toFixed(4)} RLUSD
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Principal
                    </Typography>
                    <Typography variant="body2">
                      {repayDialog.loan.borrowedAmount.toFixed(4)} RLUSD
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Interest
                    </Typography>
                    <Typography variant="body2">
                      {repayDialog.loan.fixedInterestAmount.toFixed(4)} RLUSD
                    </Typography>
                  </Box>
                </Box>

                {/* Manual Input */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Repayment Amount
                  </Typography>
                  <TextField
                    fullWidth
                    value={repayAmount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (value >= 0 && value <= totalDebt) {
                        setRepayAmount(e.target.value);
                        setRepayPercentage((value / totalDebt) * 100);
                      }
                    }}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <Typography variant="body1" sx={{ fontWeight: 500 }}>RLUSD</Typography>,
                      inputProps: { 
                        style: { textAlign: 'right', fontSize: '1.1rem', fontWeight: 500 }
                      }
                    }}
                    type="number"
                  />
                </Box>

                {/* Percentage Slider */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Percentage of debt
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                      {repayPercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Slider
                    value={repayPercentage}
                    onChange={(event, value: number | number[]) => {
                      const percentage = value as number;
                      setRepayPercentage(percentage);
                      const amount = (totalDebt * percentage) / 100;
                      setRepayAmount(amount.toFixed(4));
                    }}
                    min={0}
                    max={100}
                    step={0.1}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: 'Full' }
                    ]}
                    sx={{ 
                      '& .MuiSlider-mark': {
                        backgroundColor: 'primary.main',
                        height: 8,
                        width: 2,
                      },
                      '& .MuiSlider-thumb': {
                        width: 20,
                        height: 20,
                      }
                    }}
                  />
                </Box>

                {/* Repayment Summary */}
                {currentRepayAmount > 0 && (
                  <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                    <Typography variant="body2" color="info.contrastText" gutterBottom>
                      After this payment:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="info.contrastText">
                        Remaining debt:
                      </Typography>
                      <Typography variant="body2" color="info.contrastText" fontWeight={600}>
                        {remainingDebt.toFixed(4)} RLUSD
                      </Typography>
                    </Box>
                    {remainingDebt < 0.01 && (
                      <Typography variant="caption" color="info.contrastText" sx={{ display: 'block', mt: 1 }}>
                        ✓ Loan will be fully repaid and collateral returned
                      </Typography>
                    )}
                  </Paper>
                )}

                {/* Warnings */}
                {currentRepayAmount > walletBalances.rlusd && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Insufficient balance. You only have {walletBalances.rlusd.toFixed(2)} RLUSD
                  </Alert>
                )}
                {currentRepayAmount > totalDebt && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Amount exceeds total debt
                  </Alert>
                )}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRepayDialog({ open: false, loan: null });
            setRepayAmount('');
            setRepayPercentage(100);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleRepay} 
            variant="contained"
            disabled={
              !repayAmount || 
              parseFloat(repayAmount || '0') <= 0 ||
              parseFloat(repayAmount || '0') > walletBalances.rlusd ||
              (repayDialog.loan && parseFloat(repayAmount || '0') > (repayDialog.loan.borrowedAmount + repayDialog.loan.fixedInterestAmount))
            }
          >
            Repay {parseFloat(repayAmount || '0') > 0 ? `${parseFloat(repayAmount).toFixed(2)} RLUSD` : ''}
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
                inputProps={{ step: 1000, min: 1000, max: 10000000 }}
                helperText={
                  parseFloat(collateralAmount || '0') < 1000
                    ? "Minimum 1,000 XPM required"
                    : parseFloat(collateralAmount || '0') > 10000000
                      ? "Maximum 10,000,000 XPM allowed"
                      : `Adding collateral will reduce your LTV and liquidation risk. Worth $${(parseFloat(collateralAmount || '0') * marketData.xpmPriceUSD).toFixed(0)} USD`
                }
                error={parseFloat(collateralAmount || '0') > 0 && (parseFloat(collateralAmount || '0') < 1000 || parseFloat(collateralAmount || '0') > 10000000)}
              />
              {parseFloat(collateralAmount || '0') > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.contrastText">
                    New total collateral: {(addCollateralDialog.loan.collateralAmount + parseFloat(collateralAmount || '0')).toLocaleString()} XPM
                  </Typography>
                  <Typography variant="body2" color="success.contrastText">
                    Estimated new LTV: {((addCollateralDialog.loan.borrowedAmount + addCollateralDialog.loan.fixedInterestAmount) / ((addCollateralDialog.loan.collateralAmount + parseFloat(collateralAmount || '0')) * marketData.xpmPriceUSD) * 100).toFixed(1)}%
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
          <Button 
            onClick={handleAddCollateral} 
            variant="contained" 
            color="secondary"
            disabled={
              !collateralAmount || 
              parseFloat(collateralAmount || '0') < 1000 ||
              parseFloat(collateralAmount || '0') > 10000000
            }
          >
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