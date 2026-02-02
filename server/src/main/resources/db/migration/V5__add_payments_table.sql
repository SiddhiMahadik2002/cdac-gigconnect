-- Add payments table for Razorpay integration

CREATE TYPE payment_status AS ENUM ('CREATED', 'PAID', 'FAILED');
CREATE TYPE reference_type AS ENUM ('GIG', 'PROPOSAL');

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    reference_type reference_type NOT NULL,
    reference_id VARCHAR(255) NOT NULL, -- Store as string to handle both Long and UUID references
    razorpay_order_id VARCHAR(255) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(255),
    amount NUMERIC(19,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_payment_user FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_reference ON payments(reference_type, reference_id);
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);

-- Add payment status to proposals table
ALTER TABLE proposals 
ADD COLUMN payment_id UUID,
ADD CONSTRAINT fk_proposal_payment FOREIGN KEY(payment_id) REFERENCES payments(id);

-- Add payment status to gigs (for direct gig purchases)
ALTER TABLE gigs 
ADD COLUMN is_purchased BOOLEAN DEFAULT FALSE,
ADD COLUMN purchased_by BIGINT,
ADD CONSTRAINT fk_gig_purchased_by FOREIGN KEY(purchased_by) REFERENCES clients(client_id);