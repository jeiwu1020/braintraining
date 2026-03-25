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
        // --- HOLD (4s) ---
        setPhase('Hold');
        setInstruction('屏住呼吸...'); // Changed from '保持呼吸'
        setSeconds(4);
        // Animation: Stay at 1.5x
        setDuration(0); 
        setScale(1.5);

        addTimeout(() => {
          // --- EXHALE (6s) ---
          setPhase('Exhale');
          setInstruction('用嘴巴慢慢吐氣...');
          setSeconds(6);
          // Animation: Shrink to 1x over 6000ms
          setDuration(6000);
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
          }, 6000); // End of Exhale

        }, 4000); // End of Hold
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
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-sky-50 p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full">
                <CheckCircle2 className="w-24 h-24 text-sky-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-sky-900 mb-4">呼吸練習完成</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    你已經完成了 {TOTAL_CYCLES} 個循環的深呼吸。<br/>
                    感受一下現在的身體，是不是比剛才更放鬆了呢？
                </p>
                <button 
                    onClick={onBack}
                    className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-lg hover:bg-sky-600 transition-colors shadow-lg"
                >
                    回到主選單
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-sky-50 p-4 landscape:p-2 relative overflow-hidden">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md text-gray-600 hover:bg-gray-100 z-50"
      >
        <ArrowLeft size={24} />
      </button>

      {!isStarted ? (
        <div className="z-10 flex flex-col items-center animate-bounce-short">
          <p className="text-sky-800 text-2xl mb-4">準備開始</p>
          <div className="text-9xl font-bold text-sky-500">{countdown}</div>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-sky-800 mb-2 z-10">呼吸律動</h2>
          <p className="text-sky-600 mb-8 font-medium z-10">循環 {Math.min(completedCycles + 1, TOTAL_CYCLES)} / {TOTAL_CYCLES}</p>

          <div className="relative flex items-center justify-center w-72 h-72 mb-12">
            {/* Outer Glow - Follows scale roughly */}
            <div 
                className="absolute w-full h-full rounded-full bg-sky-200 opacity-20 filter blur-2xl"
                style={{
                    transform: `scale(${scale * 1.2})`,
                    transitionProperty: 'transform',
                    transitionDuration: `${duration}ms`,
                    transitionTimingFunction: 'linear'
                }}
            ></div>

            {/* Main Breathing Circle */}
            <div 
              className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-sky-300 to-sky-500 opacity-40 shadow-lg"
              style={{
                transform: `scale(${scale})`,
                transitionProperty: 'transform',
                transitionDuration: `${duration}ms`,
                transitionTimingFunction: 'linear'
              }}
            ></div>
            
            {/* Inner Core - Stays slightly smaller but pulses */}
            <div 
              className="absolute w-40 h-40 rounded-full bg-white opacity-30"
              style={{
                transform: `scale(${scale * 0.9})`,
                transitionProperty: 'transform',
                transitionDuration: `${duration}ms`,
                transitionTimingFunction: 'linear'
              }}
            ></div>
            
            {/* Center Text */}
            <div className="z-10 text-center">
              <p className="text-2xl font-bold text-sky-900 mb-2">{instruction}</p>
              <p className="text-5xl font-light text-sky-800 tabular-nums">{seconds > 0 ? seconds : ''}</p>
            </div>
          </div>

          <p className="text-gray-600 text-center max-w-md px-4 z-10">
            吸氣時圓圈變大，吐氣時圓圈變小。<br/>跟隨節奏放鬆身心。
          </p>
        </>
      )}
    </div>
  );
};

export default BreathingExercise;