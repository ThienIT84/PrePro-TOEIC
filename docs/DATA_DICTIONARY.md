# TỪ ĐIỂN DỮ LIỆU (DATA DICTIONARY)
## O-Buddy Hello - TOEIC Learning Management System

---

## 📖 MỤC LỤC

1. [profiles](#1-profiles---hồ-sơ-người-dùng)
2. [questions](#2-questions---ngân-hàng-câu-hỏi-toeic)
3. [passages](#3-passages---đoạn-văn-toeic)
4. [exam_sets](#4-exam_sets---đề-thiбộ-đề)
5. [exam_questions](#5-exam_questions---câu-hỏi-trong-đề-thi)
6. [exam_sessions](#6-exam_sessions---phiên-làm-bài-thi)
7. [exam_attempts](#7-exam_attempts---chi-tiết-trả-lời)
8. [exam_statistics](#8-exam_statistics---thống-kê-đề-thi)
9. [attempts](#9-attempts---lịch-sử-luyện-tập)
10. [reviews](#10-reviews---hệ-thống-ôn-tập)
11. [question_drafts](#11-question_drafts---bản-nháp-câu-hỏi)
12. [classes](#12-classes---lớp-học)
13. [class_students](#13-class_students---học-viên-trong-lớp)
14. [teacher_students](#14-teacher_students---quan-hệ-giáo-viên---học-viên)
15. [alerts](#15-alerts---thông-báo)
16. [alert_rules](#16-alert_rules---quy-tắc-thông-báo)
17. [Views](#17-database-views)
18. [Enums & Types](#18-enums--custom-types)

---

## 1. **profiles** - Hồ sơ người dùng

**Mô tả:** Lưu thông tin hồ sơ người dùng (học viên, giáo viên), liên kết với Supabase Auth.

**Table Name:** `profiles`  
**Row Count (Estimate):** 10,000+ users  
**Storage Size:** ~2MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID bản ghi (Primary Key) |
| 2 | `user_id` | UUID | - | NO | - | ❌ | ✅ | ✅ | ID người dùng (Supabase Auth), UNIQUE |
| 3 | `name` | VARCHAR | 255 | YES | NULL | ❌ | ❌ | ❌ | Họ và tên đầy đủ |
| 4 | `role` | ENUM | - | NO | 'student' | ❌ | ❌ | ❌ | Vai trò: student/teacher |
| 5 | `target_score` | INTEGER | - | YES | 500 | ❌ | ❌ | ❌ | Điểm TOEIC mục tiêu (0-990) |
| 6 | `test_date` | DATE | - | YES | NULL | ❌ | ❌ | ❌ | Ngày dự kiến thi TOEIC |
| 7 | `locales` | VARCHAR | 10 | YES | 'vi' | ❌ | ❌ | ❌ | Ngôn ngữ giao diện (vi/en) |
| 8 | `focus` | TEXT[] | - | YES | '{}' | ❌ | ❌ | ❌ | Mảng các kỹ năng tập trung |
| 9 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm tạo bản ghi |
| 10 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm cập nhật cuối |

### **Constraints & Indexes:**

```sql
-- Primary Key
PK_profiles: PRIMARY KEY (id)

-- Unique Constraint
UQ_profiles_user_id: UNIQUE (user_id)

-- Check Constraints
CHECK_target_score: target_score >= 0 AND target_score <= 990
CHECK_role: role IN ('student', 'teacher')

-- Indexes
idx_profiles_user_id: ON profiles(user_id)
idx_profiles_role: ON profiles(role)
```

### **Sample Data:**

| id | user_id | name | role | target_score | test_date | locales |
|----|---------|------|------|--------------|-----------|---------|
| `abc-123...` | `def-456...` | Nguyễn Văn A | student | 750 | 2025-12-31 | vi |
| `xyz-789...` | `uvw-012...` | Trần Thị B | teacher | 900 | NULL | en |

### **Business Rules:**

1. Mỗi `user_id` chỉ có 1 profile (UNIQUE)
2. `target_score` phải từ 0-990 (chuẩn TOEIC)
3. `role` mặc định là 'student' khi tạo mới
4. `focus` có thể chứa: ["listening", "reading", "grammar", "vocabulary"]
5. `test_date` để theo dõi deadline ôn thi

### **Related Tables:**

- **Children:** questions, passages, exam_sets, exam_sessions, attempts, reviews, classes, teacher_students
- **Used By:** Tất cả modules trong hệ thống

---

## 2. **questions** - Ngân hàng câu hỏi TOEIC

**Mô tả:** Lưu trữ tất cả câu hỏi TOEIC 7 Part (Listening & Reading)

**Table Name:** `questions`  
**Row Count (Estimate):** 50,000+ questions  
**Storage Size:** ~100MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID câu hỏi (Primary Key) |
| 2 | `part` | INTEGER | - | NO | - | ❌ | ❌ | ❌ | Part TOEIC (1-7) |
| 3 | `passage_id` | UUID | - | YES | NULL | ❌ | ✅ | ❌ | ID đoạn văn (FK → passages.id) |
| 4 | `blank_index` | INTEGER | - | YES | NULL | ❌ | ❌ | ❌ | Vị trí chỗ trống (Part 6: 1-4) |
| 5 | `prompt_text` | TEXT | - | NO | - | ❌ | ❌ | ❌ | Nội dung câu hỏi |
| 6 | `choices` | JSONB | - | NO | - | ❌ | ❌ | ❌ | Đáp án {A, B, C, D} |
| 7 | `correct_choice` | VARCHAR | 1 | NO | - | ❌ | ❌ | ❌ | Đáp án đúng (A/B/C/D) |
| 8 | `explain_vi` | TEXT | - | NO | - | ❌ | ❌ | ❌ | Giải thích tiếng Việt |
| 9 | `explain_en` | TEXT | - | NO | - | ❌ | ❌ | ❌ | Giải thích tiếng Anh |
| 10 | `tags` | JSONB | - | YES | '[]' | ❌ | ❌ | ❌ | Tags phân loại |
| 11 | `difficulty` | ENUM | - | NO | 'medium' | ❌ | ❌ | ❌ | Độ khó: easy/medium/hard |
| 12 | `status` | VARCHAR | 20 | NO | 'draft' | ❌ | ❌ | ❌ | Trạng thái: draft/published/archived |
| 13 | `image_url` | TEXT | - | YES | NULL | ❌ | ❌ | ❌ | URL ảnh (Part 1) |
| 14 | `audio_url` | TEXT | - | YES | NULL | ❌ | ❌ | ❌ | URL audio (Part 1-4) |
| 15 | `transcript` | TEXT | - | YES | NULL | ❌ | ❌ | ❌ | Nội dung audio (Part 2-4) |
| 16 | `created_by` | UUID | - | YES | NULL | ❌ | ❌ | ❌ | ID người tạo |
| 17 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm tạo |
| 18 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm cập nhật |

### **JSONB Structures:**

#### `choices` column:
```json
{
  "A": "Answer choice A text here",
  "B": "Answer choice B text here",
  "C": "Answer choice C text here",
  "D": "Answer choice D text here"
}
```

#### `tags` column:
```json
[
  "grammar_tenses",
  "vocabulary_business",
  "topic_travel",
  "difficulty_medium"
]
```

### **Constraints & Indexes:**

```sql
-- Primary Key
PK_questions: PRIMARY KEY (id)

-- Foreign Keys
FK_questions_passage_id: FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE SET NULL
FK_questions_created_by: FOREIGN KEY (created_by) REFERENCES profiles(user_id)

-- Check Constraints
CHECK_part: part >= 1 AND part <= 7
CHECK_correct_choice: correct_choice IN ('A', 'B', 'C', 'D')
CHECK_blank_index: blank_index IS NULL OR (blank_index >= 1 AND blank_index <= 4)
CHECK_difficulty: difficulty IN ('easy', 'medium', 'hard')
CHECK_status: status IN ('draft', 'published', 'archived')

-- Indexes
idx_questions_part: ON questions(part)
idx_questions_status: ON questions(status)
idx_questions_difficulty: ON questions(difficulty)
idx_questions_passage_id: ON questions(passage_id)
idx_questions_created_by: ON questions(created_by)
idx_questions_part_status: ON questions(part, status) -- Composite index
```

### **Business Rules:**

| Part | Requires | Optional | Notes |
|------|----------|----------|-------|
| Part 1 | image_url, audio_url | prompt_text | Photos |
| Part 2 | audio_url, transcript | - | Question-Response (A, B, C only) |
| Part 3 | passage_id, audio_url, transcript | - | Conversations |
| Part 4 | passage_id, audio_url, transcript | - | Talks |
| Part 5 | prompt_text, choices | - | Incomplete Sentences |
| Part 6 | passage_id, blank_index | - | Text Completion |
| Part 7 | passage_id | - | Reading Comprehension |

### **Sample Data:**

```json
// Part 5 Question Example
{
  "id": "q-12345",
  "part": 5,
  "prompt_text": "The company _____ a new product next month.",
  "choices": {
    "A": "launch",
    "B": "launches",
    "C": "will launch",
    "D": "launched"
  },
  "correct_choice": "C",
  "explain_vi": "Dùng 'will launch' vì có 'next month' (tương lai)",
  "explain_en": "Use 'will launch' because of 'next month' (future)",
  "tags": ["grammar_future", "vocabulary_business"],
  "difficulty": "medium",
  "status": "published"
}
```

### **Related Tables:**

- **Parent:** passages (passage_id), profiles (created_by)
- **Children:** exam_questions, exam_attempts, attempts, reviews

---

## 3. **passages** - Đoạn văn TOEIC

**Mô tả:** Lưu đoạn văn cho Part 3, 4, 6, 7 (single/double/triple passages)

**Table Name:** `passages`  
**Row Count (Estimate):** 10,000+ passages  
**Storage Size:** ~50MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID đoạn văn |
| 2 | `part` | INTEGER | - | NO | - | ❌ | ❌ | ❌ | Part TOEIC (3, 4, 6, 7) |
| 3 | `passage_type` | VARCHAR | 20 | NO | 'single' | ❌ | ❌ | ❌ | Loại: single/double/triple |
| 4 | `texts` | JSONB | - | NO | - | ❌ | ❌ | ❌ | Nội dung đoạn văn |
| 5 | `audio_url` | TEXT | - | YES | NULL | ❌ | ❌ | ❌ | URL audio (Part 3, 4) |
| 6 | `image_url` | TEXT | - | YES | NULL | ❌ | ❌ | ❌ | URL ảnh đi kèm |
| 7 | `assets` | JSONB | - | YES | NULL | ❌ | ❌ | ❌ | Tài nguyên bổ sung |
| 8 | `meta` | JSONB | - | YES | NULL | ❌ | ❌ | ❌ | Metadata (word_count, topic...) |
| 9 | `created_by` | UUID | - | YES | NULL | ❌ | ❌ | ❌ | ID người tạo |
| 10 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm tạo |
| 11 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm cập nhật |

### **JSONB Structures:**

#### `texts` column:
```json
{
  "title": "Business Email",
  "content": "First paragraph content here...",
  "content2": "Second paragraph for double/triple passage",
  "content3": "Third paragraph for triple passage",
  "img_url": "https://example.com/image1.jpg",
  "img_url2": "https://example.com/image2.jpg",
  "img_url3": "https://example.com/image3.jpg"
}
```

#### `assets` column:
```json
{
  "images": [
    "https://cdn.example.com/chart1.png",
    "https://cdn.example.com/graph1.png"
  ],
  "charts": [
    "https://cdn.example.com/data-visualization.svg"
  ]
}
```

#### `meta` column:
```json
{
  "word_count": 250,
  "reading_time": 2,
  "topic": "business_email",
  "difficulty_level": "intermediate",
  "vocabulary_level": "B2"
}
```

### **Constraints & Indexes:**

```sql
-- Primary Key
PK_passages: PRIMARY KEY (id)

-- Check Constraints
CHECK_part: part IN (3, 4, 6, 7)
CHECK_passage_type: passage_type IN ('single', 'double', 'triple')

-- Indexes
idx_passages_part: ON passages(part)
idx_passages_type: ON passages(passage_type)
idx_passages_created_by: ON passages(created_by)
```

### **Business Rules:**

1. Part 3, 4: Bắt buộc có `audio_url`
2. Part 6, 7: Không cần audio
3. `passage_type`:
   - **single**: 1 đoạn văn
   - **double**: 2 đoạn văn liên quan
   - **triple**: 3 đoạn văn liên quan
4. `texts.content` là bắt buộc, `content2` và `content3` tùy vào passage_type

### **Related Tables:**

- **Children:** questions (1 passage → nhiều questions)

---

## 4. **exam_sets** - Đề thi/Bộ đề

**Mô tả:** Quản lý các đề thi, bộ đề luyện tập

**Table Name:** `exam_sets`  
**Row Count (Estimate):** 5,000+ exam sets  
**Storage Size:** ~5MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID đề thi |
| 2 | `title` | VARCHAR | 255 | NO | - | ❌ | ❌ | ❌ | Tiêu đề đề thi |
| 3 | `description` | TEXT | - | YES | NULL | ❌ | ❌ | ❌ | Mô tả chi tiết |
| 4 | `type` | ENUM | - | NO | 'mix' | ❌ | ❌ | ❌ | Loại: vocab/grammar/listening/reading/mix |
| 5 | `difficulty` | ENUM | - | NO | 'medium' | ❌ | ❌ | ❌ | Độ khó: easy/medium/hard |
| 6 | `question_count` | INTEGER | - | YES | 0 | ❌ | ❌ | ❌ | Số câu hỏi trong đề |
| 7 | `time_limit` | INTEGER | - | YES | NULL | ❌ | ❌ | ❌ | Thời gian làm bài (phút) |
| 8 | `is_active` | BOOLEAN | - | YES | TRUE | ❌ | ❌ | ❌ | Trạng thái kích hoạt |
| 9 | `allow_multiple_attempts` | BOOLEAN | - | YES | TRUE | ❌ | ❌ | ❌ | Cho phép làm lại |
| 10 | `max_attempts` | INTEGER | - | YES | NULL | ❌ | ❌ | ❌ | Số lần làm tối đa (NULL = không giới hạn) |
| 11 | `created_by` | UUID | - | YES | NULL | ❌ | ❌ | ❌ | ID người tạo |
| 12 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm tạo |
| 13 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm cập nhật |

### **Constraints & Indexes:**

```sql
-- Primary Key
PK_exam_sets: PRIMARY KEY (id)

-- Check Constraints
CHECK_question_count: question_count >= 0 AND question_count <= 200
CHECK_time_limit: time_limit IS NULL OR (time_limit >= 1 AND time_limit <= 300)
CHECK_type: type IN ('vocab', 'grammar', 'listening', 'reading', 'mix')
CHECK_difficulty: difficulty IN ('easy', 'medium', 'hard')
CHECK_max_attempts: max_attempts IS NULL OR max_attempts >= 1

-- Indexes
idx_exam_sets_type: ON exam_sets(type)
idx_exam_sets_difficulty: ON exam_sets(difficulty)
idx_exam_sets_is_active: ON exam_sets(is_active)
idx_exam_sets_created_by: ON exam_sets(created_by)
```

### **Business Rules:**

1. `question_count` tự động cập nhật khi thêm/xóa câu hỏi
2. `time_limit`: NULL = không giới hạn thời gian
3. `max_attempts`: NULL = làm không giới hạn
4. Chỉ đề `is_active = TRUE` mới hiển thị cho học viên

### **Exam Types:**

| Type | Description | Typical Question Count |
|------|-------------|----------------------|
| vocab | Từ vựng | 30-50 |
| grammar | Ngữ pháp | 40-60 |
| listening | Nghe (Part 1-4) | 100 |
| reading | Đọc (Part 5-7) | 100 |
| mix | Full test TOEIC | 200 |

### **Related Tables:**

- **Children:** exam_questions, exam_sessions, exam_statistics

---

## 5. **exam_questions** - Câu hỏi trong đề thi

**Mô tả:** Liên kết câu hỏi với đề thi (Many-to-Many relationship)

**Table Name:** `exam_questions`  
**Row Count (Estimate):** 500,000+ records  
**Storage Size:** ~20MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID bản ghi |
| 2 | `exam_set_id` | UUID | - | NO | - | ❌ | ✅ | ❌ | ID đề thi (FK → exam_sets.id) |
| 3 | `question_id` | UUID | - | NO | - | ❌ | ✅ | ❌ | ID câu hỏi (FK → questions.id) |
| 4 | `order_index` | INTEGER | - | NO | 0 | ❌ | ❌ | ❌ | Thứ tự câu hỏi trong đề (0-based) |
| 5 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm thêm vào đề |

### **Constraints & Indexes:**

```sql
-- Primary Key
PK_exam_questions: PRIMARY KEY (id)

-- Foreign Keys
FK_exam_questions_exam_set_id: FOREIGN KEY (exam_set_id) REFERENCES exam_sets(id) ON DELETE CASCADE
FK_exam_questions_question_id: FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE

-- Unique Constraints
UQ_exam_questions_order: UNIQUE (exam_set_id, order_index) -- Mỗi đề không có 2 câu cùng thứ tự

-- Indexes
idx_exam_questions_exam_set_id: ON exam_questions(exam_set_id)
idx_exam_questions_question_id: ON exam_questions(question_id)
```

### **Business Rules:**

1. Mỗi câu hỏi có thể xuất hiện trong nhiều đề
2. `order_index` bắt đầu từ 0
3. Không được trùng `order_index` trong cùng 1 đề
4. Xóa đề thi → xóa tất cả exam_questions liên quan (CASCADE)

### **Related Tables:**

- **Parent:** exam_sets, questions
- **Used in View:** exam_questions_full

---

## 6. **exam_sessions** - Phiên làm bài thi

**Mô tả:** Lưu thông tin các lần làm bài thi của học viên

**Table Name:** `exam_sessions`  
**Row Count (Estimate):** 100,000+ sessions  
**Storage Size:** ~50MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID phiên thi |
| 2 | `user_id` | UUID | - | NO | - | ❌ | ❌ | ❌ | ID người dùng |
| 3 | `exam_set_id` | UUID | - | YES | NULL | ❌ | ✅ | ❌ | ID đề thi (FK → exam_sets.id) |
| 4 | `status` | VARCHAR | 20 | NO | 'in_progress' | ❌ | ❌ | ❌ | Trạng thái: in_progress/completed/paused |
| 5 | `score` | INTEGER | - | NO | 0 | ❌ | ❌ | ❌ | Điểm số (0-990 TOEIC) |
| 6 | `correct_answers` | INTEGER | - | NO | 0 | ❌ | ❌ | ❌ | Số câu đúng |
| 7 | `total_questions` | INTEGER | - | NO | 0 | ❌ | ❌ | ❌ | Tổng số câu |
| 8 | `time_spent` | INTEGER | - | NO | 0 | ❌ | ❌ | ❌ | Thời gian làm bài (giây) |
| 9 | `results` | JSONB | - | YES | NULL | ❌ | ❌ | ❌ | Chi tiết kết quả |
| 10 | `started_at` | TIMESTAMPTZ | - | YES | NULL | ❌ | ❌ | ❌ | Thời điểm bắt đầu |
| 11 | `completed_at` | TIMESTAMPTZ | - | YES | NULL | ❌ | ❌ | ❌ | Thời điểm hoàn thành |
| 12 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm tạo |
| 13 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm cập nhật |

### **JSONB Structure - `results`:**

```json
{
  "answers": [
    {
      "question_id": "q-12345",
      "order_index": 0,
      "user_answer": "A",
      "correct_answer": "B",
      "is_correct": false,
      "time_spent": 45,
      "part": 5
    }
  ],
  "part_scores": {
    "listening": 350,
    "reading": 320,
    "part1": 5,
    "part2": 20,
    "part3": 25,
    "part4": 20,
    "part5": 30,
    "part6": 12,
    "part7": 38
  },
  "accuracy_by_part": {
    "part1": 83.3,
    "part2": 80.0,
    "part3": 75.8
  }
}
```

### **Constraints & Indexes:**

```sql
-- Primary Key
PK_exam_sessions: PRIMARY KEY (id)

-- Foreign Keys
FK_exam_sessions_exam_set_id: FOREIGN KEY (exam_set_id) REFERENCES exam_sets(id) ON DELETE SET NULL

-- Check Constraints
CHECK_status: status IN ('in_progress', 'completed', 'paused')
CHECK_score: score >= 0 AND score <= 990
CHECK_correct_answers: correct_answers >= 0 AND correct_answers <= total_questions
CHECK_time_spent: time_spent >= 0

-- Indexes
idx_exam_sessions_user_id: ON exam_sessions(user_id)
idx_exam_sessions_exam_set_id: ON exam_sessions(exam_set_id)
idx_exam_sessions_status: ON exam_sessions(status)
idx_exam_sessions_completed_at: ON exam_sessions(completed_at)
idx_exam_sessions_user_completed: ON exam_sessions(user_id, exam_set_id, completed_at) -- Composite
```

### **Business Rules:**

1. `status = 'in_progress'`: Đang làm bài
2. `status = 'completed'`: Đã hoàn thành → set `completed_at`
3. `status = 'paused'`: Tạm dừng (có thể tiếp tục)
4. `score` tính theo chuẩn TOEIC: 0-990
5. TOEIC full test: 200 câu → score 10-990

### **Score Calculation Formula:**

```
Listening Score = (correct_listening / total_listening) * 495
Reading Score = (correct_reading / total_reading) * 495
Total Score = Listening Score + Reading Score
```

### **Related Tables:**

- **Parent:** profiles (user_id), exam_sets (exam_set_id)
- **Children:** exam_attempts

---

## 7. **exam_attempts** - Chi tiết trả lời từng câu

**Mô tả:** Lưu chi tiết câu trả lời của từng câu trong phiên thi

**Table Name:** `exam_attempts`  
**Row Count (Estimate):** 20,000,000+ records  
**Storage Size:** ~500MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID |
| 2 | `session_id` | UUID | - | NO | - | ❌ | ❌ | ❌ | ID phiên thi |
| 3 | `question_id` | UUID | - | NO | - | ❌ | ❌ | ❌ | ID câu hỏi |
| 4 | `user_answer` | VARCHAR | 1 | YES | NULL | ❌ | ❌ | ❌ | Đáp án user chọn (A/B/C/D) |
| 5 | `is_correct` | BOOLEAN | - | YES | NULL | ❌ | ❌ | ❌ | Đúng/Sai |
| 6 | `time_spent` | INTEGER | - | YES | NULL | ❌ | ❌ | ❌ | Thời gian trả lời (giây) |
| 7 | `answered_at` | TIMESTAMPTZ | - | YES | NULL | ❌ | ❌ | ❌ | Thời điểm trả lời |
| 8 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm tạo |

### **Constraints & Indexes:**

```sql
-- Primary Key
PK_exam_attempts: PRIMARY KEY (id)

-- Check Constraints
CHECK_user_answer: user_answer IS NULL OR user_answer IN ('A', 'B', 'C', 'D')
CHECK_time_spent: time_spent IS NULL OR time_spent >= 0

-- Indexes
idx_exam_attempts_session_id: ON exam_attempts(session_id)
idx_exam_attempts_question_id: ON exam_attempts(question_id)
idx_exam_attempts_answered_at: ON exam_attempts(answered_at)
```

### **Business Rules:**

1. `user_answer = NULL`: Câu bỏ trống
2. `is_correct`: So sánh `user_answer` với `correct_choice` trong questions
3. `time_spent`: Tính từ khi hiển thị câu hỏi đến khi submit

### **Related Tables:**

- **Parent:** exam_sessions (session_id), questions (question_id)

---

## 8. **exam_statistics** - Thống kê đề thi

**Mô tả:** Lưu thống kê tổng hợp của mỗi đề thi

**Table Name:** `exam_statistics`  
**Row Count (Estimate):** ~5,000 records (1 record/exam_set)  
**Storage Size:** ~2MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID |
| 2 | `exam_set_id` | UUID | - | NO | - | ❌ | ✅ | ✅ | ID đề thi (UNIQUE FK) |
| 3 | `total_attempts` | INTEGER | - | YES | 0 | ❌ | ❌ | ❌ | Tổng số lượt thi |
| 4 | `average_score` | DECIMAL | 5,2 | YES | NULL | ❌ | ❌ | ❌ | Điểm trung bình |
| 5 | `average_time_spent` | INTEGER | - | YES | NULL | ❌ | ❌ | ❌ | Thời gian TB (giây) |
| 6 | `completion_rate` | DECIMAL | 5,2 | YES | NULL | ❌ | ❌ | ❌ | Tỷ lệ hoàn thành (%) |
| 7 | `difficulty_distribution` | JSONB | - | YES | NULL | ❌ | ❌ | ❌ | Phân bố độ khó |
| 8 | `part_performance` | JSONB | - | YES | NULL | ❌ | ❌ | ❌ | Hiệu suất theo Part |
| 9 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Cập nhật lần cuối |

### **JSONB Structures:**

#### `difficulty_distribution`:
```json
{
  "easy": {
    "correct": 450,
    "total": 500,
    "accuracy": 90.0
  },
  "medium": {
    "correct": 320,
    "total": 400,
    "accuracy": 80.0
  },
  "hard": {
    "correct": 180,
    "total": 300,
    "accuracy": 60.0
  }
}
```

#### `part_performance`:
```json
{
  "part1": {
    "avg_score": 85.5,
    "completion_rate": 92.3,
    "avg_time_per_question": 5
  },
  "part2": {
    "avg_score": 78.2,
    "completion_rate": 88.1,
    "avg_time_per_question": 8
  }
}
```

### **Related Tables:**

- **Parent:** exam_sets (exam_set_id) - 1:1 relationship

---

## 9. **attempts** - Lịch sử luyện tập

**Mô tả:** Lưu lịch sử luyện tập câu hỏi riêng lẻ (legacy table)

**Table Name:** `attempts`  
**Row Count (Estimate):** 5,000,000+ records  
**Storage Size:** ~200MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID |
| 2 | `user_id` | UUID | - | NO | - | ❌ | ❌ | ❌ | ID người dùng |
| 3 | `item_id` | UUID | - | NO | - | ❌ | ✅ | ❌ | ID câu hỏi (FK → questions.id) |
| 4 | `correct` | BOOLEAN | - | NO | - | ❌ | ❌ | ❌ | Đúng/Sai |
| 5 | `response` | VARCHAR | 10 | YES | NULL | ❌ | ❌ | ❌ | Đáp án user |
| 6 | `time_ms` | INTEGER | - | YES | NULL | ❌ | ❌ | ❌ | Thời gian (milliseconds) |
| 7 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Thời điểm làm |

---

## 10. **reviews** - Hệ thống ôn tập

**Mô tả:** Hệ thống ôn tập theo thuật toán Spaced Repetition (SM-2)

**Table Name:** `reviews`  
**Row Count (Estimate):** 1,000,000+ records  
**Storage Size:** ~50MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID |
| 2 | `user_id` | UUID | - | NO | - | ❌ | ❌ | ❌ | ID người dùng |
| 3 | `item_id` | UUID | - | NO | - | ❌ | ✅ | ❌ | ID câu hỏi (FK → questions.id) |
| 4 | `due_at` | TIMESTAMPTZ | - | NO | - | ❌ | ❌ | ❌ | Ngày đến hạn ôn |
| 5 | `interval_days` | INTEGER | - | YES | 1 | ❌ | ❌ | ❌ | Khoảng cách ôn (ngày) |
| 6 | `ease_factor` | DECIMAL | 3,2 | YES | 2.5 | ❌ | ❌ | ❌ | Hệ số độ khó (SM-2) |
| 7 | `repetitions` | INTEGER | - | YES | 0 | ❌ | ❌ | ❌ | Số lần đã ôn |
| 8 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày tạo |
| 9 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày cập nhật |

### **SM-2 Algorithm:**

```
if quality >= 3:
    if repetitions == 0:
        interval = 1
    elif repetitions == 1:
        interval = 6
    else:
        interval = previous_interval * ease_factor
    
    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    repetitions += 1
else:
    repetitions = 0
    interval = 1

due_at = now() + interval days
```

---

## 11. **question_drafts** - Bản nháp câu hỏi

**Mô tả:** Lưu bản nháp khi tạo câu hỏi (auto-save)

**Table Name:** `question_drafts`  
**Row Count (Estimate):** 10,000+ drafts  
**Storage Size:** ~10MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID |
| 2 | `user_id` | UUID | - | NO | - | ❌ | ❌ | ❌ | ID người dùng |
| 3 | `form_data` | JSONB | - | NO | - | ❌ | ❌ | ❌ | Dữ liệu form |
| 4 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày tạo |
| 5 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày cập nhật |

---

## 12. **classes** - Lớp học

**Mô tả:** Quản lý lớp học do giáo viên tạo

**Table Name:** `classes`  
**Row Count (Estimate):** 1,000+ classes  
**Storage Size:** ~1MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID lớp |
| 2 | `name` | VARCHAR | 255 | NO | - | ❌ | ❌ | ❌ | Tên lớp |
| 3 | `description` | TEXT | - | YES | NULL | ❌ | ❌ | ❌ | Mô tả |
| 4 | `teacher_id` | UUID | - | YES | NULL | ❌ | ❌ | ❌ | ID giáo viên |
| 5 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày tạo |
| 6 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày cập nhật |

---

## 13. **class_students** - Học viên trong lớp

**Mô tả:** Liên kết học viên với lớp học (N:M)

**Table Name:** `class_students`  
**Row Count (Estimate):** 50,000+ records  
**Storage Size:** ~5MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID |
| 2 | `class_id` | UUID | - | YES | NULL | ❌ | ✅ | ❌ | ID lớp (FK → classes.id) |
| 3 | `student_id` | UUID | - | YES | NULL | ❌ | ✅ | ❌ | ID học viên (FK → profiles.user_id) |
| 4 | `status` | VARCHAR | 20 | YES | 'active' | ❌ | ❌ | ❌ | Trạng thái: active/inactive |
| 5 | `joined_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày tham gia |

### **Unique Constraint:**
```sql
UQ_class_students: UNIQUE (class_id, student_id) -- 1 học viên không thể join 2 lần vào 1 lớp
```

---

## 14. **teacher_students** - Quan hệ giáo viên - học viên

**Mô tả:** Quản lý mối quan hệ 1-1 hoặc 1-N giữa giáo viên và học viên

**Table Name:** `teacher_students`  
**Row Count (Estimate):** 20,000+ relationships  
**Storage Size:** ~3MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID |
| 2 | `teacher_id` | UUID | - | NO | - | ❌ | ❌ | ❌ | ID giáo viên |
| 3 | `student_id` | UUID | - | NO | - | ❌ | ❌ | ❌ | ID học viên |
| 4 | `status` | VARCHAR | 20 | YES | 'active' | ❌ | ❌ | ❌ | Trạng thái: active/inactive |
| 5 | `notes` | TEXT | - | YES | NULL | ❌ | ❌ | ❌ | Ghi chú của giáo viên |
| 6 | `assigned_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày gán |
| 7 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày tạo |
| 8 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày cập nhật |

### **Unique Constraint:**
```sql
UQ_teacher_students: UNIQUE (teacher_id, student_id)
```

---

## 15. **alerts** - Thông báo

**Mô tả:** Hệ thống thông báo cho giáo viên

**Table Name:** `alerts`  
**Row Count (Estimate):** 100,000+ alerts  
**Storage Size:** ~20MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID |
| 2 | `type` | VARCHAR | 50 | NO | - | ❌ | ❌ | ❌ | Loại thông báo |
| 3 | `title` | VARCHAR | 255 | NO | - | ❌ | ❌ | ❌ | Tiêu đề |
| 4 | `message` | TEXT | - | NO | - | ❌ | ❌ | ❌ | Nội dung |
| 5 | `teacher_id` | UUID | - | YES | NULL | ❌ | ❌ | ❌ | ID giáo viên (người nhận) |
| 6 | `student_id` | UUID | - | YES | NULL | ❌ | ❌ | ❌ | ID học viên (đối tượng) |
| 7 | `is_read` | BOOLEAN | - | YES | FALSE | ❌ | ❌ | ❌ | Đã đọc chưa |
| 8 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày tạo |
| 9 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày cập nhật |

### **Alert Types:**
- `low_score` - Điểm thấp
- `no_activity` - Không hoạt động
- `progress` - Tiến bộ
- `deadline` - Sắp đến deadline

---

## 16. **alert_rules** - Quy tắc thông báo

**Mô tả:** Cấu hình quy tắc tự động tạo thông báo

**Table Name:** `alert_rules`  
**Row Count (Estimate):** 1,000+ rules  
**Storage Size:** ~1MB

| # | Column Name | Data Type | Length | Nullable | Default | PK | FK | UK | Description |
|---|-------------|-----------|--------|----------|---------|----|----|----|-----------  |
| 1 | `id` | UUID | - | NO | `uuid_generate_v4()` | ✅ | ❌ | ❌ | ID |
| 2 | `name` | VARCHAR | 255 | NO | - | ❌ | ❌ | ❌ | Tên rule |
| 3 | `description` | TEXT | - | YES | NULL | ❌ | ❌ | ❌ | Mô tả |
| 4 | `type` | VARCHAR | 50 | NO | - | ❌ | ❌ | ❌ | Loại rule |
| 5 | `condition` | TEXT | - | NO | - | ❌ | ❌ | ❌ | Điều kiện (JSON/SQL) |
| 6 | `threshold` | DECIMAL | 10,2 | YES | NULL | ❌ | ❌ | ❌ | Ngưỡng kích hoạt |
| 7 | `notification_type` | VARCHAR | 50 | YES | NULL | ❌ | ❌ | ❌ | Loại thông báo |
| 8 | `is_enabled` | BOOLEAN | - | YES | TRUE | ❌ | ❌ | ❌ | Kích hoạt |
| 9 | `teacher_id` | UUID | - | YES | NULL | ❌ | ❌ | ❌ | ID giáo viên (owner) |
| 10 | `created_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày tạo |
| 11 | `updated_at` | TIMESTAMPTZ | - | YES | NOW() | ❌ | ❌ | ❌ | Ngày cập nhật |

---

## 17. **Database Views**

### **View: questions_with_passages**

**Mô tả:** Kết hợp questions + passages để query hiệu quả hơn

**Columns:**
- All columns from `questions`
- `passage_texts` (JSONB)
- `passage_audio_url` (TEXT)
- `passage_type` (VARCHAR)
- `passage_assets` (JSONB)

**SQL Definition:**
```sql
CREATE VIEW questions_with_passages AS
SELECT 
  q.*,
  p.texts AS passage_texts,
  p.audio_url AS passage_audio_url,
  p.passage_type,
  p.assets AS passage_assets
FROM questions q
LEFT JOIN passages p ON q.passage_id = p.id;
```

---

### **View: exam_questions_full**

**Mô tả:** Kết hợp exam_questions + questions + passages (full information)

**Columns:**
- `exam_question_id` (UUID)
- `exam_set_id` (UUID)
- `order_index` (INTEGER)
- All columns from `questions`
- `passage_texts` (JSONB)
- `passage_audio_url` (TEXT)
- `passage_type` (VARCHAR)

**SQL Definition:**
```sql
CREATE VIEW exam_questions_full AS
SELECT 
  eq.id AS exam_question_id,
  eq.exam_set_id,
  eq.order_index,
  q.*,
  p.texts AS passage_texts,
  p.audio_url AS passage_audio_url,
  p.passage_type
FROM exam_questions eq
JOIN questions q ON eq.question_id = q.id
LEFT JOIN passages p ON q.passage_id = p.id
ORDER BY eq.order_index;
```

---

## 18. **Enums & Custom Types**

### **Enum: app_role**
```sql
CREATE TYPE app_role AS ENUM ('user', 'admin', 'student', 'teacher');
```

**Values:**
- `user` - Người dùng thông thường
- `admin` - Quản trị viên
- `student` - Học viên
- `teacher` - Giáo viên

---

### **Enum: difficulty**
```sql
CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');
```

**Values:**
- `easy` - Dễ (TOEIC 300-500)
- `medium` - Trung bình (TOEIC 500-750)
- `hard` - Khó (TOEIC 750-990)

---

### **Enum: drill_type**
```sql
CREATE TYPE drill_type AS ENUM ('vocab', 'grammar', 'listening', 'reading', 'mix');
```

**Values:**
- `vocab` - Từ vựng
- `grammar` - Ngữ pháp
- `listening` - Nghe (Part 1-4)
- `reading` - Đọc (Part 5-7)
- `mix` - Tổng hợp (Full test)

---

## 📊 **DATABASE STATISTICS**

| Metric | Value |
|--------|-------|
| Total Tables | 17 |
| Total Views | 2 |
| Total Functions | 27 |
| Total Enums | 3 |
| Total Indexes | ~50+ |
| Estimated Total Rows | 30,000,000+ |
| Estimated DB Size | ~1-2 GB |

---

## 🔒 **DATA RETENTION POLICY**

| Table | Retention Period | Notes |
|-------|-----------------|-------|
| exam_sessions | 5 years | Lưu trữ lâu dài cho báo cáo |
| exam_attempts | 5 years | Liên kết với sessions |
| attempts | 2 years | Lịch sử luyện tập |
| alerts | 6 months | Thông báo cũ có thể xóa |
| question_drafts | 3 months | Auto-delete drafts cũ |

---

**Generated:** October 2025  
**Version:** 1.0.0  
**Database:** Supabase PostgreSQL 13+  


