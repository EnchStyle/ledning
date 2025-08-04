import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Paper,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface DualAssetMarketSimulatorProps {
  currentXpmPrice: number;
  currentXrpPrice: number;
  onXpmPriceChange: (newPrice: number) => void;
  onXrpPriceChange: (newPrice: number) => void;
}

const DualAssetMarketSimulator: React.FC<DualAssetMarketSimulatorProps> = ({
  currentXpmPrice,
  currentXrpPrice,
  onXpmPriceChange,
  onXrpPriceChange,
}) => {
  const [newXpmPrice, setNewXpmPrice] = useState<string>(currentXpmPrice.toFixed(4));
  const [newXrpPrice, setNewXrpPrice] = useState<string>(currentXrpPrice.toFixed(2));

  const handleXpmPriceUpdate = () => {
    const price = parseFloat(newXpmPrice);
    if (price > 0) {
      onXpmPriceChange(price);
    }
  };

  const handleXrpPriceUpdate = () => {
    const price = parseFloat(newXrpPrice);
    if (price > 0) {
      onXrpPriceChange(price);
    }
  };

  const quickXpmChanges = [
    { label: '-50%', multiplier: 0.5, color: 'error' as const },
    { label: '-30%', multiplier: 0.7, color: 'error' as const },
    { label: '-10%', multiplier: 0.9, color: 'warning' as const },
    { label: '+10%', multiplier: 1.1, color: 'success' as const },
    { label: '+30%', multiplier: 1.3, color: 'success' as const },
    { label: 'Reset', multiplier: 1, value: 0.02, color: 'default' as const },
  ];

  const quickXrpChanges = [
    { label: '-30%', multiplier: 0.7, color: 'success' as const }, // Good for borrowers
    { label: '-10%', multiplier: 0.9, color: 'success' as const },
    { label: '+10%', multiplier: 1.1, color: 'warning' as const },
    { label: '+30%', multiplier: 1.3, color: 'error' as const }, // Bad for borrowers  
    { label: '+50%', multiplier: 1.5, color: 'error' as const },
    { label: 'Reset', multiplier: 1, value: 3.0, color: 'default' as const },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        📈 Dual-Asset Market Simulator
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Both XPM and XRP prices affect your loan's liquidation risk. 
          Test different market scenarios to understand your exposure.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* XPM Price Control */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" gutterBottom>
              XPM Price (Collateral Asset)
            </Typography>
            <Typography variant="h4" color="secondary" gutterBottom>
              ${currentXpmPrice.toFixed(4)}
            </Typography>
            
            <TextField
              size="small"
              type="number"
              value={newXpmPrice}
              onChange={(e) => setNewXpmPrice(e.target.value)}
              inputProps={{ step: 0.001, min: 0.001 }}
              fullWidth
              margin="dense"
              label="New XPM Price (USD)"
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleXpmPriceUpdate}
              fullWidth
              sx={{ mt: 1 }}
            >
              Update XPM Price
            </Button>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Quick Changes:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {quickXpmChanges.map((change) => (
                  <Chip
                    key={change.label}
                    label={change.label}
                    size="small"
                    color={change.color}
                    onClick={() => {
                      const newPrice = change.value || (currentXpmPrice * change.multiplier);
                      setNewXpmPrice(newPrice.toFixed(4));
                      onXpmPriceChange(newPrice);
                    }}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              <TrendingDownIcon fontSize="small" /> Lower XPM = Higher liquidation risk
            </Typography>
          </Paper>
        </Grid>

        {/* XRP Price Control */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" gutterBottom>
              XRP Price (Debt Asset)
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              ${currentXrpPrice.toFixed(2)}
            </Typography>
            
            <TextField
              size="small"
              type="number"
              value={newXrpPrice}
              onChange={(e) => setNewXrpPrice(e.target.value)}
              inputProps={{ step: 0.01, min: 0.01 }}
              fullWidth
              margin="dense"
              label="New XRP Price (USD)"
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleXrpPriceUpdate}
              fullWidth
              sx={{ mt: 1 }}
            >
              Update XRP Price
            </Button>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Quick Changes:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {quickXrpChanges.map((change) => (
                  <Chip
                    key={change.label}
                    label={change.label}
                    size="small"
                    color={change.color}
                    onClick={() => {
                      const newPrice = change.value || (currentXrpPrice * change.multiplier);
                      setNewXrpPrice(newPrice.toFixed(2));
                      onXrpPriceChange(newPrice);
                    }}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              <TrendingUpIcon fontSize="small" /> Higher XRP = Higher liquidation risk
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          💡 Test These Scenarios:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="success.main">
              <strong>Bull Market:</strong> XPM +30%, XRP +10%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="warning.main">
              <strong>XPM Crash:</strong> XPM -40%, XRP stable
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="warning.main">
              <strong>XRP Pump:</strong> XPM stable, XRP +50%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="error.main">
              <strong>Worst Case:</strong> XPM -30%, XRP +30%
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default DualAssetMarketSimulator;