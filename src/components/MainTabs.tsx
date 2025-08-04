import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ScienceIcon from '@mui/icons-material/Science';
import InfoIcon from '@mui/icons-material/Info';

import LendingDashboard from './LendingDashboard';
import MyLoans from './MyLoans';
import SimulationTools from './SimulationTools';
import LiquidationInfo from './LiquidationInfo';

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
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MainTabs: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab 
            icon={<DashboardIcon />} 
            label="Borrow" 
            id="main-tab-0"
            aria-controls="main-tabpanel-0"
          />
          <Tab 
            icon={<AccountBalanceIcon />} 
            label="My Loans" 
            id="main-tab-1"
            aria-controls="main-tabpanel-1"
          />
          <Tab 
            icon={<ScienceIcon />} 
            label="Demo Tools" 
            id="main-tab-2"
            aria-controls="main-tabpanel-2"
          />
          <Tab 
            icon={<InfoIcon />} 
            label="Learn" 
            id="main-tab-3"
            aria-controls="main-tabpanel-3"
          />
        </Tabs>
      </Paper>
      
      <TabPanel value={value} index={0}>
        <LendingDashboard />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <MyLoans />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <SimulationTools />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <LiquidationInfo />
      </TabPanel>
    </Box>
  );
};

export default MainTabs;