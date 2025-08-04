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
  status: 'active' | 'liquidated' | 'repaid' | 'matured';
  // Term system
  termDays: number; // 30, 60, 90 days
  maturityDate: Date; // When loan must be repaid
  autoRenew: boolean; // Allow automatic extensions
  extensionsUsed: number; // Number of extensions used
  maxExtensions: number; // Maximum allowed extensions (default: 3)
}

export interface LoanParams {
  collateralAmount: number;
  borrowAmount: number;
  interestRate: number;
  liquidationThreshold: number; // LTV threshold for liquidation (e.g., 80%)
  termDays: number; // 30, 60, 90 days
  autoRenew: boolean; // Allow automatic extensions
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