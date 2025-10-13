// Controller Lifecycle Management for MVC Architecture

export interface ControllerLifecycle {
  onInit(): void;
  onDestroy(): void;
  onPause(): void;
  onResume(): void;
  onError(error: Error): void;
}

export interface ControllerPool {
  id: string;
  controller: unknown;
  lastUsed: number;
  accessCount: number;
  isActive: boolean;
}

export class ControllerLifecycleManager {
  private static instance: ControllerLifecycleManager;
  private controllerPool = new Map<string, ControllerPool>();
  private maxPoolSize = 10;
  private maxIdleTime = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval = 60 * 1000; // 1 minute
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): ControllerLifecycleManager {
    if (!ControllerLifecycleManager.instance) {
      ControllerLifecycleManager.instance = new ControllerLifecycleManager();
    }
    return ControllerLifecycleManager.instance;
  }

  // Register controller in pool
  registerController(id: string, controller: unknown): void {
    const poolItem: ControllerPool = {
      id,
      controller,
      lastUsed: Date.now(),
      accessCount: 0,
      isActive: true
    };

    this.controllerPool.set(id, poolItem);
    this.startCleanup();
  }

  // Get controller from pool
  getController(id: string): unknown | null {
    const poolItem = this.controllerPool.get(id);
    
    if (!poolItem) {
      return null;
    }

    // Update access statistics
    poolItem.lastUsed = Date.now();
    poolItem.accessCount++;
    poolItem.isActive = true;

    return poolItem.controller;
  }

  // Remove controller from pool
  removeController(id: string): void {
    const poolItem = this.controllerPool.get(id);
    
    if (poolItem) {
      // Call destroy lifecycle if available
      if (poolItem.controller.onDestroy) {
        try {
          poolItem.controller.onDestroy();
        } catch (error) {
          console.error(`Error destroying controller ${id}:`, error);
        }
      }
      
      this.controllerPool.delete(id);
    }
  }

  // Pause controller
  pauseController(id: string): void {
    const poolItem = this.controllerPool.get(id);
    
    if (poolItem && poolItem.isActive) {
      poolItem.isActive = false;
      
      if (poolItem.controller.onPause) {
        try {
          poolItem.controller.onPause();
        } catch (error) {
          console.error(`Error pausing controller ${id}:`, error);
        }
      }
    }
  }

  // Resume controller
  resumeController(id: string): void {
    const poolItem = this.controllerPool.get(id);
    
    if (poolItem && !poolItem.isActive) {
      poolItem.isActive = true;
      poolItem.lastUsed = Date.now();
      
      if (poolItem.controller.onResume) {
        try {
          poolItem.controller.onResume();
        } catch (error) {
          console.error(`Error resuming controller ${id}:`, error);
        }
      }
    }
  }

  // Get pool statistics
  getPoolStats() {
    const controllers = Array.from(this.controllerPool.values());
    
    return {
      total: this.controllerPool.size,
      active: controllers.filter(c => c.isActive).length,
      inactive: controllers.filter(c => !c.isActive).length,
      averageAccessCount: controllers.reduce((sum, c) => sum + c.accessCount, 0) / controllers.length,
      oldestController: controllers.reduce((oldest, current) => 
        current.lastUsed < oldest.lastUsed ? current : oldest
      ),
      newestController: controllers.reduce((newest, current) => 
        current.lastUsed > newest.lastUsed ? current : newest
      )
    };
  }

  // Start cleanup process
  private startCleanup(): void {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Stop cleanup process
  private stopCleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Cleanup unused controllers
  private cleanup(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    this.controllerPool.forEach((poolItem, id) => {
      // Remove if idle for too long
      if (now - poolItem.lastUsed > this.maxIdleTime) {
        toRemove.push(id);
      }
      
      // Remove if pool is too large and controller is inactive
      if (this.controllerPool.size > this.maxPoolSize && !poolItem.isActive) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => {
      this.removeController(id);
    });
  }

  // Clear all controllers
  clearAll(): void {
    this.controllerPool.forEach((_, id) => {
      this.removeController(id);
    });
    this.stopCleanup();
  }

  // Destroy manager
  destroy(): void {
    this.clearAll();
  }
}

// Controller factory with lifecycle management
export class ControllerFactory {
  private static instance: ControllerFactory;
  private lifecycleManager = ControllerLifecycleManager.getInstance();

  static getInstance(): ControllerFactory {
    if (!ControllerFactory.instance) {
      ControllerFactory.instance = new ControllerFactory();
    }
    return ControllerFactory.instance;
  }

  // Create controller with lifecycle management
  createController<T extends new (...args: unknown[]) => unknown>(
    ControllerClass: T,
    id: string,
    ...args: unknown[]
  ): InstanceType<T> {
    // Check if controller already exists in pool
    const existingController = this.lifecycleManager.getController(id);
    if (existingController) {
      return existingController;
    }

    // Create new controller
    const controller = new ControllerClass(...args);
    
    // Register in pool
    this.lifecycleManager.registerController(id, controller);
    
    // Call init lifecycle if available
    if (controller.onInit) {
      try {
        controller.onInit();
      } catch (error) {
        console.error(`Error initializing controller ${id}:`, error);
        if (controller.onError) {
          controller.onError(error);
        }
      }
    }

    return controller;
  }

  // Get or create controller
  getOrCreateController<T extends new (...args: unknown[]) => unknown>(
    ControllerClass: T,
    id: string,
    ...args: unknown[]
  ): InstanceType<T> {
    const existingController = this.lifecycleManager.getController(id);
    if (existingController) {
      return existingController;
    }
    
    return this.createController(ControllerClass, id, ...args);
  }

  // Destroy controller
  destroyController(id: string): void {
    this.lifecycleManager.removeController(id);
  }

  // Pause controller
  pauseController(id: string): void {
    this.lifecycleManager.pauseController(id);
  }

  // Resume controller
  resumeController(id: string): void {
    this.lifecycleManager.resumeController(id);
  }

  // Get pool statistics
  getPoolStats() {
    return this.lifecycleManager.getPoolStats();
  }
}

// Controller middleware for lifecycle management
export function withLifecycle<T extends new (...args: unknown[]) => unknown>(
  ControllerClass: T
): T {
  return class extends ControllerClass implements ControllerLifecycle {
    private _isInitialized = false;
    private _isDestroyed = false;
    private _isPaused = false;

    constructor(...args: unknown[]) {
      super(...args);
    }

    onInit(): void {
      if (this._isInitialized) return;
      this._isInitialized = true;
      // Override in subclasses
    }

    onDestroy(): void {
      if (this._isDestroyed) return;
      this._isDestroyed = true;
      // Override in subclasses
    }

    onPause(): void {
      if (this._isPaused) return;
      this._isPaused = true;
      // Override in subclasses
    }

    onResume(): void {
      if (!this._isPaused) return;
      this._isPaused = false;
      // Override in subclasses
    }

    onError(error: Error): void {
      console.error('Controller error:', error);
      // Override in subclasses
    }

    get isInitialized(): boolean {
      return this._isInitialized;
    }

    get isDestroyed(): boolean {
      return this._isDestroyed;
    }

    get isPaused(): boolean {
      return this._isPaused;
    }
  } as T;
}

// Controller monitoring
export class ControllerMonitor {
  private static instance: ControllerMonitor;
  private metrics = new Map<string, unknown>();
  private monitoringInterval = 30000; // 30 seconds
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): ControllerMonitor {
    if (!ControllerMonitor.instance) {
      ControllerMonitor.instance = new ControllerMonitor();
    }
    return ControllerMonitor.instance;
  }

  // Start monitoring
  start(): void {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, this.monitoringInterval);
  }

  // Stop monitoring
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Collect metrics
  private collectMetrics(): void {
    const factory = ControllerFactory.getInstance();
    const stats = factory.getPoolStats();
    
    this.metrics.set('pool_stats', {
      ...stats,
      timestamp: Date.now()
    });
    
    // Log metrics
    console.log('Controller Metrics:', stats);
  }

  // Get metrics
  getMetrics(): unknown {
    return Object.fromEntries(this.metrics);
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Initialize controller lifecycle management
export const initializeControllerLifecycle = () => {
  const monitor = ControllerMonitor.getInstance();
  monitor.start();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    const factory = ControllerFactory.getInstance();
    const lifecycleManager = ControllerLifecycleManager.getInstance();
    
    lifecycleManager.clearAll();
    monitor.stop();
  });
};











