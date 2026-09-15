import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  BarChart3, 
  Users, 
  Zap, 
  Activity, 
  RefreshCw, 
  CheckSquare,
  Sparkles,
  Globe,
  Palette,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import { Appointment, Doctor, ClinicStaff, ClinicAutomationRule, ActivityLog, ClinicTask } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { formatPersianTimestamp } from '../utils/dateUtils';
import { Button } from '../components/common/Button';
import { ClinicOperationsOverview } from '../components/clinic/ClinicOperationsOverview';
import { ClinicStaffManager } from '../components/clinic/ClinicStaffManager';
import { ClinicAutomationRules } from '../components/clinic/ClinicAutomationRules';
import { ClinicAiAdvisor } from '../components/clinic/ClinicAiAdvisor';
import { SecretaryTaskCenter } from '../components/secretary/SecretaryTaskCenter';

export const ClinicManagerWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'overview' | 'staff' | 'automations' | 'tasks' | 'audit' | 'branding' | null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [staffList, setStaffList] = useState<ClinicStaff[]>([]);
  const [rules, setRules] = useState<ClinicAutomationRule[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [tasks, setTasks] = useState<ClinicTask[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'automations' | 'tasks' | 'audit' | 'branding'>(
    tabParam === 'staff' || tabParam === 'automations' || tabParam === 'tasks' || tabParam === 'audit' || tabParam === 'branding' ? tabParam : 'overview'
  );

  const handleTabChange = (tab: 'overview' | 'staff' | 'automations' | 'tasks' | 'audit' | 'branding') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (tabParam === 'overview' || tabParam === 'staff' || tabParam === 'automations' || tabParam === 'tasks' || tabParam === 'audit' || tabParam === 'branding') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const clinicId = currentUser.clinicId;
  const branchId = currentUser.branchId;

  const loadData = async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [apps, docs, stf, rls, logs, tsks, ov] = await Promise.all([
        apiService.getAppointmentsByClinic(clinicId, branchId),
        apiService.getClinicDoctors(clinicId),
        apiService.getClinicStaff(clinicId),
        apiService.getAutomationRules(clinicId),
        apiService.getActivityLogs(50),
        apiService.getTasksByClinic(clinicId, branchId),
        apiService.getClinicTodayOverview(clinicId, branchId)
      ]);
      setAppointments(apps);
      setDoctors(docs);
      setStaffList(stf);
      setRules(rls);
      setActivityLogs(logs);
      setTasks(tsks);
      setOverview(ov);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinicId) {
      loadData();
    } else {
      setLoading(false);
    }
    const handleUpdate = () => loadData();
    window.addEventListener('synapse_appointments_updated', handleUpdate);
    window.addEventListener('synapse_tasks_updated', handleUpdate);
    window.addEventListener('synapse_activity_updated', handleUpdate);

    return () => {
      window.removeEventListener('synapse_appointments_updated', handleUpdate);
      window.removeEventListener('synapse_tasks_updated', handleUpdate);
      window.removeEventListener('synapse_activity_updated', handleUpdate);
    };
  }, [clinicId, branchId]);

  if (!clinicId) {
    return (
      <div id="clinic-manager-unassigned-state" className="min-h-[55vh] flex items-center justify-center p-6 text-right font-sans" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            حساب کاربری شما به کلینیک مشخصی متصل نشده است.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            برای دسترسی به داشبورد مدیریت و عملیات، ابتدا باید حساب کاربری شما توسط مدیر ارشد سامانه به یک کلینیک مجاز متصل شود.
          </p>
          <div className="pt-2 text-xs text-slate-400 border-t border-slate-100">
            نام کاربر: {currentUser.name || 'نامشخص'} | نقش: {currentUser.role}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="clinic-manager-workspace-page" className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Hero Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-700 to-slate-900 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl text-slate-900">مرکز عملیات و مدیریت همرا کلینیک</h1>
              <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                مدیر مسئول: {currentUser.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              پایش عملکرد، بهره‌وری اتاق‌های ویزیت، سازماندهی پرسنل و تنظیم اتوماسیون‌ها
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
        </div>
      </div>

      {/* Embedded Clinic AI Advisor */}
      <ClinicAiAdvisor />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold">
        <button
          onClick={() => handleTabChange('overview')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>پایش لحظه‌ای عملیات و صف</span>
        </button>

        <button
          onClick={() => handleTabChange('staff')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>پرسنل و شیفت‌ها ({staffList.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('tasks')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>تمام وظایف پرسنل (Task Engine)</span>
        </button>

        <button
          onClick={() => handleTabChange('automations')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'automations'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>قوانین اتوماسیون و پیامک‌ها</span>
        </button>

        <button
          onClick={() => handleTabChange('audit')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>لاگ حسابرسی رویدادها (Audit Trail)</span>
        </button>

        <button
          onClick={() => handleTabChange('branding')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>برندینگ و توسعه کلینیک</span>
          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full font-bold">جدید</span>
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'overview' && (
        <ClinicOperationsOverview
          appointments={appointments}
          doctors={doctors}
          overview={overview}
        />
      )}

      {activeTab === 'staff' && (
        <ClinicStaffManager
          staffList={staffList}
          onRefresh={loadData}
        />
      )}

      {activeTab === 'tasks' && (
        <SecretaryTaskCenter
          tasks={tasks}
          onRefresh={loadData}
        />
      )}

      {activeTab === 'automations' && (
        <ClinicAutomationRules
          rules={rules}
          onRefresh={loadData}
        />
      )}

      {activeTab === 'audit' && (
        <div id="clinic-audit-log-panel" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              دفتر ثبت رویدادها و تغییرات وضعیت کلینیک (Audit Log)
            </h3>
            <span className="text-xs text-slate-400">{activityLogs.length} رویداد ذخیره شده</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto">
            {activityLogs.map(log => (
              <div key={log.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between text-xs hover:bg-slate-100/70 transition-colors">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{log.actorName}</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono font-bold">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      بخش: {log.entityType}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{log.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 mr-2">
                  {formatPersianTimestamp(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>دپارتمان برندینگ و توسعه شبکه همرا</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                مدیریت برند، ساب‌دامنه‌ها و توسعه کسب‌وکار کلینیک
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                ارتقای هویت بصری مرکز درمانی، راه‌اندازی ساب‌دامنه‌های اختصاصی هر پزشک (<span className="text-purple-300 font-mono" dir="ltr">*.hamrah.ir</span>)، سیستم جذب بیمار و پایش بازدهی یونیت‌ها.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/clinic-branding')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>مشاهده پرتال اختصاصی خدمات برندینگ</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Pillars Overview inside Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">هویت بصری و تابلوی کلینیک</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  طراحی آرم، سربرگ و نسخه‌های ایمن با مهر پزشک، راهنمای اتاق‌ها و محیط مراجعین
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">وضعیت مرکز:</span>
                <span className="font-bold text-emerald-600">استاندارد نظام پزشکی</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">ساب‌دامنه‌های پزشکان همرا</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  اتصال خودکار پزشکان مرکز به ساب‌دامنه معتبر <span className="font-mono text-purple-600">dr-slug.hamrah.ir</span>
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">پزشکان متصل:</span>
                <span className="font-bold text-purple-700">{doctors.length} پزشک فعال</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">توسعه درآمد و باشگاه بیماران</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  پیامک‌های خودکار نظرسنجی و مراقبت، یادآوری چکاپ و تحلیل بازدهی اتاق‌های ویزیت
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">نرخ رضایت مراجعین:</span>
                <span className="font-bold text-emerald-600">۹۸.۴٪ (NPS عالی)</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-purple-950">ارزیابی رایگان پتانسیل رشد کلینیک شما</h4>
                <p className="text-xs text-purple-800/80 mt-0.5">
                  می‌توانید با استفاده از ماشین‌حساب هوشمند، میزان افزایش مراجعین و بازگشت سرمایه را محاسبه کنید.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/clinic-branding')}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              ورود به صفحه برندینگ و محاسبه بازدهی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
