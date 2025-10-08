import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Settings,
  Filter,
  Search,
  Eye,
  EyeOff,
  Clock,
  TrendingDown,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Mail,
  MessageSquare,
  Zap,
  Shield,
  Activity,
  RefreshCw
} from 'lucide-react';
import { AlertItem } from '@/services/teacherAnalytics';
import { alertsService, AlertRule } from '@/services/alertsService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AlertSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  alertFrequency: 'immediate' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const AdvancedAlertsSystem = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [settings, setSettings] = useState<AlertSettings>({
    emailNotifications: true,
    inAppNotifications: true,
    alertFrequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    type: 'all' as 'all' | 'warning' | 'success' | 'info' | 'danger',
    status: 'all' as 'all' | 'read' | 'unread'
  });

  useEffect(() => {
    if (user) {
      fetchAlerts();
      fetchAlertRules();
      createDefaultRulesIfNeeded();
    }
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const alertsData = await alertsService.getAlerts(user.id);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách cảnh báo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertRules = async () => {
    if (!user) return;
    
    try {
      const rulesData = await alertsService.getAlertRules(user.id);
      setAlertRules(rulesData);
    } catch (error) {
      console.error('Error fetching alert rules:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách quy tắc cảnh báo.',
        variant: 'destructive'
      });
    }
  };

  const createDefaultRulesIfNeeded = async () => {
    if (!user) return;
    
    try {
      await alertsService.createDefaultRules(user.id);
      // Refresh rules after creating defaults
      await fetchAlertRules();
    } catch (error) {
      console.error('Error creating default rules:', error);
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchAlerts(),
      fetchAlertRules()
    ]);
  };

  const markAsRead = async (alertId: string) => {
    try {
      const success = await alertsService.markAsRead(alertId);
      if (success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ));
        
        toast({
          title: 'Thành công',
          description: 'Đã đánh dấu cảnh báo là đã đọc.'
        });
      } else {
        throw new Error('Failed to mark as read');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái cảnh báo.',
        variant: 'destructive'
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const success = await alertsService.markAllAsRead(user.id);
      if (success) {
        setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
        
        toast({
          title: 'Thành công',
          description: 'Đã đánh dấu tất cả cảnh báo là đã đọc.'
        });
      } else {
        throw new Error('Failed to mark all as read');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái cảnh báo.',
        variant: 'destructive'
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const success = await alertsService.deleteAlert(alertId);
      if (success) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        
        toast({
          title: 'Thành công',
          description: 'Đã xóa cảnh báo.'
        });
      } else {
        throw new Error('Failed to delete alert');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa cảnh báo.',
        variant: 'destructive'
      });
    }
  };

  const toggleRule = async (ruleId: string) => {
    try {
      const rule = alertRules.find(r => r.id === ruleId);
      if (!rule) return;

      const success = await alertsService.toggleRule(ruleId, !rule.is_enabled);
      if (success) {
        setAlertRules(prev => prev.map(r => 
          r.id === ruleId ? { ...r, is_enabled: !r.is_enabled } : r
        ));
        
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật quy tắc cảnh báo.'
        });
      } else {
        throw new Error('Failed to toggle rule');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật quy tắc cảnh báo.',
        variant: 'destructive'
      });
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'danger': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'danger': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getRuleIcon = (condition: string) => {
    switch (condition) {
      case 'inactive_days': return <Clock className="h-4 w-4" />;
      case 'score_below': return <TrendingDown className="h-4 w-4" />;
      case 'score_above': return <TrendingUp className="h-4 w-4" />;
      case 'new_student': return <Users className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter.type !== 'all' && alert.type !== filter.type) return false;
    if (filter.status !== 'all') {
      if (filter.status === 'read' && !alert.is_read) return false;
      if (filter.status === 'unread' && alert.is_read) return false;
    }
    return true;
  });

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BellRing className="h-6 w-6 text-primary" />
            Hệ thống cảnh báo thông minh
          </h2>
          <p className="text-muted-foreground">
            Quản lý và cấu hình các cảnh báo tự động
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadCount} chưa đọc
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Đánh dấu tất cả
          </Button>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">
            Cảnh báo ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="rules">
            Quy tắc ({alertRules.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            Cài đặt
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select
                value={filter.type}
                onValueChange={(value) => setFilter(prev => ({ ...prev, type: value as unknown }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="warning">Cảnh báo</SelectItem>
                  <SelectItem value="danger">Nguy hiểm</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="info">Thông tin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={filter.status}
                onValueChange={(value) => setFilter(prev => ({ ...prev, status: value as unknown }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="unread">Chưa đọc</SelectItem>
                  <SelectItem value="read">Đã đọc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <Alert key={alert.id} className={`${getAlertColor(alert.type)} ${!alert.is_read ? 'ring-2 ring-primary/20' : ''}`}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        {!alert.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            Mới
                          </Badge>
                        )}
                      </div>
                      <AlertDescription>{alert.message}</AlertDescription>
                      {alert.student_name && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Học viên: {alert.student_name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex gap-1">
                        {!alert.is_read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2" />
                <p>Không có cảnh báo nào</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quy tắc cảnh báo
              </CardTitle>
              <CardDescription>
                Cấu hình các quy tắc tự động tạo cảnh báo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : alertRules.length > 0 ? (
                <div className="space-y-4">
                  {alertRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getRuleIcon(rule.condition)}
                      </div>
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={rule.type === 'warning' ? 'secondary' : 
                                         rule.type === 'danger' ? 'destructive' :
                                         rule.type === 'success' ? 'default' : 'outline'}>
                            {rule.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Threshold: {rule.threshold}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{rule.notification_type}</div>
                        <div>{rule.is_enabled ? 'Bật' : 'Tắt'}</div>
                      </div>
                      <Switch
                        checked={rule.is_enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-8 w-8 mx-auto mb-2" />
                  <p>Không có quy tắc nào</p>
                  <p className="text-sm">Hệ thống sẽ tự động tạo quy tắc mặc định</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cài đặt thông báo
              </CardTitle>
              <CardDescription>
                Cấu hình cách bạn nhận thông báo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="font-medium">Loại thông báo</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <Label htmlFor="in-app">Thông báo trong ứng dụng</Label>
                    </div>
                    <Switch
                      id="in-app"
                      checked={settings.inAppNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, inAppNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="email">Thông báo qua email</Label>
                    </div>
                    <Switch
                      id="email"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Alert Frequency */}
              <div className="space-y-4">
                <h4 className="font-medium">Tần suất cảnh báo</h4>
                <Select
                  value={settings.alertFrequency}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, alertFrequency: value as unknown }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Ngay lập tức</SelectItem>
                    <SelectItem value="hourly">Hàng giờ</SelectItem>
                    <SelectItem value="daily">Hàng ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Giờ yên tĩnh</h4>
                    <p className="text-sm text-muted-foreground">
                      Không nhận thông báo trong khoảng thời gian này
                    </p>
                  </div>
                  <Switch
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        quietHours: { ...prev.quietHours, enabled: checked }
                      }))
                    }
                  />
                </div>
                
                {settings.quietHours.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="quiet-start">Bắt đầu</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, start: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="quiet-end">Kết thúc</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, end: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Lưu cài đặt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAlertsSystem;
