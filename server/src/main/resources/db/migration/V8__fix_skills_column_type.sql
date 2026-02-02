-- Fix skills column type conversion issue
-- Convert TEXT skills column to JSONB for PostgreSQL compatibility

-- First check if the column exists and is of TEXT type
DO $$
BEGIN
    -- Only proceed if skills column exists and is TEXT
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'freelancer_profiles' 
        AND column_name = 'skills' 
        AND data_type = 'text'
    ) THEN
        -- Convert TEXT skills to JSONB using PostgreSQL USING clause
        ALTER TABLE freelancer_profiles 
        ALTER COLUMN skills TYPE JSONB 
        USING CASE 
            WHEN skills IS NULL OR skills = '' THEN '[]'::jsonb
            WHEN skills::text ~ '^[\[\{]' THEN skills::jsonb  -- Already JSON format
            ELSE ('["' || replace(skills, ',', '","') || '"]')::jsonb  -- Convert comma-separated to JSON array
        END;
        
        RAISE NOTICE 'Successfully converted skills column to JSONB type';
    ELSE
        RAISE NOTICE 'Skills column is already JSONB or does not exist';
    END IF;
END $$;