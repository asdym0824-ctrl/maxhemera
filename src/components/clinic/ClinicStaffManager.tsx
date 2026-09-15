import React, { useState } from 'react';
import { Users, Shield, Clock, CheckCircle2, UserPlus, Phone, Mail } from 'lucide-react';
import { ClinicStaff } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface ClinicStaffManagerProps {
  staffList: ClinicStaff[];
  onRefresh: () => void;
}

export const ClinicStaffManager: React.FC<ClinicStaffManagerProps> = ({
  staffList,
  onRefresh
}) => {
  const [filterRole, setFilterRole] = useState<string>('all');

  const roleConfigs: Record<string, { label: string; badge: any }> = {
    doctor: { label: 'پزشک متخصص', badge: 'blue' },
    secretary: { label: 'منشی و پذیرش', badge: 'indigo' },
    nurse: { label: 'پرستاری و تریاژ', badge: 'blue' },
    clinic_manager: { label: 'مدیر کلینیک', badge: 'purple' },
    admin: { label: 'ادمین سیستم', badge: 'rose' }
  };

  const filtered = staffList.filter(s => {
    if (filterRole !== 'all' && s.role !== filterRole) return false;
    return true;
  });

  const shiftLabels: Record<string, string> = {
    morning: 'صبح (۸ الی ۱۴)',
    evening: 'عصر (۱۴ الی ۲۱)',
    night: 'شب (۲۱ الی ۸)',
    full: 'تمام‌وقت'
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: 'حاضر در کلینیک', color: 'text-emerald-700 bg-emerald-500' },
    busy: { label: 'مشغول ویزیت/پذیرش', color: 'text-amber-700 bg-amber-500' },
    on_leave: { label: 'در مرخصی', color: 'text-slate-500 bg-slate-400' },
    offline: { label: 'آفلاین', color: 'text-slate-400 bg-slate-300' }
  };

  return (
    <div id="clinic-staff-manager" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            پرسنل و اعضای کلینیک (Staff & Roster)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            مدیریت دسترسی‌ها، شیفت‌های کاری پزشکان و منشی‌ها و وظایف پرسنل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="all">همه نقش‌ها ({staffList.length})</option>
            <option value="doctor">پزشکان</option>
            <option value="secretary">منشی‌ها</option>
            <option value="nurse">پرستاران</option>
            <option value="clinic_manager">مدیران</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(staff => {
          const roleConf = roleConfigs[staff.role] || { label: staff.role, badge: 'slate' as const };
          const statusInfo = statusLabels[staff.status] || { label: 'حاضر', color: 'text-emerald-700 bg-emerald-500' };

          return (
            <div
              key={staff.id}
              className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-purple-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={staff.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt={staff.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{staff.name}</div>
                    <div className="text-[11px] text-slate-500">{staff.roleTitle || roleConf.label}</div>
                  </div>
                </div>
                <Badge variant={roleConf.badge} size="sm">
                  {roleConf.label}
                </Badge>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">شماره تماس:</span>
                  <span className="font-mono dir-ltr">{staff.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">شیفت کاری:</span>
                  <span className="font-semibold text-slate-800">{shiftLabels[staff.shift] || staff.shift}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">وضعیت حضور:</span>
                  <span className={`${statusInfo.color.split(' ')[0]} font-bold flex items-center gap-1`}>
                    <span className={`w-2 h-2 rounded-full ${statusInfo.color.split(' ')[1]}`}></span>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">وظایف جاری:</span>
                  <span className="font-bold text-indigo-700">{staff.activeTasksCount || 0} تسک</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
