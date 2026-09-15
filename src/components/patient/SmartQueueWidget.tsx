import React, { useState } from 'react';
import { Appointment } from '../../types';
import { Clock, MapPin, CheckCircle2, AlertCircle, Users, Navigation } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface SmartQueueWidgetProps {
  appointment: Appointment;
  onCheckIn: (appointmentId: string) => void;
}

export const SmartQueueWidget: React.FC<SmartQueueWidgetProps> = ({ appointment, onCheckIn }) => {
  const [hasArrived, setHasArrived] = useState(appointment.status === 'arrived' || appointment.status === 'in_visit');

  const handleArrivedClick = () => {
    setHasArrived(true);
    onCheckIn(appointment.id);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-blue-600/30 space-y-5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-blue-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              سامانه هوشمند پایش صف مطب (Smart Queue)
            </div>
            <h3 className="text-lg font-bold text-white">نوبت امروز: {appointment.doctorName}</h3>
          </div>
        </div>

        <Badge variant={hasArrived ? 'emerald' : 'amber'}>
          وضعیت: {hasArrived ? 'در مطب پذیرش شده‌اید' : 'در انتظار اعلام حضور'}
        </Badge>
      </div>

      {/* Queue Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
          <span className="text-slate-400 block">تخمین نوبت شما:</span>
          <span className="text-lg font-extrabold text-blue-300">ساعت ۱۷:۴۵</span>
          <span className="text-[11px] text-amber-300 block pt-0.5">⚠️ ۱۵ دقیقه تأخیر پزشک</span>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
          <span className="text-slate-400 block">افراد قبل از شما:</span>
          <span className="text-lg font-extrabold text-white">۲ نفر</span>
          <span className="text-[11px] text-slate-300 block pt-0.5">پزشک در حال ویزیت بیمار فعلی</span>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
          <span className="text-slate-400 block">مکان ویزیت:</span>
          <span className="text-sm font-bold text-white truncate block">{appointment.clinicAddress}</span>
          <span className="text-[11px] text-blue-300 block pt-0.5">طبقه ۴ - واحد ۴۰۲</span>
        </div>
      </div>

      {/* Action Check-In */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Navigation className="w-4 h-4 text-blue-400 shrink-0" />
          <span>وقتی به سالن انتظار مطب رسیدید، جهت اعلام حضور روی دکمه مقابل بزنید.</span>
        </div>

        {hasArrived ? (
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4" />
            حضور شما ثبت شد - منتظر فراخوان منشی بمانید
          </div>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleArrivedClick}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            من به کلینیک رسیده‌ام
          </Button>
        )}
      </div>
    </div>
  );
};
