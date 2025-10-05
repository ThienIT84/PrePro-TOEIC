/**
 * ExamQuestionManagementView
 * Pure UI component cho Exam Question Management
 * Extracted từ ExamQuestionManagement.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  Upload, 
  Download,
  GripVertical,
  Eye,
  ArrowLeft,
  FileSpreadsheet,
  Volume2,
  RefreshCw
} from 'lucide-react';
import { ExamSet, ExamQuestion, Question } from '../controllers/exam/ExamQuestionManagementController';

export interface ExamQuestionManagementViewProps {
  // State
  examSet: ExamSet | null;
  examQuestions: ExamQuestion[];
  allQuestions: Question[];
  loading: boolean;
  isAddDialogOpen: boolean;
  isExcelDialogOpen: boolean;
  searchTerm: string;
  selectedType: string;
  editingQuestion: Question | null;
  viewingQuestion: Question | null;

  // Actions
  onSetAddDialogOpen: (isOpen: boolean) => void;
  onSetExcelDialogOpen: (isOpen: boolean) => void;
  onSetSearchTerm: (searchTerm: string) => void;
  onSetSelectedType: (selectedType: string) => void;
  onSetEditingQuestion: (question: Question | null) => void;
  onSetViewingQuestion: (question: Question | null) => void;
  onAddQuestionToExam: (questionId: string) => Promise<void>;
  onRemoveQuestionFromExam: (examQuestionId: string) => Promise<void>;
  onUpdateQuestionOrder: (examQuestionId: string, newOrder: number) => Promise<void>;
  onUpdateExamSetQuestionCount: (newCount: number) => Promise<void>;
  onNavigateBack: () => void;
  onNavigateToExam: () => void;

  // Utility functions
  getFilteredQuestions: () => Question[];
  getTypeLabel: (type: string) => string;
  getDifficultyLabel: (difficulty: string) => string;
  getQuestionPreview: (question: Question) => string;
  isQuestionCountSynced: () => boolean;
  getQuestionCountDifference: () => number;
  getExamSetStatistics: () => {
    totalQuestions: number;
    questionsByType: Record<string, number>;
    questionsByDifficulty: Record<string, number>;
    averageDifficulty: number;
    hasAudioQuestions: boolean;
  };

  // Props
  className?: string;
}

const ExamQuestionManagementView: React.FC<ExamQuestionManagementViewProps> = ({
  examSet,
  examQuestions,
  allQuestions,
  loading,
  isAddDialogOpen,
  isExcelDialogOpen,
  searchTerm,
  selectedType,
  editingQuestion,
  viewingQuestion,
  onSetAddDialogOpen,
  onSetExcelDialogOpen,
  onSetSearchTerm,
  onSetSelectedType,
  onSetEditingQuestion,
  onSetViewingQuestion,
  onAddQuestionToExam,
  onRemoveQuestionFromExam,
  onUpdateQuestionOrder,
  onUpdateExamSetQuestionCount,
  onNavigateBack,
  onNavigateToExam,
  getFilteredQuestions,
  getTypeLabel,
  getDifficultyLabel,
  getQuestionPreview,
  isQuestionCountSynced,
  getQuestionCountDifference,
  getExamSetStatistics,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!examSet) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy bộ đề</h2>
        <Button onClick={onNavigateBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const filteredQuestions = getFilteredQuestions();
  const statistics = getExamSetStatistics();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={onNavigateBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{examSet.title}</h1>
            <p className="text-muted-foreground">{examSet.description}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => {
              if (examQuestions.length > 0) {
                onSetViewingQuestion(examQuestions[0].question!);
              }
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          {!isQuestionCountSynced() && (
            <Button 
              variant="outline"
              onClick={() => onUpdateExamSetQuestionCount(examQuestions.length)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync ({examQuestions.length})
            </Button>
          )}
          <Button onClick={onNavigateToExam}>
            <Play className="h-4 w-4 mr-2" />
            Làm bài
          </Button>
        </div>
      </div>

      {/* Exam Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{examQuestions.length}</div>
              <div className="text-sm text-muted-foreground">Số câu hỏi</div>
              {!isQuestionCountSynced() && (
                <div className="text-xs text-orange-600 mt-1">
                  ⚠️ DB: {examSet.question_count}
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{examSet.time_limit}</div>
              <div className="text-sm text-muted-foreground">Phút</div>
            </div>
            <div className="text-center">
              <Badge variant="secondary">{getTypeLabel(examSet.type)}</Badge>
              <div className="text-sm text-muted-foreground mt-1">Loại đề</div>
            </div>
            <div className="text-center">
              <Badge variant="outline">{getDifficultyLabel(examSet.difficulty)}</Badge>
              <div className="text-sm text-muted-foreground mt-1">Độ khó</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions">
            Câu hỏi trong đề ({examQuestions.length})
            {!isQuestionCountSynced() && (
              <span className="ml-2 text-orange-600">⚠️</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="add">Thêm câu hỏi</TabsTrigger>
          <TabsTrigger value="excel">Upload Excel</TabsTrigger>
        </TabsList>

        {/* Questions in Exam */}
        <TabsContent value="questions" className="space-y-4">
          {examQuestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Chưa có câu hỏi nào</h3>
                <p className="text-muted-foreground mb-4">
                  Thêm câu hỏi để bắt đầu tạo bộ đề thi
                </p>
                <Button onClick={() => onSetAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm câu hỏi
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {examQuestions.map((examQuestion, index) => (
                <Card key={examQuestion.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {examQuestion.question?.question || 'Câu hỏi không có nội dung'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel(examQuestion.question?.type || '')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getDifficultyLabel(examQuestion.question?.difficulty || '')}
                            </Badge>
                            {examQuestion.question?.audio_url && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Audio
                              </Badge>
                            )}
                          </div>
                          {/* Show first choice as preview */}
                          {examQuestion.question?.choices && examQuestion.question.choices.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {getQuestionPreview(examQuestion.question)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onSetViewingQuestion(examQuestion.question!)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onSetEditingQuestion(examQuestion.question!)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onRemoveQuestionFromExam(examQuestion.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Add Questions */}
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thêm câu hỏi vào bộ đề</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => onSetSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={selectedType}
                  onChange={(e) => onSetSelectedType(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="vocab">Từ vựng</option>
                  <option value="grammar">Ngữ pháp</option>
                  <option value="listening">Nghe hiểu</option>
                  <option value="reading">Đọc hiểu</option>
                  <option value="mix">Tổng hợp</option>
                </select>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredQuestions.map((question) => (
                  <Card key={question.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(question.type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getDifficultyLabel(question.difficulty)}
                          </Badge>
                          {question.audio_url && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              <Volume2 className="h-3 w-3 mr-1" />
                              Audio
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddQuestionToExam(question.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Excel Upload */}
        <TabsContent value="excel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload câu hỏi từ Excel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Excel</h3>
                <p className="text-muted-foreground mb-4">
                  Upload file Excel để thêm nhiều câu hỏi cùng lúc
                </p>
                <Button onClick={() => onSetExcelDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Chọn file Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question Detail Modal */}
      {viewingQuestion && (
        <Dialog open={!!viewingQuestion} onOpenChange={() => onSetViewingQuestion(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết câu hỏi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Câu hỏi:</h4>
                <p className="text-sm">{viewingQuestion.question}</p>
              </div>
              {viewingQuestion.choices && (
                <div>
                  <h4 className="font-medium">Các lựa chọn:</h4>
                  <ul className="text-sm space-y-1">
                    {viewingQuestion.choices.map((choice, index) => (
                      <li key={index}>
                        {String.fromCharCode(65 + index)}. {choice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {viewingQuestion.correct_answer && (
                <div>
                  <h4 className="font-medium">Đáp án đúng:</h4>
                  <p className="text-sm">{viewingQuestion.correct_answer}</p>
                </div>
              )}
              {viewingQuestion.explanation && (
                <div>
                  <h4 className="font-medium">Giải thích:</h4>
                  <p className="text-sm">{viewingQuestion.explanation}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ExamQuestionManagementView;
