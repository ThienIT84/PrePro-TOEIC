import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ServiceFactory,
  QuestionService,
  ExamService,
  UserService,
  AnalyticsService,
  MediaService
} from './index';

/**
 * Demo component để show cách sử dụng Domain Services
 */
const DomainServicesDemo = () => {
  const [selectedService, setSelectedService] = useState<string>('question');
  const [results, setResults] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get services
  const questionService = ServiceFactory.getQuestionService();
  const examService = ServiceFactory.getExamService();
  const userService = ServiceFactory.getUserService();
  const analyticsService = ServiceFactory.getAnalyticsService();
  const mediaService = ServiceFactory.getMediaService();

  // Demo functions
  const demoQuestionService = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get questions
      const { data: questions, error: questionsError } = await questionService.getQuestions({
        part: 1,
        difficulty: 'easy',
        status: 'published'
      });

      if (questionsError) throw questionsError;

      // Get statistics
      const { data: stats, error: statsError } = await questionService.getQuestionsStats();
      if (statsError) throw statsError;

      // Search questions
      const { data: searchResults, error: searchError } = await questionService.searchQuestions('car');
      if (searchError) throw searchError;

      setResults({
        questions: questions?.slice(0, 5) || [], // Show first 5
        stats,
        searchResults: searchResults?.slice(0, 3) || [] // Show first 3
      });

    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoExamService = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get exam sets
      const { data: examSets, error: examSetsError } = await examService.getExamSets({
        type: 'practice',
        difficulty: 'medium'
      });

      if (examSetsError) throw examSetsError;

      // Get statistics
      const { data: stats, error: statsError } = await examService.getExamStats();
      if (statsError) throw statsError;

      setResults({
        examSets: examSets?.slice(0, 5) || [], // Show first 5
        stats
      });

    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoUserService = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get users
      const { data: users, error: usersError } = await userService.getProfiles();
      if (usersError) throw usersError;

      // Get students
      const { data: students, error: studentsError } = await userService.getStudents();
      if (studentsError) throw studentsError;

      // Get statistics
      const { data: stats, error: statsError } = await userService.getUserStats();
      if (statsError) throw statsError;

      setResults({
        users: users?.slice(0, 5) || [], // Show first 5
        students: students?.slice(0, 3) || [], // Show first 3
        stats
      });

    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoAnalyticsService = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get system stats
      const { data: systemStats, error: systemError } = await analyticsService.getSystemStats();
      if (systemError) throw systemError;

      // Get question analytics
      const { data: questionAnalytics, error: questionError } = await analyticsService.getQuestionAnalytics();
      if (questionError) throw questionError;

      // Get dashboard summary
      const { data: dashboard, error: dashboardError } = await analyticsService.getDashboardSummary();
      if (dashboardError) throw dashboardError;

      setResults({
        systemStats,
        questionAnalytics,
        dashboard
      });

    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoMediaService = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get storage stats
      const { data: storageStats, error: storageError } = await mediaService.getStorageStats();
      if (storageError) throw storageError;

      // List files
      const { data: files, error: filesError } = await mediaService.listFiles();
      if (filesError) throw filesError;

      setResults({
        storageStats,
        files: files?.slice(0, 10) || [] // Show first 10
      });

    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runDemo = () => {
    switch (selectedService) {
      case 'question':
        demoQuestionService();
        break;
      case 'exam':
        demoExamService();
        break;
      case 'user':
        demoUserService();
        break;
      case 'analytics':
        demoAnalyticsService();
        break;
      case 'media':
        demoMediaService();
        break;
      default:
        break;
    }
  };

  const serviceOptions = [
    { value: 'question', label: 'Question Service', description: 'Manage questions and validation' },
    { value: 'exam', label: 'Exam Service', description: 'Manage exam sets and sessions' },
    { value: 'user', label: 'User Service', description: 'Manage user profiles and roles' },
    { value: 'analytics', label: 'Analytics Service', description: 'Generate reports and statistics' },
    { value: 'media', label: 'Media Service', description: 'Handle file uploads and storage' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Domain Services Demo</h1>
      
      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Service to Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceOptions.map(option => (
              <div
                key={option.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedService === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedService(option.value)}
              >
                <h3 className="font-semibold">{option.label}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={runDemo} disabled={loading}>
              {loading ? 'Running...' : 'Run Demo'}
            </Button>
            <Button 
              onClick={() => {
                setResults(null);
                setError(null);
              }}
              variant="outline"
            >
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Running {serviceOptions.find(s => s.value === selectedService)?.label}...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600">
              <h3 className="font-semibold">Error:</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>
              Results from {serviceOptions.find(s => s.value === selectedService)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Available Services:</h3>
              <ul className="space-y-1 text-sm">
                <li>• QuestionService - CRUD operations for questions</li>
                <li>• ExamService - CRUD operations for exam sets</li>
                <li>• UserService - CRUD operations for user profiles</li>
                <li>• AnalyticsService - Generate reports and statistics</li>
                <li>• MediaService - Handle file uploads and storage</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Features:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Type-safe operations with TypeScript</li>
                <li>• Built-in validation using models</li>
                <li>• Consistent error handling</li>
                <li>• Singleton pattern for performance</li>
                <li>• Easy to test and mock</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Usage Example:</h3>
            <pre className="text-sm">
{`import { ServiceFactory } from '@/services/domains';

const questionService = ServiceFactory.getQuestionService();
const { data, error } = await questionService.getQuestions({
  part: 1,
  difficulty: 'easy'
});`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainServicesDemo;
