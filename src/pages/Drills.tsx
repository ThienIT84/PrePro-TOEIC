import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';
import { Clock, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import type { Item, Attempt } from '@/types';

const Drills = () => {
  const { user } = useAuth();
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [dailyProgress, setDailyProgress] = useState({ completed: 0, target: 10 });

  useEffect(() => {
    fetchNewQuestion();
    fetchDailyProgress();
  }, []);

  const fetchNewQuestion = async () => {
    setLoading(true);
    try {
      // Get random question by using random() function
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('RANDOM()')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching question:', error);
        return;
      }

      if (data) {
        setCurrentItem(data as Item);
        setSelectedAnswer('');
        setShowResult(false);
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyProgress = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attempts')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`);

      if (!error && data) {
        setDailyProgress(prev => ({ ...prev, completed: data.length }));
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !currentItem || !user) return;

    const correct = selectedAnswer === currentItem.answer;
    const timeMs = Date.now() - startTime;
    
    setIsCorrect(correct);
    setShowResult(true);

    try {
      // Record attempt
      const { error } = await supabase
        .from('attempts')
        .insert({
          item_id: currentItem.id,
          user_id: user.id,
          response: selectedAnswer,
          correct,
          time_ms: timeMs
        });

      if (error) {
        console.error('Error recording attempt:', error);
      } else {
        // If answer is wrong, add to review queue
        if (!correct) {
          await addToReviewQueue(currentItem.id);
        }
        // Update progress
        setDailyProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
        
        toast({
          title: correct ? 'Chính xác!' : 'Sai rồi!',
          description: correct ? 'Bạn đã trả lời đúng!' : 'Hãy xem giải thích bên dưới.',
          variant: correct ? 'default' : 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addToReviewQueue = async (itemId: string) => {
    if (!user) return;
    
    try {
      // Check if item already exists in review queue
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .single();
      
      // Only add if not already in review queue
      if (!existingReview) {
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            item_id: itemId,
            due_at: new Date().toISOString(), // Due immediately for wrong answers
            interval_days: 1,
            ease_factor: 250,
            repetitions: 0
          });
        
        if (error) {
          console.error('Error adding to review queue:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const nextQuestion = () => {
    fetchNewQuestion();
  };

  const playAudio = () => {
    if (currentItem?.audio_url) {
      const audio = new Audio(currentItem.audio_url);
      audio.play().catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải câu hỏi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Luyện tập hàng ngày</h1>
          <Badge variant="secondary">
            {dailyProgress.completed}/{dailyProgress.target} câu hôm nay
          </Badge>
        </div>
        <Progress 
          value={(dailyProgress.completed / dailyProgress.target) * 100} 
          className="h-2"
        />
      </div>

      {currentItem ? (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={
                  currentItem.difficulty === 'easy' ? 'secondary' : 
                  currentItem.difficulty === 'medium' ? 'default' : 'destructive'
                }>
                  {currentItem.difficulty === 'easy' ? 'Dễ' : 
                   currentItem.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                </Badge>
                <Badge variant="outline">{currentItem.type}</Badge>
              </div>
              {currentItem.audio_url && (
                <Button variant="outline" size="sm" onClick={playAudio}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{currentItem.question}</h3>
              
              {currentItem.transcript && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    "{currentItem.transcript}"
                  </p>
                </div>
              )}
            </div>

            {/* Choices */}
            {currentItem.choices && currentItem.choices.length > 0 && (
              <div className="space-y-3">
                {currentItem.choices.map((choice, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = selectedAnswer === letter;
                  const isCorrectAnswer = showResult && letter === currentItem.answer;
                  const isWrongSelection = showResult && isSelected && !isCorrectAnswer;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !showResult && setSelectedAnswer(letter)}
                      disabled={showResult}
                      className={`w-full p-4 text-left border rounded-lg transition-all ${
                        isCorrectAnswer 
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : isWrongSelection
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                          isCorrectAnswer
                            ? 'border-green-500 bg-green-500 text-white'
                            : isWrongSelection
                            ? 'border-red-500 bg-red-500 text-white'
                            : isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground'
                        }`}>
                          {letter}
                        </span>
                        <span>{choice}</span>
                        {showResult && isCorrectAnswer && (
                          <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                        )}
                        {showResult && isWrongSelection && (
                          <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Submit/Next Button */}
            <div className="flex gap-3">
              {!showResult ? (
                <Button 
                  onClick={submitAnswer} 
                  disabled={!selectedAnswer}
                  className="flex-1"
                >
                  Trả lời
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="flex-1">
                  Câu tiếp theo
                </Button>
              )}
            </div>

            {/* Explanation */}
            {showResult && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {isCorrect ? 'Chính xác!' : `Đáp án đúng: ${currentItem.answer}`}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Giải thích (Tiếng Việt):</h4>
                    <p className="text-sm text-muted-foreground">{currentItem.explain_vi}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Explanation (English):</h4>
                    <p className="text-sm text-muted-foreground">{currentItem.explain_en}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Không có câu hỏi nào. Vui lòng thử lại sau.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Drills;