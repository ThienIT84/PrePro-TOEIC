import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { ExamSet, ExamQuestion, Question } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelUpload from './ExcelUpload';
import EditQuestion from './EditQuestion';
import QuestionDetailModal from './QuestionDetailModal';

const ExamQuestionManagement = () => {
  const { examSetId } = useParams<{ examSetId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isExcelDialogOpen, setIsExcelDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (examSetId) {
      fetchExamSet();
      fetchExamQuestions();
      fetchAllQuestions();
    }
  }, [examSetId]);

  const fetchExamSet = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('id', examSetId)
        .single();

      if (error) throw error;
      setExamSet(data);
    } catch (error) {
      console.error('Error fetching exam set:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin bộ đề",
        variant: "destructive",
      });
    }
  };

  const fetchExamQuestions = async () => {
    try {
      console.log('Fetching exam questions for exam set:', examSetId);
      const { data, error } = await supabase
        .from('exam_questions')
        .select(`
          *,
          question:items(*)
        `)
        .eq('exam_set_id', examSetId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      console.log('Fetched exam questions:', data);
      setExamQuestions(data || []);
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải câu hỏi trong bộ đề",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllQuestions(data || []);
    } catch (error) {
      console.error('Error fetching all questions:', error);
    }
  };

  const updateExamSetQuestionCount = async (newCount: number) => {
    try {
      const { error } = await supabase
        .from('exam_sets')
        .update({ question_count: newCount })
        .eq('id', examSetId);

      if (error) throw error;
      console.log(`Updated exam set question_count to ${newCount}`);
    } catch (error) {
      console.error('Error updating question count:', error);
    }
  };

  const addQuestionToExam = async (questionId: string) => {
    try {
      const maxOrder = Math.max(...examQuestions.map(q => q.order_index), -1);
      
      const { error } = await supabase
        .from('exam_questions')
        .insert([{
          exam_set_id: examSetId,
          question_id: questionId,
          order_index: maxOrder + 1
        }]);

      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã thêm câu hỏi vào bộ đề",
      });
      
      fetchExamQuestions();
      fetchExamSet(); // Update question count
      
      // Update question count in database
      await updateExamSetQuestionCount(examQuestions.length + 1);
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm câu hỏi",
        variant: "destructive",
      });
    }
  };

  const removeQuestionFromExam = async (examQuestionId: string) => {
    try {
      const { error } = await supabase
        .from('exam_questions')
        .delete()
        .eq('id', examQuestionId);

      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã xóa câu hỏi khỏi bộ đề",
      });
      
      fetchExamQuestions();
      fetchExamSet(); // Update question count
      
      // Update question count in database
      await updateExamSetQuestionCount(examQuestions.length - 1);
    } catch (error) {
      console.error('Error removing question:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi",
        variant: "destructive",
      });
    }
  };

  const updateQuestionOrder = async (questionId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('exam_questions')
        .update({ order_index: newOrder })
        .eq('id', questionId);

      if (error) throw error;
      
      fetchExamQuestions();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const filteredQuestions = allQuestions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || question.type === selectedType;
    const notInExam = !examQuestions.some(eq => eq.question_id === question.id);
    
    return matchesSearch && matchesType && notInExam;
  });

  const getTypeLabel = (type: string) => {
    const labels = {
      vocab: 'Từ vựng',
      grammar: 'Ngữ pháp',
      listening: 'Nghe hiểu',
      reading: 'Đọc hiểu',
      mix: 'Tổng hợp'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: 'Dễ',
      medium: 'Trung bình',
      hard: 'Khó'
    };
    return labels[difficulty as keyof typeof labels] || difficulty;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!examSet) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy bộ đề</h2>
        <Button onClick={() => navigate('/exam-sets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/exam-sets')}
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
                // Show first question as preview
                setViewingQuestion(examQuestions[0].question!);
              } else {
                toast({
                  title: "Thông báo",
                  description: "Chưa có câu hỏi nào để xem trước",
                  variant: "destructive",
                });
              }
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          {examSet.question_count !== examQuestions.length && (
            <Button 
              variant="outline"
              onClick={async () => {
                await updateExamSetQuestionCount(examQuestions.length);
                fetchExamSet();
                toast({
                  title: "Thành công",
                  description: `Đã đồng bộ số câu hỏi: ${examQuestions.length}`,
                });
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync ({examQuestions.length})
            </Button>
          )}
          <Button onClick={() => navigate(`/exam-sets/${examSetId}/take`)}>
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
              {examSet.question_count !== examQuestions.length && (
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
            {examSet.question_count !== examQuestions.length && (
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
                <Button onClick={() => setIsAddDialogOpen(true)}>
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
                              A. {examQuestion.question.choices[0]}
                              {examQuestion.question.choices.length > 1 && ` ... (+${examQuestion.question.choices.length - 1} lựa chọn khác)`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setViewingQuestion(examQuestion.question!)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingQuestion(examQuestion.question!)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeQuestionFromExam(examQuestion.id)}
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
              <div className="flex space-x-4">
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="vocab">Từ vựng</option>
                  <option value="grammar">Ngữ pháp</option>
                  <option value="listening">Nghe hiểu</option>
                  <option value="reading">Đọc hiểu</option>
                </select>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{question.question}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(question.type)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getDifficultyLabel(question.difficulty)}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => addQuestionToExam(question.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Excel Upload */}
        <TabsContent value="excel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                Upload Excel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExcelUpload 
                examSetId={examSetId!}
                onSuccess={() => {
                  fetchExamQuestions();
                  fetchExamSet();
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <EditQuestion
          question={editingQuestion}
          isOpen={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={(updatedQuestion) => {
            // Update the question in the list
            setExamQuestions(prev => 
              prev.map(eq => 
                eq.question_id === updatedQuestion.id 
                  ? { ...eq, question: updatedQuestion }
                  : eq
              )
            );
            setEditingQuestion(null);
          }}
        />
      )}

      {/* Question Detail Modal */}
      <QuestionDetailModal
        question={viewingQuestion}
        isOpen={!!viewingQuestion}
        onClose={() => setViewingQuestion(null)}
        onEdit={(question) => {
          setViewingQuestion(null);
          setEditingQuestion(question);
        }}
      />
    </div>
  );
};

export default ExamQuestionManagement;
