import React from 'react';
import {
  Box,
  Typography,
  Container,
  Alert,
  Chip,
  Paper
} from '@mui/material';

const PlatformHeader: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', py: 2, mb: 0 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.5rem', sm: '2rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              🏦 RLUSD Lending Platform
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '0.8rem', sm: '0.9rem' }
              }}
            >
              Decentralized lending on XRP Ledger • Instant RLUSD loans with XPM collateral
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label="🚀 DEMO MODE" 
              size="small" 
              sx={{ 
                bgcolor: 'warning.main', 
                color: 'warning.contrastText',
                fontWeight: 600
              }} 
            />
            <Typography variant="caption" sx={{ opacity: 0.8, display: { xs: 'none', sm: 'block' } }}>
              v1.0.0-beta
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PlatformHeader;