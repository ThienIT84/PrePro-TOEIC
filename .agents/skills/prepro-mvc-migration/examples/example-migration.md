# Ví dụ Migration: ExamSession

Đây là ví dụ thực tế migration component `ExamSession` từ legacy sang MVC.

## Trước (Legacy): `src/components/ExamSession.tsx`
- 1 file monolithic ~78KB, ~2000+ lines
- Trộn lẫn business logic, state management, UI rendering
- Khó test, khó maintain

## Sau (MVC): 4 files tách biệt

### 1. Controller: `src/controllers/exam/ExamSessionController.ts`

**Nội dung**: State management + business logic

```typescript
// Interfaces cho state
export interface ExamAnswer {
  questionId: string;
  answer: string;
  timeSpent: number;
  isCorrect: boolean;
}

export interface ExamSessionState {
  examSet: ExamSet | null;
  questions: Question[];
  currentIndex: number;
  answers: Map<string, ExamAnswer>;
  timeLeft: number;
  isStarted: boolean;
  isPaused: boolean;
  isSubmitted: boolean;
  loading: boolean;
  // ... more state
}

export class ExamSessionController {
  private state: ExamSessionState;
  private listeners: Array<(state: ExamSessionState) => void> = [];

  // Observer pattern: subscribe/notify
  // Business methods: startExam, pauseExam, nextQuestion, answerQuestion, submitExam
  // Timer management: startTimer, cleanup
}
```

### 2. Hook: `src/controllers/exam/useExamSessionController.ts`

**Nội dung**: Bridge React ↔ Controller

```typescript
export function useExamSessionController() {
  const [controller] = useState(() => new ExamSessionController());
  const [state, setState] = useState(controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // Wrap all controller methods with useCallback
  return { ...state, startExam, pauseExam, nextQuestion, ... };
}
```

### 3. View: `src/views/components/ExamSessionView.tsx`

**Nội dung**: Pure UI rendering (~900 lines)
- Nhận tất cả data qua props
- Render exam interface: header, question display, answer choices, navigation, timer
- KHÔNG gọi Supabase, KHÔNG chứa business logic

### 4. MVC Wrapper: `src/views/components/ExamSessionMVC.tsx`

**Nội dung**: Kết nối mọi thứ (~540 lines)
- Sử dụng `useExamSessionController()` hook
- Xử lý routing: `useParams()`, `useNavigate()`
- Data fetching: load exam set, questions, passages từ Supabase
- Pass tất cả xuống `ExamSessionView` qua props

## Kết quả

| Metric | Trước | Sau |
|--------|-------|-----|
| File size | 78KB (1 file) | ~74KB (4 files) |
| Testability | Khó | Dễ (test Controller độc lập) |
| Reusability | Thấp | Cao (View tái sử dụng được) |
| Maintainability | Thấp | Cao (separation of concerns) |
