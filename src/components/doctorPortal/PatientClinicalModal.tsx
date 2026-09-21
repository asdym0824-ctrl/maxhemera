import React, { useState, useEffect } from 'react';
import { Appointment, MedicalRecord, DoctorAiClinicalSummaryResponse } from '../../types';
import { Modal } from '../common/Modal';
import { generateDoctorAiClinicalSummary } from '../../services/aiService';
import { apiService } from '../../services/apiService';
import { realtimeSyncService } from '../../services/realtimeSyncService';
import { formatToPersianDate } from '../../utils/dateUtils';
import { 
  Sparkles, 
  Activity, 
  AlertTriangle, 
  Pill, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Send,
  Zap,
  RotateCcw,
  Plus
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface PatientClinicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  records: MedicalRecord[];
  onPrescriptionSaved?: (record: MedicalRecord) => void;
}

function parsePrescriptionMedications(text: string): { name: string; dosage: string; frequency: string; duration: string }[] {
  if (!text.trim()) return [];
  const lines = text
    .split(/[\n،,]+/)
    .map(l => l.trim().replace(/^[-•*–—\d.)]+\s*/, ''))
    .filter(l => l.length > 1);

  if (lines.length === 0) return [];

  return lines.map(line => {
    let dosage = 'طبق دستور';
    const dosageMatch = line.match(/(\d+|[\u06F0-\u06F9]+)\s*(mg|میلی‌گرم|gr|گرم|قطره|cc|سی‌سی)/i);
    if (dosageMatch) {
      dosage = dosageMatch[0];
    }

    let frequency = 'طبق دستور پزشک';
    if (/هر\s*(\d+|[\u06F0-\u06F9]+)\s*ساعت/.test(line)) {
      frequency = line.match(/هر\s*(\d+|[\u06F0-\u06F9]+)\s*ساعت/)?.[0] || 'هر ۸ ساعت';
    } else if (/روزی\s*(\d+|[\u06F0-\u06F9]+)\s*(بار|عدد|بار|وعده)/.test(line)) {
      frequency = line.match(/روزی\s*(\d+|[\u06F0-\u06F9]+)\s*(بار|عدد|بار|وعده)/)?.[0] || 'روزانه';
    } else if (/شب‌ها|قبل از خواب/.test(line)) {
      frequency = 'شب‌ها قبل خواب';
    } else if (/صبح‌ها|صبح ناشتا/.test(line)) {
      frequency = 'صبح‌ها ناشتا';
    }

    let duration = 'دوره درمان';
    const durationMatch = line.match(/(\d+|[\u06F0-\u06F9]+)\s*(روز|هفته|ماه)/);
    if (durationMatch) {
      duration = durationMatch[0];
    }

    return {
      name: line,
      dosage,
      frequency,
      duration
    };
  });
}

export const PatientClinicalModal: React.FC<PatientClinicalModalProps> = ({
  isOpen,
  onClose,
  appointment,
  records,
  onPrescriptionSaved
}) => {
  const [aiSummary, setAiSummary] = useState<DoctorAiClinicalSummaryResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [localRecords, setLocalRecords] = useState<MedicalRecord[]>(records);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [isSubmittingPrescription, setIsSubmittingPrescription] = useState(false);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);
  const [taskSentSuccess, setTaskSentSuccess] = useState(false);

  useEffect(() => {
    setLocalRecords(records);
  }, [records]);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingAi(true);
      const historyText = localRecords.length > 0
        ? localRecords.map(r => `${r.title}: ${r.summary}`).join(' | ')
        : (appointment.symptomsNote || 'مراجعه جهت ویزیت بالینی');
      
      generateDoctorAiClinicalSummary(appointment.patientName, historyText).then(res => {
        setAiSummary(res);
        setIsLoadingAi(false);
      });
    }
  }, [isOpen, appointment, localRecords]);

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
    setIsSubmittingPrescription(true);

    try {
      const parsedMeds = parsePrescriptionMedications(prescriptionNote);

      const newRecord: MedicalRecord = {
        id: `rec-${Date.now()}`,
        patientId: appointment.patientId,
        date: formatToPersianDate(new Date()),
        title: `نسخه الکترونیک و دستورات دارویی (${appointment.doctorSpecialty || 'ویزیت تخصصی'})`,
        type: 'prescription',
        doctorName: appointment.doctorName || 'پزشک معالج',
        doctorSpecialty: appointment.doctorSpecialty || 'پزشک متخصص',
        summary: prescriptionNote.trim().slice(0, 160) + (prescriptionNote.trim().length > 160 ? '...' : ''),
        details: prescriptionNote.trim(),
        medications: parsedMeds.length > 0 ? parsedMeds : [{
          name: prescriptionNote.trim(),
          dosage: 'طبق دستور',
          frequency: 'طبق نسخه',
          duration: 'دوره درمان'
        }]
      };

      // 1. Save to persistent storage
      const savedRecord = await apiService.addMedicalRecord(newRecord);

      // 2. Broadcast via real-time bus (BroadcastChannel + localStorage + window event)
      realtimeSyncService.publishMedicalRecordCreated(savedRecord);
      realtimeSyncService.playGentleChime();

      // 3. Log activity in system
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

      // 4. Update in-modal timeline
      setLocalRecords(prev => [savedRecord, ...prev]);
      onPrescriptionSaved?.(savedRecord);

      setPrescriptionSuccess(true);
    } catch (err) {
      console.error('Failed to sign prescription:', err);
    } finally {
      setIsSubmittingPrescription(false);
    }
  };

  const handleApplyPreset = (presetText: string) => {
    setPrescriptionNote(prev => prev ? `${prev}\n${presetText}` : presetText);
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
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              سوابق قبلی و نتایج آزمایشگاهی:
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              {localRecords.length} سند بالینی ثبت‌شده
            </span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
            {localRecords.length === 0 ? (
              <div className="p-4 text-center text-slate-400">سوابق آزمایشگاهی قبلی در سیستم ثبت نشده است.</div>
            ) : (
              localRecords.map(r => (
                <div key={r.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700">{r.title}</span>
                      <span className="text-slate-400 text-[10px] font-normal">({r.date})</span>
                    </div>
                    <span className="text-slate-500 font-normal">{r.doctorName}</span>
                  </div>
                  <p className="text-slate-600">{r.summary}</p>
                  {r.medications && r.medications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {r.medications.map((m, mIdx) => (
                        <span key={mIdx} className="bg-sky-50 text-sky-800 border border-sky-100 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                          💊 {m.name} ({m.dosage} - {m.frequency})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* E-Prescription Form */}
        <div id="doctor-e-prescription-card" className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-sky-600" />
              <span>ثبت نسخه الکترونیک و دستورات پزشک:</span>
            </h4>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>همگام‌سازی درجا با پنل بیمار (Real-Time Sync)</span>
            </div>
          </div>

          <textarea
            id="doctor-prescription-textarea"
            rows={3}
            value={prescriptionNote}
            onChange={e => setPrescriptionNote(e.target.value)}
            placeholder="دستورات دارویی، آزمایش‌های درخواستی یا توضیحات مراقبتی (مثال: قرص لوزارتان ۲۵ روزی یک عدد)..."
            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600/30 text-xs sm:text-sm leading-relaxed"
          />

          {/* Quick Prescription Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 font-semibold">قالب‌های سریع:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('قرص لوزارتان ۲۵ میلی‌گرم - روزی ۱ عدد صبح‌ها')}
              className="px-2 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-sky-600" />
              لوزارتان ۲۵
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('کپسول آموکسی‌سیلین ۵۰۰ - هر ۸ ساعت یک عدد بعد از غذا')}
              className="px-2 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-sky-600" />
              آموکسی‌سیلین ۵۰۰
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('شربت دیفن‌هیدرامین کامپاند - هر ۸ ساعت یک قاشق غذاخوری')}
              className="px-2 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-sky-600" />
              شربت دیفن‌هیدرامین
            </button>
          </div>

          {taskSentSuccess && (
            <div className="bg-indigo-50 text-indigo-800 p-2.5 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              وظیفه پیگیری با موفقیت برای منشی کلینیک ثبت شد.
            </div>
          )}

          {prescriptionSuccess ? (
            <div className="space-y-2">
              <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-3.5 rounded-xl font-bold flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div>نسخه الکترونیک و دستورات پزشک با موفقیت ثبت شد.</div>
                    <div className="text-[11px] text-emerald-700 font-normal mt-0.5">
                      اطلاعات درجا در پنل بیمار ({appointment.patientName}) و تایم‌لاین پرونده بالینی سلامت منعکس گردید.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrescriptionNote('');
                    setPrescriptionSuccess(false);
                  }}
                  className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  ثبت نسخه جدید
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleSendSecretaryTask}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                ارسال دستور/پیگیری به منشی مطب
              </button>

              <Button
                id="sign-prescription-btn"
                variant="primary"
                size="sm"
                isLoading={isSubmittingPrescription}
                onClick={handleSignPrescription}
                className="cursor-pointer"
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
