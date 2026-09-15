import { describe, it, expect } from 'vitest';
import { isWebsitePubliclyVisible, canPreviewDoctorWebsite, resolveDoctorWebsiteStatus } from '../utils/doctorWebsiteUtils';
import { canManageDoctorWebsite } from '../utils/authUtils';
import { User, DoctorWebsiteConfig } from '../types';

describe('Doctor Website Security & Access Control', () => {
  const publishedConfig: DoctorWebsiteConfig = {
    websiteStatus: 'published',
    websiteEnabled: true,
    websitePublished: true,
    websiteTheme: 'modern-specialist',
    sectionVisibility: {}
  };

  const draftConfig: DoctorWebsiteConfig = {
    websiteStatus: 'draft',
    websiteEnabled: true,
    websitePublished: false,
    websiteTheme: 'modern-specialist',
    sectionVisibility: {}
  };

  const disabledConfig: DoctorWebsiteConfig = {
    websiteStatus: 'disabled',
    websiteEnabled: false,
    websitePublished: false,
    websiteTheme: 'modern-specialist',
    sectionVisibility: {}
  };

  const doctorA: User = {
    id: 'user-doc-a',
    name: 'دکتر مریم حسینی',
    phone: '09123334455',
    role: 'doctor',
    doctorId: 'doc-1'
  };

  const doctorB: User = {
    id: 'user-doc-b',
    name: 'دکتر علیرضا کریمی',
    phone: '09122223344',
    role: 'doctor',
    doctorId: 'doc-2'
  };

  const clinicManagerClinic1: User = {
    id: 'user-manager-1',
    name: 'مهندس صبوری',
    phone: '09128889911',
    role: 'clinic_manager',
    clinicId: 'clinic-1',
    permissions: ['doctor.website.manage']
  };

  const clinicManagerNoClinic: User = {
    id: 'user-manager-no-clinic',
    name: 'مدیر بدون کلینیک',
    phone: '09128889922',
    role: 'clinic_manager',
    permissions: ['doctor.website.manage']
  };

  const clinicManagerClinic2: User = {
    id: 'user-manager-2',
    name: 'مدیر کلینیک ب',
    phone: '09128889933',
    role: 'clinic_manager',
    clinicId: 'clinic-2',
    permissions: ['doctor.website.manage']
  };

  const superAdmin: User = {
    id: 'user-superadmin-1',
    name: 'مدیر ارشد',
    phone: '09129990000',
    role: 'super_admin'
  };

  const anonymousUser = null;

  it('published public website is accessible to anonymous users', () => {
    expect(isWebsitePubliclyVisible(publishedConfig)).toBe(true);
    expect(resolveDoctorWebsiteStatus(publishedConfig)).toBe('published');
  });

  it('draft anonymous website is inaccessible to anonymous visitors', () => {
    expect(isWebsitePubliclyVisible(draftConfig)).toBe(false);
    expect(canPreviewDoctorWebsite(anonymousUser, 'doc-1')).toBe(false);
  });

  it('disabled website is inaccessible to public visitors', () => {
    expect(isWebsitePubliclyVisible(disabledConfig)).toBe(false);
  });

  it('doctor owner can preview/edit their own website (doc-1)', () => {
    expect(canPreviewDoctorWebsite(doctorA, 'doc-1')).toBe(true);
    expect(canManageDoctorWebsite(doctorA, 'doc-1')).toBe(true);
  });

  it('Doctor A CANNOT edit or preview Doctor B website (strictly isolated by doctorId)', () => {
    expect(canPreviewDoctorWebsite(doctorA, 'doc-2')).toBe(false);
    expect(canManageDoctorWebsite(doctorA, 'doc-2')).toBe(false);

    expect(canPreviewDoctorWebsite(doctorB, 'doc-1')).toBe(false);
    expect(canManageDoctorWebsite(doctorB, 'doc-1')).toBe(false);
  });

  it('Authorized clinic manager with matching clinicId and super admin can preview/manage doctor websites', () => {
    expect(canPreviewDoctorWebsite(clinicManagerClinic1, 'doc-1')).toBe(true);
    expect(canManageDoctorWebsite(superAdmin, 'doc-1')).toBe(true);
  });

  it('Clinic manager without clinicId or from Clinic 2 CANNOT manage Clinic 1 doctor website', () => {
    // Missing clinicId does not fallback to clinic-1
    expect(canPreviewDoctorWebsite(clinicManagerNoClinic, 'doc-1')).toBe(false);
    expect(canManageDoctorWebsite(clinicManagerNoClinic, 'doc-1')).toBe(false);

    // Clinic Manager B cannot manage Clinic A doctor
    expect(canPreviewDoctorWebsite(clinicManagerClinic2, 'doc-1')).toBe(false);
    expect(canManageDoctorWebsite(clinicManagerClinic2, 'doc-1')).toBe(false);
  });
});
