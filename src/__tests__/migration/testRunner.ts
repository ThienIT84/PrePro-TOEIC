/**
 * Migration Test Runner
 * Simple test runner để kiểm tra migration
 */

import { runAllMigrationTests } from './MigrationTests';
import { runDashboardMigrationTests } from './DashboardMigrationTests';
import { runServicesMigrationTests } from './ServicesMigrationTests';

/**
 * Run all migration tests
 */
export async function runMigrationTests() {
  console.log('🚀 Running Migration Tests...\n');
  
  const startTime = performance.now();
  
  try {
    // Run all test categories
    const [generalResults, dashboardResults, servicesResults] = await Promise.all([
      runAllMigrationTests(),
      runDashboardMigrationTests(),
      runServicesMigrationTests()
    ]);
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Calculate summary
    const allPassed = generalResults.allPassed && dashboardResults.allPassed && servicesResults.allPassed;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`✅ Overall Status: ${allPassed ? 'PASS' : 'FAIL'}`);
    console.log('='.repeat(60));
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log('General Tests:', generalResults.allPassed ? '✅ PASS' : '❌ FAIL');
    console.log('Dashboard Tests:', dashboardResults.allPassed ? '✅ PASS' : '❌ FAIL');
    console.log('Services Tests:', servicesResults.allPassed ? '✅ PASS' : '❌ FAIL');
    
    // Print recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (allPassed) {
      console.log('✅ All tests passed! Migration is safe to proceed.');
      console.log('✅ No breaking changes detected.');
      console.log('✅ All components are working correctly.');
    } else {
      console.log('❌ Some tests failed. Please review the issues:');
      if (!generalResults.allPassed) {
        console.log('  - Fix general migration issues');
      }
      if (!dashboardResults.allPassed) {
        console.log('  - Fix dashboard migration issues');
      }
      if (!servicesResults.allPassed) {
        console.log('  - Fix services migration issues');
      }
    }
    
    return {
      allPassed,
      generalResults,
      dashboardResults,
      servicesResults,
      totalTime
    };
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    return {
      allPassed: false,
      error: error.message,
      totalTime: performance.now() - startTime
    };
  }
}

/**
 * Quick test for development
 */
export function runQuickTest() {
  console.log('🚀 Running Quick Migration Test...\n');
  
  const startTime = performance.now();
  const results = runAllMigrationTests();
  const endTime = performance.now();
  
  console.log(`\n⏱️  Quick Test Time: ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`✅ Quick Test Status: ${results.allPassed ? 'PASS' : 'FAIL'}`);
  
  return results;
}

// Export for use in other files
export {
  runAllMigrationTests,
  runDashboardMigrationTests,
  runServicesMigrationTests
};
