import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Typography,
} from '@mui/material';
import { useLending } from '../context/LendingContext';
import { Loan } from '../types/lending';
import LoanRow from './LoanRow';

const UserPositions: React.FC = () => {
  const { loans, repayLoan, liquidateLoan } = useLending();
  const [repayDialogOpen, setRepayDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [repayAmount, setRepayAmount] = useState('');

  const handleRepayClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setRepayDialogOpen(true);
  };

  const handleRepay = () => {
    if (selectedLoan && repayAmount) {
      repayLoan(selectedLoan.id, parseFloat(repayAmount));
      setRepayDialogOpen(false);
      setRepayAmount('');
      setSelectedLoan(null);
    }
  };

  const getStatusColor = (status: Loan['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'liquidated':
        return 'error';
      case 'repaid':
        return 'default';
    }
  };

  const getLTVColor = (ltv: number) => {
    if (ltv >= 65) return 'error';
    if (ltv >= 55) return 'warning';
    return 'inherit';
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Status</TableCell>
              <TableCell align="right">Collateral (XPM)</TableCell>
              <TableCell align="right">Borrowed (XRP)</TableCell>
              <TableCell align="right">Interest (XRP)</TableCell>
              <TableCell align="right">Total Debt (XRP)</TableCell>
              <TableCell align="right">LTV %</TableCell>
              <TableCell align="right">Liquidation Price</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((loan) => (
              <LoanRow
                key={loan.id}
                loan={loan}
                onRepayClick={handleRepayClick}
                onLiquidateClick={liquidateLoan}
                getLTVColor={getLTVColor}
                getStatusColor={getStatusColor}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={repayDialogOpen} onClose={() => setRepayDialogOpen(false)}>
        <DialogTitle>Repay Loan</DialogTitle>
        <DialogContent>
          {selectedLoan && (
            <>
              <Typography variant="body2" gutterBottom>
                Total Debt: {(selectedLoan.borrowedAmount + selectedLoan.accruedInterest).toFixed(4)} XRP
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Repay Amount (XRP)"
                type="number"
                fullWidth
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRepayDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRepay} variant="contained">
            Repay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserPositions;