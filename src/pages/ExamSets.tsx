import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Play, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Target,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Award,
  Zap,
  Brain,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import WizardExamSetCreator from '@/components/WizardExamSetCreator';
import { useNavigate } from 'react-router-dom';

interface ExamSet {
  id: string;
  title: string;
  description: string | null;
  type: 'vocab' | 'grammar' | 'listening' | 'reading' | 'mix';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  question_count: number;
  time_limit: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  allow_multiple_attempts?: boolean;
  max_attempts?: number;
}

// Helper to extract exam format from description metadata
const getExamFormat = (examSet: ExamSet): 'full' | 'mini' | 'custom' => {
  const match = examSet.description?.match(/\[exam_format:(full|mini|custom)\]/);
  if (match) {
    return match[1] as 'full' | 'mini' | 'custom';
  }
  // Fallback to inferring from question count
  if (examSet.question_count >= 200) return 'full';
  if (examSet.question_count >= 50 && examSet.question_count < 200) return 'mini';
  return 'custom';
};

// Helper to get clean description without metadata
const getCleanDescription = (description: string | null): string => {
  if (!description) return '';
  return description.replace(/\[exam_format:(full|mini|custom)\]/, '').trim();
};

// Helper to get/set status in description metadata
const getStatusFromDescription = (description: string | null): 'active' | 'draft' | 'inactive' => {
  const match = description?.match(/\[status:(active|draft|inactive)\]/);
  if (match) return match[1] as any;
  return 'active';
};

const setStatusInDescription = (description: string | null, status: 'active' | 'draft' | 'inactive'): string => {
  const base = description || '';
  if (base.match(/\[status:(active|draft|inactive)\]/)) {
    return base.replace(/\[status:(active|draft|inactive)\]/, `[status:${status}]`);
  }
  return `${base}\n[status:${status}]`;
};

const ExamSets = () => {
  const { user } = useAuth();
  const { permissions, getUserRole } = usePermissions();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage');
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<ExamSet | null>(null);

  useEffect(() => {
    fetchExamSets();
  }, []);

  const fetchExamSets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExamSets((data || []) as ExamSet[]);
    } catch (error) {
      console.error('Error fetching exam sets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch exam sets.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (examSet: ExamSet) => {
    setExamToDelete(examSet);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;

    try {
      const { error } = await supabase
        .from('exam_sets')
        .delete()
        .eq('id', examToDelete.id);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: `Đã xóa đề thi "${examToDelete.title}"`
      });

      fetchExamSets();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa đề thi. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialogOpen(false);
      setExamToDelete(null);
    }
  };

  const handleStartExam = (examSetId: string) => {
    // Always go to customize page first so students can choose parts
    navigate(`/exam-sets/${examSetId}/customize`);
  };

  const filteredExamSets = examSets.filter(examSet => {
    const matchesSearch = examSet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (examSet.description && examSet.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Enhanced type filtering using exam format and database type
    let matchesType = true;
    const format = getExamFormat(examSet);
    
    if (filterType === 'full') {
      matchesType = format === 'full';
    } else if (filterType === 'mini') {
      matchesType = format === 'mini';
    } else if (filterType === 'custom') {
      matchesType = format === 'custom';
    } else if (filterType === 'listening') {
      matchesType = examSet.type === 'listening';
    } else if (filterType === 'reading') {
      matchesType = examSet.type === 'reading';
    } else if (filterType === 'vocab') {
      matchesType = examSet.type === 'vocab';
    } else if (filterType === 'grammar') {
      matchesType = examSet.type === 'grammar';
    } else if (filterType === 'mix') {
      matchesType = examSet.type === 'mix';
    }
    // 'all' means no filter
    
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && examSet.is_active) ||
                         (filterActive === 'inactive' && !examSet.is_active);
    
    return matchesSearch && matchesType && matchesActive;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Target className="h-4 w-4" />;
      case 'mini': return <BookOpen className="h-4 w-4" />;
      case 'custom': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalExamSets = examSets.length;
  const activeExamSets = examSets.filter(es => es.is_active).length;
  const totalQuestions = examSets.reduce((sum, es) => sum + es.question_count, 0);
  
  // Calculate average time per question for better time estimation
  const totalTime = examSets.reduce((sum, es) => sum + es.time_limit, 0);
  const totalQuestionsForTime = examSets.reduce((sum, es) => sum + es.question_count, 0);
  const avgTimePerQuestion = totalQuestionsForTime > 0 ? totalTime / totalQuestionsForTime : 0;
  
  // Estimate time based on question count (more realistic for mini-tests)
  const estimatedTimeFor50Questions = Math.round(avgTimePerQuestion * 50);
  const avgTimeLimit = examSets.length > 0 ? Math.round(totalTime / examSets.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Exam Sets
              </h1>
              <p className="text-lg text-muted-foreground">
                Quản lý và thi các đề thi TOEIC chuyên nghiệp
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Exam Sets</p>
                    <p className="text-2xl font-bold">{totalExamSets}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active Sets</p>
                    <p className="text-2xl font-bold">{activeExamSets}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Questions</p>
                    <p className="text-2xl font-bold">{totalQuestions}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Avg. Duration</p>
                    <p className="text-2xl font-bold">{avgTimeLimit}m</p>
                    <p className="text-orange-200 text-xs mt-1">
                      ~{Math.round(avgTimePerQuestion * 60)}s/câu
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border">
            <TabsTrigger value="manage" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <BookOpen className="h-4 w-4" />
              Quản lý đề thi
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              <Plus className="h-4 w-4" />
              Tạo đề thi
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
              <Calendar className="h-4 w-4" />
              Lịch sử thi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="mt-6 space-y-6">
            {/* Enhanced Search and Filters */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm đề thi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 text-base border-2 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40 h-12 border-2 focus:border-blue-500">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value="full">Full TOEIC</SelectItem>
                        <SelectItem value="mini">Mini Test</SelectItem>
                        <SelectItem value="custom">Tùy chỉnh</SelectItem>
                        <SelectItem value="listening">Listening Only</SelectItem>
                        <SelectItem value="reading">Reading Only</SelectItem>
                        <SelectItem value="vocab">Vocabulary</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="mix">Mix</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterActive} onValueChange={setFilterActive}>
                      <SelectTrigger className="w-40 h-12 border-2 focus:border-blue-500">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="active">Đang hoạt động</SelectItem>
                        <SelectItem value="inactive">Tạm dừng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Exam Sets List */}
            {loading ? (
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-white shadow-lg border-0 animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                            <div className="flex-1">
                              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                              <div className="flex gap-2">
                                <div className="h-6 w-24 bg-gray-200 rounded" />
                                <div className="h-6 w-20 bg-gray-200 rounded" />
                              </div>
                            </div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                        <div className="flex gap-3 ml-6">
                          <div className="w-32 h-12 bg-gray-200 rounded" />
                          <div className="w-10 h-10 bg-gray-200 rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredExamSets.length === 0 ? (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="text-center py-12">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {examSets.length === 0 ? 'Chưa có đề thi nào' : 'Không tìm thấy đề thi phù hợp'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {examSets.length === 0 
                      ? 'Hãy tạo đề thi đầu tiên để bắt đầu quá trình học tập TOEIC'
                      : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                    }
                  </p>
                  <Button 
                    onClick={() => setActiveTab('create')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Tạo đề thi đầu tiên
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredExamSets.map((examSet) => (
                  <Card key={examSet.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                              {getTypeIcon(examSet.type)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{examSet.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${examSet.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'} px-3 py-1`}>
                                  {examSet.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`px-3 py-1 ${
                                    getExamFormat(examSet) === 'full'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                      : getExamFormat(examSet) === 'mini'
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : 'bg-purple-50 text-purple-700 border-purple-200'
                                  }`}
                                >
                                  {getExamFormat(examSet) === 'full'
                                    ? 'Full TOEIC' 
                                    : getExamFormat(examSet) === 'mini'
                                    ? 'Mini Test'
                                    : 'Custom'
                                  }
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-4 text-base leading-relaxed">{getCleanDescription(examSet.description)}</p>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-blue-600">
                              <Target className="h-5 w-5" />
                              <span className="font-semibold">{examSet.question_count} câu hỏi</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-600">
                              <Clock className="h-5 w-5" />
                              <span className="font-semibold">
                                {examSet.time_limit} phút
                                <span className="text-xs text-gray-500 ml-1">
                                  (~{Math.round(examSet.time_limit * 60 / examSet.question_count)}s/câu)
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-600">
                              <Users className="h-5 w-5" />
                              <span className="font-semibold capitalize">{examSet.difficulty}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 ml-6">
                          {examSet.is_active && (
                            <Button 
                              onClick={() => handleStartExam(examSet.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                              title="Bắt đầu làm bài thi"
                            >
                              <Play className="mr-2 h-5 w-5" />
                              Bắt đầu thi
                            </Button>
                          )}
                          <div className="flex gap-2">
                            {/* Status Dropdown - teacher only */}
                            {permissions?.canCreateExamSets && (
                              <Select
                                onValueChange={async (value) => {
                                  const newStatus = value as 'active' | 'draft' | 'inactive';
                                  // Block activating if incomplete
                                  if (newStatus === 'active' && examSet.question_count <= 0) {
                                    toast({
                                      title: 'Không thể kích hoạt',
                                      description: 'Đề thi chưa có câu hỏi. Vui lòng gán câu hỏi trước.',
                                      variant: 'destructive'
                                    });
                                    return;
                                  }
                                  try {
                                    const newDescription = setStatusInDescription(examSet.description, newStatus);
                                    const { error } = await supabase
                                      .from('exam_sets')
                                      .update({
                                        description: newDescription,
                                        is_active: newStatus === 'active'
                                      })
                                      .eq('id', examSet.id);
                                    if (error) throw error;
                                    toast({ title: 'Đã cập nhật trạng thái' });
                                    fetchExamSets();
                                  } catch (e) {
                                    toast({ title: 'Lỗi', description: 'Không thể cập nhật trạng thái', variant: 'destructive' });
                                  }
                                }}
                              >
                                <SelectTrigger className="h-10 w-40">
                                  <SelectValue placeholder={getStatusFromDescription(examSet.description)} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Kích hoạt</SelectItem>
                                  <SelectItem value="draft">Nháp</SelectItem>
                                  <SelectItem value="inactive">Tạm dừng</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/exam-selection/${examSet.id}`)}
                              className="h-10 w-10 border-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                              title="Xem chi tiết đề thi"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/exam-sets/${examSet.id}/questions`)}
                              className="h-10 w-10 border-2 hover:border-purple-500 hover:text-purple-500 transition-colors"
                              title="Quản lý câu hỏi"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteClick(examSet)}
                              className="h-10 w-10 border-2 hover:border-red-500 hover:text-red-500 transition-colors"
                              title="Xóa đề thi"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <WizardExamSetCreator 
              onExamCreated={() => {
                fetchExamSets();
                setActiveTab('manage');
              }}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Lịch sử thi</CardTitle>
                <CardDescription className="text-base">
                  Xem lại các bài thi đã làm và kết quả của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Chưa có lịch sử thi</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Hãy làm bài thi để xem kết quả và tiến độ học tập của bạn tại đây
                  </p>
                  <Button 
                    onClick={() => setActiveTab('manage')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Bắt đầu làm bài thi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Xác nhận xóa đề thi
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Bạn có chắc chắn muốn xóa đề thi này không?</p>
              {examToDelete && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                  <div className="font-semibold text-gray-900">{examToDelete.title}</div>
                  <div className="text-sm text-gray-600">{getCleanDescription(examToDelete.description)}</div>
                  <div className="flex gap-4 text-sm text-gray-500 pt-2 border-t border-gray-200">
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {examToDelete.question_count} câu hỏi
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {examToDelete.time_limit} phút
                    </span>
                  </div>
                </div>
              )}
              <p className="text-red-600 font-medium">
                ⚠️ Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Xóa đề thi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamSets;