import { createTheme } from '@mui/material/styles';

// Dark theme inspired by xpmarket.com
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00D4FF', // Bright blue accent
      light: '#33DDFF',
      dark: '#00A3CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6C5CE7', // Purple accent
      light: '#8B7CEA',
      dark: '#5B4BD6',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0A0E1A', // Very dark blue background
      paper: '#151B2D', // Slightly lighter for cards
    },
    surface: {
      main: '#1E2A47', // Medium surface color
      light: '#2A3652',
      dark: '#141F35',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B8C5D1',
      disabled: '#6B7785',
    },
    success: {
      main: '#00E676',
      light: '#33EA84',
      dark: '#00C853',
    },
    warning: {
      main: '#FFB74D',
      light: '#FFC570',
      dark: '#FF9800',
    },
    error: {
      main: '#FF5252',
      light: '#FF7575',
      dark: '#F44336',
    },
    info: {
      main: '#29B6F6',
      light: '#54C5F7',
      dark: '#0288D1',
    },
    divider: '#2A3652',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
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
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #2A3652',
          '&:hover': {
            border: '1px solid #00D4FF',
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.15)',
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
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(0, 230, 118, 0.15)',
            color: '#00E676',
            border: '1px solid rgba(0, 230, 118, 0.3)',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(255, 183, 77, 0.15)',
            color: '#FFB74D',
            border: '1px solid rgba(255, 183, 77, 0.3)',
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(255, 82, 82, 0.15)',
            color: '#FF5252',
            border: '1px solid rgba(255, 82, 82, 0.3)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E2A47',
          border: '1px solid #2A3652',
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: '0.875rem',
          maxWidth: 300,
        },
        arrow: {
          color: '#1E2A47',
          '&::before': {
            border: '1px solid #2A3652',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
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

export default darkTheme;