import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LendingProvider } from './context/LendingContext';
import Dashboard from './components/Dashboard';
import theme from './theme/theme';

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
