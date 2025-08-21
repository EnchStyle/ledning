import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Tooltip,
  Fab,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  TrendingUp as PerformanceIcon,
  Warning as RiskIcon,
  CheckCircle as SafeIcon,
  Payment as RepayIcon,
  Add as AddCollateralIcon,
  Dashboard as OverviewIcon,
  Security as HealthIcon,
  MonetizationOn as EarningsIcon,
  Add as QuickActionIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import SmartTooltip from './SmartTooltip';
import { FINANCIAL_CONSTANTS } from '../config/demoConstants';
import { logger } from '../utils/logger';

interface LoanCardProps {
  loan: any;
  index: number;
  marketData: any;
  onAction: (type: 'repay' | 'add_collateral', loanId: string, loanIndex: number) => void;
  onFullRepayment: (loanId: string, loanIndex: number, totalDebt: number) => void;
  getLoanHealthColor: (ltv: number) => string;
  getLoanHealthIcon: (ltv: number) => React.ReactElement;
}

const LoanCard = React.memo<LoanCardProps>(({ 
  loan, 
  index, 
  marketData, 
  onAction, 
  onFullRepayment,
  getLoanHealthColor,
  getLoanHealthIcon
}) => {
  const totalDebt = loan.borrowedAmount + (loan.fixedInterestAmount || 0);
  const collateralValue = loan.collateralAmount * marketData.xpmPriceUSD;
  const ltv = (totalDebt / collateralValue) * 100;
  const daysRemaining = Math.ceil(
    (new Date(loan.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card sx={{ mb: 3, '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Loan #{index + 1}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={loan.status === 'active' ? 'Active' : loan.status === 'matured' ? 'Matured' : 'Liquidated'}
                color={loan.status === 'active' ? 'success' : loan.status === 'matured' ? 'warning' : 'error'}
                size="small"
                sx={{ mb: 1 }}
              />
              {loan.status === 'active' && (
                <Chip 
                  icon={getLoanHealthIcon(ltv)}
                  label={ltv < 30 ? 'Excellent' : ltv < 45 ? 'Good' : ltv < 55 ? 'Fair' : 'At Risk'}
                  color={getLoanHealthColor(ltv) as any}
                  size="small"
                />
              )}
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {ltv.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              LTV Ratio
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Collateral
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {loan.collateralAmount.toLocaleString()} XPM
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              ${collateralValue.toFixed(0)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Borrowed
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {loan.borrowedAmount.toFixed(0)} RLUSD
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              +{(loan.fixedInterestAmount || 0).toFixed(0)} interest
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Total Debt
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {totalDebt.toFixed(0)} RLUSD
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Time Left
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {daysRemaining} days
            </Typography>
          </Grid>
        </Grid>

        {/* Health Bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Loan Health</Typography>
            <Typography variant="caption" color="text.secondary">
              Liquidation at {FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(ltv / FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV) * 100}
            color={getLoanHealthColor(ltv) as any}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        {/* Actions - Mobile Optimized */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 }, 
          flexWrap: 'wrap',
          '& .MuiButton-root': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 1, sm: 2 },
            py: { xs: 0.5, sm: 1 }
          }
        }}>
          {loan.status === 'active' ? (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RepayIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />}
                onClick={() => onAction('repay', loan.id || `loan-${index}`, index)}
                sx={{ minWidth: { xs: 80, sm: 'auto' } }}
              >
                Repay
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddCollateralIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />}
                onClick={() => onAction('add_collateral', loan.id || `loan-${index}`, index)}
                sx={{ minWidth: { xs: 100, sm: 'auto' } }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Add Collateral
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  Add Col.
                </Box>
              </Button>
              <Button
                variant="contained"
                size="small"
                color="success"
                onClick={() => onFullRepayment(loan.id || `loan-${index}`, index, totalDebt)}
                sx={{ minWidth: { xs: 90, sm: 'auto' } }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Full Repayment
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  Full Pay
                </Box>
              </Button>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              {loan.status === 'matured' ? 'Loan term has expired' : 'Loan has been liquidated'}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

interface ActionDialogState {
  open: boolean;
  type: 'repay' | 'add_collateral' | null;
  loanId: string;
  loanIndex: number;
}

const OptimizedPortfolio: React.FC = () => {
  const { userLoans, marketData, repayLoan, addCollateral, walletBalances } = useLending();
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    open: false,
    type: null,
    loanId: '',
    loanIndex: -1
  });
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [collateralAmount, setCollateralAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState<string>('');

  // Portfolio calculations with memoization for performance
  const portfolioMetrics = useMemo(() => {
    const activeLoans = userLoans.filter(loan => loan.status === 'active');
    
    if (activeLoans.length === 0) {
      return {
        totalCollateralValue: 0,
        totalDebt: 0,
        avgLTV: 0,
        healthyLoans: 0,
        atRiskLoans: 0,
        totalEarnings: 0,
        activeLoans: 0,
        maturedLoans: userLoans.filter(loan => loan.status === 'matured').length,
        liquidatedLoans: userLoans.filter(loan => loan.status === 'liquidated').length
      };
    }

    const totalCollateralValue = activeLoans.reduce((sum, loan) => 
      sum + (loan.collateralAmount * marketData.xpmPriceUSD), 0
    );
    
    const totalDebt = activeLoans.reduce((sum, loan) => 
      sum + loan.borrowedAmount + (loan.fixedInterestAmount || 0), 0
    );
    
    const avgLTV = totalCollateralValue > 0 ? (totalDebt / totalCollateralValue) * 100 : 0;
    
    const healthyLoans = activeLoans.filter(loan => {
      const loanDebt = loan.borrowedAmount + (loan.fixedInterestAmount || 0);
      const loanValue = loan.collateralAmount * marketData.xpmPriceUSD;
      const ltv = (loanDebt / loanValue) * 100;
      return ltv < 45;
    }).length;
    
    const atRiskLoans = activeLoans.filter(loan => {
      const loanDebt = loan.borrowedAmount + (loan.fixedInterestAmount || 0);
      const loanValue = loan.collateralAmount * marketData.xpmPriceUSD;
      const ltv = (loanDebt / loanValue) * 100;
      return ltv >= 55;
    }).length;

    const totalEarnings = userLoans.reduce((sum, loan) => 
      sum + (loan.fixedInterestAmount || 0), 0
    );

    return {
      totalCollateralValue,
      totalDebt,
      avgLTV,
      healthyLoans,
      atRiskLoans,
      totalEarnings,
      activeLoans: activeLoans.length,
      maturedLoans: userLoans.filter(loan => loan.status === 'matured').length,
      liquidatedLoans: userLoans.filter(loan => loan.status === 'liquidated').length
    };
  }, [userLoans, marketData.xpmPriceUSD]);

  const handleAction = useCallback((type: 'repay' | 'add_collateral', loanId: string, loanIndex: number) => {
    console.log('🔥 BUTTON CLICKED:', type, loanId, loanIndex);
    setActionDialog({ open: true, type, loanId, loanIndex });
    setRepayAmount('');
    setCollateralAmount('');
  }, []);

  const executeAction = useCallback(async () => {
    console.log('💰 EXECUTE ACTION:', actionDialog.type, actionDialog.loanId, repayAmount);
    if (!actionDialog.type || actionDialog.loanIndex < 0) return;
    
    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // UX feedback delay
      
      if (actionDialog.type === 'repay') {
        const amount = repayAmount ? parseFloat(repayAmount) : undefined;
        console.log('💸 CALLING REPAY LOAN:', actionDialog.loanId, amount);
        repayLoan(actionDialog.loanId, amount);
        setNotification(amount 
          ? `Repaid ${amount.toFixed(0)} RLUSD successfully`
          : 'Loan fully repaid successfully'
        );
      } else if (actionDialog.type === 'add_collateral' && collateralAmount) {
        const amount = parseFloat(collateralAmount);
        addCollateral(actionDialog.loanId, amount);
        setNotification(`Added ${amount.toLocaleString()} XPM collateral successfully`);
      }
      
      setActionDialog({ open: false, type: null, loanId: '', loanIndex: -1 });
    } catch (error) {
      logger.error('Execute action error', error, 'OptimizedPortfolio.executeAction', { actionType: actionDialog.type, loanId: actionDialog.loanId, repayAmount, collateralAmount });
      setNotification('Transaction failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [actionDialog.type, actionDialog.loanIndex, actionDialog.loanId, repayAmount, collateralAmount, repayLoan, addCollateral]);

  const getLoanHealthColor = useCallback((ltv: number) => {
    if (ltv < 30) return 'success';
    if (ltv < 45) return 'info';
    if (ltv < 55) return 'warning';
    return 'error';
  }, []);

  const getLoanHealthIcon = useCallback((ltv: number) => {
    if (ltv < 45) return <SafeIcon color="success" />;
    if (ltv < 55) return <RiskIcon color="warning" />;
    return <RiskIcon color="error" />;
  }, []);

  if (userLoans.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <OverviewIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Portfolio
          </Typography>
        </Box>
        
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.default' }}>
          <WalletIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No Active Loans
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Start building your portfolio by creating your first loan. Use your XPM tokens as collateral to borrow RLUSD stablecoins.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Available balance: <strong>{walletBalances.xpm.toLocaleString()} XPM</strong>
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            disabled
          >
            Switch to "Borrow" tab to get started
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <OverviewIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Portfolio Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {portfolioMetrics.activeLoans} active • {portfolioMetrics.maturedLoans} matured • {portfolioMetrics.liquidatedLoans} liquidated
            </Typography>
          </Box>
        </Box>
        
        {portfolioMetrics.atRiskLoans > 0 && (
          <Alert severity="warning" sx={{ maxWidth: 300 }}>
            <Typography variant="body2">
              {portfolioMetrics.atRiskLoans} loan{portfolioMetrics.atRiskLoans > 1 ? 's' : ''} need attention
            </Typography>
          </Alert>
        )}
      </Box>


      {/* Wallet Balance */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1a1f2e 0%, #252a3e 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WalletIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Your Wallet</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">XPM Balance</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {walletBalances.xpm.toLocaleString()} XPM
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ≈ ${(walletBalances.xpm * marketData.xpmPriceUSD).toLocaleString()} USD
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">RLUSD Balance</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {walletBalances.rlusd.toLocaleString()} RLUSD
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ≈ ${walletBalances.rlusd.toLocaleString()} USD
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Portfolio Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EarningsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Total Collateral</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ${portfolioMetrics.totalCollateralValue.toFixed(0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RepayIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Total Debt</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ${portfolioMetrics.totalDebt.toFixed(0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HealthIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Avg LTV</Typography>
                <SmartTooltip 
                  helpText="Average Loan-to-Value across all your loans. Keep this below 50% to avoid liquidation risk."
                  placement="top"
                  size="small"
                />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: getLoanHealthColor(portfolioMetrics.avgLTV) + '.main' }}>
                {portfolioMetrics.avgLTV.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PerformanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Loan Health</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {portfolioMetrics.healthyLoans}/{userLoans.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Individual Loans */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Your Loans
      </Typography>
      
      {userLoans.map((loan, index) => (
        <LoanCard
          key={loan.id || index}
          loan={loan}
          index={index}
          marketData={marketData}
          onAction={handleAction}
          onFullRepayment={(loanId, loanIndex, totalDebt) => {
            setActionDialog({ 
              open: true, 
              type: 'repay', 
              loanId, 
              loanIndex 
            });
            setRepayAmount(totalDebt.toString());
          }}
          getLoanHealthColor={getLoanHealthColor}
          getLoanHealthIcon={getLoanHealthIcon}
        />
      ))}

      {/* Action Dialog */}
      <Dialog 
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: null, loanId: '', loanIndex: -1 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'repay' ? 'Repay Loan' : 'Add Collateral'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {actionDialog.type === 'repay' ? (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter repayment amount (RLUSD) or leave empty for full repayment
              </Typography>
              <TextField
                fullWidth
                label="Repayment Amount"
                type="number"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                sx={{ mb: 2 }}
                helperText="Leave empty for full repayment"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter additional collateral amount (XPM)
              </Typography>
              <TextField
                fullWidth
                label="Additional Collateral"
                type="number"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                sx={{ mb: 2 }}
                helperText={`Available: ${walletBalances.xpm.toLocaleString()} XPM`}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: null, loanId: '', loanIndex: -1 })}>
            Cancel
          </Button>
          <Button 
            onClick={executeAction} 
            variant="contained"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification('')}
        message={notification}
        action={
          <Button color="inherit" size="small" onClick={() => setNotification('')}>
            <CloseIcon fontSize="small" />
          </Button>
        }
      />
    </Box>
  );
};

export default OptimizedPortfolio;
