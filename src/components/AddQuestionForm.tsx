import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { DrillType, Difficulty } from '@/types';
import { X, Plus } from 'lucide-react';

interface AddQuestionFormProps {
  onSuccess?: () => void;
}

const AddQuestionForm = ({ onSuccess }: AddQuestionFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'vocab' as DrillType,
    difficulty: 'medium' as Difficulty,
    question: '',
    choices: ['', '', '', ''],
    answer: '',
    explain_vi: '',
    explain_en: '',
    audio_url: '',
    transcript: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData(prev => ({
      ...prev,
      choices: newChoices
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.question.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập câu hỏi',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.answer.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập đáp án',
        variant: 'destructive',
      });
      return;
    }

    if (formData.choices.filter(c => c.trim()).length < 2) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập ít nhất 2 lựa chọn',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.explain_vi.trim() || !formData.explain_en.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập giải thích bằng cả tiếng Việt và tiếng Anh',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Test connection first
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('questions')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error(`Kết nối database thất bại: ${testError.message}`);
      }

      console.log('Supabase connection successful');

      // Prepare data for insertion
      const insertData = {
        part: formData.type === 'listening' ? 1 : 5, // Default part based on type
        difficulty: formData.difficulty,
        question: formData.question.trim(),
        choices: formData.choices.filter(c => c.trim()),
        correct_choice: formData.answer.trim().toUpperCase(),
        explain_vi: formData.explain_vi.trim(),
        explain_en: formData.explain_en.trim(),
        audio_url: formData.audio_url.trim() || null,
        transcript: formData.transcript.trim() || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        prompt_text: formData.question.trim(), // Use question as prompt_text
        blank_index: 0, // Default value
        status: 'active', // Default status
        created_by: user?.id || null,
      };

      console.log('Inserting data:', insertData);

      const { data, error } = await supabase
        .from('questions')
        .insert([insertData])
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw new Error(`Lỗi thêm câu hỏi: ${error.message}`);
      }

      console.log('Question added successfully:', data);

      toast({
        title: 'Thành công',
        description: 'Câu hỏi đã được thêm thành công!',
      });

      // Reset form
      setFormData({
        type: 'vocab',
        difficulty: 'medium',
        question: '',
        choices: ['', '', '', ''],
        answer: '',
        explain_vi: '',
        explain_en: '',
        audio_url: '',
        transcript: '',
        tags: [],
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error adding question:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể thêm câu hỏi. Vui lòng thử lại.';
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Thêm câu hỏi mới</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Loại câu hỏi</Label>
              <Select value={formData.type} onValueChange={(value: DrillType) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vocab">Từ vựng</SelectItem>
                  <SelectItem value="grammar">Ngữ pháp</SelectItem>
                  <SelectItem value="listening">Nghe hiểu</SelectItem>
                  <SelectItem value="reading">Đọc hiểu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Độ khó</Label>
              <Select value={formData.difficulty} onValueChange={(value: Difficulty) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Câu hỏi</Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="Nhập câu hỏi..."
              rows={3}
              required
            />
          </div>

          {/* Audio URL (for listening questions) */}
          {formData.type === 'listening' && (
            <div className="space-y-2">
              <Label htmlFor="audio_url">URL Audio (tùy chọn)</Label>
              <Input
                id="audio_url"
                type="url"
                value={formData.audio_url}
                onChange={(e) => handleInputChange('audio_url', e.target.value)}
                placeholder="https://example.com/audio.mp3"
              />
            </div>
          )}

          {/* Transcript (for listening questions) */}
          {formData.type === 'listening' && (
            <div className="space-y-2">
              <Label htmlFor="transcript">Transcript (tùy chọn)</Label>
              <Textarea
                id="transcript"
                value={formData.transcript}
                onChange={(e) => handleInputChange('transcript', e.target.value)}
                placeholder="Nội dung audio..."
                rows={2}
              />
            </div>
          )}

          {/* Choices */}
          <div className="space-y-2">
            <Label>Các lựa chọn</Label>
            <div className="space-y-3">
              {formData.choices.map((choice, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full border-2 border-muted-foreground flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <Input
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Answer */}
          <div className="space-y-2">
            <Label htmlFor="answer">Đáp án đúng</Label>
            <Select value={formData.answer} onValueChange={(value) => handleInputChange('answer', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn đáp án đúng" />
              </SelectTrigger>
              <SelectContent>
                {formData.choices.map((choice, index) => (
                  <SelectItem key={index} value={String.fromCharCode(65 + index)}>
                    {String.fromCharCode(65 + index)}: {choice || `Lựa chọn ${String.fromCharCode(65 + index)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="explain_vi">Giải thích (Tiếng Việt)</Label>
              <Textarea
                id="explain_vi"
                value={formData.explain_vi}
                onChange={(e) => handleInputChange('explain_vi', e.target.value)}
                placeholder="Giải thích tại sao đáp án này đúng..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="explain_en">Explanation (English)</Label>
              <Textarea
                id="explain_en"
                value={formData.explain_en}
                onChange={(e) => handleInputChange('explain_en', e.target.value)}
                placeholder="Explain why this answer is correct..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Thêm tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Đang thêm...' : 'Thêm câu hỏi'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddQuestionForm;
