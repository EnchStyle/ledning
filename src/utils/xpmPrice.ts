/**
 * XPM Price Fetching Utility
 * 
 * Fetches real-time XPM token price from XPMarket API
 * Uses price2Usd from the trending tokens endpoint
 */

interface XPMTokenData {
  id: number;
  issuer: string;
  symbol: string;
  title: string;
  price2Usd: number;
  volume_usd: string;
  liquidity_usd: string;
  holders: number;
}

interface XPMarketResponse {
  data?: XPMTokenData[];
  error?: string;
}

const XPM_API_URL = 'https://api.xpmarket.com/api/trending/tokens';
const XPM_TOKEN_ID = 23467; // XPM token ID from the API response

/**
 * Fetch current XPM price from XPMarket API
 * Returns price2Usd value which represents XPM price in USD
 */
export const fetchXPMPrice = async (): Promise<number> => {
  try {
    const response = await fetch(XPM_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Find XPM token in the response array
    const xpmToken = Array.isArray(data) 
      ? data.find((token: XPMTokenData) => token.id === XPM_TOKEN_ID)
      : null;

    if (!xpmToken) {
      throw new Error('XPM token not found in API response');
    }

    const price = xpmToken.price2Usd;
    
    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Invalid price data received from API');
    }

    console.log(`💰 XPM Price fetched: $${price.toFixed(6)}`);
    return price;

  } catch (error) {
    console.error('❌ Failed to fetch XPM price from API:', error);
    throw error;
  }
};

/**
 * Fetch XPM price with fallback to default value
 * Returns fallback price if API call fails
 */
export const fetchXPMPriceWithFallback = async (fallbackPrice: number = 0.022): Promise<number> => {
  try {
    return await fetchXPMPrice();
  } catch (error) {
    console.warn('⚠️ Using fallback XPM price due to API error:', error);
    return fallbackPrice;
  }
};

/**
 * Create a price monitoring service that updates price periodically
 * Returns cleanup function to stop monitoring
 */
export const createPriceMonitor = (
  onPriceUpdate: (price: number) => void,
  intervalMs: number = 30000, // 30 seconds
  fallbackPrice: number = 0.022
): (() => void) => {
  let isRunning = true;
  
  const updatePrice = async () => {
    if (!isRunning) return;
    
    try {
      const price = await fetchXPMPriceWithFallback(fallbackPrice);
      onPriceUpdate(price);
    } catch (error) {
      console.error('Price monitor update failed:', error);
      onPriceUpdate(fallbackPrice);
    }
  };

  // Initial price fetch
  updatePrice();

  // Set up periodic updates
  const intervalId = setInterval(updatePrice, intervalMs);

  // Return cleanup function
  return () => {
    isRunning = false;
    clearInterval(intervalId);
  };
};