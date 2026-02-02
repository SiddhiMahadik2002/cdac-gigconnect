-- Flyway migration: create reviews table to store client reviews independently
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    freelancer_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    rating INTEGER,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_freelancer FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(freelancer_id),
    CONSTRAINT fk_reviews_client FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

CREATE INDEX idx_reviews_freelancer_id ON reviews (freelancer_id);
CREATE INDEX idx_reviews_client_id ON reviews (client_id);
