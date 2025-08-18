/**
 * Type definitions for the XRP Lending Platform
 * 
 * Core data structures that define the lending protocol's state and operations
 */

/**
 * Loan status types
 */
export type LoanStatus = 'active' | 'liquidated' | 'repaid' | 'matured';

/**
 * Supported loan term durations in days
 */
export type LoanTermDays = 30 | 60 | 90;

/**
 * Loan - Represents a single lending position
 * 
 * Core entity tracking collateral, debt, and fixed interest
 */
export interface Loan {
  /** Unique identifier for the loan */
  id: string;
  
  /** Wallet address of the borrower */
  borrower: string;
  
  /** Amount of XPM tokens deposited as collateral */
  collateralAmount: number;
  
  /** Amount of XRP borrowed */
  borrowedAmount: number;
  
  /** Fixed total interest amount to be paid */
  fixedInterestAmount: number;
  
  /** Timestamp of loan creation */
  createdAt: Date;
  
  /** XPM price (in USD) that triggers liquidation */
  liquidationPrice: number;
  
  /** Current Loan-to-Value ratio (percentage) */
  currentLTV: number;
  
  /** Current status of the loan */
  status: LoanStatus;
  
  /** Loan term in days (30, 60, or 90) */
  termDays: LoanTermDays;
  
  /** Date when loan reaches maturity */
  maturityDate: Date;
}

/**
 * LoanParams - Parameters for creating a new loan
 * 
 * Input data required to originate a new lending position
 */
export interface LoanParams {
  /** XPM tokens to deposit as collateral */
  collateralAmount: number;
  
  /** XRP amount to borrow */
  borrowAmount: number;
  
  /** Annual interest rate for calculating fixed interest */
  interestRate: number;
  
  /** LTV percentage that triggers liquidation (e.g., 65%) */
  liquidationThreshold: number;
  
  /** Duration of the loan term */
  termDays: LoanTermDays;
}

/**
 * MarketData - Current market prices and protocol parameters
 * 
 * Real-time pricing data used for risk calculations and liquidations
 */
export interface MarketData {
  /** Current XPM token price in USD */
  xpmPriceUSD: number;
  
  /** Current XRP price in USD */
  xrpPriceUSD: number;
  
  /** Fee percentage charged on liquidations (e.g., 10%) */
  liquidationFee: number;
  
  /** XPM/XRP price ratio (legacy field for backward compatibility) */
  xpmPrice: number;
}

/**
 * UserPosition - Aggregated view of user's lending portfolio
 * 
 * Summary metrics across all user's active loans
 */
export interface UserPosition {
  /** Total XPM tokens locked as collateral */
  totalCollateral: number;
  
  /** Total XRP borrowed across all loans */
  totalBorrowed: number;
  
  /** Total fixed interest across all loans */
  totalFixedInterest: number;
  
  /** Array of all user's loans */
  loans: Loan[];
}

/**
 * Risk levels for visual indicators
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Market simulation scenario types
 */
export type MarketScenario = 'crash' | 'correction' | 'stable' | 'rally' | 'custom';

/**
 * Price change event for market simulation
 */
export interface PriceChangeEvent {
  /** Asset being changed (XPM or XRP) */
  asset: 'XPM' | 'XRP';
  
  /** New price in USD */
  newPriceUSD: number;
  
  /** Percentage change from previous price */
  changePercent: number;
  
  /** Timestamp of the change */
  timestamp: Date;
}