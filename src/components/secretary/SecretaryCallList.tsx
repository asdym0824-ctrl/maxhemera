import React, { useState } from 'react';
import { 
  PhoneCall, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { Appointment } from '../../types';
import { Button } from '../common/Button';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface SecretaryCallListProps {
  appointments: Appointment[];
  onRefresh: () => void;
  onOpenSms: (app: Appointment) => void;
}

export const SecretaryCallList: React.FC<SecretaryCallListProps> = ({
  appointments,
  onRefresh,
  onOpenSms
}) => {
  const { currentUser } = useAuth();
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [callNotes, setCallNotes] = useState('');
  const [filterMode, setFilterMode] = useState<'pending' | 'arrived' | 'all'>('pending');

  // Appointments needing confirmation/calling
  const scheduledList = appointments.filter(a => a.status === 'scheduled' || a.status === 'arrived');

  const filtered = scheduledList.filter(a => {
    if (filterMode === 'pending') return a.status === 'scheduled';
    if (filterMode === 'arrived') return a.status === 'arrived';
    return true;
  });

  const handleRecordOutcome = async (app: Appointment, outcome: 'arrived' | 'canceled' | 'no_answer') => {
    const actorInfo = {
      actorUserId: currentUser.id,
      actorName: currentUser.name || 'منشی شیفت',
      actorRole: currentUser.role
    };

    if (outcome === 'arrived') {
      await apiService.updateAppointmentStatus(app.id, 'arrived', actorInfo);
      await apiService.confirmAppointment(app.id, actorInfo);
    } else if (outcome === 'canceled') {
      await apiService.declineAppointment(app.id, callNotes || 'لغو نوبت توسط بیمار در تماس تلفنی', actorInfo);
    } else if (outcome === 'no_answer') {
      await apiService.createTask({
        clinicId: app.clinicId || currentUser.clinicId || '',
        branchId: app.branchId || currentUser.branchId,
        title: `تماس مجدد با ${app.patientName} (عدم پاسخگویی)`,
        description: 'بیمار در تماس اول پاسخگو نبود. پیامک یادآوری ارسال یا ۲ ساعت بعد تماس گرفته شود.',
        type: 'call_patient',
        priority: 'high',
        status: 'todo',
        patientName: app.patientName,
        patientPhone: app.patientPhone,
        doctorId: app.doctorId,
        assignedTo: currentUser.id,
        assignedToName: currentUser.name || 'منشی شیفت',
        assignedRole: 'secretary',
        createdByName: currentUser.name || 'منشی شیفت',
        createdBy: currentUser.id,
        dueDate: app.date
      }, actorInfo);
    }

    setActiveCallId(null);
    setCallNotes('');
    onRefresh();
  };

  const pendingCount = scheduledList.filter(a => a.status === 'scheduled').length;

  return (
    <div id="secretary-call-list" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-600/30">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2">
              لیست تماس‌ها و پیگیری تلفنی نوبت‌ها
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {pendingCount} نیازمند تماس
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تماس‌های یادآوری، تأیید نوبت‌های روز بعد و راهنمایی مدارک پزشکی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterMode === 'pending' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            نیازمند تماس ({pendingCount})
          </button>
          <button
            onClick={() => setFilterMode('arrived')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterMode === 'arrived' ? 'bg-blue-600 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            حاضران
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-bold text-slate-600">تمام نوبت‌های این بخش بررسی و پیگیری شده‌اند.</p>
          </div>
        ) : (
          filtered.map(app => {
            const isCalling = activeCallId === app.id;
            const isArrived = app.status === 'arrived';

            return (
              <div
                key={app.id}
                className={`p-4 rounded-xl border transition-all ${
                  isArrived
                    ? 'bg-blue-50/40 border-blue-200'
                    : isCalling
                    ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{app.patientName}</span>
                      <span className="text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {app.trackingCode}
                      </span>
                      {isArrived && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> حاضر در مطب
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                      <span>ساعت: <strong className="text-slate-700">{app.timeSlot}</strong> ({app.date})</span>
                      <span>پزشک: {app.doctorName}</span>
                      <span className="font-mono text-slate-800 font-semibold dir-ltr flex items-center gap-1">
                        📞 {app.patientPhone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenSms(app)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      پیامک
                    </button>

                    {!isArrived && (
                      <button
                        onClick={() => setActiveCallId(isCalling ? null : app.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                          isCalling
                            ? 'bg-slate-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        {isCalling ? 'بستن ثبت' : 'شروع تماس'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Call Outcome Logging Panel */}
                {isCalling && (
                  <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-2.5 animate-in fade-in">
                    <div className="text-xs font-bold text-slate-700">ثبت نتیجه تماس با بیمار:</div>
                    <input
                      type="text"
                      placeholder="یادداشت مکالمه (مثال: تأیید کرد، نتایج آزمایش سونوگرافی همراه دارد)..."
                      value={callNotes}
                      onChange={e => setCallNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => handleRecordOutcome(app, 'arrived')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        تأیید و ثبت حضور در مطب
                      </button>
                      <button
                        onClick={() => handleRecordOutcome(app, 'no_answer')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        پاسخ نداد (ثبت تسک پیگیری)
                      </button>
                      <button
                        onClick={() => handleRecordOutcome(app, 'canceled')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        لغو درخواست توسط بیمار
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
