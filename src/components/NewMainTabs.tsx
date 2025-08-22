import React, { useState } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import { 
  AccountBalanceWallet as BorrowIcon,
  Dashboard as PortfolioIcon,
  Settings as SettingsIcon 
} from '@mui/icons-material';
import SimpleLandingPage from './SimpleLandingPage';
import OptimizedPortfolio from './OptimizedPortfolio';
import SettingsPanel from './SettingsPanel';
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
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Tabs 
            value={value} 
            onChange={handleChange} 
            variant="fullWidth"
            centered
            sx={{
              '& .MuiTab-root': {
                minHeight: { xs: 56, sm: 64 },
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600,
                px: { xs: 1, sm: 3 },
                gap: { xs: 0.5, sm: 1 },
                '&.Mui-selected': {
                  color: 'primary.main'
                },
                '& .MuiTab-iconWrapper': {
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
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
          <OptimizedPortfolio />
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