/**
 * Demo Configuration Constants
 * 
 * Centralized configuration for the XRP Lending Platform Demo
 * This file contains all demo parameters that can be easily adjusted
 * for different demonstration scenarios or market conditions.
 */

// =============================================================================
// DEMO APPLICATION SETTINGS
// =============================================================================

export const DEMO_CONFIG = {
  // Application metadata
  APP_NAME: 'XRP Lending Platform Demo',
  VERSION: '1.0.0',
  DESCRIPTION: 'Educational demo showcasing DeFi lending mechanics',
  
  // Demo disclaimers
  IS_DEMO: true,
  DEMO_MODE_WARNING: 'This is a demonstration application. No real transactions or funds are involved.',
  
  // Demo user settings
  DEMO_USER_ID: 'demo-user-001',
  DEMO_USER_NAME: 'Demo User',
} as const;

// =============================================================================
// FINANCIAL DEMO PARAMETERS
// =============================================================================

export const FINANCIAL_CONSTANTS = {
  // Interest rates by loan term (APR percentages)
  INTEREST_RATES: {
    30: 19,  // 30-day loans: 19% APR
    60: 16,  // 60-day loans: 16% APR  
    90: 15,  // 90-day loans: 15% APR
  },
  
  // Loan-to-Value ratio limits
  LTV_LIMITS: {
    MIN_LTV: 20,     // Minimum 20% LTV
    MAX_LTV: 50,     // Maximum 50% LTV
    LIQUIDATION_LTV: 65, // Liquidate at 65% LTV
  },
  
  // Minimum amounts (in USD)
  MINIMUM_AMOUNTS: {
    LOAN_AMOUNT: 50,        // $50 minimum loan
    COLLATERAL_VALUE: 100,  // $100 minimum collateral value
  },
  
  // Demo pricing
  ASSET_PRICES: {
    XPM_PRICE_USD: 0.02,    // XPM token price
    RLUSD_PRICE_USD: 1.00,  // RLUSD stable at $1.00
  },
  
  // Liquidation fee percentage
  LIQUIDATION_FEE: 10,  // 10% liquidation penalty
} as const;

// =============================================================================
// DEMO USER PORTFOLIO
// =============================================================================

export const DEMO_PORTFOLIO = {
  // Demo wallet balance
  XPM_BALANCE: 2_000_000,  // 2M XPM tokens for demo
  
  // Default loan parameters for quick demos
  DEFAULT_LOAN_PARAMS: {
    COLLATERAL_AMOUNT: 150_000,  // 150K XPM
    TARGET_LTV: 40,              // 40% LTV
    TERM_DAYS: 60,               // 60-day term
  },
  
  // Demo loan scenarios for testing
  DEMO_SCENARIOS: [
    {
      name: 'Conservative Loan',
      collateral: 100_000,
      ltv: 25,
      term: 90,
    },
    {
      name: 'Balanced Loan', 
      collateral: 150_000,
      ltv: 40,
      term: 60,
    },
    {
      name: 'Aggressive Loan',
      collateral: 200_000,
      ltv: 50,
      term: 30,
    },
  ],
} as const;

// =============================================================================
// MARKET SIMULATION SETTINGS
// =============================================================================

export const SIMULATION_CONFIG = {
  // Default simulation settings
  DEFAULT_SETTINGS: {
    IS_ACTIVE: false,
    SPEED: 1,         // 1x speed (10 seconds per update)  
    VOLATILITY: 0.02, // 2% max price change per update
  },
  
  // Speed options for demos
  SPEED_OPTIONS: [
    { value: 0.5, label: '0.5x', interval: 20000 },
    { value: 1, label: '1x', interval: 10000 },
    { value: 2, label: '2x', interval: 5000 },
    { value: 4, label: '4x', interval: 2500 },
    { value: 10, label: '10x', interval: 1000 },
  ],
  
  // Volatility presets for different market scenarios
  VOLATILITY_PRESETS: [
    { name: 'Calm Market', value: 0.005 },      // 0.5%
    { name: 'Normal Market', value: 0.02 },     // 2%
    { name: 'Volatile Market', value: 0.10 },   // 10%
    { name: 'Extreme Volatility', value: 0.50 }, // 50%
  ],
  
  // Price history settings
  PRICE_HISTORY: {
    MAX_POINTS: 100,           // Keep last 100 data points
    UPDATE_THRESHOLD: 0.0001,  // Only update if price changes by > $0.0001
  },
  
  // Mean reversion settings for price simulation
  MEAN_REVERSION: {
    TARGET_PRICE: 0.02,        // XPM target price
    REVERSION_STRENGTH: 0.0001, // Very weak reversion to allow natural price movement
  },
} as const;

// =============================================================================
// UI/UX DEMO SETTINGS
// =============================================================================

export const UI_CONFIG = {
  // Theme settings
  THEME: {
    PRIMARY_COLOR: '#6366F1',   // Modern Indigo
    SUCCESS_COLOR: '#22D3EE',   // Cyan
    WARNING_COLOR: '#FBBF24',   // Bright Amber
    ERROR_COLOR: '#F87171',     // Coral Red
  },
  
  // Animation and timing
  TRANSITIONS: {
    FAST: 150,    // Fast animations (150ms)
    NORMAL: 300,  // Normal animations (300ms)
    SLOW: 600,    // Slow animations (600ms)
  },
  
  // Notification settings for demo
  NOTIFICATIONS: {
    SUCCESS_DURATION: 4000,     // 4 seconds
    WARNING_DURATION: 6000,     // 6 seconds
    ERROR_DURATION: 8000,       // 8 seconds
  },
  
  // Demo mode indicators
  DEMO_INDICATORS: {
    SHOW_DEMO_BADGE: true,
    DEMO_BADGE_TEXT: 'DEMO',
    SHOW_DISCLAIMERS: true,
  },
} as const;

// =============================================================================
// RISK ASSESSMENT THRESHOLDS
// =============================================================================

export const RISK_THRESHOLDS = {
  // LTV-based risk levels
  LTV_RISK_LEVELS: {
    CONSERVATIVE: { max: 30, color: 'success', label: 'Conservative' },
    MODERATE: { max: 45, color: 'warning', label: 'Moderate' },
    AGGRESSIVE: { max: 65, color: 'error', label: 'Aggressive' },
  },
  
  // Price drop buffer warnings
  LIQUIDATION_WARNINGS: {
    SAFE: 50,      // >50% price drop needed
    CAUTION: 30,   // 30-50% price drop needed
    DANGER: 15,    // 15-30% price drop needed
    CRITICAL: 5,   // <15% price drop needed
  },
} as const;

// =============================================================================
// DEMO DATA SCENARIOS
// =============================================================================

export const DEMO_DATA = {
  // Sample loan data for demos
  SAMPLE_LOANS: [
    {
      id: 'demo-loan-001',
      type: 'Conservative Example',
      collateral: 200_000,
      borrowed: 1000,
      ltv: 25,
      term: 90,
      status: 'active' as const,
    },
    {
      id: 'demo-loan-002', 
      type: 'Moderate Example',
      collateral: 150_000,
      borrowed: 1200,
      ltv: 40,
      term: 60,
      status: 'active' as const,
    },
  ],
  
  // Market scenarios for stress testing demos
  MARKET_SCENARIOS: [
    { name: '2022 Crypto Winter', priceChange: -80, duration: '6 months' },
    { name: '2021 Bull Run', priceChange: +300, duration: '3 months' },
    { name: 'Flash Crash', priceChange: -50, duration: '1 day' },
    { name: 'Stable Market', priceChange: 0, duration: 'ongoing' },
  ],
} as const;

// =============================================================================
// EXPORT TYPES FOR TYPE SAFETY
// =============================================================================

export type LoanTerm = keyof typeof FINANCIAL_CONSTANTS.INTEREST_RATES;
export type VolatilityPreset = typeof SIMULATION_CONFIG.VOLATILITY_PRESETS[number];
export type RiskLevel = keyof typeof RISK_THRESHOLDS.LTV_RISK_LEVELS;
export type DemoScenario = typeof DEMO_PORTFOLIO.DEMO_SCENARIOS[number];