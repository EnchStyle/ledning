/**
 * Lending Calculations Utility Module
 * 
 * Core mathematical functions for the RLUSD Lending Platform
 * Handles all financial calculations including:
 * - Loan-to-Value (LTV) ratios
 * - Interest calculations (simple and compound)
 * - Liquidation thresholds and prices
 * - Single-asset risk assessment (XPM collateral, RLUSD debt at 1:1 USD)
 */
import { Loan } from '../types/lending';

/**
 * Calculate Loan-to-Value ratio using USD values
 * Simplified for RLUSD since debt is already in USD (1:1)
 * @param collateralValueUSD - Total collateral value in USD
 * @param debtValueRLUSD - Total debt value in RLUSD (equals USD)
 * @returns LTV percentage (0-100+)
 */
export const calculateLTV = (collateralValueUSD: number, debtValueRLUSD: number): number => {
  if (collateralValueUSD === 0) return 0;
  return (debtValueRLUSD / collateralValueUSD) * 100; // RLUSD is 1:1 USD
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
 * Get RLUSD debt value in USD (simplified since RLUSD is 1:1 USD)
 * @param debtAmountRLUSD - Amount of RLUSD owed
 * @returns Debt value in USD (same as input since 1:1)
 */
export const calculateDebtValueUSD = (debtAmountRLUSD: number): number => {
  return debtAmountRLUSD; // RLUSD is 1:1 USD
};

// Legacy function for backward compatibility
export const calculateCollateralValue = (collateralAmount: number, xpmPrice: number): number => {
  return collateralAmount * xpmPrice;
};

/**
 * Calculate maximum borrowable RLUSD amount based on collateral
 * Simplified since RLUSD is 1:1 USD - no conversion needed
 * @param collateralAmount - XPM tokens to use as collateral
 * @param xpmPriceUSD - Current XPM price in USD
 * @param maxLTV - Maximum allowed LTV percentage
 * @returns Maximum RLUSD amount that can be borrowed
 */
export const calculateMaxBorrowRLUSD = (
  collateralAmount: number,
  xpmPriceUSD: number,
  maxLTV: number
): number => {
  const collateralValueUSD = calculateCollateralValueUSD(collateralAmount, xpmPriceUSD);
  return (collateralValueUSD * maxLTV) / 100; // Direct USD amount = RLUSD amount
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
 * Calculate fixed interest amount for a loan
 * Interest is calculated upfront based on the full term, regardless of early repayment
 * @param principal - Borrowed amount in RLUSD
 * @param rate - Annual interest rate (as percentage)
 * @param termDays - Loan term in days (30, 60, or 90)
 * @returns Fixed interest amount to be paid
 */
export const calculateFixedInterest = (
  principal: number,
  rate: number,
  termDays: number
): number => {
  const annualRate = rate / 100;
  const termYears = termDays / 365;
  return principal * annualRate * termYears;
};

// Legacy function - kept for backward compatibility
export const calculateCompoundInterest = calculateFixedInterest;

// Simple interest for backward compatibility
export const calculateInterest = (
  principal: number,
  rate: number,
  timeInDays: number
): number => {
  const dailyRate = rate / 365 / 100;
  return principal * dailyRate * timeInDays;
};

// Calculate XPM liquidation price in USD (simplified for RLUSD)
export const calculateLiquidationPriceUSD = (
  borrowedAmountRLUSD: number,
  collateralAmountXPM: number,
  liquidationThreshold: number
): number => {
  // RLUSD debt is already in USD, no conversion needed
  return (borrowedAmountRLUSD / collateralAmountXPM) * (100 / liquidationThreshold);
};

// Legacy function - calculates liquidation price in XPM/XRP ratio
export const calculateLiquidationPrice = (
  borrowedAmount: number,
  collateralAmount: number,
  liquidationThreshold: number
): number => {
  return (borrowedAmount / collateralAmount) * (100 / liquidationThreshold);
};

// Check liquidation eligibility (simplified for RLUSD)
export const isEligibleForLiquidationRLUSD = (
  loan: Loan,
  xpmPriceUSD: number,
  liquidationThreshold: number
): boolean => {
  const collateralValueUSD = calculateCollateralValueUSD(loan.collateralAmount, xpmPriceUSD);
  const totalDebtRLUSD = loan.borrowedAmount + loan.fixedInterestAmount;
  const totalDebtUSD = calculateDebtValueUSD(totalDebtRLUSD); // 1:1 conversion
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
  const totalDebt = loan.borrowedAmount + loan.fixedInterestAmount;
  const currentLTV = calculateLTV(collateralValue, totalDebt);
  return currentLTV >= liquidationThreshold;
};

// Calculate liquidation return (simplified for RLUSD)
export const calculateLiquidationReturnRLUSD = (
  loan: Loan,
  xpmPriceUSD: number,
  liquidationFee: number
): {
  collateralToReturnXPM: number;
  liquidationPenaltyRLUSD: number;
  totalDebtRLUSD: number;
  borrowerGetsBackXPM: number;
} => {
  const totalDebtRLUSD = loan.borrowedAmount + loan.fixedInterestAmount;
  const liquidationPenaltyRLUSD = totalDebtRLUSD * (liquidationFee / 100);
  const totalToRecoverRLUSD = totalDebtRLUSD + liquidationPenaltyRLUSD;
  const collateralToReturnXPM = totalToRecoverRLUSD / xpmPriceUSD; // Convert RLUSD to XPM
  
  const actualCollateralUsed = Math.min(collateralToReturnXPM, loan.collateralAmount);
  const borrowerGetsBackXPM = Math.max(0, loan.collateralAmount - actualCollateralUsed);
  
  return {
    collateralToReturnXPM: actualCollateralUsed,
    liquidationPenaltyRLUSD,
    totalDebtRLUSD,
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
  const totalDebt = loan.borrowedAmount + loan.fixedInterestAmount;
  const liquidationPenalty = totalDebt * (liquidationFee / 100);
  const totalToRecover = totalDebt + liquidationPenalty;
  const collateralToReturn = totalToRecover / xpmPrice;
  
  return {
    collateralToReturn: Math.min(collateralToReturn, loan.collateralAmount),
    liquidationPenalty,
    totalDebt
  };
};

// Backward compatibility aliases
export const calculateMaxBorrowUSD = calculateMaxBorrowRLUSD;
export const isEligibleForLiquidationUSD = isEligibleForLiquidationRLUSD;
export const calculateLiquidationReturnUSD = calculateLiquidationReturnRLUSD;