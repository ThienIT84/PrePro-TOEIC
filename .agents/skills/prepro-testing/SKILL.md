---
name: prepro-testing
description: >-
  Hướng dẫn viết tests cho dự án PrePro-TOEIC.
  Sử dụng skill này khi cần viết unit tests, integration tests,
  hoặc khi cần chạy/debug test suite.
---

# Testing Guide — PrePro-TOEIC

## Tech Stack
- **Jest** — Test runner
- **ts-jest** — TypeScript support
- **React Testing Library** — Component testing
- **jsdom** — Browser environment simulation

## Commands

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## Jest Configuration

File: `jest.config.js`
- `preset: 'ts-jest'`
- `testEnvironment: 'jsdom'`
- Module alias: `@/` → `src/`
- Test patterns: `**/__tests__/**/*.{ts,tsx}` và `**/*.{test,spec}.{ts,tsx}`
- Setup: `src/__tests__/setup.ts`

## Test Organization

```
src/
├── __tests__/
│   └── setup.ts                    # Global test setup
├── models/entities/__tests__/
│   └── models.test.ts              # Model unit tests
├── controllers/question/__tests__/
│   └── QuestionController.test.ts  # Controller tests
```

## Test Patterns

### Model Tests
```typescript
import { QuestionModel } from '../QuestionModel';

describe('QuestionModel', () => {
  const validQuestion = {
    id: 'test-id',
    part: 5,
    prompt_text: 'The meeting was _____ at 3 PM.',
    choices: { A: 'schedule', B: 'scheduled', C: 'scheduling', D: 'schedules' },
    correct_choice: 'B',
    explain_vi: 'Giải thích...',
    explain_en: 'Explanation...',
    // ... other required fields
  };

  it('should validate a valid question', () => {
    const model = new QuestionModel(validQuestion);
    const errors = model.validate();
    expect(errors).toHaveLength(0);
  });

  it('should catch missing required fields', () => {
    const model = new QuestionModel({ ...validQuestion, prompt_text: '' });
    const errors = model.validate();
    expect(errors).toContain(expect.stringContaining('prompt_text'));
  });
});
```

### Controller Tests
```typescript
import { ExamSessionController } from '../ExamSessionController';

describe('ExamSessionController', () => {
  let controller: ExamSessionController;

  beforeEach(() => {
    controller = new ExamSessionController();
  });

  afterEach(() => {
    controller.cleanup();
  });

  it('should initialize with default state', () => {
    const state = controller.getState();
    expect(state.loading).toBe(true);
    expect(state.questions).toEqual([]);
    expect(state.currentIndex).toBe(0);
  });

  it('should notify subscribers on state change', () => {
    const listener = jest.fn();
    controller.subscribe(listener);
    controller.startExam();
    expect(listener).toHaveBeenCalled();
  });
});
```

### Mocking Supabase
```typescript
// Mock supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          data: [],
          error: null,
        }),
      }),
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
  },
}));
```

## What to Test

### Priority 1: Models (highest value)
- Validation logic cho mỗi model
- Part-specific validation (Part 1 cần image, Part 6 cần blank_index, etc.)
- Data transformation (`toJSON`, `fromJSON`)

### Priority 2: Controllers
- State transitions
- Business logic methods
- Observer pattern (subscribe/notify)
- Cleanup behavior

### Priority 3: Utilities
- Pure functions trong `src/utils/`
- Audio processing, performance calculations

### Priority 4: Services (requires mocking)
- Supabase CRUD operations
- AI question generation

## Tham khảo
- [Test Structure Details](./references/test-structure.md)
