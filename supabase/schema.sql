-- PawBeacon Optional Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor when upgrading from Zero-Key MVP mode
-- to live Supabase database + full-text search + Realtime updates.

create extension if not exists pg_trgm;

create table if not exists public.providers (
  id text primary key,
  name text not null,
  category text not null check (category in ('clinic', 'hospital', 'boarding', 'diagnostics', 'ambulance', 'ngo')),
  tagline text not null,
  description text not null,
  address text not null,
  neighborhood text not null,
  city text not null default 'Austin',
  distance_km numeric(4,1) not null default 2.5,
  phone text not null,
  is_24_hours boolean not null default false,
  open_hours text not null,
  is_open_now boolean not null default true,
  species text[] not null default '{}',
  services text[] not null default '{}',
  fee_range text not null,
  rating numeric(2,1) not null default 4.8,
  review_count integer not null default 1,
  verified boolean not null default false,
  wait_minutes integer not null default 15,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists providers_search_trgm_idx
  on public.providers using gin ((name || ' ' || neighborhood || ' ' || tagline) gin_trgm_ops);

create index if not exists providers_category_idx on public.providers (category);
create index if not exists providers_24h_idx on public.providers (is_24_hours);

create table if not exists public.corrections (
  id text primary key,
  provider_id text not null references public.providers(id) on delete cascade,
  field text not null check (field in ('hours', 'phone', 'emergency_status', 'services', 'address')),
  suggested_value text not null,
  notes text default '',
  submitted_by text not null default 'Community Member',
  status text not null default 'applied_mvp',
  created_at timestamptz not null default now()
);

alter table public.providers enable row level security;
alter table public.corrections enable row level security;

create policy "Public read access for providers"
  on public.providers for select using (true);

create policy "Public insert access for MVP provider listings"
  on public.providers for insert with check (true);

create policy "Public update access for MVP corrections"
  on public.providers for update using (true);

create policy "Public read and insert access for corrections"
  on public.corrections for select using (true);

create policy "Public insert corrections"
  on public.corrections for insert with check (true);

-- Enable Supabase Realtime on providers and corrections
alter publication supabase_realtime add table public.providers;
alter publication supabase_realtime add table public.corrections;
