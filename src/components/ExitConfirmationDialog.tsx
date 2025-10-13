/**
 * ExitConfirmationDialog
 * Dialog xác nhận khi người dùng muốn thoát bài thi
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Save } from 'lucide-react';

interface ExitConfirmationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  sessionData?: {
    currentIndex: number;
    questions: any[];
    answers: Map<string, any>;
    timeLeft: number;
  } | null;
}

export const ExitConfirmationDialog: React.FC<ExitConfirmationDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  sessionData
}) => {
  const answeredCount = sessionData ? 
    Array.from(sessionData.answers.values()).filter(a => a.answer).length : 0;
  const totalQuestions = sessionData?.questions.length || 0;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const currentQuestion = sessionData ? sessionData.currentIndex + 1 : 0;

  const formatTime = (seconds: number) => {
    if (seconds < 0) return 'Không giới hạn';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Xác nhận thoát bài thi
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn thoát bài thi này không?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Tiến độ hiện tại:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Câu hỏi:</span>
                <span className="font-medium">{currentQuestion}/{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Đã trả lời:</span>
                <span className="font-medium">{answeredCount}/{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Hoàn thành:</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian còn lại:</span>
                <span className="font-medium">{formatTime(sessionData?.timeLeft || 0)}</span>
              </div>
            </div>
          </div>

          {/* Warning Info */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <Save className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Tiến độ sẽ được lưu tự động</p>
                <p>Bạn có thể tiếp tục bài thi này sau bằng cách chọn "Tiếp tục bài thi" từ danh sách bài thi.</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-1">Các lựa chọn:</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Thoát:</strong> Lưu tiến độ và quay lại danh sách bài thi</li>
                <li>• <strong>Hủy:</strong> Tiếp tục làm bài thi</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Thoát bài thi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
