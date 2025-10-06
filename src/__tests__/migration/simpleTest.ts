/**
 * Simple Migration Test
 * Chạy tests cơ bản để kiểm tra migration
 */

// Import test functions
import { runAllMigrationTests } from './MigrationTests';
import { runDashboardMigrationTests } from './DashboardMigrationTests';
import { runServicesMigrationTests } from './ServicesMigrationTests';

/**
 * Run simple migration test
 */
export function runSimpleMigrationTest() {
  console.log('🚀 Running Simple Migration Test...\n');
  
  const startTime = performance.now();
  
  try {
    // Run basic tests
    console.log('1. Testing Models...');
    const modelResults = runAllMigrationTests();
    console.log('   Models:', modelResults.allPassed ? '✅ PASS' : '❌ FAIL');
    
    console.log('\n2. Testing Dashboard...');
    const dashboardResults = runDashboardMigrationTests();
    console.log('   Dashboard:', dashboardResults.allPassed ? '✅ PASS' : '❌ FAIL');
    
    console.log('\n3. Testing Services...');
    const servicesResults = runServicesMigrationTests();
    console.log('   Services:', servicesResults.allPassed ? '✅ PASS' : '❌ FAIL');
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Calculate overall result
    const allPassed = modelResults.allPassed && dashboardResults.allPassed && servicesResults.allPassed;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`⏱️  Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`✅ Overall Status: ${allPassed ? 'PASS' : 'FAIL'}`);
    console.log('='.repeat(50));
    
    if (allPassed) {
      console.log('\n🎉 All tests passed! Migration is safe to proceed.');
      console.log('✅ No breaking changes detected.');
      console.log('✅ All components are working correctly.');
    } else {
      console.log('\n❌ Some tests failed. Please review the issues:');
      if (!modelResults.allPassed) {
        console.log('  - Fix model-related issues');
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
      modelResults,
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

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runSimpleMigrationTest();
}
