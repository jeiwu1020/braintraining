import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Heart, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const affirmations = [
  "我值得被愛，也值得擁有美好的事物。",
  "我接受我現在的樣子，並且對未來充滿希望。",
  "每一天都是一個全新的開始，我有能力創造美好。",
  "我允許自己休息，因為這是我應得的。",
  "我的感受是真實且重要的，我會溫柔地對待自己。",
  "我擁有克服困難的力量與勇氣。",
  "我感恩生命中每一個微小但閃亮的瞬間。",
  "我不必完美，我只需要做真實的自己。",
  "今天，我選擇將專注力放在我能控制的事情上。",
  "我的存在本身就是一份珍貴的禮物。",
  "我有能力跨越眼前的障礙，因為我比想像中更強大。",
  "我正在不斷學習與成長，這是一段美好的旅程。",
  "我的心靈充滿平靜，我選擇釋放不需要的擔憂。",
  "我信任生命的安排，一切都會在最適合的時間到來。",
  "我對自己充滿耐心，允許自己按照自己的步調前進。",
  "我擁抱所有的情緒，它們是我生命的一部分。",
  "我每天都在變得更好，即使是一點點的進步也很重要。",
  "我的夢想是值得追求的，我會勇敢地邁出每一步。",
  "我散發著正能量，也能吸引美好的事物來到我身邊。",
  "我原諒過去的自己，因為我當時已經盡了最大的努力。",
  "我有無限的潛力，可以創造我想要的生活。",
  "我的直覺會指引我走向正確的方向。",
  "我珍惜與自己獨處的時光，那是重新充電的時刻。",
  "我對自己的身體感到滿意，它陪伴我經歷了許多。",
  "我選擇用愛的眼光看待自己和周圍的世界。",
  "我擁有獨特的才華和天賦，我會毫不保留地展現它們。",
  "我願意放開那些不再服務於我的執念。",
  "我每一天都充滿活力與熱情。",
  "我深呼吸，吸入平靜，吐出焦慮。",
  "我對自己許下承諾，我會永遠支持自己。",
  "我的聲音和想法很重要，我勇敢地表達自己。",
  "我值得被尊重，我會設立健康的界線。",
  "我敞開心扉，迎接生命中的每一個機會。",
  "我對我所擁有的一切心存感激。",
  "我是一個充滿愛與善意的人。"
];

const AffirmationCardGame: React.FC<Props> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const nextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (nextTimeoutRef.current) {
        clearTimeout(nextTimeoutRef.current);
        nextTimeoutRef.current = null;
      }
    };
  }, []);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(false); // Flip back immediately

    // Wait for the flip animation to finish (around 400ms-700ms) before changing the text
    nextTimeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * affirmations.length);
        } while (next === prev && affirmations.length > 1);
        return next;
      });
      setIsAnimating(false);
      nextTimeoutRef.current = null;
    }, 400); // Wait for the backface to be hidden during the flip
  };

  const flipCard = () => {
    if (!isFlipped && !isAnimating) setIsFlipped(true);
  };

  return (
    <div
      data-affirmation-root
      className="affirmation-root h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-pink-50"
    >
      <div data-affirmation-safe-stage className="app-safe-screen h-full w-full">
        <div
          data-affirmation-layout
          className="affirmation-layout relative flex h-full min-h-0 w-full flex-col overflow-hidden"
        >
          <button
            data-affirmation-back
            type="button"
            onClick={onBack}
            aria-label="返回遊戲選單"
            className="affirmation-back absolute z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-pink-600 shadow-md transition-colors hover:bg-pink-100"
          >
            <ArrowLeft size={24} />
          </button>

          <main className="affirmation-main flex min-h-0 flex-1 w-full items-center justify-center">
            <div data-affirmation-copy className="affirmation-copy z-10 text-center animate-fade-in">
              <h2 className="affirmation-title flex items-center justify-center gap-2 font-bold text-pink-900">
                <Heart className="text-pink-500 fill-pink-500" />
                <span>正向肯定小卡</span>
                <Sparkles className="text-pink-400" />
              </h2>
              <p className="affirmation-helper text-pink-700">翻開一張卡片，給自己一句溫暖的話語。</p>
            </div>

            <button
              data-affirmation-card
              type="button"
              onClick={flipCard}
              aria-label="翻開肯定小卡"
              aria-pressed={isFlipped}
              disabled={isFlipped || isAnimating}
              className="affirmation-card aspect-[3/4] relative flex-shrink-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-left disabled:cursor-default"
            >
              <div className={`affirmation-card-inner h-full w-full transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front of card (Hidden when flipped) */}
                <div className="affirmation-card-face affirmation-card-front absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-pink-100 bg-gradient-to-br from-white to-pink-50 p-8 shadow-xl backface-hidden">
                  <Heart className="mb-4 h-16 w-16 animate-pulse text-pink-300" />
                  <p className="font-bold tracking-widest text-pink-400">點擊翻開</p>
                </div>

                {/* Back of card (Visible when flipped) */}
                <div className="affirmation-card-face affirmation-card-back absolute inset-0 flex items-center justify-center rounded-3xl border-2 border-pink-200 bg-white p-6 text-center shadow-xl backface-hidden rotate-y-180 sm:p-8">
                  <div className="absolute left-4 top-4 text-pink-200">
                    <Sparkles size={24} />
                  </div>
                  <div className="absolute bottom-4 right-4 text-pink-200">
                    <Sparkles size={24} />
                  </div>
                  <p className="affirmation-card-back-content text-xl font-medium leading-relaxed text-slate-800 sm:text-2xl">
                    "{affirmations[currentIndex]}"
                  </p>
                </div>
              </div>
            </button>

            <div data-affirmation-next className={`affirmation-next transition-opacity duration-300 ${isFlipped && !isAnimating ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
              <button
                type="button"
                onClick={handleNext}
                disabled={isAnimating || !isFlipped}
                className="min-h-11 inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-pink-600 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={20} /> 再抽一張
              </button>
            </div>
          </main>

          {/* Perspective CSS for the 3D flip effect */}
          <style dangerouslySetInnerHTML={{ __html: `
            .affirmation-card { perspective: 1000px; }
            .affirmation-card-inner { transform-style: preserve-3d; }
            .affirmation-card-face { backface-visibility: hidden; }
            .rotate-y-180 { transform: rotateY(180deg); }
          ` }} />
        </div>
      </div>
    </div>
  );
};

export default AffirmationCardGame;
