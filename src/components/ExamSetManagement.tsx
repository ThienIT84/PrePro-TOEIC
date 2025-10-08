import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Eye,
  Clock,
  FileText,
  Users,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ExamSet {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  time_limit: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'inactive';
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ExamSetFormData {
  title: string;
  description: string;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'inactive';
}

const ExamSetManagement = () => {
  const { user } = useAuth();
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExamSet, setEditingExamSet] = useState<ExamSet | null>(null);
  const [formData, setFormData] = useState<ExamSetFormData>({
    title: '',
    description: '',
    time_limit: 120,
    difficulty: 'medium',
    status: 'active'
  });

  useEffect(() => {
    fetchExamSets();
  }, []);

  const fetchExamSets = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExamSets(data || []);
    } catch (error) {
      console.error('Error fetching exam sets:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đề thi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExamSet = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .insert({
          title: formData.title,
          description: formData.description,
          total_questions: 200, // Default TOEIC full test
          time_limit: formData.time_limit,
          difficulty: formData.difficulty,
          status: formData.status,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đề thi đã được tạo thành công!'
      });

      setIsCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        time_limit: 120,
        difficulty: 'medium',
        status: 'active'
      });
      fetchExamSets();
    } catch (error) {
      console.error('Error creating exam set:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo đề thi',
        variant: 'destructive'
      });
    }
  };

  const handleEditExamSet = async () => {
    if (!editingExamSet) return;

    try {
      const { error } = await supabase
        .from('exam_sets')
        .update({
          title: formData.title,
          description: formData.description,
          time_limit: formData.time_limit,
          difficulty: formData.difficulty,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingExamSet.id);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đề thi đã được cập nhật!'
      });

      setIsEditDialogOpen(false);
      setEditingExamSet(null);
      fetchExamSets();
    } catch (error) {
      console.error('Error updating exam set:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật đề thi',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteExamSet = async (examSetId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này?')) return;

    try {
      const { error } = await supabase
        .from('exam_sets')
        .delete()
        .eq('id', examSetId);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đề thi đã được xóa!'
      });

      fetchExamSets();
    } catch (error) {
      console.error('Error deleting exam set:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa đề thi',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (examSet: ExamSet) => {
    setEditingExamSet(examSet);
    setFormData({
      title: examSet.title,
      description: examSet.description,
      time_limit: examSet.time_limit,
      difficulty: examSet.difficulty,
      status: examSet.status
    });
    setIsEditDialogOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý đề thi</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các đề thi TOEIC
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo đề thi mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo đề thi mới</DialogTitle>
              <DialogDescription>
                Tạo một đề thi TOEIC mới với các cấu hình tùy chỉnh
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Tên đề thi</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="VD: Đề thi TOEIC tháng 1/2025"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả về đề thi..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="time_limit">Thời gian (phút)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  value={formData.time_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 120 }))}
                  min="30"
                  max="300"
                />
              </div>
              
              <div>
                <Label htmlFor="difficulty">Độ khó</Label>
                <Select value={formData.difficulty} onValueChange={(value: unknown) => setFormData(prev => ({ ...prev, difficulty: value }))}>
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
              
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value: unknown) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateExamSet}>
                Tạo đề thi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exam Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examSets.map((examSet) => (
          <Card key={examSet.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{examSet.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {examSet.description}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(examSet)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExamSet(examSet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(examSet.difficulty)}>
                  {examSet.difficulty === 'easy' ? 'Dễ' : 
                   examSet.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                </Badge>
                <Badge className={getStatusColor(examSet.status)}>
                  {examSet.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{examSet.total_questions} câu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{examSet.time_limit} phút</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open(`/exam-selection/${examSet.id}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.location.href = `/exam-selection/${examSet.id}`}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Làm bài
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {examSets.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có đề thi nào</h3>
            <p className="text-muted-foreground mb-4">
              Tạo đề thi đầu tiên để bắt đầu sử dụng hệ thống
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo đề thi đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đề thi</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin đề thi
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Tên đề thi</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="VD: Đề thi TOEIC tháng 1/2025"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả về đề thi..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-time_limit">Thời gian (phút)</Label>
              <Input
                id="edit-time_limit"
                type="number"
                value={formData.time_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 120 }))}
                min="30"
                max="300"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-difficulty">Độ khó</Label>
              <Select value={formData.difficulty} onValueChange={(value: unknown) => setFormData(prev => ({ ...prev, difficulty: value }))}>
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
            
            <div>
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Select value={formData.status} onValueChange={(value: unknown) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditExamSet}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamSetManagement;