import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  Calendar, 
  FilePlus, 
  AlertCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { Appointment, Doctor } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface SecretaryQuickCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointments: Appointment[];
}

export const SecretaryQuickCheckInModal: React.FC<SecretaryQuickCheckInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  appointments
}) => {
  const { currentUser } = useAuth();
  const [activeMode, setActiveMode] = useState<'existing' | 'walk_in'>('existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Walk-in form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [timeSlot, setTimeSlot] = useState('۱۱:۳۰');
  const [symptoms, setSymptoms] = useState('');
  const [fee, setFee] = useState(250000);
  const [isPaid, setIsPaid] = useState(true);

  const clinicId = currentUser.clinicId;
  const branchId = currentUser.branchId;

  React.useEffect(() => {
    if (isOpen && clinicId) {
      apiService.getClinicDoctors(clinicId, branchId).then(docs => {
        setDoctors(docs);
        if (docs.length > 0) setSelectedDoctorId(docs[0].id);
      });
    } else if (isOpen) {
      setDoctors([]);
    }
  }, [isOpen, clinicId, branchId]);

  // Filter scheduled appointments for today check-in
  const scheduledToday = appointments.filter(a => {
    if (a.status === 'completed' || a.status === 'canceled') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.patientName.toLowerCase().includes(q) ||
      a.trackingCode.toLowerCase().includes(q) ||
      a.patientPhone.includes(q)
    );
  });

  const handleCheckInExisting = async (appointment: Appointment) => {
    setSubmitting(true);
    try {
      await apiService.updateAppointmentStatus(appointment.id, 'arrived', {
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !selectedDoctorId) return;

    setSubmitting(true);
    try {
      const selectedDoc = doctors.find(d => d.id === selectedDoctorId);
      const newApp = await apiService.createAppointment({
        clinicId: clinicId || '',
        branchId: branchId,
        doctorId: selectedDoctorId,
        doctorName: selectedDoc?.name || 'دکتر شیفت',
        doctorSpecialty: selectedDoc?.specialtyName || 'متخصص',
        doctorAvatar: selectedDoc?.avatar || '',
        patientId: `patient-walkin-${Date.now()}`,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: patientAge ? (parseInt(patientAge, 10) || undefined) : undefined,
        visitType: 'in_person',
        date: new Date().toISOString().split('T')[0],
        timeSlot: timeSlot,
        clinicAddress: selectedDoc?.address || 'همرا کلینیک',
        symptomsNote: symptoms.trim() || 'پذیرش حضوری / بدون نوبت قبلی',
        fee: fee,
        paidStatus: isPaid ? 'paid' : 'pending'
      }, {
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role
      });

      // Mark immediately as arrived
      await apiService.updateAppointmentStatus(newApp.id, 'arrived', {
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="اعلام حضور بیمار / پذیرش حضوری سریع (Quick Check-In)"
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Toggle Mode */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveMode('existing')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'existing'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>نوبت‌های از قبل رزرو شده امروز</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('walk_in')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'walk_in'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FilePlus className="w-4 h-4 text-indigo-600" />
            <span>پذیرش بیمار حضوری بدون نوبت (Walk-in)</span>
          </button>
        </div>

        {/* Existing Appointments Check-in Mode */}
        {activeMode === 'existing' && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="جستجو با نام بیمار، کد پیگیری یا شماره تماس..."
                className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-100">
              {scheduledToday.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  بیماری با مشخصات وارد شده یافت نشد. می‌توانید از تب «پذیرش بیمار حضوری» استفاده کنید.
                </div>
              ) : (
                scheduledToday.map(app => (
                  <div
                    key={app.id}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{app.patientName}</span>
                        <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                          {app.trackingCode}
                        </span>
                        {app.status === 'arrived' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                            حاضر در سالن
                          </span>
                        )}
                        {app.status === 'in_visit' && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                            در حال ویزیت
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          ساعت: {app.timeSlot}
                        </span>
                        <span>پزشک: {app.doctorName}</span>
                        <span className="font-mono dir-ltr">{app.patientPhone}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {app.status === 'scheduled' ? (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleCheckInExisting(app)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>ثبت حضور</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          پذیرش شده
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Walk-in Mode */}
        {activeMode === 'walk_in' && (
          <form onSubmit={handleCreateWalkIn} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نام و نام‌خانوادگی بیمار *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: علیرضا قربانی"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">شماره همراه بیمار *</label>
                <input
                  type="tel"
                  required
                  placeholder="09123456789"
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 dir-ltr text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">پزشک معالج *</label>
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-medium"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialtyName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ساعت تخصیص نوبت *</label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={e => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سن بیمار</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={e => setPatientAge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">علت مراجعه / شرح حال کوتاه</label>
              <input
                type="text"
                placeholder="مثلاً: درد قفسه سینه، نیاز به نوار قلب..."
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-700" />
                <span className="font-bold text-blue-900">مبلغ ویزیت: ۲۵۰,۰۰۰ تومان</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={e => setIsPaid(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-600"
                />
                <span>تسویه در پوز پذیرش انجام شد</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="md" type="button" onClick={onClose}>
                انصراف
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={submitting}
                icon={<UserCheck className="w-4 h-4" />}
              >
                ثبت و ورود مستقیم به صف انتظار
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
