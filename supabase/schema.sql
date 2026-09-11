-- ============================================================
-- DS FITNESS FEES MAINTANCE -- Database Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ADMINS
-- Whitelist of phone numbers allowed to operate this gym's data.
-- Add the owner's number here after creating the project.
-- ------------------------------------------------------------
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,          -- E.164 format e.g. +919876543210
  full_name text not null default 'Admin',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SETTINGS  (single row, gym-wide configuration)
-- ------------------------------------------------------------
create table if not exists settings (
  id int primary key default 1,
  gym_name text not null default 'DS FITNESS',
  admin_name text not null default 'PRAMIT KUMAR',
  currency text not null default 'INR',
  default_monthly_fee numeric(10,2) not null default 1500,
  default_due_day int not null default 5, -- day of month new members default to
  reminder_days_before int not null default 3,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------------------
-- MEMBERS
-- ------------------------------------------------------------
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  member_code text unique not null,           -- e.g. DSF0001, human friendly ID
  full_name text not null,
  mobile_number text not null,
  email text,
  gender text check (gender in ('Male','Female','Other')),
  date_of_birth date,
  joining_date date not null default current_date,
  membership_plan text not null default 'Standard',
  membership_duration_months int not null default 1,
  monthly_fee numeric(10,2) not null default 1500,
  fee_due_date date not null,
  emergency_contact text,
  address text,
  status text not null default 'Active' check (status in ('Active','Expired','Left Gym')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_members_status on members(status);
create index if not exists idx_members_name on members using gin (to_tsvector('simple', full_name));
create index if not exists idx_members_mobile on members(mobile_number);

-- Auto-generate a human friendly member code like DSF0001
create sequence if not exists member_code_seq start 1;
create or replace function set_member_code()
returns trigger as $$
begin
  if new.member_code is null or new.member_code = '' then
    new.member_code := 'DSF' || lpad(nextval('member_code_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_member_code on members;
create trigger trg_set_member_code
before insert on members
for each row execute function set_member_code();

drop trigger if exists trg_members_updated_at on members;
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
create trigger trg_members_updated_at
before update on members
for each row execute function touch_updated_at();

-- ------------------------------------------------------------
-- ATTENDANCE / DAILY ENTRIES
-- ------------------------------------------------------------
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  entry_date date not null default current_date,
  entry_time time not null default current_time,
  created_at timestamptz not null default now()
);
create index if not exists idx_attendance_member on attendance(member_id);
create index if not exists idx_attendance_date on attendance(entry_date);

-- ------------------------------------------------------------
-- PAYMENTS  (permanent, immutable financial history)
-- One row per fee payment. Never deleted, only inserted.
-- ------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  fee_period text not null,           -- e.g. '2026-09' (year-month this payment covers)
  amount numeric(10,2) not null,
  due_date date not null,
  paid_date date not null default current_date,
  payment_method text not null default 'Cash' check (payment_method in ('Cash','UPI','Card','Bank Transfer','Other')),
  reference_note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_member on payments(member_id);
create index if not exists idx_payments_period on payments(fee_period);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Every table is locked down. Only a phone number present in the
-- `admins` table (and currently authenticated via Supabase Auth OTP)
-- may read or write anything. Anonymous / unauthenticated access
-- is fully denied.
-- ------------------------------------------------------------
alter table admins enable row level security;
alter table settings enable row level security;
alter table members enable row level security;
alter table attendance enable row level security;
alter table payments enable row level security;

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admins
    where phone = (auth.jwt() ->> 'phone')
       or phone = replace((auth.jwt() ->> 'phone'), '+', '')
  );
$$ language sql stable security definer;

-- admins table: an authenticated admin can only read the list (no writes from client)
drop policy if exists "admins_select" on admins;
create policy "admins_select" on admins for select using (is_admin());

drop policy if exists "settings_all" on settings;
create policy "settings_all" on settings for all using (is_admin()) with check (is_admin());

drop policy if exists "members_all" on members;
create policy "members_all" on members for all using (is_admin()) with check (is_admin());

drop policy if exists "attendance_all" on attendance;
create policy "attendance_all" on attendance for all using (is_admin()) with check (is_admin());

drop policy if exists "payments_all" on payments;
create policy "payments_all" on payments for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- SEED: add yourself as the first admin after deploying.
-- Replace the phone number below, then run this once:
--
--   insert into admins (phone, full_name)
--   values ('+91XXXXXXXXXX', 'PRAMIT KUMAR');
--
-- ------------------------------------------------------------
