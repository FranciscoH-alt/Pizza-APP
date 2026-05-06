-- Add trivia/correct-answer support to battles
ALTER TABLE battles ADD COLUMN IF NOT EXISTS correct_option TEXT CHECK (correct_option IN ('a', 'b'));
ALTER TABLE battles ADD COLUMN IF NOT EXISTS fun_fact TEXT;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS question TEXT;
