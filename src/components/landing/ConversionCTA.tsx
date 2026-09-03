import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const ConversionCTA: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary via-blue-600 to-accent p-8 sm:p-14 md:p-16 text-white text-center shadow-2xl overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-md border border-white/20">
              <Sparkles className="h-3.5 w-3.5" /> Bắt đầu hành trình bứt phá điểm số
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Sẵn Sàng Đạt Mục Tiêu <br className="hidden sm:inline" />
              TOEIC 850+ Trong Kỳ Thi Tới?
            </h2>

            <p className="text-white/85 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Trải nghiệm phương pháp học tập kết hợp giữa <strong>Trí tuệ nhân tạo (AI)</strong> và <strong>Khoa học trí nhớ (Spaced Repetition)</strong> hoàn toàn miễn phí.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-3">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto font-bold text-base h-12 px-8 bg-white text-primary hover:bg-white/90 shadow-xl hover:scale-105 transition-transform"
                >
                  Tạo tài khoản miễn phí
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto font-semibold text-base h-12 px-7 border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  Làm bài thi thử ngay
                </Button>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-white/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-300" /> Không cần thẻ tín dụng
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-300" /> Kích hoạt tài khoản trong 30 giây
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-300" /> Đề thi cập nhật 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
