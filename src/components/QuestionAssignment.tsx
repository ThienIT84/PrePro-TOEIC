import React, { useState, useMemo, useEffect } from 'react';
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
import { t } from '@/lib/i18n';

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
  const [filterPart, setFilterPart] = useState<string>('all');
  const [filterMedia, setFilterMedia] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  // Debounce search term
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('manual');

  const filteredQuestions = useMemo(() => {
    const tagsQuery = filterTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const list = questionBank
      .filter(q => {
        // Search by prompt or tags
        const text = (q.prompt_text || '').toLowerCase();
        const tagsText = (typeof q.tags === 'string' ? q.tags : Array.isArray(q.tags) ? q.tags.join(',') : '').toLowerCase();
        const matchesSearch = !debouncedSearchTerm || text.includes(debouncedSearchTerm) || tagsText.includes(debouncedSearchTerm);

        // Type + Difficulty
        const matchesType = filterType === 'all' || q.type === filterType;
        const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;

        // Part
        const matchesPart = filterPart === 'all' || String(q.part) === filterPart;

        // Media
        const hasAudio = Boolean((q as any).audio_url);
        const hasImage = Boolean((q as any).image_url);
        const hasPassage = Boolean((q as any).passage_id);
        const matchesMedia =
          filterMedia === 'all' ||
          (filterMedia === 'audio' && hasAudio) ||
          (filterMedia === 'image' && hasImage) ||
          (filterMedia === 'passage' && hasPassage) ||
          (filterMedia === 'nomedia' && !hasAudio && !hasImage && !hasPassage);

        // Tags include any
        const qTags: string[] = typeof q.tags === 'string' ? q.tags.split(',').map((t: string) => t.trim().toLowerCase()) : Array.isArray(q.tags) ? q.tags.map((t: any) => String(t).toLowerCase()) : [];
        const matchesTags = tagsQuery.length === 0 || tagsQuery.some(tg => qTags.includes(tg));

        return matchesSearch && matchesType && matchesDifficulty && matchesPart && matchesMedia && matchesTags;
      })
      .sort((a: any, b: any) => {
        if (sortOrder === 'newest') return (b.created_at ? Date.parse(b.created_at) : 0) - (a.created_at ? Date.parse(a.created_at) : 0);
        if (sortOrder === 'oldest') return (a.created_at ? Date.parse(a.created_at) : 0) - (b.created_at ? Date.parse(b.created_at) : 0);
        // fallback: by prompt length (as proxy for complexity)
        if (sortOrder === 'shortest') return (a.prompt_text || '').length - (b.prompt_text || '').length;
        if (sortOrder === 'longest') return (b.prompt_text || '').length - (a.prompt_text || '').length;
        return 0;
      });

    return list;
  }, [questionBank, debouncedSearchTerm, filterType, filterDifficulty, filterPart, filterMedia, filterTags, sortOrder]);

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
            {t('qa.progress_title')}
          </CardTitle>
          <CardDescription>
            {t('qa.progress_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.totalAssigned}</div>
              <div className="text-sm text-muted-foreground">{t('qa.assigned')}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.totalNeeded}</div>
              <div className="text-sm text-muted-foreground">{t('qa.needed')}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{stats.totalRemaining}</div>
              <div className="text-sm text-muted-foreground">{t('qa.remaining')}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{Math.round(stats.completion)}%</div>
              <div className="text-sm text-muted-foreground">{t('qa.complete')}</div>
            </div>
          </div>

          {/* Auto Assignment */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={onAutoAssignQuestions}
              disabled={loading || stats.totalRemaining === 0}
              className="flex items-center gap-2"
              title={t('qa.auto_assign_tooltip')}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {t('qa.auto_assign')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('manual')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              {t('qa.manual_assignment')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Bank Analysis removed as requested */}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">{t('qa.manual_assignment')}</TabsTrigger>
          <TabsTrigger value="overview">{t('qa.overview')}</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          {/* Question Bank */}
          <Card>
            <CardHeader>
              <CardTitle>{t('qa.question_bank')}</CardTitle>
              <CardDescription>
                {t('qa.select_questions_hint')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-4 flex-wrap">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('qa.search_questions_placeholder')}
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
                    <SelectItem value="all">{t('qa.all_types')}</SelectItem>
                    <SelectItem value="listening">{t('drill.listening')}</SelectItem>
                    <SelectItem value="reading">{t('drill.reading')}</SelectItem>
                    <SelectItem value="vocab">{t('drill.vocabulary')}</SelectItem>
                    <SelectItem value="grammar">{t('drill.grammar')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('qa.all_levels')}</SelectItem>
                    <SelectItem value="easy">{t('difficulty.easy')}</SelectItem>
                    <SelectItem value="medium">{t('difficulty.medium')}</SelectItem>
                    <SelectItem value="hard">{t('difficulty.hard')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPart} onValueChange={setFilterPart}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Part" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả Part</SelectItem>
                    {[1,2,3,4,5,6,7].map(p => (
                      <SelectItem key={p} value={String(p)}>Part {p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterMedia} onValueChange={setFilterMedia}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Media" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả media</SelectItem>
                    <SelectItem value="audio">Có audio</SelectItem>
                    <SelectItem value="image">Có ảnh</SelectItem>
                    <SelectItem value="passage">Có đoạn văn</SelectItem>
                    <SelectItem value="nomedia">Không media</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Tags (phân tách bằng dấu phẩy)"
                  value={filterTags}
                  onChange={(e) => setFilterTags(e.target.value)}
                  className="w-64"
                />
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                    <SelectItem value="shortest">Câu ngắn</SelectItem>
                    <SelectItem value="longest">Câu dài</SelectItem>
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
                        <span>{t('qa.progress')}</span>
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
                      <h4 className="font-medium text-sm">{t('qa.assigned_questions')} ({part.questions.length})</h4>
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
                      {t('qa.add_selected')} ({selectedQuestions.length})
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
                      {part.remaining > 0 ? `${part.remaining} ${t('qa.questions_needed')}` : t('qa.complete')}
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
              <div className="text-sm text-muted-foreground">{t('qa.complete_parts')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {partStats.filter(p => p.remaining > 0).length}
                  </div>
              <div className="text-sm text-muted-foreground">{t('qa.incomplete_parts')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalAssigned}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('qa.total_assigned')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.totalRemaining}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('qa.still_needed')}</div>
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
