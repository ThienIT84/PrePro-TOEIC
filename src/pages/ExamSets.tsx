import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Play, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Target,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import EnhancedExamSetCreator from '@/components/EnhancedExamSetCreator';
import { useNavigate } from 'react-router-dom';

interface ExamSet {
  id: string;
  title: string;
  description: string | null;
  type: 'vocab' | 'grammar' | 'listening' | 'reading' | 'mix';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  question_count: number;
  time_limit: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const ExamSets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage');
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  useEffect(() => {
    fetchExamSets();
  }, []);

  const fetchExamSets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExamSets(data || []);
    } catch (error) {
      console.error('Error fetching exam sets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch exam sets.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExamSet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exam_sets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Exam set deleted successfully.'
      });

      fetchExamSets();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete exam set.',
        variant: 'destructive'
      });
    }
  };

  const handleStartExam = (examSetId: string) => {
    // Always go to customize page first so students can choose parts
    navigate(`/exam-sets/${examSetId}/customize`);
  };

  const filteredExamSets = examSets.filter(examSet => {
    const matchesSearch = examSet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (examSet.description && examSet.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || examSet.type === filterType;
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && examSet.is_active) ||
                         (filterActive === 'inactive' && !examSet.is_active);
    
    return matchesSearch && matchesType && matchesActive;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Target className="h-4 w-4" />;
      case 'mini': return <BookOpen className="h-4 w-4" />;
      case 'custom': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Exam Sets</h1>
        <p className="text-muted-foreground">
          Quản lý và thi các đề thi TOEIC
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Quản lý đề thi
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo đề thi
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Lịch sử thi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-6 space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search exam sets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full">Full TOEIC</SelectItem>
                    <SelectItem value="mini">Mini TOEIC</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterActive} onValueChange={setFilterActive}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Exam Sets List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading exam sets...</p>
            </div>
          ) : filteredExamSets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {examSets.length === 0 ? 'No exam sets found' : 'No exam sets match your filters'}
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Exam Set
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredExamSets.map((examSet) => (
                <Card key={examSet.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getTypeIcon(examSet.type)}
                          <h3 className="text-lg font-semibold">{examSet.title}</h3>
                          <Badge className={getStatusColor(examSet.is_active)}>
                            {examSet.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{examSet.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {examSet.question_count} questions
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {examSet.time_limit} minutes
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {examSet.difficulty}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {examSet.is_active && (
                          <Button 
                            onClick={() => handleStartExam(examSet.id)}
                            className="bg-green-600 hover:bg-green-700"
                            title="Bắt đầu làm bài thi"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start Exam
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/exam-selection/${examSet.id}`)}
                          title="Xem chi tiết đề thi"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/exam-sets/${examSet.id}/questions`)}
                          title="Quản lý câu hỏi"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteExamSet(examSet.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Xóa đề thi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <EnhancedExamSetCreator />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Exam History</CardTitle>
              <CardDescription>
                View your past exam attempts and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exam history yet. Take an exam to see your results here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamSets;