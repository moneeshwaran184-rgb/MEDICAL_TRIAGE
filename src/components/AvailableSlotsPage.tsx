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
        return <Stethoscope className="w-5 h-5 text-[#00CFA8]" />;
      case 'cardiology':
        return <HeartPulse className="w-5 h-5 text-[#FF745C]" />;
      case 'neurology':
        return <Brain className="w-5 h-5 text-[#8957FF]" />;
      case 'orthopedics':
        return <Activity className="w-5 h-5 text-[#16CBE5]" />;
      case 'pediatrics':
        return <Baby className="w-5 h-5 text-[#FF9B54]" />;
      case 'dermatology':
        return <Sparkles className="w-5 h-5 text-[#E34AD7]" />;
      default:
        return <Stethoscope className="w-5 h-5 text-[#5145FF]" />;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200 dark:border-white/10">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#5145FF] dark:text-[#16CBE5] block mb-1">
            Aurora Care · Live Capacity Radar
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171A3B] dark:text-white">
            Available Hospital Slots
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Inspect real-time appointment availability across all clinics without completing a form.
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16CBE5]/15 dark:bg-[#16CBE5]/20 border border-[#16CBE5]/30 text-[#0e7490] dark:text-[#16CBE5] text-xs font-bold">
          <Info className="w-4 h-4 shrink-0 text-[#16CBE5]" />
          <span>Synchronized with demo booking engine</span>
        </div>
      </div>

      {/* VIBRANT PASTEL / COSMIC KPI STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {/* Total Slots (Pastel Lavender / Deep Cosmic) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#F0E8FF] to-white dark:from-[#211F4E] dark:to-[#151838] border border-[#8957FF]/20 dark:border-white/10 shadow-aurora-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Total Daily Slots</span>
            <Building2 className="w-4 h-4 text-[#8957FF] dark:text-[#16CBE5]" />
          </div>
          <span className="text-3xl sm:text-4xl font-black text-[#5145FF] dark:text-[#16CBE5] block font-mono">
            {statsData.totalSlots}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Across 6 outpatient clinics
          </span>
        </div>

        {/* Available Slots (Fresh Mint & Teal) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#B9F4D0]/30 to-white dark:from-[#063b31] dark:to-[#151838] border border-[#00CFA8]/30 dark:border-white/10 shadow-aurora-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#065f46] dark:text-[#B9F4D0]">
            <span>Available Right Now</span>
            <CheckCircle2 className="w-4 h-4 text-[#00CFA8]" />
          </div>
          <span className="text-3xl sm:text-4xl font-black text-[#00CFA8] block font-mono">
            {statsData.totalAvailable}
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block">
            Ready for instant booking
          </span>
        </div>

        {/* Booked Slots (Warm Tangerine) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FF9B54]/15 to-white dark:from-[#3d240e] dark:to-[#151838] border border-[#FF9B54]/30 dark:border-white/10 shadow-aurora-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#9a3412] dark:text-[#FFC857]">
            <span>Booked Consultations</span>
            <Clock className="w-4 h-4 text-[#FF9B54]" />
          </div>
          <span className="text-3xl sm:text-4xl font-black text-[#FF9B54] block font-mono">
            {statsData.totalBooked}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Confirmed patient visits
          </span>
        </div>

        {/* Departments with Openings (Tropical Cyan) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#16CBE5]/15 to-white dark:from-[#0c3140] dark:to-[#151838] border border-[#16CBE5]/30 dark:border-white/10 shadow-aurora-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#0e7490] dark:text-[#16CBE5]">
            <span>Clinics with Openings</span>
            <Stethoscope className="w-4 h-4 text-[#16CBE5]" />
          </div>
          <span className="text-3xl sm:text-4xl font-black text-[#16CBE5] block font-mono">
            {statsData.departmentsWithAvailability} / 6
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Specialties accepting visits
          </span>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="mt-8 bg-white/90 dark:bg-[#151838]/85 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-aurora-card space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[#171A3B] dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#5145FF] dark:text-[#16CBE5]" />
            <span>Interactive Capacity Filters</span>
          </span>

          <button
            type="button"
            onClick={refreshStats}
            className="text-xs font-bold text-[#5145FF] dark:text-[#16CBE5] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Counts</span>
          </button>
        </div>

        {/* 7-Day Calendar Ribbon */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#5145FF] dark:text-[#16CBE5]" />
            <span>Target Date</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {datesList.map((d) => {
              const isSelected = selectedDate === d.dateString;
              return (
                <button
                  key={d.dateString}
                  type="button"
                  onClick={() => setSelectedDate(d.dateString)}
                  className={`p-2.5 rounded-2xl text-center border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#5145FF] to-[#8957FF] border-[#5145FF] text-white font-black shadow-aurora-indigo'
                      : 'bg-[#FFFDF8] dark:bg-[#0B0C1E] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <span className="block opacity-80 text-[10px] uppercase font-bold">{d.weekday}</span>
                  <span className="block font-black mt-0.5">{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-white/10">
          <div>
            <label htmlFor="slot-filter-dept" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Filter by Specialty
            </label>
            <select
              id="slot-filter-dept"
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-[#171A3B] dark:text-white focus:border-[#5145FF] focus-visible:outline-none"
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
            <label htmlFor="slot-filter-period" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Time of Day
            </label>
            <select
              id="slot-filter-period"
              value={selectedPeriodFilter}
              onChange={(e) => setSelectedPeriodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-[#171A3B] dark:text-white focus:border-[#5145FF] focus-visible:outline-none"
            >
              <option value="all">Anytime (Morning, Afternoon, Evening)</option>
              <option value="morning">Morning Only (09:00 AM – 12:00 PM)</option>
              <option value="afternoon">Afternoon Only (01:30 PM – 04:30 PM)</option>
              <option value="evening">Evening Only (05:00 PM – 06:30 PM)</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 w-full cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-[#5145FF] rounded accent-[#5145FF]"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
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
              className="bg-white/95 dark:bg-[#151838]/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-aurora-card hover:shadow-aurora-card-hover transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header: Icon, Name, and Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0C1E] border border-slate-100 dark:border-white/10 shadow-xs">
                      {getDepartmentIcon(deptStat.departmentId)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#171A3B] dark:text-white leading-tight">
                        {deptStat.departmentName}
                      </h3>
                      <span className="text-xs text-slate-400 dark:text-slate-400">
                        {dept?.location.split(',')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges with Clear Written Text */}
                  <div>
                    {isFullyBooked ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Fully Booked</span>
                      </span>
                    ) : isLimited ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Limited Slots</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#B9F4D0] dark:bg-[#00CFA8]/20 text-[#065f46] dark:text-[#B9F4D0] border border-[#00CFA8]/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Available</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Numerical Breakdown Box */}
                <div className="p-4 rounded-2xl bg-[#FFFDF8] dark:bg-[#0B0C1E] border border-slate-200 dark:border-white/10 grid grid-cols-3 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Total</span>
                    <span className="text-base font-black text-[#171A3B] dark:text-white font-mono block mt-0.5">
                      {deptStat.totalSlots}
                    </span>
                  </div>
                  <div className="border-x border-slate-200 dark:border-white/10">
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Booked</span>
                    <span className="text-base font-bold text-slate-600 dark:text-slate-300 font-mono block mt-0.5">
                      {deptStat.bookedSlots}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#00CFA8] font-bold uppercase block">Available</span>
                    <span className="text-base font-black text-[#00CFA8] font-mono block mt-0.5">
                      {deptStat.availableSlots}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Occupancy</span>
                    <span className="font-mono">
                      {Math.round((deptStat.bookedSlots / deptStat.totalSlots) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFullyBooked ? 'bg-rose-500' : isLimited ? 'bg-[#FF9B54]' : 'bg-[#00CFA8]'
                      }`}
                      style={{
                        width: `${(deptStat.bookedSlots / deptStat.totalSlots) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Sample Slots Preview */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 block uppercase">
                    Sample Openings ({selectedDate}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {visibleSlots.slice(0, 5).map((s) => (
                      <span
                        key={s.id}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                          s.isBooked
                            ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 line-through border-slate-200 dark:border-white/5'
                            : 'bg-[#F0E8FF] dark:bg-[#8957FF]/20 text-[#5145FF] dark:text-[#16CBE5] border-[#8957FF]/30 dark:border-[#8957FF]/40 font-bold'
                        }`}
                      >
                        {s.time}
                      </span>
                    ))}
                    {visibleSlots.length > 5 && (
                      <span className="text-[10px] text-slate-400 py-0.5 font-medium">
                        +{visibleSlots.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  disabled={isFullyBooked}
                  onClick={() => onBookDepartment(deptStat.departmentId, selectedDate)}
                  className={`w-full py-3 px-4 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isFullyBooked
                      ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#5145FF] to-[#8957FF] text-white shadow-aurora-indigo hover:opacity-95 active:scale-[0.98]'
                  }`}
                >
                  <span>{isFullyBooked ? 'Fully Booked for Selected Day' : 'Reserve Appointment'}</span>
                  {!isFullyBooked && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
