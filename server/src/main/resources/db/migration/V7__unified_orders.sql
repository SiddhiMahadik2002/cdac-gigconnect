-- V7__unified_orders.sql
-- Migration to create unified orders table and migrate existing data

-- Create enum types for PostgreSQL
CREATE TYPE order_type AS ENUM ('GIG_PURCHASE', 'CUSTOM_PROJECT');
CREATE TYPE order_source AS ENUM ('DIRECT_GIG', 'ACCEPTED_PROPOSAL');
CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'DELIVERED', 'REVISION_REQUESTED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- Create unified orders table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_type order_type NOT NULL,
    order_source order_source NOT NULL,
    
    -- User relationships
    client_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    
    -- Optional relationships based on order type
    gig_id BIGINT NULL,
    requirement_id BIGINT NULL,
    proposal_id BIGINT NULL,
    
    -- Payment and amount
    payment_id VARCHAR(255) NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    
    -- Order details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Status and workflow
    status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
    
    -- Work notes and feedback
    delivery_notes TEXT,
    client_notes TEXT,
    revision_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMPTZ NULL,
    delivered_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    delivery_date TIMESTAMPTZ NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_orders_client FOREIGN KEY (client_id) REFERENCES clients(client_id),
    CONSTRAINT fk_orders_freelancer FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(freelancer_id),
    CONSTRAINT fk_orders_gig FOREIGN KEY (gig_id) REFERENCES gigs(id),
    CONSTRAINT fk_orders_requirement FOREIGN KEY (requirement_id) REFERENCES requirements(id),
    CONSTRAINT fk_orders_proposal FOREIGN KEY (proposal_id) REFERENCES proposals(id)
);

-- Create indexes for performance
CREATE INDEX idx_orders_client_id ON orders (client_id);
CREATE INDEX idx_orders_freelancer_id ON orders (freelancer_id);
CREATE INDEX idx_orders_gig_id ON orders (gig_id);
CREATE INDEX idx_orders_requirement_id ON orders (requirement_id);
CREATE INDEX idx_orders_proposal_id ON orders (proposal_id);
CREATE INDEX idx_orders_payment_id ON orders (payment_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at);

-- Note: Data migration from gig_orders and proposals tables is commented out
-- as these tables may not exist yet or may have different structures.
-- This migration focuses on creating the new unified orders table structure.
-- Data migration can be handled separately once the old tables are confirmed to exist.

-- Migrate existing gig_orders to unified orders table (enabled for data migration)
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
    delivery_notes,
    client_notes,
    created_at,
    updated_at,
    delivery_date
)
SELECT 
    'GIG_PURCHASE'::order_type as order_type,
    'DIRECT_GIG'::order_source as order_source,
    go.client_id,
    g.freelancer_id,
    go.gig_id,
    go.payment_id,
    go.amount,
    g.title,
    g.description,
    CASE 
        WHEN go.order_status = 'CONFIRMED' THEN 'CONFIRMED'::order_status
        WHEN go.order_status = 'IN_PROGRESS' THEN 'IN_PROGRESS'::order_status
        WHEN go.order_status = 'DELIVERED' THEN 'DELIVERED'::order_status
        WHEN go.order_status = 'REVISION_REQUESTED' THEN 'REVISION_REQUESTED'::order_status
        WHEN go.order_status = 'COMPLETED' THEN 'COMPLETED'::order_status
        WHEN go.order_status = 'CANCELLED' THEN 'CANCELLED'::order_status
        ELSE 'CONFIRMED'::order_status
    END as status,
    go.delivery_notes,
    go.client_notes,
    go.created_at,
    go.updated_at,
    go.delivery_date
FROM gig_orders go
INNER JOIN gigs g ON go.gig_id = g.id;

-- Migrate accepted proposals to unified orders table (enabled for data migration)
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
    client_notes,
    created_at,
    updated_at,
    completed_at
)
SELECT 
    'CUSTOM_PROJECT'::order_type as order_type,
    'ACCEPTED_PROPOSAL'::order_source as order_source,
    r.client_id,
    p.freelancer_id,
    p.requirement_id,
    p.id,
    CONCAT('proposal_', p.id) as payment_id,
    p.proposed_price,
    r.title,
    r.description,
    CASE 
        WHEN p.status = 'ACCEPTED' THEN 'CONFIRMED'::order_status
        WHEN p.status = 'IN_PROGRESS' THEN 'IN_PROGRESS'::order_status
        WHEN p.status = 'AWAITING_COMPLETION' THEN 'DELIVERED'::order_status
        WHEN p.status = 'COMPLETED' THEN 'COMPLETED'::order_status
        WHEN p.status = 'REJECTED' THEN 'CANCELLED'::order_status
        ELSE 'CONFIRMED'::order_status
    END as status,
    p.client_feedback,
    p.created_at,
    p.created_at as updated_at,
    p.completed_at
FROM proposals p
INNER JOIN requirements r ON p.requirement_id = r.id
WHERE p.status IN ('ACCEPTED', 'IN_PROGRESS', 'AWAITING_COMPLETION', 'COMPLETED');