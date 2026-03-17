-- Remove AI features: ai_jobs table, ai_prompts table, max_ai_jobs column, related RLS policies and entitlements

-- Drop RLS policies on ai_jobs (if they exist)
DROP POLICY IF EXISTS ai_jobs_select_member ON ai_jobs;
DROP POLICY IF EXISTS ai_jobs_insert_member ON ai_jobs;

-- Drop ai_jobs table
DROP TABLE IF EXISTS ai_jobs CASCADE;

-- Drop ai_prompts table
DROP TABLE IF EXISTS ai_prompts CASCADE;

-- Remove max_ai_jobs column from plans
ALTER TABLE plans DROP COLUMN IF EXISTS max_ai_jobs;

-- Remove ai entitlements
DELETE FROM entitlements WHERE feature_key = 'max_ai_jobs';
