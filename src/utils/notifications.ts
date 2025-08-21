/**
 * Notification System
 * 
 * Provides consistent notification patterns for user feedback
 * Integrates with Material-UI's Snackbar component
 */

import { VariantType, enqueueSnackbar, SnackbarOrigin } from 'notistack';

/**
 * Notification types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification configuration
 */
export interface NotificationConfig {
  message: string;
  type: NotificationType;
  duration?: number;
  position?: SnackbarOrigin;
  action?: () => void;
  actionLabel?: string;
}

/**
 * Default notification settings
 */
const DEFAULT_DURATION = 5000; // 5 seconds
const DEFAULT_POSITION: SnackbarOrigin = {
  vertical: 'bottom',
  horizontal: 'left',
};

/**
 * Show notification to user
 */
export const showNotification = (config: NotificationConfig): void => {
  const {
    message,
    type,
    duration = DEFAULT_DURATION,
    position = DEFAULT_POSITION,
  } = config;

  enqueueSnackbar(message, {
    variant: type as VariantType,
    autoHideDuration: duration,
    anchorOrigin: position,
  });
};

/**
 * Success notification shortcuts
 */
export const notifySuccess = {
  loanCreated: (loanId: string) => showNotification({
    message: `Loan ${loanId} created successfully!`,
    type: 'success',
  }),
  
  loanRepaid: (amount: number) => showNotification({
    message: `Successfully repaid ${amount.toLocaleString()} XRP`,
    type: 'success',
  }),
  
  collateralAdded: (amount: number) => showNotification({
    message: `Added ${amount.toLocaleString()} XPM collateral`,
    type: 'success',
  }),
  
  
  settingsSaved: () => showNotification({
    message: 'Settings saved successfully',
    type: 'success',
    duration: 3000,
  }),
};

/**
 * Warning notification shortcuts
 */
export const notifyWarning = {
  highLTV: (ltv: number) => showNotification({
    message: `Warning: High LTV ratio (${ltv.toFixed(1)}%). Consider adding collateral.`,
    type: 'warning',
    duration: 7000,
  }),
  
  nearLiquidation: (ltv: number, threshold: number) => showNotification({
    message: `⚠️ Near liquidation! LTV: ${ltv.toFixed(1)}% (Threshold: ${threshold}%)`,
    type: 'warning',
    duration: 10000,
  }),
  
  loanExpiring: (daysLeft: number) => showNotification({
    message: `Loan expiring in ${daysLeft} days. Consider repayment.`,
    type: 'warning',
  }),
  
  marketVolatility: () => showNotification({
    message: 'High market volatility detected. Monitor your positions closely.',
    type: 'warning',
  }),
};

/**
 * Error notification shortcuts
 */
export const notifyError = {
  loanCreationFailed: (reason: string) => showNotification({
    message: `Failed to create loan: ${reason}`,
    type: 'error',
  }),
  
  insufficientBalance: (required: number, available: number, token: string) => showNotification({
    message: `Insufficient ${token}. Required: ${required.toLocaleString()}, Available: ${available.toLocaleString()}`,
    type: 'error',
  }),
  
  transactionFailed: (error: string) => showNotification({
    message: `Transaction failed: ${error}`,
    type: 'error',
    duration: 7000,
  }),
  
  networkError: () => showNotification({
    message: 'Network error. Please check your connection and try again.',
    type: 'error',
  }),
  
  validationError: (field: string, message: string) => showNotification({
    message: `${field}: ${message}`,
    type: 'error',
  }),
};

/**
 * Info notification shortcuts
 */
export const notifyInfo = {
  priceUpdate: (asset: string, newPrice: number) => showNotification({
    message: `${asset} price updated: $${newPrice.toFixed(4)}`,
    type: 'info',
    duration: 3000,
  }),
  
  loanMatured: (loanId: string) => showNotification({
    message: `Loan ${loanId} has reached maturity`,
    type: 'info',
  }),
  
  
  simulationMode: () => showNotification({
    message: 'Simulation mode active. Changes will not affect real positions.',
    type: 'info',
  }),
};

/**
 * Transaction status notifications
 */
export const notifyTransaction = {
  pending: (txType: string) => showNotification({
    message: `${txType} transaction pending...`,
    type: 'info',
    duration: undefined, // Keep visible until resolved
  }),
  
  confirmed: (txType: string, txHash?: string) => showNotification({
    message: `${txType} transaction confirmed${txHash ? ` (${txHash.slice(0, 8)}...)` : ''}`,
    type: 'success',
  }),
  
  failed: (txType: string, reason?: string) => showNotification({
    message: `${txType} transaction failed${reason ? `: ${reason}` : ''}`,
    type: 'error',
  }),
};

/**
 * Batch notification for multiple events
 */
export const notifyBatch = (notifications: NotificationConfig[]): void => {
  notifications.forEach((config, index) => {
    // Stagger notifications to prevent overlap
    setTimeout(() => showNotification(config), index * 100);
  });
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = (): void => {
  // This would integrate with notistack's closeSnackbar function
  // Implementation depends on notistack setup
};