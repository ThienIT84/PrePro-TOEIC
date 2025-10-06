import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

const TestAuth = () => {
  const { user, loading } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      testQueries();
    }
  }, [user]);

  const testQueries = async () => {
    const results: any = {};

    try {
      // Test 1: Simple reviews query
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user?.id);

      results.reviews = { data: reviews, error: reviewsError };

      // Test 2: Reviews with join
      const { data: joinedReviews, error: joinedError } = await supabase
        .from('reviews')
        .select(`
          *,
          item:questions(*)
        `)
        .eq('user_id', user?.id);

      results.joinedReviews = { data: joinedReviews, error: joinedError };

      // Test 3: Due reviews
      const { data: dueReviews, error: dueError } = await supabase
        .from('reviews')
        .select(`
          *,
          item:questions(*)
        `)
        .eq('user_id', user?.id)
        .lte('due_at', new Date().toISOString());

      results.dueReviews = { data: dueReviews, error: dueError };

    } catch (error) {
      results.error = error;
    }

    setTestResult(results);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Test Authentication & Queries</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">User Info:</h2>
        <p>ID: {user.id}</p>
        <p>Email: {user.email}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Query Results:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(testResult, null, 2)}
        </pre>
      </div>

      <button 
        onClick={testQueries}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Run Tests Again
      </button>
    </div>
  );
};

export default TestAuth;

