import { AIActionRequest, AIActionExecutionResult, User, AppPermission } from '../types';
import { apiService } from './apiService';
import { hasPermission } from '../utils/authUtils';

export const aiActionRegistry = {
  /**
   * Executes a safe administrative action generated or suggested by AI.
   * Enforces role permissions and creates audit trail.
   */
  async executeAction(action: AIActionRequest, actor: User): Promise<AIActionExecutionResult> {
    const timestamp = new Date().toISOString();

    try {
      switch (action.actionKey) {
        case 'mark_arrived': {
          if (!hasPermission(actor, 'appointments.update')) {
            return {
              success: false,
              message: 'شما دسترسی لازم برای تغییر وضعیت نوبت به "اعلام حضور" را ندارید.',
              timestamp
            };
          }

          const appointmentId = action.parameters.appointmentId;
          if (!appointmentId) {
            return { success: false, message: 'شناسه نوبت نامعتبر است.', timestamp };
          }

          const updated = await apiService.updateAppointmentStatus(appointmentId, 'arrived', {
            actorUserId: actor.id,
            actorName: actor.name,
            actorRole: actor.role
          });

          if (!updated) {
            return { success: false, message: 'نوبت مورد نظر یافت نشد.', timestamp };
          }

          return {
            success: true,
            message: `اعلام حضور بیمار "${updated.patientName}" با موفقیت در صف ثبت شد.`,
            affectedEntityId: appointmentId,
            timestamp
          };
        }

        case 'create_task': {
          if (!hasPermission(actor, 'tasks.create')) {
            return {
              success: false,
              message: 'شما دسترسی لازم برای ثبت وظیفه جدید را ندارید.',
              timestamp
            };
          }

          const params = action.parameters;
          const created = await apiService.createTask({
            title: params.title || 'وظیفه پیگیری دستیار هوشمند',
            description: params.description || '',
            type: params.type || 'general',
            clinicId: actor.clinicId || '',
            branchId: actor.branchId,
            assignedTo: params.assignedTo || actor.id,
            assignedToName: params.assignedToName || actor.name,
            assignedRole: params.assignedRole || actor.role,
            createdBy: actor.id,
            createdByName: `${actor.name} (دستیار هوشمند)`,
            patientName: params.patientName,
            patientPhone: params.patientPhone,
            priority: params.priority || 'normal',
            status: 'todo',
            dueDate: params.dueDate || new Date().toISOString().split('T')[0]
          }, {
            actorUserId: actor.id,
            actorName: actor.name,
            actorRole: actor.role
          });

          return {
            success: true,
            message: `وظیفه "${created.title}" با اولویت ${created.priority} ثبت شد.`,
            affectedEntityId: created.id,
            timestamp
          };
        }

        case 'complete_task': {
          if (!hasPermission(actor, 'tasks.complete')) {
            return {
              success: false,
              message: 'شما دسترسی لازم برای تکمیل وظیفه را ندارید.',
              timestamp
            };
          }

          const taskId = action.parameters.taskId;
          if (!taskId) {
            return { success: false, message: 'شناسه وظیفه نامعتبر است.', timestamp };
          }

          const completed = await apiService.completeTask(taskId, action.parameters.notes || 'تکمیل شده توسط دستیار هوشمند', {
            actorUserId: actor.id,
            actorName: actor.name,
            actorRole: actor.role
          });

          if (!completed) {
            return { success: false, message: 'وظیفه مورد نظر یافت نشد.', timestamp };
          }

          return {
            success: true,
            message: `وظیفه "${completed.title}" تکمیل و بایگانی شد.`,
            affectedEntityId: taskId,
            timestamp
          };
        }

        case 'send_prototype_reminder': {
          if (!hasPermission(actor, 'notifications.manage')) {
            return {
              success: false,
              message: 'شما دسترسی لازم برای ارسال پیامک را ندارید.',
              timestamp
            };
          }

          const { phone, templateKey, patientName, doctorName, time, trackingCode } = action.parameters;
          if (!phone) {
            return { success: false, message: 'شماره تماس بیمار الزامی است.', timestamp };
          }

          const notif = await apiService.sendPrototypeReminder(
            phone,
            templateKey || 'appointment_reminder',
            {
              patientName: patientName || 'بیمار',
              doctorName: doctorName || 'پزشک معالج',
              time: time || 'ساعت مقرر',
              trackingCode
            },
            {
              actorUserId: actor.id,
              actorName: actor.name,
              actorRole: actor.role
            }
          );

          return {
            success: true,
            message: `پیام یادآوری در نسخه نمایشی ثبت شد (شبیه‌سازی پیامک برای ${phone}).`,
            affectedEntityId: notif.id,
            timestamp
          };
        }

        case 'confirm_appointment': {
          if (!hasPermission(actor, 'appointments.update')) {
            return {
              success: false,
              message: 'شما دسترسی لازم برای تأیید نوبت را ندارید.',
              timestamp
            };
          }

          const appointmentId = action.parameters.appointmentId;
          if (!appointmentId) {
            return { success: false, message: 'شناسه نوبت نامعتبر است.', timestamp };
          }

          const confirmed = await apiService.confirmAppointment(appointmentId, {
            actorUserId: actor.id,
            actorName: actor.name,
            actorRole: actor.role
          });

          if (confirmed) {
            return {
              success: true,
              message: `نوبت بیمار "${confirmed.patientName}" با موفقیت تأیید گردید.`,
              affectedEntityId: confirmed.id,
              timestamp
            };
          }
          return { success: false, message: 'نوبت مورد نظر یافت نشد.', timestamp };
        }

        case 'decline_appointment': {
          if (!hasPermission(actor, 'appointments.cancel')) {
            return {
              success: false,
              message: 'شما دسترسی لازم برای لغو یا رد نوبت را ندارید.',
              timestamp
            };
          }

          const appointmentId = action.parameters.appointmentId;
          if (!appointmentId) {
            return { success: false, message: 'شناسه نوبت نامعتبر است.', timestamp };
          }

          const declined = await apiService.declineAppointment(appointmentId, action.parameters.reason || 'عدم تأیید توسط دستیار منشی', {
            actorUserId: actor.id,
            actorName: actor.name,
            actorRole: actor.role
          });

          if (declined) {
            return {
              success: true,
              message: `نوبت بیمار "${declined.patientName}" لغو گردید.`,
              affectedEntityId: declined.id,
              timestamp
            };
          }
          return { success: false, message: 'نوبت مورد نظر یافت نشد.', timestamp };
        }

        default:
          return {
            success: false,
            message: `عملیات "${action.actionKey}" پشتیبانی نمی‌شود.`,
            timestamp
          };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `خطا در اجرای عملیات: ${err?.message || 'خطای ناشناخته'}`,
        timestamp
      };
    }
  }
};
