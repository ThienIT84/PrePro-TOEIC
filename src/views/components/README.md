# View Components - MVC Refactor

Các view components được refactor theo mô hình MVC, tách business logic khỏi UI.

## 🔄 **Refactor Process:**

### **Before (Original):**
```typescript
// QuestionDetailModal.tsx - 196 lines
// ❌ Business logic trộn với UI
// ❌ Hard-coded labels và logic
// ❌ Khó test và maintain
// ❌ Không reusable
```

### **After (MVC):**
```typescript
// QuestionDetailModalView.tsx - Pure View
// ✅ Chỉ hiển thị UI
// ✅ Nhận business logic qua props
// ✅ Dễ test và reuse

// QuestionDetailController.ts - Controller
// ✅ Quản lý business logic
// ✅ State management
// ✅ Event handling

// useQuestionDetailController.ts - Hook
// ✅ React integration
// ✅ State sync
// ✅ Type safety
```

## 📁 **File Structure:**

```
src/views/components/
├── QuestionDetailModalView.tsx        # Pure View component
├── QuestionDetailModalMVC.tsx         # MVC wrapper component
├── QuestionDetailModalComparison.tsx  # Comparison demo
└── README.md                          # This file
```

## 🎯 **Components:**

### **1. QuestionDetailModalView**
- **Pure View**: Chỉ hiển thị UI
- **Props-driven**: Nhận business logic qua props
- **Reusable**: Có thể dùng với bất kỳ controller nào
- **Testable**: Dễ test với mock props

### **2. QuestionDetailModalMVC**
- **MVC Wrapper**: Kết hợp View + Controller
- **Hook Integration**: Sử dụng useQuestionDetailController
- **Backward Compatible**: API giống component cũ
- **Type Safe**: Full TypeScript support

### **3. QuestionDetailModalComparison**
- **Demo Component**: So sánh old vs new
- **Interactive**: Test các pattern khác nhau
- **Educational**: Show benefits của MVC

## 🚀 **Cách sử dụng:**

### **1. Sử dụng Pure View:**
```typescript
import { QuestionDetailModalView } from '@/views/components';

<QuestionDetailModalView
  question={questionModel}
  isOpen={isOpen}
  onClose={handleClose}
  onEdit={handleEdit}
  onPlayAudio={handlePlayAudio}
  getTypeLabel={getTypeLabel}
  getDifficultyLabel={getDifficultyLabel}
  getDifficultyColor={getDifficultyColor}
/>
```

### **2. Sử dụng MVC Wrapper:**
```typescript
import { QuestionDetailModalMVC } from '@/views/components';

<QuestionDetailModalMVC
  question={questionModel}
  isOpen={isOpen}
  onClose={handleClose}
  onEdit={handleEdit}
/>
```

### **3. Sử dụng Controller trực tiếp:**
```typescript
import { useQuestionDetailController } from '@/controllers/question';

const {
  question,
  isOpen,
  openModal,
  closeModal,
  playAudio,
  getTypeLabel,
  getDifficultyLabel,
  getDifficultyColor
} = useQuestionDetailController();
```

## ✅ **Lợi ích của Refactor:**

### **Separation of Concerns:**
- **View**: Chỉ hiển thị UI
- **Controller**: Quản lý business logic
- **Model**: Chứa data và validation

### **Reusability:**
- View có thể dùng với controller khác
- Controller có thể dùng với view khác
- Business logic có thể reuse

### **Testability:**
- View dễ test với mock props
- Controller dễ test với mock data
- Business logic test riêng biệt

### **Maintainability:**
- Code dễ đọc và hiểu
- Thay đổi UI không ảnh hưởng logic
- Thay đổi logic không ảnh hưởng UI

### **Type Safety:**
- Full TypeScript support
- Compile-time error checking
- IntelliSense support

## 🔧 **Migration Guide:**

### **Từ Original Component:**
1. Thay `QuestionDetailModal` bằng `QuestionDetailModalMVC`
2. Props API giống nhau, không cần thay đổi
3. Business logic được tự động handle

### **Từ Custom Logic:**
1. Sử dụng `useQuestionDetailController` hook
2. Access business logic methods
3. Customize behavior nếu cần

## 🧪 **Testing:**

### **View Testing:**
```typescript
// Test với mock props
render(
  <QuestionDetailModalView
    question={mockQuestion}
    isOpen={true}
    onClose={jest.fn()}
    // ... other props
  />
);
```

### **Controller Testing:**
```typescript
// Test business logic
const controller = new QuestionDetailController();
controller.openModal(mockQuestion);
expect(controller.getQuestion()).toBe(mockQuestion);
```

## 📊 **Performance:**

- **Bundle Size**: Không tăng đáng kể
- **Runtime**: Không overhead
- **Memory**: Efficient state management
- **Re-renders**: Optimized với React hooks
