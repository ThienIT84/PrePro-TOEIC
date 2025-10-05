import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Eye,
  Calendar,
  Trophy
} from 'lucide-react';

interface ExamHistoryItem {
  id: string;
  exam_set_id: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  time_spent: number;
  completed_at: string;
  exam_sets: {
    title: string;
    description: string | null;
  } | null;
}

const ExamHistory = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExamHistory();
  }, []);

  const fetchExamHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Không thể xác thực người dùng');
        return;
      }

      const { data, error } = await supabase
        .from('exam_sessions')
        .select(`
          id,
          exam_set_id,
          total_questions,
          correct_answers,
          score,
          time_spent,
          completed_at,
          exam_sets (title, description)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching exam history:', error);
        setError('Không thể tải lịch sử bài thi');
        return;
      }

      setExams(data || []);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg text-muted-foreground">Đang tải lịch sử...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch sử bài thi</h1>
          <p className="text-muted-foreground">
            Xem lại các bài thi bạn đã hoàn thành
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại Dashboard
        </Button>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Chưa có bài thi nào</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Bạn chưa hoàn thành bài thi nào. Hãy thử làm một bài thi để xem kết quả tại đây!
            </p>
            <Button onClick={() => navigate('/exam-sets')}>
              <Trophy className="h-4 w-4 mr-2" />
              Chọn bài thi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {exam.exam_sets?.title || 'Bài thi'}
                    </CardTitle>
                    {exam.exam_sets?.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {exam.exam_sets.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(exam.score)}`}>
                      {exam.score}%
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {exam.correct_answers}/{exam.total_questions} câu đúng
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(exam.completed_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(exam.time_spent)}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/exam-result/${exam.id}`)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamHistory;
