import { Appointment } from '../types';

export interface RealtimeMessage {
  type: 'APPOINTMENT_CREATED' | 'APPOINTMENT_STATUS_UPDATED' | 'TASK_CREATED' | 'ACTIVITY_LOGGED';
  payload: any;
  timestamp: string;
  senderId?: string;
}

const CHANNEL_NAME = 'synapse_realtime_bus';

class RealtimeSyncService {
  private channel: BroadcastChannel | null = null;
  private audioCtx: AudioContext | null = null;
  private instanceId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event: MessageEvent<RealtimeMessage>) => {
            this.handleIncomingMessage(event.data);
          };
        }
      } catch (err) {
        console.warn('BroadcastChannel not supported or restricted, falling back to storage events:', err);
      }

      // Storage event fallback for cross-tab sync
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key === 'synapse_last_realtime_event' && e.newValue) {
          try {
            const data: RealtimeMessage = JSON.parse(e.newValue);
            if (data.senderId !== this.instanceId) {
              this.handleIncomingMessage(data);
            }
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  private handleIncomingMessage(msg: RealtimeMessage) {
    if (!msg || !msg.type) return;

    if (msg.type === 'APPOINTMENT_CREATED') {
      const app = msg.payload as Appointment;
      // Dispatch in-tab events
      window.dispatchEvent(new CustomEvent('synapse_appointments_updated', { detail: { appointment: app } }));
      window.dispatchEvent(new CustomEvent('synapse_new_appointment_alert', { detail: { appointment: app } }));
      window.dispatchEvent(new CustomEvent('synapse_activity_updated'));
      window.dispatchEvent(new CustomEvent('synapse_tasks_updated'));
    } else if (msg.type === 'APPOINTMENT_STATUS_UPDATED') {
      window.dispatchEvent(new CustomEvent('synapse_appointments_updated', { detail: msg.payload }));
    } else if (msg.type === 'TASK_CREATED') {
      window.dispatchEvent(new CustomEvent('synapse_tasks_updated', { detail: msg.payload }));
    }
  }

  /**
   * Broadcast newly booked appointment to all components, tabs, and sessions
   */
  public publishAppointmentCreated(appointment: Appointment) {
    if (typeof window === 'undefined') return;

    const message: RealtimeMessage = {
      type: 'APPOINTMENT_CREATED',
      payload: appointment,
      timestamp: new Date().toISOString(),
      senderId: this.instanceId
    };

    // 1. BroadcastChannel for active tabs
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {
        console.warn('Failed to post via BroadcastChannel:', e);
      }
    }

    // 2. Storage event for cross-tab fallback
    try {
      localStorage.setItem('synapse_last_realtime_event', JSON.stringify(message));
    } catch {
      // Storage quota or restriction
    }

    // 3. Local in-tab events
    window.dispatchEvent(new CustomEvent('synapse_appointments_updated', { detail: { appointment } }));
    window.dispatchEvent(new CustomEvent('synapse_new_appointment_alert', { detail: { appointment } }));
    window.dispatchEvent(new CustomEvent('synapse_activity_updated'));
    window.dispatchEvent(new CustomEvent('synapse_tasks_updated'));
  }

  /**
   * Subscribe to new appointment alerts in any component
   */
  public subscribeToNewAppointments(callback: (app: Appointment) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ appointment: Appointment }>;
      if (customEvent.detail?.appointment) {
        callback(customEvent.detail.appointment);
      }
    };

    window.addEventListener('synapse_new_appointment_alert', handler);
    return () => {
      window.removeEventListener('synapse_new_appointment_alert', handler);
    };
  }

  /**
   * Play a gentle medical chime when a new appointment arrives
   */
  public playGentleChime(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const now = this.audioCtx.currentTime;

      // Note 1: 880Hz (A5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.16);

      // Note 2: 1174Hz (D6)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174, now + 0.12);
      gain2.gain.setValueAtTime(0.1, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.36);
    } catch {
      // Audio playback restrictions or user hasn't interacted with page yet
    }
  }
}

export const realtimeSyncService = new RealtimeSyncService();
