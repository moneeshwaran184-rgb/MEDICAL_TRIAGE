-- ============================================================================
-- AETHER HOSPITAL — COMPLETE SUPABASE BACKEND
-- ----------------------------------------------------------------------------
-- Run this whole file once in the Supabase Dashboard → SQL Editor.
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
-- DOCTOR LOGINS (email / password) — created at the bottom of this file
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
-- 4. AUTH → PROFILE TRIGGER
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


-- ============================================================================
-- 8. RPC: BOOK APPOINTMENT (atomic, prevents double booking)
-- ============================================================================
create or replace function public.book_appointment(
  p_department_id text,
  p_doctor_id     uuid,
  p_date          date,
  p_time          text,
  p_patient_name  text,
  p_patient_age   int,
  p_patient_phone text,
  p_patient_email text default null,
  p_reason        text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid                 uuid := auth.uid();
  v_profile             public.profiles;
  v_doctor_id           uuid;
  v_time_period         text;
  v_appointment         public.appointments;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if not found then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.departments where id = p_department_id) then
    raise exception 'DEPARTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;

  select period into v_time_period
  from public.slot_templates
  where time_label = p_time;

  if v_time_period is null then
    raise exception 'SLOT_NOT_FOUND' using errcode = 'P0001';
  end if;

  if p_date < current_date then
    raise exception 'DATE_IN_PAST' using errcode = 'P0001';
  end if;

  -- Pick the requested doctor, or the first active doctor in the department.
  if p_doctor_id is not null then
    select id into v_doctor_id
    from public.doctors
    where id = p_doctor_id
      and department_id = p_department_id
      and is_active;

    if v_doctor_id is null then
      raise exception 'DOCTOR_NOT_FOUND' using errcode = 'P0001';
    end if;
  else
    select id into v_doctor_id
    from public.doctors
    where department_id = p_department_id
      and is_active
    order by created_at
    limit 1;
  end if;

  insert into public.appointments (
    patient_id,
    doctor_id,
    department_id,
    appointment_date,
    appointment_time,
    time_period,
    patient_name,
    patient_age,
    patient_phone,
    patient_email,
    reason,
    status
  )
  values (
    v_uid,
    v_doctor_id,
    p_department_id,
    p_date,
    p_time,
    v_time_period,
    coalesce(nullif(trim(p_patient_name), ''), v_profile.full_name),
    p_patient_age,
    coalesce(nullif(trim(p_patient_phone), ''), v_profile.phone_number, ''),
    coalesce(nullif(trim(p_patient_email), ''), v_profile.email),
    nullif(trim(p_reason), ''),
    'confirmed'
  )
  returning * into v_appointment;

  return v_appointment;

exception
  when unique_violation then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
end;
$$;


-- ============================================================================
-- 9. RPC: CANCEL MY APPOINTMENT
-- ============================================================================
create or replace function public.cancel_my_appointment(p_reference text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated int;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  update public.appointments
  set status = 'cancelled',
      cancelled_at = now()
  where reference_id = p_reference
    and patient_id = auth.uid()
    and status in ('pending', 'confirmed');

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;


-- ============================================================================
-- 10. RPC: DOCTOR UPDATES APPOINTMENT STATUS
-- ============================================================================
create or replace function public.update_appointment_status(
  p_id     uuid,
  p_status public.appointment_status,
  p_notes  text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment public.appointments;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  select * into v_appointment
  from public.appointments
  where id = p_id;

  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;

  if not (
    public.my_role() = 'admin'
    or v_appointment.doctor_id = public.my_doctor_id()
  ) then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  update public.appointments
  set status = p_status,
      doctor_notes = coalesce(nullif(trim(p_notes), ''), doctor_notes),
      cancelled_at = case
        when p_status = 'cancelled' then now()
        else cancelled_at
      end
  where id = p_id
  returning * into v_appointment;

  return v_appointment;
end;
$$;


-- ============================================================================
-- 11. NOTIFICATION TRIGGERS
--     Every appointment change creates an in-app notification for the patient
--     AND the doctor. The `notifications` table doubles as the SMS outbox.
-- ============================================================================
create or replace function public.notify_appointment_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_user   uuid;
  v_doctor_user    uuid;
  v_doctor_name    text;
  v_department     text;
  v_when           text;
  v_reference      text;
  v_patient_label  text;
begin
  v_patient_user  := new.patient_id;
  v_reference     := new.reference_id;
  v_patient_label := format('%s (%s y)', new.patient_name, new.patient_age);

  select d.user_id, d.full_name
    into v_doctor_user, v_doctor_name
  from public.doctors d
  where d.id = new.doctor_id;

  select name into v_department
  from public.departments
  where id = new.department_id;

  v_when := format('%s at %s',
    to_char(new.appointment_date, 'Mon DD, YYYY'),
    new.appointment_time
  );

  if tg_op = 'INSERT' then
    -- Patient notification
    insert into public.notifications
      (user_id, appointment_id, type, channel, title, body, metadata)
    values (
      v_patient_user,
      new.id,
      'appointment_created',
      'in_app',
      'Appointment confirmed',
      format('Your %s appointment with %s is confirmed for %s. Reference: %s.',
        coalesce(v_department, 'clinic'),
        coalesce(v_doctor_name, 'your doctor'),
        v_when,
        v_reference),
      jsonb_build_object(
        'reference_id', v_reference,
        'date', new.appointment_date,
        'time', new.appointment_time,
        'doctor', v_doctor_name,
        'department', v_department
      )
    );

    -- SMS row for the patient (consume with an Edge Function + Twilio)
    if v_patient_user is not null then
      insert into public.notifications
        (user_id, appointment_id, type, channel, title, body, metadata)
      select
        v_patient_user,
        new.id,
        'appointment_created',
        'sms',
        'Appointment confirmed',
        format('Aether Hospital: %s appointment confirmed for %s. Ref %s.',
          coalesce(v_department, 'clinic'), v_when, v_reference),
        jsonb_build_object(
          'phone_country_code', p.phone_country_code,
          'phone_number', p.phone_number,
          'reference_id', v_reference
        )
      from public.profiles p
      where p.id = v_patient_user
        and p.notification_opt_in = true
        and coalesce(p.phone_number, '') <> '';
    end if;

    -- Doctor notification
    if v_doctor_user is not null then
      insert into public.notifications
        (user_id, appointment_id, type, channel, title, body, metadata)
      values (
        v_doctor_user,
        new.id,
        'appointment_created',
        'in_app',
        'New appointment booked',
        format('%s booked a %s consultation on %s. Ref: %s.',
          v_patient_label,
          coalesce(v_department, 'clinic'),
          v_when,
          v_reference),
        jsonb_build_object(
          'reference_id', v_reference,
          'patient_name', new.patient_name,
          'patient_age', new.patient_age,
          'patient_phone', new.patient_phone
        )
      );
    end if;

  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'cancelled' then
      insert into public.notifications
        (user_id, appointment_id, type, channel, title, body, metadata)
      values (
        v_patient_user,
        new.id,
        'appointment_cancelled',
        'in_app',
        'Appointment cancelled',
        format('Your %s appointment on %s has been cancelled. Reference: %s.',
          coalesce(v_department, 'clinic'), v_when, v_reference),
        jsonb_build_object('reference_id', v_reference)
      );

      if v_doctor_user is not null then
        insert into public.notifications
          (user_id, appointment_id, type, channel, title, body, metadata)
        values (
          v_doctor_user,
          new.id,
          'appointment_cancelled',
          'in_app',
          'Appointment cancelled',
          format('%s cancelled the appointment on %s. Ref: %s.',
            v_patient_label, v_when, v_reference),
          jsonb_build_object('reference_id', v_reference)
        );
      end if;

    elsif new.status = 'completed' then
      insert into public.notifications
        (user_id, appointment_id, type, channel, title, body, metadata)
      values (
        v_patient_user,
        new.id,
        'appointment_completed',
        'in_app',
        'Consultation completed',
        format('Your %s consultation with %s on %s is marked completed.',
          coalesce(v_department, 'clinic'),
          coalesce(v_doctor_name, 'your doctor'),
          v_when),
        jsonb_build_object('reference_id', v_reference)
      );

      if v_doctor_user is not null then
        insert into public.notifications
          (user_id, appointment_id, type, channel, title, body, metadata)
        values (
          v_doctor_user,
          new.id,
          'appointment_completed',
          'in_app',
          'Consultation completed',
          format('%s consultation on %s marked completed. Ref: %s.',
            v_patient_label, v_when, v_reference),
          jsonb_build_object('reference_id', v_reference)
        );
      end if;

    elsif new.status = 'confirmed' then
      insert into public.notifications
        (user_id, appointment_id, type, channel, title, body, metadata)
      values (
        v_patient_user,
        new.id,
        'appointment_confirmed',
        'in_app',
        'Appointment confirmed',
        format('Your %s appointment on %s has been confirmed by the clinic.',
          coalesce(v_department, 'clinic'), v_when),
        jsonb_build_object('reference_id', v_reference)
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_notify on public.appointments;
create trigger appointments_notify
  after insert or update of status on public.appointments
  for each row execute function public.notify_appointment_event();

-- Allow a patient to mark a notification as read
create or replace function public.mark_notification_read(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated int;
begin
  update public.notifications
  set is_read = true, read_at = now()
  where id = p_id and user_id = auth.uid();
  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;


-- ============================================================================
-- 12. ROW LEVEL SECURITY
-- ============================================================================
alter table public.departments    enable row level security;
alter table public.slot_templates enable row level security;
alter table public.profiles       enable row level security;
alter table public.doctors        enable row level security;
alter table public.appointments   enable row level security;
alter table public.notifications  enable row level security;

-- Departments ---------------------------------------------------------------
drop policy if exists "Departments are public" on public.departments;
create policy "Departments are public"
  on public.departments for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage departments" on public.departments;
create policy "Admins manage departments"
  on public.departments for all
  to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

-- Slot templates ------------------------------------------------------------
drop policy if exists "Slot templates are public" on public.slot_templates;
create policy "Slot templates are public"
  on public.slot_templates for select
  to anon, authenticated
  using (true);

-- Profiles ------------------------------------------------------------------
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Patients can create their own profile" on public.profiles;
create policy "Patients can create their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()) and role = 'patient');

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Doctors can read their patients" on public.profiles;
create policy "Doctors can read their patients"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1
      from public.appointments a
      where a.patient_id = public.profiles.id
        and a.doctor_id = public.my_doctor_id()
    )
  );

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for all
  to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

-- Doctors -------------------------------------------------------------------
drop policy if exists "Doctor directory is public" on public.doctors;
create policy "Doctor directory is public"
  on public.doctors for select
  to anon, authenticated
  using (true);

drop policy if exists "Doctors can update their own row" on public.doctors;
create policy "Doctors can update their own row"
  on public.doctors for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Admins manage doctors" on public.doctors;
create policy "Admins manage doctors"
  on public.doctors for all
  to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

-- Appointments --------------------------------------------------------------
drop policy if exists "Patients read their own appointments" on public.appointments;
create policy "Patients read their own appointments"
  on public.appointments for select
  to authenticated
  using (patient_id = (select auth.uid()));

drop policy if exists "Doctors read their own appointments" on public.appointments;
create policy "Doctors read their own appointments"
  on public.appointments for select
  to authenticated
  using (doctor_id = public.my_doctor_id());

drop policy if exists "Doctors update their own appointments" on public.appointments;
create policy "Doctors update their own appointments"
  on public.appointments for update
  to authenticated
  using (doctor_id = public.my_doctor_id())
  with check (doctor_id = public.my_doctor_id());

drop policy if exists "Admins manage appointments" on public.appointments;
create policy "Admins manage appointments"
  on public.appointments for all
  to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

-- NOTE: there is deliberately no INSERT policy for patients. All bookings go
-- through public.book_appointment(), which validates and locks the slot.

-- Notifications -------------------------------------------------------------
drop policy if exists "Users read their own notifications" on public.notifications;
create policy "Users read their own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users mark their own notifications read" on public.notifications;
create policy "Users mark their own notifications read"
  on public.notifications for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- No INSERT policy: notifications are only created by SECURITY DEFINER triggers.

-- Grants --------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.departments, public.slot_templates, public.doctors to anon, authenticated;
grant select, insert, update on public.profiles, public.appointments, public.notifications to authenticated;
grant execute on function public.my_role() to authenticated;
grant execute on function public.my_doctor_id() to authenticated;
grant execute on function public.resolve_login_email(text) to anon, authenticated;
grant execute on function public.get_available_slots(text, date) to anon, authenticated;
grant execute on function public.get_day_slot_availability(date) to anon, authenticated;
grant execute on function public.book_appointment(text, uuid, date, text, text, int, text, text, text) to authenticated;
grant execute on function public.cancel_my_appointment(text) to authenticated;
grant execute on function public.update_appointment_status(uuid, public.appointment_status, text) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;


-- ============================================================================
-- 13. REALTIME
-- ============================================================================
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.appointments;
exception when others then null;
end $$;


-- ============================================================================
-- 14. SEED DATA — DEPARTMENTS
-- ============================================================================
insert into public.departments (id, name, icon_name, short_description, full_description, location, contact_ext)
values
  ('general-medicine', 'General Medicine', 'Stethoscope',
   'Comprehensive primary healthcare, routine physicals, and preventative consultations.',
   'Our General Medicine clinic delivers thorough clinical assessment, chronic disease management, seasonal illness treatment, and coordinated referrals for patients of all ages.',
   'Building A, Floor 1 (Suite 102)', 'ext. 4101'),
  ('cardiology', 'Cardiology', 'HeartPulse',
   'Advanced cardiovascular diagnostics, arrhythmia monitoring, and heart health.',
   'Specialized diagnostic consultations covering hypertension, ischemic heart disease, palpitations, and continuous non-invasive cardiac evaluation.',
   'Heart & Vascular Center, Floor 3 (Suite 320)', 'ext. 4205'),
  ('neurology', 'Neurology', 'Brain',
   'Expert evaluation for headaches, neuropathies, seizure disorders, and cognitive health.',
   'Specialized clinical assessment of central and peripheral nervous system disorders, migraines, neuromuscular conditions, and coordinated neuro-rehabilitation.',
   'Neurological Sciences Pavilion, Floor 4 (Suite 415)', 'ext. 4312'),
  ('orthopedics', 'Orthopedics', 'Activity',
   'Musculoskeletal care, joint health, sports injuries, and mobility restoration.',
   'Consultations for acute sprains, chronic arthritis, spine health, post-fracture recovery, and non-surgical orthopedic therapies.',
   'Surgical & Musculoskeletal Center, Floor 2 (Suite 204)', 'ext. 4420'),
  ('pediatrics', 'Pediatrics', 'Baby',
   'Dedicated developmental checks, childhood immunizations, and pediatric care.',
   'Compassionate pediatric healthcare designed specifically for infants, children, and adolescents with family-centered care pathways.',
   'Children''s Pavilion, Ground Floor (Suite 110)', 'ext. 4508'),
  ('dermatology', 'Dermatology', 'Sparkles',
   'Clinical skin evaluation, mole monitoring, eczema, and dermatology consultations.',
   'Diagnostic evaluation of dermatological conditions, skin biopsies, rash assessments, and preventative screening.',
   'Outpatient Specialty Center, Floor 1 (Suite 140)', 'ext. 4610')
on conflict (id) do update set
  name = excluded.name,
  icon_name = excluded.icon_name,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  location = excluded.location,
  contact_ext = excluded.contact_ext;


-- ============================================================================
-- 15. SEED DATA — STANDARD TIME SLOTS
-- ============================================================================
insert into public.slot_templates (time_label, period, sort_order)
values
  ('09:00 AM', 'morning',   1),
  ('09:30 AM', 'morning',   2),
  ('10:00 AM', 'morning',   3),
  ('10:30 AM', 'morning',   4),
  ('11:00 AM', 'morning',   5),
  ('11:30 AM', 'morning',   6),
  ('01:30 PM', 'afternoon', 7),
  ('02:00 PM', 'afternoon', 8),
  ('02:30 PM', 'afternoon', 9),
  ('03:00 PM', 'afternoon', 10),
  ('03:30 PM', 'afternoon', 11),
  ('04:00 PM', 'afternoon', 12),
  ('05:00 PM', 'evening',   13),
  ('05:30 PM', 'evening',   14),
  ('06:00 PM', 'evening',   15)
on conflict (time_label) do update set
  period = excluded.period,
  sort_order = excluded.sort_order;


-- ============================================================================
-- 16. SEED AUTH USERS
-- ----------------------------------------------------------------------------
-- These inserts create real Supabase Auth users with bcrypt-hashed passwords.
-- Email is pre-confirmed so doctors / the demo patient can log in immediately.
-- ============================================================================
do $$
declare
  v_user record;
  v_doctors jsonb := '[
    {"email":"sarah.mitchell@aetherhospital.com","password":"Sarah@2026","name":"Dr. Sarah Mitchell","department":"general-medicine","specialty":"Internal Medicine","qualification":"FACP, Board Certified","room":"Suite 102"},
    {"email":"marcus.vance@aetherhospital.com","password":"Marcus@2026","name":"Dr. Marcus Vance","department":"cardiology","specialty":"Clinical Cardiology","qualification":"FACC, Cardiovascular Disease","room":"Suite 320"},
    {"email":"priya.nair@aetherhospital.com","password":"Priya@2026","name":"Dr. Priya Nair","department":"neurology","specialty":"Headache & Neuromuscular","qualification":"ABPN, Headache Medicine","room":"Suite 415"}
  ]'::jsonb;
  v_doc jsonb;
begin
  -- 3 doctors --------------------------------------------------------------
  for v_doc in select * from jsonb_array_elements(v_doctors)
  loop
    if not exists (select 1 from auth.users where email = v_doc ->> 'email') then
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        confirmation_token, recovery_token,
        email_change_token_new, email_change
      )
      values (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        v_doc ->> 'email',
        crypt(v_doc ->> 'password', gen_salt('bf')),
        now(),
        jsonb_build_object(
          'provider', 'email',
          'providers', jsonb_build_array('email'),
          'role', 'doctor'
        ),
        jsonb_build_object(
          'full_name', v_doc ->> 'name',
          'role', 'doctor'
        ),
        now(), now(), '', '', '', ''
      );
    end if;
  end loop;

  -- Demo patient -----------------------------------------------------------
  if not exists (select 1 from auth.users where email = 'patient@aetherhospital.com') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'patient@aetherhospital.com',
      crypt('Patient@2026', gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object(
        'full_name', 'Aarav Patel',
        'phone_country_code', '+91',
        'phone_number', '98765 43210',
        'age', 34,
        'gender', 'Male'
      ),
      now(), now(), '', '', '', ''
    );
  end if;

  -- Auth identities (required for email/password sign-in) -----------------
  for v_user in
    select id, email from auth.users
    where email in (
      'sarah.mitchell@aetherhospital.com',
      'marcus.vance@aetherhospital.com',
      'priya.nair@aetherhospital.com',
      'patient@aetherhospital.com'
    )
  loop
    if not exists (
      select 1 from auth.identities
      where user_id = v_user.id and provider = 'email'
    ) then
      insert into auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      )
      values (
        gen_random_uuid(),
        v_user.id,
        jsonb_build_object('sub', v_user.id::text, 'email', v_user.email),
        'email',
        v_user.id::text,
        now(), now(), now()
      );
    end if;
  end loop;
end $$;


-- ============================================================================
-- 17. SEED PROFILES + DOCTOR ROWS
--     (the auth trigger normally does this; these upserts repair any gaps)
-- ============================================================================
update public.profiles p
set
  role = 'doctor',
  full_name = u.raw_user_meta_data ->> 'full_name'
from auth.users u
where p.id = u.id
  and u.email in (
    'sarah.mitchell@aetherhospital.com',
    'marcus.vance@aetherhospital.com',
    'priya.nair@aetherhospital.com'
  );

update public.profiles p
set
  full_name = 'Aarav Patel',
  phone_country_code = '+91',
  phone_number = '98765 43210',
  age = 34,
  gender = 'Male',
  blood_group = 'O+',
  emergency_contact = '+91 98765 43211 (Spouse)',
  avatar_initials = 'AP'
from auth.users u
where p.id = u.id
  and u.email = 'patient@aetherhospital.com';

insert into public.doctors (user_id, department_id, full_name, email, specialty, qualification, room)
select
  u.id,
  case u.email
    when 'sarah.mitchell@aetherhospital.com' then 'general-medicine'
    when 'marcus.vance@aetherhospital.com' then 'cardiology'
    when 'priya.nair@aetherhospital.com' then 'neurology'
  end,
  u.raw_user_meta_data ->> 'full_name',
  u.email,
  case u.email
    when 'sarah.mitchell@aetherhospital.com' then 'Internal Medicine'
    when 'marcus.vance@aetherhospital.com' then 'Clinical Cardiology'
    when 'priya.nair@aetherhospital.com' then 'Headache & Neuromuscular'
  end,
  case u.email
    when 'sarah.mitchell@aetherhospital.com' then 'FACP, Board Certified'
    when 'marcus.vance@aetherhospital.com' then 'FACC, Cardiovascular Disease'
    when 'priya.nair@aetherhospital.com' then 'ABPN, Headache Medicine'
  end,
  case u.email
    when 'sarah.mitchell@aetherhospital.com' then 'Suite 102'
    when 'marcus.vance@aetherhospital.com' then 'Suite 320'
    when 'priya.nair@aetherhospital.com' then 'Suite 415'
  end
from auth.users u
where u.email in (
  'sarah.mitchell@aetherhospital.com',
  'marcus.vance@aetherhospital.com',
  'priya.nair@aetherhospital.com'
)
on conflict (email) do update set
  user_id = excluded.user_id,
  department_id = excluded.department_id,
  full_name = excluded.full_name,
  specialty = excluded.specialty,
  qualification = excluded.qualification,
  room = excluded.room,
  is_active = true;


-- ============================================================================
-- 18. OPTIONAL — SMS DELIVERY HOOK (Twilio via Edge Function)
-- ----------------------------------------------------------------------------
-- In-app + realtime notifications work immediately. To actually deliver the
-- `channel = 'sms'` rows to a phone, deploy the sample Edge Function in
-- `supabase/functions/send-sms` and schedule it (or call it from a Database
-- Webhook on INSERT into public.notifications where channel = 'sms').
--
-- Database Webhook setup (Dashboard → Database → Webhooks):
--   Table: notifications
--   Events: INSERT
--   Type: Supabase Edge Function → send-sms
-- ============================================================================


-- ============================================================================
-- 19. QUICK VERIFICATION (run manually if you like)
-- ============================================================================
-- select email, (raw_app_meta_data ->> 'role') as role from auth.users order by email;
-- select full_name, email, department_id, specialty from public.doctors;
-- select full_name, email, role, phone_number, age, gender from public.profiles;
