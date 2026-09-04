import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Copy, Save } from 'lucide-react';
import { GeneratedQuestion } from '@/services/questionGenerator';

interface GeneratedQuestionsListProps {
  questions: GeneratedQuestion[];
  selectedQuestions: Set<number>;
  onToggleSelection: (index: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSaveSelected: () => void;
  onSaveAll: () => void;
  onCopyQuestion: (question: GeneratedQuestion) => void;
}

export const GeneratedQuestionsList: React.FC<GeneratedQuestionsListProps> = ({
  questions,
  selectedQuestions,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onSaveSelected,
  onSaveAll,
  onCopyQuestion
}) => {
  if (questions.length === 0) return null;

  const selectedCount = selectedQuestions.size;
  const isQuestionSelected = (index: number) => selectedQuestions.has(index);

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                🎉 Câu hỏi đã tạo thành công!
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {questions.length} câu
                </Badge>
              </CardTitle>
              <CardDescription className="text-base">
                ✨ Xem lại và chỉnh sửa câu hỏi trước khi lưu vào hệ thống
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSelectAll}
              disabled={selectedCount === questions.length}
            >
              Chọn tất cả
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDeselectAll}
              disabled={selectedCount === 0}
            >
              Bỏ chọn tất cả
            </Button>
            <Button 
              onClick={onSaveSelected} 
              disabled={selectedCount === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Save className="h-4 w-4" />
              Lưu đã chọn ({selectedCount})
            </Button>
            <Button 
              onClick={onSaveAll} 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              Lưu tất cả
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question, index) => (
          <Card key={index} className={`border-l-4 shadow-sm hover:shadow-md transition-all ${
            isQuestionSelected(index) 
              ? 'border-l-green-500 bg-green-50' 
              : 'border-l-blue-500'
          }`}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isQuestionSelected(index)}
                        onCheckedChange={() => onToggleSelection(index)}
                        className="w-5 h-5"
                      />
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-lg">Câu hỏi {index + 1}</h4>
                    {isQuestionSelected(index) && (
                      <Badge className="bg-green-100 text-green-800">
                        Đã chọn
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCopyQuestion(question)}
                      className="hover:bg-blue-50"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Sao chép
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-base leading-relaxed">{question.question}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.choices.map((choice, choiceIndex) => {
                    const isCorrect = choiceIndex === question.answer.charCodeAt(0) - 65;
                    return (
                      <div key={choiceIndex} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                        isCorrect 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isCorrect 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + choiceIndex)}
                        </div>
                        <span className={`flex-1 ${isCorrect ? 'font-medium text-green-700' : 'text-gray-700'}`}>
                          {choice}
                        </span>
                        {isCorrect && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Đáp án</Badge>
                    <span className="font-semibold text-blue-700">{question.answer}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="bg-white">🇻🇳 VI</Badge>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{question.explain_vi}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="bg-white">🇺🇸 EN</Badge>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{question.explain_en}</p>
                      </div>
                    </div>
                  </div>
                  
                  {question.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-white">Tags</Badge>
                      {question.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
