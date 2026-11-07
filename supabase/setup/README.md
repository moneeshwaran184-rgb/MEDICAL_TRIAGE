# Copy-paste setup (4 short files)

Use this only if pasting the big `schema.sql` in one go is difficult. The result
is identical to running `../schema.sql`.

Open **Supabase Dashboard -> SQL Editor -> New query**, then paste and run each
file **in order**:

| Step | File | What it creates |
| --- | --- | --- |
| 1 | `01_tables_auth_helpers.sql` | Extensions, enums, all tables, auth -> profile trigger, helper functions, login/slot RPCs |
| 2 | `02_booking_notifications.sql` | Booking, cancellation, doctor status RPCs, notification triggers |
| 3 | `03_rls_and_grants.sql` | Row Level Security policies and grants |
| 4 | `04_realtime_and_seed.sql` | Realtime publication, departments, slots, 3 doctors, demo patient |

Each step must succeed before starting the next.

## Verify it worked

Paste this in a new query and run it:

```sql
select 'departments' as item, count(*) as total from public.departments
union all
select 'slot_templates', count(*) from public.slot_templates
union all
select 'doctors', count(*) from public.doctors
union all
select 'profiles', count(*) from public.profiles;

select full_name, email, department_id, specialty
from public.doctors
order by full_name;
```

Expected: `departments = 6`, `slot_templates = 15`, `doctors = 3`,
`profiles >= 4`.

## Logins

| Account | Email | Password |
| --- | --- | --- |
| Dr. Sarah Mitchell | `sarah.mitchell@aetherhospital.com` | `Sarah@2026` |
| Dr. Marcus Vance | `marcus.vance@aetherhospital.com` | `Marcus@2026` |
| Dr. Priya Nair | `priya.nair@aetherhospital.com` | `Priya@2026` |
| Demo patient | `patient@aetherhospital.com` | `Patient@2026` |

## Common errors

- `relation "profiles" does not exist` -> step 1 did not run successfully.
- `function public.book_appointment(...) does not exist` -> step 2 did not run.
- `Database error saving new user` -> usually a duplicate mobile number; sign in
  instead or use a different number. This is the friendly message the app shows.
- `permission denied for table ...` -> step 3 did not run.
