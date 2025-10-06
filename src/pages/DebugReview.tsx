import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DebugReview = () => {
  const { user, loading: authLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      runDebug();
    }
  }, [user]);

  const runDebug = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // 1. Check user authentication
      info.user = {
        id: user?.id,
        email: user?.email,
        authenticated: !!user
      };

      // 2. Check direct query to reviews table
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user?.id);

      info.reviews = {
        data: reviewsData,
        error: reviewsError,
        count: reviewsData?.length || 0
      };

      // 3. Check query with join
      const { data: joinedData, error: joinedError } = await supabase
        .from('reviews')
        .select(`
          *,
          item:questions(*)
        `)
        .eq('user_id', user?.id);

      info.joinedQuery = {
        data: joinedData,
        error: joinedError,
        count: joinedData?.length || 0
      };

      // 4. Check questions table
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, part, prompt_text')
        .limit(5);

      info.questions = {
        data: questionsData,
        error: questionsError,
        count: questionsData?.length || 0
      };

      // 5. Check attempts table
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('attempts')
        .select('*')
        .eq('user_id', user?.id);

      info.attempts = {
        data: attemptsData,
        error: attemptsError,
        count: attemptsData?.length || 0
      };

      // 6. Check current time vs due_at
      const now = new Date().toISOString();
      const { data: dueReviews, error: dueError } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user?.id)
        .lte('due_at', now);

      info.dueReviews = {
        data: dueReviews,
        error: dueError,
        count: dueReviews?.length || 0,
        currentTime: now
      };

    } catch (error) {
      info.error = error;
    } finally {
      setLoading(false);
    }

    setDebugInfo(info);
  };

  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!user) {
    return <div>Not authenticated. Please log in.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Debug Review Page</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo.user, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reviews Query (Simple)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo.reviews, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reviews Query (With Join)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo.joinedQuery, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions Table</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo.questions, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attempts Table</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo.attempts, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Due Reviews (Current Time Filter)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo.dueReviews, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Button onClick={runDebug} disabled={loading}>
          {loading ? 'Running Debug...' : 'Run Debug Again'}
        </Button>
      </div>
    </div>
  );
};

export default DebugReview;

