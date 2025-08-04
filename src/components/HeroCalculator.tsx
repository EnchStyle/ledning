import React, { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Slider,
  Box,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useLending } from '../context/LendingContext';
import { calculateMaxBorrowUSD, calculateLiquidationPriceUSD } from '../utils/lendingCalculations';

const HeroCalculator: React.FC = () => {
  const { marketData } = useLending();
  const [collateralAmount, setCollateralAmount] = useState<number>(150000);
  const [targetLTV, setTargetLTV] = useState<number>(40);

  const calculations = useMemo(() => {
    const collateralValueUSD = collateralAmount * marketData.xpmPriceUSD;
    const maxBorrowXRP = calculateMaxBorrowUSD(
      collateralAmount,
      marketData.xpmPriceUSD,
      marketData.xrpPriceUSD,
      targetLTV
    );
    const borrowValueUSD = maxBorrowXRP * marketData.xrpPriceUSD;
    
    const liquidationPriceUSD = calculateLiquidationPriceUSD(
      maxBorrowXRP,
      collateralAmount,
      marketData.xrpPriceUSD,
      65
    );
    
    const priceDropToLiquidation = ((marketData.xpmPriceUSD - liquidationPriceUSD) / marketData.xpmPriceUSD) * 100;
    
    // Calculate potential monthly interest
    const monthlyInterestRate = 15 / 12 / 100;
    const monthlyInterestXRP = maxBorrowXRP * monthlyInterestRate;
    const monthlyInterestUSD = monthlyInterestXRP * marketData.xrpPriceUSD;

    return {
      collateralValueUSD,
      maxBorrowXRP,
      borrowValueUSD,
      liquidationPriceUSD,
      priceDropToLiquidation: Math.max(0, priceDropToLiquidation),
      monthlyInterestXRP,
      monthlyInterestUSD,
      riskLevel: targetLTV <= 30 ? 'low' : targetLTV <= 45 ? 'medium' : 'high',
      riskColor: targetLTV <= 30 ? 'success' : targetLTV <= 45 ? 'warning' : 'error'
    };
  }, [collateralAmount, targetLTV, marketData]);

  const getRiskMessage = () => {
    if (targetLTV <= 30) return "🛡️ Very Safe - Conservative approach recommended for beginners";
    if (targetLTV <= 45) return "⚖️ Balanced - Good mix of safety and borrowing power";
    return "⚠️ Aggressive - Higher returns but increased liquidation risk";
  };

  return (
    <Paper 
      elevation={8}
      sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3,
        maxWidth: 900,
        mx: 'auto',
        mb: 4
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          See What You Could Borrow
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Adjust the sliders below to instantly see your loan potential
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Controls Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Loan Calculator
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography gutterBottom sx={{ color: 'white' }}>
                  XPM Collateral: {collateralAmount.toLocaleString()} XPM
                </Typography>
                <Slider
                  value={collateralAmount}
                  onChange={(_, value) => setCollateralAmount(value as number)}
                  min={50000}
                  max={500000}
                  step={10000}
                  sx={{
                    color: 'white',
                    '& .MuiSlider-thumb': { bgcolor: 'white' },
                    '& .MuiSlider-track': { bgcolor: 'white' },
                    '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  ≈ ${calculations.collateralValueUSD.toFixed(0)} USD value
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom sx={{ color: 'white' }}>
                  Target LTV: {targetLTV}%
                </Typography>
                <Slider
                  value={targetLTV}
                  onChange={(_, value) => setTargetLTV(value as number)}
                  min={20}
                  max={50}
                  step={5}
                  marks={[
                    { value: 20, label: '20%' },
                    { value: 35, label: '35%' },
                    { value: 50, label: '50%' }
                  ]}
                  sx={{
                    color: calculations.riskColor === 'success' ? '#4caf50' : 
                           calculations.riskColor === 'warning' ? '#ff9800' : '#f44336',
                    '& .MuiSlider-thumb': { 
                      bgcolor: calculations.riskColor === 'success' ? '#4caf50' : 
                               calculations.riskColor === 'warning' ? '#ff9800' : '#f44336'
                    },
                    '& .MuiSlider-track': { 
                      bgcolor: calculations.riskColor === 'success' ? '#4caf50' : 
                               calculations.riskColor === 'warning' ? '#ff9800' : '#f44336'
                    }
                  }}
                />
                <Alert 
                  severity={calculations.riskColor as any} 
                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <Typography variant="caption">
                    {getRiskMessage()}
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Your Loan Preview
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {calculations.maxBorrowXRP.toFixed(0)} XRP
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  ≈ ${calculations.borrowValueUSD.toFixed(0)} USD you'll receive
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Monthly Cost
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    {calculations.monthlyInterestXRP.toFixed(2)} XRP
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    ≈ ${calculations.monthlyInterestUSD.toFixed(2)} USD
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Safety Buffer
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    {calculations.priceDropToLiquidation.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Price drop tolerance
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Risk Level
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(targetLTV / 65) * 100}
                  color={calculations.riskColor as any}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Safe
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Liquidation at 65%
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ 
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                Create This Loan →
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Chip 
              icon={<SecurityIcon />}
              label="15% APR" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>
              Competitive Rate
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Chip 
              label="No Hidden Fees" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>
              Only 10% liquidation fee
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Chip 
              label="Instant Loans" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>
              Get XRP immediately
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default HeroCalculator;