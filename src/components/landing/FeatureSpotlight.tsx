import React from 'react';
import { Cpu, RotateCcw, Sparkles, CheckCircle2, Zap, ArrowRight, Brain, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const FeatureSpotlight: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 space-y-24">
        {/* Spotlight 1: AI Question Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Info */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Cpu className="h-3.5 w-3.5" /> Công nghệ AI Siêu Tốc (Groq & Llama 3.1)
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Tạo câu hỏi & đề thi <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Chuẩn xác chỉ trong 3 giây
              </span>
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Không còn nỗi lo thiếu đề luyện tập. Trợ lý AI phân tích kho đề thi thật, tự động sinh các câu hỏi Part 1 đến Part 7 theo đúng độ khó và chủ đề bạn yêu cầu, đi kèm phân tích ngữ pháp song ngữ chi tiết.
            </p>

            <div className="space-y-3 pt-2 text-sm text-foreground/85">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-foreground">Sinh bẫy đề thi thông minh:</strong> Tự động lồng ghép các cấu trúc dễ nhầm lẫn như liên từ, giới từ chỉ thời gian và thì hoàn thành.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-foreground">Giải thích chi tiết 2 ngôn ngữ:</strong> Cung cấp cả dịch nghĩa tiếng Việt và lý giải ngữ pháp chuyên sâu tiếng Anh.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-foreground">Hỗ trợ giáo viên soạn giáo án:</strong> Xuất trực tiếp sang file Excel hoặc lưu thành bộ đề kiểm tra cho học sinh.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/auth">
                <Button className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                  Thử nghiệm tạo đề AI
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Mockup 1: AI Prompt & Response Simulator */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">AI Question Generator</h4>
                    <p className="text-[11px] text-muted-foreground">Groq Llama 3.1-8B Instant Engine</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                  ⚡ 0.8s Response
                </Badge>
              </div>

              {/* Generator Prompt Simulated Inputs */}
              <div className="space-y-3 text-xs bg-muted/40 p-3.5 rounded-xl border border-border/50 mb-4 font-mono">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Part: <strong className="text-foreground">Part 5 (Incomplete Sentences)</strong></span>
                  <span>Độ khó: <strong className="text-amber-500">Medium (650 - 800)</strong></span>
                </div>
                <div className="text-muted-foreground">
                  Chủ đề: <strong className="text-foreground font-sans">Human Resources & Recruitment</strong>
                </div>
              </div>

              {/* Generated Result Output */}
              <div className="p-4 rounded-xl bg-background border border-primary/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-primary">✨ Kết quả sinh đề tự động</span>
                  <span className="text-muted-foreground">Tags: grammar_tenses, business</span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  &ldquo;All job applicants are required to _______ their portfolio before the interview committee next Monday.&rdquo;
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="p-2 rounded bg-muted/70 font-medium">A. submit</span>
                  <span className="p-2 rounded bg-muted/70 font-medium">B. submission</span>
                  <span className="p-2 rounded bg-muted/70 font-medium">C. submitting</span>
                  <span className="p-2 rounded bg-muted/70 font-medium">D. submittal</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Đáp án: A (Cấu trúc be required to + V-infinitive)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight 2: Spaced Repetition SM-2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Mockup 2: Spaced Repetition Curve */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl relative overflow-hidden backdrop-blur-sm space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                    <LineChart className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Khoa học Ghi nhớ SuperMemo-2</h4>
                    <p className="text-[11px] text-muted-foreground">Khắc phục Đường cong Quên lãng Ebbinghaus</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-accent border-accent/20">
                  Thuật toán SM-2
                </Badge>
              </div>

              {/* Intervals Visual Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Chu kỳ nhắc ôn tập tối ưu:</span>
                  <span className="text-accent font-bold">100% Ghi nhớ dài hạn</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-muted/60 border border-border">
                    <span className="block font-bold text-foreground text-sm">Ngày 1</span>
                    <span className="text-[11px] text-muted-foreground">Lần ôn 1</span>
                    <span className="block mt-1 text-[10px] text-primary font-medium">Nhận diện lỗi</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/60 border border-border">
                    <span className="block font-bold text-foreground text-sm">Ngày 3</span>
                    <span className="text-[11px] text-muted-foreground">Lần ôn 2</span>
                    <span className="block mt-1 text-[10px] text-primary font-medium">Củng cố nhớ</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/60 border border-border">
                    <span className="block font-bold text-foreground text-sm">Ngày 7</span>
                    <span className="text-[11px] text-muted-foreground">Lần ôn 3</span>
                    <span className="block mt-1 text-[10px] text-accent font-medium">Phản xạ nhanh</span>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 text-accent">
                    <span className="block font-bold text-sm">Ngày 14</span>
                    <span className="text-[11px]">Vĩnh viễn</span>
                    <span className="block mt-1 text-[10px] font-bold">In sâu não bộ</span>
                  </div>
                </div>
              </div>

              {/* Active Smart Flashcard Preview */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5 text-accent" /> Thẻ ôn tập hôm nay: <strong>14 câu cần ôn</strong>
                  </span>
                  <span className="text-muted-foreground font-mono">Ease Factor: 2.5</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Hệ thống chỉ nhắc lại đúng những câu bạn hay làm sai, tiết kiệm 70% thời gian so với cách ôn luyện truyền thống.
                </p>
              </div>
            </div>
          </div>

          {/* Text Info */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <RotateCcw className="h-3.5 w-3.5" /> Trí Nhớ Dài Hạn (Long-term Retention)
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Biến câu làm sai thành <br />
              <span className="bg-gradient-to-r from-accent to-emerald-600 bg-clip-text text-transparent">
                Phản xạ đúng vô điều kiện
              </span>
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Đa số người học quên 80% kiến thức chỉ sau 48 giờ. Với cơ chế <strong>Spaced Repetition (SM-2)</strong>, PrePro-TOEIC sẽ tự động tính toán &ldquo;điểm rơi trí nhớ&rdquo; của từng cá nhân để gợi ý ôn tập đúng thời điểm vàng.
            </p>

            <div className="space-y-3 pt-2 text-sm text-foreground/85">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-foreground">Tự động gom câu sai:</strong> Mọi câu trả lời sai trong quá trình làm đề đều được chuyển vào sổ ôn tập thông minh.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-foreground">Tối ưu hóa thời gian:</strong> Tập trung 100% vào lỗ hổng kiến thức thay vì ôn lại những gì bạn đã biết.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-foreground">Theo dõi tiến độ trực quan:</strong> Biểu đồ tỷ lệ ghi nhớ giúp bạn tự tin bước vào phòng thi thật.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/auth">
                <Button className="font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
                  Trải nghiệm Spaced Repetition
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
