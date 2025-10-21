-- Fix passage ordering by adding start_question_number to metadata
-- This script assigns proper TOEIC question numbers to each passage

-- Part 3: Questions 32-70 (13 passages × 3 questions each)
-- Assign start_question_number based on alphabetical order of passage_id
WITH part3_ordered AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY id) as row_num
  FROM passages
  WHERE part = 3
)
UPDATE passages
SET meta = jsonb_set(
  COALESCE(meta, '{}'::jsonb),
  '{start_question_number}',
  to_jsonb((part3_ordered.row_num - 1) * 3 + 32)
)
FROM part3_ordered
WHERE passages.id = part3_ordered.id;

-- Part 4: Questions 71-100 (10 passages × 3 questions each)
WITH part4_ordered AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY id) as row_num
  FROM passages
  WHERE part = 4
)
UPDATE passages
SET meta = jsonb_set(
  COALESCE(meta, '{}'::jsonb),
  '{start_question_number}',
  to_jsonb((part4_ordered.row_num - 1) * 3 + 71)
)
FROM part4_ordered
WHERE passages.id = part4_ordered.id;

-- Part 6: Questions 131-146 (4 passages × 4 questions each)
WITH part6_ordered AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY id) as row_num
  FROM passages
  WHERE part = 6
)
UPDATE passages
SET meta = jsonb_set(
  COALESCE(meta, '{}'::jsonb),
  '{start_question_number}',
  to_jsonb((part6_ordered.row_num - 1) * 4 + 131)
)
FROM part6_ordered
WHERE passages.id = part6_ordered.id;

-- Part 7: Questions 147-200 (varies: single=2-3 questions, double=5 questions, triple=5 questions)
-- We need to calculate based on actual question count per passage
WITH part7_questions_count AS (
  SELECT 
    p.id as passage_id,
    COUNT(q.id) as question_count,
    ROW_NUMBER() OVER (ORDER BY p.id) as passage_order
  FROM passages p
  LEFT JOIN questions q ON q.passage_id = p.id
  WHERE p.part = 7
  GROUP BY p.id
),
part7_with_start AS (
  SELECT 
    passage_id,
    question_count,
    passage_order,
    147 + SUM(question_count) OVER (ORDER BY passage_order ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) as start_number
  FROM part7_questions_count
)
UPDATE passages
SET meta = jsonb_set(
  COALESCE(meta, '{}'::jsonb),
  '{start_question_number}',
  to_jsonb(COALESCE(part7_with_start.start_number, 147))
)
FROM part7_with_start
WHERE passages.id = part7_with_start.passage_id;

-- Verify the changes
SELECT 
  part,
  id,
  meta->>'start_question_number' as start_q,
  (SELECT COUNT(*) FROM questions WHERE passage_id = passages.id) as q_count
FROM passages
WHERE part IN (3, 4, 6, 7)
ORDER BY part, (meta->>'start_question_number')::int;
