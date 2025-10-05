import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Question } from '@/types';
import QuickQuestionSetup from './QuickQuestionSetup';

interface ExamSet {
  id: string;
  title: string;
  description: string;
  type: 'full' | 'mini' | 'custom';
  total_questions: number;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  status: 'draft' | 'active' | 'inactive';
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ExamPart {
  part: number;
  name: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  questions: Question[];
  required: boolean;
}

interface ExamTemplate {
  id: string;
  name: string;
  type: 'full' | 'mini' | 'custom';
  description: string;
  parts: ExamPart[];
  totalQuestions: number;
  totalTime: number;
}

const EnhancedExamSetCreator: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'full' as const,
    difficulty: 'medium' as const,
    status: 'draft' as const,
    allow_multiple_attempts: true,
    max_attempts: '' as number | ''
  });

  // Exam parts configuration
  const [examParts, setExamParts] = useState<ExamPart[]>([
    {
      part: 1,
      name: 'Photos',
      description: 'Mô tả hình ảnh',
      questionCount: 6,
      timeLimit: 5,
      questions: [],
      required: true
    },
    {
      part: 2,
      name: 'Question-Response',
      description: 'Hỏi đáp ngắn',
      questionCount: 25,
      timeLimit: 8,
      questions: [],
      required: true
    },
    {
      part: 3,
      name: 'Conversations',
      description: 'Hội thoại ngắn',
      questionCount: 39,
      timeLimit: 15,
      questions: [],
      required: true
    },
    {
      part: 4,
      name: 'Talks',
      description: 'Bài nói dài',
      questionCount: 30,
      timeLimit: 17,
      questions: [],
      required: true
    },
    {
      part: 5,
      name: 'Incomplete Sentences',
      description: 'Hoàn thành câu',
      questionCount: 30,
      timeLimit: 20,
      questions: [],
      required: true
    },
    {
      part: 6,
      name: 'Text Completion',
      description: 'Hoàn thành đoạn văn',
      questionCount: 16,
      timeLimit: 12,
      questions: [],
      required: true
    },
    {
      part: 7,
      name: 'Reading Comprehension',
      description: 'Đọc hiểu',
      questionCount: 54,
      timeLimit: 43,
      questions: [],
      required: true
    }
  ]);

  // Question bank
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Templates
  const [templates] = useState<ExamTemplate[]>([
    {
      id: 'full-toeic',
      name: 'Full TOEIC Test',
      type: 'full',
      description: 'Complete TOEIC test with all 7 parts (200 questions)',
      parts: [
        { part: 1, name: 'Photos', description: 'Mô tả hình ảnh', questionCount: 6, timeLimit: 5, questions: [], required: true },
        { part: 2, name: 'Question-Response', description: 'Hỏi đáp ngắn', questionCount: 25, timeLimit: 8, questions: [], required: true },
        { part: 3, name: 'Conversations', description: 'Hội thoại ngắn', questionCount: 39, timeLimit: 15, questions: [], required: true },
        { part: 4, name: 'Talks', description: 'Bài nói dài', questionCount: 30, timeLimit: 17, questions: [], required: true },
        { part: 5, name: 'Incomplete Sentences', description: 'Hoàn thành câu', questionCount: 30, timeLimit: 20, questions: [], required: true },
        { part: 6, name: 'Text Completion', description: 'Hoàn thành đoạn văn', questionCount: 16, timeLimit: 12, questions: [], required: true },
        { part: 7, name: 'Reading Comprehension', description: 'Đọc hiểu', questionCount: 54, timeLimit: 43, questions: [], required: true }
      ],
      totalQuestions: 200,
      totalTime: 120
    },
    {
      id: 'mini-toeic',
      name: 'Mini TOEIC Test',
      type: 'mini',
      description: 'Shortened TOEIC test (50 questions)',
      parts: [
        { part: 1, name: 'Photos', description: 'Mô tả hình ảnh', questionCount: 3, timeLimit: 3, questions: [], required: true },
        { part: 2, name: 'Question-Response', description: 'Hỏi đáp ngắn', questionCount: 5, timeLimit: 5, questions: [], required: true },
        { part: 3, name: 'Conversations', description: 'Hội thoại ngắn', questionCount: 7, timeLimit: 7, questions: [], required: true },
        { part: 4, name: 'Talks', description: 'Bài nói dài', questionCount: 5, timeLimit: 5, questions: [], required: true },
        { part: 5, name: 'Incomplete Sentences', description: 'Hoàn thành câu', questionCount: 10, timeLimit: 8, questions: [], required: true },
        { part: 6, name: 'Text Completion', description: 'Hoàn thành đoạn văn', questionCount: 5, timeLimit: 5, questions: [], required: true },
        { part: 7, name: 'Reading Comprehension', description: 'Đọc hiểu', questionCount: 15, timeLimit: 12, questions: [], required: true }
      ],
      totalQuestions: 50,
      totalTime: 45
    }
  ]);

  useEffect(() => {
    loadQuestionBank();
  }, []);

  const loadQuestionBank = async () => {
    try {
      console.log('Loading question bank...');
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading question bank:', error);
        throw error;
      }
      
      console.log('Question bank loaded:', data?.length || 0, 'questions');
      setQuestionBank(data || []);
    } catch (error: any) {
      console.error('Failed to load question bank:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadTemplate = (template: ExamTemplate) => {
    setFormData(prev => ({
      ...prev,
      type: template.type,
      title: template.name,
      description: template.description
    }));
    setExamParts(template.parts);
    
    toast({
      title: "Template loaded",
      description: `${template.name} template applied`,
    });
  };

  const updatePartConfig = (partNumber: number, field: keyof ExamPart, value: any) => {
    setExamParts(prev => prev.map(part => 
      part.part === partNumber 
        ? { ...part, [field]: value }
        : part
    ));
  };

  const addQuestionsToPart = (partNumber: number, questionIds: string[]) => {
    const questions = questionBank.filter(q => questionIds.includes(q.id));
    updatePartConfig(partNumber, 'questions', questions);
    
    toast({
      title: "Questions added",
      description: `${questions.length} questions added to Part ${partNumber}`,
    });
  };

  const removeQuestionFromPart = (partNumber: number, questionId: string) => {
    setExamParts(prev => prev.map(part => 
      part.part === partNumber 
        ? { ...part, questions: part.questions.filter(q => q.id !== questionId) }
        : part
    ));
  };

  const autoAssignQuestions = async () => {
    setLoading(true);

    const fetchByPart = async (partNumber: number, excludeIds: string[]) => {
      let query = supabase
        .from('questions')
        .select('*')
        .eq('part', partNumber)
        .order('created_at', { ascending: true });
      if (formData.difficulty !== 'mixed') {
        query = query.eq('difficulty', formData.difficulty);
      }
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    };

    try {
      const newExamParts = [...examParts];
      const usedQuestionIds = new Set<string>();

      for (let i = 0; i < newExamParts.length; i++) {
        const cfg = newExamParts[i];
        const need = cfg.questionCount;
        let assigned: any[] = [];

        console.log(`🔍 TOEIC auto-assign Part ${cfg.part} (need ${need})`);

        if (cfg.part === 1 || cfg.part === 2 || cfg.part === 5) {
          // Standalone questions
          const qs = await fetchByPart(cfg.part, Array.from(usedQuestionIds));
          assigned = qs.slice(0, need);
        } else if (cfg.part === 3 || cfg.part === 4) {
          // Group by passage_id, take 3 per passage
          const qs = await fetchByPart(cfg.part, Array.from(usedQuestionIds));
          const byPassage: Record<string, any[]> = {};
          qs.forEach(q => {
            if (!q.passage_id) return;
            if (!byPassage[q.passage_id]) byPassage[q.passage_id] = [];
            byPassage[q.passage_id].push(q);
          });
          const groups = Object.values(byPassage).map(arr => arr.sort((a, b) => (a.created_at > b.created_at ? 1 : -1)));
          for (const g of groups) {
            const take = g.slice(0, 3);
            if (assigned.length + take.length <= need) {
              assigned.push(...take);
            }
            if (assigned.length >= need) break;
          }
        } else if (cfg.part === 6) {
          // 4 blanks per passage (blank_index 1-4)
          const qs = await fetchByPart(6, Array.from(usedQuestionIds));
          const byPassage: Record<string, any[]> = {};
          qs.forEach(q => {
            if (!q.passage_id) return;
            if (!byPassage[q.passage_id]) byPassage[q.passage_id] = [];
            byPassage[q.passage_id].push(q);
          });
          const groups = Object.values(byPassage).map(arr => arr.sort((a, b) => (a.blank_index || 0) - (b.blank_index || 0)));
          for (const g of groups) {
            const take = g.slice(0, 4);
            if (assigned.length + take.length <= need) {
              assigned.push(...take);
            }
            if (assigned.length >= need) break;
          }
        } else if (cfg.part === 7) {
          // Accumulate by passage groups up to target (prefer full groups)
          const qs = await fetchByPart(7, Array.from(usedQuestionIds));
          const byPassage: Record<string, any[]> = {};
          qs.forEach(q => {
            if (!q.passage_id) return;
            if (!byPassage[q.passage_id]) byPassage[q.passage_id] = [];
            byPassage[q.passage_id].push(q);
          });
          const groups = Object.values(byPassage).map(arr => arr.sort((a, b) => (a.created_at > b.created_at ? 1 : -1)));
          for (const g of groups) {
            if (assigned.length === need) break;
            if (assigned.length + g.length <= need) {
              assigned.push(...g);
            } else {
              // If needed to reach exact count, allow partial of last group
              const remaining = need - assigned.length;
              if (remaining > 0) assigned.push(...g.slice(0, remaining));
            }
          }
        }

        newExamParts[i].questions = assigned;
        assigned.forEach(q => usedQuestionIds.add(q.id));

        console.log(`📚 Assigned ${assigned.length}/${need} for Part ${cfg.part}`);
      }

      setExamParts(newExamParts);

      const totalAssigned = newExamParts.reduce((sum, part) => sum + part.questions.length, 0);
      toast({
        title: "Auto-assignment complete",
        description: `Assigned ${totalAssigned} questions across all parts (TOEIC grouping)`,
      });
    } catch (error: any) {
      console.error('Error in auto-assignment:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const validateExam = () => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push('Exam title is required');
    }
    
    examParts.forEach(part => {
      if (part.required && part.questions.length < part.questionCount) {
        errors.push(`Part ${part.part} needs ${part.questionCount} questions, currently has ${part.questions.length}`);
      }
    });
    
    return errors;
  };

  const createExamSet = async () => {
    if (!user) return;

    const errors = validateExam();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      console.log('Creating exam set with data:', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: 'mix',
        question_count: examParts.reduce((sum, part) => sum + part.questions.length, 0),
        time_limit: examParts.reduce((sum, part) => sum + part.timeLimit, 0),
        difficulty: formData.difficulty,
        is_active: formData.status === 'active',
        allow_multiple_attempts: formData.allow_multiple_attempts,
        max_attempts: formData.max_attempts === '' ? null : formData.max_attempts,
        created_by: user.id
      });

      // Create exam set
      const { data: examSet, error: examError } = await supabase
        .from('exam_sets')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: 'mix',
          question_count: examParts.reduce((sum, part) => sum + part.questions.length, 0),
          time_limit: examParts.reduce((sum, part) => sum + part.timeLimit, 0),
          difficulty: formData.difficulty,
          is_active: formData.status === 'active',
          allow_multiple_attempts: formData.allow_multiple_attempts,
          max_attempts: formData.max_attempts === '' ? null : formData.max_attempts,
          created_by: user.id
        })
        .select()
        .single();

      if (examError) {
        console.error('Error creating exam set:', examError);
        throw examError;
      }

      console.log('Exam set created successfully:', examSet);

      // Clear any existing questions for this exam set (in case of retry)
      await supabase
        .from('exam_questions')
        .delete()
        .eq('exam_set_id', examSet.id);

      // Add questions to exam set (remove duplicates)
      const allQuestions = examParts.flatMap(part => part.questions);
      const uniqueQuestions = allQuestions.filter((question, index, self) => 
        index === self.findIndex(q => q.id === question.id)
      );
      
      const examQuestions = uniqueQuestions.map((question, index) => ({
        exam_set_id: examSet.id,
        question_id: question.id,
        order_index: index
      }));

      console.log('Exam questions to insert:', examQuestions);

      if (examQuestions.length > 0) {
        const { error: questionsError } = await supabase
          .from('exam_questions')
          .insert(examQuestions);

        if (questionsError) {
          console.error('Error inserting exam questions:', questionsError);
          throw questionsError;
        }
        
        console.log('Exam questions inserted successfully');
      }

      toast({
        title: "Success",
        description: "Exam set created successfully",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'full',
        difficulty: 'medium',
        status: 'draft'
      });
      setExamParts(prev => prev.map(part => ({ ...part, questions: [] })));

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = questionBank.filter((q: any) => {
    const text = (q.prompt_text || q.question || '').toLowerCase();
    const matchesSearch = text.includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || (filterType === 'listening' ? q.part <= 4 : filterType === 'reading' ? q.part > 4 : true);
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const totalQuestions = examParts.reduce((sum, part) => sum + part.questions.length, 0);
  const totalTime = examParts.reduce((sum, part) => sum + part.timeLimit, 0);

  return (
    <div className="p-6 space-y-6">
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
            onClick={autoAssignQuestions}
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
            onClick={createExamSet}
            disabled={saving || totalQuestions === 0}
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

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-yellow-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Question Bank:</strong> {questionBank.length} questions
                <div className="text-xs mt-1">
                  Listening: {questionBank.filter(q => q.type === 'listening').length} | 
                  Reading: {questionBank.filter(q => q.type === 'reading').length} | 
                  Vocab: {questionBank.filter(q => q.type === 'vocab').length} | 
                  Grammar: {questionBank.filter(q => q.type === 'grammar').length}
                </div>
                <div className="text-xs mt-1">
                  Easy: {questionBank.filter(q => q.difficulty === 'easy').length} | 
                  Medium: {questionBank.filter(q => q.difficulty === 'medium').length} | 
                  Hard: {questionBank.filter(q => q.difficulty === 'hard').length}
                </div>
              </div>
              <div>
                <strong>Selected Questions:</strong> {selectedQuestions.length}
              </div>
              <div>
                <strong>Form Data:</strong> {JSON.stringify(formData, null, 2)}
              </div>
              <div>
                <strong>Exam Parts:</strong> {examParts.map(p => `${p.part}:${p.questions.length}`).join(', ')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTime}m</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listening Parts</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {examParts.filter(p => p.part <= 4).reduce((sum, part) => sum + part.questions.length, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Parts</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {examParts.filter(p => p.part > 4).reduce((sum, part) => sum + part.questions.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., TOEIC Practice Test #1"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Exam Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the exam content and purpose..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
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
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_multiple_attempts: !!checked }))}
                  />
                  <Label className="text-xs">Allow multiple attempts</Label>
                </div>

                <div>
                  <Label htmlFor="max_attempts">Max attempts (empty = unlimited)</Label>
                  <Input
                    id="max_attempts"
                    type="number"
                    value={formData.max_attempts}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_attempts: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                    placeholder="e.g. 3"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
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
                        onClick={() => loadTemplate(template)}
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
                            onChange={(e) => updatePartConfig(part.part, 'questionCount', parseInt(e.target.value) || 0)}
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Time Limit (minutes)</Label>
                          <Input
                            type="number"
                            value={part.timeLimit}
                            onChange={(e) => updatePartConfig(part.part, 'timeLimit', parseInt(e.target.value) || 0)}
                            min="0"
                            max="60"
                          />
                        </div>
                        <div className="flex items-end">
                          <Checkbox
                            checked={part.required}
                            onCheckedChange={(checked) => updatePartConfig(part.part, 'required', checked)}
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
                                <span className="truncate flex-1">{question.question}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuestionFromPart(part.part, question.id)}
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
                Select questions from your question bank
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
                    <SelectItem value="vocab">Vocabulary</SelectItem>
                    <SelectItem value="grammar">Grammar</SelectItem>
                    <SelectItem value="listening">Listening</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
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

              {/* Questions List */}
              {questionBank.length === 0 ? (
                <QuickQuestionSetup onQuestionsAdded={loadQuestionBank} />
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredQuestions.map((question) => (
                  <div key={question.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuestions(prev => [...prev, question.id]);
                        } else {
                          setSelectedQuestions(prev => prev.filter(id => id !== question.id));
                        }
                      }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {question.type}
                        </Badge>
                        <Badge className="text-xs">
                          {question.difficulty}
                        </Badge>
                        {question.audio_url && (
                          <Badge variant="secondary" className="text-xs">
                            <Headphones className="h-3 w-3 mr-1" />
                            Audio
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm truncate">{question.question}</p>
                    </div>

                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map(partNum => (
                        <Button
                          key={partNum}
                          variant="outline"
                          size="sm"
                          onClick={() => addQuestionsToPart(partNum, [question.id])}
                          className="text-xs"
                        >
                          P{partNum}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
                </div>
              )}

              {selectedQuestions.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {selectedQuestions.length} questions selected
                      </span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(partNum => (
                          <Button
                            key={partNum}
                            variant="outline"
                            size="sm"
                            onClick={() => addQuestionsToPart(partNum, selectedQuestions)}
                            className="text-xs"
                          >
                            Add to Part {partNum}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Preview</CardTitle>
              <CardDescription>
                Review your exam before publishing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Exam Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold">{formData.title || 'Untitled Exam'}</h3>
                    <p className="text-sm text-muted-foreground">{formData.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{totalQuestions} questions</div>
                    <div className="text-sm text-muted-foreground">{totalTime} minutes</div>
                  </div>
                </div>

                {/* Parts Summary */}
                <div className="space-y-2">
                  {examParts.map((part) => (
                    <div key={part.part} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">Part {part.part}</Badge>
                        <div>
                          <div className="font-medium">{part.name}</div>
                          <div className="text-sm text-muted-foreground">{part.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{part.questions.length}/{part.questionCount}</div>
                        <div className="text-sm text-muted-foreground">{part.timeLimit}m</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation */}
                {validateExam().length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">Please fix the following issues:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validateExam().map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validateExam().length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Exam is ready to be created! All parts have the required number of questions.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedExamSetCreator;
