import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Search, 
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExamHistory {
  id: string;
  examSetId: string;
  examSetTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  selectedParts: number[];
  timeMode: string;
}

interface ExamHistoryTableProps {
  examSetId: string;
  examSetTitle: string;
  onViewDetails: (sessionId: string) => void;
}

const ITEMS_PER_PAGE = 10;

const ExamHistoryTable: React.FC<ExamHistoryTableProps> = ({
  examSetId,
  examSetTitle,
  onViewDetails
}) => {
  const { toast } = useToast();
  const [histories, setHistories] = useState<ExamHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [partFilter, setPartFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'time'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch exam history
  const fetchExamHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('exam_sessions')
        .select(`
          id,
          exam_set_id,
          score,
          correct_answers,
          total_questions,
          time_spent,
          completed_at,
          results,
          exam_sets (title)
        `)
        .eq('user_id', user.id)
        .eq('exam_set_id', examSetId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const formattedHistories: ExamHistory[] = (data || []).map(session => ({
        id: session.id,
        examSetId: session.exam_set_id,
        examSetTitle: (session.exam_sets as any)?.title || examSetTitle,
        score: session.score,
        correctAnswers: session.correct_answers,
        totalQuestions: session.total_questions,
        timeSpent: session.time_spent,
        completedAt: session.completed_at,
        selectedParts: (session.results as any)?.selected_parts || [],
        timeMode: (session.results as any)?.time_mode || 'standard'
      }));

      setHistories(formattedHistories);
    } catch (error) {
      console.error('Error fetching exam history:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch sử làm bài",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [examSetId, examSetTitle, toast]);

  useEffect(() => {
    fetchExamHistory();
  }, [examSetId, fetchExamHistory]);

  // Filter and sort histories
  const filteredAndSortedHistories = useMemo(() => {
    let filtered = histories;

    // Search filter (using debounced term)
    if (debouncedSearchTerm) {
      filtered = filtered.filter(history => {
        const partsText = history.selectedParts.map(p => `Part ${p}`).join(' ');
        return partsText.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      });
    }

    // Part filter
    if (partFilter !== 'all') {
      const partNumber = parseInt(partFilter);
      filtered = filtered.filter(history => 
        history.selectedParts.includes(partNumber)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'time':
          comparison = a.timeSpent - b.timeSpent;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [histories, debouncedSearchTerm, partFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedHistories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHistories = filteredAndSortedHistories.slice(startIndex, endIndex);

  // Format time (memoized)
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Format date (memoized)
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }, []);

  // Get score color (memoized)
  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  // Handle sort
  const handleSort = (newSortBy: 'date' | 'score' | 'time') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, partFilter, sortBy, sortOrder]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Đang tải lịch sử làm bài...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (histories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử làm bài</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có lịch sử làm bài nào</p>
            <p className="text-sm">Hãy bắt đầu làm bài để xem lịch sử ở đây</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lịch sử làm bài</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchExamHistory}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo Part..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>
          
          <Select value={partFilter} onValueChange={setPartFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Part" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="1">Part 1</SelectItem>
              <SelectItem value="2">Part 2</SelectItem>
              <SelectItem value="3">Part 3</SelectItem>
              <SelectItem value="4">Part 4</SelectItem>
              <SelectItem value="5">Part 5</SelectItem>
              <SelectItem value="6">Part 6</SelectItem>
              <SelectItem value="7">Part 7</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'date' | 'score' | 'time') => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Ngày làm</SelectItem>
              <SelectItem value="score">Điểm số</SelectItem>
              <SelectItem value="time">Thời gian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Ngày làm
                    {sortBy === 'date' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center gap-2">
                    Kết quả
                    {sortBy === 'score' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('time')}
                >
                  <div className="flex items-center gap-2">
                    Thời gian làm bài
                    {sortBy === 'time' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHistories.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{formatDate(history.completedAt)}</div>
                      <div className="flex flex-wrap gap-1">
                        {history.selectedParts.map(part => (
                          <Badge key={part} variant="secondary" className="text-xs">
                            Luyện tập Part {part}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-semibold ${getScoreColor(history.score)}`}>
                      {history.correctAnswers}/{history.totalQuestions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ({history.score}%)
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{formatTime(history.timeSpent)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(history.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredAndSortedHistories.length)} trong tổng số {filteredAndSortedHistories.length} kết quả
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamHistoryTable;
