import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import TimeSimulator from './TimeSimulator';
import MarketInfo from './MarketInfo';

const SimulationTools: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <ScienceIcon color="secondary" />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Demo & Simulation Tools
          </Typography>
          <Chip label="For Testing Only" color="secondary" size="small" />
        </Box>
        <Typography variant="h6" color="text.secondary">
          Explore how loans behave over time and under different market conditions
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Demo Mode:</strong> These tools are for demonstration purposes only. 
              In a real application, time would progress naturally and prices would come from oracles.
            </Typography>
          </Alert>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              ⏰ Time Machine
            </Typography>
            <Typography color="text.secondary" paragraph>
              Fast-forward time to see how interest accrues on your loans over days, weeks, or months.
            </Typography>
            <TimeSimulator />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              📈 Market Simulator
            </Typography>
            <Typography color="text.secondary" paragraph>
              Adjust XPM prices to test how price movements affect loan health and liquidation risk.
            </Typography>
            <MarketInfo />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              💡 How to Use These Tools
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    1. Create a Loan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Go to the Borrow tab and create a loan with some XPM collateral.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    2. Simulate Time
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the Time Machine to see interest accumulate over time.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    3. Test Price Changes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lower the XPM price to trigger margin calls and see liquidation warnings.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SimulationTools;