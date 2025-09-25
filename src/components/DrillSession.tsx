import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, CheckCircle, XCircle, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import type { Item, DrillType, Difficulty } from '@/types';

interface DrillSessionProps {
  items: Item[];
  onComplete: (results: SessionResults) => void;
  onExit: () => void;
  sessionType?: DrillType;
  difficulty?: Difficulty;
}

interface SessionResults {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  accuracy: number;
  results: Array<{
    itemId: string;
    correct: boolean;
    timeMs: number;
    response: string;
  }>;
}

const DrillSession = ({ items, onComplete, onExit, sessionType, difficulty }: DrillSessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [results, setResults] = useState<Array<{
    itemId: string;
    correct: boolean;
    timeMs: number;
    response: string;
  }>>([]);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const currentItem = items[currentIndex];
  const isLastQuestion = currentIndex === items.length - 1;
  const progress = ((currentIndex + (showResult ? 1 : 0)) / items.length) * 100;

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const playAudio = useCallback(async () => {
    if (!currentItem?.audio_url) return;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }

    try {
      setAudioLoading(true);
      const audio = new Audio(currentItem.audio_url);
      setCurrentAudio(audio);

      audio.onloadstart = () => setAudioLoading(true);
      audio.oncanplay = () => setAudioLoading(false);
      audio.onplay = () => setAudioPlaying(true);
      audio.onpause = () => setAudioPlaying(false);
      audio.onended = () => setAudioPlaying(false);
      audio.onerror = () => {
        setAudioLoading(false);
        setAudioPlaying(false);
        console.error('Audio failed to load');
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioLoading(false);
      setAudioPlaying(false);
    }
  }, [currentItem?.audio_url, currentAudio]);

  const pauseAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
    }
  }, [currentAudio]);

  const submitAnswer = () => {
    if (!selectedAnswer || !currentItem) return;

    const correct = selectedAnswer === currentItem.answer;
    const timeMs = Date.now() - questionStartTime;
    
    const result = {
      itemId: currentItem.id,
      correct,
      timeMs,
      response: selectedAnswer
    };

    setResults(prev => [...prev, result]);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      // Session complete
      const totalTime = Date.now() - sessionStartTime;
      const correctCount = results.filter(r => r.correct).length + (showResult && selectedAnswer === currentItem.answer ? 1 : 0);
      
      const sessionResults: SessionResults = {
        totalQuestions: items.length,
        correctAnswers: correctCount,
        timeSpent: totalTime,
        accuracy: (correctCount / items.length) * 100,
        results: [...results, ...(showResult ? [{
          itemId: currentItem.id,
          correct: selectedAnswer === currentItem.answer,
          timeMs: Date.now() - questionStartTime,
          response: selectedAnswer
        }] : [])]
      };

      onComplete(sessionResults);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
      setAudioPlaying(false);
    }
  };

  const handleExit = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }
    onExit();
  };

  if (!currentItem) return null;

  const correctAnswers = results.filter(r => r.correct).length;
  const currentAccuracy = results.length > 0 ? (correctAnswers / results.length) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Session Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Câu {currentIndex + 1} / {items.length}
            </div>
            {sessionType && (
              <Badge variant="outline">{sessionType}</Badge>
            )}
            {difficulty && (
              <Badge variant={
                difficulty === 'easy' ? 'secondary' : 
                difficulty === 'medium' ? 'default' : 'destructive'
              }>
                {difficulty === 'easy' ? 'Dễ' : 
                 difficulty === 'medium' ? 'Trung bình' : 'Khó'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {Math.round(currentAccuracy)}% đúng
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowExitDialog(true)}>
              Thoát
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
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
              <div className="flex items-center gap-2">
                {audioLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={audioPlaying ? pauseAudio : playAudio}
                  disabled={audioLoading}
                >
                  {audioPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : audioLoading ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
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
                const letter = String.fromCharCode(65 + index);
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
                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/20'
                        : isWrongSelection
                        ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/20'
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

          {/* Action Buttons */}
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
                {isLastQuestion ? 'Hoàn thành' : 'Câu tiếp theo'}
              </Button>
            )}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                {selectedAnswer === currentItem.answer ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {selectedAnswer === currentItem.answer 
                    ? 'Chính xác!' 
                    : `Đáp án đúng: ${currentItem.answer}`}
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

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thoát phiên luyện tập?</DialogTitle>
            <DialogDescription>
              Bạn đã hoàn thành {currentIndex + 1}/{items.length} câu hỏi. 
              Tiến độ sẽ không được lưu nếu thoát ngay bây giờ.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Tiếp tục
            </Button>
            <Button variant="destructive" onClick={handleExit}>
              Thoát
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrillSession;