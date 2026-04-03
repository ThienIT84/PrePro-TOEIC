-- Migration: Move Part 6 & 7 images from img_url/img_url2/img_url3 to texts.additional
-- Date: 2025-10-21
-- Purpose: Consolidate Part 6 & 7 image storage to single field for consistency

-- Step 1: Backup current data (create a backup table)
CREATE TABLE IF NOT EXISTS passages_backup_20251021 AS 
SELECT * FROM passages WHERE part IN (6, 7);

-- Step 2: Check current state before migration
DO $$
DECLARE
  part6_old_count INT;
  part6_new_count INT;
  part7_old_count INT;
  part7_new_count INT;
BEGIN
  -- Part 6: Count passages using old structure (img_url fields)
  SELECT COUNT(*) INTO part6_old_count
  FROM passages
  WHERE part = 6
    AND (
      (texts->>'img_url' IS NOT NULL AND texts->>'img_url' != '')
      OR (texts->>'img_url2' IS NOT NULL AND texts->>'img_url2' != '')
      OR (texts->>'img_url3' IS NOT NULL AND texts->>'img_url3' != '')
    )
    AND (texts->>'additional' IS NULL OR texts->>'additional' = '');
  
  -- Part 6: Count passages using new structure (additional field)
  SELECT COUNT(*) INTO part6_new_count
  FROM passages
  WHERE part = 6
    AND texts->>'additional' IS NOT NULL 
    AND texts->>'additional' != '';
  
  -- Part 7: Count passages using old structure (img_url fields)
  SELECT COUNT(*) INTO part7_old_count
  FROM passages
  WHERE part = 7
    AND (
      (texts->>'img_url' IS NOT NULL AND texts->>'img_url' != '')
      OR (texts->>'img_url2' IS NOT NULL AND texts->>'img_url2' != '')
      OR (texts->>'img_url3' IS NOT NULL AND texts->>'img_url3' != '')
    )
    AND (texts->>'additional' IS NULL OR texts->>'additional' = '');
  
  -- Part 7: Count passages using new structure (additional field)
  SELECT COUNT(*) INTO part7_new_count
  FROM passages
  WHERE part = 7
    AND texts->>'additional' IS NOT NULL 
    AND texts->>'additional' != '';
  
  RAISE NOTICE '=== Part 6 Status ===';
  RAISE NOTICE 'Part 6 passages with OLD structure (img_url*): %', part6_old_count;
  RAISE NOTICE 'Part 6 passages with NEW structure (additional): %', part6_new_count;
  RAISE NOTICE '';
  RAISE NOTICE '=== Part 7 Status ===';
  RAISE NOTICE 'Part 7 passages with OLD structure (img_url*): %', part7_old_count;
  RAISE NOTICE 'Part 7 passages with NEW structure (additional): %', part7_new_count;
END $$;

-- Step 3: Migrate img_url, img_url2, img_url3 to texts.additional for Part 6 & 7
UPDATE passages
SET texts = jsonb_set(
  texts,
  '{additional}',
  to_jsonb(
    TRIM(BOTH ' | ' FROM
      CONCAT_WS(' | ',
        CASE WHEN texts->>'img_url' IS NOT NULL AND texts->>'img_url' != '' 
             THEN texts->>'img_url' 
             ELSE NULL END,
        CASE WHEN texts->>'img_url2' IS NOT NULL AND texts->>'img_url2' != '' 
             THEN texts->>'img_url2' 
             ELSE NULL END,
        CASE WHEN texts->>'img_url3' IS NOT NULL AND texts->>'img_url3' != '' 
             THEN texts->>'img_url3' 
             ELSE NULL END
      )
    )
  )
)
WHERE part IN (6, 7)
  AND (
    (texts->>'img_url' IS NOT NULL AND texts->>'img_url' != '')
    OR (texts->>'img_url2' IS NOT NULL AND texts->>'img_url2' != '')
    OR (texts->>'img_url3' IS NOT NULL AND texts->>'img_url3' != '')
  )
  AND (texts->>'additional' IS NULL OR texts->>'additional' = '');

-- Step 4: Verify migration
DO $$
DECLARE
  part6_count INT;
  part7_count INT;
  sample_record RECORD;
BEGIN
  SELECT COUNT(*) INTO part6_count
  FROM passages
  WHERE part = 6
    AND texts->>'additional' IS NOT NULL 
    AND texts->>'additional' != '';
  
  SELECT COUNT(*) INTO part7_count
  FROM passages
  WHERE part = 7
    AND texts->>'additional' IS NOT NULL 
    AND texts->>'additional' != '';
  
  RAISE NOTICE '=== Migration Complete ===';
  RAISE NOTICE 'Total Part 6 passages with additional field: %', part6_count;
  RAISE NOTICE 'Total Part 7 passages with additional field: %', part7_count;
  RAISE NOTICE '';
  
  -- Show sample records from Part 6
  RAISE NOTICE '=== Sample Part 6 Records ===';
  FOR sample_record IN 
    SELECT 
      id,
      part,
      passage_type,
      texts->>'additional' as additional,
      texts->>'img_url' as img_url,
      texts->>'img_url2' as img_url2,
      texts->>'img_url3' as img_url3
    FROM passages
    WHERE part = 6
    LIMIT 3
  LOOP
    RAISE NOTICE '[Part %] ID: %, Type: %, Additional: %, Old img_url: %', 
      sample_record.part,
      sample_record.id, 
      COALESCE(sample_record.passage_type, 'NULL'),
      LEFT(COALESCE(sample_record.additional, 'NULL'), 50),
      LEFT(COALESCE(sample_record.img_url, 'NULL'), 30);
  END LOOP;
  
  RAISE NOTICE '';
  
  -- Show sample records from Part 7
  RAISE NOTICE '=== Sample Part 7 Records ===';
  FOR sample_record IN 
    SELECT 
      id,
      part,
      passage_type,
      texts->>'additional' as additional,
      texts->>'img_url' as img_url,
      texts->>'img_url2' as img_url2,
      texts->>'img_url3' as img_url3
    FROM passages
    WHERE part = 7
    LIMIT 3
  LOOP
    RAISE NOTICE '[Part %] ID: %, Type: %, Additional: %, Old img_url: %', 
      sample_record.part,
      sample_record.id, 
      COALESCE(sample_record.passage_type, 'NULL'),
      LEFT(COALESCE(sample_record.additional, 'NULL'), 50),
      LEFT(COALESCE(sample_record.img_url, 'NULL'), 30);
  END LOOP;
END $$;

-- Step 5: (OPTIONAL - Run this only after verifying everything works!)
-- Clean up old fields img_url, img_url2, img_url3
-- UNCOMMENT BELOW LINES AFTER VERIFICATION:
-- UPDATE passages
-- SET texts = texts - 'img_url' - 'img_url2' - 'img_url3'
-- WHERE part IN (6, 7)
--   AND texts->>'additional' IS NOT NULL 
--   AND texts->>'additional' != '';

-- Final verification queries (run these manually to check results)

-- Part 6 verification:
-- SELECT 
--   id,
--   part,
--   passage_type,
--   texts->>'title' as title,
--   texts->>'additional' as image_urls,
--   LENGTH(texts->>'additional') as url_length,
--   (LENGTH(texts->>'additional') - LENGTH(REPLACE(texts->>'additional', '|', '')) + 1) as image_count
-- FROM passages
-- WHERE part = 6
-- ORDER BY id
-- LIMIT 20;

-- Part 7 verification:
-- SELECT 
--   id,
--   part,
--   passage_type,
--   texts->>'title' as title,
--   texts->>'additional' as image_urls,
--   LENGTH(texts->>'additional') as url_length,
--   (LENGTH(texts->>'additional') - LENGTH(REPLACE(texts->>'additional', '|', '')) + 1) as image_count
-- FROM passages
-- WHERE part = 7
-- ORDER BY passage_type, id
-- LIMIT 20;
