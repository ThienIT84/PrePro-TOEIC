import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { TimeMode } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Play, Clock, Timer, Target, History } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toeicQuestionGenerator } from '@/services/toeicQuestionGenerator';
import ExamHistoryTable from '@/components/ExamHistoryTable';
import { supabase } from '@/integrations/supabase/client';

const PART_DETAILS: Record<number, { title: string; defaultCount: number; items: { name: string; count: number }[] }> = {
  1: { title: 'Part 1 - Photos', defaultCount: 6, items: [
    { name: 'Mô tả ảnh người', count: 2 },
    { name: 'Mô tả đồ vật/cảnh vật', count: 2 },
    { name: 'Khác', count: 2 },
  ]},
  2: { title: 'Part 2 - Question-Response', defaultCount: 25, items: [
    { name: 'Câu hỏi WH', count: 8 },
    { name: 'Yes/No', count: 8 },
    { name: 'Lựa chọn/khác', count: 9 },
  ]},
  3: { title: 'Part 3 - Conversations', defaultCount: 39, items: [
    { name: 'Hội thoại công sở', count: 20 },
    { name: 'Dịch vụ/khách hàng', count: 10 },
    { name: 'Khác', count: 9 },
  ]},
  4: { title: 'Part 4 - Talks', defaultCount: 30, items: [
    { name: 'Thông báo', count: 10 },
    { name: 'Hướng dẫn/giới thiệu', count: 10 },
    { name: 'Khác', count: 10 },
  ]},
  5: { title: 'Part 5 - Incomplete Sentences', defaultCount: 30, items: [
    { name: 'Ngữ pháp', count: 20 },
    { name: 'Từ vựng', count: 10 },
  ]},
  6: { title: 'Part 6 - Text Completion', defaultCount: 16, items: [
    { name: 'Điền từ đơn', count: 8 },
    { name: 'Ngữ pháp/ngữ nghĩa', count: 8 },
  ]},
  7: { title: 'Part 7 - Reading Comprehension', defaultCount: 54, items: [
    { name: 'Đoạn đơn', count: 28 },
    { name: 'Đoạn đôi', count: 16 },
    { name: 'Đoạn ba', count: 10 },
  ]},
};

const ExamCustomize = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { examSetId } = useParams<{ examSetId: string }>();
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [timeMode, setTimeMode] = useState<TimeMode>((location.state as any)?.timeMode || 'standard');
  const [showHistory, setShowHistory] = useState(true);
  const [examSet, setExamSet] = useState<any>(null);
  const [partQuestionCounts, setPartQuestionCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  // Fetch exam set data and question counts by part
  useEffect(() => {
    const fetchExamData = async () => {
      if (!examSetId) return;
      
      try {
        // Fetch exam set info
        const { data: examSetData, error: examSetError } = await supabase
          .from('exam_sets')
          .select('*')
          .eq('id', examSetId)
          .single();
        
        if (examSetError) throw examSetError;
        setExamSet(examSetData);

        // Fetch question counts by part
        const { data: questionsData, error: questionsError } = await supabase
          .from('exam_questions')
          .select(`
            question:questions(part)
          `)
          .eq('exam_set_id', examSetId);

        if (questionsError) throw questionsError;

        // Count questions by part
        const counts: Record<number, number> = {};
        questionsData.forEach((item: any) => {
          const part = item.question?.part;
          if (part) {
            counts[part] = (counts[part] || 0) + 1;
          }
        });
        
        setPartQuestionCounts(counts);
      } catch (error) {
        console.error('Error fetching exam data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examSetId]);

  const timeModeConfigs = [
    {
      mode: 'standard' as TimeMode,
      label: 'Chuẩn TOEIC',
      description: 'Thời gian giới hạn theo chuẩn TOEIC thực tế',
      icon: 'Timer'
    },
    {
      mode: 'unlimited' as TimeMode,
      label: 'Tự do',
      description: 'Không giới hạn thời gian, phù hợp cho luyện tập',
      icon: 'Infinity'
    }
  ];

  const totalMinutes = useMemo(() => {
    if (timeMode === 'unlimited') return 'Không giới hạn';
    if (!examSet) return 0;
    
    // Calculate time based on actual question count in exam set
    const totalQuestionsInSelectedParts = selectedParts.reduce((sum, p) => sum + (partQuestionCounts[p] || 0), 0);
    const timePerQuestion = examSet.time_limit / examSet.question_count;
    return Math.round(totalQuestionsInSelectedParts * timePerQuestion);
  }, [selectedParts, timeMode, examSet, partQuestionCounts]);

  const totalQuestions = useMemo(() => {
    return selectedParts.reduce((sum, p) => sum + (partQuestionCounts[p] || 0), 0);
  }, [selectedParts, partQuestionCounts]);

  const togglePart = (p: number) => {
    setSelectedParts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const start = () => {
    if (!examSetId || selectedParts.length === 0) return;
    navigate(`/exam-sets/${examSetId}/take`, { state: { parts: selectedParts, timeMode } });
  };

  const handleViewDetails = (sessionId: string) => {
    navigate(`/exam-result/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!examSet) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy đề thi</h2>
          <Button onClick={() => navigate('/exam-sets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(`/exam-sets/${examSetId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại đề thi
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{examSet.title}</h1>
            <p className="text-muted-foreground">
              {examSet.question_count} câu • {examSet.time_limit} phút • {examSet.difficulty}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
          </Button>
          <Badge> {totalQuestions} câu</Badge>
          <Badge> {typeof totalMinutes === 'string' ? totalMinutes : `${totalMinutes} phút`}</Badge>
          <Button disabled={selectedParts.length === 0} onClick={start}>
            <Play className="h-4 w-4 mr-2" /> Bắt đầu
          </Button>
        </div>
      </div>

      {/* Exam History Table */}
      {showHistory && examSetId && (
        <div className="mb-8">
          <ExamHistoryTable
            examSetId={examSetId}
            examSetTitle="Đề thi hiện tại"
            onViewDetails={handleViewDetails}
          />
        </div>
      )}

      {/* Time Mode Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Chế độ thời gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={timeMode} onValueChange={(value: TimeMode) => setTimeMode(value)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeModeConfigs.map((config) => {
                const IconComponent = config.icon === 'Timer' ? Timer : Target;
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

      {/* Quick Selection Buttons */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Chọn nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => setSelectedParts([1,2,3,4,5,6,7])}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Tất cả Part (1-7)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedParts([1,2,3,4])}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Listening (Part 1-4)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedParts([5,6,7])}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Reading (Part 5-7)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedParts([])}
              className="flex items-center gap-2"
            >
              Bỏ chọn tất cả
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6,7].map(p => {
          const actualCount = partQuestionCounts[p] || 0;
          const hasQuestions = actualCount > 0;
          const estimatedTime = timeMode === 'unlimited' ? 'Không giới hạn' : 
            examSet ? Math.round(actualCount * (examSet.time_limit / examSet.question_count)) : 0;
          
          return (
            <Card 
              key={p} 
              className={`${selectedParts.includes(p) ? 'border-primary' : ''} ${!hasQuestions ? 'opacity-50' : ''}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{PART_DETAILS[p].title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={hasQuestions ? "outline" : "secondary"}>
                      {actualCount} câu
                    </Badge>
                    <Badge variant="outline">
                      {typeof estimatedTime === 'string' ? estimatedTime : `${estimatedTime} phút`}
                    </Badge>
                    <Checkbox 
                      checked={selectedParts.includes(p)} 
                      onCheckedChange={() => togglePart(p)}
                      disabled={!hasQuestions}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {hasQuestions ? (
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {PART_DETAILS[p].items.map((it, idx) => (
                      <li key={idx}>{it.name} — khoảng {it.count} câu</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Không có câu hỏi trong đề này
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExamCustomize;


