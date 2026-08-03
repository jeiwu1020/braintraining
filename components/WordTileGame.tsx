import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  isAdvanced?: boolean;
}

const IDIOMS = [
  { word: '一帆風順', meaning: '比喻非常順利，沒有任何阻礙。', origin: '清·李漁《憐香伴·僦居》' },
  { word: '馬到成功', meaning: '形容事情順利，剛開始就取得成功。', origin: '元·無名氏《小尉遲》' },
  { word: '平安喜樂', meaning: '平平安安，充滿歡喜與快樂。', origin: '常用祝賀語' },
  { word: '歲歲平安', meaning: '每年都平平安安，常用於新年。', origin: '傳統吉祥語' },
  { word: '心想事成', meaning: '心裡想的事情都能如願達成。', origin: '傳統祝願詞' },
  { word: '五福臨門', meaning: '指長壽、富貴、康寧、好德、善終五種福氣降臨家門。', origin: '《尚書·洪範》' },
  { word: '大吉大利', meaning: '非常吉祥順利。', origin: '明·羅貫中《三國演義》' },
  { word: '步步高升', meaning: '職位或地位不斷上升。', origin: '清·吳趼人《二十年目睹之怪現狀》' },
  { word: '花好月圓', meaning: '比喻生活美好圓滿，常用於祝賀結婚。', origin: '宋·晁端禮《行香子》' },
  { word: '萬事如意', meaning: '一切事情都很順心如意。', origin: '清·曹雪芹《紅樓夢》' },
  { word: '金玉滿堂', meaning: '形容財富極多，也比喻才學豐富。', origin: '《老子》第九章' },
  { word: '年年有餘', meaning: '每年都有多餘的財富，代表富足。', origin: '傳統吉祥語' },
  { word: '春暖花開', meaning: '春天氣候溫暖，百花盛開。', origin: '明·朱國禎《湧幢小品》' },
  { word: '喜氣洋洋', meaning: '形容非常高興，充滿歡喜的氣氛。', origin: '宋·范仲淹《岳陽樓記》' },
  { word: '福如東海', meaning: '福氣像東海的水一樣浩大。', origin: '明·洪楩《清平山堂話本》' },
  { word: '壽比南山', meaning: '壽命像南山一樣長久。', origin: '《詩經·小雅·天保》' },
  { word: '竹報平安', meaning: '比喻平安家信。', origin: '唐·段成式《酉陽雜俎》' },
  { word: '吉祥如意', meaning: '吉利祥和，萬事如意。', origin: '元·無名氏《按鑑演義》' },
  { word: '百年好合', meaning: '祝賀新婚夫婦白頭偕老。', origin: '清·文康《兒女英雄傳》' },
  { word: '鵬程萬里', meaning: '比喻前程遠大。', origin: '《莊子·逍遙遊》' },
  { word: '欣欣向榮', meaning: '草木生長茂盛，比喻事業繁榮發展。', origin: '晉·陶淵明《歸去來辭》' },
  { word: '招財進寶', meaning: '招引財氣，進來寶物。', origin: '元·劉唐卿《降桑椹》' },
  { word: '風調雨順', meaning: '風雨及時，有利於農作，比喻天下太平。', origin: '《舊唐書》' },
  { word: '國泰民安', meaning: '國家太平，人民生活安定。', origin: '宋·吳自牧《夢粱錄》' },
  { word: '安居樂業', meaning: '生活安定，快樂地從事自己的職業。', origin: '《老子》' },
  { word: '和氣生財', meaning: '待人和善能招來財運。', origin: '魯迅《彷徨》' },
  { word: '財源廣進', meaning: '財富來源廣泛不斷。', origin: '傳統祝賀語' },
  { word: '生意興隆', meaning: '買賣興旺，獲利豐厚。', origin: '傳統祝賀語' },
  { word: '心曠神怡', meaning: '心情開朗，精神愉悅。', origin: '宋·范仲淹《岳陽樓記》' },
  { word: '笑口常開', meaning: '常常保持笑容，比喻心情快樂。', origin: '傳統吉祥語' },
  { word: '長命百歲', meaning: '祝人長壽的吉祥話。', origin: '元·無名氏《藍采和》' },
  { word: '身體健康', meaning: '身心沒有疾病，平安壯實。', origin: '常用祝賀語' },
  { word: '前程似錦', meaning: '形容前途如錦繡般十分美好。', origin: '元·賈仲名《對玉梳》' },
  { word: '飛黃騰達', meaning: '比喻得意於仕途，官職升得很快。', origin: '唐·韓愈《符讀書城南》' },
  { word: '出入平安', meaning: '出外或回家都平安無事。', origin: '傳統祈福語' },
  { word: '百尺竿頭', meaning: '比喻學問、事業等達到很高的境界。', origin: '宋·釋道原《景德傳燈錄》' },
  { word: '出神入化', meaning: '形容技藝達到絕妙神化的境界。', origin: '明·孫仁孺《東郭記》' },
  { word: '妙手回春', meaning: '稱讚醫生醫術高明，能把垂危的病人治好。', origin: '清·李汝珍《鏡花緣》' },
  { word: '熟能生巧', meaning: '做得熟練了，就能找到竅門。', origin: '清·李汝珍《鏡花緣》' },
  { word: '千變萬化', meaning: '形容變化非常多。', origin: '《列子·周穆王》' },
  { word: '生龍活虎', meaning: '形容非常有活力，像活潑的龍和虎一樣。', origin: '清·吳趼人《痛史》' },
  { word: '龍馬精神', meaning: '比喻精神健壯，活力充沛。', origin: '唐·李郢《上裴晉公》' },
  { word: '鶴立雞群', meaning: '比喻人的儀表或才能出眾。', origin: '晉·戴逵《竹林七賢論》' },
  { word: '如魚得水', meaning: '比喻得到和自己意氣相投的人或很適合的環境。', origin: '《三國志·蜀書·諸葛亮傳》' },
  { word: '錦上添花', meaning: '比喻美上加美，好上加好。', origin: '宋·黃庭堅《了語》' },
  { word: '雪中送炭', meaning: '比喻在別人急需時給予物質上或精神上的幫助。', origin: '宋·范成大《大雪送炭與芥隱》' },
  { word: '知足常樂', meaning: '知道滿足，就總能感到快樂。', origin: '《老子》' }
];

const WordTileGame: React.FC<Props> = ({ onBack, isAdvanced }) => {
  const [currentIdiom, setCurrentIdiom] = useState<typeof IDIOMS[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [placed, setPlaced] = useState<(string | null)[]>([null, null, null, null]);
  const [isWin, setIsWin] = useState(false);
  const [hasGuessed, setHasGuessed] = useState(false);

  const initGame = () => {
      const idiomObj = IDIOMS[Math.floor(Math.random() * IDIOMS.length)];
      setCurrentIdiom(idiomObj);
      // Scramble options
      const chars = idiomObj.word.split('').sort(() => 0.5 - Math.random());
      setOptions(chars);
      setPlaced([null, null, null, null]);
      setIsWin(false);
      setHasGuessed(false);
  };

  useEffect(() => {
      initGame();
  }, []);

  const handleSelectOption = (char: string, index: number) => {
      if (isWin) return;
      
      const emptyIndex = placed.indexOf(null);
      if (emptyIndex === -1) return; // Full

      const newPlaced = [...placed];
      newPlaced[emptyIndex] = char;
      setPlaced(newPlaced);

      const newOptions = [...options];
      newOptions[index] = ''; // Mark as used
      setOptions(newOptions);
      soundService.playTone(400 + emptyIndex * 100, 'sine', 0.1);

      // Check win condition
      if (newPlaced.join('') === currentIdiom?.word) {
          setIsWin(true);
          setHasGuessed(true);
          soundService.playWin();
      } else if (newPlaced.every(c => c !== null)) {
          // Full but wrong
          setHasGuessed(true);
          soundService.playWrong();
      }
  };

  const handleRemovePlaced = (index: number) => {
      if (isWin || placed[index] === null) return;
      const char = placed[index]!;
      
      const newPlaced = [...placed];
      newPlaced[index] = null;
      setPlaced(newPlaced);

      const newOptions = [...options];
      const emptyOptIndex = newOptions.indexOf('');
      if (emptyOptIndex !== -1) {
          newOptions[emptyOptIndex] = char;
      }
      setOptions(newOptions);
      soundService.playTone(300, 'triangle', 0.1);
  };

  const isFullButWrong = placed.every(c => c !== null) && !isWin;

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-orange-50 p-2 sm:p-4">
      <button 
        onClick={onBack}
        className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md text-orange-600 hover:bg-orange-100 z-50 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-5xl flex flex-col items-center justify-center h-full">
          <h2 className="text-xl sm:text-2xl font-bold text-orange-900 mb-4 sm:mb-6 hidden sm:block">成語接龍拼圖</h2>
          
          {/* Target Slots */}
          <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-6 mt-2 shrink-0">
              {placed.map((char, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleRemovePlaced(idx)}
                    disabled={char === null || isWin}
                    className={`w-16 h-16 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl sm:text-5xl font-bold shadow-md border-4 transition-all duration-300 ${
                        char === null 
                            ? 'bg-white border-dashed border-orange-300 text-orange-800'
                            : isWin 
                                ? 'bg-green-100 border-green-500 text-green-700 scale-105 shadow-green-200 cursor-default'
                                : hasGuessed && currentIdiom
                                    ? char === currentIdiom.word[idx]
                                        ? 'bg-green-100 border-green-400 text-green-700'
                                        : 'bg-red-100 border-red-400 text-red-700 hover:bg-red-50 animate-shake'
                                    : 'bg-gradient-to-b from-orange-100 to-orange-200 border-orange-400 text-orange-900 hover:bg-orange-50'
                    }`}
                  >
                      {char}
                  </button>
              ))}
          </div>

          {/* Bottom Area (Fixed height to prevent pushing buttons down) */}
          <div className="h-[220px] sm:h-[260px] w-full flex items-center justify-center shrink-0">
              {!isWin ? (
                  <div className="flex gap-3 sm:gap-6 animate-fade-in-up">
                      {options.map((opt, idx) => (
                          <button
                              key={idx}
                              onClick={() => handleSelectOption(opt, idx)}
                              disabled={!opt}
                              className={`w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-md border-2 border-orange-200 flex items-center justify-center text-2xl sm:text-4xl font-bold text-orange-700 hover:bg-orange-50 hover:scale-105 hover:border-orange-400 transition-all active:scale-95 ${!opt ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'}`}
                          >
                              {opt}
                          </button>
                      ))}
                  </div>
              ) : (
                  <div className="flex flex-col items-center animate-fade-in-up w-full px-2 sm:px-4 justify-center">
                      <div className="flex flex-row items-stretch justify-center gap-2 sm:gap-4 w-full max-w-4xl">
                          {/* Text Box */}
                          <div className="bg-white rounded-2xl shadow-md border border-orange-200 p-3 sm:p-5 flex-1 overflow-y-auto max-h-[160px] sm:max-h-[200px]">
                              <h3 className="text-lg sm:text-xl font-bold text-orange-900 mb-1 border-b border-orange-100 pb-1">
                                  出處與釋義
                              </h3>
                              <p className="text-slate-700 font-bold mb-1 text-sm sm:text-base">
                                  <span className="text-orange-600 mr-2">【出處】</span>{currentIdiom?.origin}
                              </p>
                              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                  <span className="text-orange-600 font-bold mr-2">【釋義】</span>{currentIdiom?.meaning}
                              </p>
                          </div>
                          
                          {/* Next Button */}
                          <button 
                              onClick={initGame}
                              className="px-4 sm:px-8 bg-orange-500 text-white rounded-2xl font-bold text-lg sm:text-2xl hover:bg-orange-600 shadow-md flex flex-col items-center justify-center gap-1 sm:gap-2 transition-transform active:scale-95 shrink-0"
                          >
                              <RefreshCw size={24} className="sm:w-8 sm:h-8" />
                              <span className="whitespace-nowrap">下一題</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default WordTileGame;
