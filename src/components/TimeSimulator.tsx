import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Stack } from '@mui/material';
import { useLending } from '../context/LendingContext';
import { format } from 'date-fns';

const TimeSimulator: React.FC = () => {
  const { simulateTime, currentTime } = useLending();
  const [daysToSimulate, setDaysToSimulate] = useState<string>('1');

  const handleSimulate = () => {
    const days = parseFloat(daysToSimulate);
    if (days > 0) {
      simulateTime(days);
    }
  };

  const quickSimulate = (days: number) => {
    simulateTime(days);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Current Time
      </Typography>
      <Typography variant="h6" gutterBottom>
        {format(currentTime, 'PPpp')}
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Days to Simulate"
          type="number"
          value={daysToSimulate}
          onChange={(e) => setDaysToSimulate(e.target.value)}
          margin="normal"
        />
        
        <Button
          fullWidth
          variant="contained"
          onClick={handleSimulate}
          sx={{ mt: 1 }}
        >
          Simulate Time
        </Button>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => quickSimulate(1)}>
            +1 Day
          </Button>
          <Button size="small" variant="outlined" onClick={() => quickSimulate(7)}>
            +1 Week
          </Button>
          <Button size="small" variant="outlined" onClick={() => quickSimulate(30)}>
            +1 Month
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default TimeSimulator;