-- Flyway migration for requirements and proposals (Phase 1)

CREATE TYPE requirement_status AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE proposal_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE IF NOT EXISTS requirements (
    id SERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL,
    title VARCHAR(1024) NOT NULL,
    description TEXT NOT NULL,
    budget_min numeric(19,2),
    budget_max numeric(19,2),
    skills jsonb,
    status requirement_status DEFAULT 'OPEN',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT fk_requirement_client FOREIGN KEY(client_id) REFERENCES clients(client_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS proposals (
    id SERIAL PRIMARY KEY,
    requirement_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    message TEXT,
    proposed_price numeric(19,2),
    status proposal_status DEFAULT 'PENDING',
    created_at timestamptz DEFAULT now(),
    CONSTRAINT fk_proposal_requirement FOREIGN KEY(requirement_id) REFERENCES requirements(id) ON DELETE CASCADE,
    CONSTRAINT fk_proposal_freelancer FOREIGN KEY(freelancer_id) REFERENCES freelancer_profiles(freelancer_id) ON DELETE CASCADE
);
