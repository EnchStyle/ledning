import React, { useState } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import SimpleLandingPage from './SimpleLandingPage';
import SimpleHelp from './SimpleHelp';
import MarketInfo from './MarketInfo';
import AdminDashboard from './AdminDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';
import InteractiveLoanCalculator from './InteractiveLoanCalculator';
import AdvancedLoanManagement from './AdvancedLoanManagement';
import StaticPortfolioDashboard from './StaticPortfolioDashboard';
import HighPerformancePortfolioDashboard from './HighPerformancePortfolioDashboard';
import { useLending } from '../context/LendingContext';

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
  const [value, setValue] = useState(0); // Start with "Borrow" tab
  const { simulationSettings } = useLending();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Smart portfolio component selection based on simulation performance
  const renderPortfolioComponent = () => {
    if (!simulationSettings.isActive) {
      // No simulation - use regular component
      return <AdvancedLoanManagement />;
    } else if (simulationSettings.speed >= 5) {
      // High speed (5x+) - use high-performance component
      return <HighPerformancePortfolioDashboard />;
    } else {
      // Low speed (1x-4x) - use static component to prevent freezing
      return <StaticPortfolioDashboard />;
    }
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
            <Tab label="🚀 Get Started" {...a11yProps(0)} />
            <Tab label="📊 My Portfolio" {...a11yProps(1)} />
            <Tab label="🧮 Calculator" {...a11yProps(2)} />
            <Tab label="⚙️ Admin" {...a11yProps(3)} />
            <Tab label="💼 Professional" {...a11yProps(4)} />
            <Tab label="📈 Market Data" {...a11yProps(5)} />
            <Tab label="❓ Help" {...a11yProps(6)} />
          </Tabs>
        </Container>
      </Box>

      <TabPanel value={value} index={0}>
        <SimpleLandingPage />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <Container maxWidth="xl">
          {renderPortfolioComponent()}
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <Container maxWidth="xl">
          <InteractiveLoanCalculator />
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={3}>
        <Container maxWidth="xl">
          <AdminDashboard />
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={4}>
        <ProfessionalDashboard />
      </TabPanel>
      
      <TabPanel value={value} index={5}>
        <Container maxWidth="md">
          <Box sx={{ mt: 4 }}>
            <MarketInfo />
          </Box>
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={6}>
        <SimpleHelp />
      </TabPanel>
    </Box>
  );
};

export default SimpleMainTabs;