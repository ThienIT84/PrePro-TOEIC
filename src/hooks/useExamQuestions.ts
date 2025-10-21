import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toeicQuestionGenerator, ExamConfig, TOEICQuestion } from '@/services/toeicQuestionGenerator';

/**
 * Hook to fetch and cache exam questions with React Query
 * This prevents unnecessary re-fetching and improves performance
 */
export const useExamQuestions = (config: ExamConfig, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['examQuestions', config.examSetId, config.parts, config.type],
    queryFn: async () => {
      console.log('🔄 Fetching exam questions with config:', config);
      const questions = await toeicQuestionGenerator.generateQuestions(config);
      console.log(`✅ Fetched ${questions.length} questions`);
      return questions;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in memory for 30 minutes
    enabled, // Only fetch when enabled
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
};

/**
 * Hook to prefetch exam questions for faster loading
 * Call this when user is on exam selection page
 */
export const usePrefetchExamQuestions = () => {
  const queryClient = useQueryClient();

  const prefetchQuestions = async (config: ExamConfig) => {
    console.log('🔮 Prefetching exam questions...');
    await queryClient.prefetchQuery({
      queryKey: ['examQuestions', config.examSetId, config.parts, config.type],
      queryFn: async () => {
        const questions = await toeicQuestionGenerator.generateQuestions(config);
        console.log(`✅ Prefetched ${questions.length} questions`);
        return questions;
      },
      staleTime: 10 * 60 * 1000,
    });
  };

  return { prefetchQuestions };
};

/**
 * Hook to invalidate and refetch exam questions cache
 */
export const useInvalidateExamQuestions = () => {
  const queryClient = useQueryClient();

  const invalidateQuestions = (examSetId?: string) => {
    if (examSetId) {
      // Invalidate specific exam set
      queryClient.invalidateQueries({
        queryKey: ['examQuestions', examSetId],
      });
    } else {
      // Invalidate all exam questions
      queryClient.invalidateQueries({
        queryKey: ['examQuestions'],
      });
    }
  };

  return { invalidateQuestions };
};


