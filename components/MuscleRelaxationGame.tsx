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
  { part: '全身掃描', action: '靜靜地感受全身，享受這份深度的寧靜與放鬆。', duration: 20, hold: false },
];

const MuscleRelaxationGame: React.FC<Props> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(steps[0].duration);
  const [isFinished, setIsFinished] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  // If the mp3 file fails to load/decode, use the synthesized ambient loop.
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
  // The mp3 remains the primary source; the generated ambient loop is the fallback.
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
        audioRef.current.play().catch(e => console.error('Audio play failed:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicOn, isPlaying, audioFailed]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      soundService.stopRelaxAmbient();
    };
  }, []);

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
    <div
      data-muscle-root
      className="muscle-root h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-teal-50"
    >
      <div data-muscle-safe-stage className="app-safe-screen h-full w-full">
        <div
          data-muscle-layout
          className="muscle-layout relative flex h-full min-h-0 w-full flex-col overflow-hidden"
        >
          <audio
            ref={audioRef}
            src="/relaxing-music.mp3"
            loop
            playsInline
            preload="auto"
            onError={() => {
              console.warn('relaxing-music.mp3 failed to load/decode, falling back to synthesized ambient loop.');
              setAudioFailed(true);
            }}
          />

          <button
            data-muscle-back
            type="button"
            onClick={onBack}
            aria-label="返回遊戲選單"
            className="muscle-back absolute z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-teal-600 shadow-md transition-colors hover:bg-teal-100"
          >
            <ArrowLeft size={24} />
          </button>

          <button
            data-muscle-music
            type="button"
            onClick={toggleMusic}
            aria-label={isMusicOn ? '關閉紓壓音樂' : '開啟紓壓音樂'}
            className={`muscle-music absolute right-0 top-0 z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full shadow-md transition-colors ${isMusicOn ? 'bg-teal-500 text-white hover:bg-teal-600' : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            title={audioFailed ? '開啟/關閉紓壓音樂（音樂檔無法載入，已切換為備用音效）' : '開啟/關閉紓壓音樂'}
          >
            {isMusicOn ? <Music size={20} /> : <Music2 size={20} />}
          </button>

          {!isFinished ? (
            <main data-muscle-active className="muscle-active flex min-h-0 flex-1 w-full items-center justify-center">
              <div data-muscle-stimulus className="muscle-stimulus flex items-center justify-center">
                <div className={`muscle-status-circle flex flex-col items-center justify-center rounded-full border-4 transition-all duration-1000 ${current.hold ? 'bg-red-50 border-red-200 scale-95' : 'bg-teal-50 border-teal-200 scale-100'}`}>
                  <span className="muscle-part text-sm font-bold text-slate-500">{current.part}</span>
                  <span className={`muscle-seconds font-light tabular-nums ${current.hold ? 'text-red-500' : 'text-teal-600'}`}>
                    {timeLeft}
                  </span>
                  <span className="muscle-phase text-xs font-bold text-slate-400">
                    {current.hold ? '緊繃' : '放鬆'}
                  </span>
                </div>
              </div>

              <div className="muscle-active-content">
                <h2 className="muscle-title font-bold text-teal-900">漸進式肌肉放鬆</h2>

                <div className="muscle-progress w-full overflow-hidden rounded-full bg-teal-100">
                  <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div data-muscle-instruction className="muscle-instruction flex items-center justify-center">
                  <p className="muscle-instruction-text text-slate-700 font-medium leading-relaxed">
                    {current.action}
                  </p>
                </div>

                <div data-muscle-controls className="muscle-controls flex justify-center">
                  <button
                    type="button"
                    onClick={reset}
                    aria-label="重新開始放鬆練習"
                    className="muscle-control min-h-14 min-w-14 rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    <RotateCcw size={24} className="mx-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? '暫停放鬆' : '開始放鬆'}
                    className="muscle-control min-h-14 min-w-14 rounded-full bg-teal-500 text-white shadow-md transition-all hover:bg-teal-600 hover:shadow-lg"
                  >
                    {isPlaying ? <Pause size={28} className="mx-auto" /> : <Play size={28} className="mx-auto ml-1" />}
                  </button>
                </div>
              </div>
            </main>
          ) : (
            <main data-muscle-complete className="muscle-complete flex min-h-0 flex-1 w-full items-center justify-center animate-fade-in">
              <div className="muscle-complete-card w-full max-w-md rounded-3xl bg-white text-center shadow-xl">
                <CheckCircle2 className="muscle-complete-icon mx-auto text-teal-500" />
                <h2 className="muscle-complete-title font-bold text-teal-900">放鬆完成</h2>
                <p className="muscle-complete-message text-slate-600 leading-relaxed">
                  你已經完成了全身的肌肉放鬆循環。<br />
                  帶著這份平靜，繼續美好的一天。
                </p>
                <button
                  type="button"
                  onClick={onBack}
                  className="muscle-complete-action min-h-11 w-full rounded-xl bg-teal-500 px-4 py-3 text-lg font-bold text-white shadow-lg transition-colors hover:bg-teal-600"
                >
                  回到主選單
                </button>
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
};

export default MuscleRelaxationGame;
