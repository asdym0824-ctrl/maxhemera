import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Phone, 
  Clock, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Appointment } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface SecretarySmsSenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppointment: Appointment | null;
  onSuccess: () => void;
}

export const SecretarySmsSenderModal: React.FC<SecretarySmsSenderModalProps> = ({
  isOpen,
  onClose,
  selectedAppointment,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [templateKey, setTemplateKey] = useState<
    'appointment_reminder' | 'appointment_confirmation' | 'rescheduled' | 'follow_up' | 'survey' | 'task_alert'
  >('appointment_reminder');
  const [recipientPhone, setRecipientPhone] = useState(selectedAppointment?.patientPhone || '');
  const [recipientName, setRecipientName] = useState(selectedAppointment?.patientName || '');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  React.useEffect(() => {
    if (selectedAppointment) {
      setRecipientPhone(selectedAppointment.patientPhone);
      setRecipientName(selectedAppointment.patientName);
      
      const doc = selectedAppointment.doctorName || 'پزشک معالج';
      const time = selectedAppointment.timeSlot || '۱۰:۰۰';
      const date = selectedAppointment.date || 'امروز';

      if (templateKey === 'appointment_reminder') {
        setCustomMessage(
          `بیمار گرامی ${selectedAppointment.patientName}، یادآوری نوبت شما با ${doc} در تاریخ ${date} ساعت ${time} در همرا کلینیک. لطفا ۱۵ دقیقه قبل از زمان مقرر در مطب حضور داشته باشید.`
        );
      } else if (templateKey === 'appointment_confirmation') {
        setCustomMessage(
          `بیمار گرامی ${selectedAppointment.patientName}، نوبت شما نزد ${doc} با موفقیت تایید شد. کد پیگیری: ${selectedAppointment.trackingCode || 'HC-998'}`
        );
      } else if (templateKey === 'follow_up') {
        setCustomMessage(
          `بیمار گرامی ${selectedAppointment.patientName}، پیرو ویزیت اخیر شما نزد ${doc}، لطفا دستورات دارویی و آزمایش‌های تجویزی را طبق برنامه پیگیری فرمایید.`
        );
      } else if (templateKey === 'survey') {
        setCustomMessage(
          `بیمار گرامی ${selectedAppointment.patientName}، از اینکه همرا کلینیک را انتخاب کردید متشکریم. لطفا با شرکت در نظرسنجی ما را در ارتقای کیفیت یاری فرمایید.`
        );
      }
    }
  }, [selectedAppointment, templateKey, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone.trim() || !customMessage.trim()) return;

    setSending(true);
    try {
      await apiService.sendSmsNotification({
        recipientPhone: recipientPhone.trim(),
        recipientName: recipientName.trim(),
        templateKey: templateKey,
        title: `اطلاعیه نوبت همرا کلینیک`,
        message: customMessage.trim()
      });

      await apiService.logActivity({
        actorUserId: currentUser.id || 'user-secretary',
        actorName: currentUser.name || 'منشی شیفت',
        actorRole: currentUser.role,
        action: 'ثبت پیامک (شبیه‌سازی)',
        entityType: 'notification',
        entityId: `sms-${Date.now()}`,
        description: `پیامک "${templateKey}" به شماره ${recipientPhone} در نسخه نمایشی ثبت شد.`
      });

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="شبیه‌ساز پیامک و اطلاع‌رسانی به بیمار (Prototype SMS)"
      maxWidth="2xl"
    >
      <form onSubmit={handleSend} className="space-y-4 text-xs">
        {/* Prototype notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>سامانه در حالت پیش‌نمایش است؛ پیامک‌های ارسالی در سیستم شبیه‌سازی و ثبت رویداد می‌شوند.</span>
        </div>

        {/* Templates selector */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">انتخاب الگوی پیامک (SMS Template):</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'appointment_reminder', label: 'یادآوری نوبت' },
              { id: 'appointment_confirmation', label: 'تایید نوبت' },
              { id: 'follow_up', label: 'پیگیری بعد ویزیت' },
              { id: 'survey', label: 'نظرسنجی رضایت' }
            ].map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplateKey(tpl.id as any)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  templateKey === tpl.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patient & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">نام گیرنده:</label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">شماره همراه:</label>
            <input
              type="tel"
              required
              value={recipientPhone}
              onChange={e => setRecipientPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden dir-ltr text-right font-mono"
            />
          </div>
        </div>

        {/* Message Editor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">متن پیامک ارسالی:</label>
            <span className="text-[11px] text-slate-400 font-mono">
              {customMessage.length} کاراکتر (۱ پیامک فارسی)
            </span>
          </div>
          <textarea
            rows={4}
            required
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Success Banner */}
        {sentSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>پیام یادآوری در نسخه نمایشی ثبت شد.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="secondary" size="md" type="button" onClick={onClose}>
            انصراف
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={sending || sentSuccess}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            {sending ? 'در حال ثبت...' : 'ثبت پیامک (نمایشی)'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
