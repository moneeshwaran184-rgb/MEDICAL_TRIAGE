-- ============================================================================
-- AETHER HOSPITAL - SETUP PART: 03_rls_and_grants.sql
-- Row Level Security policies and grants.
-- Run the parts in order: 01 -> 02 -> 03 -> 04.
-- ============================================================================

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

