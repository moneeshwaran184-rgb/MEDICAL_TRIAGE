import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, AppointmentBooking } from '../types/index.ts';
import { appointmentService } from '../services/appointmentService.ts';
import {
  X,
  User,
  Calendar,
  Settings,
  LogOut,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Building,
  Shield,
  Phone,
  Mail,
} from 'lucide-react';

interface UserAccountModalProps {
  isOpen: boolean;
  initialTab?: 'profile' | 'appointments' | 'settings';
  user: UserProfile;
  onClose: () => void;
  onSignOut: () => void;
  onNavigateToBooking: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  initialTab = 'appointments',
  user,
  onClose,
  onSignOut,
  onNavigateToBooking,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'appointments' | 'settings'>(
    initialTab
  );
  const [bookings, setBookings] = useState<AppointmentBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [busyReference, setBusyReference] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const list = await appointmentService.getBookings();
      setBookings(list);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    setActiveSubTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    void loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user.id]);

  if (!isOpen) return null;

  const handleCancelBooking = async (referenceId: string) => {
    setBusyReference(referenceId);
    const success = await appointmentService.cancelBooking(referenceId);
    if (success) {
      await loadBookings();
      setFeedbackMsg(`Appointment ${referenceId} has been cancelled.`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } else {
      setFeedbackMsg('Unable to cancel this appointment. Please try again.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
    setBusyReference(null);
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#171A3B]/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#151838] rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#5145FF] via-[#8957FF] to-[#E34AD7] p-6 text-white relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close user profile"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${user.avatarGradient} flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white/30`}
              >
                {user.avatarInitials}
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-white/80 block">
                  Patient Portal · {user.joinedDate}
                </span>
                <h2 id="account-modal-title" className="text-2xl font-bold">
                  {user.name}
                </h2>
                <span className="text-xs text-white/90">
                  {user.email} · {user.countryCode} {user.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="flex border-b border-slate-100 dark:border-white/10 px-6 pt-3 gap-2 bg-[#FFFDF8] dark:bg-[#0B0C1E]">
            <button
              type="button"
              onClick={() => setActiveSubTab('appointments')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeSubTab === 'appointments'
                  ? 'border-[#5145FF] dark:border-[#8957FF] text-[#5145FF] dark:text-[#A594FD]'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Appointments ({bookings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('profile')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeSubTab === 'profile'
                  ? 'border-[#5145FF] dark:border-[#8957FF] text-[#5145FF] dark:text-[#A594FD]'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('settings')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeSubTab === 'settings'
                  ? 'border-[#5145FF] dark:border-[#8957FF] text-[#5145FF] dark:text-[#A594FD]'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold">
              {feedbackMsg}
            </div>
          )}

          {/* Body content */}
          <div className="p-6 max-h-[460px] overflow-y-auto space-y-6">
            {/* 1. MY APPOINTMENTS */}
            {activeSubTab === 'appointments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-[#171A3B] dark:text-white uppercase tracking-wider">
                    Scheduled Consultations
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToBooking();
                    }}
                    className="text-xs font-bold text-[#5145FF] dark:text-[#A594FD] hover:underline"
                  >
                    + Book New Visit
                  </button>
                </div>

                {isLoadingBookings ? (
                  <div className="py-10 text-center bg-slate-50 dark:bg-[#0B0C1E] rounded-2xl border border-slate-200 dark:border-white/10">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Loading your appointments…
                    </p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 dark:bg-[#0B0C1E] rounded-2xl border border-dashed border-slate-200 dark:border-white/10 space-y-3">
                    <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Appointments Scheduled Yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                      Explore open slots across our 6 specialty departments and book your consultation in seconds.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToBooking();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#5145FF] text-white font-bold text-xs shadow-aurora-indigo hover:opacity-95"
                    >
                      Book First Appointment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div
                        key={booking.referenceId}
                        className={`p-4 rounded-2xl border transition-all ${
                          booking.status === 'cancelled'
                            ? 'bg-slate-50 dark:bg-[#0B0C1E]/50 border-slate-200 dark:border-white/5 opacity-60'
                            : 'bg-white dark:bg-[#0B0C1E] border-slate-200 dark:border-white/10 hover:border-[#8957FF] shadow-xs'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#5145FF] dark:text-[#A594FD] bg-[#F0E8FF] dark:bg-[#5145FF]/20 px-2 py-0.5 rounded-md">
                                {booking.referenceId}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  booking.status === 'confirmed'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-[#171A3B] dark:text-white leading-tight">
                              {booking.departmentName}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              Doctor: {booking.doctorName}
                            </p>
                          </div>

                          {booking.status === 'confirmed' && (
                            <button
                              type="button"
                              disabled={busyReference === booking.referenceId}
                              onClick={() => handleCancelBooking(booking.referenceId)}
                              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:underline flex items-center gap-1 font-semibold disabled:opacity-50"
                              title="Cancel appointment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{busyReference === booking.referenceId ? 'Cancelling…' : 'Cancel'}</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#5145FF] dark:text-[#A594FD]" />
                            <span>
                              {booking.date} · {booking.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Patient: {booking.patientName} ({booking.patientAge}y)
                            </span>
                          </div>
                        </div>

                        {booking.reason && (
                          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-[#151838] p-2 rounded-lg">
                            &quot;{booking.reason}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. PERSONAL DETAILS */}
            {activeSubTab === 'profile' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-bold text-[10px]">Full Name</span>
                    <span className="text-sm font-bold text-[#171A3B] dark:text-white block">{user.name}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-bold text-[10px]">Registered Email</span>
                    <span className="text-sm font-bold text-[#171A3B] dark:text-white block">{user.email}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-bold text-[10px]">Phone Number</span>
                    <span className="text-sm font-bold text-[#171A3B] dark:text-white block">
                      {user.countryCode} {user.phone}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-bold text-[10px]">Age</span>
                    <span className="text-sm font-bold text-[#171A3B] dark:text-white block">
                      {user.age ? `${user.age} years` : 'Not provided'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-bold text-[10px]">Gender</span>
                    <span className="text-sm font-bold text-[#171A3B] dark:text-white block">
                      {user.gender || 'Not provided'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-bold text-[10px]">Blood Group</span>
                    <span className="text-sm font-bold text-[#171A3B] dark:text-white block">{user.bloodGroup || 'Not provided'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F0E8FF] dark:bg-[#5145FF]/15 border border-[#8957FF]/30 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#5145FF] dark:text-[#A594FD]">
                    <Shield className="w-4 h-4" />
                    <span>Emergency Contact Registered</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{user.emergencyContact}</p>
                </div>
              </div>
            )}

            {/* 3. SETTINGS */}
            {activeSubTab === 'settings' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 space-y-3">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Communication Preferences</h4>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 dark:text-slate-300">SMS Appointment Reminders</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-[#5145FF] accent-[#5145FF]" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 dark:text-slate-300">Email Clinical Preparation Guides</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-[#5145FF] accent-[#5145FF]" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 dark:text-slate-300">AI Triage History Storage (Demo Session)</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-[#5145FF] accent-[#5145FF]" />
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Campus Facility Preference</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Default outpatient clinic: <strong>Main Campus (400 Aether Health Blvd)</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Sign Out */}
          <div className="p-5 border-t border-slate-100 dark:border-white/10 bg-[#FFFDF8] dark:bg-[#0B0C1E] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold bg-[#171A3B] dark:bg-white/10 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
