import { Appointment, ClinicBranch } from '../types';

export interface QueueContextParams {
  clinicId: string;
  branchId: string;
  date: string; // ISO date YYYY-MM-DD
  doctorId?: string;
}

export interface QueueStatusResult {
  clinicId: string;
  branchId: string;
  date: string;
  totalInQueue: number;
  currentServingQueueNumber: number | null;
  nextQueueNumber: number;
  estimatedWaitMinutes: number;
}

const STORAGE_KEY_APPOINTMENTS = 'synapse_appointments_v4';

function getStoredAppointments(): Appointment[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export const queueService = {
  /**
   * Generates the next deterministic, sequential queue number based strictly on Clinic + Branch + Date (and optional Doctor) context.
   * Avoids duplicate queue numbers within the same active queue.
   */
  async getNextQueueNumber(params: QueueContextParams): Promise<number> {
    const appointments = getStoredAppointments();
    
    // Filter appointments matching context
    const matching = appointments.filter(app => {
      if (app.status === 'canceled') return false;
      const clinicMatch = !params.clinicId || app.clinicId === params.clinicId;
      const branchMatch = !params.branchId || app.branchId === params.branchId;
      const dateMatch = app.date === params.date;
      const docMatch = !params.doctorId || app.doctorId === params.doctorId;
      return clinicMatch && branchMatch && dateMatch && docMatch;
    });

    // Extract all assigned queue positions
    const existingQueueNumbers = matching
      .map(a => a.queuePosition)
      .filter((q): q is number => typeof q === 'number' && Number.isInteger(q) && q > 0);

    if (existingQueueNumbers.length === 0) {
      // Also check matching without doctor filter if branch-wide queue is active
      const branchMatching = appointments.filter(app => {
        if (app.status === 'canceled') return false;
        const clinicMatch = !params.clinicId || app.clinicId === params.clinicId;
        const branchMatch = !params.branchId || app.branchId === params.branchId;
        const dateMatch = app.date === params.date;
        return clinicMatch && branchMatch && dateMatch;
      });
      const branchQueueNumbers = branchMatching
        .map(a => a.queuePosition)
        .filter((q): q is number => typeof q === 'number' && Number.isInteger(q) && q > 0);

      const maxBranch = branchQueueNumbers.length > 0 ? Math.max(...branchQueueNumbers) : 0;
      return maxBranch + 1;
    }

    const maxQueue = Math.max(...existingQueueNumbers);
    return maxQueue + 1;
  },

  /**
   * Calculates deterministic estimated wait minutes based on queue position and branch speed.
   */
  calculateEstimatedWaitMinutes(params: {
    queueNumber: number;
    averageMinutesPerPatient?: number;
    branchWaitMinutes?: number;
  }): number {
    const avgMins = params.averageMinutesPerPatient || params.branchWaitMinutes || 12;
    if (params.queueNumber <= 1) {
      return 5; // Ready to be called within 5 minutes
    }
    return Math.max(5, (params.queueNumber - 1) * avgMins);
  },

  /**
   * Retrieves full queue status for a specific clinic branch and date.
   */
  async getQueueStatus(params: QueueContextParams): Promise<QueueStatusResult> {
    const appointments = getStoredAppointments();
    const matching = appointments.filter(app => {
      if (app.status === 'canceled' || app.status === 'no_show') return false;
      const clinicMatch = !params.clinicId || app.clinicId === params.clinicId;
      const branchMatch = !params.branchId || app.branchId === params.branchId;
      const dateMatch = app.date === params.date;
      return clinicMatch && branchMatch && dateMatch;
    });

    const serving = matching.find(a => a.status === 'in_visit');
    const assignedQueuePositions = matching
      .map(a => a.queuePosition)
      .filter((q): q is number => typeof q === 'number' && q > 0);

    const nextNumber = await this.getNextQueueNumber(params);
    const estWait = this.calculateEstimatedWaitMinutes({ queueNumber: nextNumber });

    return {
      clinicId: params.clinicId,
      branchId: params.branchId,
      date: params.date,
      totalInQueue: matching.filter(a => a.status === 'scheduled' || a.status === 'arrived').length,
      currentServingQueueNumber: serving?.queuePosition || (assignedQueuePositions.length > 0 ? Math.min(...assignedQueuePositions) : null),
      nextQueueNumber: nextNumber,
      estimatedWaitMinutes: estWait
    };
  }
};
