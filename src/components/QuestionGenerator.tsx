import { useState } from 'react';
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
  Gift
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DrillType, Difficulty, Question } from '@/types';
import { questionGeneratorService, GeneratedQuestion } from '@/services/questionGenerator';
import { freeQuestionGeneratorService } from '@/services/freeQuestionGenerator';
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
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    content: '',
    type: 'mix' as DrillType | 'mix',
    difficulty: 'medium' as Difficulty | 'mix',
    questionCount: 5,
    language: 'vi' as 'vi' | 'en',
    useAI: false // New field to choose between AI and Free
  });

  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');

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

    try {
      let result;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Choose service based on useAI flag
      const service = formData.useAI ? questionGeneratorService : freeQuestionGeneratorService;

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

    try {
      const questionsToSave = generatedQuestions.map(q => ({
        type: formData.type === 'mix' ? 'vocab' : formData.type,
        difficulty: formData.difficulty === 'mix' ? 'medium' : formData.difficulty,
        question: q.question,
        choices: q.choices,
        answer: q.answer,
        explain_vi: q.explain_vi,
        explain_en: q.explain_en,
        audio_url: null,
        transcript: null,
        tags: q.tags
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
        onQuestionsGenerated(questionsToSave as Question[]);
      }

      // Reset form
      setGeneratedQuestions([]);
      setFormData({
        content: '',
        type: 'mix',
        difficulty: 'medium',
        questionCount: 5,
        language: 'vi',
        useAI: false
      });

    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu câu hỏi. Vui lòng thử lại.',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Tạo câu hỏi tự động từ nội dung
          </CardTitle>
          <CardDescription>
            Sử dụng AI để tạo câu hỏi TOEIC chất lượng cao từ văn bản, file hoặc URL
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình tạo câu hỏi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI/Free Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {formData.useAI ? (
                  <>
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-medium">AI-Powered</span>
                    <Badge variant="default" className="text-xs">Premium</Badge>
                  </>
                ) : (
                  <>
                    <Gift className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Free Template</span>
                    <Badge variant="secondary" className="text-xs">Free</Badge>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="ai-toggle" className="text-sm">
                {formData.useAI ? 'AI Mode' : 'Free Mode'}
              </Label>
              <Switch
                id="ai-toggle"
                checked={formData.useAI}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useAI: checked }))}
              />
            </div>
          </div>

          {formData.useAI && (
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                AI mode sử dụng OpenAI GPT-4 để tạo câu hỏi chất lượng cao. Cần cấu hình API key và có chi phí sử dụng.
              </AlertDescription>
            </Alert>
          )}

          {!formData.useAI && (
            <Alert className="border-green-200 bg-green-50">
              <Gift className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Free mode sử dụng template có sẵn để tạo câu hỏi. Hoàn toàn miễn phí và không cần cấu hình.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Loại câu hỏi</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as DrillType | 'mix' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mix">Hỗn hợp</SelectItem>
                  <SelectItem value="vocab">Từ vựng</SelectItem>
                  <SelectItem value="grammar">Ngữ pháp</SelectItem>
                  <SelectItem value="listening">Nghe hiểu</SelectItem>
                  <SelectItem value="reading">Đọc hiểu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Độ khó</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as Difficulty | 'mix' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mix">Hỗn hợp</SelectItem>
                  <SelectItem value="easy">Dễ (400-500 điểm)</SelectItem>
                  <SelectItem value="medium">Trung bình (500-700 điểm)</SelectItem>
                  <SelectItem value="hard">Khó (700+ điểm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Số câu hỏi</Label>
              <Select
                value={formData.questionCount.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, questionCount: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 câu</SelectItem>
                  <SelectItem value="5">5 câu</SelectItem>
                  <SelectItem value="10">10 câu</SelectItem>
                  <SelectItem value="15">15 câu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ngôn ngữ giải thích</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData(prev => ({ ...prev, language: value as 'vi' | 'en' }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt chi tiết</SelectItem>
                <SelectItem value="en">Tiếng Anh chi tiết</SelectItem>
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
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo câu hỏi...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Tạo câu hỏi ({formData.questionCount} câu)
              </div>
            )}
          </Button>

          {loading && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Đang xử lý... {progress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Câu hỏi đã tạo ({generatedQuestions.length})
                </CardTitle>
                <CardDescription>
                  Xem lại và chỉnh sửa câu hỏi trước khi lưu vào hệ thống
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveQuestions} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Lưu tất cả
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">Câu {index + 1}</h4>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyQuestion(question)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm">{question.question}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {question.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {String.fromCharCode(65 + choiceIndex)}
                          </Badge>
                          <span className={choiceIndex === question.answer.charCodeAt(0) - 65 ? 'font-medium text-green-600' : ''}>
                            {choice}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Đáp án:</strong> {question.answer}
                      </div>
                      <div>
                        <strong>Giải thích (VI):</strong> {question.explain_vi}
                      </div>
                      <div>
                        <strong>Giải thích (EN):</strong> {question.explain_en}
                      </div>
                      {question.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          <strong>Tags:</strong>
                          {question.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs">
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
    </div>
  );
};

export default QuestionGenerator;
