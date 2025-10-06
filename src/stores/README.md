# Global State Management - MVC Stores

Centralized state management cho MVC architecture, tích hợp với controllers và models.

## 🏗️ **Architecture:**

### **GlobalStateContext**
- **React Context** với useReducer
- **Centralized state** cho toàn bộ app
- **Type-safe actions** với TypeScript
- **Optimized re-renders** với selective subscriptions

### **StoreManager**
- **Controller Integration** - tích hợp với controllers
- **Lifecycle Management** - quản lý controller lifecycle
- **State Synchronization** - sync controllers với global state
- **Singleton Pattern** - single instance cho toàn app

### **Custom Hooks**
- **useStoreManager** - main hook với full functionality
- **useQuestionsStore** - questions-specific hook
- **useUserStore** - user management hook
- **useUIStore** - UI state management hook
- **useExamSetsStore** - exam sets management hook

## 🎯 **State Structure:**

```typescript
interface GlobalState {
  // User state
  user: UserModel | null;
  isAuthenticated: boolean;
  
  // Questions state
  questions: QuestionModel[];
  questionsLoading: boolean;
  questionsError: string | null;
  
  // Exam sets state
  examSets: ExamSetModel[];
  examSetsLoading: boolean;
  examSetsError: string | null;
  
  // UI state
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  sidebarOpen: boolean;
  
  // Controllers
  questionController: QuestionController | null;
}
```

## 🚀 **Cách sử dụng:**

### **1. Setup Provider:**
```typescript
import { GlobalProvider } from '@/stores';

function App() {
  return (
    <GlobalProvider>
      <YourApp />
    </GlobalProvider>
  );
}
```

### **2. Sử dụng Questions Store:**
```typescript
import { useQuestionsStore } from '@/stores';

function QuestionsList() {
  const {
    questions,
    loading,
    error,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    getQuestionsStats
  } = useQuestionsStore();

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {questions.map(question => (
        <div key={question.id}>{question.prompt_text}</div>
      ))}
    </div>
  );
}
```

### **3. Sử dụng User Store:**
```typescript
import { useUserStore } from '@/stores';

function UserProfile() {
  const {
    user,
    isAuthenticated,
    login,
    logout
  } = useUserStore();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### **4. Sử dụng UI Store:**
```typescript
import { useUIStore } from '@/stores';

function Header() {
  const {
    theme,
    language,
    sidebarOpen,
    toggleTheme,
    toggleLanguage,
    toggleSidebar
  } = useUIStore();

  return (
    <header>
      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <button onClick={toggleLanguage}>
        {language === 'vi' ? '🇻🇳' : '🇺🇸'}
      </button>
      <button onClick={toggleSidebar}>
        {sidebarOpen ? '📖' : '📋'}
      </button>
    </header>
  );
}
```

### **5. Sử dụng Store Manager trực tiếp:**
```typescript
import { useStoreManager } from '@/stores';

function AdvancedComponent() {
  const {
    questions,
    questionsLoading,
    questionController,
    storeManager,
    loadQuestions,
    createQuestion
  } = useStoreManager();

  // Access controller directly
  const handleAdvancedAction = () => {
    if (questionController) {
      const stats = questionController.getQuestionsStats();
      console.log('Stats:', stats);
    }
  };

  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

## ✅ **Lợi ích:**

### **Centralized State:**
- **Single source of truth** cho toàn bộ app
- **Consistent state** across components
- **Easy debugging** với Redux DevTools

### **Controller Integration:**
- **Automatic sync** giữa controllers và global state
- **Lifecycle management** của controllers
- **Type-safe** controller access

### **Performance:**
- **Selective subscriptions** - chỉ re-render khi cần
- **Optimized updates** với useReducer
- **Memoized selectors** với custom hooks

### **Developer Experience:**
- **TypeScript support** - full type safety
- **IntelliSense** - autocomplete cho actions
- **Easy testing** - mock stores dễ dàng

## 🔧 **Migration từ existing hooks:**

### **Từ useAuth:**
```typescript
// Before
const { user, loading } = useAuth();

// After
const { user, isAuthenticated, login, logout } = useUserStore();
```

### **Từ local state:**
```typescript
// Before
const [questions, setQuestions] = useState([]);
const [loading, setLoading] = useState(false);

// After
const { questions, loading, loadQuestions } = useQuestionsStore();
```

### **Từ useQuestionController:**
```typescript
// Before
const { questions, loading, loadQuestions } = useQuestionController();

// After
const { questions, loading, loadQuestions } = useQuestionsStore();
```

## 🧪 **Testing:**

### **Mock Store:**
```typescript
// Test với mock store
const mockStore = {
  questions: [mockQuestion],
  loading: false,
  error: null,
  loadQuestions: jest.fn(),
  createQuestion: jest.fn()
};

// Wrap component với mock provider
render(
  <MockGlobalProvider value={mockStore}>
    <QuestionsList />
  </MockGlobalProvider>
);
```

### **Integration Testing:**
```typescript
// Test store manager integration
const storeManager = getStoreManager();
await storeManager.loadQuestions();
expect(storeManager.getQuestionsStats()).toBeDefined();
```

## 📊 **Performance Monitoring:**

- **State updates** - track số lần state thay đổi
- **Re-renders** - monitor component re-renders
- **Memory usage** - track memory consumption
- **Controller lifecycle** - monitor controller creation/destruction