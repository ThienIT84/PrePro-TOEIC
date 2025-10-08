import React, { useState, useRef } from 'react';
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
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface BulkQuestion {
  id?: string;
  type: string;
  question: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  answer: string;
  explanation: string;
  tags: string;
  audio_url?: string;
  transcript?: string;
  status: 'pending' | 'valid' | 'invalid' | 'imported';
  errors?: string[];
}

interface BulkOperationsProps {
  onQuestionsImported?: (count: number) => void;
  className?: string;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  onQuestionsImported,
  className = ''
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('import');
  const [questions, setQuestions] = useState<BulkQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setQuestions([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parsedQuestions: BulkQuestion[] = jsonData.map((row: unknown, index: number) => {
        const question: BulkQuestion = {
          type: row.type || 'vocab',
          question: row.question || '',
          choiceA: row.choiceA || row['Choice A'] || '',
          choiceB: row.choiceB || row['Choice B'] || '',
          choiceC: row.choiceC || row['Choice C'] || '',
          choiceD: row.choiceD || row['Choice D'] || '',
          answer: row.answer || row.correct_answer || '',
          explanation: row.explanation || row.explain_vi || '',
          tags: row.tags || '',
          audio_url: row.audio_url || '',
          transcript: row.transcript || '',
          status: 'pending'
        };

        // Validate question
        const errors: string[] = [];
        if (!question.question.trim()) errors.push('Question text is required');
        if (!question.choiceA.trim()) errors.push('Choice A is required');
        if (!question.choiceB.trim()) errors.push('Choice B is required');
        if (!question.answer.trim()) errors.push('Correct answer is required');
        if (!['A', 'B', 'C', 'D'].includes(question.answer.toUpperCase())) {
          errors.push('Answer must be A, B, C, or D');
        }

        question.errors = errors;
        question.status = errors.length > 0 ? 'invalid' : 'valid';

        return question;
      });

      setQuestions(parsedQuestions);
      
      const validCount = parsedQuestions.filter(q => q.status === 'valid').length;
      const invalidCount = parsedQuestions.filter(q => q.status === 'invalid').length;

      toast({
        title: "File processed",
        description: `${validCount} valid questions, ${invalidCount} invalid questions`,
      });

    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importQuestions = async () => {
    if (!user) return;

    const validQuestions = questions.filter(q => q.status === 'valid');
    if (validQuestions.length === 0) {
      toast({
        title: "No valid questions",
        description: "Please fix invalid questions before importing",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      let importedCount = 0;
      const batchSize = 10;

      for (let i = 0; i < validQuestions.length; i += batchSize) {
        const batch = validQuestions.slice(i, i + batchSize);
        
        const questionsToInsert = batch.map(q => ({
          type: q.type,
          question: q.question.trim(),
          choices: [q.choiceA.trim(), q.choiceB.trim(), q.choiceC.trim(), q.choiceD.trim()],
          answer: q.answer.toUpperCase(),
          explain_vi: q.explanation.trim(),
          explain_en: q.explanation.trim(),
          audio_url: q.audio_url || null,
          transcript: q.transcript?.trim() || null,
          tags: q.tags ? q.tags.split(',').map(t => t.trim()) : []
        }));

        const { error } = await supabase
          .from('questions')
          .insert(questionsToInsert);

        if (error) throw error;

        importedCount += batch.length;
        setProgress((importedCount / validQuestions.length) * 100);

        // Update status
        setQuestions(prev => prev.map(q => 
          batch.includes(q) ? { ...q, status: 'imported' as const } : q
        ));

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: "Import successful",
        description: `${importedCount} questions imported successfully`,
      });

      onQuestionsImported?.(importedCount);

    } catch (error: unknown) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const exportQuestions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const exportData = data.map(item => ({
        type: item.type,
        question: item.question,
        'Choice A': item.choices[0] || '',
        'Choice B': item.choices[1] || '',
        'Choice C': item.choices[2] || '',
        'Choice D': item.choices[3] || '',
        correct_answer: item.answer,
        explain_vi: item.explain_vi,
        explain_en: item.explain_en,
        audio_url: item.audio_url || '',
        transcript: item.transcript || '',
        tags: item.tags?.join(', ') || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

      XLSX.writeFile(workbook, `toeic_questions_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export successful",
        description: `${data.length} questions exported to Excel file`,
      });

    } catch (error: unknown) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fixQuestion = (index: number, field: keyof BulkQuestion, value: string) => {
    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      
      // Re-validate
      const errors: string[] = [];
      const q = newQuestions[index];
      if (!q.question.trim()) errors.push('Question text is required');
      if (!q.choiceA.trim()) errors.push('Choice A is required');
      if (!q.choiceB.trim()) errors.push('Choice B is required');
      if (!q.answer.trim()) errors.push('Correct answer is required');
      if (!['A', 'B', 'C', 'D'].includes(q.answer.toUpperCase())) {
        errors.push('Answer must be A, B, C, or D');
      }

      newQuestions[index].errors = errors;
      newQuestions[index].status = errors.length > 0 ? 'invalid' : 'valid';
      
      return newQuestions;
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const validCount = questions.filter(q => q.status === 'valid').length;
  const invalidCount = questions.filter(q => q.status === 'invalid').length;
  const importedCount = questions.filter(q => q.status === 'imported').length;

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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
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
                      onClick={() => {
                        const template = [
                          {
                            type: 'vocab',
                            question: 'What is the meaning of "abundant"?',
                            'Choice A': 'scarce',
                            'Choice B': 'plentiful',
                            'Choice C': 'rare',
                            'Choice D': 'limited',
                            correct_answer: 'B',
                            explain_vi: 'Abundant có nghĩa là dồi dào, phong phú',
                            explain_en: 'Abundant means existing in large quantities',
                            tags: 'vocabulary, common words'
                          }
                        ];

                        const worksheet = XLSX.utils.json_to_sheet(template);
                        const workbook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
                        XLSX.writeFile(workbook, 'question_template.xlsx');
                      }}
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
                      onClick={importQuestions}
                      disabled={importing || validCount === 0}
                    >
                      {importing ? (
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
                                onChange={(e) => fixQuestion(index, 'question', e.target.value)}
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
                                      onChange={(e) => fixQuestion(index, `choice${choice}` as keyof BulkQuestion, e.target.value)}
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
                                  onValueChange={(value) => fixQuestion(index, 'answer', value)}
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
                              onClick={() => removeQuestion(index)}
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
                <Button onClick={exportQuestions}>
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

export default BulkOperations;
