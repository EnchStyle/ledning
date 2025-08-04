import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';

const TrueRiskAnalysis: React.FC = () => {
  // Fixed loan parameters
  const collateralXPM = 150000;
  const borrowedXRP = 500;
  const initialXpmUSD = 0.02;
  const initialXrpUSD = 3.00;

  const scenarios = [
    {
      name: 'Initial State',
      xpmPriceUSD: 0.02,
      xrpPriceUSD: 3.00,
      description: 'Starting position'
    },
    {
      name: 'XRP Rises 100%',
      xpmPriceUSD: 0.02,
      xrpPriceUSD: 6.00,
      description: 'XRP doubles in value'
    },
    {
      name: 'XRP Falls 50%',
      xpmPriceUSD: 0.02,
      xrpPriceUSD: 1.50,
      description: 'XRP loses half its value'
    },
    {
      name: 'XPM Rises 50%',
      xpmPriceUSD: 0.03,
      xrpPriceUSD: 3.00,
      description: 'XPM gains 50%'
    },
    {
      name: 'XPM Falls 30%',
      xpmPriceUSD: 0.014,
      xrpPriceUSD: 3.00,
      description: 'XPM drops 30%'
    },
    {
      name: 'Both Rise',
      xpmPriceUSD: 0.03,
      xrpPriceUSD: 4.50,
      description: 'Both assets increase'
    },
    {
      name: 'XRP Up, XPM Down',
      xpmPriceUSD: 0.014,
      xrpPriceUSD: 4.50,
      description: 'Worst case for borrower'
    },
    {
      name: 'XRP Down, XPM Up',
      xpmPriceUSD: 0.03,
      xrpPriceUSD: 1.50,
      description: 'Best case for borrower'
    },
  ];

  const calculateLTV = (xpmPriceUSD: number, xrpPriceUSD: number) => {
    const collateralValueUSD = collateralXPM * xpmPriceUSD;
    const debtValueUSD = borrowedXRP * xrpPriceUSD;
    const ltv = (debtValueUSD / collateralValueUSD) * 100;
    
    return {
      collateralValueUSD,
      debtValueUSD,
      ltv,
      isLiquidated: ltv >= 65, // 65% liquidation threshold
      riskLevel: ltv >= 65 ? 'LIQUIDATED' : ltv >= 55 ? 'High Risk' : ltv >= 40 ? 'Medium Risk' : 'Low Risk'
    };
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LIQUIDATED': return 'error';
      case 'High Risk': return 'error';
      case 'Medium Risk': return 'warning';
      case 'Low Risk': return 'success';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        🎯 The Truth About Dual-Asset Risk
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>CRITICAL INSIGHT:</strong> Both XPM and XRP prices affect liquidation risk because 
          LTV is calculated using USD values as the reference currency, just like in real DeFi protocols.
        </Typography>
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Loan Parameters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Collateral</Typography>
            <Typography variant="h6">{collateralXPM.toLocaleString()} XPM</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Borrowed</Typography>
            <Typography variant="h6">{borrowedXRP} XRP</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Initial XPM</Typography>
            <Typography variant="h6">${initialXpmUSD}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Initial XRP</Typography>
            <Typography variant="h6">${initialXrpUSD}</Typography>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom>
        Complete Scenario Analysis
      </Typography>

      <TableContainer sx={{ maxWidth: '100%', overflow: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Scenario</strong></TableCell>
              <TableCell><strong>XPM Price</strong></TableCell>
              <TableCell><strong>XRP Price</strong></TableCell>
              <TableCell><strong>Collateral Value</strong></TableCell>
              <TableCell><strong>Debt Value</strong></TableCell>
              <TableCell><strong>LTV</strong></TableCell>
              <TableCell><strong>Risk Level</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scenarios.map((scenario) => {
              const calc = calculateLTV(scenario.xpmPriceUSD, scenario.xrpPriceUSD);
              return (
                <TableRow key={scenario.name} sx={{ 
                  bgcolor: calc.isLiquidated ? 'error.dark' : 'inherit',
                  opacity: calc.isLiquidated ? 0.8 : 1
                }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {scenario.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {scenario.description}
                    </Typography>
                  </TableCell>
                  <TableCell>${scenario.xpmPriceUSD.toFixed(3)}</TableCell>
                  <TableCell>${scenario.xrpPriceUSD.toFixed(2)}</TableCell>
                  <TableCell>${calc.collateralValueUSD.toFixed(0)}</TableCell>
                  <TableCell>${calc.debtValueUSD.toFixed(0)}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={calc.isLiquidated ? 'error.light' : 'inherit'}
                    >
                      {calc.ltv.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color={getRiskColor(calc.riskLevel) + '.main'}
                      fontWeight="bold"
                    >
                      {calc.riskLevel}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6" gutterBottom color="error.main">
          🚨 Key Revelations
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Alert severity="error">
              <Typography variant="body2">
                <strong>XRP Rising = DANGER!</strong><br />
                XRP doubling to $6.00 pushes LTV to 100% → Instant liquidation!<br />
                Your $1,500 debt becomes $3,000 debt while collateral stays $3,000.
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>XRP Falling = SAFETY!</strong><br />
                XRP halving to $1.50 drops LTV to 25% → Much safer!<br />
                Your $1,500 debt becomes $750 debt while collateral stays $3,000.
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Alert severity="error">
              <Typography variant="body2">
                <strong>XPM Falling = DANGER!</strong><br />
                XPM dropping 30% pushes LTV to 71% → High risk!<br />
                Your $3,000 collateral becomes $2,100 while debt stays $1,500.
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>XPM Rising = SAFETY!</strong><br />
                XPM rising 50% drops LTV to 33% → Much safer!<br />
                Your $3,000 collateral becomes $4,500 while debt stays $1,500.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>The Bottom Line:</strong> Both asset prices matter because LTV = (XRP_Amount × XRP_USD_Price) ÷ (XPM_Amount × XPM_USD_Price).
          This is how real DeFi protocols work - they use USD as the reference currency for risk calculations.
        </Typography>
      </Alert>

      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Our Current Bug:</strong> The app only simulates XPM price changes, ignoring XRP volatility.
          This gives users a false sense of security about their liquidation risk!
        </Typography>
      </Alert>
    </Paper>
  );
};

export default TrueRiskAnalysis;