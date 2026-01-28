-- Simple script to clear all data from tables
-- Paste this directly into your PostgreSQL editor

TRUNCATE TABLE 
    orders,
    payments,
    gig_orders,
    proposals,
    requirements,
    gigs,
    freelancer_profiles,
    clients,
    users,
    gig_images
CASCADE;

SELECT 'All data deleted successfully!' as result;