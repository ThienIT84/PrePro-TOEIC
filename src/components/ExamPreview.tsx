import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  Clock, 
  Headphones, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Users,
  BookOpen,
  BarChart3,
  Play,
  Eye,
  Settings
} from 'lucide-react';

interface ExamPart {
  part: number;
  name: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  questions: any[];
  required: boolean;
  enabled: boolean;
}

interface ExamPreviewProps {
  formData: {
    title: string;
    description: string;
    type: 'full' | 'mini' | 'custom';
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    status: 'draft' | 'active' | 'inactive';
    allow_multiple_attempts: boolean;
    max_attempts: number | '';
  };
  examParts: ExamPart[];
  statistics: {
    totalQuestions: number;
    totalTime: number;
    listeningQuestions: number;
    readingQuestions: number;
    questionBankSize: number;
    selectedQuestions: number;
  };
}

const ExamPreview: React.FC<ExamPreviewProps> = ({
  formData,
  examParts,
  statistics
}) => {
  const getPartIcon = (part: number) => {
    switch (part) {
      case 1: return '🖼️';
      case 2: return '💬';
      case 3: return '🎧';
      case 4: return '🎤';
      case 5: return '✏️';
      case 6: return '📝';
      case 7: return '📖';
      default: return '📋';
    }
  };

  const getPartType = (part: number) => {
    return part <= 4 ? 'listening' : 'reading';
  };

  const getPartColor = (part: number) => {
    const type = getPartType(part);
    return type === 'listening' ? 'text-blue-600' : 'text-green-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'mixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Target className="h-5 w-5" />;
      case 'mini': return <BookOpen className="h-5 w-5" />;
      case 'custom': return <Settings className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const enabledParts = examParts.filter(part => part.enabled);
  const listeningParts = enabledParts.filter(part => part.part <= 4);
  const readingParts = enabledParts.filter(part => part.part >= 5);

  const isComplete = statistics.totalQuestions > 0 && 
                    enabledParts.every(part => part.questions.length >= part.questionCount);

  return (
    <div className="space-y-6">
      {/* Exam Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Exam Preview
          </CardTitle>
          <CardDescription>
            Review your exam configuration before creating
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{formData.title}</h3>
                <p className="text-muted-foreground">{formData.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className="flex items-center gap-1">
                  {getTypeIcon(formData.type)}
                  {formData.type.toUpperCase()} TOEIC
                </Badge>
                <Badge className={getDifficultyColor(formData.difficulty)}>
                  {formData.difficulty.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(formData.status)}>
                  {formData.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Multiple attempts: {formData.allow_multiple_attempts ? 'Yes' : 'No'}</span>
                </div>
                {formData.allow_multiple_attempts && formData.max_attempts && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Max attempts: {formData.max_attempts}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <h4 className="font-semibold">Exam Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <div className="text-xl font-bold">{statistics.totalQuestions}</div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <div className="text-xl font-bold">{statistics.totalTime}</div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Headphones className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <div className="text-xl font-bold">{statistics.listeningQuestions}</div>
                  <div className="text-xs text-muted-foreground">Listening</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <FileText className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <div className="text-xl font-bold">{statistics.readingQuestions}</div>
                  <div className="text-xs text-muted-foreground">Reading</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listening Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Headphones className="h-5 w-5" />
              Listening Section
            </CardTitle>
            <CardDescription>
              Parts 1-4 • {listeningParts.reduce((sum, part) => sum + part.questions.length, 0)} questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {listeningParts.map((part) => (
                <div key={part.part} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPartIcon(part.part)}</span>
                    <div>
                      <div className="font-medium">Part {part.part}: {part.name}</div>
                      <div className="text-sm text-muted-foreground">{part.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{part.questions.length}/{part.questionCount}</div>
                    <div className="text-xs text-muted-foreground">{part.timeLimit} min</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reading Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <FileText className="h-5 w-5" />
              Reading Section
            </CardTitle>
            <CardDescription>
              Parts 5-7 • {readingParts.reduce((sum, part) => sum + part.questions.length, 0)} questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {readingParts.map((part) => (
                <div key={part.part} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPartIcon(part.part)}</span>
                    <div>
                      <div className="font-medium">Part {part.part}: {part.name}</div>
                      <div className="text-sm text-muted-foreground">{part.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{part.questions.length}/{part.questionCount}</div>
                    <div className="text-xs text-muted-foreground">{part.timeLimit} min</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Parts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Parts Configuration</CardTitle>
          <CardDescription>
            Complete breakdown of all exam parts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Part</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-center p-2">Questions</th>
                  <th className="text-center p-2">Time</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {examParts.map((part) => (
                  <tr key={part.part} className="border-b">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPartIcon(part.part)}</span>
                        <span className="font-medium">Part {part.part}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{part.name}</div>
                        <div className="text-sm text-muted-foreground">{part.description}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={getPartType(part.part) === 'listening' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                        {getPartType(part.part)}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <div className="font-semibold">{part.questions.length}/{part.questionCount}</div>
                      {part.questions.length < part.questionCount && (
                        <div className="text-xs text-red-600">
                          -{part.questionCount - part.questions.length}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-center">{part.timeLimit} min</td>
                    <td className="p-2 text-center">
                      {part.enabled ? (
                        part.questions.length >= part.questionCount ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Incomplete
                          </Badge>
                        )
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Validation Messages */}
      {!isComplete && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Exam not ready for creation</div>
            <div className="text-sm">
              Some parts are missing questions. Please complete the question assignment step.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isComplete && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Exam ready for creation!</div>
            <div className="text-sm">
              All parts have been configured with the required number of questions.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sample Question Preview */}
      {enabledParts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Sample Questions Preview
            </CardTitle>
            <CardDescription>
              Preview of questions from each part
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enabledParts.slice(0, 3).map((part) => (
                <div key={part.part} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getPartIcon(part.part)}</span>
                    <span className="font-semibold">Part {part.part}: {part.name}</span>
                    <Badge variant="outline">{part.questions.length} questions</Badge>
                  </div>
                  
                  {part.questions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Sample Question:</div>
                      <div className="p-3 bg-muted/50 rounded text-sm">
                        {part.questions[0].prompt_text || part.questions[0].question || 'No question text'}
                      </div>
                      {part.questions[0].choices && (
                        <div className="text-xs text-muted-foreground">
                          Choices: {typeof part.questions[0].choices === 'object' 
                            ? Object.values(part.questions[0].choices).join(', ')
                            : Array.isArray(part.questions[0].choices) 
                              ? part.questions[0].choices.join(', ')
                              : String(part.questions[0].choices)
                          }
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No questions assigned yet
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamPreview;
