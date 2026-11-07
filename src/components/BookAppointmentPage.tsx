import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DepartmentId, TimeSlot, AppointmentBooking, PageTab, UserProfile } from '../types/index.ts';
import {
  appointmentService,
  DEPARTMENTS,
  getAvailableDatesList,
} from '../services/appointmentService.ts';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Building,
  Info,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Brain,
  Activity,
  Baby,
  Sun,
  Sunset,
  Moon,
  ShieldCheck,
} from 'lucide-react';

interface BookAppointmentPageProps {
  initialDepartmentId?: DepartmentId;
  initialDate?: string;
  currentUser: UserProfile | null;
  onNavigateToSlots: () => void;
  onSelectTab: (tab: PageTab) => void;
  onRequireAuth: () => void;
}

export const BookAppointmentPage: React.FC<BookAppointmentPageProps> = ({
  initialDepartmentId,
  initialDate,
  currentUser,
  onNavigateToSlots,
  onSelectTab,
  onRequireAuth,
}) => {
  const datesList = getAvailableDatesList();

  // Multi-step state: 1 -> 2 -> 3 -> 4
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);

  // Step 1: Department
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId>(
    initialDepartmentId || 'general-medicine'
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  // Step 2: Date & Time
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || datesList[0].dateString
  );
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Step 3: Patient Details
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [patientAge, setPatientAge] = useState(currentUser?.age ? String(currentUser.age) : '');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [reason, setReason] = useState('');

  // Step 4: Submission & Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<AppointmentBooking | null>(null);

  // Slots state
  const [currentSlots, setCurrentSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Update slots when date/dept changes (loads real bookings from Supabase)
  useEffect(() => {
    let active = true;
    setSlotsLoading(true);
    setSelectedTime('');

    appointmentService
      .refreshSlotsForDate(selectedDate)
      .then(() => {
        if (!active) return;
        setCurrentSlots(
          appointmentService.getSlotsForDepartmentAndDate(selectedDate, selectedDeptId)
        );
      })
      .finally(() => {
        if (active) setSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDeptId, selectedDate]);

  useEffect(() => {
    if (initialDepartmentId) {
      setSelectedDeptId(initialDepartmentId);
    }
  }, [initialDepartmentId]);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  // Autofill if user logs in
  useEffect(() => {
    if (currentUser) {
      if (!patientName) setPatientName(currentUser.name);
      if (!patientAge && currentUser.age) setPatientAge(String(currentUser.age));
      if (!mobileNumber) setMobileNumber(currentUser.phone);
      if (!email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  const currentDept = appointmentService.getDepartment(selectedDeptId);
  const doctors = currentDept ? currentDept.doctors : [];

  const morningSlots = currentSlots.filter((s) => s.period === 'morning');
  const afternoonSlots = currentSlots.filter((s) => s.period === 'afternoon');
  const eveningSlots = currentSlots.filter((s) => s.period === 'evening');

  const filteredSlots =
    selectedPeriod === 'all'
      ? currentSlots
      : currentSlots.filter((s) => s.period === selectedPeriod);

  const availableCount = currentSlots.filter((s) => !s.isBooked).length;

  const goToStep = (targetStep: number) => {
    setErrorMessage('');
    setDirection(targetStep > currentStep ? 1 : -1);
    setCurrentStep(targetStep);
  };

  const handleNextFromStep1 = () => {
    goToStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!selectedTime) {
      setErrorMessage('Please select an available appointment time slot to proceed.');
      return;
    }
    goToStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!patientName.trim()) {
      setErrorMessage('Please enter the patient’s full name.');
      return;
    }
    if (!patientAge || Number(patientAge) <= 0 || Number(patientAge) > 120) {
      setErrorMessage('Please enter a valid age between 1 and 120.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 7) {
      setErrorMessage('Please provide a valid contact mobile number.');
      return;
    }
    goToStep(4);
  };

  const handleFinalConfirm = async () => {
    setErrorMessage('');

    if (!currentUser) {
      setErrorMessage('Please sign in or create a patient account to confirm this appointment.');
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await appointmentService.bookAppointment({
        patientName,
        patientAge: Number(patientAge),
        mobileNumber,
        email,
        departmentId: selectedDeptId,
        doctorId: selectedDoctorId || undefined,
        date: selectedDate,
        time: selectedTime,
        reason: reason || 'Scheduled outpatient consultation',
      });

      if (result.success && result.booking) {
        setConfirmedBooking(result.booking);
        setCurrentSlots(
          appointmentService.getSlotsForDepartmentAndDate(selectedDate, selectedDeptId)
        );
      } else {
        setErrorMessage(result.error || 'Failed to complete appointment reservation.');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to complete appointment reservation.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setCurrentStep(1);
    setSelectedTime('');
    setReason('');
    setErrorMessage('');
  };

  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Title & Demo Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200 dark:border-white/10">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5] block mb-1">
            Aurora Care · Outpatient Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171A3B] dark:text-white">
            Book Your Consultation
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Intuitive four-step appointment scheduling with instant confirmation.
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFC857]/20 dark:bg-[#FFC857]/15 border border-[#FF9B54]/40 text-[#9a3412] dark:text-[#FFC857] text-xs font-bold">
          <Sparkles className="w-4 h-4 text-[#FF9B54]" />
          <span>Live Capacity Sync</span>
        </div>
      </div>

      {confirmedBooking ? (
        /* STEP 4 CONFIRMED BOARDING PASS */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto mt-12 bg-white/95 dark:bg-[#151838]/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-white/10 text-center space-y-6 relative overflow-hidden"
        >
          {/* Top color ribbon */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#5145FF] via-[#8957FF] via-[#E34AD7] to-[#00CFA8]" />

          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-[#00CFA8] to-[#B9F4D0] text-white flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-1">
            <span className="px-3.5 py-1 rounded-full bg-[#B9F4D0] dark:bg-[#00CFA8]/20 text-[#065f46] dark:text-[#B9F4D0] text-xs font-black uppercase tracking-wider">
              Booking Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171A3B] dark:text-white pt-2">
              Appointment Scheduled
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Your appointment is confirmed. A notification has been sent to your account.
            </p>
          </div>

          {/* Boarding Pass Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FFFDF8] to-[#F0E8FF]/60 dark:from-[#0B0C1E] dark:to-[#171a3b] border border-slate-200 dark:border-white/10 text-left space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/10">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Appointment Reference
              </span>
              <span className="font-mono font-extrabold text-[#5145FF] dark:text-[#16CBE5] text-base bg-white dark:bg-[#151838] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 shadow-xs">
                {confirmedBooking.referenceId}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-400 font-bold block">Department</span>
                <span className="text-sm font-bold text-[#171A3B] dark:text-white block mt-0.5">
                  {confirmedBooking.departmentName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-400 font-bold block">Doctor</span>
                <span className="text-sm font-bold text-[#171A3B] dark:text-white block mt-0.5">
                  {confirmedBooking.doctorName}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-400 font-bold block">Date & Time</span>
                <span className="text-sm font-bold text-[#5145FF] dark:text-[#16CBE5] font-mono block mt-0.5">
                  {confirmedBooking.date} · {confirmedBooking.time}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-400 font-bold block">Patient</span>
                <span className="text-sm font-bold text-[#171A3B] dark:text-white block mt-0.5">
                  {confirmedBooking.patientName} ({confirmedBooking.patientAge}y)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
              <span className="text-slate-400 dark:text-slate-400 font-bold block">Clinic Location</span>
              <span className="text-slate-700 dark:text-slate-300 block mt-0.5">
                {currentDept?.location}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToSlots}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white font-bold rounded-xl text-xs sm:text-sm shadow-aurora-indigo hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Verify in Available Slots</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-[#171A3B] dark:text-white font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Schedule Another Visit</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* STEP PROGRESS INDICATOR */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { num: 1, title: 'Department' },
              { num: 2, title: 'Date & Time' },
              { num: 3, title: 'Patient Info' },
              { num: 4, title: 'Confirm' },
            ].map((step) => {
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (step.num < currentStep) goToStep(step.num);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#5145FF]/10 to-[#8957FF]/10 dark:from-[#5145FF]/25 dark:to-[#8957FF]/25 border-[#5145FF] shadow-xs'
                      : isPast
                      ? 'bg-[#B9F4D0]/30 dark:bg-[#00CFA8]/15 border-[#00CFA8]/40 cursor-pointer'
                      : 'bg-white dark:bg-[#151838] border-slate-200 dark:border-white/10 opacity-60 cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                        isCurrent
                          ? 'bg-[#5145FF] text-white'
                          : isPast
                          ? 'bg-[#00CFA8] text-white'
                          : 'bg-slate-200 dark:bg-white/20 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isPast ? '✓' : step.num}
                    </span>
                    <span className="hidden sm:inline text-xs font-bold text-[#171A3B] dark:text-white">
                      {step.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Sign-in requirement banner */}
          {!currentUser && (
            <div className="p-4 rounded-2xl bg-[#F0E8FF] dark:bg-[#5145FF]/15 border border-[#8957FF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#5145FF] dark:text-[#A594FD] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#171A3B] dark:text-white">
                    Sign in required to confirm
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Create your patient account with a password and mobile number so we can send
                    you appointment notifications.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRequireAuth}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white text-xs font-bold shadow-aurora-indigo hover:opacity-95 transition-all cursor-pointer"
              >
                Sign In / Create Account
              </button>
            </div>
          )}

          {/* ANIMATED STEP VIEWS */}
          <div className="bg-white/95 dark:bg-[#151838]/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-white/10 shadow-aurora-card relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {/* STEP 1: CHOOSE DEPARTMENT */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5]">
                      Step 1 of 4
                    </span>
                    <h2 className="text-2xl font-bold text-[#171A3B] dark:text-white">Choose Medical Specialty</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Select the clinic you wish to consult.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DEPARTMENTS.map((dept) => {
                      const isSelected = selectedDeptId === dept.id;
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => setSelectedDeptId(dept.id)}
                          className={`p-5 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                            isSelected
                              ? 'border-[#5145FF] bg-gradient-to-br from-[#F0E8FF] to-white dark:from-[#211F4E] dark:to-[#151838] shadow-aurora-indigo ring-2 ring-[#5145FF]'
                              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#0B0C1E]/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[#171A3B] dark:text-white">{dept.name}</span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                isSelected ? 'bg-[#5145FF] border-[#5145FF] text-white' : 'border-slate-300 dark:border-white/20'
                              }`}
                            >
                              {isSelected ? '✓' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {dept.shortDescription}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold">
                            {dept.location.split(',')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Doctor Choice */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                    <label htmlFor="step1-doc" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                      Preferred Attending Doctor (Optional)
                    </label>
                    <select
                      id="step1-doc"
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full sm:w-96 px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-[#171A3B] dark:text-white focus:border-[#5145FF] focus-visible:outline-none"
                    >
                      <option value="">First Available Specialist</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextFromStep1}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white font-bold rounded-xl text-sm shadow-aurora-indigo hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Date & Time</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SELECT DATE AND TIME */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5]">
                        Step 2 of 4 · {currentDept?.name}
                      </span>
                      <h2 className="text-2xl font-bold text-[#171A3B] dark:text-white">Select Date and Time Slot</h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        {slotsLoading
                          ? 'Checking live availability…'
                          : `${availableCount} slots currently available on ${selectedDate}.`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="text-xs font-bold text-[#5145FF] dark:text-[#16CBE5] hover:underline cursor-pointer"
                    >
                      Change Specialty
                    </button>
                  </div>

                  {/* 7-Day Date Ribbon */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                      Choose Date
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {datesList.map((d) => {
                        const isSelected = selectedDate === d.dateString;
                        return (
                          <button
                            key={d.dateString}
                            type="button"
                            onClick={() => setSelectedDate(d.dateString)}
                            className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#5145FF] to-[#8957FF] border-[#5145FF] text-white shadow-aurora-indigo font-bold'
                                : 'bg-slate-50 dark:bg-[#0B0C1E] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-wider block opacity-80">
                              {d.weekday}
                            </span>
                            <span className="text-sm font-extrabold block mt-0.5">{d.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Period Filter Tabs */}
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#0B0C1E] rounded-xl w-fit text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        selectedPeriod === 'all' ? 'bg-white dark:bg-[#151838] text-[#171A3B] dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      All Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('morning')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        selectedPeriod === 'morning' ? 'bg-white dark:bg-[#151838] text-[#5145FF] dark:text-[#16CBE5] shadow-xs' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Sun className="w-3 h-3 text-[#FFC857]" />
                      <span>Morning</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('afternoon')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        selectedPeriod === 'afternoon' ? 'bg-white dark:bg-[#151838] text-[#FF745C] dark:text-[#FF9B54] shadow-xs' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Sunset className="w-3 h-3 text-[#FF745C]" />
                      <span>Afternoon</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('evening')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        selectedPeriod === 'evening' ? 'bg-white dark:bg-[#151838] text-[#8957FF] dark:text-[#E34AD7] shadow-xs' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Moon className="w-3 h-3 text-[#8957FF]" />
                      <span>Evening</span>
                    </button>
                  </div>

                  {/* Time Slots Grid with Spring Click Motion */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                      Select Available Time
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                      {filteredSlots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        return (
                          <motion.button
                            key={slot.id}
                            type="button"
                            disabled={slot.isBooked}
                            whileTap={slot.isBooked ? {} : { scale: 0.95 }}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                              slot.isBooked
                                ? 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-white/5 line-through cursor-not-allowed'
                                : isSelected
                                ? 'bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white border-[#5145FF] shadow-aurora-indigo ring-2 ring-[#5145FF]'
                                : 'bg-white dark:bg-[#0B0C1E] hover:border-[#8957FF] text-[#171A3B] dark:text-white border-slate-200 dark:border-white/10'
                            }`}
                          >
                            <span className="block">{slot.time}</span>
                            <span className="text-[10px] font-normal block opacity-80 mt-0.5">
                              {slot.isBooked ? 'Booked' : 'Available'}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#171A3B] dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextFromStep2}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white font-bold rounded-xl text-sm shadow-aurora-indigo hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Patient Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PATIENT DETAILS */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5]">
                      Step 3 of 4
                    </span>
                    <h2 className="text-2xl font-bold text-[#171A3B] dark:text-white">Enter Patient Information</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      These details are used for clinic registration and consultation records.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="p-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        id="p-name"
                        type="text"
                        required
                        placeholder="e.g. Robert Miller"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0B0C1E] focus:border-[#5145FF] focus-visible:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="p-age" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Age *
                      </label>
                      <input
                        id="p-age"
                        type="number"
                        required
                        min="1"
                        max="120"
                        placeholder="e.g. 38"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0B0C1E] focus:border-[#5145FF] focus-visible:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="p-phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        id="p-phone"
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0B0C1E] focus:border-[#5145FF] focus-visible:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="p-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        id="p-email"
                        type="email"
                        placeholder="patient@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0B0C1E] focus:border-[#5145FF] focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="p-reason" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Reason for Consultation (Optional)
                    </label>
                    <textarea
                      id="p-reason"
                      rows={2}
                      placeholder="Brief note on symptoms, chronic follow-up, or prescription renewal..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-[#171A3B] dark:text-white focus:bg-white dark:focus:bg-[#0B0C1E] focus:border-[#5145FF] focus-visible:outline-none"
                    />
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#171A3B] dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Schedule</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextFromStep3}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white font-bold rounded-xl text-sm shadow-aurora-indigo hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Review & Confirm</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5]">
                      Step 4 of 4
                    </span>
                    <h2 className="text-2xl font-bold text-[#171A3B] dark:text-white">Final Appointment Review</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Please verify all appointment information before confirming your booking.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FFFDF8] to-[#F0E8FF]/60 dark:from-[#0B0C1E] dark:to-[#171a3b] border border-slate-200 dark:border-white/10 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200 dark:border-white/10">
                      <div>
                        <span className="text-slate-400 dark:text-slate-400 font-bold block">Department</span>
                        <span className="text-base font-bold text-[#171A3B] dark:text-white block mt-0.5">
                          {currentDept?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-400 font-bold block">Doctor Assigned</span>
                        <span className="text-base font-bold text-[#171A3B] dark:text-white block mt-0.5">
                          {selectedDoctorId
                            ? doctors.find((d) => d.id === selectedDoctorId)?.name
                            : 'First Available Specialist'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200 dark:border-white/10">
                      <div>
                        <span className="text-slate-400 dark:text-slate-400 font-bold block">Appointment Date</span>
                        <span className="text-sm font-bold text-[#5145FF] dark:text-[#16CBE5] font-mono block mt-0.5">
                          {selectedDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-400 font-bold block">Reserved Time</span>
                        <span className="text-sm font-bold text-[#5145FF] dark:text-[#16CBE5] font-mono block mt-0.5">
                          {selectedTime}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 dark:text-slate-400 font-bold block">Patient Name</span>
                        <span className="text-sm font-bold text-[#171A3B] dark:text-white block mt-0.5">
                          {patientName} ({patientAge} years)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-400 font-bold block">Contact Mobile</span>
                        <span className="text-sm font-bold text-[#171A3B] dark:text-white block mt-0.5">
                          {mobileNumber}
                        </span>
                      </div>
                    </div>

                    {reason && (
                      <div className="pt-2 text-slate-500 dark:text-slate-300 italic bg-white dark:bg-[#151838] p-2.5 rounded-lg border border-slate-100 dark:border-white/10">
                        Reason: &quot;{reason}&quot;
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                    <strong>Notification:</strong> The clinic and your patient account are notified
                    immediately. SMS delivery is sent to your registered mobile number when the
                    clinic has SMS enabled.
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#171A3B] dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleFinalConfirm}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#00CFA8] to-[#16CBE5] hover:opacity-95 text-white font-extrabold rounded-xl text-sm shadow-aurora-cyan transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Locking Slot...</span>
                      ) : !currentUser ? (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Sign In to Confirm</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Reserve Appointment</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
