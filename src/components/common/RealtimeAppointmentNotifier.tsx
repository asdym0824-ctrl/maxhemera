import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, Clock, User, CheckCircle, X, ArrowLeft, Stethoscope, Sparkles } from 'lucide-react';
import { Appointment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { realtimeSyncService } from '../../services/realtimeSyncService';
import { formatToPersianDate } from '../../utils/dateUtils';

export const RealtimeAppointmentNotifier: React.FC = () => {
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [activeAlert, setActiveAlert] = useState<Appointment | null>(null);

  useEffect(() => {
    const unsubscribe = realtimeSyncService.subscribeToNewAppointments((app: Appointment) => {
      // Show notification if user is logged in as staff (doctor, secretary, clinic manager, admin)
      // or if they are testing/previewing
      if (isLoggedIn && currentUser) {
        const isDoctorForThisApp = currentUser.role === 'doctor' && (
          currentUser.doctorId === app.doctorId || 
          currentUser.id === app.doctorId ||
          currentUser.name === app.doctorName
        );
        const isSecretary = currentUser.role === 'secretary' || currentUser.role === 'reception' || currentUser.role === 'nurse';
        const isClinicManager = currentUser.role === 'clinic_manager' || currentUser.role === 'branch_manager';
        const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin';

        if (isDoctorForThisApp || isSecretary || isClinicManager || isAdmin) {
          setActiveAlert(app);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, isLoggedIn]);

  // Auto-dismiss after 9 seconds
  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 9000);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  if (!activeAlert) return null;

  const handleAction = () => {
    if (currentUser?.role === 'doctor') {
      navigate('/doctor');
    } else if (currentUser?.role === 'secretary' || currentUser?.role === 'reception') {
      navigate('/secretary?tab=queue');
    } else if (currentUser?.role === 'clinic_manager') {
      navigate('/clinic?tab=appointments');
    } else if (currentUser?.role === 'super_admin' || currentUser?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/secretary?tab=queue');
    }
    setActiveAlert(null);
  };

  return (
    <div
      id="realtime-appointment-toast"
      dir="rtl"
      className="fixed top-20 right-4 sm:right-6 z-[100] max-w-md w-[calc(100vw-2rem)] sm:w-96 bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-emerald-500/40 ring-4 ring-emerald-500/20 animate-in fade-in slide-in-from-top-4 duration-300 font-sans"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-emerald-300">نوبت جدید رزرو شد!</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                هم‌اکنون
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              ثبت رزرو توسط بیمار در سامانه
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveAlert(null)}
          className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="بستن اعلان"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-800/90 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-300">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>بیمار:</span>
          </div>
          <span className="font-bold text-white text-xs">{activeAlert.patientName}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
            <span>پزشک:</span>
          </div>
          <span className="font-semibold text-blue-300">{activeAlert.doctorName}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>زمان نوبت:</span>
          </div>
          <span className="font-mono text-slate-200 text-[11px]">
            {formatToPersianDate(activeAlert.date)} - ساعت {activeAlert.timeSlot}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">کد پیگیری:</span>
          <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            {activeAlert.trackingCode}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleAction}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <span>مشاهده و رسیدگی در پنل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setActiveAlert(null)}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors cursor-pointer"
        >
          متوجه شدم
        </button>
      </div>
    </div>
  );
};
