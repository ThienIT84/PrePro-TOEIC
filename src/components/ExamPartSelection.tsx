import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  FileText,
  Headphones,
  MessageSquare,
  Users,
  FileCheck,
  CheckCircle,
  BookOpen,
  Target,
  Zap,
  Timer,
  Infinity as InfinityIcon
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TimeMode, TimeModeConfig } from '@/types';

interface ExamSet {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'inactive';
}

interface PartInfo {
  part: number;
  name: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  icon: React.ReactNode;
  color: string;
  type: 'listening' | 'reading';
}

const ExamPartSelection = () => {
  const { examSetId } = useParams<{ examSetId: string }>();
  const navigate = useNavigate();
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [isFullTest, setIsFullTest] = useState(false);
  const [timeMode, setTimeMode] = useState<TimeMode>('standard');

  const timeModeConfigs: TimeModeConfig[] = [
    {
      mode: 'standard',
      label: 'Chuẩn TOEIC',
      description: 'Thời gian giới hạn theo chuẩn TOEIC thực tế',
      icon: 'Timer'
    },
    {
      mode: 'unlimited',
      label: 'Tự do',
      description: 'Không giới hạn thời gian, phù hợp cho luyện tập',
      icon: 'Infinity'
    }
  ];

  const partConfigs: PartInfo[] = [
    {
      part: 1,
      name: 'Part 1: Photos',
      description: 'Mô tả hình ảnh',
      questionCount: 6,
      timeLimit: 5,
      icon: <Headphones className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      type: 'listening'
    },
    {
      part: 2,
      name: 'Part 2: Question-Response',
      description: 'Hỏi đáp ngắn',
      questionCount: 25,
      timeLimit: 20,
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      type: 'listening'
    },
    {
      part: 3,
      name: 'Part 3: Conversations',
      description: 'Hội thoại ngắn',
      questionCount: 39,
      timeLimit: 30,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      type: 'listening'
    },
    {
      part: 4,
      name: 'Part 4: Talks',
      description: 'Bài nói dài',
      questionCount: 30,
      timeLimit: 25,
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      type: 'listening'
    },
    {
      part: 5,
      name: 'Part 5: Incomplete Sentences',
      description: 'Hoàn thành câu',
      questionCount: 30,
      timeLimit: 15,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      type: 'reading'
    },
    {
      part: 6,
      name: 'Part 6: Text Completion',
      description: 'Hoàn thành đoạn văn',
      questionCount: 16,
      timeLimit: 10,
      icon: <FileCheck className="h-5 w-5" />,
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      type: 'reading'
    },
    {
      part: 7,
      name: 'Part 7: Reading Comprehension',
      description: 'Đọc hiểu',
      questionCount: 54,
      timeLimit: 45,
      icon: <BookOpen className="h-5 w-5" />,
      color: 'bg-red-100 text-red-800 border-red-200',
      type: 'reading'
    }
  ];

  useEffect(() => {
    if (examSetId) {
      fetchExamSet();
    }
  }, [examSetId]);

  const fetchExamSet = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('id', examSetId)
        .single();

      if (error) throw error;
      setExamSet(data as any);
    } catch (error) {
      console.error('Error fetching exam set:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin đề thi',
        variant: 'destructive'
      });
      navigate('/exam-sets');
    } finally {
      setLoading(false);
    }
  };

  const handlePartToggle = (part: number) => {
    if (isFullTest) return; // Can't toggle parts when full test is selected
    
    setSelectedParts(prev => {
      if (prev.includes(part)) {
        return prev.filter(p => p !== part);
      } else {
        return [...prev, part];
      }
    });
  };

  const handleFullTestToggle = () => {
    setIsFullTest(!isFullTest);
    if (!isFullTest) {
      setSelectedParts([]);
    }
  };

  const handleStartExam = () => {
    if (isFullTest) {
      // Start full test with all parts
      navigate(`/exam-sets/${examSetId}/take`, {
        state: {
          type: 'full',
          parts: [1, 2, 3, 4, 5, 6, 7],
          examSet: examSet,
          timeMode: timeMode
        }
      });
    } else if (selectedParts.length > 0) {
      // Start custom test with selected parts
      navigate(`/exam-sets/${examSetId}/take`, {
        state: {
          type: 'custom',
          parts: selectedParts,
          examSet: examSet,
          timeMode: timeMode
        }
      });
    } else {
      toast({
        title: 'Chọn Part',
        description: 'Vui lòng chọn ít nhất một Part hoặc chọn "Làm hết"',
        variant: 'destructive'
      });
    }
  };

  const getTotalQuestions = () => {
    if (isFullTest) {
      return partConfigs.reduce((sum, part) => sum + part.questionCount, 0);
    }
    return selectedParts.reduce((sum, part) => {
      const partConfig = partConfigs.find(p => p.part === part);
      return sum + (partConfig?.questionCount || 0);
    }, 0);
  };

  const getTotalTime = () => {
    if (timeMode === 'unlimited') {
      return 'Không giới hạn';
    }
    if (isFullTest) {
      return partConfigs.reduce((sum, part) => sum + part.timeLimit, 0);
    }
    return selectedParts.reduce((sum, part) => {
      const partConfig = partConfigs.find(p => p.part === part);
      return sum + (partConfig?.timeLimit || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!examSet) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy đề thi</h2>
            <p className="text-muted-foreground mb-4">
              Đề thi bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Button onClick={() => navigate('/exam-sets')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách đề thi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/exam-sets')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{examSet.title}</h1>
            <p className="text-muted-foreground mb-4">{examSet.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{examSet.total_questions} câu hỏi</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{examSet.time_limit} phút</span>
              </div>
              <Badge variant="outline">
                {examSet.difficulty === 'easy' ? 'Dễ' : 
                 examSet.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Time Mode Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Chế độ thời gian
          </CardTitle>
          <CardDescription>
            Chọn cách thức tính thời gian cho bài thi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={timeMode} onValueChange={(value: TimeMode) => setTimeMode(value)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeModeConfigs.map((config) => {
                const IconComponent = config.icon === 'Timer' ? Timer : InfinityIcon;
                return (
                  <div key={config.mode} className="flex items-center space-x-3">
                    <RadioGroupItem value={config.mode} id={config.mode} />
                    <Label 
                      htmlFor={config.mode} 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{config.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {config.description}
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Full Test Option */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${isFullTest ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Làm hết đề thi</h3>
                <p className="text-muted-foreground">
                  Làm tất cả 7 Parts (200 câu hỏi, {timeMode === 'unlimited' ? 'không giới hạn thời gian' : '150 phút'})
                </p>
              </div>
            </div>
            <Button
              variant={isFullTest ? "default" : "outline"}
              onClick={handleFullTestToggle}
              className="min-w-[120px]"
            >
              {isFullTest ? 'Đã chọn' : 'Chọn'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Part Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Hoặc chọn Part cụ thể</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partConfigs.map((part) => {
            const isSelected = selectedParts.includes(part.part);
            const isDisabled = isFullTest;
            
            return (
              <Card 
                key={part.part}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-primary border-primary' 
                    : isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => !isDisabled && handlePartToggle(part.part)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${part.color}`}>
                        {part.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{part.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {part.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{part.questionCount} câu</span>
                          <span>{timeMode === 'unlimited' ? 'Không giới hạn' : `${part.timeLimit} phút`}</span>
                          <Badge variant="outline" className="text-xs">
                            {part.type === 'listening' ? 'Listening' : 'Reading'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-muted'
                    }`}>
                      {isSelected && <CheckCircle className="h-4 w-4" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Summary and Start Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isFullTest ? 'Full Test' : 'Custom Test'}
              </h3>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{getTotalQuestions()} câu hỏi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{typeof getTotalTime() === 'string' ? getTotalTime() : `${getTotalTime()} phút`}</span>
                </div>
                {!isFullTest && selectedParts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span>Parts: {selectedParts.sort().join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={handleStartExam}
              disabled={!isFullTest && selectedParts.length === 0}
              size="lg"
              className="min-w-[160px]"
            >
              <Play className="h-4 w-4 mr-2" />
              Bắt đầu làm bài
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamPartSelection;

