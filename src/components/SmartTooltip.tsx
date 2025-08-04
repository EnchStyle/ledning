import React from 'react';
import {
  Tooltip,
  IconButton,
  Typography,
  Box,
  Paper,
  Chip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface SmartTooltipProps {
  term: 'ltv' | 'liquidation' | 'interest' | 'collateral' | 'apr' | 'compound' | 'dual-asset';
  children?: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'icon' | 'inline' | 'chip';
}

const SmartTooltip: React.FC<SmartTooltipProps> = ({ 
  term, 
  children, 
  placement = 'top',
  variant = 'icon'
}) => {
  const getTooltipContent = () => {
    switch (term) {
      case 'ltv':
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#4caf50' }}>
              📊 Loan-to-Value (LTV) Ratio
            </Typography>
            <Typography variant="body2" paragraph>
              Think of this as how "full" your loan is:
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Chip label="25% = Very Safe" color="success" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
              <Chip label="40% = Balanced" color="warning" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
              <Chip label="65% = Liquidation" color="error" size="small" sx={{ mb: 0.5 }} />
            </Box>
            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
              Formula: (Debt Value ÷ Collateral Value) × 100
            </Typography>
          </Box>
        );

      case 'liquidation':
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#f44336' }}>
              ⚠️ Liquidation Explained
            </Typography>
            <Typography variant="body2" paragraph>
              Like a margin call in traditional finance - we automatically sell your XPM 
              to recover the XRP loan when your LTV reaches 65%.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>What happens:</strong>
            </Typography>
            <Typography variant="body2" component="div">
              • Your XPM collateral is sold
              <br />• Loan + 10% fee is recovered
              <br />• You keep any remaining XPM
            </Typography>
            <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 'bold' }}>
              Prevention is better than cure - monitor your LTV!
            </Typography>
          </Box>
        );

      case 'interest':
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#2196f3' }}>
              💰 Interest Calculation
            </Typography>
            <Typography variant="body2" paragraph>
              We use compound interest (like a savings account in reverse):
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>15% APR examples:</strong>
              <br />• $100 loan = ~$1.25/month
              <br />• $1000 loan = ~$12.50/month
            </Typography>
            <Typography variant="caption">
              Interest compounds daily for accuracy
            </Typography>
          </Box>
        );

      case 'collateral':
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
              🔒 Collateral System
            </Typography>
            <Typography variant="body2" paragraph>
              Your XPM tokens act as security for the loan:
            </Typography>
            <Typography variant="body2" component="div">
              • Locked in smart contract
              <br />• Released when you repay
              <br />• Sold if loan goes bad
            </Typography>
            <Typography variant="caption" sx={{ color: '#9c27b0' }}>
              More collateral = safer loan & more borrowing power
            </Typography>
          </Box>
        );

      case 'apr':
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#ff9800' }}>
              📈 Annual Percentage Rate (APR)
            </Typography>
            <Typography variant="body2" paragraph>
              The yearly cost of your loan, including compounding:
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>15% APR breakdown:</strong>
              <br />• Daily rate: ~0.041%
              <br />• Monthly rate: ~1.25%
              <br />• Compounds automatically
            </Typography>
            <Typography variant="caption">
              Industry standard for altcoin collateral
            </Typography>
          </Box>
        );

      case 'compound':
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#795548' }}>
              🔄 Compound Interest
            </Typography>
            <Typography variant="body2" paragraph>
              Interest earns interest over time:
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Example (500 XRP loan):</strong>
              <br />• Simple interest (1 year): 75 XRP
              <br />• Compound interest (1 year): 80.9 XRP
              <br />• Difference: 5.9 XRP extra
            </Typography>
            <Typography variant="caption">
              More realistic for DeFi lending
            </Typography>
          </Box>
        );

      case 'dual-asset':
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#e91e63' }}>
              ⚖️ Dual-Asset Risk
            </Typography>
            <Typography variant="body2" paragraph>
              Both XPM and XRP prices affect your liquidation risk:
            </Typography>
            <Typography variant="body2" component="div">
              <strong>XPM falls:</strong> Collateral value ↓ = Higher LTV
              <br /><strong>XRP rises:</strong> Debt value ↑ = Higher LTV
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'rgba(233, 30, 99, 0.1)', borderRadius: 1 }}>
              💡 <strong>Key insight:</strong> Monitor both asset prices, not just XPM!
            </Typography>
          </Box>
        );

      default:
        return <Typography variant="body2">No information available</Typography>;
    }
  };

  const getIcon = () => {
    switch (term) {
      case 'liquidation': return <WarningIcon sx={{ fontSize: 16 }} />;
      case 'interest': case 'apr': case 'compound': return <TrendingUpIcon sx={{ fontSize: 16 }} />;
      default: return <HelpOutlineIcon sx={{ fontSize: 16 }} />;
    }
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'chip':
        return (
          <Chip
            label={term.toUpperCase()}
            size="small"
            icon={getIcon()}
            sx={{ cursor: 'help' }}
          />
        );
      
      case 'inline':
        return (
          <Box component="span" sx={{ 
            textDecoration: 'underline dotted', 
            cursor: 'help',
            color: 'primary.main'
          }}>
            {children || term}
          </Box>
        );
      
      default:
        return (
          <IconButton size="small" sx={{ ml: 0.5, opacity: 0.7 }}>
            {getIcon()}
          </IconButton>
        );
    }
  };

  return (
    <Tooltip
      title={
        <Paper elevation={8} sx={{ maxWidth: 350 }}>
          {getTooltipContent()}
        </Paper>
      }
      placement={placement}
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'transparent',
            '& .MuiTooltip-arrow': {
              color: 'background.paper'
            }
          }
        }
      }}
    >
      {renderTrigger()}
    </Tooltip>
  );
};

export default SmartTooltip;