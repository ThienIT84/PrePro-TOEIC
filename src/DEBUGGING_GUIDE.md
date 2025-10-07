# 🐛 DEBUGGING GUIDE & COMMON ISSUES

**Comprehensive debugging guide** cho migration từ Monolithic → MVC pattern.

---

## 📋 **DEBUGGING OVERVIEW**

### **Debugging Levels:**
- 🔍 **Level 1**: Quick fixes (5 phút)
- 🔧 **Level 2**: Code issues (15 phút)
- 🚨 **Level 3**: Architecture issues (30 phút)
- 💥 **Level 4**: Critical issues (1+ giờ)

### **Debugging Tools:**
- **Browser DevTools** - UI debugging
- **React DevTools** - Component debugging
- **TypeScript Compiler** - Type checking
- **Jest Debugger** - Test debugging
- **Network Tab** - API debugging

---

## 🎯 **LEVEL 1: QUICK FIXES (5 phút)**

### **1. Import/Export Issues**
```typescript
// ❌ Common Error: Cannot find module
import { QuestionCreatorController } from '@/controllers/question/QuestionCreatorController';

// ✅ Solutions:
// 1. Check file path
import { QuestionCreatorController } from './QuestionCreatorController';

// 2. Check export syntax
export class QuestionCreatorController { }
// NOT: export default class QuestionCreatorController { }

// 3. Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

// 4. Check file extension
import { QuestionCreatorController } from './QuestionCreatorController.ts';
```

### **2. TypeScript Errors**
```typescript
// ❌ Common Error: Property 'formData' does not exist
const { formData, loading, error } = useQuestionCreatorController();

// ✅ Solutions:
// 1. Check interface definition
interface QuestionCreatorState {
  formData: QuestionCreateData;
  loading: boolean;
  error: string | null;
}

// 2. Check hook return type
export const useQuestionCreatorController = (): QuestionCreatorState => {
  // ...
  return {
    formData,
    loading,
    error
  };
}

// 3. Check type imports
import { QuestionCreateData } from '@/types/question';
```

### **3. React Hooks Issues**
```typescript
// ❌ Common Error: Hook called conditionally
if (condition) {
  const { formData } = useQuestionCreatorController();
}

// ✅ Solutions:
// 1. Always call hooks at top level
const { formData } = useQuestionCreatorController();
if (condition) {
  // Use formData here
}

// 2. Check dependency arrays
useEffect(() => {
  loadData();
}, [loadData]); // Include loadData in dependencies

// 3. Use useCallback for functions
const handleSubmit = useCallback(async (data) => {
  // Submit logic
}, []);
```

### **4. State Management Issues**
```typescript
// ❌ Common Error: State not updating
const [formData, setFormData] = useState(initialData);
setFormData({ content: 'New content' }); // Only updates content

// ✅ Solutions:
// 1. Use functional updates
setFormData(prev => ({ ...prev, content: 'New content' }));

// 2. Check state structure
const [formData, setFormData] = useState<QuestionCreateData>({
  content: '',
  type: 'reading',
  difficulty: 'medium',
  options: { A: '', B: '', C: '', D: '' },
  correctAnswer: 'A',
  explanation: '',
  audioUrl: ''
});

// 3. Use useCallback for setters
const handleFormUpdate = useCallback((updates: Partial<QuestionCreateData>) => {
  setFormData(prev => ({ ...prev, ...updates }));
}, []);
```

---

## 🎯 **LEVEL 2: CODE ISSUES (15 phút)**

### **1. Controller Issues**
```typescript
// ❌ Common Error: Controller not working
export class QuestionCreatorController {
  async createQuestion(data: QuestionCreateData): Promise<Question> {
    // Missing validation
    const question = await this.questionService.createQuestion(data);
    return question;
  }
}

// ✅ Solutions:
// 1. Add proper validation
export class QuestionCreatorController {
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

  validateQuestionData(data: QuestionCreateData): ValidationResult {
    const errors: string[] = [];

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Question content is required');
    }

    if (!data.type) {
      errors.push('Question type is required');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }
}
```

### **2. View Component Issues**
```typescript
// ❌ Common Error: View not rendering
export const QuestionCreatorView: React.FC<QuestionCreatorViewProps> = ({
  controller,
  formData,
  onFormUpdate
}) => {
  // Missing error handling
  return (
    <div>
      <input value={formData.content} onChange={handleChange} />
    </div>
  );
};

// ✅ Solutions:
// 1. Add proper error handling
export const QuestionCreatorView: React.FC<QuestionCreatorViewProps> = ({
  controller,
  formData,
  loading,
  error,
  onFormUpdate,
  onSubmit
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormUpdate({ content: e.target.value });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      <input 
        value={formData.content} 
        onChange={handleChange}
        required
      />
      <button type="submit">Create Question</button>
    </form>
  );
};
```

### **3. Hook Integration Issues**
```typescript
// ❌ Common Error: Hook not working
export const useQuestionCreatorController = () => {
  const [formData, setFormData] = useState(initialData);
  
  const handleSubmit = async (data: QuestionCreateData) => {
    // Missing error handling
    const question = await controller.createQuestion(data);
  };

  return { formData, handleSubmit };
};

// ✅ Solutions:
// 1. Add proper error handling
export const useQuestionCreatorController = () => {
  const [controller] = useState(() => new QuestionCreatorController());
  const [formData, setFormData] = useState<QuestionCreateData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: QuestionCreateData) => {
    setLoading(true);
    setError(null);

    try {
      const question = await controller.createQuestion(data);
      setFormData(initialData); // Reset form
      return question;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [controller]);

  const handleFormUpdate = useCallback((updates: Partial<QuestionCreateData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  return {
    formData,
    loading,
    error,
    handleSubmit,
    handleFormUpdate
  };
};
```

---

## 🎯 **LEVEL 3: ARCHITECTURE ISSUES (30 phút)**

### **1. MVC Pattern Issues**
```typescript
// ❌ Common Error: Business logic in View
export const QuestionCreatorView: React.FC = () => {
  const [formData, setFormData] = useState(initialData);
  
  const handleSubmit = async (data: QuestionCreateData) => {
    // Business logic in View - WRONG!
    const validation = validateQuestionData(data);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    const question = await questionService.createQuestion(data);
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* UI */}
    </form>
  );
};

// ✅ Solutions:
// 1. Move business logic to Controller
export class QuestionCreatorController {
  async createQuestion(data: QuestionCreateData): Promise<Question> {
    // Business logic here
    const validation = this.validateQuestionData(data);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    return await this.questionService.createQuestion(data);
  }
}

// 2. Use Hook to connect Controller with View
export const useQuestionCreatorController = () => {
  const [controller] = useState(() => new QuestionCreatorController());
  
  const handleSubmit = useCallback(async (data: QuestionCreateData) => {
    try {
      return await controller.createQuestion(data);
    } catch (error) {
      // Handle error
    }
  }, [controller]);

  return { handleSubmit };
};

// 3. Keep View pure
export const QuestionCreatorView: React.FC<QuestionCreatorViewProps> = ({
  formData,
  onFormUpdate,
  onSubmit
}) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      {/* Pure UI */}
    </form>
  );
};
```

### **2. State Management Issues**
```typescript
// ❌ Common Error: State scattered across components
const QuestionCreator = () => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // State scattered everywhere
};

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Duplicate state
};

// ✅ Solutions:
// 1. Centralize state in Controller
export class QuestionController {
  private state: QuestionState = {
    questions: [],
    formData: initialData,
    loading: false,
    error: null
  };

  getState(): QuestionState {
    return { ...this.state };
  }

  updateState(updates: Partial<QuestionState>): void {
    this.state = { ...this.state, ...updates };
  }
}

// 2. Use Hook to manage state
export const useQuestionController = () => {
  const [controller] = useState(() => new QuestionController());
  const [state, setState] = useState(controller.getState());

  const updateState = useCallback((updates: Partial<QuestionState>) => {
    controller.updateState(updates);
    setState(controller.getState());
  }, [controller]);

  return { ...state, updateState };
};
```

### **3. Service Integration Issues**
```typescript
// ❌ Common Error: Direct API calls in components
export const QuestionCreator = () => {
  const handleSubmit = async (data: QuestionCreateData) => {
    // Direct API call - WRONG!
    const response = await fetch('/api/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const question = await response.json();
  };
};

// ✅ Solutions:
// 1. Create Service layer
export class QuestionService {
  async createQuestion(data: QuestionCreateData): Promise<Question> {
    const response = await fetch('/api/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create question');
    }
    
    return await response.json();
  }
}

// 2. Use Service in Controller
export class QuestionCreatorController {
  private questionService: QuestionService;

  constructor() {
    this.questionService = new QuestionService();
  }

  async createQuestion(data: QuestionCreateData): Promise<Question> {
    return await this.questionService.createQuestion(data);
  }
}

// 3. Use Controller in Hook
export const useQuestionCreatorController = () => {
  const [controller] = useState(() => new QuestionCreatorController());
  
  const handleSubmit = useCallback(async (data: QuestionCreateData) => {
    return await controller.createQuestion(data);
  }, [controller]);

  return { handleSubmit };
};
```

---

## 🎯 **LEVEL 4: CRITICAL ISSUES (1+ giờ)**

### **1. Performance Issues**
```typescript
// ❌ Common Error: Component re-rendering too often
export const QuestionCreator = () => {
  const [formData, setFormData] = useState(initialData);
  
  const handleSubmit = async (data: QuestionCreateData) => {
    // This function is recreated on every render
    const question = await controller.createQuestion(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* This causes re-render on every keystroke */}
      <input 
        value={formData.content} 
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
      />
    </form>
  );
};

// ✅ Solutions:
// 1. Use useCallback for functions
export const QuestionCreator = () => {
  const [formData, setFormData] = useState(initialData);
  
  const handleSubmit = useCallback(async (data: QuestionCreateData) => {
    const question = await controller.createQuestion(data);
  }, [controller]);

  const handleFormUpdate = useCallback((updates: Partial<QuestionCreateData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.content} 
        onChange={(e) => handleFormUpdate({ content: e.target.value })}
      />
    </form>
  );
};

// 2. Use React.memo for components
export const QuestionCreatorView = React.memo<QuestionCreatorViewProps>(({
  formData,
  onFormUpdate,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit}>
      <input 
        value={formData.content} 
        onChange={(e) => onFormUpdate({ content: e.target.value })}
      />
    </form>
  );
});

// 3. Use useMemo for expensive calculations
export const QuestionCreator = () => {
  const [formData, setFormData] = useState(initialData);
  
  const validationResult = useMemo(() => {
    return validateQuestionData(formData);
  }, [formData]);

  return (
    <form>
      <input value={formData.content} onChange={handleChange} />
      {!validationResult.isValid && (
        <div className="error">{validationResult.message}</div>
      )}
    </form>
  );
};
```

### **2. Memory Leak Issues**
```typescript
// ❌ Common Error: Memory leaks
export const QuestionCreator = () => {
  const [formData, setFormData] = useState(initialData);
  
  useEffect(() => {
    // Missing cleanup
    const interval = setInterval(() => {
      // This will keep running even after component unmounts
      updateFormData();
    }, 1000);
  }, []);

  return <form>{/* UI */}</form>;
};

// ✅ Solutions:
// 1. Cleanup in useEffect
export const QuestionCreator = () => {
  const [formData, setFormData] = useState(initialData);
  
  useEffect(() => {
    const interval = setInterval(() => {
      updateFormData();
    }, 1000);

    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <form>{/* UI */}</form>;
};

// 2. Cancel async operations
export const QuestionCreator = () => {
  const [formData, setFormData] = useState(initialData);
  
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchData = async () => {
      try {
        const response = await fetch('/api/questions', {
          signal: abortController.signal
        });
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, []);

  return <form>{/* UI */}</form>;
};
```

### **3. Testing Issues**
```typescript
// ❌ Common Error: Tests not working
describe('QuestionCreatorController', () => {
  it('should create question', async () => {
    const controller = new QuestionCreatorController();
    const data = { content: 'Test' };
    
    // Missing mocking
    const question = await controller.createQuestion(data);
    
    expect(question).toBeDefined();
  });
});

// ✅ Solutions:
// 1. Mock dependencies
describe('QuestionCreatorController', () => {
  let controller: QuestionCreatorController;
  let mockQuestionService: jest.Mocked<QuestionService>;

  beforeEach(() => {
    mockQuestionService = {
      createQuestion: jest.fn()
    } as any;

    controller = new QuestionCreatorController();
    (controller as any).questionService = mockQuestionService;
  });

  it('should create question', async () => {
    // Arrange
    const data = { content: 'Test' };
    const expectedQuestion = { id: '1', ...data };
    mockQuestionService.createQuestion.mockResolvedValue(expectedQuestion);

    // Act
    const result = await controller.createQuestion(data);

    // Assert
    expect(result).toEqual(expectedQuestion);
    expect(mockQuestionService.createQuestion).toHaveBeenCalledWith(data);
  });
});

// 2. Test error cases
it('should handle validation errors', async () => {
  const data = { content: '' }; // Invalid data
  
  await expect(controller.createQuestion(data)).rejects.toThrow('Question content is required');
});

// 3. Test async operations
it('should handle async errors', async () => {
  const data = { content: 'Test' };
  mockQuestionService.createQuestion.mockRejectedValue(new Error('Database error'));
  
  await expect(controller.createQuestion(data)).rejects.toThrow('Failed to create question: Database error');
});
```

---

## 🛠️ **DEBUGGING TOOLS**

### **1. Browser DevTools**
```javascript
// Console debugging
console.log('Form data:', formData);
console.table(questions);
console.group('Question Creation');
console.log('Step 1: Validation');
console.log('Step 2: API Call');
console.log('Step 3: Success');
console.groupEnd();

// Breakpoints
debugger; // Pause execution

// Performance profiling
console.time('Question Creation');
// ... code ...
console.timeEnd('Question Creation');
```

### **2. React DevTools**
```typescript
// Component debugging
const QuestionCreator = () => {
  const [formData, setFormData] = useState(initialData);
  
  // Add debugging info
  console.log('QuestionCreator render:', { formData });
  
  return <form>{/* UI */}</form>;
};

// Props debugging
interface QuestionCreatorViewProps {
  formData: QuestionCreateData;
  onFormUpdate: (updates: Partial<QuestionCreateData>) => void;
}

export const QuestionCreatorView: React.FC<QuestionCreatorViewProps> = (props) => {
  // Debug props
  console.log('QuestionCreatorView props:', props);
  
  return <form>{/* UI */}</form>;
};
```

### **3. TypeScript Debugging**
```typescript
// Type checking
npm run type-check

// Debug types
type DebugType<T> = T extends infer U ? U : never;

// Type assertions for debugging
const debugData = data as any;
console.log('Debug data:', debugData);

// Type guards
function isQuestionCreateData(data: any): data is QuestionCreateData {
  return data && typeof data.content === 'string';
}

if (isQuestionCreateData(data)) {
  // TypeScript knows data is QuestionCreateData
  console.log(data.content);
}
```

---

## 📋 **DEBUGGING CHECKLIST**

### **Pre-Debugging Checklist:**
- [ ] **Reproduce Issue** - Can reproduce the issue consistently
- [ ] **Check Logs** - Look for error messages in console
- [ ] **Check Network** - Check API calls in Network tab
- [ ] **Check State** - Check component state in React DevTools
- [ ] **Check Types** - Run TypeScript compiler

### **During Debugging Checklist:**
- [ ] **Add Logging** - Add console.log statements
- [ ] **Add Breakpoints** - Use debugger statements
- [ ] **Check Dependencies** - Verify all dependencies are correct
- [ ] **Check Imports** - Verify all imports are correct
- [ ] **Check Exports** - Verify all exports are correct

### **Post-Debugging Checklist:**
- [ ] **Remove Logging** - Remove debug console.log statements
- [ ] **Remove Breakpoints** - Remove debugger statements
- [ ] **Test Fix** - Test the fix thoroughly
- [ ] **Update Tests** - Update tests if needed
- [ ] **Document Issue** - Document the issue and solution

---

## 🚀 **DEBUGGING COMMANDS**

### **Quick Debug Commands:**
```bash
# Check TypeScript errors
npm run type-check

# Run tests
npm test

# Check linting
npm run lint

# Build project
npm run build

# Debug specific test
npm test -- --testNamePattern="QuestionCreatorController"

# Debug with coverage
npm test -- --coverage

# Debug performance
npm run debug:performance
```

### **Advanced Debug Commands:**
```bash
# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest

# Debug with Chrome DevTools
chrome://inspect

# Debug with VS Code
# Set breakpoints in VS Code
# Press F5 to start debugging
```

---

## 🎯 **SUCCESS METRICS**

### **Debugging Metrics:**
- **Issue Resolution Time**: < 30 phút
- **Debugging Accuracy**: > 95%
- **Code Quality**: Improved
- **Test Coverage**: > 90%

### **Migration Metrics:**
- **Zero Breaking Changes**
- **100% Feature Parity**
- **Performance Maintained**
- **Quality Improved**

**Ready to debug any issue! 🚀**
