/**
 * ResumeExamDialog
 * Dialog hiển thị khi có bài thi đang làm dở
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
import { Clock, Play, RotateCcw, AlertCircle } from 'lucide-react';

interface ResumeExamDialogProps {
  open: boolean;
  onResume: () => void;
  onStartNew: () => void;
  onDismiss: () => void;
  sessionData?: {
    examSetName: string;
    currentIndex: number;
    totalQuestions: number;
    answeredCount: number;
    timeLeft: number;
    startedAt: string;
  } | null;
}

export const ResumeExamDialog: React.FC<ResumeExamDialogProps> = ({
  open,
  onResume,
  onStartNew,
  onDismiss,
  sessionData
}) => {
  if (!sessionData) return null;

  const progress = Math.round((sessionData.answeredCount / sessionData.totalQuestions) * 100);
  const currentQuestion = sessionData.currentIndex + 1;

  const formatTime = (seconds: number) => {
    if (seconds < 0) return 'Không giới hạn';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onDismiss}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            Có bài thi đang làm dở
          </DialogTitle>
          <DialogDescription>
            Bạn có một bài thi chưa hoàn thành. Bạn muốn tiếp tục hay bắt đầu bài thi mới?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Exam Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">{sessionData.examSetName}</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Bắt đầu lúc:</span>
                <span className="font-medium">{formatDate(sessionData.startedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Câu hỏi hiện tại:</span>
                <span className="font-medium">{currentQuestion}/{sessionData.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Đã trả lời:</span>
                <span className="font-medium">{sessionData.answeredCount}/{sessionData.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Hoàn thành:</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian còn lại:</span>
                <span className="font-medium">{formatTime(sessionData.timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-green-600" />
                <div>
                  <h5 className="font-medium text-green-900">Tiếp tục bài thi</h5>
                  <p className="text-sm text-green-700">
                    Tiếp tục từ câu hỏi {currentQuestion} với thời gian còn lại {formatTime(sessionData.timeLeft)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-orange-600" />
                <div>
                  <h5 className="font-medium text-orange-900">Bắt đầu bài thi mới</h5>
                  <p className="text-sm text-orange-700">
                    Hủy bài thi hiện tại và bắt đầu bài thi mới từ đầu
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Nếu bạn bắt đầu bài thi mới, tiến độ của bài thi hiện tại sẽ bị mất.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onDismiss}>
            Đóng
          </Button>
          <Button variant="outline" onClick={onStartNew}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Bài thi mới
          </Button>
          <Button onClick={onResume}>
            <Play className="h-4 w-4 mr-2" />
            Tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
