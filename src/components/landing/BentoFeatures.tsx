import React, { useState } from 'react';
import { RotateCcw, Sparkles, Headphones, ArrowRight, CheckCircle2, Zap, Brain, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const BentoFeatures: React.FC = () => {
  const [selectedAccent, setSelectedAccent] = useState<'US' | 'UK' | 'AU' | 'CA'>('US');

  const accentsData = {
    US: { name: 'Mỹ (General American)', short: 'Mỹ (US)', note: 'Âm /r/ uốn lưỡi rõ nét, nguyên âm mở rộng, chiếm ~50% thời lượng đề thi.' },
    UK: { name: 'Anh (British RP)', short: 'Anh (UK)', note: 'Âm /r/ câm đuôi, phụ âm bật mạnh dứt khoát, chiếm ~25% đề thi.' },
    AU: { name: 'Úc (Australian)', short: 'Úc (AU)', note: 'Bẫy biến âm đặc trưng từ /eɪ/ sang /aɪ/ (từ "today" phát âm gần như "to-die").' },
    CA: { name: 'Canada (Canadian)', short: 'Canada (CA)', note: 'Canadian Raising tròn tiếng, tốc độ nói nhanh và kết hợp âm cổ Bắc Mỹ.' },
  };

  return (
    <section id="features" className="py-20 bg-background relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3 px-3 py-1 bg-primary/10 text-primary border-primary/20 font-semibold">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Vũ Khí Bứt Phá Điểm Số
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            <span className="animate-shimmer-text inline-block">3 Công Nghệ Độc Quyền</span> Giúp Bạn Nhớ Sâu
          </h2>
          <p className="text-muted-foreground text-base">
            Không học vẹt, không làm đề dàn trải. Tập trung 100% vào việc xóa bỏ điểm mù kiến thức.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Item 1 (Large - Span 7): SM-2 Spaced Repetition */}
          <div className="md:col-span-7 p-7 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-500/40 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <RotateCcw className="h-6 w-6 transition-transform group-hover:-rotate-45" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold">
                  Khoa Học Trí Nhớ SM-2
                </Badge>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Tự Động Gom Câu Sai • Nhắc Ôn Trước Khi Quên
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Khi bạn làm sai, thuật toán SuperMemo-2 (SM-2) tự động lưu câu hỏi và tính toán điểm rơi trí nhớ để nhắc bạn làm lại sau 1 ngày, 3 ngày, 7 ngày cho đến khi trở thành phản xạ vĩnh viễn.
              </p>

              {/* SM-2 Interactive Interval Timeline Visual */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-muted/40 p-3.5 rounded-2xl border border-border/60 mb-4">
                <div className="p-2 rounded-xl bg-background border border-border/70">
                  <span className="block font-bold text-foreground">Ngày 1</span>
                  <span className="text-[10px] text-muted-foreground">Nhận diện lỗi</span>
                </div>
                <div className="p-2 rounded-xl bg-background border border-border/70">
                  <span className="block font-bold text-foreground">Ngày 3</span>
                  <span className="text-[10px] text-muted-foreground">Củng cố nhớ</span>
                </div>
                <div className="p-2 rounded-xl bg-background border border-border/70">
                  <span className="block font-bold text-foreground">Ngày 7</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Khắc sâu</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  <span className="block font-bold">Vĩnh viễn</span>
                  <span className="text-[10px] font-bold">100% Thuộc</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Tiết kiệm 65% thời gian so với ôn thủ công
              </span>
              <Link to="/auth" className="hover:underline flex items-center gap-1">
                Khám phá <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Item 2 (Span 5): AI Question Generator */}
          <div className="md:col-span-5 p-7 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Zap className="h-6 w-6 transition-transform group-hover:scale-110" />
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                  Groq Llama 3.1
                </Badge>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Sinh Đề Thi Chuẩn ETS Trong 3 Giây
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                Chỉ cần chọn chủ đề hoặc dạng bẫy ngữ pháp bạn đang yếu, AI sẽ tức tốc tạo ra câu hỏi độc quyền kèm giải thích song ngữ Anh - Việt chuyên sâu.
              </p>

              {/* Mini AI Output Preview */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-2 font-mono">
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Prompt: Part 5 • Hard</span>
                  <span className="text-emerald-600 font-bold">⚡ 0.8s</span>
                </div>
                <p className="font-sans text-xs font-medium text-foreground line-clamp-2">
                  &ldquo;The executive board has voted _______ to approve the proposed merger.&rdquo;
                </p>
                <span className="inline-block text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold font-sans">
                  Đáp án: unanimously (Trạng từ bổ nghĩa động từ)
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 text-xs font-semibold text-primary flex items-center justify-between">
              <span>Không bao giờ cạn đề luyện tập</span>
              <Link to="/auth" className="hover:underline flex items-center gap-1">
                Tạo đề ngay <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Item 3 (Full Width - Span 12): Listening 4 Accents Lab */}
          <div className="md:col-span-12 p-7 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-500/40">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-500/20 font-semibold">
                    Listening Mastery
                  </Badge>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  Phòng Luyện Tai 4 Chất Giọng Bản Xứ
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Đề thi thật đan xen giữa 4 quốc gia khiến thí sinh dễ mất điểm. Hệ thống chuẩn hóa bài nghe giúp bạn thích ứng ngay lập tức với mọi ngữ điệu.
                </p>

                {/* Accent Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {(['US', 'UK', 'AU', 'CA'] as const).map((code) => {
                    const item = accentsData[code];
                    const isSelected = selectedAccent === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setSelectedAccent(code)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-sm'
                            : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="block text-sm font-black">{code}</span>
                        <span className="text-[10px] text-muted-foreground">{item.short.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Note Display */}
              <div className="lg:col-span-6 bg-muted/30 p-5 rounded-2xl border border-border/70 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-foreground">
                  <span className="text-primary font-extrabold">{accentsData[selectedAccent].name}</span>
                  <span className="text-muted-foreground font-mono text-[11px]">Đặc trưng phát âm</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {accentsData[selectedAccent].note}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                  <span className="text-muted-foreground">Tích hợp sẵn trong mọi đề Listening</span>
                  <Link to="/auth">
                    <Button size="sm" variant="outline" className="text-xs h-8 px-3 border-primary/40 text-primary hover:bg-primary/10">
                      Nghe thử toàn bộ bài thi <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
