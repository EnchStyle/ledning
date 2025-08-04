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
      <Toolbar sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
          XRP Lending
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          
          <Button
            variant="contained"
            startIcon={<AccountBalanceWalletIcon />}
            sx={{ ml: 2 }}
          >
            Connect Wallet
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;