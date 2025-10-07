# 🚀 COMPLETE MIGRATION GUIDE - 16 Components

**Target**: Migrate 16 monolithic components → MVC pattern  
**Timeline**: 8-10 hours  
**Status**: Ready to implement

---

## 📋 **MIGRATION OVERVIEW**

### **Current Status:**
- ✅ **Completed**: 2/18 components (11%)
- 🚧 **In Progress**: 1/18 components (5.5%) 
- ⏳ **Pending**: 15/18 components (83.5%)

### **Target After Migration:**
- ✅ **Completed**: 18/18 components (100%)
- ✅ **All monolithic components replaced**
- ✅ **App.tsx updated to use MVC components**
- ✅ **Zero breaking changes**

---

## 🎯 **PRIORITY 1: CORE QUESTION COMPONENTS (4 tiếng)**

### **1. TOEICQuestionCreator.tsx (805 dòng) → MVC**

#### **A. Pre-Migration Analysis (30 phút)**
```typescript
// Current monolithic structure:
const TOEICQuestionCreator = () => {
  // 805 dòng code
  // Business logic + UI logic + state management
  // Form handling, validation, API calls, file upload
}
```

#### **B. Migration Steps (90 phút)**

**Step 1: Create Controller (30 phút)**
```typescript
// src/controllers/question/TOEICQuestionCreatorController.ts
export class TOEICQuestionCreatorController {
  private questionService: QuestionService;
  private fileService: FileService;
  
  constructor() {
    this.questionService = new QuestionService();
    this.fileService = new FileService();
  }

  // Business Logic Methods
  async createQuestion(data: QuestionCreateData): Promise<Question> {
    // Validation logic
    // API call logic
    // Error handling
  }

  async uploadAudio(file: File): Promise<string> {
    // File upload logic
    // Audio processing
  }

  validateQuestionData(data: QuestionCreateData): ValidationResult {
    // Validation rules
    // Business rules
  }

  // State Management
  getFormState(): FormState {
    // Return current form state
  }

  updateFormState(updates: Partial<FormState>): void {
    // Update form state
  }
}
```

**Step 2: Create View (30 phút)**
```typescript
// src/views/components/TOEICQuestionCreatorView.tsx
interface TOEICQuestionCreatorViewProps {
  controller: TOEICQuestionCreatorController;
  formState: FormState;
  onFormUpdate: (updates: Partial<FormState>) => void;
  onSubmit: (data: QuestionCreateData) => void;
  onFileUpload: (file: File) => void;
}

export const TOEICQuestionCreatorView: React.FC<TOEICQuestionCreatorViewProps> = ({
  controller,
  formState,
  onFormUpdate,
  onSubmit,
  onFileUpload
}) => {
  // Pure UI rendering only
  // No business logic
  // No state management
  // Just props and event handlers
}
```

**Step 3: Create Hook (30 phút)**
```typescript
// src/controllers/question/useTOEICQuestionCreatorController.ts
export const useTOEICQuestionCreatorController = () => {
  const [controller] = useState(() => new TOEICQuestionCreatorController());
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Event handlers
  const handleFormUpdate = useCallback((updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSubmit = useCallback(async (data: QuestionCreateData) => {
    setLoading(true);
    try {
      await controller.createQuestion(data);
      // Success handling
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const url = await controller.uploadAudio(file);
      handleFormUpdate({ audioUrl: url });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, handleFormUpdate]);

  return {
    formState,
    loading,
    error,
    handleFormUpdate,
    handleSubmit,
    handleFileUpload
  };
};
```

**Step 4: Create MVC Wrapper (15 phút)**
```typescript
// src/views/components/TOEICQuestionCreatorMVC.tsx
export const TOEICQuestionCreatorMVC: React.FC = () => {
  const {
    formState,
    loading,
    error,
    handleFormUpdate,
    handleSubmit,
    handleFileUpload
  } = useTOEICQuestionCreatorController();

  return (
    <TOEICQuestionCreatorView
      formState={formState}
      loading={loading}
      error={error}
      onFormUpdate={handleFormUpdate}
      onSubmit={handleSubmit}
      onFileUpload={handleFileUpload}
    />
  );
};
```

#### **C. Testing (30 phút)**
```typescript
// src/controllers/question/__tests__/TOEICQuestionCreatorController.test.ts
describe('TOEICQuestionCreatorController', () => {
  let controller: TOEICQuestionCreatorController;

  beforeEach(() => {
    controller = new TOEICQuestionCreatorController();
  });

  describe('createQuestion', () => {
    it('should create question successfully', async () => {
      // Test business logic
    });

    it('should validate question data', () => {
      // Test validation
    });

    it('should handle errors properly', async () => {
      // Test error handling
    });
  });

  describe('uploadAudio', () => {
    it('should upload audio file', async () => {
      // Test file upload
    });
  });
});
```

---

### **2. TOEICBulkUpload.tsx (770 dòng) → MVC**

#### **A. Pre-Migration Analysis (30 phút)**
```typescript
// Current monolithic structure:
const TOEICBulkUpload = () => {
  // 770 dòng code
  // Excel processing + UI logic + batch import
  // File validation, data transformation, progress tracking
}
```

#### **B. Migration Steps (90 phút)**

**Step 1: Create Controller (30 phút)**
```typescript
// src/controllers/upload/TOEICBulkUploadController.ts
export class TOEICBulkUploadController {
  private questionService: QuestionService;
  private fileService: FileService;
  private excelService: ExcelService;

  constructor() {
    this.questionService = new QuestionService();
    this.fileService = new FileService();
    this.excelService = new ExcelService();
  }

  // Excel Processing Methods
  async processExcelFile(file: File): Promise<ProcessedExcelData> {
    // Excel parsing logic
    // Data validation
    // Error handling
  }

  async validateExcelData(data: ProcessedExcelData): Promise<ValidationResult> {
    // Data validation rules
    // Business validation
  }

  async importQuestions(data: ProcessedExcelData): Promise<ImportResult> {
    // Batch import logic
    // Progress tracking
    // Error handling
  }

  // Progress Management
  getImportProgress(): ImportProgress {
    // Return current progress
  }

  updateProgress(progress: ImportProgress): void {
    // Update progress state
  }
}
```

**Step 2: Create View (30 phút)**
```typescript
// src/views/components/TOEICBulkUploadView.tsx
interface TOEICBulkUploadViewProps {
  controller: TOEICBulkUploadController;
  progress: ImportProgress;
  onFileSelect: (file: File) => void;
  onImport: (data: ProcessedExcelData) => void;
  onCancel: () => void;
}

export const TOEICBulkUploadView: React.FC<TOEICBulkUploadViewProps> = ({
  controller,
  progress,
  onFileSelect,
  onImport,
  onCancel
}) => {
  // Pure UI rendering
  // File upload UI
  // Progress display
  // Error display
}
```

**Step 3: Create Hook (30 phút)**
```typescript
// src/controllers/upload/useTOEICBulkUploadController.ts
export const useTOEICBulkUploadController = () => {
  const [controller] = useState(() => new TOEICBulkUploadController());
  const [progress, setProgress] = useState<ImportProgress>(initialProgress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const data = await controller.processExcelFile(file);
      // Handle processed data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  const handleImport = useCallback(async (data: ProcessedExcelData) => {
    setLoading(true);
    try {
      await controller.importQuestions(data);
      // Success handling
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  return {
    progress,
    loading,
    error,
    handleFileSelect,
    handleImport
  };
};
```

---

### **3. TOEICQuestionManager.tsx → MVC**

#### **A. Pre-Migration Analysis (30 phút)**
```typescript
// Current monolithic structure:
const TOEICQuestionManager = () => {
  // Question management + UI logic
  // CRUD operations, filtering, pagination
}
```

#### **B. Migration Steps (90 phút)**

**Step 1: Create Controller (30 phút)**
```typescript
// src/controllers/question/TOEICQuestionManagerController.ts
export class TOEICQuestionManagerController {
  private questionService: QuestionService;
  private filterService: FilterService;

  constructor() {
    this.questionService = new QuestionService();
    this.filterService = new FilterService();
  }

  // Question Management Methods
  async getQuestions(filters: QuestionFilters): Promise<Question[]> {
    // Fetch questions with filters
  }

  async updateQuestion(id: string, data: QuestionUpdateData): Promise<Question> {
    // Update question logic
  }

  async deleteQuestion(id: string): Promise<void> {
    // Delete question logic
  }

  async bulkDeleteQuestions(ids: string[]): Promise<void> {
    // Bulk delete logic
  }

  // Filter Management
  getFilters(): QuestionFilters {
    // Return current filters
  }

  updateFilters(filters: Partial<QuestionFilters>): void {
    // Update filters
  }

  // Pagination
  getPagination(): PaginationState {
    // Return pagination state
  }

  updatePagination(pagination: Partial<PaginationState>): void {
    // Update pagination
  }
}
```

**Step 2: Create View (30 phút)**
```typescript
// src/views/components/TOEICQuestionManagerView.tsx
interface TOEICQuestionManagerViewProps {
  controller: TOEICQuestionManagerController;
  questions: Question[];
  filters: QuestionFilters;
  pagination: PaginationState;
  onFilterChange: (filters: Partial<QuestionFilters>) => void;
  onPaginationChange: (pagination: Partial<PaginationState>) => void;
  onQuestionUpdate: (id: string, data: QuestionUpdateData) => void;
  onQuestionDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

export const TOEICQuestionManagerView: React.FC<TOEICQuestionManagerViewProps> = ({
  controller,
  questions,
  filters,
  pagination,
  onFilterChange,
  onPaginationChange,
  onQuestionUpdate,
  onQuestionDelete,
  onBulkDelete
}) => {
  // Pure UI rendering
  // Question list display
  // Filter controls
  // Pagination controls
  // Action buttons
}
```

**Step 3: Create Hook (30 phút)**
```typescript
// src/controllers/question/useTOEICQuestionManagerController.ts
export const useTOEICQuestionManagerController = () => {
  const [controller] = useState(() => new TOEICQuestionManagerController());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState<QuestionFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load questions
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await controller.getQuestions(filters);
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, filters]);

  // Filter handlers
  const handleFilterChange = useCallback((newFilters: Partial<QuestionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Question handlers
  const handleQuestionUpdate = useCallback(async (id: string, data: QuestionUpdateData) => {
    setLoading(true);
    try {
      await controller.updateQuestion(id, data);
      await loadQuestions(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadQuestions]);

  const handleQuestionDelete = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await controller.deleteQuestion(id);
      await loadQuestions(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadQuestions]);

  return {
    questions,
    filters,
    pagination,
    loading,
    error,
    loadQuestions,
    handleFilterChange,
    handleQuestionUpdate,
    handleQuestionDelete
  };
};
```

---

### **4. EnhancedExamSetCreator.tsx → MVC**

#### **A. Pre-Migration Analysis (30 phút)**
```typescript
// Current monolithic structure:
const EnhancedExamSetCreator = () => {
  // Exam set creation + UI logic
  // Question selection, time management, validation
}
```

#### **B. Migration Steps (90 phút)**

**Step 1: Create Controller (30 phút)**
```typescript
// src/controllers/exam/EnhancedExamSetCreatorController.ts
export class EnhancedExamSetCreatorController {
  private examService: ExamService;
  private questionService: QuestionService;
  private validationService: ValidationService;

  constructor() {
    this.examService = new ExamService();
    this.questionService = new QuestionService();
    this.validationService = new ValidationService();
  }

  // Exam Set Creation Methods
  async createExamSet(data: ExamSetCreateData): Promise<ExamSet> {
    // Create exam set logic
    // Validation
    // Question assignment
  }

  async addQuestionToExamSet(examSetId: string, questionId: string): Promise<void> {
    // Add question to exam set
  }

  async removeQuestionFromExamSet(examSetId: string, questionId: string): Promise<void> {
    // Remove question from exam set
  }

  // Question Selection
  async getAvailableQuestions(filters: QuestionFilters): Promise<Question[]> {
    // Get available questions for selection
  }

  async searchQuestions(query: string): Promise<Question[]> {
    // Search questions
  }

  // Validation
  validateExamSet(data: ExamSetCreateData): ValidationResult {
    // Validate exam set data
  }

  validateQuestionSelection(questions: Question[]): ValidationResult {
    // Validate question selection
  }
}
```

**Step 2: Create View (30 phút)**
```typescript
// src/views/components/EnhancedExamSetCreatorView.tsx
interface EnhancedExamSetCreatorViewProps {
  controller: EnhancedExamSetCreatorController;
  examSetData: ExamSetCreateData;
  availableQuestions: Question[];
  selectedQuestions: Question[];
  onExamSetDataChange: (data: Partial<ExamSetCreateData>) => void;
  onQuestionSelect: (question: Question) => void;
  onQuestionDeselect: (questionId: string) => void;
  onSearch: (query: string) => void;
  onSubmit: (data: ExamSetCreateData) => void;
}

export const EnhancedExamSetCreatorView: React.FC<EnhancedExamSetCreatorViewProps> = ({
  controller,
  examSetData,
  availableQuestions,
  selectedQuestions,
  onExamSetDataChange,
  onQuestionSelect,
  onQuestionDeselect,
  onSearch,
  onSubmit
}) => {
  // Pure UI rendering
  // Exam set form
  // Question selection interface
  // Search interface
  // Validation display
}
```

**Step 3: Create Hook (30 phút)**
```typescript
// src/controllers/exam/useEnhancedExamSetCreatorController.ts
export const useEnhancedExamSetCreatorController = () => {
  const [controller] = useState(() => new EnhancedExamSetCreatorController());
  const [examSetData, setExamSetData] = useState<ExamSetCreateData>(initialExamSetData);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available questions
  const loadAvailableQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const questions = await controller.getAvailableQuestions({});
      setAvailableQuestions(questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Search questions
  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const questions = await controller.searchQuestions(query);
      setAvailableQuestions(questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Question selection
  const handleQuestionSelect = useCallback((question: Question) => {
    setSelectedQuestions(prev => [...prev, question]);
  }, []);

  const handleQuestionDeselect = useCallback((questionId: string) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== questionId));
  }, []);

  // Submit exam set
  const handleSubmit = useCallback(async (data: ExamSetCreateData) => {
    setLoading(true);
    try {
      await controller.createExamSet(data);
      // Success handling
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  return {
    examSetData,
    availableQuestions,
    selectedQuestions,
    loading,
    error,
    loadAvailableQuestions,
    handleSearch,
    handleQuestionSelect,
    handleQuestionDeselect,
    handleSubmit
  };
};
```

---

## 🎯 **PRIORITY 2: EXAM COMPONENTS (3 tiếng)**

### **5. ExamReview.tsx (687 dòng) → MVC**

#### **A. Pre-Migration Analysis (30 phút)**
```typescript
// Current monolithic structure:
const ExamReview = () => {
  // 687 dòng code
  // Exam review + UI logic + audio playback
  // Data fetching, navigation, statistics
}
```

#### **B. Migration Steps (90 phút)**

**Step 1: Create Controller (30 phút)**
```typescript
// src/controllers/exam/ExamReviewController.ts
export class ExamReviewController {
  private examService: ExamService;
  private audioService: AudioService;
  private statisticsService: StatisticsService;

  constructor() {
    this.examService = new ExamService();
    this.audioService = new AudioService();
    this.statisticsService = new StatisticsService();
  }

  // Exam Data Methods
  async getExamSession(sessionId: string): Promise<ExamSession> {
    // Fetch exam session data
  }

  async getExamQuestions(examId: string): Promise<Question[]> {
    // Fetch exam questions
  }

  async getUserAnswers(sessionId: string): Promise<UserAnswer[]> {
    // Fetch user answers
  }

  // Audio Management
  async playAudio(audioUrl: string): Promise<void> {
    // Play audio logic
  }

  async pauseAudio(): Promise<void> {
    // Pause audio logic
  }

  async stopAudio(): Promise<void> {
    // Stop audio logic
  }

  // Navigation
  goToQuestion(questionIndex: number): void {
    // Navigate to question
  }

  goToNextQuestion(): void {
    // Go to next question
  }

  goToPreviousQuestion(): void {
    // Go to previous question
  }

  // Statistics
  calculateScore(answers: UserAnswer[], questions: Question[]): ScoreResult {
    // Calculate score and statistics
  }

  getQuestionStatistics(question: Question, userAnswer: UserAnswer): QuestionStatistics {
    // Get question-specific statistics
  }
}
```

**Step 2: Create View (30 phút)**
```typescript
// src/views/components/ExamReviewView.tsx
interface ExamReviewViewProps {
  controller: ExamReviewController;
  examSession: ExamSession;
  questions: Question[];
  userAnswers: UserAnswer[];
  currentQuestionIndex: number;
  score: ScoreResult;
  onQuestionNavigate: (index: number) => void;
  onAudioPlay: (audioUrl: string) => void;
  onAudioPause: () => void;
  onAudioStop: () => void;
}

export const ExamReviewView: React.FC<ExamReviewViewProps> = ({
  controller,
  examSession,
  questions,
  userAnswers,
  currentQuestionIndex,
  score,
  onQuestionNavigate,
  onAudioPlay,
  onAudioPause,
  onAudioStop
}) => {
  // Pure UI rendering
  // Question display
  // Answer display
  // Navigation controls
  // Audio controls
  // Statistics display
}
```

**Step 3: Create Hook (30 phút)**
```typescript
// src/controllers/exam/useExamReviewController.ts
export const useExamReviewController = () => {
  const [controller] = useState(() => new ExamReviewController());
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load exam data
  const loadExamData = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const [session, questionsData, answers] = await Promise.all([
        controller.getExamSession(sessionId),
        controller.getExamQuestions(sessionId),
        controller.getUserAnswers(sessionId)
      ]);
      
      setExamSession(session);
      setQuestions(questionsData);
      setUserAnswers(answers);
      
      // Calculate score
      const scoreResult = controller.calculateScore(answers, questionsData);
      setScore(scoreResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Navigation
  const handleQuestionNavigate = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Audio controls
  const handleAudioPlay = useCallback(async (audioUrl: string) => {
    try {
      await controller.playAudio(audioUrl);
    } catch (err) {
      setError(err.message);
    }
  }, [controller]);

  const handleAudioPause = useCallback(async () => {
    try {
      await controller.pauseAudio();
    } catch (err) {
      setError(err.message);
    }
  }, [controller]);

  const handleAudioStop = useCallback(async () => {
    try {
      await controller.stopAudio();
    } catch (err) {
      setError(err.message);
    }
  }, [controller]);

  return {
    examSession,
    questions,
    userAnswers,
    currentQuestionIndex,
    score,
    loading,
    error,
    loadExamData,
    handleQuestionNavigate,
    handleNextQuestion,
    handlePreviousQuestion,
    handleAudioPlay,
    handleAudioPause,
    handleAudioStop
  };
};
```

---

### **6. ExamSession.tsx → MVC**

#### **A. Pre-Migration Analysis (30 phút)**
```typescript
// Current monolithic structure:
const ExamSession = () => {
  // Exam session + UI logic
  // Timer, question display, answer submission
}
```

#### **B. Migration Steps (90 phút)**

**Step 1: Create Controller (30 phút)**
```typescript
// src/controllers/exam/ExamSessionController.ts
export class ExamSessionController {
  private examService: ExamService;
  private timerService: TimerService;
  private answerService: AnswerService;

  constructor() {
    this.examService = new ExamService();
    this.timerService = new TimerService();
    this.answerService = new AnswerService();
  }

  // Session Management
  async startExamSession(examId: string): Promise<ExamSession> {
    // Start exam session
  }

  async endExamSession(sessionId: string): Promise<ExamSession> {
    // End exam session
  }

  async pauseExamSession(sessionId: string): Promise<void> {
    // Pause exam session
  }

  async resumeExamSession(sessionId: string): Promise<void> {
    // Resume exam session
  }

  // Timer Management
  startTimer(duration: number): void {
    // Start exam timer
  }

  pauseTimer(): void {
    // Pause timer
  }

  resumeTimer(): void {
    // Resume timer
  }

  getTimeRemaining(): number {
    // Get remaining time
  }

  // Answer Management
  async submitAnswer(questionId: string, answer: string): Promise<void> {
    // Submit answer
  }

  async updateAnswer(questionId: string, answer: string): Promise<void> {
    // Update answer
  }

  getUserAnswer(questionId: string): UserAnswer | null {
    // Get user answer
  }

  // Navigation
  goToQuestion(questionIndex: number): void {
    // Navigate to question
  }

  goToNextQuestion(): void {
    // Go to next question
  }

  goToPreviousQuestion(): void {
    // Go to previous question
  }
}
```

**Step 2: Create View (30 phút)**
```typescript
// src/views/components/ExamSessionView.tsx
interface ExamSessionViewProps {
  controller: ExamSessionController;
  examSession: ExamSession;
  currentQuestion: Question;
  currentQuestionIndex: number;
  timeRemaining: number;
  userAnswer: string;
  onAnswerSubmit: (answer: string) => void;
  onAnswerUpdate: (answer: string) => void;
  onQuestionNavigate: (index: number) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onPause: () => void;
  onResume: () => void;
  onEndExam: () => void;
}

export const ExamSessionView: React.FC<ExamSessionViewProps> = ({
  controller,
  examSession,
  currentQuestion,
  currentQuestionIndex,
  timeRemaining,
  userAnswer,
  onAnswerSubmit,
  onAnswerUpdate,
  onQuestionNavigate,
  onNextQuestion,
  onPreviousQuestion,
  onPause,
  onResume,
  onEndExam
}) => {
  // Pure UI rendering
  // Question display
  // Answer input
  // Timer display
  // Navigation controls
  // Action buttons
}
```

**Step 3: Create Hook (30 phút)**
```typescript
// src/controllers/exam/useExamSessionController.ts
export const useExamSessionController = () => {
  const [controller] = useState(() => new ExamSessionController());
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start exam session
  const startExamSession = useCallback(async (examId: string) => {
    setLoading(true);
    try {
      const session = await controller.startExamSession(examId);
      setExamSession(session);
      // Start timer
      controller.startTimer(session.duration);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Answer management
  const handleAnswerSubmit = useCallback(async (answer: string) => {
    try {
      await controller.submitAnswer(currentQuestion.id, answer);
      setUserAnswer(answer);
    } catch (err) {
      setError(err.message);
    }
  }, [controller, currentQuestion]);

  const handleAnswerUpdate = useCallback(async (answer: string) => {
    try {
      await controller.updateAnswer(currentQuestion.id, answer);
      setUserAnswer(answer);
    } catch (err) {
      setError(err.message);
    }
  }, [controller, currentQuestion]);

  // Navigation
  const handleQuestionNavigate = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
    // Load question data
  }, []);

  const handleNextQuestion = useCallback(() => {
    controller.goToNextQuestion();
  }, [controller]);

  const handlePreviousQuestion = useCallback(() => {
    controller.goToPreviousQuestion();
  }, [controller]);

  // Timer management
  const handlePause = useCallback(() => {
    controller.pauseTimer();
  }, [controller]);

  const handleResume = useCallback(() => {
    controller.resumeTimer();
  }, [controller]);

  // End exam
  const handleEndExam = useCallback(async () => {
    setLoading(true);
    try {
      await controller.endExamSession(examSession.id);
      // Navigate to results
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, examSession]);

  return {
    examSession,
    currentQuestion,
    currentQuestionIndex,
    timeRemaining,
    userAnswer,
    loading,
    error,
    startExamSession,
    handleAnswerSubmit,
    handleAnswerUpdate,
    handleQuestionNavigate,
    handleNextQuestion,
    handlePreviousQuestion,
    handlePause,
    handleResume,
    handleEndExam
  };
};
```

---

## 🎯 **PRIORITY 3: USER MANAGEMENT COMPONENTS (2 tiếng)**

### **7. StudentListWithFilters.tsx (670 dòng) → MVC**

#### **A. Pre-Migration Analysis (30 phút)**
```typescript
// Current monolithic structure:
const StudentListWithFilters = () => {
  // 670 dòng code
  // Student management + UI logic + filtering
  // CRUD operations, search, bulk actions
}
```

#### **B. Migration Steps (90 phút)**

**Step 1: Create Controller (30 phút)**
```typescript
// src/controllers/user/StudentListController.ts
export class StudentListController {
  private userService: UserService;
  private filterService: FilterService;
  private bulkService: BulkService;

  constructor() {
    this.userService = new UserService();
    this.filterService = new FilterService();
    this.bulkService = new BulkService();
  }

  // Student Management
  async getStudents(filters: StudentFilters): Promise<Student[]> {
    // Fetch students with filters
  }

  async createStudent(data: StudentCreateData): Promise<Student> {
    // Create student
  }

  async updateStudent(id: string, data: StudentUpdateData): Promise<Student> {
    // Update student
  }

  async deleteStudent(id: string): Promise<void> {
    // Delete student
  }

  // Filter Management
  getFilters(): StudentFilters {
    // Get current filters
  }

  updateFilters(filters: Partial<StudentFilters>): void {
    // Update filters
  }

  // Search
  async searchStudents(query: string): Promise<Student[]> {
    // Search students
  }

  // Bulk Operations
  async bulkDeleteStudents(ids: string[]): Promise<void> {
    // Bulk delete students
  }

  async bulkUpdateStudents(ids: string[], data: StudentUpdateData): Promise<void> {
    // Bulk update students
  }

  // Statistics
  getStudentStatistics(): StudentStatistics {
    // Get student statistics
  }
}
```

**Step 2: Create View (30 phút)**
```typescript
// src/views/components/StudentListView.tsx
interface StudentListViewProps {
  controller: StudentListController;
  students: Student[];
  filters: StudentFilters;
  statistics: StudentStatistics;
  onFilterChange: (filters: Partial<StudentFilters>) => void;
  onSearch: (query: string) => void;
  onStudentCreate: (data: StudentCreateData) => void;
  onStudentUpdate: (id: string, data: StudentUpdateData) => void;
  onStudentDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkUpdate: (ids: string[], data: StudentUpdateData) => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  controller,
  students,
  filters,
  statistics,
  onFilterChange,
  onSearch,
  onStudentCreate,
  onStudentUpdate,
  onStudentDelete,
  onBulkDelete,
  onBulkUpdate
}) => {
  // Pure UI rendering
  // Student list display
  // Filter controls
  // Search input
  // Action buttons
  // Statistics display
}
```

**Step 3: Create Hook (30 phút)**
```typescript
// src/controllers/user/useStudentListController.ts
export const useStudentListController = () => {
  const [controller] = useState(() => new StudentListController());
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState<StudentFilters>(initialFilters);
  const [statistics, setStatistics] = useState<StudentStatistics>(initialStatistics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load students
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await controller.getStudents(filters);
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, filters]);

  // Filter management
  const handleFilterChange = useCallback((newFilters: Partial<StudentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Search
  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const data = await controller.searchStudents(query);
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Student operations
  const handleStudentCreate = useCallback(async (data: StudentCreateData) => {
    setLoading(true);
    try {
      await controller.createStudent(data);
      await loadStudents(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadStudents]);

  const handleStudentUpdate = useCallback(async (id: string, data: StudentUpdateData) => {
    setLoading(true);
    try {
      await controller.updateStudent(id, data);
      await loadStudents(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadStudents]);

  const handleStudentDelete = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await controller.deleteStudent(id);
      await loadStudents(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadStudents]);

  // Bulk operations
  const handleBulkDelete = useCallback(async (ids: string[]) => {
    setLoading(true);
    try {
      await controller.bulkDeleteStudents(ids);
      await loadStudents(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadStudents]);

  const handleBulkUpdate = useCallback(async (ids: string[], data: StudentUpdateData) => {
    setLoading(true);
    try {
      await controller.bulkUpdateStudents(ids, data);
      await loadStudents(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadStudents]);

  return {
    students,
    filters,
    statistics,
    loading,
    error,
    loadStudents,
    handleFilterChange,
    handleSearch,
    handleStudentCreate,
    handleStudentUpdate,
    handleStudentDelete,
    handleBulkDelete,
    handleBulkUpdate
  };
};
```

---

### **8. ClassManagement.tsx → MVC**

#### **A. Pre-Migration Analysis (30 phút)**
```typescript
// Current monolithic structure:
const ClassManagement = () => {
  // Class management + UI logic
  // CRUD operations, student assignment, class management
}
```

#### **B. Migration Steps (90 phút)**

**Step 1: Create Controller (30 phút)**
```typescript
// src/controllers/user/ClassManagementController.ts
export class ClassManagementController {
  private classService: ClassService;
  private userService: UserService;
  private assignmentService: AssignmentService;

  constructor() {
    this.classService = new ClassService();
    this.userService = new UserService();
    this.assignmentService = new AssignmentService();
  }

  // Class Management
  async getClasses(): Promise<Class[]> {
    // Fetch classes
  }

  async createClass(data: ClassCreateData): Promise<Class> {
    // Create class
  }

  async updateClass(id: string, data: ClassUpdateData): Promise<Class> {
    // Update class
  }

  async deleteClass(id: string): Promise<void> {
    // Delete class
  }

  // Student Assignment
  async assignStudentToClass(studentId: string, classId: string): Promise<void> {
    // Assign student to class
  }

  async removeStudentFromClass(studentId: string, classId: string): Promise<void> {
    // Remove student from class
  }

  async getClassStudents(classId: string): Promise<Student[]> {
    // Get class students
  }

  // Class Statistics
  getClassStatistics(classId: string): ClassStatistics {
    // Get class statistics
  }
}
```

**Step 2: Create View (30 phút)**
```typescript
// src/views/components/ClassManagementView.tsx
interface ClassManagementViewProps {
  controller: ClassManagementController;
  classes: Class[];
  selectedClass: Class | null;
  classStudents: Student[];
  classStatistics: ClassStatistics;
  onClassCreate: (data: ClassCreateData) => void;
  onClassUpdate: (id: string, data: ClassUpdateData) => void;
  onClassDelete: (id: string) => void;
  onClassSelect: (classId: string) => void;
  onStudentAssign: (studentId: string, classId: string) => void;
  onStudentRemove: (studentId: string, classId: string) => void;
}

export const ClassManagementView: React.FC<ClassManagementViewProps> = ({
  controller,
  classes,
  selectedClass,
  classStudents,
  classStatistics,
  onClassCreate,
  onClassUpdate,
  onClassDelete,
  onClassSelect,
  onStudentAssign,
  onStudentRemove
}) => {
  // Pure UI rendering
  // Class list display
  // Class form
  // Student assignment interface
  // Statistics display
}
```

**Step 3: Create Hook (30 phút)**
```typescript
// src/controllers/user/useClassManagementController.ts
export const useClassManagementController = () => {
  const [controller] = useState(() => new ClassManagementController());
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [classStatistics, setClassStatistics] = useState<ClassStatistics>(initialStatistics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load classes
  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await controller.getClasses();
      setClasses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Class operations
  const handleClassCreate = useCallback(async (data: ClassCreateData) => {
    setLoading(true);
    try {
      await controller.createClass(data);
      await loadClasses(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadClasses]);

  const handleClassUpdate = useCallback(async (id: string, data: ClassUpdateData) => {
    setLoading(true);
    try {
      await controller.updateClass(id, data);
      await loadClasses(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadClasses]);

  const handleClassDelete = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await controller.deleteClass(id);
      await loadClasses(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadClasses]);

  // Class selection
  const handleClassSelect = useCallback(async (classId: string) => {
    setLoading(true);
    try {
      const [classData, students, statistics] = await Promise.all([
        controller.getClass(classId),
        controller.getClassStudents(classId),
        controller.getClassStatistics(classId)
      ]);
      
      setSelectedClass(classData);
      setClassStudents(students);
      setClassStatistics(statistics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Student assignment
  const handleStudentAssign = useCallback(async (studentId: string, classId: string) => {
    setLoading(true);
    try {
      await controller.assignStudentToClass(studentId, classId);
      await handleClassSelect(classId); // Refresh class data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, handleClassSelect]);

  const handleStudentRemove = useCallback(async (studentId: string, classId: string) => {
    setLoading(true);
    try {
      await controller.removeStudentFromClass(studentId, classId);
      await handleClassSelect(classId); // Refresh class data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, handleClassSelect]);

  return {
    classes,
    selectedClass,
    classStudents,
    classStatistics,
    loading,
    error,
    loadClasses,
    handleClassCreate,
    handleClassUpdate,
    handleClassDelete,
    handleClassSelect,
    handleStudentAssign,
    handleStudentRemove
  };
};
```

---

## 🎯 **PRIORITY 4: REMAINING COMPONENTS (1 tiếng)**

### **9. PassageManager.tsx (911 dòng) → MVC**

#### **A. Pre-Migration Analysis (30 phút)**
```typescript
// Current monolithic structure:
const PassageManager = () => {
  // 911 dòng code
  // Passage management + UI logic
  // CRUD operations, text processing, validation
}
```

#### **B. Migration Steps (90 phút)**

**Step 1: Create Controller (30 phút)**
```typescript
// src/controllers/passage/PassageManagerController.ts
export class PassageManagerController {
  private passageService: PassageService;
  private textService: TextService;
  private validationService: ValidationService;

  constructor() {
    this.passageService = new PassageService();
    this.textService = new TextService();
    this.validationService = new ValidationService();
  }

  // Passage Management
  async getPassages(filters: PassageFilters): Promise<Passage[]> {
    // Fetch passages with filters
  }

  async createPassage(data: PassageCreateData): Promise<Passage> {
    // Create passage
  }

  async updatePassage(id: string, data: PassageUpdateData): Promise<Passage> {
    // Update passage
  }

  async deletePassage(id: string): Promise<void> {
    // Delete passage
  }

  // Text Processing
  async processPassageText(text: string): Promise<ProcessedText> {
    // Process passage text
  }

  async validatePassageText(text: string): Promise<ValidationResult> {
    // Validate passage text
  }

  // Search
  async searchPassages(query: string): Promise<Passage[]> {
    // Search passages
  }
}
```

**Step 2: Create View (30 phút)**
```typescript
// src/views/components/PassageManagerView.tsx
interface PassageManagerViewProps {
  controller: PassageManagerController;
  passages: Passage[];
  filters: PassageFilters;
  onFilterChange: (filters: Partial<PassageFilters>) => void;
  onSearch: (query: string) => void;
  onPassageCreate: (data: PassageCreateData) => void;
  onPassageUpdate: (id: string, data: PassageUpdateData) => void;
  onPassageDelete: (id: string) => void;
}

export const PassageManagerView: React.FC<PassageManagerViewProps> = ({
  controller,
  passages,
  filters,
  onFilterChange,
  onSearch,
  onPassageCreate,
  onPassageUpdate,
  onPassageDelete
}) => {
  // Pure UI rendering
  // Passage list display
  // Passage form
  // Filter controls
  // Search input
}
```

**Step 3: Create Hook (30 phút)**
```typescript
// src/controllers/passage/usePassageManagerController.ts
export const usePassageManagerController = () => {
  const [controller] = useState(() => new PassageManagerController());
  const [passages, setPassages] = useState<Passage[]>([]);
  const [filters, setFilters] = useState<PassageFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load passages
  const loadPassages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await controller.getPassages(filters);
      setPassages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, filters]);

  // Filter management
  const handleFilterChange = useCallback((newFilters: Partial<PassageFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Search
  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const data = await controller.searchPassages(query);
      setPassages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller]);

  // Passage operations
  const handlePassageCreate = useCallback(async (data: PassageCreateData) => {
    setLoading(true);
    try {
      await controller.createPassage(data);
      await loadPassages(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadPassages]);

  const handlePassageUpdate = useCallback(async (id: string, data: PassageUpdateData) => {
    setLoading(true);
    try {
      await controller.updatePassage(id, data);
      await loadPassages(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadPassages]);

  const handlePassageDelete = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await controller.deletePassage(id);
      await loadPassages(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [controller, loadPassages]);

  return {
    passages,
    filters,
    loading,
    error,
    loadPassages,
    handleFilterChange,
    handleSearch,
    handlePassageCreate,
    handlePassageUpdate,
    handlePassageDelete
  };
};
```

---

## 🎯 **PRIORITY 5: FINAL COMPONENTS (1 tiếng)**

### **10-18. Remaining Components → MVC**

#### **Components to migrate:**
- **QuestionManagement.tsx** (851 dòng)
- **ExamSetManagement.tsx** (600+ dòng)
- **ExamManagementDashboard.tsx** (500+ dòng)
- **StudentManagement.tsx** (400+ dòng)
- **TeacherAnalytics.tsx** (350+ dòng)
- **ExamHistory.tsx** (300+ dòng)
- **StudentExamResults.tsx** (250+ dòng)
- **RoleManagement.tsx** (200+ dòng)
- **DataMigration.tsx** (150+ dòng)

#### **Migration Pattern (Same for all):**
1. **Create Controller** (15 phút mỗi component)
2. **Create View** (15 phút mỗi component)
3. **Create Hook** (15 phút mỗi component)
4. **Create MVC Wrapper** (5 phút mỗi component)
5. **Testing** (10 phút mỗi component)

**Total time for remaining 9 components: 60 phút**

---

## 🚀 **IMPLEMENTATION STRATEGY**

### **Phase 1: Setup (30 phút)**
1. **Create backup** của current codebase
2. **Setup testing environment** với Jest + React Testing Library
3. **Create code templates** cho Controller, View, Hook
4. **Setup error monitoring** với Sentry

### **Phase 2: Core Migration (4 tiếng)**
1. **TOEICQuestionCreator** (90 phút)
2. **TOEICBulkUpload** (90 phút)
3. **TOEICQuestionManager** (90 phút)
4. **EnhancedExamSetCreator** (90 phút)

### **Phase 3: Exam Components (3 tiếng)**
1. **ExamReview** (90 phút)
2. **ExamSession** (90 phút)
3. **ExamSetManagement** (60 phút)

### **Phase 4: User Management (2 tiếng)**
1. **StudentListWithFilters** (90 phút)
2. **ClassManagement** (90 phút)

### **Phase 5: Remaining Components (1 tiếng)**
1. **PassageManager** (60 phút)
2. **9 remaining components** (60 phút)

### **Phase 6: Integration & Testing (1 tiếng)**
1. **Update App.tsx** để sử dụng MVC components
2. **Update routes** để point đến MVC components
3. **Remove monolithic components** cũ
4. **Final testing** và verification

---

## 📋 **SUCCESS METRICS**

### **Technical Metrics:**
- ✅ **Components Migrated**: 18/18 (100%)
- ✅ **Lines Migrated**: 8,000+ lines
- ✅ **Test Coverage**: > 90%
- ✅ **Breaking Changes**: 0
- ✅ **Performance**: < 100ms render time

### **Code Quality Metrics:**
- ✅ **Average Component Size**: < 200 lines
- ✅ **Separation of Concerns**: 100%
- ✅ **Reusability**: High
- ✅ **Maintainability**: High
- ✅ **Testability**: High

---

## 🎯 **NEXT STEPS**

1. **Bắt đầu với Priority 1** components
2. **Follow migration pattern** cho mỗi component
3. **Test thoroughly** sau mỗi migration
4. **Update documentation** khi cần
5. **Monitor performance** và fix issues

**Ready to start migration! 🚀**

