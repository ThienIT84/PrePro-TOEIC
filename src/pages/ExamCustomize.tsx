import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Play } from 'lucide-react';
import { toeicQuestionGenerator } from '@/services/toeicQuestionGenerator';

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
  const { examSetId } = useParams<{ examSetId: string }>();
  const [selectedParts, setSelectedParts] = useState<number[]>([]);

  const totalMinutes = useMemo(() => {
    return (selectedParts.length === 0 ? 0 : selectedParts.reduce((sum, p) => sum + (toeicQuestionGenerator.getPartConfig(p)?.timeLimit || 0), 0));
  }, [selectedParts]);

  const totalQuestions = useMemo(() => {
    return (selectedParts.length === 0 ? 0 : selectedParts.reduce((sum, p) => sum + (PART_DETAILS[p]?.defaultCount || 0), 0));
  }, [selectedParts]);

  const togglePart = (p: number) => {
    setSelectedParts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const start = () => {
    if (!examSetId || selectedParts.length === 0) return;
    navigate(`/exam-sets/${examSetId}/take`, { state: { parts: selectedParts } });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(`/exam-sets/${examSetId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại đề thi
          </Button>
          <h1 className="text-2xl font-bold">Chọn Part trong đề</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge> {totalQuestions} câu</Badge>
          <Badge> {totalMinutes} phút</Badge>
          <Button disabled={selectedParts.length === 0} onClick={start}>
            <Play className="h-4 w-4 mr-2" /> Bắt đầu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6,7].map(p => (
          <Card key={p} className={selectedParts.includes(p) ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{PART_DETAILS[p].title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{PART_DETAILS[p].defaultCount} câu</Badge>
                  <Badge variant="outline">{toeicQuestionGenerator.getPartConfig(p)?.timeLimit} phút</Badge>
                  <Checkbox checked={selectedParts.includes(p)} onCheckedChange={() => togglePart(p)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {PART_DETAILS[p].items.map((it, idx) => (
                  <li key={idx}>{it.name} — khoảng {it.count} câu</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExamCustomize;


