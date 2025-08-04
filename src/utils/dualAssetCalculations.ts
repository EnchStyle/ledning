// Enhanced calculations for dual-asset volatility (XPM and XRP both volatile)

export interface DualAssetLoan {
  id: string;
  borrower: string;
  collateralAmount: number; // XPM amount
  borrowedAmount: number; // XRP amount
  interestRate: number;
  accruedInterest: number; // in XRP
  createdAt: Date;
  // Store initial prices when loan was created
  initialXpmPriceUSD: number;
  initialXrpPriceUSD: number;
  liquidationThreshold: number; // LTV threshold (e.g., 65%)
  currentLTV: number;
  status: 'active' | 'liquidated' | 'repaid';
}

export interface DualAssetMarketData {
  xpmPriceUSD: number;
  xrpPriceUSD: number;
  liquidationFee: number;
}

/**
 * Calculate LTV using USD values for both collateral and debt
 * This accounts for both XPM and XRP price movements
 */
export const calculateDualAssetLTV = (
  collateralAmountXPM: number,
  debtAmountXRP: number,
  xpmPriceUSD: number,
  xrpPriceUSD: number
): number => {
  const collateralValueUSD = collateralAmountXPM * xpmPriceUSD;
  const debtValueUSD = debtAmountXRP * xrpPriceUSD;
  
  if (collateralValueUSD <= 0) return 0;
  return (debtValueUSD / collateralValueUSD) * 100;
};

/**
 * Calculate liquidation price for XPM in USD
 * This is the XPM price at which the loan will be liquidated, given current XRP price
 */
export const calculateLiquidationPriceXPM = (
  debtAmountXRP: number,
  collateralAmountXPM: number,
  xrpPriceUSD: number,
  liquidationThreshold: number
): number => {
  const debtValueUSD = debtAmountXRP * xrpPriceUSD;
  return (debtValueUSD / collateralAmountXPM) * (100 / liquidationThreshold);
};

/**
 * Calculate liquidation price for XRP in USD  
 * This is the XRP price at which the loan will be liquidated, given current XPM price
 */
export const calculateLiquidationPriceXRP = (
  debtAmountXRP: number,
  collateralAmountXPM: number,
  xpmPriceUSD: number,
  liquidationThreshold: number
): number => {
  const collateralValueUSD = collateralAmountXPM * xpmPriceUSD;
  return (collateralValueUSD * (liquidationThreshold / 100)) / debtAmountXRP;
};

/**
 * Check if loan is eligible for liquidation considering both asset prices
 */
export const isDualAssetLiquidationEligible = (
  loan: DualAssetLoan,
  marketData: DualAssetMarketData
): boolean => {
  const totalDebt = loan.borrowedAmount + loan.accruedInterest;
  const currentLTV = calculateDualAssetLTV(
    loan.collateralAmount,
    totalDebt,
    marketData.xpmPriceUSD,
    marketData.xrpPriceUSD
  );
  
  return currentLTV >= loan.liquidationThreshold;
};

/**
 * Calculate how price changes affect liquidation risk
 */
export interface LiquidationRisk {
  currentLTV: number;
  liquidationPriceXPM: number; // USD price for XPM that triggers liquidation
  liquidationPriceXRP: number; // USD price for XRP that triggers liquidation
  xpmDropToLiquidation: number; // % XPM must drop to trigger liquidation
  xrpRiseToLiquidation: number; // % XRP must rise to trigger liquidation
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const calculateLiquidationRisk = (
  loan: DualAssetLoan,
  marketData: DualAssetMarketData
): LiquidationRisk => {
  const totalDebt = loan.borrowedAmount + loan.accruedInterest;
  const currentLTV = calculateDualAssetLTV(
    loan.collateralAmount,
    totalDebt,
    marketData.xpmPriceUSD,
    marketData.xrpPriceUSD
  );

  const liquidationPriceXPM = calculateLiquidationPriceXPM(
    totalDebt,
    loan.collateralAmount,
    marketData.xrpPriceUSD,
    loan.liquidationThreshold
  );

  const liquidationPriceXRP = calculateLiquidationPriceXRP(
    totalDebt,
    loan.collateralAmount,
    marketData.xpmPriceUSD,
    loan.liquidationThreshold
  );

  const xpmDropToLiquidation = ((marketData.xpmPriceUSD - liquidationPriceXPM) / marketData.xpmPriceUSD) * 100;
  const xrpRiseToLiquidation = ((liquidationPriceXRP - marketData.xrpPriceUSD) / marketData.xrpPriceUSD) * 100;

  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (currentLTV >= loan.liquidationThreshold) {
    riskLevel = 'critical';
  } else if (currentLTV >= loan.liquidationThreshold * 0.9) {
    riskLevel = 'high';
  } else if (currentLTV >= loan.liquidationThreshold * 0.75) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  return {
    currentLTV,
    liquidationPriceXPM,
    liquidationPriceXRP,
    xpmDropToLiquidation: Math.max(0, xpmDropToLiquidation),
    xrpRiseToLiquidation: Math.max(0, xrpRiseToLiquidation),
    riskLevel,
  };
};