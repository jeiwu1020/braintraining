import React, { useState } from 'react';
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

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(false); // Flip back immediately
    
    // Wait for the flip animation to finish (around 400ms-700ms) before changing the text
    setTimeout(() => {
        setCurrentIndex((prev) => {
          let next;
          do {
            next = Math.floor(Math.random() * affirmations.length);
          } while (next === prev && affirmations.length > 1);
          return next;
        });
        setIsAnimating(false);
    }, 400); // Wait for the backface to be hidden during the flip
  };

  const flipCard = () => {
      setIsFlipped(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-pink-50 p-4 sm:p-8">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md text-pink-600 hover:bg-pink-100 z-50 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col landscape:flex-row items-center justify-center gap-8 landscape:gap-12 mt-12 landscape:mt-0">
          <div className="text-center landscape:text-left flex flex-col items-center landscape:items-start animate-fade-in z-10 landscape:flex-1">
            <h2 className="text-3xl font-bold text-pink-900 mb-2 flex items-center justify-center landscape:justify-start gap-2">
                <Heart className="text-pink-500 fill-pink-500" /> 正向肯定小卡 <Sparkles className="text-pink-400" />
            </h2>
            <p className="text-pink-700 mb-6">翻開一張卡片，給自己一句溫暖的話語。</p>
            
            <div className={`transition-opacity duration-300 hidden landscape:block ${isFlipped && !isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button 
                  onClick={handleNext}
                  disabled={isAnimating || !isFlipped}
                  className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-full font-bold shadow-lg hover:bg-pink-600 hover:scale-105 transition-all"
              >
                  <RefreshCw size={20} /> 再抽一張
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-[280px] sm:max-w-sm landscape:max-w-xs landscape:max-h-[70vh] aspect-[3/4] perspective-1000 cursor-pointer flex-shrink-0" onClick={!isFlipped ? flipCard : undefined}>
              <div className={`w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  
                  {/* Front of card (Hidden when flipped) */}
                  <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border-2 border-pink-100 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-pink-50">
                      <Heart className="w-16 h-16 text-pink-300 animate-pulse mb-4" />
                      <p className="text-pink-400 font-bold tracking-widest">點擊翻開</p>
                  </div>

                  {/* Back of card (Visible when flipped) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-3xl shadow-xl border-2 border-pink-200 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                      <div className="absolute top-4 left-4 text-pink-200">
                          <Sparkles size={24} />
                      </div>
                      <div className="absolute bottom-4 right-4 text-pink-200">
                          <Sparkles size={24} />
                      </div>
                      <p className="text-xl sm:text-2xl text-slate-800 leading-relaxed font-medium">
                          "{affirmations[currentIndex]}"
                      </p>
                  </div>

              </div>
          </div>

          <div className={`transition-opacity duration-300 landscape:hidden ${isFlipped && !isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button 
                  onClick={handleNext}
                  disabled={isAnimating || !isFlipped}
                  className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-full font-bold shadow-lg hover:bg-pink-600 hover:scale-105 transition-all"
              >
                  <RefreshCw size={20} /> 再抽一張
              </button>
          </div>
      </div>

      {/* Perspective CSS for 3D flip effect */}
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
};

export default AffirmationCardGame;
