import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Headphones, 
  FileText, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  Volume2,
  BookOpen,
  FileImage,
  MessageSquare,
  Mic,
  PenTool,
  FileEdit,
  BookMarked
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

interface PartsConfigurationProps {
  examParts: ExamPart[];
  onPartConfigUpdate: (partNumber: number, field: string, value: any) => void;
  formData: {
    type: 'full' | 'mini' | 'custom';
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  };
}

const PartsConfiguration: React.FC<PartsConfigurationProps> = ({
  examParts,
  onPartConfigUpdate,
  formData
}) => {
  const getPartIcon = (part: number) => {
    switch (part) {
      case 1: return <FileImage className="h-5 w-5" />;
      case 2: return <MessageSquare className="h-5 w-5" />;
      case 3: return <Volume2 className="h-5 w-5" />;
      case 4: return <Mic className="h-5 w-5" />;
      case 5: return <PenTool className="h-5 w-5" />;
      case 6: return <FileEdit className="h-5 w-5" />;
      case 7: return <BookMarked className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getPartType = (part: number) => {
    if (part <= 4) return 'listening';
    return 'reading';
  };

  const getPartColor = (part: number) => {
    const type = getPartType(part);
    return type === 'listening' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getTotalQuestions = () => {
    return examParts.reduce((sum, part) => sum + (part.enabled ? part.questionCount : 0), 0);
  };

  const getTotalTime = () => {
    return examParts.reduce((sum, part) => sum + (part.enabled ? part.timeLimit : 0), 0);
  };

  const getListeningQuestions = () => {
    return examParts
      .filter(part => part.part <= 4 && part.enabled)
      .reduce((sum, part) => sum + part.questionCount, 0);
  };

  const getReadingQuestions = () => {
    return examParts
      .filter(part => part.part >= 5 && part.enabled)
      .reduce((sum, part) => sum + part.questionCount, 0);
  };

  const handleTogglePart = (partNumber: number) => {
    onPartConfigUpdate(partNumber, 'enabled', !examParts.find(p => p.part === partNumber)?.enabled);
  };

  const handleQuestionCountChange = (partNumber: number, value: string) => {
    const count = parseInt(value) || 0;
    onPartConfigUpdate(partNumber, 'questionCount', count);
  };

  const handleTimeLimitChange = (partNumber: number, value: string) => {
    const time = parseInt(value) || 0;
    onPartConfigUpdate(partNumber, 'timeLimit', time);
  };

  const applyTemplate = (template: 'full' | 'mini') => {
    const templates = {
      full: [
        { part: 1, questionCount: 6, timeLimit: 5 },
        { part: 2, questionCount: 25, timeLimit: 8 },
        { part: 3, questionCount: 39, timeLimit: 15 },
        { part: 4, questionCount: 30, timeLimit: 17 },
        { part: 5, questionCount: 30, timeLimit: 20 },
        { part: 6, questionCount: 16, timeLimit: 12 },
        { part: 7, questionCount: 54, timeLimit: 43 }
      ],
      mini: [
        { part: 1, questionCount: 3, timeLimit: 3 },
        { part: 2, questionCount: 5, timeLimit: 5 },
        { part: 3, questionCount: 7, timeLimit: 7 },
        { part: 4, questionCount: 5, timeLimit: 5 },
        { part: 5, questionCount: 10, timeLimit: 8 },
        { part: 6, questionCount: 5, timeLimit: 5 },
        { part: 7, questionCount: 15, timeLimit: 12 }
      ]
    };

    templates[template].forEach(({ part, questionCount, timeLimit }) => {
      onPartConfigUpdate(part, 'questionCount', questionCount);
      onPartConfigUpdate(part, 'timeLimit', timeLimit);
      onPartConfigUpdate(part, 'enabled', true);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Parts Configuration</CardTitle>
          <CardDescription>
            Configure which TOEIC parts to include and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{getTotalQuestions()}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{getTotalTime()}</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Headphones className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{getListeningQuestions()}</div>
              <div className="text-sm text-muted-foreground">Listening</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{getReadingQuestions()}</div>
              <div className="text-sm text-muted-foreground">Reading</div>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => applyTemplate('full')}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Apply Full TOEIC Template
            </Button>
            <Button
              variant="outline"
              onClick={() => applyTemplate('mini')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Apply Mini TOEIC Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visual Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>TOEIC Parts Timeline</CardTitle>
          <CardDescription>
            Visual representation of the exam structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Listening Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Headphones className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-600">Listening Section (Parts 1-4)</h3>
                <Badge variant="outline" className="text-blue-600">
                  {getListeningQuestions()} questions
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examParts.filter(part => part.part <= 4).map((part) => (
                  <Card 
                    key={part.part} 
                    className={`transition-all ${
                      part.enabled ? 'ring-2 ring-primary' : 'opacity-50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getPartIcon(part.part)}
                          <div>
                            <h4 className="font-semibold">Part {part.part}</h4>
                            <p className="text-sm text-muted-foreground">{part.name}</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={part.enabled}
                          onCheckedChange={() => handleTogglePart(part.part)}
                        />
                      </div>
                      
                      {part.enabled && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`questions-${part.part}`} className="text-xs">
                                Questions
                              </Label>
                              <Input
                                id={`questions-${part.part}`}
                                type="number"
                                value={part.questionCount}
                                onChange={(e) => handleQuestionCountChange(part.part, e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`time-${part.part}`} className="text-xs">
                                Time (min)
                              </Label>
                              <Input
                                id={`time-${part.part}`}
                                type="number"
                                value={part.timeLimit}
                                onChange={(e) => handleTimeLimitChange(part.part, e.target.value)}
                                className="h-8"
                              />
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {part.description}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Reading Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-600">Reading Section (Parts 5-7)</h3>
                <Badge variant="outline" className="text-green-600">
                  {getReadingQuestions()} questions
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {examParts.filter(part => part.part >= 5).map((part) => (
                  <Card 
                    key={part.part} 
                    className={`transition-all ${
                      part.enabled ? 'ring-2 ring-primary' : 'opacity-50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getPartIcon(part.part)}
                          <div>
                            <h4 className="font-semibold">Part {part.part}</h4>
                            <p className="text-sm text-muted-foreground">{part.name}</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={part.enabled}
                          onCheckedChange={() => handleTogglePart(part.part)}
                        />
                      </div>
                      
                      {part.enabled && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`questions-${part.part}`} className="text-xs">
                                Questions
                              </Label>
                              <Input
                                id={`questions-${part.part}`}
                                type="number"
                                value={part.questionCount}
                                onChange={(e) => handleQuestionCountChange(part.part, e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`time-${part.part}`} className="text-xs">
                                Time (min)
                              </Label>
                              <Input
                                id={`time-${part.part}`}
                                type="number"
                                value={part.timeLimit}
                                onChange={(e) => handleTimeLimitChange(part.part, e.target.value)}
                                className="h-8"
                              />
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {part.description}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation */}
      {getTotalQuestions() === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please enable at least one part and configure the number of questions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PartsConfiguration;

