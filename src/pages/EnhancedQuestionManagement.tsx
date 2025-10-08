import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  FileText,
  BookOpen,
  Headphones,
  FileImage,
  MoreHorizontal
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import OptimizedQuestionCreator from '@/components/OptimizedQuestionCreator';
import BulkOperations from '@/components/BulkOperations';
import type { Question } from '@/types';

interface QuestionFilters {
  search: string;
  type: string;
  difficulty: string;
  hasAudio: string;
  tags: string[];
  excludeSample: boolean;
}

const EnhancedQuestionManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<QuestionFilters>({
    search: '',
    type: 'all',
    difficulty: 'all',
    hasAudio: 'all',
    tags: [],
    excludeSample: false
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user, currentPage, filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('questions')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`question.ilike.%${filters.search}%,explain_vi.ilike.%${filters.search}%`);
      }
      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.difficulty !== 'all') {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.hasAudio === 'yes') {
        query = query.not('audio_url', 'is', null);
      } else if (filters.hasAudio === 'no') {
        query = query.is('audio_url', null);
      }

      // Pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      // Order by created_at desc
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      setQuestions(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      fetchQuestions();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .in('id', selectedQuestions);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedQuestions.length} questions deleted successfully`,
      });

      setSelectedQuestions([]);
      fetchQuestions();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(qId => qId !== id)
        : [...prev, id]
    );
  };

  const selectAllQuestions = () => {
    setSelectedQuestions(questions.map(q => q.id));
  };

  const deleteSampleQuestions = async () => {
    try {
      // Define keywords that indicate sample/test questions
      const sampleKeywords = [
        'sample question',
        'sample',
        'test question',
        'example question',
        'demo question',
        'placeholder',
        'lorem ipsum',
        'this is a test',
        'question for part',
        'sample for part'
      ];

      // Find questions containing these keywords
      const { data: sampleQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('id, question')
        .or(sampleKeywords.map(keyword => `question.ilike.%${keyword}%`).join(','));

      if (fetchError) throw fetchError;

      if (!sampleQuestions || sampleQuestions.length === 0) {
        toast({
          title: "No sample questions found",
          description: "No questions containing sample keywords were found.",
        });
        return;
      }

      // Delete all sample questions
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .in('id', sampleQuestions.map(q => q.id));

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: `${sampleQuestions.length} sample questions deleted successfully`,
      });

      fetchQuestions();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearSelection = () => {
    setSelectedQuestions([]);
  };

  const findSampleQuestions = async () => {
    try {
      const sampleKeywords = [
        'sample question',
        'sample',
        'test question',
        'example question',
        'demo question',
        'placeholder',
        'lorem ipsum',
        'this is a test',
        'question for part',
        'sample for part'
      ];

      const { data: sampleQuestions, error } = await supabase
        .from('questions')
        .select('id, question, type, difficulty')
        .or(sampleKeywords.map(keyword => `question.ilike.%${keyword}%`).join(','));

      if (error) throw error;

      if (!sampleQuestions || sampleQuestions.length === 0) {
        toast({
          title: "No sample questions found",
          description: "No questions containing sample keywords were found.",
        });
        return;
      }

      // Auto-select sample questions
      setSelectedQuestions(sampleQuestions.map(q => q.id));

      toast({
        title: "Sample questions found",
        description: `Found ${sampleQuestions.length} sample questions. They have been selected for deletion.`,
      });

    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredQuestions = questions.filter(question => {
    if (filters.search && !question.question.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type !== 'all' && question.type !== filters.type) {
      return false;
    }
    if (filters.difficulty !== 'all' && question.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.hasAudio === 'yes' && !question.audio_url) {
      return false;
    }
    if (filters.hasAudio === 'no' && question.audio_url) {
      return false;
    }
    
    // Exclude sample questions if filter is enabled
    if (filters.excludeSample) {
      const sampleKeywords = [
        'sample question',
        'sample',
        'test question',
        'example question',
        'demo question',
        'placeholder',
        'lorem ipsum',
        'this is a test',
        'question for part',
        'sample for part'
      ];
      
      const isSampleQuestion = sampleKeywords.some(keyword => 
        question.question.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isSampleQuestion) {
        return false;
      }
    }
    
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listening':
        return <Headphones className="h-4 w-4" />;
      case 'reading':
        return <BookOpen className="h-4 w-4" />;
      case 'vocab':
        return <FileText className="h-4 w-4" />;
      case 'grammar':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Management</h1>
          <p className="text-muted-foreground">
            Manage your TOEIC question bank efficiently
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab('create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Question
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('bulk')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Operations
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Audio</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.audio_url).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listening</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.type === 'listening').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.type === 'reading').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">Question List</TabsTrigger>
          <TabsTrigger value="create">Create Question</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>

                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vocab">Vocabulary</SelectItem>
                    <SelectItem value="grammar">Grammar</SelectItem>
                    <SelectItem value="listening">Listening</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.hasAudio} onValueChange={(value) => setFilters(prev => ({ ...prev, hasAudio: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Audio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">With Audio</SelectItem>
                    <SelectItem value="no">No Audio</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="exclude-sample" 
                    checked={filters.excludeSample}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, excludeSample: !!checked }))}
                  />
                  <label 
                    htmlFor="exclude-sample" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Exclude Sample Questions
                  </label>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    search: '',
                    type: 'all',
                    difficulty: 'all',
                    hasAudio: 'all',
                    tags: [],
                    excludeSample: false
                  })}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedQuestions.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedQuestions.length} questions selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={findSampleQuestions}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Find Sample Questions
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteSampleQuestions}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All Sample Questions
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteSelectedQuestions}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllQuestions}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading questions...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No questions found matching your criteria
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredQuestions.map((question) => (
                    <div
                      key={question.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 ${
                        selectedQuestions.includes(question.id) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => toggleQuestionSelection(question.id)}
                        className="rounded"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(question.type)}
                          <Badge variant="outline" className="text-xs">
                            {question.type}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </Badge>
                          {question.audio_url && (
                            <Badge variant="secondary" className="text-xs">
                              <Headphones className="h-3 w-3 mr-1" />
                              Audio
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate">
                          {question.question}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Answer: {question.answer} • Created: {new Date(question.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Preview functionality
                            console.log('Preview question:', question);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Edit functionality
                            console.log('Edit question:', question);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <OptimizedQuestionCreator
            onQuestionCreated={() => {
              fetchQuestions();
              setActiveTab('list');
            }}
          />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkOperations
            onQuestionsImported={() => {
              fetchQuestions();
              setActiveTab('list');
            }}
          />
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Manage question templates for faster creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Template management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedQuestionManagement;
