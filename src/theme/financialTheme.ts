import { createTheme } from '@mui/material/styles';

// Professional Financial Services Theme - Optimized for Trust & Conversion
export const financialTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#059669', // Deep Emerald Green - growth, prosperity, trust
      light: '#10B981', // Lighter green for hover states
      dark: '#047857', // Darker for active states
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F59E0B', // Premium Gold - wealth, success
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#000000',
    },
    background: {
      default: '#0C1C15', // Deep forest green background
      paper: '#1A2F23', // Warmer dark green card backgrounds
    },
    surface: {
      main: '#2D4A35', // Forest green surface color
      light: '#3A5B42',
      dark: '#1A2F23',
    },
    text: {
      primary: '#F8FAFC', // Softer white
      secondary: '#CBD5E1', // Warm secondary text
      disabled: '#64748B',
    },
    success: {
      main: '#10B981', // Professional green - growth, profit
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Consistent with secondary (gold)
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Clear but not harsh red
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#06B6D4', // Teal instead of blue
      light: '#22D3EE',
      dark: '#0891B2',
    },
    divider: 'rgba(148, 163, 184, 0.12)', // Subtle slate dividers
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7, // Better readability
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.03333em',
    },
  },
  shape: {
    borderRadius: 8, // More professional, less playful
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0C1C15 0%, #1A2F23 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1A2F23',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            border: '1px solid #10B981',
            boxShadow: '0 10px 25px -3px rgba(16, 185, 129, 0.1)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-1px)',
          },
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          },
          '&.MuiButton-containedSecondary': {
            background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
          },
          '&.MuiButton-containedSuccess': {
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#34D399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#FBBF24',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#F87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            color: '#22D3EE',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 8,
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#2D4A35',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: '0.875rem',
          maxWidth: 300,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
        arrow: {
          color: '#2D4A35',
          '&::before': {
            border: '1px solid rgba(16, 185, 129, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1A2F23',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#059669',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            backgroundColor: '#F59E0B',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#F59E0B',
          },
        },
      },
    },
  },
});

// Extend theme to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      main: string;
      light: string;
      dark: string;
    };
  }

  interface PaletteOptions {
    surface?: {
      main: string;
      light: string;
      dark: string;
    };
  }
}

export default financialTheme;