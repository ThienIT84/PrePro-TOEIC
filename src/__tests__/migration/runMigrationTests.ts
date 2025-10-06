/**
 * Migration Test Runner
 * Chạy tất cả tests để đảm bảo không có breaking changes
 */

import { runAllMigrationTests } from './MigrationTests';
import { runDashboardMigrationTests } from './DashboardMigrationTests';
import { runServicesMigrationTests } from './ServicesMigrationTests';

/**
 * Test Results Summary
 */
interface TestResults {
  overall: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  categories: {
    models: boolean;
    controllers: boolean;
    services: boolean;
    globalState: boolean;
    componentIntegration: boolean;
    typeSafety: boolean;
    backwardCompatibility: boolean;
    performance: boolean;
    dashboard: boolean;
    services: boolean;
  };
  details: {
    models: any;
    dashboard: any;
    services: any;
  };
}

/**
 * Run comprehensive migration tests
 */
export async function runComprehensiveMigrationTests(): Promise<TestResults> {
  console.log('🚀 Starting Comprehensive Migration Tests...\n');
  
  const startTime = performance.now();
  
  // Run all test categories
  const [generalResults, dashboardResults, servicesResults] = await Promise.all([
    runAllMigrationTests(),
    runDashboardMigrationTests(),
    runServicesMigrationTests()
  ]);
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  // Calculate summary
  const totalTests = 3; // General, Dashboard, Services
  const passedTests = [generalResults.allPassed, dashboardResults.allPassed, servicesResults.allPassed]
    .filter(Boolean).length;
  const failedTests = totalTests - passedTests;
  
  const results: TestResults = {
    overall: passedTests === totalTests,
    totalTests,
    passedTests,
    failedTests,
    categories: {
      models: generalResults.results.models,
      controllers: generalResults.results.controllers,
      services: generalResults.results.services,
      globalState: generalResults.results.globalState,
      componentIntegration: generalResults.results.componentIntegration,
      typeSafety: generalResults.results.typeSafety,
      backwardCompatibility: generalResults.results.backwardCompatibility,
      performance: generalResults.results.performance,
      dashboard: dashboardResults.allPassed,
      services: servicesResults.allPassed
    },
    details: {
      models: generalResults.results,
      dashboard: dashboardResults.results,
      services: servicesResults.results
    }
  };
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 MIGRATION TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`⏱️  Total Time: ${totalTime.toFixed(2)}ms`);
  console.log(`📈 Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests Failed: ${failedTests}/${totalTests}`);
  console.log(`✅ Overall Status: ${results.overall ? 'PASS' : 'FAIL'}`);
  console.log('='.repeat(80));
  
  console.log('\n📋 DETAILED RESULTS:');
  console.log('General Tests:', generalResults.allPassed ? '✅ PASS' : '❌ FAIL');
  console.log('Dashboard Tests:', dashboardResults.allPassed ? '✅ PASS' : '❌ FAIL');
  console.log('Services Tests:', servicesResults.allPassed ? '✅ PASS' : '❌ FAIL');
  
  console.log('\n🔍 CATEGORY BREAKDOWN:');
  Object.entries(results.categories).forEach(([category, passed]) => {
    console.log(`${category}:`, passed ? '✅ PASS' : '❌ FAIL');
  });
  
  // Print recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (results.overall) {
    console.log('✅ All tests passed! Migration is safe to proceed.');
    console.log('✅ No breaking changes detected.');
    console.log('✅ All components are working correctly.');
    console.log('✅ Performance is within acceptable limits.');
  } else {
    console.log('❌ Some tests failed. Please review the issues:');
    if (!results.categories.models) {
      console.log('  - Fix model-related issues');
    }
    if (!results.categories.controllers) {
      console.log('  - Fix controller-related issues');
    }
    if (!results.categories.services) {
      console.log('  - Fix service-related issues');
    }
    if (!results.categories.dashboard) {
      console.log('  - Fix dashboard migration issues');
    }
    if (!results.categories.backwardCompatibility) {
      console.log('  - Fix backward compatibility issues');
    }
  }
  
  return results;
}

/**
 * Quick test runner for development
 */
export function runQuickMigrationTests() {
  console.log('🚀 Running Quick Migration Tests...\n');
  
  const startTime = performance.now();
  
  // Run basic tests
  const generalResults = runAllMigrationTests();
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  console.log(`\n⏱️  Quick Test Time: ${totalTime.toFixed(2)}ms`);
  console.log(`✅ Quick Test Status: ${generalResults.allPassed ? 'PASS' : 'FAIL'}`);
  
  return generalResults;
}

/**
 * Test specific component
 */
export function testSpecificComponent(component: 'models' | 'controllers' | 'services' | 'dashboard' | 'all') {
  console.log(`🧪 Testing ${component}...\n`);
  
  switch (component) {
    case 'models':
      return runAllMigrationTests();
    case 'controllers':
      return runDashboardMigrationTests();
    case 'services':
      return runServicesMigrationTests();
    case 'dashboard':
      return runDashboardMigrationTests();
    case 'all':
    default:
      return runComprehensiveMigrationTests();
  }
}

/**
 * Generate test report
 */
export function generateTestReport(results: TestResults): string {
  const report = `
# Migration Test Report

## Summary
- **Overall Status**: ${results.overall ? '✅ PASS' : '❌ FAIL'}
- **Tests Passed**: ${results.passedTests}/${results.totalTests}
- **Tests Failed**: ${results.failedTests}/${results.totalTests}

## Category Results
${Object.entries(results.categories).map(([category, passed]) => 
  `- **${category}**: ${passed ? '✅ PASS' : '❌ FAIL'}`
).join('\n')}

## Details
### General Tests
${Object.entries(results.details.models).map(([test, passed]) => 
  `- **${test}**: ${passed ? '✅ PASS' : '❌ FAIL'}`
).join('\n')}

### Dashboard Tests
${Object.entries(results.details.dashboard).map(([test, passed]) => 
  `- **${test}**: ${passed ? '✅ PASS' : '❌ FAIL'}`
).join('\n')}

### Services Tests
${Object.entries(results.details.services).map(([test, passed]) => 
  `- **${test}**: ${passed ? '✅ PASS' : '❌ FAIL'}`
).join('\n')}

## Recommendations
${results.overall ? 
  '✅ All tests passed! Migration is safe to proceed.' : 
  '❌ Some tests failed. Please review and fix the issues before proceeding.'
}
  `;
  
  return report;
}

// Export for use in other files
export {
  runAllMigrationTests,
  runDashboardMigrationTests,
  runServicesMigrationTests
};
