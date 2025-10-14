import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Zap, 
  Memory, 
  Database, 
  Network, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { performanceTester, PerformanceMetrics } from '@/utils/performanceTesting';
import { CacheService } from '@/services/cache/CacheService';

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [cacheStats, setCacheStats] = useState<unknown>(null);

  // Update metrics every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMetrics = performanceTester.getAllMetrics();
      setMetrics(currentMetrics);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update cache stats
  useEffect(() => {
    const updateCacheStats = () => {
      // Get cache stats from all cache instances
      const questionCache = new CacheService();
      const examCache = new CacheService();
      const userCache = new CacheService();
      
      const stats = {
        question: questionCache.getStats(),
        exam: examCache.getStats(),
        user: userCache.getStats()
      };
      
      setCacheStats(stats);
    };

    updateCacheStats();
    const interval = setInterval(updateCacheStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const runPerformanceTest = async () => {
    setIsRunning(true);
    performanceTester.startTest('Full System Test');
    
    // Test memory usage
    performanceTester.testMemoryUsage();
    
    // Test cache performance
    const testCache = new CacheService({ ttl: 60000, maxSize: 100 });
    performanceTester.testCachePerformance(testCache, 100);
    
    // Test bundle analysis
    performanceTester.analyzeBundle();
    
    performanceTester.endTest('Full System Test');
    setIsRunning(false);
  };

  const getLatestMetrics = (): PerformanceMetrics | null => {
    return metrics.length > 0 ? metrics[metrics.length - 1] : null;
  };

  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }): 'good' | 'warning' | 'critical' => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const latest = getLatestMetrics();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor system performance and optimization metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latest ? `${latest.memoryUsage.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="flex items-center space-x-2">
              {latest && getStatusIcon(getPerformanceStatus(latest.memoryUsage, { good: 60, warning: 80 }))}
              <span className="text-xs text-muted-foreground">
                {latest ? `${(latest.memoryUsage * 100).toFixed(0)}MB` : 'No data'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Render Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Render Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latest ? `${latest.renderTime.toFixed(0)}ms` : 'N/A'}
            </div>
            <div className="flex items-center space-x-2">
              {latest && getStatusIcon(getPerformanceStatus(latest.renderTime, { good: 50, warning: 100 }))}
              <span className="text-xs text-muted-foreground">
                {latest ? 'Last render' : 'No data'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cache Hit Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latest ? `${latest.cacheHitRate.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="flex items-center space-x-2">
              {latest && getStatusIcon(getPerformanceStatus(latest.cacheHitRate, { good: 80, warning: 60 }))}
              <span className="text-xs text-muted-foreground">
                {latest ? 'Cache efficiency' : 'No data'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bundle Size */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bundle Size</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latest ? `${latest.bundleSize.toFixed(0)}KB` : 'N/A'}
            </div>
            <div className="flex items-center space-x-2">
              {latest && getStatusIcon(getPerformanceStatus(latest.bundleSize, { good: 1500, warning: 2000 }))}
              <span className="text-xs text-muted-foreground">
                {latest ? `Gzip: ${latest.gzipSize.toFixed(0)}KB` : 'No data'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Test Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Testing
          </CardTitle>
          <CardDescription>
            Run performance tests to measure system metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={runPerformanceTest} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              {isRunning ? 'Running Test...' : 'Run Performance Test'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => performanceTester.clearMetrics()}
            >
              Clear Metrics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      {cacheStats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cache Statistics
            </CardTitle>
            <CardDescription>
              Real-time cache performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(cacheStats).map(([name, stats]: [string, unknown]) => (
                <div key={name} className="space-y-2">
                  <h4 className="font-medium capitalize">{name} Cache</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{stats.size}/{stats.maxSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hit Rate:</span>
                      <span>{stats.hitRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Age:</span>
                      <span>{(stats.averageAge / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance History */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance History
            </CardTitle>
            <CardDescription>
              Historical performance data and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.slice(-5).map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">Test #{metrics.length - index}</div>
                    <div className="text-sm text-gray-600">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">{metric.memoryUsage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600">Memory</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{metric.renderTime.toFixed(0)}ms</div>
                      <div className="text-xs text-gray-600">Render</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{metric.cacheHitRate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600">Cache</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Report */}
      {metrics.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Performance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {performanceTester.generateReport()}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceDashboard;















