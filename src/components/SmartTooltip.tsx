import React from 'react';
import { Tooltip, IconButton, TooltipProps } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';

interface SmartTooltipProps extends Omit<TooltipProps, 'children' | 'title'> {
  helpText: string;
  placement?: TooltipProps['placement'];
  size?: 'small' | 'medium';
}

const SmartTooltip: React.FC<SmartTooltipProps> = ({ 
  helpText, 
  placement = 'top',
  size = 'small',
  ...tooltipProps 
}) => {
  return (
    <Tooltip
      title={helpText}
      placement={placement}
      arrow
      enterTouchDelay={0}
      leaveTouchDelay={1500}
      sx={{
        '& .MuiTooltip-tooltip': {
          maxWidth: 300,
          fontSize: '0.875rem',
          lineHeight: 1.4,
          p: 1.5,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 3,
        },
        '& .MuiTooltip-arrow': {
          color: 'background.paper',
          '&::before': {
            border: '1px solid',
            borderColor: 'divider',
          },
        },
      }}
      {...tooltipProps}
    >
      <IconButton
        size={size}
        sx={{ 
          ml: 0.5,
          opacity: 0.6,
          '&:hover': { opacity: 1 },
          color: 'text.secondary',
          fontSize: size === 'small' ? '1rem' : '1.25rem'
        }}
      >
        <HelpIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      </IconButton>
    </Tooltip>
  );
};

export default SmartTooltip;