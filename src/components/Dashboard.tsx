import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import MainTabs from './MainTabs';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <MainTabs />
    </Box>
  );
};

export default Dashboard;