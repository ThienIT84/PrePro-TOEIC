/**
 * ExamManagementDashboardView
 * Pure UI component cho Exam Management Dashboard
 * Extracted từ ExamManagementDashboard.tsx
 */

import React from 'react';
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
import { ExamSet, ExamStatistics } from '../controllers/exam/ExamManagementDashboardController';

export interface ExamManagementDashboardViewProps {
  // State
  activeTab: string;
  examSets: ExamSet[];
  statistics: ExamStatistics;
  loading: boolean;
  searchTerm: string;
  filterStatus: string;
  filterType: string;

  // Actions
  onSetActiveTab: (tab: string) => void;
  onSetSearchTerm: (term: string) => void;
  onSetFilterStatus: (status: string) => void;
  onSetFilterType: (type: string) => void;
  onClearFilters: () => void;
  onDeleteExamSet: (id: string) => Promise<void>;
  onToggleExamStatus: (id: string, currentStatus: string) => Promise<void>;
  onCreateExamSet: () => void;
  onPreviewExamSet: (examSet: ExamSet) => void;
  onEditExamSet: (id: string) => void;

  // Utility functions
  getFilteredExamSets: () => ExamSet[];
  getStatusColor: (status: string) => string;
  getTypeIconName: (type: string) => string;
  getRecentExamSets: (limit?: number) => ExamSet[];

  // Props
  className?: string;
}

const ExamManagementDashboardView: React.FC<ExamManagementDashboardViewProps> = ({
  activeTab,
  examSets,
  statistics,
  loading,
  searchTerm,
  filterStatus,
  filterType,
  onSetActiveTab,
  onSetSearchTerm,
  onSetFilterStatus,
  onSetFilterType,
  onClearFilters,
  onDeleteExamSet,
  onToggleExamStatus,
  onCreateExamSet,
  onPreviewExamSet,
  onEditExamSet,
  getFilteredExamSets,
  getStatusColor,
  getTypeIconName,
  getRecentExamSets,
  className = ''
}) => {
  const filteredExamSets = getFilteredExamSets();
  const recentExamSets = getRecentExamSets(5);

  const getTypeIcon = (type: string) => {
    const iconName = getTypeIconName(type);
    switch (iconName) {
      case 'FileText':
        return <FileText className="h-4 w-4" />;
      case 'Clock':
        return <Clock className="h-4 w-4" />;
      case 'Target':
        return <Target className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exam Management</h1>
          <p className="text-muted-foreground">
            Manage TOEIC exam sets and track performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreateExamSet}>
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
      <Tabs value={activeTab} onValueChange={onSetActiveTab}>
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
                  {recentExamSets.map((examSet) => (
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
                    onChange={(e) => onSetSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterStatus} onValueChange={onSetFilterStatus}>
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

                <Select value={filterType} onValueChange={onSetFilterType}>
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

                <Button variant="outline" onClick={onClearFilters}>
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
                          onClick={() => onPreviewExamSet(examSet)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditExamSet(examSet.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleExamStatus(examSet.id, examSet.status)}
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
                          onClick={() => onDeleteExamSet(examSet.id)}
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
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics features coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamManagementDashboardView;
