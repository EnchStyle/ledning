import React from 'react';
import { Box, Typography } from '@mui/material';

interface SimpleHealthGaugeProps {
  value: number; // LTV percentage (0-100)
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const SimpleHealthGauge: React.FC<SimpleHealthGaugeProps> = ({ 
  value, 
  size = 'medium',
  showLabel = true
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  // Size configurations
  const sizeConfig = {
    small: { width: 80, height: 80, fontSize: '0.75rem' },
    medium: { width: 100, height: 100, fontSize: '0.875rem' },
    large: { width: 120, height: 120, fontSize: '1rem' }
  };
  
  const config = sizeConfig[size];
  
  // Determine color and status
  const getHealthData = (ltv: number) => {
    if (ltv >= 65) return { color: '#d32f2f', bgColor: '#ffcdd2', status: 'DANGER', textColor: '#c62828' };
    if (ltv >= 55) return { color: '#ff9800', bgColor: '#ffe0b2', status: 'HIGH RISK', textColor: '#e65100' };
    if (ltv >= 40) return { color: '#ffc107', bgColor: '#fff9c4', status: 'MEDIUM', textColor: '#f57f17' };
    return { color: '#4caf50', bgColor: '#c8e6c9', status: 'HEALTHY', textColor: '#1b5e20' };
  };
  
  const healthData = getHealthData(clampedValue);
  
  // Calculate rotation for needle (0° = left/good, 180° = right/bad)
  const rotation = (clampedValue / 100) * 180;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: 1
    }}>
      {/* Circular gauge */}
      <Box sx={{
        position: 'relative',
        width: config.width,
        height: config.width,
        borderRadius: '50%',
        background: `conic-gradient(
          from 180deg,
          #4caf50 0deg ${180 * 0.4}deg,
          #ffc107 ${180 * 0.4}deg ${180 * 0.55}deg,
          #ff9800 ${180 * 0.55}deg ${180 * 0.65}deg,
          #d32f2f ${180 * 0.65}deg 180deg,
          #e0e0e0 180deg 360deg
        )`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: config.width - 16,
          height: config.width - 16,
          borderRadius: '50%',
          bgcolor: healthData.bgColor,
          top: 8,
          left: 8
        }
      }}>
        {/* Value display */}
        <Box sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center'
        }}>
          <Typography sx={{ 
            fontSize: config.fontSize,
            fontWeight: 700,
            color: healthData.textColor,
            lineHeight: 1
          }}>
            {clampedValue.toFixed(0)}%
          </Typography>
          <Typography sx={{ 
            fontSize: '0.6rem',
            color: healthData.textColor,
            fontWeight: 600,
            mt: 0.5
          }}>
            {healthData.status}
          </Typography>
        </Box>
        
        {/* Simple needle indicator */}
        <Box sx={{
          position: 'absolute',
          top: 8,
          left: '50%',
          width: 2,
          height: config.width / 2 - 16,
          bgcolor: healthData.textColor,
          transformOrigin: 'bottom center',
          transform: `translateX(-50%) rotate(${rotation}deg)`,
          borderRadius: 1,
          zIndex: 1
        }} />
        
        {/* Center dot */}
        <Box sx={{
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: healthData.textColor,
          zIndex: 3
        }} />
      </Box>
      
      {showLabel && (
        <Typography variant="caption" color="text.secondary" textAlign="center">
          Loan Health
        </Typography>
      )}
    </Box>
  );
};

export default SimpleHealthGauge;