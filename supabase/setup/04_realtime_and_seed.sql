-- ============================================================================
-- AETHER HOSPITAL - SETUP PART: 04_realtime_and_seed.sql
-- Realtime publication, departments, slots, seeded doctors and demo patient.
-- Run the parts in order: 01 -> 02 -> 03 -> 04.
-- ============================================================================

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
-- 14. SEED DATA â€” DEPARTMENTS
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
-- 15. SEED DATA â€” STANDARD TIME SLOTS
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
-- 18. OPTIONAL â€” SMS DELIVERY HOOK (Twilio via Edge Function)
-- ----------------------------------------------------------------------------
-- In-app + realtime notifications work immediately. To actually deliver the
-- `channel = 'sms'` rows to a phone, deploy the sample Edge Function in
-- `supabase/functions/send-sms` and schedule it (or call it from a Database
-- Webhook on INSERT into public.notifications where channel = 'sms').
--
-- Database Webhook setup (Dashboard â†’ Database â†’ Webhooks):
--   Table: notifications
--   Events: INSERT
--   Type: Supabase Edge Function â†’ send-sms
-- ============================================================================


-- ============================================================================
-- 19. QUICK VERIFICATION (run manually if you like)
-- ============================================================================
-- select email, (raw_app_meta_data ->> 'role') as role from auth.users order by email;
-- select full_name, email, department_id, specialty from public.doctors;
-- select full_name, email, role, phone_number, age, gender from public.profiles;