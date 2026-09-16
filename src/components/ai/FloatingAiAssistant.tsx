import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ShieldAlert, ArrowLeft, RotateCcw, AlertTriangle, Calendar, UserCheck, Stethoscope, Mic, Volume2 } from 'lucide-react';
import { askCareNavigator, AI_DISCLAIMER } from '../../services/aiService';
import { aiContextService } from '../../services/aiContextService';
import { useAuth } from '../../context/AuthContext';
import { Doctor } from '../../types';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';

interface Message {
  id?: string;
  sender: 'ai' | 'user';
  text: string;
  audioUrl?: string;
  audioDuration?: number;
  userTranscript?: string;
  isVoiceMessage?: boolean;
  emergency?: boolean;
  specialtyId?: string | null;
  matchedDoctors?: Doctor[];
}

export const FloatingAiAssistant: React.FC<{ onNavigateToDoctors?: () => void; onBookDoctor?: (doctorId: string) => void }> = ({
  onNavigateToDoctors,
  onBookDoctor
}) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSpecialtyId, setActiveSpecialtyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: 'سلام! من راهبر و دستیار هوشمند همرا کلینیک (HEMERA CLINIC AI) هستم. می‌توانید سوال، علائم یا نیاز پزشکی خود را تایپ کنید یا پیام صوتی (ویس) ارسال فرمایید تا دقیقاً بررسی و راهنمایی کنم.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingVoiceRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isRecordingVoice]);

  useEffect(() => {
    const handleOpenAi = () => setIsOpen(true);
    window.addEventListener('open-ai-assistant', handleOpenAi);
    return () => window.removeEventListener('open-ai-assistant', handleOpenAi);
  }, []);

  const handleReset = () => {
    setActiveSpecialtyId(null);
    setIsRecordingVoice(false);
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'ai',
        text: 'گفتگو بازنشانی شد. چطور می‌توانم به صورت صوتی یا متنی در انتخاب پزشک، تخصص درمانی یا فرایند نوبت‌دهی شما را راهنمایی کنم؟'
      }
    ]);
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    const userMsgId = `user-${Date.now()}`;
    const newHistory: Message[] = [...messages, { id: userMsgId, sender: 'user', text: textToSend }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Build full authentic grounded patient navigation context
      const navContext = await aiContextService.buildPatientNavigationContext(currentUser);

      const response = await askCareNavigator({
        message: textToSend,
        history: newHistory.map(m => ({ 
          sender: m.sender, 
          text: m.userTranscript || m.text,
          specialtyId: m.specialtyId,
          audioUrl: m.audioUrl
        })),
        context: navContext,
        activeSpecialtyId
      });

      if (response.specialtyId) {
        setActiveSpecialtyId(response.specialtyId);
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.reply,
          emergency: response.emergency,
          specialtyId: response.specialtyId,
          matchedDoctors: response.matchedDoctors
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'متأسفانه در برقراری ارتباط با سرویس هوشمند مشکلی رخ داد. لطفاً از بخش پزشکان تخصص مورد نظر را جستجو فرمایید.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVoice = async (blob: Blob, base64: string, durationSec: number, mimeType: string) => {
    if (isSendingVoiceRef.current || isLoading) return;
    isSendingVoiceRef.current = true;
    setIsRecordingVoice(false);
    const localAudioUrl = URL.createObjectURL(blob);
    const voiceMsgId = `voice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const userVoiceMsg: Message = {
      id: voiceMsgId,
      sender: 'user',
      text: '🎙️ در حال پردازش پیام صوتی...',
      audioUrl: localAudioUrl,
      audioDuration: durationSec,
      isVoiceMessage: true
    };

    setMessages(prev => {
      if (prev.some(m => m.id === voiceMsgId)) return prev;
      return [...prev, userVoiceMsg];
    });
    setIsLoading(true);

    try {
      const navContext = await aiContextService.buildPatientNavigationContext(currentUser);

      const response = await askCareNavigator({
        audioBase64: base64,
        mimeType,
        history: [...messages, userVoiceMsg].map(m => ({
          sender: m.sender,
          text: m.userTranscript || m.text,
          specialtyId: m.specialtyId,
          audioUrl: m.audioUrl
        })),
        context: navContext,
        activeSpecialtyId
      });

      if (response.specialtyId) {
        setActiveSpecialtyId(response.specialtyId);
      }

      // Update user message with Persian transcript from Gemini
      const aiResponseId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setMessages(prev => {
        if (prev.some(m => m.id === aiResponseId)) return prev;

        const updated = prev.map(m => {
          if (m.id === voiceMsgId) {
            return {
              ...m,
              text: response.userTranscript ? `🎙️ «${response.userTranscript}»` : '🎙️ پیام صوتی کاربر',
              userTranscript: response.userTranscript
            };
          }
          return m;
        });

        return [
          ...updated,
          {
            id: aiResponseId,
            sender: 'ai',
            text: response.reply,
            emergency: response.emergency,
            specialtyId: response.specialtyId,
            matchedDoctors: response.matchedDoctors
          }
        ];
      });
    } catch (err) {
      console.warn('Voice navigator processing fallback:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-voice-err-${Date.now()}`,
          sender: 'ai',
          text: 'پیام صوتی شما دریافت گردید. در صورت عدم امکان پیاده‌سازی خودکار صوت، لطفاً علائم یا سوال خود را به صورت کوتاه متنی ارسال فرمایید تا راهنمایی دقیق تقدیم شود.'
        }
      ]);
    } finally {
      setIsLoading(false);
      isSendingVoiceRef.current = false;
    }
  };

  return (
    <div className="fixed bottom-20 sm:bottom-24 xl:bottom-6 left-3 sm:left-6 md:left-8 z-45">
      {/* Trigger Button (Mobile & Tablet Safe) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium p-2.5 sm:px-4 sm:py-3 rounded-full shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          aria-label="دستیار هوشمند سلامت"
          title="گفتگو با دستیار هوشمند سلامت"
        >
          <div className="relative">
            <Bot className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline text-xs sm:text-sm font-bold tracking-tight">راهبر هوشمند سلامت</span>
          <span className="sm:hidden text-xs font-bold tracking-tight pl-1">دستیار هوشمند</span>
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0 hidden min-[360px]:inline" />
        </button>
      )}

      {/* Floating Chat Modal (Responsive & Tablet Friendly) */}
      {isOpen && (
        <div className="w-[calc(100vw-1.5rem)] max-w-[390px] sm:max-w-[420px] h-[520px] sm:h-[560px] max-h-[calc(100vh-7rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  راهبر سلامت همرا کلینیک
                  <span className="text-[10px] bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded-full font-sans font-bold">
                    Hamrah Clinic AI
                  </span>
                </div>
                <div className="text-[10px] text-blue-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  دستیار هوشمند تریاژ و نوبت‌دهی
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="شروع گفتگوی جدید"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Medical Disclaimer Banner */}
          <div className="bg-amber-50 border-b border-amber-200/60 p-2.5 px-3 flex items-start gap-2 text-[11px] text-amber-800 leading-tight">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{AI_DISCLAIMER}</span>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
              >
                {msg.isVoiceMessage ? (
                  <div className="max-w-[88%] p-3 rounded-2xl leading-relaxed bg-blue-600 text-white rounded-br-none shadow-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-blue-100 border-b border-blue-500/30 pb-1">
                      <div className="flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
                        <span>پیام صوتی شما</span>
                      </div>
                      <span className="text-[10px] opacity-75">تحلیل هوشمند با جمینای</span>
                    </div>
                    <VoiceMessagePlayer
                      audioUrl={msg.audioUrl}
                      duration={msg.audioDuration}
                      transcript={msg.userTranscript}
                      isAiProcessing={isLoading && idx === messages.length - 1}
                      isUser={true}
                    />
                  </div>
                ) : (
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                    {msg.sender === 'ai' && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <VoiceMessagePlayer readAloudText={msg.text} isUser={false} />
                      </div>
                    )}
                  </div>
                )}

                {/* Emergency Alert Card */}
                {msg.emergency && (
                  <div className="max-w-[88%] p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex items-start gap-2 text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-800">هشدار شرایط اضطراری:</div>
                      <div>در صورت بروز علائم حاد، درنگ نکنید و فوراً با شماره ۱۱۵ تماس بگیرید.</div>
                    </div>
                  </div>
                )}

                {/* Matched Doctor Recommendations */}
                {msg.matchedDoctors && msg.matchedDoctors.length > 0 && (
                  <div className="max-w-[92%] w-full space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                      پزشکان متخصص مرتبط در کلینیک:
                    </div>
                    {msg.matchedDoctors.map(doc => (
                      <div
                        key={doc.id}
                        className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <img src={doc.avatar} alt={doc.name} className="w-9 h-9 rounded-lg object-cover" />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{doc.name}</div>
                            <div className="text-[10px] text-slate-500">{doc.specialtyName}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (onBookDoctor) {
                              onBookDoctor(doc.id);
                            } else if (onNavigateToDoctors) {
                              onNavigateToDoctors();
                            }
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          نوبت‌گیری
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-600 p-3 rounded-2xl text-xs flex items-center gap-2 shadow-2xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                  <span>هوش مصنوعی در حال پردازش، شنیدن صوت و بررسی پزشکان...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-600">
            <button
              onClick={() => handleSend('نیاز به ویزیت متخصص قلب دارم')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-full whitespace-nowrap cursor-pointer transition-colors"
            >
              متخصص قلب
            </button>
            <button
              onClick={() => handleSend('مشکل گوارش و معده دارم')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-full whitespace-nowrap cursor-pointer transition-colors"
            >
              دپارتمان گوارش
            </button>
            <button
              onClick={() => handleSend('کدوم دکتر برم؟')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-full whitespace-nowrap cursor-pointer transition-colors"
            >
              پیشنهاد پزشک برای مشکل من
            </button>
            <button
              onClick={() => handleSend('چگونه نوبت خود را رزرو کنم؟')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-full whitespace-nowrap cursor-pointer transition-colors"
            >
              راهنمای نوبت
            </button>
          </div>

          {/* Input Footer with Voice & Text input */}
          <div className="p-2 sm:p-2.5 bg-white border-t border-slate-200 max-w-full overflow-hidden">
            {isRecordingVoice ? (
              <VoiceRecorder
                onSendVoice={handleSendVoice}
                onCancel={() => setIsRecordingVoice(false)}
                disabled={isLoading}
              />
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <input
                  type="text"
                  id="care-navigator-text-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="علائم خود را بنویسید یا دکمه ویس را بزنید..."
                  className="flex-1 min-w-0 text-xs px-3 py-2.5 bg-slate-100 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600/30 text-slate-800"
                />
                <button
                  type="button"
                  id="btn-voice-record-start"
                  onClick={() => {
                    if (isLoading || isRecordingVoice) return;
                    setIsRecordingVoice(true);
                  }}
                  disabled={isLoading || isRecordingVoice}
                  title="ضبط و ارسال پیام صوتی (ویس)"
                  aria-label="شروع ضبط پیام صوتی"
                  className="w-10 h-10 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all duration-200 cursor-pointer border border-blue-200 hover:border-blue-600 shadow-2xs flex items-center justify-center shrink-0 group relative focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                >
                  <Mic className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                </button>
                <button
                  type="button"
                  id="btn-care-navigator-send"
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  title="ارسال پیام متنی"
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
