import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Users,
  Activity,
  HeartPulse,
  Brain,
  Sparkles,
} from 'lucide-react';
import { DoctorAppointment, DepartmentId, UserProfile } from '../types/index.ts';
import { authService } from '../services/authService.ts';
import { appointmentService } from '../services/appointmentService.ts';
import { isSupabaseConfigured } from '../lib/supabase.ts';

interface DoctorPortalPageProps {
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile) => void;
  onSignOut: () => void;
}

const DOCTOR_CREDENTIALS = [
  {
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@aetherhospital.com',
    password: 'Sarah@2026',
    department: 'General Medicine',
    departmentId: 'general-medicine' as DepartmentId,
    specialty: 'Internal Medicine',
    initials: 'SM',
    icon: Stethoscope,
    color: 'text-[#00CFA8]',
  },
  {
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@aetherhospital.com',
    password: 'Marcus@2026',
    department: 'Cardiology',
    departmentId: 'cardiology' as DepartmentId,
    specialty: 'Clinical Cardiology',
    initials: 'MV',
    icon: HeartPulse,
    color: 'text-[#FF745C]',
  },
  {
    name: 'Dr. Priya Nair',
    email: 'priya.nair@aetherhospital.com',
    password: 'Priya@2026',
    department: 'Neurology',
    departmentId: 'neurology' as DepartmentId,
    specialty: 'Headache & Neuromuscular',
    initials: 'PN',
    icon: Brain,
    color: 'text-[#8957FF]',
  },
];

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function departmentIcon(id?: DepartmentId) {
  switch (id) {
    case 'cardiology':
      return <HeartPulse className="w-4 h-4 text-[#FF745C]" />;
    case 'neurology':
      return <Brain className="w-4 h-4 text-[#8957FF]" />;
    case 'orthopedics':
      return <Activity className="w-4 h-4 text-[#16CBE5]" />;
    case 'pediatrics':
      return <Users className="w-4 h-4 text-[#FF9B54]" />;
    case 'dermatology':
      return <Sparkles className="w-4 h-4 text-[#E34AD7]" />;
    default:
      return <Stethoscope className="w-4 h-4 text-[#00CFA8]" />;
  }
}

const DoctorLogin: React.FC<Omit<DoctorPortalPageProps, 'onSignOut'> & { onSignOut: () => void }> = ({
  currentUser,
  onAuthSuccess,
  onSignOut,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your doctor email and password.');
      return;
    }

    // Local demo mode: authenticate against the seeded demo doctor list so the
    // portal stays usable without a Supabase project.
    if (!isSupabaseConfigured) {
      const demoDoctor = DOCTOR_CREDENTIALS.find(
        (d) =>
          d.email.toLowerCase() === email.trim().toLowerCase() && d.password === password
      );

      if (!demoDoctor) {
        setError('Demo mode: use one of the demo doctor accounts shown on this page.');
        return;
      }

      const demoUser: UserProfile = {
        id: `demo-doctor-${demoDoctor.departmentId}`,
        name: demoDoctor.name,
        email: demoDoctor.email,
        phone: '',
        countryCode: '+91',
        role: 'doctor',
        avatarInitials: demoDoctor.initials,
        avatarGradient: 'from-[#00CFA8] via-[#16CBE5] to-[#5145FF]',
        joinedDate: 'Demo Doctor Session',
        doctorId: `demo-doctor-${demoDoctor.departmentId}`,
        departmentId: demoDoctor.departmentId,
        specialty: demoDoctor.specialty,
      };

      authService.setCurrentUser(demoUser, true);
      onAuthSuccess(demoUser);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.signIn(email.trim(), password, true);

      if (!result.user) {
        setError(result.error || 'Unable to sign in.');
        return;
      }

      if (result.user.role !== 'doctor') {
        await authService.signOut();
        setError('This account is a patient account. Use the patient Sign In instead.');
        return;
      }

      onAuthSuccess(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 dark:bg-[#151838]/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-aurora-card overflow-hidden"
        >
          <div className="h-2 w-full bg-gradient-to-r from-[#5145FF] via-[#00CFA8] to-[#16CBE5]" />
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B9F4D0]/50 dark:bg-[#00CFA8]/15 text-[#065f46] dark:text-[#B9F4D0] text-xs font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                Clinical Staff Access
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A3B] dark:text-white">
                Doctor Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Sign in to view your assigned appointments, patient details, and consultation status.
              </p>
            </div>

            {!isSupabaseConfigured && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Supabase is not configured yet. Add <code className="font-bold">VITE_SUPABASE_URL</code> and{' '}
                  <code className="font-bold">VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code>, then run
                  the SQL in <code>supabase/schema.sql</code>.
                </span>
              </div>
            )}

            {currentUser && currentUser.role === 'patient' && (
              <div className="p-3.5 rounded-2xl bg-[#F0E8FF] dark:bg-[#5145FF]/15 border border-[#8957FF]/30 text-xs flex items-start gap-2.5">
                <User className="w-4 h-4 shrink-0 mt-0.5 text-[#5145FF]" />
                <div className="flex-1">
                  <p className="font-bold text-[#171A3B] dark:text-white">
                    You are signed in as a patient ({currentUser.name}).
                  </p>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="mt-1.5 text-[#5145FF] dark:text-[#A594FD] font-bold hover:underline cursor-pointer"
                  >
                    Sign out to switch to a doctor account
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="doctor-email"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Doctor Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="doctor-email"
                    type="email"
                    autoComplete="username"
                    required
                    placeholder="sarah.mitchell@aetherhospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus-visible:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="doctor-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="doctor-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/15 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0F1129] focus:border-[#5145FF] focus-visible:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00CFA8] to-[#16CBE5] hover:opacity-95 disabled:opacity-60 text-white font-bold rounded-2xl text-sm shadow-aurora-cyan transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? 'Signing In…' : 'Enter Doctor Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              Only accounts with the <strong>doctor</strong> role can access the clinical dashboard.
              Patients should use the regular Sign In button.
            </p>
          </div>
        </motion.div>

        {/* Demo credentials card */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#171A3B] via-[#211F4E] to-[#171A3B] text-white border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#16CBE5]" />
              <h2 className="text-lg font-bold">Demo Doctor Accounts</h2>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              These three doctors were created by the SQL seed. Each one has a separate dashboard
              showing only their own appointments.
            </p>

            <div className="space-y-3">
              {DOCTOR_CREDENTIALS.map((doctor) => {
                const Icon = doctor.icon;
                return (
                  <div
                    key={doctor.email}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-white/10">
                        <Icon className={`w-4 h-4 ${doctor.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{doctor.name}</p>
                        <p className="text-[11px] text-white/50">{doctor.department}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-[11px] font-mono">
                      <div className="flex items-center justify-between gap-2 bg-black/20 rounded-lg px-2.5 py-1.5">
                        <span className="text-white/40">email</span>
                        <span className="text-[#B9F4D0] truncate">{doctor.email}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-black/20 rounded-lg px-2.5 py-1.5">
                        <span className="text-white/40">password</span>
                        <span className="text-[#FFC857]">{doctor.password}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/95 dark:bg-[#151838]/90 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-[#171A3B] dark:text-white">What happens on booking?</strong>
            <p className="mt-1">
              When a patient books an appointment in your department, it is assigned to you and
              appears here immediately. Both you and the patient receive an in-app notification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard: React.FC<{
  user: UserProfile;
  onSignOut: () => void;
}> = ({ user, onSignOut }) => {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const rows = await appointmentService.getDoctorAppointments(user.doctorId);
      setAppointments(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const handleUpdate = () => void load();
    window.addEventListener('aether_appointments_updated', handleUpdate);
    return () => window.removeEventListener('aether_appointments_updated', handleUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.doctorId]);

  const stats = useMemo(() => {
    const today = todayString();
    return {
      today: appointments.filter(
        (a) => a.date === today && a.status !== 'cancelled'
      ).length,
      upcoming: appointments.filter(
        (a) => a.date >= today && (a.status === 'confirmed' || a.status === 'pending')
      ).length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      total: appointments.length,
    };
  }, [appointments]);

  const visibleAppointments = useMemo(() => {
    const today = todayString();
    const sorted = [...appointments].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.time.localeCompare(b.time);
    });

    switch (filter) {
      case 'today':
        return sorted.filter((a) => a.date === today);
      case 'upcoming':
        return sorted.filter(
          (a) => a.date >= today && (a.status === 'confirmed' || a.status === 'pending')
        );
      case 'completed':
        return sorted.filter((a) => a.status === 'completed');
      default:
        return sorted;
    }
  }, [appointments, filter]);

  const handleStatus = async (
    appointment: DoctorAppointment,
    status: 'confirmed' | 'completed' | 'cancelled'
  ) => {
    if (!appointment.id) return;
    setBusyId(appointment.id);
    setError('');
    const success = await appointmentService.updateAppointmentStatus(appointment.id, status);
    if (success) {
      await load();
    } else {
      setError('Could not update this appointment. Please try again.');
    }
    setBusyId(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00CFA8] to-[#16CBE5] flex items-center justify-center text-white shadow-lg shrink-0">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B9F4D0]/50 dark:bg-[#00CFA8]/15 text-[#065f46] dark:text-[#B9F4D0] text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Doctor Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171A3B] dark:text-white mt-1">
              {user.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user.specialty || 'Attending Physician'} ·{' '}
              {user.departmentId
                ? user.departmentId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                : 'Aether Hospital'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => void load()}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#151838] border border-slate-200 dark:border-white/10 text-xs font-bold text-[#171A3B] dark:text-white hover:border-[#16CBE5] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Visits", value: stats.today, color: 'from-[#F0E8FF] to-white dark:from-[#211F4E] dark:to-[#151838]', icon: Calendar },
          { label: 'Upcoming', value: stats.upcoming, color: 'from-[#E6FAF7] to-white dark:from-[#12362C] dark:to-[#151838]', icon: Clock },
          { label: 'Completed', value: stats.completed, color: 'from-[#E8F6FF] to-white dark:from-[#0E2A3B] dark:to-[#151838]', icon: CheckCircle2 },
          { label: 'All Appointments', value: stats.total, color: 'from-[#FFF4E8] to-white dark:from-[#3B2A16] dark:to-[#151838]', icon: ClipboardList },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`p-5 rounded-3xl bg-gradient-to-br ${stat.color} border border-slate-200/80 dark:border-white/10 shadow-aurora-card`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{stat.label}</span>
                <Icon className="w-4 h-4 text-[#5145FF] dark:text-[#16CBE5]" />
              </div>
              <span className="text-3xl font-black text-[#171A3B] dark:text-white font-mono block mt-2">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-[#0B0C1E] rounded-2xl w-fit">
        {[
          { id: 'today', label: 'Today' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'all', label: 'All' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-white dark:bg-[#151838] text-[#5145FF] dark:text-[#A594FD] shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointment list */}
      {isLoading ? (
        <div className="p-12 rounded-3xl bg-white/90 dark:bg-[#151838]/90 border border-slate-200 dark:border-white/10 text-center">
          <RefreshCw className="w-6 h-6 text-[#5145FF] animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">
            Loading your appointments…
          </p>
        </div>
      ) : visibleAppointments.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 dark:bg-[#151838]/90 border border-dashed border-slate-300 dark:border-white/10 text-center space-y-3">
          <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            No appointments in this view
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
            When a patient books a consultation in your department, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence initial={false}>
            {visibleAppointments.map((appointment) => {
              const isBusy = busyId === appointment.id;
              return (
                <motion.div
                  key={appointment.id || appointment.referenceId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-5 rounded-3xl bg-white/95 dark:bg-[#151838]/90 border border-slate-200/80 dark:border-white/10 shadow-aurora-card space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-100 dark:border-white/10">
                        {departmentIcon(appointment.departmentId)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#5145FF] dark:text-[#16CBE5] bg-[#F0E8FF] dark:bg-[#5145FF]/20 px-2 py-0.5 rounded-md">
                            {appointment.referenceId}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                              appointment.status === 'confirmed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : appointment.status === 'completed'
                                ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                                : appointment.status === 'cancelled'
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {appointment.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#171A3B] dark:text-white mt-1.5">
                          {appointment.patientName}
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-2">
                            {appointment.patientAge}y
                            {appointment.patientGender ? ` · ${appointment.patientGender}` : ''}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {appointment.departmentName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0B0C1E]">
                      <Calendar className="w-3.5 h-3.5 text-[#5145FF] dark:text-[#16CBE5]" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {formatDate(appointment.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0B0C1E]">
                      <Clock className="w-3.5 h-3.5 text-[#5145FF] dark:text-[#16CBE5]" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {appointment.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] min-w-0">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {appointment.mobileNumber || 'No phone'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] min-w-0">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {appointment.email || 'No email'}
                      </span>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-[#FFFDF8] dark:bg-[#0B0C1E] p-3 rounded-xl border border-slate-100 dark:border-white/10">
                      “{appointment.reason}”
                    </div>
                  )}

                  {appointment.doctorNotes && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-[#E6FAF7] dark:bg-[#00CFA8]/10 p-3 rounded-xl border border-[#00CFA8]/30">
                      <strong>Clinical note:</strong> {appointment.doctorNotes}
                    </div>
                  )}

                  {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {appointment.status === 'pending' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleStatus(appointment, 'confirmed')}
                          className="px-3.5 py-2 rounded-xl bg-[#5145FF] text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirm
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatus(appointment, 'completed')}
                        className="px-3.5 py-2 rounded-xl bg-[#00CFA8] text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Completed
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatus(appointment, 'cancelled')}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      {isBusy && (
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          Updating…
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#151838]/90 border border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#00CFA8] shrink-0 mt-0.5" />
        <span>
          Status changes notify the patient automatically. Completing or cancelling an appointment
          also frees the slot for other patients.
        </span>
      </div>
    </div>
  );
};

export const DoctorPortalPage: React.FC<DoctorPortalPageProps> = ({
  currentUser,
  onAuthSuccess,
  onSignOut,
}) => {
  if (currentUser?.role === 'doctor') {
    return <DoctorDashboard user={currentUser} onSignOut={onSignOut} />;
  }

  return (
    <DoctorLogin
      currentUser={currentUser}
      onAuthSuccess={onAuthSuccess}
      onSignOut={onSignOut}
    />
  );
};
