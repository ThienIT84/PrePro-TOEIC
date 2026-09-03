# Database Schema — PrePro-TOEIC

Supabase PostgreSQL 13+ với 17+ tables.

## Core Tables

### `profiles`
- Hồ sơ người dùng (học viên, giáo viên)
- Liên kết với Supabase Auth via `user_id`
- Fields: `id`, `user_id`, `name`, `role` (app_role enum), `target_score` (0-990), `test_date`, `locales`, `focus[]`

### `questions`
- Ngân hàng câu hỏi TOEIC 7 Parts
- Fields: `id`, `part` (1-7), `passage_id` (FK), `blank_index`, `prompt_text`, `choices` (JSONB), `correct_choice`, `explain_vi`, `explain_en`, `tags` (JSONB[]), `difficulty`, `status`, `image_url`, `audio_url`, `transcript`, `created_by`
- Key indexes: `part`, `status`, `difficulty`, composite `(part, status)`

### `passages`
- Đoạn văn cho Part 3, 4, 6, 7
- Fields: `id`, `part` (3/4/6/7), `passage_type` ('single'/'double'/'triple'), `texts` (JSONB), `audio_url`, `assets` (JSONB), `meta` (JSONB)

### `exam_sets`
- Đề thi / Bộ đề luyện tập
- Fields: `id`, `title`, `description`, `type` (drill_type), `difficulty`, `question_count`, `time_limit` (minutes), `is_active`, `allow_multiple_attempts`, `max_attempts`, `created_by`

### `exam_questions`
- Liên kết M:N questions ↔ exam_sets
- Fields: `id`, `exam_set_id` (FK), `question_id` (FK), `order_index`
- Unique constraint: `(exam_set_id, order_index)`

### `exam_sessions`
- Phiên thi của học viên
- Fields: `id`, `user_id`, `exam_set_id`, `status` ('in_progress'/'completed'/'paused'), `score` (0-990), `correct_answers`, `total_questions`, `time_spent` (seconds), `results` (JSONB), `started_at`, `completed_at`

### `exam_attempts`
- Chi tiết trả lời từng câu
- Fields: `id`, `session_id`, `question_id`, `user_answer`, `is_correct`, `time_spent`, `answered_at`

### `exam_statistics`
- Thống kê đề thi (1:1 với exam_sets)
- Fields: `id`, `exam_set_id`, `total_attempts`, `average_score`, `average_time_spent`, `completion_rate`, `difficulty_distribution` (JSONB), `part_performance` (JSONB)

## User Management Tables

### `classes`
- Lớp học do teacher tạo

### `class_students`
- M:N students ↔ classes

### `teacher_students`
- Liên kết teacher ↔ student

## Review System Tables

### `reviews`
- Spaced repetition data (SM-2 algorithm)
- Fields: `id`, `user_id`, `item_id`, `due_at`, `interval_days`, `ease_factor`, `repetitions`

### `attempts`
- Legacy attempts table
- Fields: `id`, `user_id`, `item_id`, `correct`, `response`, `time_ms`

## Alert System Tables

### `alerts` & `alert_rules`
- Hệ thống cảnh báo tự động cho teacher

## PostgreSQL Enums

```sql
CREATE TYPE app_role AS ENUM ('user', 'admin', 'student', 'teacher');
CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE drill_type AS ENUM ('vocab', 'grammar', 'listening', 'reading', 'mix');
```

## Key Indexes (50+)

- Single column indexes trên các foreign keys và filter columns
- Composite indexes cho common query patterns:
  - `(part, status)` trên questions
  - `(user_id, exam_set_id, completed_at)` trên exam_sessions
