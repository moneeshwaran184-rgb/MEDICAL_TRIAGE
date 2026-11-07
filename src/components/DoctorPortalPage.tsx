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
          className="bg-white dark:bg-[#182032] rounded-3xl border-2 border-black shadow-neo overflow-hidden"
        >
          <div className="h-3 w-full bg-[#FFCC24] border-b-2 border-black" />
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFCC24] text-black text-xs font-black border-2 border-black shadow-neo-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Clinical Staff Access
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                Doctor Portal
              </h1>
              <p className="text-xs sm:text-sm text-black/70 dark:text-slate-400 font-bold">
                Sign in to view your assigned appointments, patient details, and consultation status.
              </p>
            </div>

            {!isSupabaseConfigured && (
              <div className="p-3.5 rounded-2xl bg-[#FFCC24] text-black border-2 border-black text-xs font-bold flex items-start gap-2.5 shadow-neo-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>
                  Local demo mode active. Sign in with any of the demo doctor credentials below.
                </span>
              </div>
            )}

            {currentUser && currentUser.role === 'patient' && (
              <div className="p-3.5 rounded-2xl bg-[#FF6B8B] text-black border-2 border-black text-xs font-bold flex items-start gap-2.5 shadow-neo-sm">
                <User className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
                <div className="flex-1">
                  <p className="font-black">
                    You are signed in as a patient ({currentUser.name}).
                  </p>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="mt-1.5 text-black font-black underline cursor-pointer"
                  >
                    Sign out to switch to a doctor account
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-[#FF6B8B] text-black border-2 border-black shadow-neo-sm text-xs flex items-center gap-2.5 font-black">
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="doctor-email"
                  className="block text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Doctor Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-black/60 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="doctor-email"
                    type="email"
                    autoComplete="username"
                    required
                    placeholder="sarah.mitchell@aetherhospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="doctor-password"
                  className="block text-xs font-black text-black dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-black/60 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="doctor-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-black/60 dark:text-slate-400 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-4 bg-[#FFCC24] hover:bg-[#F5C21B] disabled:opacity-60 text-black font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? 'Signing In…' : 'Enter Doctor Dashboard'}
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </form>

            <p className="text-[11px] text-black/60 dark:text-slate-400 text-center font-bold leading-relaxed">
              Only accounts with the <strong>doctor</strong> role can access the clinical dashboard.
              Patients should use the regular Sign In button.
            </p>
          </div>
        </motion.div>

        {/* Demo credentials card (Electric Blue Block with Thick Black Border) */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#2154FE] text-white border-2 border-black shadow-neo space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 stroke-[2.5]" />
              <h2 className="text-xl font-black">Demo Doctor Accounts</h2>
            </div>
            <p className="text-xs font-bold text-white/80 leading-relaxed">
              Click any doctor to sign in or test real-time schedule management.
            </p>

            <div className="space-y-3">
              {DOCTOR_CREDENTIALS.map((doctor) => {
                const Icon = doctor.icon;
                return (
                  <div
                    key={doctor.email}
                    onClick={() => {
                      setEmail(doctor.email);
                      setPassword(doctor.password);
                    }}
                    className="p-4 rounded-2xl bg-white text-black border-2 border-black shadow-neo-sm space-y-2 cursor-pointer hover:bg-[#FFCC24] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-black text-white border border-black">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-black">{doctor.name}</p>
                        <p className="text-[11px] font-bold text-black/70">{doctor.department} · {doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-[11px] font-mono font-bold">
                      <div className="flex items-center justify-between gap-2 bg-[#FAF7EE] border border-black/20 rounded-lg px-2.5 py-1">
                        <span className="text-black/60">email</span>
                        <span className="truncate">{doctor.email}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-[#FAF7EE] border border-black/20 rounded-lg px-2.5 py-1">
                        <span className="text-black/60">password</span>
                        <span className="text-[#2154FE] font-black">{doctor.password}</span>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Today's Visits", value: stats.today, bg: 'bg-[#FFCC24]', textColor: 'text-black', icon: Calendar },
          { label: 'Upcoming', value: stats.upcoming, bg: 'bg-[#00D09C]', textColor: 'text-black', icon: Clock },
          { label: 'Completed', value: stats.completed, bg: 'bg-[#FF6B8B]', textColor: 'text-black', icon: CheckCircle2 },
          { label: 'All Appointments', value: stats.total, bg: 'bg-[#2154FE]', textColor: 'text-white', icon: ClipboardList },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`p-6 rounded-3xl ${stat.bg} ${stat.textColor} border-2 border-black shadow-neo space-y-1`}
            >
              <div className="flex items-center justify-between text-xs font-black">
                <span>{stat.label}</span>
                <Icon className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-3xl sm:text-4xl font-black font-mono block mt-2">
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
                  className="p-6 rounded-3xl bg-white dark:bg-[#182032] border-2 border-black shadow-neo space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-2xl bg-[#FFCC24] border-2 border-black shadow-neo-sm">
                        {departmentIcon(appointment.departmentId)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-black bg-[#FFCC24] border border-black px-2.5 py-0.5 rounded-md">
                            {appointment.referenceId}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-black ${
                              appointment.status === 'confirmed'
                                ? 'bg-[#00D09C] text-black'
                                : appointment.status === 'completed'
                                ? 'bg-[#2154FE] text-white'
                                : appointment.status === 'cancelled'
                                ? 'bg-neutral-200 text-neutral-500 line-through'
                                : 'bg-[#FFCC24] text-black'
                            }`}
                          >
                            {appointment.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-black dark:text-white mt-1.5">
                          {appointment.patientName}
                          <span className="text-xs font-bold text-black/60 dark:text-slate-400 ml-2">
                            {appointment.patientAge}y
                            {appointment.patientGender ? ` · ${appointment.patientGender}` : ''}
                          </span>
                        </h3>
                        <p className="text-xs font-bold text-black/70 dark:text-slate-400">
                          {appointment.departmentName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#FAF7EE] dark:bg-[#0E131F] border border-black/20">
                      <Calendar className="w-3.5 h-3.5 text-[#2154FE]" />
                      <span className="text-black dark:text-slate-200">
                        {formatDate(appointment.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#FAF7EE] dark:bg-[#0E131F] border border-black/20">
                      <Clock className="w-3.5 h-3.5 text-[#2154FE]" />
                      <span className="text-black dark:text-slate-200">
                        {appointment.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#FAF7EE] dark:bg-[#0E131F] border border-black/20 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-black/60 shrink-0" />
                      <span className="text-black dark:text-slate-200 truncate">
                        {appointment.mobileNumber || 'No phone'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#FAF7EE] dark:bg-[#0E131F] border border-black/20 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-black/60 shrink-0" />
                      <span className="text-black dark:text-slate-200 truncate">
                        {appointment.email || 'No email'}
                      </span>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div className="text-[11px] text-black dark:text-slate-300 font-bold italic bg-[#FAF7EE] dark:bg-[#0E131F] p-3 rounded-xl border border-black/20">
                      “{appointment.reason}”
                    </div>
                  )}

                  {appointment.doctorNotes && (
                    <div className="text-[11px] text-black dark:text-slate-300 bg-[#FFCC24]/30 p-3 rounded-xl border border-black/20 font-bold">
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
                          className="px-4 py-2 rounded-full bg-[#FFCC24] hover:bg-[#F5C21B] text-black text-xs font-black border-2 border-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirm
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatus(appointment, 'completed')}
                        className="px-4 py-2 rounded-full bg-[#00D09C] hover:bg-[#00B887] text-black text-xs font-black border-2 border-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Completed
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatus(appointment, 'cancelled')}
                        className="px-4 py-2 rounded-full bg-[#FF6B8B] hover:bg-[#F2587A] text-black text-xs font-black border-2 border-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      {isBusy && (
                        <span className="text-[11px] font-black text-black/60">
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
