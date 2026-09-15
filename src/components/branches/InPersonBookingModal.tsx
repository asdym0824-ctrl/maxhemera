import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Navigation, 
  Phone, 
  User, 
  Ticket, 
  Printer, 
  Share2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { ClinicBranch, Doctor, DoctorClinicMembership, TimeSlotInfo } from '../../types';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { ModalPortal } from '../common/ModalPortal';
import { MODAL_Z_INDEX } from '../../utils/modalManager';
import { 
  getRelativeISODate, 
  formatToPersianDate, 
  formatToPersianDigits, 
  isDateToday,
  getPersianWeekdayName 
} from '../../utils/dateUtils';
import { isValidIranianMobile, formatStandardIranianMobile } from '../../utils/validationUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  branch: ClinicBranch | null;
  doctors: Doctor[];
  initialDoctorId?: string;
  onAppointmentCreated?: (appointmentId: string) => void;
}

export const InPersonBookingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  branch,
  doctors,
  initialDoctorId,
  onAppointmentCreated
}) => {
  const { currentUser } = useAuth();
  const [memberships, setMemberships] = useState<DoctorClinicMembership[]>([]);
  
  const todayISO = getRelativeISODate(0);
  const tomorrowISO = getRelativeISODate(1);

  // Fetch branch memberships to ensure strict relationship verification
  useEffect(() => {
    if (branch) {
      apiService.getDoctorClinicMemberships(branch.clinicId || undefined, undefined, branch.id).then(mems => {
        setMemberships(mems.filter(m => m.active));
      });
    } else {
      setMemberships([]);
    }
  }, [branch?.id, branch?.clinicId]);

  // Doctors practicing at this branch strictly via DoctorClinicMembership or matching office
  const availableDoctors = branch ? doctors.filter(d => {
    // Primary: DoctorClinicMembership where doctorId, clinicId, branchId match and active === true
    const hasActiveBranchMembership = memberships.some(m =>
      m.doctorId === d.id &&
      m.active === true &&
      (!branch.clinicId || m.clinicId === branch.clinicId) &&
      m.branchId === branch.id
    );
    if (hasActiveBranchMembership) return true;

    // Secondary fallback when memberships are still loading: check office assigned to this branch
    const hasBranchOffice = d.offices?.some(o => 
      o.branchId === branch.id && (!branch.clinicId || o.clinicId === branch.clinicId)
    );
    if (hasBranchOffice && memberships.length === 0) return true;

    return false;
  }) : doctors;

  const initialDoc = initialDoctorId 
    ? doctors.find(d => d.id === initialDoctorId) 
    : (availableDoctors[0] || doctors[0]);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoc?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [calculatedSlots, setCalculatedSlots] = useState<TimeSlotInfo[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const [visitReason, setVisitReason] = useState<string>('');
  const [patientName, setPatientName] = useState<string>(currentUser?.name || '');
  const [patientPhone, setPatientPhone] = useState<string>(currentUser?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{
    trackingCode: string;
    queueNumber: number;
    estimatedWaitMinutes: number;
    doctorName: string;
    branchName: string;
    timeSlot: string;
    dateLabel: string;
  } | null>(null);

  // Reset or update selected doctor on modal open or branch/doctor prop change
  useEffect(() => {
    if (initialDoctorId) {
      setSelectedDoctorId(initialDoctorId);
    } else if (availableDoctors.length > 0 && !availableDoctors.some(d => d.id === selectedDoctorId)) {
      setSelectedDoctorId(availableDoctors[0].id);
    }
  }, [initialDoctorId, branch?.id, availableDoctors]);

  // Update patient form if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setPatientName(currentUser.name);
      if (currentUser.phone) setPatientPhone(currentUser.phone);
    }
  }, [currentUser]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || availableDoctors[0] || doctors[0];

  // Resolve office matching this branch if applicable
  const matchingOffice = selectedDoctor?.offices?.find(o => branch && o.branchId === branch.id) || selectedDoctor?.offices?.[0];
  const resolvedOfficeId = matchingOffice?.id;
  const resolvedBranchId = matchingOffice?.branchId || branch?.id || selectedDoctor?.branchId;
  const resolvedClinicId = matchingOffice?.clinicId || branch?.clinicId || selectedDoctor?.clinicId;

  // Fetch real availability slots from centralized availability engine
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor?.id || !selectedDate) return;
    setIsSlotsLoading(true);
    setConflictError(null);
    try {
      const slots = await apiService.calculateAvailableSlots({
        doctorId: selectedDoctor.id,
        date: selectedDate,
        officeId: resolvedOfficeId,
        branchId: resolvedBranchId,
        visitType: 'in_person',
        includeUnavailable: true
      });
      setCalculatedSlots(slots);

      // Auto-select first available slot if currently selected slot is not available or empty
      setSelectedTimeSlot(prevSlot => {
        if (prevSlot && slots.some(s => s.timeSlot === prevSlot && s.isAvailable)) {
          return prevSlot;
        }
        const firstAvail = slots.find(s => s.isAvailable);
        return firstAvail ? firstAvail.timeSlot : '';
      });
    } catch (err) {
      console.error('Error fetching calculated slots for in-person booking:', err);
    } finally {
      setIsSlotsLoading(false);
    }
  }, [selectedDoctor?.id, selectedDate, resolvedOfficeId, resolvedBranchId]);

  useEffect(() => {
    if (isOpen && selectedDoctor?.id) {
      fetchSlots();
    }
  }, [isOpen, fetchSlots]);

  if (!isOpen || !branch) return null;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeSlot) {
      setConflictError('لطفاً یک زمان خالی برای نوبت انتخاب فرمایید.');
      return;
    }

    const trimmedName = patientName.trim();
    if (!trimmedName) {
      setConflictError('لطفاً نام و نام خانوادگی بیمار را وارد فرمایید.');
      return;
    }

    if (!isValidIranianMobile(patientPhone)) {
      setConflictError('لطفاً شماره موبایل معتبر (۱۱ رقم با ۰۹) وارد نمایید.');
      return;
    }

    const normalizedPhone = formatStandardIranianMobile(patientPhone);

    setSubmitting(true);
    setConflictError(null);

    try {
      const doc = selectedDoctor || doctors[0];
      
      const dateLabel = isDateToday(selectedDate)
        ? 'امروز (پذیرش فوری حضوری)'
        : selectedDate === tomorrowISO
        ? `فردا (${getPersianWeekdayName(selectedDate)} ${formatToPersianDate(selectedDate)})`
        : `${getPersianWeekdayName(selectedDate)} ${formatToPersianDate(selectedDate)}`;

      const appointment = await apiService.createAppointment({
        doctorId: doc.id,
        doctorName: doc.name,
        doctorSpecialty: doc.specialtyName,
        doctorAvatar: doc.avatar,
        patientId: currentUser?.id,
        patientName: trimmedName,
        patientPhone: normalizedPhone,
        patientAge: undefined,
        visitType: 'in_person',
        date: selectedDate, // Real selected ISO date
        timeSlot: selectedTimeSlot,
        clinicAddress: `${branch.name} - ${branch.address} (${branch.floorAndUnit || 'واحد پذیرش'})`,
        clinicId: resolvedClinicId,
        branchId: resolvedBranchId,
        officeId: resolvedOfficeId,
        symptomsNote: visitReason || 'مراجعه حضوری مستقیم به شعبه',
        fee: doc.consultationFee || 250000,
        paidStatus: 'pending'
      });

      setTicketResult({
        trackingCode: appointment.trackingCode,
        queueNumber: appointment.queuePosition || 1,
        estimatedWaitMinutes: appointment.estimatedWaitMinutes || branch.currentQueueWaitMinutes || 12,
        doctorName: doc.name,
        branchName: branch.name,
        timeSlot: formatToPersianDigits(selectedTimeSlot),
        dateLabel
      });

      if (onAppointmentCreated) {
        onAppointmentCreated(appointment.id);
      }
    } catch (err: any) {
      console.error('In-person booking error:', err);
      if (err?.reason === 'SLOT_ALREADY_BOOKED' || err?.code === 'SLOT_CONFLICT' || err?.message?.includes('رزرو شد')) {
        setConflictError('این زمان لحظاتی قبل رزرو شد. لطفاً زمان دیگری انتخاب کنید.');
      } else if (err?.reason === 'DOCTOR_ON_LEAVE' || err?.message?.includes('مرخصی')) {
        setConflictError('پزشک در این تاریخ در مرخصی به سر می‌برد.');
      } else if (err?.message) {
        setConflictError(err.message);
      } else {
        setConflictError('این زمان لحظاتی قبل رزرو شد. لطفاً زمان دیگری انتخاب کنید.');
      }
      // Re-fetch slots to reflect live state
      fetchSlots();
    } finally {
      setSubmitting(false);
    }
  };

  const bLat = branch.coordinates?.lat || 35.7832;
  const bLng = branch.coordinates?.lng || 51.3745;
  const neshanUrl = `https://neshan.org/maps/@${bLat},${bLng},17z`;
  const baladUrl = `https://balad.ir/location?latitude=${bLat}&longitude=${bLng}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bLat},${bLng}`;

  return (
    <ModalPortal isOpen={isOpen && !!branch} onClose={onClose} zIndexClass={MODAL_Z_INDEX.NESTED_MODAL}>
      <div 
        className="fixed inset-0 min-h-[100dvh] w-screen flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200" 
        dir="rtl"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="in-person-booking-dialog-title"
      >
        <div 
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] text-slate-800 my-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 id="in-person-booking-dialog-title" className="text-base sm:text-lg font-black">{branch.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">ثبت نوبت و پذیرش سریع مراجعه حضوری</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="بستن پنجره"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {ticketResult ? (
            /* Ticket Confirmation View */
            <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  نوبت حضوری با موفقیت ثبت شد
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2">بلیط ورود و پذیرش در شعبه</h4>
                <p className="text-xs text-slate-500 mt-1">
                  لطفاً هنگام مراجعه به باجه پذیرش، این کد رهگیری را به منشی اعلام فرمایید.
                </p>
              </div>

              {/* Digital Queue Card */}
              <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl text-right space-y-4 border border-blue-600/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="text-[11px] text-blue-300 font-medium">کد پیگیری پذیرش حضوری</div>
                    <div className="text-xl font-mono font-black tracking-wider text-white" dir="ltr">
                      {ticketResult.trackingCode}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] text-slate-400">شماره نوبت تقریبی</div>
                    <div className="text-2xl font-black text-blue-400">#{ticketResult.queueNumber}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">مرکز / شعبه:</span>
                    <span className="font-bold text-slate-100">{ticketResult.branchName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">پزشک معالج:</span>
                    <span className="font-bold text-slate-100">{ticketResult.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">زمان مراجعه:</span>
                    <span className="font-bold text-amber-300">{ticketResult.dateLabel} - ساعت {ticketResult.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">تخمین معطلی در صف:</span>
                    <span className="font-bold text-emerald-400">حدود {ticketResult.estimatedWaitMinutes} دقیقه</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{branch.address} - {branch.floorAndUnit}</span>
                </div>
              </div>

              {/* Fast Navigation Buttons */}
              <div className="space-y-2 text-right">
                <span className="text-xs font-bold text-slate-700 block">مسیریابی مستقیم تا درب شعبه:</span>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={neshanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                  >
                    <span>مسیریابی با نشان</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={baladUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                  >
                    <span>مسیریابی با بلد</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ / ذخیره فیش</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  تایید و بازگشت
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmitBooking} className="space-y-5 text-right">
              {/* Conflict Error Notice */}
              {conflictError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold">{conflictError}</div>
                    <div className="text-[11px] text-rose-600">جدول زمان‌بندی زیر با آخرین وضعیت سیستم به‌روزرسانی شد.</div>
                  </div>
                </div>
              )}

              {/* Branch Quick Summary Box */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900">{branch.address}</div>
                  <div className="text-slate-500">{branch.floorAndUnit} • تلفن: {branch.phone}</div>
                  <div className="text-emerald-700 font-medium pt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{branch.workingHours}</span>
                  </div>
                </div>
              </div>

              {/* Select Doctor */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  انتخاب پزشک مورد نظر:
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-hidden"
                >
                  {availableDoctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialtyName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Date: Uses centralized date utilities */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  تاریخ مراجعه حضوری:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(todayISO);
                      setConflictError(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedDate === todayISO
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>امروز ({getPersianWeekdayName(todayISO)})</div>
                    <div className={`text-[10px] mt-0.5 font-normal ${selectedDate === todayISO ? 'text-blue-100' : 'text-slate-400'}`}>
                      {formatToPersianDate(todayISO)}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(tomorrowISO);
                      setConflictError(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedDate === tomorrowISO
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>فردا ({getPersianWeekdayName(tomorrowISO)})</div>
                    <div className={`text-[10px] mt-0.5 font-normal ${selectedDate === tomorrowISO ? 'text-blue-100' : 'text-slate-400'}`}>
                      {formatToPersianDate(tomorrowISO)}
                    </div>
                  </button>
                </div>
              </div>

              {/* Time Slots: Dynamic Availability Engine */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    بازه زمانی و ساعت نوبت حضوری:
                  </label>
                  {isSlotsLoading && (
                    <div className="flex items-center gap-1 text-[11px] text-blue-600">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>در حال استعلام ظرفیت...</span>
                    </div>
                  )}
                </div>

                {isSlotsLoading ? (
                  <div className="grid grid-cols-3 gap-2 py-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : calculatedSlots.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-800 text-center space-y-1">
                    <p className="font-bold">نوبت فعالی در این تاریخ یافت نشد.</p>
                    <p className="text-[11px] text-amber-700">
                      پزشک انتخابی در این روز در این شعبه حضور ندارد. لطفاً تاریخ فردا یا پزشک دیگری را انتخاب فرمایید.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {calculatedSlots.map(slot => {
                      const isSelected = selectedTimeSlot === slot.timeSlot;
                      const isAvail = slot.isAvailable;

                      let reasonBadge = '';
                      if (!isAvail) {
                        if (slot.unavailableReason === 'booked') reasonBadge = 'رزرو شده';
                        else if (slot.unavailableReason === 'leave') reasonBadge = 'مرخصی';
                        else if (slot.unavailableReason === 'closed') reasonBadge = 'تعطیل';
                        else if (slot.unavailableReason === 'passed') reasonBadge = 'گذشته';
                        else reasonBadge = 'تکمیل';
                      }

                      return (
                        <button
                          key={slot.timeSlot}
                          type="button"
                          disabled={!isAvail}
                          onClick={() => {
                            if (isAvail) {
                              setSelectedTimeSlot(slot.timeSlot);
                              setConflictError(null);
                            }
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                            isSelected && isAvail
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/30'
                              : isAvail
                              ? 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer'
                              : 'bg-slate-100/80 text-slate-400 border-slate-200/80 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span className="font-mono">{slot.persianTimeSlot || formatToPersianDigits(slot.timeSlot)}</span>
                          {reasonBadge && (
                            <span className="text-[9px] px-1 rounded bg-slate-200 text-slate-600">
                              {reasonBadge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">نام و نام خانوادگی بیمار:</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="مثلاً مریم حسینی"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">شماره موبایل بیمار:</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-mono focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-hidden text-right"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">علت مراجعه یا علائم (اختیاری):</label>
                <input
                  type="text"
                  value={visitReason}
                  onChange={e => setVisitReason(e.target.value)}
                  placeholder="مثلاً معاینه قلب، کشیدن بخیه، سونوگرافی، درد زانو..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-hidden"
                />
              </div>

              {/* Safe Note */}
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60 text-[11px] text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  نوبت شما در سامانه نوبت‌دهی ثبت شده و پیام یادآوری در نسخه نمایشی ثبت می‌شود.
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedTimeSlot || isSlotsLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>ثبت نهایی نوبت حضوری (شبیه‌ساز)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  </ModalPortal>
);
};
