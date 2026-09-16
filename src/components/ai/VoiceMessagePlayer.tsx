import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Mic, CheckCircle2 } from 'lucide-react';

interface VoiceMessagePlayerProps {
  audioUrl?: string;
  duration?: number;
  transcript?: string;
  isAiProcessing?: boolean;
  isUser?: boolean;
  readAloudText?: string;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  audioUrl,
  duration = 0,
  transcript,
  isAiProcessing = false,
  isUser = true,
  readAloudText
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (duration > 0) {
      setAudioDuration(duration);
    }
  }, [duration]);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
          setAudioDuration(Math.round(audio.duration));
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(Math.round(audio.currentTime));
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.onerror = (e) => {
        console.warn('Audio playback failed:', e);
        setIsPlaying(false);
      };

      return () => {
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn('Audio play was prevented:', err);
          setIsPlaying(false);
        });
    }
  };

  // Text-To-Speech (TTS) for Persian AI Response
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window) || !readAloudText) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(readAloudText);
      utterance.lang = 'fa-IR';
      utterance.rate = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const formatSeconds = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = audioDuration > 0 ? Math.min(100, (currentTime / audioDuration) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[280px]">
      {/* Audio player card */}
      {audioUrl && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
          isUser ? 'bg-blue-700/80 text-white' : 'bg-slate-100 text-slate-800'
        }`}>
          {/* Play/Pause control */}
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? 'توقف پخش' : 'پخش پیام صوتی'}
            className={`p-1.5 rounded-full shrink-0 transition-transform active:scale-90 cursor-pointer ${
              isUser ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Waveform / Progress bar */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-mono opacity-85">
              <span>{formatSeconds(currentTime)}</span>
              <span>{formatSeconds(audioDuration || duration)}</span>
            </div>
            
            <div className="w-full h-1.5 bg-black/15 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
              if (!audioRef.current || !audioDuration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = clickPos * audioDuration;
            }}>
              <div
                className={`h-full rounded-full transition-all ${isUser ? 'bg-white' : 'bg-blue-600'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Mic className={`w-3.5 h-3.5 shrink-0 opacity-70 ${isPlaying ? 'animate-pulse' : ''}`} />
        </div>
      )}

      {/* AI Processing Status */}
      {isAiProcessing && (
        <div className="flex items-center gap-1.5 text-[11px] text-blue-200 mt-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>هوش مصنوعی در حال گوش دادن و درک پیام صوتی...</span>
        </div>
      )}

      {/* Persian Speech Transcript */}
      {transcript && (
        <div className={`text-[11px] leading-relaxed p-2 rounded-lg ${
          isUser ? 'bg-blue-800/60 text-blue-50 border border-blue-500/30' : 'bg-slate-50 text-slate-700 border border-slate-200'
        }`}>
          <div className="flex items-center gap-1 font-medium mb-0.5 opacity-80 text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>متن صوتی پیاده‌شده با هوش مصنوعی:</span>
          </div>
          <p className="italic">«{transcript}»</p>
        </div>
      )}

      {/* Optional TTS Audio Read-Aloud for AI responses */}
      {readAloudText && 'speechSynthesis' in window && (
        <button
          type="button"
          onClick={toggleSpeech}
          title={isSpeaking ? 'توقف خواندن صوتی' : 'پخش صوتی پاسخ با صدای هوش مصنوعی'}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 transition-colors w-fit self-start mt-0.5 cursor-pointer"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-3 h-3 text-red-500" />
              <span className="text-red-500">توقف بازخوانی</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3 text-blue-500" />
              <span>شنیدن پاسخ هوش مصنوعی</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
