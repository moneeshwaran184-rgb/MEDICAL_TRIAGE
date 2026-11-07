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
  Heart,
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
  }, [selectedDate, selectedDeptId]);

  // Keep patient details in sync when auth state updates
  useEffect(() => {
    if (currentUser) {
      if (!patientName) setPatientName(currentUser.name);
      if (!email) setEmail(currentUser.email);
      if (!mobileNumber) setMobileNumber(currentUser.phone);
      if (!patientAge && currentUser.age) setPatientAge(String(currentUser.age));
    }
  }, [currentUser]);

  // Filter slots by period
  const filteredSlots = currentSlots.filter((slot) => {
    if (selectedPeriod === 'all') return true;
    return slot.period === selectedPeriod;
  });

  const availableCount = currentSlots.filter((s) => !s.isBooked).length;
  const currentDept = appointmentService.getDepartment(selectedDeptId);
  const doctors = currentDept ? currentDept.doctors : [];

  const goToStep = (stepNumber: number) => {
    setErrorMessage('');
    setDirection(stepNumber > currentStep ? 1 : -1);
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep1 = () => {
    if (!selectedDeptId) {
      setErrorMessage('Please select a department.');
      return;
    }
    goToStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!selectedTime) {
      setErrorMessage('Please select an available appointment time slot.');
      return;
    }
    goToStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!patientName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const ageNum = parseInt(patientAge, 10);
    if (!patientAge || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setErrorMessage('Please enter a valid age between 1 and 120.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, '').length < 8) {
      setErrorMessage('Please enter a valid mobile number (at least 8 digits).');
      return;
    }
    goToStep(4);
  };

  const handleFinalConfirm = async () => {
    setErrorMessage('');

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDoc = doctors.find((d) => d.id === selectedDoctorId);
      const doctorNameToSave = selectedDoc ? selectedDoc.name : doctors[0]?.name || 'Attending Physician';

      const booking = await appointmentService.bookSlot({
        departmentId: selectedDeptId,
        doctorId: selectedDoctorId || undefined,
        doctorName: doctorNameToSave,
        date: selectedDate,
        time: selectedTime,
        patientName: patientName.trim(),
        patientAge: parseInt(patientAge, 10),
        mobileNumber: mobileNumber.trim(),
        email: email.trim() || undefined,
        reason: reason.trim() || undefined,
        userId: currentUser.id,
      });

      setConfirmedBooking(booking);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while confirming your appointment.'
      );
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
      {/* Title & Pop Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b-2 border-black dark:border-white/20">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-black bg-[#FFCC24] px-3 py-1 rounded-full border-2 border-black inline-block mb-2 shadow-neo-sm">
            Outpatient Booking Desk
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-black dark:text-white tracking-tight">
            Book Your Consultation
          </h1>
          <p className="text-black/70 dark:text-slate-400 font-bold text-sm sm:text-base mt-1">
            Fast four-step scheduling with instant confirmed clinic reference number.
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#182032] border-2 border-black shadow-neo-sm text-xs font-black text-black dark:text-white">
          <Heart className="w-4 h-4 fill-black text-black" />
          <span>Zero Booking Fees · Free Reschedule</span>
        </div>
      </div>

      {confirmedBooking ? (
        /* STEP 4 CONFIRMED BOARDING PASS (Pop Brutalist Style) */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-xl mx-auto mt-12 bg-white dark:bg-[#182032] rounded-3xl p-8 sm:p-10 border-2 border-black shadow-neo-xl text-center space-y-6 relative overflow-hidden"
        >
          {/* Top Sunshine Yellow Banner */}
          <div className="bg-[#FFCC24] border-2 border-black rounded-2xl p-6 text-black space-y-2 shadow-neo-sm">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-black text-black flex items-center justify-center mx-auto shadow-neo-sm">
              <CheckCircle2 className="w-8 h-8 text-[#00D09C]" />
            </div>
            <span className="px-3 py-1 rounded-full bg-black text-[#FFCC24] text-[10px] font-black uppercase tracking-wider inline-block">
              BOOKING CONFIRMED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Appointment Scheduled!
            </h2>
            <p className="text-xs font-bold text-black/80">
              Reference pass has been saved to your patient profile.
            </p>
          </div>

          {/* Boarding Pass Ticket Box */}
          <div className="p-6 rounded-2xl bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black text-left space-y-4 text-xs font-bold shadow-neo-sm">
            <div className="flex justify-between items-center pb-3 border-b-2 border-black/10 dark:border-white/10">
              <span className="text-[11px] font-black text-black/60 dark:text-slate-400 uppercase tracking-wider">
                Appointment Reference
              </span>
              <span className="font-mono font-black text-[#2154FE] dark:text-[#FFCC24] text-base bg-white dark:bg-[#182032] px-3 py-1 rounded-xl border-2 border-black shadow-neo-sm">
                {confirmedBooking.referenceId}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-black/60 dark:text-slate-400 block">Department</span>
                <span className="text-sm font-black text-black dark:text-white block mt-0.5">
                  {confirmedBooking.departmentName}
                </span>
              </div>
              <div>
                <span className="text-black/60 dark:text-slate-400 block">Doctor</span>
                <span className="text-sm font-black text-black dark:text-white block mt-0.5">
                  {confirmedBooking.doctorName}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-black/60 dark:text-slate-400 block">Date & Time</span>
                <span className="text-sm font-black text-[#2154FE] dark:text-[#FFCC24] font-mono block mt-0.5">
                  {confirmedBooking.date} · {confirmedBooking.time}
                </span>
              </div>
              <div>
                <span className="text-black/60 dark:text-slate-400 block">Patient</span>
                <span className="text-sm font-black text-black dark:text-white block mt-0.5">
                  {confirmedBooking.patientName} ({confirmedBooking.patientAge}y)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-black/10 dark:border-white/10">
              <span className="text-black/60 dark:text-slate-400 block">Clinic Address</span>
              <span className="text-black dark:text-slate-200 block mt-0.5 font-bold">
                118 North Street, Bedminster, Bristol BS3 1HL
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToSlots}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#2154FE] hover:bg-[#1946DF] text-white font-black rounded-full border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Verify in Live Slots</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-[#182032] hover:bg-[#FAF7EE] text-black dark:text-white font-black rounded-full border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Book Another Visit</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* STEP PROGRESS INDICATOR */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { num: 1, title: 'Specialty' },
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
                  className={`p-3.5 rounded-2xl border-2 border-black text-left transition-all ${
                    isCurrent
                      ? 'bg-[#FFCC24] text-black font-black shadow-neo translate-y-[-2px]'
                      : isPast
                      ? 'bg-[#00D09C] text-black font-black cursor-pointer'
                      : 'bg-white dark:bg-[#182032] text-black/60 dark:text-slate-400 opacity-70 cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center border-2 border-black ${
                        isCurrent
                          ? 'bg-black text-[#FFCC24]'
                          : isPast
                          ? 'bg-white text-black'
                          : 'bg-white text-black'
                      }`}
                    >
                      {isPast ? '✓' : step.num}
                    </span>
                    <span className="hidden sm:inline text-xs font-black text-black dark:text-white">
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
              className="p-4 rounded-2xl bg-[#FF6B8B] text-black border-2 border-black shadow-neo-sm text-xs font-black flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 shrink-0 stroke-[2.5]" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Sign-in requirement banner */}
          {!currentUser && (
            <div className="p-5 rounded-2xl bg-[#FF6B8B] text-black border-2 border-black shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5 stroke-[2.5]" />
                <div>
                  <p className="text-sm font-black">
                    Patient account required to reserve
                  </p>
                  <p className="text-xs font-bold text-black/80">
                    Sign in or create your account in 30 seconds so we can send your confirmation pass.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRequireAuth}
                className="shrink-0 px-5 py-2.5 rounded-full bg-[#FFCC24] text-black text-xs font-black border-2 border-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                Sign In / Register
              </button>
            </div>
          )}

          {/* ANIMATED STEP VIEWS */}
          <div className="bg-white dark:bg-[#182032] rounded-3xl p-6 sm:p-10 border-2 border-black shadow-neo relative overflow-hidden">
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
                    <span className="text-xs font-black uppercase tracking-wider text-[#2154FE] dark:text-[#FFCC24]">
                      Step 1 of 4
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                      Choose Medical Specialty
                    </h2>
                    <p className="text-xs sm:text-sm text-black/70 dark:text-slate-400 font-bold">
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
                          className={`p-5 rounded-2xl text-left border-2 border-black transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                            isSelected
                              ? 'bg-[#FFCC24] text-black shadow-neo translate-y-[-2px]'
                              : 'bg-[#FAF7EE] dark:bg-[#0E131F] text-black dark:text-white hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-base">{dept.name}</span>
                            <span
                              className={`w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-xs font-black ${
                                isSelected ? 'bg-black text-[#FFCC24]' : 'bg-white text-black'
                              }`}
                            >
                              {isSelected ? '✓' : ''}
                            </span>
                          </div>
                          <p className="text-xs font-bold opacity-80 leading-relaxed">
                            {dept.shortDescription}
                          </p>
                          <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                            {dept.location.split(',')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Doctor Choice */}
                  <div className="pt-4 border-t-2 border-black/10 dark:border-white/10">
                    <label htmlFor="step1-doc" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-2">
                      Preferred Attending Doctor (Optional)
                    </label>
                    <select
                      id="step1-doc"
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full sm:w-96 px-3.5 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-xs sm:text-sm font-black text-black dark:text-white focus:outline-none"
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
                      className="px-8 py-3.5 bg-[#2154FE] hover:bg-[#1946DF] text-white font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Date & Time</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
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
                      <span className="text-xs font-black uppercase tracking-wider text-[#2154FE] dark:text-[#FFCC24]">
                        Step 2 of 4 · {currentDept?.name}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                        Select Date and Time Slot
                      </h2>
                      <p className="text-xs sm:text-sm text-black/70 dark:text-slate-400 font-bold">
                        {slotsLoading
                          ? 'Checking live availability…'
                          : `${availableCount} open slots available on ${selectedDate}.`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="text-xs font-black text-[#2154FE] dark:text-[#FFCC24] underline cursor-pointer"
                    >
                      Change Specialty
                    </button>
                  </div>

                  {/* 7-Day Date Ribbon */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-black dark:text-slate-300 uppercase tracking-wide block">
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
                            className={`p-3 rounded-2xl text-center border-2 border-black transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#FFCC24] text-black shadow-neo font-black translate-y-[-2px]'
                                : 'bg-[#FAF7EE] dark:bg-[#0E131F] text-black dark:text-slate-300 font-bold hover:bg-white'
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-wider block opacity-75 font-black">
                              {d.weekday}
                            </span>
                            <span className="text-sm font-black block mt-0.5">{d.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Period Filter Tabs */}
                  <div className="flex gap-2 p-1.5 bg-[#FAF7EE] dark:bg-[#0E131F] rounded-full border-2 border-black w-fit text-xs font-black">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('all')}
                      className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        selectedPeriod === 'all' ? 'bg-[#FFCC24] text-black border-2 border-black shadow-neo-sm' : 'text-black dark:text-slate-300'
                      }`}
                    >
                      All Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('morning')}
                      className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                        selectedPeriod === 'morning' ? 'bg-[#FFCC24] text-black border-2 border-black shadow-neo-sm' : 'text-black dark:text-slate-300'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Morning</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('afternoon')}
                      className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                        selectedPeriod === 'afternoon' ? 'bg-[#FFCC24] text-black border-2 border-black shadow-neo-sm' : 'text-black dark:text-slate-300'
                      }`}
                    >
                      <Sunset className="w-3.5 h-3.5" />
                      <span>Afternoon</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('evening')}
                      className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                        selectedPeriod === 'evening' ? 'bg-[#FFCC24] text-black border-2 border-black shadow-neo-sm' : 'text-black dark:text-slate-300'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Evening</span>
                    </button>
                  </div>

                  {/* Time Slots Grid with Spring Click Motion */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-black dark:text-slate-300 uppercase tracking-wide block">
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
                            className={`p-3 rounded-xl border-2 border-black text-xs font-mono font-black transition-all text-center cursor-pointer ${
                              slot.isBooked
                                ? 'bg-neutral-200 text-neutral-400 line-through cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#FFCC24] text-black shadow-neo translate-y-[-2px]'
                                : 'bg-white dark:bg-[#0E131F] text-black dark:text-white hover:bg-[#FAF7EE]'
                            }`}
                          >
                            <span className="block text-sm">{slot.time}</span>
                            <span className="text-[10px] font-sans font-black block opacity-75 mt-0.5">
                              {slot.isBooked ? 'Booked' : 'Available'}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t-2 border-black/10 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="px-5 py-2.5 text-xs font-black text-black dark:text-slate-300 hover:text-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 stroke-[3]" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextFromStep2}
                      className="px-8 py-3.5 bg-[#2154FE] hover:bg-[#1946DF] text-white font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Patient Details</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
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
                    <span className="text-xs font-black uppercase tracking-wider text-[#2154FE] dark:text-[#FFCC24]">
                      Step 3 of 4
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                      Enter Patient Information
                    </h2>
                    <p className="text-xs sm:text-sm text-black/70 dark:text-slate-400 font-bold">
                      These details are used for clinic registration and consultation records.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="p-name" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        id="p-name"
                        type="text"
                        required
                        placeholder="e.g. Robert Miller"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="p-age" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-1">
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
                        className="w-full px-4 py-3 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="p-phone" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        id="p-phone"
                        type="tel"
                        required
                        placeholder="07123 456789"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="p-email" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        id="p-email"
                        type="email"
                        placeholder="patient@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="p-reason" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-1">
                      Reason for Consultation (Optional)
                    </label>
                    <textarea
                      id="p-reason"
                      rows={2}
                      placeholder="Brief note on symptoms, chronic follow-up, or prescription renewal..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-sm font-bold text-black dark:text-white focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t-2 border-black/10 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="px-5 py-2.5 text-xs font-black text-black dark:text-slate-300 hover:text-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 stroke-[3]" />
                      <span>Back to Schedule</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextFromStep3}
                      className="px-8 py-3.5 bg-[#2154FE] hover:bg-[#1946DF] text-white font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Review & Confirm</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
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
                    <span className="text-xs font-black uppercase tracking-wider text-[#2154FE] dark:text-[#FFCC24]">
                      Step 4 of 4
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                      Final Appointment Review
                    </h2>
                    <p className="text-xs sm:text-sm text-black/70 dark:text-slate-400 font-bold">
                      Please verify all appointment information before confirming your booking.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-6 rounded-2xl bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black space-y-4 text-xs font-bold shadow-neo-sm">
                    <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-black/10 dark:border-white/10">
                      <div>
                        <span className="text-black/60 dark:text-slate-400 block">Department</span>
                        <span className="text-base font-black text-black dark:text-white block mt-0.5">
                          {currentDept?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-black/60 dark:text-slate-400 block">Doctor Assigned</span>
                        <span className="text-base font-black text-black dark:text-white block mt-0.5">
                          {selectedDoctorId
                            ? doctors.find((d) => d.id === selectedDoctorId)?.name
                            : 'First Available Specialist'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-black/10 dark:border-white/10">
                      <div>
                        <span className="text-black/60 dark:text-slate-400 block">Appointment Date</span>
                        <span className="text-sm font-black text-[#2154FE] dark:text-[#FFCC24] font-mono block mt-0.5">
                          {selectedDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-black/60 dark:text-slate-400 block">Reserved Time</span>
                        <span className="text-sm font-black text-[#2154FE] dark:text-[#FFCC24] font-mono block mt-0.5">
                          {selectedTime}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-black/60 dark:text-slate-400 block">Patient Name</span>
                        <span className="text-sm font-black text-black dark:text-white block mt-0.5">
                          {patientName} ({patientAge} years)
                        </span>
                      </div>
                      <div>
                        <span className="text-black/60 dark:text-slate-400 block">Contact Mobile</span>
                        <span className="text-sm font-black text-black dark:text-white block mt-0.5">
                          {mobileNumber}
                        </span>
                      </div>
                    </div>

                    {reason && (
                      <div className="pt-2 text-black/80 dark:text-slate-200 italic bg-white dark:bg-[#182032] p-3 rounded-xl border-2 border-black">
                        Reason: &quot;{reason}&quot;
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFCC24] text-black border-2 border-black text-xs font-black shadow-neo-sm leading-relaxed">
                    <strong>Notification:</strong> The clinic and your patient account are notified
                    immediately. Confirmation pass is delivered instantaneously to your screen.
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t-2 border-black/10 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="px-5 py-2.5 text-xs font-black text-black dark:text-slate-300 hover:text-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 stroke-[3]" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleFinalConfirm}
                      className="px-8 py-3.5 bg-[#00D09C] hover:bg-[#00B887] text-black font-black rounded-full text-sm border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Locking Slot...</span>
                      ) : !currentUser ? (
                        <>
                          <ShieldCheck className="w-4 h-4 stroke-[3]" />
                          <span>Sign In to Confirm</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                          <span>Confirm & Reserve Slot</span>
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
