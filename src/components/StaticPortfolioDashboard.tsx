/**
 * StaticPortfolioDashboard - Frozen snapshot version that doesn't update during simulation
 * This prevents freezing by showing static data when simulation is active
 */
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
  TrendingDown as TrendingDownIcon,
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
  PauseCircleFilled as PauseIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';

interface StaticPortfolioDashboardProps {
  onNavigateToBorrow?: () => void;
}

const StaticPortfolioDashboard: React.FC<StaticPortfolioDashboardProps> = ({ onNavigateToBorrow }) => {
  const { userLoans, marketData, simulationSettings, repayLoan, addCollateral } = useLending();
  
  // Freeze data snapshot when component mounts
  const [frozenData] = useState(() => ({
    userLoans: [...userLoans],
    marketData: { ...marketData },
    timestamp: new Date().toLocaleTimeString()
  }));

  // Use frozen data for all calculations to prevent updates
  const workingLoans = frozenData.userLoans;
  const workingPrice = frozenData.marketData.xpmPriceUSD;

  // Demo wallet balance
  const walletBalance = 2000000;

  // Static portfolio calculations using frozen data
  const portfolioStats = React.useMemo(() => {
    const totalCollateralValue = workingLoans.reduce((sum, loan) => 
      sum + (loan.collateralAmount * workingPrice), 0
    );
    const totalDebtRLUSD = workingLoans.reduce((sum, loan) => 
      sum + loan.borrowedAmount + (loan.fixedInterestAmount || 0), 0
    );
    const avgLTV = totalCollateralValue > 0 ? (totalDebtRLUSD / totalCollateralValue) * 100 : 0;
    const availableToBorrow = Math.max(0, (totalCollateralValue * 0.5) - totalDebtRLUSD);
    const atRiskLoans = workingLoans.filter(loan => {
      const loanLTV = ((loan.borrowedAmount + loan.fixedInterestAmount) / (loan.collateralAmount * workingPrice)) * 100;
      return loanLTV > 50;
    }).length;
    
    return {
      totalCollateralValue,
      totalDebtRLUSD,
      avgLTV,
      availableToBorrow,
      atRiskLoans
    };
  }, []); // Empty deps - never recalculates

  const { totalCollateralValue, totalDebtRLUSD, avgLTV, availableToBorrow, atRiskLoans } = portfolioStats;

  const getLoanHealth = (loan: any) => {
    const totalDebt = loan.borrowedAmount + (loan.fixedInterestAmount || 0);
    const loanLTV = (totalDebt / (loan.collateralAmount * workingPrice)) * 100;
    const liquidationPrice = (totalDebt / (loan.collateralAmount * 0.65));
    const priceBuffer = ((workingPrice - liquidationPrice) / workingPrice) * 100;

    let status, color, description;
    if (loanLTV < 30) {
      status = 'Excellent';
      color = 'success';
      description = 'Very safe position';
    } else if (loanLTV < 45) {
      status = 'Good';
      color = 'info';
      description = 'Healthy position';
    } else if (loanLTV < 55) {
      status = 'Fair';
      color = 'warning';
      description = 'Monitor closely';
    } else {
      status = 'At Risk';
      color = 'error';
      description = 'Near liquidation';
    }

    return {
      ltv: loanLTV,
      liquidationPrice,
      priceBuffer,
      status,
      color,
      description,
    };
  };

  if (workingLoans.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Portfolio Dashboard
        </Typography>
        
        {simulationSettings.isActive && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PauseIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                Portfolio view is paused during simulation to prevent freezing. 
                Data frozen at {frozenData.timestamp}
              </Typography>
            </Box>
          </Alert>
        )}
        
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
            onClick={onNavigateToBorrow}
          >
            Create Your First Loan
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

      {/* Simulation Pause Notice */}
      {simulationSettings.isActive && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PauseIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Portfolio frozen during simulation</strong> - Data snapshot from {frozenData.timestamp} 
              (XPM: ${workingPrice.toFixed(4)}). Navigate away and back to refresh.
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Portfolio Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CollateralIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Collateral
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${totalCollateralValue.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {workingLoans.reduce((sum, loan) => sum + loan.collateralAmount, 0).toLocaleString()} XPM
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Frozen snapshot
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
                  Outstanding Debt
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
                  Portfolio LTV
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {avgLTV.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(avgLTV / 65) * 100}
                color={avgLTV > 50 ? 'warning' : 'primary'}
                sx={{ height: 6, borderRadius: 1, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Liquidation at 65%
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
                  Available to Borrow
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
                ${availableToBorrow.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {availableToBorrow.toFixed(2)} RLUSD
              </Typography>
              <Typography variant="caption" color="text.secondary">
                At current 50% max LTV
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Individual Loans */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Your Loans ({workingLoans.length}) - Snapshot View
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Loan actions are disabled during simulation to prevent conflicts
        </Typography>

        {workingLoans.map((loan, index) => {
          const health = getLoanHealth(loan);
          const totalDebt = loan.borrowedAmount + (loan.fixedInterestAmount || 0);
          const daysUntilMaturity = Math.ceil((new Date(loan.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <Card key={loan.id || index} sx={{ mb: 2, opacity: simulationSettings.isActive ? 0.8 : 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Loan #{index + 1} {simulationSettings.isActive && '(Snapshot)'}
                    </Typography>
                    <Chip 
                      label={health.status}
                      color={health.color as any}
                      size="small"
                      icon={health.color === 'error' ? <WarningIcon /> : <CheckIcon />}
                    />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {health.ltv.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      LTV Ratio (Frozen)
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Collateral
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {loan.collateralAmount.toLocaleString()} XPM
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${(loan.collateralAmount * workingPrice).toFixed(0)}
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
                      Maturity
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {daysUntilMaturity} days
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {loan.termDays} day term
                    </Typography>
                  </Grid>
                </Grid>

                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Loan actions are disabled during simulation. Stop simulation to manage loans.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>Performance Mode:</strong> Portfolio data is frozen during simulation to prevent freezing. 
          This is a static snapshot taken at {frozenData.timestamp}.
        </Typography>
      </Alert>
    </Box>
  );
};

export default StaticPortfolioDashboard;