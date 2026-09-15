import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  LogOut, 
  ExternalLink, 
  X, 
  ShieldCheck,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { Doctor, Appointment, User as AuthUser } from '../../types';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface Props {
  doctor: Doctor;
  currentUser: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onBookNewAppointment: () => void;
}

export const DoctorSiteMiniAccountModal: React.FC<Props> = ({
  doctor,
  currentUser,
  isOpen,
  onClose,
  onBookNewAppointment
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      apiService.getAppointmentsByPatient(currentUser.id)
        .then(apps => {
          setAppointments(apps);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  // Filter appointments specifically with this doctor
  const doctorAppointments = appointments.filter(a => a.doctorId === doctor.id);
  const nextApp = doctorAppointments.find(a => a.status === 'scheduled' || a.status === 'arrived' || a.status === 'in_visit');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in text-right font-sans" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          aria-label="بستن پنجره"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Identity Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900">{currentUser.name}</h3>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                حساب کاربری بیمار
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono" dir="ltr">{currentUser.phone}</p>
          </div>
        </div>

        {/* Next Appointment Card with This Doctor */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>وضعیت نوبت شما با {doctor.name}:</span>
          </h4>

          {nextApp ? (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span>نوبت پیش‌رو (تأیید شده)</span>
                <span className="font-mono text-blue-700 text-xs bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  {nextApp.trackingCode}
                </span>
              </div>
              <div className="text-slate-700 space-y-1">
                <div>📅 تاریخ: <strong>{nextApp.date}</strong> - ساعت <strong>{nextApp.timeSlot}</strong></div>
                <div>📍 محل: {nextApp.clinicAddress || doctor.address}</div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-center justify-between">
              <span>در حال حاضر نوبت فعالی با این پزشک ندارید.</span>
              <button
                onClick={() => {
                  onClose();
                  onBookNewAppointment();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] transition-colors"
              >
                رزرو نوبت جدید
              </button>
            </div>
          )}
        </div>

        {/* Quick Portal Navigation Links */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500">دسترسی‌های سریع به پرونده سلامت همرا کلینیک:</h4>
          
          <div className="grid grid-cols-1 gap-2">
            <Link
              to="/patient/appointments"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium transition-colors"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>همه نوبت‌های من ({appointments.length})</span>
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/patient/records"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>سوابق پزشکی و آزمایشات آنلاین</span>
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/patient/family"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>مدیریت اعضای خانواده</span>
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/patient"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-xl bg-blue-900 text-blue-100 text-xs font-bold transition-colors hover:bg-blue-950"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <span>ورود به پرتال کامل بیمار (مرکزی)</span>
              </span>
              <ChevronLeft className="w-4 h-4 text-blue-400" />
            </Link>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از حساب کاربری</span>
          </button>

          <span className="text-[11px] text-slate-400">حساب یکپارچه سلامت همرا کلینیک</span>
        </div>

      </div>
    </div>
  );
};
