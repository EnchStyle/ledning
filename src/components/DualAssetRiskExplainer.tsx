import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const DualAssetRiskExplainer: React.FC = () => {
  // Example scenarios showing dual-asset volatility impact
  const scenarios = [
    {
      scenario: 'Initial State',
      xpmPrice: '$0.02',
      xrpPrice: '$3.00',
      collateralValue: '$3,000',
      debtValue: '$1,500',
      ltv: '50%',
      status: 'Safe',
      color: 'success' as const,
    },
    {
      scenario: 'XPM drops 30%',
      xpmPrice: '$0.014',
      xrpPrice: '$3.00',
      collateralValue: '$2,100',
      debtValue: '$1,500',
      ltv: '71%',
      status: 'At Risk',
      color: 'warning' as const,
    },
    {
      scenario: 'XRP rises 20%',
      xpmPrice: '$0.02',
      xrpPrice: '$3.60',
      collateralValue: '$3,000',
      debtValue: '$1,500*',
      ltv: '50%',
      status: 'No Change',
      color: 'success' as const,
    },
    {
      scenario: 'XPM drops (worst case)',
      xpmPrice: '$0.016',
      xrpPrice: '$3.30',
      collateralValue: '$2,400',
      debtValue: '$1,500*',
      ltv: '63%',
      status: 'High Risk',
      color: 'error' as const,
    },
  ];

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <WarningIcon color="warning" />
        <Typography variant="h5">
          Dual-Asset Volatility Risk
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Key Insight:</strong> While both XPM and XRP are volatile, only XPM price changes affect your liquidation risk. 
          Your debt is fixed in XRP tokens, so XRP price movements don't directly impact your loan safety.
        </Typography>
      </Alert>

      <Typography variant="h6" gutterBottom>
        How Price Changes Affect Your Loan
      </Typography>
      
      <Typography variant="body2" paragraph color="text.secondary">
        Example: You deposit 150,000 XPM ($3,000) and borrow 500 XRP ($1,500) at 50% LTV
      </Typography>

      <TableContainer sx={{ maxWidth: '100%', overflow: 'auto' }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell>Scenario</TableCell>
              <TableCell>XPM Price</TableCell>
              <TableCell>XRP Price</TableCell>
              <TableCell>Collateral Value</TableCell>
              <TableCell>Debt Value</TableCell>
              <TableCell>LTV</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scenarios.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.scenario}
                </TableCell>
                <TableCell>{row.xpmPrice}</TableCell>
                <TableCell>{row.xrpPrice}</TableCell>
                <TableCell>{row.collateralValue}</TableCell>
                <TableCell>{row.debtValue}</TableCell>
                <TableCell>{row.ltv}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={row.color} 
                    size="small" 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        *Debt stays at $1,500 (500 XRP) regardless of XRP price changes
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Key Liquidation Triggers
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 2 }}>
          <Paper sx={{ p: 2, bgcolor: 'error.dark', color: 'error.contrastText' }}>
            <Typography variant="subtitle2" gutterBottom>
              ⚠️ Only XPM Price Matters for Liquidation
            </Typography>
            <Typography variant="body2">
              If XPM falls to <strong>$0.0133</strong>, your loan gets liquidated
              (33% drop from $0.02). XRP price changes don't affect liquidation risk.
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Protection Strategy:</strong> Monitor both asset prices and consider:
          <br />• Repaying loans early when either asset moves against you
          <br />• Maintaining lower LTV ratios (30-40%) for safety margin
          <br />• Adding more collateral if XPM drops or XRP rises
        </Typography>
      </Alert>
    </Paper>
  );
};

export default DualAssetRiskExplainer;