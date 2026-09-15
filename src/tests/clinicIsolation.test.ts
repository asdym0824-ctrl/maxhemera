import { describe, it, expect } from 'vitest';
import { apiService } from '../services/apiService';

describe('Multi-Clinic and Branch Data Isolation', () => {
  it('Clinic A user cannot see Clinic B appointments', async () => {
    // Query appointments for clinic-1
    const clinic1Appointments = await apiService.getAppointmentsByClinic('clinic-1');
    expect(clinic1Appointments.length).toBeGreaterThan(0);
    expect(clinic1Appointments.every(a => a.clinicId === 'clinic-1')).toBe(true);

    // Query appointments for a non-existent or separate clinic
    const separateClinicAppointments = await apiService.getAppointmentsByClinic('clinic-separate-99');
    expect(separateClinicAppointments.length).toBe(0);
  });

  it('Branch A does not receive Branch B-only appointments when branch filter is applied', async () => {
    const branch1Appointments = await apiService.getAppointmentsByClinic('clinic-1', 'branch-1');
    expect(branch1Appointments.every(a => a.branchId === 'branch-1' || !a.branchId)).toBe(true);

    const branch2Appointments = await apiService.getAppointmentsByClinic('clinic-1', 'branch-2');
    expect(branch2Appointments.every(a => a.branchId === 'branch-2')).toBe(true);
  });

  it('Clinic tasks and staff are filtered strictly by clinicId', async () => {
    const clinic1Tasks = await apiService.getTasksByClinic('clinic-1');
    expect(clinic1Tasks.every(t => t.clinicId === 'clinic-1')).toBe(true);

    const separateClinicTasks = await apiService.getTasksByClinic('clinic-999');
    expect(separateClinicTasks.length).toBe(0);

    const clinic1Staff = await apiService.getStaffByClinic('clinic-1');
    expect(clinic1Staff.every(s => s.clinicId === 'clinic-1')).toBe(true);

    const separateStaff = await apiService.getStaffByClinic('clinic-999');
    expect(separateStaff.length).toBe(0);
  });
});
