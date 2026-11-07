# Aether Hospital — Supabase Setup

This folder contains everything needed to run the real backend for the Aether
Hospital frontend.

| File | Purpose |
| --- | --- |
| `schema.sql` | Complete database schema, RLS policies, RPCs, notification triggers and seed data |
| `functions/send-sms/index.ts` | Optional Twilio Edge Function for real SMS delivery |

---

## 1. Create the backend

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor** and paste the entire contents of `schema.sql`.
3. Run it once. It creates:
   - `departments`, `slot_templates`, `profiles`, `doctors`, `appointments`, `notifications`
   - Row Level Security for every table
   - Auth trigger that creates a patient profile on sign-up
   - Booking / cancellation / doctor-status RPCs
   - Notification triggers for patients and doctors
   - 6 departments, 3 demo doctors, 1 demo patient

## 2. Connect the frontend

Copy `.env.example` to `.env` (or `.env.local`) and fill in:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

Get both values from **Project Settings → API**. Restart `npm run dev`.

If these values are missing, the app automatically stays in local demo mode so
it never crashes.

## 3. Auth settings

For the smoothest demo experience:

- Go to **Authentication → Providers → Email**.
- Turn **Confirm email** off so newly registered patients can sign in instantly.
  (The seeded doctors and demo patient are already pre-confirmed, so they work
  either way.)
- Keep **Enable email provider** on.

Patients sign up with their own password, mobile number, age and gender. Those
values are stored in `public.profiles` and protected by RLS.

## 4. Demo doctor logins

| Doctor | Email | Password | Department |
| --- | --- | --- | --- |
| Dr. Sarah Mitchell | `sarah.mitchell@aetherhospital.com` | `Sarah@2026` | General Medicine |
| Dr. Marcus Vance | `marcus.vance@aetherhospital.com` | `Marcus@2026` | Cardiology |
| Dr. Priya Nair | `priya.nair@aetherhospital.com` | `Priya@2026` | Neurology |

Demo patient:

| Patient | Email | Password |
| --- | --- | --- |
| Aarav Patel | `patient@aetherhospital.com` | `Patient@2026` |

Doctors sign in from the **Doctor Portal** tab in the top navigation. Each
doctor only sees appointments assigned to them, enforced by RLS.

## 5. How notifications work

1. A patient books an appointment (`book_appointment` RPC).
2. The `appointments_notify` trigger inserts:
   - an **in-app notification** for the patient
   - an **SMS outbox row** for the patient (`channel = 'sms'`)
   - an **in-app notification** for the assigned doctor
3. The frontend subscribes to `notifications` via Supabase Realtime, shows the
   unread badge and a live toast.
4. Doctor status changes (`confirmed`, `completed`, `cancelled`) also notify the
   patient.

### Real SMS (optional)

In-app notifications work immediately. To send actual SMS messages:

1. Deploy the Edge Function:
   ```bash
   supabase functions deploy send-sms --no-verify-jwt
   supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_FROM_NUMBER=+1...
   ```
2. In the dashboard go to **Database → Webhooks → Create a new hook**:
   - Table: `notifications`
   - Events: `INSERT`
   - Type: Supabase Edge Function → `send-sms`

The function ignores non-SMS rows and sends the message with Twilio.

## 6. Security notes

- Passwords are hashed by Supabase Auth; the frontend never stores them.
- `profiles.role` cannot be changed by a patient (enforced by a trigger).
- Patients can only read their own profile, appointments and notifications.
- Doctors can only read/update appointments assigned to them.
- There is no direct patient `INSERT` policy on appointments — all bookings go
  through the atomic `book_appointment()` function, which prevents double
  booking with a partial unique index.
- `resolve_login_email()` allows signing in with a mobile number. If you want to
  avoid email enumeration in production, remove that RPC and require email
  sign-in instead.

## 7. Re-running the SQL

The script is idempotent for tables, policies, functions, triggers and seed data.
Running it again will not duplicate departments, doctors or auth users.
