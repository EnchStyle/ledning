import React, { useState } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import SimpleLandingPage from './SimpleLandingPage';
import SimpleLoansManager from './SimpleLoansManager';
import SimpleHelp from './SimpleHelp';
import MarketInfo from './MarketInfo';
import AdminDashboard from './AdminDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';
import InteractiveLoanCalculator from './InteractiveLoanCalculator';
import AdvancedLoanManagement from './AdvancedLoanManagement';
import PlatformHeader from './PlatformHeader';

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
  const [value, setValue] = useState(0); // Start with "Get Started" tab

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <PlatformHeader />
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
            <Tab label="🚀 Get Started" {...a11yProps(0)} />
            <Tab label="📊 My Portfolio" {...a11yProps(1)} />
            <Tab label="🧮 Calculator" {...a11yProps(2)} />
            <Tab label="💼 Professional" {...a11yProps(3)} />
            <Tab label="📈 Market Data" {...a11yProps(4)} />
            <Tab label="❓ Help" {...a11yProps(5)} />
          </Tabs>
        </Container>
      </Box>

      <TabPanel value={value} index={0}>
        <SimpleLandingPage />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <Container maxWidth="xl">
          <AdvancedLoanManagement />
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <Container maxWidth="xl">
          <InteractiveLoanCalculator />
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={3}>
        <ProfessionalDashboard />
      </TabPanel>
      
      <TabPanel value={value} index={4}>
        <Container maxWidth="md">
          <Box sx={{ mt: 4 }}>
            <MarketInfo />
          </Box>
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={5}>
        <SimpleHelp />
      </TabPanel>
    </Box>
  );
};

export default SimpleMainTabs;