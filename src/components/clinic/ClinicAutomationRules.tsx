import React, { useState } from 'react';
import { Zap, ToggleLeft, ToggleRight, CheckCircle2, Clock, MessageSquare, AlertCircle, Plus } from 'lucide-react';
import { ClinicAutomationRule } from '../../types';
import { apiService } from '../../services/apiService';
import { Button } from '../common/Button';

interface ClinicAutomationRulesProps {
  rules: ClinicAutomationRule[];
  onRefresh: () => void;
}

export const ClinicAutomationRules: React.FC<ClinicAutomationRulesProps> = ({
  rules,
  onRefresh
}) => {
  const [activeRules, setActiveRules] = useState<ClinicAutomationRule[]>(rules);

  const handleToggle = async (ruleId: string, currentStatus: boolean) => {
    const updated = await apiService.toggleAutomationRule(ruleId, !currentStatus);
    if (updated) {
      setActiveRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !currentStatus } : r));
      onRefresh();
    }
  };

  const triggerIcons: Record<string, any> = {
    appointment_created: MessageSquare,
    appointment_24h_before: Clock,
    appointment_completed: CheckCircle2,
    appointment_no_show: AlertCircle,
    lab_result_ready: Zap
  };

  return (
    <div id="clinic-automation-rules" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            موتور قوانین و اتوماسیون‌های هوشمند کلینیک (Workflow Automations)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ارسال خودکار پیامک‌ها، ایجاد تسک‌های پیگیری و اعلام هشدارهای عملیاتی
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {activeRules.map(rule => {
          const Icon = triggerIcons[rule.trigger] || Zap;
          return (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                rule.enabled
                  ? 'bg-amber-50/20 border-amber-200/80 shadow-2xs'
                  : 'bg-slate-50/50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border ${
                  rule.enabled
                    ? 'bg-amber-100/70 border-amber-300 text-amber-800'
                    : 'bg-slate-200 border-slate-300 text-slate-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900">{rule.title}</h4>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      رویداد: {rule.trigger}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rule.description}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                    <span>نوع اقدام: <strong>{rule.action}</strong></span>
                    <span>آخرین اجرا: {rule.lastRun || 'هم‌اکنون'}</span>
                    <span>تعداد اجراها: {rule.runCount || 0} بار</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(rule.id, rule.enabled)}
                  className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    rule.enabled
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {rule.enabled ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                      <span>فعال</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                      <span>غیرفعال</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
