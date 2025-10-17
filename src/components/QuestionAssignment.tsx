import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Zap, 
  Database, 
  Target, 
  CheckCircle, 
  X, 
  Plus, 
  Minus,
  Headphones,
  FileText,
  AlertCircle,
  Loader2,
  BarChart3,
  Users,
  Clock,
  BookOpen
} from 'lucide-react';
import type { Question } from '@/types';

interface ExamPart {
  part: number;
  name: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  questions: Question[];
  required: boolean;
  enabled: boolean;
}

interface QuestionAssignmentProps {
  examParts: ExamPart[];
  questionBank: Question[];
  onAddQuestionsToPart: (partNumber: number, questionIds: string[]) => void;
  onRemoveQuestionFromPart: (partNumber: number, questionId: string) => void;
  onAutoAssignQuestions: () => void;
  loading: boolean;
}

const QuestionAssignment: React.FC<QuestionAssignmentProps> = ({
  examParts,
  questionBank,
  onAddQuestionsToPart,
  onRemoveQuestionFromPart,
  onAutoAssignQuestions,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('manual');

  const filteredQuestions = useMemo(() => {
    return questionBank.filter(question => {
      const matchesSearch = (question.prompt_text?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (question.tags?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || question.type === filterType;
      const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
      
      return matchesSearch && matchesType && matchesDifficulty;
    });
  }, [questionBank, searchTerm, filterType, filterDifficulty]);

  const getQuestionBankStats = () => {
    const stats = {
      total: questionBank.length,
      byPart: {} as Record<number, number>,
      byDifficulty: {} as Record<string, number>,
      byPartAndDifficulty: {} as Record<string, Record<string, number>>
    };

    questionBank.forEach(q => {
      // Count by part
      stats.byPart[q.part] = (stats.byPart[q.part] || 0) + 1;
      
      // Count by difficulty
      stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
      
      // Count by part and difficulty
      if (!stats.byPartAndDifficulty[q.part]) {
        stats.byPartAndDifficulty[q.part] = {};
      }
      stats.byPartAndDifficulty[q.part][q.difficulty] = 
        (stats.byPartAndDifficulty[q.part][q.difficulty] || 0) + 1;
    });

    return stats;
  };

  const getPartStatistics = () => {
    return examParts.map(part => ({
      ...part,
      assigned: part.questions.length,
      needed: part.questionCount,
      remaining: part.questionCount - part.questions.length,
      completion: part.questionCount > 0 ? (part.questions.length / part.questionCount) * 100 : 0
    }));
  };

  const getTotalStatistics = () => {
    const stats = getPartStatistics();
    const totalAssigned = stats.reduce((sum, part) => sum + part.assigned, 0);
    const totalNeeded = stats.reduce((sum, part) => sum + part.needed, 0);
    const totalRemaining = totalNeeded - totalAssigned;
    const completion = totalNeeded > 0 ? (totalAssigned / totalNeeded) * 100 : 0;

    return {
      totalAssigned,
      totalNeeded,
      totalRemaining,
      completion
    };
  };

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleAddToPart = (partNumber: number) => {
    if (selectedQuestions.length > 0) {
      onAddQuestionsToPart(partNumber, selectedQuestions);
      setSelectedQuestions([]);
    }
  };

  const handleRemoveFromPart = (partNumber: number, questionId: string) => {
    onRemoveQuestionFromPart(partNumber, questionId);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'listening': return <Headphones className="h-4 w-4 text-blue-600" />;
      case 'reading': return <FileText className="h-4 w-4 text-green-600" />;
      case 'vocab': return <BookOpen className="h-4 w-4 text-purple-600" />;
      case 'grammar': return <Target className="h-4 w-4 text-orange-600" />;
      default: return <Database className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = getTotalStatistics();
  const partStats = getPartStatistics();

  return (
    <div className="space-y-6">
      {/* Statistics Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Question Assignment Progress
          </CardTitle>
          <CardDescription>
            Assign questions to each part of your exam
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.totalAssigned}</div>
              <div className="text-sm text-muted-foreground">Assigned</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.totalNeeded}</div>
              <div className="text-sm text-muted-foreground">Needed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{stats.totalRemaining}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{Math.round(stats.completion)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>

          {/* Auto Assignment */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={onAutoAssignQuestions}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Auto Assign (Force All)
            </Button>
            <Button
              onClick={() => {
                // Force mixed difficulty assignment
                const updatedParts = examParts.map(part => {
                  const allQuestionsForPart = questionBank.filter(q => q.part === part.part);
                  const shuffled = [...allQuestionsForPart].sort(() => 0.5 - Math.random());
                  const selectedQuestions = shuffled.slice(0, part.questionCount);
                  return { ...part, questions: selectedQuestions };
                });
                
                // Update parent component
                examParts.forEach((part, index) => {
                  if (updatedParts[index].questions.length > 0) {
                    onAddQuestionsToPart(part.part, updatedParts[index].questions.map(q => q.id));
                  }
                });
                
                toast({
                  title: 'Force Mixed Assignment Complete',
                  description: 'Assigned questions from all difficulties'
                });
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Force Mixed Difficulty
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('manual')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Manual Assignment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Question Bank Analysis
          </CardTitle>
          <CardDescription className="text-xs">
            Detailed breakdown of available questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Total Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 border rounded">
                <div className="font-bold">{getQuestionBankStats().total}</div>
                <div className="text-muted-foreground">Total Questions</div>
              </div>
              <div className="text-center p-2 border rounded">
                <div className="font-bold">{Object.keys(getQuestionBankStats().byDifficulty).length}</div>
                <div className="text-muted-foreground">Difficulties</div>
              </div>
              <div className="text-center p-2 border rounded">
                <div className="font-bold">{Object.keys(getQuestionBankStats().byPart).length}</div>
                <div className="text-muted-foreground">Parts</div>
              </div>
              <div className="text-center p-2 border rounded">
                <div className="font-bold">{stats.totalNeeded}</div>
                <div className="text-muted-foreground">Needed</div>
              </div>
            </div>

            {/* By Part */}
            <div>
              <h4 className="font-medium text-sm mb-2">Questions by Part:</h4>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {[1,2,3,4,5,6,7].map(part => (
                  <div key={part} className="text-center p-2 border rounded">
                    <div className="font-bold">Part {part}</div>
                    <div className="text-muted-foreground">{getQuestionBankStats().byPart[part] || 0}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Difficulty */}
            <div>
              <h4 className="font-medium text-sm mb-2">Questions by Difficulty:</h4>
              <div className="flex gap-2 text-xs">
                {Object.entries(getQuestionBankStats().byDifficulty).map(([difficulty, count]) => (
                  <div key={difficulty} className="text-center p-2 border rounded">
                    <div className="font-bold">{difficulty}</div>
                    <div className="text-muted-foreground">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div>
              <h4 className="font-medium text-sm mb-2">Part × Difficulty Matrix:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Part</th>
                      {Object.keys(getQuestionBankStats().byDifficulty).map(diff => (
                        <th key={diff} className="text-center p-1">{diff}</th>
                      ))}
                      <th className="text-center p-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1,2,3,4,5,6,7].map(part => (
                      <tr key={part} className="border-b">
                        <td className="p-1 font-medium">Part {part}</td>
                        {Object.keys(getQuestionBankStats().byDifficulty).map(diff => (
                          <td key={diff} className="text-center p-1">
                            {getQuestionBankStats().byPartAndDifficulty[part]?.[diff] || 0}
                          </td>
                        ))}
                        <td className="text-center p-1 font-medium">
                          {getQuestionBankStats().byPart[part] || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Assignment</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          {/* Question Bank */}
          <Card>
            <CardHeader>
              <CardTitle>Question Bank</CardTitle>
              <CardDescription>
                Select questions to assign to exam parts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="listening">Listening</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="vocab">Vocabulary</SelectItem>
                    <SelectItem value="grammar">Grammar</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      {selectedQuestions.length} of {filteredQuestions.length} selected
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedQuestions([])}
                    variant="outline"
                  >
                    Clear Selection
                  </Button>
                </div>

                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedQuestions.includes(question.id) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleQuestionSelect(question.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => handleQuestionSelect(question.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getQuestionTypeIcon(question.type)}
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline">Part {question.part}</Badge>
                        </div>
                        <p className="text-sm line-clamp-2">{question.prompt_text || 'No question text'}</p>
                        <div className="flex gap-2 mt-2">
                          {(typeof question.tags === 'string' ? question.tags.split(',') : question.tags || []).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {typeof tag === 'string' ? tag.trim() : tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parts Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examParts.filter(part => part.enabled).map((part) => {
              const partStat = partStats.find(p => p.part === part.part);
              return (
                <Card key={part.part}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {part.part <= 4 ? (
                          <Headphones className="h-5 w-5 text-blue-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-green-600" />
                        )}
                        <span>Part {part.part}: {part.name}</span>
                      </div>
                      <Badge variant="outline">
                        {partStat?.assigned || 0}/{partStat?.needed || 0}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{part.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(partStat?.completion || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${partStat?.completion || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Assigned Questions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Assigned Questions ({part.questions.length})</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {part.questions.map((question, index) => (
                          <div
                            key={question.id}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                          >
                            <span className="truncate flex-1">
                              {index + 1}. {(question.prompt_text || '').substring(0, 50)}...
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveFromPart(part.part, question.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Questions Button */}
                    <Button
                      onClick={() => handleAddToPart(part.part)}
                      disabled={selectedQuestions.length === 0}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Selected Questions ({selectedQuestions.length})
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {/* Parts Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partStats.map((part) => (
              <Card key={part.part}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {part.part <= 4 ? (
                        <Headphones className="h-5 w-5 text-blue-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-green-600" />
                      )}
                      <span className="font-semibold">Part {part.part}</span>
                    </div>
                    <Badge variant={part.remaining === 0 ? "default" : "secondary"}>
                      {part.assigned}/{part.needed}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{part.name}</span>
                      <span>{Math.round(part.completion)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          part.remaining === 0 ? 'bg-green-500' : 'bg-primary'
                        }`}
                        style={{ width: `${part.completion}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {part.remaining > 0 ? `${part.remaining} questions needed` : 'Complete'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {partStats.filter(p => p.remaining === 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Complete Parts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {partStats.filter(p => p.remaining > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Incomplete Parts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalAssigned}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.totalRemaining}
                  </div>
                  <div className="text-sm text-muted-foreground">Still Needed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation */}
      {stats.totalRemaining > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You still need to assign {stats.totalRemaining} more questions to complete the exam.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default QuestionAssignment;
