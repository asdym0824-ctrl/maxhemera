import { AppointmentStatus } from '../types';

/**
 * Validates whether an appointment can transition from one status to another.
 * Prevents invalid arbitrary transitions (e.g. completed -> arrived).
 */
export function canTransitionAppointment(from: AppointmentStatus, to: AppointmentStatus): boolean {
  if (from === to) return true;

  switch (from) {
    case 'scheduled':
      return to === 'arrived' || to === 'in_visit' || to === 'canceled' || to === 'no_show';

    case 'arrived':
      return to === 'in_visit' || to === 'canceled' || to === 'no_show';

    case 'in_visit':
      return to === 'completed' || to === 'canceled';

    case 'completed':
      // Completed visits are terminal unless overridden by admin
      return false;

    case 'canceled':
      // Canceled visits can only be reactivated back to scheduled if rescheduled
      return to === 'scheduled';

    case 'no_show':
      // No-show visits can be re-scheduled
      return to === 'scheduled' || to === 'arrived';

    default:
      return false;
  }
}

export function getValidNextStatuses(current: AppointmentStatus): AppointmentStatus[] {
  const all: AppointmentStatus[] = ['scheduled', 'arrived', 'in_visit', 'completed', 'canceled', 'no_show'];
  return all.filter(s => canTransitionAppointment(current, s));
}
