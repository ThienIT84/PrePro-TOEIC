import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, AlertCircle, Database, ArrowRight } from 'lucide-react';

const DataMigration: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

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
      // 1. Fetch data from items table
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*');

      if (itemsError) throw itemsError;

      if (!itemsData || itemsData.length === 0) {
        throw new Error('Không có dữ liệu trong bảng items');
      }

      // 2. Transform data from items to questions format
      const transformedQuestions = itemsData.map((item, index) => {
        // Map type to part (simple mapping)
        const typeToPart: Record<string, number> = {
          'vocab': 1,
          'grammar': 5,
          'listening': 2,
          'reading': 7,
          'mix': 1
        };

        const part = typeToPart[item.type] || 1;

        // Transform choices array to object
        const choices = Array.isArray(item.choices) ? {
          A: item.choices[0] || '',
          B: item.choices[1] || '',
          C: item.choices[2] || '',
          D: item.choices[3] || ''
        } : {
          A: '',
          B: '',
          C: '',
          D: ''
        };

        return {
          part: part,
          passage_id: null,
          blank_index: null,
          prompt_text: item.question || '',
          choices: choices,
          correct_choice: item.answer || 'A',
          explain_vi: item.explain_vi || '',
          explain_en: item.explain_en || '',
          tags: item.tags || [],
          difficulty: item.difficulty || 'medium',
          status: 'published',
          created_by: user.id
        };
      });

      // 3. Insert into questions table
      const { data: insertedData, error: insertError } = await supabase
        .from('questions')
        .insert(transformedQuestions)
        .select();

      if (insertError) throw insertError;

      setMigrationResult({
        success: true,
        originalCount: itemsData.length,
        migratedCount: insertedData?.length || 0,
        originalData: itemsData.slice(0, 2), // Show first 2 items
        migratedData: insertedData?.slice(0, 2), // Show first 2 migrated
        message: `Migration thành công! Đã chuyển ${itemsData.length} câu hỏi từ items sang questions.`
      });

      toast({
        title: "Migration thành công",
        description: `Đã chuyển ${itemsData.length} câu hỏi từ items sang questions`,
      });

    } catch (error: any) {
      console.error('Migration error:', error);
      setMigrationResult({
        success: false,
        error: error.message,
        message: "Migration thất bại"
      });

      toast({
        title: "Migration thất bại",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  const checkData = async () => {
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('COUNT(*) as count');

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('COUNT(*) as count');

      if (itemsError || questionsError) throw new Error('Lỗi khi kiểm tra dữ liệu');

      toast({
        title: "Thống kê dữ liệu",
        description: `Items: ${itemsData?.[0]?.count || 0}, Questions: ${questionsData?.[0]?.count || 0}`,
      });

    } catch (error: any) {
      toast({
        title: "Lỗi kiểm tra",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Migration: Items → Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Migrate dữ liệu từ bảng <code>items</code> (cũ) sang bảng <code>questions</code> (mới).
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
            {migrating ? "Đang migrate..." : "🚀 Migrate Data"}
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
          <p><strong>Migration Process:</strong></p>
          <p>1. 📥 Fetch dữ liệu từ bảng items</p>
          <p>2. 🔄 Transform sang format questions</p>
          <p>3. 💾 Insert vào bảng questions</p>
          <p>4. ✅ Xác nhận kết quả</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataMigration;
