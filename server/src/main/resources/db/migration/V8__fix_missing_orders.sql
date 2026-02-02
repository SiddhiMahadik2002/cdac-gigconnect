-- Fix missing orders by creating them from existing payments
-- This will create orders for any successful payments that don't have corresponding orders

-- Create orders for successful proposal payments that don't have orders yet
INSERT INTO orders (
    order_type,
    order_source,
    client_id,
    freelancer_id,
    requirement_id,
    proposal_id,
    payment_id,
    amount,
    title,
    description,
    status,
    created_at,
    updated_at
)
SELECT DISTINCT
    'CUSTOM_PROJECT'::order_type as order_type,
    'ACCEPTED_PROPOSAL'::order_source as order_source,
    r.client_id,
    p.freelancer_id,
    p.requirement_id,
    p.id,
    pay.razorpay_order_id,
    pay.amount,
    r.title,
    r.description,
    'CONFIRMED'::order_status as status,
    pay.created_at,
    pay.updated_at
FROM payments pay
INNER JOIN proposals p ON pay.reference_id = p.id::text
INNER JOIN requirements r ON p.requirement_id = r.id
LEFT JOIN orders o ON o.payment_id = pay.razorpay_order_id
WHERE pay.reference_type = 'PROPOSAL'
  AND pay.status = 'PAID'
  AND o.id IS NULL;

-- Create orders for successful gig payments that don't have orders yet
INSERT INTO orders (
    order_type,
    order_source,
    client_id,
    freelancer_id,
    gig_id,
    payment_id,
    amount,
    title,
    description,
    status,
    created_at,
    updated_at
)
SELECT DISTINCT
    'GIG_PURCHASE'::order_type as order_type,
    'DIRECT_GIG'::order_source as order_source,
    c.client_id,
    g.freelancer_id,
    g.id,
    pay.razorpay_order_id,
    pay.amount,
    g.title,
    g.description,
    'CONFIRMED'::order_status as status,
    pay.created_at,
    pay.updated_at
FROM payments pay
INNER JOIN gigs g ON pay.reference_id = g.id::text
INNER JOIN users u ON pay.user_id = u.user_id
INNER JOIN clients c ON u.user_id = c.user_id
LEFT JOIN orders o ON o.payment_id = pay.razorpay_order_id
WHERE pay.reference_type = 'GIG'
  AND pay.status = 'PAID'
  AND o.id IS NULL;