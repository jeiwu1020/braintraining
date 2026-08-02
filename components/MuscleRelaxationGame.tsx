import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle2, Music, Music2 } from 'lucide-react';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
}

const steps = [
  { part: '準備', action: '找一個舒適的姿勢坐下或躺下，閉上眼睛，深呼吸三次。', duration: 15 },
  { part: '雙手與手臂', action: '用力握緊雙拳，繃緊手臂肌肉。感受緊繃感。', duration: 5, hold: true },
  { part: '雙手與手臂', action: '完全放鬆雙手與手臂，感受壓力釋放。', duration: 10, hold: false },
  { part: '肩膀與脖子', action: '將肩膀向上聳起靠近耳朵，繃緊脖子。', duration: 5, hold: true },
  { part: '肩膀與脖子', action: '放下肩膀，完全放鬆，感受沉重與溫暖。', duration: 10, hold: false },
  { part: '臉部', action: '用力擠壓臉部五官，皺緊眉頭，咬緊牙關。', duration: 5, hold: true },
  { part: '臉部', action: '放鬆整個臉部，舒展眉心，微微張開下巴。', duration: 10, hold: false },
  { part: '胸部與腹部', action: '深吸一口氣，憋氣並繃緊胸部與腹部肌肉。', duration: 5, hold: true },
  { part: '胸部與腹部', action: '緩緩吐氣，放鬆胸腹，感受呼吸的平穩。', duration: 10, hold: false },
  { part: '雙腿與雙腳', action: '雙腿伸直，腳趾向上翹，繃緊大腿與小腿。', duration: 5, hold: true },
  { part: '雙腿與雙腳', action: '放鬆雙腿與腳趾，讓它們自然擺放。', duration: 10, hold: false },
  { part: '全身掃描', action: '靜靜地感受全身，享受這份深度的寧靜與放鬆。', duration: 20, hold: false }
];

const MuscleRelaxationGame: React.FC<Props> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(steps[0].duration);
  const [isFinished, setIsFinished] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  // If the mp3 file fails to load/decode (e.g. gets corrupted again during a future
  // export/deploy step), we fall back to the synthesized ambient loop from soundService
  // instead of the music button silently doing nothing.
  const [audioFailed, setAudioFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (isPlaying && timeLeft <= 0) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(s => s + 1);
        setTimeLeft(steps[currentStep + 1].duration);
      } else {
        setIsFinished(true);
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, currentStep]);

  // Play/Pause music when toggle or when playback state changes.
  // Primary source is the real mp3 file; if it ever fails to decode (audioFailed),
  // fall back to the generated ambient loop so the music toggle never goes silent.
  useEffect(() => {
      const shouldPlay = isMusicOn && isPlaying;
      if (audioFailed) {
          if (shouldPlay) soundService.startRelaxAmbient();
          else soundService.stopRelaxAmbient();
          return () => soundService.stopRelaxAmbient();
      }
      if (audioRef.current) {
          audioRef.current.volume = 0.5;
          if (shouldPlay) {
              audioRef.current.play().catch(e => console.error("Audio play failed:", e));
          } else {
              audioRef.current.pause();
          }
      }
  }, [isMusicOn, isPlaying, audioFailed]);

  const toggleMusic = () => {
      setIsMusicOn(prev => !prev);
  };

  const togglePlay = () => {
      setIsPlaying(prev => !prev);
  };

  const reset = () => {
      setCurrentStep(0);
      setTimeLeft(steps[0].duration);
      setIsPlaying(false);
      setIsFinished(false);
      if (audioRef.current) audioRef.current.pause();
      soundService.stopRelaxAmbient();
  };

  const progress = (currentStep / steps.length) * 100;
  const current = steps[currentStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-teal-50 p-4">
      <audio
        ref={audioRef}
        src="/relaxing-music.mp3"
        loop
        playsInline
        preload="auto"
        onError={() => {
            console.warn("relaxing-music.mp3 failed to load/decode, falling back to synthesized ambient loop.");
            setAudioFailed(true);
        }}
      />
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md text-teal-600 hover:bg-teal-100 z-50 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <button
        onClick={toggleMusic}
        className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-colors z-50 ${isMusicOn ? 'bg-teal-500 text-white hover:bg-teal-600' : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        title={audioFailed ? "開啟/關閉紓壓音樂（音樂檔無法載入，已切換為備用音效）" : "開啟/關閉紓壓音樂"}
      >
        {isMusicOn ? <Music size={20} /> : <Music2 size={20} />}
      </button>

      {!isFinished ? (
          <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-teal-100 text-center">
              <h2 className="text-2xl font-bold text-teal-900 mb-6">漸進式肌肉放鬆</h2>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-teal-100 rounded-full mb-8 overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
              </div>

              {/* Status Display */}
              <div className={`w-48 h-48 mx-auto rounded-full flex flex-col items-center justify-center mb-8 border-4 transition-all duration-1000 ${current.hold ? 'bg-red-50 border-red-200 scale-95' : 'bg-teal-50 border-teal-200 scale-100'}`}>
                  <span className="text-sm font-bold text-slate-500 mb-2">{current.part}</span>
                  <span className={`text-6xl font-light tabular-nums ${current.hold ? 'text-red-500' : 'text-teal-600'}`}>
                      {timeLeft}
                  </span>
                  <span className="text-xs font-bold text-slate-400 mt-2">
                      {current.hold ? '緊繃' : '放鬆'}
                  </span>
              </div>

              {/* Instruction */}
              <div className="h-24 flex items-center justify-center mb-8">
                  <p className="text-lg text-slate-700 font-medium leading-relaxed px-4">
                      {current.action}
                  </p>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                  <button 
                      onClick={reset}
                      className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                      <RotateCcw size={24} />
                  </button>
                  <button 
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 shadow-md hover:shadow-lg transition-all"
                  >
                      {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                  </button>
              </div>
          </div>
      ) : (
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl text-center animate-fade-in">
              <CheckCircle2 className="w-24 h-24 text-teal-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-teal-900 mb-4">放鬆完成</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                  你已經完成了全身的肌肉放鬆循環。<br/>
                  帶著這份平靜，繼續美好的一天。
              </p>
              <button 
                  onClick={onBack}
                  className="w-full py-4 bg-teal-500 text-white rounded-xl font-bold text-lg hover:bg-teal-600 transition-colors shadow-lg"
              >
                  回到主選單
              </button>
          </div>
      )}
    </div>
  );
};

export default MuscleRelaxationGame;
