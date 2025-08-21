import React, { Component, ReactNode, ErrorInfo } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { logger } from '../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  showReloadButton?: boolean;
  showHomeButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging (in real app, send to error reporting service)
    logger.error('ErrorBoundary caught an error', error, 'ErrorBoundary.componentDidCatch', { 
      errorInfo: errorInfo.componentStack,
      componentStack: errorInfo.componentStack 
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    // Reset error state and navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const {
        fallbackTitle = 'Something went wrong',
        fallbackMessage = 'An unexpected error occurred. Please try refreshing the page.',
        showReloadButton = true,
        showHomeButton = true,
      } = this.props;

      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorIcon />
                {fallbackTitle}
              </AlertTitle>
              {fallbackMessage}
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Error Details (Development Mode)
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
                  textAlign: 'left',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                <Typography component="div">
                  <strong>Error:</strong> {this.state.error?.message}
                  <br />
                  <strong>Stack:</strong>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: '8px 0' }}>
                    {this.state.error?.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <strong>Component Stack:</strong>
                      <pre style={{ whiteSpace: 'pre-wrap', margin: '8px 0' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              {showReloadButton && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
              )}
              {showHomeButton && (
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                >
                  Back to Dashboard
                </Button>
              )}
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;