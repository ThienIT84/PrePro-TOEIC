# 🧪 TESTING STRATEGIES & CHECKLIST

**Comprehensive testing approach** cho migration từ Monolithic → MVC pattern.

---

## 📋 **TESTING OVERVIEW**

### **Testing Pyramid:**
```
        🔺 E2E Tests (5%)
       🔺🔺 Integration Tests (15%)
      🔺🔺🔺 Unit Tests (80%)
```

### **Testing Goals:**
- ✅ **Zero Breaking Changes** - Không làm hỏng functionality hiện tại
- ✅ **100% Feature Parity** - Tất cả features hoạt động như cũ
- ✅ **Performance Maintained** - Không giảm performance
- ✅ **Code Quality** - Code sạch và maintainable

---

## 🎯 **PHASE 1: PRE-MIGRATION TESTING (30 phút)**

### **1. Baseline Testing**
```typescript
// src/__tests__/baseline/baseline.test.ts
describe('Baseline Testing - Before Migration', () => {
  let originalComponent: any;
  let originalProps: any;

  beforeAll(async () => {
    // Capture current component behavior
    originalComponent = await import('@/components/TOEICQuestionCreator');
    originalProps = {
      // Test props
    };
  });

  describe('TOEICQuestionCreator Baseline', () => {
    it('should render without crashing', () => {
      render(<originalComponent.default {...originalProps} />);
      expect(screen.getByText('Create Question')).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const user = userEvent.setup();
      render(<originalComponent.default {...originalProps} />);
      
      // Test form submission
      await user.type(screen.getByLabelText('Question Content'), 'Test question');
      await user.click(screen.getByRole('button', { name: 'Create Question' }));
      
      // Verify behavior
      expect(screen.getByText('Question created successfully')).toBeInTheDocument();
    });

    it('should handle file upload', async () => {
      const user = userEvent.setup();
      render(<originalComponent.default {...originalProps} />);
      
      // Test file upload
      const file = new File(['test audio'], 'test.mp3', { type: 'audio/mp3' });
      await user.upload(screen.getByLabelText('Audio File'), file);
      
      // Verify upload
      expect(screen.getByText('Audio uploaded successfully')).toBeInTheDocument();
    });

    it('should validate form data', async () => {
      const user = userEvent.setup();
      render(<originalComponent.default {...originalProps} />);
      
      // Test validation
      await user.click(screen.getByRole('button', { name: 'Create Question' }));
      
      // Verify validation errors
      expect(screen.getByText('Question content is required')).toBeInTheDocument();
    });
  });

  // Repeat for all components
  describe('TOEICBulkUpload Baseline', () => {
    // Similar tests for bulk upload
  });

  describe('PassageManager Baseline', () => {
    // Similar tests for passage manager
  });
});
```

### **2. Performance Baseline**
```typescript
// src/__tests__/baseline/performance.test.ts
describe('Performance Baseline', () => {
  it('should render within acceptable time', () => {
    const start = performance.now();
    render(<TOEICQuestionCreator />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // 100ms
  });

  it('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      content: `Question ${i}`,
      // ... other properties
    }));

    const start = performance.now();
    render(<StudentListWithFilters data={largeDataset} />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(200); // 200ms
  });

  it('should not cause memory leaks', () => {
    const { unmount } = render(<TOEICQuestionCreator />);
    
    // Simulate component lifecycle
    unmount();
    
    // Check for memory leaks
    expect(global.gc).toBeDefined();
    global.gc();
  });
});
```

### **3. Accessibility Baseline**
```typescript
// src/__tests__/baseline/accessibility.test.ts
describe('Accessibility Baseline', () => {
  it('should be accessible', async () => {
    const { container } = render(<TOEICQuestionCreator />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<TOEICQuestionCreator />);
    
    // Test keyboard navigation
    await user.tab();
    expect(screen.getByLabelText('Question Content')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByLabelText('Question Type')).toHaveFocus();
  });

  it('should have proper ARIA labels', () => {
    render(<TOEICQuestionCreator />);
    
    expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Create Question Form');
    expect(screen.getByLabelText('Question Content')).toHaveAttribute('aria-required', 'true');
  });
});
```

---

## 🎯 **PHASE 2: MIGRATION TESTING (2 tiếng)**

### **1. Controller Unit Tests**
```typescript
// src/controllers/question/__tests__/QuestionCreatorController.test.ts
describe('QuestionCreatorController', () => {
  let controller: QuestionCreatorController;
  let mockQuestionService: jest.Mocked<QuestionService>;
  let mockFileService: jest.Mocked<FileService>;
  let mockValidationService: jest.Mocked<ValidationService>;

  beforeEach(() => {
    mockQuestionService = {
      createQuestion: jest.fn(),
      updateQuestion: jest.fn(),
      deleteQuestion: jest.fn(),
      getQuestions: jest.fn()
    } as any;

    mockFileService = {
      uploadAudio: jest.fn(),
      uploadImage: jest.fn(),
      deleteFile: jest.fn()
    } as any;

    mockValidationService = {
      validateQuestionData: jest.fn(),
      validateAudioFile: jest.fn()
    } as any;

    controller = new QuestionCreatorController();
    // Inject mocks
    (controller as any).questionService = mockQuestionService;
    (controller as any).fileService = mockFileService;
    (controller as any).validationService = mockValidationService;
  });

  describe('createQuestion', () => {
    it('should create question successfully', async () => {
      // Arrange
      const questionData: QuestionCreateData = {
        content: 'Test question',
        type: 'reading',
        difficulty: 'medium',
        options: { A: 'A', B: 'B', C: 'C', D: 'D' },
        correctAnswer: 'A',
        explanation: 'Test explanation'
      };

      const mockQuestion: Question = {
        id: '1',
        ...questionData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockValidationService.validateQuestionData.mockReturnValue({
        isValid: true,
        message: '',
        errors: []
      });

      mockQuestionService.createQuestion.mockResolvedValue(mockQuestion);

      // Act
      const result = await controller.createQuestion(questionData);

      // Assert
      expect(result).toEqual(mockQuestion);
      expect(mockValidationService.validateQuestionData).toHaveBeenCalledWith(questionData);
      expect(mockQuestionService.createQuestion).toHaveBeenCalledWith(questionData);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidData: QuestionCreateData = {
        content: '',
        type: 'reading',
        difficulty: 'medium',
        options: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        explanation: ''
      };

      mockValidationService.validateQuestionData.mockReturnValue({
        isValid: false,
        message: 'Question content is required',
        errors: ['Question content is required']
      });

      // Act & Assert
      await expect(controller.createQuestion(invalidData)).rejects.toThrow('Question content is required');
      expect(mockQuestionService.createQuestion).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      // Arrange
      const questionData: QuestionCreateData = {
        content: 'Test question',
        type: 'reading',
        difficulty: 'medium',
        options: { A: 'A', B: 'B', C: 'C', D: 'D' },
        correctAnswer: 'A',
        explanation: 'Test explanation'
      };

      mockValidationService.validateQuestionData.mockReturnValue({
        isValid: true,
        message: '',
        errors: []
      });

      mockQuestionService.createQuestion.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(controller.createQuestion(questionData)).rejects.toThrow('Failed to create question: Database error');
    });
  });

  describe('uploadAudio', () => {
    it('should upload audio file successfully', async () => {
      // Arrange
      const file = new File(['test audio'], 'test.mp3', { type: 'audio/mp3' });
      const mockUrl = 'https://example.com/audio/test.mp3';

      mockValidationService.validateAudioFile.mockReturnValue({
        isValid: true,
        message: '',
        errors: []
      });

      mockFileService.uploadAudio.mockResolvedValue(mockUrl);

      // Act
      const result = await controller.uploadAudio(file);

      // Assert
      expect(result).toBe(mockUrl);
      expect(mockValidationService.validateAudioFile).toHaveBeenCalledWith(file);
      expect(mockFileService.uploadAudio).toHaveBeenCalledWith(file);
    });

    it('should handle file validation errors', async () => {
      // Arrange
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      mockValidationService.validateAudioFile.mockReturnValue({
        isValid: false,
        message: 'File must be an audio file',
        errors: ['File must be an audio file']
      });

      // Act & Assert
      await expect(controller.uploadAudio(invalidFile)).rejects.toThrow('File must be an audio file');
      expect(mockFileService.uploadAudio).not.toHaveBeenCalled();
    });
  });

  describe('validateQuestionData', () => {
    it('should validate question data correctly', () => {
      // Arrange
      const validData: QuestionCreateData = {
        content: 'Test question',
        type: 'reading',
        difficulty: 'medium',
        options: { A: 'A', B: 'B', C: 'C', D: 'D' },
        correctAnswer: 'A',
        explanation: 'Test explanation'
      };

      // Act
      const result = controller.validateQuestionData(validData);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing content', () => {
      // Arrange
      const invalidData: QuestionCreateData = {
        content: '',
        type: 'reading',
        difficulty: 'medium',
        options: { A: 'A', B: 'B', C: 'C', D: 'D' },
        correctAnswer: 'A',
        explanation: 'Test explanation'
      };

      // Act
      const result = controller.validateQuestionData(invalidData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Question content is required');
      expect(result.errors).toContain('Question content is required');
    });

    it('should detect missing options', () => {
      // Arrange
      const invalidData: QuestionCreateData = {
        content: 'Test question',
        type: 'reading',
        difficulty: 'medium',
        options: { A: '', B: 'B', C: 'C', D: 'D' },
        correctAnswer: 'A',
        explanation: 'Test explanation'
      };

      // Act
      const result = controller.validateQuestionData(invalidData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('All options must be filled');
    });
  });
});
```

### **2. View Component Tests**
```typescript
// src/views/components/__tests__/QuestionCreatorView.test.tsx
describe('QuestionCreatorView', () => {
  const mockController = {
    validateQuestionData: jest.fn(),
    validateAudioFile: jest.fn()
  };

  const defaultProps = {
    controller: mockController,
    formData: {
      content: '',
      type: 'reading',
      difficulty: 'medium',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A',
      explanation: '',
      audioUrl: ''
    },
    loading: false,
    error: null,
    onFormUpdate: jest.fn(),
    onSubmit: jest.fn(),
    onFileUpload: jest.fn(),
    onReset: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<QuestionCreatorView {...defaultProps} />);
    
    expect(screen.getByLabelText('Question Content')).toBeInTheDocument();
    expect(screen.getByLabelText('Question Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Difficulty Level')).toBeInTheDocument();
    expect(screen.getByLabelText('Correct Answer')).toBeInTheDocument();
  });

  it('should handle form input changes', async () => {
    const user = userEvent.setup();
    render(<QuestionCreatorView {...defaultProps} />);
    
    const contentInput = screen.getByLabelText('Question Content');
    await user.type(contentInput, 'Test question');
    
    expect(defaultProps.onFormUpdate).toHaveBeenCalledWith({
      content: 'Test question'
    });
  });

  it('should handle form submission', async () => {
    const user = userEvent.setup();
    const formData = {
      ...defaultProps.formData,
      content: 'Test question',
      options: { A: 'A', B: 'B', C: 'C', D: 'D' }
    };

    render(<QuestionCreatorView {...defaultProps} formData={formData} />);
    
    const submitButton = screen.getByRole('button', { name: 'Create Question' });
    await user.click(submitButton);
    
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(formData);
  });

  it('should handle file upload', async () => {
    const user = userEvent.setup();
    render(<QuestionCreatorView {...defaultProps} />);
    
    const file = new File(['test audio'], 'test.mp3', { type: 'audio/mp3' });
    const fileInput = screen.getByLabelText('Audio File');
    await user.upload(fileInput, file);
    
    expect(defaultProps.onFileUpload).toHaveBeenCalledWith(file);
  });

  it('should display loading state', () => {
    render(<QuestionCreatorView {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Question' })).toBeDisabled();
  });

  it('should display error message', () => {
    const errorMessage = 'Validation failed';
    render(<QuestionCreatorView {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should handle reset', async () => {
    const user = userEvent.setup();
    render(<QuestionCreatorView {...defaultProps} />);
    
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    await user.click(resetButton);
    
    expect(defaultProps.onReset).toHaveBeenCalled();
  });

  it('should show audio upload for listening questions', () => {
    const formData = {
      ...defaultProps.formData,
      type: 'listening'
    };

    render(<QuestionCreatorView {...defaultProps} formData={formData} />);
    
    expect(screen.getByLabelText('Audio File')).toBeInTheDocument();
  });

  it('should not show audio upload for reading questions', () => {
    const formData = {
      ...defaultProps.formData,
      type: 'reading'
    };

    render(<QuestionCreatorView {...defaultProps} formData={formData} />);
    
    expect(screen.queryByLabelText('Audio File')).not.toBeInTheDocument();
  });
});
```

### **3. Hook Integration Tests**
```typescript
// src/controllers/question/__tests__/useQuestionCreatorController.test.ts
describe('useQuestionCreatorController', () => {
  let mockController: jest.Mocked<QuestionCreatorController>;

  beforeEach(() => {
    mockController = {
      createQuestion: jest.fn(),
      uploadAudio: jest.fn(),
      validateQuestionData: jest.fn(),
      validateAudioFile: jest.fn()
    } as any;

    // Mock the controller constructor
    jest.doMock('../QuestionCreatorController', () => ({
      QuestionCreatorController: jest.fn().mockImplementation(() => mockController)
    }));
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useQuestionCreatorController());
    
    expect(result.current.formData).toEqual({
      content: '',
      type: 'reading',
      difficulty: 'medium',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A',
      explanation: '',
      audioUrl: ''
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });

  it('should handle form updates', () => {
    const { result } = renderHook(() => useQuestionCreatorController());
    
    act(() => {
      result.current.handleFormUpdate({ content: 'Test question' });
    });
    
    expect(result.current.formData.content).toBe('Test question');
  });

  it('should handle successful question creation', async () => {
    const mockQuestion = {
      id: '1',
      content: 'Test question',
      type: 'reading',
      difficulty: 'medium',
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      correctAnswer: 'A',
      explanation: 'Test explanation',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockController.validateQuestionData.mockReturnValue({
      isValid: true,
      message: '',
      errors: []
    });

    mockController.createQuestion.mockResolvedValue(mockQuestion);

    const { result } = renderHook(() => useQuestionCreatorController());
    
    await act(async () => {
      await result.current.handleSubmit(result.current.formData);
    });
    
    expect(result.current.success).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle validation errors', async () => {
    mockController.validateQuestionData.mockReturnValue({
      isValid: false,
      message: 'Question content is required',
      errors: ['Question content is required']
    });

    const { result } = renderHook(() => useQuestionCreatorController());
    
    await act(async () => {
      await result.current.handleSubmit(result.current.formData);
    });
    
    expect(result.current.error).toBe('Question content is required');
    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('should handle file upload', async () => {
    const file = new File(['test audio'], 'test.mp3', { type: 'audio/mp3' });
    const mockUrl = 'https://example.com/audio/test.mp3';

    mockController.validateAudioFile.mockReturnValue({
      isValid: true,
      message: '',
      errors: []
    });

    mockController.uploadAudio.mockResolvedValue(mockUrl);

    const { result } = renderHook(() => useQuestionCreatorController());
    
    await act(async () => {
      await result.current.handleFileUpload(file);
    });
    
    expect(result.current.formData.audioUrl).toBe(mockUrl);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle file upload errors', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    mockController.validateAudioFile.mockReturnValue({
      isValid: false,
      message: 'File must be an audio file',
      errors: ['File must be an audio file']
    });

    const { result } = renderHook(() => useQuestionCreatorController());
    
    await act(async () => {
      await result.current.handleFileUpload(file);
    });
    
    expect(result.current.error).toBe('File must be an audio file');
    expect(result.current.loading).toBe(false);
  });

  it('should reset form', () => {
    const { result } = renderHook(() => useQuestionCreatorController());
    
    // Update form data
    act(() => {
      result.current.handleFormUpdate({ content: 'Test question' });
    });
    
    expect(result.current.formData.content).toBe('Test question');
    
    // Reset form
    act(() => {
      result.current.handleReset();
    });
    
    expect(result.current.formData.content).toBe('');
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });
});
```

---

## 🎯 **PHASE 3: INTEGRATION TESTING (1 tiếng)**

### **1. MVC Integration Tests**
```typescript
// src/views/components/__tests__/QuestionCreatorMVC.test.tsx
describe('QuestionCreatorMVC', () => {
  it('should render without crashing', () => {
    render(<QuestionCreatorMVC />);
    expect(screen.getByText('Create New Question')).toBeInTheDocument();
  });

  it('should handle complete workflow', async () => {
    const user = userEvent.setup();
    render(<QuestionCreatorMVC />);
    
    // Fill form
    await user.type(screen.getByLabelText('Question Content'), 'Test question');
    await user.selectOptions(screen.getByLabelText('Question Type'), 'reading');
    await user.selectOptions(screen.getByLabelText('Difficulty Level'), 'medium');
    
    // Fill options
    await user.type(screen.getByLabelText('A.'), 'Option A');
    await user.type(screen.getByLabelText('B.'), 'Option B');
    await user.type(screen.getByLabelText('C.'), 'Option C');
    await user.type(screen.getByLabelText('D.'), 'Option D');
    
    // Select correct answer
    await user.selectOptions(screen.getByLabelText('Correct Answer'), 'A');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Create Question' }));
    
    // Verify success
    expect(screen.getByText('Question created successfully')).toBeInTheDocument();
  });

  it('should handle file upload workflow', async () => {
    const user = userEvent.setup();
    render(<QuestionCreatorMVC />);
    
    // Select listening type
    await user.selectOptions(screen.getByLabelText('Question Type'), 'listening');
    
    // Upload file
    const file = new File(['test audio'], 'test.mp3', { type: 'audio/mp3' });
    await user.upload(screen.getByLabelText('Audio File'), file);
    
    // Verify upload
    expect(screen.getByText('✓ Audio uploaded')).toBeInTheDocument();
  });
});
```

### **2. Performance Comparison Tests**
```typescript
// src/__tests__/integration/performance-comparison.test.ts
describe('Performance Comparison', () => {
  it('should maintain similar render performance', () => {
    // Test original component
    const originalStart = performance.now();
    render(<OriginalTOEICQuestionCreator />);
    const originalEnd = performance.now();
    const originalTime = originalEnd - originalStart;

    // Test MVC component
    const mvcStart = performance.now();
    render(<QuestionCreatorMVC />);
    const mvcEnd = performance.now();
    const mvcTime = mvcEnd - mvcStart;

    // MVC should not be significantly slower
    expect(mvcTime).toBeLessThan(originalTime * 1.5); // 50% tolerance
  });

  it('should maintain similar memory usage', () => {
    // Test original component
    const originalMemory = performance.memory?.usedJSHeapSize || 0;
    const { unmount: unmountOriginal } = render(<OriginalTOEICQuestionCreator />);
    unmountOriginal();
    const originalMemoryAfter = performance.memory?.usedJSHeapSize || 0;

    // Test MVC component
    const mvcMemory = performance.memory?.usedJSHeapSize || 0;
    const { unmount: unmountMVC } = render(<QuestionCreatorMVC />);
    unmountMVC();
    const mvcMemoryAfter = performance.memory?.usedJSHeapSize || 0;

    // Memory usage should be similar
    const originalIncrease = originalMemoryAfter - originalMemory;
    const mvcIncrease = mvcMemoryAfter - mvcMemory;
    
    expect(mvcIncrease).toBeLessThan(originalIncrease * 1.2); // 20% tolerance
  });
});
```

---

## 🎯 **PHASE 4: E2E TESTING (30 phút)**

### **1. Critical User Flows**
```typescript
// src/__tests__/e2e/critical-flows.test.ts
describe('Critical User Flows', () => {
  beforeEach(() => {
    // Setup test database
    // Clear test data
    // Login as test user
  });

  it('should complete question creation flow', async () => {
    // Navigate to question creation
    await page.goto('/questions/create');
    
    // Fill form
    await page.fill('[data-testid="question-content"]', 'Test question');
    await page.selectOption('[data-testid="question-type"]', 'reading');
    await page.selectOption('[data-testid="difficulty"]', 'medium');
    
    // Fill options
    await page.fill('[data-testid="option-a"]', 'Option A');
    await page.fill('[data-testid="option-b"]', 'Option B');
    await page.fill('[data-testid="option-c"]', 'Option C');
    await page.fill('[data-testid="option-d"]', 'Option D');
    
    // Select correct answer
    await page.selectOption('[data-testid="correct-answer"]', 'A');
    
    // Submit form
    await page.click('[data-testid="submit-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Question created successfully');
  });

  it('should complete bulk upload flow', async () => {
    // Navigate to bulk upload
    await page.goto('/questions/bulk-upload');
    
    // Upload file
    await page.setInputFiles('[data-testid="file-input"]', 'test-data/questions.xlsx');
    
    // Verify file processing
    await expect(page.locator('[data-testid="file-processed"]')).toBeVisible();
    
    // Start import
    await page.click('[data-testid="import-button"]');
    
    // Verify import progress
    await expect(page.locator('[data-testid="import-progress"]')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('[data-testid="import-complete"]')).toBeVisible();
  });

  it('should complete exam review flow', async () => {
    // Navigate to exam review
    await page.goto('/exams/review/123');
    
    // Verify exam data loaded
    await expect(page.locator('[data-testid="exam-title"]')).toBeVisible();
    
    // Navigate through questions
    await page.click('[data-testid="next-question"]');
    await page.click('[data-testid="previous-question"]');
    
    // Play audio (if listening question)
    await page.click('[data-testid="play-audio"]');
    await page.click('[data-testid="pause-audio"]');
    
    // Verify navigation works
    await expect(page.locator('[data-testid="question-1"]')).toBeVisible();
  });
});
```

---

## 🎯 **PHASE 5: REGRESSION TESTING (30 phút)**

### **1. Feature Parity Tests**
```typescript
// src/__tests__/regression/feature-parity.test.ts
describe('Feature Parity Tests', () => {
  const testCases = [
    {
      name: 'Question Creation',
      original: 'TOEICQuestionCreator',
      mvc: 'QuestionCreatorMVC',
      testData: {
        content: 'Test question',
        type: 'reading',
        difficulty: 'medium',
        options: { A: 'A', B: 'B', C: 'C', D: 'D' },
        correctAnswer: 'A'
      }
    },
    {
      name: 'Bulk Upload',
      original: 'TOEICBulkUpload',
      mvc: 'BulkUploadMVC',
      testData: {
        file: 'test-data/questions.xlsx'
      }
    },
    {
      name: 'Student Management',
      original: 'StudentListWithFilters',
      mvc: 'StudentListMVC',
      testData: {
        filters: { status: 'active' },
        search: 'test'
      }
    }
  ];

  testCases.forEach(({ name, original, mvc, testData }) => {
    describe(`${name} Feature Parity`, () => {
      it('should have same functionality', async () => {
        // Test original component
        const originalResult = await testComponent(original, testData);
        
        // Test MVC component
        const mvcResult = await testComponent(mvc, testData);
        
        // Compare results
        expect(mvcResult).toEqual(originalResult);
      });
    });
  });
});
```

### **2. API Compatibility Tests**
```typescript
// src/__tests__/regression/api-compatibility.test.ts
describe('API Compatibility Tests', () => {
  it('should use same API endpoints', async () => {
    const apiCalls: string[] = [];
    
    // Mock fetch to capture API calls
    global.fetch = jest.fn().mockImplementation((url) => {
      apiCalls.push(url);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
    
    // Test original component
    render(<OriginalTOEICQuestionCreator />);
    const originalApiCalls = [...apiCalls];
    apiCalls.length = 0;
    
    // Test MVC component
    render(<QuestionCreatorMVC />);
    const mvcApiCalls = [...apiCalls];
    
    // Should use same API endpoints
    expect(mvcApiCalls).toEqual(originalApiCalls);
  });
});
```

---

## 📋 **TESTING CHECKLIST**

### **Pre-Migration Checklist:**
- [ ] **Baseline Tests** - Capture current behavior
- [ ] **Performance Baseline** - Measure current performance
- [ ] **Accessibility Baseline** - Check current accessibility
- [ ] **API Documentation** - Document current API usage
- [ ] **User Flows** - Document critical user flows

### **During Migration Checklist:**
- [ ] **Controller Tests** - Unit tests for business logic
- [ ] **View Tests** - Component rendering tests
- [ ] **Hook Tests** - React integration tests
- [ ] **MVC Integration** - End-to-end component tests
- [ ] **Performance Tests** - Performance comparison

### **Post-Migration Checklist:**
- [ ] **Feature Parity** - All features work the same
- [ ] **API Compatibility** - Same API endpoints used
- [ ] **Performance Maintained** - No performance regression
- [ ] **Accessibility Maintained** - No accessibility regression
- [ ] **User Flows** - All critical flows work
- [ ] **Error Handling** - Error handling works correctly
- [ ] **Loading States** - Loading states work correctly
- [ ] **Validation** - Form validation works correctly

### **Final Verification Checklist:**
- [ ] **All Tests Pass** - 100% test coverage
- [ ] **No Breaking Changes** - Zero breaking changes
- [ ] **Performance OK** - Performance within acceptable range
- [ ] **Accessibility OK** - Accessibility maintained
- [ ] **User Experience OK** - User experience maintained
- [ ] **Code Quality OK** - Code quality improved
- [ ] **Documentation Updated** - Documentation updated
- [ ] **Deployment Ready** - Ready for production

---

## 🚀 **TESTING COMMANDS**

### **Run All Tests:**
```bash
npm test
```

### **Run Specific Test Suites:**
```bash
# Unit tests
npm test -- --testPathPattern="__tests__/unit"

# Integration tests
npm test -- --testPathPattern="__tests__/integration"

# E2E tests
npm test -- --testPathPattern="__tests__/e2e"

# Regression tests
npm test -- --testPathPattern="__tests__/regression"
```

### **Run Tests with Coverage:**
```bash
npm test -- --coverage
```

### **Run Tests in Watch Mode:**
```bash
npm test -- --watch
```

### **Run Performance Tests:**
```bash
npm test -- --testPathPattern="performance"
```

---

## 🎯 **SUCCESS METRICS**

### **Test Coverage:**
- ✅ **Unit Tests**: > 90%
- ✅ **Integration Tests**: > 80%
- ✅ **E2E Tests**: > 70%
- ✅ **Overall Coverage**: > 85%

### **Performance:**
- ✅ **Render Time**: < 100ms
- ✅ **Memory Usage**: < 70MB
- ✅ **Bundle Size**: < 2MB
- ✅ **Load Time**: < 2s

### **Quality:**
- ✅ **Zero Breaking Changes**
- ✅ **100% Feature Parity**
- ✅ **Accessibility Maintained**
- ✅ **User Experience Maintained**

**Ready for safe migration! 🚀**
