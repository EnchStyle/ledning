import { createTheme } from '@mui/material/styles';

// Modern Premium Design - Completely Reimagined
export const modernTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1', // Modern indigo - tech, innovation
      light: '#818CF8', // Lighter indigo
      dark: '#4F46E5', // Deeper indigo
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EC4899', // Vibrant pink - energy, modern
      light: '#F472B6',
      dark: '#DB2777',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0B0D17', // Deep space blue
      paper: '#151B2B', // Rich navy for cards
    },
    surface: {
      main: '#1E293B', // Slate blue surface
      light: '#334155',
      dark: '#0F172A',
    },
    text: {
      primary: '#F8FAFC', // Almost white with slight blue tint
      secondary: '#CBD5E1', // Light slate
      disabled: '#64748B',
    },
    success: {
      main: '#22D3EE', // Cyan - modern, fresh
      light: '#67E8F9',
      dark: '#0891B2',
    },
    warning: {
      main: '#FBBF24', // Bright amber
      light: '#FCD34D',
      dark: '#F59E0B',
    },
    error: {
      main: '#F87171', // Coral red
      light: '#FCA5A5',
      dark: '#EF4444',
    },
    info: {
      main: '#A855F7', // Purple
      light: '#C084FC',
      dark: '#9333EA',
    },
    divider: 'rgba(148, 163, 184, 0.12)', // Subtle slate dividers
  },
  typography: {
    fontFamily: '"Manrope", "Inter", "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      letterSpacing: '-0.04em',
      lineHeight: 1.1,
      background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.25,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.65,
      letterSpacing: '0.01071em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.03333em',
      textTransform: 'uppercase',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16, // Much more rounded, modern feel
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgba(99, 102, 241, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(99, 102, 241, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(99, 102, 241, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(ellipse at top, #1e293b 0%, #0b0d17 50%, #020617 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'linear-gradient(135deg, #151b2b 0%, #1e293b 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 20,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)',
          },
          '&:hover': {
            border: '1px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
            transform: 'translateY(-4px) scale(1.02)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '14px 28px',
          fontSize: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        },
        contained: {
          boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
          '&:hover': {
            boxShadow: '0 12px 24px rgba(99, 102, 241, 0.4)',
            transform: 'translateY(-2px)',
          },
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transition: 'left 0.5s',
            },
            '&:hover::before': {
              left: '100%',
            },
          },
          '&.MuiButton-containedSecondary': {
            background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
          },
          '&.MuiButton-containedSuccess': {
            background: 'linear-gradient(135deg, #22D3EE 0%, #67E8F9 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          background: 'rgba(99, 102, 241, 0.05)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderWidth: '2px',
            borderColor: 'rgba(99, 102, 241, 0.6)',
            background: 'rgba(99, 102, 241, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          '&.MuiChip-colorSuccess': {
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(103, 232, 249, 0.2) 100%)',
            color: '#67E8F9',
            border: '1px solid rgba(34, 211, 238, 0.3)',
          },
          '&.MuiChip-colorWarning': {
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(252, 211, 77, 0.2) 100%)',
            color: '#FCD34D',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          },
          '&.MuiChip-colorError': {
            background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.2) 0%, rgba(252, 165, 165, 0.2) 100%)',
            color: '#FCA5A5',
            border: '1px solid rgba(248, 113, 113, 0.3)',
          },
          '&.MuiChip-colorInfo': {
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(192, 132, 252, 0.2) 100%)',
            color: '#C084FC',
            border: '1px solid rgba(168, 85, 247, 0.3)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: 10,
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          overflow: 'hidden',
        },
        bar: {
          borderRadius: 10,
          background: 'linear-gradient(90deg, #6366F1 0%, #EC4899 100%)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 12,
          padding: '16px 20px',
          fontSize: '0.875rem',
          maxWidth: 320,
          boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
          backdropFilter: 'blur(20px)',
        },
        arrow: {
          color: '#1E293B',
          '&::before': {
            border: '1px solid rgba(99, 102, 241, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'linear-gradient(135deg, #151b2b 0%, #1e293b 100%)',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          borderRadius: 16,
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          background: 'linear-gradient(135deg, rgba(21, 27, 43, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: 'none',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            background: 'linear-gradient(90deg, #6366F1 0%, #EC4899 100%)',
            height: 4,
            borderRadius: '4px 4px 0 0',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: '12px 12px 0 0',
          margin: '0 4px',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            color: '#EC4899',
          },
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.05)',
            color: '#8B5CF6',
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

export default modernTheme;