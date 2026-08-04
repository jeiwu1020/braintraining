import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, HelpCircle } from 'lucide-react';
import { soundService } from '../services/soundService';
import { RulesModal } from './RulesModal';

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
  { word: '知足常樂', meaning: '知道滿足，就總能感到快樂。', origin: '《老子》' },
  { word: '塞翁失馬', meaning: '比喻禍福無常，或因禍得福。', origin: '《淮南子·人間訓》' },
  { word: '掩耳盜鈴', meaning: '比喻自欺欺人。', origin: '《呂氏春秋·自知》' },
  { word: '拔苗助長', meaning: '比喻違反事物發展的客觀規律，急於求成，反而把事情弄糟。', origin: '《孟子·公孫丑上》' },
  { word: '守株待兔', meaning: '比喻死守狹隘經驗，不知變通，或抱著僥倖心理妄想不勞而獲。', origin: '《韓非子·五蠹》' },
  { word: '刻舟求劍', meaning: '比喻不懂事物已發展變化而仍靜止地看問題。', origin: '《呂氏春秋·察今》' },
  { word: '亡羊補牢', meaning: '比喻出了問題以後想辦法補救，可以防止繼續受損失。', origin: '《戰國策·楚策四》' },
  { word: '井底之蛙', meaning: '比喻見識狹窄的人。', origin: '《莊子·秋水》' },
  { word: '畫蛇添足', meaning: '比喻做多餘的事，反而不恰當。', origin: '《戰國策·齊策二》' },
  { word: '狐假虎威', meaning: '比喻倚仗別人的勢力欺壓人。', origin: '《戰國策·楚策一》' },
  { word: '盲人摸象', meaning: '比喻對事物只憑片面的了解或局部的經驗，就亂加猜測，想做出全面的判斷。', origin: '《大般涅槃經》' },
  { word: '自相矛盾', meaning: '比喻自己說話做事前後抵觸。', origin: '《韓非子·難一》' },
  { word: '朝三暮四', meaning: '比喻經常變卦，反覆無常。', origin: '《莊子·齊物論》' },
  { word: '杯弓蛇影', meaning: '比喻因疑神疑鬼而引起恐懼。', origin: '《晉書·樂廣傳》' },
  { word: '畫龍點睛', meaning: '比喻寫文章或講話時，在關鍵處用幾句話點明實質，使內容生動有力。', origin: '唐·張彥遠《歷代名畫記》' },
  { word: '對牛彈琴', meaning: '比喻對不能勝任的人講道理、說真情。', origin: '漢·牟融《理惑論》' },
  { word: '愚公移山', meaning: '比喻堅持不懈地改造自然和堅定不移地進行鬥爭。', origin: '《列子·湯問》' },
  { word: '破釜沉舟', meaning: '比喻下決心不顧一切地幹到底。', origin: '《史記·項羽本紀》' },
  { word: '完璧歸趙', meaning: '比喻把原物完好地歸還本人。', origin: '《史記·廉頗藺相如列傳》' },
  { word: '臥薪嘗膽', meaning: '形容人刻苦自勵，發奮圖強。', origin: '《史記·越王勾踐世家》' },
  { word: '指鹿為馬', meaning: '比喻故意顛倒黑白，混淆是非。', origin: '《史記·秦始皇本紀》' },
  { word: '南轅北轍', meaning: '比喻行動和目的正好相反。', origin: '《戰國策·魏策四》' },
  { word: '驚弓之鳥', meaning: '比喻受過驚嚇後，遇到一點動靜就特別害怕的人。', origin: '《戰國策·楚策四》' },
  { word: '紙上談兵', meaning: '比喻空談理論，不能解決實際問題。', origin: '《史記·廉頗藺相如列傳》' },
  { word: '四面楚歌', meaning: '比喻陷入四面受敵、孤立無援的境地。', origin: '《史記·項羽本紀》' },
  { word: '東施效顰', meaning: '比喻盲目模仿，效果劣劣。', origin: '《莊子·天運》' },
  { word: '門庭若市', meaning: '形容來客很多，非常熱鬧。', origin: '《戰國策·齊策一》' },
  { word: '狡兔三窟', meaning: '比喻隱蔽的地方或方法多。', origin: '《戰國策·齊策四》' },
  { word: '班門弄斧', meaning: '比喻在行家面前賣弄本領，不自量力。', origin: '唐·柳宗元《王氏伯仲唱和詩序》' },
  { word: '精衛填海', meaning: '比喻意志堅決，不畏艱難。', origin: '《山海經·北山經》' },
  { word: '夸父逐日', meaning: '比喻有宏大的志向，或不自量力。', origin: '《山海經·海外北經》' },
  { word: '水滴石穿', meaning: '比喻力量雖小，只要堅持不懈，事情就能成功。', origin: '《漢書·枚乘傳》' },
  { word: '名落孫山', meaning: '指考試或選拔沒有錄取。', origin: '宋·范公偁《過庭錄》' },
  { word: '夜郎自大', meaning: '比喻驕傲無知的膚淺自負或自大行為。', origin: '《史記·西南夷列傳》' },
  { word: '邯鄲學步', meaning: '比喻模仿人不到家，反把原來自己會的東西忘了。', origin: '《莊子·秋水》' },
  { word: '望梅止渴', meaning: '比喻願望無法實現，用空想安慰自己。', origin: '《世說新語·假譎》' },
  { word: '樂不思蜀', meaning: '比喻在新環境中得到樂趣，不再想回到原來環境中去。', origin: '《三國志·蜀書·後主傳》' },
  { word: '草木皆兵', meaning: '形容人在驚慌時疑神疑鬼。', origin: '《晉書·苻堅載記》' },
  { word: '退避三舍', meaning: '比喻退讓和迴避，避免衝突。', origin: '《左傳·僖公二十三年》' },
  { word: '一箭雙鵰', meaning: '原指射箭技術高超，一箭射中兩隻雕。後比喻做一件事達到兩個目的。', origin: '《北史·長孫晟傳》' },
  { word: '圖窮匕見', meaning: '比喻事情發展到最後，真相或本意顯露了出來。', origin: '《戰國策·燕策三》' },
  { word: '洛陽紙貴', meaning: '比喻著作有價值，流傳廣。', origin: '《晉書·文苑·左思傳》' },
  { word: '杞人憂天', meaning: '比喻不必要的或缺乏根據的憂慮和擔心。', origin: '《列子·天瑞》' },
  { word: '游刃有餘', meaning: '比喻技術熟練，經驗豐富，解決問題毫不費力。', origin: '《莊子·養生主》' },
  { word: '按圖索驥', meaning: '比喻做事死板，不靈活。', origin: '明·楊慎《藝林伐山》' },
  { word: '老馬識途', meaning: '比喻有經驗的人對情況熟悉，容易把工作做好。', origin: '《韓非子·說林上》' },
  { word: '盲人瞎馬', meaning: '比喻盲目行動，後果十分危險。', origin: '《世說新語·排調》' },
  { word: '一鼓作氣', meaning: '比喻趁勁頭大的時候鼓起幹勁，一口氣把工作做完。', origin: '《左傳·莊公十年》' },
  { word: '未雨綢繆', meaning: '比喻事先做好準備工作。', origin: '《詩經·豳風·鴟鴞》' },
  { word: '毛遂自薦', meaning: '比喻自告奮勇，自己推薦自己擔任某項工作。', origin: '《史記·平原君虞卿列傳》' },
  { word: '三顧茅廬', meaning: '比喻真心誠意，一再邀請。', origin: '《三國志·蜀書·諸葛亮傳》' },
  { word: '唇亡齒寒', meaning: '嘴唇沒有了，牙齒就會感到寒冷。比喻利害密要相關。', origin: '《左傳·僖公五年》' },
  { word: '門可羅雀', meaning: '形容十分冷落，賓客稀少。', origin: '《史記·汲鄭列傳》' },
  { word: '望洋興嘆', meaning: '原指在偉大事物面前感嘆自己的渺小。現多比喻做事時因力不勝任或沒有條件而感到無可奈何。', origin: '《莊子·秋水》' },
  { word: '破鏡重圓', meaning: '比喻夫妻失散或決裂後重新團聚與和好。', origin: '唐·孟棨《本事詩·情感》' },
  { word: '指桑罵槐', meaning: '指著桑樹罵槐樹。比喻表面是罵這個人，實際上是罵那個人。', origin: '《紅樓夢》' },
  { word: '指腹為婚', meaning: '雙方家長為尚未出生的孩子訂立婚約。', origin: '《魏書·王寶興傳》' },
  { word: '背水一戰', meaning: '比喻在絕境中決一死戰。', origin: '《史記·淮陰侯列傳》' },
  { word: '風聲鶴唳', meaning: '形容驚慌失措，或自相驚憂。', origin: '《晉書·謝玄傳》' },
  { word: '黃粱一夢', meaning: '比喻虛幻不能實現的夢想。', origin: '唐·沈既濟《枕中記》' },
  { word: '滄海桑田', meaning: '比喻世事變化很大。', origin: '晉·葛洪《神仙傳》' },
  { word: '對症下藥', meaning: '比喻針對具體情況決定解決問題的辦法。', origin: '《三國志·魏書·華佗傳》' },
  { word: '胸有成竹', meaning: '比喻在做事之前已經拿定主意。', origin: '宋·蘇軾《文與可畫篔簹谷偃竹記》' },
  { word: '打草驚蛇', meaning: '比喻做法不謹慎，反使對方有所戒備。', origin: '宋·鄭文寶《南唐近事》' },
  { word: '引人入勝', meaning: '引人進入佳境（指風景或文章等）。', origin: '《世說新語·任誕》' },
  { word: '走馬看花', meaning: '原形容事情如意，心境愉快。後多指大略地觀察一下。', origin: '唐·孟郊《登科後》' },
  { word: '負荊請罪', meaning: '形容主動向人認錯、道歉，自請嚴厲責罰。', origin: '《史記·廉頗藺相如列傳》' },
  { word: '雪泥鴻爪', meaning: '比喻往事遺留的痕跡。', origin: '宋·蘇軾《和子由澠池懷舊》' },
  { word: '無中生有', meaning: '把沒有的說成有。比喻毫無事實，憑空捏造。', origin: '《老子》' },
  { word: '拋磚引玉', meaning: '比喻用自己不成熟的意見或作品引出別人更好的意見或好作品。', origin: '唐·常建《答王泠然》' },
  { word: '暗箭傷人', meaning: '比喻暗地裡用某種手段傷害人。', origin: '宋·劉炎《邇言》' },
  { word: '借刀殺人', meaning: '比喻自己不出面，假借別人的手去害人。', origin: '明·汪廷訥《三祝記》' },
  { word: '釜底抽薪', meaning: '比喻從根本上解決問題。', origin: '《漢書·董仲舒傳》' },
  { word: '欲擒故縱', meaning: '故意先放開他，使他放鬆戒備，充分暴露，然後再把他捉住。', origin: '清·七十一《嘯亭雜錄》' },
  { word: '順手牽羊', meaning: '比喻乘機順便取走別人的東西。', origin: '《水滸傳》' },
  { word: '調虎離山', meaning: '設法使老虎離開原來的山岡。比喻為了便於乘機行事，想法子引誘人離開原來的地方。', origin: '《管子·霸言》' },
  { word: '偷梁換柱', meaning: '比喻暗中玩弄手法，以假代真，以劣代優。', origin: '《紅樓夢》' },
  { word: '金蟬脫殼', meaning: '比喻用計脫身，使人不能及時發覺。', origin: '元·馬致遠《任風子》' },
  { word: '遠交近攻', meaning: '結交離得遠的國家，而先攻打鄰國。', origin: '《戰國策·秦策三》' },
  { word: '假途滅虢', meaning: '比喻利用某人來損害別人，然後再損害被利用者。', origin: '《左傳·僖公五年》' },
  { word: '樹上開花', meaning: '比喻本錢不多，卻能虛張聲勢。', origin: '《三十六計》' },
  { word: '反客為主', meaning: '客人反過來成為主人。比喻變被動為主動。', origin: '《三國志·魏書·鍾會傳》' },
  { word: '美人計', meaning: '以美女誘惑敵人使其喪失鬥志的計策。', origin: '《六韜》' },
  { word: '空城計', meaning: '在敵眾我寡的情況下，缺乏兵備而故意示意人以不設兵備，造成敵方錯覺。', origin: '《三國志·蜀書·諸葛亮傳》' },
  { word: '反間計', meaning: '原指使敵人的間諜為我所用，或使敵人獲取假情報而上當。', origin: '《孫子兵法·用間》' },
  { word: '苦肉計', meaning: '故意毀傷身體以騙取敵人信任，從而進行間諜活動的計策。', origin: '《三國志·吳書·周瑜傳》' },
  { word: '連環計', meaning: '本指多計並用，計計相連。', origin: '《三國志·吳書·龐統傳》' },
  { word: '走為上計', meaning: '指遇到強敵或陷於困境時，以離開迴避為最好的策略。', origin: '《南齊書·王敬則傳》' },
  { word: '大智若愚', meaning: '某些才智出眾的人不露鋒芒，看來好像愚笨。', origin: '宋·蘇軾《賀歐陽少師致仕啟》' },
  { word: '大器晚成', meaning: '比喻越是大才能的人通常越晚成功。', origin: '《老子》' },
  { word: '巧言令色', meaning: '形容花言巧語，虛偽討好。', origin: '《論語·學而》' },
  { word: '三思而行', meaning: '指經過反覆考慮，然後再去做。', origin: '《論語·公冶長》' },
  { word: '溫故知新', meaning: '溫習舊的知識，得到新的理解和體會。', origin: '《論語·為政》' },
  { word: '見義勇為', meaning: '看到正義的事，就勇敢地去做。', origin: '《論語·為政》' },
  { word: '見賢思齊', meaning: '見到德才兼備的人就想趕上他。', origin: '《論語·里仁》' },
  { word: '任重道遠', meaning: '責任重大，路途遙遠。', origin: '《論語·泰伯》' },
  { word: '欲速不達', meaning: '想求快，反而不能達到目的。', origin: '《論語·子路》' },
  { word: '有教無類', meaning: '對各類人平等看待，都施以教育。', origin: '《論語·衛靈公》' },
  { word: '因材施教', meaning: '針對學習的人的志趣、能力等具體情況進行不同的教育。', origin: '《論語·先進》' },
  { word: '不恥下問', meaning: '不以向地位、學問較自己低的人請教為可恥。', origin: '《論語·公冶長》' }
];

const WordTileGame: React.FC<Props> = ({ onBack, isAdvanced }) => {
  const [currentIdiom, setCurrentIdiom] = useState<typeof IDIOMS[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [placed, setPlaced] = useState<(string | null)[]>([null, null, null, null]);
  const [isWin, setIsWin] = useState(false);
  const [hasGuessed, setHasGuessed] = useState(false);

  const [roundIndex, setRoundIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [gameIdioms, setGameIdioms] = useState<typeof IDIOMS>([]);
  const [showRules, setShowRules] = useState(false);

  const startGame = useCallback(() => {
      const shuffled = [...IDIOMS].sort(() => Math.random() - 0.5).slice(0, 10);
      setGameIdioms(shuffled);
      setRoundIndex(0);
      setTotalScore(0);
      setGameOver(false);
      startRound(shuffled[0]);
  }, []);

  const startRound = (idiomObj: typeof IDIOMS[0]) => {
      setCurrentIdiom(idiomObj);
      const chars = idiomObj.word.split('').sort(() => 0.5 - Math.random());
      setOptions(chars);
      setPlaced([null, null, null, null]);
      setIsWin(false);
      setHasGuessed(false);
      setTime(0);
      setIsActive(true);
  };

  useEffect(() => {
      startGame();
  }, [startGame]);

  useEffect(() => {
      let interval: any = null;
      if (isActive && !isWin) {
          interval = setInterval(() => {
              setTime(t => t + 1);
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isActive, isWin]);

  const handleNextRound = () => {
      if (roundIndex >= 9) {
          setGameOver(true);
          return;
      }
      const nextIdx = roundIndex + 1;
      setRoundIndex(nextIdx);
      startRound(gameIdioms[nextIdx]);
  };

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
          setIsActive(false);
          const points = Math.max(10, 100 - time * 2);
          setTotalScore(prev => prev + points);
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

  if (gameOver) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-orange-50 p-4">
              <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center animate-fade-in-up border-4 border-orange-100 max-w-sm w-full">
                  <div className="text-6xl mb-4 animate-bounce">🏆</div>
                  <h2 className="text-3xl font-bold text-orange-900 mb-2">測驗完成！</h2>
                  <p className="text-xl text-orange-700 mb-6 font-bold flex flex-col gap-2">
                      <span>10題 總得分:</span>
                      <span className="text-4xl text-orange-600">{totalScore}</span>
                  </p>
                  <button 
                      onClick={startGame}
                      className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md text-lg active:scale-95"
                  >
                      <RefreshCw size={20} className="inline mr-2" /> 重新挑戰
                  </button>
                  <button 
                      onClick={onBack}
                      className="w-full mt-3 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-sm text-lg active:scale-95"
                  >
                      返回選單
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-orange-50 p-2 sm:p-4">
      <button 
        onClick={onBack}
        className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md text-orange-600 hover:bg-orange-100 z-50 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="absolute top-4 right-4 flex gap-2 z-10">
          <div className="text-orange-800 font-bold text-sm sm:text-xl bg-white px-3 sm:px-4 py-2 rounded-xl shadow-sm border border-orange-100 flex items-center">
              題數: {roundIndex + 1} / 10
          </div>
          <button 
              onClick={() => setShowRules(true)}
              className="p-2 sm:p-2 bg-white text-orange-600 rounded-xl shadow-sm border border-orange-100 hover:bg-orange-50 transition-colors active:scale-95 flex items-center justify-center"
              title="遊戲規則"
          >
              <HelpCircle size={24} />
          </button>
      </div>

      <RulesModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)}
          rules={[
              "選出下方打亂的字，將它們填入正確的空格中，拼湊成一個完整的成語。",
              "點擊已填入的字可以取消選擇。",
              "越快完成拼圖，獲得的分數越高！",
              "每次測驗共有 10 題，看你能得幾分！"
          ]}
      />

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
                              onClick={handleNextRound}
                              className="px-4 sm:px-8 bg-orange-500 text-white rounded-2xl font-bold text-lg sm:text-2xl hover:bg-orange-600 shadow-md flex flex-col items-center justify-center gap-1 sm:gap-2 transition-transform active:scale-95 shrink-0"
                          >
                              <RefreshCw size={24} className="sm:w-8 sm:h-8" />
                              <span className="whitespace-nowrap">{roundIndex >= 9 ? '結算分數' : '下一題'}</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>
          {isWin && (
              <div className="absolute bottom-4 left-0 w-full flex justify-center pointer-events-none">
                  <div className="bg-white px-6 py-2 rounded-full shadow-lg border border-orange-200 text-orange-600 font-bold text-xl animate-bounce">
                      得分: {Math.max(10, 100 - time * 2)}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default WordTileGame;
