export type UserRole = 
  | 'patient' 
  | 'doctor' 
  | 'secretary' 
  | 'reception' 
  | 'clinic_manager' 
  | 'admin' 
  | 'super_admin'
  | 'nurse'
  | 'finance'
  | 'hr'
  | 'content_manager'
  | 'branch_manager';

export type AppPermission =
  // Portal Access Permissions
  | 'patient.portal.access'
  | 'doctor.portal.access'
  | 'secretary.portal.access'
  | 'clinic.portal.access'
  | 'super_admin.portal.access'
  | 'system.admin'
  // Appointments
  | 'appointments.read'
  | 'appointments.create'
  | 'appointments.update'
  | 'appointments.cancel'
  // Patients & Clinical Records
  | 'patients.read_basic'
  | 'patients.read_clinical'
  | 'medical_records.read'
  | 'medical_records.write'
  // Tasks
  | 'tasks.read'
  | 'tasks.create'
  | 'tasks.complete'
  // Clinic Operations & Management
  | 'clinic.analytics.read'
  | 'doctor.website.manage'
  | 'automation.manage'
  | 'staff.manage'
  | 'notifications.manage';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  nationalId?: string;
  email?: string;
  birthDate?: string;
  birthYear?: number;
  doctorId?: string;
  tenantId?: string;
  clinicId?: string;
  branchId?: string;
  permissions?: AppPermission[];
}

export type DoctorWebsiteTheme = 
  | 'clinical-minimal' 
  | 'modern-specialist' 
  | 'warm-care' 
  | 'tech-innovative';

export interface DoctorAchievement {
  id: string;
  title: string;
  year?: string;
  issuer?: string;
  description?: string;
  category: 'award' | 'certification' | 'membership' | 'academic' | 'conference';
}

export interface DoctorOffice {
  id: string;
  title: string;
  city: string;
  address: string;
  phone: string;
  coordinates?: { lat: number; lng: number };
  workingHours: string;
  appointmentEnabled?: boolean;
  inPersonEnabled?: boolean;
  isPrimary?: boolean;
  note?: string;
  clinicId?: string;
  branchId?: string;
}

export interface DoctorFAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface DoctorGalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  category?: string;
}

export interface DoctorSocialLinks {
  instagram?: string;
  linkedin?: string;
  telegram?: string;
  whatsapp?: string;
  website?: string;
  youtube?: string;
  aparat?: string;
}

export interface DoctorServiceMeta {
  id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  bookingEnabled?: boolean;
  price?: number;
  featured?: boolean;
  relatedServiceId?: string;
}

export type DetailedService = DoctorServiceMeta;

export type DoctorWebsiteStatus = 'disabled' | 'draft' | 'published' | 'suspended';

export interface DoctorWebsiteConfig {
  websiteStatus?: DoctorWebsiteStatus;
  websiteEnabled: boolean;
  websitePublished: boolean;
  websiteTheme: DoctorWebsiteTheme;
  brandPrimaryColor?: string;
  brandAccentColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  logo?: string;
  coverImage?: string;
  shortIntroduction?: string;
  detailedBiography?: string;
  achievements?: DoctorAchievement[];
  certifications?: string[];
  memberships?: string[];
  researchInterests?: string[];
  gallery?: DoctorGalleryItem[];
  faqs?: DoctorFAQ[];
  socialLinks?: DoctorSocialLinks;
  phone?: string;
  whatsapp?: string;
  email?: string;
  websiteSubdomain?: string;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
  offices?: DoctorOffice[];
  featuredServices?: DoctorServiceMeta[];
  featuredArticleIds?: string[];
  sectionVisibility?: {
    about?: boolean;
    services?: boolean;
    achievements?: boolean;
    articles?: boolean;
    gallery?: boolean;
    faq?: boolean;
    reviews?: boolean;
    offices?: boolean;
  };
}

export interface Specialty {
  id: string;
  slug: string;
  name: string; // e.g. متخصص قلب و عروق
  englishName: string;
  icon: string; // Lucide icon name
  doctorCount: number;
  description: string;
  popularSymptoms: string[];
}

export interface Doctor {
  id: string;
  slug: string;
  name: string;
  title: string; // e.g. فوق تخصص آنژیوپلاستی
  medicalCouncilNumber: string; // نظام پزشکی
  specialtyId: string;
  specialtyName: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  city: string;
  address: string;
  bio: string;
  education: string[];
  services: string[];
  supportedInsurances: string[];
  languages: string[];
  consultationFee: number; // Toman
  onlineConsultationFee?: number;
  hasOnlineConsultation: boolean;
  nextAvailableSlot: string; // e.g. امروز ۱۷:۳۰
  gender: 'male' | 'female';
  websiteSubdomain?: string;
  websiteConfig?: DoctorWebsiteConfig;
  offices?: DoctorOffice[];
  detailedServices?: DoctorServiceMeta[];
  achievements?: DoctorAchievement[];
  faqs?: DoctorFAQ[];
  gallery?: DoctorGalleryItem[];
  clinicName?: string;
  clinicId?: string;
  branchId?: string;
  roomNumber?: string;
}

export type AppointmentStatus = 
  | 'scheduled'
  | 'arrived'
  | 'in_visit'
  | 'completed'
  | 'canceled'
  | 'no_show';

export type VisitType = 'in_person' | 'online_video' | 'online_chat';

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  clinicId?: string;
  branchId?: string;
  officeId?: string;
  officeTitle?: string;
  dayOfWeek: number; // 0=Saturday (شنبه), 1=Sunday (یکشنبه), 2=Monday (دوشنبه), 3=Tuesday (سه‌شنبه), 4=Wednesday (چهارشنبه), 5=Thursday (پنج‌شنبه), 6=Friday (جمعه)
  startTime: string; // "HH:MM" 24h format, e.g. "09:00", "16:00"
  endTime: string;   // "HH:MM" 24h format, e.g. "13:00", "20:30"
  visitDurationMinutes: number; // e.g. 20, 30
  slotIntervalMinutes: number;  // e.g. 20, 30
  visitTypes: VisitType[];      // ['in_person'], ['online_video'], etc.
  active: boolean;
  maxPatientsPerSlot?: number;
  note?: string;
}

export type ScheduleBlockReasonType = 
  | 'leave' 
  | 'closed_office' 
  | 'manual_block' 
  | 'break' 
  | 'unavailable_date' 
  | 'holiday';

export interface ScheduleBlock {
  id: string;
  doctorId?: string; // If undefined, applies to entire clinic/office
  clinicId?: string;
  branchId?: string;
  officeId?: string; // If specified, blocks only this office
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD (inclusive), defaults to startDate
  startTime?: string; // "HH:MM" optional for partial day block
  endTime?: string;   // "HH:MM" optional for partial day block
  reasonType: ScheduleBlockReasonType;
  reasonDescription?: string;
  active: boolean;
  createdAt?: string;
}

export interface TimeSlotInfo {
  timeSlot: string; // "17:30"
  persianTimeSlot: string; // "۱۷:۳۰"
  durationMinutes: number;
  visitType: VisitType;
  officeId?: string;
  officeTitle?: string;
  branchId?: string;
  isAvailable: boolean;
  unavailableReason?: 'booked' | 'blocked' | 'passed' | 'leave' | 'closed';
  scheduleId?: string;
}

export type BookingConflictReason = 
  | 'SLOT_ALREADY_BOOKED' 
  | 'SCHEDULE_BLOCKED' 
  | 'DOCTOR_ON_LEAVE' 
  | 'OFFICE_CLOSED' 
  | 'OUTSIDE_WORKING_HOURS' 
  | 'PAST_TIME_SLOT'
  | 'INVALID_DATE'
  | 'DOCTOR_INACTIVE';

export interface BookingValidationResult {
  success: boolean;
  reason?: BookingConflictReason;
  message?: string;
  conflictingAppointmentId?: string;
}

export interface EarliestSlotInfo {
  label: string; // e.g. "امروز ساعت ۱۷:۳۰" or "فردا ساعت ۱۰:۰۰" or "شنبه ۲۵ مرداد ساعت ۱۶:۰۰"
  date?: string;
  timeSlot?: string;
  persianDateFormatted?: string;
  officeId?: string;
  officeTitle?: string;
  visitType?: VisitType;
  isToday: boolean;
  hasSlot: boolean;
}

export interface Appointment {
  id: string;
  trackingCode: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  patientId: string;
  patientName: string;
  familyMemberName?: string;
  familyRelation?: 'self' | 'mother' | 'father' | 'child' | 'spouse';
  patientPhone: string;
  patientAge?: number;
  visitType: VisitType;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. 17:30
  status: AppointmentStatus;
  confirmationStatus?: 'pending' | 'confirmed' | 'declined';
  confirmedAt?: string;
  confirmedByUserId?: string;
  confirmedByName?: string;
  clinicAddress: string;
  clinicId?: string;
  branchId?: string;
  officeId?: string;
  tenantId?: string;
  symptomsNote?: string;
  fee: number;
  paidStatus: 'paid' | 'pending' | 'refunded';
  paymentMode?: 'demo' | 'simulated' | 'gateway' | 'cash';
  paymentStatus?: 'simulated' | 'pending' | 'completed' | 'failed';
  queuePosition?: number;
  estimatedWaitMinutes?: number;
  createdAt: string;
  arrivedAt?: string;
  visitStartedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  waitingDurationMinutes?: number;
  consultationDurationMinutes?: number;
}

export interface SymptomGuide {
  id: string;
  symptom: string; // e.g. معده درد
  suggestedSpecialtyId: string;
  suggestedSpecialtyName: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  emergencyWarning?: string;
  commonCauses: string[];
  recommendedDoctors: string[]; // doctor ids
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  title: string;
  type: 'visit' | 'diagnosis' | 'prescription' | 'lab' | 'imaging' | 'procedure' | 'followup';
  doctorName: string;
  doctorSpecialty: string;
  summary: string;
  details?: string;
  attachments?: { name: string; url: string; type: string }[];
  medications?: { name: string; dosage: string; frequency: string; duration: string }[];
  vitalSigns?: { bp?: string; hr?: number; temp?: number; weight?: number };
}

export interface FamilyMember {
  id: string;
  patientId: string;
  name: string;
  relation: 'mother' | 'father' | 'child' | 'spouse';
  nationalId: string;
  birthYear: number;
  gender: 'male' | 'female';
  allergies?: string[];
  chronicDiseases?: string[];
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  price: number;
  durationMinutes: number;
  prerequisites?: string[];
  popular: boolean;
}

export interface Review {
  id: string;
  doctorId: string;
  patientName: string;
  date: string;
  rating: number;
  comment: string;
  doctorBehaviorRating: number;
  waitTimeRating: number;
  explanationRating: number;
  treatmentRating: number;
}

export interface HealthArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  authorDoctorId?: string;
  authorDoctorName: string;
  reviewerDoctorName: string;
  readTimeMinutes: number;
  updatedAt: string;
  coverImage: string;
  tags: string[];
}

export interface DiseaseCondition {
  id: string;
  slug: string;
  title: string;
  persianTitle: string;
  overview: string;
  symptoms: string[];
  causes: string[];
  diagnosisMethods: string[];
  treatments: string[];
  whenToSeeDoctor: string;
  relatedSpecialties: string[];
}

export interface PatientCRMRecord {
  patientId: string;
  name: string;
  phone: string;
  status: 'new' | 'active' | 'followup_needed' | 'vip';
  lifetimeVisits: number;
  totalSpent: number;
  lastVisitDate: string;
  nextFollowUpDate?: string;
  tags: string[];
}

export interface AdminKPIs {
  todayPatients: number;
  todayRevenue: number;
  todayAppointments: number;
  noShowRatePercent: number;
  avgWaitTimeMinutes: number;
  patientSatisfactionPercent: number;
  activeDoctorsCount: number;
}

export interface ClinicBranch {
  id: string;
  clinicId?: string;
  name: string;
  code: string;
  city: string;
  district?: string;
  address: string;
  floorAndUnit?: string;
  phone: string;
  emergencyPhone?: string;
  isMain: boolean;
  coordinates?: { lat: number; lng: number };
  image?: string;
  departments?: string[];
  facilities?: string[];
  metroAccess?: string;
  busAccess?: string;
  parkingInfo?: string;
  isOpenNow?: boolean;
  workingHours?: string;
  todayPresentDoctorsCount?: number;
  currentQueueWaitMinutes?: number;
  inPersonBookingEnabled?: boolean;
  note?: string;
  supportedInsurances?: string[];
}

export interface Clinic {
  id: string;
  name: string;
  legalName: string;
  code: string;
  slug: string;
  phone: string;
  supportPhone: string;
  emergencyPhone?: string;
  city: string;
  address: string;
  departments: string[];
  branches: ClinicBranch[];
  operatingHours: string;
  settings?: {
    defaultAppointmentDuration: number;
    autoReminderHours: number;
    allowOnlineCancellation: boolean;
    maxQueueWaitWarningMinutes: number;
  };
}

export interface ClinicStaff {
  id: string;
  userId: string;
  name: string;
  role: 'secretary' | 'reception' | 'nurse' | 'clinic_manager' | 'doctor' | 'admin';
  roleTitle: string;
  avatar: string;
  phone: string;
  email?: string;
  clinicId: string;
  branchId?: string;
  status: 'active' | 'on_leave' | 'busy' | 'offline';
  shift: 'morning' | 'evening' | 'night' | 'full';
  assignedDoctorIds?: string[];
  activeTasksCount: number;
}

export type TaskType = 
  | 'call_patient'
  | 'confirm_appointment'
  | 'payment_followup'
  | 'document_collection'
  | 'result_followup'
  | 'reschedule'
  | 'no_show_followup'
  | 'prepare_record'
  | 'visit_reminder'
  | 'patient_inquiry'
  | 'doctor_request'
  | 'general';

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

export interface ClinicTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  clinicId: string;
  branchId?: string;
  assignedTo: string;
  assignedToName: string;
  assignedRole?: UserRole;
  createdBy: string;
  createdByName: string;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  doctorId?: string;
  doctorName?: string;
  appointmentId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
  actionPayload?: {
    suggestedAction?: 'call' | 'sms' | 'reschedule' | 'cancel' | 'view_record';
    targetPhone?: string;
    templateKey?: string;
  };
}

export interface ActivityLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  clinicId?: string;
  action: string;
  entityType: 'appointment' | 'task' | 'patient' | 'doctor' | 'website' | 'automation' | 'notification' | 'clinic';
  entityId: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ClinicAutomationRule {
  id: string;
  clinicId?: string;
  title: string;
  description: string;
  trigger: string;
  action: string;
  category: 'reminder' | 'task_generation' | 'followup' | 'quality';
  enabled: boolean;
  lastRun?: string;
  runCount: number;
}

export interface DoctorClinicMembership {
  id: string;
  doctorId: string;
  clinicId: string;
  branchId?: string;
  officeId?: string;
  roleTitle?: string;
  active: boolean;
  isPrimary: boolean;
  roomNumber?: string;
  consultationDays?: string[];
}

export interface ClinicNotification {
  id: string;
  recipientPhone?: string;
  recipientUserId?: string;
  recipientName?: string;
  type: 'sms' | 'in_app' | 'email';
  templateKey: 'appointment_confirmation' | 'appointment_reminder' | 'rescheduled' | 'follow_up' | 'survey' | 'task_alert';
  title: string;
  message: string;
  status: 'sent' | 'pending' | 'failed' | 'simulated';
  deliveryMode?: 'prototype' | 'simulated' | 'provider';
  sentAt: string;
}

export type AIActionTypeKey =
  | 'confirm_appointment'
  | 'decline_appointment'
  | 'mark_arrived'
  | 'create_task'
  | 'complete_task'
  | 'send_prototype_reminder'
  | 'prepare_reminder'
  | 'reschedule_appointment'
  | 'filter_urgent'
  | 'filter_queue';

export interface AIActionRequest {
  id: string;
  actionKey: AIActionTypeKey;
  level: 1 | 2 | 3;
  title: string;
  description: string;
  parameters: Record<string, any>;
  requiresConfirmation: boolean;
}

export interface AIActionExecutionResult {
  success: boolean;
  message: string;
  affectedEntityId?: string;
  timestamp: string;
}

export interface DoctorAiClinicalSummaryResponse {
  summary: string;
  alerts: string[];
  suggestedFocus: string[];
  missingInformation: string[];
}

export interface PatientAiIntentResponse {
  reply: string;
  intent: 'find_doctor' | 'find_specialty' | 'booking_help' | 'patient_appointments' | 'general_info' | 'emergency';
  specialtyId?: string | null;
  doctorId?: string | null;
  urgency?: 'routine' | 'urgent' | 'emergency';
  emergency?: boolean;
}

export interface PatientPageContext {
  pageType: 'doctor' | 'doctor_site' | 'appointment' | 'patient_portal' | 'doctors_directory' | 'specialties' | 'services' | 'health_article' | 'home' | 'other';
  route: string;
  doctorId?: string;
  doctorSlug?: string;
  doctorName?: string;
  specialtySlug?: string;
  appointmentId?: string;
}

export interface ClinicAiActionSuggestion {
  actionKey: AIActionTypeKey;
  label: string;
  requiresConfirmation: boolean;
  parameters?: Record<string, any>;
}

export interface ClinicAiAdvisorResponse {
  message: string;
  suggestedActions?: ClinicAiActionSuggestion[];
}

export type InsuranceType = 'basic' | 'supplementary' | 'specialized';

export interface InsuranceCompany {
  id: string;
  name: string;
  type: InsuranceType;
  shortDescription: string;
  coverageCoPayPercent: number; // مثلا ۷۰ یعنی ۷۰٪ هزینه توسط بیمه پوشش داده می‌شود
  hasDirectOnlineClaim: boolean; // معرفی‌نامه آنلاین بدون نیاز به برگه فیزیکی
  electronicRxSupported: boolean; // استعلام با کد ملی و نسخه الکترونیک
  popular?: boolean;
  notes?: string;
  acceptedServicesCount?: number;
  acceptedDoctorsCount?: number;
}

export interface InsuranceCoverageCalculationResult {
  baseFee: number;
  basicInsuranceDiscount: number;
  supplementaryInsuranceDiscount: number;
  totalDiscount: number;
  patientPayable: number;
  appliedBasicInsurance?: string;
  appliedSupplementaryInsurance?: string;
  directClaimSupported: boolean;
  ePrescriptionSupported: boolean;
  savingsPercentage: number;
}

export interface PendingBookingIntent {
  id: string;
  doctorId: string;
  doctorSlug?: string;
  doctorName?: string;
  clinicId?: string;
  branchId?: string;
  officeId?: string;
  officeTitle?: string; // Optional display data only, NOT identity
  visitType: VisitType;
  selectedDate: string;
  selectedTime?: string;
  selectedTimeSlot?: string;
  symptomsNote?: string;
  patientTarget?: string;
  familyMemberId?: string;
  returnUrl: string;
  step?: number;
  createdAt: number;
  timestamp?: number;
}

export interface ClinicBrandingRequest {
  id: string;
  clinicName: string;
  contactPerson: string;
  phone: string;
  specialtyType: string;
  city: string;
  doctorCount: number;
  selectedServices: string[];
  currentChallenges?: string;
  budgetRange?: string;
  trackingCode: string;
  createdAt: string;
  status: 'pending' | 'in_review' | 'contacted' | 'contracted';
}

export interface ClinicBrandingPillar {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  tag: string;
  deliverables: string[];
  kpiBenefit: string;
}

