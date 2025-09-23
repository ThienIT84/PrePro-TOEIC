import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { t, getLanguage, setLanguage } from '@/lib/i18n';
import { Settings as SettingsIcon, User, Target, Globe, BookOpen } from 'lucide-react';

const Settings = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    target_score: profile?.target_score || 700,
    test_date: profile?.test_date || '',
    focus: profile?.focus || ['grammar', 'vocabulary'],
    locales: profile?.locales || 'vi'
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        target_score: profile.target_score || 700,
        test_date: profile.test_date || '',
        focus: profile.focus || ['grammar', 'vocabulary'],
        locales: profile.locales || 'vi'
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