import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider } from '@mui/material';
import { useLending } from '../context/LendingContext';

const MarketInfo: React.FC = () => {
  const { marketData, updateMarketPrice } = useLending();
  const [newPrice, setNewPrice] = useState<string>(marketData.xpmPrice.toString());

  const handlePriceUpdate = () => {
    const price = parseFloat(newPrice);
    if (price > 0) {
      updateMarketPrice(price);
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        XPM/XRP Price
      </Typography>
      <Typography variant="h4" gutterBottom>
        {marketData.xpmPrice.toFixed(4)}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        Liquidation Fee
      </Typography>
      <Typography variant="h6" gutterBottom>
        {marketData.liquidationFee}%
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom>
        Simulate Price Change
      </Typography>
      <TextField
        size="small"
        type="number"
        value={newPrice}
        onChange={(e) => setNewPrice(e.target.value)}
        inputProps={{ step: 0.01 }}
        fullWidth
        margin="dense"
      />
      <Button
        variant="outlined"
        size="small"
        onClick={handlePriceUpdate}
        fullWidth
        sx={{ mt: 1 }}
      >
        Update Price
      </Button>
    </Box>
  );
};

export default MarketInfo;