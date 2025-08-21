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
import { logger } from '../utils/logger';
import { 
  calculateLTV, 
  calculateCollateralValueUSD,
  calculateDebtValueUSD,
  calculateFixedInterest,
  calculateLiquidationPriceUSD,
  isEligibleForLiquidationRLUSD,
  calculateLiquidationReturnRLUSD
} from '../utils/lendingCalculations';

// Type definitions for browser APIs
interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface ExtendedWindow extends Window {
  __simulationPaused?: boolean;
  gc?: () => void;
}

interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

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
  /** Wallet balances */
  walletBalances: { xpm: number; rlusd: number };
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
  /** Dynamic wallet balances */
  const [walletBalances, setWalletBalances] = useState<{ xpm: number; rlusd: number }>({
    xpm: DEMO_PORTFOLIO.XPM_BALANCE, // 2M XPM
    rlusd: 10000, // 10k RLUSD
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
  /** Throttle price history updates */
  const lastPriceHistoryUpdate = useRef<number>(0);
  /** Circuit breaker for simulation crashes */
  const errorCount = useRef<number>(0);
  const lastErrorTime = useRef<number>(0);
  const circuitBreakerTripped = useRef<boolean>(false);
  /** Memory monitoring */
  const lastMemoryCheck = useRef<number>(0);
  const memoryCheckInterval = 30000; // Check memory every 30 seconds
  /** Liquidation events tracking */
  const [liquidationEvents, setLiquidationEvents] = useState<Array<{
    loanId: string;
    timestamp: Date;
    price: number;
    collateral: number;
    debt: number;
  }>>([]);
  
  // Ref to hold current state values for stable callback access
  const stateRef = useRef({ marketData, currentTime, loans, simulationSettings });
  useEffect(() => {
    stateRef.current = { marketData, currentTime, loans, simulationSettings };
  });

  // Demo wallet balance: 2M XPM for demo purposes
  const demoWalletBalance = DEMO_PORTFOLIO.XPM_BALANCE;

  // Minimum loan amounts from configuration
  const MINIMUM_LOAN_AMOUNT_USD = FINANCIAL_CONSTANTS.MINIMUM_AMOUNTS.LOAN_AMOUNT;
  const MINIMUM_COLLATERAL_AMOUNT_USD = FINANCIAL_CONSTANTS.MINIMUM_AMOUNTS.COLLATERAL_VALUE;


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
    
    // Skip price history updates if Portfolio tab is active
    if (typeof window !== 'undefined' && (window as ExtendedWindow).__simulationPaused) {
      return;
    }
    
    // Dynamic throttling for price history based on simulation speed
    const now = Date.now();
    const currentSettings = stateRef.current.simulationSettings || simulationSettings;
    // Faster updates for higher speeds: 10x = 1s, 1x = 5s
    const dynamicThrottle = Math.max(1000, 5000 / Math.max(1, currentSettings.speed));
    
    if (now - lastPriceHistoryUpdate.current < dynamicThrottle) {
      return;
    }
    lastPriceHistoryUpdate.current = now;
    
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
      // Only add if price actually changed significantly
      const lastPoint = prev[prev.length - 1];
      if (!lastPoint || Math.abs(lastPoint.xpmPrice - newPoint.xpmPrice) > 0.001) {
        console.log('📊 LendingContext: Adding price history point, price:', newPoint.xpmPrice.toFixed(4));
        const updated = [...prev, newPoint];
        return updated.slice(-15); // Further reduced to 15 points for better performance
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
    
    // Check if simulation is paused by Portfolio component
    if (typeof window !== 'undefined' && (window as ExtendedWindow).__simulationPaused) {
      return;
    }
    
    const now = Date.now();
    
    // Aggressive throttling to prevent memory issues
    if (now - lastUpdateTime.current < 1000) { // 1 second minimum
      return;
    }
    lastUpdateTime.current = now;
    
    try {
      // Circuit breaker: Check if we should stop due to errors
      if (circuitBreakerTripped.current) {
        console.warn('🚨 Circuit breaker tripped - stopping simulation');
        setSimulationSettings(prev => ({ ...prev, isActive: false }));
        return;
      }
      
      // Get current values from state
      const currentSettings = simulationSettings;
      const currentPrice = marketData.xpmPriceUSD;
      
      // Validate state to prevent crashes
      if (!currentPrice || currentPrice <= 0 || isNaN(currentPrice)) {
        throw new Error('Invalid price state detected');
      }
      
      // Generate new price with more realistic movement
      const random1 = Math.random();
      const random2 = Math.random();
      
      // Use a combination of random walk and momentum
      const momentum = (Math.random() - 0.5) * 0.002; // Small momentum component
      const normalRandom = Math.sqrt(-2 * Math.log(random1)) * Math.cos(2 * Math.PI * random2);
      const volatilityComponent = normalRandom * currentSettings.volatility;
      
      // Very weak mean reversion to prevent extreme drift
      const meanReversion = (SIMULATION_CONFIG.MEAN_REVERSION.TARGET_PRICE - currentPrice) * SIMULATION_CONFIG.MEAN_REVERSION.REVERSION_STRENGTH;
      
      // Total change combines volatility, momentum, and weak mean reversion
      const totalChange = volatilityComponent + momentum + meanReversion;
      
      // Apply change with bounds to prevent unrealistic prices
      const newPrice = Math.max(0.001, Math.min(0.10, currentPrice * (1 + totalChange)));
      
      // Validate new price
      if (!newPrice || newPrice <= 0 || isNaN(newPrice)) {
        throw new Error('Generated invalid price');
      }
      
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
      
      // Reset error count on successful tick
      errorCount.current = 0;
      
      // Memory monitoring and cleanup
      if (now - lastMemoryCheck.current > memoryCheckInterval) {
        lastMemoryCheck.current = now;
        
        // Check if performance.memory is available (Chrome-based browsers)
        if (typeof performance !== 'undefined' && (performance as ExtendedPerformance).memory) {
          const memory = (performance as ExtendedPerformance).memory!;
          const usedMB = memory.usedJSHeapSize / 1048576; // Convert to MB
          const limitMB = memory.jsHeapSizeLimit / 1048576;
          
          console.log(`📊 Memory usage: ${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB (${((usedMB/limitMB)*100).toFixed(1)}%)`);
          
          // If memory usage is over 80%, trigger cleanup
          if (usedMB / limitMB > 0.8) {
            console.warn('⚠️ High memory usage detected, triggering cleanup');
            
            // Aggressive price history cleanup
            setPriceHistory(prev => prev.slice(-5)); // Keep only last 5 points
            
            // Trigger garbage collection if available
            if ((window as ExtendedWindow).gc) {
              (window as ExtendedWindow).gc!();
            }
            
            // If still over 90%, stop simulation
            setTimeout(() => {
              if (typeof performance !== 'undefined' && (performance as ExtendedPerformance).memory) {
                const newMemory = (performance as ExtendedPerformance).memory!;
                const newUsedMB = newMemory.usedJSHeapSize / 1048576;
                const newLimitMB = newMemory.jsHeapSizeLimit / 1048576;
                
                if (newUsedMB / newLimitMB > 0.9) {
                  logger.error('MEMORY CRITICAL: Stopping simulation to prevent crash', undefined, 'LendingContext.simulationTick', { memoryUsage: { usedMB: newUsedMB, limitMB: newLimitMB, percentage: (newUsedMB / newLimitMB) * 100 } });
                  setSimulationSettings(prev => ({ ...prev, isActive: false }));
                  alert('Simulation stopped due to high memory usage. Please refresh the page to continue.');
                }
              }
            }, 5000);
          }
        }
      }
      
    } catch (error) {
      logger.error('Simulation tick error', error, 'LendingContext.simulationTick', { marketData: stateRef.current.marketData, simulationSettings: stateRef.current.simulationSettings });
      
      // Circuit breaker logic
      const now = Date.now();
      if (now - lastErrorTime.current < 10000) { // Within 10 seconds of last error
        errorCount.current += 1;
      } else {
        errorCount.current = 1; // Reset count if more than 10 seconds since last error
      }
      lastErrorTime.current = now;
      
      // Trip circuit breaker if too many errors
      if (errorCount.current >= 3) {
        circuitBreakerTripped.current = true;
        logger.error('CIRCUIT BREAKER TRIPPED: Too many simulation errors, stopping permanently', undefined, 'LendingContext.simulationTick', { errorCount: errorCount.current, lastErrorTime: lastErrorTime.current });
        alert('Simulation crashed due to repeated errors. Please refresh the page to restart.');
      }
      
      // Stop simulation immediately on error
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
        logger.error('Simulation error', error, 'LendingContext.simulationTick', { currentSettings: simulationSettings, currentPrice: marketData.xpmPriceUSD });
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
      // High-performance interval calculation optimized for 10x speed
      const baseInterval = 500; // 500ms base interval
      const speedMultiplier = simulationSettings.speed;
      // Minimum 50ms for 10x speed, maximum 1000ms for 0.5x speed
      const interval = Math.max(50, Math.min(1000, baseInterval / speedMultiplier));
      
      console.log(`🚀 Starting HIGH-PERFORMANCE simulation: ${interval}ms interval (${simulationSettings.speed}x speed)`);
      
      simulationTimer.current = setInterval(() => {
        try {
          simulationTick.current();
        } catch (error) {
          logger.error('Critical simulation error', error, 'LendingContext.simulationTimer', { isActive: simulationSettings.isActive, speed: simulationSettings.speed });
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
    const currentMarketData = stateRef.current.marketData;
    console.log('💰 LendingContext: updateLoansLTV called, price:', currentMarketData.xpmPriceUSD);
    
    setLoans(prevLoans => {
      const updatedLoans = prevLoans.map(loan => {
        if (loan.status !== 'active') return loan;
        
        // Calculate current LTV based on market prices
        const collateralValueUSD = calculateCollateralValueUSD(loan.collateralAmount, currentMarketData.xpmPriceUSD);
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
  }, []); // No dependencies - uses ref for current values

  /**
   * Update LTVs when price changes - with aggressive throttling
   * Use a separate timer to avoid dependency issues
   */
  const ltvUpdateTimer = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (loans.length > 0) {
      // Clear existing timer
      if (ltvUpdateTimer.current) {
        clearTimeout(ltvUpdateTimer.current);
      }
      
      // Dynamic LTV update timing based on simulation speed
      const currentSettings = stateRef.current.simulationSettings || { speed: 1 };
      const updateDelay = Math.max(25, 100 / Math.max(1, currentSettings.speed)); // 25ms minimum for 10x
      const throttleInterval = Math.max(500, 2000 / Math.max(1, currentSettings.speed)); // 500ms minimum for 10x
      
      ltvUpdateTimer.current = setTimeout(() => {
        const now = Date.now();
        if (now - lastUpdateTime.current > throttleInterval) {
          updateLoansLTV();
          lastUpdateTime.current = now;
        }
      }, updateDelay);
    }
    
    return () => {
      if (ltvUpdateTimer.current) {
        clearTimeout(ltvUpdateTimer.current);
      }
    };
  }, [marketData.xpmPriceUSD, updateLoansLTV]);

  const liquidateLoan = useCallback((loanId: string) => {
    const currentMarketData = stateRef.current.marketData;
    
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id !== loanId || loan.status !== 'active') return loan;
        
        // Track liquidation event
        setLiquidationEvents(prev => [...prev.slice(-49), {
          loanId: loan.id,
          timestamp: new Date(),
          price: currentMarketData.xpmPriceUSD,
          collateral: loan.collateralAmount,
          debt: loan.borrowedAmount + loan.fixedInterestAmount,
        }]);
        
        return {
          ...loan,
          status: 'liquidated' as const,
        };
      })
    );
  }, []); // No dependencies - uses ref

  /**
   * Update loan LTVs when price changes
   */
  useEffect(() => {
    if (loans.length > 0) {
      setLoans(prevLoans =>
        prevLoans.map(loan => {
          if (loan.status !== 'active') return loan;
          
          const collateralValueUSD = calculateCollateralValueUSD(loan.collateralAmount, marketData.xpmPriceUSD);
          const totalDebtUSD = calculateDebtValueUSD(loan.borrowedAmount + loan.fixedInterestAmount);
          const newLTV = calculateLTV(collateralValueUSD, totalDebtUSD);
          
          return {
            ...loan,
            currentLTV: newLTV,
            liquidationPrice: calculateLiquidationPriceUSD(
              loan.borrowedAmount + loan.fixedInterestAmount,
              loan.collateralAmount,
              FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV
            ),
          };
        })
      );
    }
  }, [marketData.xpmPriceUSD]);

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
        const ltv = loan.currentLTV || 0;
        console.log(`🔴 Auto-liquidating loan ${loan.id} at LTV ${ltv.toFixed(1)}%`);
        
        // Show alert for auto-liquidation
        alert(`⚠️ LIQUIDATION TRIGGERED!\n\nLoan #${loan.id.slice(0, 8)} has been automatically liquidated.\nLTV reached: ${ltv.toFixed(1)}%\nLiquidation threshold: ${FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV}%`);
        
        liquidateLoan(loan.id);
        
        // Stop simulation after liquidation
        setSimulationSettings(prev => ({ ...prev, isActive: false }));
      });
    }
  }, [marketData.xpmPriceUSD, simulationSettings.isActive, loans, liquidateLoan]);

  /**
   * Create a new loan with the specified parameters
   * Validates LTV, calculates liquidation price, and sets maturity date
   * Simplified for RLUSD since debt is already in USD
   */
  const createLoan = useCallback((params: LoanParams) => {
    const { marketData: currentMarketData, currentTime: currentTimeValue } = stateRef.current;
    
    // Use USD-based calculations for risk assessment
    const collateralValueUSD = calculateCollateralValueUSD(params.collateralAmount, currentMarketData.xpmPriceUSD);
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
    const maturityDate = new Date(currentTimeValue.getTime() + params.termDays * 24 * 60 * 60 * 1000);
    const fixedInterestAmount = calculateFixedInterest(params.borrowAmount, params.interestRate, params.termDays);
    
    const newLoan: Loan = {
      id: generateSecureId(),
      borrower: 'user1', // In real app, this would be wallet address
      collateralAmount: params.collateralAmount,
      borrowedAmount: params.borrowAmount,
      fixedInterestAmount: fixedInterestAmount,
      createdAt: currentTimeValue,
      liquidationPrice: liquidationPriceUSD,
      currentLTV: calculateLTV(collateralValueUSD, debtValueUSD),
      status: 'active',
      termDays: params.termDays,
      maturityDate: maturityDate,
    };
    
    setLoans(prev => [...prev, newLoan]);
    
    // Update wallet balances
    setWalletBalances(prev => ({
      xpm: prev.xpm - params.collateralAmount, // Deduct collateral
      rlusd: prev.rlusd + params.borrowAmount  // Add borrowed amount
    }));
  }, []); // No dependencies

  /**
   * Repay a loan partially or fully
   * Payment is applied first to interest, then to principal
   * Loan is marked as 'repaid' if fully paid off
   */
  const repayLoan = useCallback((loanId: string, amount?: number) => {
    console.log('🏦 REPAY LOAN CALLED:', loanId, amount);
    let repaymentAmount = 0;
    let collateralToReturn = 0;
    
    setLoans(prevLoans => {
      console.log('🏦 CURRENT LOANS:', prevLoans.length);
      return prevLoans.map(loan => {
        if (loan.id !== loanId) return loan;
        
        console.log('🎯 FOUND LOAN TO REPAY:', loan.id, loan.borrowedAmount);
        const totalDebt = loan.borrowedAmount + loan.fixedInterestAmount;
        // Full repayment - close the loan (if no amount specified or amount covers full debt)
        if (!amount || amount >= totalDebt) {
          repaymentAmount = totalDebt;
          collateralToReturn = loan.collateralAmount;
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
        
        // Access current market data from ref
        const currentMarketData = stateRef.current.marketData;
        
        repaymentAmount = amount;
        
        // Recalculate LTV with remaining debt
        const collateralValueUSD = calculateCollateralValueUSD(loan.collateralAmount, currentMarketData.xpmPriceUSD);
        const remainingDebtUSD = calculateDebtValueUSD(remainingDebt); // RLUSD is 1:1 USD
        
        return {
          ...loan,
          borrowedAmount: loan.borrowedAmount - paidPrincipal,
          fixedInterestAmount: loan.fixedInterestAmount - paidInterest,
          currentLTV: calculateLTV(collateralValueUSD, remainingDebtUSD),
        };
      });
    });
    
    // Update wallet balances after loan update
    if (repaymentAmount > 0) {
      setWalletBalances(prev => ({
        xpm: prev.xpm + collateralToReturn, // Return collateral on full repayment
        rlusd: prev.rlusd - repaymentAmount // Deduct repayment amount
      }));
    }
  }, []); // No dependencies

  const addCollateral = useCallback((loanId: string, amount: number) => {
    let collateralAdded = false;
    
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id !== loanId || loan.status !== 'active') return loan;
        
        collateralAdded = true;
        
        // Access current market data from ref
        const currentMarketData = stateRef.current.marketData;
        
        const newCollateralAmount = loan.collateralAmount + amount;
        const collateralValueUSD = calculateCollateralValueUSD(newCollateralAmount, currentMarketData.xpmPriceUSD);
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
    
    // Update wallet balance
    if (collateralAdded) {
      setWalletBalances(prev => ({
        ...prev,
        xpm: prev.xpm - amount // Deduct additional collateral
      }));
    }
  }, []); // No dependencies

  const processMaturedLoans = useCallback(() => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        const currentTimeValue = stateRef.current.currentTime;
        if (loan.status !== 'active' || currentTimeValue < loan.maturityDate) return loan;
        
        // Mark as matured when term expires
        return { ...loan, status: 'matured' as const };
      })
    );
  }, []); // No dependencies

  const simulateTime = useCallback((days: number) => {
    const currentTimeValue = stateRef.current.currentTime;
    const newTime = new Date(currentTimeValue.getTime() + days * 24 * 60 * 60 * 1000);
    setCurrentTime(newTime);
    updateLoansLTV();
    // Process matured loans after time simulation
    setTimeout(() => processMaturedLoans(), 100);
  }, [updateLoansLTV, processMaturedLoans]); // Minimal dependencies

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
    const { loans: currentLoans, marketData: currentMarketData } = stateRef.current;
    return currentLoans.filter(loan => 
      loan.status === 'active' && 
      isEligibleForLiquidationRLUSD(
        loan, 
        currentMarketData.xpmPriceUSD, 
        FINANCIAL_CONSTANTS.LTV_LIMITS.LIQUIDATION_LTV // Liquidation LTV threshold
      )
    );
  }, []); // No dependencies

  const checkMaturedLoans = useCallback(() => {
    const { loans: currentLoans, currentTime: currentTimeValue } = stateRef.current;
    return currentLoans.filter(loan => 
      loan.status === 'active' && 
      currentTimeValue >= loan.maturityDate
    );
  }, []); // No dependencies


  /**
   * Calculate aggregate user position across all active loans
   * Memoized to prevent unnecessary recalculations and re-renders
   */
  const userPosition: UserPosition = React.useMemo(() => {
    console.log('🏦 LendingContext: Recalculating userPosition');
    const activeLoans = loans.filter(l => l.status === 'active');
    return {
      totalCollateral: activeLoans.reduce((sum, loan) => sum + loan.collateralAmount, 0),
      totalBorrowed: activeLoans.reduce((sum, loan) => sum + loan.borrowedAmount, 0),
      totalFixedInterest: activeLoans.reduce((sum, loan) => sum + loan.fixedInterestAmount, 0),
      loans,
    };
  }, [loans]);

  // Memoize user loans to prevent filtering on every render
  const userLoans = React.useMemo(() => {
    return loans.filter(loan => loan.borrower === 'user1'); // In real app, filter by actual user
  }, [loans]);

  // Memoize context value to prevent recreation on every render
  const contextValue = React.useMemo(() => {
    console.log('🏦 LendingContext: Creating new context value');
    return {
      loans,
      userLoans,
      marketData,
      userPosition,
      currentTime,
      priceHistory,
      simulationSettings,
      liquidationEvents,
      walletBalances,
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
    };
  }, [
    loans,
    userLoans,
    marketData,
    userPosition,
    currentTime,
    priceHistory,
    simulationSettings,
    liquidationEvents,
    walletBalances,
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
  ]);

  // Throttle provider re-renders by limiting logging
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  
  if (renderCount.current % 50 === 0) { // Only log every 50th render
    console.log('🏦 LendingContext: Provider rendered', renderCount.current, 'times, loans:', loans.length, 'active:', simulationSettings.isActive);
  }

  return (
    <LendingContext.Provider value={contextValue}>
      {children}
    </LendingContext.Provider>
  );
};