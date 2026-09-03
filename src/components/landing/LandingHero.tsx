import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InteractiveQuizCard } from './InteractiveQuizCard';

export const LandingHero: React.FC = () => {
  // Bộ từ khóa xoay vòng và chạy trượt từ TRÁI SANG PHẢI
  const dynamicPhrases = [
    { text: 'Chuẩn ETS 2026', color: 'from-blue-600 via-primary to-emerald-500' },
    { text: 'Bứt Phá 850+', color: 'from-emerald-500 via-teal-500 to-primary' },
    { text: 'Cùng Trợ Lý AI', color: 'from-indigo-500 via-primary to-emerald-500' },
    { text: 'Nhớ Sâu Với SM-2', color: 'from-emerald-600 via-emerald-500 to-primary' },
  ];

  const [activePhraseIndex, setActivePhraseIndex] = useState(0);

  // Đổi cụm từ mỗi 2.5 giây, kích hoạt animation trượt từ trái sang phải
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhraseIndex((prev) => (prev + 1) % dynamicPhrases.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [dynamicPhrases.length]);

  return (
    <section className="relative pt-10 pb-20 md:pt-16 md:pb-24 overflow-hidden bg-gradient-to-b from-background via-background/95 to-muted/20">
      {/* Background Cinematic LTR Moving Typography (Chạy chữ liên tục từ TRÁI SANG PHẢI) */}
      <div className="absolute top-4 left-0 right-0 overflow-hidden pointer-events-none opacity-[0.05] dark:opacity-[0.07] select-none -z-10">
        <div className="animate-marquee-ltr text-6xl sm:text-7xl font-black uppercase tracking-widest text-foreground whitespace-nowrap">
          PREPRO TOEIC • CHUẨN ETS 2026 • TRỢ LÝ AI LLAMA 3.1 • BỨT PHÁ 850+ • SPACED REPETITION SM-2 • PREPRO TOEIC • CHUẨN ETS 2026 • TRỢ LÝ AI LLAMA 3.1 • BỨT PHÁ 850+ • 
        </div>
      </div>

      {/* Ambient Vibrant Lighting Orbs - Đồng bộ màu Primary Blue & Emerald */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & Dynamic Sliding Headline */}
          <div className="lg:col-span-6 xl:col-span-6 text-center lg:text-left space-y-6 max-w-2xl mx-auto lg:mx-0">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>Thế hệ Luyện thi TOEIC 2.0 • Tích hợp Trợ lý AI</span>
            </div>

            {/* Main Headline: Chuyển động chữ chạy từ TRÁI SANG PHẢI */}
            <div className="space-y-1">
              {/* Dòng 1: Luyện thi TOEIC chuyển động trôi ngang êm ái */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                <span className="inline-block animate-drift-right bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
                  Luyện thi TOEIC
                </span>
                <br />
                {/* Dòng 2: Cụm từ trượt mạnh mẽ từ TRÁI sang PHẢI (Kinetic Slide-in) */}
                <span className="block h-[1.25em] overflow-hidden pt-1">
                  <span 
                    key={activePhraseIndex}
                    className={`inline-block animate-word-slide-right bg-gradient-to-r ${dynamicPhrases[activePhraseIndex].color} bg-clip-text text-transparent font-black drop-shadow-sm`}
                  >
                    {dynamicPhrases[activePhraseIndex].text}
                  </span>
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Nền tảng ứng dụng công nghệ <strong>Spaced Repetition (SM-2)</strong> và trí tuệ nhân tạo (AI), giúp ghi nhớ sâu từ vựng & cấu trúc ngữ pháp, loại bỏ bẫy câu hỏi và tối ưu hóa điểm số trong thời gian ngắn nhất.
            </p>

            {/* Key Value Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm text-foreground/80">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Trọn bộ 7 Part (Nghe & Đọc)</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Giải thích song ngữ Anh - Việt</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Nhắc ôn tập câu sai tự động</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Luyện tai 4 ngữ điệu bản xứ</span>
              </div>
            </div>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-3 justify-center lg:justify-start">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto font-semibold text-base px-7 h-12 bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
                >
                  Bắt đầu làm bài thi thử
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto font-medium text-base h-12 px-6 border-border hover:bg-muted/80 hover:border-primary/40 transition-colors"
                >
                  Khám phá vũ khí AI
                </Button>
              </a>
            </div>

            {/* Trust Micro-Metrics */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-background bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">890</span>
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-background bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">920</span>
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-background bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">850</span>
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-background bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">950</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Hơn 5,000+ người học</p>
                <p className="text-[11px]">Đã chinh phục mục tiêu TOEIC 750 - 900+</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Quiz Card with 3D Floating Badges */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center items-center relative py-6">
            {/* 3D Floating Badge 1 - Top Right */}
            <div className="hidden sm:flex absolute -top-1 right-2 lg:-right-4 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card/95 border border-primary/30 shadow-[0_12px_30px_rgba(59,130,246,0.25)] backdrop-blur-xl animate-float-slow ring-1 ring-primary/10">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-sm shadow-inner">
                🎯
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-foreground leading-tight">Target 850+ Đạt Được</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+150 điểm sau 14 ngày</p>
              </div>
            </div>

            {/* 3D Floating Badge 2 - Bottom Left */}
            <div className="hidden sm:flex absolute -bottom-2 left-2 lg:-left-4 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card/95 border border-emerald-500/30 shadow-[0_12px_30px_rgba(16,185,129,0.25)] backdrop-blur-xl animate-float-reverse ring-1 ring-emerald-500/10">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-sm shadow-inner">
                ⚡
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-foreground leading-tight">Trợ Lý AI Llama 3.1</p>
                <p className="text-[10px] text-primary font-semibold">Tự sinh đề thi trong 0.8s</p>
              </div>
            </div>

            {/* Core Interactive Card with 3D Tilt */}
            <InteractiveQuizCard />
          </div>
        </div>
      </div>
    </section>
  );
};
