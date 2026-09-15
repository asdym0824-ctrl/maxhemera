import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  Lightbulb, 
  ArrowRight, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Zap,
  MessageSquare
} from 'lucide-react';
import { askClinicOperationsAi } from '../../services/aiService';
import { aiContextService } from '../../services/aiContextService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface SecretaryAiCopilotProps {
  onTriggerBulkReminder?: () => void;
  onFilterUrgent?: () => void;
}

export const SecretaryAiCopilot: React.FC<SecretaryAiCopilotProps> = ({
  onTriggerBulkReminder,
  onFilterUrgent
}) => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(
    'سلام! من دستیار هوشمند عملیات پذیرش و منشی همرا کلینیک هستم. می‌توانید از من در مورد آمار نوبت‌های امروز، وضعیت صف انتظار، وظایف فوری و تنظیم پیامک‌ها بپرسید.'
  );

  const quickPrompts = [
    'امروز چند نوبت داریم؟',
    'چند بیمار در انتظار داریم؟',
    'تسک‌های فوری و اولویت‌دار',
    'وضعیت ارسال پیامک‌های یادآوری'
  ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const groundedContext = await aiContextService.buildSecretaryContext(currentUser);
      const answer = await askClinicOperationsAi('secretary', q, groundedContext);
      setResponse(answer);
    } catch (err) {
      console.error(err);
      setResponse('خطا در دریافت پاسخ از هوش مصنوعی. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="secretary-ai-copilot" className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-indigo-500/30 shadow-lg relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 relative z-10 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm flex items-center gap-2">
              دستیار هوشمند عملیات منشی (AI Operations Copilot)
              <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-full font-sans font-bold">
                Hamrah Clinic AI
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              راهنمای هوشمند هماهنگی مراجعین، پیش‌نویس پیامک‌ها و کاهش زمان معطلی
            </p>
          </div>
        </div>
      </div>

      {/* Response Box */}
      <div className="bg-slate-800/80 backdrop-blur-xs border border-indigo-500/20 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed min-h-[70px] relative z-10 space-y-2">
        <div className="flex items-start gap-2">
          <Bot className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <div className="space-y-2 flex-1">
            {loading ? (
              <div className="flex items-center gap-2 text-indigo-300">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>در حال تحلیل وضعیت کلینیک با هوش مصنوعی...</span>
              </div>
            ) : (
              <p className="whitespace-pre-line">{response}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-3 relative z-10">
        <span className="text-[11px] text-slate-400 font-medium">پیشنهادهای سریع:</span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => {
              setPrompt(qp);
              handleAsk(qp);
            }}
            className="text-[11px] bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input query form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleAsk();
        }}
        className="mt-3 flex items-center gap-2 relative z-10"
      >
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="هر سوالی از مدیریت شیفت، پیامک‌ها یا اولویت تماس‌ها دارید بپرسید..."
          className="flex-1 px-3.5 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ارسال</span>
        </button>
      </form>
    </div>
  );
};
