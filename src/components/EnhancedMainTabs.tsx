import React, { useState } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import LendingDashboard from './LendingDashboard';
import MyLoans from './MyLoans';
import SimulationTools from './SimulationTools';
import ScenarioPlayground from './ScenarioPlayground';
import LoanRiskCalculator from './LoanRiskCalculator';
import DualAssetRiskExplainer from './DualAssetRiskExplainer';
import TrueRiskAnalysis from './TrueRiskAnalysis';
import TrustElements from './TrustElements';

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

const EnhancedMainTabs: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="xl">
          <Tabs 
            value={value} 
            onChange={handleChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 120,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          >
            <Tab label="🏠 Borrow" />
            <Tab label="📊 My Loans" />
            <Tab label="🎯 Risk Calculator" />
            <Tab label="🎮 What-If Scenarios" />
            <Tab label="📚 Learn Risks" />
            <Tab label="🔬 Simulation Tools" />
            <Tab label="🛡️ Trust & Safety" />
          </Tabs>
        </Container>
      </Box>

      <TabPanel value={value} index={0}>
        <LendingDashboard />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <MyLoans />
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <Container maxWidth="xl">
          <LoanRiskCalculator />
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={3}>
        <Container maxWidth="xl">
          <ScenarioPlayground />
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={4}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <DualAssetRiskExplainer />
          </Box>
          <TrueRiskAnalysis />
        </Container>
      </TabPanel>
      
      <TabPanel value={value} index={5}>
        <SimulationTools />
      </TabPanel>
      
      <TabPanel value={value} index={6}>
        <Container maxWidth="xl">
          <TrustElements />
        </Container>
      </TabPanel>
    </Box>
  );
};

export default EnhancedMainTabs;