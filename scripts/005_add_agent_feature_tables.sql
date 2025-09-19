-- Training modules table
CREATE TABLE IF NOT EXISTS training_modules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  type varchar(20) NOT NULL DEFAULT 'video',
  duration integer,
  level varchar(20) NOT NULL DEFAULT 'beginner',
  required boolean DEFAULT false,
  completed boolean DEFAULT false,
  progress integer DEFAULT 0,
  content_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Case templates table
CREATE TABLE IF NOT EXISTS case_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  category text,
  content text NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

-- Recovery calculator results table
CREATE TABLE IF NOT EXISTS recovery_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id uuid NOT NULL,
  fraud_type text NOT NULL,
  amount numeric NOT NULL,
  time_since_incident integer NOT NULL,
  payment_method text NOT NULL,
  has_communication boolean,
  has_evidence boolean,
  probability integer NOT NULL,
  estimated_amount numeric NOT NULL,
  timeframe text NOT NULL,
  risk_level text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key for agent_id
ALTER TABLE recovery_results ADD CONSTRAINT fk_agent_id FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;
