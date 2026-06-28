-- ============================================================
-- Migration: Assign difficulty levels to existing questions
-- Run this in the Supabase SQL Editor to fix all existing data
-- ============================================================

-- Step 1: Set all JEE Advanced questions to 'Hard'
UPDATE public.pyq_questions
SET difficulty = 'Hard'
WHERE exam = 'JEE Advanced';

-- Step 2: Randomly upgrade ~30% of JEE Main questions to 'Hard'
-- (targets questions whose id mod 3 = 0 as a deterministic random sample)
UPDATE public.pyq_questions
SET difficulty = 'Hard'
WHERE exam = 'JEE Main'
  AND (id::text::int % 3 = 0);

-- Step 3: Set remaining JEE Main questions to a mix of Easy/Medium
UPDATE public.pyq_questions
SET difficulty = 'Easy'
WHERE exam = 'JEE Main'
  AND difficulty = 'Medium'
  AND (id::text::int % 5 = 0);

-- Step 4: For NEET, make ~25% Hard, ~15% Easy
UPDATE public.pyq_questions
SET difficulty = 'Hard'
WHERE exam = 'NEET'
  AND (id::text::int % 4 = 0);

UPDATE public.pyq_questions
SET difficulty = 'Easy'
WHERE exam = 'NEET'
  AND difficulty = 'Medium'
  AND (id::text::int % 6 = 0);

-- Step 5: UPSC/RAS/REET - balanced mix
UPDATE public.pyq_questions
SET difficulty = 'Hard'
WHERE exam IN ('UPSC', 'GATE')
  AND (id::text::int % 3 = 0);

UPDATE public.pyq_questions
SET difficulty = 'Easy'
WHERE exam IN ('RAS', 'REET', 'CAT', 'CUET')
  AND difficulty = 'Medium'
  AND (id::text::int % 4 = 0);

-- Verify the result
SELECT exam, difficulty, COUNT(*) as count
FROM public.pyq_questions
GROUP BY exam, difficulty
ORDER BY exam, difficulty;
