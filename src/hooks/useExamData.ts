import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch and cache exam set data
 */
export const useExamSet = (examSetId: string) => {
  return useQuery({
    queryKey: ['examSet', examSetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('id', examSetId)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in memory for 30 minutes
  });
};

/**
 * Hook to fetch and cache questions
 */
export const useExamQuestions = (
  selectedParts?: number[],
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['examQuestions', selectedParts],
    queryFn: async () => {
      let query = supabase
        .from('questions')
        .select(`
          *,
          passages (*)
        `)
        .eq('status', 'published');

      if (selectedParts && selectedParts.length > 0) {
        query = query.in('part', selectedParts);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No questions found');
      }
      
      return data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes (questions don't change often)
    gcTime: 60 * 60 * 1000, // Keep in memory for 1 hour
    enabled, // Only fetch when enabled
  });
};

/**
 * Hook to prefetch exam data for faster loading
 */
export const usePrefetchExamData = () => {
  const queryClient = useQueryClient();
  
  const prefetchExam = async (examSetId: string, selectedParts?: number[]) => {
    // Prefetch exam set
    await queryClient.prefetchQuery({
      queryKey: ['examSet', examSetId],
      queryFn: async () => {
        const { data } = await supabase
          .from('exam_sets')
          .select('*')
          .eq('id', examSetId)
          .single();
        return data;
      },
    });
    
    // Prefetch questions
    await queryClient.prefetchQuery({
      queryKey: ['examQuestions', selectedParts],
      queryFn: async () => {
        let query = supabase
          .from('questions')
          .select('*, passages (*)')
          .eq('status', 'published');
        
        if (selectedParts && selectedParts.length > 0) {
          query = query.in('part', selectedParts);
        }
        
        const { data } = await query;
        return data;
      },
    });
  };
  
  return { prefetchExam };
};
