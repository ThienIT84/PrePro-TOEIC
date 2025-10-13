// Memory optimization utilities for MVC architecture

export interface MemoryStats {
  used: number;
  total: number;
  percentage: number;
  components: number;
  controllers: number;
  services: number;
}

export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private componentRegistry = new Map<string, unknown>();
  private controllerRegistry = new Map<string, unknown>();
  private serviceRegistry = new Map<string, unknown>();
  private cleanupCallbacks = new Set<() => void>();

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  // Register component for tracking
  registerComponent(id: string, component: unknown): void {
    this.componentRegistry.set(id, {
      component,
      timestamp: Date.now(),
      accessCount: 0
    });
  }

  // Register controller for tracking
  registerController(id: string, controller: unknown): void {
    this.controllerRegistry.set(id, {
      controller,
      timestamp: Date.now(),
      accessCount: 0
    });
  }

  // Register service for tracking
  registerService(id: string, service: unknown): void {
    this.serviceRegistry.set(id, {
      service,
      timestamp: Date.now(),
      accessCount: 0
    });
  }

  // Unregister component
  unregisterComponent(id: string): void {
    this.componentRegistry.delete(id);
  }

  // Unregister controller
  unregisterController(id: string): void {
    this.controllerRegistry.delete(id);
  }

  // Unregister service
  unregisterService(id: string): void {
    this.serviceRegistry.delete(id);
  }

  // Get memory statistics
  getMemoryStats(): MemoryStats {
    const memory = (performance as unknown).memory;
    const used = memory ? memory.usedJSHeapSize : 0;
    const total = memory ? memory.totalJSHeapSize : 0;
    
    return {
      used,
      total,
      percentage: total > 0 ? (used / total) * 100 : 0,
      components: this.componentRegistry.size,
      controllers: this.controllerRegistry.size,
      services: this.serviceRegistry.size
    };
  }

  // Cleanup unused components
  cleanupUnusedComponents(maxAge: number = 10 * 60 * 1000): void {
    const now = Date.now();
    const toRemove: string[] = [];

    this.componentRegistry.forEach((item, id) => {
      if (now - item.timestamp > maxAge && item.accessCount === 0) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => {
      this.unregisterComponent(id);
    });
  }

  // Cleanup unused controllers
  cleanupUnusedControllers(maxAge: number = 15 * 60 * 1000): void {
    const now = Date.now();
    const toRemove: string[] = [];

    this.controllerRegistry.forEach((item, id) => {
      if (now - item.timestamp > maxAge && item.accessCount === 0) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => {
      this.unregisterController(id);
    });
  }

  // Cleanup unused services
  cleanupUnusedServices(maxAge: number = 30 * 60 * 1000): void {
    const now = Date.now();
    const toRemove: string[] = [];

    this.serviceRegistry.forEach((item, id) => {
      if (now - item.timestamp > maxAge && item.accessCount === 0) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => {
      this.unregisterService(id);
    });
  }

  // Force garbage collection
  forceGC(): void {
    if ((window as unknown).gc) {
      (window as unknown).gc();
    }
  }

  // Add cleanup callback
  addCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.add(callback);
  }

  // Remove cleanup callback
  removeCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.delete(callback);
  }

  // Run all cleanup callbacks
  runCleanup(): void {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Cleanup callback error:', error);
      }
    });
  }

  // Monitor memory usage
  startMemoryMonitoring(interval: number = 30000): void {
    setInterval(() => {
      const stats = this.getMemoryStats();
      
      // Log memory usage
      console.log('Memory Stats:', stats);
      
      // Cleanup if memory usage is high
      if (stats.percentage > 80) {
        this.cleanupUnusedComponents();
        this.cleanupUnusedControllers();
        this.cleanupUnusedServices();
        this.runCleanup();
        this.forceGC();
      }
    }, interval);
  }
}

// Memory-optimized component wrapper
export function withMemoryOptimization<T extends React.ComponentType<unknown>>(
  Component: T,
  id: string
): T {
  const WrappedComponent = React.forwardRef<unknown, unknown>((props, ref) => {
    const optimizer = MemoryOptimizer.getInstance();
    
    React.useEffect(() => {
      optimizer.registerComponent(id, Component);
      
      return () => {
        optimizer.unregisterComponent(id);
      };
    }, []);

    return React.createElement(Component, { ...props, ref });
  });

  return WrappedComponent as T;
}

// Memory-optimized controller wrapper
export function withControllerOptimization<T extends new (...args: unknown[]) => unknown>(
  ControllerClass: T,
  id: string
): T {
  return class extends ControllerClass {
    constructor(...args: unknown[]) {
      super(...args);
      const optimizer = MemoryOptimizer.getInstance();
      optimizer.registerController(id, this);
    }

    destroy(): void {
      const optimizer = MemoryOptimizer.getInstance();
      optimizer.unregisterController(id);
    }
  } as T;
}

// Memory-optimized service wrapper
export function withServiceOptimization<T extends new (...args: unknown[]) => unknown>(
  ServiceClass: T,
  id: string
): T {
  return class extends ServiceClass {
    constructor(...args: unknown[]) {
      super(...args);
      const optimizer = MemoryOptimizer.getInstance();
      optimizer.registerService(id, this);
    }

    destroy(): void {
      const optimizer = MemoryOptimizer.getInstance();
      optimizer.unregisterService(id);
    }
  } as T;
}

// Debounced function for memory optimization
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  
  return ((...args: unknown[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// Throttled function for memory optimization
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  
  return ((...args: unknown[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

// WeakMap for storing component references
export const componentRefs = new WeakMap<React.Component, unknown>();

// WeakSet for tracking component instances
export const componentInstances = new WeakSet<React.Component>();

// Memory leak detection
export class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private leakThreshold = 100; // Maximum number of instances
  private checkInterval = 60000; // Check every minute
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  start(): void {
    this.intervalId = setInterval(() => {
      this.checkForLeaks();
    }, this.checkInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private checkForLeaks(): void {
    const optimizer = MemoryOptimizer.getInstance();
    const stats = optimizer.getMemoryStats();
    
    if (stats.components > this.leakThreshold) {
      console.warn('Potential memory leak detected: Too munknown components registered');
    }
    
    if (stats.controllers > this.leakThreshold) {
      console.warn('Potential memory leak detected: Too munknown controllers registered');
    }
    
    if (stats.services > this.leakThreshold) {
      console.warn('Potential memory leak detected: Too munknown services registered');
    }
  }
}

// Initialize memory optimization
export const initializeMemoryOptimization = () => {
  const optimizer = MemoryOptimizer.getInstance();
  const detector = MemoryLeakDetector.getInstance();
  
  // Start memory monitoring
  optimizer.startMemoryMonitoring();
  
  // Start leak detection
  detector.start();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    optimizer.runCleanup();
    detector.stop();
  });
};













