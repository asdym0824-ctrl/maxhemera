import { describe, it, expect } from 'vitest';
import { hasPermission } from '../utils/authUtils';
import { User } from '../types';

describe('Role-Based Access Control & Permissions', () => {
  const patientUser: User = {
    id: 'p-1',
    name: 'بیمار',
    phone: '09121112233',
    role: 'patient'
  };

  const doctorUser: User = {
    id: 'd-1',
    name: 'پزشک',
    phone: '09123334455',
    role: 'doctor',
    doctorId: 'doc-1'
  };

  const secretaryUser: User = {
    id: 's-1',
    name: 'منشی',
    phone: '09125556677',
    role: 'secretary',
    clinicId: 'clinic-1'
  };

  const clinicManagerUser: User = {
    id: 'm-1',
    name: 'مدیر کلینیک',
    phone: '09128889911',
    role: 'clinic_manager',
    clinicId: 'clinic-1'
  };

  const superAdminUser: User = {
    id: 'sa-1',
    name: 'سوپر ادمین',
    phone: '09129990000',
    role: 'super_admin'
  };

  it('Patient CANNOT access Doctor Workspace, Secretary Workspace, or Super Admin', () => {
    expect(hasPermission(patientUser, 'doctor.portal.access')).toBe(false);
    expect(hasPermission(patientUser, 'secretary.portal.access')).toBe(false);
    expect(hasPermission(patientUser, 'super_admin.portal.access')).toBe(false);
    expect(hasPermission(patientUser, 'system.admin')).toBe(false);

    // Patient can access their own portal and read their records
    expect(hasPermission(patientUser, 'patient.portal.access')).toBe(true);
    expect(hasPermission(patientUser, 'appointments.create')).toBe(true);
  });

  it('Doctor CANNOT access Secretary Workspace or Super Admin without explicit permission', () => {
    expect(hasPermission(doctorUser, 'secretary.portal.access')).toBe(false);
    expect(hasPermission(doctorUser, 'super_admin.portal.access')).toBe(false);
    expect(hasPermission(doctorUser, 'system.admin')).toBe(false);

    // Doctor can access doctor portal, clinical records, and manage tasks
    expect(hasPermission(doctorUser, 'doctor.portal.access')).toBe(true);
    expect(hasPermission(doctorUser, 'patients.read_clinical')).toBe(true);
    expect(hasPermission(doctorUser, 'medical_records.write')).toBe(true);
  });

  it('Secretary CANNOT access Super Admin or Doctor Clinical Write', () => {
    expect(hasPermission(secretaryUser, 'super_admin.portal.access')).toBe(false);
    expect(hasPermission(secretaryUser, 'system.admin')).toBe(false);
    expect(hasPermission(secretaryUser, 'medical_records.write')).toBe(false);

    // Secretary has secretary portal and appointment management
    expect(hasPermission(secretaryUser, 'secretary.portal.access')).toBe(true);
    expect(hasPermission(secretaryUser, 'appointments.update')).toBe(true);
  });

  it('Clinic Manager CANNOT become Super Admin', () => {
    expect(hasPermission(clinicManagerUser, 'super_admin.portal.access')).toBe(false);
    expect(hasPermission(clinicManagerUser, 'system.admin')).toBe(false);

    // Clinic manager has clinic portal, staff management, analytics
    expect(hasPermission(clinicManagerUser, 'clinic.portal.access')).toBe(true);
    expect(hasPermission(clinicManagerUser, 'staff.manage')).toBe(true);
    expect(hasPermission(clinicManagerUser, 'clinic.analytics.read')).toBe(true);
  });

  it('Super Admin has full system permissions', () => {
    expect(hasPermission(superAdminUser, 'super_admin.portal.access')).toBe(true);
    expect(hasPermission(superAdminUser, 'system.admin')).toBe(true);
    expect(hasPermission(superAdminUser, 'clinic.portal.access')).toBe(true);
  });
});
