-- Flyway initial schema

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone_number VARCHAR(50),
    profile_image_url VARCHAR(2000),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS freelancer_profiles (
    freelancer_id BIGINT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    CONSTRAINT fk_freelancer_user FOREIGN KEY(freelancer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clients (
    client_id BIGINT PRIMARY KEY,
    CONSTRAINT fk_client_user FOREIGN KEY(client_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gigs (
    id SERIAL PRIMARY KEY,
    freelancer_id BIGINT NOT NULL,
    title VARCHAR(1024),
    description TEXT,
    fixed_price numeric(19,2),
    skills TEXT,
    status VARCHAR(50),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted boolean DEFAULT false,
    CONSTRAINT fk_gig_freelancer FOREIGN KEY(freelancer_id) REFERENCES freelancer_profiles(freelancer_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gig_images (
    id SERIAL PRIMARY KEY,
    gig_id BIGINT NOT NULL,
    image_url VARCHAR(2000),
    display_order integer,
    CONSTRAINT fk_gig_image_gig FOREIGN KEY(gig_id) REFERENCES gigs(id) ON DELETE CASCADE
);
