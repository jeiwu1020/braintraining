import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const TOTAL_CYCLES = 5;

const BreathingExercise: React.FC<Props> = ({ onBack }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [instruction, setInstruction] = useState('準備中');
  const [seconds, setSeconds] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Animation State
  const [scale, setScale] = useState(1); // 1 = small, 1.5 = big
  const [duration, setDuration] = useState(0); // CSS transition duration in ms

  // Countdown state
  const [countdown, setCountdown] = useState(3);
  const [isStarted, setIsStarted] = useState(false);

  // Refs for logic control to avoid React Strict Mode double-counting issues
  const cyclesRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Helper to manage timeouts
  const addTimeout = (callback: () => void, ms: number) => {
    const id = setTimeout(() => {
      callback();
    }, ms);
    timeoutsRef.current.push(id);
  };

  // Initial 3-2-1 Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsStarted(true);
    }
  }, [countdown]);

  // Main Breathing Logic
  useEffect(() => {
    if (!isStarted) return;

    const runCycle = () => {
      // Check termination via Ref for immediate accuracy
      if (cyclesRef.current >= TOTAL_CYCLES) {
        setIsFinished(true);
        return;
      }

      // --- INHALE (4s) ---
      setPhase('Inhale');
      setInstruction('用鼻子緩慢吸氣...');
      setSeconds(4);
      // Animation: Grow to 1.5x over 4000ms
      setDuration(4000);
      setScale(1.5);

      addTimeout(() => {
        // --- HOLD (7s) ---
        setPhase('Hold');
        setInstruction('屏住呼吸...');
        setSeconds(7);
        // Animation: Stay at 1.5x
        setDuration(0);
        setScale(1.5);

        addTimeout(() => {
          // --- EXHALE (8s) ---
          setPhase('Exhale');
          setInstruction('用嘴巴慢慢吐氣...');
          setSeconds(8);
          // Animation: Shrink to 1x over 8000ms
          setDuration(8000);
          setScale(1.0);

          addTimeout(() => {
            // Increment logic
            cyclesRef.current += 1;
            setCompletedCycles(cyclesRef.current);

            // Trigger next cycle
            if (cyclesRef.current < TOTAL_CYCLES) {
              runCycle();
            } else {
              setIsFinished(true);
            }
          }, 8000); // End of Exhale
        }, 7000); // End of Hold
      }, 4000); // End of Inhale
    };

    // Start the loop
    runCycle();

    // Cleanup all timeouts on unmount or restart
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [isStarted]); // Only run once when started

  // Phase Countdown effect (Visual only)
  useEffect(() => {
    if (isStarted && seconds > 0 && !isFinished) {
      const cd = setTimeout(() => setSeconds(s => s - 1), 1000);
      return () => clearTimeout(cd);
    }
  }, [seconds, isFinished, isStarted]);

  if (isFinished) {
    return (
      <div
        data-breathing-root
        className="breathing-root h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-sky-50"
      >
        <div data-breathing-safe-stage className="app-safe-screen h-full w-full">
          <div
            data-breathing-layout
            className="breathing-layout relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden"
          >
            <div data-breathing-complete className="breathing-complete animate-fade-in flex min-h-0 w-full items-center justify-center">
              <div className="breathing-complete-card w-full max-w-sm rounded-3xl bg-white text-center shadow-xl">
                <CheckCircle2 className="breathing-complete-icon mx-auto text-sky-500" />
                <h2 className="breathing-complete-title text-2xl font-bold text-sky-900">呼吸練習完成</h2>
                <p className="breathing-complete-message text-gray-600 leading-relaxed">
                  你已經完成了 {TOTAL_CYCLES} 個循環的深呼吸。<br />
                  感受一下現在的身體，是不是比剛才更放鬆了呢？
                </p>
                <button
                  onClick={onBack}
                  className="breathing-complete-action min-h-11 w-full rounded-xl bg-sky-500 px-4 py-3 text-lg font-bold text-white shadow-lg transition-colors hover:bg-sky-600"
                >
                  回到主選單
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-breathing-root
      className="breathing-root h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-sky-50"
    >
      <div data-breathing-safe-stage className="app-safe-screen h-full w-full">
        <div
          data-breathing-layout
          className="breathing-layout relative flex h-full min-h-0 w-full flex-col overflow-hidden"
        >
          <button
            data-breathing-back
            onClick={onBack}
            aria-label="返回遊戲選單"
            className="breathing-back absolute z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-gray-600 shadow-md transition-colors hover:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>

          {!isStarted ? (
            <div data-breathing-countdown className="breathing-countdown animate-bounce-short z-10 flex min-h-0 flex-1 flex-col items-center justify-center">
              <p className="breathing-countdown-label text-2xl text-sky-800">準備開始</p>
              <div className="breathing-countdown-value font-bold text-sky-500">{countdown}</div>
            </div>
          ) : (
            <div data-breathing-active className="breathing-active z-10 flex min-h-0 w-full flex-1 flex-col items-center">
              <div className="breathing-active-meta text-center">
                <h2 className="breathing-title text-3xl font-bold text-sky-800">呼吸律動</h2>
                <p data-breathing-progress className="breathing-progress font-medium text-sky-600">
                  循環 {Math.min(completedCycles + 1, TOTAL_CYCLES)} / {TOTAL_CYCLES}
                </p>
              </div>

              <div data-breathing-stimulus className="breathing-stimulus flex min-h-0 min-w-0 items-center justify-center overflow-visible">
                <div className="breathing-stimulus-stage relative flex shrink-0 items-center justify-center overflow-visible">
                  {/* Outer Glow - Follows scale roughly */}
                  <div
                    className="breathing-circle-glow absolute rounded-full bg-sky-200 opacity-20 blur-2xl"
                    style={{
                      transform: `scale(${scale * 1.2})`,
                      transitionProperty: 'transform',
                      transitionDuration: `${duration}ms`,
                      transitionTimingFunction: 'linear',
                    }}
                  />

                  {/* Main Breathing Circle */}
                  <div
                    className="breathing-circle-main absolute rounded-full bg-gradient-to-br from-sky-300 to-sky-500 opacity-40 shadow-lg"
                    style={{
                      transform: `scale(${scale})`,
                      transitionProperty: 'transform',
                      transitionDuration: `${duration}ms`,
                      transitionTimingFunction: 'linear',
                    }}
                  />

                  {/* Inner Core - Stays slightly smaller but pulses */}
                  <div
                    className="breathing-circle-core absolute rounded-full bg-white opacity-30"
                    style={{
                      transform: `scale(${scale * 0.9})`,
                      transitionProperty: 'transform',
                      transitionDuration: `${duration}ms`,
                      transitionTimingFunction: 'linear',
                    }}
                  />

                  {/* Center Text */}
                  <div className="breathing-center-copy z-10 text-center">
                    <p className="breathing-instruction text-2xl font-bold text-sky-900">{instruction}</p>
                    <p className="breathing-seconds font-light tabular-nums text-sky-800">{seconds > 0 ? seconds : ''}</p>
                  </div>
                </div>
              </div>

              <p data-breathing-helper className="breathing-helper text-center text-gray-600">
                吸氣時圓圈變大，吐氣時圓圈變小。<br />
                跟隨節奏放鬆身心。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;
