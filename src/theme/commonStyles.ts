/**
 * Common styling utilities and mixins for consistent component styling
 * Use these predefined styles to maintain consistency across components
 */
import { SxProps, Theme } from '@mui/material/styles';
import { spacing, borderRadius, transitions } from './theme';

/**
 * Glass morphism effect for elevated surfaces
 */
export const glassMorphism: SxProps<Theme> = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: `${borderRadius.lg}px`,
};

/**
 * Card container with hover effects
 */
export const interactiveCard: SxProps<Theme> = {
  borderRadius: `${borderRadius.lg}px`,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: transitions.standard,
  cursor: 'pointer',
  '&:hover': {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
};

/**
 * Gradient backgrounds for special elements
 */
export const gradients = {
  primary: {
    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
  },
  secondary: {
    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
  },
  success: {
    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
  },
  warning: {
    background: 'linear-gradient(135deg, #ff7043 0%, #f4511e 100%)',
  },
  error: {
    background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
  },
  dark: {
    background: 'linear-gradient(135deg, #1a1d29 0%, #0a0e13 100%)',
  },
};

/**
 * Section container with consistent spacing
 */
export const sectionContainer: SxProps<Theme> = {
  padding: `${spacing.lg}px`,
  borderRadius: `${borderRadius.lg}px`,
  marginBottom: `${spacing.lg}px`,
};

/**
 * Flex center utility
 */
export const flexCenter: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

/**
 * Flex between utility
 */
export const flexBetween: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

/**
 * Status indicator styles
 */
export const statusIndicator = (status: 'success' | 'warning' | 'error' | 'info'): SxProps<Theme> => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: (theme) => theme.palette[status].main,
  boxShadow: (theme) => `0 0 8px ${theme.palette[status].main}`,
});

/**
 * Metric card style for displaying KPIs
 */
export const metricCard: SxProps<Theme> = {
  ...glassMorphism,
  padding: `${spacing.md}px`,
  textAlign: 'center',
  minHeight: 100,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

/**
 * Table styles
 */
export const tableStyles = {
  container: {
    borderRadius: `${borderRadius.lg}px`,
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    fontWeight: 600,
  },
  row: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    '&:last-child td': {
      border: 0,
    },
  },
};

/**
 * Form field styles
 */
export const formFieldStyle: SxProps<Theme> = {
  marginBottom: `${spacing.md}px`,
  '& .MuiOutlinedInput-root': {
    transition: transitions.short,
  },
};

/**
 * Animation keyframes
 */
export const animations = {
  fadeIn: {
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animation: 'fadeIn 0.3s ease-in-out',
  },
  slideIn: {
    '@keyframes slideIn': {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    animation: 'slideIn 0.4s ease-out',
  },
  pulse: {
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' },
    },
    animation: 'pulse 2s infinite',
  },
};

/**
 * Risk level colors
 */
export const riskColors = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#ff7043',
  critical: '#f44336',
};

/**
 * Get risk color based on percentage
 */
export const getRiskColor = (riskPercentage: number): string => {
  if (riskPercentage < 30) return riskColors.low;
  if (riskPercentage < 60) return riskColors.medium;
  if (riskPercentage < 80) return riskColors.high;
  return riskColors.critical;
};

/**
 * Responsive utilities
 */
export const responsive = {
  mobile: (styles: any): SxProps<Theme> => ({
    '@media (max-width: 600px)': styles,
  }),
  tablet: (styles: any): SxProps<Theme> => ({
    '@media (max-width: 960px)': styles,
  }),
  desktop: (styles: any): SxProps<Theme> => ({
    '@media (min-width: 1280px)': styles,
  }),
};

/**
 * Common shadow effects
 */
export const shadows = {
  soft: '0 2px 8px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
  strong: '0 8px 24px rgba(0, 0, 0, 0.2)',
  glow: (color: string) => `0 0 20px ${color}`,
};