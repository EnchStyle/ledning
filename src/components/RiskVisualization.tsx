import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Grid,
  Alert,
  Slider,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

interface RiskVisualizationProps {
  collateralAmount: number;
  borrowAmount: number;
  currentXpmPrice: number;
  currentLTV: number;
}

interface RiskScenario {
  name: string;
  priceChange: number;
  newPrice: number;
  newLTV: number;
  liquidated: boolean;
  severity: 'success' | 'warning' | 'error';
  description: string;
}

const RiskVisualization: React.FC<RiskVisualizationProps> = ({
  collateralAmount,
  borrowAmount,
  currentXpmPrice,
  currentLTV
}) => {
  const [priceSimulation, setPriceSimulation] = useState(0);

  // Calculate liquidation price (65% LTV threshold)
  const liquidationPrice = (borrowAmount * 1.0) / (collateralAmount * 0.65); // RLUSD is 1:1 USD
  const priceDropToLiquidation = ((currentXpmPrice - liquidationPrice) / currentXpmPrice) * 100;

  // Risk scenarios
  const scenarios: RiskScenario[] = [
    {
      name: "Current",
      priceChange: 0,
      newPrice: currentXpmPrice,
      newLTV: currentLTV,
      liquidated: false,
      severity: currentLTV < 40 ? 'success' : currentLTV < 55 ? 'warning' : 'error',
      description: "Your current position"
    },
    {
      name: "10% Drop",
      priceChange: -10,
      newPrice: currentXpmPrice * 0.9,
      newLTV: (borrowAmount / (collateralAmount * currentXpmPrice * 0.9)) * 100,
      liquidated: false,
      severity: 'warning',
      description: "Minor market correction"
    },
    {
      name: "25% Drop",
      priceChange: -25,
      newPrice: currentXpmPrice * 0.75,
      newLTV: (borrowAmount / (collateralAmount * currentXpmPrice * 0.75)) * 100,
      liquidated: false,
      severity: 'error',
      description: "Major market downturn"
    },
    {
      name: "Liquidation",
      priceChange: -priceDropToLiquidation,
      newPrice: liquidationPrice,
      newLTV: 65,
      liquidated: true,
      severity: 'error',
      description: "Automatic liquidation triggered"
    }
  ];

  // Calculate simulated scenario
  const simulatedPrice = currentXpmPrice * (1 + priceSimulation / 100);
  const simulatedLTV = collateralAmount > 0 ? (borrowAmount / (collateralAmount * simulatedPrice)) * 100 : 0;
  const isSimulatedLiquidated = simulatedLTV >= 65;

  const RiskMeter = ({ value, max = 65, label }: { value: number; max?: number; label: string }) => {
    const percentage = (value / max) * 100;
    const color = value < 40 ? 'success' : value < 55 ? 'warning' : 'error';
    
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {value.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={color}
          sx={{ 
            height: 10, 
            borderRadius: 1,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Safe
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Liquidation (65%)
          </Typography>
        </Box>
      </Box>
    );
  };

  const RiskLevel = ({ ltv }: { ltv: number }) => {
    let level, color, icon, description;
    
    if (ltv < 40) {
      level = "Conservative";
      color = "success";
      icon = <ShieldIcon />;
      description = "Very safe position with low liquidation risk";
    } else if (ltv < 55) {
      level = "Moderate";
      color = "warning"; 
      icon = <SpeedIcon />;
      description = "Moderate risk - monitor price movements";
    } else {
      level = "Aggressive";
      color = "error";
      icon = <WarningIcon />;
      description = "High risk - close to liquidation threshold";
    }

    return (
      <Card sx={{ mb: 3, border: `2px solid`, borderColor: `${color}.main` }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ color: `${color}.main`, mr: 2 }}>
              {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">
                Risk Level: {level}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
            <Chip 
              label={`${ltv.toFixed(1)}% LTV`}
              color={color as any}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <RiskMeter value={ltv} label="Loan-to-Value Ratio" />
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Current Risk Assessment */}
      <RiskLevel ltv={currentLTV} />

      {/* Liquidation Warning */}
      <Alert 
        severity={priceDropToLiquidation < 20 ? "error" : priceDropToLiquidation < 35 ? "warning" : "info"} 
        sx={{ mb: 3 }}
        icon={priceDropToLiquidation < 20 ? <WarningIcon /> : <InfoIcon />}
      >
        <Typography variant="body2">
          <strong>Liquidation Buffer:</strong> {priceDropToLiquidation.toFixed(1)}% price drop
          <br />
          <strong>Liquidation Price:</strong> ${liquidationPrice.toFixed(4)} XPM
          <br />
          <strong>Current Price:</strong> ${currentXpmPrice.toFixed(4)} XPM
        </Typography>
      </Alert>

      {/* Price Simulation */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TimelineIcon color="primary" sx={{ mr: 2 }} />
          <Typography variant="h6">
            Price Impact Simulator
          </Typography>
          <Tooltip title="Adjust the slider to see how XPM price changes would affect your loan's risk level">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            XPM Price Change: {priceSimulation >= 0 ? '+' : ''}{priceSimulation}%
          </Typography>
          <Slider
            value={priceSimulation}
            onChange={(_, value) => setPriceSimulation(value as number)}
            min={-60}
            max={50}
            step={1}
            marks={[
              { value: -50, label: '-50%' },
              { value: -25, label: '-25%' },
              { value: 0, label: '0%' },
              { value: 25, label: '+25%' },
              { value: 50, label: '+50%' }
            ]}
            color={priceSimulation < 0 ? 'error' : 'success'}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6" color={priceSimulation < 0 ? 'error.main' : 'success.main'}>
                  ${simulatedPrice.toFixed(4)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  New XPM Price
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography 
                  variant="h6" 
                  color={simulatedLTV > 55 ? 'error.main' : simulatedLTV > 40 ? 'warning.main' : 'success.main'}
                >
                  {simulatedLTV.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  New LTV
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Chip
                  label={isSimulatedLiquidated ? "LIQUIDATED" : "SAFE"}
                  color={isSimulatedLiquidated ? "error" : "success"}
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Status
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {isSimulatedLiquidated && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Liquidation Alert!</strong> At this price, your loan would be automatically liquidated 
              with a 10% penalty deducted from your collateral.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Scenario Analysis */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Risk Scenarios
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Scenario</TableCell>
                  <TableCell align="right">Price Change</TableCell>
                  <TableCell align="right">New Price</TableCell>
                  <TableCell align="right">New LTV</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scenarios.map((scenario, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      bgcolor: scenario.liquidated ? 'error.light' : 'transparent',
                      '&:hover': { bgcolor: scenario.liquidated ? 'error.light' : 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {scenario.priceChange < 0 ? 
                          <TrendingDownIcon color="error" sx={{ mr: 1, fontSize: 16 }} /> :
                          <TrendingUpIcon color="success" sx={{ mr: 1, fontSize: 16 }} />
                        }
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {scenario.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {scenario.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2"
                        color={scenario.priceChange < 0 ? 'error.main' : 'success.main'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {scenario.priceChange >= 0 ? '+' : ''}{scenario.priceChange.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ${scenario.newPrice.toFixed(4)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2"
                        color={scenario.newLTV > 55 ? 'error.main' : scenario.newLTV > 40 ? 'warning.main' : 'success.main'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {scenario.newLTV.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={scenario.liquidated ? "LIQUIDATED" : "SAFE"}
                        color={scenario.severity}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Risk Management Tips:</strong>
            </Typography>
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>Monitor XPM price regularly, especially during volatile periods</li>
              <li>Consider partial repayments to reduce LTV when approaching risk thresholds</li>
              <li>Set price alerts at key levels to stay informed of position changes</li>
              <li>RLUSD stability eliminates debt-side volatility, simplifying risk management</li>
            </ul>
          </Alert>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default RiskVisualization;