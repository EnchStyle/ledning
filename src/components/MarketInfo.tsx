import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider, Grid } from '@mui/material';
import { useLending } from '../context/LendingContext';

const MarketInfo: React.FC = () => {
  const { marketData, updateXpmPrice, updateXrpPrice } = useLending();
  const [newXpmPrice, setNewXpmPrice] = useState<string>(marketData.xpmPriceUSD.toString());
  const [newXrpPrice, setNewXrpPrice] = useState<string>(marketData.xrpPriceUSD.toString());

  const handleXpmPriceUpdate = () => {
    const price = parseFloat(newXpmPrice);
    if (price > 0) {
      updateXpmPrice(price);
    }
  };

  const handleXrpPriceUpdate = () => {
    const price = parseFloat(newXrpPrice);
    if (price > 0) {
      updateXrpPrice(price);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Current Market Prices
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            XPM Price (USD)
          </Typography>
          <Typography variant="h5" gutterBottom>
            ${marketData.xpmPriceUSD.toFixed(4)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            XRP Price (USD)
          </Typography>
          <Typography variant="h5" gutterBottom>
            ${marketData.xrpPriceUSD.toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
      
      <Typography variant="body2" color="text.secondary">
        Liquidation Fee
      </Typography>
      <Typography variant="h6" gutterBottom>
        {marketData.liquidationFee}%
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom color="warning.main">
        ⚠️ Dual-Asset Price Simulation
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Both XPM and XRP prices affect liquidation risk!
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Simulate XPM Price
        </Typography>
        <TextField
          size="small"
          type="number"
          value={newXpmPrice}
          onChange={(e) => setNewXpmPrice(e.target.value)}
          inputProps={{ step: 0.0001 }}
          fullWidth
          margin="dense"
          placeholder="0.0200"
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
      </Box>
      
      <Box>
        <Typography variant="body2" gutterBottom>
          Simulate XRP Price
        </Typography>
        <TextField
          size="small"
          type="number"
          value={newXrpPrice}
          onChange={(e) => setNewXrpPrice(e.target.value)}
          inputProps={{ step: 0.01 }}
          fullWidth
          margin="dense"
          placeholder="3.00"
        />
        <Button
          variant="outlined"
          size="small"
          onClick={handleXrpPriceUpdate}
          fullWidth
          sx={{ mt: 1 }}
          color="secondary"
        >
          Update XRP Price
        </Button>
      </Box>
    </Box>
  );
};

export default MarketInfo;