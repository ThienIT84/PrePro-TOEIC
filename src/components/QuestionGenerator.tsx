import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Upload, 
  Link, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Save,
  Eye,
  Trash2,
  Zap,
  Gift,
  Globe,
  Target,
  HelpCircle,
  BookOpen,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DrillType, Difficulty, Question } from '@/types';
import { questionGeneratorService, GeneratedQuestion } from '@/services/questionGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QuestionGeneratorProps {
  onQuestionsGenerated?: (questions: Question[]) => void;
}

const QuestionGenerator = ({ onQuestionsGenerated }: QuestionGeneratorProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'url'>('text');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    content: '',
    type: 'mix' as DrillType | 'mix',
    difficulty: 'medium' as Difficulty | 'mix',
    questionCount: 5,
    language: 'vi' as 'vi' | 'en',
    part: 5 as number // Part for AI generated questions
  });

  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [showPromptGuide, setShowPromptGuide] = useState(false);
  const [part6Result, setPart6Result] = useState<{
    passage: { content: string; blanks: number[] };
    questions: GeneratedQuestion[];
  } | null>(null);
  const [part7Result, setPart7Result] = useState<{
    passages: Array<{
      content: string;
      type: string;
      title?: string;
    }>;
    questions: GeneratedQuestion[];
  } | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [passageCount, setPassageCount] = useState(1);

  // Reset passageCount when changing parts
  useEffect(() => {
    if (formData.part !== 7) {
      setPassageCount(1);
    }
  }, [formData.part]);

  // Get template for each Part
  const getPartTemplate = (part: number) => {
    switch (part) {
      case 5:
        return {
          title: "Part 5 - Incomplete Sentences",
          template: `Tạo câu hỏi Part 5 TOEIC với format sau:

1. Loại câu hỏi: Incomplete Sentences
2. Chủ đề: Business context
3. Cấu trúc: Câu không hoàn chỉnh với 4 lựa chọn
4. Focus: Grammar, Vocabulary, Prepositions, Conjunctions

Yêu cầu:
- Ngữ cảnh kinh doanh thực tế
- Ngôn ngữ trang trọng, chuyên nghiệp
- 4 lựa chọn A, B, C, D
- Mỗi câu test một kỹ năng khác nhau
- Độ dài câu vừa phải (15-25 từ)
- Giải thích rõ ràng cho đáp án đúng`
        };
      case 6:
        return {
          title: "Part 6 - Text Completion",
          template: `Tạo một passage Part 6 TOEIC với format sau:

1. Loại văn bản: Report/Email/Memo/Letter
2. Chủ đề: Business context
3. Cấu trúc: 4 đoạn văn, 4 chỗ trống
4. Chỗ trống 1: Preposition/Time expression
5. Chỗ trống 2: Conjunction/Reason expression
6. Chỗ trống 3: Verb/Phrase expression
7. Chỗ trống 4: Adjective/Adverb expression

Yêu cầu:
- Ngữ cảnh kinh doanh thực tế
- Ngôn ngữ trang trọng, chuyên nghiệp
- 4 chỗ trống được đánh số 1, 2, 3, 4
- Mỗi chỗ trống test một kỹ năng khác nhau
- Passage dài 200-250 từ
- Phải đánh dấu 4 blank_text trong đoạn văn`
        };
      case 7:
        return {
          title: "Part 7 - Reading Comprehension",
          template: `Tạo Part 7 TOEIC với format sau:

1. Số lượng passages: 1-3 passages liên quan
2. Loại văn bản: Email/Article/Advertisement/Notice/Memo/Letter
3. Chủ đề: Business context (meeting, product, announcement, etc.)
4. Cấu trúc: Multiple passages + 2-5 câu hỏi
5. Câu hỏi: Main idea, Detail, Inference, Vocabulary, Purpose

Yêu cầu:
- Passages liên quan cùng chủ đề
- Mỗi passage khác loại văn bản
- Ngữ cảnh kinh doanh thực tế
- Ngôn ngữ trang trọng, chuyên nghiệp
- Passage dài 150-300 từ mỗi cái
- 2-5 câu hỏi đa lựa chọn
- Câu hỏi test kỹ năng khác nhau
- Đáp án rõ ràng, không gây nhầm lẫn
- Passages có thể đọc độc lập hoặc liên kết`
        };
      default:
        return {
          title: "Template Prompt",
          template: "Chọn Part để xem template tương ứng"
        };
    }
  };

  // Question selection handlers
  const toggleQuestionSelection = (index: number) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAllQuestions = () => {
    setSelectedQuestions(new Set(generatedQuestions.map((_, index) => index)));
  };

  const deselectAllQuestions = () => {
    setSelectedQuestions(new Set());
  };

  const isQuestionSelected = (index: number) => selectedQuestions.has(index);
  const selectedCount = selectedQuestions.size;

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: 'Lỗi',
        description: 'Bạn cần đăng nhập để sử dụng tính năng này.',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    setError(null);
    setProgress(0);
    setGeneratedQuestions([]);
    setSelectedQuestions(new Set());

    try {
      let result;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Always use Groq AI service
      const service = questionGeneratorService;

      // Special handling for Part 6
      if (formData.part === 6) {
        if (!formData.content.trim()) {
          throw new Error('Vui lòng nhập nội dung để tạo câu hỏi Part 6');
        }
        
        const part6Result = await service.generatePart6Questions({
          content: formData.content,
          type: 'reading' as DrillType,
          difficulty: formData.difficulty as Difficulty,
          questionCount: 4, // Part 6 always has 4 questions
          language: formData.language
        });

        if (part6Result.success && part6Result.passage && part6Result.questions) {
          setPart6Result({
            passage: part6Result.passage,
            questions: part6Result.questions
          });
          setGeneratedQuestions(part6Result.questions);
          toast({
            title: 'Thành công!',
            description: `Đã tạo passage và ${part6Result.questions.length} câu hỏi Part 6.`
          });
        } else {
          console.error('Part 6 generation failed:', part6Result);
          throw new Error(part6Result.error || 'Không thể tạo câu hỏi Part 6. Vui lòng thử lại.');
        }
        return;
      }

      // Special handling for Part 7
      if (formData.part === 7) {
        if (!formData.content.trim()) {
          throw new Error('Vui lòng nhập nội dung để tạo câu hỏi Part 7');
        }
        
        console.log('🔍 DEBUG: Part 7 passageCount:', passageCount);
        
        const part7Result = await service.generatePart7Questions({
          content: formData.content,
          type: 'reading' as DrillType,
          difficulty: formData.difficulty as Difficulty,
          questionCount: formData.questionCount,
          language: formData.language,
          passageCount: passageCount
        });

        if (part7Result.success && part7Result.passages && part7Result.questions) {
          setPart7Result({
            passages: part7Result.passages,
            questions: part7Result.questions
          });
          setGeneratedQuestions(part7Result.questions);
          toast({
            title: 'Thành công!',
            description: `Đã tạo ${part7Result.passages.length} passage và ${part7Result.questions.length} câu hỏi Part 7.`
          });
        } else {
          console.error('Part 7 generation failed:', part7Result);
          throw new Error(part7Result.error || 'Không thể tạo câu hỏi Part 7. Vui lòng thử lại.');
        }
        return;
      }

      switch (activeTab) {
        case 'text':
          if (!formData.content.trim()) {
            throw new Error('Vui lòng nhập nội dung để tạo câu hỏi');
          }
          result = await service.generateQuestions({
            content: formData.content,
            type: formData.type as DrillType,
            difficulty: formData.difficulty as Difficulty,
            questionCount: formData.questionCount,
            language: formData.language
          });
          break;

        case 'file':
          if (!file) {
            throw new Error('Vui lòng chọn file để tạo câu hỏi');
          }
          result = await service.generateFromFile(file, {
            type: formData.type as DrillType,
            difficulty: formData.difficulty as Difficulty,
            questionCount: formData.questionCount,
            language: formData.language
          });
          break;

        case 'url':
          if (!url.trim()) {
            throw new Error('Vui lòng nhập URL để tạo câu hỏi');
          }
          result = await service.generateFromUrl(url, {
            type: formData.type as DrillType,
            difficulty: formData.difficulty as Difficulty,
            questionCount: formData.questionCount,
            language: formData.language
          });
          break;
      }

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.questions.length > 0) {
        setGeneratedQuestions(result.questions);
        toast({
          title: 'Thành công!',
          description: `Đã tạo ${result.questions.length} câu hỏi từ nội dung.`
        });
      } else {
        throw new Error(result.error || 'Không thể tạo câu hỏi');
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo câu hỏi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleSaveQuestions = async () => {
    if (!user || generatedQuestions.length === 0) return;

    // Check if Part 7 requires passage
    if (formData.part === 7) {
      toast({
        title: 'Lỗi',
        description: 'Part 7 cần có passage. Vui lòng tạo passage trước hoặc chọn Part khác.',
        variant: 'destructive'
      });
      return;
    }

    // Special handling for Part 6
    if (formData.part === 6 && part6Result) {
      try {
        // First create the passage
        const { data: passageData, error: passageError } = await supabase
          .from('passages')
          .insert({
            part: 6,
            passage_type: 'single',
            texts: {
              content: part6Result.passage.content
            },
            created_by: user.id
          })
          .select()
          .single();

        if (passageError) {
          throw passageError;
        }

        // Then create questions with passage_id
        const questionsToSave = part6Result.questions.map((q, index) => ({
          part: 6,
          passage_id: passageData.id,
          blank_index: index + 1,
          prompt_text: `Blank ${index + 1}`, // Simple prompt for Part 6
          choices: q.choices,
          correct_choice: q.answer,
          explain_vi: q.explain_vi,
          explain_en: q.explain_en,
          difficulty: formData.difficulty === 'mix' ? 'medium' : formData.difficulty,
          status: 'published',
          created_by: user.id,
          tags: q.tags,
          audio_url: null,
          transcript: null,
          image_url: null
        }));

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToSave);

        if (questionsError) {
          throw questionsError;
        }

        toast({
          title: 'Thành công!',
          description: `Đã tạo passage và ${questionsToSave.length} câu hỏi Part 6 vào hệ thống.`
        });

        // Reset
        setPart6Result(null);
        setGeneratedQuestions([]);
        setSelectedQuestions(new Set());

      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'Không thể lưu câu hỏi Part 6. Vui lòng thử lại.',
          variant: 'destructive'
        });
      }
      return;
    }

    // Special handling for Part 7
    if (formData.part === 7 && part7Result) {
      try {
        // Create passages first
        const passageDataArray = [];
        for (const passage of part7Result.passages) {
          const { data: passageData, error: passageError } = await supabase
            .from('passages')
            .insert({
              part: 7,
              passage_type: 'single',
              texts: {
                content: passage.content,
                type: passage.type,
                title: passage.title
              },
              created_by: user.id
            })
            .select()
            .single();

          if (passageError) {
            throw passageError;
          }
          passageDataArray.push(passageData);
        }

        // Then create questions with passage_id
        const questionsToSave = part7Result.questions.map((q, index) => ({
          part: 7,
          passage_id: passageDataArray[0].id, // Use first passage for all questions
          prompt_text: q.question,
          choices: q.choices,
          correct_choice: q.answer,
          explain_vi: q.explain_vi,
          explain_en: q.explain_en,
          difficulty: formData.difficulty === 'mix' ? 'medium' : formData.difficulty,
          status: 'published',
          created_by: user.id,
          tags: q.tags,
          audio_url: null,
          transcript: null,
          image_url: null
        }));

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToSave);

        if (questionsError) {
          throw questionsError;
        }

        toast({
          title: 'Thành công!',
          description: `Đã tạo ${passageDataArray.length} passage và ${questionsToSave.length} câu hỏi Part 7 vào hệ thống.`
        });

        // Reset
        setPart7Result(null);
        setGeneratedQuestions([]);
        setSelectedQuestions(new Set());

      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'Không thể lưu câu hỏi Part 7. Vui lòng thử lại.',
          variant: 'destructive'
        });
      }
      return;
    }

    try {
      const questionsToSave = generatedQuestions.map(q => ({
        part: formData.part,
        prompt_text: q.question,
        choices: q.choices,
        correct_choice: q.answer,
        explain_vi: q.explain_vi,
        explain_en: q.explain_en,
        difficulty: formData.difficulty === 'mix' ? 'medium' : formData.difficulty,
        status: 'published',
        created_by: user.id,
        tags: q.tags,
        audio_url: null,
        transcript: null,
        image_url: null,
        passage_id: null,
        blank_index: null
      }));

      const { error } = await supabase
        .from('questions')
        .insert(questionsToSave);

      if (error) {
        throw error;
      }

      toast({
        title: 'Thành công!',
        description: `Đã lưu ${questionsToSave.length} câu hỏi vào hệ thống.`
      });

      // Notify parent component
      if (onQuestionsGenerated) {
        onQuestionsGenerated(questionsToSave as unknown as Question[]);
      }

      // Reset form
      setGeneratedQuestions([]);
      setSelectedQuestions(new Set());
      setFormData({
        content: '',
        type: 'mix',
        difficulty: 'medium',
        questionCount: 5,
        language: 'vi',
        part: 5
      });

    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu câu hỏi. Vui lòng thử lại.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveSelectedQuestions = async () => {
    if (!user || selectedCount === 0) return;

    try {
      const selectedQuestionsData = Array.from(selectedQuestions).map(index => generatedQuestions[index]);
      
      const questionsToSave = selectedQuestionsData.map(q => ({
        part: formData.part,
        prompt_text: q.question,
        choices: q.choices,
        correct_choice: q.answer,
        explain_vi: q.explain_vi,
        explain_en: q.explain_en,
        difficulty: formData.difficulty === 'mix' ? 'medium' : formData.difficulty,
        status: 'published',
        created_by: user.id,
        tags: q.tags,
        audio_url: null,
        transcript: null,
        image_url: null,
        passage_id: null,
        blank_index: null
      }));

      const { error } = await supabase
        .from('questions')
        .insert(questionsToSave);

      if (error) {
        throw error;
      }

      toast({
        title: 'Thành công!',
        description: `Đã lưu ${questionsToSave.length} câu hỏi đã chọn vào hệ thống.`
      });

      // Notify parent component
      if (onQuestionsGenerated) {
        onQuestionsGenerated(questionsToSave as unknown as Question[]);
      }

      // Remove saved questions from the list
      const remainingQuestions = generatedQuestions.filter((_, index) => !selectedQuestions.has(index));
      setGeneratedQuestions(remainingQuestions);
      setSelectedQuestions(new Set());

    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu câu hỏi đã chọn. Vui lòng thử lại.',
        variant: 'destructive'
      });
    }
  };

  const handleCopyQuestion = (question: GeneratedQuestion) => {
    const text = `Câu hỏi: ${question.question}\n\nLựa chọn:\nA. ${question.choices[0]}\nB. ${question.choices[1]}\nC. ${question.choices[2]}\nD. ${question.choices[3]}\n\nĐáp án: ${question.answer}\n\nGiải thích (VI): ${question.explain_vi}\nGiải thích (EN): ${question.explain_en}`;
    
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Đã sao chép',
        description: 'Câu hỏi đã được sao chép vào clipboard.'
      });
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-gradient bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
                Tạo câu hỏi TOEIC thông minh
              </CardTitle>
              <CardDescription className="text-base mt-2">
                🚀 Sử dụng Groq AI để tạo câu hỏi TOEIC chất lượng cao từ văn bản, file hoặc URL
                <br />
                ✨ Hỗ trợ nhiều loại câu hỏi: Từ vựng, Ngữ pháp, Nghe hiểu, Đọc hiểu
                <br />
                🔑 Cần cấu hình Groq API Key (miễn phí tại console.groq.com)
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowPromptGuide(true)}
              variant="outline"
              className="flex items-center gap-2 bg-white hover:bg-gray-50"
            >
              <HelpCircle className="h-4 w-4" />
              Hướng dẫn Prompt
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình tạo câu hỏi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Groq AI Info */}
          <div className="relative p-6 border-2 rounded-xl border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">Groq AI-Powered Generation</h3>
                  <Badge className="text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">
                    Powered by Groq
                  </Badge>
                  <Badge className="text-xs font-medium bg-green-100 text-green-800 border-green-200">
                    <Gift className="h-3 w-3 mr-1" />
                    Miễn phí
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Sử dụng Groq AI để tạo câu hỏi chất lượng cao - Hoàn toàn miễn phí
                </p>
              </div>
            </div>
          </div>

          {/* API Status */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Trạng thái kết nối AI</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-700">Đã cấu hình</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✅ Groq AI đã sẵn sàng:</strong> Bạn có thể sử dụng tính năng tạo câu hỏi bằng AI ngay bây giờ!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Sử dụng mô hình llama-3.1-8b-instant để tạo câu hỏi chất lượng cao
              </p>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-blue-100">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <AlertDescription className="text-blue-800">
                  <strong>🤖 Groq AI:</strong> Sử dụng mô hình llama-3.1-8b-instant để tạo câu hỏi chất lượng cao
                  <br />
                  <span className="text-sm">• Cần cấu hình API key (miễn phí tại console.groq.com)</span>
                  <br />
                  <span className="text-sm">• Tạo câu hỏi đa dạng và phù hợp với nội dung</span>
                  <br />
                  <span className="text-sm">• Hỗ trợ tất cả loại câu hỏi TOEIC</span>
                  <br />
                  <span className="text-sm">• Tốc độ xử lý nhanh và ổn định</span>
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Part TOEIC
              </Label>
              <Select
                value={formData.part.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, part: parseInt(value) }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">📸 Part 1 - Photos</SelectItem>
                  <SelectItem value="2">❓ Part 2 - Question-Response</SelectItem>
                  <SelectItem value="3">💬 Part 3 - Conversations</SelectItem>
                  <SelectItem value="4">📢 Part 4 - Talks</SelectItem>
                  <SelectItem value="5">📝 Part 5 - Incomplete Sentences</SelectItem>
                  <SelectItem value="6">📄 Part 6 - Text Completion (AI tạo passage)</SelectItem>
                  <SelectItem value="7">📖 Part 7 - Reading Comprehension (AI tạo passage)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Loại câu hỏi
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as DrillType | 'mix' }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mix">🎯 Hỗn hợp</SelectItem>
                  <SelectItem value="vocab">📚 Từ vựng</SelectItem>
                  <SelectItem value="grammar">📝 Ngữ pháp</SelectItem>
                  <SelectItem value="listening">🎧 Nghe hiểu (dựa trên transcript)</SelectItem>
                  <SelectItem value="reading">📖 Đọc hiểu</SelectItem>
                </SelectContent>
              </Select>
              {formData.type === 'listening' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Lưu ý:</strong> Câu hỏi listening sẽ được tạo dựa trên transcript (văn bản) bạn cung cấp. 
                    AI sẽ tạo các tình huống nghe hiểu thực tế như hội thoại, thông báo, bài thuyết trình.
                  </p>
                </div>
              )}
              {formData.type === 'reading' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>📖 Part 5 - Incomplete Sentences:</strong> AI sẽ tạo câu hỏi hoàn thành câu theo format TOEIC chuẩn. 
                    Tập trung vào ngữ pháp, từ vựng trong ngữ cảnh kinh doanh và công việc.
                  </p>
                </div>
              )}
              
              {/* Part 6 Notice */}
              {formData.part === 6 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>📄 Part 6 - Text Completion:</strong> AI sẽ tạo passage có 4 chỗ trống và 4 câu hỏi tương ứng. 
                    Passage sẽ có ngữ cảnh kinh doanh thực tế như email, memo, báo cáo.
                  </p>
                </div>
              )}

              {/* Part 7 Passage Count Selection */}
              {formData.part === 7 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-800">Số lượng Passages:</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((count) => (
                      <Button
                        key={count}
                        variant={passageCount === count ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPassageCount(count)}
                        className="text-xs"
                      >
                        {count} Passage{count > 1 ? 's' : ''}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-orange-700 mt-2">
                    AI sẽ tạo {passageCount} passage{passageCount > 1 ? 's' : ''} liên quan và câu hỏi tương ứng
                  </p>
                </div>
              )}

              {/* Template Prompt Button */}
              {[5, 6, 7].includes(formData.part) && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-800">
                        Template Prompt cho {getPartTemplate(formData.part).title}:
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplate(!showTemplate)}
                      className="text-xs"
                    >
                      {showTemplate ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                      {showTemplate ? 'Ẩn' : 'Hiện'} Template
                    </Button>
                  </div>
                  
                  {showTemplate && (
                    <div className="bg-white p-3 rounded border text-xs font-mono text-gray-700 leading-relaxed">
                      <pre className="whitespace-pre-wrap">{getPartTemplate(formData.part).template}</pre>
                    </div>
                  )}
                  
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(getPartTemplate(formData.part).template);
                        toast({
                          title: 'Đã copy!',
                          description: 'Template prompt đã được copy vào clipboard.'
                        });
                      }}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Template
                    </Button>
                  </div>
                </div>
              )}

            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Độ khó
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as Difficulty | 'mix' }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mix">🎲 Hỗn hợp</SelectItem>
                  <SelectItem value="easy">🟢 Dễ (400-500 điểm)</SelectItem>
                  <SelectItem value="medium">🟡 Trung bình (500-700 điểm)</SelectItem>
                  <SelectItem value="hard">🔴 Khó (700+ điểm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Số câu hỏi
              </Label>
              <Select
                value={formData.questionCount.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, questionCount: parseInt(value) }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">📝 3 câu</SelectItem>
                  <SelectItem value="5">📄 5 câu</SelectItem>
                  <SelectItem value="10">📋 10 câu</SelectItem>
                  <SelectItem value="15">📊 15 câu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Ngôn ngữ giải thích
            </Label>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData(prev => ({ ...prev, language: value as 'vi' | 'en' }))}
            >
              <SelectTrigger className="w-64 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">🇻🇳 Tiếng Việt chi tiết</SelectItem>
                <SelectItem value="en">🇺🇸 Tiếng Anh chi tiết</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Input */}
      <Card>
        <CardHeader>
          <CardTitle>Nguồn nội dung</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'text' | 'file' | 'url')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Văn bản
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                File
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label>Nội dung văn bản</Label>
                <Textarea
                  placeholder="Nhập hoặc dán nội dung văn bản để tạo câu hỏi..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.content.length} ký tự
                </p>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label>Chọn file</Label>
                <Input
                  type="file"
                  accept=".txt,.md,.doc,.docx"
                  onChange={handleFileChange}
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Nhập URL của bài viết hoặc trang web để tạo câu hỏi
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Tạo câu hỏi bằng Groq AI
                <Badge className="text-xs bg-green-100 text-green-800">
                  <Gift className="h-3 w-3 mr-1" />
                  Miễn phí
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                Sẽ tạo {formData.questionCount} câu hỏi {formData.type} {formData.difficulty} bằng Groq AI
              </p>
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full h-14 text-lg font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-400"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang tạo câu hỏi...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  <span>Tạo câu hỏi ({formData.questionCount} câu)</span>
                </div>
              )}
            </Button>

            {loading && (
              <div className="space-y-3">
                <div className="relative">
                  <Progress value={progress} className="h-3 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {progress}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý nội dung và tạo câu hỏi...</span>
                </div>
              </div>
            )}

          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Part 6 Passage */}
      {part6Result && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <FileText className="h-5 w-5" />
              Passage Part 6 - Text Completion
            </CardTitle>
            <CardDescription>
              Đoạn văn có 4 chỗ trống để điền từ phù hợp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {part6Result.passage.content}
              </pre>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-purple-600">
              <Target className="h-4 w-4" />
              <span>4 chỗ trống: {part6Result.passage.blanks.join(', ')}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Part 6 Answer Choices */}
      {part6Result && part6Result.questions.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Target className="h-5 w-5" />
              Answer Choices for Part 6
            </CardTitle>
            <CardDescription>
              Chọn đáp án đúng cho từng chỗ trống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {part6Result.questions.map((q, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      Blank {q.question.split(' ')[1]}
                    </Badge>
                    <span className="text-sm text-gray-600">Choose the correct answer:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {q.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-center gap-2 p-2 rounded border">
                        <span className="font-mono text-sm font-bold text-blue-600">
                          {String.fromCharCode(65 + choiceIndex)}
                        </span>
                        <span className="text-sm">{choice}</span>
                        {choiceIndex === 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Correct
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    <strong>Giải thích:</strong> {q.explain_vi}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Part 7 Passages */}
      {part7Result && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <FileText className="h-5 w-5" />
              Passages Part 7 - Reading Comprehension
            </CardTitle>
            <CardDescription>
              Đoạn văn đọc hiểu với câu hỏi trắc nghiệm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {part7Result.passages.map((passage, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="bg-purple-100 text-purple-700">
                      Passage {index + 1}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {passage.type}
                    </Badge>
                    {passage.title && (
                      <span className="text-sm font-medium text-gray-600">
                        {passage.title}
                      </span>
                    )}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {passage.content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    🎉 Câu hỏi đã tạo thành công!
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {generatedQuestions.length} câu
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-base">
                    ✨ Xem lại và chỉnh sửa câu hỏi trước khi lưu vào hệ thống
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllQuestions}
                  disabled={selectedCount === generatedQuestions.length}
                >
                  Chọn tất cả
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={deselectAllQuestions}
                  disabled={selectedCount === 0}
                >
                  Bỏ chọn tất cả
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveSelectedQuestions} 
                  disabled={selectedCount === 0}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <Save className="h-4 w-4" />
                  Lưu đã chọn ({selectedCount})
                </Button>
                <Button 
                  onClick={handleSaveQuestions} 
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  Lưu tất cả
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <Card key={index} className={`border-l-4 shadow-sm hover:shadow-md transition-all ${
                isQuestionSelected(index) 
                  ? 'border-l-green-500 bg-green-50' 
                  : 'border-l-blue-500'
              }`}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isQuestionSelected(index)}
                            onCheckedChange={() => toggleQuestionSelection(index)}
                            className="w-5 h-5"
                          />
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-lg">Câu hỏi {index + 1}</h4>
                        {isQuestionSelected(index) && (
                          <Badge className="bg-green-100 text-green-800">
                            Đã chọn
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyQuestion(question)}
                          className="hover:bg-blue-50"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Sao chép
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-base leading-relaxed">{question.question}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.choices.map((choice, choiceIndex) => {
                        const isCorrect = choiceIndex === question.answer.charCodeAt(0) - 65;
                        return (
                          <div key={choiceIndex} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                            isCorrect 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                              isCorrect 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {String.fromCharCode(65 + choiceIndex)}
                            </div>
                            <span className={`flex-1 ${isCorrect ? 'font-medium text-green-700' : 'text-gray-700'}`}>
                              {choice}
                            </span>
                            {isCorrect && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">Đáp án</Badge>
                        <span className="font-semibold text-blue-700">{question.answer}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-white">🇻🇳 VI</Badge>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{question.explain_vi}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-white">🇺🇸 EN</Badge>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{question.explain_en}</p>
                          </div>
                        </div>
                      </div>
                      
                      {question.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="bg-white">Tags</Badge>
                          {question.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Prompt Guide Modal */}
      {showPromptGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Hướng dẫn Prompt chuẩn TOEIC
              </h2>
              <Button
                onClick={() => setShowPromptGuide(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Introduction */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">🎯 Mục đích</h3>
                <p className="text-blue-700 text-sm">
                  Hướng dẫn cách prompt hiệu quả để tạo câu hỏi TOEIC chất lượng cao với AI. 
                  Mỗi Part có format và yêu cầu riêng biệt.
                </p>
              </div>

              {/* Part 1 - Photos */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📸 Part 1 - Photos
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                    <code className="text-xs bg-white p-2 rounded block">
                      "Tạo câu hỏi Part 1 TOEIC từ hình ảnh mô tả: [Mô tả hình ảnh]<br/>
                      Yêu cầu: Tạo 4 câu mô tả hình ảnh, chỉ có 1 câu đúng"
                    </code>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Lưu ý:</strong> Part 1 cần hình ảnh thực tế, AI Generator không hỗ trợ tạo câu hỏi Part 1.
                  </div>
                </div>
              </div>

              {/* Part 2 - Question-Response */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  ❓ Part 2 - Question-Response
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                    <code className="text-xs bg-white p-2 rounded block">
                      "Tạo câu hỏi Part 2 TOEIC từ tình huống: [Mô tả tình huống]<br/>
                      Yêu cầu: Tạo 1 câu hỏi và 3 câu trả lời (A, B, C), chỉ có 1 câu đúng"
                    </code>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Lưu ý:</strong> Tập trung vào hội thoại ngắn trong môi trường công việc.
                  </div>
                </div>
              </div>

              {/* Part 3 - Conversations */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  💬 Part 3 - Conversations
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                    <code className="text-xs bg-white p-2 rounded block">
                      "Tạo câu hỏi Part 3 TOEIC từ đoạn hội thoại:<br/>
                      [Đoạn hội thoại]<br/>
                      Yêu cầu: Tạo 3 câu hỏi về nội dung hội thoại, mỗi câu có 4 lựa chọn"
                    </code>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Lưu ý:</strong> Cần tạo passage trước. Sử dụng Question Creator thay vì AI Generator.
                  </div>
                </div>
              </div>

              {/* Part 4 - Talks */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📢 Part 4 - Talks
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                    <code className="text-xs bg-white p-2 rounded block">
                      "Tạo câu hỏi Part 4 TOEIC từ bài nói:<br/>
                      [Nội dung bài nói]<br/>
                      Yêu cầu: Tạo 3 câu hỏi về nội dung bài nói, mỗi câu có 4 lựa chọn"
                    </code>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Lưu ý:</strong> Cần tạo passage trước. Sử dụng Question Creator thay vì AI Generator.
                  </div>
                </div>
              </div>

              {/* Part 5 - Incomplete Sentences */}
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📝 Part 5 - Incomplete Sentences (AI Generator hỗ trợ)
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                    <code className="text-xs bg-white p-2 rounded block">
                      "Tạo câu hỏi Part 5 TOEIC từ nội dung:<br/>
                      [Nội dung văn bản kinh doanh]<br/>
                      Yêu cầu: Tạo 5 câu hỏi hoàn thành câu, tập trung vào ngữ pháp và từ vựng kinh doanh"
                    </code>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>✅ Hỗ trợ:</strong> AI Generator có thể tạo câu hỏi Part 5 trực tiếp.
                  </div>
                </div>
              </div>

              {/* Part 6 - Text Completion */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📄 Part 6 - Text Completion
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                    <code className="text-xs bg-white p-2 rounded block">
                      "Tạo câu hỏi Part 6 TOEIC từ đoạn văn:<br/>
                      [Đoạn văn có chỗ trống]<br/>
                      Yêu cầu: Tạo 4 câu hỏi điền từ vào chỗ trống, mỗi câu có 4 lựa chọn"
                    </code>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Lưu ý:</strong> Cần tạo passage trước. Sử dụng Question Creator thay vì AI Generator.
                  </div>
                </div>
              </div>

              {/* Part 7 - Reading Comprehension */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📖 Part 7 - Reading Comprehension
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                    <code className="text-xs bg-white p-2 rounded block">
                      "Tạo câu hỏi Part 7 TOEIC từ văn bản:<br/>
                      [Email/Memo/Notice/Article]<br/>
                      Yêu cầu: Tạo 5 câu hỏi đọc hiểu, bao gồm main idea, detail, inference"
                    </code>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Lưu ý:</strong> Cần tạo passage trước. Sử dụng Question Creator thay vì AI Generator.
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">💡 Mẹo prompt hiệu quả</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Sử dụng ngữ cảnh kinh doanh và công việc thực tế</li>
                  <li>• Chỉ định rõ số lượng câu hỏi cần tạo</li>
                  <li>• Mô tả độ khó phù hợp (easy/medium/hard)</li>
                  <li>• Cung cấp nội dung có cấu trúc rõ ràng</li>
                  <li>• Yêu cầu giải thích chi tiết cho mỗi câu hỏi</li>
                </ul>
              </div>

              {/* AI Generator Support */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">🤖 AI Generator hỗ trợ</h3>
                <div className="text-blue-700 text-sm">
                  <p><strong>✅ Hỗ trợ:</strong> Part 5 (Incomplete Sentences)</p>
                  <p><strong>❌ Không hỗ trợ:</strong> Part 1, 3, 4, 6, 7 (cần passage hoặc hình ảnh)</p>
                  <p><strong>⚠️ Hạn chế:</strong> Part 2 (có thể tạo nhưng không tối ưu)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionGenerator;
