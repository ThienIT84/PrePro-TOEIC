import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, X } from 'lucide-react';

interface PromptGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export const PromptGuideModal: React.FC<PromptGuideModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Hướng dẫn Prompt chuẩn TOEIC
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Mục đích</h3>
            <p className="text-blue-700 text-sm">
              Hướng dẫn cách prompt hiệu quả để tạo câu hỏi TOEIC chất lượng cao với AI. 
              Mỗi Part có format và yêu cầu riêng biệt.
            </p>
          </div>

          {/* Part 1 - Photos */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📸 Part 1 - Photos
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                <code className="text-xs bg-white p-2 rounded block">
                  "Tạo câu hỏi Part 1 TOEIC từ hình ảnh mô tả: [Mô tả hình ảnh]<br/>
                  Yêu cầu: Tạo 4 câu mô tả hình ảnh, chỉ có 1 câu đúng"
                </code>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Lưu ý:</strong> Part 1 cần hình ảnh thực tế, AI Generator không hỗ trợ tạo câu hỏi Part 1.
              </div>
            </div>
          </div>

          {/* Part 2 - Question-Response */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              ❓ Part 2 - Question-Response
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                <code className="text-xs bg-white p-2 rounded block">
                  "Tạo câu hỏi Part 2 TOEIC từ tình huống: [Mô tả tình huống]<br/>
                  Yêu cầu: Tạo 1 câu hỏi và 3 câu trả lời (A, B, C), chỉ có 1 câu đúng"
                </code>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Lưu ý:</strong> Tập trung vào hội thoại ngắn trong môi trường công việc.
              </div>
            </div>
          </div>

          {/* Part 3 - Conversations */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              💬 Part 3 - Conversations
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                <code className="text-xs bg-white p-2 rounded block">
                  "Tạo câu hỏi Part 3 TOEIC từ đoạn hội thoại:<br/>
                  [Đoạn hội thoại]<br/>
                  Yêu cầu: Tạo 3 câu hỏi về nội dung hội thoại, mỗi câu có 4 lựa chọn"
                </code>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Lưu ý:</strong> Cần tạo passage trước. Sử dụng Question Creator thay vì AI Generator.
              </div>
            </div>
          </div>

          {/* Part 4 - Talks */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📢 Part 4 - Talks
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                <code className="text-xs bg-white p-2 rounded block">
                  "Tạo câu hỏi Part 4 TOEIC từ bài nói:<br/>
                  [Nội dung bài nói]<br/>
                  Yêu cầu: Tạo 3 câu hỏi về nội dung bài nói, mỗi câu có 4 lựa chọn"
                </code>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Lưu ý:</strong> Cần tạo passage trước. Sử dụng Question Creator thay vì AI Generator.
              </div>
            </div>
          </div>

          {/* Part 5 - Incomplete Sentences */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📝 Part 5 - Incomplete Sentences (AI Generator hỗ trợ)
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                <code className="text-xs bg-white p-2 rounded block">
                  "Tạo câu hỏi Part 5 TOEIC từ nội dung:<br/>
                  [Nội dung văn bản kinh doanh]<br/>
                  Yêu cầu: Tạo 5 câu hỏi hoàn thành câu, tập trung vào ngữ pháp và từ vựng kinh doanh"
                </code>
              </div>
              <div className="text-sm text-gray-600">
                <strong>✅ Hỗ trợ:</strong> AI Generator có thể tạo câu hỏi Part 5 trực tiếp.
              </div>
            </div>
          </div>

          {/* Part 6 - Text Completion */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📄 Part 6 - Text Completion
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                <code className="text-xs bg-white p-2 rounded block">
                  "Tạo câu hỏi Part 6 TOEIC từ đoạn văn:<br/>
                  [Đoạn văn có chỗ trống]<br/>
                  Yêu cầu: Tạo 4 câu hỏi điền từ vào chỗ trống, mỗi câu có 4 lựa chọn"
                </code>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Lưu ý:</strong> Cần tạo passage trước. Sử dụng Question Creator thay vì AI Generator.
              </div>
            </div>
          </div>

          {/* Part 7 - Reading Comprehension */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📖 Part 7 - Reading Comprehension
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Prompt mẫu:</h4>
                <code className="text-xs bg-white p-2 rounded block">
                  "Tạo câu hỏi Part 7 TOEIC từ văn bản:<br/>
                  [Email/Memo/Notice/Article]<br/>
                  Yêu cầu: Tạo 5 câu hỏi đọc hiểu, bao gồm main idea, detail, inference"
                </code>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Lưu ý:</strong> Cần tạo passage trước. Sử dụng Question Creator thay vì AI Generator.
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Mẹo prompt hiệu quả</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Sử dụng ngữ cảnh kinh doanh và công việc thực tế</li>
              <li>• Chỉ định rõ số lượng câu hỏi cần tạo</li>
              <li>• Mô tả độ khó phù hợp (easy/medium/hard)</li>
              <li>• Cung cấp nội dung có cấu trúc rõ ràng</li>
              <li>• Yêu cầu giải thích chi tiết cho mỗi câu hỏi</li>
            </ul>
          </div>

          {/* AI Generator Support */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🤖 AI Generator hỗ trợ</h3>
            <div className="text-blue-700 text-sm">
              <p><strong>✅ Hỗ trợ:</strong> Part 5 (Incomplete Sentences)</p>
              <p><strong>❌ Không hỗ trợ:</strong> Part 1, 3, 4, 6, 7 (cần passage hoặc hình ảnh)</p>
              <p><strong>⚠️ Hạn chế:</strong> Part 2 (có thể tạo nhưng không tối ưu)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
