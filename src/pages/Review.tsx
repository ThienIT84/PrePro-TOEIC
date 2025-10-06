import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';
import { Clock, BookOpen, RotateCcw, Calendar, Headphones, FileText, Play, Pause } from 'lucide-react';
import SimpleAudioPlayer from '@/components/SimpleAudioPlayer';
import { updateReview, getReviewStats } from '@/utils/reviewUtils';
import type { Question, Review as ReviewType } from '@/types';

const Review = () => {
  const { user } = useAuth();
  const [dueReviews, setDueReviews] = useState<(ReviewType & { item: Question })[]>([]);
  const [currentReview, setCurrentReview] = useState<(ReviewType & { item: Question }) | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewStats, setReviewStats] = useState({
    totalToday: 0,
    completedToday: 0,
    streak: 0
  });

  useEffect(() => {
    console.log('Review page useEffect triggered, user:', user);
    if (user) {
      fetchDueReviews();
    }
  }, [user]);

  const fetchDueReviews = async () => {
    if (!user) {
      console.log('No user found, skipping fetchDueReviews');
      return;
    }
    
    console.log('Fetching due reviews for user:', user.id);
    setLoading(true);
    try {
      // Fetch reviews
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          item:questions(*)
        `)
        .eq('user_id', user.id)
        .lte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true });

      console.log('Reviews query result:', { data, error });

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      if (data && data.length > 0) {
        const reviewsWithQuestions = data.filter(review => review.item) as (ReviewType & { item: Question })[];
        console.log('Filtered reviews with questions:', reviewsWithQuestions);
        setDueReviews(reviewsWithQuestions);
        setCurrentReview(reviewsWithQuestions[0]);
      } else {
        console.log('No reviews found');
      }

      // Fetch review stats
      const stats = await getReviewStats(user.id);
      console.log('Review stats:', stats);
      setReviewStats(stats);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (quality: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentReview || !user) return;

    try {
      // Update review using utility function
      await updateReview(currentReview.id, quality, currentReview);

      // Move to next review
      const remainingReviews = dueReviews.slice(1);
      setDueReviews(remainingReviews);
      setReviewCount(prev => prev + 1);
      
      if (remainingReviews.length > 0) {
        setCurrentReview(remainingReviews[0]);
        setSelectedAnswer('');
        setShowResult(false);
      } else {
        setCurrentReview(null);
        // Refresh stats
        const stats = await getReviewStats(user.id);
        setReviewStats(stats);
        
        toast({
          title: 'Hoàn thành!',
          description: `Bạn đã hoàn thành ${reviewCount + 1} câu ôn tập hôm nay.`,
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật đánh giá. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải câu ôn tập...</p>
            <p className="text-sm text-gray-500 mt-2">
              User: {user?.id ? 'Authenticated' : 'Not authenticated'}
            </p>
            <p className="text-sm text-gray-500">
              Due reviews: {dueReviews.length}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <RotateCcw className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Ôn tập TOEIC</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {dueReviews.length} câu còn lại
            </Badge>
            <Badge variant="outline">
              {reviewStats.completedToday} hoàn thành hôm nay
            </Badge>
          </div>
        </div>
        
        {dueReviews.length > 0 && (
          <Progress 
            value={((reviewCount) / (reviewCount + dueReviews.length)) * 100}
            className="h-2"
          />
        )}
      </div>

      {currentReview ? (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={
                  currentReview.item.part <= 4 ? 'default' : 'secondary'
                }>
                  Part {currentReview.item.part}
                </Badge>
                <Badge variant={
                  currentReview.item.difficulty === 'easy' ? 'secondary' : 
                  currentReview.item.difficulty === 'medium' ? 'default' : 'destructive'
                }>
                  {currentReview.item.difficulty === 'easy' ? 'Dễ' : 
                   currentReview.item.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                </Badge>
                <Badge variant="outline">
                  Lần {currentReview.repetitions + 1}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Đến hạn: {new Date(currentReview.due_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="space-y-4">
              {/* Audio Player for Listening Parts */}
              {currentReview.item.audio_url && (
                <div className="mb-4">
                  <SimpleAudioPlayer 
                    audioUrl={currentReview.item.audio_url} 
                    transcript={currentReview.item.transcript || ''} 
                  />
                </div>
              )}

              {/* Image for Part 1 */}
              {currentReview.item.image_url && (
                <div className="text-center mb-4">
                  <img 
                    src={currentReview.item.image_url} 
                    alt="Question image" 
                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}

              <h3 className="text-lg font-semibold">{currentReview.item.prompt_text}</h3>
              
              {currentReview.item.transcript && !currentReview.item.audio_url && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    "{currentReview.item.transcript}"
                  </p>
                </div>
              )}
            </div>

            {/* Choices */}
            {currentReview.item.choices && typeof currentReview.item.choices === 'object' && (
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const choices = currentReview.item.choices as any;
                  const choiceText = choices?.[letter] || '';
                  if (!choiceText) return null;
                  
                  const isSelected = selectedAnswer === letter;
                  const isCorrectAnswer = showResult && letter === currentReview.item.correct_choice;
                  
                  return (
                    <button
                      key={letter}
                      onClick={() => !showResult && setSelectedAnswer(letter)}
                      disabled={showResult}
                      className={`w-full p-4 text-left border rounded-lg transition-all ${
                        isCorrectAnswer 
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                          isCorrectAnswer
                            ? 'border-green-500 bg-green-500 text-white'
                            : isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground'
                        }`}>
                          {letter}
                        </span>
                        <span>{choiceText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Show Answer Button */}
            {!showResult && (
              <Button 
                onClick={() => setShowResult(true)}
                variant="outline"
                className="w-full"
              >
                Xem đáp án
              </Button>
            )}

            {/* Answer and Quality Buttons */}
            {showResult && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Đáp án đúng: {currentReview.item.correct_choice}</span>
                  </div>
                  
                  {currentReview.item.explain_vi && (
                    <div>
                      <h4 className="font-medium mb-2">Giải thích (Tiếng Việt):</h4>
                      <p className="text-sm text-muted-foreground">{currentReview.item.explain_vi}</p>
                    </div>
                  )}
                  
                  {currentReview.item.explain_en && (
                    <div>
                      <h4 className="font-medium mb-2">Explanation (English):</h4>
                      <p className="text-sm text-muted-foreground">{currentReview.item.explain_en}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Bạn cảm thấy câu này thế nào?</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={() => submitReview('again')}
                      className="text-sm"
                    >
                      Khó - Xem lại (1 ngày)
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => submitReview('hard')}
                      className="text-sm"
                    >
                      Hơi khó ({Math.round(currentReview.interval_days * 0.8)} ngày)
                    </Button>
                    <Button 
                      variant="default" 
                      onClick={() => submitReview('good')}
                      className="text-sm"
                    >
                      Vừa phải ({Math.round(currentReview.interval_days * 1.2)} ngày)
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => submitReview('easy')}
                      className="text-sm"
                    >
                      Dễ ({Math.round(currentReview.interval_days * 1.5)} ngày)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12 space-y-6">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Không có câu nào cần ôn tập!</h3>
              <p className="text-muted-foreground mb-4">
                {reviewCount > 0 
                  ? `Bạn đã hoàn thành ${reviewCount} câu ôn tập hôm nay. Tuyệt vời!`
                  : 'Tất cả câu hỏi đã được ôn tập đúng lịch. Hãy quay lại sau.'}
              </p>
              
              {/* Review Statistics */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{reviewStats.completedToday}</div>
                  <div className="text-xs text-blue-700">Hôm nay</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{reviewStats.streak}</div>
                  <div className="text-xs text-green-700">Ngày liên tiếp</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{reviewStats.totalToday}</div>
                  <div className="text-xs text-purple-700">Tổng cộng</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Review;