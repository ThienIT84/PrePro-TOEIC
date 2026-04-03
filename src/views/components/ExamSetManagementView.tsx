/**
 * ExamSetManagementView
 * Pure UI component cho Exam Set Management
 * Extracted từ ExamSetManagement.tsx
 */

import React from 'react';
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
// Define types locally since controller might not exist
export interface ExamSet {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  difficulty: string;
  status: string;
  total_questions: number;
  created_at: string;
  updated_at: string;
}

export interface ExamSetFormData {
  title: string;
  description: string;
  time_limit: number;
  difficulty: string;
  status: string;
}

export interface ExamSetManagementViewProps {
  // State
  examSets: ExamSet[];
  loading: boolean;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  editingExamSet: ExamSet | null;
  formData: ExamSetFormData;

  // Actions
  onSetCreateDialogOpen: (isOpen: boolean) => void;
  onSetEditDialogOpen: (isOpen: boolean) => void;
  onSetFormData: (formData: Partial<ExamSetFormData>) => void;
  onCreateExamSet: () => Promise<void>;
  onUpdateExamSet: () => Promise<void>;
  onDeleteExamSet: (examSetId: string) => Promise<void>;
  onOpenEditDialog: (examSet: ExamSet) => void;
  onCloseCreateDialog: () => void;
  onCloseEditDialog: () => void;

  // Utility functions
  getDifficultyColor: (difficulty: string) => string;
  getStatusColor: (status: string) => string;
  getDifficultyDisplayText: (difficulty: string) => string;
  getStatusDisplayText: (status: string) => string;

  // Props
  className?: string;
}

const ExamSetManagementView: React.FC<ExamSetManagementViewProps> = ({
  examSets,
  loading,
  isCreateDialogOpen,
  isEditDialogOpen,
  editingExamSet,
  formData,
  onSetCreateDialogOpen,
  onSetEditDialogOpen,
  onSetFormData,
  onCreateExamSet,
  onUpdateExamSet,
  onDeleteExamSet,
  onOpenEditDialog,
  onCloseCreateDialog,
  onCloseEditDialog,
  getDifficultyColor,
  getStatusColor,
  getDifficultyDisplayText,
  getStatusDisplayText,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`container mx-auto px-4 py-8 max-w-6xl ${className}`}>
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
    <div className={`container mx-auto px-4 py-8 max-w-6xl ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý đề thi</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các đề thi TOEIC
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={onSetCreateDialogOpen}>
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
                  onChange={(e) => onSetFormData({ title: e.target.value })}
                  placeholder="VD: Đề thi TOEIC tháng 1/2025"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => onSetFormData({ description: e.target.value })}
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
                  onChange={(e) => onSetFormData({ time_limit: parseInt(e.target.value) || 120 })}
                  min="30"
                  max="300"
                />
              </div>
              
              <div>
                <Label htmlFor="difficulty">Độ khó</Label>
                <Select value={formData.difficulty} onValueChange={(value: any) => onSetFormData({ difficulty: value })}>
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
                <Select value={formData.status} onValueChange={(value: any) => onSetFormData({ status: value })}>
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
              <Button variant="outline" onClick={onCloseCreateDialog}>
                Hủy
              </Button>
              <Button onClick={onCreateExamSet}>
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
                    onClick={() => onOpenEditDialog(examSet)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteExamSet(examSet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(examSet.difficulty)}>
                  {getDifficultyDisplayText(examSet.difficulty)}
                </Badge>
                <Badge className={getStatusColor(examSet.status)}>
                  {getStatusDisplayText(examSet.status)}
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
            <Button onClick={() => onSetCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo đề thi đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={onSetEditDialogOpen}>
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
                onChange={(e) => onSetFormData({ title: e.target.value })}
                placeholder="VD: Đề thi TOEIC tháng 1/2025"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => onSetFormData({ description: e.target.value })}
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
                onChange={(e) => onSetFormData({ time_limit: parseInt(e.target.value) || 120 })}
                min="30"
                max="300"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-difficulty">Độ khó</Label>
              <Select value={formData.difficulty} onValueChange={(value: any) => onSetFormData({ difficulty: value })}>
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
              <Select value={formData.status} onValueChange={(value: any) => onSetFormData({ status: value })}>
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
            <Button variant="outline" onClick={onCloseEditDialog}>
              Hủy
            </Button>
            <Button onClick={onUpdateExamSet}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamSetManagementView;
