import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  FormControl,
  FormLabel,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';

const SimulationControls: React.FC = React.memo(() => {
  const { 
    simulationSettings, 
    toggleSimulation, 
    updateSimulationSettings,
    clearPriceHistory,
    marketData,
    priceHistory 
  } = useLending();

  const handleSpeedChange = (_event: Event, value: number | number[]) => {
    updateSimulationSettings({ speed: value as number });
  };

  const handleVolatilityChange = (_event: Event, value: number | number[]) => {
    updateSimulationSettings({ volatility: (value as number) / 100 });
  };

  const getSpeedLabel = (speed: number) => {
    if (speed <= 1) return `${speed}x (${10 / speed}s)`;
    return `${speed}x (${(10 / speed).toFixed(1)}s)`;
  };

  const getVolatilityLabel = (volatility: number) => {
    return `${(volatility * 100).toFixed(1)}%`;
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TrendingUpIcon color="primary" sx={{ mr: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Market Simulation
        </Typography>
        <Tooltip title="Simulate real-time price movements to test loan performance">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Current Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip 
          label={simulationSettings.isActive ? "Simulation Active" : "Simulation Paused"}
          color={simulationSettings.isActive ? "success" : "default"}
          icon={simulationSettings.isActive ? <PlayIcon /> : <PauseIcon />}
        />
        <Typography variant="body2" color="text.secondary">
          Current XPM Price: <strong>${marketData.xpmPriceUSD.toFixed(4)}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Data Points: <strong>{priceHistory.length}</strong>
        </Typography>
        {simulationSettings.speed >= 3 && (
          <Chip 
            label={simulationSettings.speed >= 5 ? "Extreme Speed" : "High Speed"} 
            color={simulationSettings.speed >= 5 ? "error" : "warning"} 
            size="small"
            icon={<SpeedIcon />}
          />
        )}
        {simulationSettings.volatility >= 0.1 && (
          <Chip 
            label={simulationSettings.volatility >= 0.2 ? "Extreme Volatility" : "High Volatility"} 
            color={simulationSettings.volatility >= 0.2 ? "error" : "warning"} 
            size="small"
            icon={<TrendingUpIcon />}
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Performance Warning for High Settings */}
      {(simulationSettings.speed >= 3 || simulationSettings.volatility >= 0.1) && (
        <Alert 
          severity={simulationSettings.speed >= 5 || simulationSettings.volatility >= 0.2 ? "error" : "warning"} 
          sx={{ mb: 2 }}
          icon={<TrendingUpIcon />}
        >
          <Typography variant="body2">
            <strong>High Performance Impact!</strong>
            {simulationSettings.speed >= 3 && (
              <> Speed is at {simulationSettings.speed}x (capped at 3x for stability).</>
            )}
            {simulationSettings.speed >= 3 && simulationSettings.volatility >= 0.1 && ' '}
            {simulationSettings.volatility >= 0.1 && (
              <>High volatility at {(simulationSettings.volatility * 100).toFixed(0)}% may cause browser lag!</>
            )}
            {simulationSettings.speed >= 5 && (
              <><br /><strong>Warning:</strong> Settings above 3x speed may cause page crashes when switching tabs!</>
            )}
          </Typography>
        </Alert>
      )}

      {/* Controls */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, alignItems: 'end' }}>
        {/* Play/Pause Control */}
        <Box>
          <FormLabel component="legend" sx={{ mb: 1, display: 'block' }}>
            Simulation Control
          </FormLabel>
          <Button
            variant={simulationSettings.isActive ? "contained" : "outlined"}
            color={simulationSettings.isActive ? "error" : "primary"}
            startIcon={simulationSettings.isActive ? <PauseIcon /> : <PlayIcon />}
            onClick={toggleSimulation}
            fullWidth
            size="large"
          >
            {simulationSettings.isActive ? 'Pause' : 'Start'} Simulation
          </Button>
        </Box>

        {/* Speed Control */}
        <Box>
          <FormLabel component="legend" sx={{ mb: 2, display: 'block' }}>
            Speed: {getSpeedLabel(simulationSettings.speed)}
          </FormLabel>
          <Slider
            value={simulationSettings.speed}
            onChange={handleSpeedChange}
            min={0.5}
            max={5}
            step={0.5}
            marks={[
              { value: 0.5, label: '0.5x' },
              { value: 1, label: '1x' },
              { value: 2, label: '2x' },
              { value: 4, label: '4x' },
              { value: 5, label: '5x' },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}x`}
            disabled={simulationSettings.isActive}
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            Higher speed = faster price updates
          </Typography>
        </Box>

        {/* Volatility Control */}
        <Box>
          <FormLabel component="legend" sx={{ mb: 2, display: 'block' }}>
            Volatility: {getVolatilityLabel(simulationSettings.volatility)}
          </FormLabel>
          <Slider
            value={simulationSettings.volatility * 100}
            onChange={handleVolatilityChange}
            min={0.5}
            max={50}
            step={0.5}
            marks={[
              { value: 0.5, label: '0.5%' },
              { value: 2, label: '2%' },
              { value: 10, label: '10%' },
              { value: 25, label: '25%' },
              { value: 50, label: '50%' },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value.toFixed(1)}%`}
            disabled={simulationSettings.isActive}
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            Higher volatility = larger price swings
          </Typography>
        </Box>
      </Box>

      {/* Reset Controls */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={clearPriceHistory}
          disabled={simulationSettings.isActive}
        >
          Clear History
        </Button>
        <Button
          variant="outlined"
          onClick={() => updateSimulationSettings({ volatility: 0.02, speed: 1 })}
          disabled={simulationSettings.isActive}
        >
          Reset to Defaults
        </Button>
      </Box>

      {/* Help Text */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'surface.main', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>How it works:</strong> The simulation generates realistic price movements every 10 seconds (adjustable by speed). 
          Watch how your loans react to market volatility and track performance over time.
          <br /><br />
          <strong>Speed Settings:</strong> 0.5x-2x for normal testing, 3-5x for stress testing (may impact performance).
          <br />
          <strong>Volatility Settings:</strong> 0.5-5% for normal markets, 10-20% for volatile conditions, 25%+ may cause browser lag.
        </Typography>
      </Box>
    </Paper>
  );
});

export default SimulationControls;