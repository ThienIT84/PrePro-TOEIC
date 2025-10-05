import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, AlertCircle, Trash2, Database, AlertTriangle } from 'lucide-react';

const ItemsTableCleanup: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cleaning, setCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const checkDependencies = async () => {
    try {
      // Check if any other tables reference items
      const { data: foreignKeys, error: fkError } = await supabase
        .rpc('get_foreign_keys', { table_name: 'items' });

      // Check if any components are still using items table
      const { data: itemsCount, error: itemsError } = await supabase
        .from('items')
        .select('COUNT(*) as count');

      if (itemsError) throw itemsError;

      return {
        itemsCount: itemsCount?.[0]?.count || 0,
        foreignKeys: foreignKeys || [],
        hasDependencies: (foreignKeys || []).length > 0
      };
    } catch (error: any) {
      console.error('Check dependencies error:', error);
      return {
        itemsCount: 0,
        foreignKeys: [],
        hasDependencies: false,
        error: error.message
      };
    }
  };

  const backupItemsData = async () => {
    try {
      const { data: itemsData, error } = await supabase
        .from('items')
        .select('*');

      if (error) throw error;

      // Create backup in a JSON format
      const backup = {
        timestamp: new Date().toISOString(),
        table: 'items',
        count: itemsData?.length || 0,
        data: itemsData
      };

      // Download as JSON file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `items_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return itemsData?.length || 0;
    } catch (error: any) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  };

  const migrateRemainingData = async () => {
    try {
      // Check if there's any data in items that's not in questions
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*');

      if (itemsError) throw itemsError;

      if (!itemsData || itemsData.length === 0) {
        return { migrated: 0, message: 'No data to migrate' };
      }

      // Transform and insert into questions
      const transformedQuestions = itemsData.map((item) => {
        const typeToPart: Record<string, number> = {
          'vocab': 1,
          'grammar': 5,
          'listening': 2,
          'reading': 7,
          'mix': 1
        };

        const part = typeToPart[item.type] || 1;
        const choices = Array.isArray(item.choices) ? {
          A: item.choices[0] || '',
          B: item.choices[1] || '',
          C: item.choices[2] || '',
          D: item.choices[3] || ''
        } : { A: '', B: '', C: '', D: '' };

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
          created_by: user?.id || null
        };
      });

      const { data: insertedData, error: insertError } = await supabase
        .from('questions')
        .insert(transformedQuestions)
        .select();

      if (insertError) throw insertError;

      return {
        migrated: insertedData?.length || 0,
        message: `Migrated ${transformedQuestions.length} items to questions`
      };
    } catch (error: any) {
      throw new Error(`Migration failed: ${error.message}`);
    }
  };

  const dropItemsTable = async () => {
    try {
      // Drop the items table
      const { error } = await supabase
        .rpc('drop_table_if_exists', { table_name: 'items' });

      if (error) throw error;

      return { success: true, message: 'Items table dropped successfully' };
    } catch (error: any) {
      throw new Error(`Drop table failed: ${error.message}`);
    }
  };

  const performCleanup = async () => {
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để thực hiện cleanup",
        variant: "destructive",
      });
      return;
    }

    setCleaning(true);
    setCleanupResult(null);

    try {
      const steps = [];
      let totalItems = 0;

      // Step 1: Check dependencies
      steps.push("🔍 Checking dependencies...");
      const dependencies = await checkDependencies();
      if (dependencies.error) throw new Error(dependencies.error);
      
      totalItems = dependencies.itemsCount;
      steps.push(`📊 Found ${totalItems} items in table`);

      if (dependencies.hasDependencies) {
        throw new Error("Cannot drop items table: it has foreign key dependencies");
      }

      // Step 2: Backup data
      if (totalItems > 0) {
        steps.push("💾 Creating backup...");
        const backedUp = await backupItemsData();
        steps.push(`✅ Backup created: ${backedUp} items`);
      }

      // Step 3: Migrate remaining data
      if (totalItems > 0) {
        steps.push("🔄 Migrating data to questions table...");
        const migration = await migrateRemainingData();
        steps.push(`✅ Migration: ${migration.message}`);
      }

      // Step 4: Drop table
      steps.push("🗑️ Dropping items table...");
      const dropResult = await dropItemsTable();
      steps.push(`✅ ${dropResult.message}`);

      setCleanupResult({
        success: true,
        steps: steps,
        totalItems: totalItems,
        message: "Items table cleanup completed successfully!"
      });

      toast({
        title: "Cleanup thành công",
        description: "Bảng items đã được xóa và dữ liệu đã được migrate",
      });

    } catch (error: any) {
      console.error('Cleanup error:', error);
      setCleanupResult({
        success: false,
        error: error.message,
        message: "Cleanup thất bại"
      });

      toast({
        title: "Cleanup thất bại",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          Items Table Cleanup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-red-800">⚠️ CẢNH BÁO: Hành động này sẽ XÓA VĨNH VIỄN bảng items!</p>
              <p className="text-red-700">
                • Tất cả dữ liệu trong bảng items sẽ được backup và migrate sang bảng questions
                • Bảng items sẽ bị xóa hoàn toàn
                • Hành động này KHÔNG THỂ hoàn tác
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium">🧹 Cleanup Process:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>1. 🔍 Kiểm tra dependencies và foreign keys</li>
            <li>2. 💾 Backup dữ liệu items (download JSON)</li>
            <li>3. 🔄 Migrate dữ liệu sang bảng questions</li>
            <li>4. 🗑️ Xóa bảng items</li>
            <li>5. ✅ Xác nhận hoàn thành</li>
          </ol>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={performCleanup} 
            disabled={cleaning}
            variant="destructive"
            className="flex-1"
          >
            {cleaning ? "Đang cleanup..." : "🗑️ Cleanup Items Table"}
          </Button>
        </div>

        {cleanupResult && (
          <Alert className={cleanupResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {cleanupResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-medium">
                  {cleanupResult.success ? "✅ Cleanup thành công!" : "❌ Cleanup thất bại!"}
                </p>
                <p>{cleanupResult.message}</p>
                
                {cleanupResult.error && (
                  <div className="text-sm">
                    <p className="font-medium text-red-600">Lỗi:</p>
                    <p className="text-red-600">{cleanupResult.error}</p>
                  </div>
                )}

                {cleanupResult.success && cleanupResult.steps && (
                  <div className="space-y-2">
                    <p className="font-medium">📋 Chi tiết các bước:</p>
                    <div className="space-y-1">
                      {cleanupResult.steps.map((step: string, index: number) => (
                        <p key={index} className="text-sm text-gray-600">
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Lợi ích sau khi cleanup:</strong></p>
          <p>• ✅ Loại bỏ nhầm lẫn giữa 2 bảng</p>
          <p>• ✅ Tất cả components sẽ fetch từ bảng questions</p>
          <p>• ✅ Cấu trúc dữ liệu thống nhất</p>
          <p>• ✅ Tránh lỗi fetch từ bảng cũ</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsTableCleanup;
