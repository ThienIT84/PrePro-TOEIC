import React, { useState, useRef } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Sparkles, HelpCircle, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InteractiveQuestion } from './types';
import { LandingDataService } from './LandingDataService';

export const InteractiveQuizCard: React.FC = () => {
  const sampleQuestions = LandingDataService.getSampleQuestions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // 3D Tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Giới hạn góc nghiêng tối đa +/- 7 độ
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const currentQ: InteractiveQuestion = sampleQuestions[currentIndex];
  const isCorrect = selectedChoice === currentQ.correctChoice;

  const handleSelect = (choice: 'A' | 'B' | 'C' | 'D') => {
    if (selectedChoice) return; // Không cho click lại sau khi đã chọn
    setSelectedChoice(choice);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setSelectedChoice(null);
    setShowExplanation(false);
    setCurrentIndex((prev) => (prev + 1) % sampleQuestions.length);
  };

  const handleResetCurrent = () => {
    setSelectedChoice(null);
    setShowExplanation(false);
  };

  return (
    <div 
      className="perspective-1000 w-full max-w-xl mx-auto"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card 
        ref={cardRef}
        style={{
          transform: isHovered 
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)` 
            : 'rotateX(0deg) rotateY(0deg) translateY(0px)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
        }}
        className="w-full border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden ring-1 ring-primary/20 hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.25)] preserve-3d"
      >
      {/* Mini Mockup Top Bar */}
      <div className="bg-muted/60 border-b border-border/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground ml-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Trải nghiệm làm bài trực tiếp
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] font-medium bg-background/80 text-muted-foreground border-border flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-500" /> ~30s / câu
          </Badge>
          <Badge className="text-[11px] font-semibold bg-primary/15 text-primary hover:bg-primary/20 border-primary/20">
            Part {currentQ.part} • #{currentIndex + 1}/{sampleQuestions.length}
          </Badge>
        </div>
      </div>

      <CardHeader className="pt-5 pb-3 px-5 sm:px-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-medium text-foreground/80 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-primary" />
            Chủ điểm: <strong className="text-primary font-semibold">{currentQ.grammarTopic}</strong>
          </span>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            {currentQ.difficulty}
          </span>
        </div>

        {/* Question Prompt */}
        <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
          {currentQ.promptText}
        </p>
      </CardHeader>

      <CardContent className="px-5 sm:px-6 pb-6 space-y-3">
        {/* Choices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {(['A', 'B', 'C', 'D'] as const).map((choiceKey) => {
            const text = currentQ.choices[choiceKey];
            const isThisSelected = selectedChoice === choiceKey;
            const isThisCorrect = choiceKey === currentQ.correctChoice;

            let btnVariant = 'outline';
            let borderStyle = 'border-border/70 hover:border-primary/50 hover:bg-primary/5';

            if (selectedChoice) {
              if (isThisCorrect) {
                borderStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/50';
              } else if (isThisSelected && !isThisCorrect) {
                borderStyle = 'border-destructive bg-destructive/15 text-destructive font-semibold ring-1 ring-destructive/50';
              } else {
                borderStyle = 'opacity-40 border-border';
              }
            }

            return (
              <button
                key={choiceKey}
                onClick={() => handleSelect(choiceKey)}
                disabled={!!selectedChoice}
                className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition-all duration-200 cursor-pointer disabled:cursor-default ${borderStyle}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                    selectedChoice && isThisCorrect 
                      ? 'bg-emerald-600 text-white' 
                      : selectedChoice && isThisSelected 
                      ? 'bg-destructive text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {choiceKey}
                  </span>
                  <span className="font-medium">{text}</span>
                </div>

                {selectedChoice && isThisCorrect && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />
                )}
                {selectedChoice && isThisSelected && !isThisCorrect && (
                  <XCircle className="h-4 w-4 text-destructive shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Explanation Box */}
        {showExplanation && (
          <div className="mt-4 pt-4 border-t border-border/60 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className={`p-4 rounded-xl border text-sm ${
              isCorrect 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-foreground' 
                : 'bg-amber-500/10 border-amber-500/20 text-foreground'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Chính xác! (+5 điểm)
                    </span>
                  ) : (
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4" /> Chưa chính xác (Đáp án đúng: {currentQ.correctChoice})
                    </span>
                  )}
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  Giải thích AI
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-2">
                <strong className="text-primary font-medium">Phân tích: </strong>
                {currentQ.explainVi}
              </p>
              <p className="text-xs text-muted-foreground italic border-t border-border/40 pt-1.5 mt-1.5">
                <strong>English note: </strong> {currentQ.explainEn}
              </p>
            </div>

            {/* Actions: Next Question / Retry */}
            <div className="flex items-center justify-between pt-3 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetCurrent}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Làm lại câu này
              </Button>

              <Button
                size="sm"
                onClick={handleNextQuestion}
                className="text-xs h-8 px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Thử câu tiếp theo
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {!showExplanation && (
          <p className="text-center text-[11px] text-muted-foreground/80 pt-1">
            💡 <em>Chọn 1 đáp án bất kỳ để xem phân tích ngữ pháp tự động tức thì</em>
          </p>
        )}
      </CardContent>
    </Card>
    </div>
  );
};
