import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface GrammarPattern {
  sentence: string;
  correct: string;
  wrong: string[];
  rule: string;
}

interface GrammarTopic {
  topic: string;
  patterns: GrammarPattern[];
}

interface GrammarTopicsDisplayProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

const GrammarTopicsDisplay: React.FC<GrammarTopicsDisplayProps> = ({ difficulty }) => {
  const grammarTopics = {
    easy: [
      {
        topic: 'Present Simple',
        patterns: [
          { sentence: 'She _____ to work every day.', correct: 'goes', wrong: ['go', 'going', 'gone'], rule: 'Chủ ngữ số ít cần động từ thêm -s' },
          { sentence: 'They _____ English well.', correct: 'speak', wrong: ['speaks', 'speaking', 'spoken'], rule: 'Chủ ngữ số nhiều không thêm -s' },
          { sentence: 'The meeting _____ at 9 AM.', correct: 'starts', wrong: ['start', 'starting', 'started'], rule: 'Sự kiện theo lịch trình dùng hiện tại đơn' }
        ]
      },
      {
        topic: 'Articles',
        patterns: [
          { sentence: 'I need _____ umbrella.', correct: 'an', wrong: ['a', 'the', ''], rule: 'Umbrella bắt đầu bằng nguyên âm nên dùng "an"' },
          { sentence: '_____ sun is bright today.', correct: 'The', wrong: ['A', 'An', ''], rule: 'Sự vật duy nhất dùng "the"' },
          { sentence: 'She is _____ teacher.', correct: 'a', wrong: ['an', 'the', ''], rule: 'Nghề nghiệp không xác định dùng "a"' }
        ]
      },
      {
        topic: 'Basic Prepositions',
        patterns: [
          { sentence: 'The book is _____ the table.', correct: 'on', wrong: ['in', 'at', 'by'], rule: 'Vị trí trên bề mặt dùng "on"' },
          { sentence: 'She works _____ the office.', correct: 'in', wrong: ['on', 'at', 'by'], rule: 'Bên trong tòa nhà dùng "in"' },
          { sentence: 'I will meet you _____ 3 PM.', correct: 'at', wrong: ['in', 'on', 'by'], rule: 'Thời gian cụ thể dùng "at"' }
        ]
      }
    ],
    medium: [
      {
        topic: 'Present Perfect',
        patterns: [
          { sentence: 'I _____ this compunknown for 5 years.', correct: 'have worked', wrong: ['work', 'am working', 'worked'], rule: 'Khoảng thời gian dùng present perfect' },
          { sentence: 'She _____ never _____ to Japan.', correct: 'has been', wrong: ['have been', 'is being', 'was being'], rule: 'Kinh nghiệm dùng present perfect' },
          { sentence: '_____ you _____ the report yet?', correct: 'Have finished', wrong: ['Did finish', 'Are finishing', 'Will finish'], rule: 'Câu hỏi về hành động hoàn thành' }
        ]
      },
      {
        topic: 'Conditionals',
        patterns: [
          { sentence: 'If I _____ you, I would accept the offer.', correct: 'were', wrong: ['am', 'was', 'be'], rule: 'Câu điều kiện loại 2 dùng "were" cho tất cả ngôi' },
          { sentence: 'If it _____ tomorrow, we will cancel the trip.', correct: 'rains', wrong: ['rain', 'will rain', 'rained'], rule: 'Câu điều kiện loại 1 dùng hiện tại đơn' },
          { sentence: 'If I _____ harder, I would have passed the exam.', correct: 'had studied', wrong: ['studied', 'study', 'would study'], rule: 'Câu điều kiện loại 3 dùng past perfect' }
        ]
      },
      {
        topic: 'Passive Voice',
        patterns: [
          { sentence: 'The report _____ by the manager yesterday.', correct: 'was written', wrong: ['was writing', 'wrote', 'has written'], rule: 'Câu bị động quá khứ: was/were + past participle' },
          { sentence: 'The meeting _____ next week.', correct: 'will be held', wrong: ['will hold', 'holds', 'is holding'], rule: 'Câu bị động tương lai: will be + past participle' },
          { sentence: 'The project _____ by our team.', correct: 'is being completed', wrong: ['completes', 'completed', 'will complete'], rule: 'Câu bị động hiện tại tiếp diễn' }
        ]
      }
    ],
    hard: [
      {
        topic: 'Advanced Conditionals',
        patterns: [
          { sentence: 'Had I known about the meeting, I _____ attended.', correct: 'would have', wrong: ['would', 'had', 'have'], rule: 'Câu điều kiện loại 3 đảo ngữ: Had + S + past participle' },
          { sentence: 'Were I you, I _____ reconsider the offer.', correct: 'would', wrong: ['will', 'had', 'have'], rule: 'Câu điều kiện loại 2 đảo ngữ: Were + S + to V' },
          { sentence: 'Should you need help, _____ me immediately.', correct: 'call', wrong: ['calling', 'called', 'will call'], rule: 'Câu điều kiện loại 1 đảo ngữ: Should + S + V' }
        ]
      },
      {
        topic: 'Subjunctive Mood',
        patterns: [
          { sentence: 'I suggest that he _____ the proposal.', correct: 'submit', wrong: ['submits', 'submitted', 'submitting'], rule: 'Subjunctive mood: suggest that + S + V nguyên mẫu' },
          { sentence: 'It is important that she _____ on time.', correct: 'arrive', wrong: ['arrives', 'arrived', 'arriving'], rule: 'Subjunctive với tính từ quan trọng' },
          { sentence: 'I wish I _____ more time.', correct: 'had', wrong: ['have', 'will have', 'would have'], rule: 'Wish + past tense cho hiện tại' }
        ]
      },
      {
        topic: 'Complex Tenses',
        patterns: [
          { sentence: 'By next year, I _____ for this compunknown for 10 years.', correct: 'will have worked', wrong: ['will work', 'work', 'am working'], rule: 'Future perfect: will have + past participle' },
          { sentence: 'She _____ English for 3 years before moving to the US.', correct: 'had been studying', wrong: ['studied', 'was studying', 'has studied'], rule: 'Past perfect continuous: had been + V-ing' },
          { sentence: 'I _____ this book for 2 hours when you called.', correct: 'had been reading', wrong: ['read', 'was reading', 'have read'], rule: 'Past perfect continuous với khoảng thời gian' }
        ]
      }
    ]
  };

  const topics = grammarTopics[difficulty];
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    hard: 'bg-red-100 text-red-800 border-red-200'
  };

  const difficultyIcons = {
    easy: <CheckCircle className="h-4 w-4" />,
    medium: <AlertCircle className="h-4 w-4" />,
    hard: <Star className="h-4 w-4" />
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Grammar Topics - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level</h2>
        <Badge className={`${difficultyColors[difficulty]} flex items-center gap-1`}>
          {difficultyIcons[difficulty]}
          {difficulty.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6">
        {topics.map((topic, topicIndex) => (
          <Card key={topicIndex} className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg">{topic.topic}</CardTitle>
              <CardDescription>
                {topic.patterns.length} example patterns available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topic.patterns.map((pattern, patternIndex) => (
                  <div key={patternIndex} className="p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-3">
                      <div className="font-medium text-sm">
                        <span className="text-muted-foreground">Question:</span> {pattern.sentence}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-green-600">✓ Correct:</span>
                          <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-sm font-mono">
                            {pattern.correct}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-red-600">✗ Wrong options:</span>
                          <div className="mt-1 space-y-1">
                            {pattern.wrong.map((wrong, wrongIndex) => (
                              <div key={wrongIndex} className="p-1 bg-red-50 border border-red-200 rounded text-xs font-mono">
                                {wrong}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Rule:</span> {pattern.rule}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">How to use these patterns</h3>
              <p className="text-sm text-blue-700 mt-1">
                These grammar patterns are automatically used when generating grammar questions. 
                The system will randomly select patterns from the appropriate difficulty level 
                and create multiple choice questions with detailed explanations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrammarTopicsDisplay;
