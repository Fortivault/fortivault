-- Enable required extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type submissions_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type announcement_audience as enum ('all','agents','users');
exception when duplicate_object then null; end $$;

-- Submissions
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  status submissions_status not null default 'pending',
  reviewed_by uuid references public.admin_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists submissions_user_id_idx on public.submissions(user_id);
create index if not exists submissions_status_idx on public.submissions(status);

-- Settings
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  description text,
  updated_by uuid references public.admin_users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists settings_key_idx on public.settings(key);

-- System Logs
create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  admin_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists system_logs_action_idx on public.system_logs(action);
create index if not exists system_logs_created_at_idx on public.system_logs(created_at);

-- Announcements
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admin_users(id) on delete cascade,
  message text not null,
  audience announcement_audience not null default 'all',
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists announcements_audience_idx on public.announcements(audience);
create index if not exists announcements_expires_at_idx on public.announcements(expires_at);

-- API Keys
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admin_users(id) on delete cascade,
  key text not null unique,
  permissions jsonb not null default '[]',
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists api_keys_admin_id_idx on public.api_keys(admin_id);

-- Audit Trail
create table if not exists public.audit_trail (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admin_users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  changes jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists audit_trail_entity_idx on public.audit_trail(entity_type, entity_id);
