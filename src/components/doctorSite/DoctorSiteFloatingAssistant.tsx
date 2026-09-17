import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Stethoscope, 
  FileText,
  ChevronDown,
  ArrowLeft,
  Mic
} from 'lucide-react';
import { Doctor } from '../../types';
import { ThemeStyles } from './themeConfig';
import { VoiceRecorder } from '../ai/VoiceRecorder';
import { VoiceMessagePlayer } from '../ai/VoiceMessagePlayer';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  onOpenBooking: (note?: string) => void;
  onNavigateSection?: (sectionId: string) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  audioUrl?: string;
  audioDuration?: number;
  userTranscript?: string;
  isVoiceMessage?: boolean;
  isEmergency?: boolean;
  suggestedAction?: {
    label: string;
    actionType: 'book' | 'offices' | 'services' | 'articles' | 'faq';
    payload?: string;
  };
}

export const DoctorSiteFloatingAssistant: React.FC<Props> = ({
  doctor,
  theme,
  onOpenBooking,
  onNavigateSection
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `سلام! من دستیار هوشمند مطب ${doctor.name} (${doctor.specialtyName}) هستم. می‌توانید سوالات خود را بنویسید یا ویس بفرستید تا در مورد نوبت‌دهی، خدمات، بیمه‌ها و ساعات کاری راهنمایی‌تان کنم.`,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingVoiceRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isRecordingVoice]);

  const quickPrompts = [
    { label: '📅 رزرو نوبت با دکتر', prompt: 'می‌خواهم با این پزشک نوبت ویزیت رزرو کنم.' },
    { label: '🕒 نزدیک‌ترین نوبت خالی', prompt: 'نزدیک‌ترین نوبت آزاد دکتر چه زمانی است؟' },
    { label: '📍 آدرس و ساعات کار مطب', prompt: 'آدرس و روزهای حضور دکتر در مطب کجاست؟' },
    { label: '🩺 خدمات و اقدامات تخصصی', prompt: 'چه خدمات و جراحی‌های تخصصی توسط دکتر ارائه می‌شود؟' },
    { label: '🛡️ بیمه‌های طرف قرارداد', prompt: 'مطب دکتر با چه بیمه‌هایی قرارداد دارد؟' }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build rich context about the specific doctor
      const doctorContext = {
        name: doctor.name,
        title: doctor.title,
        specialty: doctor.specialtyName,
        councilNumber: doctor.medicalCouncilNumber,
        city: doctor.city,
        address: doctor.address,
        nextSlot: doctor.nextAvailableSlot,
        fee: doctor.consultationFee,
        onlineFee: doctor.onlineConsultationFee,
        hasOnline: doctor.hasOnlineConsultation,
        insurances: doctor.supportedInsurances,
        services: doctor.services,
        detailedServices: doctor.detailedServices?.map(s => ({ title: s.title, price: s.price, duration: s.durationMinutes })),
        offices: doctor.offices?.map(o => ({ title: o.title, address: o.address, phone: o.phone, hours: o.workingHours })),
        faqs: doctor.websiteConfig?.faqs?.map(f => ({ q: f.question, a: f.answer }))
      };

      const res = await fetch('/api/ai/doctor-site-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          doctorContext,
          history: messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.userTranscript || m.text }))
        })
      });

      let aiText = '';
      let isEmergency = false;
      let action: Message['suggestedAction'] = undefined;

      if (res.ok) {
        const data = await res.json();
        aiText = data.text;
        isEmergency = data.isEmergency || false;
        action = data.suggestedAction;
      } else {
        throw new Error('API response not ok');
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        isEmergency,
        suggestedAction: action
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('Doctor AI Assistant local fallback:', err);
      // Fallback matching query
      const q = query.toLowerCase();
      let text = `مطب ${doctor.name} آماده خدمت‌رسانی است. نزدیک‌ترین زمان در دسترس «${doctor.nextAvailableSlot}» می‌باشد. برای رزرو نوبت می‌توانید از دکمه زیر استفاده فرمایید.`;
      let isEmergency = false;
      let action: Message['suggestedAction'] = { label: 'دریافت نوبت اینترنتی', actionType: 'book' };

      if (q.includes('درد سینه') || q.includes('سکته') || q.includes('تنگی نفس') || q.includes('بیهوشی')) {
        text = '⚠️ توجه اورژانسی: در صورت مشاهده این علائم لطفاً فوراً با اورژانس ۱۱۵ تماس حاصل نموده یا به نزدیک‌ترین مرکز درمانی مراجعه نمایید.';
        isEmergency = true;
        action = undefined;
      } else if (q.includes('آدرس') || q.includes('مطب') || q.includes('کجا') || q.includes('تلفن')) {
        text = `نشانی مطب: ${doctor.address || doctor.city} - شماره تماس در بخش اطلاعات مطب‌ها درج گردیده است.`;
        action = { label: 'مشاهده آدرس مطب‌ها', actionType: 'offices' };
      } else if (q.includes('بیمه') || q.includes('قرارداد')) {
        text = `بیمه‌های طرف قرارداد شامل: ${doctor.supportedInsurances?.join('، ') || 'بیمه‌های پایه و تکمیلی'} می‌باشد.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          isEmergency,
          suggestedAction: action
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
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
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
      const doctorContext = {
        name: doctor.name,
        title: doctor.title,
        specialty: doctor.specialtyName,
        councilNumber: doctor.medicalCouncilNumber,
        city: doctor.city,
        address: doctor.address,
        nextSlot: doctor.nextAvailableSlot,
        fee: doctor.consultationFee,
        onlineFee: doctor.onlineConsultationFee,
        hasOnline: doctor.hasOnlineConsultation,
        insurances: doctor.supportedInsurances,
        services: doctor.services,
        detailedServices: doctor.detailedServices?.map(s => ({ title: s.title, price: s.price, duration: s.durationMinutes })),
        offices: doctor.offices?.map(o => ({ title: o.title, address: o.address, phone: o.phone, hours: o.workingHours })),
        faqs: doctor.websiteConfig?.faqs?.map(f => ({ q: f.question, a: f.answer }))
      };

      const res = await fetch('/api/ai/doctor-site-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType,
          doctorContext,
          history: [...messages, userVoiceMsg].slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.userTranscript || m.text }))
        })
      });

      let aiText = '';
      let isEmergency = false;
      let action: Message['suggestedAction'] = undefined;
      let userTranscript: string | undefined = undefined;

      if (res.ok) {
        const data = await res.json();
        aiText = data.text;
        isEmergency = data.isEmergency || false;
        action = data.suggestedAction;
        userTranscript = data.userTranscript;
      } else {
        throw new Error('API response not ok');
      }

      const aiMsgId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setMessages(prev => {
        if (prev.some(m => m.id === aiMsgId)) return prev;

        const updated = prev.map(m => {
          if (m.id === voiceMsgId) {
            return {
              ...m,
              text: userTranscript ? `🎙️ «${userTranscript}»` : '🎙️ پیام صوتی مراجع',
              userTranscript
            };
          }
          return m;
        });

        return [
          ...updated,
          {
            id: aiMsgId,
            sender: 'ai',
            text: aiText,
            timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            isEmergency,
            suggestedAction: action
          }
        ];
      });
    } catch (err) {
      console.warn('Voice doctor assistant fallback:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `پیام صوتی شما ثبت شد. مطب ${doctor.name} آماده نوبت‌دهی است. جهت رزرو سریع از دکمه نوبت‌دهی استفاده فرمایید.`,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          suggestedAction: { label: 'دریافت نوبت اینترنتی', actionType: 'book' }
        }
      ]);
    } finally {
      setIsLoading(false);
      isSendingVoiceRef.current = false;
    }
  };

  const handleActionClick = (action: NonNullable<Message['suggestedAction']>) => {
    if (action.actionType === 'book') {
      onOpenBooking(action.payload || 'درخواست نوبت از طریق دستیار هوشمند');
    } else if (onNavigateSection) {
      onNavigateSection(action.actionType);
    }
  };

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 font-sans" dir="rtl">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer bg-slate-900 text-white border border-blue-600/40`}
          aria-label="گفتگو با دستیار هوشمند مطب"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-blue-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-xs font-bold hidden sm:inline">دستیار هوشمند مطب</span>
          <span className="text-[10px] bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-600/30">
            پاسخگوی ۲۴/۷
          </span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white">دستیار هوشمند مطب</h4>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                <p className="text-[11px] text-blue-300 line-clamp-1">{doctor.name} • {doctor.specialtyName}</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="بستن گفتگو"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Doctor Summary Strip */}
          <div className="bg-blue-50/80 px-4 py-2 border-b border-blue-100/70 flex items-center justify-between text-[11px] text-blue-900 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>نزدیک‌ترین نوبت:</span>
              <strong className="text-blue-950 font-bold">{doctor.nextAvailableSlot}</strong>
            </span>
            <button
              onClick={() => onOpenBooking('رزرو سریع از نوار بالای چت')}
              className="text-blue-700 hover:text-blue-900 underline font-bold"
            >
              رزرو فوری
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.isVoiceMessage ? (
                  <div className="max-w-[85%] p-3 rounded-2xl bg-blue-700 text-white rounded-br-2xs shadow-2xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-[10px] text-blue-200 border-b border-blue-600/40 pb-1">
                      <div className="flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
                        <span>پیام صوتی ارسالی</span>
                      </div>
                      <span>درک هوشمند جمینای</span>
                    </div>
                    <VoiceMessagePlayer
                      audioUrl={msg.audioUrl}
                      duration={msg.audioDuration}
                      transcript={msg.userTranscript}
                      isAiProcessing={isLoading && messages[messages.length - 1]?.id === msg.id}
                      isUser={true}
                    />
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-blue-700 text-white rounded-br-2xs shadow-xs'
                        : msg.isEmergency
                        ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-bl-2xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-2xs shadow-2xs'
                    }`}
                  >
                    {msg.isEmergency && (
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1.5 pb-1 border-b border-rose-200">
                        <AlertTriangle className="w-4 h-4" />
                        <span>هشدار اورژانسی ۱۱۵</span>
                      </div>
                    )}
                    <p>{msg.text}</p>

                    {msg.sender === 'ai' && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <VoiceMessagePlayer readAloudText={msg.text} isUser={false} />
                      </div>
                    )}

                    {/* Suggested Action Card */}
                    {msg.suggestedAction && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
                        <button
                          onClick={() => handleActionClick(msg.suggestedAction!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{msg.suggestedAction.label}</span>
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 w-fit text-slate-500 shadow-2xs">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px]">در حال بررسی صوت و اطلاعات مطب با هوش مصنوعی...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.prompt)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-600 text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-200/70 cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2 sm:p-2.5 bg-white border-t border-slate-200 max-w-full overflow-hidden">
            {isRecordingVoice ? (
              <VoiceRecorder
                onSendVoice={handleSendVoice}
                onCancel={() => setIsRecordingVoice(false)}
                disabled={isLoading}
              />
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="سؤالتان را بنویسید یا ویس ارسال فرمایید..."
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(true)}
                  disabled={isLoading}
                  title="ارسال پیام صوتی (ویس)"
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white active:scale-95 disabled:opacity-50 transition-all cursor-pointer shrink-0"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                  aria-label="ارسال پیام"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
