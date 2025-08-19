import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  TextField,
  Slider,
  Grid,
  Button,
  Chip,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  IconButton,
  Divider,
  LinearProgress,
  Switch,
  FormControlLabel as MuiFormControlLabel,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Help as HelpIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrowRLUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';
import { LoanTermDays } from '../types/lending';
import RiskVisualization from './RiskVisualization';

interface CalculatorState {
  collateralAmount: number;
  targetLTV: number;
  selectedTerm: LoanTermDays;
  showRiskAnalysis: boolean;
}

const InteractiveLoanCalculator: React.FC = () => {
  const { marketData } = useLending();
  const [state, setState] = useState<CalculatorState>({
    collateralAmount: 150000,
    targetLTV: 40,
    selectedTerm: 60,
    showRiskAnalysis: false,
  });
  
  const [inputMode, setInputMode] = useState<'collateral' | 'borrow'>('collateral');
  const [borrowAmountInput, setBorrowAmountInput] = useState<string>('');

  // Debounced calculation to avoid excessive re-renders
  const [calculationResults, setCalculationResults] = useState<any>(null);
  
  const calculateLoanMetrics = useCallback(() => {
    const { collateralAmount, targetLTV, selectedTerm } = state;
    
    if (collateralAmount <= 0) {
      setCalculationResults(null);
      return;
    }

    const collateralValueUSD = collateralAmount * marketData.xpmPriceUSD;
    const maxBorrowRLUSD = calculateMaxBorrowRLUSD(collateralAmount, marketData.xpmPriceUSD, 50);
    const targetBorrowAmount = (collateralValueUSD * targetLTV) / 100;
    const actualBorrowAmount = Math.min(maxBorrowRLUSD, targetBorrowAmount);
    const actualLTV = (actualBorrowAmount / collateralValueUSD) * 100;
    
    const liquidationPriceUSD = calculateLiquidationPriceUSD(actualBorrowAmount, collateralAmount, 65);
    const priceDropToLiquidation = ((marketData.xpmPriceUSD - liquidationPriceUSD) / marketData.xpmPriceUSD) * 100;
    
    const interestRate = selectedTerm === 30 ? 19 : selectedTerm === 60 ? 16 : 15;
    const dailyRate = interestRate / 365;
    const totalInterest = actualBorrowAmount * (interestRate / 100) * (selectedTerm / 365);
    const totalRepayment = actualBorrowAmount + totalInterest;
    
    // Risk assessment
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let riskColor: 'success' | 'warning' | 'error' = 'success';
    let riskDescription = '';
    
    if (actualLTV < 30) {
      riskLevel = 'low';
      riskColor = 'success';
      riskDescription = 'Very safe position with excellent liquidation buffer';
    } else if (actualLTV < 45) {
      riskLevel = 'medium';
      riskColor = 'warning';
      riskDescription = 'Moderate risk - good balance of capital efficiency and safety';
    } else {
      riskLevel = 'high';
      riskColor = 'error';
      riskDescription = 'Aggressive position - monitor closely for price movements';
    }

    setCalculationResults({
      collateralValueUSD,
      maxBorrowRLUSD,
      actualBorrowAmount,
      actualLTV,
      liquidationPriceUSD,
      priceDropToLiquidation,
      interestRate,
      totalInterest,
      totalRepayment,
      riskLevel,
      riskColor,
      riskDescription,
    });
  }, [state, marketData.xpmPriceUSD]);

  useEffect(() => {
    const timeoutId = setTimeout(calculateLoanMetrics, 300);
    return () => clearTimeout(timeoutId);
  }, [calculateLoanMetrics]);

  const handleCollateralChange = (value: number) => {
    setState(prev => ({ ...prev, collateralAmount: value }));
  };

  const handleLTVChange = (value: number) => {
    setState(prev => ({ ...prev, targetLTV: value }));
  };

  const handleBorrowAmountChange = (value: string) => {
    setBorrowAmountInput(value);
    const borrowAmount = parseFloat(value) || 0;
    if (borrowAmount > 0) {
      const requiredCollateralValue = (borrowAmount * 100) / state.targetLTV;
      const requiredCollateralAmount = requiredCollateralValue / marketData.xpmPriceUSD;
      setState(prev => ({ ...prev, collateralAmount: Math.max(1000, requiredCollateralAmount) }));
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    color = 'primary', 
    tooltip 
  }: { 
    title: string; 
    value: string; 
    subtitle?: string; 
    color?: 'primary' | 'success' | 'warning' | 'error'; 
    tooltip?: string;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip}>
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const RiskIndicator = ({ ltv, riskColor }: { ltv: number; riskColor: 'success' | 'warning' | 'error' }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Risk Level
        </Typography>
        <Chip 
          label={riskColor === 'success' ? 'Conservative' : riskColor === 'warning' ? 'Moderate' : 'Aggressive'}
          color={riskColor}
          size="small"
        />
      </Box>
      <LinearProgress
        variant="determinate"
        value={(ltv / 65) * 100}
        color={riskColor}
        sx={{ 
          height: 8, 
          borderRadius: 1,
          '& .MuiLinearProgress-bar': { borderRadius: 1 }
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color="success.main">
          Safe (0%)
        </Typography>
        <Typography variant="caption" color="error.main">
          Liquidation (65%)
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CalculateIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Interactive Loan Calculator
          </Typography>
        </Box>

        {/* Input Mode Toggle */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Calculation Mode
          </Typography>
          <RadioGroup
            row
            value={inputMode}
            onChange={(e) => setInputMode(e.target.value as 'collateral' | 'borrow')}
          >
            <FormControlLabel
              value="collateral"
              control={<Radio />}
              label="Start with Collateral Amount"
            />
            <FormControlLabel
              value="borrow"
              control={<Radio />}
              label="Start with Desired Loan Amount"
            />
          </RadioGroup>
        </Box>

        <Grid container spacing={4}>
          {/* Input Controls */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Loan Parameters
              </Typography>

              {inputMode === 'collateral' ? (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1">
                      Collateral Amount: {state.collateralAmount.toLocaleString()} XPM
                    </Typography>
                    <Tooltip title="The amount of XPM tokens you want to deposit as collateral">
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Slider
                    value={state.collateralAmount}
                    onChange={(_, value) => handleCollateralChange(value as number)}
                    min={1000}
                    max={1000000}
                    step={1000}
                    marks={[
                      { value: 10000, label: '10K' },
                      { value: 100000, label: '100K' },
                      { value: 500000, label: '500K' },
                      { value: 1000000, label: '1M' }
                    ]}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Or enter exact amount"
                    type="number"
                    value={state.collateralAmount}
                    onChange={(e) => handleCollateralChange(parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 1000, step: 1000 }}
                    size="small"
                  />
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1">
                      Desired Loan Amount
                    </Typography>
                    <Tooltip title="The amount of RLUSD you want to borrow">
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    label="RLUSD Amount"
                    type="number"
                    value={borrowAmountInput}
                    onChange={(e) => handleBorrowAmountChange(e.target.value)}
                    inputProps={{ min: 100, step: 100 }}
                  />
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1">
                    Target LTV: {state.targetLTV}%
                  </Typography>
                  <Tooltip title="Loan-to-Value ratio. Lower values are safer but less capital efficient.">
                    <IconButton size="small">
                      <HelpIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Slider
                  value={state.targetLTV}
                  onChange={(_, value) => handleLTVChange(value as number)}
                  min={20}
                  max={50}
                  step={5}
                  marks={[
                    { value: 20, label: '20%' },
                    { value: 25, label: '25%' },
                    { value: 30, label: '30%' },
                    { value: 35, label: '35%' },
                    { value: 40, label: '40%' },
                    { value: 45, label: '45%' },
                    { value: 50, label: '50%' }
                  ]}
                  color={state.targetLTV > 40 ? 'warning' : 'primary'}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Loan Term
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={state.selectedTerm}
                    onChange={(e) => setState(prev => ({ ...prev, selectedTerm: Number(e.target.value) as LoanTermDays }))}
                  >
                    {[
                      { days: 30, rate: 14 },
                      { days: 60, rate: 15 },
                      { days: 90, rate: 16 }
                    ].map((option) => (
                      <FormControlLabel
                        key={option.days}
                        value={option.days}
                        control={<Radio />}
                        label={`${option.days} days - ${option.rate}% APR`}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>

              <MuiFormControlLabel
                control={
                  <Switch
                    checked={state.showRiskAnalysis}
                    onChange={(e) => setState(prev => ({ ...prev, showRiskAnalysis: e.target.checked }))}
                  />
                }
                label="Show Advanced Risk Analysis"
              />
            </Box>
          </Grid>

          {/* Results Display */}
          <Grid item xs={12} md={6}>
            {calculationResults ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Loan Summary
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <MetricCard
                      title="You'll Receive"
                      value={`${calculationResults.actualBorrowAmount.toFixed(0)} RLUSD`}
                      subtitle={`≈ $${calculationResults.actualBorrowAmount.toFixed(0)} USD`}
                      color="primary"
                      tooltip="Amount of RLUSD you'll receive instantly"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <MetricCard
                      title="Collateral Value"
                      value={`$${calculationResults.collateralValueUSD.toFixed(0)}`}
                      subtitle={`${state.collateralAmount.toLocaleString()} XPM`}
                      color="success"
                      tooltip="USD value of your collateral at current prices"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <MetricCard
                      title="Total Interest"
                      value={`${calculationResults.totalInterest.toFixed(2)} RLUSD`}
                      subtitle={`${calculationResults.interestRate}% APR for ${state.selectedTerm} days`}
                      color="warning"
                      tooltip="Fixed interest calculated upfront for the full term"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <MetricCard
                      title="Total Repayment"
                      value={`${calculationResults.totalRepayment.toFixed(2)} RLUSD`}
                      subtitle="Principal + Interest"
                      color="error"
                      tooltip="Total amount you need to repay to close the loan"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Risk Assessment */}
                <Typography variant="h6" gutterBottom>
                  Risk Assessment
                </Typography>

                <RiskIndicator ltv={calculationResults.actualLTV} riskColor={calculationResults.riskColor} />

                <Alert severity={calculationResults.riskColor} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>{calculationResults.riskLevel.toUpperCase()} RISK:</strong> {calculationResults.riskDescription}
                  </Typography>
                </Alert>

                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Liquidation Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Liquidation Price
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          ${calculationResults.liquidationPriceUSD.toFixed(4)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Price Drop Buffer
                        </Typography>
                        <Typography variant="h6" color={calculationResults.priceDropToLiquidation > 25 ? 'success.main' : 'error.main'}>
                          {calculationResults.priceDropToLiquidation.toFixed(1)}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Market Context:</strong> Current XPM price is ${marketData.xpmPriceUSD.toFixed(4)}. 
                    RLUSD maintains 1:1 USD peg, eliminating debt-side volatility risk.
                  </Typography>
                </Alert>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <CalculateIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">
                  Adjust parameters to see loan calculations
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Advanced Risk Analysis */}
        {state.showRiskAnalysis && calculationResults && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Advanced Risk Analysis
            </Typography>
            <RiskVisualization
              collateralAmount={state.collateralAmount}
              borrowAmount={calculationResults.actualBorrowAmount}
              currentXpmPrice={marketData.xpmPriceUSD}
              currentLTV={calculationResults.actualLTV}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default InteractiveLoanCalculator;