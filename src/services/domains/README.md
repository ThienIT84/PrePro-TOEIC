# Domain Services - MVC Architecture

Tổ chức lại services theo domain để tách biệt concerns và dễ maintain.

## 🏗️ **Architecture:**

### **BaseService**
- **Common functionality** cho tất cả domain services
- **Generic CRUD operations** với Supabase
- **Error handling** và validation
- **Logging** và debugging

### **Domain Services**
- **QuestionService** - Quản lý questions
- **ExamService** - Quản lý exam sets và sessions
- **UserService** - Quản lý user profiles
- **AnalyticsService** - Xử lý analytics và reports
- **MediaService** - Quản lý file uploads và storage

## 📁 **Cấu trúc:**

```
src/services/domains/
├── BaseService.ts              # Base class với common functionality
├── question/
│   └── QuestionService.ts      # Question operations
├── exam/
│   └── ExamService.ts          # Exam operations
├── user/
│   └── UserService.ts          # User operations
├── analytics/
│   └── AnalyticsService.ts     # Analytics operations
├── media/
│   └── MediaService.ts         # Media operations
├── index.ts                    # Exports và ServiceFactory
└── README.md                   # Documentation
```

## 🎯 **Domain Responsibilities:**

### **QuestionService:**
- ✅ **CRUD operations** cho questions
- ✅ **Validation** sử dụng QuestionModel
- ✅ **Search và filtering** theo part, difficulty, status
- ✅ **Bulk operations** cho import/export
- ✅ **Statistics** và analytics

### **ExamService:**
- ✅ **CRUD operations** cho exam sets
- ✅ **Question management** trong exam sets
- ✅ **Session management** cho exam attempts
- ✅ **Performance tracking** và results
- ✅ **Statistics** và reporting

### **UserService:**
- ✅ **Profile management** cho users
- ✅ **Role-based operations** (student/teacher)
- ✅ **User analytics** và performance
- ✅ **Search và filtering** users
- ✅ **Statistics** và insights

### **AnalyticsService:**
- ✅ **System statistics** tổng quan
- ✅ **Question analytics** chi tiết
- ✅ **Exam analytics** và performance
- ✅ **User analytics** và behavior
- ✅ **Trends** và reporting

### **MediaService:**
- ✅ **File upload** cho audio, images, charts
- ✅ **Storage management** với Supabase Storage
- ✅ **URL generation** cho public access
- ✅ **Cleanup operations** cho orphaned files
- ✅ **Usage statistics** và monitoring

## 🚀 **Cách sử dụng:**

### **1. Sử dụng ServiceFactory:**
```typescript
import { ServiceFactory } from '@/services/domains';

// Get individual services
const questionService = ServiceFactory.getQuestionService();
const examService = ServiceFactory.getExamService();
const userService = ServiceFactory.getUserService();

// Get all services
const services = ServiceFactory.getAllServices();
```

### **2. Question Operations:**
```typescript
import { QuestionService } from '@/services/domains';

const questionService = new QuestionService();

// Get questions with filters
const { data: questions, error } = await questionService.getQuestions({
  part: 1,
  difficulty: 'easy',
  status: 'published'
});

// Create new question
const { data: newQuestion, error } = await questionService.createQuestion({
  part: 1,
  prompt_text: 'What do you see?',
  choices: { A: 'A car', B: 'A bus', C: 'A train', D: 'A plane' },
  correct_choice: 'A',
  explain_vi: 'Trong hình có xe hơi',
  explain_en: 'There is a car in the picture',
  difficulty: 'easy',
  status: 'published'
});

// Search questions
const { data: searchResults } = await questionService.searchQuestions('car');

// Get statistics
const { data: stats } = await questionService.getQuestionsStats();
```

### **3. Exam Operations:**
```typescript
import { ExamService } from '@/services/domains';

const examService = new ExamService();

// Get exam sets
const { data: examSets, error } = await examService.getExamSets({
  type: 'practice',
  difficulty: 'medium'
});

// Create exam set
const { data: newExamSet, error } = await examService.createExamSet({
  title: 'TOEIC Practice Test 1',
  type: 'practice',
  difficulty: 'medium',
  question_count: 50,
  time_limit: 60
});

// Add question to exam set
await examService.addQuestionToExamSet(examSetId, questionId, orderIndex);

// Get exam sessions
const { data: sessions } = await examService.getExamSessions({
  exam_set_id: examSetId,
  status: 'completed'
});
```

### **4. User Operations:**
```typescript
import { UserService } from '@/services/domains';

const userService = new UserService();

// Get all users
const { data: users, error } = await userService.getProfiles();

// Get students only
const { data: students } = await userService.getStudents();

// Create user profile
const { data: newProfile, error } = await userService.createProfile({
  user_id: 'user123',
  role: 'student',
  target_score: 800,
  locales: ['vi', 'en']
});

// Get user performance
const { data: performance } = await userService.getUserPerformanceStats(userId);
```

### **5. Analytics Operations:**
```typescript
import { AnalyticsService } from '@/services/domains';

const analyticsService = new AnalyticsService();

// Get system overview
const { data: systemStats } = await analyticsService.getSystemStats();

// Get question analytics
const { data: questionAnalytics } = await analyticsService.getQuestionAnalytics();

// Get dashboard summary
const { data: dashboard } = await analyticsService.getDashboardSummary();

// Get trends over time
const { data: trends } = await analyticsService.getTrends(30); // Last 30 days
```

### **6. Media Operations:**
```typescript
import { MediaService } from '@/services/domains';

const mediaService = new MediaService();

// Upload audio file
const { data: audioResult, error } = await mediaService.uploadAudio(
  audioFile, 
  questionId
);

// Upload image file
const { data: imageResult, error } = await mediaService.uploadImage(
  imageFile, 
  questionId
);

// Get public URLs
const { data: audioUrl } = await mediaService.getQuestionAudioUrl(questionId);
const { data: imageUrl } = await mediaService.getQuestionImageUrl(questionId);

// Get storage statistics
const { data: storageStats } = await mediaService.getStorageStats();
```

## ✅ **Lợi ích:**

### **Separation of Concerns:**
- **Single responsibility** - mỗi service chỉ handle 1 domain
- **Clear boundaries** - không overlap giữa các services
- **Easy to maintain** - thay đổi 1 domain không ảnh hưởng domain khác

### **Reusability:**
- **ServiceFactory** - singleton pattern cho performance
- **Generic BaseService** - common functionality được reuse
- **Consistent API** - tất cả services có cùng pattern

### **Type Safety:**
- **Full TypeScript support** - type safety cho tất cả operations
- **Model integration** - sử dụng QuestionModel, ExamSetModel, UserModel
- **Error handling** - consistent error handling across services

### **Performance:**
- **Singleton pattern** - không tạo multiple instances
- **Efficient queries** - optimized Supabase queries
- **Caching** - có thể add caching layer dễ dàng

### **Testing:**
- **Easy to mock** - mỗi service có thể mock riêng
- **Isolated testing** - test từng domain độc lập
- **ServiceFactory** - có thể clear instances cho testing

## 🔧 **Migration từ existing services:**

### **Từ questionGenerator.ts:**
```typescript
// Before
import { generateQuestion } from '@/services/questionGenerator';

// After
import { QuestionService } from '@/services/domains';
const questionService = new QuestionService();
```

### **Từ teacherAnalytics.ts:**
```typescript
// Before
import { getTeacherAnalytics } from '@/services/teacherAnalytics';

// After
import { AnalyticsService } from '@/services/domains';
const analyticsService = new AnalyticsService();
```

### **Từ audioStorageService.ts:**
```typescript
// Before
import { uploadAudio } from '@/services/audioStorageService';

// After
import { MediaService } from '@/services/domains';
const mediaService = new MediaService();
```

## 🧪 **Testing:**

### **Unit Testing:**
```typescript
// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({ data: [], error: null })),
    insert: jest.fn(() => ({ data: {}, error: null })),
    update: jest.fn(() => ({ data: {}, error: null })),
    delete: jest.fn(() => ({ error: null }))
  }))
};

// Test service
const questionService = new QuestionService();
questionService.supabase = mockSupabase;
```

### **Integration Testing:**
```typescript
// Test service factory
const services = ServiceFactory.getAllServices();
expect(services.question).toBeInstanceOf(QuestionService);
expect(services.exam).toBeInstanceOf(ExamService);
```

## 📊 **Monitoring:**

- **Service usage** - track service calls
- **Performance metrics** - response times
- **Error rates** - monitor service errors
- **Storage usage** - track media storage
- **Database queries** - monitor Supabase usage
