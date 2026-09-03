import React from 'react';
import { HelpCircle, MessageCircleQuestion } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LandingDataService } from './LandingDataService';

export const FaqAccordion: React.FC = () => {
  const faqs = LandingDataService.getFaqs();

  return (
    <section id="faq" className="py-20 bg-muted/20 border-t border-border/60">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-3 px-3 py-1 bg-primary/10 text-primary border-primary/20 font-semibold">
            <HelpCircle className="h-3.5 w-3.5 mr-1.5" /> Giải Đáp Thắc Mắc
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Mọi điều bạn cần biết về phương pháp luyện thi, hệ thống AI và cách thức hoạt động của PrePro-TOEIC.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <Accordion type="single" collapsible defaultValue="faq-1" className="w-full space-y-3">
            {faqs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="border border-border/60 rounded-xl px-4 py-1 data-[state=open]:border-primary/40 data-[state=open]:bg-primary/[0.02] transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base text-foreground hover:no-underline hover:text-primary py-3">
                  <div className="flex items-center gap-2.5">
                    <MessageCircleQuestion className="h-4 w-4 text-primary shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 pb-4 pl-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
