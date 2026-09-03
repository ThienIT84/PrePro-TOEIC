---
name: prepro-question-management
description: >-
  Hướng dẫn làm việc với hệ thống câu hỏi và đề thi TOEIC trong PrePro-TOEIC.
  Sử dụng skill này khi cần tạo, sửa, import/export câu hỏi TOEIC,
  quản lý đề thi, hoặc tích hợp AI question generation.
---

# Question & Exam Management — PrePro-TOEIC

## Tổng quan hệ thống

Hệ thống quản lý câu hỏi TOEIC gồm 3 thành phần chính:
1. **Question Bank**: Ngân hàng câu hỏi 7 parts TOEIC
2. **Exam Sets**: Đề thi gồm các câu hỏi được chọn từ question bank
3. **Exam Sessions**: Phiên thi của học viên

## TOEIC 7 Parts — Quick Reference

| Part | Tên | Câu hỏi | Cần Passage? | Cần Audio? | Cần Image? |
|------|-----|---------|-------------|-----------|------------|
| 1 | Photographs | Mô tả ảnh | ❌ | ✅ | ✅ |
| 2 | Question-Response | Hỏi đáp | ❌ | ✅ | ❌ |
| 3 | Conversations | Hội thoại | ✅ | ✅ | ❌ |
| 4 | Talks | Bài nói | ✅ | ✅ | ❌ |
| 5 | Incomplete Sentences | Điền câu | ❌ | ❌ | ❌ |
| 6 | Text Completion | Điền đoạn | ✅ | ❌ | ❌ |
| 7 | Reading Comprehension | Đọc hiểu | ✅ (single/double/triple) | ❌ | ❌ |

## Key Types

```typescript
import { Question, Passage, ExamSet, ExamQuestion } from '@/types';
import { TOEICPart, Difficulty, CorrectChoice, QuestionStatus, PassageType } from '@/types';
```

## Workflow chính

### Tạo câu hỏi
1. **Manual**: `QuestionCreatorMVC` hoặc `TOEICQuestionCreatorMVC`
2. **AI Generation**: `QuestionGenerator` component → calls `groqQuestionGenerator` service
3. **Excel Import**: `TOEICBulkUpload` component → reads XLSX → validates → inserts

### Quản lý đề thi
1. Tạo `ExamSet` (metadata: title, type, difficulty, time_limit)
2. Thêm câu hỏi vào đề qua `ExamQuestionManagement`
3. Học viên chọn đề → tạo `ExamSession` → trả lời → submit → xem kết quả

## Tham khảo chi tiết
- [7 TOEIC Parts chi tiết](./references/toeic-parts.md)
- [Data structures](./references/question-types.md)
- [Excel Import/Export](./references/import-export.md)
