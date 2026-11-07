-- ============================================================================
-- AETHER HOSPITAL - SETUP PART: 01_tables_auth_helpers.sql
-- Extensions, enums, tables, auth trigger, helper functions, login + slot RPCs.
-- Run the parts in order: 01 -> 02 -> 03 -> 04.
-- ============================================================================

-- ============================================================================
-- AETHER HOSPITAL â€” COMPLETE SUPABASE BACKEND
-- ----------------------------------------------------------------------------
-- Run this whole file once in the Supabase Dashboard â†’ SQL Editor.
-- It is safe to re-run (idempotent where possible).
--
-- WHAT THIS CREATES
--   1. Enums + helper functions
--   2. departments, slot_templates, profiles, doctors, appointments, notifications
--   3. Auth trigger that creates a profile whenever someone signs up
--   4. RLS policies (patients only see their own data, doctors only their own)
--   5. RPCs: book_appointment, cancel_my_appointment, update_appointment_status,
--            get_available_slots, resolve_login_email
--   6. Notification triggers (patient + doctor are notified on every booking change)
--   7. Seed data: 6 departments, 3 demo doctors, 1 demo patient
--
-- DOCTOR LOGINS (email / password) â€” created at the bottom of this file
--   Dr. Sarah Mitchell  sarah.mitchell@aetherhospital.com  Sarah@2026
--   Dr. Marcus Vance    marcus.vance@aetherhospital.com    Marcus@2026
--   Dr. Priya Nair      priya.nair@aetherhospital.com     Priya@2026
--
-- DEMO PATIENT LOGIN
--   patient@aetherhospital.com / Patient@2026
-- ============================================================================


-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================
create extension if not exists pgcrypto;


-- ============================================================================
-- 1. ENUMS
-- ============================================================================
do $$
begin
  create type public.user_role as enum ('patient', 'doctor', 'admin');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
exception when duplicate_object then null;
end $$;


-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- Departments (kept in sync with the frontend DEPARTMENTS constant) ---------
create table if not exists public.departments (
  id                text primary key,
  name              text not null,
  icon_name         text not null default 'Stethoscope',
  short_description text not null default '',
  full_description  text not null default '',
  location          text not null default '',
  contact_ext       text not null default '',
  created_at        timestamptz not null default now()
);

-- Standard daily slot grid --------------------------------------------------
create table if not exists public.slot_templates (
  id         serial primary key,
  time_label text not null unique,
  period     text not null check (period in ('morning', 'afternoon', 'evening')),
  sort_order int  not null
);

-- One profile row per auth user (patients AND doctors) ----------------------
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  role                public.user_role not null default 'patient',
  full_name           text not null default '',
  email               text,
  phone_country_code  text not null default '+91',
  phone_number        text,
  age                 int check (age between 0 and 120),
  gender              text,
  blood_group         text,
  emergency_contact   text,
  avatar_initials     text,
  notification_opt_in boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index if not exists profiles_email_unique
  on public.profiles (lower(email))
  where email is not null;

create unique index if not exists profiles_phone_unique
  on public.profiles (regexp_replace(phone_number, '\D', '', 'g'))
  where phone_number is not null;

-- Doctor directory. user_id links a doctor to their auth login --------------
create table if not exists public.doctors (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid unique references public.profiles(id) on delete set null,
  department_id     text not null references public.departments(id) on delete restrict,
  full_name         text not null,
  email             text unique,
  specialty         text not null default '',
  qualification     text not null default '',
  room              text,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists doctors_department_idx on public.doctors (department_id);

-- Appointment reference generator ------------------------------------------
create sequence if not exists public.appointment_ref_seq start with 1001;

create or replace function public.generate_appointment_reference()
returns text
language sql
volatile
as $$
  select 'AET-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('public.appointment_ref_seq')::text, 4, '0');
$$;

-- Appointments --------------------------------------------------------------
create table if not exists public.appointments (
  id                uuid primary key default gen_random_uuid(),
  reference_id      text not null unique default public.generate_appointment_reference(),
  patient_id        uuid not null references public.profiles(id) on delete cascade,
  doctor_id         uuid references public.doctors(id) on delete set null,
  department_id     text not null references public.departments(id) on delete restrict,
  appointment_date  date not null,
  appointment_time  text not null,
  time_period       text check (time_period in ('morning', 'afternoon', 'evening')),
  patient_name      text not null,
  patient_age       int not null check (patient_age between 0 and 120),
  patient_phone     text not null,
  patient_email     text,
  reason            text,
  status            public.appointment_status not null default 'confirmed',
  doctor_notes      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  cancelled_at      timestamptz
);

-- One appointment per department / date / time. This is what keeps slots from
-- being double-booked. Cancelled appointments release the slot.
create unique index if not exists appointments_slot_unique
  on public.appointments (department_id, appointment_date, appointment_time)
  where status in ('pending', 'confirmed');

create index if not exists appointments_patient_idx
  on public.appointments (patient_id, appointment_date desc);
create index if not exists appointments_doctor_idx
  on public.appointments (doctor_id, appointment_date);
create index if not exists appointments_department_date_idx
  on public.appointments (department_id, appointment_date);

-- In-app notifications (also the outbox for SMS / email delivery) -----------
create table if not exists public.notifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete cascade,
  type           text not null default 'general'
                 check (type in (
                   'appointment_created',
                   'appointment_confirmed',
                   'appointment_completed',
                   'appointment_cancelled',
                   'appointment_reminder',
                   'general'
                 )),
  channel        text not null default 'in_app'
                 check (channel in ('in_app', 'sms', 'email')),
  title          text not null,
  body           text not null,
  metadata       jsonb not null default '{}'::jsonb,
  is_read        boolean not null default false,
  created_at     timestamptz not null default now(),
  read_at        timestamptz
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, is_read, created_at desc);


-- ============================================================================
-- 3. GENERIC updated_at TRIGGER
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();


-- ============================================================================
-- 4. AUTH â†’ PROFILE TRIGGER
--    Role is taken ONLY from raw_app_meta_data, which users cannot write.
--    Sign-up metadata (raw_user_meta_data) is used for name / phone / age.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role        public.user_role := 'patient';
  v_full_name   text;
  v_initials    text;
  v_age_text    text;
begin
  if coalesce(new.raw_app_meta_data ->> 'role', '') in ('doctor', 'admin') then
    v_role := (new.raw_app_meta_data ->> 'role')::public.user_role;
  end if;

  v_full_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(new.email, 'Patient'), '@', 1)
  );

  v_initials := upper(
    left(v_full_name, 1) ||
    coalesce(nullif(split_part(v_full_name, ' ', 2), ''), '')
  );
  v_initials := left(regexp_replace(v_initials, '[^A-Z]', '', 'g'), 2);
  if length(v_initials) < 1 then
    v_initials := 'PT';
  end if;

  v_age_text := nullif(new.raw_user_meta_data ->> 'age', '');

  insert into public.profiles (
    id, role, full_name, email, phone_country_code, phone_number,
    age, gender, avatar_initials
  )
  values (
    new.id,
    v_role,
    v_full_name,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'phone_country_code', ''), '+91'),
    nullif(new.raw_user_meta_data ->> 'phone_number', ''),
    case when v_age_text ~ '^\d+$' then v_age_text::int else null end,
    nullif(new.raw_user_meta_data ->> 'gender', ''),
    v_initials
  )
  on conflict (id) do update set
    full_name          = excluded.full_name,
    email              = excluded.email,
    phone_country_code = coalesce(excluded.phone_country_code, public.profiles.phone_country_code),
    phone_number       = coalesce(excluded.phone_number, public.profiles.phone_number),
    age                = coalesce(excluded.age, public.profiles.age),
    gender             = coalesce(excluded.gender, public.profiles.gender);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Role escalation guard: a patient can never update their own role to doctor.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null for service-role / SQL-editor operations, which must be
  -- allowed to change roles (used by the seed section below).
  if auth.uid() is not null and old.role <> 'admin' then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();


-- ============================================================================
-- 5. HELPER FUNCTIONS USED BY RLS
-- ============================================================================
create or replace function public.my_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.my_doctor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.doctors where user_id = auth.uid() limit 1;
$$;


-- ============================================================================
-- 6. RPC: LOGIN BY PHONE
--    Called by the frontend when the login identifier is not an email.
--    Returns the email that belongs to that mobile number.
-- ============================================================================
create or replace function public.resolve_login_email(p_identifier text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email
  from public.profiles
  where email is not null
    and (
      (position('@' in p_identifier) > 0 and lower(email) = lower(trim(p_identifier)))
      or (
        position('@' in p_identifier) = 0
        and regexp_replace(coalesce(phone_number, ''), '\D', '', 'g') <> ''
        and regexp_replace(phone_number, '\D', '', 'g') =
            regexp_replace(p_identifier, '\D', '', 'g')
      )
    )
  limit 1;
$$;


-- ============================================================================
-- 7. RPC: AVAILABLE SLOTS
-- ============================================================================
create or replace function public.get_available_slots(
  p_department_id text,
  p_date date
)
returns table (
  time_label           text,
  period               text,
  is_booked            boolean,
  appointment_reference text,
  doctor_id            uuid,
  doctor_name          text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    st.time_label,
    st.period,
    exists (
      select 1
      from public.appointments a
      where a.department_id = p_department_id
        and a.appointment_date = p_date
        and a.appointment_time = st.time_label
        and a.status in ('pending', 'confirmed')
    ) as is_booked,
    (
      select a.reference_id
      from public.appointments a
      where a.department_id = p_department_id
        and a.appointment_date = p_date
        and a.appointment_time = st.time_label
        and a.status in ('pending', 'confirmed')
      limit 1
    ) as appointment_reference,
    (
      select d.id
      from public.doctors d
      where d.department_id = p_department_id and d.is_active
      order by d.created_at
      limit 1
    ) as doctor_id,
    (
      select d.full_name
      from public.doctors d
      where d.department_id = p_department_id and d.is_active
      order by d.created_at
      limit 1
    ) as doctor_name
  from public.slot_templates st
  order by st.sort_order;
$$;


-- Returns booked/free state for every department + slot on a given day.
-- Runs as SECURITY DEFINER so patients can see that a slot is taken without
-- being able to read other patients' appointment records.
create or replace function public.get_day_slot_availability(p_date date)
returns table (
  department_id         text,
  time_label            text,
  period                text,
  is_booked             boolean,
  appointment_reference text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.id as department_id,
    st.time_label,
    st.period,
    exists (
      select 1
      from public.appointments a
      where a.department_id = d.id
        and a.appointment_date = p_date
        and a.appointment_time = st.time_label
        and a.status in ('pending', 'confirmed')
    ) as is_booked,
    (
      select a.reference_id
      from public.appointments a
      where a.department_id = d.id
        and a.appointment_date = p_date
        and a.appointment_time = st.time_label
        and a.status in ('pending', 'confirmed')
      limit 1
    ) as appointment_reference
  from public.departments d
  cross join public.slot_templates st
  order by d.id, st.sort_order;
$$;

