import React from 'react';
import { Sparkles, Brain, RotateCcw, Headphones, Star, CheckCircle, Trophy, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AuthShowcase: React.FC = () => {
  return (
    <div className="hidden lg:flex flex-col justify-between p-10 xl:p-12 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 border-l border-border/60">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Tagline */}
      <div className="space-y-3">
        <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Hệ Thống Luyện Thi TOEIC 2.0
        </Badge>
        <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-foreground leading-snug">
          Bứt Phá Mục Tiêu 850+ <br />
          <span className="bg-gradient-to-r from-primary via-blue-600 to-emerald-500 bg-clip-text text-transparent">
            Rút Ngắn 55% Thời Gian
          </span>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
          Được hỗ trợ bởi mô hình AI Llama 3.1 và thuật toán trí nhớ Spaced Repetition (SM-2), giúp bạn khắc phục hoàn toàn các điểm mù kiến thức.
        </p>
      </div>

      {/* Center 3D Showcase Card */}
      <div className="my-8 relative space-y-4">
        {/* Floating Target Badge */}
        <div className="p-5 rounded-2xl bg-card/90 border border-primary/30 shadow-[0_15px_35px_rgba(59,130,246,0.15)] backdrop-blur-xl ring-1 ring-primary/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Mục Tiêu Đạt 850+ TOEIC</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Đạt chuẩn tốt nghiệp & tuyển dụng</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              +150đ / 14 ngày
            </span>
          </div>

          <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
            <div className="h-full bg-primary w-[55%]" />
            <div className="h-full bg-emerald-500 w-[40%]" />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>Xuất phát: 450</span>
            <span className="text-foreground font-bold">Hiện tại: 780</span>
            <span className="text-emerald-600 font-bold">Đích: 850+</span>
          </div>
        </div>

        {/* Real Student Testimonial */}
        <div className="p-4 rounded-2xl bg-card/80 border border-border/80 shadow-md backdrop-blur-sm flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            HN
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground">Hoàng Nam</span>
              <span className="text-[10px] text-muted-foreground">• Đạt 920 TOEIC</span>
              <div className="flex text-amber-400 ml-auto">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground italic leading-relaxed text-[11px]">
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Features Bullet */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50 text-[11px] text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Thuật toán SM-2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>AI Llama 3.1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>4 Giọng bản xứ</span>
        </div>
      </div>
    </div>
  );
};
