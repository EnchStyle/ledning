# 🐛 Simulation Debug Guide

## How to Debug Portfolio Tab Freezing

### 1. Open Browser Dev Tools
- Press F12 or Ctrl+Shift+I
- Go to the **Console** tab

### 2. Start Simulation and Monitor Logs

When you start the simulation, you'll see logs like:
```
🏦 LendingContext: Provider rendering, loans count: 2, simulation active: true
💰 LendingContext: updateLoansLTV called, price: 0.02134
🏦 PortfolioDashboard: Component rendering
🏦 PortfolioDashboard: userLoans length: 2, XPM price: 0.02134
📈 PortfolioChart: Component rendering
📈 PortfolioChart: priceHistory length: 5, userLoans length: 2
⚠️ LiquidationAlert: Component rendering
```

### 3. Check for Performance Issues

**🔴 RED FLAGS (causing freezes):**
- Rapid console spam (>10 logs per second)
- "💰 LendingContext: updateLoansLTV called" appearing constantly
- "📈 PortfolioChart: Recalculating chart data" appearing rapidly
- Browser becomes unresponsive

**🟢 GOOD SIGNS (stable performance):**
- Logs appear every 2-3 seconds maximum
- "💰 LendingContext: No LTV changes, skipping update" appears frequently
- Components render only occasionally

### 4. Switch to Portfolio Tab During Simulation

**What to watch for:**
1. Click "Portfolio" tab while simulation is running
2. Monitor console for excessive re-renders
3. Look for memory usage spikes in Dev Tools > Performance

### 5. Key Optimization Features Added

**✅ Memory Management:**
- Price history limited to 25 points (was 100)
- LTV updates only when changes > 0.01%
- Memoized expensive calculations

**✅ Component Optimization:**
- React.memo() on PortfolioChart, PortfolioDashboard, LiquidationAlert
- Stable dependency arrays to prevent recreation loops
- Batched state updates

**✅ Background Performance:**
- Simulation pauses when tab is hidden
- Page Visibility API prevents background processing
- Conservative update intervals (2+ seconds)

### 6. If Still Freezing

**Check these in console:**
1. Are loans being updated too frequently?
2. Is PortfolioChart recalculating on every render?
3. Are there JavaScript errors causing infinite loops?

**Emergency Fix:**
- If page freezes, close the browser tab immediately
- Restart with lower simulation settings (1x speed, <10% volatility)

### 7. Performance Settings

**✅ SAFE SETTINGS:**
- Speed: 1x-2x
- Volatility: 0.5%-5%

**⚠️ RISKY SETTINGS:**
- Speed: 3x+ (may cause lag)
- Volatility: 10%+ (excessive calculations)

**❌ DANGEROUS SETTINGS:**
- Speed: 5x (likely to freeze)
- Volatility: 25%+ (memory issues)

## Debug Commands

```javascript
// In browser console - check render frequency
let renderCount = 0;
setInterval(() => {
  console.log('Renders in last 5 seconds:', renderCount);
  renderCount = 0;
}, 5000);
```

## Recent Fixes Applied

1. **Portfolio Tab Optimization** - Memoized expensive calculations
2. **LTV Update Throttling** - Only update when LTV changes significantly  
3. **Chart Performance** - Reduced data points and stable dependencies
4. **Memory Management** - Aggressive cleanup and batching
5. **Debug Logging** - Comprehensive performance monitoring
6. **Context Value Memoization** - Prevents cascade re-renders from context changes
7. **Price History Throttling** - Maximum 1 update per 5 seconds
8. **Optimized Dependencies** - Fine-tuned memoization to prevent recreation loops

The debug logs will help identify exactly what's causing the freeze when switching to Portfolio during simulation.