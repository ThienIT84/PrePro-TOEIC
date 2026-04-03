import { supabase } from '@/integrations/supabase/client';

export interface ReviewData {
  user_id: string;
  item_id: string;
  repetitions: number;
  interval_days: number;
  ease_factor: number;
  due_at: string;
}

/**
 * Tạo reviews mới cho các câu hỏi đã làm
 */
export const createReviewsForQuestions = async (
  userId: string, 
  questionIds: string[], 
  isCorrect: boolean = false
): Promise<void> => {
  try {
    const reviews: ReviewData[] = questionIds.map(questionId => {
      const now = new Date();
      const dueAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 ngày sau
      
      return {
        user_id: userId,
        item_id: questionId,
        repetitions: 0,
        interval_days: 1,
        ease_factor: isCorrect ? 2.6 : 2.3, // Ease factor thấp hơn nếu sai
        due_at: dueAt.toISOString()
      };
    });

    const { error } = await supabase
      .from('reviews')
      .upsert(reviews, { 
        onConflict: 'user_id,item_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error creating reviews:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in createReviewsForQuestions:', error);
    throw error;
  }
};

/**
 * Cập nhật review sau khi user đánh giá
 */
export const updateReview = async (
  reviewId: string,
  quality: 'again' | 'hard' | 'good' | 'easy',
  currentReview: unknown
): Promise<void> => {
  try {
    let newInterval = currentReview.interval_days;
    let newEaseFactor = currentReview.ease_factor;
    let newRepetitions = currentReview.repetitions;

    if (quality === 'again') {
      newRepetitions = 0;
      newInterval = 1;
    } else {
      newRepetitions += 1;
      
      if (quality === 'hard') {
        newEaseFactor = Math.max(130, newEaseFactor - 15);
      } else if (quality === 'easy') {
        newEaseFactor = newEaseFactor + 15;
      }

      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(newInterval * (newEaseFactor / 100));
      }
    }

    const newDueAt = new Date();
    newDueAt.setDate(newDueAt.getDate() + newInterval);

    const { error } = await supabase
      .from('reviews')
      .update({
        repetitions: newRepetitions,
        interval_days: newInterval,
        ease_factor: newEaseFactor,
        due_at: newDueAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateReview:', error);
    throw error;
  }
};

/**
 * Lấy thống kê reviews của user
 */
export const getReviewStats = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Reviews hôm nay
    const { data: todayReviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .lte('due_at', `${today}T23:59:59`);

    // Reviews đã hoàn thành hôm nay
    const { data: completedToday } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .gte('updated_at', `${today}T00:00:00`)
      .lt('updated_at', `${today}T23:59:59`);

    // Tính streak (ngày liên tiếp có reviews)
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    let streak = 0;
    if (allReviews && allReviews.length > 0) {
      const today = new Date();
      const currentDate = new Date(today);
      
      for (let i = 0; i < 30; i++) { // Check last 30 days
        const dateStr = currentDate.toISOString().split('T')[0];
        const hasReviewOnDate = allReviews.some(review => 
          review.updated_at.startsWith(dateStr)
        );
        
        if (hasReviewOnDate) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      totalToday: todayReviews?.length || 0,
      completedToday: completedToday?.length || 0,
      streak
    };
  } catch (error) {
    console.error('Error getting review stats:', error);
    return {
      totalToday: 0,
      completedToday: 0,
      streak: 0
    };
  }
};

