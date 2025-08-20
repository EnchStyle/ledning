import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Stack,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  TrendingDown as LiquidatedIcon,
  AccessTime as ActiveIcon,
  AssignmentTurnedIn as RepaidIcon,
  DateRange as DateIcon,
  AccountBalance as CollateralIcon,
  LocalAtm as MoneyIcon,
  Percent as InterestIcon,
  Gavel as LiquidationIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import { Loan } from '../types/lending';
import { FINANCIAL_CONSTANTS } from '../config/demoConstants';

const LoanHistoryLog: React.FC = () => {
  const { loans, marketData, liquidationEvents } = useLending();
  const [expandedLoans, setExpandedLoans] = useState<Set<string>>(new Set());

  const handleExpand = (loanId: string) => {
    setExpandedLoans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(loanId)) {
        newSet.delete(loanId);
      } else {
        newSet.add(loanId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: Loan['status']) => {
    switch (status) {
      case 'active':
        return <ActiveIcon />;
      case 'repaid':
        return <RepaidIcon />;
      case 'liquidated':
        return <LiquidatedIcon />;
      default:
        return <HistoryIcon />;
    }
  };

  const getStatusColor = (status: Loan['status']): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'active':
        return 'warning';
      case 'repaid':
        return 'success';
      case 'liquidated':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number, currency = 'RLUSD') => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getLiquidationDetails = (loan: Loan) => {
    const liquidationEvent = liquidationEvents.find(event => event.loanId === loan.id);
    if (!liquidationEvent) return null;

    const totalDebt = loan.borrowedAmount + loan.fixedInterestAmount;
    const liquidationPenalty = totalDebt * (FINANCIAL_CONSTANTS.LIQUIDATION_FEE / 100);
    const totalToRecover = totalDebt + liquidationPenalty;
    const collateralSold = Math.min(totalToRecover / liquidationEvent.price, loan.collateralAmount);
    const collateralReturned = loan.collateralAmount - collateralSold;

    return {
      liquidationPrice: liquidationEvent.price,
      liquidationDate: liquidationEvent.timestamp,
      collateralSold,
      collateralReturned,
      totalDebt,
      liquidationPenalty,
      totalRecovered: totalToRecover,
    };
  };

  const exportToCSV = () => {
    const headers = [
      'Loan ID',
      'Status',
      'Created Date',
      'Maturity Date',
      'Collateral (XPM)',
      'Borrowed (RLUSD)',
      'Interest Rate (%)',
      'Fixed Interest (RLUSD)',
      'Total Debt (RLUSD)',
      'Initial LTV (%)',
      'Liquidation Price (USD)',
      'Final Status',
      'Liquidation Date',
      'Liquidation XPM Price',
      'Collateral Sold (XPM)',
      'Collateral Returned (XPM)',
      'Liquidation Penalty (RLUSD)'
    ];

    const rows = loans.map(loan => {
      const liquidationDetails = loan.status === 'liquidated' ? getLiquidationDetails(loan) : null;
      const totalDebt = loan.borrowedAmount + loan.fixedInterestAmount;
      // Calculate interest rate from fixed interest amount
      const interestRate = loan.borrowedAmount > 0 
        ? ((loan.fixedInterestAmount / loan.borrowedAmount) * (365 / loan.termDays) * 100).toFixed(2)
        : '0';
      
      return [
        loan.id,
        loan.status,
        formatDate(loan.createdAt),
        formatDate(loan.maturityDate),
        loan.collateralAmount,
        loan.borrowedAmount,
        interestRate,
        loan.fixedInterestAmount,
        totalDebt,
        loan.currentLTV?.toFixed(2) || 'N/A',
        loan.liquidationPrice.toFixed(4),
        loan.status,
        liquidationDetails ? formatDate(liquidationDetails.liquidationDate) : '',
        liquidationDetails ? liquidationDetails.liquidationPrice.toFixed(4) : '',
        liquidationDetails ? liquidationDetails.collateralSold.toFixed(2) : '',
        liquidationDetails ? liquidationDetails.collateralReturned.toFixed(2) : '',
        liquidationDetails ? liquidationDetails.liquidationPenalty.toFixed(2) : ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sortedLoans = [...loans].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon color="primary" sx={{ mr: 2, fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Loan History
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
          size="small"
        >
          Export CSV
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete history of all your loans for tracking and tax purposes
      </Typography>

      {sortedLoans.length === 0 ? (
        <Alert severity="info">
          No loan history yet. Create your first loan to see it here.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {sortedLoans.map((loan) => {
            const isExpanded = expandedLoans.has(loan.id);
            const liquidationDetails = loan.status === 'liquidated' ? getLiquidationDetails(loan) : null;
            const totalDebt = loan.borrowedAmount + loan.fixedInterestAmount;

            return (
              <Accordion
                key={loan.id}
                expanded={isExpanded}
                onChange={() => handleExpand(loan.id)}
                sx={{
                  '&:before': { display: 'none' },
                  boxShadow: 1,
                  '&.Mui-expanded': { boxShadow: 2 },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    '& .MuiAccordionSummary-content': { 
                      alignItems: 'center',
                      gap: 2,
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Chip
                      icon={getStatusIcon(loan.status)}
                      label={loan.status.toUpperCase()}
                      color={getStatusColor(loan.status)}
                      size="small"
                      sx={{ minWidth: 120 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 100 }}>
                      #{loan.id.slice(0, 8)}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatCurrency(loan.borrowedAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(loan.createdAt)}
                    </Typography>
                    {loan.status === 'liquidated' && (
                      <Chip
                        label="LIQUIDATED"
                        color="error"
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Basic Loan Information */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptIcon fontSize="small" /> Loan Details
                          </Typography>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Loan ID</TableCell>
                                <TableCell align="right">{loan.id}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Status</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={loan.status}
                                    color={getStatusColor(loan.status)}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Created</TableCell>
                                <TableCell align="right">{formatDate(loan.createdAt)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Maturity</TableCell>
                                <TableCell align="right">{formatDate(loan.maturityDate)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Term</TableCell>
                                <TableCell align="right">{loan.termDays} days</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Financial Information */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MoneyIcon fontSize="small" /> Financial Details
                          </Typography>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Collateral</TableCell>
                                <TableCell align="right">{loan.collateralAmount.toLocaleString()} XPM</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Borrowed</TableCell>
                                <TableCell align="right">{formatCurrency(loan.borrowedAmount)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Interest Rate</TableCell>
                                <TableCell align="right">
                                  {loan.borrowedAmount > 0 
                                    ? ((loan.fixedInterestAmount / loan.borrowedAmount) * (365 / loan.termDays) * 100).toFixed(2)
                                    : '0'}% APR
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Fixed Interest</TableCell>
                                <TableCell align="right">{formatCurrency(loan.fixedInterestAmount)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Total Debt</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(totalDebt)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Risk Information */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningIcon fontSize="small" /> Risk Parameters
                          </Typography>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Initial LTV</TableCell>
                                <TableCell align="right">{loan.currentLTV?.toFixed(2)}%</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Liquidation LTV</TableCell>
                                <TableCell align="right">{FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV}%</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Liquidation Price</TableCell>
                                <TableCell align="right">${loan.liquidationPrice.toFixed(4)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 0 }}>Creation XPM Price</TableCell>
                                <TableCell align="right">
                                  ${((loan.borrowedAmount / loan.collateralAmount) / (loan.currentLTV! / 100)).toFixed(4)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Liquidation Information (if applicable) */}
                    {loan.status === 'liquidated' && liquidationDetails && (
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                              <LiquidationIcon fontSize="small" /> Liquidation Details
                            </Typography>
                            <Table size="small">
                              <TableBody>
                                <TableRow>
                                  <TableCell sx={{ pl: 0 }}>Liquidation Date</TableCell>
                                  <TableCell align="right">{formatDate(liquidationDetails.liquidationDate)}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ pl: 0 }}>XPM Price at Liquidation</TableCell>
                                  <TableCell align="right">${liquidationDetails.liquidationPrice.toFixed(4)}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ pl: 0 }}>Total Debt</TableCell>
                                  <TableCell align="right">{formatCurrency(liquidationDetails.totalDebt)}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ pl: 0 }}>Liquidation Penalty</TableCell>
                                  <TableCell align="right" sx={{ color: 'error.main' }}>
                                    {formatCurrency(liquidationDetails.liquidationPenalty)}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ pl: 0 }}>Collateral Sold</TableCell>
                                  <TableCell align="right">{liquidationDetails.collateralSold.toFixed(2)} XPM</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ pl: 0 }}>Collateral Returned</TableCell>
                                  <TableCell align="right" sx={{ color: 'success.main' }}>
                                    {liquidationDetails.collateralReturned.toFixed(2)} XPM
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Tax Summary */}
                    <Grid item xs={12}>
                      <Alert severity="info" icon={<ReceiptIcon />}>
                        <Typography variant="subtitle2" gutterBottom>
                          Tax Summary for Loan #{loan.id.slice(0, 8)}
                        </Typography>
                        <Typography variant="body2">
                          • Interest Paid: {formatCurrency(loan.status === 'repaid' ? loan.fixedInterestAmount : 0)}
                          {loan.status === 'liquidated' && liquidationDetails && (
                            <>
                              <br />• Liquidation Loss: {formatCurrency(liquidationDetails.liquidationPenalty)}
                              <br />• Capital Loss: May be deductible based on your jurisdiction
                            </>
                          )}
                          <br />• Keep this record for your tax filings
                        </Typography>
                      </Alert>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

export default LoanHistoryLog;