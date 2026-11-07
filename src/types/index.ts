export type DepartmentId =
  | 'general-medicine'
  | 'cardiology'
  | 'neurology'
  | 'orthopedics'
  | 'pediatrics'
  | 'dermatology';

export type PageTab = 'home' | 'book' | 'slots' | 'triage' | 'doctor';

export type UserRole = 'patient' | 'doctor' | 'admin';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Doctor {
  id: string;
  name: string;
  departmentId: DepartmentId;
  specialty: string;
  qualification: string;
}

export interface Department {
  id: DepartmentId;
  name: string;
  iconName: string;
  shortDescription: string;
  fullDescription: string;
  location: string;
  doctors: Doctor[];
  contactExt: string;
}

export type TimePeriod = 'morning' | 'afternoon' | 'evening';

export interface TimeSlot {
  id: string;
  time: string;
  period: TimePeriod;
  departmentId: DepartmentId;
  doctorId?: string;
  date: string; // YYYY-MM-DD
  isBooked: boolean;
  bookedByRef?: string;
}

export interface AppointmentBooking {
  id?: string;
  referenceId: string;
  patientId?: string;
  patientName: string;
  patientAge: number;
  mobileNumber: string;
  email?: string;
  departmentId: DepartmentId;
  departmentName: string;
  doctorId?: string;
  doctorName?: string;
  date: string;
  time: string;
  reason: string;
  bookedAt: string;
  status: AppointmentStatus;
  doctorNotes?: string;
}

export interface DoctorAppointment extends AppointmentBooking {
  patientGender?: string;
  patientBloodGroup?: string;
  createdAt?: string;
}

export interface DepartmentSlotStats {
  departmentId: DepartmentId;
  departmentName: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  status: 'Available' | 'Limited' | 'Fully Booked';
}

export interface TriageInput {
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  duration: string;
  severity: number; // 1 - 10
  symptoms: string[];
  medicalHistory: string[];
}

export interface TriageAssessment {
  urgency: 'emergency' | 'urgent' | 'routine' | 'self-care';
  isEmergency: boolean;
  urgencyLabel: string;
  severityScore: number;
  recommendedDepartmentId: DepartmentId;
  recommendedDepartmentName: string;
  summary: string;
  clinicalObservations: string[];
  nextSteps: string[];
  preparationQuestions: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  age?: number;
  gender?: string;
  role: UserRole;
  avatarInitials: string;
  avatarGradient: string;
  bloodGroup?: string;
  emergencyContact?: string;
  joinedDate: string;
  /** Only set when role === 'doctor' */
  doctorId?: string;
  departmentId?: DepartmentId;
  specialty?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  appointmentId?: string;
  type:
    | 'appointment_created'
    | 'appointment_confirmed'
    | 'appointment_completed'
    | 'appointment_cancelled'
    | 'appointment_reminder'
    | 'general';
  channel: 'in_app' | 'sms' | 'email';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export type AuthModalMode = 'signin' | 'signup' | null;
