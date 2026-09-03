# Test Structure Details — PrePro-TOEIC

## Current Test Coverage

| Area | Files | Status |
|------|-------|--------|
| Models | `models/entities/__tests__/models.test.ts` | ✅ Active |
| Controllers | `controllers/question/__tests__/QuestionController.test.ts` | ✅ Active |
| Components | — | 🚧 Planned |
| Services | — | 🚧 Planned |
| Hooks | — | 🚧 Planned |
| Utils | — | 🚧 Planned |

## Test File Naming
- Test files: `*.test.ts` hoặc `*.test.tsx`
- Đặt trong `__tests__/` folder cùng cấp với source
- Hoặc cùng thư mục với source file

## Setup File: `src/__tests__/setup.ts`

Global setup cho tất cả tests:
- Configure Testing Library matchers
- Mock browser APIs (localStorage, matchMedia, etc.)
- Setup global mocks

## Best Practices

### 1. Arrange-Act-Assert
```typescript
it('should do something', () => {
  // Arrange
  const input = createTestData();
  
  // Act
  const result = processData(input);
  
  // Assert
  expect(result).toBe(expected);
});
```

### 2. Test Naming
- Sử dụng tiếng Anh cho test names
- Format: `should [expected behavior] when [condition]`
- Ví dụ: `should return validation error when prompt_text is empty`

### 3. Test Data
- Tạo factory functions cho test data
- Sử dụng realistic data (TOEIC-like questions)
- Tránh hardcode IDs — dùng `uuid` hoặc descriptive strings

### 4. Cleanup
```typescript
afterEach(() => {
  jest.clearAllMocks();
  controller?.cleanup();
});
```

## Coverage Goals
- Models: **>90%** coverage
- Controllers: **>80%** coverage
- Services: **>70%** coverage
- Overall target: **95%**
