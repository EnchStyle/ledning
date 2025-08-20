import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LendingProvider } from './context/LendingContext';
import SimpleMainTabs from './components/SimpleMainTabs';
import ErrorBoundary from './components/ErrorBoundary';
import darkTheme from './theme/darkTheme';

function App() {
  return (
    <ErrorBoundary
      fallbackTitle="Application Error"
      fallbackMessage="The lending demo encountered an unexpected error. This is likely due to a development issue."
    >
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <LendingProvider>
          <ErrorBoundary
            fallbackTitle="Dashboard Error"
            fallbackMessage="The dashboard component encountered an error. Try refreshing to restore functionality."
          >
            <SimpleMainTabs />
          </ErrorBoundary>
        </LendingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
