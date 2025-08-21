import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  IconButton,
  Paper,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorOutlineIcon,
  Dangerous as DangerousIcon,
  Savings as CollateralIcon,
  CreditCard as DebtIcon,
  Percent as LTVIcon,
  Payments as PaymentIcon,
  AddCircleOutline as AddIcon,
  ReceiptLong as ReceiptIcon,
  Timeline as TimelineIcon,
  HelpOutline as HelpIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import { DEMO_PORTFOLIO, FINANCIAL_CONSTANTS } from '../config/demoConstants';
import PortfolioChart from './PortfolioChart';
import LiquidationAlert from './LiquidationAlert';
import { Loan } from '../types/lending';
import { calculateLTV, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';

interface ActionDialog {
  open: boolean;
  type: 'repay' | 'add_collateral' | null;
  loanId: string;
  loanIndex: number;
}

interface PortfolioDashboardProps {}

const PortfolioDashboard: React.FC<PortfolioDashboardProps> = () => {
  // Throttle component rendering logs
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  
  const { userLoans, marketData, repayLoan, addCollateral, walletBalances } = useLending();
  
  if (renderCount.current % 20 === 0) { // Only log every 20th render
    console.log('🏦 PortfolioDashboard: Rendered', renderCount.current, 'times, userLoans:', userLoans.length, 'price:', marketData.xpmPriceUSD.toFixed(4));
  }
  const [actionDialog, setActionDialog] = useState<ActionDialog>({
    open: false,
    type: null,
    loanId: '',
    loanIndex: -1,
  });
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [collateralAmount, setCollateralAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Use dynamic wallet balance
  const walletBalance = walletBalances.xpm;

  // Portfolio calculations using useState to avoid memoization issues
  const [portfolioStats, setPortfolioStats] = React.useState({ totalCollateralValue: 0, totalDebtRLUSD: 0, avgLTV: 0, availableToBorrow: 0, atRiskLoans: 0 });
  const lastStatsUpdate = React.useRef(0);
  
  // Update portfolio stats with throttling
  React.useEffect(() => {
    // Don't update stats during simulation to prevent freezing
    if (typeof window !== 'undefined' && (window as Window & { __simulationPaused?: boolean }).__simulationPaused) {
      return;
    }
    
    const now = Date.now();
    // Throttle updates to every 5 seconds during simulation
    if (now - lastStatsUpdate.current < 5000 && portfolioStats.totalCollateralValue > 0) {
      return;
    }
    lastStatsUpdate.current = now;
    
    console.log('🏦 PortfolioDashboard: Updating portfolio stats (throttled)');
    const totalCollateralValue = userLoans.reduce((sum, loan) => 
      sum + (loan.collateralAmount * marketData.xpmPriceUSD), 0
    );
    const totalDebtRLUSD = userLoans.reduce((sum, loan) => 
      sum + loan.borrowedAmount + (loan.fixedInterestAmount || 0), 0
    );
    const avgLTV = totalCollateralValue > 0 ? (totalDebtRLUSD / totalCollateralValue) * 100 : 0;
    const availableToBorrow = Math.max(0, (totalCollateralValue * (FINANCIAL_CONSTANTS.LTV_LIMITS.MAX_LTV / 100)) - totalDebtRLUSD);
    const atRiskLoans = userLoans.filter(loan => {
      const loanLTV = ((loan.borrowedAmount + loan.fixedInterestAmount) / (loan.collateralAmount * marketData.xpmPriceUSD)) * 100;
      return loanLTV > FINANCIAL_CONSTANTS.LTV_LIMITS.MAX_LTV;
    }).length;
    
    setPortfolioStats({
      totalCollateralValue,
      totalDebtRLUSD,
      avgLTV,
      availableToBorrow,
      atRiskLoans
    });
  }, [userLoans.length, marketData.xpmPriceUSD]); // Minimal dependencies
  
  const { totalCollateralValue, totalDebtRLUSD, avgLTV, availableToBorrow, atRiskLoans } = portfolioStats;

  const handleAction = (type: 'repay' | 'add_collateral', loanId: string, loanIndex: number) => {
    setActionDialog({ open: true, type, loanId, loanIndex });
  };

  const handleFullRepayment = (loanId: string, loanIndex: number, totalDebt: number) => {
    setActionDialog({ open: true, type: 'repay', loanId, loanIndex });
    setRepayAmount(totalDebt.toString());
  };

  const executeAction = async () => {
    const { type, loanId, loanIndex } = actionDialog;
    setIsProcessing(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (type === 'repay') {
        const amount = repayAmount ? parseFloat(repayAmount) : undefined;
        const loan = userLoans[loanIndex];
        const totalDebt = loan.borrowedAmount + (loan.fixedInterestAmount || 0);
        
        if (amount && (amount <= 0 || amount > totalDebt)) {
          setErrorMessage('Invalid repayment amount');
          return;
        }
        
        repayLoan(loanId, amount);
        setSuccessMessage(amount ? `Repaid ${amount.toFixed(2)} RLUSD` : 'Loan fully repaid!');
      } else if (type === 'add_collateral' && collateralAmount) {
        const amount = parseFloat(collateralAmount);
        if (amount <= 0 || amount > walletBalance) {
          setErrorMessage('Invalid collateral amount');
          return;
        }
        
        addCollateral(loanId, amount);
        setSuccessMessage(`Added ${amount.toLocaleString()} XPM collateral`);
      }

      setActionDialog({ open: false, type: null, loanId: '', loanIndex: -1 });
      setRepayAmount('');
      setCollateralAmount('');
    } catch (error) {
      setErrorMessage('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getLoanHealth = (loan: Loan) => {
    const totalDebt = loan.borrowedAmount + (loan.fixedInterestAmount || 0);
    const loanLTV = (totalDebt / (loan.collateralAmount * marketData.xpmPriceUSD)) * 100;
    const liquidationPrice = (totalDebt / (loan.collateralAmount * (FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV / 100)));
    const priceBuffer = ((marketData.xpmPriceUSD - liquidationPrice) / marketData.xpmPriceUSD) * 100;

    let status, color, description, icon;
    if (loanLTV < 30) {
      status = 'Excellent';
      color = 'success';
      description = 'Very safe position';
      icon = <SecurityIcon />;
    } else if (loanLTV < 45) {
      status = 'Good';
      color = 'info';
      description = 'Healthy position';
      icon = <CheckIcon />;
    } else if (loanLTV < 55) {
      status = 'Fair';
      color = 'warning';
      description = 'Monitor closely';
      icon = <WarningIcon />;
    } else if (loanLTV < 62) {
      status = 'At Risk';
      color = 'error';
      description = 'Near liquidation';
      icon = <ErrorOutlineIcon />;
    } else {
      status = 'Critical';
      color = 'error';
      description = 'Immediate liquidation risk';
      icon = <DangerousIcon />;
    }

    return {
      ltv: loanLTV,
      liquidationPrice,
      priceBuffer,
      status,
      color,
      description,
      icon,
    };
  };

  const PortfolioOverview = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} lg={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CollateralIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Your Deposit
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              ${totalCollateralValue.toFixed(0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userLoans.reduce((sum, loan) => sum + loan.collateralAmount, 0).toLocaleString()} XPM
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon fontSize="small" color="success" />
              <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                +0.0% (24h)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DebtIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Amount Borrowed
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              ${totalDebtRLUSD.toFixed(0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalDebtRLUSD.toFixed(2)} RLUSD
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Fixed interest model
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LTVIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Loan Risk Level
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {avgLTV.toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(avgLTV / FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV) * 100}
              color={avgLTV > 50 ? 'warning' : 'primary'}
              sx={{ height: 6, borderRadius: 1, mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Danger Zone at {FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                You Can Still Borrow
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
              ${availableToBorrow.toFixed(0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {availableToBorrow.toFixed(2)} RLUSD
            </Typography>
            <Typography variant="caption" color="text.secondary">
              At current {FINANCIAL_CONSTANTS.LTV_LIMITS.MAX_LTV}% max LTV
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const LoanCard = ({ loan, index }: { loan: Loan; index: number }) => {
    const health = getLoanHealth(loan);
    const totalDebt = loan.borrowedAmount + (loan.fixedInterestAmount || 0);
    const daysUntilMaturity = Math.ceil((new Date(loan.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
      <Card sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Loan #{index + 1}
              </Typography>
              <Chip 
                label={health.status}
                color={health.color as 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'}
                size="small"
                icon={health.icon}
              />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {health.ltv.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Risk Level
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Your Deposit
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {loan.collateralAmount.toLocaleString()} XPM
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${(loan.collateralAmount * marketData.xpmPriceUSD).toFixed(0)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Borrowed
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {loan.borrowedAmount.toFixed(0)} RLUSD
              </Typography>
              <Typography variant="caption" color="text.secondary">
                +{(loan.fixedInterestAmount || 0).toFixed(0)} interest
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Debt
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {totalDebt.toFixed(0)} RLUSD
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ≈ ${totalDebt.toFixed(0)} USD
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Due In
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {daysUntilMaturity} days
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {loan.termDays} day term
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Loan Safety
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Danger if XPM drops to ${health.liquidationPrice.toFixed(4)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(health.ltv / 65) * 100}
              color={health.color as 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'}
              sx={{ height: 8, borderRadius: 1, mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {health.description} • {health.priceBuffer.toFixed(1)}% price drop buffer
            </Typography>
          </Box>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Loan Actions & Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Created</Typography>
                  <Typography variant="body2">{new Date(loan.createdAt).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Interest Rate</Typography>
                  <Typography variant="body2">{FINANCIAL_CONSTANTS.INTEREST_RATES[loan.termDays] || FINANCIAL_CONSTANTS.INTEREST_RATES[60]}% APR</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Current XPM Price</Typography>
                  <Typography variant="body2">${marketData.xpmPriceUSD.toFixed(4)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body2">{loan.status}</Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PaymentIcon />}
                  onClick={() => handleAction('repay', loan.id || `loan-${index}`, index)}
                >
                  Repay
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAction('add_collateral', loan.id || `loan-${index}`, index)}
                >
                  Add Collateral
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<ReceiptIcon />}
                  onClick={() => handleFullRepayment(loan.id || `loan-${index}`, index, totalDebt)}
                >
                  Full Repayment
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  if (userLoans.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Portfolio Dashboard
        </Typography>
        
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <CollateralIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Active Loans
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first loan to start building your lending portfolio.
            <br />
            You have {walletBalance.toLocaleString()} XPM available as collateral.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => {}}
            disabled
            sx={{ opacity: 0.7 }}
          >
            Go to "🚀 Get Started" Tab to Create Loan
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Portfolio Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor your loans and overall position health
          </Typography>
        </Box>
        {atRiskLoans > 0 && (
          <Alert severity="warning" sx={{ maxWidth: 300 }}>
            <Typography variant="body2">
              {atRiskLoans} loan{atRiskLoans > 1 ? 's' : ''} at risk of liquidation
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Liquidation Alert */}
      <LiquidationAlert />

      {/* Wallet Balances */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1a1f2e 0%, #252a3e 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WalletIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Your Wallet
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                XPM Balance
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {walletBalances.xpm.toLocaleString()} XPM
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ≈ ${(walletBalances.xpm * marketData.xpmPriceUSD).toLocaleString()} USD
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                RLUSD Balance
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {walletBalances.rlusd.toLocaleString()} RLUSD
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ≈ ${walletBalances.rlusd.toLocaleString()} USD
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Portfolio Overview */}
      <PortfolioOverview />

      {/* Portfolio Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TimelineIcon color="primary" sx={{ mr: 2 }} />
          <Typography variant="h6">Portfolio Performance</Typography>
          <Tooltip title="Track your collateral value and debt over time">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <PortfolioChart />
      </Paper>

      {/* Individual Loans */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Your Loans ({userLoans.length})
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Monitor each loan's health and take action when needed
        </Typography>

        {userLoans.map((loan, index) => (
          <LoanCard key={loan.id || index} loan={loan} index={index} />
        ))}
      </Box>

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
        <DialogContent>
          {actionDialog.type === 'repay' ? (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter the amount you want to repay (RLUSD)
              </Typography>
              <TextField
                fullWidth
                label="Repayment Amount"
                type="number"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                sx={{ mb: 2 }}
                error={(() => {
                  if (!repayAmount) return false;
                  const amount = parseFloat(repayAmount);
                  const loan = userLoans[actionDialog.loanIndex];
                  const totalDebt = loan ? loan.borrowedAmount + (loan.fixedInterestAmount || 0) : 0;
                  return amount > totalDebt || amount <= 0;
                })()}
                helperText={(() => {
                  if (!repayAmount) return "Leave empty for full repayment";
                  const amount = parseFloat(repayAmount);
                  const loan = userLoans[actionDialog.loanIndex];
                  const totalDebt = loan ? loan.borrowedAmount + (loan.fixedInterestAmount || 0) : 0;
                  if (amount > totalDebt) return "Amount exceeds total debt";
                  if (amount <= 0) return "Amount must be greater than 0";
                  return `Repaying ${repayAmount} RLUSD of ${totalDebt.toFixed(2)} total debt`;
                })()}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <Alert severity="info">
                Partial repayments reduce your debt and improve loan health
              </Alert>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
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
                error={(() => {
                  if (!collateralAmount) return false;
                  const amount = parseFloat(collateralAmount);
                  return amount > walletBalance || amount <= 0;
                })()}
                helperText={(() => {
                  if (!collateralAmount) return `Available: ${walletBalance.toLocaleString()} XPM`;
                  const amount = parseFloat(collateralAmount);
                  if (amount > walletBalance) return "Insufficient balance";
                  if (amount <= 0) return "Amount must be greater than 0";
                  return `Adding ${collateralAmount} XPM (${walletBalance.toLocaleString()} available)`;
                })()}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <Alert severity="info">
                Adding collateral reduces your LTV and liquidation risk
              </Alert>
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
            disabled={isProcessing || (() => {
              if (actionDialog.type === 'repay') {
                if (!repayAmount) return false; // Allow empty for full repayment
                const amount = parseFloat(repayAmount);
                const loan = userLoans[actionDialog.loanIndex];
                const totalDebt = loan ? loan.borrowedAmount + (loan.fixedInterestAmount || 0) : 0;
                return amount > totalDebt || amount <= 0;
              } else if (actionDialog.type === 'add_collateral') {
                if (!collateralAmount) return true;
                const amount = parseFloat(collateralAmount);
                return amount > walletBalance || amount <= 0;
              }
              return false;
            })()}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={4000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Memoize with custom comparison to only re-render when loans actually change
const MemoizedPortfolioDashboard = React.memo(PortfolioDashboard);

MemoizedPortfolioDashboard.displayName = 'PortfolioDashboard';

export default MemoizedPortfolioDashboard;