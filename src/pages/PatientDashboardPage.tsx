import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Appointment, MedicalRecord, FamilyMember } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { getRelativeISODate, formatToPersianDate } from '../utils/dateUtils';
import { 
  Calendar, 
  FileText, 
  Users, 
  Pill, 
  Activity,
  Camera,
  Upload,
  Check,
  Image as ImageIcon,
  Sparkles,
  X
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { HealthTimeline } from '../components/patient/HealthTimeline';
import { FamilyHealthManager } from '../components/patient/FamilyHealthManager';
import { SmartQueueWidget } from '../components/patient/SmartQueueWidget';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
];

export const PatientDashboardPage: React.FC<{ onNavigateToDoctors: () => void }> = ({ onNavigateToDoctors }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getActiveTab = () => {
    if (location.pathname.endsWith('/appointments')) return 'appointments';
    if (location.pathname.endsWith('/records')) return 'records';
    if (location.pathname.endsWith('/family')) return 'family';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: 'home' | 'appointments' | 'records' | 'family') => {
    if (tab === 'home') navigate('/patient');
    else navigate(`/patient/${tab}`);
  };

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    document.title = 'پرونده و نوبت‌های بیمار | همرا کلینیک';
    if (currentUser) {
      Promise.all([
        apiService.getAppointmentsByPatient(currentUser.id),
        apiService.getPatientMedicalRecords(currentUser.id),
        apiService.getFamilyMembers(currentUser.id)
      ]).then(([apps, recs, fams]) => {
        setAppointments(apps);
        setRecords(recs);
        setFamilyMembers(fams);
      });
    }
  }, [currentUser]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل تصویری (JPG، PNG، WebP) انتخاب فرمایید.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حداکثر حجم تصویر ۵ مگابایت است.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await updateCurrentUser({ avatar: base64 });
      setIsUploading(false);
      setAvatarSuccessMsg(true);
      setTimeout(() => setAvatarSuccessMsg(false), 3500);
      setIsAvatarModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = async (presetUrl: string) => {
    setIsUploading(true);
    await updateCurrentUser({ avatar: presetUrl });
    setIsUploading(false);
    setAvatarSuccessMsg(true);
    setTimeout(() => setAvatarSuccessMsg(false), 3500);
    setIsAvatarModalOpen(false);
  };

  const handleCheckIn = async (appId: string) => {
    await apiService.updateAppointmentStatus(appId, 'arrived');
    setAppointments(prev =>
      prev.map(a => (a.id === appId ? { ...a, status: 'arrived' } : a))
    );
  };

  const handleAddFamilyMember = async (newFam: Omit<FamilyMember, 'id'>) => {
    const created = await apiService.addFamilyMember(newFam);
    setFamilyMembers(prev => [...prev, created]);
  };

  const todayIso = getRelativeISODate(0);
  const todayAppointment = appointments.find(
    a => a.date === todayIso && ['scheduled', 'arrived', 'waiting', 'in_visit'].includes(a.status)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-12">
      {/* Patient Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs text-center relative group">
          {/* Avatar Container with Upload overlay */}
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt={currentUser?.name || 'کاربر'}
              className="w-24 h-24 rounded-full object-cover border-3 border-blue-600 shadow-md transition-all duration-300 group-hover:opacity-90"
            />
            
            {/* Camera Upload Action Button */}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              title="بارگذاری و تغییر عکس پروفایل"
              className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-lg border-2 border-white transition-all cursor-pointer flex items-center justify-center"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Hidden Direct File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900">{currentUser?.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser?.phone}</p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <Badge variant="blue">پرونده سلامت فعال</Badge>
            </div>
            
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="mt-3 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>تغییر تصویر پروفایل</span>
            </button>

            {avatarSuccessMsg && (
              <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 px-2.5 rounded-xl font-medium flex items-center justify-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>تصویر پروفایل با موفقیت تغییر یافت</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 space-y-1 text-xs font-medium">
          {[
            { id: 'home', label: 'داشبورد اصلی', icon: <Activity className="w-4 h-4" /> },
            { id: 'appointments', label: `نوبت‌های من (${appointments.length})`, icon: <Calendar className="w-4 h-4" /> },
            { id: 'records', label: 'پرونده الکترونیک سلامت', icon: <FileText className="w-4 h-4" /> },
            { id: 'family', label: `اعضای خانواده (${familyMembers.length})`, icon: <Users className="w-4 h-4" /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="lg:col-span-3 space-y-6">
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Greeting */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <h2 className="text-2xl font-extrabold text-white">سلام، {currentUser.name} عزیز 👋</h2>
                <p className="text-xs text-slate-300 mt-1">به سامانه هوشمند مدیریت سلامت همرا کلینیک خوش آمدید.</p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={onNavigateToDoctors}
                icon={<Calendar className="w-4 h-4" />}
              >
                دریافت نوبت جدید
              </Button>
            </div>

            {/* Smart Queue Widget */}
            {todayAppointment && (
              <SmartQueueWidget appointment={todayAppointment} onCheckIn={handleCheckIn} />
            )}

            {/* Health Overview Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Today's Medications Card */}
              {(() => {
                const activeMedications = records.flatMap(r => (r.medications || []).map(m => ({
                  ...m,
                  doctorName: r.doctorName,
                  date: r.date
                })));

                return (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-sky-600" />
                        داروهای تجویزی فعال:
                      </h3>
                      <Badge variant={activeMedications.length > 0 ? 'blue' : 'slate'} size="sm">
                        {activeMedications.length > 0 ? `${activeMedications.length} قلم دارو` : 'بدون داروی ثبت‌شده'}
                      </Badge>
                    </div>
                    {activeMedications.length > 0 ? (
                      <div className="space-y-2 text-xs">
                        {activeMedications.map((med, i) => (
                          <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-900">{med.name} {med.dosage && `(${med.dosage})`}</div>
                              <div className="text-slate-500">{med.frequency} • تجویز شده توسط {med.doctorName}</div>
                            </div>
                            <span className="text-[11px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md">
                              {med.duration || 'جاری'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 text-center text-slate-500 text-xs">
                        هیچ داروی تجویزی فعالی در پرونده پزشکی شما ثبت نشده است.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Follow-up Tasks */}
              {(() => {
                const followUps = records.filter(r => r.type === 'followup' || r.title.includes('پیگیری') || r.summary.includes('پیگیری'));
                const upcomingApps = appointments.filter(a => a.status === 'scheduled');

                return (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        پیگیری‌های درمانی آینده (Follow-up):
                      </h3>
                      <Badge variant={followUps.length > 0 || upcomingApps.length > 0 ? 'blue' : 'slate'} size="sm">
                        {followUps.length + upcomingApps.length > 0 ? `${followUps.length + upcomingApps.length} مورد فعال` : 'بدون پیگیری معوق'}
                      </Badge>
                    </div>
                    {followUps.length > 0 || upcomingApps.length > 0 ? (
                      <div className="text-xs space-y-2">
                        {followUps.map((fu, i) => (
                          <div key={`fu-${i}`} className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-blue-950 space-y-1">
                            <div className="font-bold">{fu.title}</div>
                            <div className="text-slate-600">{fu.summary} (پزشک: {fu.doctorName})</div>
                          </div>
                        ))}
                        {upcomingApps.map(app => (
                          <div key={app.id} className="bg-sky-50/50 p-3 rounded-xl border border-sky-100 text-sky-950 flex items-center justify-between">
                            <div>
                              <div className="font-bold">نوبت ویزیت با {app.doctorName}</div>
                              <div className="text-slate-600">تاریخ: {app.date} • ساعت {app.timeSlot}</div>
                            </div>
                            <Badge variant="blue" size="sm">رزرو شده</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 text-center text-slate-500 text-xs">
                        در حال حاضر هیچ برنامه پیگیری درمانی معوقی ثبت نشده است.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Recent Timeline Preview */}
            <HealthTimeline records={records.slice(0, 2)} />
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-lg text-slate-900">کلیه نوبت‌های رزرو شده</h3>
            <div className="space-y-4">
              {appointments.map(app => (
                <div key={app.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={app.doctorAvatar} alt={app.doctorName} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <div className="font-bold text-slate-900">{app.doctorName}</div>
                      <div className="text-slate-500">{app.doctorSpecialty}</div>
                      <div className="text-blue-700 font-semibold mt-1">
                        تاریخ: {formatToPersianDate(app.date)} - ساعت {app.timeSlot}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={app.status === 'completed' ? 'slate' : 'blue'}>
                      کد پیگیری: {app.trackingCode}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <HealthTimeline records={records} />
        )}

        {activeTab === 'family' && (
          <FamilyHealthManager members={familyMembers} onAddMember={handleAddFamilyMember} />
        )}
      </div>

      {/* Avatar Upload / Selection Modal */}
      <Modal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="ویرایش و بارگذاری تصویر پروفایل"
      >
        <div className="space-y-6 text-slate-800">
          {/* Current Profile Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                alt={currentUser?.name || 'کاربر'}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
              />
              <span className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full border-2 border-white">
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-3">
              <p className="font-bold text-sm text-slate-900">{currentUser?.name}</p>
              <p className="text-xs text-slate-500">{currentUser?.phone}</p>
            </div>
          </div>

          {/* Upload From Device Dropzone */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              بارگذاری عکس از گالری یا رایانه:
            </label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-blue-700 hover:underline">کلیک کنید یا تصویر را اینجا رها فرمایید</span>
                <p className="text-[11px] text-slate-400 mt-1">فرمت‌های مجاز: JPG, PNG, WebP (حداکثر ۵ مگابایت)</p>
              </div>
            </div>
          </div>

          {/* Preset Avatar Options */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              یا انتخاب از میان آواتارهای آماده:
            </label>
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative rounded-2xl p-1 border-2 transition-all hover:scale-105 cursor-pointer ${
                    currentUser?.avatar === preset 
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/30' 
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <img
                    src={preset}
                    alt={`Avatar ${idx + 1}`}
                    className="w-full aspect-square rounded-xl object-cover"
                  />
                  {currentUser?.avatar === preset && (
                    <span className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAvatarModalOpen(false)}
            >
              انصراف
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-4 h-4" />}
              isLoading={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              انتخاب عکس جدید
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
