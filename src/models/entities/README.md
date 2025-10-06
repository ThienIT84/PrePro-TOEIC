# Model Entities

Các model classes chứa business logic được tách từ components.

## 🏗️ **Cấu trúc:**

### **BaseModel**
- Base class cho tất cả models
- Common validation methods
- JSON serialization/deserialization

### **QuestionModel**
- Business logic cho Question entity
- Validation theo TOEIC parts
- Part-specific logic (audio, image, passage requirements)
- Time estimation và difficulty scoring

### **PassageModel**
- Business logic cho Passage entity
- Word count và reading time calculation
- Asset management (images, charts)
- Part-specific validation

### **ExamSetModel**
- Business logic cho ExamSet entity
- Time calculation và difficulty scoring
- TOEIC type detection
- Score suitability checking

### **UserModel**
- Business logic cho User/Profile entity
- Role-based logic
- Test date calculation
- Profile completion tracking

## 🎯 **Cách sử dụng:**

```typescript
import { QuestionModel, PassageModel, ExamSetModel, UserModel } from '@/models/entities';

// Tạo model từ data
const question = new QuestionModel(questionData);

// Validate data
const errors = question.validate();
if (errors.length > 0) {
  console.error('Validation errors:', errors);
}

// Sử dụng business logic
if (question.needsAudio()) {
  console.log('This question needs audio');
}

// Update model
question.addTag('grammar');
question.updateStatus('published');

// Convert to JSON
const jsonData = question.toJSON();
```

## ✅ **Lợi ích:**

- **Separation of Concerns**: Business logic tách khỏi UI
- **Reusability**: Logic có thể dùng ở nhiều nơi
- **Testability**: Dễ test business logic
- **Type Safety**: Sử dụng types hiện tại
- **Validation**: Centralized validation logic
- **No Breaking Changes**: Không thay đổi types hiện tại
