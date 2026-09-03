import React from 'react';
import { Target, Compass, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const RoadmapSteps: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Kiểm tra Chẩn đoán Đầu vào',
      description: 'Làm bài kiểm tra năng lực nhanh để hệ thống phân tích chính xác trình độ khởi điểm và xác định các Part bạn cần cải thiện.',
      icon: Compass,
      badge: 'Đánh giá ban đầu'
    },
    {
      step: '02',
      title: 'AI Cá nhân hóa Lộ trình',
      description: 'Hệ thống tự động thiết kế bài tập luyện đề tập trung vào các chủ điểm ngữ pháp còn yếu và các câu bẫy thường gặp.',
      icon: Sparkles,
      badge: 'Luyện tập trọng tâm'
    },
    {
      step: '03',
      title: 'Khắc sâu bằng Spaced Repetition',
      description: 'Mọi câu làm sai đều được lưu trữ và nhắc ôn lại theo chu kỳ 1 - 3 - 7 ngày, đảm bảo bạn không bao giờ mắc lại lỗi cũ.',
      icon: Target,
      badge: 'Nhớ lâu không quên'
    },
    {
      step: '04',
      title: 'Thi thử 120 phút & Bứt phá 850+',
      description: 'Làm quen với áp lực thời gian trong phòng thi thật qua các bộ đề full test 200 câu với giao diện thi chuẩn quốc tế.',
      icon: Trophy,
      badge: 'Về đích tự tin'
    }
  ];

  return (
    <section id="roadmap" className="py-20 bg-background relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 bg-primary/10 text-primary border-primary/20 font-semibold">
            <Target className="h-3.5 w-3.5 mr-1.5" /> Lộ Trình Khoa Học
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            4 Bước Chinh Phục Điểm Số Mục Tiêu
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Phương pháp học có cấu trúc rõ ràng, dựa trên dữ liệu phân tích học tập thực tế giúp bạn tiết kiệm hàng trăm giờ tự bơi giữa biển tài liệu.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="group relative p-6 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Step Number Watermark */}
                <div className="absolute top-4 right-4 text-4xl font-black text-muted/40 group-hover:text-primary/10 transition-colors font-mono select-none">
                  {item.step}
                </div>

                <div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-5 transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>

                  <Badge variant="secondary" className="text-[11px] font-semibold mb-2 bg-muted text-muted-foreground">
                    {item.badge}
                  </Badge>

                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border/40 text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Bước {idx + 1}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to="/auth">
            <Button size="lg" className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-8">
              Bắt đầu bài kiểm tra chẩn đoán ngay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
