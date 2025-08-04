import React, { useState } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import SimpleLandingPage from './SimpleLandingPage';
import SimpleLoansManager from './SimpleLoansManager';
import SimpleHelp from './SimpleHelp';
import MarketInfo from './MarketInfo';
import AdminDashboard from './AdminDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const SimpleMainTabs: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Tabs 
            value={value} 
            onChange={handleChange} 
            variant="scrollable"
            scrollButtons="auto"
            centered
            sx={{
              '& .MuiTab-root': {
                minWidth: { xs: 80, sm: 120 },
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
                px: { xs: 1, sm: 2 }
              },
              '& .MuiTabs-centered': {
                '@media (max-width: 600px)': {
                  justifyContent: 'flex-start'
                }
              }
            }}
          >
            <Tab label="Borrow" {...a11yProps(0)} />
            <Tab label="My Loans" {...a11yProps(1)} />
            <Tab label="Help" {...a11yProps(2)} />
            <Tab label="Market" {...a11yProps(3)} />
            <Tab label="Admin" {...a11yProps(4)} />
          </Tabs>
        </Container>
      </Box>

      <TabPanel value={value} index={0}>
        <SimpleLandingPage />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <SimpleLoansManager />
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <SimpleHelp />
      </TabPanel>
      
      <TabPanel value={value} index={3}>
        <Container maxWidth="md">
          <Box sx={{ mt: 4 }}>
            <MarketInfo />
          </Box>
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={4}>
        <AdminDashboard />
      </TabPanel>
    </Box>
  );
};

export default SimpleMainTabs;