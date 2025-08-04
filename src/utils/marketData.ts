export interface MarketDataUSD {
  xpmPriceUSD: number;
  xrpPriceUSD: number;
  liquidationFee: number;
}

export class MarketDataClass implements MarketDataUSD {
  xpmPriceUSD: number;
  xrpPriceUSD: number;
  liquidationFee: number;

  constructor(xpmPriceUSD: number, xrpPriceUSD: number, liquidationFee: number) {
    this.xpmPriceUSD = xpmPriceUSD;
    this.xrpPriceUSD = xrpPriceUSD;
    this.liquidationFee = liquidationFee;
  }

  // Backward compatibility getter
  get xpmPrice(): number {
    return this.xpmPriceUSD / this.xrpPriceUSD;
  }

  // Calculate LTV based on USD values
  calculateLTVUSD(collateralAmountXPM: number, debtAmountXRP: number): number {
    const collateralValueUSD = collateralAmountXPM * this.xpmPriceUSD;
    const debtValueUSD = debtAmountXRP * this.xrpPriceUSD;
    return collateralValueUSD > 0 ? (debtValueUSD / collateralValueUSD) * 100 : 0;
  }

  // Calculate liquidation price in USD for XPM
  calculateLiquidationPriceUSD(debtAmountXRP: number, collateralAmountXPM: number, ltvThreshold: number): number {
    const debtValueUSD = debtAmountXRP * this.xrpPriceUSD;
    return (debtValueUSD / collateralAmountXPM) * (100 / ltvThreshold);
  }
}