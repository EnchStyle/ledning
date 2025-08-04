import React from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLending } from '../context/LendingContext';

interface RiskMeterProps {
  loan?: any;
  currentLTV?: number;
  liquidationPrice?: number;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ loan, currentLTV, liquidationPrice }) => {
  const { marketData } = useLending();
  
  const ltv = currentLTV || (loan?.currentLTV || 0);
  const liquidationThreshold = 65;
  
  // Calculate risk metrics
  const riskPercentage = (ltv / liquidationThreshold) * 100;
  const safetyMargin = liquidationThreshold - ltv;
  
  // Determine risk level and colors
  const getRiskLevel = () => {
    if (ltv >= liquidationThreshold) return { level: 'LIQUIDATED', color: '#d32f2f', bg: '#ffebee' };
    if (ltv >= 55) return { level: 'HIGH RISK', color: '#f57c00', bg: '#fff3e0' };
    if (ltv >= 40) return { level: 'MEDIUM RISK', color: '#ed6c02', bg: '#fff8e1' };
    if (ltv >= 25) return { level: 'LOW RISK', color: '#2e7d32', bg: '#e8f5e8' };
    return { level: 'VERY SAFE', color: '#1976d2', bg: '#e3f2fd' };
  };

  const riskInfo = getRiskLevel();
  
  // Calculate time estimates
  const calculateTimeToLiquidation = () => {
    if (ltv >= liquidationThreshold) return 'LIQUIDATED';
    if (!liquidationPrice || !marketData.xpmPriceUSD) return 'N/A';
    
    // Simplified calculation - in reality would need volatility models
    const priceDropNeeded = marketData.xpmPriceUSD - liquidationPrice;
    const percentageDropNeeded = (priceDropNeeded / marketData.xpmPriceUSD) * 100;
    
    if (percentageDropNeeded <= 5) return '< 1 day (extreme risk)';
    if (percentageDropNeeded <= 15) return '1-7 days (high risk)';
    if (percentageDropNeeded <= 30) return '1-4 weeks (medium risk)';
    return '> 1 month (low risk)';
  };

  const RiskSpeedometer = () => (
    <Box sx={{ position: 'relative', width: 200, height: 100, mx: 'auto', mb: 2 }}>
      {/* Background arc */}
      <svg width="200" height="100" viewBox="0 0 200 100">
        <defs>
          <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4caf50" />
            <stop offset="50%" stopColor="#ff9800" />
            <stop offset="100%" stopColor="#f44336" />
          </linearGradient>
        </defs>
        <path
          d="M 20 80 A 80 80 0 0 1 180 80"
          fill="none"
          stroke="url(#riskGradient)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Needle */}
        <g transform={`rotate(${-90 + (riskPercentage * 1.8)} 100 80)`}>
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="30"
            stroke="#333"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="80" r="6" fill="#333" />
        </g>
      </svg>
      
      {/* Risk level indicator */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: -10, 
        left: '50%', 
        transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        <Typography variant="h6" sx={{ color: riskInfo.color, fontWeight: 'bold' }}>
          {ltv.toFixed(1)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          LTV Ratio
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Paper sx={{ p: 3, bgcolor: riskInfo.bg, border: `2px solid ${riskInfo.color}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SpeedIcon sx={{ color: riskInfo.color, mr: 1 }} />
        <Typography variant="h6" sx={{ color: riskInfo.color, fontWeight: 'bold' }}>
          Risk Assessment
        </Typography>
      </Box>

      <RiskSpeedometer />

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Chip 
          label={riskInfo.level}
          sx={{ 
            bgcolor: riskInfo.color,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            px: 2
          }}
          icon={ltv >= liquidationThreshold ? <WarningIcon /> : 
                ltv >= 40 ? <WarningIcon /> : <CheckCircleIcon />}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: riskInfo.color }}>
              {safetyMargin.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Safety Margin
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: riskInfo.color }}>
              65%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Liquidation Threshold
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: riskInfo.color, fontWeight: 'bold' }}>
              {calculateTimeToLiquidation()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Est. Time to Risk
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={Math.min(riskPercentage, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: riskInfo.color,
              borderRadius: 4
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Safe (0%)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Liquidation (65%)
          </Typography>
        </Box>
      </Box>

      {ltv >= 55 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>High Risk Warning:</strong> Consider repaying part of your loan or adding more collateral to reduce risk.
          </Typography>
        </Alert>
      )}

      {ltv >= liquidationThreshold && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Liquidation Alert:</strong> Your loan is eligible for liquidation. Immediate action required!
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default RiskMeter;