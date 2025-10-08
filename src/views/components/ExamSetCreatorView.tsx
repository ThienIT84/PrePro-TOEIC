/**
 * ExamSetCreatorView
 * Pure UI component cho TOEIC Exam Set Creation
 * Nhận tất cả data và callbacks qua props
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Plus, 
  Save, 
  Eye, 
  Play, 
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  BookOpen,
  Headphones,
  FileImage,
  Users,
  Calendar,
  BarChart3,
  Search,
  X
} from 'lucide-react';
import { ExamPart, ExamTemplate, Question } from '@/controllers/exam/ExamSetCreatorController';

export interface ExamSetCreatorViewProps {
  // State
  activeTab: string;
  loading: boolean;
  saving: boolean;
  errors: string[];
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
  questionBank: Question[];
  selectedQuestions: string[];
  searchTerm: string;
  filterType: string;
  filterDifficulty: string;
  templates: ExamTemplate[];

  // Handlers
  onActiveTabChange: (tab: string) => void;
  onFormDataChange: (updates: Partial<ExamSetCreatorViewProps['formData']>) => void;
  onPartConfigUpdate: (partNumber: number, field: string, value: unknown) => void;
  onAddQuestionsToPart: (partNumber: number, questionIds: string[]) => void;
  onRemoveQuestionFromPart: (partNumber: number, questionId: string) => void;
  onAutoAssignQuestions: () => void;
  onCreateExamSet: () => void;
  onLoadTemplate: (template: ExamTemplate) => void;
  onSearchTermChange: (searchTerm: string) => void;
  onFilterTypeChange: (filterType: string) => void;
  onFilterDifficultyChange: (filterDifficulty: string) => void;
  onSelectedQuestionsChange: (selectedQuestions: string[]) => void;

  // Utility functions
  getFilteredQuestions: () => Question[];
  getStatistics: () => {
    totalQuestions: number;
    totalTime: number;
    listeningQuestions: number;
    readingQuestions: number;
    questionBankSize: number;
    selectedQuestions: number;
  };

  // Props
  className?: string;
}

export const ExamSetCreatorView: React.FC<ExamSetCreatorViewProps> = ({
  activeTab,
  loading,
  saving,
  errors,
  formData,
  examParts,
  questionBank,
  selectedQuestions,
  searchTerm,
  filterType,
  filterDifficulty,
  templates,
  onActiveTabChange,
  onFormDataChange,
  onPartConfigUpdate,
  onAddQuestionsToPart,
  onRemoveQuestionFromPart,
  onAutoAssignQuestions,
  onCreateExamSet,
  onLoadTemplate,
  onSearchTermChange,
  onFilterTypeChange,
  onFilterDifficultyChange,
  onSelectedQuestionsChange,
  getFilteredQuestions,
  getStatistics,
  className = '',
}) => {
  const statistics = getStatistics();
  const filteredQuestions = getFilteredQuestions();

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create TOEIC Exam Set</h1>
          <p className="text-muted-foreground">
            Create comprehensive TOEIC exam sets with question management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onAutoAssignQuestions}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Auto Assign
          </Button>
          <Button
            onClick={onCreateExamSet}
            disabled={saving || statistics.totalQuestions === 0}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Exam Set
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalTime}m</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listening Parts</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.listeningQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Parts</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.readingQuestions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={onActiveTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Exam Info</TabsTrigger>
          <TabsTrigger value="parts">Parts Config</TabsTrigger>
          <TabsTrigger value="questions">Question Bank</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Information</CardTitle>
              <CardDescription>
                Basic information about the exam set
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => onFormDataChange({ title: e.target.value })}
                    placeholder="e.g., TOEIC Practice Test #1"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Exam Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: unknown) => onFormDataChange({ type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full TOEIC (200 questions)</SelectItem>
                      <SelectItem value="mini">Mini TOEIC (50 questions)</SelectItem>
                      <SelectItem value="custom">Custom Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => onFormDataChange({ description: e.target.value })}
                  placeholder="Describe the exam content and purpose..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value: unknown) => onFormDataChange({ difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (400-500)</SelectItem>
                      <SelectItem value="medium">Medium (500-700)</SelectItem>
                      <SelectItem value="hard">Hard (700+)</SelectItem>
                      <SelectItem value="mixed">Mixed Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <Checkbox
                    checked={formData.allow_multiple_attempts}
                    onCheckedChange={(checked) => onFormDataChange({ allow_multiple_attempts: !!checked })}
                  />
                  <Label className="text-xs">Allow multiple attempts</Label>
                </div>

                <div>
                  <Label htmlFor="max_attempts">Max attempts (empty = unlimited)</Label>
                  <Input
                    id="max_attempts"
                    type="number"
                    value={formData.max_attempts}
                    onChange={(e) => onFormDataChange({ max_attempts: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    placeholder="e.g. 3"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: unknown) => onFormDataChange({ status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
              <CardDescription>
                Start with a pre-configured exam template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{template.totalQuestions} questions</span>
                        <span>{template.totalTime} minutes</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onLoadTemplate(template)}
                        className="w-full"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parts Configuration</CardTitle>
              <CardDescription>
                Configure each part of the TOEIC exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examParts.map((part) => (
                  <Card key={part.part} className={`${part.required ? 'border-blue-200' : 'border-gray-200'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm flex items-center gap-2">
                            Part {part.part}: {part.name}
                            {part.required && <Badge variant="default" className="text-xs">Required</Badge>}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {part.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{part.questions.length}/{part.questionCount} questions</span>
                          <span>{part.timeLimit}m</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label className="text-xs">Question Count</Label>
                          <Input
                            type="number"
                            value={part.questionCount}
                            onChange={(e) => onPartConfigUpdate(part.part, 'questionCount', parseInt(e.target.value) || 0)}
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Time Limit (minutes)</Label>
                          <Input
                            type="number"
                            value={part.timeLimit}
                            onChange={(e) => onPartConfigUpdate(part.part, 'timeLimit', parseInt(e.target.value) || 0)}
                            min="0"
                            max="60"
                          />
                        </div>
                        <div className="flex items-end">
                          <Checkbox
                            checked={part.required}
                            onCheckedChange={(checked) => onPartConfigUpdate(part.part, 'required', checked)}
                          />
                          <Label className="text-xs ml-2">Required</Label>
                        </div>
                      </div>

                      {/* Questions in this part */}
                      {part.questions.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Questions in Part {part.part}</Label>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {part.questions.map((question) => (
                              <div key={question.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                                <span className="truncate flex-1">{question.prompt_text}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRemoveQuestionFromPart(part.part, question.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Progress bar */}
                      <div className="mt-2">
                        <Progress 
                          value={(part.questions.length / part.questionCount) * 100} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Bank</CardTitle>
              <CardDescription>
                Browse and select questions for your exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Type</Label>
                    <Select value={filterType} onValueChange={onFilterTypeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="listening">Listening (Parts 1-4)</SelectItem>
                        <SelectItem value="reading">Reading (Parts 5-7)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Difficulty</Label>
                    <Select value={filterDifficulty} onValueChange={onFilterDifficultyChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredQuestions.map((question) => (
                    <div key={question.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Part {question.part}</Badge>
                          <Badge variant="secondary">{question.difficulty}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{question.prompt_text}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onSelectedQuestionsChange([...selectedQuestions, question.id]);
                            } else {
                              onSelectedQuestionsChange(selectedQuestions.filter(id => id !== question.id));
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Preview</CardTitle>
              <CardDescription>
                Review your exam configuration before creating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Exam Details</h4>
                    <p className="text-sm text-muted-foreground">Title: {formData.title}</p>
                    <p className="text-sm text-muted-foreground">Type: {formData.type}</p>
                    <p className="text-sm text-muted-foreground">Difficulty: {formData.difficulty}</p>
                    <p className="text-sm text-muted-foreground">Status: {formData.status}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Statistics</h4>
                    <p className="text-sm text-muted-foreground">Total Questions: {statistics.totalQuestions}</p>
                    <p className="text-sm text-muted-foreground">Total Time: {statistics.totalTime} minutes</p>
                    <p className="text-sm text-muted-foreground">Listening: {statistics.listeningQuestions}</p>
                    <p className="text-sm text-muted-foreground">Reading: {statistics.readingQuestions}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Parts Summary</h4>
                  <div className="space-y-2">
                    {examParts.map((part) => (
                      <div key={part.part} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">Part {part.part}: {part.name}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{part.questions.length}/{part.questionCount} questions</span>
                          <span>{part.timeLimit}m</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
