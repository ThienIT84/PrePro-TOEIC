import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Users, GraduationCap, TrendingUp, Calendar, Mail, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';

interface Student {
  student_id: string;
  student_name: string;
  student_email: string;
  assigned_at: string;
  status: string;
  notes: string | null;
  total_attempts: number;
  accuracy_percentage: number;
}

const StudentManagement = () => {
  const { user, profile } = useAuth();
  const { permissions, isTeacher } = usePermissions();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isTeacher() && user) {
      fetchStudents();
    }
  }, [isTeacher(), user?.id]); // Chỉ depend vào user.id thay vì toàn bộ user object

  const fetchStudents = async () => {
    if (!user) {
      setError('Không có user đăng nhập');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra role trước khi gọi function
      if (!isTeacher()) {
        const errorMsg = `User không phải teacher. Role hiện tại: ${profile?.role}`;
        setError(errorMsg);
        setLoading(false);
        return;
      }
      
      // Gọi function để lấy danh sách học viên
      const { data, error } = await supabase.rpc('get_teacher_students', {
        teacher_uuid: user.id
      });

      if (error) {
        const errorMsg = `Lỗi function: ${error.message} (Code: ${error.code})`;
        setError(errorMsg);
        
        toast({
          title: "Lỗi",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      setStudents(data || []);
      
      if (!data || data.length === 0) {
        setError('Không có học viên nào được gán cho bạn.');
      }
      
    } catch (error: any) {
      const errorMsg = `Lỗi không mong đợi: ${error.message}`;
      setError(errorMsg);
      
      toast({
        title: "Lỗi",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const reassignStudent = async (studentId: string, newTeacherId: string) => {
    try {
      setReassigning(studentId);
      
      const { error } = await supabase.rpc('reassign_student', {
        student_uuid: studentId,
        new_teacher_uuid: newTeacherId
      });

      if (error) {
        console.error('Error reassigning student:', error);
        toast({
          title: "Lỗi",
          description: "Không thể chuyển học viên",
          variant: "destructive",
        });
        return;
      }

      // Refresh danh sách
      await fetchStudents();

      toast({
        title: "Thành công",
        description: "Đã chuyển học viên thành công",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi chuyển học viên",
        variant: "destructive",
      });
    } finally {
      setReassigning(null);
    }
  };

  const handleUnassignStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Bạn có chắc muốn bỏ gán học viên "${studentName || 'Chưa có tên'}"?\n\nHọc viên sẽ không còn được gán cho bạn nhưng tài khoản vẫn được giữ lại.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('teacher_students')
        .delete()
        .eq('teacher_id', user?.id)
        .eq('student_id', studentId);

      if (error) {
        toast({
          title: "Lỗi",
          description: `Không thể bỏ gán học viên: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      // Refresh danh sách
      await fetchStudents();

      toast({
        title: "Thành công",
        description: `Đã bỏ gán học viên "${studentName || 'Chưa có tên'}" thành công`,
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: `Có lỗi xảy ra: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (!isTeacher()) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <UserCheck className="h-4 w-4" />
          <AlertDescription>
            Bạn không có quyền truy cập trang này. Chỉ có giáo viên mới có thể quản lý học viên.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const activeStudents = students.filter(s => s.status === 'active');
  const totalAttempts = students.reduce((sum, s) => sum + s.total_attempts, 0);
  const averageAccuracy = students.length > 0 
    ? students.reduce((sum, s) => sum + s.accuracy_percentage, 0) / students.length 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý học viên</h1>
          <p className="text-muted-foreground">
            Danh sách học viên được gán cho bạn
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStudents} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Lỗi:</strong> {error}
            <div className="mt-2 flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchStudents}>
                Thử lại
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/debug/students">Mở Debug Tool</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeStudents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài làm</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttempts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Độ chính xác TB</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {averageAccuracy.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
          <CardDescription>
            Quản lý học viên được gán cho bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.student_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {student.student_name?.charAt(0) || student.student_email.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{student.student_name || 'Chưa có tên'}</p>
                    <p className="text-sm text-muted-foreground">{student.student_email}</p>
                    <p className="text-xs text-muted-foreground">
                      Gán từ: {new Date(student.assigned_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">{student.total_attempts}</p>
                    <p className="text-xs text-muted-foreground">Bài làm</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium">{student.accuracy_percentage.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Chính xác</p>
                  </div>
                  
                  <Badge 
                    variant={student.status === 'active' ? 'default' : 'secondary'}
                    className={student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  >
                    {student.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnassignStudent(student.student_id, student.student_name)}
                    className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Bỏ gán
                  </Button>
                </div>
              </div>
            ))}
            
            {students.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có học viên nào được gán cho bạn
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
