import React, { useState } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import { 
  AccountBalanceWallet as BorrowIcon,
  Dashboard as PortfolioIcon,
  Settings as SettingsIcon 
} from '@mui/icons-material';
import SimpleLandingPage from './SimpleLandingPage';
import AdvancedLoanManagement from './AdvancedLoanManagement';
import SettingsPanel from './SettingsPanel';
import PlatformHeader from './PlatformHeader';
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
      id={`main-tabpanel-${index}`}
      aria-labelledby={`main-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `main-tab-${index}`,
    'aria-controls': `main-tabpanel-${index}`,
  };
}

const NewMainTabs: React.FC = () => {
  const [value, setValue] = useState(0); // Start with "Borrow" tab
  const { simulationSettings } = useLending();

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
            variant="fullWidth"
            centered
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                px: 3,
                gap: 1,
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }
            }}
          >
            <Tab 
              icon={<BorrowIcon />}
              label="Borrow" 
              iconPosition="start"
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<PortfolioIcon />}
              label="Portfolio" 
              iconPosition="start"
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<SettingsIcon />}
              label="Settings" 
              iconPosition="start"
              {...a11yProps(2)} 
            />
          </Tabs>
        </Container>
      </Box>

      {/* Borrow Tab - Main loan creation */}
      <TabPanel value={value} index={0}>
        <SimpleLandingPage />
      </TabPanel>
      
      {/* Portfolio Tab - Loan management */}
      <TabPanel value={value} index={1}>
        <Container maxWidth="xl">
          <AdvancedLoanManagement />
        </Container>
      </TabPanel>
      
      {/* Settings Tab - Advanced features */}
      <TabPanel value={value} index={2}>
        <Container maxWidth="xl">
          <SettingsPanel />
        </Container>
      </TabPanel>
    </Box>
  );
};

export default NewMainTabs;