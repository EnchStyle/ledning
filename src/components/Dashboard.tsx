/**
 * Dashboard Component - Main application container
 * 
 * Root component that structures the application layout:
 * - Header: Contains wallet connection, market prices, and branding
 * - MainTabs: Navigation and content area for all features
 * 
 * Uses full viewport height with overflow control to prevent scrolling issues
 */
import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import SimpleMainTabs from './SimpleMainTabs';

/**
 * Dashboard layout component
 * Provides the main application structure with header and content areas
 */
const Dashboard: React.FC = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',           // Full viewport height
      bgcolor: 'background.default', // Dark theme background
      maxWidth: '100vw',            // Prevent horizontal overflow
      overflow: 'hidden'            // Control child component overflow
    }}>
      {/* Application header with branding and market data */}
      <Header />
      
      {/* Main content area with tabbed navigation */}
      <SimpleMainTabs />
    </Box>
  );
};

export default Dashboard;