/**
 * Migration Test Script
 * Chạy tests để kiểm tra migration
 */

const { runComprehensiveMigrationTests, runQuickMigrationTests } = require('./runMigrationTests');

/**
 * Main test function
 */
async function main() {
  console.log('🚀 Starting Migration Tests...\n');
  
  try {
    // Run comprehensive tests
    const results = await runComprehensiveMigrationTests();
    
    // Exit with appropriate code
    if (results.overall) {
      console.log('\n✅ All tests passed! Migration is safe.');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Please fix issues before proceeding.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  runComprehensiveMigrationTests,
  runQuickMigrationTests,
  main
};
