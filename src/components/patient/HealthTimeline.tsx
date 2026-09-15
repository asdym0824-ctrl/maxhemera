import React from 'react';
import { MedicalRecord } from '../../types';
import { Stethoscope, TestTube, FileText, Activity, Pill, Clock, Download } from 'lucide-react';
import { Badge } from '../common/Badge';

interface HealthTimelineProps {
  records: MedicalRecord[];
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ records }) => {
  const typeIcons: Record<MedicalRecord['type'], { icon: React.ReactNode; color: string; bg: string }> = {
    visit: { icon: <Stethoscope className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-100' },
    diagnosis: { icon: <Activity className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-100' },
    prescription: { icon: <Pill className="w-4 h-4" />, color: 'text-sky-600', bg: 'bg-sky-100' },
    lab: { icon: <TestTube className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    imaging: { icon: <FileText className="w-4 h-4" />, color: 'text-rose-600', bg: 'bg-rose-100' },
    procedure: { icon: <Activity className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    followup: { icon: <Clock className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-100' }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">تایم‌لاین پرونده بالینی سلامت</h3>
          <p className="text-xs text-slate-500">تاریخچه وقایع پزشکی به ترتیب زمانی (Chronological EMR Timeline)</p>
        </div>
      </div>

      <div className="relative border-r-2 border-slate-200 pr-6 space-y-8 mr-3">
        {records.map(rec => {
          const style = typeIcons[rec.type] || typeIcons.visit;

          return (
            <div key={rec.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -right-[31px] top-1.5 w-8 h-8 rounded-full ${style.bg} ${style.color} flex items-center justify-center border-2 border-white shadow-xs z-10`}
              >
                {style.icon}
              </div>

              {/* Card Content */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-400">{rec.date}</span>
                    <h4 className="font-bold text-base text-slate-900">{rec.title}</h4>
                  </div>
                  <Badge variant="slate">{rec.doctorName}</Badge>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">{rec.summary}</p>

                {rec.details && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {rec.details}
                  </p>
                )}

                {/* Medications List */}
                {rec.medications && rec.medications.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-sky-600" />
                      اقلام دارویی تجویز شده:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {rec.medications.map((m, mIdx) => (
                        <div key={mIdx} className="bg-sky-50/70 p-2.5 rounded-xl border border-sky-100 flex items-center justify-between">
                          <span className="font-bold text-sky-900">{m.name} ({m.dosage})</span>
                          <span className="text-slate-500 text-[11px]">{m.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {rec.attachments && rec.attachments.length > 0 && (
                  <div className="pt-2">
                    {rec.attachments.map((att, aIdx) => (
                      <button
                        key={aIdx}
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        دانلود ضمیمه: {att.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
