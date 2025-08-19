/**
 * Hook to pause simulation updates when certain conditions are met
 * This prevents performance issues when viewing complex components
 */
import { useEffect, useRef } from 'react';

export const useSimulationPause = (shouldPause: boolean) => {
  const pauseRef = useRef(shouldPause);
  
  useEffect(() => {
    pauseRef.current = shouldPause;
    
    // Store pause state globally for the context to check
    if (typeof window !== 'undefined') {
      (window as any).__simulationPaused = shouldPause;
    }
    
    if (shouldPause) {
      console.log('📊 Simulation updates paused for performance');
    } else {
      console.log('▶️ Simulation updates resumed');
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).__simulationPaused = false;
      }
    };
  }, [shouldPause]);
  
  return pauseRef.current;
};