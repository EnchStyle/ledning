/**
 * Global theme configuration for XRP Lending Platform
 * Provides consistent styling across all components
 */
import { createTheme, alpha } from '@mui/material/styles';

// Brand colors for XRP ecosystem
const brandColors = {
  xrpBlue: '#2196f3',
  xrpBlueDark: '#1976d2',
  xrpBlueLight: '#64b5f6',
  xpmOrange: '#ff9800',
  xpmOrangeDark: '#f57c00',
  xpmOrangeLight: '#ffb74d',
};

// Semantic colors for different states
const semanticColors = {
  success: '#4caf50',
  warning: '#ff7043',
  error: '#f44336',
  info: '#29b6f6',
};

// Background colors for dark theme
const backgroundColors = {
  default: '#0a0e13',
  paper: '#1a1d29',
  elevated: '#252837',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Common spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Common border radius values
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: '50%',
};

// Common transitions
export const transitions = {
  short: '0.2s ease-in-out',
  standard: '0.3s ease-in-out',
  long: '0.5s ease-in-out',
};

// Create the theme
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: brandColors.xrpBlue,
      light: brandColors.xrpBlueLight,
      dark: brandColors.xrpBlueDark,
      contrastText: '#fff',
    },
    secondary: {
      main: brandColors.xpmOrange,
      light: brandColors.xpmOrangeLight,
      dark: brandColors.xpmOrangeDark,
      contrastText: '#fff',
    },
    background: backgroundColors,
    success: {
      main: semanticColors.success,
      light: alpha(semanticColors.success, 0.3),
      dark: alpha(semanticColors.success, 0.7),
      contrastText: '#fff',
    },
    warning: {
      main: semanticColors.warning,
      light: alpha(semanticColors.warning, 0.3),
      dark: alpha(semanticColors.warning, 0.7),
      contrastText: '#fff',
    },
    error: {
      main: semanticColors.error,
      light: alpha(semanticColors.error, 0.3),
      dark: alpha(semanticColors.error, 0.7),
      contrastText: '#fff',
    },
    info: {
      main: semanticColors.info,
      light: alpha(semanticColors.info, 0.3),
      dark: alpha(semanticColors.info, 0.7),
      contrastText: '#fff',
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.95)',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.75,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          textTransform: 'none',
          fontWeight: 600,
          padding: `${spacing.sm}px ${spacing.md}px`,
          transition: transitions.short,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        sizeLarge: {
          padding: `${spacing.md}px ${spacing.lg}px`,
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: `${spacing.xs}px ${spacing.sm}px`,
          fontSize: '0.875rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          backgroundImage: 'none',
          transition: transitions.standard,
        },
        elevation1: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
        },
        elevation3: {
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundImage: 'none',
          transition: transitions.standard,
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.md,
            transition: transitions.short,
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha('#fff', 0.3),
              },
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: backgroundColors.elevated,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: borderRadius.sm,
          fontSize: '0.875rem',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.lg,
          backgroundImage: 'none',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          height: 6,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#fff', 0.1),
        },
      },
    },
  },
});

// Export additional theme utilities
export default theme;