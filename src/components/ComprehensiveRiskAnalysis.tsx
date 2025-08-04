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
  TextField,
  Button,
  Divider,
} from '@mui/material';

const ComprehensiveRiskAnalysis: React.FC = () => {
  const [collateralXPM, setCollateralXPM] = useState(150000);
  const [borrowedXRP, setBorrowedXRP] = useState(500);
  const [currentXpmPrice, setCurrentXpmPrice] = useState(0.02);
  const [currentXrpPrice, setCurrentXrpPrice] = useState(3.0);

  // Test different scenarios
  const scenarios = [
    { name: 'Initial State', xpmPrice: 0.02, xrpPrice: 3.0 },
    { name: 'XPM drops 30%', xpmPrice: 0.014, xrpPrice: 3.0 },
    { name: 'XRP drops 50%', xpmPrice: 0.02, xrpPrice: 1.5 },
    { name: 'XRP rises 100%', xpmPrice: 0.02, xrpPrice: 6.0 },
    { name: 'Both drop', xpmPrice: 0.014, xrpPrice: 1.5 },
    { name: 'XPM up, XRP down', xpmPrice: 0.03, xrpPrice: 1.5 },
  ];

  const calculateScenario = (xpmPrice: number, xrpPrice: number) => {
    // Method 1: Fixed XRP debt (current implementation)
    const collateralValueUSD_M1 = collateralXPM * xpmPrice;
    const debtValueUSD_M1 = borrowedXRP * 3.0; // Original XRP price
    const ltv_M1 = (debtValueUSD_M1 / collateralValueUSD_M1) * 100;

    // Method 2: Variable XRP debt (if we use current XRP price)
    const collateralValueUSD_M2 = collateralXPM * xpmPrice;
    const debtValueUSD_M2 = borrowedXRP * xrpPrice; // Current XRP price
    const ltv_M2 = (debtValueUSD_M2 / collateralValueUSD_M2) * 100;

    // Method 3: XRP/XPM ratio approach
    const xrpPerXpm = xrpPrice / xpmPrice;
    const collateralInXRP = collateralXPM / xrpPerXpm;
    const ltv_M3 = (borrowedXRP / collateralInXRP) * 100;

    return {
      method1: { collateralValueUSD_M1, debtValueUSD_M1, ltv: ltv_M1 },
      method2: { collateralValueUSD_M2, debtValueUSD_M2, ltv: ltv_M2 },
      method3: { ltv: ltv_M3 },
      xrpPerXpm,
    };
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        🔬 Comprehensive Risk Analysis: ALL Scenarios
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Critical Analysis:</strong> Let's determine once and for all how XRP price movements affect liquidation risk.
          We'll test 3 different calculation methods to see which is correct.
        </Typography>
      </Alert>

      {/* Input Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <TextField
            size="small"
            label="Collateral (XPM)"
            type="number"
            value={collateralXPM}
            onChange={(e) => setCollateralXPM(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            size="small"
            label="Borrowed (XRP)"
            type="number"
            value={borrowedXRP}
            onChange={(e) => setBorrowedXRP(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            size="small"
            label="XPM Price ($)"
            type="number"
            value={currentXpmPrice}
            onChange={(e) => setCurrentXpmPrice(Number(e.target.value))}
            inputProps={{ step: 0.001 }}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            size="small"
            label="XRP Price ($)"
            type="number"
            value={currentXrpPrice}
            onChange={(e) => setCurrentXrpPrice(Number(e.target.value))}
            inputProps={{ step: 0.1 }}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Scenario Comparison
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Scenario</strong></TableCell>
              <TableCell><strong>XPM Price</strong></TableCell>
              <TableCell><strong>XRP Price</strong></TableCell>
              <TableCell><strong>Method 1: Fixed Debt USD</strong></TableCell>
              <TableCell><strong>Method 2: Variable Debt USD</strong></TableCell>
              <TableCell><strong>Method 3: XRP/XPM Ratio</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scenarios.map((scenario) => {
              const calc = calculateScenario(scenario.xpmPrice, scenario.xrpPrice);
              return (
                <TableRow key={scenario.name}>
                  <TableCell>{scenario.name}</TableCell>
                  <TableCell>${scenario.xpmPrice.toFixed(3)}</TableCell>
                  <TableCell>${scenario.xrpPrice.toFixed(1)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      LTV: {calc.method1.ltv.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Debt: ${calc.method1.debtValueUSD_M1.toFixed(0)} (fixed)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      LTV: {calc.method2.ltv.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Debt: ${calc.method2.debtValueUSD_M2.toFixed(0)} (variable)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      LTV: {calc.method3.ltv.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ratio: {calc.xrpPerXpm.toFixed(0)} XRP/XPM
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          🤔 Which Method is Correct?
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'warning.dark', color: 'warning.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                Method 1: Fixed USD Debt
              </Typography>
              <Typography variant="body2">
                Debt value locked at original USD amount ($1,500).
                Only XPM price affects LTV.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'error.dark', color: 'error.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                Method 2: Variable USD Debt
              </Typography>
              <Typography variant="body2">
                Debt value changes with XRP price.
                Both XPM and XRP prices affect LTV.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'success.dark', color: 'success.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                Method 3: Token Ratio
              </Typography>
              <Typography variant="body2">
                LTV based on XRP/XPM ratio.
                Both prices matter equally.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>The Truth:</strong> In DeFi lending, Method 3 (token ratio) is typically correct.
          Your debt is 500 XRP tokens, and your collateral is 150,000 XPM tokens.
          The liquidation happens when the ratio of these tokens crosses the threshold,
          which means BOTH asset prices affect your risk!
        </Typography>
      </Alert>

      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Key Insight:</strong> XRP falling is actually WORSE for borrowers than XRP rising!
          <br />• XRP drops 50%: Your 500 XRP debt becomes "cheaper" but so does the collateral comparison
          <br />• XRP rises 100%: Your collateral becomes more valuable relative to the debt
        </Typography>
      </Alert>
    </Paper>
  );
};

export default ComprehensiveRiskAnalysis;