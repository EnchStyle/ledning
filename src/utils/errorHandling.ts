/**
 * Error Handling Utilities
 * 
 * Centralized error handling for consistent user experience
 * Provides typed error classes and handling patterns
 */

/**
 * Base error class for lending platform errors
 */
export class LendingError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly details?: any;

  constructor(code: string, message: string, userMessage: string, details?: any) {
    super(message);
    this.name = 'LendingError';
    this.code = code;
    this.userMessage = userMessage;
    this.details = details;
  }
}

/**
 * Validation error for user input
 */
export class ValidationError extends LendingError {
  constructor(field: string, message: string, value?: any) {
    super(
      'VALIDATION_ERROR',
      `Validation failed for field: ${field}`,
      message,
      { field, value }
    );
    this.name = 'ValidationError';
  }
}

/**
 * Insufficient collateral error
 */
export class InsufficientCollateralError extends LendingError {
  constructor(required: number, available: number) {
    super(
      'INSUFFICIENT_COLLATERAL',
      `Insufficient collateral: required ${required}, available ${available}`,
      `Insufficient collateral. You need ${required.toLocaleString()} XPM but only have ${available.toLocaleString()} XPM available.`,
      { required, available }
    );
    this.name = 'InsufficientCollateralError';
  }
}

/**
 * Loan health error for risky positions
 */
export class LoanHealthError extends LendingError {
  constructor(currentLTV: number, maxLTV: number, loanId: string) {
    super(
      'LOAN_HEALTH_ERROR',
      `Loan ${loanId} LTV ${currentLTV}% exceeds max ${maxLTV}%`,
      `This operation would put your loan at risk. Current LTV: ${currentLTV.toFixed(1)}%, Maximum allowed: ${maxLTV}%`,
      { currentLTV, maxLTV, loanId }
    );
    this.name = 'LoanHealthError';
  }
}

/**
 * Market condition error
 */
export class MarketConditionError extends LendingError {
  constructor(condition: string, details: any) {
    super(
      'MARKET_CONDITION_ERROR',
      `Unfavorable market condition: ${condition}`,
      `Market conditions prevent this operation: ${condition}`,
      details
    );
    this.name = 'MarketConditionError';
  }
}

/**
 * Error codes for consistent error handling
 */
export enum ErrorCode {
  // Validation errors
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_COLLATERAL = 'INVALID_COLLATERAL',
  INVALID_LTV = 'INVALID_LTV',
  
  // Loan errors
  LOAN_NOT_FOUND = 'LOAN_NOT_FOUND',
  LOAN_NOT_ACTIVE = 'LOAN_NOT_ACTIVE',
  LOAN_EXPIRED = 'LOAN_EXPIRED',
  
  // Market errors
  PRICE_UNAVAILABLE = 'PRICE_UNAVAILABLE',
  LIQUIDITY_INSUFFICIENT = 'LIQUIDITY_INSUFFICIENT',
  
  // System errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Error messages for common scenarios
 */
export const ErrorMessages = {
  [ErrorCode.INVALID_AMOUNT]: 'Please enter a valid amount greater than 0',
  [ErrorCode.INVALID_COLLATERAL]: 'Invalid collateral amount',
  [ErrorCode.INVALID_LTV]: 'LTV ratio must be between 0 and 50%',
  [ErrorCode.LOAN_NOT_FOUND]: 'Loan not found',
  [ErrorCode.LOAN_NOT_ACTIVE]: 'This loan is no longer active',
  [ErrorCode.LOAN_EXPIRED]: 'This loan has expired and cannot be modified',
  [ErrorCode.PRICE_UNAVAILABLE]: 'Unable to fetch current market prices',
  [ErrorCode.LIQUIDITY_INSUFFICIENT]: 'Insufficient liquidity in the pool',
  [ErrorCode.NETWORK_ERROR]: 'Network connection error. Please try again.',
  [ErrorCode.CONTRACT_ERROR]: 'Smart contract interaction failed',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred'
};

/**
 * Type guard to check if error is a LendingError
 */
export const isLendingError = (error: any): error is LendingError => {
  return error instanceof LendingError;
};

/**
 * Get user-friendly error message
 */
export const getUserErrorMessage = (error: any): string => {
  if (isLendingError(error)) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('network')) {
      return ErrorMessages[ErrorCode.NETWORK_ERROR];
    }
    if (error.message.includes('contract')) {
      return ErrorMessages[ErrorCode.CONTRACT_ERROR];
    }
    
    return error.message;
  }
  
  return ErrorMessages[ErrorCode.UNKNOWN_ERROR];
};

/**
 * Log error with context
 */
export const logError = (error: any, context: string, details?: any): void => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: {
      name: error?.name || 'Unknown',
      message: error?.message || String(error),
      code: error?.code,
      stack: error?.stack,
    },
    details,
  };
  
  // In production, this would send to error tracking service
  console.error('[LendingPlatform Error]', errorInfo);
};

/**
 * Validation helper functions
 */
export const validateAmount = (amount: string | number, fieldName: string = 'amount'): number => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new ValidationError(fieldName, ErrorMessages[ErrorCode.INVALID_AMOUNT], amount);
  }
  
  return numAmount;
};

export const validateLTV = (ltv: number): number => {
  if (ltv < 0 || ltv > 50) {
    throw new ValidationError('ltv', ErrorMessages[ErrorCode.INVALID_LTV], ltv);
  }
  
  return ltv;
};

export const validateCollateral = (amount: number, required: number): void => {
  if (amount < required) {
    throw new InsufficientCollateralError(required, amount);
  }
};

/**
 * Async error wrapper for consistent error handling
 */
export const handleAsync = async <T>(
  fn: () => Promise<T>,
  context: string
): Promise<[T | null, Error | null]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    logError(error, context);
    return [null, error as Error];
  }
};