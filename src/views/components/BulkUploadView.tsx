/**
 * BulkUploadView
 * Pure UI component cho TOEIC Bulk Upload
 * Nhận tất cả data và callbacks qua props
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Plus,
  Headphones,
  BookOpen
} from 'lucide-react';
import { TOEICQuestion } from '@/controllers/upload/BulkUploadController';

export interface BulkUploadViewProps {
  // State
  questions: TOEICQuestion[];
  passages: any[];
  loading: boolean;
  importing: boolean;
  progress: number;
  errors: string[];

  // Handlers
  onFileUpload: (file: File) => void;
  onDownloadTemplate: () => void;
  onImportQuestions: () => void;
  onReset: () => void;
  onClearQuestions: () => void;
  onUpdateQuestionStatus: (index: number, status: 'pending' | 'valid' | 'invalid' | 'imported') => void;

  // Utility functions
  getStatistics: () => {
    total: number;
    valid: number;
    invalid: number;
    imported: number;
    pending: number;
  };
  getPartIcon: (part: number) => string;
  getPartColor: (part: number) => string;
  usesIndividualAudio: (part: number) => boolean;
  usesPassageAudio: (part: number) => boolean;
  getToeicPartInfo: () => any;
  getQuestion: (index: number) => TOEICQuestion | null;
  getQuestionsByPart: (part: number) => TOEICQuestion[];
  getQuestionsByStatus: (status: 'pending' | 'valid' | 'invalid' | 'imported') => TOEICQuestion[];

  // Props
  className?: string;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

export const BulkUploadView: React.FC<BulkUploadViewProps> = ({
  questions,
  passages,
  loading,
  importing,
  progress,
  errors,
  onFileUpload,
  onDownloadTemplate,
  onImportQuestions,
  onReset,
  onClearQuestions,
  onUpdateQuestionStatus,
  getStatistics,
  getPartIcon,
  getPartColor,
  usesIndividualAudio,
  usesPassageAudio,
  getToeicPartInfo,
  getQuestion,
  getQuestionsByPart,
  getQuestionsByStatus,
  className = '',
  fileInputRef,
}) => {
  const statistics = getStatistics();
  const toeicPartInfo = getToeicPartInfo();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            TOEIC Parts Upload
          </CardTitle>
          <CardDescription>
            Upload TOEIC questions organized by Parts (1-7) with proper validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Upload TOEIC Questions Excel file
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supported formats: .xlsx, .xls
              </p>
              <Button onClick={() => fileInputRef?.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Template Download */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Download TOEIC Template</p>
                  <p className="text-sm">
                    Use our template to ensure proper formatting for TOEIC Parts 1-7
                  </p>
                  <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            {/* TOEIC Parts Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(toeicPartInfo).map(([part, info]: [string, any]) => (
                <Card key={part} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      Part {part}: {info.name}
                      {getPartIcon(parseInt(part)) === '🎧' ? (
                        <Headphones className="h-4 w-4" />
                      ) : (
                        <BookOpen className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-2">{info.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className={getPartColor(parseInt(part))}>
                        {info.type}
                      </Badge>
                      <span className="text-muted-foreground">{info.count} questions</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Preview Section */}
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Processing file...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No questions to preview</p>
                <p className="text-sm text-muted-foreground">Upload an Excel file first</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Valid</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{statistics.valid}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Invalid</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{statistics.invalid}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Imported</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{statistics.imported}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Import Button */}
                {statistics.valid > 0 && (
                  <div className="flex justify-center">
                    <Button 
                      onClick={onImportQuestions} 
                      disabled={importing}
                      size="lg"
                    >
                      {importing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing... ({Math.round(progress)}%)
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Import {statistics.valid} Questions
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Progress Bar */}
                {importing && (
                  <Progress value={progress} className="w-full" />
                )}

                {/* Questions List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questions.map((question, index) => (
                    <Card key={index} className={`border-l-4 ${
                      question.validation_status === 'valid' ? 'border-l-green-500' :
                      question.validation_status === 'invalid' ? 'border-l-red-500' :
                      'border-l-blue-500'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={getPartColor(question.part)}>
                                Part {question.part}
                              </Badge>
                              <Badge variant="outline">{question.difficulty}</Badge>
                              {question.validation_status === 'valid' && <CheckCircle className="h-4 w-4 text-green-600" />}
                              {question.validation_status === 'invalid' && <AlertCircle className="h-4 w-4 text-red-600" />}
                              {question.validation_status === 'imported' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                            </div>
                          </div>

                          {/* Question */}
                          <div>
                            {question.part === 1 ? (
                              <p className="font-medium text-sm text-blue-600">Part 1: Photos - Không có câu hỏi text</p>
                            ) : question.part === 2 ? (
                              <p className="font-medium text-sm text-green-600">Part 2: Question-Response - Chỉ có A, B, C</p>
                            ) : (
                              <p className="font-medium text-sm">{question.prompt_text}</p>
                            )}
                          </div>

                          {/* Choices */}
                          <div className={`grid gap-2 text-xs ${question.part === 2 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            <div className={`p-2 rounded ${question.correct_choice === 'A' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                              A. {question.choiceA || (question.part === 1 || question.part === 2 ? 'Chọn đáp án này' : 'Lựa chọn A')}
                            </div>
                            <div className={`p-2 rounded ${question.correct_choice === 'B' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                              B. {question.choiceB || (question.part === 1 || question.part === 2 ? 'Chọn đáp án này' : 'Lựa chọn B')}
                            </div>
                            <div className={`p-2 rounded ${question.correct_choice === 'C' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                              C. {question.choiceC || (question.part === 1 || question.part === 2 ? 'Chọn đáp án này' : 'Lựa chọn C')}
                            </div>
                            {question.part !== 2 && (
                              <div className={`p-2 rounded ${question.correct_choice === 'D' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                                D. {question.choiceD || (question.part === 1 ? 'Chọn đáp án này' : 'Lựa chọn D')}
                              </div>
                            )}
                          </div>

                          {/* Errors */}
                          {question.errors && question.errors.length > 0 && (
                            <div className="text-xs text-red-600">
                              <strong>Errors:</strong> {question.errors.join(', ')}
                            </div>
                          )}

                          {/* Additional Info */}
                          {(question.audio_url || question.transcript || question.image_url) && (
                            <div className="text-xs text-muted-foreground">
                              {question.audio_url && <span className="mr-2">🎵 Audio</span>}
                              {question.transcript && <span className="mr-2">📝 Transcript</span>}
                              {question.image_url && <span className="mr-2">🖼️ Image</span>}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
