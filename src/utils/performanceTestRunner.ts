// Performance Test Runner for MVC Components

import { performanceTester } from './performanceTesting';
import { CacheService } from '@/services/cache/CacheService';
import { MemoryOptimizer } from './memoryOptimization';
import { ControllerFactory } from '@/controllers/ControllerLifecycle';

export class PerformanceTestRunner {
  private static instance: PerformanceTestRunner;
  private testResults: unknown[] = [];

  static getInstance(): PerformanceTestRunner {
    if (!PerformanceTestRunner.instance) {
      PerformanceTestRunner.instance = new PerformanceTestRunner();
    }
    return PerformanceTestRunner.instance;
  }

  // Run comprehensive performance tests
  async runComprehensiveTests(): Promise<void> {
    console.log('🧪 Starting Comprehensive Performance Tests...');
    
    try {
      // Test 1: Memory Usage
      await this.testMemoryUsage();
      
      // Test 2: Cache Performance
      await this.testCachePerformance();
      
      // Test 3: Controller Performance
      await this.testControllerPerformance();
      
      // Test 4: Component Rendering
      await this.testComponentRendering();
      
      // Test 5: Bundle Analysis
      await this.testBundleAnalysis();
      
      // Test 6: State Management
      await this.testStateManagement();
      
      console.log('✅ All performance tests completed successfully');
      
    } catch (error) {
      console.error('❌ Performance tests failed:', error);
    }
  }

  // Test 1: Memory Usage
  private async testMemoryUsage(): Promise<void> {
    console.log('📊 Testing Memory Usage...');
    
    performanceTester.startTest('Memory Usage Test');
    
    // Test initial memory
    const initialMemory = performanceTester.testMemoryUsage();
    
    // Create multiple components to test memory growth
    const components = [];
    for (let i = 0; i < 100; i++) {
      components.push({
        id: `test-component-${i}`,
        data: new Array(1000).fill(0).map((_, j) => `data-${j}`)
      });
    }
    
    // Test memory after component creation
    const afterCreationMemory = performanceTester.testMemoryUsage();
    
    // Cleanup components
    components.length = 0;
    
    // Force garbage collection
    if ((window as unknown).gc) {
      (window as unknown).gc();
    }
    
    // Test memory after cleanup
    const afterCleanupMemory = performanceTester.testMemoryUsage();
    
    const memoryGrowth = afterCreationMemory.percentage - initialMemory.percentage;
    const memoryRecovery = afterCreationMemory.percentage - afterCleanupMemory.percentage;
    
    console.log(`📊 Memory Growth: ${memoryGrowth.toFixed(2)}%`);
    console.log(`📊 Memory Recovery: ${memoryRecovery.toFixed(2)}%`);
    
    performanceTester.endTest('Memory Usage Test');
  }

  // Test 2: Cache Performance
  private async testCachePerformance(): Promise<void> {
    console.log('📊 Testing Cache Performance...');
    
    performanceTester.startTest('Cache Performance Test');
    
    // Test different cache configurations
    const cacheConfigs = [
      { ttl: 60000, maxSize: 100, strategy: 'lru' as const },
      { ttl: 300000, maxSize: 500, strategy: 'fifo' as const },
      { ttl: 180000, maxSize: 200, strategy: 'lfu' as const }
    ];
    
    for (const config of cacheConfigs) {
      console.log(`Testing cache config:`, config);
      
      const cache = new CacheService(config);
      const result = performanceTester.testCachePerformance(cache, 1000);
      
      console.log(`Cache ${config.strategy} results:`, result);
    }
    
    performanceTester.endTest('Cache Performance Test');
  }

  // Test 3: Controller Performance
  private async testControllerPerformance(): Promise<void> {
    console.log('📊 Testing Controller Performance...');
    
    performanceTester.startTest('Controller Performance Test');
    
    const factory = ControllerFactory.getInstance();
    
    // Test controller creation time
    const startTime = performance.now();
    
    // Create multiple controllers
    const controllers = [];
    for (let i = 0; i < 50; i++) {
      const controller = factory.createController(
        class TestController {
          constructor() {
            this.id = `test-controller-${i}`;
          }
        },
        `test-controller-${i}`
      );
      controllers.push(controller);
    }
    
    const creationTime = performance.now() - startTime;
    console.log(`📊 Controller creation time: ${creationTime.toFixed(2)}ms`);
    
    // Test controller access time
    const accessStartTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      const randomIndex = Math.floor(Math.random() * controllers.length);
      const controller = factory.getController(`test-controller-${randomIndex}`);
    }
    
    const accessTime = performance.now() - accessStartTime;
    console.log(`📊 Controller access time: ${accessTime.toFixed(2)}ms`);
    
    // Cleanup controllers
    controllers.forEach((_, index) => {
      factory.destroyController(`test-controller-${index}`);
    });
    
    performanceTester.endTest('Controller Performance Test');
  }

  // Test 4: Component Rendering
  private async testComponentRendering(): Promise<void> {
    console.log('📊 Testing Component Rendering...');
    
    performanceTester.startTest('Component Rendering Test');
    
    // Test component mount time
    const mountTime = performanceTester.testComponentMount('TestComponent', () => {
      // Simulate component mounting
      const element = document.createElement('div');
      element.innerHTML = '<div>Test Component</div>';
      document.body.appendChild(element);
      document.body.removeChild(element);
    });
    
    console.log(`📊 Component mount time: ${mountTime.toFixed(2)}ms`);
    
    // Test multiple component renders
    const renderStartTime = performance.now();
    
    for (let i = 0; i < 100; i++) {
      const element = document.createElement('div');
      element.innerHTML = `<div>Test Component ${i}</div>`;
      document.body.appendChild(element);
      document.body.removeChild(element);
    }
    
    const renderTime = performance.now() - renderStartTime;
    console.log(`📊 Multiple component render time: ${renderTime.toFixed(2)}ms`);
    
    performanceTester.endTest('Component Rendering Test');
  }

  // Test 5: Bundle Analysis
  private async testBundleAnalysis(): Promise<void> {
    console.log('📊 Testing Bundle Analysis...');
    
    performanceTester.startTest('Bundle Analysis Test');
    
    const bundleAnalysis = performanceTester.analyzeBundle();
    
    console.log('📊 Bundle Analysis Results:', bundleAnalysis);
    
    // Check if bundle size is within acceptable limits
    if (bundleAnalysis.totalSize > 2000) {
      console.warn('⚠️ Bundle size is large, consider code splitting');
    }
    
    if (bundleAnalysis.gzipSize > 600) {
      console.warn('⚠️ Gzip size is large, consider optimization');
    }
    
    performanceTester.endTest('Bundle Analysis Test');
  }

  // Test 6: State Management
  private async testStateManagement(): Promise<void> {
    console.log('📊 Testing State Management...');
    
    performanceTester.startTest('State Management Test');
    
    // Test state updates
    const stateUpdateStartTime = performance.now();
    
    let state = { count: 0, items: [] };
    
    for (let i = 0; i < 1000; i++) {
      state = {
        ...state,
        count: state.count + 1,
        items: [...state.items, { id: i, value: `item-${i}` }]
      };
    }
    
    const stateUpdateTime = performance.now() - stateUpdateStartTime;
    console.log(`📊 State update time: ${stateUpdateTime.toFixed(2)}ms`);
    
    // Test state serialization
    const serializationStartTime = performance.now();
    
    const serializedState = JSON.stringify(state);
    const deserializedState = JSON.parse(serializedState);
    
    const serializationTime = performance.now() - serializationStartTime;
    console.log(`📊 State serialization time: ${serializationTime.toFixed(2)}ms`);
    
    performanceTester.endTest('State Management Test');
  }

  // Get test results
  getTestResults(): unknown[] {
    return this.testResults;
  }

  // Clear test results
  clearTestResults(): void {
    this.testResults = [];
  }

  // Generate performance report
  generatePerformanceReport(): string {
    const metrics = performanceTester.getAllMetrics();
    
    if (metrics.length === 0) {
      return 'No performance data available. Run tests first.';
    }
    
    const latest = metrics[metrics.length - 1];
    const average = this.calculateAverageMetrics(metrics);
    
    return `
# 📊 Performance Test Report

## Test Summary
- **Total Tests Run**: ${metrics.length}
- **Latest Test Time**: ${new Date().toLocaleTimeString()}

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

## Performance Analysis
${this.analyzePerformance(latest, average)}

## Recommendations
${this.generateRecommendations(latest)}
    `;
  }

  // Calculate average metrics
  private calculateAverageMetrics(metrics: unknown[]): unknown {
    if (metrics.length === 0) return {};
    
    const sum = metrics.reduce((acc, metric) => ({
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      renderTime: acc.renderTime + metric.renderTime,
      cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
      bundleSize: acc.bundleSize + metric.bundleSize,
      gzipSize: acc.gzipSize + metric.gzipSize
    }), { memoryUsage: 0, renderTime: 0, cacheHitRate: 0, bundleSize: 0, gzipSize: 0 });
    
    const count = metrics.length;
    return {
      memoryUsage: sum.memoryUsage / count,
      renderTime: sum.renderTime / count,
      cacheHitRate: sum.cacheHitRate / count,
      bundleSize: sum.bundleSize / count,
      gzipSize: sum.gzipSize / count
    };
  }

  // Analyze performance
  private analyzePerformance(latest: unknown, average: unknown): string {
    const analysis: string[] = [];
    
    if (latest.memoryUsage > 80) {
      analysis.push('- ⚠️ High memory usage detected');
    }
    
    if (latest.renderTime > 100) {
      analysis.push('- ⚠️ Slow rendering performance');
    }
    
    if (latest.cacheHitRate < 70) {
      analysis.push('- ⚠️ Low cache hit rate');
    }
    
    if (latest.bundleSize > 2000) {
      analysis.push('- ⚠️ Large bundle size');
    }
    
    if (analysis.length === 0) {
      analysis.push('- ✅ Performance metrics look good');
    }
    
    return analysis.join('\n');
  }

  // Generate recommendations
  private generateRecommendations(latest: unknown): string {
    const recommendations: string[] = [];
    
    if (latest.memoryUsage > 80) {
      recommendations.push('- Implement memory cleanup mechanisms');
      recommendations.push('- Use React.memo for expensive components');
    }
    
    if (latest.renderTime > 100) {
      recommendations.push('- Optimize component rendering');
      recommendations.push('- Use useMemo and useCallback hooks');
    }
    
    if (latest.cacheHitRate < 70) {
      recommendations.push('- Improve cache strategy');
      recommendations.push('- Increase cache size or TTL');
    }
    
    if (latest.bundleSize > 2000) {
      recommendations.push('- Implement code splitting');
      recommendations.push('- Use dynamic imports for large components');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- No immediate optimizations needed');
    }
    
    return recommendations.join('\n');
  }
}

// Export singleton instance
export const performanceTestRunner = PerformanceTestRunner.getInstance();





