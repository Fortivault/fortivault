-- Create email_otp table for verification codes
CREATE TABLE IF NOT EXISTS email_otp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  case_id TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at TIMESTAMPTZ NULL
);

-- Ensure one active record per (email, case_id)
CREATE UNIQUE INDEX IF NOT EXISTS ux_email_otp_email_case ON email_otp (email, case_id);

-- Fast lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_email_otp_expires ON email_otp (expires_at);
CREATE INDEX IF NOT EXISTS idx_email_otp_created ON email_otp (created_at);
