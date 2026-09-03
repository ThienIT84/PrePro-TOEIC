import React from 'react';
import { BookOpen, TrendingUp, RotateCcw, Zap, LucideIcon } from 'lucide-react';
import { LandingDataService } from './LandingDataService';
import { MetricStat } from './types';

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  TrendingUp,
  RotateCcw,
  Zap,
};

export const StatsBanner: React.FC = () => {
  const metrics = LandingDataService.getMetrics();

  return (
    <section className="relative py-12 border-y border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {metrics.map((item, idx) => {
            const Icon = iconMap[item.iconName] || TrendingUp;
            return (
              <div 
                key={idx}
                className="group relative p-5 rounded-2xl bg-card/60 border border-border/70 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {item.value}
                  </div>
                </div>

                <div className="text-sm font-semibold text-foreground mb-1">
                  {item.label}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
