import {
  Doctor,
  Specialty,
  ServiceItem,
  SymptomGuide,
  Appointment,
  VisitType,
  MedicalRecord,
  FamilyMember,
  Review,
  HealthArticle,
  DiseaseCondition,
  PatientCRMRecord,
  AdminKPIs,
  User,
  UserRole,
  AppointmentStatus,
  DoctorWebsiteConfig,
  DoctorWebsiteStatus,
  Clinic,
  ClinicBranch,
  ClinicStaff,
  ClinicTask,
  ActivityLog,
  ClinicAutomationRule,
  ClinicNotification,
  DoctorClinicMembership,
  InsuranceCompany,
  InsuranceCoverageCalculationResult,
  DoctorSchedule,
  ScheduleBlock,
  TimeSlotInfo,
  BookingValidationResult,
  EarliestSlotInfo,
  TaskStatus,
  TaskPriority,
  TaskType,
  ClinicBrandingRequest
} from '../types';
import { appointmentAvailabilityService } from './appointmentAvailabilityService';
import { queueService } from './queueService';
import {
  calculateDemoCoverage,
  matchesDoctorInsuranceSelection,
  matchesBranchInsuranceSelection,
  resolveInsuranceCompany,
  supportsInsurance
} from './insuranceCoverageEngine';
import { formatStandardIranianMobile } from '../utils/validationUtils';

export function generateAppointmentTrackingCode(existingAppointments: Appointment[]): string {
  const existingCodes = new Set(existingAppointments.map(a => a.trackingCode));
  let nextNum = 88200;
  for (const app of existingAppointments) {
    if (app.trackingCode) {
      if (app.trackingCode.startsWith('HC-') || app.trackingCode.startsWith('SYN-')) {
        const numPart = parseInt(app.trackingCode.replace(/\D/g, ''), 10);
        if (!isNaN(numPart) && numPart > nextNum && numPart < 999999) {
          nextNum = numPart;
        }
      }
    }
  }
  let counter = nextNum + 1;
  let candidate = `HC-${counter}`;
  while (existingCodes.has(candidate)) {
    counter++;
    candidate = `HC-${counter}`;
  }
  return candidate;
}

import {
  SPECIALTIES,
  MOCK_DOCTORS,
  SYMPTOM_GUIDES,
  CLINIC_SERVICES,
  MOCK_APPOINTMENTS,
  MOCK_MEDICAL_RECORDS,
  MOCK_FAMILY_MEMBERS,
  MOCK_REVIEWS,
  MOCK_ARTICLES,
  MOCK_DISEASES,
  MOCK_CRM_RECORDS,
  MOCK_ADMIN_KPIS,
  INITIAL_USERS,
  MOCK_CLINIC,
  MOCK_CLINIC_STAFF,
  MOCK_CLINIC_TASKS,
  MOCK_ACTIVITY_LOGS,
  MOCK_AUTOMATION_RULES,
  MOCK_NOTIFICATIONS,
  MOCK_DOCTOR_CLINIC_MEMBERSHIPS,
  MOCK_INSURANCES
} from '../data/mockData';

import {
  isAppointmentToday,
  isDateToday,
  calculateWaitTimeMinutes,
  calculateConsultationDurationMinutes,
  getRelativeISODate
} from '../utils/dateUtils';
import { canTransitionAppointment } from '../utils/appointmentUtils';

// Helper to simulate async network latency
const delay = (ms: number = 40) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  APPOINTMENTS: 'synapse_appointments_v4',
  FAMILY_MEMBERS: 'synapse_family_v4',
  REVIEWS: 'synapse_reviews_v4',
  USER: 'synapse_current_user_v4',
  DOCTORS: 'synapse_doctors_v4',
  TASKS: 'synapse_tasks_v4',
  ACTIVITY_LOGS: 'synapse_activity_logs_v4',
  AUTOMATIONS: 'synapse_automation_rules_v4',
  NOTIFICATIONS: 'synapse_notifications_v4',
  CLINIC: 'synapse_clinic_v4',
  STAFF: 'synapse_staff_v4',
  MEMBERSHIPS: 'synapse_clinic_memberships_v4'
};

function migrateDataV3ToV4(): void {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      const v3Apps = localStorage.getItem('synapse_appointments_v3');
      const baseApps: Appointment[] = v3Apps ? JSON.parse(v3Apps) : MOCK_APPOINTMENTS;
      const normalizedApps = baseApps.map(a => ({
        ...a,
        clinicId: a.clinicId || 'clinic-1',
        branchId: a.branchId || 'branch-1',
        confirmationStatus: a.confirmationStatus || (a.status === 'completed' || a.status === 'in_visit' || a.status === 'arrived' ? 'confirmed' : 'pending')
      }));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(normalizedApps));
    }

    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      const v3Docs = localStorage.getItem('synapse_doctors_v3');
      const baseDocs: Doctor[] = v3Docs ? JSON.parse(v3Docs) : MOCK_DOCTORS;
      const normalizedDocs = baseDocs.map(d => ({
        ...d,
        clinicId: d.clinicId || 'clinic-1',
        branchId: d.branchId || 'branch-1',
        roomNumber: d.roomNumber || 'اتاق تعیین نشده'
      }));
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(normalizedDocs));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      const v3Tasks = localStorage.getItem('synapse_tasks_v3');
      const baseTasks: ClinicTask[] = v3Tasks ? JSON.parse(v3Tasks) : MOCK_CLINIC_TASKS;
      const normalizedTasks = baseTasks.map(t => ({
        ...t,
        clinicId: t.clinicId || 'clinic-1',
        branchId: t.branchId || 'branch-1'
      }));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(normalizedTasks));
    }

    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
      const v3Staff = localStorage.getItem('synapse_staff_v3');
      const baseStaff: ClinicStaff[] = v3Staff ? JSON.parse(v3Staff) : MOCK_CLINIC_STAFF;
      const normalizedStaff = baseStaff.map(s => ({
        ...s,
        clinicId: s.clinicId || 'clinic-1',
        branchId: s.branchId || 'branch-1'
      }));
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(normalizedStaff));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CLINIC)) {
      localStorage.setItem(STORAGE_KEYS.CLINIC, JSON.stringify(MOCK_CLINIC));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS)) {
      localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(MOCK_DOCTOR_CLINIC_MEMBERSHIPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(MOCK_ACTIVITY_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTOMATIONS)) {
      localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(MOCK_AUTOMATION_RULES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS)) {
      localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(MOCK_FAMILY_MEMBERS));
    }
  } catch (err) {
    console.error('Data migration error:', err);
  }
}

// Run initial migration
if (typeof window !== 'undefined') {
  migrateDataV3ToV4();
}

function notifyAppointmentsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('synapse_appointments_updated'));
  }
}

function notifyDoctorsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('synapse_doctors_updated'));
  }
}

function notifyTasksChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('synapse_tasks_updated'));
  }
}

function notifyActivityChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('synapse_activity_updated'));
  }
}

function getStoredDoctors(): Doctor[] {
  const local = localStorage.getItem(STORAGE_KEYS.DOCTORS);
  let storedList: Doctor[] = [];
  if (local) {
    try {
      storedList = JSON.parse(local);
      if (!Array.isArray(storedList)) storedList = [];
    } catch {
      storedList = [];
    }
  }

  // Merge stored list with MOCK_DOCTORS so that all current fields, slugs, and website configurations are guaranteed
  const merged: Doctor[] = MOCK_DOCTORS.map(mockDoc => {
    const existing = storedList.find(d => d.id === mockDoc.id || d.slug === mockDoc.slug);
    if (!existing) {
      const defaultStatus = mockDoc.websiteConfig?.websiteStatus || 
        (mockDoc.websiteConfig?.websitePublished === false ? 'draft' : 
         mockDoc.websiteConfig?.websiteEnabled === false ? 'disabled' : 'published');
      return {
        ...mockDoc,
        clinicId: mockDoc.clinicId || 'clinic-1',
        branchId: mockDoc.branchId || 'branch-1',
        roomNumber: mockDoc.roomNumber || 'اتاق تعیین نشده',
        websiteConfig: {
          websiteStatus: defaultStatus,
          websiteEnabled: defaultStatus === 'published' || defaultStatus === 'draft',
          websitePublished: defaultStatus === 'published',
          websiteTheme: 'modern-specialist',
          ...(mockDoc.websiteConfig || {})
        }
      };
    }
    const mergedStatus = existing.websiteConfig?.websiteStatus || mockDoc.websiteConfig?.websiteStatus || 
      (existing.websiteConfig?.websitePublished === false ? 'draft' : 
       existing.websiteConfig?.websiteEnabled === false ? 'disabled' : 'published');

    return {
      ...mockDoc,
      ...existing,
      slug: existing.slug || mockDoc.slug,
      clinicId: existing.clinicId || mockDoc.clinicId || 'clinic-1',
      branchId: existing.branchId || mockDoc.branchId || 'branch-1',
      roomNumber: existing.roomNumber || mockDoc.roomNumber || 'اتاق تعیین نشده',
      websiteConfig: {
        websiteTheme: 'modern-specialist',
        ...(mockDoc.websiteConfig || {}),
        ...(existing.websiteConfig || {}),
        websiteStatus: mergedStatus,
        websiteEnabled: mergedStatus === 'published' || mergedStatus === 'draft',
        websitePublished: mergedStatus === 'published',
        sectionVisibility: {
          ...(mockDoc.websiteConfig?.sectionVisibility || {}),
          ...(existing.websiteConfig?.sectionVisibility || {})
        }
      },
      detailedServices: (existing.detailedServices && existing.detailedServices.length > 0) ? existing.detailedServices : mockDoc.detailedServices,
      offices: (existing.offices && existing.offices.length > 0) ? existing.offices : mockDoc.offices,
      achievements: (existing.achievements && existing.achievements.length > 0) ? existing.achievements : mockDoc.achievements,
      faqs: (existing.faqs && existing.faqs.length > 0) ? existing.faqs : mockDoc.faqs,
      gallery: (existing.gallery && existing.gallery.length > 0) ? existing.gallery : mockDoc.gallery
    };
  });

  // Preserve any additional custom doctors created dynamically
  storedList.forEach(storedDoc => {
    if (!merged.some(m => m.id === storedDoc.id)) {
      merged.push({
        ...storedDoc,
        slug: storedDoc.slug || `dr-${storedDoc.id}`
      });
    }
  });

  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(merged));
  return merged;
}

function saveDoctors(doctors: Doctor[]): void {
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  notifyDoctorsChanged();
}

function getStoredAppointments(): Appointment[] {
  const local = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  if (local) {
    try {
      const parsed: Appointment[] = JSON.parse(local);
      return parsed.map(a => ({
        ...a,
        clinicId: a.clinicId || 'clinic-1',
        branchId: a.branchId || 'branch-1',
        confirmationStatus: a.confirmationStatus || (a.status === 'completed' || a.status === 'in_visit' || a.status === 'arrived' ? 'confirmed' : 'pending')
      }));
    } catch {
      // fallback
    }
  }
  const initial = MOCK_APPOINTMENTS.map(a => ({
    ...a,
    clinicId: a.clinicId || 'clinic-1',
    branchId: a.branchId || 'branch-1',
    confirmationStatus: a.confirmationStatus || 'pending'
  }));
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(initial));
  return initial;
}

function saveAppointments(appointments: Appointment[]): void {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  notifyAppointmentsChanged();
}

function getStoredTasks(): ClinicTask[] {
  const local = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (local) {
    try {
      const parsed: ClinicTask[] = JSON.parse(local);
      return parsed.map(t => ({
        ...t,
        clinicId: t.clinicId || 'clinic-1',
        branchId: t.branchId || 'branch-1'
      }));
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(MOCK_CLINIC_TASKS));
  return MOCK_CLINIC_TASKS;
}

function saveTasks(tasks: ClinicTask[]): void {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  notifyTasksChanged();
}

function getStoredActivityLogs(): ActivityLog[] {
  const local = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(MOCK_ACTIVITY_LOGS));
  return MOCK_ACTIVITY_LOGS;
}

function saveActivityLogs(logs: ActivityLog[]): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  notifyActivityChanged();
}

function getStoredAutomationRules(): ClinicAutomationRule[] {
  const local = localStorage.getItem(STORAGE_KEYS.AUTOMATIONS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(MOCK_AUTOMATION_RULES));
  return MOCK_AUTOMATION_RULES;
}

function saveAutomationRules(rules: ClinicAutomationRule[]): void {
  localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(rules));
}

function getStoredNotifications(): ClinicNotification[] {
  const local = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
  return MOCK_NOTIFICATIONS;
}

function saveNotifications(notifications: ClinicNotification[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function getStoredClinic(): Clinic {
  const local = localStorage.getItem(STORAGE_KEYS.CLINIC);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      return {
        ...MOCK_CLINIC,
        ...parsed,
        branches: MOCK_CLINIC.branches // ensure latest rich branches are always preserved
      };
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.CLINIC, JSON.stringify(MOCK_CLINIC));
  return MOCK_CLINIC;
}

function getStoredClinicStaff(): ClinicStaff[] {
  const local = localStorage.getItem(STORAGE_KEYS.STAFF);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(MOCK_CLINIC_STAFF));
  return MOCK_CLINIC_STAFF;
}

function getStoredMemberships(): DoctorClinicMembership[] {
  const local = localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(MOCK_DOCTOR_CLINIC_MEMBERSHIPS));
  return MOCK_DOCTOR_CLINIC_MEMBERSHIPS;
}

function getStoredFamilyMembers(): FamilyMember[] {
  const local = localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(MOCK_FAMILY_MEMBERS));
  return MOCK_FAMILY_MEMBERS;
}

function saveFamilyMembers(members: FamilyMember[]): void {
  localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
}

export const apiService = {
  // Authentication / User
  async getCurrentUser(): Promise<User | null> {
    await delay(30);
    const storedAuth = localStorage.getItem('synapse_auth_logged_in');
    if (storedAuth === 'false') {
      return null;
    }
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    if (storedAuth === 'true') {
      return INITIAL_USERS[0];
    }
    return null;
  },

  async setCurrentUser(user: User): Promise<User> {
    await delay(30);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem('synapse_auth_logged_in', 'true');
    return user;
  },

  async setCurrentUserRole(role: UserRole): Promise<User> {
    await delay(30);
    const user = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem('synapse_auth_logged_in', 'true');
    return user;
  },

  async logout(): Promise<void> {
    await delay(30);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.setItem('synapse_auth_logged_in', 'false');
  },

  // Specialties
  async getSpecialties(): Promise<Specialty[]> {
    await delay(30);
    return SPECIALTIES;
  },

  async getSpecialtyBySlug(slug: string): Promise<Specialty | undefined> {
    await delay(30);
    return SPECIALTIES.find(s => s.slug === slug);
  },

  // Doctors
  async getDoctors(filters?: {
    specialtyId?: string;
    searchQuery?: string;
    hasOnlineConsultation?: boolean;
    gender?: 'male' | 'female';
    insurance?: string;
    branchId?: string;
    timing?: 'all' | 'today' | 'tomorrow' | '3days' | 'evening';
    seniority?: 'all' | 'fellowship' | 'specialist' | 'experience10';
    sortBy?: 'rating' | 'experience' | 'earliest';
  }): Promise<Doctor[]> {
    await delay(40);
    let doctors = [...getStoredDoctors()];

    if (filters?.specialtyId) {
      doctors = doctors.filter(d => d.specialtyId === filters.specialtyId);
    }

    if (filters?.hasOnlineConsultation) {
      doctors = doctors.filter(d => d.hasOnlineConsultation);
    }

    if (filters?.gender) {
      doctors = doctors.filter(d => d.gender === filters.gender);
    }

    if (filters?.insurance) {
      doctors = doctors.filter(d => supportsInsurance(d.supportedInsurances, filters.insurance));
    }

    if (filters?.branchId) {
      doctors = doctors.filter(d => !d.branchId || d.branchId === filters.branchId);
    }

    if (filters?.seniority === 'fellowship') {
      doctors = doctors.filter(d => d.title && (d.title.includes('فوق تخصص') || d.title.includes('فلوشیپ')));
    } else if (filters?.seniority === 'experience10') {
      doctors = doctors.filter(d => d.experienceYears >= 10);
    }

    if (filters?.searchQuery) {
      const query = filters.searchQuery.trim().toLowerCase();
      doctors = doctors.filter(
        d =>
          d.name.toLowerCase().includes(query) ||
          d.specialtyName.toLowerCase().includes(query) ||
          d.title.toLowerCase().includes(query) ||
          d.services.some(s => s.toLowerCase().includes(query))
      );
    }

    // Enrich with dynamically calculated earliest available slot
    const enrichedDoctors = await Promise.all(
      doctors.map(async d => {
        const earliest = await appointmentAvailabilityService.getEarliestAvailableSlot(d.id);
        return {
          ...d,
          nextAvailableSlot: earliest.hasSlot ? earliest.label : 'بدون نوبت آزاد'
        };
      })
    );

    let finalDoctors = enrichedDoctors;
    if (filters?.timing === 'today') {
      finalDoctors = finalDoctors.filter(d => d.nextAvailableSlot.includes('امروز'));
    } else if (filters?.timing === 'tomorrow') {
      finalDoctors = finalDoctors.filter(d => d.nextAvailableSlot.includes('امروز') || d.nextAvailableSlot.includes('فردا'));
    } else if (filters?.timing === 'evening') {
      finalDoctors = finalDoctors.filter(d => /(1[6-9]|2[0-1]):/.test(d.nextAvailableSlot) || d.nextAvailableSlot.includes('عصر'));
    }

    if (filters?.sortBy === 'rating') {
      finalDoctors.sort((a, b) => b.rating - a.rating);
    } else if (filters?.sortBy === 'experience') {
      finalDoctors.sort((a, b) => b.experienceYears - a.experienceYears);
    } else if (filters?.sortBy === 'earliest') {
      finalDoctors.sort((a, b) => {
        if (a.nextAvailableSlot.includes('امروز') && !b.nextAvailableSlot.includes('امروز')) return -1;
        if (!a.nextAvailableSlot.includes('امروز') && b.nextAvailableSlot.includes('امروز')) return 1;
        return 0;
      });
    }

    return finalDoctors;
  },

  async getDoctorBySlug(slug: string): Promise<Doctor | undefined> {
    await delay(30);
    if (!slug) return undefined;
    const raw = String(slug).trim();
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw).trim().toLowerCase();
    } catch {
      decoded = raw.toLowerCase();
    }
    const cleanSlug = decoded.replace(/^\/+|\/+$/g, '');
    const cleanNoDr = cleanSlug.replace(/^dr-|^dr_|^dr\./, '');

    const doctors = getStoredDoctors();
    
    // 1. Direct match by slug
    let found = doctors.find(d => 
      d.slug?.toLowerCase() === cleanSlug || 
      d.slug?.toLowerCase() === raw.toLowerCase()
    );
    if (found) return found;

    // 2. Match by id
    found = doctors.find(d => 
      d.id.toLowerCase() === cleanSlug || 
      d.id.toLowerCase() === raw.toLowerCase()
    );
    if (found) return found;

    // 3. Match by stripped dr- prefix
    found = doctors.find(d => 
      d.slug?.toLowerCase().replace(/^dr-|^dr_|^dr\./, '') === cleanNoDr
    );
    if (found) return found;

    // 4. Match by Persian name
    found = doctors.find(d => {
      const docName = d.name.toLowerCase().replace(/^دکتر\s*/, '').trim();
      const searchName = decoded.replace(/^دکتر\s*/, '').trim();
      return (
        docName === searchName ||
        d.name.toLowerCase().includes(decoded) ||
        decoded.includes(docName)
      );
    });
    if (found) return found;

    // 5. Match by Hamrah subdomain (e.g., dr-maryam or dr-maryam.hamrah.ir)
    found = doctors.find(d => {
      const sub = (d.websiteSubdomain || d.websiteConfig?.websiteSubdomain || '').toLowerCase();
      if (!sub) return false;
      const subPrefix = sub.replace(/\.hamrah\.ir$/i, '').replace(/\.hamrahclinic\.ir$/i, '');
      return (
        sub === cleanSlug ||
        subPrefix === cleanSlug ||
        subPrefix === cleanNoDr ||
        sub === `${cleanSlug}.hamrah.ir` ||
        `dr-${subPrefix}` === cleanSlug
      );
    });
    if (found) return found;

    // 6. Match by medical council number
    found = doctors.find(d => d.medicalCouncilNumber === raw || d.medicalCouncilNumber === decoded);
    if (found) return found;

    // 7. Direct fallback against MOCK_DOCTORS
    found = MOCK_DOCTORS.find(d => 
      d.slug === raw || 
      d.slug === cleanSlug || 
      d.id === raw || 
      d.id === cleanSlug ||
      d.slug.replace(/^dr-/, '') === cleanNoDr
    );
    if (found) return found;

    // 7. Generic aliases like 'default', 'first', 'maryam', 'demo'
    if (cleanSlug === 'default' || cleanSlug === 'demo' || cleanSlug === 'first' || cleanSlug === 'hosseini' || cleanSlug === 'maryam') {
      return doctors[0] || MOCK_DOCTORS[0];
    }

    return undefined;
  },

  async getDoctorById(id: string): Promise<Doctor | undefined> {
    await delay(30);
    if (!id) return undefined;
    const raw = String(id).trim();
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw).trim();
    } catch {
      decoded = raw;
    }
    const doctors = getStoredDoctors();
    return doctors.find(d => d.id === raw || d.id === decoded || d.slug === raw || d.slug === decoded) ||
      MOCK_DOCTORS.find(d => d.id === raw || d.id === decoded || d.slug === raw || d.slug === decoded) ||
      doctors.find(d => d.slug.replace(/^dr-/, '') === raw.replace(/^dr-/, ''));
  },

  async updateDoctor(doctorId: string, updates: Partial<Doctor>): Promise<Doctor | null> {
    await delay(60);
    const doctors = getStoredDoctors();
    const index = doctors.findIndex(d => d.id === doctorId);
    if (index === -1) return null;

    doctors[index] = {
      ...doctors[index],
      ...updates
    };
    saveDoctors(doctors);
    return doctors[index];
  },

  async updateDoctorWebsiteConfig(doctorId: string, configUpdates: Partial<DoctorWebsiteConfig>): Promise<Doctor | null> {
    await delay(60);
    const doctors = getStoredDoctors();
    const index = doctors.findIndex(d => d.id === doctorId);
    if (index === -1) return null;

    const currentDoc = doctors[index];
    const currentConfig: DoctorWebsiteConfig = currentDoc.websiteConfig || {
      websiteStatus: 'draft',
      websiteEnabled: true,
      websitePublished: false,
      websiteTheme: 'modern-specialist',
      heroTitle: currentDoc.title,
      heroSubtitle: currentDoc.bio,
      shortIntroduction: currentDoc.bio,
      sectionVisibility: {
        about: true,
        services: true,
        achievements: true,
        articles: true,
        gallery: true,
        faq: true,
        reviews: true,
        offices: true
      }
    };

    let nextStatus: DoctorWebsiteStatus = configUpdates.websiteStatus || currentConfig.websiteStatus || 'draft';
    let nextPublished: boolean = configUpdates.websitePublished !== undefined ? configUpdates.websitePublished : currentConfig.websitePublished;
    let nextEnabled: boolean = configUpdates.websiteEnabled !== undefined ? configUpdates.websiteEnabled : currentConfig.websiteEnabled;

    if (configUpdates.websiteStatus) {
      nextStatus = configUpdates.websiteStatus;
      if (nextStatus === 'published') {
        nextPublished = true;
        nextEnabled = true;
      } else if (nextStatus === 'draft') {
        nextPublished = false;
        nextEnabled = true;
      } else if (nextStatus === 'disabled' || nextStatus === 'suspended') {
        nextPublished = false;
        nextEnabled = false;
      }
    } else if (configUpdates.websitePublished !== undefined || configUpdates.websiteEnabled !== undefined) {
      if (nextEnabled === false) {
        nextStatus = 'disabled';
      } else if (nextPublished === false) {
        nextStatus = 'draft';
      } else {
        nextStatus = 'published';
      }
    }

    doctors[index] = {
      ...currentDoc,
      websiteConfig: {
        ...currentConfig,
        ...configUpdates,
        websiteStatus: nextStatus,
        websitePublished: nextPublished,
        websiteEnabled: nextEnabled,
        sectionVisibility: {
          ...currentConfig.sectionVisibility,
          ...(configUpdates.sectionVisibility || {})
        }
      }
    };

    saveDoctors(doctors);
    return doctors[index];
  },

  async setDoctorWebsiteStatus(doctorId: string, status: DoctorWebsiteStatus): Promise<Doctor | null> {
    return this.updateDoctorWebsiteConfig(doctorId, { websiteStatus: status });
  },

  async toggleDoctorWebsitePublish(doctorId: string, published: boolean): Promise<Doctor | null> {
    return this.updateDoctorWebsiteConfig(doctorId, { 
      websiteStatus: published ? 'published' : 'draft',
      websitePublished: published,
      websiteEnabled: true
    });
  },

  // Clinic & Memberships
  async getDoctorClinicMemberships(clinicId?: string, doctorId?: string, branchId?: string): Promise<DoctorClinicMembership[]> {
    await delay(30);
    let mems = getStoredMemberships();
    if (clinicId) mems = mems.filter(m => m.clinicId === clinicId);
    if (doctorId) mems = mems.filter(m => m.doctorId === doctorId);
    if (branchId) mems = mems.filter(m => m.branchId === branchId);
    return mems;
  },

  async getClinicDoctors(clinicId?: string, branchId?: string): Promise<Doctor[]> {
    await delay(30);
    if (!clinicId) return [];
    const mems = await this.getDoctorClinicMemberships(clinicId, undefined, branchId);
    const doctorIds = new Set(mems.filter(m => m.active).map(m => m.doctorId));
    const allDoctors = getStoredDoctors();
    return allDoctors.filter(d => doctorIds.has(d.id));
  },

  async getDoctorsByBranch(branchId: string, clinicId?: string): Promise<Doctor[]> {
    await delay(30);
    if (!branchId) return [];
    const mems = await this.getDoctorClinicMemberships(clinicId, undefined, branchId);
    const doctorIds = new Set(mems.filter(m => m.active).map(m => m.doctorId));
    const allDoctors = getStoredDoctors();
    return allDoctors.filter(d => doctorIds.has(d.id));
  },

  async getClinicById(clinicId: string): Promise<Clinic | undefined> {
    await delay(30);
    const clinic = getStoredClinic();
    return clinic.id === clinicId ? clinic : undefined;
  },

  // Symptom Discovery
  async matchSymptom(query: string): Promise<SymptomGuide | undefined> {
    await delay(30);
    const q = query.trim().toLowerCase();
    return SYMPTOM_GUIDES.find(
      s =>
        s.symptom.includes(q) ||
        s.commonCauses.some(c => c.includes(q)) ||
        q.includes(s.symptom.split(' ')[0])
    );
  },

  async getAllSymptomGuides(): Promise<SymptomGuide[]> {
    await delay(30);
    return SYMPTOM_GUIDES;
  },

  // Services
  async getServices(): Promise<ServiceItem[]> {
    await delay(30);
    return CLINIC_SERVICES;
  },

  async getServiceBySlug(slug: string): Promise<ServiceItem | undefined> {
    await delay(30);
    return CLINIC_SERVICES.find(s => s.slug === slug);
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    await delay(40);
    return getStoredAppointments();
  },

  async getAppointmentsByClinic(clinicId: string, branchId?: string): Promise<Appointment[]> {
    await delay(40);
    const appointments = getStoredAppointments();
    return appointments.filter(a => {
      const matchClinic = a.clinicId === clinicId;
      const matchBranch = !branchId || a.branchId === branchId;
      return matchClinic && matchBranch;
    });
  },

  async getTodayAppointmentsByClinic(clinicId: string, branchId?: string): Promise<Appointment[]> {
    const apps = await this.getAppointmentsByClinic(clinicId, branchId);
    return apps.filter(isAppointmentToday);
  },

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    await delay(40);
    const appointments = getStoredAppointments();
    return appointments.filter(a => a.patientId === patientId);
  },

  async getMyAppointments(patientId: string): Promise<Appointment[]> {
    return this.getAppointmentsByPatient(patientId);
  },

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    await delay(40);
    const appointments = getStoredAppointments();
    return appointments.filter(a => a.doctorId === doctorId);
  },

  async getTodayAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const apps = await this.getAppointmentsByDoctor(doctorId);
    return apps.filter(isAppointmentToday);
  },

  async createAppointment(
    newApp: Omit<Appointment, 'id' | 'trackingCode' | 'createdAt' | 'status'> & { status?: AppointmentStatus; confirmationStatus?: 'pending' | 'confirmed' | 'declined' },
    actor?: { actorUserId?: string; actorName?: string; actorRole?: UserRole }
  ): Promise<Appointment> {
    await delay(80);

    // 1. Resolve and validate Doctor -> Clinic -> Branch -> Office hierarchy
    const allDoctors = getStoredDoctors();
    const doc = allDoctors.find(d => d.id === newApp.doctorId) || MOCK_DOCTORS.find(d => d.id === newApp.doctorId);

    let resolvedClinicId = newApp.clinicId;
    let resolvedBranchId = newApp.branchId;
    let resolvedOfficeId = newApp.officeId;

    if (doc) {
      if (newApp.officeId) {
        const matchingOffice = doc.offices?.find(o => o.id === newApp.officeId);
        if (doc.offices && doc.offices.length > 0 && !matchingOffice) {
          throw new Error('اطلاعات محل ویزیت کامل نیست. لطفاً محل دیگری انتخاب کنید.');
        }

        if (matchingOffice) {
          const officeClinic = matchingOffice.clinicId || doc.clinicId;
          const officeBranch = matchingOffice.branchId || doc.branchId;

          if (newApp.clinicId && officeClinic && newApp.clinicId !== officeClinic) {
            throw new Error('اطلاعات محل ویزیت کامل نیست. لطفاً محل دیگری انتخاب کنید.');
          }
          if (newApp.branchId && officeBranch && newApp.branchId !== officeBranch) {
            throw new Error('اطلاعات محل ویزیت کامل نیست. لطفاً محل دیگری انتخاب کنید.');
          }

          resolvedClinicId = officeClinic || resolvedClinicId;
          resolvedBranchId = officeBranch || resolvedBranchId;
          resolvedOfficeId = matchingOffice.id;
        }
      }

      if (!resolvedClinicId) {
        resolvedClinicId = doc.clinicId;
      }
      if (!resolvedBranchId) {
        resolvedBranchId = doc.branchId;
      }
    }

    if (!resolvedClinicId || !resolvedBranchId) {
      const mems = getStoredMemberships().filter(m => m.doctorId === newApp.doctorId && m.active);
      if (mems.length > 0) {
        if (!resolvedClinicId) resolvedClinicId = mems[0].clinicId;
        if (!resolvedBranchId) resolvedBranchId = mems[0].branchId;
        if (!resolvedOfficeId && mems[0].officeId) resolvedOfficeId = mems[0].officeId;
      }
    }

    if (!resolvedClinicId || !resolvedBranchId) {
      throw new Error('اطلاعات محل ویزیت کامل نیست. لطفاً محل دیگری انتخاب کنید.');
    }

    // 2. Service-level availability validation to prevent double booking & race conditions
    const validation = await appointmentAvailabilityService.validateSlotAvailability({
      doctorId: newApp.doctorId,
      date: newApp.date,
      timeSlot: newApp.timeSlot,
      officeId: resolvedOfficeId,
      branchId: resolvedBranchId,
      visitType: newApp.visitType
    });

    if (!validation.success) {
      const error: any = new Error(validation.message || 'این زمان لحظاتی قبل رزرو شد. لطفاً زمان دیگری انتخاب کنید.');
      error.reason = validation.reason || 'SLOT_ALREADY_BOOKED';
      error.code = 'SLOT_CONFLICT';
      error.status = 409;
      throw error;
    }

    const appointments = getStoredAppointments();
    const trackingCode = (newApp as any).trackingCode || generateAppointmentTrackingCode(appointments);

    // Resolve real patient identity (Guest Session vs Patient Identity)
    let resolvedPatientId = newApp.patientId;
    if (!resolvedPatientId || resolvedPatientId.startsWith('guest-session-') || resolvedPatientId === 'guest') {
      const cleanPhone = formatStandardIranianMobile(newApp.patientPhone);
      const storedUsers = INITIAL_USERS;
      const matchingUser = storedUsers.find(u => u.phone === cleanPhone || (newApp.patientPhone && u.phone === newApp.patientPhone));
      if (matchingUser) {
        resolvedPatientId = matchingUser.id;
      } else if (cleanPhone) {
        resolvedPatientId = `patient-${cleanPhone}`;
      } else {
        resolvedPatientId = `patient-${Date.now()}`;
      }
    }

    // Generate or preserve queuePosition using centralized Queue Service
    let assignedQueuePosition = newApp.queuePosition;
    if (assignedQueuePosition === undefined || assignedQueuePosition === null || typeof assignedQueuePosition !== 'number' || assignedQueuePosition <= 0) {
      assignedQueuePosition = await queueService.getNextQueueNumber({
        clinicId: resolvedClinicId,
        branchId: resolvedBranchId,
        date: newApp.date,
        doctorId: newApp.doctorId
      });
    }

    const calculatedWaitMinutes = newApp.estimatedWaitMinutes || queueService.calculateEstimatedWaitMinutes({
      queueNumber: assignedQueuePosition,
      averageMinutesPerPatient: 12
    });
    
    const created: Appointment = {
      ...newApp,
      id: `app-${Date.now()}`,
      patientId: resolvedPatientId,
      trackingCode,
      queuePosition: assignedQueuePosition,
      estimatedWaitMinutes: calculatedWaitMinutes,
      status: newApp.status || 'scheduled',
      confirmationStatus: newApp.confirmationStatus || 'pending',
      clinicId: resolvedClinicId,
      branchId: resolvedBranchId,
      officeId: resolvedOfficeId,
      createdAt: new Date().toISOString()
    };

    appointments.unshift(created);
    saveAppointments(appointments);

    this.logActivity({
      actorUserId: actor?.actorUserId || resolvedPatientId,
      actorName: actor?.actorName || newApp.patientName,
      actorRole: actor?.actorRole || 'patient',
      clinicId: created.clinicId,
      action: 'رزرو نوبت جدید',
      entityType: 'appointment',
      entityId: created.id,
      description: `نوبت با کد پیگیری ${trackingCode} (نوبت صف #${assignedQueuePosition}) نزد ${newApp.doctorName} برای تاریخ ${newApp.date} ساعت ${newApp.timeSlot} ثبت شد.`
    });

    return created;
  },

  // Appointment Availability Engine Facade
  async calculateAvailableSlots(params: {
    doctorId: string;
    date: string;
    officeId?: string;
    branchId?: string;
    visitType?: VisitType;
    includeUnavailable?: boolean;
  }): Promise<TimeSlotInfo[]> {
    return appointmentAvailabilityService.calculateAvailableSlots(params);
  },

  async validateSlotAvailability(params: {
    doctorId: string;
    date: string;
    timeSlot: string;
    officeId?: string;
    branchId?: string;
    visitType?: VisitType;
  }): Promise<BookingValidationResult> {
    return appointmentAvailabilityService.validateSlotAvailability(params);
  },

  async getEarliestAvailableSlot(doctorId: string, options?: { officeId?: string; visitType?: VisitType; maxDaysToCheck?: number }): Promise<EarliestSlotInfo> {
    return appointmentAvailabilityService.getEarliestAvailableSlot(doctorId, options);
  },

  async getDoctorSchedules(doctorId?: string, officeId?: string, visitType?: VisitType): Promise<DoctorSchedule[]> {
    return appointmentAvailabilityService.getDoctorSchedules(doctorId, officeId, visitType);
  },

  async getScheduleBlocks(doctorId?: string, officeId?: string): Promise<ScheduleBlock[]> {
    return appointmentAvailabilityService.getScheduleBlocks(doctorId, officeId);
  },

  async createSchedule(schedule: Omit<DoctorSchedule, 'id'>): Promise<DoctorSchedule> {
    return appointmentAvailabilityService.createSchedule(schedule);
  },

  async createScheduleBlock(block: Omit<ScheduleBlock, 'id'>): Promise<ScheduleBlock> {
    return appointmentAvailabilityService.createScheduleBlock(block);
  },

  async deleteScheduleBlock(id: string): Promise<boolean> {
    return appointmentAvailabilityService.deleteScheduleBlock(id);
  },

  async runAvailabilityEngineTests() {
    return appointmentAvailabilityService.runAvailabilityEngineTests();
  },

  async confirmAppointment(
    appointmentId: string,
    actor?: { actorUserId?: string; actorName?: string; actorRole?: UserRole }
  ): Promise<Appointment | null> {
    await delay(50);
    const appointments = getStoredAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);
    if (index === -1) return null;

    const nowISO = new Date().toISOString();
    appointments[index] = {
      ...appointments[index],
      confirmationStatus: 'confirmed',
      confirmedAt: nowISO,
      confirmedByUserId: actor?.actorUserId,
      confirmedByName: actor?.actorName
    };
    saveAppointments(appointments);

    this.logActivity({
      actorUserId: actor?.actorUserId || 'system',
      actorName: actor?.actorName || 'منشی پذیرش',
      actorRole: actor?.actorRole || 'secretary',
      clinicId: appointments[index].clinicId,
      action: 'تأیید نوبت بیمار',
      entityType: 'appointment',
      entityId: appointmentId,
      description: `نوبت بیمار "${appointments[index].patientName}" توسط ${actor?.actorName || 'منشی'} تأیید شد.`
    });

    return appointments[index];
  },

  async declineAppointment(
    appointmentId: string,
    reason?: string,
    actor?: { actorUserId?: string; actorName?: string; actorRole?: UserRole }
  ): Promise<Appointment | null> {
    await delay(50);
    const appointments = getStoredAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);
    if (index === -1) return null;

    appointments[index] = {
      ...appointments[index],
      confirmationStatus: 'declined',
      status: 'canceled',
      canceledAt: new Date().toISOString()
    };
    saveAppointments(appointments);

    this.logActivity({
      actorUserId: actor?.actorUserId || 'system',
      actorName: actor?.actorName || 'منشی پذیرش',
      actorRole: actor?.actorRole || 'secretary',
      clinicId: appointments[index].clinicId,
      action: 'عدم تأیید / لغو نوبت',
      entityType: 'appointment',
      entityId: appointmentId,
      description: `نوبت بیمار "${appointments[index].patientName}" به دلیل "${reason || 'انصراف / عدم تأیید'}" لغو شد.`
    });

    return appointments[index];
  },

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    actor?: { actorUserId?: string; actorName?: string; actorRole?: UserRole }
  ): Promise<Appointment | null> {
    await delay(50);
    const appointments = getStoredAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);
    if (index === -1) return null;

    const current = appointments[index];

    // Transition validation
    if (!canTransitionAppointment(current.status, status)) {
      throw new Error(`امکان تغییر وضعیت نوبت از "${current.status}" به "${status}" مجاز نمی‌باشد.`);
    }

    const nowISO = new Date().toISOString();
    const updated: Appointment = {
      ...current,
      status
    };

    if (status === 'arrived' && !updated.arrivedAt) {
      updated.arrivedAt = nowISO;
    } else if (status === 'in_visit') {
      if (!updated.visitStartedAt) updated.visitStartedAt = nowISO;
      if (updated.arrivedAt) {
        updated.waitingDurationMinutes = calculateWaitTimeMinutes(updated.arrivedAt, nowISO) || undefined;
      }
    } else if (status === 'completed') {
      if (!updated.completedAt) updated.completedAt = nowISO;
      if (updated.visitStartedAt) {
        updated.consultationDurationMinutes = calculateConsultationDurationMinutes(updated.visitStartedAt, nowISO) || undefined;
      }
    } else if (status === 'canceled') {
      updated.canceledAt = nowISO;
    }

    appointments[index] = updated;
    saveAppointments(appointments);

    const statusLabels: Record<AppointmentStatus, string> = {
      scheduled: 'رزرو شده',
      arrived: 'اعلام حضور در کلینیک',
      in_visit: 'شروع ویزیت در مطب',
      completed: 'پایان ویزیت',
      canceled: 'لغو نوبت',
      no_show: 'عدم حضور بیمار'
    };

    this.logActivity({
      actorUserId: actor?.actorUserId || 'system',
      actorName: actor?.actorName || 'کاربر سیستم',
      actorRole: actor?.actorRole || 'secretary',
      action: 'تغییر وضعیت نوبت',
      entityType: 'appointment',
      entityId: appointmentId,
      description: `وضعیت نوبت بیمار "${updated.patientName}" (${updated.doctorName}) به "${statusLabels[status]}" تغییر یافت.`
    });

    return updated;
  },

  // Medical Records & Timeline
  async getPatientMedicalRecords(patientId: string): Promise<MedicalRecord[]> {
    await delay(40);
    return MOCK_MEDICAL_RECORDS.filter(r => r.patientId === patientId);
  },

  // Family Members
  async getFamilyMembers(patientId: string): Promise<FamilyMember[]> {
    await delay(40);
    const members = getStoredFamilyMembers();
    return members.filter(m => m.patientId === patientId);
  },

  async addFamilyMember(member: Omit<FamilyMember, 'id'>): Promise<FamilyMember> {
    await delay(80);
    const members = getStoredFamilyMembers();
    const newMember: FamilyMember = {
      ...member,
      id: `fam-${Date.now()}`
    };
    members.push(newMember);
    saveFamilyMembers(members);
    return newMember;
  },

  // Reviews
  async getDoctorReviews(doctorId: string): Promise<Review[]> {
    await delay(40);
    return MOCK_REVIEWS.filter(r => r.doctorId === doctorId);
  },

  // Health Articles & Diseases
  async getArticles(): Promise<HealthArticle[]> {
    await delay(40);
    return MOCK_ARTICLES;
  },

  async getArticlesByDoctor(doctorId: string): Promise<HealthArticle[]> {
    await delay(40);
    const doc = await this.getDoctorById(doctorId);
    const docName = doc?.name;
    return MOCK_ARTICLES.filter(
      a => a.authorDoctorId === doctorId || (docName && a.authorDoctorName === docName)
    );
  },

  async getArticleBySlug(slug: string): Promise<HealthArticle | undefined> {
    await delay(40);
    return MOCK_ARTICLES.find(a => a.slug === slug);
  },

  async getDiseaseBySlug(slug: string): Promise<DiseaseCondition | undefined> {
    await delay(40);
    return MOCK_DISEASES.find(d => d.slug === slug);
  },

  // Admin & CRM
  async getAdminKPIs(): Promise<AdminKPIs> {
    await delay(40);
    return MOCK_ADMIN_KPIS;
  },

  async getCRMRecords(): Promise<PatientCRMRecord[]> {
    await delay(40);
    return MOCK_CRM_RECORDS;
  },

  // Clinic & Staff
  async getClinic(): Promise<Clinic> {
    await delay(30);
    return getStoredClinic();
  },

  async getBranches(): Promise<ClinicBranch[]> {
    await delay(20);
    const clinic = getStoredClinic();
    return clinic.branches || MOCK_CLINIC.branches;
  },

  async getClinicBranches(): Promise<ClinicBranch[]> {
    return this.getBranches();
  },

  async getBranchById(branchId: string): Promise<ClinicBranch | undefined> {
    await delay(20);
    const branches = await this.getBranches();
    return branches.find(b => b.id === branchId || b.code === branchId);
  },

  async getNearestBranches(userLat: number, userLng: number): Promise<Array<ClinicBranch & { distanceKm: number }>> {
    await delay(30);
    const branches = await this.getBranches();
    const branchesWithDist = branches.map(b => {
      const bLat = b.coordinates?.lat || 35.7832;
      const bLng = b.coordinates?.lng || 51.3745;
      const dist = calculateDistanceKm(userLat, userLng, bLat, bLng);
      return {
        ...b,
        distanceKm: dist
      };
    });

    return branchesWithDist.sort((a, b) => a.distanceKm - b.distanceKm);
  },

  async getClinicStaff(clinicId?: string): Promise<ClinicStaff[]> {
    await delay(30);
    const all = getStoredClinicStaff();
    if (clinicId) {
      return all.filter(s => s.clinicId === clinicId);
    }
    return all;
  },

  async getStaffByClinic(clinicId: string, branchId?: string): Promise<ClinicStaff[]> {
    await delay(30);
    const all = getStoredClinicStaff();
    return all.filter(s => {
      const matchClinic = s.clinicId === clinicId;
      const matchBranch = !branchId || s.branchId === branchId;
      return matchClinic && matchBranch;
    });
  },

  // Tasks Engine
  async getTasks(filter?: {
    clinicId?: string;
    branchId?: string;
    assignedTo?: string;
    doctorId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    type?: TaskType;
  }): Promise<ClinicTask[]> {
    await delay(40);
    let tasks = getStoredTasks();

    if (filter) {
      if (filter.clinicId) tasks = tasks.filter(t => t.clinicId === filter.clinicId);
      if (filter.branchId) tasks = tasks.filter(t => !t.branchId || t.branchId === filter.branchId);
      if (filter.assignedTo) tasks = tasks.filter(t => t.assignedTo === filter.assignedTo);
      if (filter.doctorId) tasks = tasks.filter(t => t.doctorId === filter.doctorId);
      if (filter.status) tasks = tasks.filter(t => t.status === filter.status);
      if (filter.priority) tasks = tasks.filter(t => t.priority === filter.priority);
      if (filter.type) tasks = tasks.filter(t => t.type === filter.type);
    }

    return tasks;
  },

  async getTasksByClinic(clinicId: string, branchId?: string): Promise<ClinicTask[]> {
    return this.getTasks({ clinicId, branchId });
  },

  async createTask(
    newTask: Omit<ClinicTask, 'id' | 'createdAt'>,
    actor?: { actorUserId?: string; actorName?: string; actorRole?: UserRole }
  ): Promise<ClinicTask> {
    await delay(60);
    const tasks = getStoredTasks();
    const task: ClinicTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      clinicId: newTask.clinicId || 'clinic-1',
      branchId: newTask.branchId || 'branch-1',
      createdAt: new Date().toISOString()
    };
    tasks.unshift(task);
    saveTasks(tasks);

    // Auto log activity
    this.logActivity({
      actorUserId: actor?.actorUserId || newTask.createdBy || 'system',
      actorName: actor?.actorName || newTask.createdByName || 'کاربر سیستم',
      actorRole: actor?.actorRole || newTask.assignedRole || 'secretary',
      clinicId: task.clinicId,
      action: 'ایجاد وظیفه جدید',
      entityType: 'task',
      entityId: task.id,
      description: `وظیفه "${task.title}" برای ${task.assignedToName} ثبت شد.`
    });

    return task;
  },

  async updateTask(taskId: string, updates: Partial<ClinicTask>): Promise<ClinicTask | null> {
    await delay(40);
    const tasks = getStoredTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        ...updates
      };
      saveTasks(tasks);
      return tasks[index];
    }
    return null;
  },

  async completeTask(
    taskId: string,
    notes?: string,
    actor?: { actorUserId?: string; actorName?: string; actorRole?: UserRole }
  ): Promise<ClinicTask | null> {
    await delay(40);
    const tasks = getStoredTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index].status = 'completed';
      tasks[index].completedAt = new Date().toISOString();
      if (notes) {
        tasks[index].notes = notes;
      }
      saveTasks(tasks);

      this.logActivity({
        actorUserId: actor?.actorUserId || 'current-user',
        actorName: actor?.actorName || tasks[index].assignedToName,
        actorRole: actor?.actorRole || 'secretary',
        clinicId: tasks[index].clinicId,
        action: 'تکمیل وظیفه',
        entityType: 'task',
        entityId: taskId,
        description: `وظیفه "${tasks[index].title}" تکمیل شد.`
      });

      return tasks[index];
    }
    return null;
  },

  async deleteTask(taskId: string): Promise<boolean> {
    await delay(40);
    const tasks = getStoredTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    saveTasks(filtered);
    return true;
  },

  // Activity Logs
  async getActivityLogs(limit: number = 40): Promise<ActivityLog[]> {
    await delay(30);
    const logs = getStoredActivityLogs();
    return logs.slice(0, limit);
  },

  async logActivity(entry: Omit<ActivityLog, 'id' | 'timestamp'> & { timestamp?: string }): Promise<ActivityLog> {
    const logs = getStoredActivityLogs();
    const newLog: ActivityLog = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: entry.timestamp || new Date().toISOString()
    };
    logs.unshift(newLog);
    saveActivityLogs(logs.slice(0, 150));
    return newLog;
  },

  // Automations
  async getAutomationRules(clinicId?: string): Promise<ClinicAutomationRule[]> {
    await delay(30);
    const all = getStoredAutomationRules();
    if (clinicId) {
      return all.filter(r => r.clinicId === clinicId);
    }
    return all;
  },

  async toggleAutomationRule(ruleId: string, enabled: boolean): Promise<ClinicAutomationRule | null> {
    await delay(40);
    const rules = getStoredAutomationRules();
    const index = rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      rules[index].enabled = enabled;
      saveAutomationRules(rules);
      return rules[index];
    }
    return null;
  },

  // Notifications
  async getNotifications(): Promise<ClinicNotification[]> {
    await delay(30);
    return getStoredNotifications();
  },

  async getNotificationsByClinic(_clinicId?: string): Promise<ClinicNotification[]> {
    return this.getNotifications();
  },

  async sendSmsNotification(payload: {
    recipientPhone: string;
    recipientName?: string;
    templateKey: ClinicNotification['templateKey'];
    title: string;
    message: string;
  }): Promise<ClinicNotification> {
    await delay(60);
    const notifs = getStoredNotifications();
    const notif: ClinicNotification = {
      id: `notif-${Date.now()}`,
      recipientPhone: payload.recipientPhone,
      recipientName: payload.recipientName || 'بیمار',
      type: 'sms',
      templateKey: payload.templateKey,
      title: payload.title,
      message: payload.message,
      status: 'sent',
      deliveryMode: 'prototype',
      sentAt: new Date().toISOString()
    };

    notifs.unshift(notif);
    saveNotifications(notifs);
    return notif;
  },

  async sendPrototypeReminder(
    phone: string,
    templateKey: ClinicNotification['templateKey'],
    params: { patientName: string; doctorName: string; time: string; trackingCode?: string },
    actor?: { actorUserId?: string; actorName?: string; actorRole?: UserRole }
  ): Promise<ClinicNotification> {
    await delay(70);
    const notifs = getStoredNotifications();
    let title = 'یادآوری نوبت ویزیت';
    let message = `بیمار گرامی ${params.patientName}، نوبت ویزیت شما نزد ${params.doctorName} در ساعت ${params.time} تأیید شد.`;

    if (templateKey === 'appointment_confirmation') {
      title = 'تأیید نوبت کلینیک';
      message = `نوبت شما نزد ${params.doctorName} برای ساعت ${params.time} ثبت شد. کد پیگیری: ${params.trackingCode || 'HC-1001'}`;
    } else if (templateKey === 'survey') {
      title = 'نظرسنجی کیفیت خدمات';
      message = `${params.patientName} گرامی، لطفاً با ثبت نظر درباره ویزیت با ${params.doctorName} ما را در ارتقای خدمات یاری فرمایید.`;
    }

    const notif: ClinicNotification = {
      id: `notif-${Date.now()}`,
      recipientPhone: phone,
      recipientName: params.patientName,
      type: 'sms',
      templateKey,
      title,
      message,
      status: 'sent',
      deliveryMode: 'prototype',
      sentAt: new Date().toISOString()
    };

    notifs.unshift(notif);
    saveNotifications(notifs);

    this.logActivity({
      actorUserId: actor?.actorUserId || 'system-auto',
      actorName: actor?.actorName || 'سرویس پیامک شبیه‌ساز همرا کلینیک',
      actorRole: actor?.actorRole || 'secretary',
      action: 'ثبت پیامک شبیه‌ساز',
      entityType: 'notification',
      entityId: notif.id,
      description: `پیامک یادآوری "${title}" برای شماره ${phone} (${params.patientName}) در لاگ شبیه‌ساز ثبت شد.`
    });

    return notif;
  },

  // Overviews - Strictly grounded on real data
  async getClinicTodayOverview(clinicId: string, branchId?: string) {
    await delay(40);
    const appointments = await this.getAppointmentsByClinic(clinicId, branchId);
    const tasks = await this.getTasksByClinic(clinicId, branchId);
    const doctors = await this.getClinicDoctors(clinicId);

    // Filter appointments for today
    const todayApps = appointments.filter(isAppointmentToday);
    const arrivedCount = todayApps.filter(a => a.status === 'arrived').length;
    const inVisitCount = todayApps.filter(a => a.status === 'in_visit').length;
    const completedCount = todayApps.filter(a => a.status === 'completed').length;
    const scheduledCount = todayApps.filter(a => a.status === 'scheduled').length;
    const cancelledCount = todayApps.filter(a => a.status === 'canceled' || a.status === 'no_show').length;

    // Calculate real revenue from today's paid appointments
    const todayRevenue = todayApps
      .filter(a => a.paidStatus === 'paid')
      .reduce((sum, a) => sum + (a.fee || 0), 0);

    // Calculate real average wait time from arrived appointments
    const waitTimes: number[] = [];
    todayApps.forEach(a => {
      if (a.waitingDurationMinutes) {
        waitTimes.push(a.waitingDurationMinutes);
      } else if (a.arrivedAt) {
        const wait = calculateWaitTimeMinutes(a.arrivedAt, a.visitStartedAt);
        if (wait !== null) waitTimes.push(wait);
      }
    });

    const avgWait = waitTimes.length > 0
      ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
      : 0;

    const todoTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress');
    const urgentTasks = todoTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

    return {
      totalTodayAppointments: todayApps.length,
      arrivedWaiting: arrivedCount,
      inConsultation: inVisitCount,
      completed: completedCount,
      pendingScheduled: scheduledCount,
      cancelled: cancelledCount,
      activeDoctorsCount: doctors.length,
      activeTasksCount: todoTasks.length,
      urgentTasksCount: urgentTasks.length,
      estimatedAvgWaitMinutes: avgWait,
      todayRevenue
    };
  },

  async getDoctorTodayOverview(doctorId: string) {
    await delay(40);
    const appointments = getStoredAppointments();
    const docApps = appointments.filter(a => a.doctorId === doctorId && isAppointmentToday(a));
    const tasks = getStoredTasks().filter(t => t.doctorId === doctorId || t.assignedTo === doctorId);

    const inVisit = docApps.find(a => a.status === 'in_visit') || docApps.find(a => a.status === 'arrived');
    const waiting = docApps.filter(a => a.status === 'arrived');
    const scheduled = docApps.filter(a => a.status === 'scheduled');
    const completed = docApps.filter(a => a.status === 'completed');

    return {
      totalAppointments: docApps.length,
      waitingCount: waiting.length,
      inVisitPatient: inVisit || null,
      scheduledCount: scheduled.length,
      completedCount: completed.length,
      pendingTasks: tasks.filter(t => t.status !== 'completed'),
      needsActionCount: waiting.length + tasks.filter(t => t.priority === 'urgent').length
    };
  },

  // Insurances Coverage Services
  async getInsurances(): Promise<InsuranceCompany[]> {
    await delay(20);
    return MOCK_INSURANCES;
  },

  async getInsuranceById(id: string): Promise<InsuranceCompany | undefined> {
    await delay(20);
    return MOCK_INSURANCES.find(ins => ins.id === id);
  },

  calculateInsuranceCoverage(
    baseFee: number,
    basicInsuranceName?: string,
    supplementaryInsuranceName?: string
  ): InsuranceCoverageCalculationResult {
    return calculateDemoCoverage(baseFee, basicInsuranceName, supplementaryInsuranceName);
  },

  async searchDoctorsAndBranchesByInsurance(params: {
    insuranceName?: string;
    basicInsuranceName?: string;
    supplementaryInsuranceName?: string;
    specialtyId?: string;
    searchQuery?: string;
  }) {
    await delay(40);
    const doctors = getStoredDoctors();
    const clinic = getStoredClinic();

    // Determine basic and supplementary target filters
    let basicTarget = params.basicInsuranceName;
    let suppTarget = params.supplementaryInsuranceName;

    if (params.insuranceName && !basicTarget && !suppTarget) {
      const resolved = resolveInsuranceCompany(params.insuranceName);
      if (resolved?.type === 'basic') {
        basicTarget = resolved.name;
      } else if (resolved) {
        suppTarget = resolved.name;
      } else {
        basicTarget = params.insuranceName;
      }
    }

    let matchedDoctors = doctors.filter(doc =>
      matchesDoctorInsuranceSelection(doc, basicTarget, suppTarget)
    );

    if (params.specialtyId) {
      matchedDoctors = matchedDoctors.filter(d => d.specialtyId === params.specialtyId);
    }

    if (params.searchQuery) {
      const q = params.searchQuery.toLowerCase();
      matchedDoctors = matchedDoctors.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.specialtyName.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q)
      );
    }

    // Filter branches based on insurance compatibility
    const matchedBranches = (clinic.branches || []).filter(branch =>
      matchesBranchInsuranceSelection(branch, basicTarget, suppTarget)
    );

    return {
      insurance: resolveInsuranceCompany(params.insuranceName || basicTarget || suppTarget),
      doctors: matchedDoctors,
      branches: matchedBranches,
      totalDoctorsCount: matchedDoctors.length,
      totalBranchesCount: matchedBranches.length
    };
  },

  async submitClinicBrandingRequest(data: Omit<ClinicBrandingRequest, 'id' | 'trackingCode' | 'createdAt' | 'status'>): Promise<ClinicBrandingRequest> {
    await delay(300);
    const id = `cbr-${Date.now()}`;
    const trackingCode = `HBR-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRequest: ClinicBrandingRequest = {
      ...data,
      id,
      trackingCode,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    try {
      const stored = localStorage.getItem('hemera_clinic_branding_requests');
      const list: ClinicBrandingRequest[] = stored ? JSON.parse(stored) : [];
      list.unshift(newRequest);
      localStorage.setItem('hemera_clinic_branding_requests', JSON.stringify(list));
    } catch {
      // Ignore localStorage errors
    }

    return newRequest;
  },

  async getClinicBrandingRequests(): Promise<ClinicBrandingRequest[]> {
    await delay(100);
    try {
      const stored = localStorage.getItem('hemera_clinic_branding_requests');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  }
};
