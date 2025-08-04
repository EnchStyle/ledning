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

interface LendingContextType {
  loans: Loan[];
  marketData: MarketData;
  userPosition: UserPosition;
  currentTime: Date;
  createLoan: (params: LoanParams) => void;
  repayLoan: (loanId: string, amount: number) => void;
  liquidateLoan: (loanId: string) => void;
  simulateTime: (days: number) => void;
  updateXpmPrice: (newPriceUSD: number) => void;
  updateXrpPrice: (newPriceUSD: number) => void;
  updateMarketPrice: (newPrice: number) => void; // Backward compatibility
  checkMarginCalls: () => Loan[];
}

const LendingContext = createContext<LendingContextType | undefined>(undefined);

export const useLending = () => {
  const context = useContext(LendingContext);
  if (!context) {
    throw new Error('useLending must be used within a LendingProvider');
  }
  return context;
};

export const LendingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketData, setMarketData] = useState<MarketData>({
    xpmPriceUSD: 0.02,
    xrpPriceUSD: 3.00,
    liquidationFee: 10,
    xpmPrice: 0.00667, // XPM/XRP ratio
  });

  const updateLoansInterest = useCallback((newTime: Date) => {
    setLoans(prevLoans => 
      prevLoans.map(loan => {
        if (loan.status !== 'active') return loan;
        
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

  const createLoan = useCallback((params: LoanParams) => {
    // Use USD-based calculations for accurate dual-asset risk
    const collateralValueUSD = calculateCollateralValueUSD(params.collateralAmount, marketData.xpmPriceUSD);
    const debtValueUSD = calculateDebtValueUSD(params.borrowAmount, marketData.xrpPriceUSD);
    const liquidationPriceUSD = calculateLiquidationPriceUSD(
      params.borrowAmount,
      params.collateralAmount,
      marketData.xrpPriceUSD,
      params.liquidationThreshold
    );
    
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
    };
    
    setLoans(prev => [...prev, newLoan]);
  }, [currentTime, marketData.xpmPriceUSD, marketData.xrpPriceUSD]);

  const repayLoan = useCallback((loanId: string, amount: number) => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id !== loanId) return loan;
        
        const totalDebt = loan.borrowedAmount + loan.accruedInterest;
        if (amount >= totalDebt) {
          return { ...loan, status: 'repaid' as const };
        }
        
        const remainingDebt = totalDebt - amount;
        const paidInterest = Math.min(amount, loan.accruedInterest);
        const paidPrincipal = amount - paidInterest;
        
        // Use USD-based LTV calculation
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

  const simulateTime = useCallback((days: number) => {
    const newTime = new Date(currentTime.getTime() + days * 24 * 60 * 60 * 1000);
    setCurrentTime(newTime);
    updateLoansInterest(newTime);
  }, [currentTime, updateLoansInterest]);

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
        liquidateLoan,
        simulateTime,
        updateXpmPrice,
        updateXrpPrice,
        updateMarketPrice,
        checkMarginCalls,
      }}
    >
      {children}
    </LendingContext.Provider>
  );
};