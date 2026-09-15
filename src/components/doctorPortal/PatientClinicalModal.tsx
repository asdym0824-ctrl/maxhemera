import React, { useState, useEffect } from 'react';
import { Appointment, MedicalRecord, DoctorAiClinicalSummaryResponse } from '../../types';
import { Modal } from '../common/Modal';
import { generateDoctorAiClinicalSummary } from '../../services/aiService';
import { apiService } from '../../services/apiService';
import { 
  Sparkles, 
  Activity, 
  AlertTriangle, 
  Pill, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Send
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface PatientClinicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  records: MedicalRecord[];
}

export const PatientClinicalModal: React.FC<PatientClinicalModalProps> = ({
  isOpen,
  onClose,
  appointment,
  records
}) => {
  const [aiSummary, setAiSummary] = useState<DoctorAiClinicalSummaryResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);
  const [taskSentSuccess, setTaskSentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingAi(true);
      const historyText = records.length > 0
        ? records.map(r => `${r.title}: ${r.summary}`).join(' | ')
        : (appointment.symptomsNote || 'مراجعه جهت ویزیت بالینی');
      
      generateDoctorAiClinicalSummary(appointment.patientName, historyText).then(res => {
        setAiSummary(res);
        setIsLoadingAi(false);
      });
    }
  }, [isOpen, appointment, records]);

  const handleSendSecretaryTask = async () => {
    await apiService.createTask({
      clinicId: appointment.clinicId || '',
      branchId: appointment.branchId,
      title: `پیگیری دستور دارویی/آزمایش برای ${appointment.patientName}`,
      description: prescriptionNote || 'هماهنگی نوبت بعدی و ارسال دستورالعمل دارویی',
      type: 'doctor_request',
      priority: 'high',
      status: 'todo',
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      doctorId: appointment.doctorId,
      assignedTo: 'secretary-queue',
      assignedToName: 'منشی شیفت کلینیک',
      assignedRole: 'secretary',
      createdByName: appointment.doctorName || 'پزشک معالج',
      createdBy: appointment.doctorId || 'doctor',
      dueDate: new Date().toISOString().split('T')[0]
    }, {
      actorUserId: appointment.doctorId,
      actorName: appointment.doctorName || 'پزشک معالج',
      actorRole: 'doctor'
    });
    setTaskSentSuccess(true);
    setTimeout(() => setTaskSentSuccess(false), 4000);
  };

  const handleSignPrescription = async () => {
    if (!prescriptionNote.trim()) return;
    await apiService.logActivity({
      action: 'ثبت نسخه الکترونیک',
      entityType: 'patient',
      entityId: appointment.patientId,
      description: `ثبت نسخه الکترونیک و دستورات دارویی برای ${appointment.patientName}: ${prescriptionNote.trim().slice(0, 100)}`,
      actorUserId: appointment.doctorId,
      actorName: appointment.doctorName || 'پزشک معالج',
      actorRole: 'doctor',
      metadata: {
        appointmentId: appointment.id,
        clinicId: appointment.clinicId,
        branchId: appointment.branchId
      }
    });
    setPrescriptionSuccess(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`پرونده بالینی بیمار: ${appointment.patientName}`} maxWidth="4xl">
      <div className="space-y-6 text-xs text-slate-800">
        {/* Patient Vitals Bar */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-extrabold text-sm text-white">{appointment.patientName}</div>
            <div className="text-slate-400">
              کد پیگیری: {appointment.trackingCode} | همراه: {appointment.patientPhone || 'ثبت نشده'}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px]">نوع نوبت:</span>
              <span className="font-bold text-blue-300">
                {appointment.visitType === 'in_person' ? 'حضوری در مطب' : 'مشاوره آنلاین'}
              </span>
            </div>
            <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px]">ساعت ویزیت:</span>
              <span className="font-bold text-sky-300">{appointment.timeSlot}</span>
            </div>
          </div>
        </div>

        {/* AI Doctor Copilot Section */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 space-y-3 border border-blue-600/30">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-300">
              <Sparkles className="w-4 h-4 text-amber-300" />
              دستیار هوشمند بالینی پزشک (AI Doctor Copilot)
            </div>
            <Badge variant="blue" size="sm">پشتیبانی تصمیم‌گیری مستند</Badge>
          </div>

          {isLoadingAi ? (
            <div className="text-slate-400 py-2 animate-pulse">در حال تحلیل سوابق و استخراج نکات بالینی بیمار...</div>
          ) : (
            aiSummary && (
              <div className="space-y-3">
                <p className="text-slate-200 leading-relaxed font-medium">{aiSummary.summary}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {aiSummary.alerts.length > 0 && (
                    <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-200 space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        هشدارهای بالینی مستند:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {aiSummary.alerts.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiSummary.suggestedFocus.length > 0 && (
                    <div className="bg-blue-600/10 border border-blue-600/30 p-3 rounded-xl text-blue-200 space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-blue-300">
                        <Activity className="w-3.5 h-3.5" />
                        محورهای پیشنهادی تمرکز در ویزیت:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {aiSummary.suggestedFocus.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {aiSummary.missingInformation && aiSummary.missingInformation.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-200 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-amber-300">
                      <HelpCircle className="w-3.5 h-3.5" />
                      اطلاعات تکمیلی نیازمند استعلام از بیمار:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {aiSummary.missingInformation.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Clinical History Timeline */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            سوابق قبلی و نتایج آزمایشگاهی:
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
            {records.length === 0 ? (
              <div className="p-4 text-center text-slate-400">سوابق آزمایشگاهی قبلی در سیستم ثبت نشده است.</div>
            ) : (
              records.map(r => (
                <div key={r.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{r.title} ({r.date})</span>
                    <span className="text-slate-500 font-normal">{r.doctorName}</span>
                  </div>
                  <p className="text-slate-600">{r.summary}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* E-Prescription Form */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-sky-600" />
            ثبت نسخه الکترونیک و دستورات پزشک:
          </h4>
          <textarea
            rows={3}
            value={prescriptionNote}
            onChange={e => setPrescriptionNote(e.target.value)}
            placeholder="دستورات دارویی، آزمایش‌های درخواستی یا توضیحات مراقبتی..."
            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600/30"
          />

          {taskSentSuccess && (
            <div className="bg-indigo-50 text-indigo-800 p-2.5 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              وظیفه پیگیری با موفقیت برای منشی کلینیک ثبت شد.
            </div>
          )}

          {prescriptionSuccess ? (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              نسخه الکترونیک و دستورات پزشک با موفقیت در پرونده بیمار ثبت شد.
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSendSecretaryTask}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                ارسال دستور/پیگیری به منشی مطب
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSignPrescription}
              >
                امضا و ثبت نسخه الکترونیک
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
