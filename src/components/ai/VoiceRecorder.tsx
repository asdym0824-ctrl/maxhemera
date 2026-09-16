import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Send, AlertCircle, Volume2 } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (blob: Blob, base64: string, durationSec: number, mimeType: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  onCancel,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(14).fill(15));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Pick best supported MIME type
  const getMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'audio/webm';
  };

  // Convert Blob to base64 string
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Stop tracks and clean up resources
  const cleanupStream = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('مرورگر شما از ضبط صدا پشتیبانی نمی‌کند.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      audioStreamRef.current = stream;

      // Audio analysis for real-time waveform animation
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioLevels = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Map frequencies to 14 bars with normalized heights (15% to 100%)
            const bars: number[] = [];
            const step = Math.floor(dataArray.length / 14);
            for (let i = 0; i < 14; i++) {
              const val = dataArray[i * step] || 0;
              const percent = Math.min(100, Math.max(15, Math.round((val / 255) * 100)));
              bars.push(percent);
            }
            setAudioLevel(bars);
            animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
          };
          updateAudioLevels();
        }
      } catch (audioErr) {
        console.warn('AudioContext visualization not available:', audioErr);
      }

      const selectedMime = getMimeType();
      const recorder = new MediaRecorder(stream, { mimeType: selectedMime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250); // collect in 250ms chunks
      setIsRecording(true);

      // Start elapsed timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 119) {
            // Auto-stop at 2 minutes
            stopAndSend();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: unknown) {
      console.error('Microphone access failed:', err);
      cleanupStream();
      setIsRecording(false);
      const errObj = err as { name?: string; message?: string };
      if (errObj?.name === 'NotAllowedError' || errObj?.name === 'PermissionDeniedError') {
        setErrorMessage('دسترسی به میکروفون مسدود است. لطفاً در تنظیمات مرورگر اجازه دسترسی به میکروفون را صادر فرمایید.');
      } else {
        setErrorMessage(errObj?.message || 'امکان اتصال به میکروفون وجود ندارد.');
      }
    }
  };

  const stopAndSend = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    const recorder = mediaRecorderRef.current;
    const mimeType = recorder.mimeType || 'audio/webm';
    const finalDuration = recordingTime;

    recorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        cleanupStream();
        setIsRecording(false);

        if (audioBlob.size < 100 && finalDuration < 1) {
          setErrorMessage('طول پیام صوتی بسیار کوتاه بود. لطفاً دوباره صحبت کنید.');
          return;
        }

        const base64 = await blobToBase64(audioBlob);
        onSendVoice(audioBlob, base64, Math.max(1, finalDuration), mimeType);
      } catch (processErr) {
        console.error('Error processing audio blob:', processErr);
        setErrorMessage('خطا در پردازش پیام صوتی.');
      }
    };

    recorder.stop();
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    cleanupStream();
    setIsRecording(false);
    onCancel();
  };

  useEffect(() => {
    // Automatically start recording when mounted
    startRecording();
    return () => {
      cleanupStream();
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="ai-voice-recorder-bar" className="w-full bg-slate-50 border border-blue-200 rounded-2xl p-2.5 flex flex-col gap-2 shadow-xs transition-all animate-fadeIn">
      {errorMessage ? (
        <div className="flex items-center justify-between gap-2 p-2 bg-red-50 text-red-700 text-xs rounded-xl">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleCancel}
            className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          {/* Cancel button */}
          <button
            type="button"
            id="btn-voice-cancel"
            onClick={handleCancel}
            title="انصراف و حذف ویس"
            disabled={disabled}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Recording pulse & time */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="font-mono text-xs font-semibold text-slate-700 tracking-wider">
                {formatTime(recordingTime)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              در حال شنیدن و ضبط...
            </span>
          </div>

          {/* Live Waveform Audio Visualizer */}
          <div className="flex-1 flex items-center justify-center gap-0.5 h-7 px-2 max-w-[140px] sm:max-w-[180px]">
            {audioLevel.map((height, idx) => (
              <div
                key={idx}
                className="w-1 rounded-full bg-blue-500 transition-all duration-75"
                style={{
                  height: `${height}%`,
                  opacity: 0.4 + (height / 100) * 0.6
                }}
              />
            ))}
          </div>

          {/* Finish & Send Voice Button */}
          <button
            type="button"
            id="btn-voice-send"
            onClick={stopAndSend}
            disabled={disabled || recordingTime < 1}
            title="ارسال پیام صوتی به هوش مصنوعی"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <span>ارسال ویس</span>
            <Send className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      )}

      {/* Helpful Hint */}
      {!errorMessage && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>علائم بیماری، درد یا سوال پزشکی خود را بفرمایید</span>
          <span>حداکثر ۲ دقیقه</span>
        </div>
      )}
    </div>
  );
};
