import React from 'react';
import { Sparkles, Zap, Brain, Target, Headphones, Award, Flame } from 'lucide-react';

export const RunningAnnouncementTicker: React.FC = () => {
  const announcements = [
    { icon: <Flame className="h-3.5 w-3.5 text-amber-500" />, text: 'Đề thi New Economy & ETS 2026 đã cập nhật', highlight: 'HOT' },
    { icon: <Zap className="h-3.5 w-3.5 text-primary" />, text: 'Trợ lý AI Llama 3.1 sinh câu hỏi & giải thích trong 0.8s', highlight: 'SIÊU TỐC' },
    { icon: <Brain className="h-3.5 w-3.5 text-emerald-500" />, text: 'Khoa học Spaced Repetition (SM-2) tự gom câu sai', highlight: 'TRÍ NHỚ' },
    { icon: <Target className="h-3.5 w-3.5 text-red-500" />, text: 'Bứt phá 850+ rút ngắn 55% thời gian so với tự học', highlight: 'MỤC TIÊU' },
    { icon: <Headphones className="h-3.5 w-3.5 text-blue-500" />, text: 'Luyện nghe 4 ngữ điệu bản xứ: Mỹ, Anh, Úc, Canada', highlight: 'LISTENING' },
    { icon: <Award className="h-3.5 w-3.5 text-emerald-600" />, text: 'Hơn 5,000+ học viên đã đạt chứng chỉ mục tiêu', highlight: 'UY TÍN' },
  ];

  return (
    <div className="w-full overflow-hidden border-y border-primary/20 bg-primary/5 py-2.5 backdrop-blur-md relative select-none group">
      {/* Edge gradient masks for smooth fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Marquee Track (Repeated twice for seamless loop) */}
      <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
        {[...announcements, ...announcements].map((item, idx) => (
          <div key={idx} className="inline-flex items-center gap-2.5 text-xs font-medium text-foreground/90">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-background border border-border shadow-2xs">
              {item.icon}
            </span>
            <span className="font-semibold text-foreground tracking-tight">
              {item.text}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase font-mono">
              {item.highlight}
            </span>
            <span className="text-muted-foreground/40 mx-2">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
