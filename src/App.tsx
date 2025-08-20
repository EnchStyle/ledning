import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LendingProvider } from './context/LendingContext';
import NewMainTabs from './components/NewMainTabs';
import ErrorBoundary from './components/ErrorBoundary';
import modernTheme from './theme/modernTheme';

function App() {
  return (
    <ErrorBoundary
      fallbackTitle="Application Error"
      fallbackMessage="The lending demo encountered an unexpected error. This is likely due to a development issue."
    >
      <ThemeProvider theme={modernTheme}>
        <CssBaseline />
        <LendingProvider>
          <ErrorBoundary
            fallbackTitle="Dashboard Error"
            fallbackMessage="The dashboard component encountered an error. Try refreshing to restore functionality."
          >
            <NewMainTabs />
          </ErrorBoundary>
        </LendingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
