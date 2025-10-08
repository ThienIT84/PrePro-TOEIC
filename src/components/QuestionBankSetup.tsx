import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Upload, 
  Download, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  Headphones,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface QuestionStats {
  total: number;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
  byPart: Record<string, number>;
}

const QuestionBankSetup: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [setupProgress, setSetupProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  // Sample questions data
  const sampleQuestions = {
    part1: [
      {
        type: 'listening',
        difficulty: 'easy',
        question: 'Look at the picture. What is the man doing?',
        choices: ['He is reading a book', 'He is typing on a computer', 'He is talking on the phone', 'He is writing on paper'],
        answer: 'B',
        explain_vi: 'Người đàn ông đang gõ trên máy tính.',
        explain_en: 'The man is typing on a computer.',
        tags: ['part1', 'photos', 'listening']
      },
      {
        type: 'listening',
        difficulty: 'medium',
        question: 'Look at the picture. Where are the people?',
        choices: ['In a restaurant', 'In an office', 'In a classroom', 'In a library'],
        answer: 'A',
        explain_vi: 'Những người này đang ở trong nhà hàng.',
        explain_en: 'The people are in a restaurant.',
        tags: ['part1', 'photos', 'listening']
      }
    ],
    part2: [
      {
        type: 'listening',
        difficulty: 'easy',
        question: 'How was your weekend?',
        choices: ['It was great, thanks', 'Yes, I did', 'At 3 PM', 'By car'],
        answer: 'A',
        explain_vi: 'Câu hỏi về cuối tuần cần trả lời về trải nghiệm.',
        explain_en: 'A question about weekend needs an experience response.',
        tags: ['part2', 'question-response', 'listening']
      }
    ],
    part5: [
      {
        type: 'reading',
        difficulty: 'easy',
        question: 'The meeting will be held _____ 2 PM tomorrow.',
        choices: ['at', 'in', 'on', 'for'],
        answer: 'A',
        explain_vi: 'Dùng "at" với thời gian cụ thể.',
        explain_en: 'Use "at" with specific times.',
        tags: ['part5', 'grammar', 'reading']
      },
      {
        type: 'reading',
        difficulty: 'medium',
        question: 'The compunknown\'s profits have increased _____ 15% this year.',
        choices: ['by', 'for', 'with', 'from'],
        answer: 'A',
        explain_vi: 'Dùng "by" để chỉ mức độ tăng trưởng.',
        explain_en: 'Use "by" to indicate the amount of increase.',
        tags: ['part5', 'grammar', 'reading']
      }
    ],
    part7: [
      {
        type: 'reading',
        difficulty: 'medium',
        question: 'According to the email, what should employees do?',
        choices: ['Submit reports by Friday', 'Attend a meeting', 'Update their passwords', 'Contact HR'],
        answer: 'A',
        explain_vi: 'Email yêu cầu nhân viên nộp báo cáo trước thứ Sáu.',
        explain_en: 'The email requests employees to submit reports by Friday.',
        tags: ['part7', 'reading-comprehension', 'reading']
      }
    ]
  };

  useEffect(() => {
    fetchQuestionStats();
  }, []);

  const fetchQuestionStats = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('type, difficulty, tags');

      if (error) throw error;

      const stats: QuestionStats = {
        total: data.length,
        byType: {},
        byDifficulty: {},
        byPart: {}
      };

      data.forEach(item => {
        // Count by type
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        
        // Count by difficulty
        stats.byDifficulty[item.difficulty] = (stats.byDifficulty[item.difficulty] || 0) + 1;
        
        // Count by part (from tags)
        if (item.tags) {
          item.tags.forEach(tag => {
            if (tag.startsWith('part')) {
              stats.byPart[tag] = (stats.byPart[tag] || 0) + 1;
            }
          });
        }
      });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const addSampleQuestions = async () => {
    if (!user) return;

    setLoading(true);
    setSetupProgress(0);
    setCurrentStep('Adding sample questions...');

    try {
      const allQuestions = Object.values(sampleQuestions).flat();
      const totalQuestions = allQuestions.length;
      let added = 0;

      for (const question of allQuestions) {
        const { error } = await supabase
          .from('questions')
          .insert([question]);

        if (error) {
          console.error('Error adding question:', error);
          continue;
        }

        added++;
        setSetupProgress((added / totalQuestions) * 100);
      }

      toast({
        title: 'Success!',
        description: `Added ${added} sample questions to the database.`
      });

      await fetchQuestionStats();
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
      // Generate questions for each part
      const parts = [1, 2, 3, 4, 5, 6, 7];
      const questionsPerPart = 20;
      let totalGenerated = 0;

      for (const part of parts) {
        const questions = generateQuestionsForPart(part, questionsPerPart);
        
        const { error } = await supabase
          .from('questions')
          .insert(questions);

        if (error) {
          console.error(`Error adding Part ${part} questions:`, error);
          continue;
        }

        totalGenerated += questions.length;
        setSetupProgress((totalGenerated / (parts.length * questionsPerPart)) * 100);
      }

      toast({
        title: 'Success!',
        description: `Generated ${totalGenerated} additional questions.`
      });

      await fetchQuestionStats();
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
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
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

  const exportQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*');

      if (error) throw error;

      const csvContent = [
        'Type,Difficulty,Question,Choice A,Choice B,Choice C,Choice D,Answer,Explanation VI,Explanation EN,Tags',
        ...data.map(q => [
          q.type,
          q.difficulty,
          q.question,
          q.choices[0] || '',
          q.choices[1] || '',
          q.choices[2] || '',
          q.choices[3] || '',
          q.answer,
          q.explain_vi,
          q.explain_en,
          q.tags?.join(';') || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'toeic-questions.csv';
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Success!',
        description: 'Questions exported to CSV file.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export questions.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Question Bank Setup
          </CardTitle>
          <CardDescription>
            Set up your TOEIC question database with sample questions and templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="setup">Quick Setup</TabsTrigger>
              <TabsTrigger value="import">Import/Export</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <div className="text-sm text-muted-foreground">Total Questions</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{stats.byType.listening || 0}</div>
                      <div className="text-sm text-muted-foreground">Listening</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{stats.byType.reading || 0}</div>
                      <div className="text-sm text-muted-foreground">Reading</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{Object.keys(stats.byPart).length}</div>
                      <div className="text-sm text-muted-foreground">Parts Covered</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need at least 200 questions to create a full TOEIC exam. 
                  Currently you have {stats?.total || 0} questions.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="setup" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Quick Setup
                    </CardTitle>
                    <CardDescription>
                      Add sample questions to get started quickly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={addSampleQuestions} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {currentStep}
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Sample Questions
                        </>
                      )}
                    </Button>

                    {setupProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(setupProgress)}%</span>
                        </div>
                        <Progress value={setupProgress} />
                      </div>
                    )}

                    <Button 
                      onClick={generateMoreQuestions} 
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Generate More Questions (140+)
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What's Included</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { part: 'Part 1', name: 'Photos', count: '6 questions', icon: FileText },
                        { part: 'Part 2', name: 'Question-Response', count: '25 questions', icon: Headphones },
                        { part: 'Part 3', name: 'Conversations', count: '39 questions', icon: Headphones },
                        { part: 'Part 4', name: 'Talks', count: '30 questions', icon: Headphones },
                        { part: 'Part 5', name: 'Incomplete Sentences', count: '30 questions', icon: BookOpen },
                        { part: 'Part 6', name: 'Text Completion', count: '16 questions', icon: BookOpen },
                        { part: 'Part 7', name: 'Reading Comprehension', count: '54 questions', icon: BookOpen }
                      ].map((item) => (
                        <div key={item.part} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium">{item.part}</span>
                            <span className="text-sm text-muted-foreground">{item.name}</span>
                          </div>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import/Export Questions
                  </CardTitle>
                  <CardDescription>
                    Import questions from CSV/Excel or export existing questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={exportQuestions}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Questions to CSV
                  </Button>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      CSV format: Type, Difficulty, Question, Choice A, Choice B, Choice C, Choice D, Answer, Explanation VI, Explanation EN, Tags
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Question Templates</CardTitle>
                  <CardDescription>
                    Use templates to quickly create questions for specific TOEIC parts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Templates coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionBankSetup;
