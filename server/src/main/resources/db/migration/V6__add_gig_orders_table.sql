-- Flyway migration for gig orders table

CREATE TYPE gig_order_status AS ENUM ('CONFIRMED', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'DELIVERED', 'REVISION_REQUESTED', 'COMPLETED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS gig_orders (
    id SERIAL PRIMARY KEY,
    gig_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    payment_id VARCHAR(255) NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    order_status gig_order_status NOT NULL DEFAULT 'CONFIRMED',
    delivery_date TIMESTAMPTZ,
    delivery_notes TEXT,
    client_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT fk_gig_order_gig FOREIGN KEY(gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
    CONSTRAINT fk_gig_order_client FOREIGN KEY(client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    CONSTRAINT uk_payment_id UNIQUE(payment_id)
);

-- Add indexes for performance
CREATE INDEX idx_gig_orders_gig_id ON gig_orders(gig_id);
CREATE INDEX idx_gig_orders_client_id ON gig_orders(client_id);
CREATE INDEX idx_gig_orders_status ON gig_orders(order_status);
CREATE INDEX idx_gig_orders_created_at ON gig_orders(created_at);