/**
 * QuestionManagerView
 * Pure UI component cho TOEIC Question Management
 * Nhận tất cả data và callbacks qua props
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
import { Question } from '@/controllers/question/QuestionManagerController';

export interface QuestionManagerViewProps {
  // State
  questions: Question[];
  loading: boolean;
  deleting: boolean;
  errors: string[];
  searchTerm: string;
  filterPart: string;
  filterDifficulty: string;
  filterStatus: string;
  selectedQuestions: string[];

  // Handlers
  onSearchTermChange: (searchTerm: string) => void;
  onFilterPartChange: (filterPart: string) => void;
  onFilterDifficultyChange: (filterDifficulty: string) => void;
  onFilterStatusChange: (filterStatus: string) => void;
  onRefresh: () => void;
  onDeleteQuestion: (questionId: string) => void;
  onDeleteSelectedQuestions: () => void;
  onSelectQuestion: (questionId: string, checked: boolean) => void;
  onSelectAllQuestions: (checked: boolean) => void;
  onEditQuestion: (questionId: string) => void;

  // Utility functions
  getFilteredQuestions: () => Question[];
  getQuestionById: (questionId: string) => Question | null;
  getPartInfo: (part: number) => unknown;
  getQuestionAudioUrl: (question: Question) => string | null;
  getAudioSourceDescription: (question: Question) => string;
  getStatistics: () => unknown;
  isQuestionSelected: (questionId: string) => boolean;
  areAllFilteredQuestionsSelected: () => boolean;
  getToeicPartInfo: () => unknown;
  getDifficultyColors: () => unknown;
  getStatusColors: () => unknown;

  // Props
  className?: string;
}

export const QuestionManagerView: React.FC<QuestionManagerViewProps> = ({
  questions,
  loading,
  deleting,
  errors,
  searchTerm,
  filterPart,
  filterDifficulty,
  filterStatus,
  selectedQuestions,
  onSearchTermChange,
  onFilterPartChange,
  onFilterDifficultyChange,
  onFilterStatusChange,
  onRefresh,
  onDeleteQuestion,
  onDeleteSelectedQuestions,
  onSelectQuestion,
  onSelectAllQuestions,
  onEditQuestion,
  getFilteredQuestions,
  getQuestionById,
  getPartInfo,
  getQuestionAudioUrl,
  getAudioSourceDescription,
  getStatistics,
  isQuestionSelected,
  areAllFilteredQuestionsSelected,
  getToeicPartInfo,
  getDifficultyColors,
  getStatusColors,
  className = '',
}) => {
  const filteredQuestions = getFilteredQuestions();
  const statistics = getStatistics();
  const toeicPartInfo = getToeicPartInfo();
  const difficultyColors = getDifficultyColors();
  const statusColors = getStatusColors();

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
    <div className={`space-y-6 ${className}`}>
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
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phần thi</label>
              <Select value={filterPart} onValueChange={onFilterPartChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(toeicPartInfo).map(([part, info]: [string, unknown]) => (
                    <SelectItem key={part} value={part}>
                      {info.icon} {info.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Độ khó</label>
              <Select value={filterDifficulty} onValueChange={onFilterDifficultyChange}>
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
              <Select value={filterStatus} onValueChange={onFilterStatusChange}>
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
                      onClick={onDeleteSelectedQuestions}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button onClick={onRefresh} variant="outline" size="sm">
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
                checked={areAllFilteredQuestionsSelected()}
                onCheckedChange={onSelectAllQuestions}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Chọn tất cả ({filteredQuestions.length} câu hỏi)
              </label>
            </div>

            {/* Questions List */}
            <div className="grid gap-4">
              {filteredQuestions.map((question) => {
                const partInfo = getPartInfo(question.part);
                const isSelected = isQuestionSelected(question.id);
                const audioUrl = getQuestionAudioUrl(question);
                const audioDescription = getAudioSourceDescription(question);
                
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
                            onCheckedChange={(checked) => onSelectQuestion(question.id, checked as boolean)}
                          />
                          
                          <div className="flex-1 space-y-3">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                              <Badge className={`${partInfo.color} font-medium`}>
                                {partInfo.icon} {partInfo.name}
                              </Badge>
                              <Badge className={difficultyColors[question.difficulty]}>
                                {question.difficulty}
                              </Badge>
                              <Badge className={statusColors[question.status]}>
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
                            <div className="space-y-1">
                              <h5 className="font-medium">Audio:</h5>
                              <div className="flex items-center gap-2">
                                <Headphones className={`h-4 w-4 ${audioUrl ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className={`text-sm ${audioUrl ? 'text-gray-600' : 'text-gray-500'}`}>
                                  {audioDescription}
                                </span>
                                {audioUrl && (
                                  <audio controls className="h-8">
                                    <source src={audioUrl} type="audio/mpeg" />
                                    <source src={audioUrl} type="audio/wav" />
                                    <source src={audioUrl} type="audio/ogg" />
                                  </audio>
                                )}
                              </div>
                            </div>

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
                              onClick={() => onEditQuestion(question.id)}
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
                                    onClick={() => onDeleteQuestion(question.id)}
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
