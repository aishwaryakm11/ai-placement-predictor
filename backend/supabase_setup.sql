-- ============================================================
-- AI Placement Predictor — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Student Profiles table (stores progressive profile data)
create table if not exists student_profiles (
    user_id                   uuid primary key references auth.users(id) on delete cascade,
    full_name                 text,
    student_id                text,
    department                text,
    semester                  int,
    cgpa                      float,
    tenth_pct                 float,
    twelfth_pct               float,
    backlogs                  int,
    known_languages           text[],
    certifications            text[],
    projects_count            int,
    internships_count         int,
    open_source_contributions int,
    hackathons_attended       int,
    leadership_roles          int,
    aptitude_score            float,
    soft_skill_rating         float,
    target_role               text,
    completed_steps           text[],
    created_at                timestamptz default now(),
    updated_at                timestamptz default now()
);

-- 2. Auto-update updated_at on every row change
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on student_profiles;
create trigger set_updated_at
before update on student_profiles
for each row execute function update_updated_at_column();

-- 3. Enable Row Level Security
alter table student_profiles enable row level security;

-- 4. RLS Policy: students can only read/write their OWN row
drop policy if exists "Students own profile" on student_profiles;
create policy "Students own profile"
on student_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 5. RLS Policy: TPO officers can read ALL student profiles
drop policy if exists "TPO read all" on student_profiles;
create policy "TPO read all"
on student_profiles for select
using (
    (
        select raw_user_meta_data->>'role'
        from auth.users
        where id = auth.uid()
    ) = 'tpo'
);

-- ============================================================
-- Verification: list all tables
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public';
-- ============================================================
