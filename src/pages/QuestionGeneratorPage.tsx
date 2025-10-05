import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Headphones, 
  FileText,
  Zap,
  Target,
  Clock,
  CheckCircle,
  Gift,
  DollarSign
} from 'lucide-react';
import QuestionGenerator from '@/components/QuestionGenerator';
import { Question } from '@/types';

const QuestionGeneratorPage = () => {
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const [recentlyGenerated, setRecentlyGenerated] = useState<Question[]>([]);

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            Bạn cần đăng nhập để sử dụng tính năng tạo câu hỏi tự động.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!permissions.canCreateQuestions) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Bạn không có quyền tạo câu hỏi. Chỉ giáo viên mới có thể sử dụng tính năng này.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleQuestionsGenerated = (questions: Question[]) => {
    setRecentlyGenerated(prev => [...questions, ...prev].slice(0, 10)); // Keep last 10
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Tạo câu hỏi tự động
          </h1>
          <p className="text-muted-foreground mt-1">
            Sử dụng AI để tạo câu hỏi TOEIC chất lượng cao từ nội dung
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Zap className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-sm">Từ văn bản</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Dán nội dung và tạo câu hỏi ngay lập tức
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <CardTitle className="text-sm">Từ file</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Upload file .txt, .md, .doc để tạo câu hỏi
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-sm">Từ URL</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Lấy nội dung từ trang web để tạo câu hỏi
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-sm">Tùy chỉnh</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Chọn loại, độ khó và số lượng câu hỏi
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Version */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Gift className="h-5 w-5" />
              Free Template Generator
            </CardTitle>
            <CardDescription className="text-green-600">
              Hoàn toàn miễn phí, không cần cấu hình
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">✅ Tính năng:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Template có sẵn cho từ vựng, ngữ pháp</li>
                <li>• Tạo câu hỏi từ nội dung</li>
                <li>• Hỗ trợ 3 mức độ khó</li>
                <li>• Giải thích song ngữ</li>
                <li>• Không cần API key</li>
                <li>• Tốc độ nhanh</li>
              </ul>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                <DollarSign className="h-3 w-3 mr-1" />
                Hoàn toàn miễn phí
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Version */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              AI-Powered Generator
            </CardTitle>
            <CardDescription className="text-primary">
              Chất lượng cao với OpenAI GPT-4
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">🚀 Tính năng:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AI tạo câu hỏi thông minh</li>
                <li>• Phân tích nội dung sâu</li>
                <li>• Câu hỏi đa dạng và sáng tạo</li>
                <li>• Hỗ trợ tất cả loại nội dung</li>
                <li>• Cần OpenAI API key</li>
                <li>• Chất lượng cao nhất</li>
              </ul>
            </div>
            <div className="text-center">
              <Badge variant="default" className="text-white">
                <Zap className="h-3 w-3 mr-1" />
                ~$0.05 per 10 questions
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            Lợi ích của Question Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">⚡ Tiết kiệm thời gian</h4>
              <p className="text-sm text-muted-foreground">
                Tạo hàng chục câu hỏi trong vài phút thay vì hàng giờ
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🎯 Chất lượng cao</h4>
              <p className="text-sm text-muted-foreground">
                Câu hỏi được tối ưu theo format TOEIC chuẩn
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🔄 Đa dạng nội dung</h4>
              <p className="text-sm text-muted-foreground">
                Hỗ trợ nhiều loại nội dung: văn bản, file, URL
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">📚 Giải thích song ngữ</h4>
              <p className="text-sm text-muted-foreground">
                Tự động tạo giải thích bằng tiếng Việt và tiếng Anh
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Generator Component */}
      <QuestionGenerator onQuestionsGenerated={handleQuestionsGenerated} />

      {/* Recently Generated Questions */}
      {recentlyGenerated.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Câu hỏi vừa tạo gần đây
            </CardTitle>
            <CardDescription>
              Danh sách các câu hỏi đã được tạo và lưu vào hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyGenerated.slice(0, 5).map((question, index) => (
                <div key={question.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-2">{question.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {question.type === 'vocab' ? 'Từ vựng' :
                         question.type === 'grammar' ? 'Ngữ pháp' :
                         question.type === 'listening' ? 'Nghe hiểu' :
                         question.type === 'reading' ? 'Đọc hiểu' : 'Hỗn hợp'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {question.difficulty === 'easy' ? 'Dễ' :
                         question.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>Đáp án: {question.answer}</div>
                    <div>{question.tags?.length || 0} tags</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Mẹo sử dụng hiệu quả
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Nội dung chất lượng:</strong> Sử dụng văn bản rõ ràng, có cấu trúc để tạo câu hỏi tốt hơn</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Độ dài phù hợp:</strong> Nội dung từ 200-1000 từ sẽ tạo ra câu hỏi cân bằng nhất</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Kiểm tra kết quả:</strong> Luôn xem lại và chỉnh sửa câu hỏi trước khi lưu vào hệ thống</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Tối ưu tags:</strong> Thêm tags phù hợp để dễ dàng phân loại và tìm kiếm sau này</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionGeneratorPage;
