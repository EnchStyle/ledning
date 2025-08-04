import React, { useState } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import SimpleLandingPage from './SimpleLandingPage';
import SimpleLoansManager from './SimpleLoansManager';
import SimpleHelp from './SimpleHelp';
import MarketInfo from './MarketInfo';

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
            centered
            sx={{
              '& .MuiTab-root': {
                minWidth: 120,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          >
            <Tab label="Borrow" />
            <Tab label="My Loans" />
            <Tab label="Help" />
            <Tab label="Market" />
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
    </Box>
  );
};

export default SimpleMainTabs;