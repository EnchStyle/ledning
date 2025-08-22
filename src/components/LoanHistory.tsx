import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Button,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import {
  Download as ExportIcon,
  FilterList as FilterIcon,
  TrendingUp as ProfitIcon,
  TrendingDown as LossIcon,
  Schedule as TimeIcon,
  AccountBalance as LoanIcon,
  Warning as RiskIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import { Loan } from '../types/lending';

interface LoanHistoryStats {
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  liquidatedLoans: number;
  totalBorrowed: number;
  totalInterestPaid: number;
  totalCollateralDeposited: number;
  avgLoanDuration: number;
  successRate: number;
}

const LoanHistory: React.FC = () => {
  const { userLoans, liquidationEvents, marketData, currentTime } = useLending();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate comprehensive loan statistics
  const loanStats = useMemo((): LoanHistoryStats => {
    const totalLoans = userLoans.length;
    const activeLoans = userLoans.filter(loan => loan.status === 'active').length;
    const completedLoans = userLoans.filter(loan => loan.status === 'repaid').length;
    const liquidatedLoans = userLoans.filter(loan => loan.status === 'liquidated').length;
    
    const totalBorrowed = userLoans.reduce((sum, loan) => sum + loan.borrowedAmount, 0);
    
    // Calculate total interest paid (completed loans + active loans)
    const totalInterestPaid = userLoans
      .filter(loan => loan.status === 'repaid' || loan.status === 'liquidated')
      .reduce((sum, loan) => sum + (loan.fixedInterestAmount || 0), 0);
    
    const totalCollateralDeposited = userLoans.reduce((sum, loan) => sum + loan.collateralAmount, 0);
    
    // Calculate average loan duration for completed loans
    const completedLoanDurations = userLoans
      .filter(loan => loan.status === 'repaid' || loan.status === 'liquidated')
      .map(loan => {
        const createdAt = new Date(loan.createdAt);
        const maturityDate = new Date(loan.maturityDate);
        return Math.floor((maturityDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      });
    
    const avgLoanDuration = completedLoanDurations.length > 0 
      ? completedLoanDurations.reduce((sum, duration) => sum + duration, 0) / completedLoanDurations.length
      : 0;
    
    const successRate = totalLoans > 0 ? (completedLoans / totalLoans) * 100 : 0;
    
    return {
      totalLoans,
      activeLoans,
      completedLoans,
      liquidatedLoans,
      totalBorrowed,
      totalInterestPaid,
      totalCollateralDeposited,
      avgLoanDuration,
      successRate,
    };
  }, [userLoans]);

  // Filter and sort loans
  const filteredLoans = useMemo(() => {
    let filtered = [...userLoans];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'borrowedAmount':
          aVal = a.borrowedAmount;
          bVal = b.borrowedAmount;
          break;
        case 'collateralAmount':
          aVal = a.collateralAmount;
          bVal = b.collateralAmount;
          break;
        case 'termDays':
          aVal = a.termDays;
          bVal = b.termDays;
          break;
        case 'currentLTV':
          aVal = a.currentLTV;
          bVal = b.currentLTV;
          break;
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [userLoans, statusFilter, sortBy, sortOrder]);

  const getStatusChip = (status: Loan['status']) => {
    const configs = {
      active: { color: 'primary' as const, icon: <LoanIcon sx={{ fontSize: 16 }} /> },
      repaid: { color: 'success' as const, icon: <SuccessIcon sx={{ fontSize: 16 }} /> },
      liquidated: { color: 'error' as const, icon: <RiskIcon sx={{ fontSize: 16 }} /> },
      matured: { color: 'warning' as const, icon: <TimeIcon sx={{ fontSize: 16 }} /> },
    };
    
    const config = configs[status];
    return (
      <Chip
        icon={config.icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={config.color}
        size="small"
        sx={{ minWidth: 85 }}
      />
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Loan ID',
      'Created Date',
      'Status',
      'Collateral (XPM)',
      'Borrowed (RLUSD)',
      'Interest (RLUSD)',
      'Total Debt (RLUSD)',
      'Term (Days)',
      'Current LTV (%)',
      'Maturity Date'
    ];

    const csvData = filteredLoans.map(loan => [
      loan.id,
      formatDate(loan.createdAt),
      loan.status,
      loan.collateralAmount.toFixed(2),
      loan.borrowedAmount.toFixed(2),
      (loan.fixedInterestAmount || 0).toFixed(4),
      (loan.borrowedAmount + (loan.fixedInterestAmount || 0)).toFixed(2),
      loan.termDays,
      loan.currentLTV.toFixed(2),
      formatDate(loan.maturityDate)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `loan-history-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (userLoans.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <LoanIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          No Loan History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your loan history will appear here once you create your first loan.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Loan History & Analytics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={exportToCSV}
          disabled={filteredLoans.length === 0}
        >
          Export CSV
        </Button>
      </Box>

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LoanIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Loans
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loanStats.totalLoans}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {loanStats.activeLoans} active, {loanStats.completedLoans} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ProfitIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {loanStats.successRate.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Loans repaid without liquidation
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LoanIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Borrowed
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ${loanStats.totalBorrowed.toFixed(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cumulative RLUSD borrowed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimeIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Avg Duration
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loanStats.avgLoanDuration.toFixed(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Days per completed loan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filter & Sort
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Loans</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="repaid">Repaid</MenuItem>
              <MenuItem value="liquidated">Liquidated</MenuItem>
              <MenuItem value="matured">Matured</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="createdAt">Date Created</MenuItem>
              <MenuItem value="borrowedAmount">Borrowed Amount</MenuItem>
              <MenuItem value="collateralAmount">Collateral Amount</MenuItem>
              <MenuItem value="termDays">Loan Term</MenuItem>
              <MenuItem value="currentLTV">Current LTV</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <MenuItem value="desc">Newest First</MenuItem>
              <MenuItem value="asc">Oldest First</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Loan History Table */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Loan Records ({filteredLoans.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Loan ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Collateral (XPM)</TableCell>
                <TableCell align="right">Borrowed (RLUSD)</TableCell>
                <TableCell align="right">Interest</TableCell>
                <TableCell align="right">Total Debt</TableCell>
                <TableCell align="center">Term</TableCell>
                <TableCell align="right">LTV</TableCell>
                <TableCell>Maturity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLoans.map((loan) => {
                const totalDebt = loan.borrowedAmount + (loan.fixedInterestAmount || 0);
                const isOverdue = loan.status === 'active' && new Date(loan.maturityDate) < currentTime;
                
                return (
                  <TableRow key={loan.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        #{loan.id.slice(-6)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDate(loan.createdAt)}
                    </TableCell>
                    <TableCell>
                      {getStatusChip(loan.status)}
                    </TableCell>
                    <TableCell align="right">
                      {loan.collateralAmount.toLocaleString()}
                      <Typography variant="caption" color="text.secondary" display="block">
                        ${(loan.collateralAmount * marketData.xpmPriceUSD).toFixed(0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {loan.borrowedAmount.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {(loan.fixedInterestAmount || 0).toFixed(4)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {totalDebt.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`${loan.termDays}d`} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        color={loan.currentLTV >= 55 ? 'error' : loan.currentLTV >= 40 ? 'warning' : 'success'}
                        sx={{ fontWeight: 500 }}
                      >
                        {loan.currentLTV.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'}>
                        {formatDate(loan.maturityDate)}
                      </Typography>
                      {isOverdue && (
                        <Chip label="OVERDUE" color="error" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredLoans.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No loans match the current filter criteria.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Liquidation Events */}
      {liquidationEvents.length > 0 && (
        <Paper sx={{ mt: 3 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" color="error">
              Liquidation Events ({liquidationEvents.length})
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            {liquidationEvents.slice(0, 5).map((event, index) => (
              <Alert key={index} severity="error" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Loan #{event.loanId.slice(-6)}</strong> liquidated on{' '}
                  {formatDate(event.timestamp)} at XPM price ${event.price.toFixed(4)}
                  <br />
                  Collateral: {event.collateral.toLocaleString()} XPM, 
                  Debt: ${event.debt.toFixed(2)} RLUSD
                </Typography>
              </Alert>
            ))}
            {liquidationEvents.length > 5 && (
              <Typography variant="caption" color="text.secondary">
                ... and {liquidationEvents.length - 5} more liquidation events
              </Typography>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default LoanHistory;