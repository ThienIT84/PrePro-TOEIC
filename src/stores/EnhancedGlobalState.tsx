import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CacheService } from '@/services/cache/CacheService';

// Enhanced state interfaces
export interface StateVersion {
  version: string;
  timestamp: number;
  checksum: string;
}

export interface StateSnapshot {
  state: any;
  version: StateVersion;
  timestamp: number;
}

export interface StateConfig {
  persistence: boolean;
  versioning: boolean;
  compression: boolean;
  encryption: boolean;
  maxSnapshots: number;
  syncInterval: number;
}

export interface EnhancedGlobalState {
  // Core state
  user: any;
  questions: any[];
  exams: any[];
  passages: any[];
  analytics: any;
  
  // UI state
  loading: boolean;
  error: string | null;
  notifications: any[];
  
  // System state
  version: StateVersion;
  lastSync: number;
  isOnline: boolean;
  
  // Performance state
  memoryUsage: number;
  cacheStats: any;
}

// Action types
export type StateAction =
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_QUESTIONS'; payload: any[] }
  | { type: 'SET_EXAMS'; payload: any[] }
  | { type: 'SET_PASSAGES'; payload: any[] }
  | { type: 'SET_ANALYTICS'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_MEMORY_USAGE'; payload: number }
  | { type: 'SET_CACHE_STATS'; payload: any }
  | { type: 'RESET_STATE' }
  | { type: 'RESTORE_STATE'; payload: EnhancedGlobalState };

// State reducer
const stateReducer = (state: EnhancedGlobalState, action: StateAction): EnhancedGlobalState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'SET_EXAMS':
      return { ...state, exams: action.payload };
    case 'SET_PASSAGES':
      return { ...state, passages: action.payload };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_MEMORY_USAGE':
      return { ...state, memoryUsage: action.payload };
    case 'SET_CACHE_STATS':
      return { ...state, cacheStats: action.payload };
    case 'RESET_STATE':
      return getInitialState();
    case 'RESTORE_STATE':
      return action.payload;
    default:
      return state;
  }
};

// Initial state
const getInitialState = (): EnhancedGlobalState => ({
  user: null,
  questions: [],
  exams: [],
  passages: [],
  analytics: null,
  loading: false,
  error: null,
  notifications: [],
  version: {
    version: '1.0.0',
    timestamp: Date.now(),
    checksum: ''
  },
  lastSync: Date.now(),
  isOnline: navigator.onLine,
  memoryUsage: 0,
  cacheStats: null
});

// Enhanced Global State Context
const EnhancedGlobalStateContext = createContext<{
  state: EnhancedGlobalState;
  dispatch: React.Dispatch<StateAction>;
  // Enhanced methods
  saveState: () => void;
  loadState: () => void;
  clearState: () => void;
  getStateSnapshot: () => StateSnapshot;
  restoreStateSnapshot: (snapshot: StateSnapshot) => void;
  syncState: () => void;
  // Performance methods
  getMemoryStats: () => any;
  optimizeMemory: () => void;
  // Versioning methods
  getStateVersion: () => StateVersion;
  compareStateVersions: (v1: StateVersion, v2: StateVersion) => number;
} | null>(null);

// Enhanced Global State Provider
export const EnhancedGlobalStateProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<StateConfig>;
}> = ({ children, config = {} }) => {
  const [state, dispatch] = useReducer(stateReducer, getInitialState());
  
  const defaultConfig: StateConfig = {
    persistence: true,
    versioning: true,
    compression: false,
    encryption: false,
    maxSnapshots: 10,
    syncInterval: 30000,
    ...config
  };

  // Cache service for state persistence
  const stateCache = new CacheService({
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 100,
    strategy: 'lru'
  });

  // Generate state checksum
  const generateChecksum = (state: EnhancedGlobalState): string => {
    const stateString = JSON.stringify(state);
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  };

  // Update state version
  const updateStateVersion = useCallback((newState: EnhancedGlobalState) => {
    const version: StateVersion = {
      version: '1.0.0',
      timestamp: Date.now(),
      checksum: generateChecksum(newState)
    };
    
    return {
      ...newState,
      version,
      lastSync: Date.now()
    };
  }, []);

  // Save state to cache
  const saveState = useCallback(() => {
    if (!defaultConfig.persistence) return;
    
    const stateWithVersion = updateStateVersion(state);
    const snapshot: StateSnapshot = {
      state: stateWithVersion,
      version: stateWithVersion.version,
      timestamp: Date.now()
    };
    
    stateCache.set('global_state', snapshot);
    localStorage.setItem('enhanced_global_state', JSON.stringify(snapshot));
  }, [state, stateCache, updateStateVersion]);

  // Load state from cache
  const loadState = useCallback(() => {
    if (!defaultConfig.persistence) return;
    
    try {
      // Try to load from cache first
      const cachedSnapshot = stateCache.get('global_state');
      if (cachedSnapshot) {
        dispatch({ type: 'RESTORE_STATE', payload: cachedSnapshot.state });
        return;
      }
      
      // Fallback to localStorage
      const storedState = localStorage.getItem('enhanced_global_state');
      if (storedState) {
        const snapshot: StateSnapshot = JSON.parse(storedState);
        dispatch({ type: 'RESTORE_STATE', payload: snapshot.state });
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }, [stateCache]);

  // Clear state
  const clearState = useCallback(() => {
    stateCache.delete('global_state');
    localStorage.removeItem('enhanced_global_state');
    dispatch({ type: 'RESET_STATE' });
  }, [stateCache]);

  // Get state snapshot
  const getStateSnapshot = useCallback((): StateSnapshot => {
    const stateWithVersion = updateStateVersion(state);
    return {
      state: stateWithVersion,
      version: stateWithVersion.version,
      timestamp: Date.now()
    };
  }, [state, updateStateVersion]);

  // Restore state snapshot
  const restoreStateSnapshot = useCallback((snapshot: StateSnapshot) => {
    dispatch({ type: 'RESTORE_STATE', payload: snapshot.state });
  }, []);

  // Sync state
  const syncState = useCallback(() => {
    if (!state.isOnline) return;
    
    // Here you would implement actual sync logic
    // For now, just save to local storage
    saveState();
  }, [state.isOnline, saveState]);

  // Get memory stats
  const getMemoryStats = useCallback(() => {
    const memory = (performance as any).memory;
    return {
      used: memory ? memory.usedJSHeapSize : 0,
      total: memory ? memory.totalJSHeapSize : 0,
      percentage: memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0
    };
  }, []);

  // Optimize memory
  const optimizeMemory = useCallback(() => {
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    // Update memory usage
    const memoryStats = getMemoryStats();
    dispatch({ type: 'SET_MEMORY_USAGE', payload: memoryStats.percentage });
  }, [getMemoryStats]);

  // Get state version
  const getStateVersion = useCallback((): StateVersion => {
    return state.version;
  }, [state.version]);

  // Compare state versions
  const compareStateVersions = useCallback((v1: StateVersion, v2: StateVersion): number => {
    if (v1.timestamp < v2.timestamp) return -1;
    if (v1.timestamp > v2.timestamp) return 1;
    return 0;
  }, []);

  // Auto-save state changes
  useEffect(() => {
    if (defaultConfig.persistence) {
      const timeoutId = setTimeout(saveState, 1000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [state, saveState, defaultConfig.persistence]);

  // Auto-sync state
  useEffect(() => {
    if (defaultConfig.syncInterval > 0) {
      const intervalId = setInterval(syncState, defaultConfig.syncInterval);
      return () => clearInterval(intervalId);
    }
  }, [syncState, defaultConfig.syncInterval]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', payload: false });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const intervalId = setInterval(() => {
      const memoryStats = getMemoryStats();
      dispatch({ type: 'SET_MEMORY_USAGE', payload: memoryStats.percentage });
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [getMemoryStats]);

  // Load state on mount
  useEffect(() => {
    loadState();
  }, [loadState]);

  const contextValue = {
    state,
    dispatch,
    saveState,
    loadState,
    clearState,
    getStateSnapshot,
    restoreStateSnapshot,
    syncState,
    getMemoryStats,
    optimizeMemory,
    getStateVersion,
    compareStateVersions
  };

  return (
    <EnhancedGlobalStateContext.Provider value={contextValue}>
      {children}
    </EnhancedGlobalStateContext.Provider>
  );
};

// Enhanced hook
export const useEnhancedGlobalState = () => {
  const context = useContext(EnhancedGlobalStateContext);
  if (!context) {
    throw new Error('useEnhancedGlobalState must be used within EnhancedGlobalStateProvider');
  }
  return context;
};

// HOC for components that need enhanced state
export const withEnhancedState = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const enhancedState = useEnhancedGlobalState();
    return React.createElement(Component, { ...props, ref, enhancedState });
  });
};
