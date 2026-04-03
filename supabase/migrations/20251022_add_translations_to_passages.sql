-- Add translation_vi and translation_en columns to passages table
-- Migration: 2025-10-22 - Add translations support for passages

-- Add translation_vi column (JSONB with content, content2, content3)
ALTER TABLE passages 
ADD COLUMN IF NOT EXISTS translation_vi JSONB DEFAULT NULL;

-- Add translation_en column (JSONB with content, content2, content3)
ALTER TABLE passages 
ADD COLUMN IF NOT EXISTS translation_en JSONB DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN passages.translation_vi IS 'Vietnamese translation - JSONB: {content, content2, content3}';
COMMENT ON COLUMN passages.translation_en IS 'English translation - JSONB: {content, content2, content3}';

-- Example data structure:
-- translation_vi: {"content": "Bản dịch tiếng Việt...", "content2": "...", "content3": "..."}
-- translation_en: {"content": "English translation...", "content2": "...", "content3": "..."}
