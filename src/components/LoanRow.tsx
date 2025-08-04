import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Button,
  Chip,
  Typography,
  Collapse,
  IconButton,
  Box,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Loan } from '../types/lending';
import LiquidationPreview from './LiquidationPreview';

interface LoanRowProps {
  loan: Loan;
  onRepayClick: (loan: Loan) => void;
  onLiquidateClick: (loanId: string) => void;
  getLTVColor: (ltv: number) => string;
  getStatusColor: (status: Loan['status']) => 'success' | 'error' | 'default';
}

const LoanRow: React.FC<LoanRowProps> = ({
  loan,
  onRepayClick,
  onLiquidateClick,
  getLTVColor,
  getStatusColor,
}) => {
  const [open, setOpen] = useState(false);
  const totalDebt = loan.borrowedAmount + loan.accruedInterest;
  const isLiquidatable = loan.currentLTV >= 65 && loan.status === 'active';
  const showPreview = loan.currentLTV >= 55 && loan.status === 'active';

  return (
    <>
      <TableRow>
        <TableCell>
          {showPreview && (
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </TableCell>
        <TableCell>
          <Chip
            label={loan.status}
            color={getStatusColor(loan.status)}
            size="small"
          />
        </TableCell>
        <TableCell align="right">{loan.collateralAmount.toFixed(2)}</TableCell>
        <TableCell align="right">{loan.borrowedAmount.toFixed(2)}</TableCell>
        <TableCell align="right">{loan.accruedInterest.toFixed(4)}</TableCell>
        <TableCell align="right">{totalDebt.toFixed(4)}</TableCell>
        <TableCell align="right">
          <Typography color={getLTVColor(loan.currentLTV)}>
            {loan.currentLTV.toFixed(2)}%
          </Typography>
        </TableCell>
        <TableCell align="right">{loan.liquidationPrice.toFixed(4)}</TableCell>
        <TableCell align="center">
          {loan.status === 'active' && (
            <>
              <Button
                size="small"
                onClick={() => onRepayClick(loan)}
                sx={{ mr: 1 }}
              >
                Repay
              </Button>
              {isLiquidatable && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => onLiquidateClick(loan.id)}
                >
                  Liquidate
                </Button>
              )}
            </>
          )}
        </TableCell>
      </TableRow>
      {showPreview && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <LiquidationPreview loan={loan} />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default LoanRow;