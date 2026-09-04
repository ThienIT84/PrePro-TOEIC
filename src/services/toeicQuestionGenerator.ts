/**
 * TOEIC Question Generator
 * @deprecated Use QuestionGenerationService from '@/services/domains/question/QuestionGenerationService' instead.
 * Re-exported here for backward compatibility.
 */

export * from '@/services/domains/question/QuestionGenerationService';
export { 
  QuestionGenerationService as TOEICQuestionGenerator,
  questionGenerationService as toeicQuestionGenerator 
} from '@/services/domains/question/QuestionGenerationService';