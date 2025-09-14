-- 001_create_tables.sql
-- Purpose: Create core tables for Fortivault
-- Run order: 001_create_tables.sql -> 002_seed_data.sql

-- Note: modify this script to match your production schema and run via psql or your DB migration tool.

-- agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text UNIQUE NOT NULL,
  victim_email text,
  victim_phone text,
  scam_type text,
  amount numeric,
  currency text,
  timeline text,
  description text,
  status text DEFAULT 'Intake',
  priority text DEFAULT 'normal',
  assigned_agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- chat_rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  victim_email text,
  assigned_agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- case_notes
CREATE TABLE IF NOT EXISTS case_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  note_type text,
  title text,
  content text,
  is_confidential boolean DEFAULT true,
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now()
);

-- email_otp
CREATE TABLE IF NOT EXISTS email_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  case_id text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer DEFAULT 0,
  consumed_at timestamptz NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(email, case_id)
);
