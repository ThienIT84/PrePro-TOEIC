import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  RotateCcw,
  Headphones,
  FileText,
  BookOpen,
  Eye,
  Flag,
  Pause,
  Loader2
} from 'lucide-react';
import { ExamReviewController, ExamSession, Question, QuestionReview, ExamStatistics } from '@/controllers/exam/ExamReviewController';
import SimpleAudioPlayer from '../SimpleAudioPlayer';
import TimeStatistics from '../TimeStatistics';

interface ExamReviewViewProps {
  controller: ExamReviewController;
  state: {
  examSession: ExamSession | null;
    examSet: any;
  questions: Question[];
    questionReviews: QuestionReview[];
    userAnswers: Record<string, any>;
    currentQuestionIndex: number;
  loading: boolean;
  error: string | null;
    statistics: ExamStatistics | null;
  };
  onLoadExamData: (sessionId: string) => void;
  onSetCurrentQuestionIndex: (index: number) => void;
  onGoToNextQuestion: () => void;
  onGoToPreviousQuestion: () => void;
  onGoToQuestion: (index: number) => void;
  onClearError: () => void;
}

export const ExamReviewView: React.FC<ExamReviewViewProps> = ({
  controller,
  state,
  onLoadExamData,
  onSetCurrentQuestionIndex,
  onGoToNextQuestion,
  onGoToPreviousQuestion,
  onGoToQuestion,
  onClearError
}) => {
  const navigate = useNavigate();

  const {
    examSession,
    examSet,
    questions,
    questionReviews,
    userAnswers,
    currentQuestionIndex,
    loading,
    error,
    statistics
  } = state;

  // Event Handlers
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRetakeExam = () => {
    if (examSet) {
      navigate(`/exam/${examSet.id}`);
    }
  };

  // Render Methods
  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading exam review...</p>
      </div>
      </div>
    );

  const renderError = () => (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button onClick={onClearError} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    );

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {statistics.correctAnswers}
        </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {statistics.incorrectAnswers}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {statistics.accuracy.toFixed(1)}%
          </div>
              <div className="text-sm text-gray-600">Accuracy</div>
        </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(statistics.averageTimePerQuestion)}s
      </div>
              <div className="text-sm text-gray-600">Avg Time</div>
                  </div>
                </div>
                
          <div className="space-y-4">
            <h4 className="font-medium">Part Performance</h4>
            {Object.entries(statistics.partBreakdown).map(([part, data]) => (
              <div key={part} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Part {part}</span>
                  <span>{data.correct}/{data.total} ({data.accuracy.toFixed(1)}%)</span>
                </div>
                <Progress value={data.accuracy} className="h-2" />
                                </div>
                              ))}
                            </div>
                  </CardContent>
                </Card>
    );
  };

  const renderQuestionNavigation = () => (
                <Card className="mb-6">
                        <CardHeader>
        <CardTitle>Question Navigation</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {questions.length}
        </CardDescription>
                        </CardHeader>
                        <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {questions.map((_, index) => {
            const review = questionReviews[index];
            const isCurrent = index === currentQuestionIndex;
            const isCorrect = review?.isCorrect;
            const isAnswered = review?.userAnswer;
                              
                              return (
              <Button
                key={index}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => onGoToQuestion(index)}
                className={`w-10 h-10 ${
                  isCorrect ? 'bg-green-100 text-green-700 border-green-300' :
                  isAnswered && !isCorrect ? 'bg-red-100 text-red-700 border-red-300' :
                  !isAnswered ? 'bg-gray-100 text-gray-700 border-gray-300' :
                  ''
                }`}
              >
                {index + 1}
              </Button>
                              );
                            })}
                          </div>

        <div className="flex justify-between">
          <Button
            onClick={onGoToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={onGoToNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            variant="outline"
          >
            Next
          </Button>
                            </div>
                        </CardContent>
                      </Card>
                    );

  const renderCurrentQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentReview = questionReviews[currentQuestionIndex];

    if (!currentQuestion || !currentReview) return null;

    const audioUrl = controller.getAudioUrl(currentQuestion);
    const analysis = controller.getQuestionAnalysis(currentQuestion);

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Part {currentQuestion.part}</Badge>
              <Badge variant="outline">{analysis.difficulty}</Badge>
              <Badge variant="outline">{analysis.type}</Badge>
                </div>
            <div className="flex items-center gap-2">
              {audioUrl && (
                <SimpleAudioPlayer src={audioUrl} />
              )}
              <Badge variant={currentReview.isCorrect ? "default" : "destructive"}>
                {currentReview.isCorrect ? 'Correct' : 'Incorrect'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                    {/* Question Text */}
            <div>
              <h3 className="font-medium mb-2">Question:</h3>
              <p className="text-gray-700">{currentQuestion.prompt_text}</p>
                    </div>

                    {/* Choices */}
            <div className="space-y-2">
              <h4 className="font-medium">Choices:</h4>
              {Object.entries(currentQuestion.choices).map(([choice, text]) => {
                const isCorrect = choice === currentQuestion.correct_choice;
                const isUserAnswer = currentReview.userAnswer?.user_answer === choice;
                        
                        return (
                          <div
                            key={choice}
                    className={`p-3 rounded-lg border ${
                      isCorrect ? 'bg-green-50 border-green-300' :
                      isUserAnswer && !isCorrect ? 'bg-red-50 border-red-300' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{choice}.</span>
                      <span>{text}</span>
                      {isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {isUserAnswer && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

            {/* User Answer */}
            {currentReview.userAnswer && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Your Answer:</h4>
                <p className="text-blue-700">
                  {currentReview.userAnswer.user_answer} 
                  {currentReview.isCorrect ? ' (Correct!)' : ' (Incorrect)'}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Time spent: {currentReview.timeSpent}s
                            </p>
                          </div>
                        )}
                        
            {/* Explanation */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Explanation:</h4>
              <p className="text-gray-700">{currentReview.explanation}</p>
                      </div>

            {/* Skills */}
            <div>
              <h4 className="font-medium mb-2">Skills Tested:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
    );
  };

  const renderPerformanceAnalysis = () => {
    const analysis = controller.getPerformanceAnalysis();

    return (
            <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
            {analysis.strengths.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2">Strengths:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-green-600">{strength}</li>
                  ))}
                </ul>
                      </div>
            )}

            {analysis.weaknesses.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">Areas for Improvement:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-red-600">{weakness}</li>
                  ))}
                </ul>
                      </div>
            )}

            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-blue-600">{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
                </div>
              </CardContent>
            </Card>
    );
  };

  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleBackToDashboard} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
                </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exam Review</h1>
              <p className="text-gray-600">
                {examSet?.title || 'TOEIC Practice Test'} - {examSession?.completed_at ? 'Completed' : 'In Progress'}
              </p>
            </div>
          </div>
          <Button onClick={handleRetakeExam} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Exam
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {renderStatistics()}
        {renderQuestionNavigation()}
        {renderCurrentQuestion()}
        {renderPerformanceAnalysis()}
      </div>
    </div>
  );
};