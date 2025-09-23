import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';
import { Clock, BookOpen, RotateCcw, Calendar } from 'lucide-react';
import type { Item, Review as ReviewType } from '@/types';

const Review = () => {
  const { user } = useAuth();
  const [dueReviews, setDueReviews] = useState<(ReviewType & { item: Item })[]>([]);
  const [currentReview, setCurrentReview] = useState<(ReviewType & { item: Item }) | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetchDueReviews();
  }, []);

  const fetchDueReviews = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          item:items(*)
        `)
        .eq('user_id', user.id)
        .lte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true });

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      if (data && data.length > 0) {
        const reviewsWithItems = data.filter(review => review.item) as (ReviewType & { item: Item })[];
        setDueReviews(reviewsWithItems);
        setCurrentReview(reviewsWithItems[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (quality: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentReview || !user) return;

    // SM-2 Algorithm implementation
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

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          repetitions: newRepetitions,
          interval_days: newInterval,
          ease_factor: newEaseFactor,
          due_at: newDueAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentReview.id);

      if (error) {
        console.error('Error updating review:', error);
        return;
      }

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
        toast({
          title: 'Hoàn thành!',
          description: `Bạn đã hoàn thành ${reviewCount + 1} câu ôn tập hôm nay.`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải câu ôn tập...</p>
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
            <h1 className="text-2xl font-bold">Ôn tập spaced repetition</h1>
          </div>
          <Badge variant="secondary">
            {dueReviews.length} câu còn lại
          </Badge>
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
                  currentReview.item.difficulty === 'easy' ? 'secondary' : 
                  currentReview.item.difficulty === 'medium' ? 'default' : 'destructive'
                }>
                  {currentReview.item.difficulty === 'easy' ? 'Dễ' : 
                   currentReview.item.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                </Badge>
                <Badge variant="outline">{currentReview.item.type}</Badge>
                <Badge variant="outline">
                  Lần {currentReview.repetitions + 1}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Hôm qua: {new Date(currentReview.due_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{currentReview.item.question}</h3>
              
              {currentReview.item.transcript && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    "{currentReview.item.transcript}"
                  </p>
                </div>
              )}
            </div>

            {/* Choices */}
            {currentReview.item.choices && currentReview.item.choices.length > 0 && (
              <div className="space-y-3">
                {currentReview.item.choices.map((choice, index) => {
                  const letter = String.fromCharCode(65 + index);
                  const isSelected = selectedAnswer === letter;
                  const isCorrectAnswer = showResult && letter === currentReview.item.answer;
                  
                  return (
                    <button
                      key={index}
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
                        <span>{choice}</span>
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
                    <span className="font-medium">Đáp án đúng: {currentReview.item.answer}</span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Giải thích (Tiếng Việt):</h4>
                    <p className="text-sm text-muted-foreground">{currentReview.item.explain_vi}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Explanation (English):</h4>
                    <p className="text-sm text-muted-foreground">{currentReview.item.explain_en}</p>
                  </div>
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
          <CardContent className="text-center py-12 space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Không có câu nào cần ôn tập!</h3>
              <p className="text-muted-foreground">
                {reviewCount > 0 
                  ? `Bạn đã hoàn thành ${reviewCount} câu ôn tập hôm nay. Tuyệt vời!`
                  : 'Tất cả câu hỏi đã được ôn tập đúng lịch. Hãy quay lại sau.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Review;