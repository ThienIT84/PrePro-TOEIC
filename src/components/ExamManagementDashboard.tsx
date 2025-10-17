import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Play,
  Users,
  Clock,
  Target,
  BarChart3,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ExamSet {
  id: string;
  title: string;
  description: string;
  type: 'full' | 'mini' | 'custom';
  total_questions: number;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  status: 'draft' | 'active' | 'inactive';
  created_by: string;
  created_at: string;
  updated_at: string;
  // Statistics
  total_attempts?: number;
  average_score?: number;
  completion_rate?: number;
  average_time_spent?: number;
}

interface ExamStatistics {
  totalExamSets: number;
  activeExamSets: number;
  totalAttempts: number;
  averageScore: number;
  totalQuestions: number;
}

const ExamManagementDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [statistics, setStatistics] = useState<ExamStatistics>({
    totalExamSets: 0,
    activeExamSets: 0,
    totalAttempts: 0,
    averageScore: 0,
    totalQuestions: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchExamSets();
      fetchStatistics();
    }
  }, [user]);

  const fetchExamSets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select(`
          *,
          exam_statistics (
            total_attempts,
            average_score,
            completion_rate,
            average_time_spent
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const examSetsWithStats = (data?.map(examSet => ({
        ...examSet,
        total_questions: examSet.question_count || 0,
        status: examSet.is_active ? 'active' : 'inactive',
        total_attempts: examSet.exam_statistics?.[0]?.total_attempts || 0,
        average_score: examSet.exam_statistics?.[0]?.average_score || 0,
        completion_rate: examSet.exam_statistics?.[0]?.completion_rate || 0,
        average_time_spent: examSet.exam_statistics?.[0]?.average_time_spent || 0
      })) || []) as ExamSet[];

      setExamSets(examSetsWithStats);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // Get exam sets statistics
      const { data: examData, error: examError } = await supabase
        .from('exam_sets')
        .select('id, is_active, question_count');

      if (examError) throw examError;

      // Get exam sessions statistics
      const { data: sessionData, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('score, status, exam_set_id');

      if (sessionError) throw sessionError;

      const totalExamSets = examData?.length || 0;
      const activeExamSets = examData?.filter(e => e.is_active).length || 0;
      const totalAttempts = sessionData?.length || 0;
      const completedSessions = sessionData?.filter(s => s.status === 'completed') || [];
      const averageScore = completedSessions.length > 0 
        ? completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length 
        : 0;
      const totalQuestions = examData?.reduce((sum, e) => sum + e.question_count, 0) || 0;

      setStatistics({
        totalExamSets,
        activeExamSets,
        totalAttempts,
        averageScore,
        totalQuestions
      });

    } catch (error: unknown) {
      console.error('Error fetching statistics:', error);
    }
  };

  const deleteExamSet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exam_sets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Exam set deleted successfully",
      });

      fetchExamSets();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const toggleExamStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? false : true;
      
      const { error } = await supabase
        .from('exam_sets')
        .update({ is_active: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Exam set ${newStatus ? 'activated' : 'deactivated'}`,
      });

      fetchExamSets();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const filteredExamSets = examSets.filter(examSet => {
    const matchesSearch = (examSet.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (examSet.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || examSet.status === filterStatus;
    const matchesType = filterType === 'all' || examSet.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return <FileText className="h-4 w-4" />;
      case 'mini':
        return <Clock className="h-4 w-4" />;
      case 'custom':
        return <Target className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exam Management</h1>
          <p className="text-muted-foreground">
            Manage TOEIC exam sets and track performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              // Navigate to create exam page
              window.location.href = '/exam-sets';
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Exam Set
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exam Sets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalExamSets}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.activeExamSets} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all exams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              In all exam sets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.activeExamSets}</div>
            <p className="text-xs text-muted-foreground">
              Available to students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="exams">Exam Sets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Exam Sets */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Exam Sets</CardTitle>
                <CardDescription>
                  Latest exam sets created
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {examSets.slice(0, 5).map((examSet) => (
                    <div key={examSet.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(examSet.type)}
                        <div>
                          <div className="font-medium text-sm">{examSet.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {examSet.total_questions} questions • {examSet.time_limit}m
                          </div>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(examSet.status)}`}>
                        {examSet.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Key metrics across all exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Score</span>
                    <span className="font-medium">{statistics.averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Attempts</span>
                    <span className="font-medium">{statistics.totalAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Exams</span>
                    <span className="font-medium">{statistics.activeExamSets}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Questions</span>
                    <span className="font-medium">{statistics.totalQuestions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exam Sets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exam sets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full">Full TOEIC</SelectItem>
                    <SelectItem value="mini">Mini TOEIC</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterType('all');
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Exam Sets List */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading exam sets...</p>
                </div>
              ) : filteredExamSets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No exam sets found matching your criteria
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredExamSets.map((examSet) => (
                    <div
                      key={examSet.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(examSet.type)}
                          <h3 className="font-medium truncate">{examSet.title}</h3>
                          <Badge className={`text-xs ${getStatusColor(examSet.status)}`}>
                            {examSet.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {examSet.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {examSet.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{examSet.total_questions} questions</span>
                          <span>{examSet.time_limit} minutes</span>
                          <span>{examSet.difficulty} difficulty</span>
                          <span>{examSet.total_attempts || 0} attempts</span>
                          <span>Avg: {(examSet.average_score || 0).toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Preview exam set
                            console.log('Preview exam set:', examSet);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Edit exam set
                            window.location.href = `/exam-sets/${examSet.id}/edit`;
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExamStatus(examSet.id, examSet.status)}
                        >
                          {examSet.status === 'active' ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExamSet(examSet.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamManagementDashboard;
