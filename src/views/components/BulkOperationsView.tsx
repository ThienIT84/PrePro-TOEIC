/**
 * BulkOperationsView
 * Pure UI component cho Bulk Operations
 * Extracted từ BulkOperations.tsx
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { BulkQuestion } from '../controllers/bulk/BulkOperationsController';

export interface BulkOperationsViewProps {
  // State
  activeTab: string;
  questions: BulkQuestion[];
  loading: boolean;
  importing: boolean;
  progress: number;

  // Actions
  onSetActiveTab: (tab: string) => void;
  onFileUpload: (file: File) => Promise<void>;
  onImportQuestions: () => Promise<void>;
  onExportQuestions: () => Promise<void>;
  onGenerateTemplate: () => void;
  onFixQuestion: (index: number, field: keyof BulkQuestion, value: string) => void;
  onRemoveQuestion: (index: number) => void;

  // Data getters
  getQuestionCounts: () => {
    total: number;
    valid: number;
    invalid: number;
    imported: number;
  };
  getValidQuestions: () => BulkQuestion[];
  getInvalidQuestions: () => BulkQuestion[];
  getImportedQuestions: () => BulkQuestion[];

  // State checks
  canImport: () => boolean;
  isImporting: () => boolean;
  isLoading: () => boolean;
  getProgress: () => number;
  getActiveTab: () => string;
  getQuestions: () => BulkQuestion[];

  // Utility functions
  clearQuestions: () => void;
  resetState: () => void;

  // Props
  className?: string;
}

const BulkOperationsView: React.FC<BulkOperationsViewProps> = ({
  activeTab,
  questions,
  loading,
  importing,
  progress,
  onSetActiveTab,
  onFileUpload,
  onImportQuestions,
  onExportQuestions,
  onGenerateTemplate,
  onFixQuestion,
  onRemoveQuestion,
  getQuestionCounts,
  getValidQuestions,
  getInvalidQuestions,
  getImportedQuestions,
  canImport,
  isImporting,
  isLoading,
  getProgress,
  getActiveTab,
  getQuestions,
  clearQuestions,
  resetState,
  className = ''
}) => {
  const questionCounts = getQuestionCounts();
  const validCount = questionCounts.valid;
  const invalidCount = questionCounts.invalid;
  const importedCount = questionCounts.imported;

  // Handle file input change
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onFileUpload(file);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk Question Operations
          </CardTitle>
          <CardDescription>
            Import/export questions in bulk using Excel files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={onSetActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import Questions</TabsTrigger>
              <TabsTrigger value="export">Export Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Upload Excel file with questions
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: .xlsx, .xls
                </p>
                <Button onClick={() => {
                  const fileInput = document.getElementById('file-input') as HTMLInputElement;
                  fileInput?.click();
                }}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* Template Download */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>Download template to see the required format</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onGenerateTemplate}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Progress */}
              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing questions...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {/* Questions List */}
              {questions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="default">{validCount} Valid</Badge>
                      <Badge variant="destructive">{invalidCount} Invalid</Badge>
                      <Badge variant="secondary">{importedCount} Imported</Badge>
                    </div>
                    <Button
                      onClick={onImportQuestions}
                      disabled={!canImport()}
                    >
                      {isImporting() ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Import {validCount} Questions
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {questions.map((question, index) => (
                      <Card key={index} className={`${
                        question.status === 'valid' ? 'border-green-200' :
                        question.status === 'invalid' ? 'border-red-200' :
                        question.status === 'imported' ? 'border-blue-200' : ''
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">#{index + 1}</Badge>
                                <Badge variant={
                                  question.status === 'valid' ? 'default' :
                                  question.status === 'invalid' ? 'destructive' :
                                  'secondary'
                                }>
                                  {question.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {question.type}
                                </span>
                              </div>
                              
                              <Textarea
                                value={question.question}
                                onChange={(e) => onFixQuestion(index, 'question', e.target.value)}
                                placeholder="Question text..."
                                rows={2}
                                className="text-sm"
                              />
                              
                              <div className="grid grid-cols-2 gap-2">
                                {['A', 'B', 'C', 'D'].map(choice => (
                                  <div key={choice} className="flex items-center gap-2">
                                    <Label className="w-4 text-xs">{choice}</Label>
                                    <Input
                                      value={question[`choice${choice}` as keyof BulkQuestion] as string}
                                      onChange={(e) => onFixQuestion(index, `choice${choice}` as keyof BulkQuestion, e.target.value)}
                                      placeholder={`Choice ${choice}`}
                                      className="text-sm"
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Answer:</Label>
                                <Select
                                  value={question.answer}
                                  onValueChange={(value) => onFixQuestion(index, 'answer', value)}
                                >
                                  <SelectTrigger className="w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="B">B</SelectItem>
                                    <SelectItem value="C">C</SelectItem>
                                    <SelectItem value="D">D</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {question.errors && question.errors.length > 0 && (
                                <div className="text-xs text-red-600">
                                  {question.errors.join(', ')}
                                </div>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveQuestion(index)}
                              disabled={question.status === 'imported'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="text-center py-8">
                <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Export all questions to Excel
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all questions in your database as an Excel file
                </p>
                <Button onClick={onExportQuestions}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Questions
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOperationsView;
