-- 002_seed_data.sql
-- Purpose: Insert initial seed data (agents, example cases)
-- Run after 001_create_tables.sql

-- Insert a default agent (replace email/password hash with secure values in production)
INSERT INTO agents (email, password_hash, name, status)
VALUES
('admin@example.com', 'REPLACE_WITH_SECURE_HASH', 'Default Admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample case
INSERT INTO cases (case_id, victim_email, scam_type, amount, currency, description, status)
VALUES
('CSRU-000000001', 'victim@example.com', 'crypto', 1000, 'USD', 'Sample case for testing', 'Intake')
ON CONFLICT (case_id) DO NOTHING;
