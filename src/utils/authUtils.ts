import { User, UserRole, AppPermission, DoctorClinicMembership, Doctor } from '../types';
import { MOCK_DOCTOR_CLINIC_MEMBERSHIPS } from '../data/mockData';

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  patient: [
    'patient.portal.access',
    'appointments.read',
    'appointments.create',
    'appointments.cancel',
    'patients.read_basic',
    'medical_records.read'
  ],
  doctor: [
    'doctor.portal.access',
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'appointments.cancel',
    'patients.read_basic',
    'patients.read_clinical',
    'tasks.read',
    'tasks.create',
    'tasks.complete',
    'doctor.website.manage',
    'medical_records.read',
    'medical_records.write'
  ],
  secretary: [
    'secretary.portal.access',
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'appointments.cancel',
    'patients.read_basic',
    'tasks.read',
    'tasks.create',
    'tasks.complete',
    'notifications.manage'
  ],
  reception: [
    'secretary.portal.access',
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'appointments.cancel',
    'patients.read_basic',
    'tasks.read',
    'tasks.create',
    'tasks.complete',
    'notifications.manage'
  ],
  clinic_manager: [
    'clinic.portal.access',
    'secretary.portal.access',
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'appointments.cancel',
    'patients.read_basic',
    'patients.read_clinical',
    'tasks.read',
    'tasks.create',
    'tasks.complete',
    'clinic.analytics.read',
    'automation.manage',
    'staff.manage',
    'notifications.manage'
  ],
  admin: [
    'clinic.portal.access',
    'secretary.portal.access',
    'system.admin',
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'appointments.cancel',
    'patients.read_basic',
    'tasks.read',
    'tasks.create',
    'tasks.complete',
    'clinic.analytics.read',
    'doctor.website.manage',
    'automation.manage',
    'staff.manage',
    'notifications.manage'
  ],
  super_admin: [
    'super_admin.portal.access',
    'system.admin',
    'clinic.portal.access',
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'appointments.cancel',
    'patients.read_basic',
    'tasks.read',
    'tasks.create',
    'tasks.complete',
    'clinic.analytics.read',
    'automation.manage',
    'staff.manage',
    'notifications.manage'
  ],
  nurse: [
    'appointments.read',
    'patients.read_basic',
    'tasks.read',
    'tasks.complete'
  ],
  finance: [
    'appointments.read',
    'clinic.analytics.read'
  ],
  hr: [
    'staff.manage'
  ],
  content_manager: [
    'doctor.website.manage'
  ],
  branch_manager: [
    'clinic.portal.access',
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'appointments.cancel',
    'patients.read_basic',
    'tasks.read',
    'tasks.create',
    'tasks.complete',
    'clinic.analytics.read',
    'staff.manage'
  ]
};

/**
 * Checks if a user has a specific permission based on explicit user permissions
 * or their role's default permission set.
 */
export function hasPermission(user: User | null | undefined, permission: AppPermission): boolean {
  if (!user) return false;

  // Check explicit permissions on the user record if present
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }

  // Fallback to role-based permission matrix
  const rolePermissions = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Helper to check whether a doctor has an active membership in a specific clinic.
 */
export function isDoctorActiveMemberOfClinic(
  doctorId: string,
  clinicId?: string,
  customMemberships?: DoctorClinicMembership[]
): boolean {
  if (!doctorId || !clinicId) return false;

  // 1. If explicit memberships array is provided, use it
  if (customMemberships && Array.isArray(customMemberships)) {
    return customMemberships.some(
      m => m.doctorId === doctorId && m.clinicId === clinicId && m.active === true
    );
  }

  // 2. Check browser localStorage if available
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('synapse_clinic_memberships_v4');
      if (raw) {
        const mems: DoctorClinicMembership[] = JSON.parse(raw);
        if (Array.isArray(mems)) {
          return mems.some(
            m => m.doctorId === doctorId && m.clinicId === clinicId && m.active === true
          );
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }

  // 3. Fallback to mock memberships
  return MOCK_DOCTOR_CLINIC_MEMBERSHIPS.some(
    m => m.doctorId === doctorId && m.clinicId === clinicId && m.active === true
  );
}

/**
 * Checks if user is permitted to preview / edit doctor personal website.
 * Access Control Rules:
 * 1. Super Admin: Platform-level website management where permitted.
 * 2. Doctor: Can manage their OWN website only (user.doctorId === doctorId).
 * 3. Clinic Manager: Requires permission 'doctor.website.manage' AND active clinic membership.
 *    (Permission + Clinic Scope = Access). Clinic Manager A CANNOT manage Clinic B doctor.
 * 4. Content Manager / Admin: If clinic-scoped, requires active clinic membership.
 */
export function canManageDoctorWebsite(
  user: User | null | undefined, 
  doctorId: string,
  options?: {
    memberships?: DoctorClinicMembership[];
    doctor?: Doctor;
  }
): boolean {
  if (!user || !doctorId) return false;

  // Super Admin: platform-level website management (separate from clinical record access)
  if (user.role === 'super_admin') {
    return hasPermission(user, 'doctor.website.manage') || true;
  }

  // Doctor: strictly verify doctor ownership - Doctor A cannot manage/preview Doctor B
  if (user.role === 'doctor') {
    return Boolean(user.doctorId && user.doctorId === doctorId);
  }

  // Clinic Manager: Permission + Clinic Scope = Access
  if (user.role === 'clinic_manager') {
    // 1. Must have required permission
    if (!hasPermission(user, 'doctor.website.manage')) return false;

    // 2. Doctor must belong to that manager's clinic through an active membership
    if (!user.clinicId) return false;
    return isDoctorActiveMemberOfClinic(doctorId, user.clinicId, options?.memberships);
  }

  // Admin / Content Manager
  if (user.role === 'admin' || user.role === 'content_manager') {
    if (!hasPermission(user, 'doctor.website.manage')) return false;

    // If user has a specific clinicId, enforce clinic scope
    if (user.clinicId) {
      return isDoctorActiveMemberOfClinic(doctorId, user.clinicId, options?.memberships);
    }
    // Global platform admin without clinic isolation restriction
    return true;
  }

  return false;
}
