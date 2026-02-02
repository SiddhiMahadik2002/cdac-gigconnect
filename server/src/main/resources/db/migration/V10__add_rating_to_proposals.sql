-- Flyway migration: add rating column to proposals
ALTER TABLE proposals ADD COLUMN rating integer;
