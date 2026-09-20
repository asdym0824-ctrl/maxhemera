import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  CheckSquare, 
  PhoneCall, 
  UserCheck, 
  RefreshCw, 
  Activity, 
  Layers,
  Building2,
  MessageSquare,
  Bell,
  X
} from 'lucide-react';
import { Appointment, ClinicTask, Doctor, ActivityLog } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { isAppointmentToday, formatPersianTimestamp } from '../utils/dateUtils';
import { Button } from '../components/common/Button';
import { SecretaryQueueTable } from '../components/secretary/SecretaryQueueTable';
import { SecretaryTaskCenter } from '../components/secretary/SecretaryTaskCenter';
import { SecretaryCallList } from '../components/secretary/SecretaryCallList';
import { SecretaryAiCopilot } from '../components/secretary/SecretaryAiCopilot';
import { SecretaryQuickCheckInModal } from '../components/secretary/SecretaryQuickCheckInModal';
import { SecretarySmsSenderModal } from '../components/secretary/SecretarySmsSenderModal';

export const SecretaryWorkspacePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'queue' | 'tasks' | 'calls' | 'logs' | 'sms' | null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<ClinicTask[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'queue' | 'tasks' | 'calls' | 'logs'>(
    tabParam === 'tasks' || tabParam === 'calls' || tabParam === 'logs' ? tabParam : 'queue'
  );

  const handleTabChange = (tab: 'queue' | 'tasks' | 'calls' | 'logs') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (tabParam === 'queue' || tabParam === 'tasks' || tabParam === 'calls' || tabParam === 'logs') {
      setActiveTab(tabParam);
    } else if (tabParam === 'sms') {
      setSmsModalOpen(true);
    }
  }, [tabParam]);

  // Modals
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [selectedAppointmentForSms, setSelectedAppointmentForSms] = useState<Appointment | null>(null);

  useEffect(() => {
    const handleOpenQuickCheckin = () => {
      setCheckInModalOpen(true);
    };
    window.addEventListener('synapse_open_quick_checkin', handleOpenQuickCheckin);
    return () => {
      window.removeEventListener('synapse_open_quick_checkin', handleOpenQuickCheckin);
    };
  }, []);

  const clinicId = currentUser.clinicId || 'clinic-1';
  const branchId = currentUser.branchId || 'branch-1';
  const [latestIncomingAlert, setLatestIncomingAlert] = useState<Appointment | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, tsks, docs, logs, ov] = await Promise.all([
        apiService.getAppointmentsByClinic(clinicId, branchId),
        apiService.getTasksByClinic(clinicId, branchId),
        apiService.getClinicDoctors(clinicId, branchId),
        apiService.getActivityLogs(35),
        apiService.getClinicTodayOverview(clinicId, branchId)
      ]);
      setAppointments(apps);
      setTasks(tsks);
      setDoctors(docs);
      setActivityLogs(logs);
      setOverview(ov);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to reactive updates
    const handleUpdate = () => loadData();
    const handleNewBooking = (e: Event) => {
      const ce = e as CustomEvent<{ appointment: Appointment }>;
      if (ce.detail?.appointment) {
        setLatestIncomingAlert(ce.detail.appointment);
        loadData();
      }
    };

    window.addEventListener('synapse_appointments_updated', handleUpdate);
    window.addEventListener('synapse_new_appointment_alert', handleNewBooking);
    window.addEventListener('synapse_tasks_updated', handleUpdate);
    window.addEventListener('synapse_activity_updated', handleUpdate);

    return () => {
      window.removeEventListener('synapse_appointments_updated', handleUpdate);
      window.removeEventListener('synapse_new_appointment_alert', handleNewBooking);
      window.removeEventListener('synapse_tasks_updated', handleUpdate);
      window.removeEventListener('synapse_activity_updated', handleUpdate);
    };
  }, [clinicId, branchId]);

  if (!clinicId) {
    return (
      <div id="secretary-unassigned-state" className="min-h-[55vh] flex items-center justify-center p-6 text-right font-sans" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            حساب کاربری شما به کلینیک مشخصی متصل نشده است.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            برای دسترسی به میز کار منشی و پذیرش، لطفاً با مدیر سیستم تماس بگیرید تا دسترسی کلینیک و شعبه مربوطه برای شما فعال گردد.
          </p>
          <div className="pt-2 text-xs text-slate-400 border-t border-slate-100">
            نام کاربر: {currentUser.name || 'نامشخص'} | نقش: {currentUser.role}
          </div>
        </div>
      </div>
    );
  }

  const handleOpenSmsForApp = (app: Appointment) => {
    setSelectedAppointmentForSms(app);
    setSmsModalOpen(true);
  };

  const handleOpenSmsCustom = (phone: string, name: string) => {
    setSelectedAppointmentForSms({
      id: 'custom',
      clinicId,
      branchId,
      trackingCode: 'HC-DIRECT',
      doctorId: '',
      doctorName: '',
      doctorSpecialty: '',
      doctorAvatar: '',
      patientId: 'custom',
      patientName: name,
      patientPhone: phone,
      patientAge: undefined,
      visitType: 'in_person',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '۱۰:۰۰',
      status: 'scheduled',
      clinicAddress: '',
      fee: 0,
      paidStatus: 'paid',
      createdAt: ''
    });
    setSmsModalOpen(true);
  };

  const handleCreateTaskForPatient = async (app: Appointment) => {
    await apiService.createTask({
      clinicId: app.clinicId || clinicId,
      branchId: app.branchId || branchId,
      title: `پیگیری بعد از ویزیت برای ${app.patientName}`,
      description: `پیگیری وضعیت دارویی و نوبت بعدی نزد ${app.doctorName}`,
      type: 'call_patient',
      priority: 'high',
      status: 'todo',
      patientName: app.patientName,
      patientPhone: app.patientPhone,
      doctorId: app.doctorId,
      assignedTo: currentUser.id || 'secretary-queue',
      assignedToName: currentUser.name || 'منشی شیفت',
      assignedRole: 'secretary',
      createdByName: currentUser.name || 'منشی شیفت',
      createdBy: currentUser.id || 'user-secretary',
      dueDate: app.date
    }, {
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role
    });
    loadData();
    setActiveTab('tasks');
  };

  const todayApps = appointments.filter(isAppointmentToday);
  const arrivedCount = todayApps.filter(a => a.status === 'arrived').length;
  const inVisitCount = todayApps.filter(a => a.status === 'in_visit').length;
  const urgentTaskCount = tasks.filter(t => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')).length;
  const unconfirmedCalls = todayApps.filter(a => a.status === 'scheduled').length;
  const avgWaitTime = overview?.estimatedAvgWaitMinutes ?? 0;
  const activeDocCount = overview?.activeDoctorsCount ?? doctors.length;

  return (
    <div id="secretary-workspace-page" className="space-y-6 pb-12 animate-in fade-in">
      {/* Page Hero Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl text-slate-900">میزکار جامع منشی و پذیرش کلینیک</h1>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                کاربر فعال: {currentUser.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              مدیریت هوشمند صف انتظار، ورود مراجعین، وظایف پیگیری و گردش بیماران در شیفت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            تازه‌سازی
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCheckInModalOpen(true)}
            icon={<UserCheck className="w-4 h-4" />}
          >
            اعلام حضور فوری
          </Button>
        </div>
      </div>

      {/* Real-time Incoming Booking Alert for Receptionist */}
      {latestIncomingAlert && (
        <div id="secretary-live-booking-alert" className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-3xl border border-indigo-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/40">
              <Bell className="w-6 h-6 animate-bounce text-indigo-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-indigo-200">رزرو نوبت جدید اینترنتی توسط بیمار</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">دریافت شد</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                بیمار <strong className="text-white">{latestIncomingAlert.patientName}</strong> ({latestIncomingAlert.patientPhone}) نوبت {latestIncomingAlert.visitType === 'in_person' ? 'حضوری' : 'آنلاین'} برای <strong>دکتر {latestIncomingAlert.doctorName}</strong> رزرو کرد.
                <span className="inline-block mr-2 font-mono text-[11px] text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-700/50">
                  تاریخ: {latestIncomingAlert.date} | ساعت: {latestIncomingAlert.timeSlot} | رهگیری: {latestIncomingAlert.trackingCode}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                setSelectedAppointmentForSms(latestIncomingAlert);
                setSmsModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>ارسال پیامک تایید</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleCreateTaskForPatient(latestIncomingAlert);
              }}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>وظیفه پیگیری منشی</span>
            </button>
            <button
              type="button"
              onClick={() => setLatestIncomingAlert(null)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => setActiveTab('queue')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>حاضر در سالن انتظار</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 flex items-baseline gap-1.5">
            {arrivedCount}
            <span className="text-xs font-semibold text-slate-400">بیمار</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">میانگین انتظار: {avgWaitTime} دقیقه</div>
        </div>

        <div 
          onClick={() => setActiveTab('queue')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>در حال ویزیت</span>
            <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700 flex items-baseline gap-1.5">
            {inVisitCount}
            <span className="text-xs font-semibold text-slate-400">اتاق فعال</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{activeDocCount} پزشک در شیفت حاضرند</div>
        </div>

        <div 
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>وظایف و پیگیری‌ها</span>
            <CheckSquare className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-700 flex items-baseline gap-1.5">
            {tasks.filter(t => t.status !== 'completed').length}
            {urgentTaskCount > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                {urgentTaskCount} فوری
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">دستورات پزشکان و آزمایش‌ها</div>
        </div>

        <div 
          onClick={() => setActiveTab('calls')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>تماس‌های تأیید نوبت</span>
            <PhoneCall className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700 flex items-baseline gap-1.5">
            {unconfirmedCalls}
            <span className="text-xs font-semibold text-slate-400">تماس</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">یادآوری نوبت‌های امروز</div>
        </div>
      </div>

      {/* Embedded Operations AI Copilot */}
      <SecretaryAiCopilot 
        onTriggerBulkReminder={() => setSmsModalOpen(true)}
        onFilterUrgent={() => setActiveTab('tasks')}
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-2 text-xs font-bold overflow-x-auto no-scrollbar flex-nowrap scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => handleTabChange('queue')}
          className={`pb-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'queue'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>صف زنده و اعلام حضور امروز</span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">
            {todayApps.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('tasks')}
          className={`pb-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'tasks'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>مرکز وظایف و پیگیری‌ها (Task Center)</span>
          {urgentTaskCount > 0 && (
            <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px]">
              {urgentTaskCount} فوری
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('calls')}
          className={`pb-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'calls'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>لیست تماس‌ها و یادآوری</span>
        </button>

        <button
          onClick={() => handleTabChange('logs')}
          className={`pb-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>لاگ و فعالیت‌های شیفت</span>
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'queue' && (
        <SecretaryQueueTable
          appointments={todayApps}
          doctors={doctors}
          onRefresh={loadData}
          onOpenSms={handleOpenSmsForApp}
          onOpenCheckIn={() => setCheckInModalOpen(true)}
          onCreateTaskForPatient={handleCreateTaskForPatient}
        />
      )}

      {activeTab === 'tasks' && (
        <SecretaryTaskCenter
          tasks={tasks}
          onRefresh={loadData}
          onOpenSmsForTask={handleOpenSmsCustom}
        />
      )}

      {activeTab === 'calls' && (
        <SecretaryCallList
          appointments={todayApps}
          onRefresh={loadData}
          onOpenSms={handleOpenSmsForApp}
        />
      )}

      {activeTab === 'logs' && (
        <div id="secretary-logs-panel" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              تاریخچه اقدامات و رویدادهای زنده شیفت امروز (Audit Log)
            </h3>
            <span className="text-xs text-slate-400">{activityLogs.length} رویداد ثبت شده</span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
            {activityLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span>{log.actorName}</span>
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-mono font-semibold">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{log.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 mr-2">
                  {formatPersianTimestamp(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check In Modal */}
      <SecretaryQuickCheckInModal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        onSuccess={loadData}
        appointments={appointments}
      />

      {/* SMS Sender Modal */}
      <SecretarySmsSenderModal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
        selectedAppointment={selectedAppointmentForSms}
        onSuccess={loadData}
      />
    </div>
  );
};
