-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add columns to agents table
ALTER TABLE agents 
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_2fa boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS two_factor_type varchar(20) CHECK (two_factor_type IN ('authenticator', 'sms', 'email')),
  ADD COLUMN IF NOT EXISTS two_factor_secret text;