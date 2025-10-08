import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getQuestionAudioUrl, getAudioSourceDescription } from '@/utils/audioUtils';
import { TOEICPart, Difficulty, QuestionStatus } from '@/types';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  BookOpen,
  Headphones,
  FileText,
  Target,
  CheckCircle,
  Clock,
  Tag,
  AlertTriangle,
  Trash
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface TOEICQuestionManagerProps {
  onEdit?: (questionId: string) => void;
}

const TOEIC_PART_INFO = {
  1: { name: 'Part 1: Photos', icon: '📷', color: 'bg-blue-100 text-blue-800' },
  2: { name: 'Part 2: Question-Response', icon: '💬', color: 'bg-green-100 text-green-800' },
  3: { name: 'Part 3: Conversations', icon: '👥', color: 'bg-purple-100 text-purple-800' },
  4: { name: 'Part 4: Talks', icon: '🎤', color: 'bg-orange-100 text-orange-800' },
  5: { name: 'Part 5: Incomplete Sentences', icon: '✏️', color: 'bg-red-100 text-red-800' },
  6: { name: 'Part 6: Text Completion', icon: '📝', color: 'bg-yellow-100 text-yellow-800' },
  7: { name: 'Part 7: Reading Comprehension', icon: '📖', color: 'bg-indigo-100 text-indigo-800' },
};

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-red-100 text-red-800',
};

const TOEICQuestionManager: React.FC<TOEICQuestionManagerProps> = ({ onEdit }) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPart, setFilterPart] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          passages (
            id,
            texts,
            passage_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách câu hỏi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đã xóa câu hỏi',
      });

      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa câu hỏi',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const deleteSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('questions')
        .delete()
        .in('id', selectedQuestions);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: `Đã xóa ${selectedQuestions.length} câu hỏi`,
      });

      setSelectedQuestions([]);
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting questions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa các câu hỏi đã chọn',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectQuestion = (questionId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions(prev => [...prev, questionId]);
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.prompt_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.explain_vi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPart = filterPart === 'all' || question.part.toString() === filterPart;
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || question.status === filterStatus;

    return matchesSearch && matchesPart && matchesDifficulty && matchesStatus;
  });

  const getPartInfo = (part: TOEICPart) => TOEIC_PART_INFO[part];

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải câu hỏi...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc câu hỏi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phần thi</label>
              <Select value={filterPart} onValueChange={setFilterPart}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(TOEIC_PART_INFO).map(([part, info]) => (
                    <SelectItem key={part} value={part}>
                      {info.icon} {info.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Độ khó</label>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
                  <SelectItem value="archived">Đã lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">
              Câu hỏi TOEIC ({filteredQuestions.length})
            </h3>
            {selectedQuestions.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {selectedQuestions.length} đã chọn
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedQuestions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deleting}>
                    <Trash className="h-4 w-4 mr-2" />
                    Xóa ({selectedQuestions.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa {selectedQuestions.length} câu hỏi đã chọn? 
                      Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={deleteSelectedQuestions}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button onClick={fetchQuestions} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Không có câu hỏi nào</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterPart !== 'all' || filterDifficulty !== 'all' || filterStatus !== 'all'
                  ? 'Không tìm thấy câu hỏi phù hợp với bộ lọc'
                  : 'Chưa có câu hỏi nào được tạo'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Select All Checkbox */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="select-all"
                checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Chọn tất cả ({filteredQuestions.length} câu hỏi)
              </label>
            </div>

            {/* Questions List */}
            <div className="grid gap-4">
              {filteredQuestions.map((question) => {
                const partInfo = getPartInfo(question.part);
                const isSelected = selectedQuestions.includes(question.id);
                return (
                  <Card key={question.id} className={`hover:shadow-md transition-shadow ${
                    isSelected ? 'ring-2 ring-red-200 bg-red-50' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Selection Checkbox */}
                          <Checkbox
                            id={`question-${question.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectQuestion(question.id, checked as boolean)}
                          />
                          
                          <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                          <Badge className={`${partInfo.color} font-medium`}>
                            {partInfo.icon} {partInfo.name}
                          </Badge>
                          <Badge className={DIFFICULTY_COLORS[question.difficulty]}>
                            {question.difficulty}
                          </Badge>
                          <Badge className={STATUS_COLORS[question.status]}>
                            {question.status}
                          </Badge>
                          {question.passage_id && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Có đoạn văn
                            </Badge>
                          )}
                        </div>

                        {/* Question Text */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-lg">Câu hỏi:</h4>
                          <p className="text-gray-700">{question.prompt_text}</p>
                        </div>

                        {/* Choices */}
                        <div className="space-y-1">
                          <h5 className="font-medium">Lựa chọn:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(question.choices).map(([choice, text]) => (
                              <div key={choice} className="flex items-center gap-2">
                                <span className={`font-medium w-6 ${
                                  choice === question.correct_choice ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {choice}.
                                </span>
                                <span className={choice === question.correct_choice ? 'font-medium text-green-600' : ''}>
                                  {text as string}
                                </span>
                                {choice === question.correct_choice && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Passage Info */}
                        {question.passages && (
                          <div className="space-y-1">
                            <h5 className="font-medium">Đoạn văn:</h5>
                            <p className="text-sm text-gray-600">
                              {question.passages.texts.title || 'Không có tiêu đề'} • 
                              {question.passages.passage_type} • 
                              {question.passages.texts.content.slice(0, 100)}...
                            </p>
                          </div>
                        )}

                        {/* Tags */}
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-500" />
                            <div className="flex flex-wrap gap-1">
                              {question.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Explanations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h6 className="font-medium text-gray-700">Giải thích (VI):</h6>
                            <p className="text-gray-600">{question.explain_vi}</p>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-700">Explanation (EN):</h6>
                            <p className="text-gray-600">{question.explain_en}</p>
                          </div>
                        </div>

                        {/* Audio Info */}
                        {(() => {
                          const audioUrl = getQuestionAudioUrl(question);
                          const audioDescription = getAudioSourceDescription(question);
                          return audioUrl ? (
                            <div className="space-y-1">
                              <h5 className="font-medium">Audio:</h5>
                              <div className="flex items-center gap-2">
                                <Headphones className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-600">{audioDescription}</span>
                                <audio controls className="h-8">
                                  <source src={audioUrl} type="audio/mpeg" />
                                  <source src={audioUrl} type="audio/wav" />
                                  <source src={audioUrl} type="audio/ogg" />
                                </audio>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <h5 className="font-medium">Audio:</h5>
                              <div className="flex items-center gap-2">
                                <Headphones className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500">{audioDescription}</span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(question.created_at).toLocaleDateString('vi-VN')}
                          </span>
                          {question.blank_index && (
                            <span>Chỗ trống: {question.blank_index}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit?.(question.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deleting}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteQuestion(question.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TOEICQuestionManager;
