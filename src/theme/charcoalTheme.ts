import { createTheme } from '@mui/material/styles';

// Professional Charcoal Dark Theme - Sophisticated Financial Services Design
export const charcoalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E5E7EB', // Light gray - clean, modern primary
      light: '#F3F4F6', // Lighter for hover states
      dark: '#D1D5DB', // Darker for active states
      contrastText: '#111827',
    },
    secondary: {
      main: '#F59E0B', // Gold accent - premium, wealth
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#000000',
    },
    background: {
      default: '#0F0F0F', // Deep charcoal background
      paper: '#1A1A1A', // Slightly lighter charcoal for cards
    },
    surface: {
      main: '#2D2D2D', // Medium charcoal surface
      light: '#3A3A3A',
      dark: '#1F1F1F',
    },
    text: {
      primary: '#FFFFFF', // Pure white for maximum contrast
      secondary: '#D1D5DB', // Light gray for secondary text
      disabled: '#6B7280',
    },
    success: {
      main: '#10B981', // Professional green - growth, profit
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Gold - consistent with secondary
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Clean red
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#8B5CF6', // Purple instead of blue
      light: '#A78BFA',
      dark: '#7C3AED',
    },
    divider: 'rgba(255, 255, 255, 0.08)', // Subtle white dividers on dark
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
      lineHeight: 1.7,
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
    borderRadius: 8, // Clean, modern corners
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1A1A1A',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            border: '1px solid rgba(229, 231, 235, 0.3)',
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.4)',
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
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-1px)',
          },
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(135deg, #E5E7EB 0%, #F3F4F6 100%)',
            color: '#111827',
            '&:hover': {
              background: 'linear-gradient(135deg, #D1D5DB 0%, #E5E7EB 100%)',
            },
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
          borderColor: 'rgba(255, 255, 255, 0.2)',
          '&:hover': {
            borderWidth: '2px',
            borderColor: 'rgba(229, 231, 235, 0.5)',
            transform: 'translateY(-1px)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            color: '#A78BFA',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#2D2D2D',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: '0.875rem',
          maxWidth: 300,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        },
        arrow: {
          color: '#2D2D2D',
          '&::before': {
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1A1A1A',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
          '&:hover': {
            color: '#FBBF24',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
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

export default charcoalTheme;