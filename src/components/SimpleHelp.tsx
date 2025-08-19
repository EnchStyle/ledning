import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLending } from '../context/LendingContext';

const SimpleHelp: React.FC = () => {
  const { marketData } = useLending();
  const [expanded, setExpanded] = useState<string | false>('basics');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      id: 'basics',
      question: 'How does XPM-backed lending work?',
      answer: (
        <Box>
          <Typography paragraph>
            You deposit XPM tokens as collateral and receive RLUSD instantly. The process is simple:
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li>Deposit XPM tokens (locked as collateral)</li>
            <li>Receive RLUSD immediately (up to 50% of collateral value)</li>
            <li>Pay competitive annual interest (19% for 30d, 16% for 60d, 15% for 90d)</li>
            <li>Repay anytime to unlock your XPM</li>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Your XPM stays locked until you repay the full loan amount plus interest.
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      id: 'ltv',
      question: 'What is LTV and why does it matter?',
      answer: (
        <Box>
          <Typography paragraph>
            LTV (Loan-to-Value) is how "full" your loan is, calculated in USD:
          </Typography>
          <Typography paragraph sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
            LTV = (RLUSD Debt Value ÷ XPM Collateral Value) × 100
          </Typography>
          <Typography paragraph>
            <strong>Example:</strong> You deposit 150,000 XPM ($3,000) and borrow 500 RLUSD ($500):
            <br />LTV = ($500 ÷ $3,000) × 100 = 16.7%
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip label="0-40% = Healthy" color="success" sx={{ mr: 1, mb: 1 }} />
            <Chip label="40-55% = Medium Risk" color="warning" sx={{ mr: 1, mb: 1 }} />
            <Chip label="55-65% = High Risk" color="error" sx={{ mr: 1, mb: 1 }} />
            <Chip label="65%+ = Liquidated" color="error" variant="outlined" sx={{ mb: 1 }} />
          </Box>
        </Box>
      )
    },
    {
      id: 'liquidation',
      question: 'When and how does liquidation happen?',
      answer: (
        <Box>
          <Typography paragraph>
            Liquidation automatically occurs when your LTV reaches 65%. This protects the platform from losses.
          </Typography>
          <Typography paragraph>
            <strong>What happens during liquidation:</strong>
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li>Your XPM collateral is automatically sold</li>
            <li>The RLUSD loan + 10% fee is recovered</li>
            <li>Any remaining XPM is returned to you</li>
          </Box>
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Prevention:</strong> Monitor your LTV regularly. Repay part of your loan or add more collateral when LTV gets above 50%.
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      id: 'dual-risk',
      question: 'How does XPM price affect my loan?',
      answer: (
        <Box>
          <Typography paragraph>
            Since RLUSD is pegged 1:1 to USD, only XPM price changes affect your loan health:
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                <Typography variant="subtitle2" color="error.dark">
                  Increases LTV (Bad)
                </Typography>
                <Typography variant="body2">
                  • XPM price falls<br />
                  • (RLUSD price stable)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                <Typography variant="subtitle2" color="success.dark">
                  Decreases LTV (Good)
                </Typography>
                <Typography variant="body2">
                  • XPM price rises<br />
                  • (RLUSD price stable)
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <Typography paragraph sx={{ mt: 2 }}>
            <strong>Example:</strong> If XPM falls from $0.02 to $0.015, your $3,000 collateral becomes $2,250, 
            increasing your LTV and potentially triggering liquidation. RLUSD debt remains stable at $500.
          </Typography>
        </Box>
      )
    },
    {
      id: 'interest',
      question: 'How is interest calculated?',
      answer: (
        <Box>
          <Typography paragraph>
Interest rates vary by loan term with daily compounding:
          </Typography>
          <Typography paragraph>
            <strong>Rates:</strong> 19% APR (30d), 16% APR (60d), 15% APR (90d)<br />
            <strong>Example daily rate:</strong> 16% ÷ 365 = ~0.044% per day<br />
            <strong>Formula:</strong> Principal × (1 + daily_rate)^days - Principal
          </Typography>
          <Typography paragraph>
            <strong>Examples:</strong>
          </Typography>
          <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            500 RLUSD loan:<br />
            • 1 month: ~6.2 RLUSD interest<br />
            • 6 months: ~38.9 RLUSD interest<br />
            • 1 year: ~80.9 RLUSD interest
          </Box>
        </Box>
      )
    },
    {
      id: 'safety',
      question: 'How can I borrow safely?',
      answer: (
        <Box>
          <Typography paragraph>
            <strong>Best practices for safe borrowing:</strong>
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li><strong>Start small:</strong> Begin with smaller amounts to learn the system</li>
            <li><strong>Keep LTV low:</strong> Target 30-40% LTV, never exceed 50%</li>
            <li><strong>Monitor regularly:</strong> Check your loans daily, especially during volatile markets</li>
            <li><strong>Repay early:</strong> Pay down loans when you can to reduce risk</li>
            <li><strong>Add collateral:</strong> If LTV rises above 45%, add more XPM or repay part of the loan</li>
          </Box>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Remember:</strong> You can repay anytime with no penalties. It's better to repay early than risk liquidation.
            </Typography>
          </Alert>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Help & FAQ
      </Typography>

      {/* Current Market Info */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          Current Market Prices
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2">XPM Price</Typography>
            <Typography variant="h6">${marketData.xpmPriceUSD.toFixed(4)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2">RLUSD Price</Typography>
            <Typography variant="h6">$1.00</Typography>
          </Box>
          <Box>
            <Typography variant="body2">Interest Rate</Typography>
            <Typography variant="h6">15-19% APR</Typography>
          </Box>
          <Box>
            <Typography variant="body2">Max LTV</Typography>
            <Typography variant="h6">50%</Typography>
          </Box>
        </Box>
      </Paper>

      {/* FAQ Accordions */}
      {faqs.map((faq) => (
        <Accordion 
          key={faq.id}
          expanded={expanded === faq.id} 
          onChange={handleChange(faq.id)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {faq.answer}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Emergency Contact */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Need more help?</strong> If you're experiencing issues with your loans or need immediate assistance, 
          please contact support. Never let a loan reach liquidation without seeking help first.
        </Typography>
      </Alert>
    </Container>
  );
};

export default SimpleHelp;