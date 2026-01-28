-- Script to delete all data from all tables (PostgreSQL)
-- This will clear all data but keep table structures intact

-- Disable triggers temporarily to avoid constraint issues
SET session_replication_role = replica;

-- Delete all data from all tables using TRUNCATE CASCADE
-- This is faster than DELETE and automatically handles foreign key constraints

TRUNCATE TABLE 
    orders,
    payments,
    gig_orders,
    proposals,
    requirements,
    gigs,
    freelancer_profiles,
    clients,
    users
CASCADE;

-- Alternative approach using DELETE statements in correct order
-- (Uncomment if TRUNCATE doesn't work due to specific constraints)

/*
-- Delete in order to respect foreign key constraints
DELETE FROM orders;
DELETE FROM gig_orders;
DELETE FROM payments;
DELETE FROM proposals;
DELETE FROM requirements;
DELETE FROM gigs;
DELETE FROM freelancer_profiles;
DELETE FROM clients;
DELETE FROM users;
*/

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Reset auto-increment sequences (if any)
-- This ensures IDs start from 1 again

DO $$
DECLARE
    seq_record RECORD;
BEGIN
    -- Reset all sequences to start from 1
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq_record.schemaname || '.' || seq_record.sequencename || ' RESTART WITH 1';
    END LOOP;
END $$;

-- Verify tables are empty
SELECT 
    schemaname,
    table_name,
    n_tup_ins - n_tup_del as row_count
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY table_name;

-- Display success message (PostgreSQL syntax)
DO $$
BEGIN
    RAISE NOTICE 'All data deleted successfully. Tables structure preserved.';
END $$;