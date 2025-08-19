/**
 * LendingContext - Core state management for the RLUSD Lending Platform
 * 
 * This context manages the entire lending ecosystem including:
 * - Loan lifecycle (creation, repayment, liquidation)
 * - Market data and price updates (XPM only, RLUSD is 1:1 USD)
 * - User positions and portfolio tracking
 * - Time simulation for testing
 * - Loan maturity and extension logic
 * - Real-time market simulation with configurable volatility
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { generateSecureId } from '../utils/securityUtils';
import { FINANCIAL_CONSTANTS, DEMO_PORTFOLIO, SIMULATION_CONFIG, DEMO_CONFIG } from '../config/demoConstants';
import { Loan, LoanParams, MarketData, UserPosition } from '../types/lending';
import { 
  calculateLTV, 
  calculateCollateralValueUSD,
  calculateDebtValueUSD,
  calculateFixedInterest,
  calculateLiquidationPriceUSD,
  isEligibleForLiquidationRLUSD,
  calculateLiquidationReturnRLUSD
} from '../utils/lendingCalculations';

// Price history tracking
interface PriceHistoryPoint {
  timestamp: Date;
  xpmPrice: number;
  portfolioValue: number;
  totalDebt: number;
  avgLTV: number;
}

interface SimulationSettings {
  isActive: boolean;
  speed: number; // multiplier (1x, 2x, 4x, etc.)
  volatility: number; // price change variance (0.01 = 1%)
}

/**
 * LendingContextType - Interface defining all available operations and state
 */
interface LendingContextType {
  /** Array of all loans in the system */
  loans: Loan[];
  /** User's loans only */
  userLoans: Loan[];
  /** Current market prices and parameters */
  marketData: MarketData;
  /** Aggregated user position across all loans */
  userPosition: UserPosition;
  /** Current simulation time (for testing) */
  currentTime: Date;
  /** Price history for charts */
  priceHistory: PriceHistoryPoint[];
  /** Simulation settings */
  simulationSettings: SimulationSettings;
  /** Liquidation events */
  liquidationEvents: Array<{
    loanId: string;
    timestamp: Date;
    price: number;
    collateral: number;
    debt: number;
  }>;
  /** Create a new loan with specified parameters */
  createLoan: (params: LoanParams) => void;
  /** Repay part or all of a loan */
  repayLoan: (loanId: string, amount?: number) => void;
  /** Add additional collateral to improve loan health */
  addCollateral: (loanId: string, amount: number) => void;
  /** Liquidate an underwater loan */
  liquidateLoan: (loanId: string) => void;
  /** Advance simulation time by specified days */
  simulateTime: (days: number) => void;
  /** Update XPM token price in USD */
  updateXpmPrice: (newPriceUSD: number) => void;
  /** Legacy: Update market price (for backward compatibility) */
  updateMarketPrice: (newPrice: number) => void;
  /** Get all loans eligible for liquidation */
  checkMarginCalls: () => Loan[];
  /** Get all loans past maturity date */
  checkMaturedLoans: () => Loan[];
  /** Start/stop price simulation */
  toggleSimulation: () => void;
  /** Update simulation settings */
  updateSimulationSettings: (settings: Partial<SimulationSettings>) => void;
  /** Clear price history */
  clearPriceHistory: () => void;
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
    xpmPriceUSD: 0.02,      // XPM token price in USD (updated price)
    liquidationFee: 10,     // Fee percentage for liquidations
  });
  /** Price history for charting */
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  /** Simulation settings */
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>({
    isActive: false,
    speed: 1, // 1x speed (10 seconds per update)
    volatility: 0.02, // 2% max price change per update
  });
  /** Simulation timer reference */
  const simulationTimer = useRef<NodeJS.Timeout | null>(null);
  /** Throttling to prevent excessive updates */
  const lastUpdateTime = useRef<number>(0);
  /** Track if tab is visible to pause simulation in background */
  const isTabVisible = useRef<boolean>(true);
  /** Batch state updates to prevent excessive re-renders */
  const updateBatch = useRef<{ price?: number; time?: Date }>({});
  const batchTimer = useRef<NodeJS.Timeout | null>(null);
  /** Liquidation events tracking */
  const [liquidationEvents, setLiquidationEvents] = useState<Array<{
    loanId: string;
    timestamp: Date;
    price: number;
    collateral: number;
    debt: number;
  }>>([]);

  // Demo wallet balance: 2M XPM for demo purposes
  const demoWalletBalance = 2000000;

  // Minimum loan amount to prevent micro transactions and spam
  const MINIMUM_LOAN_AMOUNT_USD = 50; // $50 minimum loan value
  const MINIMUM_COLLATERAL_AMOUNT_USD = 100; // $100 minimum collateral value


  /**
   * Page Visibility API to pause simulation in background tabs
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisible.current = !document.hidden;
      if (document.hidden && simulationSettings.isActive) {
        console.log('Tab hidden: Pausing simulation for performance');
      } else if (!document.hidden && simulationSettings.isActive) {
        console.log('Tab visible: Resuming simulation');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [simulationSettings.isActive]);

  /**
   * Add current state to price history - optimized to reduce memory usage
   * Using refs to prevent dependency issues while maintaining functionality
   */
  const addPriceHistoryPoint = useCallback(() => {
    if (!simulationSettings.isActive || loans.length === 0) return;
    
    const activeLoans = loans.filter(l => l.status === 'active');
    const portfolioValue = activeLoans.reduce((sum, loan) => 
      sum + (loan.collateralAmount * marketData.xpmPriceUSD), 0
    );
    const totalDebt = activeLoans.reduce((sum, loan) => 
      sum + loan.borrowedAmount + (loan.fixedInterestAmount || 0), 0
    );
    const avgLTV = portfolioValue > 0 ? (totalDebt / portfolioValue) * 100 : 0;

    const newPoint: PriceHistoryPoint = {
      timestamp: new Date(currentTime),
      xpmPrice: marketData.xpmPriceUSD,
      portfolioValue,
      totalDebt,
      avgLTV,
    };

    setPriceHistory(prev => {
      // Only add if price actually changed to avoid excessive updates
      const lastPoint = prev[prev.length - 1];
      if (!lastPoint || Math.abs(lastPoint.xpmPrice - newPoint.xpmPrice) > 0.0001) {
        const updated = [...prev, newPoint];
        return updated.slice(-25); // Reduced to 25 points for memory efficiency
      }
      return prev;
    });
  }, [marketData.xpmPriceUSD, currentTime, loans, simulationSettings.isActive]);

  /**
   * Trigger price history update when price changes during simulation
   */
  useEffect(() => {
    if (simulationSettings.isActive) {
      addPriceHistoryPoint();
    }
  }, [marketData.xpmPriceUSD, simulationSettings.isActive, addPriceHistoryPoint]);

  /**
   * Batch state updates to prevent excessive re-renders
   */
  const flushBatchedUpdates = useCallback(() => {
    if (Object.keys(updateBatch.current).length === 0) return;
    
    const batch = updateBatch.current;
    updateBatch.current = {};
    
    if (batch.price !== undefined) {
      setMarketData(prev => ({ ...prev, xpmPriceUSD: batch.price! }));
    }
    if (batch.time !== undefined) {
      setCurrentTime(batch.time);
    }
  }, []);

  /**
   * Optimized simulation tick using refs to prevent dependency issues
   */
  const simulationTick = useRef(() => {
    // Don't run simulation if tab is not visible (performance optimization)
    if (!isTabVisible.current) {
      return;
    }
    
    const now = Date.now();
    
    // Aggressive throttling to prevent memory issues
    if (now - lastUpdateTime.current < 1000) { // 1 second minimum
      return;
    }
    lastUpdateTime.current = now;
    
    try {
      // Get current values from state
      const currentSettings = simulationSettings;
      const currentPrice = marketData.xpmPriceUSD;
      
      // Generate new price using Box-Muller transform
      const random1 = Math.random();
      const random2 = Math.random();
      const normalRandom = Math.sqrt(-2 * Math.log(random1)) * Math.cos(2 * Math.PI * random2);
      const priceChange = normalRandom * currentSettings.volatility * 0.3;
      
      // Mean reversion to prevent price drift
      const meanReversion = (SIMULATION_CONFIG.MEAN_REVERSION.TARGET_PRICE - currentPrice) * SIMULATION_CONFIG.MEAN_REVERSION.REVERSION_STRENGTH;
      const totalChange = priceChange + meanReversion;
      const newPrice = Math.max(0.001, Math.min(1.0, currentPrice * (1 + totalChange)));
      
      // Batch updates to prevent excessive re-renders
      updateBatch.current.price = newPrice;
      updateBatch.current.time = new Date(currentTime.getTime() + 10 * 60 * 1000);
      
      // Clear existing batch timer and set new one
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }
      
      // Flush updates after delay
      batchTimer.current = setTimeout(() => {
        if (Object.keys(updateBatch.current).length === 0) return;
        
        const batch = updateBatch.current;
        updateBatch.current = {};
        
        if (batch.price !== undefined) {
          setMarketData(prev => ({ ...prev, xpmPriceUSD: batch.price! }));
        }
        if (batch.time !== undefined) {
          setCurrentTime(batch.time);
        }
      }, 200);
      
    } catch (error) {
      console.error('Simulation tick error:', error);
      setSimulationSettings(prev => ({ ...prev, isActive: false }));
    }
  });
  
  /**
   * Update simulation tick function when dependencies change
   */
  useEffect(() => {
    simulationTick.current = () => {
      if (!isTabVisible.current) return;
      
      const now = Date.now();
      if (now - lastUpdateTime.current < 1000) return;
      lastUpdateTime.current = now;
      
      try {
        const currentSettings = simulationSettings;
        const currentPrice = marketData.xpmPriceUSD;
        
        const random1 = Math.random();
        const random2 = Math.random();
        const normalRandom = Math.sqrt(-2 * Math.log(random1)) * Math.cos(2 * Math.PI * random2);
        const priceChange = normalRandom * currentSettings.volatility * 0.3;
        
        const meanReversion = (SIMULATION_CONFIG.MEAN_REVERSION.TARGET_PRICE - currentPrice) * SIMULATION_CONFIG.MEAN_REVERSION.REVERSION_STRENGTH;
        const totalChange = priceChange + meanReversion;
        const newPrice = Math.max(0.001, Math.min(1.0, currentPrice * (1 + totalChange)));
        
        updateBatch.current.price = newPrice;
        updateBatch.current.time = new Date(currentTime.getTime() + 10 * 60 * 1000);
        
        if (batchTimer.current) clearTimeout(batchTimer.current);
        batchTimer.current = setTimeout(flushBatchedUpdates, 200);
        
      } catch (error) {
        console.error('Simulation error:', error);
        setSimulationSettings(prev => ({ ...prev, isActive: false }));
      }
    };
  }, [simulationSettings, marketData.xpmPriceUSD, currentTime, flushBatchedUpdates]);

  /**
   * Robust simulation timer management with proper cleanup
   */
  useEffect(() => {
    // Clear existing timers
    if (simulationTimer.current) {
      clearInterval(simulationTimer.current);
      simulationTimer.current = null;
    }
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
      batchTimer.current = null;
    }
    
    if (simulationSettings.isActive) {
      // Conservative interval to prevent crashes
      const baseInterval = 2000; // 2 second base
      const speedMultiplier = Math.min(simulationSettings.speed, 3); // Cap at 3x
      const interval = Math.max(2000, baseInterval / speedMultiplier);
      
      console.log(`Starting simulation: ${interval}ms interval`);
      
      simulationTimer.current = setInterval(() => {
        try {
          simulationTick.current();
        } catch (error) {
          console.error('Critical simulation error:', error);
          if (simulationTimer.current) {
            clearInterval(simulationTimer.current);
            simulationTimer.current = null;
          }
          setSimulationSettings(prev => ({ ...prev, isActive: false }));
        }
      }, interval);
    }

    return () => {
      if (simulationTimer.current) {
        clearInterval(simulationTimer.current);
        simulationTimer.current = null;
      }
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
        batchTimer.current = null;
      }
      try {
        flushBatchedUpdates();
      } catch (error) {
        console.warn('Cleanup error:', error);
      }
    };
  }, [simulationSettings.isActive, simulationSettings.speed, flushBatchedUpdates])

  /**
   * Update LTV for all active loans based on current market prices
   * Interest is fixed, so only LTV changes with market prices
   * Simplified for RLUSD since debt is already in USD
   */
  const updateLoansLTV = useCallback(() => {
    console.log('💰 LendingContext: updateLoansLTV called, price:', marketData.xpmPriceUSD);
    
    setLoans(prevLoans => {
      const updatedLoans = prevLoans.map(loan => {
        if (loan.status !== 'active') return loan;
        
        // Calculate current LTV based on market prices
        const collateralValueUSD = calculateCollateralValueUSD(loan.collateralAmount, marketData.xpmPriceUSD);
        const totalDebtRLUSD = loan.borrowedAmount + loan.fixedInterestAmount;
        const debtValueUSD = calculateDebtValueUSD(totalDebtRLUSD); // 1:1 conversion
        const newLTV = calculateLTV(collateralValueUSD, debtValueUSD);
        
        // Only update if LTV actually changed to prevent unnecessary re-renders
        if (Math.abs((loan.currentLTV || 0) - newLTV) < 0.01) {
          return loan; // No significant change
        }
        
        return {
          ...loan,
          currentLTV: newLTV,
        };
      });
      
      // Check if any loans actually changed
      const hasChanges = updatedLoans.some((loan, index) => 
        loan.currentLTV !== prevLoans[index]?.currentLTV
      );
      
      if (!hasChanges) {
        console.log('💰 LendingContext: No LTV changes, skipping update');
        return prevLoans; // No changes, return same reference
      }
      
      console.log('💰 LendingContext: LTV updated for loans');
      return updatedLoans;
    });
  }, [marketData.xpmPriceUSD]);

  /**
   * Update LTVs when price changes
   */
  useEffect(() => {
    if (loans.length > 0) {
      updateLoansLTV();
    }
  }, [marketData.xpmPriceUSD, updateLoansLTV]);

  const liquidateLoan = useCallback((loanId: string) => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id !== loanId || loan.status !== 'active') return loan;
        
        // Calculate liquidation result (stored for future use)
        // const liquidationResult = calculateLiquidationReturnRLUSD(
        //   loan,
        //   marketData.xpmPriceUSD,
        //   marketData.liquidationFee
        // );
        
        // Track liquidation event
        setLiquidationEvents(prev => [...prev.slice(-49), {
          loanId: loan.id,
          timestamp: new Date(),
          price: marketData.xpmPriceUSD,
          collateral: loan.collateralAmount,
          debt: loan.borrowedAmount + loan.fixedInterestAmount,
        }]);
        
        return {
          ...loan,
          status: 'liquidated' as const,
        };
      })
    );
  }, [marketData]);

  /**
   * Check for liquidations when price changes during simulation
   */
  useEffect(() => {
    if (simulationSettings.isActive && loans.length > 0) {
      const eligibleForLiquidation = loans.filter(loan => 
        loan.status === 'active' && 
        isEligibleForLiquidationRLUSD(loan, marketData.xpmPriceUSD, FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV)
      );
      
      eligibleForLiquidation.forEach(loan => {
        console.log(`Auto-liquidating loan ${loan.id} at LTV ${loan.currentLTV?.toFixed(1)}%`);
        liquidateLoan(loan.id);
      });
    }
  }, [marketData.xpmPriceUSD, simulationSettings.isActive, loans, liquidateLoan]);

  /**
   * Create a new loan with the specified parameters
   * Validates LTV, calculates liquidation price, and sets maturity date
   * Simplified for RLUSD since debt is already in USD
   */
  const createLoan = useCallback((params: LoanParams) => {
    // Use USD-based calculations for risk assessment
    const collateralValueUSD = calculateCollateralValueUSD(params.collateralAmount, marketData.xpmPriceUSD);
    const debtValueUSD = calculateDebtValueUSD(params.borrowAmount); // RLUSD is 1:1 USD

    // Validate minimum loan amounts to prevent spam and micro transactions
    if (debtValueUSD < MINIMUM_LOAN_AMOUNT_USD) {
      throw new Error(`Minimum loan amount is $${MINIMUM_LOAN_AMOUNT_USD} USD`);
    }
    if (collateralValueUSD < MINIMUM_COLLATERAL_AMOUNT_USD) {
      throw new Error(`Minimum collateral value is $${MINIMUM_COLLATERAL_AMOUNT_USD} USD`);
    }
    const liquidationPriceUSD = calculateLiquidationPriceUSD(
      params.borrowAmount,
      params.collateralAmount,
      params.liquidationThreshold
    );
    
    // Calculate maturity date and fixed interest
    const maturityDate = new Date(currentTime.getTime() + params.termDays * 24 * 60 * 60 * 1000);
    const fixedInterestAmount = calculateFixedInterest(params.borrowAmount, params.interestRate, params.termDays);
    
    const newLoan: Loan = {
      id: generateSecureId(),
      borrower: 'user1', // In real app, this would be wallet address
      collateralAmount: params.collateralAmount,
      borrowedAmount: params.borrowAmount,
      fixedInterestAmount: fixedInterestAmount,
      createdAt: currentTime,
      liquidationPrice: liquidationPriceUSD,
      currentLTV: calculateLTV(collateralValueUSD, debtValueUSD),
      status: 'active',
      termDays: params.termDays,
      maturityDate: maturityDate,
    };
    
    setLoans(prev => [...prev, newLoan]);
  }, [currentTime, marketData.xpmPriceUSD]);

  /**
   * Repay a loan partially or fully
   * Payment is applied first to interest, then to principal
   * Loan is marked as 'repaid' if fully paid off
   */
  const repayLoan = useCallback((loanId: string, amount?: number) => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id !== loanId) return loan;
        
        const totalDebt = loan.borrowedAmount + loan.fixedInterestAmount;
        // Full repayment - close the loan (if no amount specified or amount covers full debt)
        if (!amount || amount >= totalDebt) {
          return { ...loan, status: 'repaid' as const };
        }
        
        // Partial repayment - always pay full interest first, then principal
        const remainingDebt = totalDebt - amount;
        let paidInterest = 0;
        let paidPrincipal = 0;
        
        if (amount >= loan.fixedInterestAmount) {
          // Pay all interest, rest goes to principal
          paidInterest = loan.fixedInterestAmount;
          paidPrincipal = amount - loan.fixedInterestAmount;
        } else {
          // Can't make partial interest payments - reject the transaction
          return loan;
        }
        
        // Recalculate LTV with remaining debt
        const collateralValueUSD = calculateCollateralValueUSD(loan.collateralAmount, marketData.xpmPriceUSD);
        const remainingDebtUSD = calculateDebtValueUSD(remainingDebt); // RLUSD is 1:1 USD
        
        return {
          ...loan,
          borrowedAmount: loan.borrowedAmount - paidPrincipal,
          fixedInterestAmount: loan.fixedInterestAmount - paidInterest,
          currentLTV: calculateLTV(collateralValueUSD, remainingDebtUSD),
        };
      })
    );
  }, [marketData.xpmPriceUSD]);

  const addCollateral = useCallback((loanId: string, amount: number) => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id !== loanId || loan.status !== 'active') return loan;
        
        const newCollateralAmount = loan.collateralAmount + amount;
        const collateralValueUSD = calculateCollateralValueUSD(newCollateralAmount, marketData.xpmPriceUSD);
        const debtValueUSD = calculateDebtValueUSD(loan.borrowedAmount + loan.fixedInterestAmount); // RLUSD is 1:1 USD
        
        // Recalculate liquidation price with new collateral amount
        const newLiquidationPrice = calculateLiquidationPriceUSD(
          loan.borrowedAmount + loan.fixedInterestAmount,
          newCollateralAmount,
          FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV
        );
        
        return {
          ...loan,
          collateralAmount: newCollateralAmount,
          currentLTV: calculateLTV(collateralValueUSD, debtValueUSD),
          liquidationPrice: newLiquidationPrice,
        };
      })
    );
  }, [marketData.xpmPriceUSD]);

  const processMaturedLoans = useCallback(() => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.status !== 'active' || currentTime < loan.maturityDate) return loan;
        
        // Mark as matured when term expires
        return { ...loan, status: 'matured' as const };
      })
    );
  }, [currentTime]);

  const simulateTime = useCallback((days: number) => {
    const newTime = new Date(currentTime.getTime() + days * 24 * 60 * 60 * 1000);
    setCurrentTime(newTime);
    updateLoansLTV();
    // Process matured loans after time simulation
    setTimeout(() => processMaturedLoans(), 100);
  }, [currentTime, updateLoansLTV, processMaturedLoans]);

  const updateXpmPrice = useCallback((newPriceUSD: number) => {
    setMarketData(prev => ({ 
      ...prev, 
      xpmPriceUSD: newPriceUSD
    }));
    updateLoansLTV();
  }, [updateLoansLTV]);

  const updateMarketPrice = useCallback((newPrice: number) => {
    // Legacy function for backward compatibility
    // Assumes the price is XPM price in USD
    setMarketData(prev => ({ ...prev, xpmPriceUSD: newPrice }));
    updateLoansLTV();
    // Price history is now handled automatically by useEffect
  }, [updateLoansLTV]);

  /**
   * Toggle simulation on/off
   */
  const toggleSimulation = useCallback(() => {
    setSimulationSettings(prev => {
      // If turning off, clear any existing timer immediately
      if (prev.isActive && simulationTimer.current) {
        clearInterval(simulationTimer.current);
        simulationTimer.current = null;
      }
      return {
        ...prev,
        isActive: !prev.isActive,
      };
    });
  }, []);

  /**
   * Update simulation settings
   */
  const updateSimulationSettings = useCallback((settings: Partial<SimulationSettings>) => {
    setSimulationSettings(prev => ({ ...prev, ...settings }));
  }, []);

  /**
   * Clear price history
   */
  const clearPriceHistory = useCallback(() => {
    setPriceHistory([]);
  }, []);

  /**
   * Check for loans that have exceeded liquidation threshold
   * Returns array of loans eligible for liquidation (margin calls)
   * Uses 65% LTV threshold for altcoin collateral
   * Simplified for RLUSD loans
   */
  const checkMarginCalls = useCallback(() => {
    return loans.filter(loan => 
      loan.status === 'active' && 
      isEligibleForLiquidationRLUSD(
        loan, 
        marketData.xpmPriceUSD, 
        FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV // Liquidation LTV threshold
      )
    );
  }, [loans, marketData.xpmPriceUSD]);

  const checkMaturedLoans = useCallback(() => {
    return loans.filter(loan => 
      loan.status === 'active' && 
      currentTime >= loan.maturityDate
    );
  }, [loans, currentTime]);


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
    totalFixedInterest: loans
      .filter(l => l.status === 'active')
      .reduce((sum, loan) => sum + loan.fixedInterestAmount, 0),
    loans,
  };

  console.log('🏦 LendingContext: Provider rendering, loans count:', loans.length, 'simulation active:', simulationSettings.isActive);

  return (
    <LendingContext.Provider
      value={{
        loans,
        userLoans: loans.filter(loan => loan.borrower === 'user1'), // In real app, filter by actual user
        marketData,
        userPosition,
        currentTime,
        priceHistory,
        simulationSettings,
        liquidationEvents,
        createLoan,
        repayLoan,
        addCollateral,
        liquidateLoan,
        simulateTime,
        updateXpmPrice,
        updateMarketPrice,
        checkMarginCalls,
        checkMaturedLoans,
        toggleSimulation,
        updateSimulationSettings,
        clearPriceHistory,
      }}
    >
      {children}
    </LendingContext.Provider>
  );
};