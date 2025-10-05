import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, GraduationCap, Shield, AlertCircle, Plus, Mail, UserPlus } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  email: string;
  role: 'student' | 'teacher';
  created_at: string;
}

const RoleManagement = () => {
  const { user, profile } = useAuth();
  const { permissions, isTeacher } = usePermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'teacher'
  });
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isTeacher() && !loading) {
      fetchUsers();
    }
  }, [profile?.role]); // Chỉ depend vào role

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          name,
          role,
          created_at,
          auth.users!inner(email)
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

      // Transform data to include email
      const transformedData = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        email: item.auth?.users?.email || 'N/A',
        role: item.role,
        created_at: item.created_at,
      }));

      setUsers(transformedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải dữ liệu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  const updateUserRole = async (userId: string, newRole: 'student' | 'teacher') => {
    try {
      setUpdating(userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating role:', error);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật quyền người dùng",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.user_id === userId 
            ? { ...user, role: newRole }
            : user
        )
      );

      toast({
        title: "Thành công",
        description: `Đã cập nhật quyền thành ${newRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      // Tạo user trong auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true, // Tự động confirm email
        user_metadata: {
          full_name: newUser.name,
        }
      });

      if (authError) {
        console.error('Error creating user:', authError);
        toast({
          title: "Lỗi",
          description: authError.message || "Không thể tạo tài khoản",
          variant: "destructive",
        });
        return;
      }

      // Tạo profile với role được chọn
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          name: newUser.name,
          role: newUser.role,
          target_score: newUser.role === 'student' ? 700 : 900,
          locales: 'vi',
          focus: newUser.role === 'student' ? ['grammar', 'vocabulary'] : ['grammar', 'vocabulary', 'listening', 'reading']
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        toast({
          title: "Lỗi",
          description: "Không thể tạo hồ sơ người dùng",
          variant: "destructive",
        });
        return;
      }

      // Refresh danh sách users
      await fetchUsers();

      // Reset form
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'student'
      });
      setIsCreateDialogOpen(false);

      toast({
        title: "Thành công",
        description: `Đã tạo tài khoản ${newUser.role === 'teacher' ? 'Giáo viên' : 'Học sinh'} thành công`,
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo tài khoản",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

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
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Tạo tài khoản
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
              <DialogDescription>
                Tạo tài khoản học sinh hoặc giáo viên mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="student@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mật khẩu tạm thời"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: 'student' | 'teacher') => 
                    setNewUser(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Học sinh</SelectItem>
                    <SelectItem value="teacher">Giáo viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Hủy
                </Button>
                <Button
                  onClick={createUser}
                  disabled={creating}
                  className="flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Tạo tài khoản
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                  
                  <Select
                    value={userProfile.role}
                    onValueChange={(value: 'student' | 'teacher') => 
                      updateUserRole(userProfile.user_id, value)
                    }
                    disabled={updating === userProfile.user_id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Học sinh</SelectItem>
                      <SelectItem value="teacher">Giáo viên</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {updating === userProfile.user_id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  )}
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

export default RoleManagement;
