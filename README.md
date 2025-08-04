# XRP Lending Platform MVP

A centralized lending dApp built on XRP Ledger where users can deposit XPM tokens as collateral to borrow XRP.

## Features

- **Collateral Deposit**: Deposit XPM tokens as collateral
- **Borrow XRP**: Borrow XRP against your XPM collateral with adjustable LTV
- **Interest Tracking**: Real-time interest accrual at 15% APR
- **Time Simulation**: Fast-forward time to test interest accumulation
- **Price Simulation**: Change XPM/XRP price to test margin calls
- **Margin Calls**: Automatic alerts when loans approach liquidation (65% LTV)
- **Liquidation**: Force liquidation with 10% penalty fee
- **Loan Repayment**: Partial or full loan repayment
- **Liquidation Preview**: See potential liquidation impact for at-risk loans

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploying to Netlify

### Option 1: Deploy via Netlify CLI
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=build
```

### Option 2: Deploy via GitHub
1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Netlify will automatically deploy on every push to main

### Option 3: Manual Deploy
1. Run `npm run build`
2. Drag and drop the `build` folder to [Netlify Drop](https://app.netlify.com/drop)

## How to Use

### Creating a Loan
1. Enter the amount of XPM tokens you want to use as collateral
2. Adjust the LTV slider (10-50%) to determine how much XRP to borrow
3. Click "Create Loan" to borrow XRP

### Managing Loans
- **View Active Loans**: See all your loans in the Active Loans table
- **Repay Loans**: Click "Repay" to pay back part or all of your loan
- **Monitor LTV**: Watch your LTV ratio - loans liquidate at 65% LTV
- **View Liquidation Preview**: Expand at-risk loans (>55% LTV) to see liquidation impact

### Testing Features
- **Time Simulation**: Use the Time Simulator to advance time and see interest accumulate
- **Price Changes**: Adjust the XPM/XRP price to test margin calls and liquidations
- **Liquidation**: When a loan reaches 65% LTV, you can force liquidate it

## Key Metrics for Altcoin Lending

- **Interest Rate**: 15% APR (higher due to altcoin volatility)
- **Max Initial LTV**: 50% (conservative for altcoins)
- **Liquidation Threshold**: 65% LTV (lower than BTC/ETH)
- **Liquidation Penalty**: 10% of total debt

## Liquidation Mechanism

When a loan reaches 65% LTV:
1. The loan becomes eligible for liquidation
2. A liquidator can trigger the liquidation
3. The system calculates:
   - Total debt = Principal + Accrued Interest
   - Liquidation penalty = Total debt × 10%
   - Collateral to liquidate = (Total debt + Penalty) / Current XPM price
4. Remaining collateral is returned to the borrower

## Technical Stack

- React with TypeScript
- Material-UI (MUI) for UI components
- XRP Ledger integration (ready for connection)
- Context API for state management
- Optimized for Netlify deployment

## Production Considerations

This is an MVP. For production:
- Connect to actual XRP Ledger
- Implement real wallet authentication
- Add proper transaction signing
- Store loan data on-chain or in a database
- Implement automated liquidation bots
- Add price oracles for real-time pricing
- Implement proper security audits