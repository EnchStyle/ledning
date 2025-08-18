import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LendingProvider } from './context/LendingContext';
import NewDashboard from './components/NewDashboard';
import darkTheme from './theme/darkTheme';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <LendingProvider>
        <NewDashboard />
      </LendingProvider>
    </ThemeProvider>
  );
}

export default App;
