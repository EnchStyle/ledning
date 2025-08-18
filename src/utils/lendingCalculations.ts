/**
 * Lending Calculations Utility Module
 * 
 * Core mathematical functions for the XRP Lending Platform
 * Handles all financial calculations including:
 * - Loan-to-Value (LTV) ratios
 * - Interest calculations (simple and compound)
 * - Liquidation thresholds and prices
 * - Dual-asset risk assessment (XPM collateral, XRP debt)
 */
import { Loan, LoanParams, MarketData } from '../types/lending';

/**
 * Calculate Loan-to-Value ratio using USD values
 * Essential for accurate risk assessment in dual-asset systems
 * @param collateralValueUSD - Total collateral value in USD
 * @param debtValueUSD - Total debt value in USD
 * @returns LTV percentage (0-100+)
 */
export const calculateLTV = (collateralValueUSD: number, debtValueUSD: number): number => {
  if (collateralValueUSD === 0) return 0;
  return (debtValueUSD / collateralValueUSD) * 100;
};

/**
 * Convert XPM collateral amount to USD value
 * @param collateralAmount - Amount of XPM tokens
 * @param xpmPriceUSD - Current XPM price in USD
 * @returns Collateral value in USD
 */
export const calculateCollateralValueUSD = (collateralAmount: number, xpmPriceUSD: number): number => {
  return collateralAmount * xpmPriceUSD;
};

/**
 * Convert XRP debt amount to USD value
 * @param debtAmountXRP - Amount of XRP owed
 * @param xrpPriceUSD - Current XRP price in USD
 * @returns Debt value in USD
 */
export const calculateDebtValueUSD = (debtAmountXRP: number, xrpPriceUSD: number): number => {
  return debtAmountXRP * xrpPriceUSD;
};

// Legacy function for backward compatibility
export const calculateCollateralValue = (collateralAmount: number, xpmPrice: number): number => {
  return collateralAmount * xpmPrice;
};

/**
 * Calculate maximum borrowable XRP amount based on collateral
 * Uses USD values for accurate cross-asset calculation
 * @param collateralAmount - XPM tokens to use as collateral
 * @param xpmPriceUSD - Current XPM price in USD
 * @param xrpPriceUSD - Current XRP price in USD
 * @param maxLTV - Maximum allowed LTV percentage
 * @returns Maximum XRP amount that can be borrowed
 */
export const calculateMaxBorrowUSD = (
  collateralAmount: number,
  xpmPriceUSD: number,
  xrpPriceUSD: number,
  maxLTV: number
): number => {
  const collateralValueUSD = calculateCollateralValueUSD(collateralAmount, xpmPriceUSD);
  const maxBorrowValueUSD = (collateralValueUSD * maxLTV) / 100;
  return maxBorrowValueUSD / xrpPriceUSD; // Convert USD to XRP amount
};

// Legacy function for backward compatibility
export const calculateMaxBorrow = (
  collateralAmount: number,
  xpmPrice: number,
  maxLTV: number
): number => {
  const collateralValue = calculateCollateralValue(collateralAmount, xpmPrice);
  return (collateralValue * maxLTV) / 100;
};

/**
 * Calculate compound interest for DeFi loans
 * Uses daily compounding for more accurate interest accrual
 * @param principal - Initial borrowed amount
 * @param rate - Annual interest rate (as percentage)
 * @param timeInDays - Time elapsed in days
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  timeInDays: number
): number => {
  const dailyRate = rate / 365 / 100;
  return principal * (Math.pow(1 + dailyRate, timeInDays) - 1);
};

// Simple interest for backward compatibility
export const calculateInterest = (
  principal: number,
  rate: number,
  timeInDays: number
): number => {
  const dailyRate = rate / 365 / 100;
  return principal * dailyRate * timeInDays;
};

// Calculate XPM liquidation price in USD
export const calculateLiquidationPriceUSD = (
  borrowedAmountXRP: number,
  collateralAmountXPM: number,
  xrpPriceUSD: number,
  liquidationThreshold: number
): number => {
  const debtValueUSD = borrowedAmountXRP * xrpPriceUSD;
  return (debtValueUSD / collateralAmountXPM) * (100 / liquidationThreshold);
};

// Legacy function - calculates liquidation price in XPM/XRP ratio
export const calculateLiquidationPrice = (
  borrowedAmount: number,
  collateralAmount: number,
  liquidationThreshold: number
): number => {
  return (borrowedAmount / collateralAmount) * (100 / liquidationThreshold);
};

// Check liquidation eligibility using USD values
export const isEligibleForLiquidationUSD = (
  loan: Loan,
  xpmPriceUSD: number,
  xrpPriceUSD: number,
  liquidationThreshold: number
): boolean => {
  const collateralValueUSD = calculateCollateralValueUSD(loan.collateralAmount, xpmPriceUSD);
  const totalDebtXRP = loan.borrowedAmount + loan.accruedInterest;
  const totalDebtUSD = calculateDebtValueUSD(totalDebtXRP, xrpPriceUSD);
  const currentLTV = calculateLTV(collateralValueUSD, totalDebtUSD);
  return currentLTV >= liquidationThreshold;
};

// Legacy function for backward compatibility
export const isEligibleForLiquidation = (
  loan: Loan,
  currentXpmPrice: number,
  liquidationThreshold: number
): boolean => {
  const collateralValue = calculateCollateralValue(loan.collateralAmount, currentXpmPrice);
  const totalDebt = loan.borrowedAmount + loan.accruedInterest;
  const currentLTV = calculateLTV(collateralValue, totalDebt);
  return currentLTV >= liquidationThreshold;
};

// Calculate liquidation return using USD values
export const calculateLiquidationReturnUSD = (
  loan: Loan,
  xpmPriceUSD: number,
  xrpPriceUSD: number,
  liquidationFee: number
): {
  collateralToReturnXPM: number;
  liquidationPenaltyUSD: number;
  totalDebtUSD: number;
  borrowerGetsBackXPM: number;
} => {
  const totalDebtXRP = loan.borrowedAmount + loan.accruedInterest;
  const totalDebtUSD = totalDebtXRP * xrpPriceUSD;
  const liquidationPenaltyUSD = totalDebtUSD * (liquidationFee / 100);
  const totalToRecoverUSD = totalDebtUSD + liquidationPenaltyUSD;
  const collateralToReturnXPM = totalToRecoverUSD / xpmPriceUSD;
  
  const actualCollateralUsed = Math.min(collateralToReturnXPM, loan.collateralAmount);
  const borrowerGetsBackXPM = Math.max(0, loan.collateralAmount - actualCollateralUsed);
  
  return {
    collateralToReturnXPM: actualCollateralUsed,
    liquidationPenaltyUSD,
    totalDebtUSD,
    borrowerGetsBackXPM
  };
};

// Legacy function for backward compatibility
export const calculateLiquidationReturn = (
  loan: Loan,
  xpmPrice: number,
  liquidationFee: number
): {
  collateralToReturn: number;
  liquidationPenalty: number;
  totalDebt: number;
} => {
  const totalDebt = loan.borrowedAmount + loan.accruedInterest;
  const liquidationPenalty = totalDebt * (liquidationFee / 100);
  const totalToRecover = totalDebt + liquidationPenalty;
  const collateralToReturn = totalToRecover / xpmPrice;
  
  return {
    collateralToReturn: Math.min(collateralToReturn, loan.collateralAmount),
    liquidationPenalty,
    totalDebt
  };
};