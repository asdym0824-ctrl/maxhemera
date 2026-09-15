import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Doctor, VisitType, FamilyMember, Appointment, TimeSlotInfo } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User as UserIcon, 
  CheckCircle2, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Video, 
  ArrowLeft,
  CalendarPlus,
  Users,
  LogIn,
  Phone,
  Lock,
  Sparkles,
  AlertCircle,
  Building2,
  RefreshCw,
  Ban,
  Info
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { getDynamicBookingDates, getRelativeISODate, formatToPersianDate, calculateAge, formatToPersianDigits } from '../../utils/dateUtils';
import { isValidIranianMobile, formatStandardIranianMobile } from '../../utils/validationUtils';
import { bookingIntentService, PendingBookingIntent, createGuestBookingSessionId } from '../../services/bookingIntentService';

interface AppointmentWizardProps {
  doctor: Doctor;
  familyMembers?: FamilyMember[];
  initialIntent?: Partial<PendingBookingIntent>;
  officeTitle?: string;
  officeId?: string;
  onComplete: (appointment: Appointment) => void;
  onCancel: () => void;
}

export const AppointmentWizard: React.FC<AppointmentWizardProps> = ({
  doctor,
  familyMembers: initialFamilyMembers = [],
  initialIntent,
  officeTitle,
  officeId,
  onComplete,
  onCancel
}) => {
  const { currentUser, isLoggedIn, loginWithPhone } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Load existing intent if matching this doctor
  const storedIntent = bookingIntentService.get();
  const matchedIntent = (storedIntent && (storedIntent.doctorId === doctor.id || storedIntent.doctorSlug === doctor.slug))
    ? storedIntent
    : null;

  const activeIntent = initialIntent || matchedIntent;

  const dates = getDynamicBookingDates();
  const [visitType, setVisitType] = useState<VisitType>(
    activeIntent?.visitType || 'in_person'
  );

  // Office selection for doctors with multiple offices - use stable officeId
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | undefined>(() => {
    if (activeIntent?.officeId && doctor.offices && doctor.offices.length > 0) {
      const matched = doctor.offices.find(o => o.id === activeIntent.officeId);
      if (matched) return matched.id;
    } else if (activeIntent?.officeId) {
      return activeIntent.officeId;
    }
    if (officeId && doctor.offices && doctor.offices.length > 0) {
      const matched = doctor.offices.find(o => o.id === officeId);
      if (matched) return matched.id;
    } else if (officeId) {
      return officeId;
    }
    // Fallback to primary office or first office
    const primary = doctor.offices?.find(o => o.isPrimary);
    return primary?.id || doctor.offices?.[0]?.id;
  });

  const [selectedDate, setSelectedDate] = useState<string>(
    activeIntent?.selectedDate || dates[0]?.dateStr || getRelativeISODate(0)
  );
  const [selectedSlot, setSelectedSlot] = useState<string>(
    activeIntent?.selectedTime || activeIntent?.selectedTimeSlot || ''
  );
  const [patientTarget, setPatientTarget] = useState<'self' | string>(
    activeIntent?.patientTarget || 'self'
  );
  const [symptomsNote, setSymptomsNote] = useState<string>(
    activeIntent?.symptomsNote || ''
  );

  // Calculated Slots State
  const [calculatedSlots, setCalculatedSlots] = useState<TimeSlotInfo[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(true);
  const [bookingConflictError, setBookingConflictError] = useState<string | null>(null);

  // If user was redirected back after login, resume directly to patient selection / confirmation step
  const [step, setStep] = useState<number>(() => {
    if (activeIntent?.step) return activeIntent.step;
    if (isLoggedIn && currentUser?.id && matchedIntent) return 3;
    return 1;
  });

  const [familyMembersList, setFamilyMembersList] = useState<FamilyMember[]>(initialFamilyMembers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Validate restored intent upon mounting
  useEffect(() => {
    if (matchedIntent) {
      const validation = bookingIntentService.validateIntent(matchedIntent, doctor);
      if (!validation.valid) {
        if (validation.code === 'EXPIRED') {
          bookingIntentService.clear();
        } else if (validation.code === 'OFFICE_NOT_FOUND' || validation.code === 'RELATIONSHIP_MISMATCH') {
          setBookingConflictError(validation.message || 'اطلاعات مطب تغییر کرده است. لطفاً مجدداً مطب و زمان را بررسی فرمایید.');
          setStep(2);
        }
      }
    }
  }, [doctor.id, matchedIntent?.id]);

  // Inline Quick Login State for seamless logged-out booking continuity
  const [authPhone, setAuthPhone] = useState(currentUser?.phone || '');
  const [authOtp, setAuthOtp] = useState('');
  const [authStage, setAuthStage] = useState<'phone' | 'otp'>('phone');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch dynamically calculated slots from availability engine
  const fetchSlots = async () => {
    setIsSlotsLoading(true);
    try {
      const activeOffice = doctor.offices?.find(o => o.id === selectedOfficeId);
      const slots = await apiService.calculateAvailableSlots({
        doctorId: doctor.id,
        date: selectedDate,
        officeId: visitType === 'in_person' ? selectedOfficeId : undefined,
        branchId: visitType === 'in_person' ? activeOffice?.branchId : undefined,
        visitType,
        includeUnavailable: true
      });
      setCalculatedSlots(slots);

      // Validate selected slot availability
      if (selectedSlot) {
        const targetSlot = slots.find(s => s.timeSlot === selectedSlot);
        if (!targetSlot || !targetSlot.isAvailable) {
          // Stale slot detected: preserve doctor, office, and date context, but ask user to select another time
          setSelectedSlot('');
          setBookingConflictError('زمان انتخابی قبلی شما دیگر خالی نیست یا رزرو شده است. لطفاً زمان دیگری را انتخاب فرمایید.');
          setStep(2);
        }
      }
    } catch (err) {
      console.error('Error fetching calculated slots:', err);
    } finally {
      setIsSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [doctor.id, selectedDate, selectedOfficeId, visitType]);

  // Load family members whenever user is logged in
  useEffect(() => {
    if (currentUser?.id) {
      apiService.getFamilyMembers(currentUser.id).then(fams => {
        setFamilyMembersList(fams);
      });
    } else {
      setFamilyMembersList([]);
    }
  }, [currentUser?.id]);

  // Persist current wizard state to booking intent using stable IDs
  const persistCurrentIntent = (targetStep: number = step) => {
    const returnUrl = location.pathname + location.search;
    const currentOffice = doctor.offices?.find(o => o.id === selectedOfficeId);
    const resolvedClinicId = currentOffice?.clinicId || doctor.clinicId;
    const resolvedBranchId = currentOffice?.branchId || doctor.branchId;
    bookingIntentService.save({
      doctorId: doctor.id,
      doctorSlug: doctor.slug,
      doctorName: doctor.name,
      clinicId: resolvedClinicId,
      branchId: resolvedBranchId,
      officeId: selectedOfficeId,
      officeTitle: currentOffice?.title || officeTitle, // Optional display data only
      visitType,
      selectedDate,
      selectedTime: selectedSlot,
      selectedTimeSlot: selectedSlot,
      symptomsNote,
      patientTarget,
      familyMemberId: patientTarget !== 'self' ? patientTarget : undefined,
      returnUrl,
      step: targetStep
    });
  };

  // Step advancement with authentication gate check
  const handleNextStep = () => {
    setBookingConflictError(null);
    const nextStepNum = step + 1;
    persistCurrentIntent(nextStepNum);

    // If moving from Step 2 to Step 3 and user is not logged in, step 3 will render inline auth
    setStep(nextStepNum);
  };

  // Inline Quick OTP Send
  const handleSendQuickOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!isValidIranianMobile(authPhone)) {
      setAuthError('لطفاً شماره همراه معتبر (۱۱ رقم با ۰۹) وارد نمایید.');
      return;
    }
    const formatted = formatStandardIranianMobile(authPhone);
    setAuthPhone(formatted);
    setIsAuthLoading(true);
    setTimeout(() => {
      setIsAuthLoading(false);
      setAuthStage('otp');
      setAuthOtp('123456'); // Pre-fill mock OTP for smooth testing
    }, 400);
  };

  // Inline Quick OTP Verify & Resume
  const handleVerifyQuickOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const ok = await loginWithPhone(authPhone, authOtp);
      if (ok) {
        persistCurrentIntent(3);
      } else {
        setAuthError('کد تأیید نامعتبر است.');
      }
    } catch {
      setAuthError('خطا در ورود به سامانه.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Redirect to full LoginPage with returnUrl and intent preserved
  const handleRedirectToFullLogin = () => {
    persistCurrentIntent(3);
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?returnUrl=${returnUrl}`);
  };

  // Final booking submission
  const handleBookingSubmit = async () => {
    if (!currentUser || !currentUser.id || !isLoggedIn) {
      setStep(3); // Route to authentication step
      return;
    }

    if (!selectedSlot) {
      setBookingConflictError('لطفاً ابتدا یک زمان خالی برای ویزیت انتخاب فرمایید.');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setBookingConflictError(null);
    try {
      let patientName = currentUser.name || 'بیمار محترم';
      let familyRelation: 'self' | 'mother' | 'father' | 'child' | 'spouse' = 'self';
      let computedAge: number | undefined = calculateAge(currentUser.birthDate || currentUser.birthYear);

      if (patientTarget !== 'self') {
        const foundFam = familyMembersList.find(f => f.id === patientTarget);
        if (foundFam) {
          patientName = `${foundFam.name} (${foundFam.relation === 'mother' ? 'مادر' : foundFam.relation === 'father' ? 'پدر' : foundFam.relation === 'child' ? 'فرزند' : 'همسر'})`;
          familyRelation = foundFam.relation;
          computedAge = calculateAge(foundFam.birthYear);
        }
      }

      const activeOffice = doctor.offices?.find(o => o.id === selectedOfficeId);

      // Validate office selection for in-person visits
      if (visitType === 'in_person' && selectedOfficeId && doctor.offices && doctor.offices.length > 0) {
        if (!activeOffice) {
          setBookingConflictError('اطلاعات محل ویزیت کامل نیست. لطفاً محل دیگری انتخاب کنید.');
          setStep(2);
          return;
        }
      }

      const resolvedClinicId = activeOffice?.clinicId || doctor.clinicId;
      const resolvedBranchId = activeOffice?.branchId || doctor.branchId;

      if (!resolvedClinicId || !resolvedBranchId) {
        setBookingConflictError('اطلاعات محل ویزیت کامل نیست. لطفاً محل دیگری انتخاب کنید.');
        return;
      }

      const effectiveAddress = activeOffice
        ? `${activeOffice.address} (${activeOffice.title})`
        : (officeTitle ? `${doctor.address} (${officeTitle})` : doctor.address);

      const newApp = await apiService.createAppointment({
        clinicId: resolvedClinicId,
        branchId: resolvedBranchId,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialtyName,
        doctorAvatar: doctor.avatar,
        patientId: currentUser.id,
        patientName: currentUser.name || 'بیمار محترم',
        familyMemberName: patientTarget !== 'self' ? patientName : undefined,
        familyRelation,
        patientPhone: currentUser.phone || '',
        patientAge: computedAge,
        visitType,
        date: selectedDate,
        timeSlot: selectedSlot,
        officeId: selectedOfficeId,
        clinicAddress: effectiveAddress,
        symptomsNote,
        fee: visitType === 'in_person' ? doctor.consultationFee : (doctor.onlineConsultationFee || 280000),
        paidStatus: 'pending',
        paymentMode: 'demo',
        paymentStatus: 'simulated'
      });

      // Clear the pending intent once booking is successfully finalized
      bookingIntentService.clear();

      setCreatedAppointment(newApp);
      setStep(6); // Success step
    } catch (err: any) {
      console.error('Booking submission conflict / error:', err);
      // Double Booking prevention handling with required exact error message
      const conflictMsg = err?.message || 'این زمان لحظاتی قبل رزرو شد. لطفاً زمان دیگری انتخاب کنید.';
      setBookingConflictError(conflictMsg);
      // Return user back to Step 2 so they can pick another open slot
      setStep(2);
      // Refresh slots in real-time
      fetchSlots();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUserAuthenticated = !!currentUser && !!currentUser.id && isLoggedIn;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden max-w-2xl mx-auto my-6 text-right font-sans" dir="rtl">
      {/* Stepper Header */}
      {step <= 5 ? (
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="font-bold text-base text-white">{doctor.name}</h3>
                <p className="text-xs text-blue-300">{doctor.specialtyName}</p>
              </div>
            </div>
            <Badge variant="blue">مرحله {step} از ۵</Badge>
          </div>

          {/* Step Progress Bar */}
          <div className="grid grid-cols-5 gap-1.5 pt-2">
            {[1, 2, 3, 4, 5].map(sNum => (
              <div
                key={sNum}
                className={`h-1.5 rounded-full transition-all ${
                  sNum <= step ? 'bg-blue-400' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-900 text-white p-6 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">نوبت با موفقیت ثبت شد</h3>
              <p className="text-xs text-emerald-200">اطلاعات نوبت و کد پیگیری رزرو شما</p>
            </div>
          </div>
          <Badge variant="emerald">تأیید شده</Badge>
        </div>
      )}

      <div className="p-6 sm:p-8 space-y-6">
        {/* Step 1: Visit Type */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              مرحله ۱: انتخاب نوع ویزیت
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setVisitType('in_person')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                  visitType === 'in_person'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  {visitType === 'in_person' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="font-bold text-sm">ویزیت حضوری در مطب / کلینیک</div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  مراجعه حضوری به مطب دکتر ({officeTitle || doctor.address.split('،')[0]})
                </p>
                <div className="text-xs font-bold text-blue-700 pt-1">
                  تعرفه: {doctor.consultationFee.toLocaleString('fa-IR')} تومان
                </div>
              </div>

              {doctor.hasOnlineConsultation && (
                <div
                  onClick={() => setVisitType('online_video')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                    visitType === 'online_video'
                      ? 'border-sky-600 bg-sky-50/50 text-sky-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                      <Video className="w-5 h-5" />
                    </div>
                    {visitType === 'online_video' && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
                  </div>
                  <div className="font-bold text-sm">ویزیت ویدئویی آنلاین</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ارتباط تصویری امن مستقیماً داخل سامانه بدون نیاز به حضور فیزیکی
                  </p>
                  <div className="text-xs font-bold text-sky-700 pt-1">
                    تعرفه: {(doctor.onlineConsultationFee || 280000).toLocaleString('fa-IR')} تومان
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Date & Slot */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                مرحله ۲: انتخاب روز و زمان ویزیت
              </h4>
              <button
                type="button"
                onClick={fetchSlots}
                disabled={isSlotsLoading}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                title="بروزرسانی ظرفیت‌ها"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSlotsLoading ? 'animate-spin' : ''}`} />
                <span>بروزرسانی نوبت‌ها</span>
              </button>
            </div>

            {/* Double-Booking / Conflict Alert Notification */}
            {bookingConflictError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div className="font-bold leading-relaxed">{bookingConflictError}</div>
              </div>
            )}

            {/* Office Selector for Doctors with Multiple Clinics/Offices */}
            {visitType === 'in_person' && doctor.offices && doctor.offices.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  انتخاب مطب / محل ویزیت:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {doctor.offices.map(off => (
                    <button
                      key={off.id}
                      type="button"
                      onClick={() => setSelectedOfficeId(off.id)}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        selectedOfficeId === off.id
                          ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold shadow-xs ring-1 ring-blue-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{off.title}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{off.address}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">انتخاب تاریخ:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {dates.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.dateStr);
                      setBookingConflictError(null);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedDate === d.dateStr
                        ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{d.label}</div>
                    <div className="text-[11px] opacity-80">{d.dayName}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{d.persianFormatted}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Time Slots */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">ساعت‌های خالی محاسبه‌شده:</label>
                <span className="text-[11px] text-slate-500">
                  {isSlotsLoading ? 'در حال بررسی...' : `${calculatedSlots.filter(s => s.isAvailable).length} نوبت آزاد`}
                </span>
              </div>

              {isSlotsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : calculatedSlots.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2 text-slate-600">
                  <Ban className="w-7 h-7 mx-auto text-slate-400" />
                  <div className="font-bold text-xs text-slate-800">
                    پزشک در این روز برنامه ویزیت {visitType === 'in_person' ? 'حضوری' : 'آنلاین'} ندارد.
                  </div>
                  <p className="text-[11px] text-slate-500">لطفاً تاریخ دیگری را از لیست بالا انتخاب فرمایید.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {calculatedSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.timeSlot && slot.isAvailable;
                    return (
                      <button
                        key={slot.timeSlot}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => {
                          if (slot.isAvailable) {
                            setSelectedSlot(slot.timeSlot);
                            setBookingConflictError(null);
                          }
                        }}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all relative ${
                          !slot.isAvailable
                            ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed opacity-60 line-through decoration-slate-300'
                            : isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs cursor-pointer'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 cursor-pointer'
                        }`}
                        title={slot.isAvailable ? `رزرو ساعت ${slot.timeSlot}` : (slot.unavailableReason === 'booked' ? 'این زمان قبلاً رزرو شده است' : 'این زمان غیرفعال است')}
                      >
                        <div>ساعت {slot.persianTimeSlot || slot.timeSlot}</div>
                        {!slot.isAvailable && (
                          <div className="text-[9px] font-normal no-underline text-rose-500 mt-0.5">
                            {slot.unavailableReason === 'booked' ? 'رزرو شده' : 'غیرفعال'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Patient Identity / Authentication */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {!isUserAuthenticated ? (
              /* Inline Quick Authentication View for Logged-Out Visitors */
              <div className="space-y-4">
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>تأیید هویت و ادامه فرایند نوبت‌دهی</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    زمان انتخاب شده ({formatToPersianDate(selectedDate)} - ساعت {selectedSlot}) برای شما رزرو موقت شده است. جهت ثبت پرونده و صدور کد رهگیری، شماره موبایل خود را وارد نمایید.
                  </p>
                </div>

                {authError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authStage === 'phone' ? (
                  <form onSubmit={handleSendQuickOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        شماره همراه بیمار:
                      </label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-600/30">
                        <Phone className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                        <input
                          type="tel"
                          required
                          value={authPhone}
                          onChange={e => setAuthPhone(e.target.value)}
                          placeholder="۰۹۱۲۱۱۱۲۲۳۳"
                          className="w-full bg-transparent outline-hidden font-mono font-bold text-slate-900 text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        className="flex-1"
                        isLoading={isAuthLoading}
                        type="submit"
                        icon={<ArrowLeft className="w-4 h-4" />}
                      >
                        دریافت کد تأیید سریع
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        type="button"
                        onClick={handleRedirectToFullLogin}
                        icon={<LogIn className="w-4 h-4" />}
                      >
                        ورود با پرتال مرکزی
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyQuickOtp} className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                      <span>کد تأیید به شماره <strong>{authPhone}</strong> شبیه‌سازی شد. (کد تست: ۱۲۳۴۵۶)</span>
                      <button
                        type="button"
                        onClick={() => setAuthStage('phone')}
                        className="text-blue-600 hover:underline font-bold text-[11px]"
                      >
                        ویرایش شماره
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        کد تأیید (کد آزمایشی: ۱۲۳۴۵۶):
                      </label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-600/30">
                        <Lock className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={authOtp}
                          onChange={e => setAuthOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full bg-transparent outline-hidden font-mono font-black text-center text-lg tracking-widest text-slate-900"
                        />
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      isLoading={isAuthLoading}
                      type="submit"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      تأیید و ادامه نوبت‌دهی
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              /* Authenticated Patient / Family Member Selector */
              <div className="space-y-4">
                <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  مرحله ۳: نوبت برای چه کسی گرفته می‌شود؟
                </h4>

                <div className="space-y-3">
                  {/* Self Option */}
                  <div
                    onClick={() => setPatientTarget('self')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      patientTarget === 'self'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">برای خودم ({currentUser?.name || 'بیمار'})</div>
                        <div className="text-xs text-slate-500 font-mono" dir="ltr">
                          {currentUser?.phone || ''}
                        </div>
                      </div>
                    </div>
                    {patientTarget === 'self' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                  </div>

                  {/* Family Members Options */}
                  {familyMembersList.map(fam => (
                    <div
                      key={fam.id}
                      onClick={() => setPatientTarget(fam.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        patientTarget === fam.id
                          ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                          <UserIcon className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">
                            {fam.name} ({fam.relation === 'mother' ? 'مادر' : fam.relation === 'father' ? 'پدر' : fam.relation === 'child' ? 'فرزند' : 'همسر'})
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>کد ملی: {fam.nationalId}</span>
                            {fam.birthYear && (
                              <span>• سن: {calculateAge(fam.birthYear)} سال</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {patientTarget === fam.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Symptoms Note */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              مرحله ۴: توضیحات علائم اولیه برای پزشک
            </h4>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                علت اصلی مراجعه یا توضیحات پیش از ویزیت را بنویسید (اختیاری):
              </label>
              <textarea
                value={symptomsNote}
                onChange={e => setSymptomsNote(e.target.value)}
                rows={4}
                placeholder="مثلاً: حدود دو هفته است درد خفیف قفسه سینه دارم یا نیاز به تمدید نسخه..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-600/30"
              />
            </div>
          </div>
        )}

        {/* Step 5: Summary & Confirm */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              مرحله ۵: بررسی و ثبت نوبت (پرداخت نمایشی)
            </h4>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">پزشک معالج:</span>
                <span className="font-bold text-slate-900">{doctor.name} ({doctor.specialtyName})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">مراجعه‌کننده:</span>
                <span className="font-bold text-slate-900">
                  {patientTarget === 'self' 
                    ? `${currentUser?.name || 'بیمار'} (خودم)` 
                    : (familyMembersList.find(f => f.id === patientTarget)?.name || 'عضو خانواده')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">نوع ویزیت:</span>
                <span className="font-bold text-blue-700">
                  {visitType === 'in_person' ? 'حضوری در مطب / کلینیک' : 'ویدئویی آنلاین'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">تاریخ و زمان:</span>
                <span className="font-bold text-slate-900">{formatToPersianDate(selectedDate)} - ساعت {selectedSlot}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">مبلغ ویزیت:</span>
                <span className="font-extrabold text-sm text-blue-700">
                  {(visitType === 'in_person' ? doctor.consultationFee : (doctor.onlineConsultationFee || 280000)).toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">پرداخت نمایشی (نسخه آزمایشی):</strong>
                <span className="text-[11px] leading-relaxed">
                  در نسخه پیش‌نمایش درگاه پرداخت بانکی متصل نیست؛ نوبت با وضعیت پرداخت شبیه‌سازی‌شده (تسویه در مطب / پرداخت نمایشی) ثبت خواهد شد.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Success Modal Content */}
        {step === 6 && createdAppointment && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">نوبت شما با موفقیت ثبت شد!</h3>
              <p className="text-xs text-slate-500">کد پیگیری اختصاصی پرونده کلینیک:</p>
              <div className="inline-block bg-slate-900 text-blue-300 font-mono font-bold text-lg px-4 py-1.5 rounded-xl mt-1">
                {createdAppointment.trackingCode}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">پزشک:</span>
                <span className="font-bold text-slate-800">{createdAppointment.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">بیمار:</span>
                <span className="font-bold text-slate-800">
                  {createdAppointment.familyMemberName || createdAppointment.patientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">زمان حضور:</span>
                <span className="font-bold text-slate-800">{formatToPersianDate(createdAppointment.date)} - ساعت {createdAppointment.timeSlot}</span>
              </div>
              {createdAppointment.queuePosition && (
                <div className="flex justify-between">
                  <span className="text-slate-500">شماره نوبت در صف:</span>
                  <span className="font-bold text-blue-600">#{createdAppointment.queuePosition}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">آدرس:</span>
                <span className="font-medium text-slate-700 max-w-[220px] truncate">{createdAppointment.clinicAddress}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-amber-800 font-bold">
                <span>وضعیت مالی:</span>
                <span>پرداخت نمایشی (در انتظار تسویه)</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800 flex items-center gap-2 text-right">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>پیام یادآوری در نسخه نمایشی ثبت شد.</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => onComplete(createdAppointment)}
              >
                مشاهده در پرتال نوبت‌های من
              </Button>
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                icon={<CalendarPlus className="w-4 h-4" />}
                onClick={() => alert('اطلاعات نوبت به تقویم دستگاه افزوده شد.')}
              >
                افزودن به تقویم
              </Button>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        {step < 6 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button variant="outline" size="md" onClick={() => setStep(step - 1)}>
                مرحله قبل
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  bookingIntentService.clear();
                  onCancel();
                }}
              >
                انصراف
              </Button>
            )}

            {step < 5 ? (
              step === 3 && !isUserAuthenticated ? (
                // On step 3 when unauthenticated, authentication form buttons handle the transition
                null
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextStep}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  ادامه و مرحله بعد
                </Button>
              )
            ) : (
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleBookingSubmit}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                تأیید و ثبت نهایی نوبت (نمایشی)
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
