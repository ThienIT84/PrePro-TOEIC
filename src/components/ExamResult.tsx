import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  Target, 
  RotateCcw,
  ArrowLeft,
  Eye,
  AlertCircle
} from 'lucide-react';
import SimpleAudioPlayer from '@/components/SimpleAudioPlayer';

interface ExamResult {
  session_id: string;
  exam_set_name: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  time_spent: number;
  completed_at: string;
  questions: QuestionResult[];
  results?: unknown;
}

interface QuestionResult {
  question_id: string;
  question_text: string;
  correct_answer: string;
  user_answer: string;
  is_correct: boolean;
  time_spent: number;
  explain_vi: string;
  explain_en: string;
  tags: string;
  transcript: string;
  choices?: { A: string; B: string; C: string; D: string } | null;
  audio_url?: string | null;
  image_url?: string | null;
  passage_id?: string | null;
  passage_audio_url?: string | null;
  passage_image_url?: string | null;
  passage_transcript?: string | null;
}

const ExamResult = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchExamResult();
    }
  }, [sessionId]);

  const fetchExamResult = async () => {
    try {
      setLoading(true);
      console.log('Fetching exam result for session:', sessionId);
      
      // Thử dùng RPC function trước
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_exam_result', {
        session_uuid: sessionId
      });

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        console.log('Falling back to direct query...');
        
        // Fallback: query trực tiếp
        const { data: sessionData, error: sessionError } = await supabase
          .from('exam_sessions')
          .select(`
            id,
            total_questions,
            correct_answers,
            score,
            time_spent,
            completed_at,
            results,
            exam_sets (title, description)
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError) {
          console.error('Session query error:', sessionError);
          setError(`Không thể tải kết quả thi: ${sessionError.message}`);
          return;
        }

        // Lấy attempts
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('exam_attempts')
          .select('question_id, user_answer, is_correct, time_spent')
          .eq('session_id', sessionId);

        const passageMap: Record<string, unknown> = {};

        if (!attemptsError) {
          const qids = attemptsData.map(a => a.question_id);
          // Merge served questions from session.results (so we can include unanswered)
          const served = (sessionData as any)?.results?.served_question_ids as string[] | undefined;
          const allIds = Array.from(new Set([...(served || []), ...qids]));
           const { data: qs, error: qErr } = await supabase
             .from('questions')
             .select('id, prompt_text, choices, correct_choice, explain_vi, explain_en, tags, transcript, audio_url, image_url, passage_id')
             .in('id', allIds);
          if (qErr) {
            console.error('Questions query error:', qErr);
          } else {
            // Merge question details
            const map: Record<string, any> = {};
            (qs || []).forEach(q => { map[q.id] = q; });
            attemptsData.forEach(a => { (a as any).question_detail = map[a.question_id]; });

            // Get passage data for questions with passage_id
            const passageIds = [...new Set((qs || []).map(q => q.passage_id).filter(Boolean))];
            if (passageIds.length > 0) {
              const { data: passages, error: passageError } = await supabase
                .from('passages')
                .select('id, audio_url, image_url, texts')
                .in('id', passageIds);
              
              if (!passageError && passages) {
                passages.forEach((p: any) => {
                  passageMap[p.id] = {
                    audio_url: p.audio_url,
                    image_url: p.image_url,
                    texts: p.texts
                  };
                });
              }
            }

            // Add unanswered ones if served list exists
            if (served && served.length > 0) {
              const answeredSet = new Set(qids);
              const missing = served.filter(id => !answeredSet.has(id));
              missing.forEach(id => {
                attemptsData.push({
                  question_id: id,
                  user_answer: '',
                  is_correct: false,
                  time_spent: 0,
                  question_detail: map[id]
                } as any);
              });
            }
          }
        }

        if (attemptsError) {
          console.error('Attempts query error:', attemptsError);
          setError(`Không thể tải chi tiết câu trả lời: ${attemptsError.message}`);
          return;
        }

        // Transform data
        const transformedResult = {
          session_id: (sessionData as any).id,
          exam_set_name: (sessionData as any).exam_sets?.title || 'Bài thi',
          total_questions: (sessionData as any).total_questions,
          correct_answers: (sessionData as any).correct_answers,
          score: (sessionData as any).score,
          time_spent: (sessionData as any).time_spent,
          completed_at: (sessionData as any).completed_at,
          questions: (attemptsData || []).map(attempt => {
            const questionDetail = (attempt as any).question_detail;
            const passageId = questionDetail?.passage_id;
            const passageData = passageId ? passageMap[passageId] : null;
            
            return {
              question_id: attempt.question_id,
              question_text: questionDetail?.prompt_text || '',
              correct_answer: questionDetail?.correct_choice || '',
              user_answer: attempt.user_answer || '',
              is_correct: attempt.is_correct,
              time_spent: attempt.time_spent,
              explain_vi: questionDetail?.explain_vi || '',
              explain_en: questionDetail?.explain_en || '',
              tags: questionDetail?.tags ? String(questionDetail.tags) : '',
              transcript: questionDetail?.transcript || '',
              choices: questionDetail?.choices || null,
              audio_url: questionDetail?.audio_url || null,
              image_url: questionDetail?.image_url || null,
              passage_id: passageId || null,
              passage_audio_url: (passageData as any)?.audio_url || null,
              passage_image_url: (passageData as any)?.image_url || null,
              passage_transcript: (passageData as any)?.texts?.content || null
            };
          })
        };

        console.log('Transformed result:', transformedResult);
        console.log('Sample question data:', transformedResult.questions[0]);
        console.log('Questions with audio_url:', transformedResult.questions.filter(q => q.audio_url));
        console.log('Questions with image_url:', transformedResult.questions.filter(q => q.image_url));
        setResult(transformedResult as ExamResult);
        return;
      }

      if (rpcData && rpcData.length > 0) {
        console.log('RPC result:', rpcData[0]);
        setResult(rpcData[0] as any as ExamResult);
      } else {
        setError('Không tìm thấy kết quả thi');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Có lỗi xảy ra khi tải kết quả thi');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Xuất sắc! 🎉';
    if (score >= 80) return 'Tốt! 👍';
    if (score >= 70) return 'Khá tốt! 👌';
    if (score >= 60) return 'Đạt yêu cầu! ✅';
    return 'Cần cải thiện! 📚';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Không có dữ liệu kết quả thi</AlertDescription>
        </Alert>
      </div>
    );
  }

  const wrongAnswers = result.questions.filter(q => !q.is_correct);
  const correctAnswers = result.questions.filter(q => q.is_correct);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kết quả thi</h1>
          <p className="text-muted-foreground">{result.exam_set_name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về Dashboard
          </Button>
          <Button onClick={() => navigate(`/exam-review/${sessionId}`)}>
            Xem chi tiết đáp án
          </Button>
          <Button variant="outline" onClick={() => navigate('/exams')}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Thi khác
          </Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm số</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}
            </div>
            <Badge variant={getScoreBadgeVariant(result.score)} className="mt-1">
              {getScoreMessage(result.score)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Câu đúng</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {result.correct_answers}/{result.total_questions}
            </div>
            <Progress 
              value={(result.correct_answers / result.total_questions) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(result.time_spent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hoàn thành lúc {new Date(result.completed_at).toLocaleString('vi-VN')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Câu sai</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {wrongAnswers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Cần ôn tập lại
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="wrong">Câu sai ({wrongAnswers.length})</TabsTrigger>
          <TabsTrigger value="all">Tất cả câu hỏi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan kết quả</CardTitle>
              <CardDescription>
                Phân tích chi tiết về bài thi của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {correctAnswers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Câu đúng</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {wrongAnswers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Câu sai</div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-semibold">
                  Tỷ lệ đúng: {((result.correct_answers / result.total_questions) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Thời gian trung bình mỗi câu: {formatTime(Math.round(result.time_spent / result.total_questions))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wrong" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Câu trả lời sai</CardTitle>
              <CardDescription>
                Ôn tập lại những câu bạn đã trả lời sai
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wrongAnswers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Chúc mừng! Bạn đã trả lời đúng tất cả câu hỏi! 🎉</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wrongAnswers.map((question, index) => (
                    <div key={question.question_id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="destructive">Câu {index + 1}</Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(question.time_spent)}
                        </Badge>
                      </div>
                      
                      <p className="font-medium">{question.question_text}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-red-600">Bạn chọn:</span>
                          <Badge variant="destructive">{question.user_answer}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-600">Đáp án đúng:</span>
                          <Badge variant="default">{question.correct_answer}</Badge>
                        </div>
                        {question.choices && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><strong>A.</strong> {question.choices.A}</div>
                            <div><strong>B.</strong> {question.choices.B}</div>
                            <div><strong>C.</strong> {question.choices.C}</div>
                            <div><strong>D.</strong> {question.choices.D}</div>
                          </div>
                        )}
                      </div>

                      {/* Giải thích */}
                      {question.explain_vi && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Giải thích:</h4>
                          <p className="text-sm text-blue-800">{question.explain_vi}</p>
                        </div>
                      )}

                      {/* Tags */}
                      {question.tags && (
                        <div className="flex flex-wrap gap-1">
                          {String(question.tags).split(',').map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Image display */}
                      {question.image_url && (
                        <div className="mt-3">
                          <img 
                            src={question.image_url} 
                            alt="Question image" 
                            className="max-w-full h-auto rounded-lg border"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                      )}

                      {/* Audio replay + Transcript */}
                      {(question.audio_url || question.transcript) && (
                        <div className="mt-3">
                          <SimpleAudioPlayer audioUrl={question.audio_url || ''} transcript={question.transcript} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả câu hỏi</CardTitle>
              <CardDescription>
                Xem lại tất cả câu hỏi và câu trả lời của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(() => {
                  // Group questions by passage_id
                  const groupedQuestions = result.questions.reduce((groups, question, index) => {
                    const passageId = question.passage_id || `single_${question.question_id}`;
                    if (!groups[passageId]) {
                      groups[passageId] = [];
                    }
                    groups[passageId].push({ ...question, originalIndex: index });
                    return groups;
                  }, {} as Record<string, Array<QuestionResult & { originalIndex: number }>>);

                  return Object.entries(groupedQuestions).map(([passageId, questions]) => {
                    const isPassage = passageId.startsWith('passage_') || questions.length > 1;
                    
                    return (
                      <div key={passageId} className="space-y-4">
                        {/* Passage Header */}
                        {isPassage && (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                              📖 Passage (Câu {questions[0].originalIndex + 1}-{questions[questions.length - 1].originalIndex + 1})
                            </h3>
                            
                            {/* Passage Image */}
                            {questions[0].passage_image_url && (
                              <div className="mb-4">
                                <img 
                                  src={questions[0].passage_image_url} 
                                  alt="Passage Image" 
                                  className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                                  style={{ maxHeight: '400px' }}
                                />
                              </div>
                            )}
                            
                            {/* Passage Audio */}
                            {questions[0].passage_audio_url && (
                              <div>
                                <SimpleAudioPlayer 
                                  audioUrl={questions[0].passage_audio_url} 
                                  transcript={questions[0].passage_transcript || ''} 
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Questions in this passage */}
                        <div className="space-y-4">
                          {questions.map((question) => (
                            <div key={question.question_id} className="p-4 border rounded-lg space-y-3">
                              <div className="flex items-start justify-between mb-2">
                                <Badge variant={question.is_correct ? "default" : "destructive"}>
                                  Câu {question.originalIndex + 1}
                                </Badge>
                                <div className="flex gap-2">
                                  <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTime(question.time_spent)}
                                  </Badge>
                                  {question.is_correct ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              </div>
                              
                              <p className="font-medium">{question.question_text}</p>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Bạn chọn:</span>
                                  <Badge variant={question.is_correct ? "default" : "destructive"}>
                                    {question.user_answer}
                                  </Badge>
                                </div>
                                {!question.is_correct && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-green-600">Đáp án đúng:</span>
                                    <Badge variant="default">{question.correct_answer}</Badge>
                                  </div>
                                )}
                                {question.choices && (
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><strong>A.</strong> {question.choices.A}</div>
                                    <div><strong>B.</strong> {question.choices.B}</div>
                                    <div><strong>C.</strong> {question.choices.C}</div>
                                    <div><strong>D.</strong> {question.choices.D}</div>
                                  </div>
                                )}
                              </div>

                              {/* Giải thích */}
                              {question.explain_vi && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <h4 className="font-medium text-blue-900 mb-1">Giải thích:</h4>
                                  <p className="text-sm text-blue-800">{question.explain_vi}</p>
                                </div>
                              )}

                              {/* Tags */}
                              {question.tags && (
                                <div className="flex flex-wrap gap-1">
                                  {String(question.tags).split(',').map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                                      {tag.trim()}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Question Image */}
                              {question.image_url && (
                                <div className="mt-3">
                                  <img 
                                    src={question.image_url} 
                                    alt="Question image" 
                                    className="max-w-full h-auto rounded-lg border"
                                    style={{ maxHeight: '300px' }}
                                  />
                                </div>
                              )}

                              {/* Question Audio + Transcript */}
                              {(question.audio_url || question.transcript) && (
                                <div className="mt-3">
                                  <SimpleAudioPlayer audioUrl={question.audio_url || ''} transcript={question.transcript} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamResult;
