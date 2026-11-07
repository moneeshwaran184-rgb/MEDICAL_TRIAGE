-- ============================================================================
-- AETHER HOSPITAL - SETUP PART: 02_booking_notifications.sql
-- Booking, cancellation, doctor status, notification triggers.
-- Run the parts in order: 01 -> 02 -> 03 -> 04.
-- ============================================================================

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

