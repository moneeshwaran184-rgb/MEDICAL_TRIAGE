import { UserProfile, UserRole, DepartmentId } from '../types/index.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

const SESSION_KEY = 'aether_session_profile';
const PERSIST_KEY = 'aether_session_persist';

export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr-demo-01',
  name: 'Aarav Patel',
  email: 'aarav.patel@example.com',
  phone: '98765 43210',
  countryCode: '+91',
  age: 34,
  gender: 'Male',
  role: 'patient',
  avatarInitials: 'AP',
  avatarGradient: 'from-[#5145FF] via-[#8957FF] to-[#E34AD7]',
  bloodGroup: 'O+ Positive',
  emergencyContact: '+91 98765 43211 (Spouse)',
  joinedDate: 'Member since Oct 2025',
};

const DEMO_PATIENT_EMAIL = 'patient@aetherhospital.com';
const DEMO_PATIENT_PASSWORD = 'Patient@2026';

const AVATAR_GRADIENTS = [
  'from-[#5145FF] via-[#8957FF] to-[#E34AD7]',
  'from-[#16CBE5] via-[#5145FF] to-[#8957FF]',
  'from-[#FF745C] via-[#FF9B54] to-[#FFC857]',
  'from-[#00CFA8] via-[#16CBE5] to-[#5145FF]',
  'from-[#E34AD7] via-[#8957FF] to-[#5145FF]',
];

export interface PatientSignUpInput {
  fullName: string;
  email: string;
  password: string;
  countryCode: string;
  phone: string;
  age: number;
  gender: string;
}

export interface AuthResult {
  user: UserProfile | null;
  error?: string;
  needsEmailConfirmation?: boolean;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function gradientFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function joinedLabel(createdAt?: string): string {
  if (!createdAt) return 'Member since today';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Member since today';
  return `Member since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

function cacheUser(user: UserProfile | null, persist = true): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);

    if (user) {
      const raw = JSON.stringify(user);
      if (persist) localStorage.setItem(SESSION_KEY, raw);
      else sessionStorage.setItem(SESSION_KEY, raw);
      localStorage.setItem(PERSIST_KEY, persist ? '1' : '0');
    } else {
      localStorage.removeItem(PERSIST_KEY);
    }

    window.dispatchEvent(new Event('aether_auth_updated'));
  } catch {
    // storage unavailable — ignore
  }
}

function readCachedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed.role) parsed.role = 'patient';
    return parsed;
  } catch {
    return null;
  }
}

function friendlyAuthError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes('invalid login credentials')) return 'Incorrect email/mobile number or password.';
  if (text.includes('email not confirmed')) return 'Please confirm your email address before signing in.';
  if (text.includes('user already registered')) return 'An account with this email already exists. Please sign in instead.';
  if (text.includes('password should be at least')) return 'Password must be at least 6 characters.';
  if (text.includes('unable to validate email')) return 'Please enter a valid email address.';
  if (text.includes('rate limit') || text.includes('too many')) return 'Too many attempts. Please wait a moment and try again.';
  if (text.includes('duplicate key') && text.includes('phone')) return 'This mobile number is already registered.';
  if (text.includes('database error saving new user')) {
    return 'We could not create your account. This email or mobile number may already be registered — try signing in instead.';
  }
  return message;
}

interface ProfileRow {
  id: string;
  role: UserRole;
  full_name: string;
  email: string | null;
  phone_country_code: string;
  phone_number: string | null;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  emergency_contact: string | null;
  avatar_initials: string | null;
  created_at: string;
}

interface DoctorRow {
  id: string;
  department_id: DepartmentId;
  specialty: string;
}

async function loadProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle<ProfileRow>();

  if (error || !profile) return null;

  let doctor: DoctorRow | null = null;
  if (profile.role === 'doctor') {
    const { data } = await supabase
      .from('doctors')
      .select('id, department_id, specialty')
      .eq('user_id', userId)
      .maybeSingle<DoctorRow>();
    doctor = data ?? null;
  }

  const name = profile.full_name || 'Patient';

  return {
    id: profile.id,
    name,
    email: profile.email ?? '',
    phone: profile.phone_number ?? '',
    countryCode: profile.phone_country_code ?? '+91',
    age: profile.age ?? undefined,
    gender: profile.gender ?? undefined,
    role: profile.role ?? 'patient',
    avatarInitials: profile.avatar_initials || initialsFromName(name),
    avatarGradient: gradientFromName(name),
    bloodGroup: profile.blood_group ?? undefined,
    emergencyContact: profile.emergency_contact ?? undefined,
    joinedDate: joinedLabel(profile.created_at),
    doctorId: doctor?.id,
    departmentId: doctor?.department_id,
    specialty: doctor?.specialty,
  };
}

export const authService = {
  isBackendEnabled(): boolean {
    return isSupabaseConfigured;
  },

  getCurrentUser(): UserProfile | null {
    return readCachedUser();
  },

  setCurrentUser(user: UserProfile | null, persist = true): void {
    cacheUser(user, persist);
  },

  /**
   * Restores the Supabase session on page load and listens for auth changes.
   * Returns an unsubscribe function.
   */
  async init(onChange: (user: UserProfile | null) => void): Promise<() => void> {
    if (!supabase) return () => {};

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        if (profile) {
          cacheUser(profile, localStorage.getItem(PERSIST_KEY) !== '0');
          onChange(profile);
        }
      } else {
        // Supabase is configured but there is no active session. Drop any cached
        // local/demo profile so it can never be mistaken for a real user (its
        // non-UUID ids would otherwise be sent to the database).
        cacheUser(null);
        onChange(null);
      }
    } catch {
      // ignore — stay in cached/demo mode
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        cacheUser(null);
        onChange(null);
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        // Defer the network call so we never block the auth callback.
        setTimeout(() => {
          loadProfile(session.user.id).then((profile) => {
            if (profile) {
              cacheUser(profile, localStorage.getItem(PERSIST_KEY) !== '0');
              onChange(profile);
            }
          });
        }, 0);
      }
    });

    return () => subscription.subscription.unsubscribe();
  },

  async signUpPatient(input: PatientSignUpInput): Promise<AuthResult> {
    if (!isSupabaseConfigured || !supabase) {
      const user = this.registerDemo(
        input.fullName,
        input.email,
        input.phone,
        input.countryCode,
        input.age,
        input.gender
      );
      return { user };
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          full_name: input.fullName.trim(),
          phone_country_code: input.countryCode,
          phone_number: input.phone.trim(),
          age: input.age,
          gender: input.gender,
        },
      },
    });

    if (error) {
      return { user: null, error: friendlyAuthError(error.message) };
    }

    // Email confirmation enabled → no active session yet.
    if (!data.session || !data.user) {
      return {
        user: null,
        needsEmailConfirmation: true,
      };
    }

    const profile = await loadProfile(data.user.id);
    if (!profile) {
      return {
        user: null,
        error: 'Your account was created but the patient profile could not be loaded. Please sign in.',
      };
    }

    cacheUser(profile, true);
    return { user: profile };
  },

  async signIn(identifier: string, password: string, remember = true): Promise<AuthResult> {
    if (!isSupabaseConfigured || !supabase) {
      const user = this.signInDemo(identifier);
      cacheUser(user, remember);
      return { user };
    }

    let email = identifier.trim();

    if (!email.includes('@')) {
      const { data: resolvedEmail, error: resolveError } = await supabase.rpc(
        'resolve_login_email',
        { p_identifier: email }
      );

      if (resolveError) {
        return { user: null, error: friendlyAuthError(resolveError.message) };
      }
      if (!resolvedEmail) {
        return { user: null, error: 'No account was found for that mobile number.' };
      }
      email = resolvedEmail as string;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { user: null, error: friendlyAuthError(error?.message || 'Unable to sign in.') };
    }

    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return { user: null, error: 'Please verify your email using the link in your inbox before signing in.' };
    }

    const profile = await loadProfile(data.user.id);
    if (!profile) {
      return { user: null, error: 'Signed in, but no profile was found for this account.' };
    }

    cacheUser(profile, remember);
    return { user: profile };
  },

  async signInQuickDemo(): Promise<AuthResult> {
    if (isSupabaseConfigured) {
      return this.signIn(DEMO_PATIENT_EMAIL, DEMO_PATIENT_PASSWORD, true);
    }

    const user = { ...DEFAULT_DEMO_USER };
    cacheUser(user, true);
    return { user };
  },

  async signOut(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    cacheUser(null);
  },

  // --------------------------------------------------------------------------
  // Local demo fallbacks (used when no Supabase credentials are configured)
  // --------------------------------------------------------------------------
  signInDemo(emailOrPhone: string): UserProfile {
    const initials = emailOrPhone.split('@')[0].slice(0, 2).toUpperCase();

    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      name: emailOrPhone.includes('@')
        ? emailOrPhone.split('@')[0].replace(/[._]/g, ' ')
        : 'Demo Patient',
      email: emailOrPhone.includes('@') ? emailOrPhone : 'patient@example.com',
      phone: emailOrPhone.includes('@') ? '98765 43210' : emailOrPhone,
      countryCode: '+91',
      age: 34,
      gender: 'Male',
      role: 'patient',
      avatarInitials: initials || 'DP',
      avatarGradient: 'from-[#16CBE5] via-[#5145FF] to-[#8957FF]',
      bloodGroup: 'B+ Positive',
      emergencyContact: '+91 91234 56789 (Family)',
      joinedDate: 'Active Demo Session',
    };

    cacheUser(user);
    return user;
  },

  registerDemo(
    name: string,
    email: string,
    phone: string,
    countryCode: string,
    age?: number,
    gender?: string
  ): UserProfile {
    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      countryCode: countryCode || '+91',
      age: age ?? 30,
      gender: gender ?? 'Prefer not to say',
      role: 'patient',
      avatarInitials: initialsFromName(name),
      avatarGradient: 'from-[#FF745C] via-[#FF9B54] to-[#FFC857]',
      bloodGroup: 'A+ Positive',
      emergencyContact: '+91 98888 77777 (Emergency)',
      joinedDate: 'Demo Member',
    };

    cacheUser(user);
    return user;
  },
};
