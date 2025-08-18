import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Button,
  TextField,
  Slider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  AccountBalance as AccountBalanceIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Calculate as CalculateIcon,
  Visibility as VisibilityIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrowRLUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';
import { LoanTermDays } from '../types/lending';

interface RiskLevel {
  name: string;
  color: 'success' | 'warning' | 'error';
  description: string;
  range: [number, number];
}

const ProfessionalDashboard: React.FC = () => {
  const { createLoan, marketData, userPosition, userLoans } = useLending();
  const [collateralAmount, setCollateralAmount] = useState<string>('150000');
  const [selectedTerm, setSelectedTerm] = useState<LoanTermDays>(60);
  const [showWizard, setShowWizard] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'calculator' | 'positions'>('overview');

  const collateral = parseFloat(collateralAmount) || 0;
  const collateralValueUSD = collateral * marketData.xpmPriceUSD;
  const maxBorrowRLUSD = calculateMaxBorrowRLUSD(collateral, marketData.xpmPriceUSD, 50);
  const borrowValueUSD = maxBorrowRLUSD;
  const liquidationPriceUSD = calculateLiquidationPriceUSD(maxBorrowRLUSD, collateral, 65);
  const priceDropToLiquidation = collateral > 0 ? ((marketData.xpmPriceUSD - liquidationPriceUSD) / marketData.xpmPriceUSD) * 100 : 0;

  // Risk assessment levels
  const riskLevels: RiskLevel[] = [
    { name: 'Conservative', color: 'success', description: 'Low liquidation risk', range: [0, 40] },
    { name: 'Moderate', color: 'warning', description: 'Monitor price movements', range: [40, 55] },
    { name: 'Aggressive', color: 'error', description: 'High liquidation risk', range: [55, 65] },
  ];

  const currentLTV = collateral > 0 ? (maxBorrowRLUSD / collateralValueUSD) * 100 : 0;
  const currentRiskLevel = riskLevels.find(level => 
    currentLTV >= level.range[0] && currentLTV < level.range[1]
  ) || riskLevels[0];

  // Portfolio metrics
  const totalCollateralValueUSD = userPosition.totalCollateral * marketData.xpmPriceUSD;
  const totalDebtRLUSD = userPosition.totalBorrowed + userPosition.totalFixedInterest;
  const utilizationRate = totalCollateralValueUSD > 0 ? (totalDebtRLUSD / totalCollateralValueUSD) * 100 : 0;

  const handleCreateLoan = () => {
    if (collateral >= 1000 && collateral <= 10000000) {
      setShowWizard(true);
    }
  };

  const confirmCreateLoan = () => {
    createLoan({
      collateralAmount: collateral,
      borrowAmount: maxBorrowRLUSD,
      interestRate: selectedTerm === 30 ? 14 : selectedTerm === 60 ? 15 : 16,
      liquidationThreshold: 65,
      termDays: selectedTerm,
    });
    setShowWizard(false);
    setConfirmDialog(false);
    setSuccessMessage(`Loan created successfully! You received ${maxBorrowRLUSD.toFixed(0)} RLUSD for ${selectedTerm} days.`);
    setShowSuccess(true);
    setCollateralAmount('150000');
    setActiveStep(0);
  };

  const PortfolioOverview = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Key Metrics Cards */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent sx={{ color: 'white', textAlign: 'center' }}>
            <AccountBalanceIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              ${totalCollateralValueUSD.toFixed(0)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Total Collateral Value
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {userPosition.totalCollateral.toLocaleString()} XPM
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <CardContent sx={{ color: 'white', textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              ${totalDebtRLUSD.toFixed(0)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Outstanding Debt
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {totalDebtRLUSD.toFixed(2)} RLUSD
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <CardContent sx={{ color: 'white', textAlign: 'center' }}>
            <SpeedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {utilizationRate.toFixed(1)}%
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Utilization Rate
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(utilizationRate, 100)}
              sx={{ 
                mt: 1, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                '& .MuiLinearProgress-bar': { bgcolor: 'white' }
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <CardContent sx={{ color: 'white', textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              ${Math.max(0, (totalCollateralValueUSD * 0.5) - totalDebtRLUSD).toFixed(0)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Available to Borrow
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              At 50% LTV
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const LoanCalculator = () => (
    <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CalculateIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Loan Calculator
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Collateral Amount
              </Typography>
              <Tooltip title="The amount of XPM tokens you want to use as collateral. Minimum 1,000 XPM required.">
                <IconButton size="small">
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <TextField
              fullWidth
              label="XPM Amount"
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ min: 1000, step: 1000 }}
              helperText={
                collateral < 1000 
                  ? "Minimum 1,000 XPM required" 
                  : collateral > 10000000 
                    ? "Maximum 10,000,000 XPM allowed"
                    : `Worth $${collateralValueUSD.toFixed(0)} USD at $${marketData.xpmPriceUSD.toFixed(4)}/XPM`
              }
              error={collateral > 0 && (collateral < 1000 || collateral > 10000000)}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current XPM Price: ${marketData.xpmPriceUSD.toFixed(4)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Collateral Value: ${collateralValueUSD.toFixed(2)} USD
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Loan Term
              </Typography>
              <Tooltip title="Choose your loan duration. Longer terms have slightly higher interest rates but provide more flexibility.">
                <IconButton size="small">
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <FormControl component="fieldset">
              <RadioGroup
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(Number(e.target.value) as LoanTermDays)}
              >
                {[
                  { days: 30, rate: 14, popular: false },
                  { days: 60, rate: 15, popular: true },
                  { days: 90, rate: 16, popular: false }
                ].map((option) => (
                  <FormControlLabel
                    key={option.days}
                    value={option.days}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1">
                            {option.days} Days - {option.rate}% APR
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Interest: ~${(maxBorrowRLUSD * option.rate / 100 * option.days / 365).toFixed(2)} RLUSD
                          </Typography>
                        </Box>
                        {option.popular && (
                          <Chip 
                            label="Popular" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 2 }}
                          />
                        )}
                      </Box>
                    }
                    sx={{ mb: 1, alignItems: 'flex-start' }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        </Grid>

        {/* Output Section */}
        <Grid item xs={12} md={6}>
          {collateral > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Loan Details
              </Typography>
              
              {/* Loan Amount */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {maxBorrowRLUSD.toFixed(0)}
                </Typography>
                <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
                  RLUSD (≈ ${borrowValueUSD.toFixed(0)} USD)
                </Typography>
              </Paper>

              {/* Risk Assessment */}
              <Paper sx={{ p: 2, mb: 3, border: `2px solid`, borderColor: `${currentRiskLevel.color}.main` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">
                    Risk Level
                  </Typography>
                  <Chip 
                    label={currentRiskLevel.name}
                    color={currentRiskLevel.color}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {currentRiskLevel.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    LTV: {currentLTV.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">
                    Safety Buffer: {(65 - currentLTV).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(currentLTV / 65) * 100}
                  color={currentRiskLevel.color}
                  sx={{ mt: 1, height: 8, borderRadius: 1 }}
                />
              </Paper>

              {/* Liquidation Info */}
              <Alert 
                severity={priceDropToLiquidation < 20 ? "error" : priceDropToLiquidation < 35 ? "warning" : "info"}
                sx={{ mb: 3 }}
              >
                <Typography variant="body2">
                  <strong>Liquidation Price:</strong> ${liquidationPriceUSD.toFixed(4)} XPM
                  <br />
                  <strong>Price Drop Buffer:</strong> {priceDropToLiquidation.toFixed(1)}%
                </Typography>
              </Alert>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCreateLoan}
                disabled={collateral < 1000 || collateral > 10000000}
                sx={{ 
                  py: 2,
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  borderRadius: 2
                }}
                startIcon={<CheckCircleIcon />}
              >
                Create Loan
              </Button>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <CalculateIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">
                Enter collateral amount to see loan details
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );

  const PositionManagement = () => (
    <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AssessmentIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Your Positions
        </Typography>
      </Box>

      {userLoans.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Collateral</TableCell>
                <TableCell>Borrowed</TableCell>
                <TableCell>LTV</TableCell>
                <TableCell>Term</TableCell>
                <TableCell>Health</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userLoans.map((loan: any, index: number) => {
                const loanLTV = (loan.borrowedAmount / (loan.collateralAmount * marketData.xpmPriceUSD)) * 100;
                const healthColor = loanLTV < 40 ? 'success' : loanLTV < 55 ? 'warning' : 'error';
                
                return (
                  <TableRow key={loan.id || index}>
                    <TableCell>
                      <Typography variant="body2">
                        {loan.collateralAmount.toLocaleString()} XPM
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${(loan.collateralAmount * marketData.xpmPriceUSD).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {loan.borrowedAmount.toFixed(2)} RLUSD
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${loanLTV.toFixed(1)}%`}
                        color={healthColor}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {loan.termDays} days
                    </TableCell>
                    <TableCell>
                      <LinearProgress 
                        variant="determinate" 
                        value={(loanLTV / 65) * 100}
                        color={healthColor}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <TimelineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">
            No active positions
          </Typography>
          <Typography variant="body2">
            Create your first loan to start managing positions
          </Typography>
        </Box>
      )}
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
          Professional Lending Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Sophisticated tools for managing your RLUSD loans with XPM collateral
        </Typography>
      </Box>

      {/* Navigation */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          {[
            { key: 'overview', label: 'Portfolio Overview', icon: <AssessmentIcon /> },
            { key: 'calculator', label: 'Loan Calculator', icon: <CalculateIcon /> },
            { key: 'positions', label: 'Position Management', icon: <TimelineIcon /> },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={currentView === tab.key ? 'contained' : 'text'}
              onClick={() => setCurrentView(tab.key as any)}
              startIcon={tab.icon}
              sx={{ mx: 1 }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Content */}
      {currentView === 'overview' && <PortfolioOverview />}
      {currentView === 'calculator' && <LoanCalculator />}
      {currentView === 'positions' && <PositionManagement />}

      {/* Key Features */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 3, textAlign: 'center', borderRadius: 3 }}>
            <ShieldIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Risk Management
            </Typography>
            <Typography color="text.secondary">
              Advanced risk metrics and real-time monitoring to protect your positions
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 3, textAlign: 'center', borderRadius: 3 }}>
            <VisibilityIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Full Transparency
            </Typography>
            <Typography color="text.secondary">
              Complete visibility into all loan parameters, fees, and market conditions
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 3, textAlign: 'center', borderRadius: 3 }}>
            <SpeedIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Instant Execution
            </Typography>
            <Typography color="text.secondary">
              Get RLUSD liquidity immediately with our automated smart contract system
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Loan Creation Wizard */}
      <Dialog 
        open={showWizard} 
        onClose={() => setShowWizard(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="primary" sx={{ mr: 2 }} />
            Create New Loan
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Review Loan Parameters</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Collateral Amount
                    </Typography>
                    <Typography variant="h6">
                      {collateral.toLocaleString()} XPM
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${collateralValueUSD.toFixed(2)} USD
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Loan Amount
                    </Typography>
                    <Typography variant="h6">
                      {maxBorrowRLUSD.toFixed(0)} RLUSD
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${borrowValueUSD.toFixed(0)} USD
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Term & Rate
                    </Typography>
                    <Typography variant="h6">
                      {selectedTerm} days
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedTerm === 30 ? '14%' : selectedTerm === 60 ? '15%' : '16%'} APR
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Liquidation Price
                    </Typography>
                    <Typography variant="h6">
                      ${liquidationPriceUSD.toFixed(4)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {priceDropToLiquidation.toFixed(1)}% buffer
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                  >
                    Continue
                  </Button>
                </Box>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>Risk Acknowledgment</StepLabel>
              <StepContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Important Risks:</strong>
                  </Typography>
                  <ul style={{ marginTop: 8, marginBottom: 8 }}>
                    <li>Liquidation if LTV reaches 65% due to XPM price decline</li>
                    <li>10% liquidation penalty will be deducted from collateral</li>
                    <li>Interest is calculated upfront for the full term</li>
                    <li>RLUSD maintains 1:1 USD peg, reducing currency risk</li>
                  </ul>
                </Alert>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setConfirmDialog(true)}
                    sx={{ mr: 1 }}
                  >
                    I Understand & Agree
                  </Button>
                  <Button onClick={() => setActiveStep(0)}>
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWizard(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Final Confirmation */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Final Confirmation</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please confirm you want to create this loan:
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2">
              • Deposit: {collateral.toLocaleString()} XPM (${collateralValueUSD.toFixed(0)})
            </Typography>
            <Typography variant="body2">
              • Receive: {maxBorrowRLUSD.toFixed(0)} RLUSD (${borrowValueUSD.toFixed(0)})
            </Typography>
            <Typography variant="body2">
              • Term: {selectedTerm} days at {selectedTerm === 30 ? '14%' : selectedTerm === 60 ? '15%' : '16%'} APR
            </Typography>
            <Typography variant="body2">
              • Liquidation: ${liquidationPriceUSD.toFixed(4)} XPM ({priceDropToLiquidation.toFixed(1)}% buffer)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancel
          </Button>
          <Button onClick={confirmCreateLoan} variant="contained">
            Confirm & Create Loan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfessionalDashboard;