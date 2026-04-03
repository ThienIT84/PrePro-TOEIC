import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Play, 
  Search,
  Clock,
  Target,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Trophy,
  Star,
  ArrowLeft,
  Eye,
  FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { TimeMode, TimeModeConfig } from '@/types';

interface ExamSet {
  id: string;
  title: string;
  description: string | null;
  type: 'full' | 'mini' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  question_count: number;
  time_limit: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const ExamSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { examSetId } = useParams<{ examSetId: string }>();
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [currentExamSet, setCurrentExamSet] = useState<ExamSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeMode, setTimeMode] = useState<TimeMode>('standard');

  const timeModeConfigs: TimeModeConfig[] = [
    {
      mode: 'standard',
      label: 'Chuẩn TOEIC',
      description: 'Thời gian giới hạn theo chuẩn TOEIC thực tế',
      icon: 'Timer'
    },
    {
      mode: 'unlimited',
      label: 'Tự do',
      description: 'Không giới hạn thời gian, phù hợp cho luyện tập',
      icon: 'Infinity'
    }
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  // Quick start custom practice state
  // Start modal in list view
  const [startOpen, setStartOpen] = useState(false);
  const [startExamSet, setStartExamSet] = useState<ExamSet | null>(null);
  const [startMode, setStartMode] = useState<'full' | 'custom'>('full');
  const [startParts, setStartParts] = useState<number[]>([]);

  useEffect(() => {
    if (examSetId) {
      fetchSingleExamSet();
    } else {
      fetchActiveExamSets();
    }
  }, [examSetId]);

  const fetchSingleExamSet = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('id', examSetId)
        .single();

      if (error) throw error;
      setCurrentExamSet(data as ExamSet);
    } catch (error) {
      console.error('Error fetching exam set:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch exam set details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveExamSets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('is_active', true)
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

  const handleStartExam = (examSetId: string) => {
    // Always navigate directly to exam when examSetId is provided
    navigate(`/exam-sets/${examSetId}/take`, { state: { timeMode } });
  };

  const confirmStart = () => {
    if (!startExamSet) return;
    if (startMode === 'custom') {
      if (startParts.length === 0) return;
      navigate(`/exam-sets/${startExamSet.id}/take`, { state: { parts: startParts, timeMode } });
    } else {
      navigate(`/exam-sets/${startExamSet.id}/take`, { state: { timeMode } });
    }
    setStartOpen(false);
  };

  const toggleStartPart = (p: number) => {
    setStartParts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };


  const filteredExamSets = examSets.filter(examSet => {
    const matchesSearch = examSet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         examSet.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || examSet.type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || examSet.difficulty === filterDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Target className="h-5 w-5" />;
      case 'mini': return <BookOpen className="h-5 w-5" />;
      case 'custom': return <Star className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'bg-blue-100 text-blue-800';
      case 'mini': return 'bg-green-100 text-green-800';
      case 'custom': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'mixed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full': return 'Full TOEIC';
      case 'mini': return 'Mini TOEIC';
      case 'custom': return 'Tùy chỉnh';
      default: return type;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      case 'mixed': return 'Hỗn hợp';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If examSetId is provided, show single exam set detail
  if (examSetId && currentExamSet) {
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
              <h1 className="text-3xl font-bold">{currentExamSet.title}</h1>
              <p className="text-muted-foreground">{currentExamSet.description}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => navigate(`/exam-sets/${examSetId}/questions`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Quản lý câu hỏi
            </Button>
            <Button onClick={() => handleStartExam(examSetId)}>
              <Play className="h-4 w-4 mr-2" />
              Làm bài Full
            </Button>
          </div>
        </div>

        {/* Time Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Chế độ thời gian
            </CardTitle>
            <CardDescription>
              Chọn cách thức tính thời gian cho bài thi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeModeConfigs.map((config) => {
                const IconComponent = config.icon === 'Timer' ? Clock : Target;
                return (
                  <div 
                    key={config.mode} 
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      timeMode === config.mode 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:bg-muted/50'
                    }`}
                    onClick={() => setTimeMode(config.mode)}
                  >
                    <div className={`p-2 rounded-lg ${
                      timeMode === config.mode 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{config.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      timeMode === config.mode 
                        ? 'border-primary bg-primary' 
                        : 'border-muted'
                    }`} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Exam Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin đề thi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loại đề:</span>
                <Badge className={getTypeColor(currentExamSet.type)}>
                  {getTypeIcon(currentExamSet.type)}
                  <span className="ml-1">{getTypeLabel(currentExamSet.type)}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Độ khó:</span>
                <Badge className={getDifficultyColor(currentExamSet.difficulty)}>
                  {getDifficultyLabel(currentExamSet.difficulty)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Số câu:</span>
                <span className="font-medium">{currentExamSet.question_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Thời gian:</span>
                <span className="font-medium">
                  {timeMode === 'unlimited' ? 'Không giới hạn' : `${currentExamSet.time_limit} phút`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <Badge className={currentExamSet.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {currentExamSet.is_active ? 'Hoạt động' : 'Tạm dừng'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Luyện tập trong đề này
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Chọn Part muốn luyện trong đề này (tùy chọn)</p>
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {[1,2,3,4,5,6,7].map(p => (
                    <label key={p} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={startParts.includes(p)} onCheckedChange={() => toggleStartPart(p)} />
                      <span>Part {p}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setStartParts([1,2,3,4,5,6,7])}
                  >
                    Chọn tất cả
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setStartParts([])}
                  >
                    Bỏ chọn
                  </Button>
                  <Button onClick={() => {
                    navigate(`/exam-sets/${examSetId}/take`, { state: { parts: startParts, timeMode } });
                  }}
                  >
                    <Play className="h-4 w-4 mr-2" /> Bắt đầu các Part đã chọn
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Nếu không chọn Part nào, hệ thống sẽ chạy Full 200 câu mặc định.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Thống kê
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentExamSet.question_count}</div>
                  <div className="text-sm text-muted-foreground">Tổng số câu hỏi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {timeMode === 'unlimited' ? '∞' : currentExamSet.time_limit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {timeMode === 'unlimited' ? 'Thời gian tự do' : 'Phút làm bài'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button 
            size="lg"
            onClick={() => handleStartExam(examSetId)}
            className="px-8"
          >
            <Play className="h-5 w-5 mr-2" />
            Bắt đầu làm bài
          </Button>
          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate(`/exam-sets/${examSetId}/questions`)}
            className="px-8"
          >
            <Eye className="h-5 w-5 mr-2" />
            Xem chi tiết câu hỏi
          </Button>
        </div>
      </div>
    );
  }

  // If no examSetId, show the original exam selection list
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Chọn đề thi</h1>
        <p className="text-muted-foreground">
          Chọn đề thi TOEIC để bắt đầu làm bài
        </p>
      </div>


      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm đề thi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="full">Full TOEIC</SelectItem>
                <SelectItem value="mini">Mini TOEIC</SelectItem>
                <SelectItem value="custom">Tùy chỉnh</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả độ khó</SelectItem>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
                <SelectItem value="mixed">Hỗn hợp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exam Sets List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải đề thi...</p>
        </div>
      ) : filteredExamSets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {examSets.length === 0 ? 'Chưa có đề thi nào' : 'Không tìm thấy đề thi phù hợp'}
            </p>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Chỉ hiển thị các đề thi có trạng thái "Active". Liên hệ giáo viên để được kích hoạt đề thi.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredExamSets.map((examSet) => (
            <Card key={examSet.id} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getTypeIcon(examSet.type)}
                      <h3 className="text-xl font-semibold">{examSet.title}</h3>
                      <Badge className={getTypeColor(examSet.type)}>
                        {examSet.type === 'full' ? 'Full TOEIC' : 
                         examSet.type === 'mini' ? 'Mini TOEIC' : 'Tùy chỉnh'}
                      </Badge>
                      <Badge className={getDifficultyColor(examSet.difficulty)}>
                        {examSet.difficulty === 'easy' ? 'Dễ' :
                         examSet.difficulty === 'medium' ? 'Trung bình' :
                         examSet.difficulty === 'hard' ? 'Khó' : 'Hỗn hợp'}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 text-lg">{examSet.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{examSet.question_count} câu hỏi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{examSet.time_limit} phút</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Đã tạo: {new Date(examSet.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <Button 
                      onClick={() => navigate(`/exam-sets/${examSet.id}/customize`, { state: { timeMode } })}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Bắt đầu thi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      {examSets.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Thống kê đề thi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{examSets.length}</div>
                <div className="text-sm text-muted-foreground">Tổng đề thi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {examSets.filter(e => e.type === 'full').length}
                </div>
                <div className="text-sm text-muted-foreground">Full TOEIC</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {examSets.filter(e => e.type === 'mini').length}
                </div>
                <div className="text-sm text-muted-foreground">Mini TOEIC</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {examSets.filter(e => e.type === 'custom').length}
                </div>
                <div className="text-sm text-muted-foreground">Tùy chỉnh</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Modal when launching from list */}
      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bắt đầu: {startExamSet?.title || 'Đề thi'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={startMode === 'full' ? 'default' : 'outline'} onClick={() => setStartMode('full')}>Full 200 câu</Button>
              <Button variant={startMode === 'custom' ? 'default' : 'outline'} onClick={() => setStartMode('custom')}>Tùy chọn Part</Button>
            </div>
            {startMode === 'custom' && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Chọn Part trong đề này</p>
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {[1,2,3,4,5,6,7].map(p => (
                    <label key={p} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={startParts.includes(p)} onCheckedChange={() => toggleStartPart(p)} />
                      <span>Part {p}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStartParts([1,2,3,4,5,6,7])}>Chọn tất cả</Button>
                  <Button variant="outline" onClick={() => setStartParts([])}>Bỏ chọn</Button>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStartOpen(false)}>Hủy</Button>
              <Button onClick={confirmStart} disabled={startMode === 'custom' && startParts.length === 0}>Bắt đầu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamSelection;