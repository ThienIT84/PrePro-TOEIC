import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  examSetId: string;
  onSuccess: () => void;
}

interface QuestionRow {
  question: string;
  choices: string;
  answer: string;
  explain_vi: string;
  explain_en: string;
  type: string;
  difficulty: string;
  audio_url?: string;
  transcript?: string;
  tags?: string;
}

const ExcelUpload = ({ examSetId, onSuccess }: ExcelUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [
      {
        question: "What is the capital of France?",
        choices: "London|Paris|Berlin|Madrid",
        answer: "B",
        explain_vi: "Thủ đô của Pháp là Paris",
        explain_en: "The capital of France is Paris",
        type: "vocab",
        difficulty: "easy",
        audio_url: "",
        transcript: "",
        tags: "geography,capital"
      },
      {
        question: "Choose the correct form: She _____ to school every day.",
        choices: "go|goes|going|went",
        answer: "B",
        explain_vi: "Chủ ngữ 'She' là ngôi thứ 3 số ít nên động từ phải thêm 's'",
        explain_en: "Subject 'She' is third person singular, so verb needs 's'",
        type: "grammar",
        difficulty: "medium",
        audio_url: "",
        transcript: "",
        tags: "grammar,present-simple"
      },
      {
        question: "Listen to the conversation and answer: What time is the meeting?",
        choices: "9:00 AM|10:00 AM|11:00 AM|2:00 PM",
        answer: "B",
        explain_vi: "Cuộc họp được lên lịch lúc 10:00 sáng",
        explain_en: "The meeting is scheduled for 10:00 AM",
        type: "listening",
        difficulty: "medium",
        audio_url: "https://example.com/audio.mp3",
        transcript: "A: What time is the board meeting? B: It's at 10:00 AM.",
        tags: "listening,time,meeting"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    
    XLSX.writeFile(wb, 'question_template.xlsx');
    
    toast({
      title: "Thành công",
      description: "Đã tải template Excel",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    setSuccessCount(0);
    setErrorCount(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as QuestionRow[];

      console.log('Parsed Excel data:', jsonData);

      let success = 0;
      let errors = 0;

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        try {
          // Validate required fields
          if (!row.question || !row.choices || !row.answer || !row.explain_vi || !row.explain_en) {
            throw new Error(`Row ${i + 1}: Missing required fields`);
          }

          // Parse choices
          const choices = row.choices.split('|').map(choice => choice.trim());
          if (choices.length !== 4) {
            throw new Error(`Row ${i + 1}: Must have exactly 4 choices`);
          }

          // Parse tags
          const tags = row.tags ? row.tags.split(',').map(tag => tag.trim()) : [];

          // Create question data
          const questionData = {
            type: row.type || 'vocab',
            difficulty: row.difficulty || 'medium',
            question: row.question.trim(),
            choices: choices,
            answer: row.answer.trim(),
            explain_vi: row.explain_vi.trim(),
            explain_en: row.explain_en.trim(),
            audio_url: row.audio_url?.trim() || null,
            transcript: row.transcript?.trim() || null,
            tags: tags
          };

          console.log(`Processing row ${i + 1}:`, questionData);

          // Insert question
          const { data: question, error: questionError } = await supabase
            .from('questions')
            .insert([questionData])
            .select()
            .single();

          if (questionError) throw questionError;

          // Add to exam set
          const maxOrder = await supabase
            .from('exam_questions')
            .select('order_index')
            .eq('exam_set_id', examSetId)
            .order('order_index', { ascending: false })
            .limit(1);

          const nextOrder = maxOrder.data?.[0]?.order_index || -1;

          const { error: examError } = await supabase
            .from('exam_questions')
            .insert([{
              exam_set_id: examSetId,
              question_id: question.id,
              order_index: nextOrder + 1
            }]);

          if (examError) throw examError;

          success++;
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errors++;
        }

        // Update progress
        const progress = ((i + 1) / jsonData.length) * 100;
        setUploadProgress(progress);
      }

      setSuccessCount(success);
      setErrorCount(errors);
      setUploadStatus(success > 0 ? 'success' : 'error');
      
      if (success > 0) {
        toast({
          title: "Thành công",
          description: `Đã thêm ${success} câu hỏi vào bộ đề`,
        });
        onSuccess();
      }

      if (errors > 0) {
        setErrorMessage(`${errors} câu hỏi có lỗi và không được thêm`);
      }

    } catch (error) {
      console.error('Error processing Excel file:', error);
      setUploadStatus('error');
      setErrorMessage('Có lỗi khi xử lý file Excel');
      toast({
        title: "Lỗi",
        description: "Không thể xử lý file Excel",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Tải template Excel để biết định dạng câu hỏi
              </p>
              <div className="text-xs text-muted-foreground">
                <p>• <strong>question:</strong> Nội dung câu hỏi</p>
                <p>• <strong>choices:</strong> Các lựa chọn (phân cách bằng |)</p>
                <p>• <strong>answer:</strong> Đáp án đúng (A, B, C, hoặc D)</p>
                <p>• <strong>explain_vi:</strong> Giải thích tiếng Việt</p>
                <p>• <strong>explain_en:</strong> Giải thích tiếng Anh</p>
                <p>• <strong>type:</strong> vocab, grammar, listening, reading</p>
                <p>• <strong>difficulty:</strong> easy, medium, hard</p>
                <p>• <strong>tags:</strong> Các tag (phân cách bằng dấu phẩy)</p>
              </div>
            </div>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Tải Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload File Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isUploading ? 'Đang xử lý...' : 'Chọn file Excel'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Kéo thả file Excel vào đây hoặc click để chọn
              </p>
              <Button disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Đang xử lý...' : 'Chọn File'}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiến độ upload</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Status */}
            {uploadStatus === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Thành công! Đã thêm {successCount} câu hỏi vào bộ đề.
                  {errorCount > 0 && ` ${errorCount} câu hỏi có lỗi.`}
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage || 'Có lỗi xảy ra khi upload file'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelUpload;
