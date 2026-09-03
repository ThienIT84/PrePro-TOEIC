import React, { useState, useId } from 'react';
import { Calculator, ArrowRight, Sparkles, Clock, CheckCircle2, TrendingUp, Calendar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { calculateStudyPlan } from './utils/scoreCalculatorUtils';
import { Link } from 'react-router-dom';

export const InteractiveScoreCalculator: React.FC = () => {
  // Trạng thái người dùng kéo thả
  const [currentScore, setCurrentScore] = useState<number>(450);
  const [targetScore, setTargetScore] = useState<number>(850);
  const [hoursPerDay, setHoursPerDay] = useState<number>(1.5);

  // Tính toán lộ trình từ Pure Function riêng biệt
  const plan = calculateStudyPlan(currentScore, targetScore, hoursPerDay);

  // Ensure target > current
  const handleCurrentChange = (val: number[]) => {
    const newCurrent = val[0];
    setCurrentScore(newCurrent);
    if (newCurrent >= targetScore) {
      setTargetScore(Math.min(990, newCurrent + 100));
    }
  };

  const handleTargetChange = (val: number[]) => {
    const newTarget = val[0];
    if (newTarget > currentScore) {
      setTargetScore(newTarget);
    }
  };

  return (
    <section id="calculator" className="py-20 bg-muted/30 border-y border-border/60 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3 px-3 py-1 bg-primary/10 text-primary border-primary/20 font-semibold">
            <Calculator className="h-3.5 w-3.5 mr-1.5" /> Công Cụ Tính Lộ Trình Thông Minh
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Bạn Cần Bao Nhiêu Ngày Để Đạt Mục Tiêu?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Kéo các thanh trượt bên dưới theo xuất phát điểm và quỹ thời gian của bạn để hệ thống AI ước toán lộ trình về đích tối ưu nhất.
          </p>
        </div>

        {/* Main 2-Column Calculator Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Left Column: Sliders Controller */}
          <div className="lg:col-span-7 bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-md space-y-7">
            {/* Slider 1: Điểm hiện tại */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-foreground">1. Điểm TOEIC hiện tại của bạn:</span>
                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold text-base font-mono">
                  {currentScore} điểm
                </span>
              </div>
              <Slider
                value={[currentScore]}
                min={200}
                max={850}
                step={10}
                onValueChange={handleCurrentChange}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>Mới bắt đầu (200)</span>
                <span>Trung cấp (500)</span>
                <span>Khá (850)</span>
              </div>
            </div>

            {/* Slider 2: Điểm mục tiêu */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-foreground">2. Điểm số mục tiêu mong muốn:</span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-base font-mono">
                  {targetScore} điểm
                </span>
              </div>
              <Slider
                value={[targetScore]}
                min={Math.max(300, currentScore + 10)}
                max={990}
                step={10}
                onValueChange={handleTargetChange}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>Cơ bản (500)</span>
                <span>Tốt nghiệp/Đi làm (750)</span>
                <span>Xuất sắc (990)</span>
              </div>
            </div>

            {/* Slider 3: Số giờ học mỗi ngày */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-foreground">3. Thời gian rảnh học mỗi ngày:</span>
                <span className="px-3 py-1 rounded-lg bg-muted text-foreground font-bold text-base font-mono">
                  {hoursPerDay} giờ/ngày
                </span>
              </div>
              <Slider
                value={[hoursPerDay]}
                min={0.5}
                max={3.0}
                step={0.5}
                onValueChange={(val) => setHoursPerDay(val[0])}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>Bận rộn (30 phút)</span>
                <span>Vừa phải (1.5 giờ)</span>
                <span>Tập trung (3.0 giờ)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Result Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 rounded-2xl border border-primary/30 shadow-xl flex flex-col justify-between relative ring-1 ring-primary/15">
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-border/60">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Dự báo lộ trình AI
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold">
                  <Sparkles className="h-3 w-3 mr-1" /> Tỷ lệ đạt {plan.successRate}%
                </Badge>
              </div>

              {/* Big Days Target */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Thời gian về đích ước tính:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight text-primary font-mono">
                    ~{plan.daysNeeded}
                  </span>
                  <span className="text-xl font-bold text-foreground">ngày</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full ml-auto">
                    +{plan.scoreGap} điểm
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  (Tổng cộng ~{plan.totalStudyHours} giờ học có trọng tâm với AI)
                </p>
              </div>

              {/* Listening vs Reading Ratio */}
              <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Phân bổ luyện tập khuyến nghị:</span>
                  <span className="text-foreground font-bold font-mono">
                    {plan.listeningPercent}% Nghe • {plan.readingPercent}% Đọc
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${plan.listeningPercent}%` }} 
                    className="bg-primary h-full transition-all duration-300" 
                    title="Listening"
                  />
                  <div 
                    style={{ width: `${plan.readingPercent}%` }} 
                    className="bg-emerald-500 h-full transition-all duration-300" 
                    title="Reading"
                  />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Link to="/auth" className="block">
                <Button className="w-full h-11 font-bold bg-gradient-to-r from-primary to-accent text-white shadow-md hover:scale-[1.02] transition-transform">
                  Nhận lộ trình cho {targetScore} điểm
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
