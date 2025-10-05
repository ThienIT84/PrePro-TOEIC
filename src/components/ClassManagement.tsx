import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  UserPlus,
  UserMinus,
  Eye,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ClassInfo {
  id: string;
  name: string;
  description: string;
  student_count: number;
  created_at: string;
  avg_score: number;
  completion_rate: number;
  students: Array<{
    id: string;
    name: string;
    email: string;
    avg_score: number;
    last_activity: string;
  }>;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avg_score: number;
  last_activity: string;
  is_in_class: boolean;
}

const ClassManagement = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchClasses();
      fetchStudents();
    }
  }, [user]);

  const fetchClasses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mock data - in real implementation, you'd fetch from classes table
      const mockClasses: ClassInfo[] = [
        {
          id: 'class_1',
          name: 'TOEIC Intermediate',
          description: 'Students targeting 600-700 points',
          student_count: 15,
          created_at: '2024-01-01',
          avg_score: 650,
          completion_rate: 85,
          students: []
        },
        {
          id: 'class_2',
          name: 'TOEIC Advanced',
          description: 'Students targeting 700+ points',
          student_count: 8,
          created_at: '2024-01-15',
          avg_score: 720,
          completion_rate: 92,
          students: []
        }
      ];

      setClasses(mockClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lớp học.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!user) return;

    try {
      // Get teacher's students
      const { data: teacherStudents } = await supabase.rpc('get_teacher_students', {
        teacher_uuid: user.id
      });

      if (teacherStudents) {
        const studentIds = teacherStudents.map(s => s.student_id);
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', studentIds);

        const { data: attempts } = await supabase
          .from('attempts')
          .select('user_id, correct, created_at')
          .in('user_id', studentIds);

        const studentsWithStats = profiles?.map(profile => {
          const studentAttempts = attempts?.filter(a => a.user_id === profile.user_id) || [];
          const avgScore = studentAttempts.length > 0 ?
            Math.round((studentAttempts.filter(a => a.correct).length / studentAttempts.length) * 100) : 0;
          
          const lastActivity = studentAttempts.length > 0 ?
            studentAttempts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at :
            profile.user_id; // Fallback

          return {
            id: profile.user_id,
            name: profile.name || 'Unknown',
            email: profile.email || '',
            avg_score: avgScore,
            last_activity: lastActivity,
            is_in_class: false // This would be determined by class membership
          };
        }) || [];

        setStudents(studentsWithStats);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const createClass = async () => {
    if (!newClass.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên lớp học.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // In real implementation, you'd create the class in database
      const newClassData: ClassInfo = {
        id: `class_${Date.now()}`,
        name: newClass.name,
        description: newClass.description,
        student_count: 0,
        created_at: new Date().toISOString(),
        avg_score: 0,
        completion_rate: 0,
        students: []
      };

      setClasses(prev => [...prev, newClassData]);
      setNewClass({ name: '', description: '' });
      setIsCreateDialogOpen(false);

      toast({
        title: 'Thành công',
        description: 'Đã tạo lớp học mới.'
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo lớp học.',
        variant: 'destructive'
      });
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      setClasses(prev => prev.filter(c => c.id !== classId));
      toast({
        title: 'Thành công',
        description: 'Đã xóa lớp học.'
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa lớp học.',
        variant: 'destructive'
      });
    }
  };

  const addStudentToClass = async (classId: string, studentId: string) => {
    try {
      // In real implementation, you'd update the database
      setClasses(prev => prev.map(c => {
        if (c.id === classId) {
          const student = students.find(s => s.id === studentId);
          if (student && !c.students.find(s => s.id === studentId)) {
            return {
              ...c,
              students: [...c.students, student],
              student_count: c.student_count + 1
            };
          }
        }
        return c;
      }));

      toast({
        title: 'Thành công',
        description: 'Đã thêm học viên vào lớp.'
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm học viên vào lớp.',
        variant: 'destructive'
      });
    }
  };

  const removeStudentFromClass = async (classId: string, studentId: string) => {
    try {
      setClasses(prev => prev.map(c => {
        if (c.id === classId) {
          return {
            ...c,
            students: c.students.filter(s => s.id !== studentId),
            student_count: c.student_count - 1
          };
        }
        return c;
      }));

      toast({
        title: 'Thành công',
        description: 'Đã xóa học viên khỏi lớp.'
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa học viên khỏi lớp.',
        variant: 'destructive'
      });
    }
  };

  const exportClassReport = (classInfo: ClassInfo) => {
    // In real implementation, you'd generate and download a report
    toast({
      title: 'Thành công',
      description: `Đã xuất báo cáo cho lớp ${classInfo.name}.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Quản lý lớp học
          </h2>
          <p className="text-muted-foreground">
            Tạo và quản lý các lớp học của bạn
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo lớp mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo lớp học mới</DialogTitle>
              <DialogDescription>
                Tạo một lớp học mới để quản lý học viên
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="class-name">Tên lớp học</Label>
                <Input
                  id="class-name"
                  value={newClass.name}
                  onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="VD: TOEIC Intermediate"
                />
              </div>
              <div>
                <Label htmlFor="class-description">Mô tả</Label>
                <Textarea
                  id="class-description"
                  value={newClass.description}
                  onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả về lớp học..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={createClass}>
                  Tạo lớp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classInfo) => (
          <Card key={classInfo.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{classInfo.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteClass(classInfo.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardDescription>{classInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Class Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">{classInfo.student_count}</div>
                  <div className="text-xs text-muted-foreground">Học viên</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{classInfo.avg_score}</div>
                  <div className="text-xs text-muted-foreground">Điểm TB</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{classInfo.completion_rate}%</div>
                  <div className="text-xs text-muted-foreground">Hoàn thành</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedClass(classInfo)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Xem chi tiết
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportClassReport(classInfo)}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Class Detail Modal */}
      {selectedClass && (
        <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedClass.name}
              </DialogTitle>
              <DialogDescription>
                {selectedClass.description}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="students" className="space-y-4">
              <TabsList>
                <TabsTrigger value="students">Học viên</TabsTrigger>
                <TabsTrigger value="analytics">Phân tích</TabsTrigger>
                <TabsTrigger value="assignments">Bài tập</TabsTrigger>
              </TabsList>

              {/* Students Tab */}
              <TabsContent value="students" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Danh sách học viên</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Thêm học viên
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm học viên vào lớp</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Chọn học viên</Label>
                          <Select onValueChange={(value) => addStudentToClass(selectedClass.id, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn học viên..." />
                            </SelectTrigger>
                            <SelectContent>
                              {students.filter(s => !selectedClass.students.find(cs => cs.id === s.id)).map(student => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name} ({student.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {selectedClass.students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          {student.avg_score}%
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeStudentFromClass(selectedClass.id, student.id)}
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {selectedClass.students.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>Chưa có học viên nào trong lớp này</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedClass.student_count}</div>
                        <div className="text-sm text-muted-foreground">Tổng học viên</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedClass.avg_score}</div>
                        <div className="text-sm text-muted-foreground">Điểm trung bình</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedClass.completion_rate}%</div>
                        <div className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">85%</div>
                        <div className="text-sm text-muted-foreground">Tỷ lệ tham gia</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Assignments Tab */}
              <TabsContent value="assignments" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>Tính năng giao bài tập sẽ được phát triển trong phiên bản tiếp theo</p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClassManagement;
