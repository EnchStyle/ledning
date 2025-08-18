import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider, Grid } from '@mui/material';
import { useLending } from '../context/LendingContext';

const MarketInfo: React.FC = () => {
  const { marketData, updateXpmPrice } = useLending();
  const [newXpmPrice, setNewXpmPrice] = useState<string>(marketData.xpmPriceUSD.toString());

  const handleXpmPriceUpdate = () => {
    const price = parseFloat(newXpmPrice);
    if (price > 0) {
      updateXpmPrice(price);
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
            RLUSD Price (USD)
          </Typography>
          <Typography variant="h5" gutterBottom>
            $1.00
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
        ⚠️ Price Simulation
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Only XPM price affects liquidation risk (RLUSD is stable at $1)
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
          RLUSD Information
        </Typography>
        <Typography variant="caption" color="text.secondary" paragraph>
          RLUSD is a stablecoin pegged 1:1 to USD. Its price remains constant at $1.00, providing stability for borrowers.
        </Typography>
      </Box>
    </Box>
  );
};

export default MarketInfo;