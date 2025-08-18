import React, { useState, useMemo } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Payment as PaymentIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';

interface LoanAction {
  id: string;
  type: 'repay' | 'add_collateral' | 'partial_repay';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

interface LoanAlert {
  id: string;
  loanId: string;
  type: 'liquidation_warning' | 'margin_call' | 'rate_change';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

const AdvancedLoanManagement: React.FC = () => {
  const { userLoans, marketData, repayLoan, addCollateral } = useLending();
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'repay' | 'add_collateral' | 'partial_repay' | null;
    loanId: string;
  }>({ open: false, type: null, loanId: '' });
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [collateralAmount, setCollateralAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);

  // Mock data for demonstration
  const [recentActions] = useState<LoanAction[]>([
    {
      id: '1',
      type: 'partial_repay',
      amount: 500,
      timestamp: new Date(Date.now() - 86400000),
      status: 'confirmed'
    },
    {
      id: '2',
      type: 'add_collateral',
      amount: 10000,
      timestamp: new Date(Date.now() - 172800000),
      status: 'confirmed'
    }
  ]);

  const [loanAlerts] = useState<LoanAlert[]>([
    {
      id: '1',
      loanId: 'loan1',
      type: 'liquidation_warning',
      severity: 'high',
      message: 'LTV approaching 60% - consider adding collateral or partial repayment',
      timestamp: new Date(Date.now() - 3600000),
      acknowledged: false
    }
  ]);

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const totalCollateralValue = userLoans.reduce((sum: number, loan: any) => 
      sum + (loan.collateralAmount * marketData.xpmPriceUSD), 0
    );
    const totalDebtRLUSD = userLoans.reduce((sum: number, loan: any) => 
      sum + loan.borrowedAmount + (loan.fixedInterestAmount || 0), 0
    );
    const avgLTV = totalCollateralValue > 0 ? (totalDebtRLUSD / totalCollateralValue) * 100 : 0;
    const atRiskLoans = userLoans.filter((loan: any) => {
      const loanLTV = (loan.borrowedAmount / (loan.collateralAmount * marketData.xpmPriceUSD)) * 100;
      return loanLTV > 50;
    }).length;

    return {
      totalCollateralValue,
      totalDebtRLUSD,
      avgLTV,
      atRiskLoans,
      totalLoans: userLoans.length
    };
  }, [userLoans, marketData.xpmPriceUSD]);

  const handleLoanAction = (type: 'repay' | 'add_collateral' | 'partial_repay', loanId: string) => {
    setActionDialog({ open: true, type, loanId });
  };

  const executeAction = () => {
    const { type, loanId } = actionDialog;
    const amount = type === 'add_collateral' ? parseFloat(collateralAmount) : parseFloat(repayAmount);
    
    if (type === 'repay') {
      repayLoan(loanId);
    } else if (type === 'partial_repay' && amount > 0) {
      repayLoan(loanId, amount);
    } else if (type === 'add_collateral' && amount > 0) {
      addCollateral(loanId, amount);
    }
    
    setActionDialog({ open: false, type: null, loanId: '' });
    setRepayAmount('');
    setCollateralAmount('');
  };

  const LoanCard = ({ loan, index }: { loan: any; index: number }) => {
    const loanLTV = (loan.borrowedAmount / (loan.collateralAmount * marketData.xpmPriceUSD)) * 100;
    const healthColor: 'success' | 'warning' | 'error' = loanLTV < 40 ? 'success' : loanLTV < 55 ? 'warning' : 'error';
    const liquidationPrice = (loan.borrowedAmount * 1.0) / (loan.collateralAmount * 0.65);
    const priceBuffer = ((marketData.xpmPriceUSD - liquidationPrice) / marketData.xpmPriceUSD) * 100;

    return (
      <Card 
        sx={{ 
          mb: 2, 
          border: selectedLoanId === loan.id ? 2 : 1,
          borderColor: selectedLoanId === loan.id ? 'primary.main' : 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': { boxShadow: 3 }
        }}
        onClick={() => setSelectedLoanId(selectedLoanId === loan.id ? '' : loan.id || `loan-${index}`)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6">
                Loan #{index + 1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loan.termDays} day term • Created {new Date().toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Chip 
                label={`${loanLTV.toFixed(1)}% LTV`}
                color={healthColor}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Health: {healthColor === 'success' ? 'Good' : healthColor === 'warning' ? 'Monitor' : 'At Risk'}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">
                Collateral
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {loan.collateralAmount.toLocaleString()} XPM
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${(loan.collateralAmount * marketData.xpmPriceUSD).toFixed(0)}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">
                Borrowed
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {loan.borrowedAmount.toFixed(0)} RLUSD
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ≈ ${loan.borrowedAmount.toFixed(0)} USD
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">
                Liquidation Price
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                ${liquidationPrice.toFixed(4)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {priceBuffer.toFixed(1)}% buffer
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">
                Interest
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {loan.interestRate}% APR
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ~${((loan.borrowedAmount * loan.interestRate / 100) * (loan.termDays / 365)).toFixed(0)} total
              </Typography>
            </Grid>
          </Grid>

          <LinearProgress
            variant="determinate"
            value={(loanLTV / 65) * 100}
            color={healthColor}
            sx={{ mb: 2, height: 8, borderRadius: 1 }}
          />

          {selectedLoanId === (loan.id || `loan-${index}`) && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Grid container spacing={1}>
                <Grid item>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PaymentIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoanAction('partial_repay', loan.id || `loan-${index}`);
                    }}
                  >
                    Partial Repay
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShieldIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoanAction('add_collateral', loan.id || `loan-${index}`);
                    }}
                  >
                    Add Collateral
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoanAction('repay', loan.id || `loan-${index}`);
                    }}
                  >
                    Repay Full
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const PortfolioSummary = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <AccountBalanceIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              ${portfolioMetrics.totalCollateralValue.toFixed(0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Collateral Value
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUpIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              ${portfolioMetrics.totalDebtRLUSD.toFixed(0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Outstanding Debt
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <SpeedIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {portfolioMetrics.avgLTV.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average LTV
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Badge badgeContent={portfolioMetrics.atRiskLoans} color="error">
              <WarningIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            </Badge>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {portfolioMetrics.totalLoans}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Loans
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const AlertsPanel = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <NotificationsIcon color="primary" sx={{ mr: 2 }} />
        <Typography variant="h6">
          Loan Alerts
        </Typography>
      </Box>
      
      {loanAlerts.length > 0 ? (
        loanAlerts.map((alert) => (
          <Alert 
            key={alert.id}
            severity={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
            sx={{ mb: 1 }}
            action={
              <Button size="small" onClick={() => {}}>
                Acknowledge
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Loan #{alert.loanId}:</strong> {alert.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {alert.timestamp.toLocaleString()}
            </Typography>
          </Alert>
        ))
      ) : (
        <Typography color="text.secondary">
          No active alerts. Your loans are healthy! 🎉
        </Typography>
      )}
    </Paper>
  );

  const RecentActivityPanel = () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TimelineIcon color="primary" sx={{ mr: 2 }} />
        <Typography variant="h6">
          Recent Activity
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Date</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentActions.map((action) => (
              <TableRow key={action.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {action.type === 'repay' && <PaymentIcon sx={{ mr: 1, fontSize: 16 }} />}
                    {action.type === 'add_collateral' && <ShieldIcon sx={{ mr: 1, fontSize: 16 }} />}
                    {action.type === 'partial_repay' && <PaymentIcon sx={{ mr: 1, fontSize: 16 }} />}
                    {action.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {action.type === 'add_collateral' 
                    ? `${action.amount.toLocaleString()} XPM`
                    : `${action.amount} RLUSD`
                  }
                </TableCell>
                <TableCell align="right">
                  {action.timestamp.toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={action.status}
                    color={action.status === 'confirmed' ? 'success' : action.status === 'failed' ? 'error' : 'warning'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Loan Management Dashboard
      </Typography>

      {/* Portfolio Summary */}
      <PortfolioSummary />

      {/* Alerts Panel */}
      <AlertsPanel />

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Active Loans" />
          <Tab label="Recent Activity" />
          <Tab label="Performance Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {userLoans.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your Active Loans ({userLoans.length})
              </Typography>
              {userLoans.map((loan, index) => (
                <LoanCard key={loan.id || index} loan={loan} index={index} />
              ))}
            </Box>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <AccountBalanceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Active Loans
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first loan to start managing your positions
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {activeTab === 1 && <RecentActivityPanel />}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance Analytics
          </Typography>
          <Typography color="text.secondary">
            Advanced analytics and performance metrics coming soon...
          </Typography>
        </Paper>
      )}

      {/* Action Dialog */}
      <Dialog 
        open={actionDialog.open} 
        onClose={() => setActionDialog({ open: false, type: null, loanId: '' })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'repay' && 'Repay Loan'}
          {actionDialog.type === 'partial_repay' && 'Partial Repayment'}
          {actionDialog.type === 'add_collateral' && 'Add Collateral'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.type === 'repay' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                You're about to repay the full loan amount. This will close your position and return your collateral.
              </Typography>
            </Alert>
          )}
          
          {actionDialog.type === 'partial_repay' && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter the amount you'd like to repay (RLUSD)
              </Typography>
              <TextField
                fullWidth
                label="Repayment Amount"
                type="number"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {actionDialog.type === 'add_collateral' && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter additional collateral amount (XPM)
              </Typography>
              <TextField
                fullWidth
                label="Collateral Amount"
                type="number"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: null, loanId: '' })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={executeAction}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedLoanManagement;