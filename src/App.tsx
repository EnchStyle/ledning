import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LendingProvider } from './context/LendingContext';
import Dashboard from './components/Dashboard';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3', // XRP Blue
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#ff9800', // Warm orange for XPM
      light: '#ffb74d',
      dark: '#f57c00',
    },
    background: {
      default: '#0a0e13',
      paper: '#1a1d29',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff7043',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LendingProvider>
        <Dashboard />
      </LendingProvider>
    </ThemeProvider>
  );
}

export default App;
