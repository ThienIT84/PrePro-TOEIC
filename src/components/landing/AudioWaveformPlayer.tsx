import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Globe, FileText, CheckCircle2, Headphones, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LandingDataService } from './LandingDataService';
import { ListeningAccentSample } from './types';

export const AudioWaveformPlayer: React.FC = () => {
  const samples = LandingDataService.getListeningSamples();
  const [activeAccent, setActiveAccent] = useState<'US' | 'UK' | 'AU' | 'CA'>('US');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [showScript, setShowScript] = useState<boolean>(false);

  const currentSample: ListeningAccentSample = samples.find((s) => s.country === activeAccent) || samples[0];

  // Giả lập phát audio đếm giây và dừng lại sau 5s
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 5) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSelectAccent = (country: 'US' | 'UK' | 'AU' | 'CA') => {
    setActiveAccent(country);
    setIsPlaying(false);
    setSeconds(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-border bg-card/90 shadow-xl backdrop-blur-sm overflow-hidden ring-1 ring-primary/10">
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-muted/50 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Headphones className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-foreground">
            Luyện Tai Nghe 4 Ngữ Điệu Bản Xứ (Chuẩn ETS)
          </span>
        </div>
        <Badge variant="outline" className="text-[11px] font-mono border-primary/20 text-primary bg-primary/5">
          Listening Lab
        </Badge>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Accent Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {samples.map((s) => {
            const isSelected = s.country === activeAccent;
            return (
              <button
                key={s.country}
                onClick={() => handleSelectAccent(s.country)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30 shadow-sm' 
                    : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <span>{s.flag}</span>
                  <span>{s.country}</span>
                </div>
                <span className="text-[10px] block text-muted-foreground truncate mt-0.5">
                  {s.countryName.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Accent Meta */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
          <div className="flex justify-between font-bold text-foreground">
            <span>{currentSample.flag} {currentSample.accentTitle}</span>
            <span className="text-[11px] text-primary font-mono">{currentSample.sampleAudioPrompt}</span>
          </div>
          <p className="text-muted-foreground text-[11px]">{currentSample.description}</p>
        </div>

        {/* Audio Waveform Simulator Box */}
        <div className="p-5 rounded-2xl bg-background border border-primary/20 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
            {/* Play/Pause Button */}
            <Button
              size="icon"
              onClick={handleTogglePlay}
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 shrink-0"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>

            {/* Time counter */}
            <div className="font-mono text-xs font-semibold text-muted-foreground">
              0:0{seconds} / 0:05
            </div>
          </div>

          {/* Animated Waveform Bars */}
          <div className="flex items-center gap-1.5 h-10 px-2 justify-center flex-1">
            {[40, 75, 30, 90, 60, 100, 45, 80, 65, 95, 35, 85, 55, 70, 40, 60].map((height, i) => (
              <span
                key={i}
                style={{
                  height: isPlaying ? `${Math.max(15, Math.sin((i + seconds) * 1.5) * 30 + 20)}px` : `${height * 0.3}px`,
                  transition: 'height 0.15s ease-in-out'
                }}
                className={`w-1.5 rounded-full transition-colors ${
                  isPlaying ? 'bg-gradient-to-t from-primary to-accent' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Script Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScript(!showScript)}
            className="text-xs shrink-0 font-medium"
          >
            <FileText className="h-3.5 w-3.5 mr-1 text-primary" />
            {showScript ? 'Ẩn Phụ Đề' : 'Xem Phụ Đề'}
          </Button>
        </div>

        {/* Bilingual Transcript Preview (Collapsible) */}
        {showScript && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Transcript & Dịch nghĩa song ngữ:</span>
            </div>
            <p className="font-medium text-foreground text-sm leading-relaxed">
              &ldquo;{currentSample.speakerText}&rdquo;
            </p>
            <p className="text-muted-foreground italic border-t border-border/40 pt-1.5">
              🇻🇳 {currentSample.translationVi}
            </p>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded font-medium">
              💡 {currentSample.keyPhonetics}
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
};
