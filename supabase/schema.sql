create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- This table is written through the server-side service role key.
-- Keep insert policy disabled for anonymous clients.
