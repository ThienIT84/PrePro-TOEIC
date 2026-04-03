import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, BookOpen, RotateCcw, BarChart3, ArrowRight, Target, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">TOEIC Master</span>
            </div>
            <Link to="/auth">
              <Button>
                Đăng nhập
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Brain className="h-4 w-4" />
              Công nghệ AI tiên tiến
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight animate-fade-in">
              Luyện thi TOEIC<br />thông minh
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Hệ thống luyện tập TOEIC với công nghệ spaced repetition, 
              giúp bạn cải thiện điểm số một cách hiệu quả nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto group hover:scale-105 transition-transform">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform">
                  Tìm hiểu thêm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Các công cụ học tập được thiết kế đặc biệt để tối ưu hóa quá trình chuẩn bị thi TOEIC
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Luyện tập hàng ngày</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ngân hàng câu hỏi TOEIC phong phú với các mức độ khó khác nhau
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <RotateCcw className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Spaced Repetition</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ôn tập thông minh dựa trên khoa học về trí nhớ, giúp ghi nhớ lâu dài
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 group-hover:bg-info/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-info" />
                </div>
                <CardTitle className="text-xl">Thống kê chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Theo dõi tiến độ học tập với các biểu đồ và báo cáo chi tiết
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                  <Target className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-xl">Mục tiêu cá nhân</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Thiết lập mục tiêu điểm số và theo dõi tiến độ đạt được
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-muted/30 via-accent/5 to-primary/5 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                1000+
              </div>
              <p className="text-muted-foreground">Câu hỏi luyện tập</p>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-success mb-2 group-hover:scale-110 transition-transform">
                95%
              </div>
              <p className="text-muted-foreground">Học viên cải thiện điểm số</p>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2 group-hover:scale-110 transition-transform">
                150+
              </div>
              <p className="text-muted-foreground">Điểm trung bình cải thiện</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sẵn sàng cải thiện điểm TOEIC?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Tham gia cùng hàng ngàn học viên đã thành công với phương pháp học thông minh
            </p>
            <Link to="/auth">
              <Button size="lg" className="group hover:scale-105 transition-transform">
                Bắt đầu miễn phí
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-semibold">TOEIC Master</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 TOEIC Master. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
