-- Flyway migration: safely add SUBMITTED_FOR_REVIEW to order_status enum
-- This uses a DO block to only add the value if it does not already exist.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'order_status'
          AND e.enumlabel = 'SUBMITTED_FOR_REVIEW'
    ) THEN
        EXECUTE 'ALTER TYPE order_status ADD VALUE ''SUBMITTED_FOR_REVIEW''';
    END IF;
END
$$;
