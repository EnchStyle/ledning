import React from 'react';
import { Box, Typography, LinearProgress, Paper, Alert } from '@mui/material';
import { Warning as WarningIcon, Security as SafeIcon, Dangerous as DangerIcon } from '@mui/icons-material';

interface RiskMeterEnhancedProps {
  ltv: number;
  liquidationPrice: number;
  currentPrice: number;
  priceDropBuffer: number;
}

/**
 * REDESIGN COMPONENT: Enhanced risk communication for borrow page
 * Replaces buried risk text with prominent visual risk meter
 * Clear safety zones and plain language explanations
 */
const RiskMeterEnhanced: React.FC<RiskMeterEnhancedProps> = ({ 
  ltv, 
  liquidationPrice, 
  currentPrice, 
  priceDropBuffer 
}) => {
  // Risk assessment logic
  const getRiskLevel = () => {
    if (ltv < 30) return { level: 'SAFE', color: 'success', icon: SafeIcon };
    if (ltv < 45) return { level: 'MODERATE', color: 'warning', icon: WarningIcon };
    return { level: 'HIGH RISK', color: 'error', icon: DangerIcon };
  };

  const risk = getRiskLevel();
  const RiskIcon = risk.icon;

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 3, 
        bgcolor: `${risk.color}.light`,
        border: `2px solid`,
        borderColor: `${risk.color}.main`,
        borderRadius: 2,
      }}
    >
      {/* HEADER: Risk Level with Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <RiskIcon 
          sx={{ 
            fontSize: '2rem', 
            color: `${risk.color}.main`, 
            mr: 1 
          }} 
        />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: `${risk.color}.contrastText` }}>
            Risk Level: {risk.level}
          </Typography>
          <Typography variant="body2" sx={{ color: `${risk.color}.contrastText`, opacity: 0.9 }}>
            Your loan-to-value ratio is {ltv.toFixed(1)}%
          </Typography>
        </Box>
      </Box>

      {/* VISUAL RISK METER */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ color: `${risk.color}.contrastText`, fontWeight: 600 }}>
            Safe Zone
          </Typography>
          <Typography variant="caption" sx={{ color: `${risk.color}.contrastText`, fontWeight: 600 }}>
            Liquidation Zone
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(ltv / 65) * 100} // Max LTV is 65%
          color={risk.color as any}
          sx={{ 
            height: 12, 
            borderRadius: 6,
            bgcolor: `${risk.color}.light`,
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color: `${risk.color}.contrastText` }}>
            0%
          </Typography>
          <Typography variant="caption" sx={{ color: `${risk.color}.contrastText` }}>
            65% (Liquidation)
          </Typography>
        </Box>
      </Box>

      {/* PLAIN LANGUAGE EXPLANATION */}
      <Alert 
        severity={risk.color as any} 
        sx={{ 
          bgcolor: 'transparent',
          border: 'none',
          '& .MuiAlert-message': {
            color: `${risk.color}.contrastText`,
            fontWeight: 500,
          }
        }}
      >
        {ltv < 30 && (
          <>
            <strong>You're in the safe zone!</strong> XPM price can drop {priceDropBuffer.toFixed(1)}% 
            before reaching liquidation at ${liquidationPrice.toFixed(4)}.
          </>
        )}
        {ltv >= 30 && ltv < 45 && (
          <>
            <strong>Moderate risk.</strong> Monitor your position carefully. XPM price can drop {priceDropBuffer.toFixed(1)}% 
            before liquidation at ${liquidationPrice.toFixed(4)}.
          </>
        )}
        {ltv >= 45 && (
          <>
            <strong>High risk!</strong> Your position is near liquidation. Consider adding collateral. 
            Liquidation occurs if XPM drops to ${liquidationPrice.toFixed(4)} (only {priceDropBuffer.toFixed(1)}% away).
          </>
        )}
      </Alert>
    </Paper>
  );
};

export default RiskMeterEnhanced;