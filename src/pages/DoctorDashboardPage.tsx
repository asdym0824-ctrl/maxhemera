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
  UserCheck
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PatientClinicalModal } from '../components/doctorPortal/PatientClinicalModal';
import { DoctorWebsiteManager } from '../components/doctorPortal/DoctorWebsiteManager';
import { SecretaryTaskCenter } from '../components/secretary/SecretaryTaskCenter';
import { aiContextService } from '../services/aiContextService';
import { askClinicOperationsAi } from '../services/aiService';
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

    const docApps = await apiService.getTodayAppointmentsByDoctor(activeDoctorId);
    setAppointments(docApps);

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
    window.addEventListener('synapse_appointments_updated', handleUpdate);
    window.addEventListener('synapse_tasks_updated', handleUpdate);

    return () => {
      window.removeEventListener('synapse_appointments_updated', handleUpdate);
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

  const currentVisit = appointments.find(a => a.status === 'in_visit');
  const waitingPatients = appointments.filter(a => a.status === 'arrived');
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const nextInLine = waitingPatients[0] || appointments.find(a => a.status === 'scheduled');

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

          <div className="bg-slate-800 px-4 py-2 rounded-xl text-center border border-slate-700">
            <span className="text-slate-400 block text-[11px]">نوبت‌های امروز:</span>
            <span className="font-extrabold text-sm sm:text-base text-white">{appointments.length} بیمار</span>
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
            <div className="lg:col-span-3 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-purple-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs text-purple-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  بیمار جاری در اتاق ویزیت (Active Patient)
                </div>
                <Badge variant="purple">در حال ویزیت</Badge>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">{currentVisit.patientName}</h3>
                  <p className="text-xs text-slate-300">
                    ساعت نوبت: {currentVisit.timeSlot} | کد پیگیری: {currentVisit.trackingCode} | تلفن: {currentVisit.patientPhone}
                  </p>
                  {currentVisit.symptomsNote && (
                    <p className="text-xs text-blue-200 pt-1">علت مراجعه: "{currentVisit.symptomsNote}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleOpenPatientRecord(currentVisit)}
                    icon={<Sparkles className="w-4 h-4 text-amber-300" />}
                  >
                    پرونده بالینی + هوش مصنوعی
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleUpdateStatus(currentVisit.id, 'completed')}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  >
                    اتمام ویزیت
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
            <h3 className="font-extrabold text-base text-slate-900">لیست نوبت‌های شیفت امروز</h3>

            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100 text-xs">
                {appointments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">نوبتی برای شیفت امروز ثبت نشده است.</div>
                ) : (
                  appointments.map(app => (
                    <div key={app.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center font-bold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                          <span className="text-[11px]">{app.timeSlot}</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{app.patientName}</div>
                          <div className="text-slate-500 text-[11px]">
                            {app.visitType === 'in_person' ? 'ویزیت حضوری' : 'مشاوره آنلاین'} | کد پیگیری: {app.trackingCode}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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
                  ))
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
