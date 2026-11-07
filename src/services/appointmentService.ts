import {
  Department,
  DepartmentId,
  Doctor,
  TimeSlot,
  AppointmentBooking,
  AppointmentStatus,
  DepartmentSlotStats,
  DoctorAppointment,
} from '../types/index.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

export const DEPARTMENTS: Department[] = [
  {
    id: 'general-medicine',
    name: 'General Medicine',
    iconName: 'Stethoscope',
    shortDescription: 'Comprehensive primary healthcare, routine physicals, and preventative consultations.',
    fullDescription: 'Our General Medicine clinic delivers thorough clinical assessment, chronic disease management, seasonal illness treatment, and coordinated referrals for patients of all ages.',
    location: 'Building A, Floor 1 (Suite 102)',
    contactExt: 'ext. 4101',
    doctors: [
      { id: 'doc-gm-1', name: 'Dr. Sarah Mitchell, MD', departmentId: 'general-medicine', specialty: 'Internal Medicine', qualification: 'FACP, Board Certified' },
      { id: 'doc-gm-2', name: 'Dr. James Robinson, DO', departmentId: 'general-medicine', specialty: 'Family Practice', qualification: 'ABFM, Preventive Care' },
    ],
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    iconName: 'HeartPulse',
    shortDescription: 'Advanced cardiovascular diagnostics, arrhythmia monitoring, and heart health.',
    fullDescription: 'Specialized diagnostic consultations covering hypertension, ischemic heart disease, palpitations, and continuous non-invasive cardiac evaluation.',
    location: 'Heart & Vascular Center, Floor 3 (Suite 320)',
    contactExt: 'ext. 4205',
    doctors: [
      { id: 'doc-card-1', name: 'Dr. Marcus Vance, MD', departmentId: 'cardiology', specialty: 'Clinical Cardiology', qualification: 'FACC, Cardiovascular Disease' },
      { id: 'doc-card-2', name: 'Dr. Elena Rostova, MD', departmentId: 'cardiology', specialty: 'Electrophysiology & Echocardiology', qualification: 'FESC, Heart Rhythm Society' },
    ],
  },
  {
    id: 'neurology',
    name: 'Neurology',
    iconName: 'Brain',
    shortDescription: 'Expert evaluation for headaches, neuropathies, seizure disorders, and cognitive health.',
    fullDescription: 'Specialized clinical assessment of central and peripheral nervous system disorders, migraines, neuromuscular conditions, and coordinated neuro-rehabilitation.',
    location: 'Neurological Sciences Pavilion, Floor 4 (Suite 415)',
    contactExt: 'ext. 4312',
    doctors: [
      { id: 'doc-neuro-1', name: 'Dr. Arthur Pendelton, MD', departmentId: 'neurology', specialty: 'Clinical Neurology', qualification: 'FAAN, Neurovascular Care' },
      { id: 'doc-neuro-2', name: 'Dr. Priya Nair, MD', departmentId: 'neurology', specialty: 'Headache & Neuromuscular', qualification: 'ABPN, Headache Medicine' },
    ],
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    iconName: 'Activity',
    shortDescription: 'Musculoskeletal care, joint health, sports injuries, and mobility restoration.',
    fullDescription: 'Consultations for acute sprains, chronic arthritis, spine health, post-fracture recovery, and non-surgical orthopedic therapies.',
    location: 'Surgical & Musculoskeletal Center, Floor 2 (Suite 204)',
    contactExt: 'ext. 4420',
    doctors: [
      { id: 'doc-ortho-1', name: 'Dr. David Chen, MD', departmentId: 'orthopedics', specialty: 'Orthopedic Surgery & Sports Care', qualification: 'AAOS, Sports Medicine' },
      { id: 'doc-ortho-2', name: 'Dr. Rachel Bennett, MD', departmentId: 'orthopedics', specialty: 'Joint Preservation & Spine', qualification: 'Board Certified Orthopedics' },
    ],
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    iconName: 'Baby',
    shortDescription: 'Dedicated developmental checks, childhood immunizations, and pediatric care.',
    fullDescription: 'Compassionate pediatric healthcare designed specifically for infants, children, and adolescents with family-centered care pathways.',
    location: 'Children’s Pavilion, Ground Floor (Suite 110)',
    contactExt: 'ext. 4508',
    doctors: [
      { id: 'doc-ped-1', name: 'Dr. Maya Lin, MD', departmentId: 'pediatrics', specialty: 'General Pediatrics', qualification: 'FAAP, Pediatric Medicine' },
      { id: 'doc-ped-2', name: 'Dr. Thomas Hayes, MD', departmentId: 'pediatrics', specialty: 'Adolescent & Child Health', qualification: 'Board Certified Pediatrics' },
    ],
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    iconName: 'Sparkles',
    shortDescription: 'Clinical skin evaluation, mole monitoring, eczema, and dermatology consultations.',
    fullDescription: 'Diagnostic evaluation of dermatological conditions, skin biopsies, rash assessments, and preventative screening.',
    location: 'Outpatient Specialty Center, Floor 1 (Suite 140)',
    contactExt: 'ext. 4610',
    doctors: [
      { id: 'doc-derm-1', name: 'Dr. Julian Foster, MD', departmentId: 'dermatology', specialty: 'Medical Dermatology', qualification: 'FAAD, Clinical Dermatology' },
    ],
  },
];

// Helper to get dates list for today, tomorrow, and subsequent 5 days
export function getAvailableDatesList(): { dateString: string; label: string; weekday: string }[] {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    let label = '';
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else {
      label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    dates.push({ dateString, label, weekday });
  }

  return dates;
}

const STORAGE_KEY_SLOTS = 'aether_hospital_slots_v2';
const STORAGE_KEY_BOOKINGS = 'aether_hospital_bookings_v2';

// Standard time templates
const TIME_TEMPLATES = [
  { time: '09:00 AM', period: 'morning' as const },
  { time: '09:30 AM', period: 'morning' as const },
  { time: '10:00 AM', period: 'morning' as const },
  { time: '10:30 AM', period: 'morning' as const },
  { time: '11:00 AM', period: 'morning' as const },
  { time: '11:30 AM', period: 'morning' as const },
  { time: '01:30 PM', period: 'afternoon' as const },
  { time: '02:00 PM', period: 'afternoon' as const },
  { time: '02:30 PM', period: 'afternoon' as const },
  { time: '03:00 PM', period: 'afternoon' as const },
  { time: '03:30 PM', period: 'afternoon' as const },
  { time: '04:00 PM', period: 'afternoon' as const },
  { time: '05:00 PM', period: 'evening' as const },
  { time: '05:30 PM', period: 'evening' as const },
  { time: '06:00 PM', period: 'evening' as const },
];

// In-memory cache used when the Supabase backend is enabled. It mirrors the
// shape the UI already expects (Record<`${date}_${departmentId}`, TimeSlot[]>).
const slotsCache: Record<string, TimeSlot[]> = {};

function generateSlotsForDepartment(
  date: string,
  dept: Department,
  booked?: Map<string, { referenceId?: string }>
): TimeSlot[] {
  const key = `${date}_${dept.id}`;
  return TIME_TEMPLATES.map((tmpl, slotIndex) => {
    const bookedEntry = booked?.get(`${dept.id}::${tmpl.time}`);
    return {
      id: `${key}_${slotIndex}`,
      time: tmpl.time,
      period: tmpl.period,
      departmentId: dept.id,
      doctorId: dept.doctors[slotIndex % dept.doctors.length]?.id,
      date,
      isBooked: Boolean(bookedEntry),
      bookedByRef: bookedEntry?.referenceId,
    };
  });
}

function generateInitialSlots(): Record<string, TimeSlot[]> {
  const dates = getAvailableDatesList();
  const allSlots: Record<string, TimeSlot[]> = {};

  dates.forEach((dateObj, dayIndex) => {
    DEPARTMENTS.forEach((dept) => {
      const key = `${dateObj.dateString}_${dept.id}`;
      const slots: TimeSlot[] = TIME_TEMPLATES.map((tmpl, slotIndex) => {
        // Deterministic realistic demo booked status:
        // Some early morning and mid-afternoon slots booked initially
        const isBookedInitially =
          (slotIndex === 0 && dayIndex < 3) ||
          (slotIndex === 2 && dept.id === 'cardiology') ||
          (slotIndex === 3 && dept.id === 'general-medicine') ||
          (slotIndex === 7 && dayIndex === 0) ||
          (slotIndex === 8 && dept.id === 'neurology' && dayIndex < 2) ||
          (slotIndex === 12 && dayIndex === 1);

        return {
          id: `${key}_${slotIndex}`,
          time: tmpl.time,
          period: tmpl.period,
          departmentId: dept.id,
          doctorId: dept.doctors[slotIndex % dept.doctors.length]?.id,
          date: dateObj.dateString,
          isBooked: isBookedInitially,
          bookedByRef: isBookedInitially ? `AET-INIT-${slotIndex}` : undefined,
        };
      });

      allSlots[key] = slots;
    });
  });

  return allSlots;
}

interface AppointmentRow {
  id: string;
  reference_id: string;
  patient_id: string;
  doctor_id: string | null;
  department_id: DepartmentId;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  patient_age: number;
  patient_phone: string;
  patient_email: string | null;
  reason: string | null;
  status: AppointmentStatus;
  doctor_notes: string | null;
  created_at: string;
  patient?: {
    full_name?: string;
    phone_number?: string;
    phone_country_code?: string;
    age?: number;
    gender?: string;
    blood_group?: string;
    email?: string;
  } | null;
}

function mapAppointmentRow(row: AppointmentRow): AppointmentBooking {
  const dept = DEPARTMENTS.find((d) => d.id === row.department_id);
  const doctor = dept?.doctors.find((d) => d.id === row.doctor_id);

  return {
    id: row.id,
    referenceId: row.reference_id,
    patientId: row.patient_id,
    patientName: row.patient_name || row.patient?.full_name || 'Patient',
    patientAge: row.patient_age ?? row.patient?.age ?? 0,
    mobileNumber: row.patient_phone || row.patient?.phone_number || '',
    email: row.patient_email || row.patient?.email || undefined,
    departmentId: row.department_id,
    departmentName: dept?.name ?? row.department_id,
    doctorId: row.doctor_id ?? undefined,
    doctorName: doctor?.name,
    date: row.appointment_date,
    time: row.appointment_time,
    reason: row.reason ?? '',
    bookedAt: row.created_at,
    status: row.status,
    doctorNotes: row.doctor_notes ?? undefined,
  };
}

function mapRpcError(message: string): string {
  if (message.includes('SLOT_TAKEN')) {
    return 'This appointment slot has just been reserved. Please select another time.';
  }
  if (message.includes('NOT_AUTHENTICATED')) {
    return 'Please sign in to confirm your appointment.';
  }
  if (message.includes('DATE_IN_PAST')) {
    return 'Please choose a date in the future.';
  }
  if (message.includes('DOCTOR_NOT_FOUND')) {
    return 'The selected doctor is not available in this department.';
  }
  if (message.includes('DEPARTMENT_NOT_FOUND')) {
    return 'The selected department is not available.';
  }
  return message;
}

export const appointmentService = {
  getDepartments(): Department[] {
    return DEPARTMENTS;
  },

  getDepartment(id: DepartmentId): Department | undefined {
    return DEPARTMENTS.find((d) => d.id === id);
  },

  getDoctors(departmentId: DepartmentId): Doctor[] {
    const dept = this.getDepartment(departmentId);
    return dept ? dept.doctors : [];
  },

  // --------------------------------------------------------------------------
  // Supabase slot synchronisation
  // --------------------------------------------------------------------------
  async refreshSlotsForDate(date: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    // Patients cannot read other patients' appointment rows because of RLS, so
    // availability is read from a SECURITY DEFINER RPC that only exposes the
    // booked/free flag and a reference id.
    const { data, error } = await supabase.rpc('get_day_slot_availability', {
      p_date: date,
    });

    if (error) {
      console.warn('Could not load slot availability:', error.message);
      return;
    }

    const booked = new Map<string, { referenceId?: string }>();
    (
      data ?? []
    ).forEach(
      (row: {
        department_id: string;
        time_label: string;
        is_booked: boolean;
        appointment_reference: string | null;
      }) => {
        if (row.is_booked) {
          booked.set(`${row.department_id}::${row.time_label}`, {
            referenceId: row.appointment_reference ?? undefined,
          });
        }
      }
    );

    DEPARTMENTS.forEach((dept) => {
      const key = `${date}_${dept.id}`;
      slotsCache[key] = generateSlotsForDepartment(date, dept, booked);
    });
  },

  getAllSlotsMap(): Record<string, TimeSlot[]> {
    if (isSupabaseConfigured) return slotsCache;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_SLOTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    const initial = generateInitialSlots();
    this.saveSlotsMap(initial);
    return initial;
  },

  saveSlotsMap(slotsMap: Record<string, TimeSlot[]>): void {
    if (isSupabaseConfigured) return;

    try {
      localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(slotsMap));
      window.dispatchEvent(new Event('aether_slots_updated'));
    } catch {
      // ignore
    }
  },

  getSlotsForDepartmentAndDate(date: string, departmentId: DepartmentId): TimeSlot[] {
    if (isSupabaseConfigured) {
      const key = `${date}_${departmentId}`;
      if (slotsCache[key]) return slotsCache[key];

      const dept = DEPARTMENTS.find((d) => d.id === departmentId);
      if (!dept) return [];
      slotsCache[key] = generateSlotsForDepartment(date, dept);
      return slotsCache[key];
    }

    const slotsMap = this.getAllSlotsMap();
    const key = `${date}_${departmentId}`;
    if (slotsMap[key]) {
      return slotsMap[key];
    }
    // Fallback generate if date wasn't in initial window
    const newSlots = TIME_TEMPLATES.map((tmpl, idx) => ({
      id: `${key}_${idx}`,
      time: tmpl.time,
      period: tmpl.period,
      departmentId,
      date,
      isBooked: false,
    }));
    slotsMap[key] = newSlots;
    this.saveSlotsMap(slotsMap);
    return newSlots;
  },

  getDepartmentStats(date: string): {
    departmentStats: DepartmentSlotStats[];
    totalSlots: number;
    totalBooked: number;
    totalAvailable: number;
    departmentsWithAvailability: number;
  } {
    let totalSlots = 0;
    let totalBooked = 0;
    let totalAvailable = 0;
    let departmentsWithAvailability = 0;

    const departmentStats: DepartmentSlotStats[] = DEPARTMENTS.map((dept) => {
      const slots = this.getSlotsForDepartmentAndDate(date, dept.id);

      const deptTotal = slots.length;
      const deptBooked = slots.filter((s) => s.isBooked).length;
      const deptAvailable = deptTotal - deptBooked;

      totalSlots += deptTotal;
      totalBooked += deptBooked;
      totalAvailable += deptAvailable;

      if (deptAvailable > 0) {
        departmentsWithAvailability++;
      }

      let status: 'Available' | 'Limited' | 'Fully Booked' = 'Available';
      if (deptAvailable === 0) {
        status = 'Fully Booked';
      } else if (deptAvailable <= 4) {
        status = 'Limited';
      }

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        totalSlots: deptTotal,
        bookedSlots: deptBooked,
        availableSlots: deptAvailable,
        status,
      };
    });

    return {
      departmentStats,
      totalSlots,
      totalBooked,
      totalAvailable,
      departmentsWithAvailability,
    };
  },

  // --------------------------------------------------------------------------
  // Bookings
  // --------------------------------------------------------------------------
  getLocalBookings(): AppointmentBooking[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  },

  saveBookings(bookings: AppointmentBooking[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  },

  async getBookings(): Promise<AppointmentBooking[]> {
    if (!isSupabaseConfigured || !supabase) {
      return this.getLocalBookings();
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', user.id)
      .order('appointment_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not load appointments:', error.message);
      return [];
    }

    return (data ?? []).map((row: AppointmentRow) => mapAppointmentRow(row));
  },

  async bookAppointment(data: {
    patientName: string;
    patientAge: number;
    mobileNumber: string;
    email?: string;
    departmentId: DepartmentId;
    doctorId?: string;
    date: string;
    time: string;
    reason: string;
  }): Promise<{ success: boolean; booking?: AppointmentBooking; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return this.bookAppointmentLocal(data);
    }

    const { data: result, error } = await supabase.rpc('book_appointment', {
      p_department_id: data.departmentId,
      p_doctor_id: data.doctorId || null,
      p_date: data.date,
      p_time: data.time,
      p_patient_name: data.patientName.trim(),
      p_patient_age: Number(data.patientAge),
      p_patient_phone: data.mobileNumber.trim(),
      p_patient_email: data.email?.trim() || null,
      p_reason: data.reason.trim(),
    });

    if (error) {
      return { success: false, error: mapRpcError(error.message) };
    }

    const row = (Array.isArray(result) ? result[0] : result) as AppointmentRow;
    await this.refreshSlotsForDate(data.date);
    window.dispatchEvent(new Event('aether_appointments_updated'));

    return { success: true, booking: mapAppointmentRow(row) };
  },

  bookAppointmentLocal(data: {
    patientName: string;
    patientAge: number;
    mobileNumber: string;
    email?: string;
    departmentId: DepartmentId;
    doctorId?: string;
    date: string;
    time: string;
    reason: string;
  }): { success: boolean; booking?: AppointmentBooking; error?: string } {
    const slotsMap = this.getAllSlotsMap();
    const key = `${data.date}_${data.departmentId}`;
    const slots = slotsMap[key] || this.getSlotsForDepartmentAndDate(data.date, data.departmentId);

    const slotIndex = slots.findIndex((s) => s.time === data.time);
    if (slotIndex === -1) {
      return { success: false, error: 'Selected time slot does not exist.' };
    }

    if (slots[slotIndex].isBooked) {
      return { success: false, error: 'This appointment slot has just been reserved. Please select another time.' };
    }

    // Generate unique reference number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `AET-2026-${randomSuffix}`;

    const dept = this.getDepartment(data.departmentId);
    const doc = data.doctorId ? dept?.doctors.find((d) => d.id === data.doctorId) : undefined;

    const newBooking: AppointmentBooking = {
      referenceId,
      patientName: data.patientName.trim(),
      patientAge: Number(data.patientAge),
      mobileNumber: data.mobileNumber.trim(),
      email: data.email?.trim() || undefined,
      departmentId: data.departmentId,
      departmentName: dept ? dept.name : data.departmentId,
      doctorId: data.doctorId,
      doctorName: doc ? doc.name : (dept?.doctors[0]?.name || 'Attending Physician'),
      date: data.date,
      time: data.time,
      reason: data.reason.trim(),
      bookedAt: new Date().toISOString(),
      status: 'confirmed',
    };

    // Mark slot as booked
    slots[slotIndex].isBooked = true;
    slots[slotIndex].bookedByRef = referenceId;
    slotsMap[key] = slots;
    this.saveSlotsMap(slotsMap);

    // Save booking
    const bookings = this.getLocalBookings();
    bookings.unshift(newBooking);
    this.saveBookings(bookings);

    return { success: true, booking: newBooking };
  },

  async cancelBooking(referenceId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      return this.cancelBookingLocal(referenceId);
    }

    const { data, error } = await supabase.rpc('cancel_my_appointment', {
      p_reference: referenceId,
    });

    if (error) {
      console.warn('Could not cancel appointment:', error.message);
      return false;
    }

    window.dispatchEvent(new Event('aether_appointments_updated'));
    return Boolean(data);
  },

  cancelBookingLocal(referenceId: string): boolean {
    const bookings = this.getLocalBookings();
    const booking = bookings.find((b) => b.referenceId === referenceId);
    if (!booking) return false;

    booking.status = 'cancelled';
    this.saveBookings(bookings);

    // Free the slot
    const slotsMap = this.getAllSlotsMap();
    const key = `${booking.date}_${booking.departmentId}`;
    if (slotsMap[key]) {
      const slot = slotsMap[key].find((s) => s.time === booking.time);
      if (slot) {
        slot.isBooked = false;
        slot.bookedByRef = undefined;
        this.saveSlotsMap(slotsMap);
      }
    }

    return true;
  },

  // --------------------------------------------------------------------------
  // Doctor portal
  // --------------------------------------------------------------------------
  async getDoctorAppointments(doctorId?: string): Promise<DoctorAppointment[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    let query = supabase
      .from('appointments')
      .select(
        '*, patient:profiles!appointments_patient_id_fkey(full_name, phone_number, phone_country_code, age, gender, blood_group, email)'
      )
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Could not load doctor appointments:', error.message);
      return [];
    }

    return (data ?? []).map((row: AppointmentRow) => {
      const base = mapAppointmentRow(row);
      return {
        ...base,
        patientName: base.patientName || row.patient?.full_name || 'Patient',
        mobileNumber: base.mobileNumber || row.patient?.phone_number || '',
        email: base.email || row.patient?.email || undefined,
        patientGender: row.patient?.gender,
        patientBloodGroup: row.patient?.blood_group,
        createdAt: row.created_at,
        doctorId: row.doctor_id ?? undefined,
      };
    });
  },

  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
    notes?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase.rpc('update_appointment_status', {
      p_id: id,
      p_status: status,
      p_notes: notes || null,
    });

    if (error) {
      console.warn('Could not update appointment:', error.message);
      return false;
    }

    window.dispatchEvent(new Event('aether_appointments_updated'));
    return true;
  },

  resetDemoData(): void {
    if (isSupabaseConfigured) return;
    const initial = generateInitialSlots();
    this.saveSlotsMap(initial);
    this.saveBookings([]);
  },
};
