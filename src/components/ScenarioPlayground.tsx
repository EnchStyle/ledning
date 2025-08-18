import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Slider,
  Card,
  CardContent,
  Alert,
  Chip,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useLending } from '../context/LendingContext';

interface Scenario {
  name: string;
  description: string;
  xpmPriceChange: number;
  xrpPriceChange: number;
  icon: React.ReactNode;
  color: string;
}

const ScenarioPlayground: React.FC = () => {
  const { marketData } = useLending();
  const [activeTab, setActiveTab] = useState(0);
  const [customXpmChange, setCustomXpmChange] = useState(0);
  const [customXrpChange, setCustomXrpChange] = useState(0);
  const [selectedScenarios, setSelectedScenarios] = useState<number[]>([]);

  // Base loan parameters for simulation
  const baseLoan = {
    collateralAmount: 150000,
    borrowedAmount: 500,
    currentLTV: 50
  };

  const predefinedScenarios: Scenario[] = [
    {
      name: "Market Stable 📊",
      description: "RLUSD maintains 1:1 peg",
      xpmPriceChange: 0,
      xrpPriceChange: 0,
      icon: <TrendingUpIcon />,
      color: '#2196f3'
    },
    {
      name: "XPM Crash 📉",
      description: "XPM loses 30% value",
      xpmPriceChange: -30,
      xrpPriceChange: 0,
      icon: <TrendingDownIcon />,
      color: '#ff9800'
    },
    {
      name: "Market Crash 💥",
      description: "Both assets fall 25%",
      xpmPriceChange: -25,
      xrpPriceChange: -25,
      icon: <TrendingDownIcon />,
      color: '#f44336'
    },
    {
      name: "XPM Recovery 📈",
      description: "XPM gains 50%",
      xpmPriceChange: 50,
      xrpPriceChange: 0,
      icon: <TrendingUpIcon />,
      color: '#4caf50'
    },
    {
      name: "Bull Market 🐂",
      description: "Both assets pump 40%",
      xpmPriceChange: 40,
      xrpPriceChange: 40,
      icon: <TrendingUpIcon />,
      color: '#4caf50'
    },
    {
      name: "XPM Surge 🚀",
      description: "XPM gains 30%, RLUSD stable",
      xpmPriceChange: 30,
      xrpPriceChange: 0,
      icon: <TrendingUpIcon />,
      color: '#4caf50'
    }
  ];

  const calculateScenarioImpact = (xpmChange: number, xrpChange: number) => {
    const newXpmPrice = marketData.xpmPriceUSD * (1 + xpmChange / 100);
    const newRlusdPrice = 1; // RLUSD is always 1:1 USD
    
    const newCollateralValueUSD = baseLoan.collateralAmount * newXpmPrice;
    const newDebtValueUSD = baseLoan.borrowedAmount * newRlusdPrice; // RLUSD is 1:1 USD
    const newLTV = (newDebtValueUSD / newCollateralValueUSD) * 100;
    
    const liquidationThreshold = 65;
    const isLiquidated = newLTV >= liquidationThreshold;
    const ltvChange = newLTV - baseLoan.currentLTV;
    
    return {
      newXpmPrice,
      newRlusdPrice,
      newCollateralValueUSD,
      newDebtValueUSD,
      newLTV,
      ltvChange,
      isLiquidated,
      riskLevel: isLiquidated ? 'LIQUIDATED' : 
                 newLTV >= 55 ? 'HIGH RISK' : 
                 newLTV >= 40 ? 'MEDIUM RISK' : 'LOW RISK',
      riskColor: isLiquidated ? 'error' : 
                 newLTV >= 55 ? 'error' : 
                 newLTV >= 40 ? 'warning' : 'success'
    };
  };

  const ScenarioCard: React.FC<{ scenario: Scenario; index: number }> = ({ scenario, index }) => {
    const impact = calculateScenarioImpact(scenario.xpmPriceChange, scenario.xrpPriceChange);
    const isSelected = selectedScenarios.includes(index);
    
    return (
      <Card 
        sx={{ 
          cursor: 'pointer',
          border: isSelected ? `2px solid ${scenario.color}` : '1px solid',
          borderColor: isSelected ? scenario.color : 'divider',
          bgcolor: isSelected ? `${scenario.color}15` : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4
          }
        }}
        onClick={() => {
          setSelectedScenarios(prev => 
            prev.includes(index) 
              ? prev.filter(i => i !== index)
              : [...prev, index]
          );
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ color: scenario.color, mr: 1 }}>
              {scenario.icon}
            </Box>
            <Typography variant="h6" sx={{ color: scenario.color }}>
              {scenario.name}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {scenario.description}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Price Changes:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip 
                label={`XPM: ${scenario.xpmPriceChange >= 0 ? '+' : ''}${scenario.xpmPriceChange}%`}
                size="small"
                color={scenario.xpmPriceChange >= 0 ? 'success' : 'error'}
              />
              <Chip 
                label={`RLUSD: Stable (1:1 USD)`}
                size="small"
                color="default"
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: impact.riskColor + '.main' }}>
              {impact.newLTV.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              New LTV ({impact.ltvChange >= 0 ? '+' : ''}{impact.ltvChange.toFixed(1)}%)
            </Typography>
            
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={impact.riskLevel}
                color={impact.riskColor as any}
                size="small"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const CustomScenario = () => {
    const impact = calculateScenarioImpact(customXpmChange, customXrpChange);
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Build Your Own Scenario
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>
              XPM Price Change: {customXpmChange}%
            </Typography>
            <Slider
              value={customXpmChange}
              onChange={(_, value) => setCustomXpmChange(value as number)}
              min={-50}
              max={100}
              step={5}
              marks={[
                { value: -50, label: '-50%' },
                { value: 0, label: '0%' },
                { value: 50, label: '+50%' },
                { value: 100, label: '+100%' }
              ]}
              color={customXpmChange >= 0 ? 'success' : 'error'}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>
              RLUSD Price: Stable at $1.00 (1:1 USD peg)
            </Typography>
            <Alert severity="info">
              <Typography variant="body2">
                RLUSD maintains a 1:1 peg with USD, eliminating one source of volatility risk.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
        
        <Card sx={{ mt: 3, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Scenario Result
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  New XPM Price
                </Typography>
                <Typography variant="h6">
                  ${impact.newXpmPrice.toFixed(4)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  New RLUSD Price
                </Typography>
                <Typography variant="h6">
                  $1.00
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  New LTV
                </Typography>
                <Typography variant="h6" sx={{ color: impact.riskColor + '.main' }}>
                  {impact.newLTV.toFixed(1)}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={impact.riskLevel}
                  color={impact.riskColor as any}
                  size="small"
                />
              </Grid>
            </Grid>
            
            {impact.isLiquidated && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Liquidation Alert!</strong> This scenario would trigger liquidation. 
                  Your loan would be automatically closed with a 10% penalty.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PlayArrowIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">
          What-If Scenario Playground
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Explore how different market conditions would affect your loan. 
        Based on a 150,000 XPM / 500 RLUSD loan at 50% LTV.
      </Typography>
      
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 3 }}>
        <Tab label="Quick Scenarios" />
        <Tab label="Custom Scenario" />
        <Tab label="Compare Results" />
      </Tabs>
      
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {predefinedScenarios.map((scenario, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ScenarioCard scenario={scenario} index={index} />
            </Grid>
          ))}
        </Grid>
      )}
      
      {activeTab === 1 && <CustomScenario />}
      
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Compare Scenarios
          </Typography>
          
          {selectedScenarios.length === 0 ? (
            <Alert severity="info">
              <Typography variant="body2">
                Select scenarios from the "Quick Scenarios" tab to compare them here.
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {selectedScenarios.map((scenarioIndex) => {
                const scenario = predefinedScenarios[scenarioIndex];
                const impact = calculateScenarioImpact(scenario.xpmPriceChange, scenario.xrpPriceChange);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={scenarioIndex}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: scenario.color }}>
                          {scenario.name}
                        </Typography>
                        <Typography variant="h4" sx={{ color: impact.riskColor + '.main' }}>
                          {impact.newLTV.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          LTV Change: {impact.ltvChange >= 0 ? '+' : ''}{impact.ltvChange.toFixed(1)}%
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={impact.riskLevel}
                            color={impact.riskColor as any}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ScenarioPlayground;