import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Check, AlertCircle } from 'lucide-react';
import type { Difficulty, CorrectChoice } from '@/types';

interface AddQuestionToPassageProps {
  passageId: string;
  passagePart: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AddQuestionToPassage: React.FC<AddQuestionToPassageProps> = ({
  passageId,
  passagePart,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingQuestions, setExistingQuestions] = useState<number[]>([]);
  const [fetchingQuestions, setFetchingQuestions] = useState(true);

  const [questionData, setQuestionData] = useState({
    blank_index: passagePart === 6 ? 131 : null,
    choices: { A: '', B: '', C: '', D: '' },
    correct_choice: 'A' as CorrectChoice,
    difficulty: 'medium' as Difficulty,
    explain_vi: '',
    explain_en: ''
  });

  // Fetch existing questions for this passage
  useEffect(() => {
    fetchExistingQuestions();
  }, [passageId]);

  const fetchExistingQuestions = async () => {
    try {
      setFetchingQuestions(true);
      const { data, error } = await supabase
        .from('questions')
        .select('blank_index')
        .eq('passage_id', passageId)
        .order('blank_index', { ascending: true });

      if (error) throw error;

      const blankIndexes = (data || [])
        .map(q => q.blank_index)
        .filter((idx): idx is number => idx !== null);
      
      setExistingQuestions(blankIndexes);

      // Auto-suggest next blank_index for Part 6
      if (passagePart === 6 && blankIndexes.length > 0) {
        const maxIndex = Math.max(...blankIndexes);
        const minIndex = Math.min(...blankIndexes);
        // Suggest next index in sequence, within the same group of 4
        const groupStart = Math.floor((minIndex - 131) / 4) * 4 + 131;
        const groupEnd = groupStart + 3;
        if (maxIndex < groupEnd) {
          setQuestionData(prev => ({ ...prev, blank_index: maxIndex + 1 }));
        } else {
          setQuestionData(prev => ({ ...prev, blank_index: groupStart }));
        }
      }
    } catch (error) {
      console.error('Error fetching existing questions:', error);
    } finally {
      setFetchingQuestions(false);
    }
  };

  const handleChoiceChange = (choice: 'A' | 'B' | 'C' | 'D', value: string) => {
    setQuestionData(prev => ({
      ...prev,
      choices: { ...prev.choices, [choice]: value }
    }));
  };

  const validateForm = () => {
    const allChoicesFilled = Object.values(questionData.choices).every(choice => choice.trim() !== '');
    
    if (!allChoicesFilled) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ 4 lựa chọn',
        variant: 'destructive'
      });
      return false;
    }

    if (passagePart === 6 && !questionData.blank_index) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn blank index',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (addAnother: boolean = false) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          part: passagePart,
          passage_id: passageId,
          blank_index: questionData.blank_index,
          prompt_text: '', // Part 6 không cần prompt_text
          choices: questionData.choices,
          correct_choice: questionData.correct_choice,
          difficulty: questionData.difficulty,
          explain_vi: questionData.explain_vi,
          explain_en: questionData.explain_en,
          status: 'published',
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: 'Thành công! 🎉',
        description: `Đã thêm câu hỏi ${questionData.blank_index ? `số ${questionData.blank_index}` : ''}`
      });

      if (addAnother) {
        // Reset form for next question
        const currentIndex = questionData.blank_index;
        const groupStart = currentIndex ? Math.floor((currentIndex - 131) / 4) * 4 + 131 : 131;
        const groupEnd = groupStart + 3;
        const nextBlankIndex = currentIndex && currentIndex < groupEnd 
          ? currentIndex + 1 
          : null;
        
        setQuestionData({
          blank_index: nextBlankIndex,
          choices: { A: '', B: '', C: '', D: '' },
          correct_choice: 'A',
          difficulty: 'medium',
          explain_vi: '',
          explain_en: ''
        });
        
        // Refresh existing questions
        await fetchExistingQuestions();
      } else {
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo câu hỏi. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get available blank indexes for Part 6
  const getAvailableBlankIndexes = () => {
    // If there are existing questions, determine the group range from them
    if (existingQuestions.length > 0) {
      const minIndex = Math.min(...existingQuestions);
      const groupStart = Math.floor((minIndex - 131) / 4) * 4 + 131;
      const all = [groupStart, groupStart + 1, groupStart + 2, groupStart + 3];
      return all.filter(idx => !existingQuestions.includes(idx));
    }
    
    // If no existing questions, allow all Part 6 question numbers (131-146)
    const allPart6Numbers = Array.from({ length: 16 }, (_, i) => 131 + i);
    return allPart6Numbers;
  };

  const availableIndexes = passagePart === 6 ? getAvailableBlankIndexes() : [];
  const isComplete = passagePart === 6 && existingQuestions.length >= 4;

  if (fetchingQuestions) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Đã hoàn thành!</strong> Passage này đã có đủ 4 câu hỏi (143-146).
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">➕ Thêm câu hỏi mới</h4>
        {passagePart === 6 && (
          <Badge variant="outline">
            Còn {availableIndexes.length}/4 câu
          </Badge>
        )}
      </div>

      {passagePart === 6 && existingQuestions.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Đã có: {existingQuestions.join(', ')} | Còn thiếu: {availableIndexes.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {passagePart === 6 && (
        <div>
          <Label htmlFor="blank_index">Chỗ trống số *</Label>
          <Select
            value={questionData.blank_index?.toString() || ''}
            onValueChange={(value) => setQuestionData(prev => ({ ...prev, blank_index: parseInt(value) }))}
          >
            <SelectTrigger id="blank_index">
              <SelectValue placeholder="Chọn số chỗ trống" />
            </SelectTrigger>
            <SelectContent>
              {availableIndexes.map(idx => (
                <SelectItem key={idx} value={idx.toString()}>
                  Câu {idx}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        <Label>Các lựa chọn *</Label>
        {(['A', 'B', 'C', 'D'] as const).map(choice => (
          <div key={choice} className="flex items-center gap-2">
            <span className="font-semibold w-8">{choice}.</span>
            <Input
              placeholder={`Lựa chọn ${choice}`}
              value={questionData.choices[choice]}
              onChange={(e) => handleChoiceChange(choice, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="correct_choice">Đáp án đúng *</Label>
          <Select
            value={questionData.correct_choice}
            onValueChange={(value) => setQuestionData(prev => ({ ...prev, correct_choice: value as CorrectChoice }))}
          >
            <SelectTrigger id="correct_choice">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="difficulty">Độ khó *</Label>
          <Select
            value={questionData.difficulty}
            onValueChange={(value) => setQuestionData(prev => ({ ...prev, difficulty: value as Difficulty }))}
          >
            <SelectTrigger id="difficulty">
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

      <div>
        <Label htmlFor="explain_vi">Giải thích (Tiếng Việt)</Label>
        <Textarea
          id="explain_vi"
          placeholder="Giải thích tại sao đáp án này đúng..."
          value={questionData.explain_vi}
          onChange={(e) => setQuestionData(prev => ({ ...prev, explain_vi: e.target.value }))}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="explain_en">Giải thích (English)</Label>
        <Textarea
          id="explain_en"
          placeholder="Explain why this answer is correct..."
          value={questionData.explain_en}
          onChange={(e) => setQuestionData(prev => ({ ...prev, explain_en: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button
          onClick={() => handleSubmit(false)}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Tạo câu hỏi
            </>
          )}
        </Button>
        
        {passagePart === 6 && availableIndexes.length > 1 && (
          <Button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Tạo & Thêm tiếp
              </>
            )}
          </Button>
        )}
        
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="ghost"
        >
          Hủy
        </Button>
      </div>
    </div>
  );
};

export default AddQuestionToPassage;

