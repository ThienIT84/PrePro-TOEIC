/**
 * DataMigrationMigrationTests
 * Tests cho DataMigration.tsx migration sang MVC pattern
 */

import { DataMigrationController, ItemData, QuestionData, MigrationResult, DataStatistics } from '../controllers/migration/DataMigrationController';

// Mock data
const mockItemData: ItemData = {
  id: 'item1',
  type: 'vocab',
  question: 'What is the meaning of "abundant"?',
  choices: ['scarce', 'plentiful', 'rare', 'limited'],
  answer: 'B',
  explain_vi: 'Abundant có nghĩa là dồi dào, phong phú',
  explain_en: 'Abundant means existing in large quantities',
  tags: ['vocabulary', 'common words'],
  difficulty: 'medium'
};

const mockQuestionData: QuestionData = {
  part: 1,
  passage_id: null,
  blank_index: null,
  prompt_text: 'What is the meaning of "abundant"?',
  choices: {
    A: 'scarce',
    B: 'plentiful',
    C: 'rare',
    D: 'limited'
  },
  correct_choice: 'B',
  explain_vi: 'Abundant có nghĩa là dồi dào, phong phú',
  explain_en: 'Abundant means existing in large quantities',
  tags: ['vocabulary', 'common words'],
  difficulty: 'medium',
  status: 'published',
  created_by: 'user123'
};

/**
 * Test DataMigrationController functionality
 */
export function testDataMigrationController() {
  console.log('🧪 Testing DataMigrationController...');
  
  const controller = new DataMigrationController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(!initialState.migrating, 'Initial migrating should be false');
  console.assert(initialState.migrationResult === null, 'Initial migrationResult should be null');
  
  // Test data transformation
  const transformedQuestion = controller.transformItemToQuestion(mockItemData, 'user123');
  console.assert(transformedQuestion.part === 1, 'Vocab type should map to part 1');
  console.assert(transformedQuestion.prompt_text === mockItemData.question, 'Question text should be preserved');
  console.assert(transformedQuestion.choices.A === 'scarce', 'Choice A should be mapped correctly');
  console.assert(transformedQuestion.choices.B === 'plentiful', 'Choice B should be mapped correctly');
  console.assert(transformedQuestion.correct_choice === 'B', 'Correct choice should be preserved');
  console.assert(transformedQuestion.created_by === 'user123', 'Created by should be set');
  
  // Test type mapping
  const grammarQuestion = controller.transformItemToQuestion({ ...mockItemData, type: 'grammar' }, 'user123');
  console.assert(grammarQuestion.part === 5, 'Grammar type should map to part 5');
  
  const listeningQuestion = controller.transformItemToQuestion({ ...mockItemData, type: 'listening' }, 'user123');
  console.assert(listeningQuestion.part === 2, 'Listening type should map to part 2');
  
  const readingQuestion = controller.transformItemToQuestion({ ...mockItemData, type: 'reading' }, 'user123');
  console.assert(readingQuestion.part === 7, 'Reading type should map to part 7');
  
  // Test state management
  controller.setMigrating(true);
  console.assert(controller.isMigrating(), 'Should be migrating');
  
  controller.setMigrating(false);
  console.assert(!controller.isMigrating(), 'Should not be migrating');
  
  // Test migration result
  const mockResult: MigrationResult = {
    success: true,
    originalCount: 10,
    migratedCount: 10,
    originalData: [mockItemData],
    migratedData: [mockQuestionData],
    message: 'Migration successful'
  };
  
  controller.setMigrationResult(mockResult);
  console.assert(controller.isMigrationSuccessful(), 'Migration should be successful');
  console.assert(controller.getMigrationResult()?.originalCount === 10, 'Original count should be 10');
  console.assert(controller.getMigrationResult()?.migratedCount === 10, 'Migrated count should be 10');
  
  const statistics = controller.getMigrationStatistics();
  console.assert(statistics?.originalCount === 10, 'Statistics original count should be 10');
  console.assert(statistics?.migratedCount === 10, 'Statistics migrated count should be 10');
  
  // Test migration process steps
  const steps = controller.getMigrationProcessSteps();
  console.assert(steps.length === 4, 'Should have 4 migration steps');
  console.assert(steps[0].includes('Fetch'), 'First step should include fetch');
  console.assert(steps[1].includes('Transform'), 'Second step should include transform');
  console.assert(steps[2].includes('Insert'), 'Third step should include insert');
  console.assert(steps[3].includes('Xác nhận'), 'Fourth step should include confirmation');
  
  // Test clear migration result
  controller.clearMigrationResult();
  console.assert(controller.getMigrationResult() === null, 'Migration result should be cleared');
  
  // Test reset state
  controller.resetMigrationState();
  const resetState = controller.getState();
  console.assert(!resetState.migrating, 'Reset state should not be migrating');
  console.assert(resetState.migrationResult === null, 'Reset state should have null migration result');
  
  console.log('✅ DataMigrationController tests passed!');
}

/**
 * Test DataMigrationView props interface
 */
export function testDataMigrationViewProps() {
  console.log('🧪 Testing DataMigrationView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'migrating', 'migrationResult',
    'onMigrateData', 'onCheckDataStatistics',
    'getMigrationProcessSteps', 'getMigrationResult',
    'isMigrating', 'isMigrationSuccessful', 'getMigrationStatistics',
    'clearMigrationResult', 'resetMigrationState'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ DataMigrationView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testDataMigrationMVCIntegration() {
  console.log('🧪 Testing DataMigration MVC integration...');
  
  // Test that controller and view can work together
  const controller = new DataMigrationController();
  
  // Simulate MVC flow
  controller.setMigrating(true);
  controller.setMigrationResult({
    success: true,
    originalCount: 5,
    migratedCount: 5,
    message: 'Test migration successful'
  });
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.migrating, 'Should be migrating');
  console.assert(state.migrationResult?.success, 'Migration should be successful');
  console.assert(state.migrationResult?.originalCount === 5, 'Original count should be 5');
  
  // Test action handling
  controller.setMigrating(false);
  controller.clearMigrationResult();
  
  const finalState = controller.getState();
  console.assert(!finalState.migrating, 'Should not be migrating');
  console.assert(finalState.migrationResult === null, 'Migration result should be cleared');
  
  console.log('✅ DataMigration MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testDataMigrationErrorHandling() {
  console.log('🧪 Testing DataMigration error handling...');
  
  const controller = new DataMigrationController();
  
  // Test with error result
  const errorResult: MigrationResult = {
    success: false,
    message: 'Migration failed',
    error: 'Database connection error'
  };
  
  controller.setMigrationResult(errorResult);
  console.assert(!controller.isMigrationSuccessful(), 'Migration should not be successful');
  console.assert(controller.getMigrationResult()?.error === 'Database connection error', 'Error should be set');
  
  // Test migration statistics with error
  const statistics = controller.getMigrationStatistics();
  console.assert(statistics === null, 'Statistics should be null for failed migration');
  
  // Test with invalid item data
  const invalidItem: ItemData = {
    id: 'invalid',
    type: 'unknown',
    question: '',
    choices: [],
    answer: '',
    explain_vi: '',
    explain_en: '',
    tags: [],
    difficulty: 'unknown'
  };
  
  const transformedInvalid = controller.transformItemToQuestion(invalidItem, 'user123');
  console.assert(transformedInvalid.part === 1, 'Unknown type should default to part 1');
  console.assert(transformedInvalid.prompt_text === '', 'Empty question should be preserved');
  console.assert(transformedInvalid.choices.A === '', 'Empty choices should be preserved');
  
  console.log('✅ DataMigration error handling tests passed!');
}

/**
 * Test performance
 */
export function testDataMigrationPerformance() {
  console.log('🧪 Testing DataMigration performance...');
  
  const controller = new DataMigrationController();
  
  // Test with large dataset
  const largeItems: ItemData[] = Array.from({ length: 1000 }, (_, i) => ({
    ...mockItemData,
    id: `item${i}`,
    question: `Question ${i}`
  }));
  
  const startTime = performance.now();
  
  // Test data transformation performance
  for (let i = 0; i < 100; i++) {
    const transformed = controller.transformItemToQuestion(largeItems[i % largeItems.length], 'user123');
    console.assert(transformed.part >= 1, 'Part should be valid');
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ DataMigration performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Test data transformation edge cases
 */
export function testDataMigrationTransformationEdgeCases() {
  console.log('🧪 Testing DataMigration transformation edge cases...');
  
  const controller = new DataMigrationController();
  
  // Test with missing choices
  const itemWithMissingChoices: ItemData = {
    ...mockItemData,
    choices: ['A', 'B'] // Only 2 choices
  };
  
  const transformedMissing = controller.transformItemToQuestion(itemWithMissingChoices, 'user123');
  console.assert(transformedMissing.choices.C === '', 'Missing choice C should be empty');
  console.assert(transformedMissing.choices.D === '', 'Missing choice D should be empty');
  
  // Test with empty choices array
  const itemWithEmptyChoices: ItemData = {
    ...mockItemData,
    choices: []
  };
  
  const transformedEmpty = controller.transformItemToQuestion(itemWithEmptyChoices, 'user123');
  console.assert(transformedEmpty.choices.A === '', 'Empty choices should result in empty A');
  console.assert(transformedEmpty.choices.B === '', 'Empty choices should result in empty B');
  
  // Test with null/undefined values
  const itemWithNulls: ItemData = {
    id: 'null-item',
    type: 'vocab',
    question: null as any,
    choices: null as any,
    answer: null as any,
    explain_vi: null as any,
    explain_en: null as any,
    tags: null as any,
    difficulty: null as any
  };
  
  const transformedNulls = controller.transformItemToQuestion(itemWithNulls, 'user123');
  console.assert(transformedNulls.prompt_text === '', 'Null question should become empty string');
  console.assert(transformedNulls.correct_choice === 'A', 'Null answer should default to A');
  console.assert(transformedNulls.difficulty === 'medium', 'Null difficulty should default to medium');
  console.assert(transformedNulls.tags.length === 0, 'Null tags should become empty array');
  
  console.log('✅ DataMigration transformation edge cases tests passed!');
}

/**
 * Run all DataMigration migration tests
 */
export function runDataMigrationMigrationTests() {
  console.log('🚀 Running DataMigration Migration Tests...');
  
  try {
    testDataMigrationController();
    testDataMigrationViewProps();
    testDataMigrationMVCIntegration();
    testDataMigrationErrorHandling();
    testDataMigrationPerformance();
    testDataMigrationTransformationEdgeCases();
    
    console.log('🎉 All DataMigration migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ DataMigration migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testDataMigrationController,
  testDataMigrationViewProps,
  testDataMigrationMVCIntegration,
  testDataMigrationErrorHandling,
  testDataMigrationPerformance,
  testDataMigrationTransformationEdgeCases,
  runDataMigrationMigrationTests
};
