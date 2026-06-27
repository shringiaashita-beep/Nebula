-- Migration Script: Production-Ready PYQ Database Schema
-- Alters the existing public.pyq_questions table and creates auxiliary tables for bookmarks, notes, analytics, and reports.

-- 1. Alter public.pyq_questions to support all required fields
ALTER TABLE public.pyq_questions
  ADD COLUMN IF NOT EXISTS sub_exam TEXT,
  ADD COLUMN IF NOT EXISTS session TEXT,
  ADD COLUMN IF NOT EXISTS paper TEXT,
  ADD COLUMN IF NOT EXISTS subtopic TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'MCQ',
  ADD COLUMN IF NOT EXISTS detailed_solution TEXT,
  ADD COLUMN IF NOT EXISTS short_solution TEXT,
  ADD COLUMN IF NOT EXISTS explanation TEXT,
  ADD COLUMN IF NOT EXISTS marks NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS negative_marks NUMERIC DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS official_answer_key TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tables JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS diagrams TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS formula TEXT,
  ADD COLUMN IF NOT EXISTS important_notes TEXT,
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accuracy_pct NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_time INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bookmark_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Enable RLS on pyq_questions (if required) and create indexes for fast full-text searching
CREATE INDEX IF NOT EXISTS idx_pyq_exam ON public.pyq_questions(exam);
CREATE INDEX IF NOT EXISTS idx_pyq_subject ON public.pyq_questions(subject);
CREATE INDEX IF NOT EXISTS idx_pyq_topic ON public.pyq_questions(topic);
CREATE INDEX IF NOT EXISTS idx_pyq_difficulty ON public.pyq_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_pyq_year ON public.pyq_questions(year);
CREATE INDEX IF NOT EXISTS idx_pyq_search ON public.pyq_questions USING gin(to_tsvector('english', question || ' ' || topic || ' ' || subject));

-- 3. Create User Bookmarks Table
CREATE TABLE IF NOT EXISTS public.pyq_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES public.pyq_questions(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, question_id)
);
ALTER TABLE public.pyq_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bookmarks" ON public.pyq_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- 4. Create User Personal Notes Table
CREATE TABLE IF NOT EXISTS public.pyq_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES public.pyq_questions(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, question_id)
);
ALTER TABLE public.pyq_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notes" ON public.pyq_notes
  FOR ALL USING (auth.uid() = user_id);

-- 5. Create Question Error Reports Table
CREATE TABLE IF NOT EXISTS public.pyq_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question_id BIGINT NOT NULL REFERENCES public.pyq_questions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.pyq_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON public.pyq_reports
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own reports" ON public.pyq_reports
  FOR SELECT USING (auth.uid() = user_id);

-- 6. Create User Question Attempts Table for Analytics
CREATE TABLE IF NOT EXISTS public.pyq_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES public.pyq_questions(id) ON DELETE CASCADE,
  selected_option TEXT,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.pyq_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and insert their own attempts" ON public.pyq_attempts
  FOR ALL USING (auth.uid() = user_id);

-- 7. Create Indexes on Auxiliary Tables for high speed performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.pyq_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON public.pyq_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.pyq_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_question ON public.pyq_attempts(question_id);
