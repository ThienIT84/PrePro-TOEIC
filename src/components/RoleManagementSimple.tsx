import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, GraduationCap, Shield, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  email: string;
  role: 'student' | 'teacher';
  created_at: string;
}

const RoleManagementSimple = () => {
  const { user, profile } = useAuth();
  const { permissions, isTeacher } = usePermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Đơn giản hóa useEffect
  useEffect(() => {
    let mounted = true;
    
    const loadUsers = async () => {
      if (!isTeacher()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            user_id,
            name,
            role,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          toast({
            title: "Lỗi",
            description: "Không thể tải danh sách người dùng",
            variant: "destructive",
          });
          return;
        }

        if (mounted) {
          // Transform data - tạm thời không có email
          const transformedData = data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            name: item.name,
            email: 'N/A', // Tạm thời không có email
            role: item.role,
            created_at: item.created_at,
          }));

          setUsers(transformedData);
        }
      } catch (error) {
        console.error('Error:', error);
        if (mounted) {
          toast({
            title: "Lỗi",
            description: "Có lỗi xảy ra khi tải dữ liệu",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [profile?.role]); // Chỉ depend vào role

  if (!isTeacher()) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bạn không có quyền truy cập trang này. Chỉ có giáo viên mới có thể quản lý quyền người dùng.
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

  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const studentCount = users.filter(u => u.role === 'student').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý quyền người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý quyền truy cập của học sinh và giáo viên
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giáo viên</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{teacherCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học sinh</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{studentCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Quản lý quyền truy cập của từng người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userProfile) => (
              <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {userProfile.name?.charAt(0) || userProfile.email.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{userProfile.name || 'Chưa có tên'}</p>
                    <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Tham gia: {new Date(userProfile.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={userProfile.role === 'teacher' ? 'default' : 'secondary'}
                    className={userProfile.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                  >
                    {userProfile.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có người dùng nào
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagementSimple;
