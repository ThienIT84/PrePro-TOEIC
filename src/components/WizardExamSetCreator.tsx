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

const WizardExamSetCreator: React.FC = () => {
  const { user } = useAuth();
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
    { id: 1, title: 'Basic Information', description: 'Exam details and settings', icon: Settings },
    { id: 2, title: 'Parts Configuration', description: 'Configure TOEIC parts', icon: Target },
    { id: 3, title: 'Question Assignment', description: 'Assign questions to parts', icon: Database },
    { id: 4, title: 'Review & Preview', description: 'Review and preview exam', icon: Eye },
    { id: 5, title: 'Complete', description: 'Save and activate exam', icon: CheckCircle }
  ];

  useEffect(() => {
    fetchQuestionBank();
  }, []);

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
    // TEMPORARY: Force assign ALL available questions regardless of difficulty
    console.log('🚀 FORCE ASSIGNMENT MODE - Taking ALL available questions');
    
    const updatedParts = examParts.map(part => {
      console.log(`\n=== Processing Part ${part.part} ===`);
      
      // Get ALL questions for this part (no difficulty filter)
      const allQuestionsForPart = questionBank.filter(q => q.part === part.part);
      console.log(`Total questions for Part ${part.part}:`, allQuestionsForPart.length);
      
      // Show difficulty breakdown
      const difficultyBreakdown = allQuestionsForPart.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log(`Difficulty breakdown for Part ${part.part}:`, difficultyBreakdown);
      
      // Take ALL available questions up to the required count
      const shuffled = [...allQuestionsForPart].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, part.questionCount);
      
      console.log(`Selected ${selectedQuestions.length}/${part.questionCount} questions for Part ${part.part}`);
      
      // Show final selection breakdown
      const finalBreakdown = selectedQuestions.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log(`Final selection breakdown:`, finalBreakdown);
      
      return { ...part, questions: selectedQuestions };
    });
    
    setExamParts(updatedParts);
    
    // Show summary
    const totalAssigned = updatedParts.reduce((sum, part) => sum + part.questions.length, 0);
    const totalNeeded = updatedParts.reduce((sum, part) => sum + part.questionCount, 0);
    
    console.log(`\n=== FORCE ASSIGNMENT SUMMARY ===`);
    console.log(`Total assigned: ${totalAssigned}/${totalNeeded}`);
    console.log(`Question bank size: ${questionBank.length}`);
    
    // Check if we filled all parts
    const unfilledParts = updatedParts.filter(part => part.questions.length < part.questionCount);
    if (unfilledParts.length > 0) {
      console.warn('⚠️ Some parts still not filled:', unfilledParts.map(p => `Part ${p.part}: ${p.questions.length}/${p.questionCount}`));
    } else {
      console.log('✅ All parts filled successfully!');
    }
    
    toast({
      title: 'Force Assignment Complete',
      description: `Assigned ${totalAssigned}/${totalNeeded} questions. All available questions used.`
    });
  };

  const mapExamTypeToDatabaseType = (type: 'full' | 'mini' | 'custom') => {
    // Map wizard types to database constraint values
    switch (type) {
      case 'full':
        return 'mix'; // Full TOEIC covers all parts
      case 'mini':
        return 'mix'; // Mini TOEIC also covers multiple parts
      case 'custom':
        return 'mix'; // Custom can be any combination
      default:
        return 'mix';
    }
  };

  const handleCreateExamSet = async () => {
    setSaving(true);
    try {
      const totalQuestions = examParts.reduce((sum, part) => sum + part.questions.length, 0);
      const totalTime = examParts.reduce((sum, part) => sum + part.timeLimit, 0);

      const { data, error } = await supabase
        .from('exam_sets')
        .insert({
          title: formData.title,
          description: formData.description,
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
        title: 'Success',
        description: 'Exam set created successfully!'
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

    } catch (error) {
      console.error('Error creating exam set:', error);
      toast({
        title: 'Error',
        description: 'Failed to create exam set.',
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

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return examParts.some(part => part.enabled);
      case 3:
        return examParts.some(part => part.enabled && part.questions.length > 0);
      case 4:
        return true; // Review step is always valid
      case 5:
        return true; // Complete step is always valid
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide basic details about your exam set
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Exam Title *</Label>
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
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'full' | 'mini' | 'custom' }))}
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
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and content of this exam..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select 
                      value={formData.difficulty} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'hard' | 'mixed' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'active' | 'inactive' }))}
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

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allow_multiple_attempts"
                      checked={formData.allow_multiple_attempts}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_multiple_attempts: checked as boolean }))}
                    />
                    <Label htmlFor="allow_multiple_attempts">Allow multiple attempts</Label>
                  </div>

                  {formData.allow_multiple_attempts && (
                    <div>
                      <Label htmlFor="max_attempts">Maximum Attempts</Label>
                      <Input
                        id="max_attempts"
                        type="number"
                        value={formData.max_attempts}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_attempts: e.target.value ? parseInt(e.target.value) : '' }))}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
                <CardDescription>
                  Choose a template to get started quickly
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
                          <h3 className="font-semibold">{template.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{template.totalQuestions} questions</span>
                          <span>{template.totalTime} minutes</span>
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
        <h1 className="text-3xl font-bold mb-2">Create New Exam Set</h1>
        <p className="text-muted-foreground">
          Use this wizard to create a comprehensive TOEIC exam set
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          {steps.map((step) => (
            <div key={step.id} className="text-center max-w-20">
              <div className="font-medium">{step.title}</div>
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
