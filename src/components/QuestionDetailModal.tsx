import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Question } from '@/types';
import { X, Play, Volume2, FileText } from 'lucide-react';

interface QuestionDetailModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (question: Question) => void;
}

const QuestionDetailModal = ({ question, isOpen, onClose, onEdit }: QuestionDetailModalProps) => {
  if (!question) return null;

  const getPartLabel = (part: number) => {
    const labels = {
      1: 'Part 1 - Photos',
      2: 'Part 2 - Question-Response',
      3: 'Part 3 - Conversations',
      4: 'Part 4 - Talks',
      5: 'Part 5 - Incomplete Sentences',
      6: 'Part 6 - Text Completion',
      7: 'Part 7 - Reading Comprehension'
    };
    return labels[part as keyof typeof labels] || `Part ${part}`;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: 'Dễ',
      medium: 'Trung bình',
      hard: 'Khó'
    };
    return labels[difficulty as keyof typeof labels] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const playAudio = () => {
    if (question.audio_url) {
      const audio = new Audio(question.audio_url);
      audio.play().catch(console.error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết câu hỏi</span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{getPartLabel(question.part)}</Badge>
              <Badge className={getDifficultyColor(question.difficulty)}>
                {getDifficultyLabel(question.difficulty)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Content */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Nội dung câu hỏi</h3>
                  <p className="text-gray-700 leading-relaxed">{question.prompt_text}</p>
                </div>

                {/* Audio for listening questions */}
                {(question.part <= 4) && question.audio_url && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playAudio}
                      className="flex items-center space-x-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>Phát audio</span>
                    </Button>
                    {question.transcript && (
                      <div className="text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Có transcript
                      </div>
                    )}
                  </div>
                )}

                {/* Transcript */}
                {question.transcript && (
                  <div>
                    <h4 className="font-medium mb-2">Transcript:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {question.transcript}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Choices */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Các lựa chọn</h3>
              <div className="space-y-3">
                {Object.entries(question.choices).map(([key, value], index) => (
                  <div
                    key={key}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      key === question.correct_choice
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        key === question.correct_choice
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {key}
                    </div>
                    <span className="flex-1">{value}</span>
                    {key === question.correct_choice && (
                      <Badge variant="default" className="bg-green-500">
                        Đáp án đúng
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Explanations */}
          {(question.explain_vi || question.explain_en) && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Giải thích</h3>
                <div className="space-y-4">
                  {question.explain_vi && (
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Tiếng Việt:</h4>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded">
                        {question.explain_vi}
                      </p>
                    </div>
                  )}
                  {question.explain_en && (
                    <div>
                      <h4 className="font-medium text-purple-700 mb-2">English:</h4>
                      <p className="text-gray-700 bg-purple-50 p-3 rounded">
                        {question.explain_en}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Đóng
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(question)}>
                <Play className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDetailModal;
