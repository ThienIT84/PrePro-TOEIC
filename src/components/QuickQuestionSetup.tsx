import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  CheckCircle, 
  Database, 
  Plus, 
  Loader2,
  Zap,
  Target,
  BookOpen,
  Headphones,
  FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface QuickQuestionSetupProps {
  onQuestionsAdded?: () => void;
}

const QuickQuestionSetup = ({ onQuestionsAdded }: QuickQuestionSetupProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  // Sample questions for each TOEIC part
  const sampleQuestions = {
    part1: [
      {
        type: 'listening' as const,
        difficulty: 'easy' as const,
        question: 'Look at the picture. What is the woman doing?',
        choices: ['She is reading a book', 'She is typing on a computer', 'She is talking on the phone', 'She is writing on paper'],
        answer: 'B',
        explain_vi: 'Người phụ nữ đang gõ trên máy tính.',
        explain_en: 'The woman is typing on a computer.',
        tags: ['part1', 'photos', 'listening']
      },
      {
        type: 'listening' as const,
        difficulty: 'easy' as const,
        question: 'Look at the picture. Where are the people?',
        choices: ['In a restaurant', 'In an office', 'In a classroom', 'In a library'],
        answer: 'A',
        explain_vi: 'Những người này đang ở trong nhà hàng.',
        explain_en: 'The people are in a restaurant.',
        tags: ['part1', 'photos', 'listening']
      },
      {
        type: 'listening' as const,
        difficulty: 'medium' as const,
        question: 'Look at the picture. What is happening?',
        choices: ['A meeting is taking place', 'People are eating lunch', 'Someone is giving a presentation', 'A phone call is being made'],
        answer: 'C',
        explain_vi: 'Ai đó đang thuyết trình.',
        explain_en: 'Someone is giving a presentation.',
        tags: ['part1', 'photos', 'listening']
      }
    ],
    part2: [
      {
        type: 'listening' as const,
        difficulty: 'easy' as const,
        question: 'How was your weekend?',
        choices: ['It was great, thanks', 'Yes, I did', 'At 3 PM', 'By car'],
        answer: 'A',
        explain_vi: 'Câu hỏi về cuối tuần cần trả lời về trải nghiệm.',
        explain_en: 'A question about weekend needs an experience response.',
        tags: ['part2', 'question-response', 'listening']
      },
      {
        type: 'listening' as const,
        difficulty: 'medium' as const,
        question: 'Where did you go yesterday?',
        choices: ['I went to the mall', 'Yes, I did', 'It was expensive', 'I like shopping'],
        answer: 'A',
        explain_vi: 'Câu hỏi về nơi chốn cần trả lời về địa điểm.',
        explain_en: 'A question about location needs a place response.',
        tags: ['part2', 'question-response', 'listening']
      }
    ],
    part5: [
      {
        type: 'reading' as const,
        difficulty: 'easy' as const,
        question: 'The meeting will be held _____ 2 PM tomorrow.',
        choices: ['at', 'in', 'on', 'for'],
        answer: 'A',
        explain_vi: 'Dùng "at" với thời gian cụ thể.',
        explain_en: 'Use "at" with specific times.',
        tags: ['part5', 'grammar', 'reading']
      },
      {
        type: 'reading' as const,
        difficulty: 'medium' as const,
        question: 'The compunknown\'s profits have increased _____ 15% this year.',
        choices: ['by', 'for', 'with', 'from'],
        answer: 'A',
        explain_vi: 'Dùng "by" để chỉ mức độ tăng trưởng.',
        explain_en: 'Use "by" to indicate the amount of increase.',
        tags: ['part5', 'grammar', 'reading']
      },
      {
        type: 'reading' as const,
        difficulty: 'hard' as const,
        question: 'If I _____ more time, I would finish the project.',
        choices: ['had', 'have', 'will have', 'would have'],
        answer: 'A',
        explain_vi: 'Câu điều kiện loại 2: If + past simple, would + V.',
        explain_en: 'Second conditional: If + past simple, would + V.',
        tags: ['part5', 'grammar', 'reading']
      }
    ],
    part7: [
      {
        type: 'reading' as const,
        difficulty: 'medium' as const,
        question: 'According to the email, what should employees do?\n\nSubject: Important Meeting Tomorrow\n\nDear Team,\n\nWe have an important meeting scheduled for tomorrow at 10 AM in the main conference room. Please prepare your quarterly reports and bring them to the meeting. The CEO will be present to discuss our compunknown\'s performance.\n\nBest regards,\nManagement',
        choices: ['Submit reports by Friday', 'Attend a meeting', 'Update their passwords', 'Contact HR'],
        answer: 'B',
        explain_vi: 'Email yêu cầu nhân viên tham dự cuộc họp quan trọng.',
        explain_en: 'The email requests employees to attend an important meeting.',
        tags: ['part7', 'reading-comprehension', 'reading']
      }
    ]
  };

  const addSampleQuestions = async () => {
    if (!user) return;

    setLoading(true);
    setProgress(0);
    setCurrentStep('Adding sample questions...');

    try {
      const allQuestions = Object.values(sampleQuestions).flat();
      const totalQuestions = allQuestions.length;
      let added = 0;

      for (const question of allQuestions) {
        const questionToInsert = {
          part: question.type === 'listening' ? (question.question.includes('Part 1') ? 1 : 2) : (question.question.includes('Part 5') ? 5 : 7),
          prompt_text: question.question,
          choices: {
            A: question.choices[0],
            B: question.choices[1],
            C: question.choices[2],
            D: question.choices[3]
          },
          correct_choice: question.answer,
          explain_vi: question.explain_vi,
          explain_en: question.explain_en,
          difficulty: question.difficulty,
          tags: question.tags,
          status: 'published' as const,
          created_by: user.id
        };

        const { error } = await supabase
          .from('questions')
          .insert([questionToInsert]);

        if (error) {
          console.error('Error adding question:', error);
          continue;
        }

        added++;
        setProgress((added / totalQuestions) * 100);
      }

      toast({
        title: 'Success!',
        description: `Added ${added} sample questions to the database.`
      });

      onQuestionsAdded?.();

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add sample questions.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setCurrentStep('');
    }
  };

  const generateMoreQuestions = async () => {
    setLoading(true);
    setCurrentStep('Generating more questions...');

    try {
      const parts = [1, 2, 3, 4, 5, 6, 7];
      const questionsPerPart = 10;
      let totalGenerated = 0;

      for (const part of parts) {
        const questions = generateQuestionsForPart(part, questionsPerPart);
        
        const questionsToInsert = questions.map(q => ({
          part: part,
          prompt_text: q.question,
          choices: {
            A: q.choices[0],
            B: q.choices[1],
            C: q.choices[2],
            D: q.choices[3]
          },
          correct_choice: q.answer,
          explain_vi: q.explain_vi,
          explain_en: q.explain_en,
          difficulty: q.difficulty,
          tags: q.tags,
          status: 'published' as const,
          created_by: user?.id
        }));
        
        const { error } = await supabase
          .from('questions')
          .insert(questionsToInsert);

        if (error) {
          console.error(`Error adding Part ${part} questions:`, error);
          continue;
        }

        totalGenerated += questions.length;
        setProgress((totalGenerated / (parts.length * questionsPerPart)) * 100);
      }

      toast({
        title: 'Success!',
        description: `Generated ${totalGenerated} additional questions.`
      });

      onQuestionsAdded?.();

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate questions.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setCurrentStep('');
    }
  };

  const generateQuestionsForPart = (part: number, count: number) => {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      const question = {
        type: part <= 4 ? 'listening' : 'reading',
        difficulty: (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)],
        question: `Sample question for Part ${part} - Question ${i + 1}`,
        choices: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        explain_vi: `Giải thích cho câu hỏi Part ${part} số ${i + 1}`,
        explain_en: `Explanation for Part ${part} question ${i + 1}`,
        tags: [`part${part}`, part <= 4 ? 'listening' : 'reading']
      };
      
      questions.push(question);
    }
    
    return questions;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">No questions found!</div>
          <div>You need to add questions to the database before creating exam sets.</div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Quick Question Setup
          </CardTitle>
          <CardDescription>
            Add sample questions to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={addSampleQuestions} 
              disabled={loading}
              className="h-20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentStep}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sample Questions (8)
                </>
              )}
            </Button>

            <Button 
              onClick={generateMoreQuestions} 
              disabled={loading}
              variant="outline"
              className="h-20"
            >
              <Zap className="mr-2 h-4 w-4" />
              Generate More Questions (70+)
            </Button>
          </div>

          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 border rounded">
              <Headphones className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">Part 1-4</div>
              <div className="text-xs text-muted-foreground">Listening</div>
            </div>
            <div className="p-3 border rounded">
              <FileText className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Part 5-7</div>
              <div className="text-xs text-muted-foreground">Reading</div>
            </div>
            <div className="p-3 border rounded">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium">All Parts</div>
              <div className="text-xs text-muted-foreground">Covered</div>
            </div>
            <div className="p-3 border rounded">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium">Ready</div>
              <div className="text-xs text-muted-foreground">To Use</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">After adding questions:</div>
          <div>1. Go to "Question Bank" tab to select questions for each part</div>
          <div>2. Use "P1", "P2", etc. buttons to add questions to specific parts</div>
          <div>3. Preview your exam before publishing</div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default QuickQuestionSetup;
