import { describe, it, expect } from 'vitest';
import { aiActionRegistry } from '../services/aiActionRegistry';
import { apiService } from '../services/apiService';
import { User, AIActionRequest } from '../types';

describe('AI Safety, Simulation Flags & Permission Enforcement', () => {
  const patientUser: User = {
    id: 'user-patient-1',
    name: 'بیمار',
    phone: '09121112233',
    role: 'patient'
  };

  const secretaryUser: User = {
    id: 'user-sec-1',
    name: 'سارا کاظمی',
    phone: '09125556677',
    role: 'secretary',
    clinicId: 'clinic-1',
    branchId: 'branch-1'
  };

  it('rejects unauthorized AI actions when executed by patient', async () => {
    // Patient attempts to mark appointment arrived via AI action
    const markArrivedReq: AIActionRequest = {
      id: 'act-test-1',
      actionKey: 'mark_arrived',
      level: 1,
      title: 'اعلام حضور بیمار',
      description: 'ثبت ورود بیمار به مطب',
      parameters: { appointmentId: 'app-1' },
      requiresConfirmation: false
    };

    const result = await aiActionRegistry.executeAction(markArrivedReq, patientUser);

    expect(result.success).toBe(false);
    expect(result.message).toContain('شما دسترسی لازم');

    // Patient attempts to send SMS notification
    const sendSmsReq: AIActionRequest = {
      id: 'act-test-2',
      actionKey: 'send_prototype_reminder',
      level: 2,
      title: 'ارسال پیامک یادآوری',
      description: 'ارسال پیامک آزمایشی به بیمار',
      parameters: { phone: '09120000000' },
      requiresConfirmation: true
    };

    const smsResult = await aiActionRegistry.executeAction(sendSmsReq, patientUser);

    expect(smsResult.success).toBe(false);
    expect(smsResult.message).toContain('شما دسترسی لازم');
  });

  it('prototype SMS operations clearly tag deliveryMode as prototype and log simulation', async () => {
    const notif = await apiService.sendPrototypeReminder(
      '09121112233',
      'appointment_reminder',
      {
        patientName: 'امیرحسین',
        doctorName: 'دکتر مریم حسینی',
        time: '16:00',
        trackingCode: 'HC-TEST-99'
      },
      {
        actorUserId: secretaryUser.id,
        actorName: secretaryUser.name,
        actorRole: secretaryUser.role
      }
    );

    expect(notif.deliveryMode).toBe('prototype');
    expect(notif.type).toBe('sms');
    expect(notif.status).toBe('sent');
  });

  it('AI does not fabricate non-existent doctor profiles or availability', async () => {
    const invalidDoctor = await apiService.getDoctorBySlug('dr-non-existent-fabrication-999');
    expect(invalidDoctor).toBeUndefined();

    const emptySlots = await apiService.calculateAvailableSlots({
      doctorId: 'doc-non-existent',
      date: '2026-08-30'
    });
    expect(emptySlots.length).toBe(0);
  });
});
