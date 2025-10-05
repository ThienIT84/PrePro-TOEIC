# Question Controller

Controller để quản lý Question business logic, sử dụng QuestionModel và services hiện tại.

## 🎯 **Chức năng chính:**

### **QuestionController Class**
- **State Management**: Quản lý questions, loading, error states
- **CRUD Operations**: Create, Read, Update, Delete questions
- **Validation**: Sử dụng QuestionModel validation
- **Filtering**: Filter theo part, difficulty, status, search
- **Statistics**: Cung cấp thống kê questions
- **Event Callbacks**: Notify khi state thay đổi

### **useQuestionController Hook**
- **React Integration**: Hook để sử dụng trong React components
- **State Sync**: Tự động sync state với controller
- **Methods**: Cung cấp tất cả controller methods
- **Type Safety**: Full TypeScript support

## 🚀 **Cách sử dụng:**

### **1. Sử dụng Hook trong Component:**
```typescript
import { useQuestionController } from '@/controllers/question';

function QuestionList() {
  const {
    questions,
    loading,
    error,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionsByPart,
    searchQuestions,
    getQuestionsStats
  } = useQuestionController();

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Use in component
  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {questions.map(question => (
        <div key={question.id}>
          {question.prompt_text}
        </div>
      ))}
    </div>
  );
}
```

### **2. Sử dụng Controller trực tiếp:**
```typescript
import { QuestionController } from '@/controllers/question';

const controller = new QuestionController();

// Set up callbacks
controller.setCallbacks({
  onQuestionsChange: (questions) => console.log('Questions updated:', questions),
  onLoadingChange: (loading) => console.log('Loading:', loading),
  onErrorChange: (error) => console.log('Error:', error)
});

// Load questions
await controller.loadQuestions({ part: 1, difficulty: 'easy' });

// Create question
const newQuestion = await controller.createQuestion({
  part: 1,
  prompt_text: 'What do you see?',
  choices: { A: 'Car', B: 'Bus', C: 'Train', D: 'Plane' },
  correct_choice: 'A',
  explain_vi: 'Có một chiếc xe hơi',
  explain_en: 'There is a car',
  difficulty: 'easy',
  status: 'published'
});

// Get statistics
const stats = controller.getQuestionsStats();
console.log('Total questions:', stats.total);
```

## ✅ **Lợi ích:**

- **Separation of Concerns**: Business logic tách khỏi UI
- **Reusability**: Có thể dùng ở nhiều components
- **State Management**: Centralized state management
- **Type Safety**: Full TypeScript support
- **Validation**: Sử dụng QuestionModel validation
- **No Breaking Changes**: Không thay đổi services hiện tại
- **Event-driven**: Reactive state updates

## 🔧 **API Methods:**

### **State:**
- `questions`: Array of QuestionModel instances
- `loading`: Boolean loading state
- `error`: String error message or null

### **Actions:**
- `loadQuestions(filters?)`: Load questions from database
- `createQuestion(data)`: Create new question
- `updateQuestion(id, updates)`: Update existing question
- `deleteQuestion(id)`: Delete question

### **Getters:**
- `getQuestionById(id)`: Get question by ID
- `getQuestionsByPart(part)`: Filter by TOEIC part
- `getQuestionsByDifficulty(difficulty)`: Filter by difficulty
- `getQuestionsNeedingAudio()`: Get questions needing audio
- `getQuestionsNeedingImages()`: Get questions needing images
- `getQuestionsNeedingPassages()`: Get questions needing passages
- `getValidQuestionsForExam()`: Get valid questions for exam
- `searchQuestions(term)`: Search questions
- `getQuestionsStats()`: Get statistics

### **Utilities:**
- `clear()`: Clear all data
