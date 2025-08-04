export interface Loan {
  id: string;
  borrower: string;
  collateralAmount: number; // XPM amount
  borrowedAmount: number; // XRP amount
  interestRate: number; // Annual percentage rate
  accruedInterest: number; // Accumulated interest in XRP
  createdAt: Date;
  liquidationPrice: number; // XPM price at which loan gets liquidated (in USD)
  currentLTV: number; // Current Loan-to-Value ratio (USD-based)
  status: 'active' | 'liquidated' | 'repaid';
  // Store initial prices for reference
  initialXpmPrice: number; // USD price when loan was created
  initialXrpPrice: number; // USD price when loan was created
}

export interface LoanParams {
  collateralAmount: number;
  borrowAmount: number;
  interestRate: number;
  liquidationThreshold: number; // LTV threshold for liquidation (e.g., 80%)
}

export interface MarketData {
  xpmPriceUSD: number; // XPM price in USD
  xrpPriceUSD: number; // XRP price in USD
  liquidationFee: number; // Fee charged on liquidation (e.g., 10%)
  // Computed property for backward compatibility
  get xpmPrice(): number; // XPM/XRP ratio for existing code
}

export interface UserPosition {
  totalCollateral: number;
  totalBorrowed: number;
  totalInterest: number;
  loans: Loan[];
}