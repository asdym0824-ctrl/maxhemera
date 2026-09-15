import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  UserCheck, 
  XCircle, 
  MessageSquare, 
  PhoneCall, 
  AlertTriangle, 
  Filter, 
  Search,
  MoreVertical,
  PlusCircle
} from 'lucide-react';
import { Appointment, Doctor, AppointmentStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface SecretaryQueueTableProps {
  appointments: Appointment[];
  doctors: Doctor[];
  onRefresh: () => void;
  onOpenSms: (app: Appointment) => void;
  onOpenCheckIn: () => void;
  onCreateTaskForPatient: (app: Appointment) => void;
}

export const SecretaryQueueTable: React.FC<SecretaryQueueTableProps> = ({
  appointments,
  doctors,
  onRefresh,
  onOpenSms,
  onOpenCheckIn,
  onCreateTaskForPatient
}) => {
  const { currentUser } = useAuth();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const statusConfig: Record<AppointmentStatus, { label: string; badge: any; bg: string }> = {
    scheduled: { label: 'رزرو شده (در راه)', badge: 'blue', bg: 'bg-sky-50 text-sky-800 border-sky-200' },
    arrived: { label: 'حاضر در سالن انتظار', badge: 'amber', bg: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/40' },
    in_visit: { label: 'در حال ویزیت با پزشک', badge: 'purple', bg: 'bg-purple-50 text-purple-800 border-purple-300 ring-2 ring-purple-400/40 animate-pulse' },
    completed: { label: 'ویزیت تکمیل شد', badge: 'green', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    canceled: { label: 'لغو شده', badge: 'rose', bg: 'bg-rose-50 text-rose-800 border-rose-200' },
    no_show: { label: 'عدم مراجعه (No-Show)', badge: 'slate', bg: 'bg-slate-100 text-slate-600 border-slate-200' }
  };

  // Filter today's list
  const filtered = appointments.filter(app => {
    if (selectedDoctorId !== 'all' && app.doctorId !== selectedDoctorId) return false;
    
    if (statusFilter === 'active') {
      if (app.status === 'completed' || app.status === 'canceled' || app.status === 'no_show') return false;
    } else if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.patientName.toLowerCase().includes(q);
      const matchCode = app.trackingCode.toLowerCase().includes(q);
      const matchPhone = app.patientPhone.includes(q);
      if (!matchName && !matchCode && !matchPhone) return false;
    }

    return true;
  });

  const handleStatusChange = async (appId: string, newStatus: AppointmentStatus, patientName: string) => {
    await apiService.updateAppointmentStatus(appId, newStatus, {
      actorUserId: currentUser.id,
      actorName: currentUser.name || 'منشی پذیرش',
      actorRole: currentUser.role
    });
    onRefresh();
  };

  const handleConfirmAppointment = async (appId: string) => {
    await apiService.confirmAppointment(appId, {
      actorUserId: currentUser.id,
      actorName: currentUser.name || 'منشی پذیرش',
      actorRole: currentUser.role
    });
    onRefresh();
  };

  const arrivedCount = appointments.filter(a => a.status === 'arrived').length;
  const inVisitCount = appointments.filter(a => a.status === 'in_visit').length;
  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div id="secretary-queue-container" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Banner Stats */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-600/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2">
              صف زنده نوبت‌ها و پذیرش امروز کلینیک
              <span className="text-[10px] font-bold bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-600/40">
                Live Hamrah Clinic Queue
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مدیریت ورود مراجعین، فراخوانی به اتاق پزشک و به‌روزرسانی لحظه‌ای
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCheckIn}
            icon={<UserCheck className="w-4 h-4" />}
          >
            اعلام حضور / پذیرش سریع
          </Button>
        </div>
      </div>

      {/* Quick Filter Pill Metrics */}
      <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            جاری و در حال انتظار ({arrivedCount + inVisitCount + scheduledCount})
          </button>
          <button
            onClick={() => setStatusFilter('arrived')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
              statusFilter === 'arrived'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            حاضر در سالن ({arrivedCount})
          </button>
          <button
            onClick={() => setStatusFilter('in_visit')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
              statusFilter === 'in_visit'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            داخل اتاق پزشک ({inVisitCount})
          </button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'scheduled'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            نوبت‌های آینده امروز ({scheduledCount})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            تکمیل‌شده ({completedCount})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            همه ({appointments.length})
          </button>
        </div>

        {/* Doctor and Search filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDoctorId}
            onChange={e => setSelectedDoctorId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">همه پزشکان شیفت</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.specialtyName})</option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="جستجو نام، کد..."
              className="w-full pl-2 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
              <th className="py-3 px-4">ردیف</th>
              <th className="py-3 px-4">بیمار / کد پیگیری</th>
              <th className="py-3 px-4">ساعت نوبت</th>
              <th className="py-3 px-4">پزشک معالج</th>
              <th className="py-3 px-4">وضعیت حضور</th>
              <th className="py-3 px-4">اطلاعات تکمیلی</th>
              <th className="py-3 px-4 text-center">اقدامات فوری منشی</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  هیچ نوبتی با فیلترهای انتخابی یافت نشد.
                </td>
              </tr>
            ) : (
              filtered.map((app, idx) => {
                const conf = statusConfig[app.status] || statusConfig.scheduled;
                return (
                  <tr 
                    key={app.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      app.status === 'in_visit' ? 'bg-purple-50/40' : app.status === 'arrived' ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{app.patientName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {app.trackingCode}
                        </span>
                        <span className="text-[11px] text-slate-400 dir-ltr">{app.patientPhone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.timeSlot}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{app.date}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{app.doctorName}</div>
                      <div className="text-[10px] text-slate-500">{app.doctorSpecialty}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${conf.bg}`}>
                        {app.status === 'in_visit' && <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>}
                        {app.status === 'arrived' && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                        {conf.label}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] text-slate-600 max-w-xs truncate">
                        {app.symptomsNote || 'ویزیت حضوری عادی'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        پرداخت: {app.paidStatus === 'paid' ? '✅ پرداخت شده' : '⚠️ در مطب'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Status workflow triggers */}
                        {app.status === 'scheduled' && (
                          <button
                            onClick={() => handleStatusChange(app.id, 'arrived', app.patientName)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="ثبت حضور در مطب"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            اعلام حضور
                          </button>
                        )}

                        {app.status === 'arrived' && (
                          <button
                            onClick={() => handleStatusChange(app.id, 'in_visit', app.patientName)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="فراخوانی به اتاق پزشک"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            ورود به اتاق ویزیت
                          </button>
                        )}

                        {app.status === 'in_visit' && (
                          <button
                            onClick={() => handleStatusChange(app.id, 'completed', app.patientName)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="پایان ویزیت"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            پایان ویزیت
                          </button>
                        )}

                        {/* Quick SMS button */}
                        <button
                          onClick={() => onOpenSms(app)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="ارسال پیامک یا یادآوری"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Quick Task delegation button */}
                        <button
                          onClick={() => onCreateTaskForPatient(app)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="ثبت تسک یا پیگیری برای این بیمار"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
