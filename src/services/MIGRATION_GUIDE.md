# Services Migration Guide

Hướng dẫn migrate từ services cũ sang domain services mới.

## 🎯 **Migration Strategy:**

### **Phase 1: Parallel Implementation**
- ✅ **Keep existing services** - không xóa services cũ
- ✅ **Add new domain services** - implement song song
- ✅ **Gradual migration** - migrate từng component một

### **Phase 2: Component Migration**
- ✅ **Update imports** - thay đổi import statements
- ✅ **Update service calls** - sử dụng domain services
- ✅ **Test functionality** - đảm bảo không breaking changes

### **Phase 3: Cleanup**
- ✅ **Remove old services** - xóa services không dùng
- ✅ **Update documentation** - cập nhật docs
- ✅ **Performance optimization** - optimize queries

## 📋 **Migration Checklist:**

### **Question Management:**
- [ ] `TOEICQuestionCreator.tsx` - migrate to QuestionService
- [ ] `TOEICBulkUpload.tsx` - migrate to QuestionService
- [ ] `QuestionDetailModal.tsx` - migrate to QuestionService
- [ ] `QuestionManagement.tsx` - migrate to QuestionService

### **Exam Management:**
- [ ] `EnhancedExamSetCreator.tsx` - migrate to ExamService
- [ ] `ExamSetManagement.tsx` - migrate to ExamService
- [ ] `ExamSession.tsx` - migrate to ExamService
- [ ] `ExamReview.tsx` - migrate to ExamService

### **User Management:**
- [ ] `StudentManagement.tsx` - migrate to UserService
- [ ] `StudentListWithFilters.tsx` - migrate to UserService
- [ ] `RoleManagement.tsx` - migrate to UserService

### **Analytics:**
- [ ] `TeacherAnalytics.tsx` - migrate to AnalyticsService
- [ ] `Analytics.tsx` - migrate to AnalyticsService

### **Media:**
- [ ] `AudioUpload.tsx` - migrate to MediaService
- [ ] `AudioPlayer.tsx` - migrate to MediaService
- [ ] `PassageManager.tsx` - migrate to MediaService

## 🔄 **Migration Examples:**

### **1. Question Management Migration:**

#### **Before (TOEICQuestionCreator.tsx):**
```typescript
// Direct Supabase calls
const { data, error } = await supabase
  .from('questions')
  .insert([questionData])
  .select()
  .single();

// Validation logic
const validateQuestion = (data: any) => {
  // Complex validation logic here
};

// Error handling
if (error) {
  console.error('Error creating question:', error);
  setError(error.message);
}
```

#### **After (using QuestionService):**
```typescript
import { QuestionService } from '@/services/domains';

const questionService = new QuestionService();

// Service call with built-in validation
const { data, error } = await questionService.createQuestion(questionData);

// Error handling is handled by service
if (error) {
  setError(error.message);
}
```

### **2. Exam Management Migration:**

#### **Before (EnhancedExamSetCreator.tsx):**
```typescript
// Direct Supabase calls
const { data, error } = await supabase
  .from('exam_sets')
  .insert([examSetData])
  .select()
  .single();

// Complex validation
const validateExamSet = (data: any) => {
  // Validation logic here
};

// Error handling
if (error) {
  console.error('Error creating exam set:', error);
  setError(error.message);
}
```

#### **After (using ExamService):**
```typescript
import { ExamService } from '@/services/domains';

const examService = new ExamService();

// Service call with built-in validation
const { data, error } = await examService.createExamSet(examSetData);

// Error handling is handled by service
if (error) {
  setError(error.message);
}
```

### **3. User Management Migration:**

#### **Before (StudentManagement.tsx):**
```typescript
// Direct Supabase calls
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'student');

// Filtering logic
const filteredStudents = students.filter(student => 
  student.name.toLowerCase().includes(searchTerm.toLowerCase())
);

// Statistics calculation
const stats = {
  total: students.length,
  active: students.filter(s => s.is_active).length
};
```

#### **After (using UserService):**
```typescript
import { UserService } from '@/services/domains';

const userService = new UserService();

// Service call with built-in filtering
const { data: students, error } = await userService.getStudents();

// Search functionality
const { data: searchResults } = await userService.searchProfiles(searchTerm);

// Statistics
const { data: stats } = await userService.getUserStats();
```

### **4. Analytics Migration:**

#### **Before (TeacherAnalytics.tsx):**
```typescript
// Multiple Supabase calls
const [questionsResult, examSetsResult, usersResult] = await Promise.all([
  supabase.from('questions').select('*'),
  supabase.from('exam_sets').select('*'),
  supabase.from('profiles').select('*')
]);

// Complex calculations
const questionStats = {
  total: questionsResult.data?.length || 0,
  byPart: {},
  byDifficulty: {}
};

// Manual aggregation
questionsResult.data?.forEach(q => {
  questionStats.byPart[q.part] = (questionStats.byPart[q.part] || 0) + 1;
  questionStats.byDifficulty[q.difficulty] = (questionStats.byDifficulty[q.difficulty] || 0) + 1;
});
```

#### **After (using AnalyticsService):**
```typescript
import { AnalyticsService } from '@/services/domains';

const analyticsService = new AnalyticsService();

// Single service call
const { data: dashboard, error } = await analyticsService.getDashboardSummary();

// Pre-calculated statistics
const questionStats = dashboard.questions;
const examStats = dashboard.exams;
const userStats = dashboard.users;
```

## 🛠️ **Migration Steps:**

### **Step 1: Update Imports**
```typescript
// Old
import { generateQuestion } from '@/services/questionGenerator';
import { getTeacherAnalytics } from '@/services/teacherAnalytics';

// New
import { QuestionService, AnalyticsService } from '@/services/domains';
```

### **Step 2: Initialize Services**
```typescript
// Old
const questionGenerator = new QuestionGenerator();

// New
const questionService = new QuestionService();
const analyticsService = new AnalyticsService();
```

### **Step 3: Update Service Calls**
```typescript
// Old
const question = await generateQuestion(prompt);

// New
const { data: question, error } = await questionService.createQuestion(questionData);
```

### **Step 4: Update Error Handling**
```typescript
// Old
try {
  const result = await someOperation();
} catch (error) {
  console.error('Error:', error);
  setError(error.message);
}

// New
const { data, error } = await someService.someOperation();
if (error) {
  setError(error.message);
}
```

### **Step 5: Update State Management**
```typescript
// Old
const [questions, setQuestions] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetchQuestions().then(data => {
    setQuestions(data);
    setLoading(false);
  });
}, []);

// New
const { questions, loading, error, loadQuestions } = useQuestionsStore();

useEffect(() => {
  loadQuestions();
}, [loadQuestions]);
```

## 🧪 **Testing Migration:**

### **1. Unit Tests:**
```typescript
// Test new service
describe('QuestionService', () => {
  it('should create question', async () => {
    const questionService = new QuestionService();
    const result = await questionService.createQuestion(mockQuestionData);
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
  });
});
```

### **2. Integration Tests:**
```typescript
// Test component with new service
describe('TOEICQuestionCreator', () => {
  it('should create question using QuestionService', async () => {
    render(<TOEICQuestionCreator />);
    // Test component behavior
  });
});
```

### **3. E2E Tests:**
```typescript
// Test full workflow
describe('Question Management Workflow', () => {
  it('should create, edit, and delete questions', async () => {
    // Test complete workflow
  });
});
```

## 📊 **Performance Monitoring:**

### **Before Migration:**
- Monitor existing service performance
- Track error rates
- Measure response times

### **After Migration:**
- Compare performance metrics
- Monitor new service calls
- Track error rates
- Measure response times

### **Performance Metrics:**
- **Response Time** - should be similar or better
- **Error Rate** - should be lower due to better error handling
- **Memory Usage** - should be similar
- **Bundle Size** - should be similar or smaller

## 🚨 **Common Issues & Solutions:**

### **Issue 1: Import Errors**
```typescript
// Problem
import { QuestionService } from '@/services/domains/question/QuestionService';

// Solution
import { QuestionService } from '@/services/domains';
```

### **Issue 2: Service Not Found**
```typescript
// Problem
const questionService = new QuestionService(); // Error: QuestionService is not defined

// Solution
import { QuestionService } from '@/services/domains';
```

### **Issue 3: Type Errors**
```typescript
// Problem
const { data, error } = await questionService.createQuestion(questionData);
// Error: questionData type mismatch

// Solution
import { Question } from '@/types';
const questionData: Partial<Question> = { ... };
```

### **Issue 4: Error Handling**
```typescript
// Problem
const result = await questionService.createQuestion(questionData);
if (result.error) {
  // Error handling
}

// Solution
const { data, error } = await questionService.createQuestion(questionData);
if (error) {
  // Error handling
}
```

## ✅ **Migration Complete Checklist:**

- [ ] All components migrated to domain services
- [ ] All imports updated
- [ ] All service calls updated
- [ ] Error handling updated
- [ ] State management updated
- [ ] Tests updated
- [ ] Performance monitored
- [ ] Documentation updated
- [ ] Old services removed
- [ ] No breaking changes

## 🎉 **Benefits After Migration:**

- **Better separation of concerns**
- **Easier to maintain and test**
- **Consistent error handling**
- **Better type safety**
- **Improved performance**
- **Easier to add new features**
- **Better code organization**
