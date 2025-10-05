import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  useQuestionsStore, 
  useUserStore, 
  useUIStore, 
  useStoreManager 
} from '@/stores';
import { QuestionModel } from '@/models/entities';

/**
 * Demo component để show cách sử dụng Global State Management
 */
const GlobalStateDemo = () => {
  const {
    questions,
    loading,
    error,
    loadQuestions,
    createQuestion,
    searchQuestions,
    getQuestionsStats
  } = useQuestionsStore();

  const {
    user,
    isAuthenticated,
    login,
    logout
  } = useUserStore();

  const {
    theme,
    language,
    sidebarOpen,
    toggleTheme,
    toggleLanguage,
    toggleSidebar
  } = useUIStore();

  const {
    storeManager,
    questionController
  } = useStoreManager();

  const [searchTerm, setSearchTerm] = React.useState('');

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Mock user login
  const handleLogin = () => {
    const mockUser = new QuestionModel({
      id: '1',
      part: 1,
      passage_id: null,
      blank_index: null,
      prompt_text: 'Mock user',
      choices: { A: '', B: '', C: '', D: '' },
      correct_choice: 'A',
      explain_vi: 'Mock user',
      explain_en: 'Mock user',
      tags: [],
      difficulty: 'easy',
      status: 'published',
      image_url: null,
      audio_url: null,
      transcript: null,
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    login(mockUser as any);
  };

  // Mock question creation
  const handleCreateQuestion = async () => {
    const mockQuestion = {
      part: 1,
      prompt_text: 'What do you see in the picture?',
      choices: { A: 'A car', B: 'A bus', C: 'A train', D: 'A plane' },
      correct_choice: 'A',
      explain_vi: 'Trong hình có một chiếc xe hơi',
      explain_en: 'There is a car in the picture',
      tags: ['demo'],
      difficulty: 'easy',
      status: 'published',
      image_url: 'https://example.com/image.jpg',
      audio_url: 'https://example.com/audio.mp3'
    };

    await createQuestion(mockQuestion);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const results = searchQuestions(term);
    console.log('Search results:', results);
  };

  // Get statistics
  const stats = getQuestionsStats();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Global State Management Demo</h1>
      
      {/* User State */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">USER</Badge>
            User State Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-600">Status:</div>
              <div className="font-medium">
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">User:</div>
              <div className="font-medium">
                {user ? user.prompt_text : 'None'}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isAuthenticated ? (
              <Button onClick={handleLogin}>Login</Button>
            ) : (
              <Button onClick={logout} variant="outline">Logout</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* UI State */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">UI</Badge>
            UI State Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Theme:</div>
              <div className="font-medium">{theme}</div>
              <Button size="sm" onClick={toggleTheme} className="mt-2">
                Toggle Theme
              </Button>
            </div>
            <div>
              <div className="text-sm text-gray-600">Language:</div>
              <div className="font-medium">{language}</div>
              <Button size="sm" onClick={toggleLanguage} className="mt-2">
                Toggle Language
              </Button>
            </div>
            <div>
              <div className="text-sm text-gray-600">Sidebar:</div>
              <div className="font-medium">{sidebarOpen ? 'Open' : 'Closed'}</div>
              <Button size="sm" onClick={toggleSidebar} className="mt-2">
                Toggle Sidebar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions State */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">QUESTIONS</Badge>
            Questions State Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Questions</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Valid for Exam</div>
                <div className="text-2xl font-bold">{stats.validForExam}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Needing Audio</div>
                <div className="text-2xl font-bold">{stats.needingAudio}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Needing Images</div>
                <div className="text-2xl font-bold">{stats.needingImages}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleCreateQuestion} disabled={loading}>
              {loading ? 'Creating...' : 'Create Sample Question'}
            </Button>
            <Button onClick={() => loadQuestions()} variant="outline">
              Reload Questions
            </Button>
          </div>

          {/* Search */}
          <div>
            <Label htmlFor="search">Search Questions</Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search questions..."
            />
          </div>

          {/* Status */}
          {loading && <div className="text-blue-600">Loading questions...</div>}
          {error && <div className="text-red-600">Error: {error}</div>}

          {/* Questions List */}
          <div>
            <h3 className="font-semibold mb-2">Questions ({questions.length})</h3>
            {questions.length === 0 ? (
              <div className="text-gray-500">No questions found</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {questions.map(question => (
                  <div key={question.id} className="border p-3 rounded text-sm">
                    <div className="font-medium">{question.getPartDisplayName()}</div>
                    <div className="text-gray-600">{question.prompt_text}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {question.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.status}
                      </Badge>
                      {question.needsAudio() && (
                        <Badge variant="outline" className="text-xs">
                          Audio
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Store Manager Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-orange-100 text-orange-800">STORE MANAGER</Badge>
            Store Manager Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Store Manager:</div>
              <div className="font-medium">
                {storeManager ? 'Initialized' : 'Not Initialized'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Question Controller:</div>
              <div className="font-medium">
                {questionController ? 'Available' : 'Not Available'}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 mb-2">Available Methods:</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• loadQuestions(filters?)</div>
              <div>• createQuestion(data)</div>
              <div>• updateQuestion(id, updates)</div>
              <div>• deleteQuestion(id)</div>
              <div>• searchQuestions(term)</div>
              <div>• getQuestionsStats()</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalStateDemo;
