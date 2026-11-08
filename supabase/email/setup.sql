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
    'pending'
  )
  returning * into v_appointment;

  return v_appointment;

exception
  when unique_violation then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
end;
$$;


-- ============================================================================

create table if not exists public.appointment_email_queue (
 id uuid primary key default gen_random_uuid(), recipient text not null,
 subject text not null, body text not null, sent_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.appointment_email_queue enable row level security;
revoke all on public.appointment_email_queue from anon, authenticated;
create or replace function public.queue_appointment_email() returns trigger
language plpgsql security definer set search_path = public as $$
declare address text; decision text;
begin
 if new.status is not distinct from old.status then return new; end if;
 if new.status not in ('confirmed','cancelled') then return new; end if;
 select email into address from auth.users where id=new.patient_id and email_confirmed_at is not null;
 if address is null then return new; end if;
 decision := case when new.status='confirmed' then 'accepted'
 when auth.uid()=new.patient_id then 'cancelled'
 when old.status='pending' then 'rejected' else 'cancelled by the clinic' end;
 insert into public.appointment_email_queue(recipient,subject,body)
 values(address,'Aether Hospital: Appointment '||decision,
 format('Your appointment has been %s.%sAppointment date: %s%sTime: %s (Asia/Kolkata)%sReference: %s%s%s',
 decision,chr(10),new.appointment_date,chr(10),new.appointment_time,chr(10),new.reference_id,chr(10),
 case when new.status='confirmed' then 'Please arrive 15 minutes before your appointment.' else 'Please contact the clinic or request another appointment.' end));
 return new;
end; $$;
drop trigger if exists appointment_email_event on public.appointments;
create trigger appointment_email_event after update of status on public.appointments
for each row execute function public.queue_appointment_email();

-- Replace existing initial notification wording to match pending bookings.
do $$ declare definition text; begin
 select pg_get_functiondef('public.notify_appointment_event()'::regprocedure) into definition;
 definition := replace(definition, 'Appointment confirmed', 'Appointment update');
 definition := replace(definition, ' is confirmed for ', ' is requested for ');
 definition := replace(definition, ' appointment confirmed for ', ' appointment requested for ');
 execute definition;
end $$;
