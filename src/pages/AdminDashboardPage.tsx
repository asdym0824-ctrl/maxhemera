import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AdminKPIs, PatientCRMRecord, Doctor, DoctorWebsiteStatus } from '../types';
import { apiService } from '../services/apiService';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  Award, 
  UserCheck, 
  Activity,
  Briefcase,
  Megaphone,
  Settings,
  PieChart,
  Globe,
  Eye,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { resolveDoctorWebsiteStatus, getWebsiteStatusMeta, getDoctorSubdomain } from '../utils/doctorWebsiteUtils';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [crmRecords, setCrmRecords] = useState<PatientCRMRecord[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [websiteFilter, setWebsiteFilter] = useState<'all' | DoctorWebsiteStatus>('all');
  const [updatingDoctorId, setUpdatingDoctorId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'داشبورد مدیریتی و ارزیابی کلینیک | همرا کلینیک';
    apiService.getAdminKPIs().then(setKpis);
    apiService.getCRMRecords().then(setCrmRecords);
    apiService.getDoctors().then(setDoctors);
  }, []);

  const handleStatusChange = async (doctorId: string, newStatus: DoctorWebsiteStatus) => {
    setUpdatingDoctorId(doctorId);
    try {
      const updated = await apiService.setDoctorWebsiteStatus(doctorId, newStatus);
      if (updated) {
        setDoctors(prev => prev.map(d => d.id === doctorId ? updated : d));
      }
    } catch (err) {
      console.error('Failed to change doctor website status', err);
    } finally {
      setUpdatingDoctorId(null);
    }
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/crm')) return 'crm';
    if (path.includes('/finance')) return 'finance';
    if (path.includes('/hr')) return 'hr';
    if (path.includes('/marketing')) return 'marketing';
    if (path.includes('/websites')) return 'websites';
    if (path.includes('/operations')) return 'operations';
    if (path.includes('/analytics')) return 'analytics';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tabId: string) => {
    if (tabId === 'overview') navigate('/admin');
    else navigate(`/admin/${tabId}`);
  };

  if (!kpis) return null;

  const adminTabs = [
    { id: 'overview', label: 'نمای کلی و KPIs', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'websites', label: 'مدیریت وبسایت پزشکان', icon: <Globe className="w-4 h-4" /> },
    { id: 'crm', label: 'مدیریت ارتباط بیماران (CRM)', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'finance', label: 'مالی و تراکنش‌ها', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'hr', label: 'منابع انسانی و پزشکان', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'marketing', label: 'بازاریابی و جلب بیمار', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'operations', label: 'عملیات و نوبت‌دهی', icon: <Settings className="w-4 h-4" /> },
    { id: 'analytics', label: 'تحلیل هوشمند و گزارشات', icon: <PieChart className="w-4 h-4" /> }
  ];

  const filteredDoctors = doctors.filter(doc => {
    if (websiteFilter === 'all') return true;
    return resolveDoctorWebsiteStatus(doc.websiteConfig) === websiteFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <BarChart3 className="w-4 h-4" />
            داشبورد مدیریتی کلینیک (Clinic Management OS)
          </div>
          <h1 className="text-2xl font-extrabold text-white">پرتال ارزیابی عملکرد، مالی و CRM همرا کلینیک</h1>
        </div>

        <Badge variant="rose">نسخه مدیریتی فعال</Badge>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {adminTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview & KPI Cards Grid */}
      {(activeTab === 'overview' || activeTab === 'finance' || activeTab === 'analytics') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>درآمد امروز کلینیک</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {kpis.todayRevenue.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">↑ ۱۲٪ نسبت به روز قبل</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>بیماران پذیرش شده</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">{kpis.todayPatients} بیمار</div>
            <div className="text-[11px] text-slate-500 font-medium">از کل {kpis.todayAppointments} نوبت</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>میانگین زمان انتظار</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">{kpis.avgWaitTimeMinutes} دقیقه</div>
            <div className="text-[11px] text-emerald-600 font-medium">بهینه‌تر از حد استاندارد (۲۰دقیقه)</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>میزان رضایت‌مندی</span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">{kpis.patientSatisfactionPercent}٪</div>
            <div className="text-[11px] text-slate-500 font-medium">بر اساس ۳۴۲ ارزیابی جدید</div>
          </div>
        </div>
      )}

      {/* CRM Records Table View */}
      {(activeTab === 'overview' || activeTab === 'crm') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              ماژول مدیریت ارتباط با بیماران (Patient CRM)
            </h3>
            <Badge variant="blue">پایش وفاداری بیماران ({crmRecords.length} پرونده)</Badge>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">نام بیمار</th>
                  <th className="p-3">تلفن همراه</th>
                  <th className="p-3">وضعیت وفاداری</th>
                  <th className="p-3">تعداد ویزیت‌ها</th>
                  <th className="p-3">ارزش کل (LTV)</th>
                  <th className="p-3">آخرین ویزیت</th>
                  <th className="p-3">موعد پیگیری (Follow-up)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crmRecords.map(crm => (
                  <tr key={crm.patientId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{crm.name}</td>
                    <td className="p-3 font-mono text-slate-600">{crm.phone}</td>
                    <td className="p-3">
                      <Badge variant={crm.status === 'vip' ? 'amber' : crm.status === 'followup_needed' ? 'rose' : 'blue'}>
                        {crm.status === 'vip' ? 'مشتری VIP' : crm.status === 'followup_needed' ? 'نیازمند پیگیری' : 'بیمار فعال'}
                      </Badge>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{crm.lifetimeVisits} ویزیت</td>
                    <td className="p-3 font-extrabold text-blue-700">{crm.totalSpent.toLocaleString('fa-IR')} تومان</td>
                    <td className="p-3 text-slate-600">{crm.lastVisitDate}</td>
                    <td className="p-3 font-semibold text-rose-600">{crm.nextFollowUpDate || 'ثبت نشده'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Websites Lifecycle & Governance View */}
      {activeTab === 'websites' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                نظارت و مدیریت چرخه حیات وبسایت پزشکان
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                کنترل وضعیت انتشار، بررسی و پیش‌نمایش سایت‌های پزشکان با دسترسی ارشد مدیریتی
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              {[
                { id: 'all', label: `همه (${doctors.length})` },
                { id: 'published', label: 'منتشر شده', color: 'text-emerald-700' },
                { id: 'draft', label: 'پیش‌نویس', color: 'text-amber-700' },
                { id: 'disabled', label: 'غیرفعال', color: 'text-slate-600' },
                { id: 'suspended', label: 'تعلیق شده', color: 'text-rose-700' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setWebsiteFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    websiteFilter === f.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">پزشک</th>
                  <th className="p-3">تخصص و مطب</th>
                  <th className="p-3">نشانی وبسایت</th>
                  <th className="p-3">وضعیت فعلی</th>
                  <th className="p-3">پیش‌نمایش مدیر</th>
                  <th className="p-3">تغییر وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map(doctor => {
                  const status = resolveDoctorWebsiteStatus(doctor.websiteConfig);
                  const meta = getWebsiteStatusMeta(status);
                  const isUpdating = updatingDoctorId === doctor.id;

                  return (
                    <tr key={doctor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={doctor.avatar}
                            alt={doctor.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{doctor.name}</div>
                            <div className="text-[11px] text-slate-500">{doctor.title}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-medium text-slate-700">{doctor.specialtyName}</span>
                        <div className="text-[11px] text-slate-500">{doctor.city}</div>
                      </td>

                      <td className="p-3">
                        <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100" dir="ltr">
                          /site/{doctor.slug}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          status === 'draft' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          status === 'suspended' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            status === 'published' ? 'bg-emerald-500' :
                            status === 'draft' ? 'bg-amber-500' :
                            status === 'suspended' ? 'bg-rose-500' : 'bg-slate-400'
                          }`} />
                          {meta.label}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col items-start gap-1">
                          <Link
                            to={`/site/${doctor.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>مشاهده / پیش‌نمایش</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <span className="text-[10px] text-blue-600 font-mono font-medium" dir="ltr">
                            {getDoctorSubdomain(doctor)}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <select
                          disabled={isUpdating}
                          value={status}
                          onChange={(e) => handleStatusChange(doctor.id, e.target.value as DoctorWebsiteStatus)}
                          className="bg-white text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 border border-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                          <option value="published">🟢 انتشار عمومی</option>
                          <option value="draft">🟡 پیش‌نویس</option>
                          <option value="disabled">⚪ غیرفعال</option>
                          <option value="suspended">🔴 تعلیق</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Finance Specific View */}
      {activeTab === 'finance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            تحلیل تسویه‌حساب با بیمه‌ها و تراکنش‌های روزانه
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500">مطالبات بیمه تأمین اجتماعی</div>
              <div className="text-lg font-bold text-slate-900">۴۸,۵۰۰,۰۰۰ تومان</div>
              <Badge variant="blue">در حال تسویه</Badge>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500">مطالبات بیمه تکمیلی ایران</div>
              <div className="text-lg font-bold text-slate-900">۶۲,۱۰۰,۰۰۰ تومان</div>
              <Badge variant="blue">تأیید اسناد</Badge>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500">سهم پزشکان از کارکرد ماهانه</div>
              <div className="text-lg font-bold text-slate-900">۱۲۴,۰۰۰,۰۰۰ تومان</div>
              <Badge variant="amber">آماده پرداخت</Badge>
            </div>
          </div>
        </div>
      )}

      {/* HR View */}
      {activeTab === 'hr' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            وضعیت شیفت‌ها و کادر درمانی کلینیک
          </h3>
          <p className="text-xs text-slate-600">
            در حال حاضر ۲۰ پزشک متخصص و ۸ پرسنل پذیرش و پرستاری در شیفت‌های فعال کلینیک مشغول خدمت‌رسانی هستند.
          </p>
        </div>
      )}

      {/* Marketing View */}
      {activeTab === 'marketing' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-rose-600" />
            کمپین‌های جلب بیمار و بازخورد مجله سلامت
          </h3>
          <p className="text-xs text-slate-600">
            کمپین چکاپ سالانه قلب و گوارش طی ماه جاری منجر به جلب ۴۵٪ بیماران جدید شده است.
          </p>
        </div>
      )}

      {/* Operations View */}
      {activeTab === 'operations' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            پایش هوشمند صف‌های پذیرش و ظرفیت اتاق‌های ویزیت
          </h3>
          <p className="text-xs text-slate-600">
            نرخ عدم حضور (No-show) روی ۳.۸٪ تثبیت شده و زمان انتظار اتاق‌های ویزیت به ۱۴ دقیقه کاهش یافته است.
          </p>
        </div>
      )}

      {/* Analytics View */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-sky-600" />
            گزارش پیش‌بینانه رشد همرا کلینیک
          </h3>
          <p className="text-xs text-slate-600">
            بر اساس تحلیل داده‌های هوش مصنوعی، تقاضای ویزیت آنلاین در بخش روانپزشکی و متخصص پوست ۳۵٪ افزایش داشته است.
          </p>
        </div>
      )}
    </div>
  );
};
