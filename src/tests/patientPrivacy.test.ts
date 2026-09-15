import { describe, it, expect } from 'vitest';
import { apiService } from '../services/apiService';
import { aiContextService } from '../services/aiContextService';
import { User } from '../types';

describe('Patient Privacy & Medical Data Isolation', () => {
  it('Patient A cannot retrieve Patient B appointments via API service', async () => {
    const patientAId = 'user-patient-1';
    const patientBId = 'user-patient-2-unique';

    const patientAAppointments = await apiService.getAppointmentsByPatient(patientAId);
    // Every appointment returned MUST belong to patient A
    expect(patientAAppointments.every(a => a.patientId === patientAId)).toBe(true);

    const patientBAppointments = await apiService.getAppointmentsByPatient(patientBId);
    // No appointments leaked from patient A to patient B
    expect(patientBAppointments.length).toBe(0);
  });

  it('AI Patient Navigator Context strictly isolates data for authenticated patient', async () => {
    const patientA: User = {
      id: 'user-patient-1',
      name: 'امیرحسین رضایی',
      phone: '09121112233',
      role: 'patient'
    };

    const patientB: User = {
      id: 'user-patient-random-99',
      name: 'بیمار جدید',
      phone: '09120000000',
      role: 'patient'
    };

    const contextA = await aiContextService.buildPatientNavigationContext(patientA);
    expect(contextA.authenticatedPatient?.id).toBe('user-patient-1');

    const contextB = await aiContextService.buildPatientNavigationContext(patientB);
    expect(contextB.authenticatedPatient?.id).toBe('user-patient-random-99');
    expect(contextB.authenticatedPatient?.upcomingAppointments.length).toBe(0);

    // Anonymous visitor has no authenticated patient context
    const anonContext = await aiContextService.buildPatientNavigationContext(undefined);
    expect(anonContext.authenticatedPatient).toBeUndefined();
  });
});
