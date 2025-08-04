import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useLending } from '../context/LendingContext';

const Header: React.FC = () => {
  const { marketData } = useLending();

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ maxWidth: 1400, mx: 'auto', width: '100%', px: { xs: 1, sm: 2 } }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            color: 'primary.main', 
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          XRP Lending
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 2 } }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            <Chip
              label={`XPM: $${marketData.xpmPriceUSD.toFixed(4)}`}
              color="secondary"
              size="small"
            />
            <Chip
              label={`XRP: $${marketData.xrpPriceUSD.toFixed(2)}`}
              color="primary"
              size="small"
            />
          </Box>
          
          {/* Mobile price display */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', alignItems: 'center', mr: 1 }}>
            <Typography variant="caption" color="text.secondary">
              XPM: ${marketData.xpmPriceUSD.toFixed(4)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              XRP: ${marketData.xrpPriceUSD.toFixed(2)}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AccountBalanceWalletIcon sx={{ display: { xs: 'none', sm: 'block' } }} />}
            sx={{ 
              ml: { xs: 0, sm: 2 },
              minWidth: { xs: 'auto', sm: 'auto' },
              px: { xs: 1, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Connect Wallet</Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Connect</Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;