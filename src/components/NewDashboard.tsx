import React, { useState } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  RequestQuote as LoanIcon,
  PieChart as DashboardIcon,
  Analytics as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useLending } from '../context/LendingContext';
import { DEMO_PORTFOLIO } from '../config/demoConstants';
import { DEMO_CONFIG } from '../config/demoConstants';
import LoanCreationPage from './LoanCreationPage';
import PortfolioDashboard from './PortfolioDashboard';
import StaticPortfolioDashboard from './StaticPortfolioDashboard';
import HighPerformancePortfolioDashboard from './HighPerformancePortfolioDashboard';
import AnalyticsPage from './AnalyticsPage';

type TabType = 'portfolio' | 'borrow' | 'analytics';

interface NavigationItem {
  id: TabType;
  label: string;
  icon: React.ReactElement;
  description: string;
}

const NewDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  const { marketData, userPosition, simulationSettings } = useLending();

  // Demo balance - 2M XPM
  const walletBalance = DEMO_PORTFOLIO.XPM_BALANCE;
  const walletValueUSD = walletBalance * marketData.xpmPriceUSD;

  const navigationItems: NavigationItem[] = [
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: <DashboardIcon />,
      description: 'View your loans and overall position',
    },
    {
      id: 'borrow',
      label: 'Borrow',
      icon: <LoanIcon />,
      description: 'Create new RLUSD loan',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUpIcon />,
      description: 'Market data and insights',
    },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMobileDrawerOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'portfolio':
        // Smart component selection based on simulation speed
        if (!simulationSettings.isActive) {
          // No simulation - use regular component
          return <PortfolioDashboard onNavigateToBorrow={() => setActiveTab('borrow')} />;
        } else if (simulationSettings.speed >= 5) {
          // High speed (5x+) - use high-performance component
          return <HighPerformancePortfolioDashboard onNavigateToBorrow={() => setActiveTab('borrow')} />;
        } else {
          // Low speed (1x-4x) - use static component to prevent freezing
          return <StaticPortfolioDashboard onNavigateToBorrow={() => setActiveTab('borrow')} />;
        }
      case 'borrow':
        return <LoanCreationPage onNavigateToPortfolio={() => setActiveTab('portfolio')} />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        // Smart default component selection
        if (!simulationSettings.isActive) {
          return <PortfolioDashboard />;
        } else if (simulationSettings.speed >= 5) {
          return <HighPerformancePortfolioDashboard />;
        } else {
          return <StaticPortfolioDashboard />;
        }
    }
  };

  const NavigationContent = () => (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          RLUSD Lending
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Borrow RLUSD with XPM collateral
        </Typography>
      </Box>

      {/* Wallet Info */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WalletIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Wallet Balance
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {walletBalance.toLocaleString()} XPM
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ≈ ${walletValueUSD.toLocaleString()} USD
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`$${marketData.xpmPriceUSD.toFixed(4)}/XPM`}
            size="small"
            color={simulationSettings.isActive ? "success" : "default"}
          />
          {simulationSettings.isActive && (
            <Chip 
              label="LIVE"
              size="small"
              color="error"
              sx={{ 
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                }
              }}
            />
          )}
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 2, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            selected={activeTab === item.id}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              secondary={activeTab === item.id ? item.description : undefined}
              secondaryTypographyProps={{
                sx: { color: 'inherit', opacity: 0.8, fontSize: '0.75rem' }
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Portfolio Summary in Navigation */}
      {userPosition.totalCollateral > 0 && (
        <Box sx={{ p: 3, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active Position
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Collateral</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {userPosition.totalCollateral.toLocaleString()} XPM
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Debt</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {(userPosition.totalBorrowed + userPosition.totalFixedInterest).toFixed(0)} RLUSD
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop Navigation */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          <NavigationContent />
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <NavigationContent />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header */}
        {isMobile && (
          <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                {navigationItems.find(item => item.id === activeTab)?.label}
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                W
              </Avatar>
            </Toolbar>
          </AppBar>
        )}

        {/* Page Content with Fixed Max Width */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Container 
            maxWidth={false}
            sx={{ 
              maxWidth: '1400px',
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 3, md: 4 },
              minHeight: '100%',
            }}
          >
            {renderTabContent()}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default NewDashboard;