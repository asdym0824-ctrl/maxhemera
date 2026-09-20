import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Appointment, MedicalRecord, Doctor, ClinicTask } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Globe, 
  LayoutDashboard,
  ExternalLink,
  CheckSquare,
  PlayCircle,
  UserCheck,
  Bell,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PatientClinicalModal } from '../components/doctorPortal/PatientClinicalModal';
import { DoctorWebsiteManager } from '../components/doctorPortal/DoctorWebsiteManager';
import { SecretaryTaskCenter } from '../components/secretary/SecretaryTaskCenter';
import { aiContextService } from '../services/aiContextService';
import { askClinicOperationsAi } from '../services/aiService';
import { isAppointmentToday, formatToPersianDate } from '../utils/dateUtils';
import { Send, Bot, RefreshCw } from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'clinical' | 'tasks' | 'website' | null;
  const [activeTab, setActiveTab] = useState<'clinical' | 'tasks' | 'website'>(tabParam || 'clinical');

  useEffect(() => {
    if (tabParam === 'clinical' || tabParam === 'tasks' || tabParam === 'website') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'clinical' | 'tasks' | 'website') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState<'today' | 'upcoming' | 'all'>('today');
  const [latestIncomingAlert, setLatestIncomingAlert] = useState<Appointment | null>(null);
  const [tasks, setTasks] = useState<ClinicTask[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isClinicalModalOpen, setIsClinicalModalOpen] = useState(false);

  // Initialize available doctors
  useEffect(() => {
    const initDoctors = async () => {
      const docs = currentUser.clinicId 
        ? await apiService.getClinicDoctors(currentUser.clinicId)
        : await apiService.getDoctors();
      const fallbackDocs = docs.length > 0 ? docs : await apiService.getDoctors();
      setAllDoctors(fallbackDocs);

      // Determine initial active doctor based strictly on authenticated user
      let targetId: string | undefined = currentUser.doctorId;
      if (!targetId && currentUser.role === 'doctor') {
        const match = fallbackDocs.find(d => d.name === currentUser.name || d.id === currentUser.id);
        targetId = match?.id;
      }

      // For managers and admins, default to first doctor if no specific doctor linked
      if (!targetId && (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'clinic_manager')) {
        targetId = fallbackDocs[0]?.id;
      }

      if (targetId) {
        setSelectedDoctorId(targetId);
      }
    };
    initDoctors();
  }, [currentUser]);

  // Strict ownership enforcement: Doctor role can view and manage their linked profile.
  // Super Admin / Admin / Clinic Manager can select from the clinic doctor roster.
  const activeDoctorId = currentUser.role === 'doctor'
    ? (currentUser.doctorId || (allDoctors.find(d => d.name === currentUser.name || d.id === currentUser.id)?.id) || selectedDoctorId || (allDoctors.length > 0 ? allDoctors[0].id : ''))
    : (selectedDoctorId || (allDoctors.length > 0 ? allDoctors[0].id : ''));

  const loadData = async () => {
    if (!activeDoctorId) return;
    const doc = await apiService.getDoctorById(activeDoctorId);
    if (doc) setDoctor(doc);

    // Fetch all doctor appointments to guarantee upcoming and new reservations are visible
    const docApps = await apiService.getAppointmentsByDoctor(activeDoctorId);
    setAllAppointments(docApps);
    
    // Sort with latest on top
    const sorted = [...docApps].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
    const todayOnly = sorted.filter(isAppointmentToday);
    setAppointments(todayOnly);

    const docTasks = await apiService.getTasks({ doctorId: activeDoctorId });
    setTasks(docTasks);
  };

  useEffect(() => {
    if (activeDoctorId) {
      loadData();
    }
    const handleUpdate = () => {
      if (activeDoctorId) loadData();
    };

    const handleNewBooking = (e: Event) => {
      const ce = e as CustomEvent<{ appointment: Appointment }>;
      if (ce.detail?.appointment) {
        const newApp = ce.detail.appointment;
        if (newApp.doctorId === activeDoctorId) {
          setLatestIncomingAlert(newApp);
          if (activeDoctorId) loadData();
        }
      }
    };

    window.addEventListener('synapse_appointments_updated', handleUpdate);
    window.addEventListener('synapse_new_appointment_alert', handleNewBooking);
    window.addEventListener('synapse_tasks_updated', handleUpdate);

    return () => {
      window.removeEventListener('synapse_appointments_updated', handleUpdate);
      window.removeEventListener('synapse_new_appointment_alert', handleNewBooking);
      window.removeEventListener('synapse_tasks_updated', handleUpdate);
    };
  }, [activeDoctorId]);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleAskDoctorAi = async (queryText?: string) => {
    const q = queryText || aiPrompt;
    if (!q.trim()) return;

    setAiLoading(true);
    try {
      const docContext = await aiContextService.buildDoctorOperationsContext(currentUser, activeDoctorId);
      const answer = await askClinicOperationsAi('doctor', q, docContext);
      setAiResponse(answer);
    } catch (err) {
      console.error(err);
      setAiResponse('خطا در دریافت پاسخ از هوش مصنوعی پزشک.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenPatientRecord = async (app: Appointment) => {
    setSelectedAppointment(app);
    const patientRecords = await apiService.getPatientMedicalRecords(app.patientId);
    setRecords(patientRecords);
    setIsClinicalModalOpen(true);
  };

  const handleUpdateStatus = async (appId: string, status: Appointment['status']) => {
    await apiService.updateAppointmentStatus(appId, status, {
      actorUserId: currentUser.id,
      actorName: currentUser.name || doctor?.name || 'پزشک معالج',
      actorRole: 'doctor'
    });
    loadData();
  };

  const todayApps = allAppointments.filter(isAppointmentToday);
  const upcomingApps = allAppointments.filter(a => !isAppointmentToday(a) && (a.status === 'scheduled' || a.status === 'arrived'));
  const displayedAppointments = appointmentFilter === 'today'
    ? todayApps
    : appointmentFilter === 'upcoming'
    ? upcomingApps
    : allAppointments;

  const currentVisit = todayApps.find(a => a.status === 'in_visit') || allAppointments.find(a => a.status === 'in_visit');
  const waitingPatients = todayApps.filter(a => a.status === 'arrived');
  const completedCount = todayApps.filter(a => a.status === 'completed').length;
  const nextInLine = waitingPatients[0] || todayApps.find(a => a.status === 'scheduled') || upcomingApps[0];

  // Listen to mobile quick clinical action trigger
  useEffect(() => {
    const handleQuickAction = () => {
      const inVisit = appointments.find(a => a.status === 'in_visit');
      if (inVisit) {
        handleOpenPatientRecord(inVisit);
        return;
      }
      const next = appointments.find(a => a.status === 'arrived') || appointments.find(a => a.status === 'scheduled');
      if (next) {
        handleUpdateStatus(next.id, 'in_visit');
        handleOpenPatientRecord(next);
        return;
      }
      handleTabChange('clinical');
    };
    window.addEventListener('synapse_open_doctor_clinical', handleQuickAction);
    return () => {
      window.removeEventListener('synapse_open_doctor_clinical', handleQuickAction);
    };
  }, [appointments]);

  if (!activeDoctorId && currentUser.role === 'doctor') {
    return (
      <div id="doctor-dashboard-unlinked" className="max-w-xl mx-auto my-12 p-8 bg-white border border-amber-200 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          🩺
        </div>
        <h2 className="text-xl font-bold text-slate-900">پروفایل پزشک متصل نشده است</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          حساب کاربری شما با شناسه <code className="text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded">{currentUser.id}</code> به هیچ پروفایل پزشکی معتبری در کلینیک متصل نیست. لطفاً با مدیر کلینیک جهت پیوند دادن پرونده پرسنلی تماس حاصل فرمایید.
        </p>
      </div>
    );
  }

  return (
    <div id="doctor-dashboard-page" className="space-y-6 pb-12 animate-in fade-in">
      {/* Physician Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <img
            src={doctor?.avatar || currentUser.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"}
            alt={doctor?.name || currentUser.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-400 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">اتاق کار و پرتال بالینی {doctor?.name || currentUser.name}</h1>
              <Badge variant="blue">پزشک تایید شده</Badge>
            </div>
            <p className="text-xs text-blue-300 mt-1">
              {doctor?.title || "متخصص کلینیک"} | کد نظام: {doctor?.medicalCouncilNumber || "ثبت نشده"} | {doctor?.clinicName || "همرا کلینیک"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          {/* Doctor Switcher ONLY for authorized admins/managers */}
          {(currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'clinic_manager') && (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl">
              <span className="text-[11px] text-slate-400">انتخاب پزشک:</span>
              <select
                value={activeDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="bg-slate-900 text-blue-300 text-xs font-bold rounded-lg px-2.5 py-1 border border-slate-600 focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                {allDoctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialtyName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {doctor && (
            <Link
              to={`/dr/${doctor.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900/70 hover:bg-blue-800 text-blue-200 border border-blue-600/40 text-xs font-bold transition-all shadow-xs"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>مشاهده وبسایت اختصاصی</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="bg-slate-800 px-3.5 py-2 rounded-xl text-center border border-slate-700">
            <span className="text-slate-400 block text-[11px]">نوبت‌های امروز:</span>
            <span className="font-extrabold text-sm sm:text-base text-white">{todayApps.length} بیمار</span>
          </div>

          <div className="bg-slate-800 px-3.5 py-2 rounded-xl text-center border border-slate-700">
            <span className="text-emerald-400 block text-[11px]">رزروهای آینده:</span>
            <span className="font-extrabold text-sm sm:text-base text-emerald-300">{upcomingApps.length} بیمار</span>
          </div>
        </div>
      </div>

      {/* Doctor Realtime KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">وضعیت اتاق ویزیت</div>
          <div className="mt-2 text-base font-black text-purple-700 flex items-center gap-1.5">
            {currentVisit ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping"></span>
                <span>{currentVisit.patientName}</span>
              </>
            ) : (
              <span className="text-slate-400 font-medium text-xs">اتاق خالی / آماده فراخوان</span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">حاضر در سالن انتظار مطب</div>
          <div className="mt-2 text-xl font-black text-amber-600">
            {waitingPatients.length} بیمار
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">ویزیت‌های تکمیل شده</div>
          <div className="mt-2 text-xl font-black text-emerald-600">
            {completedCount} از {appointments.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">تسک‌های پزشک و دستورات</div>
          <div className="mt-2 text-xl font-black text-indigo-600">
            {tasks.filter(t => t.status !== 'completed').length} مورد باز
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => handleTabChange('clinical')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'clinical'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>میزکار بالینی و صف بیماران</span>
        </button>

        <button
          onClick={() => handleTabChange('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>پیگیری‌ها و دستورات به منشی ({tasks.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('website')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'website'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>مدیریت وبسایت اختصاصی پزشک</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Tab 1: Clinical Dashboard */}
      {activeTab === 'clinical' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor Operations AI Bar */}
          <div className="lg:col-span-3 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 border border-blue-600/30 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white flex items-center gap-2">
                    دستیار هوشمند سازماندهی کار پزشک
                    <span className="text-[9px] bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded-full font-mono">
                      Grounded Operations AI
                    </span>
                  </h4>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <button
                  onClick={() => {
                    setAiPrompt('بیمار بعدی من کیست؟');
                    handleAskDoctorAi('بیمار بعدی من کیست؟');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-200 rounded-lg transition-colors cursor-pointer border border-blue-600/20"
                >
                  بیمار بعدی من کیست؟
                </button>
                <button
                  onClick={() => {
                    setAiPrompt('امروز چند نوبت دارم؟');
                    handleAskDoctorAi('امروز چند نوبت دارم؟');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-200 rounded-lg transition-colors cursor-pointer border border-blue-600/20"
                >
                  وضعیت نوبت‌های شیفت من
                </button>
              </div>
            </div>

            {aiResponse && (
              <div className="bg-slate-800/90 border border-blue-600/20 rounded-xl p-3 text-xs text-blue-100 flex items-start gap-2 animate-in fade-in">
                <Bot className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1 whitespace-pre-line leading-relaxed">{aiResponse}</div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskDoctorAi();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="سوال از دستیار بالینی پزشک (مثلاً: وضعیت مراجعین در انتظار یا زمان نوبت بعدی)..."
                className="flex-1 px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-600/40"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiPrompt.trim()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>پرسش</span>
              </button>
            </form>
          </div>

          {/* Active Patient Hero Card */}
          {currentVisit ? (
            <div className="lg:col-span-3 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-purple-500/30 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 sm:pb-3">
                <div className="flex items-center gap-2 text-xs text-purple-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>بیمار جاری در اتاق ویزیت (Active Patient)</span>
                </div>
                <Badge variant="purple">در حال ویزیت</Badge>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 w-full sm:w-auto">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{currentVisit.patientName}</h3>
                  <p className="text-xs text-slate-300">
                    ساعت نوبت: {currentVisit.timeSlot} | کد پیگیری: {currentVisit.trackingCode} | تلفن: {currentVisit.patientPhone}
                  </p>
                  {currentVisit.symptomsNote && (
                    <p className="text-xs text-blue-200 pt-0.5">علت مراجعه: "{currentVisit.symptomsNote}"</p>
                  )}
                </div>

                <div className="w-full sm:w-auto grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-2 pt-1 sm:pt-0">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto min-h-[44px] justify-center text-xs sm:text-sm font-bold px-3 sm:px-4"
                    onClick={() => handleOpenPatientRecord(currentVisit)}
                    icon={<Sparkles className="w-4 h-4 text-amber-300 shrink-0" />}
                  >
                    <span className="sm:hidden">پرونده بالینی و AI</span>
                    <span className="hidden sm:inline">پرونده بالینی + هوش مصنوعی</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full sm:w-auto min-h-[44px] justify-center text-xs sm:text-sm font-bold px-3 sm:px-4 border border-slate-700 hover:border-slate-600 shrink-0"
                    onClick={() => handleUpdateStatus(currentVisit.id, 'completed')}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  >
                    <span>اتمام ویزیت</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : nextInLine ? (
            <div className="lg:col-span-3 bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  بیمار بعدی در نوبت ({nextInLine.status === 'arrived' ? 'حاضر در سالن' : 'در راه'})
                </div>
                <h3 className="text-lg font-bold">{nextInLine.patientName} — ساعت {nextInLine.timeSlot}</h3>
                <p className="text-xs text-slate-400">{nextInLine.symptomsNote || 'ویزیت حضوری'}</p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleUpdateStatus(nextInLine.id, 'in_visit')}
                icon={<PlayCircle className="w-4 h-4" />}
              >
                فراخوانی بیمار به اتاق ویزیت
              </Button>
            </div>
          ) : null}

          {/* Patients Queue List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Live New Incoming Booking Banner */}
            {latestIncomingAlert && (
              <div id="doctor-incoming-booking-banner" className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white p-4 sm:p-5 rounded-3xl border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Bell className="w-6 h-6 animate-bounce" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-emerald-300">رزرو نوبت جدید ثبت شد! (هم‌اکنون)</span>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">لحظه‌ای</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      بیمار <strong>{latestIncomingAlert.patientName}</strong> نوبت {latestIncomingAlert.visitType === 'in_person' ? 'حضوری' : 'آنلاین'} برای تاریخ <strong className="text-emerald-200">{formatToPersianDate(latestIncomingAlert.date)}</strong> ساعت <strong className="text-emerald-200">{latestIncomingAlert.timeSlot}</strong> رزرو کرد.
                      <span className="inline-block mr-2 font-mono text-[11px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        کد رهگیری: {latestIncomingAlert.trackingCode}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setAppointmentFilter(isAppointmentToday(latestIncomingAlert) ? 'today' : 'upcoming');
                      handleOpenPatientRecord(latestIncomingAlert);
                    }}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>بررسی پرونده و جزئیات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLatestIncomingAlert(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="بستن اعلان"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Filter Tabs & Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {appointmentFilter === 'today' 
                      ? 'نوبت‌های شیفت امروز' 
                      : appointmentFilter === 'upcoming' 
                      ? 'نوبت‌های پیش‌رو و رزروهای آینده' 
                      : 'تمام نوبت‌های ثبت‌شده در پرتال'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    نمایش زنده نوبت‌های رزرو شده توسط بیماران همراه با کد رهگیری
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAppointmentFilter('today')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    appointmentFilter === 'today'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  امروز ({todayApps.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentFilter('upcoming')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    appointmentFilter === 'upcoming'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>رزروهای جدید و آینده ({upcomingApps.length})</span>
                  {upcomingApps.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    appointmentFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  همه ({allAppointments.length})
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100 text-xs">
                {displayedAppointments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-slate-300" />
                    <p>
                      {appointmentFilter === 'today' 
                        ? 'نوبتی برای شیفت امروز ثبت نشده است.' 
                        : appointmentFilter === 'upcoming'
                        ? 'نوبت رزرو شده‌ای برای روزهای آینده وجود ندارد.'
                        : 'هیچ نوبتی ثبت نشده است.'}
                    </p>
                  </div>
                ) : (
                  displayedAppointments.map(app => {
                    const isNewArrival = latestIncomingAlert?.id === app.id;
                    const isToday = isAppointmentToday(app);

                    return (
                      <div 
                        key={app.id} 
                        className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                          isNewArrival 
                            ? 'bg-emerald-50/60 ring-2 ring-emerald-500/40' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${
                            isToday ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            <Clock className="w-3.5 h-3.5 mb-0.5 text-slate-400" />
                            <span className="text-[11px] font-mono">{app.timeSlot}</span>
                            <span className="text-[9px] font-medium text-slate-500">
                              {isToday ? 'امروز' : formatToPersianDate(app.date).split(' ')[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{app.patientName}</span>
                              {isNewArrival && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full border border-emerald-300">
                                  رزرو جدید
                                </span>
                              )}
                              {!isToday && (
                                <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                                  {formatToPersianDate(app.date)}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5 flex flex-wrap items-center gap-2">
                              <span>{app.visitType === 'in_person' ? 'ویزیت حضوری' : 'مشاوره آنلاین'}</span>
                              <span>•</span>
                              <span>کد پیگیری: <strong className="font-mono text-slate-700">{app.trackingCode}</strong></span>
                              {app.queuePosition && (
                                <>
                                  <span>•</span>
                                  <span>نوبت صف #{app.queuePosition}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {app.status === 'arrived' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'in_visit')}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              فراخوانی
                            </button>
                          )}

                          <Badge variant={app.status === 'completed' ? 'green' : app.status === 'in_visit' ? 'purple' : app.status === 'arrived' ? 'amber' : 'blue'}>
                            {app.status === 'completed' ? 'ویزیت شده' : app.status === 'in_visit' ? 'در حال ویزیت' : app.status === 'arrived' ? 'در سالن انتظار' : 'رزرو شده'}
                          </Badge>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenPatientRecord(app)}
                            icon={<FileText className="w-3.5 h-3.5" />}
                          >
                            پرونده و هوش مصنوعی
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks & Delegations */}
      {activeTab === 'tasks' && (
        <SecretaryTaskCenter
          tasks={tasks}
          onRefresh={loadData}
        />
      )}

      {/* Tab 3: Doctor Personal Website Manager */}
      {activeTab === 'website' && doctor && (
        <DoctorWebsiteManager
          doctor={doctor}
          onDoctorUpdated={(updated) => setDoctor(updated)}
        />
      )}

      {/* Patient EMR & AI Copilot Modal */}
      {isClinicalModalOpen && selectedAppointment && (
        <PatientClinicalModal
          isOpen={isClinicalModalOpen}
          onClose={() => setIsClinicalModalOpen(false)}
          appointment={selectedAppointment}
          records={records}
        />
      )}
    </div>
  );
};
