import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import SimpleMainTabs from './SimpleMainTabs';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      <Header />
      <SimpleMainTabs />
    </Box>
  );
};

export default Dashboard;