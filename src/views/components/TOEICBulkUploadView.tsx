import React, { useRef, useState } from 'react';
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
  X,
  Eye,
  Trash2
} from 'lucide-react';
import { TOEICBulkUploadController, TOEICQuestion, TOEICPassage, ImportResult } from '@/controllers/upload/TOEICBulkUploadController';

interface TOEICBulkUploadViewProps {
  controller: TOEICBulkUploadController;
  state: {
    questions: TOEICQuestion[];
    passages: TOEICPassage[];
    progress: {
      status: 'idle' | 'processing' | 'importing' | 'completed' | 'error';
      current: number;
      total: number;
      percentage: number;
      error: string | null;
    };
    loading: boolean;
    error: string | null;
  };
  onFileSelect: (file: File) => void;
  onImportQuestions: (questions: TOEICQuestion[]) => void;
  onImportPassages: (passages: TOEICPassage[]) => void;
  onDownloadTemplate: () => void;
  onReset: () => void;
}

export const TOEICBulkUploadView: React.FC<TOEICBulkUploadViewProps> = ({
  controller,
  state,
  onFileSelect,
  onImportQuestions,
  onImportPassages,
  onDownloadTemplate,
  onReset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const { questions, passages, progress, loading, error } = state;

  // Event Handlers
  const handleFileSelect = (file: File) => {
    onFileSelect(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImportQuestions = () => {
    onImportQuestions(questions);
  };

  const handleImportPassages = () => {
    onImportPassages(passages);
  };

  const handleDownloadTemplate = () => {
    onDownloadTemplate();
  };

  const handleReset = () => {
    onReset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render Methods
  const renderLoading = () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Processing file...</span>
    </div>
  );

  const renderError = () => (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  const renderFileUpload = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Excel File
        </CardTitle>
        <CardDescription>
          Upload an Excel file containing TOEIC questions and passages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </label>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Excel files (.xlsx, .xls) up to 50MB
          </p>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderProgress = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Import Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <Progress value={progress.percentage} className="w-full" />
          <div className="text-center text-sm text-gray-600">
            {progress.percentage}% complete
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuestions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Questions ({questions.length})
        </CardTitle>
        <CardDescription>
          Review and import questions from the Excel file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questions.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Badge variant="outline">
                  Total: {questions.length}
                </Badge>
                <Badge variant="outline">
                  Valid: {questions.filter(q => q.validation_status === 'valid').length}
                </Badge>
                <Badge variant="outline">
                  Invalid: {questions.filter(q => q.validation_status === 'invalid').length}
                </Badge>
              </div>
              <Button onClick={handleImportQuestions} disabled={loading}>
                <Upload className="h-4 w-4 mr-2" />
                Import Questions
              </Button>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {questions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4 mb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Part {question.part}</Badge>
                      <Badge variant={question.validation_status === 'valid' ? 'default' : 'destructive'}>
                        {question.validation_status}
                      </Badge>
                      <Badge variant="outline">{question.difficulty}</Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{question.prompt_text}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>A. {question.choiceA}</div>
                      <div>B. {question.choiceB}</div>
                      <div>C. {question.choiceC}</div>
                      <div>D. {question.choiceD}</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Correct: {question.correct_choice}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {question.errors && question.errors.length > 0 && (
                  <div className="mt-2 text-xs text-red-600">
                    {question.errors.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPassages = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Passages ({passages.length})
        </CardTitle>
        <CardDescription>
          Review and import passages from the Excel file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {passages.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Badge variant="outline">
                  Total: {passages.length}
                </Badge>
              </div>
              <Button onClick={handleImportPassages} disabled={loading}>
                <Upload className="h-4 w-4 mr-2" />
                Import Passages
              </Button>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {passages.map((passage, index) => (
              <div key={index} className="border rounded-lg p-4 mb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Part {passage.part}</Badge>
                      <Badge variant="outline">{passage.passage_type}</Badge>
                    </div>
                    <h4 className="font-medium mb-1">{passage.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {passage.content}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      {passage.word_count && `${passage.word_count} words`}
                      {passage.topic && ` • ${passage.topic}`}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderImportResult = (result: ImportResult) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Import Complete
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{result.success}</div>
              <div className="text-sm text-gray-600">Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{result.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{result.success + result.failed}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Errors:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {result.errors.map((error, index) => (
                  <div key={index} className="text-xs text-red-600 p-2 bg-red-50 rounded">
                    Row {error.row}: {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">TOEIC Bulk Upload</h1>
        <p className="text-gray-600 mt-2">Upload and import TOEIC questions and passages from Excel files</p>
      </div>

      {loading && renderLoading()}
      {error && renderError()}

      <div className="space-y-6">
        {renderFileUpload()}
        
        {progress.status === 'importing' && renderProgress()}
        
        {questions.length > 0 && renderQuestions()}
        
        {passages.length > 0 && renderPassages()}
      </div>
    </div>
  );
};

