import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DepartmentId } from '../types/index.ts';
import {
  appointmentService,
  DEPARTMENTS,
  getAvailableDatesList,
} from '../services/appointmentService.ts';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  ArrowRight,
  RefreshCw,
  Building2,
  Stethoscope,
  HeartPulse,
  Brain,
  Activity,
  Baby,
  Sparkles,
  Info,
} from 'lucide-react';

interface AvailableSlotsPageProps {
  onBookDepartment: (departmentId: DepartmentId, date: string) => void;
}

export const AvailableSlotsPage: React.FC<AvailableSlotsPageProps> = ({ onBookDepartment }) => {
  const datesList = getAvailableDatesList();

  const [selectedDate, setSelectedDate] = useState<string>(datesList[0].dateString);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Live capacity stats
  const [statsData, setStatsData] = useState(() =>
    appointmentService.getDepartmentStats(selectedDate)
  );

  const refreshStats = async () => {
    await appointmentService.refreshSlotsForDate(selectedDate);
    setStatsData(appointmentService.getDepartmentStats(selectedDate));
  };

  useEffect(() => {
    void refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Synchronize when bookings occur in other components
  useEffect(() => {
    const handleUpdate = () => {
      void refreshStats();
    };
    window.addEventListener('aether_slots_updated', handleUpdate);
    window.addEventListener('aether_appointments_updated', handleUpdate);
    return () => {
      window.removeEventListener('aether_slots_updated', handleUpdate);
      window.removeEventListener('aether_appointments_updated', handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const getDepartmentIcon = (id: DepartmentId) => {
    switch (id) {
      case 'general-medicine':
        return <Stethoscope className="w-5 h-5 text-black" />;
      case 'cardiology':
        return <HeartPulse className="w-5 h-5 text-black" />;
      case 'neurology':
        return <Brain className="w-5 h-5 text-black" />;
      case 'orthopedics':
        return <Activity className="w-5 h-5 text-black" />;
      case 'pediatrics':
        return <Baby className="w-5 h-5 text-black" />;
      case 'dermatology':
        return <Sparkles className="w-5 h-5 text-black" />;
      default:
        return <Stethoscope className="w-5 h-5 text-black" />;
    }
  };

  const filteredDepartments = statsData.departmentStats.filter((deptStat) => {
    if (selectedDeptFilter !== 'all' && deptStat.departmentId !== selectedDeptFilter) {
      return false;
    }
    if (availableOnly && deptStat.availableSlots === 0) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Title & Explanatory Kicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b-2 border-black dark:border-white/20">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-black bg-[#FFCC24] px-3 py-1 rounded-full border-2 border-black inline-block mb-2 shadow-neo-sm">
            Live Capacity Radar
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-black dark:text-white tracking-tight">
            Available Hospital Slots
          </h1>
          <p className="text-black/70 dark:text-slate-400 font-bold text-sm sm:text-base mt-1">
            Real-time appointment capacity across all 6 clinics with transparent instant booking.
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#182032] border-2 border-black shadow-neo-sm text-xs font-black text-black dark:text-white">
          <Info className="w-4 h-4 shrink-0 text-[#2154FE]" />
          <span>Updated Live · Zero Waiting Loops</span>
        </div>
      </div>

      {/* VIBRANT POP KPI STRIP (Matching Good Boy Pop Brutalism) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
        {/* Total Slots (Sunshine Yellow) */}
        <div className="p-6 rounded-3xl bg-[#FFCC24] border-2 border-black shadow-neo text-black space-y-1">
          <div className="flex items-center justify-between text-xs font-black">
            <span>Daily Slots</span>
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-3xl sm:text-4xl font-black block font-mono">
            {statsData.totalSlots}
          </span>
          <span className="text-[11px] font-bold opacity-80 block">
            Across 6 clinics
          </span>
        </div>

        {/* Available Slots (Fresh Mint) */}
        <div className="p-6 rounded-3xl bg-[#00D09C] border-2 border-black shadow-neo text-black space-y-1">
          <div className="flex items-center justify-between text-xs font-black">
            <span>Available Now</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-3xl sm:text-4xl font-black block font-mono">
            {statsData.totalAvailable}
          </span>
          <span className="text-[11px] font-bold opacity-80 block">
            Ready to book
          </span>
        </div>

        {/* Booked Slots (Bubblegum Pink) */}
        <div className="p-6 rounded-3xl bg-[#FF6B8B] border-2 border-black shadow-neo text-black space-y-1">
          <div className="flex items-center justify-between text-xs font-black">
            <span>Confirmed Visits</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-3xl sm:text-4xl font-black block font-mono">
            {statsData.totalBooked}
          </span>
          <span className="text-[11px] font-bold opacity-80 block">
            Reserved patients
          </span>
        </div>

        {/* Departments with Openings (Electric Blue with White Text) */}
        <div className="p-6 rounded-3xl bg-[#2154FE] border-2 border-black shadow-neo text-white space-y-1">
          <div className="flex items-center justify-between text-xs font-black">
            <span>Open Specialties</span>
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="text-3xl sm:text-4xl font-black block font-mono">
            {statsData.departmentsWithAvailability} / 6
          </span>
          <span className="text-[11px] font-bold opacity-80 block">
            Accepting walk-ins
          </span>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="mt-8 bg-white dark:bg-[#182032] p-6 sm:p-7 rounded-3xl border-2 border-black shadow-neo space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#2154FE]" />
            <span>Interactive Capacity Filters</span>
          </span>

          <button
            type="button"
            onClick={refreshStats}
            className="text-xs font-black text-black dark:text-white hover:text-[#2154FE] flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Counts</span>
          </button>
        </div>

        {/* 7-Day Calendar Ribbon */}
        <div className="space-y-2">
          <label className="text-xs font-black text-black dark:text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#2154FE]" />
            <span>Select Date</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
            {datesList.map((d) => {
              const isSelected = selectedDate === d.dateString;
              return (
                <button
                  key={d.dateString}
                  type="button"
                  onClick={() => setSelectedDate(d.dateString)}
                  className={`p-3 rounded-2xl text-center border-2 border-black text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFCC24] text-black font-black shadow-neo translate-y-[-2px]'
                      : 'bg-[#FAF7EE] dark:bg-[#0E131F] text-black dark:text-slate-300 font-bold hover:bg-white'
                  }`}
                >
                  <span className="block opacity-75 text-[10px] uppercase font-black">{d.weekday}</span>
                  <span className="block font-black mt-0.5 text-sm">{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-black/10 dark:border-white/10">
          <div>
            <label htmlFor="slot-filter-dept" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-1">
              Filter by Specialty
            </label>
            <select
              id="slot-filter-dept"
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-xs font-black text-black dark:text-white focus:outline-none"
            >
              <option value="all">All Specialties (6 Clinics)</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="slot-filter-period" className="block text-xs font-black text-black dark:text-slate-300 uppercase mb-1">
              Time of Day
            </label>
            <select
              id="slot-filter-period"
              value={selectedPeriodFilter}
              onChange={(e) => setSelectedPeriodFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black rounded-xl text-xs font-black text-black dark:text-white focus:outline-none"
            >
              <option value="all">Anytime (Morning, Afternoon, Evening)</option>
              <option value="morning">Morning Only (09:00 AM – 12:00 PM)</option>
              <option value="afternoon">Afternoon Only (01:30 PM – 04:30 PM)</option>
              <option value="evening">Evening Only (05:00 PM – 06:30 PM)</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black w-full cursor-pointer hover:bg-white transition-colors">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-black accent-[#2154FE] rounded border-2 border-black"
              />
              <span className="text-xs font-black text-black dark:text-slate-300">
                Show Open Clinics Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* DEPARTMENT CARDS GRID */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((deptStat) => {
          const dept = appointmentService.getDepartment(deptStat.departmentId);
          const deptSlots = appointmentService.getSlotsForDepartmentAndDate(
            selectedDate,
            deptStat.departmentId
          );

          const visibleSlots =
            selectedPeriodFilter === 'all'
              ? deptSlots
              : deptSlots.filter((s) => s.period === selectedPeriodFilter);

          const isFullyBooked = deptStat.availableSlots === 0;
          const isLimited = deptStat.availableSlots > 0 && deptStat.availableSlots <= 4;

          return (
            <motion.div
              key={deptStat.departmentId}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-[#182032] rounded-3xl p-6 border-2 border-black shadow-neo hover:shadow-neo-lg transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header: Icon, Name, and Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#FFCC24] border-2 border-black shadow-neo-sm">
                      {getDepartmentIcon(deptStat.departmentId)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black dark:text-white leading-tight">
                        {deptStat.departmentName}
                      </h3>
                      <span className="text-xs font-bold text-black/60 dark:text-slate-400">
                        {dept?.location.split(',')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div>
                    {isFullyBooked ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-rose-200 text-black border-2 border-black">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Booked</span>
                      </span>
                    ) : isLimited ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-[#FFCC24] text-black border-2 border-black">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Limited</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-[#00D09C] text-black border-2 border-black">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Numerical Breakdown Box */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black grid grid-cols-3 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-black/60 dark:text-slate-400 font-black uppercase block">Total</span>
                    <span className="text-base font-black text-black dark:text-white font-mono block mt-0.5">
                      {deptStat.totalSlots}
                    </span>
                  </div>
                  <div className="border-x-2 border-black/20 dark:border-white/20">
                    <span className="text-[10px] text-black/60 dark:text-slate-400 font-black uppercase block">Booked</span>
                    <span className="text-base font-black text-black/80 dark:text-slate-300 font-mono block mt-0.5">
                      {deptStat.bookedSlots}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-black font-black uppercase block">Open</span>
                    <span className="text-base font-black text-[#2154FE] dark:text-[#FFCC24] font-mono block mt-0.5">
                      {deptStat.availableSlots}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-black text-black/70 dark:text-slate-300">
                    <span>Capacity Filled</span>
                    <span className="font-mono">
                      {Math.round((deptStat.bookedSlots / deptStat.totalSlots) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#FAF7EE] dark:bg-[#0E131F] border-2 border-black overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFullyBooked ? 'bg-rose-500' : isLimited ? 'bg-[#FFCC24]' : 'bg-[#00D09C]'
                      }`}
                      style={{
                        width: `${(deptStat.bookedSlots / deptStat.totalSlots) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Sample Slots Preview */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-black text-black/60 dark:text-slate-400 block uppercase">
                    Sample Openings ({selectedDate}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {visibleSlots.slice(0, 5).map((s) => (
                      <span
                        key={s.id}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border-2 border-black font-black ${
                          s.isBooked
                            ? 'bg-neutral-200 text-neutral-400 line-through'
                            : 'bg-[#FFCC24] text-black shadow-neo-sm'
                        }`}
                      >
                        {s.time}
                      </span>
                    ))}
                    {visibleSlots.length > 5 && (
                      <span className="text-[11px] font-black text-black/60 dark:text-slate-400 self-center">
                        +{visibleSlots.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t-2 border-black/10 dark:border-white/10">
                <button
                  type="button"
                  disabled={isFullyBooked}
                  onClick={() => onBookDepartment(deptStat.departmentId, selectedDate)}
                  className={`w-full py-3 px-4 rounded-full font-black text-xs border-2 border-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isFullyBooked
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-[#2154FE] hover:bg-[#1946DF] text-white shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px]'
                  }`}
                >
                  <span>{isFullyBooked ? 'Clinic Full Today' : 'Book Open Slot'}</span>
                  {!isFullyBooked && <ArrowRight className="w-4 h-4 stroke-[3]" />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
