import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PassageDisplay } from '@/components/PassageDisplay';
import { 
  CheckCircle, 
  XCircle, 
  Circle, 
  RotateCcw, 
  Save, 
  ArrowLeft,
  ArrowRight,
  Target,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  Flag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Question } from '@/types';
import SimpleAudioPlayer from './SimpleAudioPlayer';

interface QuestionStatus {
  id: string;
  questionNumber: number;
  part: number;
  isCorrect: boolean;
  isAnswered: boolean;
  userAnswer: string;
  correctAnswer: string;
  question: Question;
}

type PassageLite = {
  id: string;
  texts: { title?: string; content?: string; additional?: string } | null;
  image_url: string | null;
  audio_url: string | null;
};

interface RetryModeProps {
  sessionId: string;
  questions: Question[];
  attempts: any[];
  onExit: () => void;
  onUpdate: (newScore: number, newCorrectCount: number) => void;
}

const RetryMode: React.FC<RetryModeProps> = ({
  sessionId,
  questions,
  attempts,
  onExit,
  onUpdate
}) => {
  const { toast } = useToast();
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(0); // Start with first question
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [passageMap, setPassageMap] = useState<Record<string, PassageLite>>({});

  // Initialize question statuses and load passages
  useEffect(() => {
    console.log('RetryMode: Initializing with questions:', questions?.length, 'attempts:', attempts?.length);
    
    if (!questions || questions.length === 0) {
      console.log('RetryMode: No questions available');
      setQuestionStatuses([]);
      return;
    }
    
    try {
      const statuses: QuestionStatus[] = questions
        .filter(question => question && question.id)
        .map((question, index) => {
          const attempt = attempts?.find(a => a.question_id === question.id);
          return {
            id: question.id,
            questionNumber: index + 1,
            part: question.part || 1,
            isCorrect: attempt?.is_correct || false,
            isAnswered: !!attempt?.user_answer,
            userAnswer: attempt?.user_answer || '',
            correctAnswer: (question as any).correct_choice || (question as any).answer || '',
            question: {
              ...question,
              // Ensure we have all the necessary fields
              choices: question.choices || {},
              image_url: question.image_url || null,
              audio_url: question.audio_url || null,
              prompt_text: question.prompt_text || question.question_text || '',
              passage_id: question.passage_id || null
            }
          };
        });

      console.log('RetryMode: Generated statuses:', statuses.length);
      setQuestionStatuses(statuses);

      // Load passages for questions that need them
      const passageIds = Array.from(new Set(
        questions
          .map(q => q.passage_id)
          .filter((id): id is string => Boolean(id))
      ));

      const loadPassages = async () => {
        if (passageIds.length > 0) {
          const { data: passages, error: pErr } = await supabase
            .from('passages')
            .select('id, texts, image_url, audio_url')
            .in('id', passageIds);
          
          if (pErr) {
            console.error('Error fetching passages:', pErr);
          } else {
            const map: Record<string, PassageLite> = {};
            (passages || []).forEach((p: any) => {
              map[p.id] = {
                id: p.id,
                texts: p.texts || null,
                image_url: p.image_url || null,
                audio_url: p.audio_url || null,
              };
            });
            setPassageMap(map);
          }
        }
      };

      loadPassages();
    } catch (error) {
      console.error('RetryMode: Error initializing:', error);
      setQuestionStatuses([]);
    }
  }, [questions]);

  // Get statistics
  const stats = {
    total: questionStatuses.length,
    correct: questionStatuses.filter(q => q.isCorrect).length,
    wrong: questionStatuses.filter(q => q.isAnswered && !q.isCorrect).length,
    unanswered: questionStatuses.filter(q => !q.isAnswered).length,
    retryable: questionStatuses.filter(q => q.isAnswered && !q.isCorrect).length + 
               questionStatuses.filter(q => !q.isAnswered).length
  };

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, newAnswer: string) => {
    setQuestionStatuses(prev => prev.map(q => {
      if (q.id === questionId) {
        const isCorrect = newAnswer === q.correctAnswer;
        return {
          ...q,
          userAnswer: newAnswer,
          isAnswered: true,
          isCorrect
        };
      }
      return q;
    }));
    setHasChanges(true);
  }, []);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update exam_attempts
      const updates = questionStatuses
        .filter(q => q.isAnswered)
        .map(q => ({
          session_id: sessionId,
          question_id: q.id,
          user_answer: q.userAnswer,
          is_correct: q.isCorrect,
          updated_at: new Date().toISOString()
        }));

      // Batch update attempts
      for (const update of updates) {
        const { error } = await supabase
          .from('exam_attempts')
          .upsert(update, { 
            onConflict: 'session_id,question_id' 
          });
        
        if (error) throw error;
      }

      // Update exam_sessions
      const newCorrectCount = questionStatuses.filter(q => q.isCorrect).length;
      const newScore = Math.round((newCorrectCount / stats.total) * 100);

      const { error: sessionError } = await supabase
        .from('exam_sessions')
        .update({
          correct_answers: newCorrectCount,
          score: newScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      toast({
        title: "Cập nhật thành công",
        description: `Điểm số mới: ${newCorrectCount}/${stats.total} (${newScore}%)`,
      });

      setHasChanges(false);
      onUpdate(newScore, newCorrectCount);

    } catch (error) {
      console.error('Error saving retry results:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật kết quả",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [hasChanges, questionStatuses, sessionId, stats.total, toast, onUpdate]);

  const currentQuestion = currentQuestionIndex !== null ? questionStatuses[currentQuestionIndex] : null;
  
  // Debug logging
  console.log('RetryMode Debug - currentQuestionIndex:', currentQuestionIndex);
  console.log('RetryMode Debug - currentQuestion:', currentQuestion);
  console.log('RetryMode Debug - question data:', currentQuestion?.question);
  console.log('RetryMode Debug - choices:', currentQuestion?.question?.choices);
  console.log('RetryMode Debug - image_url:', currentQuestion?.question?.image_url);
  console.log('RetryMode Debug - questions prop sample:', questions[0]);
  console.log('RetryMode Debug - questions prop choices:', questions[0]?.choices);
  console.log('RetryMode Debug - questions prop image_url:', questions[0]?.image_url);
  console.log('RetryMode Debug - attempts prop:', attempts);

  // Early return if no data
  if (!questions || questions.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Làm lại các câu sai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có dữ liệu câu hỏi để làm lại.</p>
              <Button variant="outline" onClick={onExit} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Thoát
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto space-y-6 overflow-y-auto p-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
                <h1 className="text-xl font-bold">Làm lại các câu sai</h1>
                <p className="text-sm text-muted-foreground">
                Câu {currentQuestionIndex !== null ? currentQuestionIndex + 1 : 1} / {questionStatuses.length} • Part {currentQuestion?.part || questionStatuses[0]?.part || 1}
                  {currentQuestion?.question.passage_id && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Passage {questionStatuses.findIndex(q => q.question.passage_id === currentQuestion.question.passage_id) + 1}-{questionStatuses.filter(q => q.question.passage_id === currentQuestion.question.passage_id).length}
                    </span>
                  )}
              </p>
            </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExit}
                >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Thoát
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
          </div>
        </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
            <span>Tiến độ</span>
            <span>{questionStatuses.filter(q => q.isAnswered).length} / {questionStatuses.length} câu đã trả lời</span>
          </div>
          <Progress 
            value={(questionStatuses.filter(q => q.isAnswered).length / questionStatuses.length) * 100} 
            className="h-2"
          />
        </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Audio Player - Only for single questions (Part 1, 2) */}
              {(() => {
                if (!currentQuestion) return null;
                
                // Only show audio for questions without passage_id (Part 1, 2)
                if (currentQuestion.question.passage_id) return null;
                
                const questionAudio = currentQuestion.question.audio_url;
                const hasAudio = questionAudio;
                
                return hasAudio && (
                  <div className="mb-6">
                    <SimpleAudioPlayer 
                      audioUrl={questionAudio}
                      transcript=""
                    />
                  </div>
                );
              })()}

              {/* Image for Part 1 */}
              {currentQuestion?.part === 1 && currentQuestion.question.image_url && (
                <div className="mb-6">
                  <div className="flex justify-center">
                    <img 
                      src={currentQuestion.question.image_url} 
                      alt="Question image" 
                      className="max-w-full h-auto rounded-lg border shadow-sm object-contain"
                      style={{ maxHeight: '500px' }}
                    />
                  </div>
                </div>
              )}

              {/* Part 7 Passage Images (from passages) - Skip Part 6 as PassageDisplay handles it */}
              {currentQuestion && currentQuestion.part === 7 && currentQuestion.question.passage_id && passageMap[currentQuestion.question.passage_id] && (
                (() => {
                  const p = passageMap[currentQuestion.question.passage_id];
                  const images = [];
                  
                  // Add images from new structure
                  if (p.texts?.img_url) images.push(p.texts.img_url);
                  if (p.texts?.img_url2) images.push(p.texts.img_url2);
                  if (p.texts?.img_url3) images.push(p.texts.img_url3);
                  
                  // Backward compatibility: fallback to old structure
                  if (images.length === 0) {
                    if (p.image_url) images.push(p.image_url);
                    if (p.texts?.additional) {
                      const extra = p.texts.additional
                        .split('|')
                        .map(s => s.trim())
                        .filter(Boolean);
                      images.push(...extra);
                    }
                  }
                  
                  if (images.length === 0) return null;
                  
                  return (
                    <div className="mb-6">
                      <div className="space-y-4">
                        {images.map((src, i) => (
                          <div key={i} className="flex justify-center">
                            <img 
                              src={src} 
                              alt={`Passage ${i + 1}`} 
                              className="max-w-full h-auto rounded-lg border shadow-lg hover:shadow-xl transition-shadow duration-200"
                              style={{ 
                                maxHeight: '600px',
                                minHeight: '300px',
                                objectFit: 'contain'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Passage Content for Part 3, 4, 6, 7 */}
              {currentQuestion && (currentQuestion.part === 3 || currentQuestion.part === 4 || currentQuestion.part === 6 || currentQuestion.part === 7) && currentQuestion.question.passage_id && (
                <div className="mb-6">
                  <PassageDisplay
                    passage={{
                      content: passageMap[currentQuestion.question.passage_id]?.texts?.content || '',
                      title: passageMap[currentQuestion.question.passage_id]?.texts?.title || `Passage ${currentQuestionIndex + 1}`,
                      content2: passageMap[currentQuestion.question.passage_id]?.texts?.content2,
                      content3: passageMap[currentQuestion.question.passage_id]?.texts?.content3,
                      img_url: passageMap[currentQuestion.question.passage_id]?.texts?.img_url,
                      img_url2: currentQuestion.part === 6 ? undefined : passageMap[currentQuestion.question.passage_id]?.texts?.img_url2,
                      img_url3: currentQuestion.part === 6 ? undefined : passageMap[currentQuestion.question.passage_id]?.texts?.img_url3
                    }}
                    translationVi={passageMap[currentQuestion.question.passage_id]?.translation_vi}
                    translationEn={passageMap[currentQuestion.question.passage_id]?.translation_en}
                    showTranslation={true}
                  />
                </div>
              )}

              {/* Part 6,7 Passage Text - Hidden for Part 6,7, only show images */}
              {/* Part 3,4 Passage Text - Hidden for Part 3,4 (listening), only show audio */}
              {currentQuestion && currentQuestion.part !== 7 && currentQuestion.part !== 6 && currentQuestion.part !== 3 && currentQuestion.part !== 4 && currentQuestion.question.passage_id && passageMap[currentQuestion.question.passage_id]?.texts?.content && (
                <div className="mb-4">
                  {passageMap[currentQuestion.question.passage_id]?.texts?.title && (
                    <h3 className="text-base font-semibold mb-2">{passageMap[currentQuestion.question.passage_id]?.texts?.title}</h3>
                  )}
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {passageMap[currentQuestion.question.passage_id]?.texts?.content}
                  </pre>
                </div>
              )}

              {/* Question Text - Hidden for Part 1 and Part 2 */}
              {currentQuestion && currentQuestion.part !== 1 && currentQuestion.part !== 2 && (
              <div>
                  <h2 className="text-lg font-medium mb-4">
                    {currentQuestion.question.prompt_text || (currentQuestion.question as any).question}
                  </h2>
                </div>
              )}

              {/* Part 1 - Only Image and Instructions */}
              {currentQuestion?.part === 1 && (
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-medium text-gray-800 mb-2">
                      Part 1: Photos
                    </h2>
                    <p className="text-gray-600">
                      Nhìn vào ảnh và chọn câu mô tả đúng nhất.
                    </p>
                  </div>
                </div>
              )}

              {/* Part 2 - Question-Response Instructions */}
              {currentQuestion?.part === 2 && (
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-medium text-gray-800 mb-2">
                      Part 2: Question-Response
                    </h2>
                    <p className="text-gray-600">
                      Nghe câu hỏi và chọn câu trả lời phù hợp nhất.
                </p>
              </div>
                </div>
              )}

              {/* Part 3-4-6-7 - Passage Instructions */}
              {currentQuestion && [3, 4, 6, 7].includes(currentQuestion.part) && currentQuestion.question.passage_id && (
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-medium text-gray-800 mb-2">
                      Part {currentQuestion.part}: {currentQuestion.part === 3 ? 'Conversations' : currentQuestion.part === 4 ? 'Talks' : currentQuestion.part === 6 ? 'Text Completion' : 'Reading Comprehension'}
                    </h2>
                    <p className="text-gray-600">
                      {currentQuestion.part === 3 && 'Nghe đoạn hội thoại và trả lời câu hỏi.'}
                      {currentQuestion.part === 4 && 'Nghe đoạn thuyết trình và trả lời câu hỏi.'}
                      {currentQuestion.part === 6 && 'Đọc đoạn văn và điền từ còn thiếu.'}
                      {currentQuestion.part === 7 && 'Đọc đoạn văn và trả lời câu hỏi.'}
                    </p>
                    <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full inline-block">
                      📖 Passage này có {questionStatuses.filter(q => q.question.passage_id === currentQuestion.question.passage_id).length} câu hỏi
                    </div>
                  </div>
                </div>
              )}

              {/* Passage Questions - Show all questions in passage */}
              {currentQuestion?.question.passage_id ? (
                <div className="space-y-6">
                  {/* Audio and Image for the entire passage - shown once at the top */}
                  {(() => {
                    const passageAudio = passageMap[currentQuestion.question.passage_id]?.audio_url;
                    const passageImage = passageMap[currentQuestion.question.passage_id]?.image_url;
                    
                    // For Part 3, 4: Show audio and image but no transcript
                    if ((currentQuestion.part === 3 || currentQuestion.part === 4) && (passageAudio || passageImage)) {
                      return (
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
                          <h4 className="text-lg font-semibold text-blue-900 mb-3">
                            📖 Nội dung Passage này
                          </h4>
                          
                          {/* Image for Passage */}
                          {passageImage && (
                            <div className="mb-4">
                              <div className="flex justify-center">
                                <img 
                                  src={passageImage} 
                                  alt="Passage Image" 
                                  className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                                  style={{ maxHeight: '400px' }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Audio for Passage */}
                          {passageAudio && (
                            <div>
                              <SimpleAudioPlayer 
                                audioUrl={passageAudio}
                                transcript=""
                              />
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    // For other parts: Show full content
                    return (passageAudio || passageImage) && currentQuestion.part !== 7 && currentQuestion.part !== 6 && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="text-lg font-semibold text-blue-900 mb-3">
                          📖 Nội dung Passage này
                        </h4>
                        
                        {/* Image for Passage */}
                        {passageImage && (
                          <div className="mb-4">
                            <div className="flex justify-center">
                              <img 
                                src={passageImage} 
                                alt="Passage Image" 
                                className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                                style={{ maxHeight: '400px' }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Audio for Passage */}
                        {passageAudio && (
              <div>
                            <SimpleAudioPlayer 
                              audioUrl={passageAudio}
                              transcript=""
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  {(() => {
                    const passageQuestions = questionStatuses.filter(q => q.question.passage_id === currentQuestion.question.passage_id);
                    return passageQuestions.map((question, questionIndex) => {
                      const globalIndex = questionStatuses.findIndex(q => q.id === question.id);
                      const isCurrentQuestion = globalIndex === currentQuestionIndex;
                      
                      return (
                        <div 
                          key={question.id} 
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            isCurrentQuestion 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Câu {globalIndex + 1}
                            </h3>
                            {question.isAnswered && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                question.isCorrect 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {question.isCorrect ? 'Đã trả lời đúng' : 'Đã trả lời sai'}
                              </span>
                            )}
                          </div>
                          
                          {/* Question Text */}
                          {question.question.prompt_text && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-900 font-medium">{question.question.prompt_text}</p>
                            </div>
                          )}
                          
                          {/* Choices for this question */}
                          <div className="space-y-2">
                            {Object.entries(question.question.choices || {})
                    .filter(([choiceLetter]) => {
                                if (question.part === 2) {
                        return ['A', 'B', 'C'].includes(choiceLetter);
                      }
                      return true;
                    })
                    .map(([choiceLetter, choiceText]) => {
                                const isSelected = question.userAnswer === choiceLetter;
                                const isCorrect = question.correctAnswer === choiceLetter;
                      const hasText = choiceText && choiceText.trim().length > 0;
                      
                      return (
                                  <div
                          key={choiceLetter}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? (isCorrect 
                                  ? 'border-green-500 bg-green-50' 
                                  : 'border-red-500 bg-red-50')
                                        : isCorrect && question.isAnswered
                                ? 'border-green-300 bg-green-25'
                                          : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                    onClick={() => {
                                      handleAnswerChange(question.id, choiceLetter);
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            isSelected
                              ? (isCorrect 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-red-500 text-white')
                                          : isCorrect && question.isAnswered
                                ? 'bg-green-300 text-white'
                                : 'bg-gray-200 text-gray-700'
                          }`}>
                            {choiceLetter}
                          </div>
                                      <span className={`text-sm ${
                                        isSelected 
                                          ? (isCorrect ? 'text-green-800' : 'text-red-800')
                                          : 'text-gray-700'
                                      }`}>
                            {hasText ? choiceText : `Lựa chọn ${choiceLetter}`}
                          </span>
                          {isSelected && (
                                        <span className="ml-auto text-xs font-medium">
                              {isCorrect ? '✓ Đúng' : '✗ Sai'}
                            </span>
                          )}
                                      {!isSelected && isCorrect && question.isAnswered && (
                                        <span className="ml-auto text-xs font-medium text-green-600">
                              ✓ Đáp án đúng
                            </span>
                          )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                /* Single Question - Original logic for Part 1, 2 */
                <div className="space-y-3">
                  {/* Show image for Part 1 */}
                  {currentQuestion?.part === 1 && (
                    <div className="mb-6">
                      <div className="flex justify-center">
                        <img 
                          src={currentQuestion.question?.image_url || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="} 
                          alt="Question image" 
                          className="max-w-full h-auto rounded-lg border shadow-sm object-contain"
                          style={{ maxHeight: '500px' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Show audio for Part 2 */}
                  {currentQuestion?.part === 2 && (
                    <div className="mb-6">
                      <SimpleAudioPlayer 
                        audioUrl={currentQuestion.question?.audio_url || ""}
                        transcript=""
                      />
                    </div>
                  )}

                  {currentQuestion && currentQuestion.part !== 1 && (
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      Chọn đáp án:
                    </h3>
                  )}
                  
                  {/* Show choices */}
                  <div className="space-y-3">
                    {(() => {
                      const choices = currentQuestion?.question?.choices || {};
                      const choiceKeys = Object.keys(choices);
                      
                      // If no choices data, show default A, B, C, D
                      if (choiceKeys.length === 0) {
                        return (currentQuestion?.part === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D']).map((choiceLetter) => {
                          const isSelected = currentQuestion?.userAnswer === choiceLetter;
                          const isCorrect = currentQuestion?.correctAnswer === choiceLetter;
                          
                          return (
                            <label
                              key={choiceLetter}
                              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                isSelected 
                                  ? (isCorrect 
                                      ? 'border-green-500 bg-green-50' 
                                      : 'border-red-500 bg-red-50')
                                  : isCorrect && currentQuestion?.isAnswered
                                    ? 'border-green-300 bg-green-25'
                                    : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${currentQuestion?.id}`}
                                value={choiceLetter}
                                checked={isSelected}
                                onChange={(e) => handleAnswerChange(currentQuestion?.id || '', e.target.value)}
                                className="sr-only"
                              />
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? (isCorrect
                                      ? 'border-green-500 bg-green-500 text-white'
                                      : 'border-red-500 bg-red-500 text-white')
                                  : isCorrect && currentQuestion?.isAnswered
                                    ? 'border-green-300 bg-green-300 text-white'
                                    : 'border-muted-foreground'
                              }`}>
                                {isSelected && <CheckCircle className="h-4 w-4" />}
                              </div>
                              <span className="font-medium">{choiceLetter}.</span>
                              <span className="flex-1">Lựa chọn {choiceLetter}</span>
                            </label>
                          );
                        });
                      }
                      
                      // Show actual choices from data
                      return Object.entries(choices).map(([choiceLetter, choiceText]) => {
                        const isSelected = currentQuestion?.userAnswer === choiceLetter;
                        const isCorrect = currentQuestion?.correctAnswer === choiceLetter;
                        const hasText = choiceText && choiceText.trim().length > 0;
                        
                        return (
                          <label
                            key={choiceLetter}
                            className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              isSelected 
                                ? (isCorrect 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-red-500 bg-red-50')
                                : isCorrect && currentQuestion?.isAnswered
                                  ? 'border-green-300 bg-green-25'
                                  : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestion?.id}`}
                              value={choiceLetter}
                              checked={isSelected}
                              onChange={(e) => handleAnswerChange(currentQuestion?.id || '', e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected 
                                ? (isCorrect
                                    ? 'border-green-500 bg-green-500 text-white'
                                    : 'border-red-500 bg-red-500 text-white')
                                : isCorrect && currentQuestion?.isAnswered
                                  ? 'border-green-300 bg-green-300 text-white'
                                  : 'border-muted-foreground'
                            }`}>
                              {isSelected && <CheckCircle className="h-4 w-4" />}
                            </div>
                            <span className="font-medium">{choiceLetter}.</span>
                            <span className="flex-1">{hasText ? choiceText : `Lựa chọn ${choiceLetter}`}</span>
                          </label>
                        );
                      });
                    })()}
                </div>
              </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, (currentQuestionIndex || 0) - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Câu trước
            </Button>

            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.min(questionStatuses.length - 1, (currentQuestionIndex || 0) + 1))}
              disabled={currentQuestionIndex === questionStatuses.length - 1}
            >
              Câu sau
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
      </div>

      {/* Right Side Navigation Panel */}
      <div className="w-80 bg-white border-l shadow-lg overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Câu hỏi</h3>
          
          {/* Group questions by part */}
          {(() => {
            const questionsByPart = questionStatuses.reduce((acc, status, index) => {
              const part = status.part;
              if (!acc[part]) {
                acc[part] = [];
              }
              acc[part].push({ ...status, index });
              return acc;
            }, {} as Record<number, Array<{ part: number; index: number; questionNumber: number; isCorrect: boolean; isAnswered: boolean }>>);

            return Object.entries(questionsByPart)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([part, partQuestions]) => (
                <div key={part} className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Part {part}
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {partQuestions.map(({ index, questionNumber, isCorrect, isAnswered }) => {
                      const isCurrent = index === currentQuestionIndex;
                      
                      return (
                        <Button
                          key={index}
                          variant={isCurrent ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`h-8 w-8 p-0 text-xs font-medium ${
                            isCurrent 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : isAnswered 
                                ? (isCorrect 
                                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200')
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {questionNumber}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default RetryMode;
