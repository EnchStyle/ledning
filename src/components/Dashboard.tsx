import React from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import { useLending } from '../context/LendingContext';
import LoanCreation from './LoanCreation';
import MarketInfo from './MarketInfo';
import UserPositions from './UserPositions';
import TimeSimulator from './TimeSimulator';
import MarginCallAlert from './MarginCallAlert';
import LiquidationInfo from './LiquidationInfo';

const Dashboard: React.FC = () => {
  const { userPosition } = useLending();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        XRP Lending Platform
      </Typography>
      
      <MarginCallAlert />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Market Info
            </Typography>
            <MarketInfo />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Your Position
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box>
                  <Typography color="text.secondary">Total Collateral (XPM)</Typography>
                  <Typography variant="h4">{userPosition.totalCollateral.toFixed(2)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography color="text.secondary">Total Borrowed (XRP)</Typography>
                  <Typography variant="h4">{userPosition.totalBorrowed.toFixed(2)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography color="text.secondary">Accrued Interest (XRP)</Typography>
                  <Typography variant="h4">{userPosition.totalInterest.toFixed(4)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Borrow XRP
            </Typography>
            <LoanCreation />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Time Simulator
            </Typography>
            <TimeSimulator />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Active Loans
            </Typography>
            <UserPositions />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <LiquidationInfo />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;