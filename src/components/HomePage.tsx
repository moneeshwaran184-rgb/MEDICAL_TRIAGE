import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PageTab, DepartmentId } from '../types/index.ts';
import { DEPARTMENTS } from '../services/appointmentService.ts';
import {
  Calendar,
  Clock,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Brain,
  Activity,
  Baby,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Heart,
  Truck,
  Award,
  ShieldCheck,
  Check,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface HomePageProps {
  onSelectTab: (tab: PageTab) => void;
  onBookDepartment: (departmentId: DepartmentId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTab, onBookDepartment }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<DepartmentId | 'all'>('all');

  // Vibrant color definitions matching reference images
  const specialtyCards: {
    id: DepartmentId;
    name: string;
    slots: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
  }[] = [
    {
      id: 'general-medicine',
      name: 'General Care',
      slots: '420 appointments',
      icon: <Stethoscope className="w-6 h-6 stroke-[2.5]" />,
      bgColor: 'bg-[#FFCC24]', // Yellow
      textColor: 'text-black',
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      slots: '310 appointments',
      icon: <HeartPulse className="w-6 h-6 stroke-[2.5]" />,
      bgColor: 'bg-[#FF6B8B]', // Pink
      textColor: 'text-black',
    },
    {
      id: 'neurology',
      name: 'Neurology',
      slots: '140 appointments',
      icon: <Brain className="w-6 h-6 stroke-[2.5]" />,
      bgColor: 'bg-[#2154FE]', // Electric Blue
      textColor: 'text-white',
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      slots: '85 appointments',
      icon: <Baby className="w-6 h-6 stroke-[2.5]" />,
      bgColor: 'bg-white dark:bg-[#182032]', // Cream/White
      textColor: 'text-black dark:text-white',
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      slots: '190 appointments',
      icon: <Activity className="w-6 h-6 stroke-[2.5]" />,
      bgColor: 'bg-[#00D09C]', // Fresh Mint
      textColor: 'text-black',
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      slots: '125 appointments',
      icon: <Sparkles className="w-6 h-6 stroke-[2.5]" />,
      bgColor: 'bg-[#E9D5FF]', // Pop Lavender
      textColor: 'text-black',
    },
  ];

  // Featured doctors ("Staff picks" in Image 2)
  const featuredDoctors = [
    {
      id: 'doc-1',
      name: 'Dr. Sarah Chen',
      title: 'General Practitioner',
      bio: 'Survives the Monday morning rush. 12+ years in community care.',
      accentBg: 'bg-[#FF6B8B]', // Pink
      tag: 'Lead Physician',
      deptId: 'general-medicine' as DepartmentId,
      badge: 'Staff fave',
    },
    {
      id: 'doc-2',
      name: 'Dr. Marcus Vance',
      title: 'Consultant Cardiologist',
      bio: 'Heart rhythm specialist. Italy-trained, patient favourite.',
      accentBg: 'bg-[#FFCC24]', // Yellow
      tag: 'Echo & Holter',
      deptId: 'cardiology' as DepartmentId,
      badge: 'Top Rated',
    },
    {
      id: 'doc-3',
      name: 'Dr. Elena Rostova',
      title: 'Neurologist & Neuro-Rehab',
      bio: 'Migraine and vertigo wizard. Fast diagnosis, zero drama.',
      accentBg: 'bg-[#2154FE]', // Blue
      tag: 'Headache Clinic',
      deptId: 'neurology' as DepartmentId,
      badge: 'Popular',
    },
    {
      id: 'doc-4',
      name: 'Dr. James Wilson',
      title: 'Orthopedic Surgeon',
      bio: 'Sports joints, knees & ankles. Made in Somerset, loved in Bristol.',
      accentBg: 'bg-[#FAF7EE] dark:bg-[#182032]', // Cream
      tag: 'Joint Clinic',
      deptId: 'orthopedics' as DepartmentId,
      badge: 'Staff fave',
    },
  ];

  return (
    <div className="w-full bg-[#FAF7EE] dark:bg-[#0E131F] text-black dark:text-slate-100 transition-colors duration-200">
      {/* 1. VIBRANT SUNSHINE YELLOW HERO SECTION (Matching Image 5) */}
      <section className="w-full bg-[#FFCC24] border-b-2 border-black py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Bold Playful Display Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-black tracking-tight leading-[1.05]">
                Good care,
                <br />
                great doctors,
                <br />
                happy patients.
              </h1>

              <p className="text-base sm:text-lg text-black font-semibold max-w-xl leading-relaxed pt-1">
                An independent healthcare clinic on North Street, Bristol. Board-certified doctors, honest advice, and an AI triage that keeps the waiting room mess out of your day.
              </p>

              {/* Neo-brutalist Action Buttons (Matching Image 5) */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => onSelectTab('book')}
                  className="px-7 py-3.5 sm:px-8 sm:py-4 text-base font-black text-white bg-[#2154FE] hover:bg-[#1946DF] border-2 border-black rounded-full shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-lg active:translate-x-[1px] active:translate-y-[1px] active:shadow-neo-sm transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Calendar className="w-5 h-5 stroke-[2.5]" />
                  <span>Book appointment</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('slots')}
                  className="px-7 py-3.5 sm:px-8 sm:py-4 text-base font-black text-black bg-white hover:bg-neutral-50 border-2 border-black rounded-full shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-lg active:translate-x-[1px] active:translate-y-[1px] active:shadow-neo-sm transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                  <span>Explore open slots</span>
                </button>
              </div>

              {/* Trust Ribbon */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-black text-black">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00D09C] border border-black inline-block animate-pulse" />
                  <span>Walk-ins welcome today</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Zero booking fee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>15 min avg response</span>
                </div>
              </div>
            </div>

            {/* Right Rich Visual Card with Tilted Badges (Matching Image 5) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Tilted Sticker Badge 1: Top Left Pink Badge */}
                <div className="absolute -top-4 -left-3 sm:-top-5 sm:-left-4 z-20 transform -rotate-6 bg-[#FF6B8B] text-black border-2 border-black rounded-full px-4 py-1.5 font-black text-xs sm:text-sm shadow-neo">
                  Est. 2018
                </div>

                {/* Main Framed Hero Photo Container */}
                <div className="bg-white border-[3px] border-black rounded-3xl p-4 sm:p-5 shadow-neo-lg relative overflow-hidden">
                  <div className="bg-[#FAF7EE] border-2 border-black rounded-2xl p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#2154FE] border-2 border-black flex items-center justify-center text-white shadow-neo-sm">
                          <Stethoscope className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-black block">
                            Today&apos;s Open Clinic
                          </span>
                          <span className="text-lg font-black text-black">Aether Medical Desk</span>
                        </div>
                      </div>
                      <span className="bg-[#00D09C] text-black font-black text-[11px] px-2.5 py-1 rounded-full border-2 border-black">
                        Active
                      </span>
                    </div>

                    {/* Illustrated consultation pass */}
                    <div className="p-4 rounded-xl bg-white border-2 border-black shadow-neo-sm space-y-2">
                      <div className="flex justify-between items-center text-xs font-black text-black/70">
                        <span>CONSULTATION PASS</span>
                        <span className="text-[#2154FE] font-mono font-bold">#AET-2026</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-sm font-black text-black block">Cardiology Review</span>
                          <span className="text-xs font-bold text-black/60">Dr. Marcus Vance, MD</span>
                        </div>
                        <span className="text-sm font-black text-[#2154FE]">10:30 AM Today</span>
                      </div>
                    </div>

                    {/* Live Open Slots Progress Bar */}
                    <div className="p-4 rounded-xl bg-white border-2 border-black shadow-neo-sm space-y-2">
                      <div className="flex justify-between items-center text-xs font-black text-black">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#2154FE]" />
                          <span>Today&apos;s Open Capacity</span>
                        </span>
                        <span className="text-[#2154FE]">18 Slots Left</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#FAF7EE] border-2 border-black overflow-hidden p-0.5">
                        <div className="h-full bg-[#2154FE] rounded-full w-[75%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tilted Sticker Badge 2: Bottom Right White Badge */}
                <div className="absolute -bottom-4 -right-3 sm:-bottom-5 sm:-right-4 z-20 transform rotate-6 bg-white text-black border-2 border-black rounded-full px-4 py-1.5 font-black text-xs sm:text-sm shadow-neo">
                  Zero wait at clinic!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE CORE FEATURE TILES (Matching Image 3 Top Row) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Sunshine Yellow Card */}
          <div className="bg-[#FFCC24] border-2 border-black rounded-3xl p-7 shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-lg transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-black shadow-neo-sm">
                <Heart className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black text-black">We know the care</h3>
              <p className="text-sm font-bold text-black/80 leading-relaxed">
                Tell us about the aches, the fatigue or the sensitive tummy — we&apos;ll match the right doctor and department with zero fuss.
              </p>
            </div>
            <span className="text-xs font-black text-black tracking-wide">6 Medical Specialties →</span>
          </div>

          {/* Card 2: Bubblegum Pop Pink Card */}
          <div className="bg-[#FF6B8B] border-2 border-black rounded-3xl p-7 shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-lg transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-black shadow-neo-sm">
                <Truck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black text-black">Same-day slots nearby</h3>
              <p className="text-sm font-bold text-black/80 leading-relaxed">
                Book by 2pm and we&apos;ll guarantee an outpatient appointment the same day, anywhere within three miles of Bristol North Street.
              </p>
            </div>
            <span className="text-xs font-black text-black tracking-wide">Instant Confirmation →</span>
          </div>

          {/* Card 3: Crisp White Card */}
          <div className="bg-white dark:bg-[#182032] border-2 border-black rounded-3xl p-7 shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-lg transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFCC24] border-2 border-black flex items-center justify-center text-black shadow-neo-sm">
                <Award className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black text-black dark:text-white">Care that adds up</h3>
              <p className="text-sm font-bold text-black/80 dark:text-slate-300 leading-relaxed">
                Transparent time slots, zero phone loop waiting. No apps required, no hidden points maths — just real care when you need it.
              </p>
            </div>
            <span className="text-xs font-black text-black dark:text-white tracking-wide">NHS & Private Welcomed →</span>
          </div>
        </div>
      </section>

      {/* 3. CLINICAL SPECIALTIES CATEGORY ROW (Matching Image 2 Top Row) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
              Clinical specialties
            </h2>
            <p className="text-sm font-bold text-black/70 dark:text-slate-400 mt-1">
              Select your department to view open times or schedule immediately
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('slots')}
            className="text-xs font-black text-black dark:text-white underline underline-offset-4 hover:text-[#2154FE] dark:hover:text-[#FFCC24] cursor-pointer"
          >
            View all 90+ daily slots →
          </button>
        </div>

        {/* 6 Chunky Category Tiles (Matching Image 2) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {specialtyCards.map((spec) => (
            <button
              key={spec.id}
              type="button"
              onClick={() => onBookDepartment(spec.id)}
              className={`${spec.bgColor} ${spec.textColor} border-2 border-black rounded-2xl p-5 shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg active:translate-x-[1px] active:translate-y-[1px] active:shadow-neo-sm transition-all text-left flex flex-col justify-between h-40 group cursor-pointer`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 border-2 border-black flex items-center justify-center shadow-neo-sm">
                {spec.icon}
              </div>
              <div>
                <h4 className="text-base font-black leading-tight group-hover:underline">
                  {spec.name}
                </h4>
                <span className="text-[11px] font-bold opacity-80 block mt-0.5">
                  {spec.slots}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. FEATURED SPECIALISTS / "STAFF PICKS" (Matching Image 2 Bottom Row) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
            Staff picks
          </h2>
          <p className="text-sm font-bold text-black/70 dark:text-slate-400 mt-1">
            Hand-picked attending doctors on shift today with open clinic availability
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {featuredDoctors.map((doc, idx) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-[#182032] border-2 border-black rounded-3xl p-5 shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-lg transition-all flex flex-col justify-between relative"
            >
              {/* Staff Fave Sticker Badge on 4th card (Matching Image 2) */}
              {doc.badge && idx === 3 && (
                <div className="absolute -top-3 -right-2 z-10 transform rotate-6 bg-[#FFCC24] text-black border-2 border-black rounded-full px-3 py-1 font-black text-xs shadow-neo-sm">
                  {doc.badge}
                </div>
              )}

              <div className="space-y-4">
                {/* Solid Color Banner Block (Matching Image 2) */}
                <div
                  className={`w-full h-36 rounded-2xl border-2 border-black ${doc.accentBg} flex items-center justify-center p-4 shadow-neo-sm`}
                >
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-neo-sm">
                    {doc.name.split(' ')[1]?.[0] || 'D'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-slate-400 block">
                    {doc.tag}
                  </span>
                  <h3 className="text-lg font-black text-black dark:text-white mt-0.5">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-bold text-black/70 dark:text-slate-300 mt-1 leading-relaxed">
                    {doc.bio}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t-2 border-black/10 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-black text-[#2154FE] dark:text-[#FFCC24]">
                  Same-Day Open
                </span>
                <button
                  type="button"
                  onClick={() => onBookDepartment(doc.deptId)}
                  className="px-3.5 py-1.5 rounded-full bg-[#FFCC24] hover:bg-[#F5C21B] text-black font-black text-xs border-2 border-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                >
                  Book with doctor
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PATIENT STORY OF THE MONTH (Matching Image 3 Bottom Pink Banner) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#FF6B8B] border-[2.5px] border-black rounded-3xl p-8 sm:p-12 shadow-neo-lg text-black relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <span className="bg-black text-[#FFCC24] text-[10px] font-black uppercase px-3 py-1 rounded-full border border-black inline-block tracking-wider">
                PATIENT OF THE MONTH
              </span>

              <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
                David, the sock runner
              </h2>

              <p className="text-sm sm:text-base font-bold leading-relaxed max-w-xl">
                Bristol local. 34 years old. Tore his knee ligament three weeks before his first marathon. Thought his season was over before he discovered our same-day sports orthopedic triage.
              </p>

              <p className="text-xs sm:text-sm font-semibold opacity-90 leading-relaxed max-w-lg">
                &quot;Dr. Wilson had me scanned within an hour and designed an accelerated recovery routine. Cross the finish line last Sunday completely pain-free.&quot;
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onBookDepartment('orthopedics')}
                  className="px-6 py-3 bg-[#FFCC24] hover:bg-[#F5C21B] text-black font-black text-sm border-2 border-black rounded-full shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                >
                  Read recovery story & book →
                </button>
              </div>
            </div>

            {/* Right Overlapping Polaroid-Style Framed Card (Matching Image 3) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="transform rotate-3 bg-white border-2 border-black rounded-2xl p-4 shadow-neo-xl max-w-sm w-full">
                <div className="bg-[#FAF7EE] border-2 border-black rounded-xl p-6 text-center space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#00D09C] border-2 border-black flex items-center justify-center text-black text-2xl font-black shadow-neo-sm">
                    🏃
                  </div>
                  <div>
                    <span className="text-base font-black text-black block">Finisher Medal · 2026</span>
                    <span className="text-xs font-bold text-black/60">Bedminster 10k Champion</span>
                  </div>
                  <div className="pt-2 border-t-2 border-black/10 text-[11px] font-black text-[#2154FE]">
                    Treated at Aether Outpatient Clinic
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. "THE SELF-WASH" STYLE SECTION: THE AI PATIENT TRIAGE (Matching Image 4) */}
      <section className="w-full bg-[#2154FE] border-y-2 border-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 max-w-xl space-y-3">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              The AI triage desk
            </h2>
            <p className="text-base sm:text-lg text-white/90 font-bold leading-relaxed">
              Targeted clinical questions, instant acuity scoring, and direct booking into the right doctor&apos;s queue. We clean up the waiting room mess.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Pricing / Option Cards in Cream (Matching Image 4) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Tier 1 */}
              <div className="bg-[#FAF7EE] text-black border-2 border-black rounded-2xl p-5 shadow-neo flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black">Quick symptom check</h4>
                  <span className="text-xs font-bold text-black/70">Under 2 mins · Instant AI guidance</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#2154FE] font-mono">
                  FREE
                </div>
              </div>

              {/* Tier 2 */}
              <div className="bg-[#FAF7EE] text-black border-2 border-black rounded-2xl p-5 shadow-neo flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black">Specialist clinic matching</h4>
                  <span className="text-xs font-bold text-black/70">6 Departments · Real-time doctor calendar</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#2154FE] font-mono">
                  £0
                </div>
              </div>

              {/* Tier 3 */}
              <div className="bg-[#FAF7EE] text-black border-2 border-black rounded-2xl p-5 shadow-neo flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black">Same-day priority walk-in</h4>
                  <span className="text-xs font-bold text-black/70">Guaranteed slot · Zero waiting time</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#2154FE] font-mono">
                  GUARANTEED
                </div>
              </div>

              {/* Action Button: Sunshine Yellow Pill Button (Matching Image 4) */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => onSelectTab('triage')}
                  className="px-8 py-4 bg-[#FFCC24] hover:bg-[#F5C21B] text-black font-black text-base border-2 border-black rounded-full shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-lg active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 fill-black" />
                  <span>Start AI Triage check</span>
                </button>
              </div>
            </div>

            {/* Right Rich Preview with Tilted Sticker (Matching Image 4) */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Framed Container with Solid Black Border */}
                <div className="bg-white border-2 border-black rounded-3xl p-5 shadow-neo-xl text-black space-y-4">
                  <div className="p-5 rounded-2xl bg-[#FAF7EE] border-2 border-black space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#2154FE] block">
                      AETHER LIVE TRIAGE ENGINE
                    </span>
                    <h3 className="text-xl font-black text-black">
                      Describe your condition in your own words
                    </h3>
                    <div className="space-y-2 text-xs font-bold">
                      <div className="p-3 bg-white rounded-xl border border-black/20 flex items-center justify-between">
                        <span>“Heart fluttering after morning coffee”</span>
                        <span className="text-[#2154FE] font-black">→ Cardiology</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-black/20 flex items-center justify-between">
                        <span>“Swollen ankle after stepping off curb”</span>
                        <span className="text-[#00D09C] font-black">→ Orthopedics</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-black/20 flex items-center justify-between">
                        <span>“Throbbing headache with light sensitivity”</span>
                        <span className="text-[#FF6B8B] font-black">→ Neurology</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tilted Sticker: "No mess at home!" style */}
                <div className="absolute -bottom-4 -left-3 sm:-bottom-5 sm:-left-4 z-20 transform -rotate-6 bg-[#FFCC24] text-black border-2 border-black rounded-full px-4 py-1.5 font-black text-xs sm:text-sm shadow-neo">
                  No mess at clinic!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. "WHAT THE NEIGHBOURS SAY" SPEECH BUBBLE TESTIMONIALS (Exact match for Image 1 Top) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-14">
          <h2 className="text-4xl sm:text-5xl font-black text-black dark:text-white tracking-tight">
            What the neighbours say
          </h2>
          <p className="text-base font-bold text-black/70 dark:text-slate-400 mt-2">
            Real feedback from patients across Bristol and Somerset
          </p>
        </div>

        {/* 3 Speech Bubble Cards with Tails (Matching Image 1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Bubble 1: Sunshine Yellow */}
          <div>
            <div className="relative bg-[#FFCC24] text-black border-2 border-black rounded-3xl p-7 shadow-neo speech-tail-yellow min-h-[170px] flex items-center">
              <p className="text-base font-bold leading-relaxed">
                “They spent twenty minutes helping me pick the right cardiology specialist for a dodgy heart rhythm. No upsell, just real help.”
              </p>
            </div>
            <div className="mt-5 pl-7">
              <span className="font-black text-base text-black dark:text-white">
                Priya, Bishopston
              </span>
            </div>
          </div>

          {/* Bubble 2: Bubblegum Pink */}
          <div>
            <div className="relative bg-[#FF6B8B] text-black border-2 border-black rounded-3xl p-7 shadow-neo speech-tail-pink min-h-[170px] flex items-center">
              <p className="text-base font-bold leading-relaxed">
                “The self-booking is worth every penny. My family&apos;s healthcare routine has never recovered from other messy waiting rooms before now.”
              </p>
            </div>
            <div className="mt-5 pl-7">
              <span className="font-black text-base text-black dark:text-white">
                Tom, Southville
              </span>
            </div>
          </div>

          {/* Bubble 3: Electric Royal Blue (White Text!) */}
          <div>
            <div className="relative bg-[#2154FE] text-white border-2 border-black rounded-3xl p-7 shadow-neo speech-tail-blue min-h-[170px] flex items-center">
              <p className="text-base font-bold leading-relaxed">
                “My grandfather is fussy and rude with doctors. They found the one clinic slot he&apos;d attend and had him home smiling. Legends.”
              </p>
            </div>
            <div className="mt-5 pl-7">
              <span className="font-black text-base text-black dark:text-white">
                Erin, Bedminster
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. "VISIT US" & "OPENING HOURS" (Exact match for Image 1 Bottom) */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: White Card "Visit us" with Blue Pin Icon */}
          <div className="bg-white dark:bg-[#182032] border-2 border-black rounded-3xl p-8 sm:p-10 shadow-neo space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#2154FE] text-white border-2 border-black flex items-center justify-center shadow-neo-sm">
              <MapPin className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-black text-black dark:text-white">
                Visit us
              </h3>
              <p className="text-base font-bold text-black/80 dark:text-slate-300">
                118 North Street<br />
                Bedminster, Bristol BS3 1HL
              </p>
            </div>

            <div className="pt-4 border-t-2 border-black/10 dark:border-white/10 space-y-2 text-xs font-bold text-black/70 dark:text-slate-400">
              <p>• 2 minutes walk from Bedminster train station</p>
              <p>• Dedicated free patient parking behind clinic</p>
              <p>• Reception desk: (800) 555-0199 · triage@aethercare.com</p>
            </div>
          </div>

          {/* Card 2: Sunshine Yellow Card "Opening hours" with Black Clock Icon */}
          <div className="bg-[#FFCC24] border-2 border-black rounded-3xl p-8 sm:p-10 shadow-neo text-black space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-black text-[#FFCC24] border-2 border-black flex items-center justify-center shadow-neo-sm">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-black text-black">
                Opening hours
              </h3>
            </div>

            <div className="space-y-3 font-black text-sm">
              <div className="flex justify-between items-center pb-2 border-b-2 border-black/20">
                <span>Mon – Fri</span>
                <span>8:00am – 8:00pm</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b-2 border-black/20">
                <span>Saturday</span>
                <span>9:00am – 6:00pm</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b-2 border-black/20">
                <span>Sunday</span>
                <span>10:00am – 4:00pm</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-[#2154FE]">
                <span>24/7 Outpatient & Emergency Triage</span>
                <span>Always Open</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CHUNKY POP FOOTER */}
      <footer role="contentinfo" className="bg-[#FAF7EE] dark:bg-[#0E131F] border-t-2 border-black py-16 text-black dark:text-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 font-black text-xl text-black dark:text-white">
                <div className="w-9 h-9 rounded-xl bg-[#FFCC24] border-2 border-black flex items-center justify-center text-black shadow-neo-sm">
                  <Heart className="w-5 h-5 fill-black text-black" />
                </div>
                <span>Aether Health Co.</span>
              </div>
              <p className="text-xs font-bold text-black/70 dark:text-slate-400 leading-relaxed">
                An independent community medical clinic offering transparent appointment booking, symptom AI triage, and friendly healthcare.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                Clinic Navigation
              </h4>
              <ul className="space-y-2 text-xs font-bold text-black/70 dark:text-slate-400">
                <li>
                  <button type="button" onClick={() => onSelectTab('home')} className="hover:text-[#2154FE] transition-colors cursor-pointer">
                    Home Overview
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectTab('book')} className="hover:text-[#2154FE] transition-colors cursor-pointer">
                    Book an Appointment
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectTab('slots')} className="hover:text-[#2154FE] transition-colors cursor-pointer">
                    Check Available Slots
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectTab('triage')} className="hover:text-[#2154FE] transition-colors cursor-pointer">
                    AI Patient Triage
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                Clinic Address
              </h4>
              <ul className="space-y-2 text-xs font-bold text-black/70 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2154FE] shrink-0" />
                  <span>118 North Street, Bristol BS3 1HL</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#00D09C] shrink-0" />
                  <span>Reception: (800) 555-0199</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF6B8B] shrink-0" />
                  <span>care@aether-medical.org</span>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                Medical Notice
              </h4>
              <p className="text-xs font-bold bg-[#FFCC24] text-black p-3.5 rounded-2xl border-2 border-black shadow-neo-sm leading-relaxed">
                In severe emergency situations (chest pain, stroke symptoms, major trauma), please dial 999 immediately.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t-2 border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-black/60 dark:text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} Aether Health Co. Inspired by Good Boy Supply Co. pop brutalism.</p>
            <p>118 North Street · Bedminster, Bristol</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
