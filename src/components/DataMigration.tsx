import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, AlertCircle, Database, ArrowRight } from 'lucide-react';

interface MigrationResult {
  success: boolean;
  originalCount?: number;
  migratedCount?: number;
  originalData?: any[];
  migratedData?: any[];
  message: string;
  error?: string;
}

const DataMigration: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  const migrateData = async () => {
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để migrate",
        variant: "destructive",
      });
      return;
    }

    setMigrating(true);
    setMigrationResult(null);

    try {
      // 1. Fetch data from questions table (demo migration)
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .limit(5); // Limit to 5 questions for demo

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length === 0) {
        throw new Error('Không có dữ liệu trong bảng questions');
      }

      // 2. Transform data to create sample questions (demo migration)
      const transformedQuestions = questionsData.map((question, index) => {
        return {
          part: question.part || 1,
          passage_id: null,
          blank_index: null,
          prompt_text: `${question.prompt_text} (Migrated ${index + 1})`,
          choices: question.choices || { A: '', B: '', C: '', D: '' },
          correct_choice: question.correct_choice || 'A',
          explain_vi: question.explain_vi || '',
          explain_en: question.explain_en || '',
          tags: question.tags || [],
          difficulty: question.difficulty || 'medium',
          status: 'published',
          created_by: user.id
        };
      });

      // 3. Insert into questions table (demo - creating copies)
      const { data: insertedData, error: insertError } = await supabase
        .from('questions')
        .insert(transformedQuestions)
        .select();

      if (insertError) throw insertError;

      setMigrationResult({
        success: true,
        originalCount: questionsData.length,
        migratedCount: insertedData?.length || 0,
        originalData: questionsData.slice(0, 2), // Show first 2 questions
        migratedData: insertedData?.slice(0, 2), // Show first 2 migrated
        message: `Migration thành công! Đã tạo ${questionsData.length} câu hỏi mẫu từ dữ liệu hiện có.`
      });

      toast({
        title: "Migration thành công",
        description: `Đã tạo ${questionsData.length} câu hỏi mẫu từ dữ liệu hiện có`,
      });

    } catch (error: unknown) {
      console.error('Migration error:', error);
      setMigrationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: "Migration thất bại"
      });

      toast({
        title: "Migration thất bại",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  const checkData = async () => {
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id')
        .limit(1);

      if (questionsError) throw new Error('Lỗi khi kiểm tra dữ liệu');

      const questionsCount = questionsData?.length || 0;

      toast({
        title: "Thống kê dữ liệu",
        description: `Questions: ${questionsCount} records found`,
      });

    } catch (error: unknown) {
      toast({
        title: "Lỗi kiểm tra",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Migration: Questions Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Demo migration để tạo câu hỏi mẫu từ dữ liệu hiện có trong bảng <code>questions</code>.
        </p>

        <div className="flex gap-4">
          <Button 
            onClick={checkData} 
            variant="outline"
            className="flex-1"
          >
            📊 Kiểm tra dữ liệu
          </Button>
          
          <Button 
            onClick={migrateData} 
            disabled={migrating}
            className="flex-1"
          >
            {migrating ? "Đang migrate..." : "🚀 Demo Migration"}
          </Button>
        </div>

        {migrationResult && (
          <Alert className={migrationResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {migrationResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-medium">
                  {migrationResult.success ? "✅ Migration thành công!" : "❌ Migration thất bại!"}
                </p>
                <p>{migrationResult.message}</p>
                
                {migrationResult.error && (
                  <div className="text-sm">
                    <p className="font-medium text-red-600">Lỗi:</p>
                    <p className="text-red-600">{migrationResult.error}</p>
                  </div>
                )}

                {migrationResult.success && (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📊 Thống kê:</span>
                      <span>Items: {migrationResult.originalCount}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span>Questions: {migrationResult.migratedCount}</span>
                    </div>

                    <div>
                      <p className="font-medium">📥 Dữ liệu gốc (items):</p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(migrationResult.originalData, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <p className="font-medium">✅ Dữ liệu sau migrate (questions):</p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(migrationResult.migratedData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Demo Migration Process:</strong></p>
          <p>1. 📥 Fetch dữ liệu từ bảng questions</p>
          <p>2. 🔄 Transform để tạo câu hỏi mẫu</p>
          <p>3. 💾 Insert vào bảng questions</p>
          <p>4. ✅ Xác nhận kết quả</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataMigration;
