import React, { useState } from 'react';
import { Headphones, BookOpenCheck, Clock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LandingDataService } from './LandingDataService';
import { ToeicPartInfo } from './types';
import { Link } from 'react-router-dom';

export const ToeicPartShowcase: React.FC = () => {
  const parts = LandingDataService.getToeicParts();
  const [filter, setFilter] = useState<'all' | 'listening' | 'reading'>('all');

  const filteredParts = parts.filter((p) => {
    if (filter === 'listening') return p.type === 'listening';
    if (filter === 'reading') return p.type === 'reading';
    return true;
  });

  return (
    <section id="toeic-parts" className="py-20 bg-muted/20 relative">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 px-3 py-1 bg-primary/10 text-primary border-primary/20 font-semibold">
            <BookOpenCheck className="h-3.5 w-3.5 mr-1.5" /> Chuẩn Format ETS 2026
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Bao quát trọn vẹn 7 Part TOEIC
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Hệ thống ngân hàng câu hỏi được phân loại khoa học theo từng Part, giúp bạn rèn luyện điểm yếu và tối đa hóa thời gian làm bài.
          </p>

          {/* Filter Pills */}
          <div className="inline-flex items-center p-1.5 rounded-xl bg-muted/80 border border-border mt-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'all' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tất cả 7 Part (200 câu)
            </button>
            <button
              onClick={() => setFilter('listening')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'listening' 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Headphones className="h-3.5 w-3.5" /> Listening (Part 1 - 4)
            </button>
            <button
              onClick={() => setFilter('reading')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'reading' 
                  ? 'bg-background text-accent shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpenCheck className="h-3.5 w-3.5" /> Reading (Part 5 - 7)
            </button>
          </div>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map((item: ToeicPartInfo) => {
            const isListening = item.type === 'listening';
            return (
              <Card 
                key={item.part} 
                className="flex flex-col justify-between border-border/80 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge className={item.badgeColor}>
                      {isListening ? <Headphones className="h-3 w-3 mr-1" /> : <BookOpenCheck className="h-3 w-3 mr-1" />}
                      Part {item.part}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <span>{item.questionCount} câu</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.duration}
                      </span>
                    </div>
                  </div>

                  <CardTitle className="text-lg font-bold text-foreground">
                    {item.name}
                  </CardTitle>
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.englishName}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Tips box */}
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Chiến thuật bứt điểm:
                    </span>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {item.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to="/auth" className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold group hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                      Luyện tập Part {item.part}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
