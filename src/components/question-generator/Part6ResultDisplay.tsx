import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Target } from 'lucide-react';
import { Part6ResultData } from './types';

interface Part6ResultDisplayProps {
  result: Part6ResultData;
}

export const Part6ResultDisplay: React.FC<Part6ResultDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-4">
      {/* Passage Card */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <FileText className="h-5 w-5" />
            Passage Part 6 - Text Completion
          </CardTitle>
          <CardDescription>
            Đoạn văn có 4 chỗ trống để điền từ phù hợp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {result.passage.content}
            </pre>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-purple-600">
            <Target className="h-4 w-4" />
            <span>4 chỗ trống: {result.passage.blanks.join(', ')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Answer Choices Card */}
      {result.questions.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Target className="h-5 w-5" />
              Answer Choices for Part 6
            </CardTitle>
            <CardDescription>
              Chọn đáp án đúng cho từng chỗ trống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.questions.map((q, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      Blank {q.question.split(' ')[1]}
                    </Badge>
                    <span className="text-sm text-gray-600">Choose the correct answer:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {q.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-center gap-2 p-2 rounded border">
                        <span className="font-mono text-sm font-bold text-blue-600">
                          {String.fromCharCode(65 + choiceIndex)}
                        </span>
                        <span className="text-sm">{choice}</span>
                        {choiceIndex === 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Correct
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    <strong>Giải thích:</strong> {q.explain_vi}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
