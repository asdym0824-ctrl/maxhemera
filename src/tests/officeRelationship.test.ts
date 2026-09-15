import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/apiService';

describe('Appointment Office Relationship & Hierarchy Persistence', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('correctly persists doctorId, clinicId, branchId, and officeId when booking Office B', async () => {
    // 2026-08-20 is Thursday (dayOfWeek 5) - doc-1 is at off-2 (ونک, branch-2) from 09:00 to 13:30
    const customAppointmentData = {
      doctorId: 'doc-1',
      doctorName: 'دکتر مریم حسینی',
      doctorSpecialty: 'متخصص قلب و عروق',
      doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      clinicAddress: 'تهران، میدان ونک، برج نگار، طبقه ۶',
      patientId: 'user-patient-1',
      patientName: 'امیرحسین رضایی',
      patientPhone: '09121112233',
      date: '2026-08-20',
      timeSlot: '10:00',
      visitType: 'in_person' as const,
      officeId: 'off-2', // Specifically Office B (Vanak branch office)
      clinicId: 'clinic-1',
      branchId: 'branch-2', // Branch B
      fee: 3000000,
      paidStatus: 'pending' as const
    };

    const created = await apiService.createAppointment(customAppointmentData);

    expect(created.id).toBeDefined();
    expect(created.doctorId).toBe('doc-1');
    expect(created.clinicId).toBe('clinic-1');
    expect(created.branchId).toBe('branch-2');
    expect(created.officeId).toBe('off-2');
    expect(created.status).toBe('scheduled');

    // Retrieve from API to confirm storage integrity
    const all = await apiService.getAppointments();
    const found = all.find(a => a.id === created.id);

    expect(found).toBeDefined();
    expect(found?.officeId).toBe('off-2');
    expect(found?.branchId).toBe('branch-2');
    expect(found?.clinicId).toBe('clinic-1');
    expect(found?.doctorId).toBe('doc-1');
  });

  it('automatically resolves branchId and clinicId from officeId if not explicitly provided', async () => {
    // 2026-08-20 is Thursday (dayOfWeek 5) - doc-1 is at off-2 (ونک, branch-2) from 09:00 to 13:30
    const appointmentWithoutBranch = {
      doctorId: 'doc-1',
      doctorName: 'دکتر مریم حسینی',
      doctorSpecialty: 'متخصص قلب و عروق',
      doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      clinicAddress: 'تهران، میدان ونک، برج نگار، طبقه ۶',
      patientId: 'user-patient-1',
      patientName: 'امیرحسین رضایی',
      patientPhone: '09121112233',
      date: '2026-08-20',
      timeSlot: '10:30',
      visitType: 'in_person' as const,
      officeId: 'off-2', // Office B belongs to branch-2
      fee: 3000000,
      paidStatus: 'pending' as const
    };

    const created = await apiService.createAppointment(appointmentWithoutBranch);

    expect(created.officeId).toBe('off-2');
    expect(created.branchId).toBe('branch-2');
    expect(created.clinicId).toBe('clinic-1');
  });

  it('rejects booking with invalid office that does not belong to doctor', async () => {
    const invalidOfficeAppointment = {
      doctorId: 'doc-1',
      doctorName: 'دکتر مریم حسینی',
      doctorSpecialty: 'متخصص قلب و عروق',
      doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      clinicAddress: 'محل نامعتبر',
      patientId: 'user-patient-1',
      patientName: 'امیرحسین رضایی',
      patientPhone: '09121112233',
      date: '2026-08-20',
      timeSlot: '11:00',
      visitType: 'in_person' as const,
      officeId: 'off-non-existent',
      fee: 3000000,
      paidStatus: 'pending' as const
    };

    await expect(apiService.createAppointment(invalidOfficeAppointment)).rejects.toThrow(
      'اطلاعات محل ویزیت کامل نیست. لطفاً محل دیگری انتخاب کنید.'
    );
  });

  it('rejects booking if branchId contradicts office.branchId', async () => {
    const conflictingAppointment = {
      doctorId: 'doc-1',
      doctorName: 'دکتر مریم حسینی',
      doctorSpecialty: 'متخصص قلب و عروق',
      doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      clinicAddress: 'ونک',
      patientId: 'user-patient-1',
      patientName: 'امیرحسین رضایی',
      patientPhone: '09121112233',
      date: '2026-08-20',
      timeSlot: '11:30',
      visitType: 'in_person' as const,
      officeId: 'off-2', // off-2 belongs to branch-2
      branchId: 'branch-1', // Contradictory branch-1
      clinicId: 'clinic-1',
      fee: 3000000,
      paidStatus: 'pending' as const
    };

    await expect(apiService.createAppointment(conflictingAppointment)).rejects.toThrow(
      'اطلاعات محل ویزیت کامل نیست. لطفاً محل دیگری انتخاب کنید.'
    );
  });
});
