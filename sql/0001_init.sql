-- Misana V1 Supabase schema
-- Run this in Supabase SQL editor on a fresh project

-- ============================================
-- Profiles (admin users)
-- ============================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_self_select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Inquiries (V1: every /request submission)
-- ============================================

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Contact (denormalized for fast filtering)
  name text,
  email text,

  -- Source context
  service text,
  destination text,

  -- Lifecycle
  status text not null default 'new', -- new | contacted | closed | spam

  -- Full payload (everything from /request form)
  payload jsonb not null,

  -- Admin notes
  notes text
);

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx
  on public.inquiries (status);
create index if not exists inquiries_service_idx
  on public.inquiries (service);
create index if not exists inquiries_destination_idx
  on public.inquiries (destination);
create index if not exists inquiries_email_idx
  on public.inquiries (email);

alter table public.inquiries enable row level security;

-- Reads: only authenticated users (admin)
create policy "inquiries_admin_select"
  on public.inquiries for select
  using (auth.role() = 'authenticated');

create policy "inquiries_admin_update"
  on public.inquiries for update
  using (auth.role() = 'authenticated');

-- Writes from the public form: server inserts via service role only.
-- No public insert policy. The /request Server Action uses SUPABASE_SERVICE_ROLE_KEY.

-- updated_at maintenance
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists inquiries_touch_updated_at on public.inquiries;
create trigger inquiries_touch_updated_at
  before update on public.inquiries
  for each row execute function public.touch_updated_at();
