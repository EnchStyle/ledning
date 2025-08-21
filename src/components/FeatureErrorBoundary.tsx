import React, { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { logger } from '../utils/logger';

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  fallbackUI?: ReactNode;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Feature-specific error boundary for graceful degradation
 * Allows other parts of the app to continue functioning if one feature fails
 */
class FeatureErrorBoundary extends React.Component<FeatureErrorBoundaryProps, FeatureErrorBoundaryState> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(
      `Feature error in ${this.props.featureName}`,
      error,
      'FeatureErrorBoundary',
      {
        featureName: this.props.featureName,
        componentStack: errorInfo.componentStack,
      }
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback UI if provided
      if (this.props.fallbackUI) {
        return <>{this.props.fallbackUI}</>;
      }

      // Default fallback UI
      return (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {this.props.featureName} Temporarily Unavailable
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We're experiencing issues with this feature. The rest of the application should continue to work normally.
            </Typography>
          </Box>

          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {this.state.error?.message}
            </Typography>
          </Alert>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={this.handleReset}
            sx={{ textTransform: 'none' }}
          >
            Try Again
          </Button>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default FeatureErrorBoundary;