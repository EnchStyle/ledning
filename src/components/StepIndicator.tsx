import React from 'react';
import { Box, Typography, Stepper, Step, StepLabel, useTheme, useMediaQuery } from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
  completedSteps: boolean[];
}

/**
 * REDESIGN COMPONENT: Visual step progression for borrow page
 * Replaces dense information layout with clear step-by-step flow
 * Mobile-responsive design with clear visual hierarchy
 */
const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps, completedSteps }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: 4 }}>
      <Stepper 
        activeStep={currentStep} 
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{ 
          mb: 2,
          '& .MuiStepLabel-root': {
            cursor: 'default',
          },
          '& .MuiStepIcon-root': {
            fontSize: '1.8rem',
            '&.Mui-active': {
              color: 'primary.main',
            },
            '&.Mui-completed': {
              color: 'success.main',
            },
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label} completed={completedSteps[index]}>
            <StepLabel 
              StepIconComponent={completedSteps[index] ? () => <CheckIcon color="success" /> : undefined}
            >
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                sx={{ 
                  fontWeight: currentStep === index ? 600 : 400,
                  color: currentStep === index ? 'primary.main' : 'text.secondary'
                }}
              >
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default StepIndicator;