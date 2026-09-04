import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { Part7ResultData } from './types';

interface Part7ResultDisplayProps {
  result: Part7ResultData;
}

export const Part7ResultDisplay: React.FC<Part7ResultDisplayProps> = ({ result }) => {
  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <FileText className="h-5 w-5" />
          Passages Part 7 - Reading Comprehension
        </CardTitle>
        <CardDescription>
          Đoạn văn đọc hiểu với câu hỏi trắc nghiệm
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {result.passages.map((passage, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-purple-100 text-purple-700">
                  Passage {index + 1}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {passage.type}
                </Badge>
                {passage.title && (
                  <span className="text-sm font-medium text-gray-600">
                    {passage.title}
                  </span>
                )}
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {passage.content}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
