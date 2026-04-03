import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TOEICQuestionCreator from '@/components/TOEICQuestionCreator';
import TOEICQuestionManager from '@/components/TOEICQuestionManager';
// Removed debug component: TestConnection
import TOEICBulkUpload from '@/components/TOEICBulkUpload';
import EditQuestion from '@/components/EditQuestion';
import PassageManager from '@/components/PassageManager';
// Removed debug component: AudioTestDemo
import type { Question } from '@/types';
import { BookOpen, Trash2, Edit, Target, Search, Filter, FileText, CheckSquare, Square, Trash } from 'lucide-react';

const QuestionManagement = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('toeic');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    difficulty: 'all',
    hasAudio: 'all',
    excludeSample: false
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      console.log('Fetching questions...');
      
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Fetched questions:', data?.length || 0, 'items');
      console.log('Questions data:', data);
      
      setQuestions((data || []) as Question[]);
      
      if (!data || data.length === 0) {
        console.log('No questions found - this might be due to RLS policies');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách câu hỏi';
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    // Show confirmation dialog
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state immediately
      setQuestions(prev => prev.filter(q => q.id !== id));
      
      // Remove from selected questions if it was selected
      setSelectedQuestions(prev => prev.filter(qId => qId !== id));

      toast({
        title: 'Thành công',
        description: 'Câu hỏi đã được xóa',
      });

      // Refresh data to ensure consistency
      fetchQuestions();
    } catch (error: unknown) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể xóa câu hỏi',
        variant: 'destructive',
      });
    }
  };

  const deleteSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) return;
    
    const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedQuestions.length} câu hỏi đã chọn?`;
    if (!confirm(confirmMessage)) return;

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
    } catch (error: unknown) {
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

  const toggleSelectAll = () => {
    const filteredQuestions = getFilteredQuestions();
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };

  const toggleSelectQuestion = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    } else {
      setSelectedQuestions(prev => [...prev, questionId]);
    }
  };

  const deleteSampleQuestions = async () => {
    try {
      const sampleKeywords = [
        'sample question',
        'sample',
        'test question',
        'example question',
        'demo question',
        'placeholder',
        'lorem ipsum',
        'this is a test',
        'question for part',
        'sample for part'
      ];

      const { data: sampleQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('id, prompt_text')
        .or(sampleKeywords.map(keyword => `prompt_text.ilike.%${keyword}%`).join(','));

      if (fetchError) throw fetchError;

      if (!sampleQuestions || sampleQuestions.length === 0) {
        toast({
          title: "Không tìm thấy câu hỏi sample",
          description: "Không có câu hỏi nào chứa từ khóa sample.",
        });
        return;
      }

      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .in('id', sampleQuestions.map(q => q.id));

      if (deleteError) throw deleteError;

      toast({
        title: "Thành công",
        description: `Đã xóa ${sampleQuestions.length} câu hỏi sample`,
      });

      fetchQuestions();
    } catch (error: unknown) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
        variant: "destructive",
      });
    }
  };

  const findSampleQuestions = async () => {
    try {
      const sampleKeywords = [
        'sample question',
        'sample',
        'test question',
        'example question',
        'demo question',
        'placeholder',
        'lorem ipsum',
        'this is a test',
        'question for part',
        'sample for part'
      ];

      const { data: sampleQuestions, error } = await supabase
        .from('questions')
        .select('id, prompt_text, part, difficulty')
        .or(sampleKeywords.map(keyword => `prompt_text.ilike.%${keyword}%`).join(','));

      if (error) throw error;

      if (!sampleQuestions || sampleQuestions.length === 0) {
        toast({
          title: "Không tìm thấy câu hỏi sample",
          description: "Không có câu hỏi nào chứa từ khóa sample.",
        });
        return;
      }

      setSelectedQuestions(sampleQuestions.map(q => q.id));

      toast({
        title: "Tìm thấy câu hỏi sample",
        description: `Tìm thấy ${sampleQuestions.length} câu hỏi sample. Đã chọn để xóa.`,
      });

    } catch (error: unknown) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
        variant: "destructive",
      });
    }
  };


  const getFilteredQuestions = () => {
    return questions.filter(question => {
      const matchesSearch = filters.search === '' || 
        question.prompt_text?.toLowerCase().includes(filters.search.toLowerCase()) ||
        question.explain_vi?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesType = filters.type === 'all' || question.part.toString() === filters.type;
      const matchesDifficulty = filters.difficulty === 'all' || question.difficulty === filters.difficulty;
      
      const matchesAudio = filters.hasAudio === 'all' || 
        (filters.hasAudio === 'yes' && question.audio_url) ||
        (filters.hasAudio === 'no' && !question.audio_url);
      
      const isNotSample = !filters.excludeSample || 
        !question.prompt_text?.toLowerCase().includes('sample') &&
        !question.prompt_text?.toLowerCase().includes('test') &&
        !question.prompt_text?.toLowerCase().includes('example');

      return matchesSearch && matchesType && matchesDifficulty && matchesAudio && isNotSample;
    });
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(qId => qId !== id)
        : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedQuestions([]);
  };

  // Reset selection when filters change
  useEffect(() => {
    setSelectedQuestions([]);
  }, [filters]);

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
  };

  const handleSaveQuestion = (updatedQuestion: Question) => {
    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
    setEditingQuestion(null);
    toast({
      title: 'Thành công',
      description: 'Câu hỏi đã được cập nhật',
    });
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  const filteredQuestions = questions.filter(question => {
    if (filters.search && !question.prompt_text.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type !== 'all' && question.part.toString() !== filters.type) {
      return false;
    }
    if (filters.difficulty !== 'all' && question.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.hasAudio === 'yes' && !question.audio_url) {
      return false;
    }
    if (filters.hasAudio === 'no' && question.audio_url) {
      return false;
    }
    
    // Exclude sample questions if filter is enabled
    if (filters.excludeSample) {
      const sampleKeywords = [
        'sample question',
        'sample',
        'test question',
        'example question',
        'demo question',
        'placeholder',
        'lorem ipsum',
        'this is a test',
        'question for part',
        'sample for part'
      ];
      
      const isSampleQuestion = sampleKeywords.some(keyword => 
        question.prompt_text?.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isSampleQuestion) {
        return false;
      }
    }
    
    return true;
  });

  const addSampleQuestions = async () => {
    setLoading(true);
    try {
      // Test connection first
      console.log('Testing Supabase connection for sample questions...');
      const { data: testData, error: testError } = await supabase
        .from('questions')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error(`Kết nối database thất bại: ${testError.message}`);
      }

      console.log('Supabase connection successful, adding sample questions...');

      const sampleQuestions = [
        {
          part: 5,
          difficulty: 'easy',
          prompt_text: 'What does "abundant" mean?',
          choices: ['Very little', 'Plentiful', 'Empty', 'Difficult'],
          correct_choice: 'B',
          explain_vi: '"Abundant" có nghĩa là dồi dào, phong phú, có nhiều.',
          explain_en: '"Abundant" means existing in large quantities; plentiful.',
          tags: ['vocabulary', 'basic'],
        },
        {
          part: 5,
          difficulty: 'medium',
          prompt_text: 'Choose the correct sentence:',
          choices: [
            'She have been working here for 5 years.',
            'She has been working here for 5 years.',
            'She is been working here for 5 years.',
            'She was been working here for 5 years.'
          ],
          correct_choice: 'B',
          explain_vi: 'Câu B đúng vì sử dụng thì hiện tại hoàn thành tiếp diễn với chủ ngữ số ít "she" cần động từ "has".',
          explain_en: 'Option B is correct because it uses the present perfect continuous tense correctly with the singular subject "she" requiring "has".',
          tags: ['grammar', 'present-perfect'],
        },
        {
          part: 2,
          difficulty: 'medium',
          prompt_text: 'Listen to the conversation and answer: What time is the meeting?',
          choices: ['9:00 AM', '10:30 AM', '2:00 PM', '3:15 PM'],
          correct_choice: 'B',
          explain_vi: 'Trong đoạn hội thoại, người nói đề cập đến cuộc họp lúc 10:30 sáng.',
          explain_en: 'In the conversation, the speaker mentions the meeting is at 10:30 AM.',
          transcript: 'A: What time is the board meeting tomorrow? B: It\'s scheduled for 10:30 AM in the conference room.',
          tags: ['listening', 'time'],
        },
        {
          part: 7,
          difficulty: 'hard',
          prompt_text: 'According to the passage, what is the main cause of climate change?',
          choices: [
            'Natural weather patterns',
            'Human activities and greenhouse gases',
            'Solar radiation changes',
            'Ocean currents'
          ],
          correct_choice: 'B',
          explain_vi: 'Theo đoạn văn, nguyên nhân chính của biến đổi khí hậu là các hoạt động của con người và khí nhà kính.',
          explain_en: 'According to the passage, the main cause of climate change is human activities and greenhouse gas emissions.',
          tags: ['reading', 'environment', 'science'],
        },
        {
          part: 5,
          difficulty: 'hard',
          prompt_text: 'What is the meaning of "ubiquitous"?',
          choices: ['Rare', 'Present everywhere', 'Expensive', 'Temporary'],
          correct_choice: 'B',
          explain_vi: '"Ubiquitous" có nghĩa là có mặt ở khắp nơi, phổ biến.',
          explain_en: '"Ubiquitous" means present, appearing, or found everywhere.',
          tags: ['vocabulary', 'advanced'],
        }
      ];

      console.log('Inserting sample questions:', sampleQuestions);

      const { data, error } = await supabase
        .from('questions')
        .insert(sampleQuestions)
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw new Error(`Lỗi thêm câu hỏi mẫu: ${error.message}`);
      }

      console.log('Sample questions added successfully:', data);

      toast({
        title: 'Thành công',
        description: `Đã thêm ${sampleQuestions.length} câu hỏi mẫu`,
      });

      fetchQuestions();
    } catch (error) {
      console.error('Error adding sample questions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể thêm câu hỏi mẫu';
      
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
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quản lý câu hỏi</h1>
        <p className="text-muted-foreground">
          Thêm và quản lý câu hỏi cho bài thi TOEIC
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="toeic" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Tạo TOEIC
          </TabsTrigger>
          <TabsTrigger value="toeic-manage" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Quản lý TOEIC
          </TabsTrigger>
          <TabsTrigger value="passages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Đoạn văn
          </TabsTrigger>
          <TabsTrigger value="legacy" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            TOEIC Parts
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Quản lý ({questions.length})
          </TabsTrigger>
          
        </TabsList>

        <TabsContent value="toeic" className="mt-6">
          <TOEICQuestionCreator onSuccess={() => {
            fetchQuestions();
            setActiveTab('toeic-manage');
          }} />
        </TabsContent>

        <TabsContent value="toeic-manage" className="mt-6">
          <TOEICQuestionManager onEdit={(questionId) => {
            // TODO: Implement edit functionality
            console.log('Edit question:', questionId);
          }} />
        </TabsContent>

        <TabsContent value="passages" className="mt-6">
          <PassageManager />
        </TabsContent>


        <TabsContent value="legacy" className="mt-6">
          <TOEICBulkUpload
            onQuestionsImported={() => {
              fetchQuestions();
              setActiveTab('manage');
            }}
          />
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          {/* Filters */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm câu hỏi..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>

                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="TOEIC Part" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="1">Part 1 - Photos</SelectItem>
                    <SelectItem value="2">Part 2 - Question-Response</SelectItem>
                    <SelectItem value="3">Part 3 - Conversations</SelectItem>
                    <SelectItem value="4">Part 4 - Talks</SelectItem>
                    <SelectItem value="5">Part 5 - Incomplete Sentences</SelectItem>
                    <SelectItem value="6">Part 6 - Text Completion</SelectItem>
                    <SelectItem value="7">Part 7 - Reading Comprehension</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.hasAudio} onValueChange={(value) => setFilters(prev => ({ ...prev, hasAudio: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Audio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="yes">Có Audio</SelectItem>
                    <SelectItem value="no">Không Audio</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="exclude-sample" 
                    checked={filters.excludeSample}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, excludeSample: !!checked }))}
                  />
                  <label 
                    htmlFor="exclude-sample" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Loại bỏ câu hỏi mẫu
                  </label>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    search: '',
                    type: 'all',
                    difficulty: 'all',
                    hasAudio: 'all',
                    excludeSample: false
                  })}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2"
                  >
                    {selectedQuestions.length === getFilteredQuestions().length && getFilteredQuestions().length > 0 ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    {selectedQuestions.length === getFilteredQuestions().length && getFilteredQuestions().length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Button>
                  
                  {selectedQuestions.length > 0 && (
                    <span className="text-sm text-gray-600">
                      Đã chọn {selectedQuestions.length} câu hỏi
                    </span>
                  )}
                </div>
                
                {selectedQuestions.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Bỏ chọn
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={findSampleQuestions}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Tìm câu hỏi mẫu
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteSampleQuestions}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa tất cả câu hỏi mẫu
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteSelectedQuestions}
                      disabled={deleting}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      {deleting ? 'Đang xóa...' : `Xóa ${selectedQuestions.length} câu hỏi`}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách câu hỏi ({filteredQuestions.length})</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={fetchQuestions} 
                    variant="outline" 
                    disabled={loading}
                  >
                    Làm mới
                  </Button>
                  <Button 
                    onClick={addSampleQuestions} 
                    variant="secondary"
                    disabled={loading}
                  >
                    Thêm câu hỏi mẫu
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Đang tải...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {questions.length === 0 ? 'Chưa có câu hỏi nào' : 'Không tìm thấy câu hỏi phù hợp'}
                  </p>
                  {questions.length === 0 && (
                    <Button onClick={addSampleQuestions} variant="outline">
                      Thêm câu hỏi mẫu
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((question) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => toggleQuestionSelection(question.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                question.difficulty === 'easy' ? 'secondary' : 
                                question.difficulty === 'medium' ? 'default' : 'destructive'
                              }>
                                {question.difficulty === 'easy' ? 'Dễ' : 
                                 question.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                              </Badge>
                              <Badge variant="outline">Part {question.part}</Badge>
                              {question.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {question.part === 1 ? (
                              <div className="mb-2">
                                <p className="font-medium text-blue-600">Part 1: Photos</p>
                                <p className="text-sm text-muted-foreground">Nhìn ảnh và chọn mô tả đúng - Không có câu hỏi text</p>
                              </div>
                            ) : question.part === 2 ? (
                              <div className="mb-2">
                                <p className="font-medium text-green-600">Part 2: Question-Response</p>
                                <p className="text-sm text-muted-foreground">Nghe câu hỏi và chọn câu trả lời phù hợp - Chỉ có A, B, C</p>
                              </div>
                            ) : (
                              <p className="font-medium mb-2">{question.prompt_text}</p>
                            )}
                            <div className="text-sm text-muted-foreground">
                              <p><strong>Đáp án:</strong> {question.correct_choice}</p>
                              <p><strong>Giải thích:</strong> {question.explain_vi}</p>
                              {question.image_url && (
                                <div className="mt-2">
                                  <p><strong>Hình ảnh:</strong></p>
                                  <img 
                                    src={question.image_url} 
                                    alt="Question image" 
                                    className="mt-1 max-w-48 h-auto rounded border object-contain"
                                    style={{ maxHeight: '200px' }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="hidden text-xs text-red-500 mt-1">
                                    Không thể tải ảnh
                                  </div>
                                </div>
                              )}
                              {question.audio_url && (
                                <p><strong>Audio:</strong> Có</p>
                              )}
                              {question.transcript && (
                                <p><strong>Transcript:</strong> {question.transcript}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        
      </Tabs>

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <EditQuestion
          question={editingQuestion}
          isOpen={!!editingQuestion}
          onClose={handleCancelEdit}
          onSave={handleSaveQuestion}
        />
      )}
    </div>
  );
};

export default QuestionManagement;
