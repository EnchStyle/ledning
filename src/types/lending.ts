export interface Loan {
  id: string;
  borrower: string;
  collateralAmount: number; // XPM amount
  borrowedAmount: number; // XRP amount
  interestRate: number; // Annual percentage rate
  accruedInterest: number; // Accumulated interest
  createdAt: Date;
  liquidationPrice: number; // Price at which loan gets liquidated
  currentLTV: number; // Current Loan-to-Value ratio
  status: 'active' | 'liquidated' | 'repaid';
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
  xpmPrice: number; // XPM/XRP ratio for backward compatibility
}

export interface UserPosition {
  totalCollateral: number;
  totalBorrowed: number;
  totalInterest: number;
  loans: Loan[];
}