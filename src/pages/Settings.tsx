import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { t, getLanguage, setLanguage } from '@/lib/i18n';
import { Settings as SettingsIcon, User, Target, Globe, BookOpen, Bell, Shield, Palette } from 'lucide-react';

const Settings = () => {
  const { user, profile, updateProfile } = useAuth();
  const { permissions, isTeacher, getUserRole } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    target_score: profile?.target_score || 700,
    test_date: profile?.test_date || '',
    focus: profile?.focus || ['grammar', 'vocabulary'],
    locales: profile?.locales || 'vi',
    role: profile?.role || 'student',
    notifications: (profile as any)?.notifications || true,
    theme: (profile as any)?.theme || 'light',
    privacy: (profile as any)?.privacy || 'public',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        target_score: profile.target_score || 700,
        test_date: profile.test_date || '',
        focus: profile.focus || ['grammar', 'vocabulary'],
        locales: profile.locales || 'vi',
        role: profile.role || 'student',
        notifications: (profile as any)?.notifications || true,
        theme: (profile as any)?.theme || 'light',
        privacy: (profile as any)?.privacy || 'public',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        toast({
          title: 'Lỗi',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Cài đặt đã được cập nhật.',
        });
        
        // Update language if changed
        if (formData.locales !== getLanguage()) {
          setLanguage(formData.locales as 'vi' | 'en');
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi cập nhật cài đặt.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocusChange = (topic: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      focus: checked 
        ? [...prev.focus, topic]
        : prev.focus.filter(f => f !== topic)
    }));
  };

  const focusOptions = [
    { id: 'listening', label: 'Listening (Nghe hiểu)' },
    { id: 'reading', label: 'Reading (Đọc hiểu)' },
    { id: 'grammar', label: 'Grammar (Ngữ pháp)' },
    { id: 'vocabulary', label: 'Vocabulary (Từ vựng)' },
    { id: 'pronunciation', label: 'Pronunciation (Phát âm)' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Cài đặt</h1>
        </div>
        <p className="text-muted-foreground">
          Tùy chỉnh trải nghiệm học tập của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Thông tin cá nhân</CardTitle>
            </div>
            <CardDescription>
              Cập nhật thông tin hồ sơ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (chỉ đọc)</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <div className="flex items-center space-x-2">
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as 'student' | 'teacher' })}
                  disabled={!isTeacher()} // Chỉ teacher mới có thể thay đổi role
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Học sinh</SelectItem>
                    <SelectItem value="teacher">Giáo viên</SelectItem>
                  </SelectContent>
                </Select>
                {!isTeacher() && (
                  <span className="text-xs text-muted-foreground">
                    Chỉ giáo viên mới có thể thay đổi vai trò
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Mục tiêu học tập</CardTitle>
            </div>
            <CardDescription>
              Thiết lập mục tiêu và ngày thi TOEIC
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target_score">Điểm mục tiêu</Label>
              <Select
                value={formData.target_score.toString()}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  target_score: parseInt(value) 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500 điểm</SelectItem>
                  <SelectItem value="600">600 điểm</SelectItem>
                  <SelectItem value="700">700 điểm</SelectItem>
                  <SelectItem value="800">800 điểm</SelectItem>
                  <SelectItem value="900">900 điểm</SelectItem>
                  <SelectItem value="990">990 điểm (Perfect)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test_date">Ngày thi dự kiến (không bắt buộc)</Label>
              <Input
                id="test_date"
                type="date"
                value={formData.test_date}
                onChange={(e) => setFormData(prev => ({ ...prev, test_date: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Focus Areas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>Lĩnh vực tập trung</CardTitle>
            </div>
            <CardDescription>
              Chọn các kỹ năng bạn muốn tập trung luyện tập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {focusOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={formData.focus.includes(option.id)}
                    onCheckedChange={(checked) => 
                      handleFocusChange(option.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={option.id} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Ngôn ngữ</CardTitle>
            </div>
            <CardDescription>
              Chọn ngôn ngữ hiển thị giao diện
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language">Ngôn ngữ giao diện</Label>
              <Select
                value={formData.locales}
                onValueChange={(value) => setFormData(prev => ({ ...prev, locales: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Giao diện</CardTitle>
            </div>
            <CardDescription>
              Tùy chỉnh giao diện và chủ đề
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="theme">Chủ đề</Label>
              <Select
                value={formData.theme}
                onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Sáng</SelectItem>
                  <SelectItem value="dark">Tối</SelectItem>
                  <SelectItem value="system">Theo hệ thống</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Thông báo</CardTitle>
            </div>
            <CardDescription>
              Quản lý thông báo và cảnh báo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifications"
                  checked={formData.notifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, notifications: checked as boolean }))
                  }
                />
                <Label htmlFor="notifications" className="text-sm font-normal">
                  Nhận thông báo về tiến độ học tập
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Quyền riêng tư</CardTitle>
            </div>
            <CardDescription>
              Kiểm soát quyền riêng tư và chia sẻ dữ liệu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="privacy">Mức độ chia sẻ</Label>
              <Select
                value={formData.privacy}
                onValueChange={(value) => setFormData(prev => ({ ...prev, privacy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Công khai</SelectItem>
                  <SelectItem value="friends">Bạn bè</SelectItem>
                  <SelectItem value="private">Riêng tư</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.privacy === 'public' && 'Mọi người có thể xem tiến độ của bạn'}
                {formData.privacy === 'friends' && 'Chỉ bạn bè có thể xem tiến độ của bạn'}
                {formData.privacy === 'private' && 'Chỉ bạn có thể xem tiến độ của bạn'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Info Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt thông tin</CardTitle>
            <CardDescription>
              Xem lại các cài đặt hiện tại của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Thông tin cơ bản</Label>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>Tên:</strong> {formData.name || 'Chưa cập nhật'}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Vai trò:</strong> 
                    <Badge variant={formData.role === 'teacher' ? 'default' : 'secondary'} className="ml-2">
                      {formData.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                    </Badge>
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mục tiêu học tập</Label>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>Điểm mục tiêu:</strong> {formData.target_score} điểm</p>
                  <p><strong>Ngày thi:</strong> {formData.test_date || 'Chưa đặt'}</p>
                  <p><strong>Lĩnh vực tập trung:</strong></p>
                  <div className="flex flex-wrap gap-1">
                    {formData.focus.map((focus) => (
                      <Badge key={focus} variant="outline" className="text-xs">
                        {focusOptions.find(opt => opt.id === focus)?.label || focus}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Đang lưu...
              </div>
            ) : (
              'Lưu cài đặt'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;