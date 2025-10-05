import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface EditQuestionProps {
  question: Question;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedQuestion: Question) => void;
}

const EditQuestion = ({ question, isOpen, onClose, onSave }: EditQuestionProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    part: question.part,
    difficulty: question.difficulty,
    prompt_text: question.prompt_text,
    choices: question.choices,
    correct_choice: question.correct_choice,
    explain_vi: question.explain_vi,
    explain_en: question.explain_en,
    tags: question.tags.join(', '),
    status: question.status,
    image_url: question.image_url || '',
    audio_url: question.audio_url || '',
    transcript: question.transcript || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate form
      if (!formData.prompt_text.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập nội dung câu hỏi",
          variant: "destructive",
        });
        return;
      }

      if (!formData.choices.A || !formData.choices.B || !formData.choices.C || !formData.choices.D) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập đủ 4 lựa chọn",
          variant: "destructive",
        });
        return;
      }

      if (!formData.correct_choice) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn đáp án đúng",
          variant: "destructive",
        });
        return;
      }

      // Prepare data
      const updatedData = {
        part: formData.part,
        difficulty: formData.difficulty,
        prompt_text: formData.prompt_text.trim(),
        choices: formData.choices,
        correct_choice: formData.correct_choice,
        explain_vi: formData.explain_vi.trim(),
        explain_en: formData.explain_en.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        status: formData.status,
        image_url: formData.image_url.trim() || null,
        audio_url: formData.audio_url.trim() || null,
        transcript: formData.transcript.trim() || null
      };

      // Update in database
      const { data, error } = await supabase
        .from('questions')
        .update(updatedData)
        .eq('id', question.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã cập nhật câu hỏi",
      });

      onSave(data);
      onClose();
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật câu hỏi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateChoice = (choice: 'A' | 'B' | 'C' | 'D', value: string) => {
    setFormData(prev => ({
      ...prev,
      choices: {
        ...prev.choices,
        [choice]: value
      }
    }));
  };

  const getPartLabel = (part: number) => {
    const labels = {
      1: 'Part 1 - Photos',
      2: 'Part 2 - Question-Response',
      3: 'Part 3 - Conversations',
      4: 'Part 4 - Talks',
      5: 'Part 5 - Incomplete Sentences',
      6: 'Part 6 - Text Completion',
      7: 'Part 7 - Reading Comprehension'
    };
    return labels[part as keyof typeof labels] || `Part ${part}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: 'Dễ',
      medium: 'Trung bình',
      hard: 'Khó'
    };
    return labels[difficulty as keyof typeof labels] || difficulty;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chỉnh sửa câu hỏi</span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{getPartLabel(formData.part)}</Badge>
              <Badge className={getDifficultyColor(formData.difficulty)}>
                {getDifficultyLabel(formData.difficulty)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part">TOEIC Part</Label>
              <Select
                value={formData.part.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, part: parseInt(value) as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Part 1 - Photos</SelectItem>
                  <SelectItem value="2">Part 2 - Question-Response</SelectItem>
                  <SelectItem value="3">Part 3 - Conversations</SelectItem>
                  <SelectItem value="4">Part 4 - Talks</SelectItem>
                  <SelectItem value="5">Part 5 - Incomplete Sentences</SelectItem>
                  <SelectItem value="6">Part 6 - Text Completion</SelectItem>
                  <SelectItem value="7">Part 7 - Reading Comprehension</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Độ khó</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as any }))}
              >
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question */}
          <div>
            <Label htmlFor="prompt_text">Nội dung câu hỏi</Label>
            <Textarea
              id="prompt_text"
              value={formData.prompt_text}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt_text: e.target.value }))}
              placeholder="Nhập nội dung câu hỏi..."
              rows={3}
            />
          </div>

          {/* Choices */}
          <div>
            <Label>Các lựa chọn</Label>
            <div className="space-y-2">
              {(['A', 'B', 'C', 'D'] as const).map((choice) => (
                <div key={choice} className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {choice}
                  </div>
                  <Input
                    value={formData.choices[choice]}
                    onChange={(e) => updateChoice(choice, e.target.value)}
                    placeholder={`Lựa chọn ${choice}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Correct Answer */}
          <div>
            <Label htmlFor="correct_choice">Đáp án đúng</Label>
            <Select
              value={formData.correct_choice}
              onValueChange={(value) => setFormData(prev => ({ ...prev, correct_choice: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn đáp án đúng" />
              </SelectTrigger>
              <SelectContent>
                {(['A', 'B', 'C', 'D'] as const).map((choice) => (
                  <SelectItem key={choice} value={choice}>
                    {choice}: {formData.choices[choice]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="explain_vi">Giải thích tiếng Việt</Label>
              <Textarea
                id="explain_vi"
                value={formData.explain_vi}
                onChange={(e) => setFormData(prev => ({ ...prev, explain_vi: e.target.value }))}
                placeholder="Giải thích bằng tiếng Việt..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="explain_en">Giải thích tiếng Anh</Label>
              <Textarea
                id="explain_en"
                value={formData.explain_en}
                onChange={(e) => setFormData(prev => ({ ...prev, explain_en: e.target.value }))}
                placeholder="Explanation in English..."
                rows={3}
              />
            </div>
          </div>

          {/* Media URLs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Media URLs</h3>
            
            {/* Part 1 - Images and Audio */}
            {formData.part === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL hình ảnh cho Part 1
                  </p>
                </div>
                <div>
                  <Label htmlFor="audio_url">Audio URL</Label>
                  <Input
                    id="audio_url"
                    value={formData.audio_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, audio_url: e.target.value }))}
                    placeholder="https://example.com/audio.mp3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL audio cho Part 1 (tùy chọn)
                  </p>
                </div>
              </div>
            )}

            {/* Parts 2, 3, 4 - Audio */}
            {[2, 3, 4].includes(formData.part) && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="audio_url">Audio URL</Label>
                  <Input
                    id="audio_url"
                    value={formData.audio_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, audio_url: e.target.value }))}
                    placeholder="https://example.com/audio.mp3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL audio cho Parts 2, 3, 4
                  </p>
                </div>
                <div>
                  <Label htmlFor="transcript">Transcript</Label>
                  <Textarea
                    id="transcript"
                    value={formData.transcript}
                    onChange={(e) => setFormData(prev => ({ ...prev, transcript: e.target.value }))}
                    placeholder="Nội dung audio..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nội dung audio để học sinh tham khảo
                  </p>
                </div>
              </div>
            )}

            {/* Parts 5, 6, 7 - No media */}
            {[5, 6, 7].includes(formData.part) && (
              <div className="text-sm text-muted-foreground">
                Parts 5, 6, 7 không cần media URLs
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="tag1, tag2, tag3..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Phân cách các tag bằng dấu phẩy
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestion;
