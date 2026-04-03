import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';
import { Brain, BookOpen, Headphones } from 'lucide-react';

const Auth = () => {
  const { signIn, signUp, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: 'Đăng nhập thành công!',
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    const { error } = await signUp(email, password, name);
    
    if (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
      });
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-white/5 bg-grid-16"></div>
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TOEIC Master
            </h1>
          </div>
          <p className="text-muted-foreground">
            Hệ thống luyện thi TOEIC thông minh với AI
          </p>
        </div>

        <Card className="w-full animate-fade-in shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Chào mừng!</CardTitle>
            <CardDescription className="text-center">
              Đăng nhập hoặc tạo tài khoản để bắt đầu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('auth.sign_in')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.sign_up')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('auth.email')}</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t('auth.password')}</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        {t('common.loading')}
                      </div>
                    ) : (
                      t('auth.sign_in')
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Họ và tên</Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')}</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        {t('common.loading')}
                      </div>
                    ) : (
                      t('auth.sign_up')
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center animate-fade-in">
          <div className="space-y-2 group">
            <BookOpen className="h-8 w-8 text-primary mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-sm text-muted-foreground">Luyện tập ngắn 5-7 phút</p>
          </div>
          <div className="space-y-2 group">
            <Headphones className="h-8 w-8 text-accent mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-sm text-muted-foreground">Giải thích song ngữ</p>
          </div>
          <div className="space-y-2 group">
            <Brain className="h-8 w-8 text-info mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-sm text-muted-foreground">Spaced repetition thông minh</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;