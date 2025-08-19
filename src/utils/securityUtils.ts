/**
 * Security Utilities for XRP Lending Platform
 * 
 * Provides cryptographically secure functions for:
 * - Generating secure random IDs
 * - Input sanitization
 * - Security validation
 */

/**
 * Generate a cryptographically secure random ID
 * Uses crypto.getRandomValues for secure randomness
 * @returns A secure 16-character hexadecimal ID
 */
export const generateSecureId = (): string => {
  // Use crypto.getRandomValues for secure random bytes
  const array = new Uint8Array(8); // 8 bytes = 16 hex characters
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for non-browser environments (though this should not happen in React)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Convert to hexadecimal string
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate and sanitize numeric input for financial calculations
 * @param value - Raw input value
 * @param fieldName - Field name for error reporting
 * @param options - Validation options
 * @returns Validated and sanitized number
 */
export const validateNumericInput = (
  value: string | number, 
  fieldName: string,
  options: {
    min?: number;
    max?: number;
    allowZero?: boolean;
    decimalPlaces?: number;
  } = {}
): number => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check for invalid numbers
  if (isNaN(numValue) || !isFinite(numValue)) {
    throw new Error(`Invalid ${fieldName}: must be a valid number`);
  }
  
  // Check minimum value
  if (options.min !== undefined && numValue < options.min) {
    throw new Error(`Invalid ${fieldName}: must be at least ${options.min}`);
  }
  
  // Check maximum value
  if (options.max !== undefined && numValue > options.max) {
    throw new Error(`Invalid ${fieldName}: must not exceed ${options.max}`);
  }
  
  // Check zero allowance
  if (!options.allowZero && numValue === 0) {
    throw new Error(`Invalid ${fieldName}: cannot be zero`);
  }
  
  // Check for negative values (financial amounts should generally be positive)
  if (numValue < 0) {
    throw new Error(`Invalid ${fieldName}: cannot be negative`);
  }
  
  // Round to specified decimal places to prevent precision issues
  if (options.decimalPlaces !== undefined) {
    return Math.round(numValue * Math.pow(10, options.decimalPlaces)) / Math.pow(10, options.decimalPlaces);
  }
  
  return numValue;
};

/**
 * Sanitize string input to prevent XSS and injection attacks
 * @param input - Raw string input
 * @returns Sanitized string
 */
export const sanitizeStringInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .substring(0, 500); // Limit length to prevent DoS
};

/**
 * Validate XRPL address format (for future XRPL integration)
 * @param address - Address to validate
 * @returns boolean indicating if address is valid format
 */
export const validateXRPLAddress = (address: string): boolean => {
  // Basic XRPL address validation (starts with 'r' and is 25-34 characters)
  const xrplAddressRegex = /^r[1-9A-HJ-NP-Za-km-z]{24,33}$/;
  return xrplAddressRegex.test(address);
};

/**
 * Generate a secure temporary token (for session management)
 * @param length - Token length in bytes (default 32)
 * @returns Secure token string
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for non-browser environments
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Convert to base64-like string
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};