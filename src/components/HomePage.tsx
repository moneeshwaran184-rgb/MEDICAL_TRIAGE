import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PageTab, DepartmentId } from '../types/index.ts';
import { DEPARTMENTS } from '../services/appointmentService.ts';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Brain,
  Activity,
  Baby,
  ShieldCheck,
  Building2,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  Award,
  ChevronRight,
  Users,
} from 'lucide-react';

interface HomePageProps {
  onSelectTab: (tab: PageTab) => void;
  onBookDepartment: (departmentId: DepartmentId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTab, onBookDepartment }) => {
  const [quickSymptom, setQuickSymptom] = useState('heart-palpitation');

  // Custom theme specs for each department tile
  const departmentThemes: Record<
    DepartmentId,
    {
      bgGradient: string;
      cardBg: string;
      accentColor: string;
      badgeBg: string;
      badgeText: string;
      buttonGradient: string;
      iconBg: string;
      tag: string;
    }
  > = {
    'general-medicine': {
      bgGradient: 'from-[#B9F4D0]/30 to-[#00CFA8]/10',
      cardBg: 'bg-white/90 dark:bg-[#151838]/85 backdrop-blur-md',
      accentColor: '#00CFA8',
      badgeBg: 'bg-[#B9F4D0] dark:bg-[#00CFA8]/20',
      badgeText: 'text-[#065f46] dark:text-[#B9F4D0]',
      buttonGradient: 'from-[#00CFA8] to-[#16CBE5]',
      iconBg: 'bg-[#B9F4D0]/60 dark:bg-[#00CFA8]/20 text-[#00CFA8]',
      tag: 'Primary Care',
    },
    cardiology: {
      bgGradient: 'from-[#FF745C]/20 to-[#E34AD7]/10',
      cardBg: 'bg-white/90 dark:bg-[#151838]/85 backdrop-blur-md',
      accentColor: '#FF745C',
      badgeBg: 'bg-[#FF745C]/20 dark:bg-[#FF745C]/25',
      badgeText: 'text-[#9f1239] dark:text-[#FF9B54]',
      buttonGradient: 'from-[#FF745C] to-[#E34AD7]',
      iconBg: 'bg-[#FF745C]/20 dark:bg-[#FF745C]/25 text-[#FF745C]',
      tag: 'Heart & Vascular',
    },
    neurology: {
      bgGradient: 'from-[#8957FF]/20 to-[#F0E8FF]',
      cardBg: 'bg-white/90 dark:bg-[#151838]/85 backdrop-blur-md',
      accentColor: '#8957FF',
      badgeBg: 'bg-[#F0E8FF] dark:bg-[#8957FF]/25',
      badgeText: 'text-[#5b21b6] dark:text-[#F0E8FF]',
      buttonGradient: 'from-[#8957FF] to-[#5145FF]',
      iconBg: 'bg-[#F0E8FF] dark:bg-[#8957FF]/25 text-[#8957FF]',
      tag: 'Neurosciences',
    },
    orthopedics: {
      bgGradient: 'from-[#16CBE5]/25 to-[#5145FF]/10',
      cardBg: 'bg-white/90 dark:bg-[#151838]/85 backdrop-blur-md',
      accentColor: '#16CBE5',
      badgeBg: 'bg-[#16CBE5]/20 dark:bg-[#16CBE5]/25',
      badgeText: 'text-[#0e7490] dark:text-[#16CBE5]',
      buttonGradient: 'from-[#16CBE5] to-[#5145FF]',
      iconBg: 'bg-[#16CBE5]/20 dark:bg-[#16CBE5]/25 text-[#0891b2]',
      tag: 'Bones & Mobility',
    },
    pediatrics: {
      bgGradient: 'from-[#FFC857]/30 to-[#FF9B54]/15',
      cardBg: 'bg-white/90 dark:bg-[#151838]/85 backdrop-blur-md',
      accentColor: '#FF9B54',
      badgeBg: 'bg-[#FFC857]/30 dark:bg-[#FFC857]/20',
      badgeText: 'text-[#9a3412] dark:text-[#FFC857]',
      buttonGradient: 'from-[#FFC857] to-[#FF9B54]',
      iconBg: 'bg-[#FFC857]/30 dark:bg-[#FFC857]/20 text-[#ea580c]',
      tag: 'Infant & Child Health',
    },
    dermatology: {
      bgGradient: 'from-[#E34AD7]/20 to-[#FF745C]/15',
      cardBg: 'bg-white/90 dark:bg-[#151838]/85 backdrop-blur-md',
      accentColor: '#E34AD7',
      badgeBg: 'bg-[#E34AD7]/20 dark:bg-[#E34AD7]/25',
      badgeText: 'text-[#831843] dark:text-[#E34AD7]',
      buttonGradient: 'from-[#E34AD7] to-[#8957FF]',
      iconBg: 'bg-[#E34AD7]/20 dark:bg-[#E34AD7]/25 text-[#c026d3]',
      tag: 'Skin & Preventative',
    },
  };

  const getDepartmentIcon = (id: DepartmentId) => {
    switch (id) {
      case 'general-medicine':
        return <Stethoscope className="w-6 h-6" />;
      case 'cardiology':
        return <HeartPulse className="w-6 h-6" />;
      case 'neurology':
        return <Brain className="w-6 h-6" />;
      case 'orthopedics':
        return <Activity className="w-6 h-6" />;
      case 'pediatrics':
        return <Baby className="w-6 h-6" />;
      case 'dermatology':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Stethoscope className="w-6 h-6" />;
    }
  };

  return (
    <div className="w-full bg-transparent text-[#171A3B] dark:text-slate-100 overflow-hidden">
      {/* 1. SPECTACULAR COLORFUL HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Ambient Luminous Gradient Fields */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F0E8FF]/80 dark:bg-[#5145FF]/20 rounded-full blur-3xl -z-10 opacity-70 animate-aurora-pulse-slow pointer-events-none" />
        <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-gradient-to-br from-[#16CBE5]/25 via-[#B9F4D0]/30 to-[#FFC857]/20 dark:from-[#16CBE5]/25 dark:via-[#00CFA8]/20 dark:to-[#8957FF]/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#FF745C]/15 dark:bg-[#FF745C]/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 dark:bg-[#151838]/90 border border-[#8957FF]/20 dark:border-white/10 shadow-xs backdrop-blur-md"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#5145FF] to-[#E34AD7] animate-ping" />
                <span className="text-xs font-bold text-[#171A3B] dark:text-white tracking-wide">
                  Aurora Care · Connected Hospital Network
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#B9F4D0] dark:bg-[#00CFA8]/20 text-[#065f46] dark:text-[#B9F4D0] text-[10px] font-black uppercase">
                  Live Slots
                </span>
              </motion.div>

              {/* Expressive Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-2"
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#171A3B] dark:text-white leading-[1.06]">
                  Better Care.
                  <br />
                  <span className="bg-gradient-to-r from-[#5145FF] via-[#8957FF] via-[#E34AD7] to-[#FF745C] bg-clip-text text-transparent">
                    Brighter Days.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl font-medium leading-relaxed pt-3">
                  Experience seamless outpatient access, transparent appointment slots, and intelligent symptom triage designed around human empathy.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <button
                  type="button"
                  onClick={() => onSelectTab('book')}
                  className="px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-[#5145FF] via-[#8957FF] to-[#E34AD7] hover:opacity-95 rounded-2xl shadow-aurora-indigo transition-all active:scale-[0.98] flex items-center gap-3 cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('slots')}
                  className="px-7 py-4 text-base font-bold text-[#171A3B] dark:text-white bg-white/90 dark:bg-[#151838]/90 hover:bg-[#F0E8FF]/50 dark:hover:bg-white/10 border-2 border-[#171A3B]/10 dark:border-white/15 hover:border-[#5145FF]/40 rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center gap-2.5 cursor-pointer backdrop-blur-md"
                >
                  <Clock className="w-5 h-5 text-[#5145FF] dark:text-[#16CBE5]" />
                  <span>Explore Available Slots</span>
                </button>
              </motion.div>

              {/* Secondary AI Triage Action */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="pt-1 flex items-center gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300"
              >
                <span>Unsure which clinic you need?</span>
                <button
                  type="button"
                  onClick={() => onSelectTab('triage')}
                  className="text-[#5145FF] dark:text-[#16CBE5] hover:text-[#8957FF] dark:hover:text-[#00CFA8] hover:underline flex items-center gap-1 font-extrabold cursor-pointer"
                >
                  <span>Try AI Patient Triage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Luminous Stats Ribbon */}
              <div className="pt-4 grid grid-cols-3 gap-4 max-w-lg border-t border-slate-200/80 dark:border-white/10">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#5145FF] dark:text-[#16CBE5] font-mono block">90+</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-0.5">
                    Daily Slots
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#00CFA8] font-mono block">15 min</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-0.5">
                    Avg. Wait Time
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#E34AD7] font-mono block">6</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-0.5">
                    Specialties
                  </span>
                </div>
              </div>
            </div>

            {/* Right Rich Visual Composition (5 Cols) */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative mx-auto max-w-md lg:max-w-none"
              >
                {/* Main Hero Card Canvas */}
                <div className="relative rounded-3xl bg-gradient-to-tr from-white via-white/95 to-[#F0E8FF] dark:from-[#151838] dark:via-[#191c42] dark:to-[#231b47] p-6 sm:p-8 border-2 border-white/80 dark:border-white/15 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-xl">
                  {/* Decorative Aurora Wave Graphic */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-[#16CBE5] to-[#5145FF] rounded-full blur-2xl opacity-30 dark:opacity-40 pointer-events-none" />

                  {/* Illustrated Healthcare Card Lockup */}
                  <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5145FF] via-[#8957FF] to-[#E34AD7] p-0.5 shadow-aurora-indigo">
                      <div className="w-full h-full bg-white dark:bg-[#0B0C1E] rounded-[14px] flex items-center justify-center text-[#5145FF] dark:text-[#16CBE5]">
                        <Stethoscope className="w-7 h-7" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5] block">
                        Aether Outpatient Network
                      </span>
                      <h3 className="text-xl font-black text-[#171A3B] dark:text-white">
                        Personalized Care Desk
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Board-Certified Specialists on Duty</span>
                    </div>
                  </div>

                  {/* Floating Appointment Boarding Pass Ticket */}
                  <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-white to-[#F0E8FF] dark:from-[#0B0C1E] dark:to-[#171a3b] border border-[#8957FF]/30 dark:border-[#8957FF]/40 shadow-xs space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-[#5145FF] dark:text-[#16CBE5]">DEMO PASS · #AET-2026-LIVE</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#B9F4D0] dark:bg-[#00CFA8]/20 text-[#065f46] dark:text-[#B9F4D0] text-[10px] font-black uppercase">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black text-[#171A3B] dark:text-white block">Cardiology Consultation</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Dr. Marcus Vance, MD</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-[#5145FF] dark:text-[#16CBE5] font-mono block">10:30 AM</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Today</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Capacity Indicator */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0C1E]/80 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#00CFA8]" />
                        <span>Today&apos;s Open Capacity</span>
                      </span>
                      <span className="text-[#00CFA8] font-mono">18 Slots Free</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00CFA8] via-[#16CBE5] to-[#5145FF] w-[75%]" />
                    </div>
                  </div>

                  {/* Doctor Consultation Guarantee */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 font-semibold text-[#171A3B] dark:text-white">
                      <ShieldCheck className="w-4 h-4 text-[#5145FF] dark:text-[#00CFA8]" />
                      Zero Booking Fees
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectTab('book')}
                      className="text-[#5145FF] dark:text-[#16CBE5] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Pick a Slot</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Floating Interactive Badge 1 (Bottom Left) */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="hidden sm:flex absolute -bottom-5 -left-6 bg-white dark:bg-[#151838] p-3.5 rounded-2xl shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-200/80 dark:border-white/15 items-center gap-3 z-10 backdrop-blur-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF745C] to-[#FF9B54] flex items-center justify-center text-white shadow-xs">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#171A3B] dark:text-white block">Cardiac & Neuro</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Same-day openings available</span>
                  </div>
                </motion.div>

                {/* Floating Interactive Badge 2 (Top Right) */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="hidden sm:flex absolute -top-5 -right-6 bg-white dark:bg-[#151838] p-3.5 rounded-2xl shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-200/80 dark:border-white/15 items-center gap-3 z-10 backdrop-blur-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#16CBE5] to-[#00CFA8] flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#171A3B] dark:text-white block">AI Symptom Check</span>
                    <span className="text-[10px] text-emerald-600 dark:text-[#00CFA8] font-bold block">Instant Acuity Review</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL HOSPITAL INTRODUCTION */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-transparent via-[#8957FF]/10 to-transparent dark:via-[#8957FF]/15 border-y border-slate-200/60 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#E34AD7]/15 dark:bg-[#E34AD7]/25 text-[#E34AD7] dark:text-[#E34AD7] text-xs font-black uppercase tracking-wider">
                Human-Centered Healthcare
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171A3B] dark:text-white leading-tight">
                Designed for clinical precision and personal warmth.
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                At Aether Hospital, we have redesigned the outpatient healthcare journey from the ground up. Instead of phone tag and crowded waiting rooms, patients gain direct insight into physician calendars, transparent slot availability, and intelligent clinical guidance.
              </p>

              <div className="space-y-3 pt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#B9F4D0] dark:bg-[#00CFA8]/30 flex items-center justify-center text-[#065f46] dark:text-[#B9F4D0]">
                    ✓
                  </div>
                  <span>Instant slot confirmation with zero telephone delays</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#B9F4D0] dark:bg-[#00CFA8]/30 flex items-center justify-center text-[#065f46] dark:text-[#B9F4D0]">
                    ✓
                  </div>
                  <span>Pre-consultation clinical questionnaire to prepare your doctor</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#B9F4D0] dark:bg-[#00CFA8]/30 flex items-center justify-center text-[#065f46] dark:text-[#B9F4D0]">
                    ✓
                  </div>
                  <span>Coordinated outpatient specialty clinics under one roof</span>
                </div>
              </div>
            </div>

            {/* Right Expressive Graphic Block */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#F0E8FF] to-white dark:from-[#211F4E] dark:to-[#151838] border border-[#8957FF]/20 dark:border-white/10 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#5145FF] text-white flex items-center justify-center shadow-aurora-indigo">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#171A3B] dark:text-white">Patient Respect</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your time is valuable. Our scheduling algorithms ensure minimal waiting room dwell time.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#B9F4D0]/30 to-white dark:from-[#063b31] dark:to-[#151838] border border-[#00CFA8]/20 dark:border-white/10 shadow-xs space-y-3 mt-6">
                <div className="w-12 h-12 rounded-2xl bg-[#00CFA8] text-white flex items-center justify-center shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#171A3B] dark:text-white">Excellence</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Board-certified doctors across 6 essential clinical disciplines with modern diagnostics.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFC857]/20 to-white dark:from-[#3d240e] dark:to-[#151838] border border-[#FF9B54]/20 dark:border-white/10 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF9B54] text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#171A3B] dark:text-white">Real-Time</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Slots update instantaneously as patients reserve, preventing overbooking.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#16CBE5]/20 to-white dark:from-[#0c3140] dark:to-[#151838] border border-[#16CBE5]/20 dark:border-white/10 shadow-xs space-y-3 mt-6">
                <div className="w-12 h-12 rounded-2xl bg-[#16CBE5] text-white flex items-center justify-center shadow-aurora-cyan">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#171A3B] dark:text-white">AI Triage</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Guided symptom evaluation matching symptoms to the right specialist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VIBRANT MEDICAL DEPARTMENTS TILES */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#5145FF]/10 dark:bg-[#5145FF]/20 text-[#5145FF] dark:text-[#16CBE5] text-xs font-black uppercase tracking-wider">
              Clinical Specialties
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171A3B] dark:text-white">
              Our Medical Departments
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl">
              Each department is equipped with state-of-the-art diagnostic facilities and attending physicians.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('slots')}
            className="text-sm font-bold text-[#5145FF] dark:text-[#16CBE5] hover:text-[#8957FF] dark:hover:text-[#00CFA8] hover:underline inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Department Openings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Distinctive Department Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {DEPARTMENTS.map((dept) => {
            const theme = departmentThemes[dept.id];
            return (
              <motion.div
                key={dept.id}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', damping: 20, stiffness: 280 }}
                className={`rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 shadow-aurora-card hover:shadow-aurora-card-hover transition-all flex flex-col justify-between space-y-6 ${theme.cardBg} relative overflow-hidden`}
              >
                {/* Subtle colorful top gradient halo */}
                <div
                  className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${theme.buttonGradient}`}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl ${theme.iconBg} shadow-xs`}>
                      {getDepartmentIcon(dept.id)}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold ${theme.badgeBg} ${theme.badgeText}`}
                    >
                      {theme.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#171A3B] dark:text-white">
                      {dept.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {dept.shortDescription}
                    </p>
                  </div>

                  <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                    <span className="font-bold text-[#171A3B] dark:text-white block">Attending Doctors:</span>
                    {dept.doctors.map((doc) => (
                      <span key={doc.id} className="block text-slate-600 dark:text-slate-300 font-medium">
                        • {doc.name} ({doc.specialty})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                    {dept.location.split(',')[0]}
                  </div>

                  <button
                    type="button"
                    onClick={() => onBookDepartment(dept.id)}
                    className={`py-2.5 px-4 rounded-xl text-white font-bold text-xs bg-gradient-to-r ${theme.buttonGradient} shadow-xs hover:opacity-95 transition-all active:scale-[0.98] cursor-pointer`}
                  >
                    Book Appointment
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. COLORFUL BOOKING TIMELINE JOURNEY */}
      <section className="py-20 sm:py-28 bg-gradient-to-r from-[#5145FF] via-[#8957FF] to-[#E34AD7] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider inline-block">
              Effortless Care Coordination
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
              How Your Appointment Works
            </h2>
            <p className="text-white/80 text-sm sm:text-base">
              A streamlined, patient-centric flow from symptom discovery to doctor consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-white/20 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#5145FF] font-black text-xl flex items-center justify-center shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold">Choose Department</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Select your required clinic directly or utilize the AI Triage symptom evaluator to determine the most relevant medical specialist.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-white/20 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00CFA8] text-white font-black text-xl flex items-center justify-center shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold">Select Date & Open Slot</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Browse our real-time 7-day schedule ribbon. Filter by morning, afternoon, or evening to secure a time that aligns with your day.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-white/20 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFC857] text-[#171A3B] font-black text-xl flex items-center justify-center shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold">Confirm & Consult</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Receive an instant booking reference number with campus directions and personalized preparation questions for your consultation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEMORABLE AI TRIAGE SPOTLIGHT SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-[#171A3B] via-[#241F55] to-[#171A3B] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          {/* Luminous Glow Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#16CBE5]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E34AD7]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#16CBE5] text-xs font-bold border border-white/10">
                <Sparkles className="w-4 h-4 text-[#E34AD7]" />
                <span>Intelligent Clinical Pre-Assessment</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                Evaluate your symptoms before scheduling.
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Our conversational triage assistant asks targeted questions regarding symptom duration, pain severity, and clinical history—providing non-diagnostic guidance and matching you with the appropriate specialty team.
              </p>

              {/* Safety Warning */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/15 text-xs text-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Clinical Oversight Notice:</strong> AI Triage is an assistive pre-consultation guide and does not replace emergency response or certified physician diagnosis.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onSelectTab('triage')}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#16CBE5] via-[#5145FF] to-[#E34AD7] text-white font-extrabold text-sm sm:text-base shadow-aurora-cyan hover:opacity-95 transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Launch AI Triage Wizard</span>
                </button>
              </div>
            </div>

            {/* Interactive Live Mini-Preview */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#16CBE5] block">
                Interactive Preview
              </span>
              <p className="text-xs text-white/80">Select a common condition to test routing:</p>

              <div className="space-y-2">
                {[
                  { id: 'heart-palpitation', label: 'Heart palpitations & chest tightness', dept: 'Cardiology' },
                  { id: 'migraine-dizzy', label: 'Severe throbbing migraine with aura', dept: 'Neurology' },
                  { id: 'ankle-sprain', label: 'Painful swollen ankle joint', dept: 'Orthopedics' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setQuickSymptom(item.id);
                      onSelectTab('triage');
                    }}
                    className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all flex items-center justify-between text-xs"
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-[10px] text-[#B9F4D0] font-bold">
                      → {item.dept}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COLORFUL EDITORIAL FOOTER */}
      <footer role="contentinfo" className="bg-[#171A3B] text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-white font-extrabold text-xl">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5145FF] to-[#E34AD7] flex items-center justify-center text-white">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <span>Aether Hospital</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                An Aurora Care patient facility offering transparent outpatient appointment scheduling, clinical triage assistance, and multidisciplinary healthcare.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hospital Navigation</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button type="button" onClick={() => onSelectTab('home')} className="hover:text-white transition-colors">
                    Home Overview
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectTab('book')} className="hover:text-white transition-colors">
                    Book an Appointment
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectTab('slots')} className="hover:text-white transition-colors">
                    Check Available Slots
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectTab('triage')} className="hover:text-white transition-colors">
                    AI Patient Triage
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Campus & Appointments</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#16CBE5] shrink-0" />
                  <span>400 Aether Health Blvd, Medical City</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#00CFA8] shrink-0" />
                  <span>Reception: (800) 555-0199</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF745C] shrink-0" />
                  <span>care@aether-hospital.org</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Emergency Notice */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#FF745C] uppercase tracking-wider">
                Emergency Medical Notice
              </h4>
              <p className="text-xs text-amber-300/90 leading-relaxed bg-amber-950/40 p-3.5 rounded-2xl border border-amber-800/40">
                If you are experiencing severe chest pain, sudden numbness, uncontrolled bleeding, or shortness of breath, call 911 immediately or visit the emergency room.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Aether Hospital · Aurora Care Design System. Demonstration simulation.</p>
            <p>Built with React, Motion, and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
