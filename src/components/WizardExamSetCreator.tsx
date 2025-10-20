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
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Target, 
  BookOpen, 
  Headphones, 
  FileText, 
  Settings, 
  Eye,
  Save,
  Play,
  AlertCircle,
  Loader2,
  Zap,
  Database,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';
import { t } from '@/lib/i18n';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Question } from '@/types';
import WizardStep from './WizardStep';
import PartsConfiguration from './PartsConfiguration';
import QuestionAssignment from './QuestionAssignment';
import ExamPreview from './ExamPreview';

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
  allow_multiple_attempts?: boolean;
  max_attempts?: number;
}

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

interface ExamTemplate {
  id: string;
  name: string;
  type: 'full' | 'mini' | 'custom';
  description: string;
  parts: ExamPart[];
  totalQuestions: number;
  totalTime: number;
}

interface WizardExamSetCreatorProps {
  onExamCreated?: () => void;
}

const WizardExamSetCreator: React.FC<WizardExamSetCreatorProps> = ({ onExamCreated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'full' as 'full' | 'mini' | 'custom',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard' | 'mixed',
    status: 'draft' as 'draft' | 'active' | 'inactive',
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
      required: true,
      enabled: true
    },
    {
      part: 2,
      name: 'Question-Response',
      description: 'Hỏi đáp ngắn',
      questionCount: 25,
      timeLimit: 8,
      questions: [],
      required: true,
      enabled: true
    },
    {
      part: 3,
      name: 'Conversations',
      description: 'Hội thoại ngắn',
      questionCount: 39,
      timeLimit: 15,
      questions: [],
      required: true,
      enabled: true
    },
    {
      part: 4,
      name: 'Talks',
      description: 'Bài nói dài',
      questionCount: 30,
      timeLimit: 17,
      questions: [],
      required: true,
      enabled: true
    },
    {
      part: 5,
      name: 'Incomplete Sentences',
      description: 'Hoàn thành câu',
      questionCount: 30,
      timeLimit: 20,
      questions: [],
      required: true,
      enabled: true
    },
    {
      part: 6,
      name: 'Text Completion',
      description: 'Hoàn thành đoạn văn',
      questionCount: 16,
      timeLimit: 12,
      questions: [],
      required: true,
      enabled: true
    },
    {
      part: 7,
      name: 'Reading Comprehension',
      description: 'Đọc hiểu',
      questionCount: 54,
      timeLimit: 43,
      questions: [],
      required: true,
      enabled: true
    }
  ]);

  // Question bank
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Templates
  const [templates] = useState<ExamTemplate[]>([
    {
      id: 'full-toeic',
      name: 'Full TOEIC Test',
      type: 'full',
      description: 'Complete TOEIC test with all 7 parts (200 questions)',
      parts: [
        { part: 1, name: 'Photos', description: 'Mô tả hình ảnh', questionCount: 6, timeLimit: 5, questions: [], required: true, enabled: true },
        { part: 2, name: 'Question-Response', description: 'Hỏi đáp ngắn', questionCount: 25, timeLimit: 8, questions: [], required: true, enabled: true },
        { part: 3, name: 'Conversations', description: 'Hội thoại ngắn', questionCount: 39, timeLimit: 15, questions: [], required: true, enabled: true },
        { part: 4, name: 'Talks', description: 'Bài nói dài', questionCount: 30, timeLimit: 17, questions: [], required: true, enabled: true },
        { part: 5, name: 'Incomplete Sentences', description: 'Hoàn thành câu', questionCount: 30, timeLimit: 20, questions: [], required: true, enabled: true },
        { part: 6, name: 'Text Completion', description: 'Hoàn thành đoạn văn', questionCount: 16, timeLimit: 12, questions: [], required: true, enabled: true },
        { part: 7, name: 'Reading Comprehension', description: 'Đọc hiểu', questionCount: 54, timeLimit: 43, questions: [], required: true, enabled: true }
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
        { part: 1, name: 'Photos', description: 'Mô tả hình ảnh', questionCount: 3, timeLimit: 3, questions: [], required: true, enabled: true },
        { part: 2, name: 'Question-Response', description: 'Hỏi đáp ngắn', questionCount: 5, timeLimit: 5, questions: [], required: true, enabled: true },
        { part: 3, name: 'Conversations', description: 'Hội thoại ngắn', questionCount: 7, timeLimit: 7, questions: [], required: true, enabled: true },
        { part: 4, name: 'Talks', description: 'Bài nói dài', questionCount: 5, timeLimit: 5, questions: [], required: true, enabled: true },
        { part: 5, name: 'Incomplete Sentences', description: 'Hoàn thành câu', questionCount: 10, timeLimit: 8, questions: [], required: true, enabled: true },
        { part: 6, name: 'Text Completion', description: 'Hoàn thành đoạn văn', questionCount: 5, timeLimit: 5, questions: [], required: true, enabled: true },
        { part: 7, name: 'Reading Comprehension', description: 'Đọc hiểu', questionCount: 15, timeLimit: 12, questions: [], required: true, enabled: true }
      ],
      totalQuestions: 50,
      totalTime: 45
    }
  ]);

  const steps = [
    { id: 1, title: t('wizard.step.basic'), description: t('wizard.step.basic_desc'), icon: Settings },
    { id: 2, title: t('wizard.step.parts'), description: t('wizard.step.parts_desc'), icon: Target },
    { id: 3, title: t('wizard.step.assign'), description: t('wizard.step.assign_desc'), icon: Database },
    { id: 4, title: t('wizard.step.review'), description: t('wizard.step.review_desc'), icon: Eye },
    { id: 5, title: t('wizard.step.complete'), description: t('wizard.step.complete_desc'), icon: CheckCircle }
  ];

  useEffect(() => {
    // Lazy load question bank only when needed (step 3)
    if (currentStep >= 3 && questionBank.length === 0) {
      fetchQuestionBank();
    }
  }, [currentStep]);

  const fetchQuestionBank = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestionBank((data || []) as Question[]);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch questions.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTemplateSelect = (template: ExamTemplate) => {
    setFormData(prev => ({ ...prev, type: template.type }));
    setExamParts(template.parts);
  };

  const handlePartConfigUpdate = (partNumber: number, field: string, value: any) => {
    setExamParts(prev => prev.map(part => 
      part.part === partNumber 
        ? { ...part, [field]: value }
        : part
    ));
  };

  const handleAddQuestionsToPart = (partNumber: number, questionIds: string[]) => {
    const questionsToAdd = questionBank.filter(q => questionIds.includes(q.id));
    setExamParts(prev => prev.map(part => 
      part.part === partNumber 
        ? { ...part, questions: [...part.questions, ...questionsToAdd] }
        : part
    ));
  };

  const handleRemoveQuestionFromPart = (partNumber: number, questionId: string) => {
    setExamParts(prev => prev.map(part => 
      part.part === partNumber 
        ? { ...part, questions: part.questions.filter(q => q.id !== questionId) }
        : part
    ));
  };

  const handleAutoAssignQuestions = () => {
    const targetDifficulty = formData.difficulty;
    let warnings: string[] = [];
    
    const updatedParts = examParts.map(part => {
      if (!part.enabled) return part;

      // Get questions for this part
      const allQuestionsForPart = questionBank.filter(q => q.part === part.part);
      
      // Filter by difficulty if not 'mixed'
      let availableQuestions = allQuestionsForPart;
      if (targetDifficulty !== 'mixed') {
        availableQuestions = allQuestionsForPart.filter(q => q.difficulty === targetDifficulty);
        
        // If not enough matching difficulty, fall back to all
        if (availableQuestions.length < part.questionCount) {
          warnings.push(
            `Part ${part.part}: Chỉ có ${availableQuestions.length}/${part.questionCount} câu độ khó "${targetDifficulty}". Sẽ dùng thêm câu khác độ khó.`
          );
          availableQuestions = allQuestionsForPart;
        }
      }
      
      // Check if enough questions available
      if (availableQuestions.length < part.questionCount) {
        warnings.push(
          `Part ${part.part}: Thiếu ${part.questionCount - availableQuestions.length} câu (có ${availableQuestions.length}/${part.questionCount})`
        );
      }
      
      // Shuffle and select
      const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, part.questionCount);
      
      return { ...part, questions: selectedQuestions };
    });
    
    setExamParts(updatedParts);
    
    // Show summary
    const totalAssigned = updatedParts.filter(p => p.enabled).reduce((sum, part) => sum + part.questions.length, 0);
    const totalNeeded = updatedParts.filter(p => p.enabled).reduce((sum, part) => sum + part.questionCount, 0);
    
    if (warnings.length > 0) {
      toast({
        title: '⚠️ Gán câu hỏi hoàn tất với cảnh báo',
        description: (
          <div className="space-y-1">
            <div>Đã gán {totalAssigned}/{totalNeeded} câu hỏi.</div>
            <ul className="list-disc list-inside text-sm mt-2">
              {warnings.slice(0, 3).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
              {warnings.length > 3 && <li>...và {warnings.length - 3} cảnh báo khác</li>}
            </ul>
          </div>
        ),
        variant: 'destructive'
      });
    } else {
      toast({
        title: '✅ Gán câu hỏi thành công',
        description: `Đã gán ${totalAssigned}/${totalNeeded} câu hỏi theo độ khó "${targetDifficulty}".`
      });
    }
  };

  const mapExamTypeToDatabaseType = (type: 'full' | 'mini' | 'custom') => {
    // Map wizard types to database constraint values
    switch (type) {
      case 'full':
        return 'mix'; // Full TOEIC covers all parts
      case 'mini':
        return 'mix'; // Mini TOEIC also covers multiple parts
      case 'custom':
        // Determine type based on enabled parts
        const enabledParts = examParts.filter(p => p.enabled);
        const hasListening = enabledParts.some(p => p.part <= 4);
        const hasReading = enabledParts.some(p => p.part >= 5);
        
        if (hasListening && hasReading) {
          return 'mix';
        } else if (hasListening) {
          return 'listening';
        } else if (hasReading) {
          return 'reading';
        }
        return 'mix'; // Default fallback
      default:
        return 'mix';
    }
  };

  const handleCreateExamSet = async () => {
    setSaving(true);
    try {
      const totalQuestions = examParts.reduce((sum, part) => sum + part.questions.length, 0);
      const totalTime = examParts.reduce((sum, part) => sum + part.timeLimit, 0);

      // Store exam_format in description metadata for display purposes
      const descriptionWithMeta = `${formData.description}\n[exam_format:${formData.type}]`;

      const { data, error } = await supabase
        .from('exam_sets')
        .insert({
          title: formData.title,
          description: descriptionWithMeta,
          type: mapExamTypeToDatabaseType(formData.type),
          difficulty: formData.difficulty,
          question_count: totalQuestions,
          time_limit: totalTime,
          is_active: formData.status === 'active',
          created_by: user?.id,
          allow_multiple_attempts: formData.allow_multiple_attempts,
          max_attempts: formData.max_attempts || null
        })
        .select()
        .single();

      if (error) throw error;

      // Create exam questions with sequential order_index
      let globalOrderIndex = 1;
      const examQuestions = examParts.flatMap(part => 
        part.questions.map((question) => ({
          exam_set_id: data.id,
          question_id: question.id,
          order_index: globalOrderIndex++
        }))
      );

      if (examQuestions.length > 0) {
        const { error: questionsError } = await supabase
          .from('exam_questions')
          .insert(examQuestions);

        if (questionsError) throw questionsError;
      }

      toast({
        title: 'Thành công! 🎉',
        description: `Đã tạo đề thi "${formData.title}" với ${examQuestions.length} câu hỏi.`
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'full',
        difficulty: 'medium',
        status: 'draft',
        allow_multiple_attempts: true,
        max_attempts: ''
      });
      setCurrentStep(1);

      // Notify parent to refresh list
      if (onExamCreated) {
        onExamCreated();
      }

      // Navigate to exam questions management after short delay
      setTimeout(() => {
        navigate(`/exam-sets/${data.id}/questions`);
      }, 1000);

    } catch (error) {
      console.error('Error creating exam set:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo đề thi. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatistics = () => {
    const totalQuestions = examParts.reduce((sum, part) => sum + part.questions.length, 0);
    const totalTime = examParts.reduce((sum, part) => sum + part.timeLimit, 0);
    const listeningQuestions = examParts
      .filter(part => part.part <= 4)
      .reduce((sum, part) => sum + part.questions.length, 0);
    const readingQuestions = examParts
      .filter(part => part.part >= 5)
      .reduce((sum, part) => sum + part.questions.length, 0);

    return {
      totalQuestions,
      totalTime,
      listeningQuestions,
      readingQuestions,
      questionBankSize: questionBank.length,
      selectedQuestions: totalQuestions
    };
  };

  const getValidationErrors = (step: number): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          errors.push('Tiêu đề đề thi là bắt buộc');
        }
        if (!formData.description.trim()) {
          errors.push('Mô tả đề thi là bắt buộc');
        }
        if (formData.allow_multiple_attempts && formData.max_attempts !== '' && formData.max_attempts < 1) {
          errors.push('Số lần làm tối đa phải ≥ 1 hoặc để trống');
        }
        break;
      
      case 2:
        const enabledParts = examParts.filter(p => p.enabled);
        if (enabledParts.length === 0) {
          errors.push('Phải chọn ít nhất 1 part cho đề thi');
        }
        break;
      
      case 3:
        const partsWithoutEnoughQuestions = examParts
          .filter(p => p.enabled && p.questions.length < p.questionCount);
        
        if (partsWithoutEnoughQuestions.length > 0) {
          partsWithoutEnoughQuestions.forEach(part => {
            errors.push(
              `Part ${part.part} (${part.name}): thiếu ${part.questionCount - part.questions.length}/${part.questionCount} câu`
            );
          });
        }
        break;
      
      case 4:
      case 5:
        // Final validation before create
        const totalNeeded = examParts.filter(p => p.enabled).reduce((sum, p) => sum + p.questionCount, 0);
        const totalAssigned = examParts.filter(p => p.enabled).reduce((sum, p) => sum + p.questions.length, 0);
        
        if (totalAssigned < totalNeeded) {
          errors.push(`Chưa đủ câu hỏi: ${totalAssigned}/${totalNeeded} câu`);
        }
        break;
    }
    
    return errors;
  };

  const isStepValid = (step: number) => {
    return getValidationErrors(step).length === 0;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('wizard.basic.title')}</CardTitle>
                <CardDescription>
                  {t('wizard.basic.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">{t('wizard.field.title')} *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('wizard.field.title_ph')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">{t('wizard.field.type')}</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'full' | 'mini' | 'custom' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">{t('wizard.template.full')}</SelectItem>
                        <SelectItem value="mini">{t('wizard.template.mini')}</SelectItem>
                        <SelectItem value="custom">Tùy chỉnh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">{t('wizard.field.description')} *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('wizard.field.description_ph')}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty">{t('wizard.field.difficulty')}</Label>
                    <Select 
                      value={formData.difficulty} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'hard' | 'mixed' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">{t('difficulty.easy')}</SelectItem>
                        <SelectItem value="medium">{t('difficulty.medium')}</SelectItem>
                        <SelectItem value="hard">{t('difficulty.hard')}</SelectItem>
                        <SelectItem value="mixed">Hỗn hợp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">{t('wizard.field.status')}</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'active' | 'inactive' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Nháp</SelectItem>
                        <SelectItem value="active">Kích hoạt</SelectItem>
                        <SelectItem value="inactive">Tạm dừng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allow_multiple_attempts"
                      checked={formData.allow_multiple_attempts}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_multiple_attempts: checked as boolean }))}
                    />
                    <Label htmlFor="allow_multiple_attempts">{t('wizard.field.allow_multi')}</Label>
                  </div>

                  {formData.allow_multiple_attempts && (
                    <div>
                      <Label htmlFor="max_attempts">{t('wizard.field.max_attempts')}</Label>
                      <Input
                        id="max_attempts"
                        type="number"
                        min="1"
                        value={formData.max_attempts}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_attempts: e.target.value ? parseInt(e.target.value) : '' }))}
                        placeholder={t('wizard.field.max_attempts_ph')}
                        className={formData.max_attempts !== '' && formData.max_attempts < 1 ? 'border-red-500' : ''}
                      />
                      {formData.max_attempts !== '' && formData.max_attempts < 1 && (
                        <p className="text-sm text-red-500 mt-1">Số lần làm phải ≥ 1</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle>{t('wizard.templates.title')}</CardTitle>
                <CardDescription>
                  {t('wizard.templates.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.type === template.type ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {template.type === 'full' ? <Target className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                          <h3 className="font-semibold">{template.type === 'full' ? t('wizard.template.full') : t('wizard.template.mini')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{template.totalQuestions} {t('wizard.common.questions')}</span>
                          <span>{template.totalTime} {t('wizard.common.minutes')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <PartsConfiguration
            examParts={examParts}
            onPartConfigUpdate={handlePartConfigUpdate}
            formData={formData}
          />
        );

      case 3:
        if (loading && questionBank.length === 0) {
          return (
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Đang tải ngân hàng câu hỏi...</h3>
                    <p className="text-sm text-muted-foreground">Vui lòng đợi trong giây lát</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        return (
          <QuestionAssignment
            examParts={examParts}
            questionBank={questionBank}
            onAddQuestionsToPart={handleAddQuestionsToPart}
            onRemoveQuestionFromPart={handleRemoveQuestionFromPart}
            onAutoAssignQuestions={handleAutoAssignQuestions}
            loading={loading}
          />
        );

      case 4:
        return (
          <ExamPreview
            formData={formData}
            examParts={examParts}
            statistics={getStatistics()}
          />
        );

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Ready to Create
                </CardTitle>
                <CardDescription>
                  Review your exam set configuration and create it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{getStatistics().totalQuestions}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{getStatistics().totalTime}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Headphones className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{getStatistics().listeningQuestions}</div>
                    <div className="text-sm text-muted-foreground">Listening</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{getStatistics().readingQuestions}</div>
                    <div className="text-sm text-muted-foreground">Reading</div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This will create your exam set and make it available for students to take.
                    You can always edit it later from the exam management page.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('wizard.title')}</h1>
        <p className="text-muted-foreground">
          {t('wizard.subtitle')}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">
            Bước {currentStep} / {steps.length}
          </div>
          <div className="text-sm font-medium text-blue-600">
            {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}% Hoàn thành
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                currentStep >= step.id 
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg' 
                  : 'border-gray-300 text-gray-400 bg-white'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 transition-all ${
                  currentStep > step.id ? 'bg-primary' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          {steps.map((step) => (
            <div key={step.id} className="text-center max-w-20">
              <div className={`font-medium ${currentStep === step.id ? 'text-primary' : ''}`}>
                {step.title}
              </div>
              <div className="text-xs">{step.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <WizardStep
        currentStep={currentStep}
        totalSteps={steps.length}
        isValid={isStepValid(currentStep)}
        validationErrors={getValidationErrors(currentStep)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onComplete={handleCreateExamSet}
        loading={saving}
        canGoNext={currentStep < steps.length}
        canGoPrevious={currentStep > 1}
      >
        {renderStepContent()}
      </WizardStep>
    </div>
  );
};

export default WizardExamSetCreator;
