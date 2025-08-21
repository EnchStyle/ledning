import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { 
  CheckCircle as SuccessIcon, 
  MonetizationOn as MoneyIcon,
  Celebration as CelebrationIcon 
} from '@mui/icons-material';

interface ProgressCelebrationProps {
  borrowAmount: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * REDESIGN COMPONENT: Success state celebration for loan preview
 * Replaces plain text with engaging visual confirmation
 * Clear call-to-action with celebration styling
 */
const ProgressCelebration: React.FC<ProgressCelebrationProps> = ({ 
  borrowAmount, 
  onConfirm, 
  isLoading = false 
}) => {
  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
        color: 'white',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
        },
      }}
    >
      {/* SUCCESS ANIMATION AREA */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CelebrationIcon sx={{ fontSize: '3rem', mr: 1, opacity: 0.8 }} />
        <MoneyIcon sx={{ fontSize: '4rem', color: 'white' }} />
        <SuccessIcon sx={{ fontSize: '2rem', ml: 1, color: '#81c784' }} />
      </Box>

      {/* LOAN AMOUNT DISPLAY */}
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700, 
          mb: 1,
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
        }}
      >
        {borrowAmount.toLocaleString()} RLUSD
      </Typography>

      <Typography 
        variant="h6" 
        sx={{ 
          mb: 3, 
          opacity: 0.9,
          fontSize: { xs: '1rem', sm: '1.25rem' }
        }}
      >
        Ready to borrow instantly!
      </Typography>

      {/* CALL TO ACTION */}
      <Button
        variant="contained"
        size="large"
        onClick={onConfirm}
        disabled={isLoading}
        sx={{
          bgcolor: 'rgba(255,255,255,0.2)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          px: 4,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
          borderRadius: 2,
          textTransform: 'none',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.3)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          },
          '&:disabled': {
            opacity: 0.6,
          },
          transition: 'all 0.3s ease',
        }}
      >
        {isLoading ? 'Creating Loan...' : 'Get My Loan Now! 🚀'}
      </Button>

      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block', 
          mt: 2, 
          opacity: 0.8,
          fontSize: '0.875rem'
        }}
      >
        Instant settlement • No credit check required
      </Typography>
    </Paper>
  );
};

export default ProgressCelebration;