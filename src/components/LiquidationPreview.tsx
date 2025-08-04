import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
} from '@mui/material';
import { Loan } from '../types/lending';
import { useLending } from '../context/LendingContext';
import { calculateLiquidationReturn } from '../utils/lendingCalculations';

interface LiquidationPreviewProps {
  loan: Loan;
}

const LiquidationPreview: React.FC<LiquidationPreviewProps> = ({ loan }) => {
  const { marketData } = useLending();
  
  const liquidationResult = calculateLiquidationReturn(
    loan,
    marketData.xpmPrice,
    marketData.liquidationFee
  );

  const collateralValue = loan.collateralAmount * marketData.xpmPrice;
  const remainingCollateral = loan.collateralAmount - liquidationResult.collateralToReturn;
  const remainingValue = remainingCollateral * marketData.xpmPrice;

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Liquidation Preview
      </Typography>
      
      <TableContainer>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Current Collateral</TableCell>
              <TableCell align="right">{loan.collateralAmount.toFixed(2)} XPM</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Collateral Value</TableCell>
              <TableCell align="right">{collateralValue.toFixed(2)} XRP</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Debt</TableCell>
              <TableCell align="right">{liquidationResult.totalDebt.toFixed(2)} XRP</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Liquidation Penalty ({marketData.liquidationFee}%)</TableCell>
              <TableCell align="right">{liquidationResult.liquidationPenalty.toFixed(2)} XRP</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Collateral to Liquidate</strong></TableCell>
              <TableCell align="right">
                <strong>{liquidationResult.collateralToReturn.toFixed(2)} XPM</strong>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Remaining Collateral</TableCell>
              <TableCell align="right">
                {remainingCollateral.toFixed(2)} XPM ({remainingValue.toFixed(2)} XRP)
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {loan.currentLTV >= 60 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Your loan is approaching liquidation threshold! Consider repaying to reduce LTV.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default LiquidationPreview;