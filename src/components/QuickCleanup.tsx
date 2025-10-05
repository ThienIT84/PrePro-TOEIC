import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, AlertCircle, Trash2, AlertTriangle } from 'lucide-react';

const QuickCleanup: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cleaning, setCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const performQuickCleanup = async () => {
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
      let itemsCount = 0;
      let questionsCount = 0;

      // Step 1: Count current data

      try {
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true });

        if (!itemsError) {
          itemsCount = itemsData?.length || 0;
        }
      } catch (error) {
        console.log('Items table might not exist or is empty');
      }

      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true });

        if (!questionsError) {
          questionsCount = questionsData?.length || 0;
        }
      } catch (error) {
        console.log('Questions table might not exist or is empty');
      }

      steps.push(`📊 Tìm thấy ${itemsCount} câu hỏi trong bảng items`);
      steps.push(`📊 Tìm thấy ${questionsCount} câu hỏi trong bảng questions`);

      // Step 2: Delete all data from items table
      if (itemsCount > 0) {
        steps.push("🗑️ Đang xóa tất cả dữ liệu từ bảng items...");
        const { error: deleteItemsError } = await supabase
          .from('items')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteItemsError) throw deleteItemsError;
        steps.push(`✅ Đã xóa ${itemsCount} câu hỏi từ bảng items`);
      }

      // Step 3: Delete all data from questions table
      if (questionsCount > 0) {
        steps.push("🗑️ Đang xóa tất cả dữ liệu từ bảng questions...");
        const { error: deleteQuestionsError } = await supabase
          .from('questions')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteQuestionsError) throw deleteQuestionsError;
        steps.push(`✅ Đã xóa ${questionsCount} câu hỏi từ bảng questions`);
      }

      // Step 4: Drop items table
      steps.push("🗑️ Đang xóa bảng items...");
      const { error: dropError } = await supabase
        .rpc('drop_table_if_exists', { target_table_name: 'items' });

      if (dropError) throw dropError;
      steps.push("✅ Đã xóa bảng items");

      // Step 5: Verify cleanup
      let finalItemsCount = 0;
      let finalQuestionsCount = 0;

      try {
        const { data: finalItemsData } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true });
        finalItemsCount = finalItemsData?.length || 0;
      } catch (error) {
        finalItemsCount = 0; // Table might be dropped
      }

      try {
        const { data: finalQuestionsData } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true });
        finalQuestionsCount = finalQuestionsData?.length || 0;
      } catch (error) {
        finalQuestionsCount = 0;
      }

      steps.push(`📊 Sau cleanup: ${finalItemsCount} items, ${finalQuestionsCount} questions`);

      setCleanupResult({
        success: true,
        steps: steps,
        deletedItems: itemsCount,
        deletedQuestions: questionsCount,
        message: `Cleanup hoàn thành! Đã xóa ${itemsCount + questionsCount} câu hỏi và bảng items.`
      });

      toast({
        title: "Cleanup thành công",
        description: `Đã xóa ${itemsCount + questionsCount} câu hỏi và bảng items`,
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
          Quick Cleanup - Xóa Tất Cả Dữ Liệu Cũ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-red-800">⚠️ CẢNH BÁO: Hành động này sẽ XÓA VĨNH VIỄN tất cả dữ liệu!</p>
              <p className="text-red-700">
                • Tất cả câu hỏi trong bảng items sẽ bị xóa
                • Tất cả câu hỏi trong bảng questions sẽ bị xóa  
                • Bảng items sẽ bị xóa hoàn toàn
                • KHÔNG có backup - dữ liệu sẽ mất vĩnh viễn
                • Hành động này KHÔNG THỂ hoàn tác
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium">🧹 Quick Cleanup Process:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>1. 📊 Đếm số lượng câu hỏi hiện tại</li>
            <li>2. 🗑️ Xóa tất cả dữ liệu từ bảng items</li>
            <li>3. 🗑️ Xóa tất cả dữ liệu từ bảng questions</li>
            <li>4. 🗑️ Xóa bảng items</li>
            <li>5. ✅ Xác nhận cleanup hoàn thành</li>
          </ol>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={performQuickCleanup} 
            disabled={cleaning}
            variant="destructive"
            className="flex-1"
          >
            {cleaning ? "Đang cleanup..." : "🗑️ Quick Cleanup - Xóa Tất Cả"}
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
          <p><strong>Lợi ích sau cleanup:</strong></p>
          <p>• ✅ Database sạch sẽ, không có dữ liệu cũ</p>
          <p>• ✅ Bắt đầu fresh với cấu trúc TOEIC mới</p>
          <p>• ✅ Không còn nhầm lẫn giữa các bảng</p>
          <p>• ✅ Có thể import dữ liệu mới từ Excel</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickCleanup;
