-- Add per-question timer columns to quizzes table
ALTER TABLE quizzes 
ADD COLUMN per_question_seconds integer DEFAULT 60,
ADD COLUMN use_per_question_timer boolean DEFAULT false NOT NULL;