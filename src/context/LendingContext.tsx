/**
 * LendingContext - Core state management for the XRP Lending Platform
 * 
 * This context manages the entire lending ecosystem including:
 * - Loan lifecycle (creation, repayment, liquidation)
 * - Market data and price updates
 * - User positions and portfolio tracking
 * - Time simulation for testing
 * - Loan maturity and extension logic
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Loan, LoanParams, MarketData, UserPosition } from '../types/lending';
import { 
  calculateLTV, 
  calculateCollateralValueUSD,
  calculateDebtValueUSD,
  calculateCompoundInterest,
  calculateLiquidationPriceUSD,
  isEligibleForLiquidationUSD,
  calculateLiquidationReturnUSD,
  // Legacy functions for backward compatibility
  calculateInterest, 
  calculateLiquidationPrice,
  isEligibleForLiquidation,
  calculateLiquidationReturn 
} from '../utils/lendingCalculations';

/**
 * LendingContextType - Interface defining all available operations and state
 */
interface LendingContextType {
  /** Array of all loans in the system */
  loans: Loan[];
  /** Current market prices and parameters */
  marketData: MarketData;
  /** Aggregated user position across all loans */
  userPosition: UserPosition;
  /** Current simulation time (for testing) */
  currentTime: Date;
  /** Create a new loan with specified parameters */
  createLoan: (params: LoanParams) => void;
  /** Repay part or all of a loan */
  repayLoan: (loanId: string, amount: number) => void;
  /** Add additional collateral to improve loan health */
  addCollateral: (loanId: string, amount: number) => void;
  /** Liquidate an underwater loan */
  liquidateLoan: (loanId: string) => void;
  /** Advance simulation time by specified days */
  simulateTime: (days: number) => void;
  /** Update XPM token price in USD */
  updateXpmPrice: (newPriceUSD: number) => void;
  /** Update XRP price in USD */
  updateXrpPrice: (newPriceUSD: number) => void;
  /** Legacy: Update XPM/XRP price ratio */
  updateMarketPrice: (newPrice: number) => void;
  /** Get all loans eligible for liquidation */
  checkMarginCalls: () => Loan[];
  /** Manually extend a loan's maturity */
  extendLoan: (loanId: string) => void;
  /** Get all loans past maturity date */
  checkMaturedLoans: () => Loan[];
  /** Process matured loans (auto-extend or mark as matured) */
  processMaturedLoans: () => void;
}

const LendingContext = createContext<LendingContextType | undefined>(undefined);

/**
 * Custom hook to access the lending context
 * Throws error if used outside of LendingProvider
 */
export const useLending = () => {
  const context = useContext(LendingContext);
  if (!context) {
    throw new Error('useLending must be used within a LendingProvider');
  }
  return context;
};

/**
 * LendingProvider - Main context provider component
 * Manages all lending state and provides operations to child components
 */
export const LendingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /** All loans in the system */
  const [loans, setLoans] = useState<Loan[]>([]);
  /** Current simulation time */
  const [currentTime, setCurrentTime] = useState(new Date());
  /** Market data including token prices */
  const [marketData, setMarketData] = useState<MarketData>({
    xpmPriceUSD: 0.02,      // XPM token price in USD
    xrpPriceUSD: 3.00,      // XRP price in USD
    liquidationFee: 10,     // Fee percentage for liquidations
    xpmPrice: 0.00667,      // XPM/XRP ratio (legacy)
  });

  /**
   * Update interest accrual for all active loans
   * Recalculates compound interest and LTV based on current time and market prices
   */
  const updateLoansInterest = useCallback((newTime: Date) => {
    setLoans(prevLoans => 
      prevLoans.map(loan => {
        if (loan.status !== 'active') return loan;
        
        // Calculate days elapsed since loan creation
        const timeDiff = (newTime.getTime() - loan.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        const interest = calculateCompoundInterest(loan.borrowedAmount, loan.interestRate, timeDiff);
        
        // Use USD-based LTV calculation for accurate dual-asset risk
        const collateralValueUSD = calculateCollateralValueUSD(loan.collateralAmount, marketData.xpmPriceUSD);
        const totalDebtXRP = loan.borrowedAmount + interest;
        const debtValueUSD = calculateDebtValueUSD(totalDebtXRP, marketData.xrpPriceUSD);
        
        return {
          ...loan,
          accruedInterest: interest,
          currentLTV: calculateLTV(collateralValueUSD, debtValueUSD),
        };
      })
    );
  }, [marketData.xpmPriceUSD, marketData.xrpPriceUSD]);

  /**
   * Create a new loan with the specified parameters
   * Validates LTV, calculates liquidation price, and sets maturity date
   */
  const createLoan = useCallback((params: LoanParams) => {
    // Use USD-based calculations for accurate dual-asset risk assessment
    const collateralValueUSD = calculateCollateralValueUSD(params.collateralAmount, marketData.xpmPriceUSD);
    const debtValueUSD = calculateDebtValueUSD(params.borrowAmount, marketData.xrpPriceUSD);
    const liquidationPriceUSD = calculateLiquidationPriceUSD(
      params.borrowAmount,
      params.collateralAmount,
      marketData.xrpPriceUSD,
      params.liquidationThreshold
    );
    
    // Calculate maturity date based on loan term
    const maturityDate = new Date(currentTime.getTime() + params.termDays * 24 * 60 * 60 * 1000);
    
    const newLoan: Loan = {
      id: Date.now().toString(),
      borrower: 'user1', // In real app, this would be wallet address
      collateralAmount: params.collateralAmount,
      borrowedAmount: params.borrowAmount,
      interestRate: params.interestRate,
      accruedInterest: 0,
      createdAt: currentTime,
      liquidationPrice: liquidationPriceUSD,
      currentLTV: calculateLTV(collateralValueUSD, debtValueUSD),
      status: 'active',
      // Term system fields
      termDays: params.termDays,
      maturityDate: maturityDate,
      autoRenew: params.autoRenew,
      extensionsUsed: 0,
      maxExtensions: 3,
    };
    
    setLoans(prev => [...prev, newLoan]);
  }, [currentTime, marketData.xpmPriceUSD, marketData.xrpPriceUSD]);

  /**
   * Repay a loan partially or fully
   * Payment is applied first to interest, then to principal
   * Loan is marked as 'repaid' if fully paid off
   */
  const repayLoan = useCallback((loanId: string, amount: number) => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id !== loanId) return loan;
        
        const totalDebt = loan.borrowedAmount + loan.accruedInterest;
        // Full repayment - close the loan
        if (amount >= totalDebt) {
          return { ...loan, status: 'repaid' as const };
        }
        
        // Partial repayment - apply to interest first, then principal
        const remainingDebt = totalDebt - amount;
        const paidInterest = Math.min(amount, loan.accruedInterest);
        const paidPrincipal = amount - paidInterest;
        
        // Recalculate LTV with remaining debt
        const collateralValueUSD = calculateCollateralValueUSD(loan.collateralAmount, marketData.xpmPriceUSD);
        const remainingDebtUSD = calculateDebtValueUSD(remainingDebt, marketData.xrpPriceUSD);
        
        return {
          ...loan,
          borrowedAmount: loan.borrowedAmount - paidPrincipal,
          accruedInterest: loan.accruedInterest - paidInterest,
          currentLTV: calculateLTV(collateralValueUSD, remainingDebtUSD),
        };
      })
    );
  }, [marketData.xpmPriceUSD, marketData.xrpPriceUSD]);

  const addCollateral = useCallback((loanId: string, amount: number) => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id !== loanId || loan.status !== 'active') return loan;
        
        const newCollateralAmount = loan.collateralAmount + amount;
        const collateralValueUSD = calculateCollateralValueUSD(newCollateralAmount, marketData.xpmPriceUSD);
        const debtValueUSD = calculateDebtValueUSD(loan.borrowedAmount + loan.accruedInterest, marketData.xrpPriceUSD);
        
        // Recalculate liquidation price with new collateral amount
        const newLiquidationPrice = calculateLiquidationPriceUSD(
          loan.borrowedAmount + loan.accruedInterest,
          newCollateralAmount,
          marketData.xrpPriceUSD,
          65
        );
        
        return {
          ...loan,
          collateralAmount: newCollateralAmount,
          currentLTV: calculateLTV(collateralValueUSD, debtValueUSD),
          liquidationPrice: newLiquidationPrice,
        };
      })
    );
  }, [marketData.xpmPriceUSD, marketData.xrpPriceUSD]);

  const liquidateLoan = useCallback((loanId: string) => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id !== loanId || loan.status !== 'active') return loan;
        
        const liquidationResult = calculateLiquidationReturnUSD(
          loan,
          marketData.xpmPriceUSD,
          marketData.xrpPriceUSD,
          marketData.liquidationFee
        );
        
        return {
          ...loan,
          status: 'liquidated' as const,
        };
      })
    );
  }, [marketData]);

  const processMaturedLoans = useCallback(() => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.status !== 'active' || currentTime < loan.maturityDate) return loan;
        
        // Auto-extend if enabled and loan is healthy
        if (loan.autoRenew && loan.currentLTV < 40 && loan.extensionsUsed < loan.maxExtensions) {
          const newMaturityDate = new Date(loan.maturityDate.getTime() + loan.termDays * 24 * 60 * 60 * 1000);
          return {
            ...loan,
            maturityDate: newMaturityDate,
            extensionsUsed: loan.extensionsUsed + 1
          };
        }
        
        // Otherwise, mark as matured
        return { ...loan, status: 'matured' as const };
      })
    );
  }, [currentTime]);

  const simulateTime = useCallback((days: number) => {
    const newTime = new Date(currentTime.getTime() + days * 24 * 60 * 60 * 1000);
    setCurrentTime(newTime);
    updateLoansInterest(newTime);
    // Process matured loans after time simulation
    setTimeout(() => processMaturedLoans(), 100);
  }, [currentTime, updateLoansInterest, processMaturedLoans]);

  const updateXpmPrice = useCallback((newPriceUSD: number) => {
    setMarketData(prev => ({ 
      ...prev, 
      xpmPriceUSD: newPriceUSD,
      xpmPrice: newPriceUSD / prev.xrpPriceUSD 
    }));
    updateLoansInterest(currentTime);
  }, [currentTime, updateLoansInterest]);

  const updateXrpPrice = useCallback((newPriceUSD: number) => {
    setMarketData(prev => ({ 
      ...prev, 
      xrpPriceUSD: newPriceUSD,
      xpmPrice: prev.xpmPriceUSD / newPriceUSD 
    }));
    updateLoansInterest(currentTime);
  }, [currentTime, updateLoansInterest]);

  const updateMarketPrice = useCallback((newPrice: number) => {
    setMarketData(prev => ({ ...prev, xpmPrice: newPrice }));
    updateLoansInterest(currentTime);
  }, [currentTime, updateLoansInterest]);

  /**
   * Check for loans that have exceeded liquidation threshold
   * Returns array of loans eligible for liquidation (margin calls)
   * Uses 65% LTV threshold for altcoin collateral
   */
  const checkMarginCalls = useCallback(() => {
    return loans.filter(loan => 
      loan.status === 'active' && 
      isEligibleForLiquidationUSD(
        loan, 
        marketData.xpmPriceUSD, 
        marketData.xrpPriceUSD, 
        65 // 65% LTV threshold for altcoins
      )
    );
  }, [loans, marketData.xpmPriceUSD, marketData.xrpPriceUSD]);

  const checkMaturedLoans = useCallback(() => {
    return loans.filter(loan => 
      loan.status === 'active' && 
      currentTime >= loan.maturityDate
    );
  }, [loans, currentTime]);

  const extendLoan = useCallback((loanId: string) => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id !== loanId || loan.status !== 'active') return loan;
        
        // Check if extension is allowed
        if (loan.extensionsUsed >= loan.maxExtensions) return loan;
        
        // Check if loan is healthy enough for extension (LTV < 40%)
        if (loan.currentLTV >= 40) return loan;
        
        // Extend maturity date by the original term
        const newMaturityDate = new Date(loan.maturityDate.getTime() + loan.termDays * 24 * 60 * 60 * 1000);
        
        return {
          ...loan,
          maturityDate: newMaturityDate,
          extensionsUsed: loan.extensionsUsed + 1
        };
      })
    );
  }, []);

  /**
   * Calculate aggregate user position across all active loans
   * Provides portfolio-level metrics for risk assessment
   */
  const userPosition: UserPosition = {
    totalCollateral: loans
      .filter(l => l.status === 'active')
      .reduce((sum, loan) => sum + loan.collateralAmount, 0),
    totalBorrowed: loans
      .filter(l => l.status === 'active')
      .reduce((sum, loan) => sum + loan.borrowedAmount, 0),
    totalInterest: loans
      .filter(l => l.status === 'active')
      .reduce((sum, loan) => sum + loan.accruedInterest, 0),
    loans,
  };

  return (
    <LendingContext.Provider
      value={{
        loans,
        marketData,
        userPosition,
        currentTime,
        createLoan,
        repayLoan,
        addCollateral,
        liquidateLoan,
        simulateTime,
        updateXpmPrice,
        updateXrpPrice,
        updateMarketPrice,
        checkMarginCalls,
        extendLoan,
        checkMaturedLoans,
        processMaturedLoans,
      }}
    >
      {children}
    </LendingContext.Provider>
  );
};