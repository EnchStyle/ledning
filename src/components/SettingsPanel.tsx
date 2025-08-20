import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Calculate as CalculatorIcon,
  AdminPanelSettings as AdminIcon,
  Business as ProfessionalIcon,
  TrendingUp as MarketIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import InteractiveLoanCalculator from './InteractiveLoanCalculator';
import AdminDashboard from './AdminDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';
import MarketInfo from './MarketInfo';
import SimpleHelp from './SimpleHelp';

interface SettingsPanelProps {}

const SettingsPanel: React.FC<SettingsPanelProps> = () => {
  const [expandedSection, setExpandedSection] = useState<string | false>('calculator');

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const sections = [
    {
      id: 'calculator',
      title: 'Loan Calculator',
      description: 'Calculate loan scenarios and explore different terms',
      icon: <CalculatorIcon color="primary" />,
      component: <InteractiveLoanCalculator />
    },
    {
      id: 'market',
      title: 'Market Data',
      description: 'View current market prices and trends',
      icon: <MarketIcon color="primary" />,
      component: <MarketInfo />
    },
    {
      id: 'professional',
      title: 'Professional Tools',
      description: 'Advanced features for experienced users',
      icon: <ProfessionalIcon color="primary" />,
      component: <ProfessionalDashboard />
    },
    {
      id: 'simulation',
      title: 'Simulation Controls',
      description: 'Time and price simulation for testing (Development)',
      icon: <AdminIcon color="primary" />,
      component: <AdminDashboard />
    },
    {
      id: 'help',
      title: 'Help & FAQ',
      description: 'Get answers to common questions',
      icon: <HelpIcon color="primary" />,
      component: <SimpleHelp />
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Settings & Tools
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Access advanced features, market data, and help resources
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        {sections.map((section) => (
          <Accordion
            key={section.id}
            expanded={expandedSection === section.id}
            onChange={handleAccordionChange(section.id)}
            sx={{
              mb: 2,
              '&:before': {
                display: 'none',
              },
              '&.Mui-expanded': {
                margin: '0 0 16px 0',
                borderColor: 'primary.main',
              },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                minHeight: 80,
                '&.Mui-expanded': {
                  minHeight: 80,
                },
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 2,
                },
              }}
            >
              {section.icon}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {section.description}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  backgroundColor: 'background.default',
                  borderRadius: 0,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {section.component}
              </Paper>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
};

export default SettingsPanel;