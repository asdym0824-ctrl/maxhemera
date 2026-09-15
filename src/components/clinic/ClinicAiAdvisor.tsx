import React, { useState } from 'react';
import { Sparkles, Send, Bot, RefreshCw } from 'lucide-react';
import { askClinicOperationsAi } from '../../services/aiService';
import { aiContextService } from '../../services/aiContextService';
import { useAuth } from '../../context/AuthContext';

export const ClinicAiAdvisor: React.FC = () => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(
    'سلام! من مشاور هوشمند مدیریت و عملیات همرا کلینیک هستم. می‌توانم در تحلیل بهره‌وری شیفت‌ها، بررسی آمار نوبت‌ها، زمان انتظار بیماران و عملکرد پرسنل به شما مشاوره دهم.'
  );

  const quickPrompts = [
    'گزارش تحلیلی بهره‌وری امروز کلینیک',
    'چند بیمار در انتظار داریم؟',
    'بررسی وضعیت وظایف پرسنل و تسک‌های باز'
  ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const groundedContext = await aiContextService.buildClinicManagerContext(currentUser);
      const answer = await askClinicOperationsAi('clinic_manager', q, groundedContext);
      setResponse(answer);
    } catch (err) {
      console.error(err);
      setResponse('خطا در ارتباط با هوش مصنوعی.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="clinic-ai-advisor" className="bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-purple-500/30 shadow-lg relative overflow-hidden space-y-3.5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm flex items-center gap-2">
            مشاور هوشمند مدیریت کلینیک (Clinic Management AI Advisor)
            <span className="text-[10px] bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full font-mono">
              Grounded AI
            </span>
          </h4>
          <p className="text-[11px] text-slate-400">
            بینش‌های عملیاتی، تحلیل ظرفیت و تصمیم‌گیری مبتنی بر داده‌های واقعی سامانه
          </p>
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-xs border border-purple-500/20 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed min-h-[70px]">
        <div className="flex items-start gap-2">
          <Bot className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
          <div className="space-y-2 flex-1">
            {loading ? (
              <div className="flex items-center gap-2 text-purple-300">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>در حال پردازش داده‌های زنده کلینیک با هوش مصنوعی...</span>
              </div>
            ) : (
              <p className="whitespace-pre-line">{response}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-400 font-medium">پرسش‌های پیشنهادی:</span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => {
              setPrompt(qp);
              handleAsk(qp);
            }}
            className="text-[11px] bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-purple-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="هر سوالی درباره عملکرد، پرسنل یا بهره‌وری کلینیک دارید بپرسید..."
          className="flex-1 px-3.5 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ارسال</span>
        </button>
      </form>
    </div>
  );
};
