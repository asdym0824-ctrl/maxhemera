import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Send, AlertCircle } from 'lucide-react';

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
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(10).fill(20));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const hasSentRef = useRef(false);
  const recordSessionIdRef = useRef(0);

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
      try {
        if (MediaRecorder.isTypeSupported(type)) {
          return type;
        }
      } catch {
        // continue
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

  // Completely clean up streams, nodes, and tracks to prevent microphone locking & echo
  const cleanupStream = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceNodeRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
        // ignore
      }
      analyserRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }

    // Stop and release recording stream tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
          track.enabled = false;
        } catch {
          // ignore
        }
      });
      audioStreamRef.current = null;
    }

    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      mediaRecorderRef.current = null;
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setRecordingTime(0);
    hasSentRef.current = false;
    setIsSubmitting(false);

    // Cancel any active TTS speech or audio playback to prevent acoustic feedback
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      try {
        document.querySelectorAll('audio').forEach(audioEl => {
          audioEl.pause();
        });
      } catch {
        // ignore
      }
    }

    const currentSessionId = ++recordSessionIdRef.current;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('مرورگر شما از ضبط صدا پشتیبانی نمی‌کند.');
      }

      cleanupStream();

      // High-quality mono audio capture with hardware noise suppression
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 48000 },
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true }
        }
      });

      // Guard: if unmounted or another session started while acquiring media
      if (!isMountedRef.current || currentSessionId !== recordSessionIdRef.current) {
        stream.getTracks().forEach(t => {
          t.stop();
          t.enabled = false;
        });
        return;
      }

      audioStreamRef.current = stream;

      // Single hardware stream analysis (NO stream.clone() to prevent mic hardware ducking)
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }

          const source = audioCtx.createMediaStreamSource(stream);
          sourceNodeRef.current = source;

          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.75;
          // Connect ONLY to analyser; never connect to speakers or destination!
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioLevels = () => {
            if (!analyserRef.current || !isMountedRef.current || currentSessionId !== recordSessionIdRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Map frequencies to 10 compact visualizer bars
            const bars: number[] = [];
            const step = Math.max(1, Math.floor(dataArray.length / 10));
            for (let i = 0; i < 10; i++) {
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
        console.warn('AudioContext analysis not available:', audioErr);
      }

      const selectedMime = getMimeType();
      const recorderOptions: MediaRecorderOptions = {
        audioBitsPerSecond: 128000
      };
      if (selectedMime) {
        recorderOptions.mimeType = selectedMime;
      }

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, recorderOptions);
      } catch {
        recorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording with continuous 250ms chunks to ensure complete capture
      startTimeRef.current = Date.now();
      recorder.start(250);
      setIsRecording(true);

      // Start elapsed timer
      timerRef.current = window.setInterval(() => {
        if (!isMountedRef.current || currentSessionId !== recordSessionIdRef.current) return;
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(elapsed);
        if (elapsed >= 120) {
          stopAndSend();
        }
      }, 500);

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

  const stopAndSend = () => {
    // Prevent duplicate sending
    if (hasSentRef.current || isSubmitting) return;
    if (!mediaRecorderRef.current) return;

    const recorder = mediaRecorderRef.current;
    if (recorder.state === 'inactive') return;

    hasSentRef.current = true;
    setIsSubmitting(true);

    const mimeType = recorder.mimeType || 'audio/webm';
    const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    recorder.onstop = async () => {
      try {
        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];
        const audioBlob = new Blob(chunks, { type: mimeType });

        cleanupStream();
        setIsRecording(false);

        if (audioBlob.size < 80) {
          setErrorMessage('پیام صوتی دریافت نشد. لطفاً بلندتر صحبت فرمایید.');
          hasSentRef.current = false;
          setIsSubmitting(false);
          return;
        }

        console.log(`[VoiceRecorder] Voice captured: ${audioBlob.size} bytes, ${durationSec}s, ${mimeType}`);
        const base64 = await blobToBase64(audioBlob);
        onSendVoice(audioBlob, base64, durationSec, mimeType);
      } catch (processErr) {
        console.error('Error processing audio blob:', processErr);
        setErrorMessage('خطا در پردازش پیام صوتی.');
        hasSentRef.current = false;
        setIsSubmitting(false);
      }
    };

    try {
      recorder.stop();
    } catch (err) {
      console.warn('Recorder stop error:', err);
      cleanupStream();
      setIsRecording(false);
      setIsSubmitting(false);
      hasSentRef.current = false;
    }
  };

  const handleCancel = () => {
    hasSentRef.current = true;
    setIsSubmitting(false);
    cleanupStream();
    setIsRecording(false);
    onCancel();
  };

  useEffect(() => {
    isMountedRef.current = true;
    hasSentRef.current = false;
    startRecording();
    return () => {
      isMountedRef.current = false;
      cleanupStream();
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="ai-voice-recorder-bar"
      className="w-full max-w-full overflow-hidden box-border bg-slate-50 border border-blue-200 rounded-2xl p-2 sm:p-2.5 flex flex-col gap-1.5 shadow-2xs transition-all animate-fadeIn"
    >
      {errorMessage ? (
        <div className="flex items-center justify-between gap-2 p-1.5 bg-red-50 text-red-700 text-xs rounded-xl">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            onClick={handleCancel}
            className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shrink-0"
          >
            بستن
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full max-w-full overflow-hidden">
          {/* Cancel button - right side (RTL) */}
          <button
            type="button"
            id="btn-voice-cancel"
            onClick={handleCancel}
            title="انصراف و حذف ویس"
            disabled={disabled || isSubmitting}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Recording indicator & timer */}
          <div className="flex items-center gap-1.5 shrink-0 px-1">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
              {formatTime(recordingTime)}
            </span>
          </div>

          {/* Compact soundwave visualizer (guaranteed to fit horizontally) */}
          <div className="flex-1 min-w-[45px] max-w-[100px] flex items-center justify-center gap-0.5 h-6 px-1">
            {audioLevel.map((height, idx) => (
              <div
                key={idx}
                className="w-1 rounded-full bg-blue-600 transition-all duration-75"
                style={{
                  height: `${height}%`,
                  opacity: 0.35 + (height / 100) * 0.65
                }}
              />
            ))}
          </div>

          {/* Finish & Send Voice Button - strictly sized, no overflow */}
          <button
            type="button"
            id="btn-voice-send"
            onClick={stopAndSend}
            disabled={disabled || isSubmitting}
            title="تکمیل و ارسال پیام صوتی"
            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            {isSubmitting ? (
              <span className="text-[11px]">ارسال...</span>
            ) : (
              <>
                <span className="text-[11px] font-medium">ارسال</span>
                <Send className="w-3.5 h-3.5 rotate-180" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Subtle compact instruction hint */}
      {!errorMessage && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 border-t border-slate-200/60 pt-1">
          <span className="truncate">در حال ضبط صدا... پس از اتمام دکمه ارسال را بزنید</span>
          <span className="shrink-0 text-slate-400 font-mono">حداکثر ۲:۰۰</span>
        </div>
      )}
    </div>
  );
};
