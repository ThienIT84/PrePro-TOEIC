import React, { useState } from 'react';
import { Radar, ArrowRight, Sparkles, CheckCircle2, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SkillMetric {
  name: string;
  before: number; // 0 - 100
  after: number;  // 0 - 100
  angle: number;  // radian
}

export const RadarSkillMatrix: React.FC = () => {
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');

  // 6 trục năng lực chuẩn hóa theo ma trận đề thi TOEIC
  const skills: SkillMetric[] = [
    { name: 'Nghe Bắt Từ Khóa', before: 45, after: 94, angle: 0 },
    { name: 'Nghe Hiểu Hàm Ý', before: 35, after: 88, angle: Math.PI / 3 },
    { name: 'Ngữ Pháp Bẫy Thì', before: 50, after: 96, angle: (2 * Math.PI) / 3 },
    { name: 'Từ Vựng Kinh Tế', before: 40, after: 92, angle: Math.PI },
    { name: 'Tốc Độ Đọc Lướt', before: 30, after: 86, angle: (4 * Math.PI) / 3 },
    { name: 'Phản Xạ Tránh Bẫy', before: 42, after: 95, angle: (5 * Math.PI) / 3 },
  ];

  const centerX = 160;
  const centerY = 160;
  const maxRadius = 110;

  // Tính tọa độ điểm trên radar
  const getCoordinates = (value: number, angle: number) => {
    const r = (value / 100) * maxRadius;
    const x = centerX + r * Math.sin(angle);
    const y = centerY - r * Math.cos(angle);
    return `${x},${y}`;
  };

  const beforePoints = skills.map((s) => getCoordinates(s.before, s.angle)).join(' ');
  const afterPoints = skills.map((s) => getCoordinates(s.after, s.angle)).join(' ');

  const currentPoints = viewMode === 'after' ? afterPoints : beforePoints;

  return (
    <section className="py-20 bg-muted/20 border-b border-border/60 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3 px-3 py-1 bg-primary/10 text-primary border-primary/20 font-semibold">
            <Award className="h-3.5 w-3.5 mr-1.5" /> Ma Trận Năng Lực 360°
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Khắc Phục Toàn Diện 6 Điểm Mù TOEIC
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Hệ thống phân tích học tập theo dõi chi tiết từng nhóm kỹ năng, giúp bạn bù đắp ngay những phần kiến thức hổng trước khi bước vào phòng thi thật.
          </p>

          {/* Toggle Button Group */}
          <div className="inline-flex p-1.5 rounded-xl bg-card border border-border mt-6 shadow-sm">
            <button
              onClick={() => setViewMode('before')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                viewMode === 'before'
                  ? 'bg-muted text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Điểm Xuất Phát Ban Đầu
            </button>
            <button
              onClick={() => setViewMode('after')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                viewMode === 'after'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Sau Khi Luyện Cùng PrePro (+350đ)
            </button>
          </div>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto items-center">
          {/* Radar SVG Visualizer */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative p-6 rounded-3xl bg-card border border-border shadow-xl ring-1 ring-primary/10">
              <svg width="320" height="320" className="overflow-visible select-none">
                {/* Concentric Reference Webs (20%, 40%, 60%, 80%, 100%) */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                  <polygon
                    key={i}
                    points={skills.map((s) => getCoordinates(scale * 100, s.angle)).join(' ')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-border/80"
                    strokeDasharray={scale === 1 ? 'none' : '3 3'}
                  />
                ))}

                {/* Radial Axis Lines */}
                {skills.map((s, i) => {
                  const endPoint = getCoordinates(100, s.angle);
                  return (
                    <line
                      key={i}
                      x1={centerX}
                      y1={centerY}
                      x2={endPoint.split(',')[0]}
                      y2={endPoint.split(',')[1]}
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-border/80"
                    />
                  );
                })}

                {/* Radar Skill Area Polygon with Smooth Morphing */}
                <polygon
                  points={currentPoints}
                  className={`transition-all duration-700 ease-out ${
                    viewMode === 'after'
                      ? 'fill-emerald-500/25 stroke-emerald-500 stroke-2'
                      : 'fill-primary/20 stroke-primary stroke-2'
                  }`}
                />

                {/* Radar Node Dots */}
                {skills.map((s, i) => {
                  const val = viewMode === 'after' ? s.after : s.before;
                  const [cx, cy] = getCoordinates(val, s.angle).split(',');
                  return (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      className={`transition-all duration-700 ${
                        viewMode === 'after' ? 'fill-emerald-500 ring-2 ring-background' : 'fill-primary ring-2 ring-background'
                      }`}
                    />
                  );
                })}

                {/* Skill Labels */}
                {skills.map((s, i) => {
                  const labelCoord = getCoordinates(126, s.angle);
                  const [lx, ly] = labelCoord.split(',');
                  return (
                    <text
                      key={i}
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[11px] font-bold fill-foreground"
                    >
                      {s.name}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Skill Breakdown List */}
          <div className="lg:col-span-6 space-y-3.5">
            {skills.map((s, idx) => {
              const val = viewMode === 'after' ? s.after : s.before;
              const increase = s.after - s.before;
              return (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-xl bg-card border border-border/80 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-sm text-foreground">{s.name}</span>
                    <p className="text-xs text-muted-foreground">
                      {idx < 2 ? 'Kỹ năng Nghe' : idx < 5 ? 'Kỹ năng Đọc' : 'Chiến thuật thi'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-sm ${viewMode === 'after' ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}>
                      {val}%
                    </span>
                    {viewMode === 'after' && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        +{increase}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
