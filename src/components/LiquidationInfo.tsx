import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import { useLending } from '../context/LendingContext';

const LiquidationInfo: React.FC = () => {
  const { marketData } = useLending();
  const [expanded, setExpanded] = useState(false);

  // Example calculation
  const exampleLoan = {
    collateral: 150000, // XPM
    borrowed: 200, // XRP
    interest: 5, // XRP
    currentPrice: 0.00667, // XPM/XRP
    liquidationPrice: 0.00432, // XPM/XRP (at 65% LTV liquidation threshold)
  };

  const totalDebt = exampleLoan.borrowed + exampleLoan.interest;
  const liquidationPenalty = totalDebt * (marketData.liquidationFee / 100);
  const totalToRepay = totalDebt + liquidationPenalty;
  const collateralToLiquidate = totalToRepay / exampleLoan.currentPrice;
  const remainingCollateral = exampleLoan.collateral - collateralToLiquidate;

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <InfoIcon color="info" />
        <Typography variant="h5">Liquidation Mechanism</Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Loans are liquidated when LTV reaches 65% to protect lenders from volatile altcoin price movements.
        </Typography>
      </Alert>

      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Key Parameters for Altcoin Lending
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Maximum Initial LTV</TableCell>
                <TableCell align="right">50%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Liquidation Threshold</TableCell>
                <TableCell align="right">65%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Liquidation Penalty</TableCell>
                <TableCell align="right">{marketData.liquidationFee}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Interest Rate (APR)</TableCell>
                <TableCell align="right">15%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Liquidation Example & Calculation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Example Scenario:
            </Typography>
            <Typography variant="body2" paragraph>
              You deposit {exampleLoan.collateral.toLocaleString()} XPM and borrow {exampleLoan.borrowed} XRP at {exampleLoan.currentPrice} XPM/XRP price.
              After some time, you've accrued {exampleLoan.interest} XRP in interest.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Liquidation Calculation:
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Original Borrowed Amount</TableCell>
                    <TableCell align="right">{exampleLoan.borrowed} XRP</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Accrued Interest</TableCell>
                    <TableCell align="right">{exampleLoan.interest} XRP</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Total Debt</strong></TableCell>
                    <TableCell align="right"><strong>{totalDebt} XRP</strong></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Liquidation Penalty (10%)</TableCell>
                    <TableCell align="right">{liquidationPenalty.toFixed(2)} XRP</TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>Total to Recover</strong></TableCell>
                    <TableCell align="right"><strong>{totalToRepay.toFixed(2)} XRP</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Collateral Liquidation:
              </Typography>
              <Typography variant="body2" paragraph>
                At current price ({exampleLoan.currentPrice} XPM/XRP), the liquidator needs:
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>{collateralToLiquidate.toFixed(2)} XPM</strong> to cover {totalToRepay.toFixed(2)} XRP
              </Typography>
              <Typography variant="body2">
                Remaining collateral returned to borrower: <strong>{remainingCollateral.toFixed(2)} XPM</strong>
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> The liquidation penalty incentivizes liquidators to maintain system health
                but reduces the collateral returned to borrowers. Monitor your LTV closely!
              </Typography>
            </Alert>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Why Lower LTV for Altcoins?
        </Typography>
        <Typography variant="body2" paragraph>
          Altcoins like XPM are more volatile than established cryptocurrencies:
        </Typography>
        <ul>
          <li><Typography variant="body2">Higher price volatility requires larger safety margins</Typography></li>
          <li><Typography variant="body2">Lower liquidity can lead to rapid price movements</Typography></li>
          <li><Typography variant="body2">65% liquidation threshold (vs 80-85% for BTC/ETH) protects lenders</Typography></li>
          <li><Typography variant="body2">50% max initial LTV prevents immediate liquidation risk</Typography></li>
        </ul>
      </Box>
    </Paper>
  );
};

export default LiquidationInfo;