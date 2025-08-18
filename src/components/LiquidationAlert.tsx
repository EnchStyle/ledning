import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Collapse,
  IconButton,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Close as CloseIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';

const LiquidationAlert: React.FC = () => {
  const { userLoans, marketData, liquidationEvents } = useLending();
  const [showAlert, setShowAlert] = useState(true);
  const [recentLiquidation, setRecentLiquidation] = useState<any>(null);
  
  // Check for at-risk loans
  const atRiskLoans = userLoans.filter(loan => {
    if (loan.status !== 'active') return false;
    const ltv = loan.currentLTV || 0;
    return ltv > 50; // Warning when above 50%
  });

  const criticalLoans = atRiskLoans.filter(loan => {
    const ltv = loan.currentLTV || 0;
    return ltv > 60; // Critical when above 60%
  });

  // Monitor liquidation events
  useEffect(() => {
    if (liquidationEvents && liquidationEvents.length > 0) {
      const latest = liquidationEvents[liquidationEvents.length - 1];
      const userLiquidation = userLoans.find(loan => 
        loan.id === latest.loanId && loan.status === 'liquidated'
      );
      
      if (userLiquidation) {
        setRecentLiquidation(latest);
        setShowAlert(true);
      }
    }
  }, [liquidationEvents, userLoans]);

  if (!showAlert || (atRiskLoans.length === 0 && !recentLiquidation)) {
    return null;
  }

  // Show liquidation alert if a loan was just liquidated
  if (recentLiquidation) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 3 }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setShowAlert(false);
              setRecentLiquidation(null);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ mr: 1 }} />
          Loan Liquidated!
        </AlertTitle>
        <Typography variant="body2">
          Your loan was liquidated at XPM price <strong>${recentLiquidation.price.toFixed(4)}</strong>
          <br />
          Collateral: {recentLiquidation.collateral.toLocaleString()} XPM
          <br />
          Outstanding debt: {recentLiquidation.debt.toFixed(2)} RLUSD
        </Typography>
      </Alert>
    );
  }

  // Show warning for at-risk loans
  return (
    <Collapse in={showAlert}>
      <Alert 
        severity={criticalLoans.length > 0 ? "error" : "warning"}
        sx={{ mb: 3 }}
        icon={<TrendingDownIcon />}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => setShowAlert(false)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle>
          {criticalLoans.length > 0 
            ? `⚠️ ${criticalLoans.length} Loan${criticalLoans.length > 1 ? 's' : ''} at Critical Risk!`
            : `Margin Call Warning - ${atRiskLoans.length} Loan${atRiskLoans.length > 1 ? 's' : ''} at Risk`
          }
        </AlertTitle>
        
        <Box sx={{ mt: 2 }}>
          {atRiskLoans.map((loan, index) => {
            const ltv = loan.currentLTV || 0;
            const isCritical = ltv > 60;
            const liquidationPrice = loan.liquidationPrice || 0;
            const priceBuffer = ((marketData.xpmPriceUSD - liquidationPrice) / marketData.xpmPriceUSD) * 100;
            
            return (
              <Box key={loan.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Loan #{index + 1}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={`LTV: ${ltv.toFixed(1)}%`}
                      color={isCritical ? "error" : "warning"}
                      size="small"
                    />
                    <Chip 
                      label={`Buffer: ${priceBuffer.toFixed(1)}%`}
                      color={priceBuffer < 10 ? "error" : "default"}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={(ltv / 65) * 100}
                  color={isCritical ? "error" : "warning"}
                  sx={{ height: 6, borderRadius: 1, mb: 1 }}
                />
                
                <Typography variant="caption" color="text.secondary">
                  Liquidation at ${liquidationPrice.toFixed(4)} XPM 
                  {isCritical && " - Add collateral or repay immediately!"}
                </Typography>
              </Box>
            );
          })}
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2 }}>
          Current XPM Price: <strong>${marketData.xpmPriceUSD.toFixed(4)}</strong>
          {criticalLoans.length > 0 && (
            <Box component="span" sx={{ color: 'error.main', ml: 1 }}>
              • Take action now to avoid liquidation!
            </Box>
          )}
        </Typography>
      </Alert>
    </Collapse>
  );
};

export default LiquidationAlert;