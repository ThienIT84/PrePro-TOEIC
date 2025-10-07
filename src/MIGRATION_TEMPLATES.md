# 🚀 MIGRATION CODE TEMPLATES

**Ready-to-use templates** cho migration từ Monolithic → MVC pattern.

---

## 📋 **TEMPLATE 1: CONTROLLER**

### **Base Controller Template**
```typescript
// src/controllers/[domain]/[ComponentName]Controller.ts
import { [Domain]Service } from '@/services/domains/[Domain]Service';
import { ValidationService } from '@/services/domains/ValidationService';
import { [ComponentName]State, [ComponentName]Actions } from '@/types/[domain]';

export class [ComponentName]Controller {
  private [domain]Service: [Domain]Service;
  private validationService: ValidationService;
  private state: [ComponentName]State;

  constructor() {
    this.[domain]Service = new [Domain]Service();
    this.validationService = new ValidationService();
    this.state = this.getInitialState();
  }

  // Initial State
  private getInitialState(): [ComponentName]State {
    return {
      data: [],
      loading: false,
      error: null,
      filters: {},
      pagination: { page: 1, limit: 10, total: 0 },
      selectedItems: [],
      // Add other state properties
    };
  }

  // State Management
  getState(): [ComponentName]State {
    return { ...this.state };
  }

  updateState(updates: Partial<[ComponentName]State>): void {
    this.state = { ...this.state, ...updates };
  }

  // Business Logic Methods
  async [actionName]([params]): Promise<[ReturnType]> {
    try {
      this.updateState({ loading: true, error: null });
      
      // Validation
      const validation = this.validationService.validate[ActionName]([params]);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Business logic
      const result = await this.[domain]Service.[actionName]([params]);
      
      // Update state
      this.updateState({ 
        loading: false, 
        data: result,
        error: null 
      });

      return result;
    } catch (error) {
      this.updateState({ 
        loading: false, 
        error: error.message 
      });
      throw error;
    }
  }

  // Validation Methods
  validate[ActionName]([params]): ValidationResult {
    // Validation logic
    return {
      isValid: true,
      message: '',
      errors: []
    };
  }

  // Utility Methods
  resetState(): void {
    this.state = this.getInitialState();
  }

  clearError(): void {
    this.updateState({ error: null });
  }
}
```

### **Question Controller Template**
```typescript
// src/controllers/question/QuestionCreatorController.ts
import { QuestionService } from '@/services/domains/QuestionService';
import { FileService } from '@/services/domains/FileService';
import { ValidationService } from '@/services/domains/ValidationService';
import { Question, QuestionCreateData, ValidationResult } from '@/types/question';

export class QuestionCreatorController {
  private questionService: QuestionService;
  private fileService: FileService;
  private validationService: ValidationService;

  constructor() {
    this.questionService = new QuestionService();
    this.fileService = new FileService();
    this.validationService = new ValidationService();
  }

  // Question Creation
  async createQuestion(data: QuestionCreateData): Promise<Question> {
    try {
      // Validate data
      const validation = this.validateQuestionData(data);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Create question
      const question = await this.questionService.createQuestion(data);
      return question;
    } catch (error) {
      throw new Error(`Failed to create question: ${error.message}`);
    }
  }

  // File Upload
  async uploadAudio(file: File): Promise<string> {
    try {
      // Validate file
      const validation = this.validateAudioFile(file);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Upload file
      const url = await this.fileService.uploadAudio(file);
      return url;
    } catch (error) {
      throw new Error(`Failed to upload audio: ${error.message}`);
    }
  }

  // Validation
  validateQuestionData(data: QuestionCreateData): ValidationResult {
    const errors: string[] = [];

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Question content is required');
    }

    if (!data.type) {
      errors.push('Question type is required');
    }

    if (!data.difficulty) {
      errors.push('Difficulty level is required');
    }

    if (data.type === 'listening' && !data.audioUrl) {
      errors.push('Audio file is required for listening questions');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }

  validateAudioFile(file: File): ValidationResult {
    const errors: string[] = [];

    if (!file) {
      errors.push('File is required');
    }

    if (file && file.size > 10 * 1024 * 1024) { // 10MB
      errors.push('File size must be less than 10MB');
    }

    if (file && !file.type.startsWith('audio/')) {
      errors.push('File must be an audio file');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }
}
```

### **Bulk Upload Controller Template**
```typescript
// src/controllers/upload/BulkUploadController.ts
import { QuestionService } from '@/services/domains/QuestionService';
import { ExcelService } from '@/services/domains/ExcelService';
import { ValidationService } from '@/services/domains/ValidationService';
import { ProcessedExcelData, ImportResult, ImportProgress } from '@/types/upload';

export class BulkUploadController {
  private questionService: QuestionService;
  private excelService: ExcelService;
  private validationService: ValidationService;
  private progress: ImportProgress;

  constructor() {
    this.questionService = new QuestionService();
    this.excelService = new ExcelService();
    this.validationService = new ValidationService();
    this.progress = this.getInitialProgress();
  }

  // Excel Processing
  async processExcelFile(file: File): Promise<ProcessedExcelData> {
    try {
      // Validate file
      const validation = this.validateExcelFile(file);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Process Excel
      const data = await this.excelService.processExcelFile(file);
      return data;
    } catch (error) {
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }

  // Data Validation
  async validateExcelData(data: ProcessedExcelData): Promise<ValidationResult> {
    try {
      const validation = await this.validationService.validateExcelData(data);
      return validation;
    } catch (error) {
      throw new Error(`Failed to validate Excel data: ${error.message}`);
    }
  }

  // Import Questions
  async importQuestions(data: ProcessedExcelData): Promise<ImportResult> {
    try {
      this.updateProgress({ status: 'importing', current: 0, total: data.questions.length });

      const results: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < data.questions.length; i++) {
        try {
          await this.questionService.createQuestion(data.questions[i]);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            question: data.questions[i],
            error: error.message
          });
        }

        // Update progress
        this.updateProgress({
          current: i + 1,
          percentage: Math.round(((i + 1) / data.questions.length) * 100)
        });
      }

      this.updateProgress({ status: 'completed' });
      return results;
    } catch (error) {
      this.updateProgress({ status: 'error', error: error.message });
      throw error;
    }
  }

  // Progress Management
  getProgress(): ImportProgress {
    return { ...this.progress };
  }

  updateProgress(updates: Partial<ImportProgress>): void {
    this.progress = { ...this.progress, ...updates };
  }

  // Validation
  validateExcelFile(file: File): ValidationResult {
    const errors: string[] = [];

    if (!file) {
      errors.push('File is required');
    }

    if (file && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      errors.push('File must be an Excel file (.xlsx or .xls)');
    }

    if (file && file.size > 50 * 1024 * 1024) { // 50MB
      errors.push('File size must be less than 50MB');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }

  private getInitialProgress(): ImportProgress {
    return {
      status: 'idle',
      current: 0,
      total: 0,
      percentage: 0,
      error: null
    };
  }
}
```

---

## 📋 **TEMPLATE 2: VIEW**

### **Base View Template**
```typescript
// src/views/components/[ComponentName]View.tsx
import React from 'react';
import { [ComponentName]Controller } from '@/controllers/[domain]/[ComponentName]Controller';
import { [ComponentName]State } from '@/types/[domain]';

interface [ComponentName]ViewProps {
  controller: [ComponentName]Controller;
  state: [ComponentName]State;
  onAction: (action: string, ...args: any[]) => void;
}

export const [ComponentName]View: React.FC<[ComponentName]ViewProps> = ({
  controller,
  state,
  onAction
}) => {
  const { data, loading, error, filters, pagination, selectedItems } = state;

  // Event Handlers
  const handleAction = (action: string, ...args: any[]) => {
    onAction(action, ...args);
  };

  // Render Methods
  const renderLoading = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );

  const renderError = () => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">[Component Name]</h1>
        <button
          onClick={() => handleAction('create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Create New
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter controls */}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Table content */}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        {/* Pagination controls */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && renderLoading()}
      {error && renderError()}
      {!loading && !error && renderContent()}
    </div>
  );
};
```

### **Question Creator View Template**
```typescript
// src/views/components/QuestionCreatorView.tsx
import React, { useState } from 'react';
import { QuestionCreatorController } from '@/controllers/question/QuestionCreatorController';
import { QuestionCreateData, QuestionType, Difficulty } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Save } from 'lucide-react';

interface QuestionCreatorViewProps {
  controller: QuestionCreatorController;
  formData: QuestionCreateData;
  loading: boolean;
  error: string | null;
  onFormUpdate: (updates: Partial<QuestionCreateData>) => void;
  onSubmit: (data: QuestionCreateData) => void;
  onFileUpload: (file: File) => void;
  onReset: () => void;
}

export const QuestionCreatorView: React.FC<QuestionCreatorViewProps> = ({
  controller,
  formData,
  loading,
  error,
  onFormUpdate,
  onSubmit,
  onFileUpload,
  onReset
}) => {
  const [dragActive, setDragActive] = useState(false);

  // Form Handlers
  const handleInputChange = (field: keyof QuestionCreateData, value: any) => {
    onFormUpdate({ [field]: value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
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
      onFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Create New Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Question Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Question Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter question content..."
                rows={4}
                required
              />
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Question Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value as QuestionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="grammar">Grammar</SelectItem>
                  <SelectItem value="vocabulary">Vocabulary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => handleInputChange('difficulty', value as Difficulty)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audio Upload (for listening questions) */}
            {formData.type === 'listening' && (
              <div className="space-y-2">
                <Label>Audio File *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </label>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    MP3, WAV, M4A up to 10MB
                  </p>
                </div>
                {formData.audioUrl && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-green-600">✓ Audio uploaded</span>
                    <button
                      type="button"
                      onClick={() => handleInputChange('audioUrl', '')}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-4">
              <Label>Answer Options *</Label>
              {['A', 'B', 'C', 'D'].map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Label className="w-8">{option}.</Label>
                  <Input
                    value={formData.options?.[option] || ''}
                    onChange={(e) => handleInputChange('options', {
                      ...formData.options,
                      [option]: e.target.value
                    })}
                    placeholder={`Option ${option}`}
                    required
                  />
                </div>
              ))}
            </div>

            {/* Correct Answer */}
            <div className="space-y-2">
              <Label htmlFor="correctAnswer">Correct Answer *</Label>
              <Select
                value={formData.correctAnswer}
                onValueChange={(value) => handleInputChange('correctAnswer', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                value={formData.explanation || ''}
                onChange={(e) => handleInputChange('explanation', e.target.value)}
                placeholder="Enter explanation for the answer..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                disabled={loading}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? 'Creating...' : 'Create Question'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 📋 **TEMPLATE 3: HOOK**

### **Base Hook Template**
```typescript
// src/controllers/[domain]/use[ComponentName]Controller.ts
import { useState, useCallback, useEffect } from 'react';
import { [ComponentName]Controller } from './[ComponentName]Controller';
import { [ComponentName]State } from '@/types/[domain]';

export const use[ComponentName]Controller = () => {
  const [controller] = useState(() => new [ComponentName]Controller());
  const [state, setState] = useState<[ComponentName]State>(controller.getState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State Management
  const updateState = useCallback((updates: Partial<[ComponentName]State>) => {
    controller.updateState(updates);
    setState(controller.getState());
  }, [controller]);

  // Action Handlers
  const handleAction = useCallback(async (action: string, ...args: any[]) => {
    setLoading(true);
    setError(null);

    try {
      let result;
      
      switch (action) {
        case 'load':
          result = await controller.loadData();
          break;
        case 'create':
          result = await controller.createItem(args[0]);
          break;
        case 'update':
          result = await controller.updateItem(args[0], args[1]);
          break;
        case 'delete':
          result = await controller.deleteItem(args[0]);
          break;
        case 'search':
          result = await controller.searchItems(args[0]);
          break;
        case 'filter':
          result = await controller.filterItems(args[0]);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Update state with result
      updateState({ data: result });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, updateState]);

  // Specific Action Handlers
  const handleLoad = useCallback(() => {
    handleAction('load');
  }, [handleAction]);

  const handleCreate = useCallback((data: any) => {
    handleAction('create', data);
  }, [handleAction]);

  const handleUpdate = useCallback((id: string, data: any) => {
    handleAction('update', id, data);
  }, [handleAction]);

  const handleDelete = useCallback((id: string) => {
    handleAction('delete', id);
  }, [handleAction]);

  const handleSearch = useCallback((query: string) => {
    handleAction('search', query);
  }, [handleAction]);

  const handleFilter = useCallback((filters: any) => {
    handleAction('filter', filters);
  }, [handleAction]);

  // Auto-load on mount
  useEffect(() => {
    handleLoad();
  }, [handleLoad]);

  return {
    // State
    ...state,
    loading,
    error,
    
    // Actions
    handleLoad,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSearch,
    handleFilter,
    
    // Utility
    clearError: () => setError(null),
    reset: () => {
      controller.resetState();
      setState(controller.getState());
    }
  };
};
```

### **Question Creator Hook Template**
```typescript
// src/controllers/question/useQuestionCreatorController.ts
import { useState, useCallback } from 'react';
import { QuestionCreatorController } from './QuestionCreatorController';
import { QuestionCreateData, Question } from '@/types/question';

export const useQuestionCreatorController = () => {
  const [controller] = useState(() => new QuestionCreatorController());
  const [formData, setFormData] = useState<QuestionCreateData>({
    content: '',
    type: 'reading',
    difficulty: 'medium',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A',
    explanation: '',
    audioUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form Management
  const handleFormUpdate = useCallback((updates: Partial<QuestionCreateData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setError(null);
    setSuccess(false);
  }, []);

  const handleReset = useCallback(() => {
    setFormData({
      content: '',
      type: 'reading',
      difficulty: 'medium',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A',
      explanation: '',
      audioUrl: ''
    });
    setError(null);
    setSuccess(false);
  }, []);

  // Question Creation
  const handleSubmit = useCallback(async (data: QuestionCreateData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form data
      const validation = controller.validateQuestionData(data);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Create question
      const question = await controller.createQuestion(data);
      
      setSuccess(true);
      handleReset(); // Reset form after successful creation
      
      return question;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [controller, handleReset]);

  // File Upload
  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      // Validate file
      const validation = controller.validateAudioFile(file);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Upload file
      const audioUrl = await controller.uploadAudio(file);
      
      // Update form data with audio URL
      setFormData(prev => ({ ...prev, audioUrl }));
      
      return audioUrl;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Validation
  const validateForm = useCallback(() => {
    return controller.validateQuestionData(formData);
  }, [controller, formData]);

  // Utility
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  return {
    // Form State
    formData,
    loading,
    error,
    success,
    
    // Form Actions
    handleFormUpdate,
    handleReset,
    handleSubmit,
    handleFileUpload,
    
    // Validation
    validateForm,
    
    // Utility
    clearError,
    clearSuccess
  };
};
```

### **Bulk Upload Hook Template**
```typescript
// src/controllers/upload/useBulkUploadController.ts
import { useState, useCallback } from 'react';
import { BulkUploadController } from './BulkUploadController';
import { ProcessedExcelData, ImportResult, ImportProgress } from '@/types/upload';

export const useBulkUploadController = () => {
  const [controller] = useState(() => new BulkUploadController());
  const [progress, setProgress] = useState<ImportProgress>({
    status: 'idle',
    current: 0,
    total: 0,
    percentage: 0,
    error: null
  });
  const [processedData, setProcessedData] = useState<ProcessedExcelData | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File Processing
  const handleFileSelect = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setProcessedData(null);
    setImportResult(null);

    try {
      // Process Excel file
      const data = await controller.processExcelFile(file);
      setProcessedData(data);
      
      // Validate data
      const validation = await controller.validateExcelData(data);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Import Questions
  const handleImport = useCallback(async (data: ProcessedExcelData) => {
    setLoading(true);
    setError(null);
    setImportResult(null);

    try {
      // Start import process
      const result = await controller.importQuestions(data);
      setImportResult(result);
      
      // Reset processed data after successful import
      if (result.success > 0) {
        setProcessedData(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Progress Monitoring
  const updateProgress = useCallback(() => {
    const currentProgress = controller.getProgress();
    setProgress(currentProgress);
  }, [controller]);

  // Reset
  const handleReset = useCallback(() => {
    setProgress({
      status: 'idle',
      current: 0,
      total: 0,
      percentage: 0,
      error: null
    });
    setProcessedData(null);
    setImportResult(null);
    setError(null);
  }, []);

  // Utility
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    progress,
    processedData,
    importResult,
    loading,
    error,
    
    // Actions
    handleFileSelect,
    handleImport,
    handleReset,
    
    // Utility
    clearError,
    updateProgress
  };
};
```

---

## 📋 **TEMPLATE 4: MVC WRAPPER**

### **Base MVC Wrapper Template**
```typescript
// src/views/components/[ComponentName]MVC.tsx
import React from 'react';
import { [ComponentName]View } from './[ComponentName]View';
import { use[ComponentName]Controller } from '@/controllers/[domain]/use[ComponentName]Controller';

export const [ComponentName]MVC: React.FC = () => {
  const {
    // State
    data,
    loading,
    error,
    filters,
    pagination,
    selectedItems,
    
    // Actions
    handleLoad,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSearch,
    handleFilter,
    
    // Utility
    clearError,
    reset
  } = use[ComponentName]Controller();

  // Action Handler
  const handleAction = (action: string, ...args: any[]) => {
    switch (action) {
      case 'load':
        handleLoad();
        break;
      case 'create':
        handleCreate(args[0]);
        break;
      case 'update':
        handleUpdate(args[0], args[1]);
        break;
      case 'delete':
        handleDelete(args[0]);
        break;
      case 'search':
        handleSearch(args[0]);
        break;
      case 'filter':
        handleFilter(args[0]);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  return (
    <[ComponentName]View
      controller={undefined} // Not needed in MVC wrapper
      state={{
        data,
        loading,
        error,
        filters,
        pagination,
        selectedItems
      }}
      onAction={handleAction}
    />
  );
};
```

### **Question Creator MVC Template**
```typescript
// src/views/components/QuestionCreatorMVC.tsx
import React from 'react';
import { QuestionCreatorView } from './QuestionCreatorView';
import { useQuestionCreatorController } from '@/controllers/question/useQuestionCreatorController';

export const QuestionCreatorMVC: React.FC = () => {
  const {
    // Form State
    formData,
    loading,
    error,
    success,
    
    // Form Actions
    handleFormUpdate,
    handleReset,
    handleSubmit,
    handleFileUpload,
    
    // Validation
    validateForm,
    
    // Utility
    clearError,
    clearSuccess
  } = useQuestionCreatorController();

  return (
    <QuestionCreatorView
      controller={undefined} // Not needed in MVC wrapper
      formData={formData}
      loading={loading}
      error={error}
      onFormUpdate={handleFormUpdate}
      onSubmit={handleSubmit}
      onFileUpload={handleFileUpload}
      onReset={handleReset}
    />
  );
};
```

---

## 📋 **TEMPLATE 5: TESTING**

### **Controller Test Template**
```typescript
// src/controllers/[domain]/__tests__/[ComponentName]Controller.test.ts
import { [ComponentName]Controller } from '../[ComponentName]Controller';
import { [Domain]Service } from '@/services/domains/[Domain]Service';
import { ValidationService } from '@/services/domains/ValidationService';

// Mock services
jest.mock('@/services/domains/[Domain]Service');
jest.mock('@/services/domains/ValidationService');

describe('[ComponentName]Controller', () => {
  let controller: [ComponentName]Controller;
  let mock[Domain]Service: jest.Mocked<[Domain]Service>;
  let mockValidationService: jest.Mocked<ValidationService>;

  beforeEach(() => {
    mock[Domain]Service = new [Domain]Service() as jest.Mocked<[Domain]Service>;
    mockValidationService = new ValidationService() as jest.Mocked<ValidationService>;
    controller = new [ComponentName]Controller();
  });

  describe('[actionName]', () => {
    it('should [actionName] successfully', async () => {
      // Arrange
      const mockData = { /* mock data */ };
      const mockResult = { /* mock result */ };
      mock[Domain]Service.[actionName].mockResolvedValue(mockResult);

      // Act
      const result = await controller.[actionName](mockData);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mock[Domain]Service.[actionName]).toHaveBeenCalledWith(mockData);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const mockData = { /* invalid data */ };
      const mockValidation = {
        isValid: false,
        message: 'Validation failed',
        errors: ['Error 1', 'Error 2']
      };
      mockValidationService.validate[ActionName].mockReturnValue(mockValidation);

      // Act & Assert
      await expect(controller.[actionName](mockData)).rejects.toThrow('Validation failed');
    });

    it('should handle service errors', async () => {
      // Arrange
      const mockData = { /* mock data */ };
      const mockError = new Error('Service error');
      mock[Domain]Service.[actionName].mockRejectedValue(mockError);

      // Act & Assert
      await expect(controller.[actionName](mockData)).rejects.toThrow('Service error');
    });
  });

  describe('validation', () => {
    it('should validate data correctly', () => {
      // Arrange
      const validData = { /* valid data */ };
      const invalidData = { /* invalid data */ };

      // Act
      const validResult = controller.validate[ActionName](validData);
      const invalidResult = controller.validate[ActionName](invalidData);

      // Assert
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });
  });
});
```

### **Hook Test Template**
```typescript
// src/controllers/[domain]/__tests__/use[ComponentName]Controller.test.ts
import { renderHook, act } from '@testing-library/react';
import { use[ComponentName]Controller } from '../use[ComponentName]Controller';

// Mock the controller
jest.mock('../[ComponentName]Controller');

describe('use[ComponentName]Controller', () => {
  let mockController: any;

  beforeEach(() => {
    mockController = {
      getState: jest.fn(),
      updateState: jest.fn(),
      loadData: jest.fn(),
      createItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      searchItems: jest.fn(),
      filterItems: jest.fn(),
      resetState: jest.fn()
    };

    (use[ComponentName]Controller as any).mockImplementation(() => {
      const [controller] = useState(() => mockController);
      // ... rest of hook implementation
    });
  });

  describe('handleLoad', () => {
    it('should load data successfully', async () => {
      // Arrange
      const mockData = [{ id: 1, name: 'Test' }];
      mockController.loadData.mockResolvedValue(mockData);

      // Act
      const { result } = renderHook(() => use[ComponentName]Controller());
      await act(async () => {
        await result.current.handleLoad();
      });

      // Assert
      expect(mockController.loadData).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('handleCreate', () => {
    it('should create item successfully', async () => {
      // Arrange
      const mockItem = { name: 'New Item' };
      const mockCreatedItem = { id: 1, ...mockItem };
      mockController.createItem.mockResolvedValue(mockCreatedItem);

      // Act
      const { result } = renderHook(() => use[ComponentName]Controller());
      await act(async () => {
        await result.current.handleCreate(mockItem);
      });

      // Assert
      expect(mockController.createItem).toHaveBeenCalledWith(mockItem);
    });
  });
});
```

---

## 🚀 **USAGE INSTRUCTIONS**

### **1. Copy Templates**
- Copy the appropriate template for your component
- Replace `[ComponentName]`, `[domain]`, `[actionName]` with actual names
- Update types and interfaces as needed

### **2. Implement Business Logic**
- Add your specific business logic to the Controller
- Update validation rules
- Add error handling

### **3. Create UI Components**
- Use the View template as a starting point
- Customize the UI to match your design
- Add proper styling and interactions

### **4. Connect with React**
- Use the Hook template to connect Controller with React
- Handle state management
- Add event handlers

### **5. Test Thoroughly**
- Use the test templates
- Add more test cases as needed
- Ensure 100% functionality

### **6. Create MVC Wrapper**
- Use the MVC wrapper template
- Connect everything together
- Export the final component

**Ready to implement! 🚀**
