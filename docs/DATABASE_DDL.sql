-- ============================================
-- DATABASE DDL SCRIPT
-- O-Buddy Hello - TOEIC Learning Management System
-- Supabase PostgreSQL 13+
-- ============================================
-- Version: 1.0.0
-- Generated: October 2025
-- Purpose: Tái tạo cấu trúc database hoàn chỉnh
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vector extension (for future AI features)
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- CUSTOM TYPES & ENUMS
-- ============================================

-- App roles
CREATE TYPE app_role AS ENUM ('user', 'admin', 'student', 'teacher');

-- Difficulty levels
CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');

-- Drill/Exam types
CREATE TYPE drill_type AS ENUM ('vocab', 'grammar', 'listening', 'reading', 'mix');

-- ============================================
-- DROP EXISTING TABLES (IF RECREATING)
-- ============================================
-- Uncomment if you want to recreate from scratch

/*
DROP TABLE IF EXISTS exam_attempts CASCADE;
DROP TABLE IF EXISTS exam_statistics CASCADE;
DROP TABLE IF EXISTS exam_sessions CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exam_sets CASCADE;
DROP TABLE IF EXISTS question_drafts CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS attempts CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS passages CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS alert_rules CASCADE;
DROP TABLE IF EXISTS class_students CASCADE;
DROP TABLE IF EXISTS teacher_students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS app_role CASCADE;
DROP TYPE IF EXISTS difficulty CASCADE;
DROP TYPE IF EXISTS drill_type CASCADE;
*/

-- ============================================
-- TABLE: profiles
-- Hồ sơ người dùng (học viên, giáo viên)
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- Liên kết với Supabase Auth
    name VARCHAR(255),
    role app_role NOT NULL DEFAULT 'student',
    target_score INTEGER DEFAULT 500 CHECK (target_score >= 0 AND target_score <= 990),
    test_date DATE,
    locales VARCHAR(10) DEFAULT 'vi',
    focus TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Comments
COMMENT ON TABLE profiles IS 'Hồ sơ người dùng (học viên và giáo viên)';
COMMENT ON COLUMN profiles.user_id IS 'ID người dùng từ Supabase Auth';
COMMENT ON COLUMN profiles.target_score IS 'Điểm TOEIC mục tiêu (0-990)';
COMMENT ON COLUMN profiles.focus IS 'Mảng các kỹ năng tập trung: listening, reading, grammar, vocabulary';

-- ============================================
-- TABLE: passages
-- Đoạn văn cho Part 3, 4, 6, 7
-- ============================================

CREATE TABLE passages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part INTEGER NOT NULL CHECK (part IN (3, 4, 6, 7)),
    passage_type VARCHAR(20) NOT NULL CHECK (passage_type IN ('single', 'double', 'triple')),
    texts JSONB NOT NULL, -- {title, content, content2, content3, img_url, img_url2, img_url3}
    audio_url TEXT, -- Required for Part 3, 4
    image_url TEXT,
    assets JSONB, -- {images: [], charts: []}
    meta JSONB, -- {word_count, reading_time, topic}
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_passages_part ON passages(part);
CREATE INDEX idx_passages_type ON passages(passage_type);
CREATE INDEX idx_passages_created_by ON passages(created_by);

-- Comments
COMMENT ON TABLE passages IS 'Đoạn văn TOEIC cho Part 3, 4, 6, 7';
COMMENT ON COLUMN passages.texts IS 'JSONB: {title, content, content2, content3} cho single/double/triple passages';
COMMENT ON COLUMN passages.assets IS 'JSONB: {images: [urls], charts: [urls]}';
COMMENT ON COLUMN passages.meta IS 'JSONB: {word_count, reading_time, topic, difficulty_level}';

-- ============================================
-- TABLE: questions
-- Ngân hàng câu hỏi TOEIC (7 Parts)
-- ============================================

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part INTEGER NOT NULL CHECK (part >= 1 AND part <= 7),
    passage_id UUID REFERENCES passages(id) ON DELETE SET NULL,
    blank_index INTEGER CHECK (blank_index IS NULL OR (blank_index >= 1 AND blank_index <= 4)), -- Part 6 only
    prompt_text TEXT NOT NULL,
    choices JSONB NOT NULL, -- {A: "...", B: "...", C: "...", D: "..."}
    correct_choice VARCHAR(1) NOT NULL CHECK (correct_choice IN ('A', 'B', 'C', 'D')),
    explain_vi TEXT NOT NULL,
    explain_en TEXT NOT NULL,
    tags JSONB DEFAULT '[]', -- ["grammar_tenses", "vocabulary_business"]
    difficulty difficulty NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    image_url TEXT, -- Required for Part 1
    audio_url TEXT, -- Required for Part 1-4
    transcript TEXT, -- For Part 2-4
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_questions_part ON questions(part);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_passage_id ON questions(passage_id);
CREATE INDEX idx_questions_created_by ON questions(created_by);
CREATE INDEX idx_questions_part_status ON questions(part, status); -- Composite

-- Comments
COMMENT ON TABLE questions IS 'Ngân hàng câu hỏi TOEIC 7 Parts';
COMMENT ON COLUMN questions.part IS 'Part TOEIC (1-7)';
COMMENT ON COLUMN questions.passage_id IS 'ID đoạn văn (Part 3, 4, 6, 7)';
COMMENT ON COLUMN questions.blank_index IS 'Vị trí chỗ trống trong đoạn văn (Part 6: 1-4)';
COMMENT ON COLUMN questions.choices IS 'JSONB: {A: "text", B: "text", C: "text", D: "text"}';
COMMENT ON COLUMN questions.tags IS 'JSONB array: ["grammar_tenses", "vocabulary_business"]';

-- ============================================
-- TABLE: exam_sets
-- Đề thi / Bộ đề luyện tập
-- ============================================

CREATE TABLE exam_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type drill_type NOT NULL DEFAULT 'mix',
    difficulty difficulty NOT NULL DEFAULT 'medium',
    question_count INTEGER DEFAULT 0 CHECK (question_count >= 0 AND question_count <= 200),
    time_limit INTEGER CHECK (time_limit IS NULL OR (time_limit >= 1 AND time_limit <= 300)), -- minutes
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_attempts BOOLEAN DEFAULT TRUE,
    max_attempts INTEGER CHECK (max_attempts IS NULL OR max_attempts >= 1),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exam_sets_type ON exam_sets(type);
CREATE INDEX idx_exam_sets_difficulty ON exam_sets(difficulty);
CREATE INDEX idx_exam_sets_is_active ON exam_sets(is_active);
CREATE INDEX idx_exam_sets_created_by ON exam_sets(created_by);

-- Comments
COMMENT ON TABLE exam_sets IS 'Đề thi và bộ đề luyện tập';
COMMENT ON COLUMN exam_sets.question_count IS 'Số câu hỏi trong đề (tự động cập nhật)';
COMMENT ON COLUMN exam_sets.time_limit IS 'Thời gian làm bài (phút). NULL = không giới hạn';
COMMENT ON COLUMN exam_sets.max_attempts IS 'Số lần làm tối đa. NULL = không giới hạn';

-- ============================================
-- TABLE: exam_questions
-- Liên kết câu hỏi với đề thi
-- ============================================

CREATE TABLE exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_set_id UUID NOT NULL REFERENCES exam_sets(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_set_id, order_index) -- Không trùng thứ tự trong 1 đề
);

-- Indexes
CREATE INDEX idx_exam_questions_exam_set_id ON exam_questions(exam_set_id);
CREATE INDEX idx_exam_questions_question_id ON exam_questions(question_id);

-- Comments
COMMENT ON TABLE exam_questions IS 'Many-to-Many: Câu hỏi trong đề thi';
COMMENT ON COLUMN exam_questions.order_index IS 'Thứ tự câu hỏi trong đề (0-based)';

-- ============================================
-- TABLE: exam_sessions
-- Phiên làm bài thi
-- ============================================

CREATE TABLE exam_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    exam_set_id UUID REFERENCES exam_sets(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 990),
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    time_spent INTEGER NOT NULL DEFAULT 0 CHECK (time_spent >= 0), -- seconds
    results JSONB, -- {answers: [], part_scores: {}, accuracy_by_part: {}}
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (correct_answers >= 0 AND correct_answers <= total_questions)
);

-- Indexes
CREATE INDEX idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_exam_set_id ON exam_sessions(exam_set_id);
CREATE INDEX idx_exam_sessions_status ON exam_sessions(status);
CREATE INDEX idx_exam_sessions_completed_at ON exam_sessions(completed_at);
CREATE INDEX idx_exam_sessions_user_completed ON exam_sessions(user_id, exam_set_id, completed_at); -- Composite

-- Comments
COMMENT ON TABLE exam_sessions IS 'Phiên làm bài thi của học viên';
COMMENT ON COLUMN exam_sessions.score IS 'Điểm TOEIC (0-990)';
COMMENT ON COLUMN exam_sessions.time_spent IS 'Thời gian làm bài (giây)';
COMMENT ON COLUMN exam_sessions.results IS 'JSONB chi tiết: {answers: [...], part_scores: {...}, accuracy_by_part: {...}}';

-- ============================================
-- TABLE: exam_attempts
-- Chi tiết trả lời từng câu trong phiên thi
-- ============================================

CREATE TABLE exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    question_id UUID NOT NULL,
    user_answer VARCHAR(1) CHECK (user_answer IS NULL OR user_answer IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN,
    time_spent INTEGER CHECK (time_spent IS NULL OR time_spent >= 0), -- seconds
    answered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exam_attempts_session_id ON exam_attempts(session_id);
CREATE INDEX idx_exam_attempts_question_id ON exam_attempts(question_id);
CREATE INDEX idx_exam_attempts_answered_at ON exam_attempts(answered_at);

-- Comments
COMMENT ON TABLE exam_attempts IS 'Chi tiết câu trả lời trong phiên thi';
COMMENT ON COLUMN exam_attempts.user_answer IS 'Đáp án user chọn (A/B/C/D). NULL = bỏ trống';

-- ============================================
-- TABLE: exam_statistics
-- Thống kê đề thi
-- ============================================

CREATE TABLE exam_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_set_id UUID NOT NULL UNIQUE REFERENCES exam_sets(id) ON DELETE CASCADE, -- 1:1 relationship
    total_attempts INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    average_time_spent INTEGER, -- seconds
    completion_rate DECIMAL(5,2), -- percentage
    difficulty_distribution JSONB, -- {easy: {correct, total, accuracy}, medium: {...}, hard: {...}}
    part_performance JSONB, -- {part1: {avg_score, completion_rate, avg_time}, part2: {...}}
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exam_statistics_exam_set_id ON exam_statistics(exam_set_id);

-- Comments
COMMENT ON TABLE exam_statistics IS 'Thống kê tổng hợp của đề thi';
COMMENT ON COLUMN exam_statistics.completion_rate IS 'Tỷ lệ hoàn thành (%)';
COMMENT ON COLUMN exam_statistics.difficulty_distribution IS 'JSONB: {easy: {correct, total, accuracy}, ...}';
COMMENT ON COLUMN exam_statistics.part_performance IS 'JSONB: {part1: {avg_score, completion_rate}, ...}';

-- ============================================
-- TABLE: attempts
-- Lịch sử luyện tập (legacy table)
-- ============================================

CREATE TABLE attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    correct BOOLEAN NOT NULL,
    response VARCHAR(10),
    time_ms INTEGER, -- milliseconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_item_id ON attempts(item_id);
CREATE INDEX idx_attempts_created_at ON attempts(created_at);

-- Comments
COMMENT ON TABLE attempts IS 'Lịch sử luyện tập câu hỏi riêng lẻ (legacy)';

-- ============================================
-- TABLE: reviews
-- Hệ thống ôn tập (Spaced Repetition - SM-2)
-- ============================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    due_at TIMESTAMPTZ NOT NULL,
    interval_days INTEGER DEFAULT 1,
    ease_factor DECIMAL(3,2) DEFAULT 2.5, -- SM-2 algorithm
    repetitions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_due_at ON reviews(due_at);
CREATE INDEX idx_reviews_item_id ON reviews(item_id);
CREATE INDEX idx_reviews_user_due ON reviews(user_id, due_at); -- Composite

-- Comments
COMMENT ON TABLE reviews IS 'Hệ thống ôn tập theo thuật toán Spaced Repetition (SM-2)';
COMMENT ON COLUMN reviews.ease_factor IS 'Hệ số độ khó (SM-2 algorithm, default 2.5)';
COMMENT ON COLUMN reviews.interval_days IS 'Khoảng cách ôn tập (ngày)';

-- ============================================
-- TABLE: question_drafts
-- Bản nháp câu hỏi (auto-save)
-- ============================================

CREATE TABLE question_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    form_data JSONB NOT NULL, -- Lưu toàn bộ dữ liệu form
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_question_drafts_user_id ON question_drafts(user_id);

-- Comments
COMMENT ON TABLE question_drafts IS 'Bản nháp câu hỏi (auto-save khi tạo câu hỏi)';

-- ============================================
-- TABLE: classes
-- Lớp học
-- ============================================

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);

-- Comments
COMMENT ON TABLE classes IS 'Lớp học do giáo viên tạo';

-- ============================================
-- TABLE: class_students
-- Học viên trong lớp (Many-to-Many)
-- ============================================

CREATE TABLE class_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id) -- 1 học viên không join 2 lần vào 1 lớp
);

-- Indexes
CREATE INDEX idx_class_students_class_id ON class_students(class_id);
CREATE INDEX idx_class_students_student_id ON class_students(student_id);

-- Comments
COMMENT ON TABLE class_students IS 'Many-to-Many: Học viên tham gia lớp học';

-- ============================================
-- TABLE: teacher_students
-- Quan hệ giáo viên - học viên (1:1 hoặc 1:N)
-- ============================================

CREATE TABLE teacher_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL,
    student_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT, -- Ghi chú của giáo viên về học viên
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, student_id)
);

-- Indexes
CREATE INDEX idx_teacher_students_teacher_id ON teacher_students(teacher_id);
CREATE INDEX idx_teacher_students_student_id ON teacher_students(student_id);

-- Comments
COMMENT ON TABLE teacher_students IS 'Quan hệ giáo viên - học viên (1:1 hoặc 1:N)';

-- ============================================
-- TABLE: alerts
-- Thông báo
-- ============================================

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- low_score, no_activity, progress, deadline
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    teacher_id UUID, -- Người nhận thông báo
    student_id UUID, -- Đối tượng của thông báo
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alerts_teacher_id ON alerts(teacher_id);
CREATE INDEX idx_alerts_student_id ON alerts(student_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_type ON alerts(type);

-- Comments
COMMENT ON TABLE alerts IS 'Thông báo cho giáo viên';
COMMENT ON COLUMN alerts.type IS 'Loại: low_score, no_activity, progress, deadline';

-- ============================================
-- TABLE: alert_rules
-- Quy tắc tạo thông báo tự động
-- ============================================

CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    condition TEXT NOT NULL, -- JSON/SQL condition
    threshold DECIMAL(10,2),
    notification_type VARCHAR(50),
    is_enabled BOOLEAN DEFAULT TRUE,
    teacher_id UUID, -- Owner của rule
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alert_rules_teacher_id ON alert_rules(teacher_id);
CREATE INDEX idx_alert_rules_is_enabled ON alert_rules(is_enabled);
CREATE INDEX idx_alert_rules_type ON alert_rules(type);

-- Comments
COMMENT ON TABLE alert_rules IS 'Quy tắc tự động tạo thông báo';
COMMENT ON COLUMN alert_rules.condition IS 'Điều kiện kích hoạt (JSON/SQL)';
COMMENT ON COLUMN alert_rules.threshold IS 'Ngưỡng kích hoạt (số)';

-- ============================================
-- VIEWS
-- ============================================

-- View: questions_with_passages
-- Kết hợp questions + passages
CREATE OR REPLACE VIEW questions_with_passages AS
SELECT 
    q.*,
    p.texts AS passage_texts,
    p.audio_url AS passage_audio_url,
    p.passage_type,
    p.assets AS passage_assets
FROM questions q
LEFT JOIN passages p ON q.passage_id = p.id;

COMMENT ON VIEW questions_with_passages IS 'View: Câu hỏi kèm đoạn văn';

-- View: exam_questions_full
-- Kết hợp exam_questions + questions + passages
CREATE OR REPLACE VIEW exam_questions_full AS
SELECT 
    eq.id AS exam_question_id,
    eq.exam_set_id,
    eq.order_index,
    q.id AS question_id,
    q.part AS part_number,
    q.blank_index,
    q.prompt_text,
    q.choices,
    q.correct_choice,
    q.explain_vi,
    q.explain_en,
    q.tags,
    q.difficulty,
    q.status,
    p.id AS passage_id,
    p.texts AS passage_texts,
    p.audio_url AS passage_audio_url,
    p.passage_type
FROM exam_questions eq
JOIN questions q ON eq.question_id = q.id
LEFT JOIN passages p ON q.passage_id = p.id
ORDER BY eq.order_index;

COMMENT ON VIEW exam_questions_full IS 'View: Câu hỏi trong đề thi (full info)';

-- ============================================
-- FUNCTIONS & STORED PROCEDURES
-- ============================================

-- Function: update_updated_at_column
-- Tự động cập nhật updated_at khi record thay đổi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_passages_updated_at BEFORE UPDATE ON passages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_sets_updated_at BEFORE UPDATE ON exam_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_sessions_updated_at BEFORE UPDATE ON exam_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_drafts_updated_at BEFORE UPDATE ON question_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teacher_students_updated_at BEFORE UPDATE ON teacher_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_statistics_updated_at BEFORE UPDATE ON exam_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: update_exam_set_question_count
-- Tự động cập nhật question_count trong exam_sets
CREATE OR REPLACE FUNCTION update_exam_set_question_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE exam_sets 
        SET question_count = question_count + 1 
        WHERE id = NEW.exam_set_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE exam_sets 
        SET question_count = question_count - 1 
        WHERE id = OLD.exam_set_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_count_on_insert 
AFTER INSERT ON exam_questions 
FOR EACH ROW EXECUTE FUNCTION update_exam_set_question_count();

CREATE TRIGGER update_question_count_on_delete 
AFTER DELETE ON exam_questions 
FOR EACH ROW EXECUTE FUNCTION update_exam_set_question_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - BASIC SETUP
-- ============================================
-- Note: Detailed RLS policies should be configured in Supabase dashboard

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================
-- Uncomment to insert sample data

/*
-- Sample Profile (Student)
INSERT INTO profiles (user_id, name, role, target_score, test_date, locales, focus)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Nguyễn Văn A', 'student', 750, '2025-12-31', 'vi', ARRAY['listening', 'reading']);

-- Sample Profile (Teacher)
INSERT INTO profiles (user_id, name, role, target_score, locales)
VALUES 
    ('00000000-0000-0000-0000-000000000002', 'Trần Thị B', 'teacher', 900, 'vi');

-- Sample Passage (Part 7)
INSERT INTO passages (part, passage_type, texts, created_by)
VALUES 
    (7, 'single', '{"title": "Business Email", "content": "Dear Mr. Smith, I am writing to inform you about..."}', '00000000-0000-0000-0000-000000000002');

-- Sample Question (Part 5)
INSERT INTO questions (part, prompt_text, choices, correct_choice, explain_vi, explain_en, difficulty, status, created_by)
VALUES 
    (5, 'The company _____ a new product next month.', 
     '{"A": "launch", "B": "launches", "C": "will launch", "D": "launched"}', 
     'C', 
     'Dùng "will launch" vì có "next month" (tương lai)', 
     'Use "will launch" because of "next month" (future tense)', 
     'medium', 
     'published',
     '00000000-0000-0000-0000-000000000002');

-- Sample Exam Set
INSERT INTO exam_sets (title, description, type, difficulty, question_count, time_limit, is_active, created_by)
VALUES 
    ('TOEIC Practice Test 1', 'Full TOEIC test with 200 questions', 'mix', 'medium', 0, 120, TRUE, '00000000-0000-0000-0000-000000000002');
*/

-- ============================================
-- DATABASE GRANTS (For Supabase)
-- ============================================
-- Grant necessary permissions

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- COMPLETION
-- ============================================

-- Verify table creation
DO $$ 
DECLARE 
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE 'Successfully created % tables', table_count;
END $$;

-- ============================================
-- END OF DDL SCRIPT
-- ============================================

COMMENT ON SCHEMA public IS 'O-Buddy Hello - TOEIC Learning Management System Database';

-- Script completed successfully!
-- Next steps:
-- 1. Configure RLS policies in Supabase dashboard
-- 2. Setup authentication flows
-- 3. Create necessary stored procedures for business logic
-- 4. Insert initial seed data
-- 5. Setup database backups


