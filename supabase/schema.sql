-- ============================================================
-- Digital Heroes - Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- CHARITIES
-- ============================================================
create table if not exists public.charities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  image_url text,
  website_url text,
  contribution_total integer not null default 0,
  created_at timestamptz not null default now()
);

-- Seed some charities
insert into public.charities (name, description, website_url) values
  ('Macmillan Cancer Support', 'We help people living with cancer navigate the emotional, practical and financial impact.', 'https://www.macmillan.org.uk'),
  ('Mind', 'We provide advice and support to empower anyone experiencing a mental health problem.', 'https://www.mind.org.uk'),
  ('Sport Relief', 'Bringing the worlds of sport and entertainment together to raise money for vulnerable people.', 'https://www.sportrelief.com'),
  ('Age UK', 'The UKs leading charity for older people, helping them enjoy life and live independently.', 'https://www.ageuk.org.uk'),
  ('Great Ormond Street Hospital', 'Funding research and care for children with serious illnesses.', 'https://www.gosh.org')
on conflict do nothing;

-- ============================================================
-- PROFILES (extends Supabase Auth users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  sub_status text not null default 'inactive' check (sub_status in ('active','cancelled','inactive','trialing','past_due')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  charity_id uuid references public.charities(id),
  charity_pct integer not null default 10 check (charity_pct >= 10 and charity_pct <= 100),
  plan text check (plan in ('monthly', 'yearly')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Helper function to check admin status without RLS recursion
create or replace function public.is_admin(user_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select is_admin from public.profiles where id = user_id;
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', 'Golfer'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SCORES (1–45 Stableford, rolling 5 per user)
-- ============================================================
create table if not exists public.scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score >= 1 and score <= 45),
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Rolling logic: keep only latest 5 scores per user
create or replace function public.enforce_rolling_scores()
returns trigger language plpgsql as $$
declare
  score_count integer;
  oldest_id uuid;
begin
  select count(*) into score_count
  from public.scores
  where user_id = new.user_id;

  if score_count >= 5 then
    select id into oldest_id
    from public.scores
    where user_id = new.user_id
    order by date asc, created_at asc
    limit 1;

    delete from public.scores where id = oldest_id;
  end if;

  return new;
end;
$$;

drop trigger if exists rolling_scores_trigger on public.scores;
create trigger rolling_scores_trigger
  before insert on public.scores
  for each row execute procedure public.enforce_rolling_scores();

-- ============================================================
-- DRAWS
-- ============================================================
create table if not exists public.draws (
  id uuid primary key default uuid_generate_v4(),
  month_year text not null unique, -- e.g. "2024-01"
  winning_numbers integer[] not null,
  prize_pool integer not null default 0, -- in pence
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- WINNERS
-- ============================================================
create table if not exists public.winners (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  draw_id uuid not null references public.draws(id) on delete cascade,
  match_tier integer not null check (match_tier in (3,4,5)),
  prize_amount integer not null, -- in pence
  proof_url text,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','rejected')),
  created_at timestamptz not null default now(),
  unique (user_id, draw_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.scores enable row level security;
alter table public.charities enable row level security;
alter table public.draws enable row level security;
alter table public.winners enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view and manage all profiles" on public.profiles for all using (public.is_admin(auth.uid()));

-- Scores policies
create policy "Users manage own scores" on public.scores for all using (auth.uid() = user_id);
create policy "Admins view all scores" on public.scores for select using (public.is_admin(auth.uid()));

-- Charities policies
create policy "Anyone can view charities" on public.charities for select using (true);
create policy "Admins manage charities" on public.charities for all using (public.is_admin(auth.uid()));

-- Draws policies
create policy "Anyone can view draws" on public.draws for select using (true);
create policy "Admins manage draws" on public.draws for all using (public.is_admin(auth.uid()));

-- Winners policies
create policy "Users view own wins" on public.winners for select using (auth.uid() = user_id);
create policy "Users update own proof" on public.winners for update using (auth.uid() = user_id);
create policy "Admins manage winners" on public.winners for all using (public.is_admin(auth.uid()));

-- ============================================================
-- STORAGE BUCKET for winner proofs
-- ============================================================
insert into storage.buckets (id, name, public)
values ('winner-proofs', 'winner-proofs', false)
on conflict do nothing;

-- Users can only upload to a folder named with their own ID
create policy "Winners can upload proofs" on storage.objects 
  for insert with check (bucket_id = 'winner-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Winners can view own proofs" on storage.objects 
  for select using (bucket_id = 'winner-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Admins can view all proofs" on storage.objects 
  for select using (bucket_id = 'winner-proofs' and public.is_admin(auth.uid()));
