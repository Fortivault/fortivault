-- Agent Messages (for escalation chat)
CREATE TABLE IF NOT EXISTS agent_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content text NOT NULL,
  sender_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  sender_role text NOT NULL,
  recipient_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  target_id uuid,
  target_type text
);

-- Case Templates
CREATE TABLE IF NOT EXISTS case_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  category text,
  content text NOT NULL,
  created_by uuid REFERENCES agents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

-- Training Modules
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

-- Legal Resources
CREATE TABLE IF NOT EXISTS legal_resources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  file_url text,
  uploaded_by uuid REFERENCES agents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Recovery Calculator Results
CREATE TABLE IF NOT EXISTS recovery_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
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