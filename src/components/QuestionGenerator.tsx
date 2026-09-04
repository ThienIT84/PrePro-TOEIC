import React from 'react';
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
import { 
  FileText, 
  Upload, 
  Link, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Copy,
  Gift,
  Globe,
  Target,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DrillType, Difficulty } from '@/types';
import { useQuestionGenerator } from '@/hooks/useQuestionGenerator';
import { QuestionGeneratorProps } from './question-generator/types';
import { getPartTemplate } from './question-generator/partTemplates';
import { PromptGuideModal } from './question-generator/PromptGuideModal';
import { AIProviderConfig } from './question-generator/AIProviderConfig';
import { Part6ResultDisplay } from './question-generator/Part6ResultDisplay';
import { Part7ResultDisplay } from './question-generator/Part7ResultDisplay';
import { GeneratedQuestionsList } from './question-generator/GeneratedQuestionsList';

const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({ onQuestionsGenerated }) => {
  const {
    activeTab,
    setActiveTab,
    loading,
    progress,
    generatedQuestions,
    selectedQuestions,
    error,
    formData,
    setFormData,
    file,
    url,
    setUrl,
    showPromptGuide,
    setShowPromptGuide,
    part6Result,
    part7Result,
    showTemplate,
    setShowTemplate,
    passageCount,
    setPassageCount,
    apiKey,
    setApiKey,
    aiProvider,
    setAiProvider,
    ollamaStatus,
    ollamaModel,
    setOllamaModel,
    availableModels,
    checkOllamaConnection,
    saveApiKey,
    toggleQuestionSelection,
    selectAllQuestions,
    deselectAllQuestions,
    handleGenerate,
    handleSaveQuestions,
    handleSaveSelectedQuestions,
    handleCopyQuestion,
    handleFileChange
  } = useQuestionGenerator({ onQuestionsGenerated });

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
          {/* AI Provider Config */}
          <AIProviderConfig
            aiProvider={aiProvider}
            setAiProvider={setAiProvider}
            apiKey={apiKey}
            setApiKey={setApiKey}
            onSaveApiKey={saveApiKey}
            ollamaStatus={ollamaStatus}
            ollamaModel={ollamaModel}
            setOllamaModel={setOllamaModel}
            availableModels={availableModels}
            onCheckOllamaConnection={checkOllamaConnection}
          />

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

      {/* Part 6 Passage - Only show if Part 6 was generated */}
      {part6Result && formData.part === 6 && (
        <Part6ResultDisplay result={part6Result} />
      )}

      {/* Part 7 Passages - Only show if Part 7 was generated */}
      {part7Result && formData.part === 7 && (
        <Part7ResultDisplay result={part7Result} />
      )}

      {/* Generated Questions */}
      <GeneratedQuestionsList
        questions={generatedQuestions}
        selectedQuestions={selectedQuestions}
        onToggleSelection={toggleQuestionSelection}
        onSelectAll={selectAllQuestions}
        onDeselectAll={deselectAllQuestions}
        onSaveSelected={handleSaveSelectedQuestions}
        onSaveAll={handleSaveQuestions}
        onCopyQuestion={handleCopyQuestion}
      />

      {/* Prompt Guide Modal */}
      <PromptGuideModal
        open={showPromptGuide}
        onClose={() => setShowPromptGuide(false)}
      />
    </div>
  );
};

export default QuestionGenerator;
