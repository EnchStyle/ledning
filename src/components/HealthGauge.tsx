import React from 'react';
import { Box, Typography } from '@mui/material';

interface HealthGaugeProps {
  value: number; // LTV percentage (0-100)
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
}

const HealthGauge: React.FC<HealthGaugeProps> = ({ 
  value, 
  size = 'medium', 
  showLabel = true,
  label = 'Loan Health'
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  // Size configurations
  const sizeConfig = {
    small: { width: 120, height: 80, thickness: 8, fontSize: '0.875rem' },
    medium: { width: 180, height: 120, thickness: 12, fontSize: '1.125rem' },
    large: { width: 240, height: 160, thickness: 16, fontSize: '1.5rem' }
  };
  
  const config = sizeConfig[size];
  
  // Calculate rotation angle (-90 to 90 degrees)
  // 0% = -90deg (full left/green), 65% = 0deg (top/red), 100% = 90deg (full right/red)
  const rotation = (clampedValue / 100) * 180 - 90;
  
  // Determine color based on LTV
  const getColor = (ltv: number) => {
    if (ltv >= 65) return '#d32f2f'; // Red - Liquidation zone
    if (ltv >= 55) return '#ff9800'; // Orange - High risk
    if (ltv >= 40) return '#ffc107'; // Yellow - Medium risk
    return '#4caf50'; // Green - Healthy
  };
  
  const color = getColor(clampedValue);
  
  // Create gradient for the gauge arc
  const gradientId = `gauge-gradient-${Math.random()}`;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: 1
    }}>
      <Box sx={{ position: 'relative', width: config.width, height: config.height }}>
        {/* Gauge background */}
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          style={{ position: 'absolute' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4caf50" />
              <stop offset="40%" stopColor="#ffc107" />
              <stop offset="55%" stopColor="#ff9800" />
              <stop offset="65%" stopColor="#d32f2f" />
              <stop offset="100%" stopColor="#d32f2f" />
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d={`M ${config.thickness / 2} ${config.height - config.thickness / 2} 
                A ${config.width / 2 - config.thickness / 2} ${config.height - config.thickness / 2} 
                0 0 1 ${config.width - config.thickness / 2} ${config.height - config.thickness / 2}`}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth={config.thickness}
            strokeLinecap="round"
          />
          
          {/* Colored arc */}
          <path
            d={`M ${config.thickness / 2} ${config.height - config.thickness / 2} 
                A ${config.width / 2 - config.thickness / 2} ${config.height - config.thickness / 2} 
                0 0 1 ${config.width - config.thickness / 2} ${config.height - config.thickness / 2}`}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={config.thickness}
            strokeLinecap="round"
          />
          
          {/* Tick marks */}
          {[0, 40, 55, 65, 100].map((tick) => {
            const angle = (tick / 100) * 180 - 90;
            const radians = (angle * Math.PI) / 180;
            const innerRadius = config.width / 2 - config.thickness - 5;
            const outerRadius = config.width / 2 - config.thickness + 5;
            
            const x1 = config.width / 2 + innerRadius * Math.cos(radians);
            const y1 = config.height - config.thickness / 2 + innerRadius * Math.sin(radians);
            const x2 = config.width / 2 + outerRadius * Math.cos(radians);
            const y2 = config.height - config.thickness / 2 + outerRadius * Math.sin(radians);
            
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={tick === 65 ? '#d32f2f' : '#666'}
                strokeWidth={tick === 65 ? 3 : 2}
              />
            );
          })}
          
          {/* Needle */}
          <g transform={`translate(${config.width / 2}, ${config.height - config.thickness / 2})`}>
            <g transform={`rotate(${rotation})`}>
              <polygon
                points={`0,-3 ${config.width / 2 - config.thickness - 10},0 0,3`}
                fill={color}
              />
              <circle r="5" fill={color} />
            </g>
          </g>
        </svg>
        
        {/* Value display */}
        <Box sx={{
          position: 'absolute',
          bottom: config.thickness,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <Typography 
            sx={{ 
              fontSize: config.fontSize,
              fontWeight: 700,
              color: color
            }}
          >
            {clampedValue.toFixed(1)}%
          </Typography>
        </Box>
        
        {/* Zone labels */}
        <Box sx={{ position: 'absolute', bottom: -5, left: 5 }}>
          <Typography sx={{ fontSize: '0.625rem', color: '#4caf50' }}>
            Safe
          </Typography>
        </Box>
        <Box sx={{ position: 'absolute', bottom: -5, right: 5 }}>
          <Typography sx={{ fontSize: '0.625rem', color: '#d32f2f' }}>
            Danger
          </Typography>
        </Box>
      </Box>
      
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default HealthGauge;