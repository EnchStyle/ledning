import { Loan, LoanParams, MarketData } from '../types/lending';

export const calculateLTV = (collateralValue: number, borrowedAmount: number): number => {
  if (collateralValue === 0) return 0;
  return (borrowedAmount / collateralValue) * 100;
};

export const calculateCollateralValue = (collateralAmount: number, xpmPrice: number): number => {
  return collateralAmount * xpmPrice;
};

export const calculateMaxBorrow = (
  collateralAmount: number,
  xpmPrice: number,
  maxLTV: number
): number => {
  const collateralValue = calculateCollateralValue(collateralAmount, xpmPrice);
  return (collateralValue * maxLTV) / 100;
};

export const calculateInterest = (
  principal: number,
  rate: number,
  timeInDays: number
): number => {
  const dailyRate = rate / 365 / 100;
  return principal * dailyRate * timeInDays;
};

export const calculateLiquidationPrice = (
  borrowedAmount: number,
  collateralAmount: number,
  liquidationThreshold: number
): number => {
  return (borrowedAmount / collateralAmount) * (100 / liquidationThreshold);
};

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