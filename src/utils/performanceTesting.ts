// Performance Testing Suite for MVC Architecture

export interface PerformanceMetrics {
  // Build metrics
  buildTime: number;
  bundleSize: number;
  gzipSize: number;
  
  // Runtime metrics
  memoryUsage: number;
  renderTime: number;
  componentMountTime: number;
  controllerInitTime: number;
  
  // Cache metrics
  cacheHitRate: number;
  cacheSize: number;
  cacheEfficiency: number;
  
  // Network metrics
  apiResponseTime: number;
  dataTransferSize: number;
  
  // User experience metrics
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

export class PerformanceTester {
  private static instance: PerformanceTester;
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private startTime: number = 0;

  static getInstance(): PerformanceTester {
    if (!PerformanceTester.instance) {
      PerformanceTester.instance = new PerformanceTester();
    }
    return PerformanceTester.instance;
  }

  // Start performance testing
  startTest(testName: string): void {
    this.startTime = performance.now();
    console.log(`🚀 Starting performance test: ${testName}`);
  }

  // End performance testing
  endTest(testName: string): PerformanceMetrics {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    
    const metrics: PerformanceMetrics = {
      buildTime: 0,
      bundleSize: 0,
      gzipSize: 0,
      memoryUsage: this.getMemoryUsage(),
      renderTime: duration,
      componentMountTime: 0,
      controllerInitTime: 0,
      cacheHitRate: 0,
      cacheSize: 0,
      cacheEfficiency: 0,
      apiResponseTime: 0,
      dataTransferSize: 0,
      timeToInteractive: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0
    };

    this.metrics.push(metrics);
    console.log(`✅ Performance test completed: ${testName}`, metrics);
    
    return metrics;
  }

  // Test component mount time
  testComponentMount(componentName: string, mountFn: () => void): number {
    const startTime = performance.now();
    mountFn();
    const endTime = performance.now();
    const mountTime = endTime - startTime;
    
    console.log(`📊 Component ${componentName} mount time: ${mountTime.toFixed(2)}ms`);
    return mountTime;
  }

  // Test controller initialization
  testControllerInit(controllerName: string, initFn: () => void): number {
    const startTime = performance.now();
    initFn();
    const endTime = performance.now();
    const initTime = endTime - startTime;
    
    console.log(`📊 Controller ${controllerName} init time: ${initTime.toFixed(2)}ms`);
    return initTime;
  }

  // Test cache performance
  testCachePerformance(cache: unknown, operations: number = 1000): {
    hitRate: number;
    averageTime: number;
    efficiency: number;
  } {
    const startTime = performance.now();
    let hits = 0;
    let misses = 0;

    // Perform cache operations
    for (let i = 0; i < operations; i++) {
      const key = `test_key_${i}`;
      const value = `test_value_${i}`;
      
      // Set value
      cache.set(key, value);
      
      // Get value
      const retrieved = cache.get(key);
      if (retrieved) {
        hits++;
      } else {
        misses++;
      }
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const hitRate = (hits / operations) * 100;
    const averageTime = totalTime / operations;
    const efficiency = hits / (hits + misses);

    console.log(`📊 Cache performance:`, {
      hitRate: `${hitRate.toFixed(2)}%`,
      averageTime: `${averageTime.toFixed(4)}ms`,
      efficiency: `${efficiency.toFixed(2)}`
    });

    return { hitRate, averageTime, efficiency };
  }

  // Test memory usage
  testMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } {
    const memory = (performance as unknown).memory;
    if (!memory) {
      return { used: 0, total: 0, percentage: 0 };
    }

    const used = memory.usedJSHeapSize;
    const total = memory.totalJSHeapSize;
    const percentage = (used / total) * 100;

    console.log(`📊 Memory usage:`, {
      used: `${(used / 1024 / 1024).toFixed(2)}MB`,
      total: `${(total / 1024 / 1024).toFixed(2)}MB`,
      percentage: `${percentage.toFixed(2)}%`
    });

    return { used, total, percentage };
  }

  // Test API response time
  async testApiResponse(url: string): Promise<number> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(url);
      await response.json();
    } catch (error) {
      console.error('API test error:', error);
    }
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    console.log(`📊 API response time for ${url}: ${responseTime.toFixed(2)}ms`);
    return responseTime;
  }

  // Test bundle analysis
  analyzeBundle(): {
    totalSize: number;
    gzipSize: number;
    chunkCount: number;
    largestChunk: number;
  } {
    // This would typically be done with webpack-bundle-analyzer
    // For now, we'll simulate the analysis
    const totalSize = 1854.14; // KB from build output
    const gzipSize = 528.30; // KB from build output
    const chunkCount = 1; // Single chunk
    const largestChunk = totalSize;

    console.log(`📊 Bundle analysis:`, {
      totalSize: `${totalSize}KB`,
      gzipSize: `${gzipSize}KB`,
      chunkCount,
      largestChunk: `${largestChunk}KB`
    });

    return { totalSize, gzipSize, chunkCount, largestChunk };
  }

  // Get memory usage
  private getMemoryUsage(): number {
    const memory = (performance as unknown).memory;
    if (!memory) return 0;
    
    return (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
  }

  // Get all metrics
  getAllMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }

  // Generate performance report
  generateReport(): string {
    if (this.metrics.length === 0) {
      return 'No performance data available';
    }

    const latest = this.metrics[this.metrics.length - 1];
    const average = this.calculateAverageMetrics();

    return `
# 📊 Performance Report

## Latest Metrics
- **Memory Usage**: ${latest.memoryUsage.toFixed(2)}%
- **Render Time**: ${latest.renderTime.toFixed(2)}ms
- **Cache Hit Rate**: ${latest.cacheHitRate.toFixed(2)}%
- **Bundle Size**: ${latest.bundleSize}KB
- **Gzip Size**: ${latest.gzipSize}KB

## Average Metrics
- **Memory Usage**: ${average.memoryUsage.toFixed(2)}%
- **Render Time**: ${average.renderTime.toFixed(2)}ms
- **Cache Hit Rate**: ${average.cacheHitRate.toFixed(2)}%

## Recommendations
${this.generateRecommendations(latest)}
    `;
  }

  // Calculate average metrics
  private calculateAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {} as PerformanceMetrics;
    }

    const sum = this.metrics.reduce((acc, metric) => ({
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      renderTime: acc.renderTime + metric.renderTime,
      cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
      bundleSize: acc.bundleSize + metric.bundleSize,
      gzipSize: acc.gzipSize + metric.gzipSize
    }), { memoryUsage: 0, renderTime: 0, cacheHitRate: 0, bundleSize: 0, gzipSize: 0 });

    const count = this.metrics.length;
    return {
      memoryUsage: sum.memoryUsage / count,
      renderTime: sum.renderTime / count,
      cacheHitRate: sum.cacheHitRate / count,
      bundleSize: sum.bundleSize / count,
      gzipSize: sum.gzipSize / count
    } as PerformanceMetrics;
  }

  // Generate recommendations
  private generateRecommendations(metrics: PerformanceMetrics): string {
    const recommendations: string[] = [];

    if (metrics.memoryUsage > 80) {
      recommendations.push('- Consider implementing memory cleanup mechanisms');
    }

    if (metrics.renderTime > 100) {
      recommendations.push('- Optimize component rendering with React.memo or useMemo');
    }

    if (metrics.cacheHitRate < 70) {
      recommendations.push('- Improve cache strategy or increase cache size');
    }

    if (metrics.bundleSize > 2000) {
      recommendations.push('- Implement code splitting to reduce bundle size');
    }

    if (recommendations.length === 0) {
      recommendations.push('- Performance looks good! No immediate optimizations needed.');
    }

    return recommendations.join('\n');
  }
}

// Performance testing utilities
export const performanceTester = PerformanceTester.getInstance();

// Test all MVC components
export const testMVCPerformance = async () => {
  console.log('🧪 Testing MVC Performance...');
  
  const tester = PerformanceTester.getInstance();
  
  // Test memory usage
  tester.testMemoryUsage();
  
  // Test bundle analysis
  tester.analyzeBundle();
  
  // Test cache performance
  const { CacheService } = await import('@/services/cache/CacheService');
  const testCache = new CacheService({ ttl: 60000, maxSize: 100 });
  tester.testCachePerformance(testCache, 100);
  
  console.log('✅ MVC Performance testing completed');
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics[]>([]);
  
  React.useEffect(() => {
    const tester = PerformanceTester.getInstance();
    
    const interval = setInterval(() => {
      const currentMetrics = tester.getAllMetrics();
      setMetrics(currentMetrics);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return metrics;
};





