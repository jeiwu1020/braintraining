
import { SortingLevel, MarketLevel, StepsLevel, ShadowLevel, EmotionLevel, PatternLevel, TimeLevel, OddOneLevel, PuzzleLevel, SoundLevel } from "../types";

export const STATIC_ENCOURAGEMENTS = [
  "做得好！繼續保持！",
  "太棒了！你的大腦正在進步！",
  "非常優秀，反應很快喔！",
  "很專注，表現得很好！",
  "給自己一個掌聲！"
];

// --- 眼明手快 (FIND) - Expanded to ~100 pairs ---
export const STATIC_FIND_PAIRS = [
  // Difficulty 1 (Distinct)
  { target: "🐱", distractor: "🐯", difficulty: 1 }, { target: "🏀", distractor: "⚽", difficulty: 1 }, { target: "🍎", distractor: "🍅", difficulty: 1 },
  { target: "🚗", distractor: "🚕", difficulty: 1 }, { target: "🌙", distractor: "☀️", difficulty: 1 }, { target: "🌧️", distractor: "🌨️", difficulty: 1 },
  { target: "🐟", distractor: "🐬", difficulty: 1 }, { target: "🦊", distractor: "🐺", difficulty: 1 }, { target: "🌵", distractor: "🌲", difficulty: 1 },
  { target: "🎸", distractor: "🎻", difficulty: 1 }, { target: "🍩", distractor: "🥯", difficulty: 1 }, { target: "🍕", distractor: "🧀", difficulty: 1 },
  { target: "🚲", distractor: "🛵", difficulty: 1 }, { target: "🥤", distractor: "🧃", difficulty: 1 }, { target: "🦋", distractor: "🐝", difficulty: 1 },
  { target: "👻", distractor: "💀", difficulty: 1 }, { target: "🎁", distractor: "📦", difficulty: 1 }, { target: "👑", distractor: "👒", difficulty: 1 },
  { target: "💎", distractor: "💍", difficulty: 1 }, { target: "🚀", distractor: "✈️", difficulty: 1 }, { target: "🚆", distractor: "🚌", difficulty: 1 },
  { target: "🐘", distractor: "🦏", difficulty: 1 }, { target: "🐧", distractor: "🐦", difficulty: 1 }, { target: "🐢", distractor: "🐊", difficulty: 1 },
  { target: "🍨", distractor: "🧁", difficulty: 1 }, { target: "🍉", distractor: "🍈", difficulty: 1 }, { target: "🍓", distractor: "🍒", difficulty: 1 },
  { target: "🕰️", distractor: "⏰", difficulty: 1 }, { target: "🔨", distractor: "🪓", difficulty: 1 }, { target: "💡", distractor: "🕯️", difficulty: 1 },
  { target: "🔑", distractor: "🔒", difficulty: 1 }, { target: "👓", distractor: "🕶️", difficulty: 1 }, { target: "👞", distractor: "👟", difficulty: 1 },
  { target: "🌂", distractor: "☂️", difficulty: 1 }, { target: "🎨", distractor: "🎭", difficulty: 1 },
  
  // Difficulty 2 (Similar)
  { target: "🏠", distractor: "🏡", difficulty: 2 }, { target: "🔒", distractor: "🔓", difficulty: 2 }, { target: "🔎", distractor: "🔍", difficulty: 2 },
  { target: "🔈", distractor: "🔊", difficulty: 2 }, { target: "😄", distractor: "😃", difficulty: 2 }, { target: "😠", distractor: "😡", difficulty: 2 },
  { target: "📁", distractor: "📂", difficulty: 2 }, { target: "📅", distractor: "📆", difficulty: 2 }, { target: "📈", distractor: "📉", difficulty: 2 },
  { target: "📤", distractor: "📥", difficulty: 2 }, { target: "🔒", distractor: "🔐", difficulty: 2 }, { target: "🖊️", distractor: "🖋️", difficulty: 2 },
  { target: "📎", distractor: "🖇️", difficulty: 2 }, { target: "📏", distractor: "📐", difficulty: 2 }, { target: "🔨", distractor: "🛠️", difficulty: 2 },
  { target: "🔧", distractor: "🪛", difficulty: 2 }, { target: "🧱", distractor: "🪵", difficulty: 2 }, { target: "🩺", distractor: "🌡️", difficulty: 2 },
  { target: "🧪", distractor: "⚗️", difficulty: 2 }, { target: "🧬", distractor: "🔬", difficulty: 2 }, { target: "🔭", distractor: "🔬", difficulty: 2 },
  { target: "📡", distractor: "🛰️", difficulty: 2 }, { target: "🔌", distractor: "🔋", difficulty: 2 }, { target: "📀", distractor: "💿", difficulty: 2 },
  { target: "🎥", distractor: "📹", difficulty: 2 }, { target: "📺", distractor: "🖥️", difficulty: 2 }, { target: "🖱️", distractor: "🖲️", difficulty: 2 },
  { target: "📠", distractor: "🖨️", difficulty: 2 }, { target: "📱", distractor: "📲", difficulty: 2 }, { target: "💴", distractor: "💵", difficulty: 2 },
  { target: "💶", distractor: "💷", difficulty: 2 }, { target: "🏷️", distractor: "🔖", difficulty: 2 }, { target: "📫", distractor: "📪", difficulty: 2 },
  { target: "📬", distractor: "📭", difficulty: 2 }, { target: "📖", distractor: "📚", difficulty: 2 },

  // Difficulty 3 (Very Similar/Abstract)
  { target: "🍀", distractor: "☘️", difficulty: 3 }, { target: "😐", distractor: "😑", difficulty: 3 }, { target: "🔔", distractor: "🔕", difficulty: 3 },
  { target: "➡️", distractor: "⇨", difficulty: 3 }, { target: "✔️", distractor: "☑️", difficulty: 3 }, { target: "⌚", distractor: "⏰", difficulty: 3 },
  { target: "🔃", distractor: "🔄", difficulty: 3 }, { target: "➕", distractor: "✖️", difficulty: 3 }, { target: "⏮️", distractor: "⏭️", difficulty: 3 },
  { target: "✅", distractor: "❎", difficulty: 3 }, { target: "⚪", distractor: "⚫", difficulty: 3 }, { target: "🟦", distractor: "🟧", difficulty: 3 },
  { target: "📝", distractor: "📋", difficulty: 3 }, { target: "⏪", distractor: "⏩", difficulty: 3 }, { target: "🔼", distractor: "🔽", difficulty: 3 },
  { target: "🔈", distractor: "🔇", difficulty: 3 }, { target: "🌤️", distractor: "🌥️", difficulty: 3 }, { target: "🕐", distractor: "🕑", difficulty: 3 },
  { target: "❤️", distractor: "🧡", difficulty: 3 }, { target: "🟥", distractor: "🛑", difficulty: 3 }, { target: "☮️", distractor: "✝️", difficulty: 3 },
  { target: "⚧", distractor: "♂️", difficulty: 3 }, { target: "♻️", distractor: "🔰", difficulty: 3 }, { target: "👁️", distractor: "👀", difficulty: 3 },
  { target: "🗣️", distractor: "👤", difficulty: 3 }, { target: "🚲", distractor: "🚴", difficulty: 3 }, { target: "🦶", distractor: "🦵", difficulty: 3 },
  { target: "🧱", distractor: "🚪", difficulty: 3 }, { target: "🚫", distractor: "⛔", difficulty: 3 }, { target: "✳️", distractor: "❇️", difficulty: 3 },
  { target: "⬅️", distractor: "⬅", difficulty: 3 }, { target: "☁️", distractor: "🌨️", difficulty: 3 }, { target: "☀️", distractor: "🌞", difficulty: 3 },
  { target: "⭐", distractor: "🌟", difficulty: 3 }, { target: "❄️", distractor: "☃️", difficulty: 3 }
];

// --- SORTING GAME ---

export const STATIC_SORTING_LEVELS: SortingLevel[] = [{"categoryA":"水果","categoryB":"交通工具","itemsA":["蘋果","香蕉","葡萄"],"itemsB":["公車","飛機","腳踏車"]},{"categoryA":"陸地動物","categoryB":"海洋生物","itemsA":["獅子","大象","長頸鹿"],"itemsB":["海豚","章魚","鯊魚"]},{"categoryA":"廚房用品","categoryB":"浴室用品","itemsA":["鍋子","菜刀","砧板"],"itemsB":["洗髮精","毛巾","牙刷"]},{"categoryA":"夏天","categoryB":"冬天","itemsA":["電風扇","冰淇淋","短袖"],"itemsB":["圍巾","暖爐","羽絨衣"]},{"categoryA":"電器","categoryB":"家具","itemsA":["電視","冰箱","洗衣機"],"itemsB":["沙發","床墊","衣櫥"]},{"categoryA":"吃的","categoryB":"穿的","itemsA":["麵包","雞腿","青菜"],"itemsB":["襪子","襯衫","褲子"]},{"categoryA":"紅色","categoryB":"綠色","itemsA":["消防車","草莓","紅包"],"itemsB":["樹葉","青蛙","郵筒(綠)"]},{"categoryA":"天空飛的","categoryB":"地上跑的","itemsA":["老鷹","直升機","熱氣球"],"itemsB":["老虎","汽車","火車"]},{"categoryA":"蔬菜","categoryB":"水果","itemsA":["高麗菜","紅蘿蔔","青江菜"],"itemsB":["蘋果","西瓜","橘子"]},{"categoryA":"樂器","categoryB":"運動用品","itemsA":["鋼琴","吉他","小提琴"],"itemsB":["籃球","羽毛球拍","棒球手套"]},{"categoryA":"甜點","categoryB":"飲料","itemsA":["蛋糕","布丁","甜甜圈"],"itemsB":["牛奶","果汁","熱茶"]},{"categoryA":"圓形的","categoryB":"方形的","itemsA":["球","輪胎","硬幣"],"itemsB":["書本","箱子","電視"]},{"categoryA":"學校","categoryB":"公園","itemsA":["黑板","課本","老師"],"itemsB":["溜滑梯","盪鞦韆","草地"]},{"categoryA":"很重","categoryB":"很輕","itemsA":["大象","汽車","石頭"],"itemsB":["羽毛","氣球","衛生紙"]},{"categoryA":"熱的","categoryB":"冷的","itemsA":["火鍋","太陽","熱湯"],"itemsB":["冰塊","雪人","冷氣"]},{"categoryA":"文具","categoryB":"餐具","itemsA":["鉛筆","尺","橡皮擦"],"itemsB":["筷子","湯匙","碗"]},{"categoryA":"早上","categoryB":"晚上","itemsA":["吃早餐","太陽升起","公雞叫"],"itemsB":["看星星","睡覺","貓頭鷹"]},{"categoryA":"有腳","categoryB":"沒腳","itemsA":["狗","雞","螞蟻"],"itemsB":["蛇","魚","蚯蚓"]},{"categoryA":"會飛","categoryB":"不會飛","itemsA":["老鷹","蝴蝶","蚊子"],"itemsB":["大象","豬","烏龜"]},{"categoryA":"喝的","categoryB":"吃的","itemsA":["水","可樂","咖啡"],"itemsB":["飯","肉","菜"]},{"categoryA":"金屬","categoryB":"木頭","itemsA":["鐵釘","硬幣","鋁罐"],"itemsB":["鉛筆","桌子","筷子"]},{"categoryA":"男生","categoryB":"女生","itemsA":["爸爸","爺爺","哥哥"],"itemsB":["媽媽","奶奶","姊姊"]},{"categoryA":"大聲","categoryB":"小聲","itemsA":["打雷","大聲公","鞭炮"],"itemsB":["說悄悄話","風鈴","走路無聲"]},{"categoryA":"有毛","categoryB":"無毛","itemsA":["貓","狗","兔"],"itemsB":["蛇","青蛙","魚"]},{"categoryA":"甜的","categoryB":"鹹的","itemsA":["糖果","蜂蜜","巧克力"],"itemsB":["鹽巴","醬油","薯條(鹽)"]},{"categoryA":"白天活動","categoryB":"夜間活動","itemsA":["上學","曬衣服","去菜市場"],"itemsB":["逛夜市","看螢火蟲","睡覺"]},{"categoryA":"雨天","categoryB":"晴天","itemsA":["打傘","穿雨衣","積水"],"itemsB":["戴墨鏡","防曬乳","強光"]},{"categoryA":"有殼","categoryB":"無殼","itemsA":["蝸牛","烏龜","蛤蜊"],"itemsB":["金魚","章魚","海星"]},{"categoryA":"快","categoryB":"慢","itemsA":["飛機","高鐵","獵豹"],"itemsB":["烏龜","蝸牛","走路"]},{"categoryA":"黑色","categoryB":"白色","itemsA":["木炭","烏鴉","黑板"],"itemsB":["雪","雲","白紙"]},{"categoryA":"工具","categoryB":"玩具","itemsA":["鐵鎚","螺絲起子","扳手"],"itemsB":["積木","洋娃娃","遙控車"]},{"categoryA":"硬","categoryB":"軟","itemsA":["石頭","鑽石","鋼鐵"],"itemsB":["棉花","海綿","豆腐"]},{"categoryA":"能喝","categoryB":"不能喝","itemsA":["水","果汁","牛奶"],"itemsB":["沙子","泥土","木頭"]},{"categoryA":"衣服","categoryB":"鞋子","itemsA":["襯衫","外套","洋裝"],"itemsB":["運動鞋","拖鞋","高跟鞋"]},{"categoryA":"海裡","categoryB":"天上","itemsA":["鯨魚","珊瑚","海草"],"itemsB":["星星","雲朵","太陽"]},{"categoryA":"長","categoryB":"短","itemsA":["長頸鹿脖子","火車","直尺100cm"],"itemsB":["短褲","橡皮擦","小麥"]},{"categoryA":"粗糙","categoryB":"光滑","itemsA":["樹皮","砂紙","石頭"],"itemsB":["玻璃","冰塊","鏡子"]},{"categoryA":"安靜","categoryB":"吵鬧","itemsA":["圖書館","睡房","醫院"],"itemsB":["菜市場","演唱會","遊樂園"]},{"categoryA":"亮","categoryB":"暗","itemsA":["燈泡","太陽","手電筒"],"itemsB":["夜晚","影子","山洞"]},{"categoryA":"需要用水的","categoryB":"不需要用水","itemsA":["洗車","游泳","澆花"],"itemsB":["看書","寫字","睡覺"]},{"categoryA":"植物","categoryB":"動物","itemsA":["大樹","向日葵","仙人掌"],"itemsB":["小白兔","老虎","飛鳥"]},{"categoryA":"尖銳","categoryB":"圓滑","itemsA":["針","刀子","刺蝟"],"itemsB":["球","蘋果","玻璃珠"]},{"categoryA":"能飛","categoryB":"只能走","itemsA":["鴿子","直升機","熱氣球"],"itemsB":["狗","人","自行車"]},{"categoryA":"冷","categoryB":"熱","itemsA":["冰棒","雪糕","冰箱"],"itemsB":["暖爐","火","熱湯"]},{"categoryA":"客廳","categoryB":"廚房","itemsA":["沙發","電視","茶几"],"itemsB":["瓦斯爐","抽油煙機","流理台"]},{"categoryA":"室內","categoryB":"室外","itemsA":["床","餐桌","衣櫃"],"itemsB":["馬路","紅綠燈","公園長椅"]},{"categoryA":"花","categoryB":"草","itemsA":["玫瑰","百合","蘭花"],"itemsB":["薄荷","幸運草","狗尾草"]},{"categoryA":"四隻腳的","categoryB":"兩隻腳的","itemsA":["桌子","狗","貓"],"itemsB":["人","鴨子","企鵝"]},{"categoryA":"看","categoryB":"聽","itemsA":["電視","書本","圖畫"],"itemsB":["音樂","收音機","廣播"]},{"categoryA":"洗澡","categoryB":"煮飯","itemsA":["沐浴乳","蓮蓬頭","肥皂"],"itemsB":["鍋鏟","米","醬油"]}].map((t, i) => ({
    categoryA: t.categoryA, categoryB: t.categoryB,
    items: [
        {id: 'sn-'+i+'-a1', name: t.itemsA[0], category: 'A'},
        {id: 'sn-'+i+'-a2', name: t.itemsA[1], category: 'A'},
        {id: 'sn-'+i+'-a3', name: t.itemsA[2], category: 'A'},
        {id: 'sn-'+i+'-b1', name: t.itemsB[0], category: 'B'},
        {id: 'sn-'+i+'-b2', name: t.itemsB[1], category: 'B'},
        {id: 'sn-'+i+'-b3', name: t.itemsB[2], category: 'B'}
    ]
}));

export const STATIC_SORTING_LEVELS_ADVANCED: SortingLevel[] = [{"categoryA":"可回收","categoryB":"一般垃圾","itemsA":["寶特瓶","舊報紙","玻璃瓶"],"itemsB":["衛生紙","雞骨頭","塑膠袋"]},{"categoryA":"公共場所","categoryB":"私人場所","itemsA":["公園","圖書館","火車站"],"itemsB":["臥室","浴室","客廳"]},{"categoryA":"液體","categoryB":"固體","itemsA":["牛奶","醬油","洗髮精"],"itemsB":["冰塊","木頭","石頭"]},{"categoryA":"需要電","categoryB":"不需要電","itemsA":["手機","吹風機","微波爐"],"itemsB":["掃把","書籍","單車"]},{"categoryA":"有生命","categoryB":"無生命","itemsA":["榕樹","螞蟻","細菌"],"itemsB":["岩石","機器人","雲"]},{"categoryA":"很危險","categoryB":"很安全","itemsA":["火","刀片","深水區"],"itemsB":["棉花","草地","枕頭"]},{"categoryA":"正向情緒","categoryB":"負向情緒","itemsA":["興奮","感激","平靜"],"itemsB":["嫉妒","焦慮","憤怒"]},{"categoryA":"健康的","categoryB":"不健康的","itemsA":["運動","早睡","喝水"],"itemsB":["熬夜","抽菸","久坐"]},{"categoryA":"辦公用品","categoryB":"清潔工具","itemsA":["釘書機","迴紋針","印表機"],"itemsB":["拖把","水桶","刷子"]},{"categoryA":"夏季","categoryB":"冬季","itemsA":["蟬叫","颱風","泳池"],"itemsB":["寒流","暖暖包","火鍋"]},{"categoryA":"天然的","categoryB":"人造的","itemsA":["太陽","河流","石頭"],"itemsB":["塑膠","電腦","汽車"]},{"categoryA":"發酵食品","categoryB":"非發酵","itemsA":["優格","泡菜","起司"],"itemsB":["鮮奶","新鮮蔬菜","白米飯"]},{"categoryA":"哺乳類","categoryB":"爬蟲類","itemsA":["海豚","蝙蝠","袋鼠"],"itemsB":["烏龜","蛇","變色龍"]},{"categoryA":"主觀意見","categoryB":"客觀事實","itemsA":["這花很美","我不喜歡雨","菜太鹹"],"itemsB":["現在下雨","地球是圓的","一天24小時"]},{"categoryA":"省錢","categoryB":"浪費","itemsA":["隨手關燈","記帳","比價"],"itemsB":["開冷氣開窗","亂買東西","水龍頭不關"]},{"categoryA":"禮貌","categoryB":"不禮貌","itemsA":["請","謝謝","對不起"],"itemsB":["插隊","罵人","不理人"]},{"categoryA":"抽象","categoryB":"具體","itemsA":["愛","和平","夢想"],"itemsB":["蘋果","石頭","書本"]},{"categoryA":"有機物","categoryB":"無機物","itemsA":["木材","肉","樹葉"],"itemsB":["玻璃","金屬","塑膠"]},{"categoryA":"透明","categoryB":"不透明","itemsA":["玻璃","保鮮膜","清水"],"itemsB":["木板","磚頭","鐵板"]},{"categoryA":"易碎","categoryB":"不易碎","itemsA":["玻璃杯","雞蛋","瓷碗"],"itemsB":["鐵鎚","海綿","橡皮擦"]},{"categoryA":"可燃","categoryB":"不可燃","itemsA":["紙","木頭","酒精"],"itemsB":["石頭","沙子","鐵釘"]},{"categoryA":"虛擬","categoryB":"實體","itemsA":["軟體","點數卡","電子郵件"],"itemsB":["光碟片","鈔票","信件"]},{"categoryA":"高溫","categoryB":"低溫","itemsA":["岩漿","沸水","火爐"],"itemsB":["液態氮","乾冰","南極"]},{"categoryA":"有毒","categoryB":"無毒","itemsA":["砒霜","水銀","農藥"],"itemsB":["水","空氣","白飯"]},{"categoryA":"酸性","categoryB":"鹼性","itemsA":["檸檬汁","醋","可樂"],"itemsB":["肥皂水","小蘇打","漂白水"]},{"categoryA":"導電","categoryB":"絕緣","itemsA":["銅線","食鹽水","鐵片"],"itemsB":["塑膠","橡膠","純水"]},{"categoryA":"可再生能源","categoryB":"不可再生能源","itemsA":["太陽能","風力","水力"],"itemsB":["石油","煤炭","天然氣"]},{"categoryA":"輸入設備","categoryB":"輸出設備","itemsA":["滑鼠","鍵盤","麥克風"],"itemsB":["螢幕","印表機","喇叭"]},{"categoryA":"硬體","categoryB":"軟體","itemsA":["主機板","顯示卡","記憶體"],"itemsB":["作業系統","瀏覽器","防毒軟體"]},{"categoryA":"自願","categoryB":"被迫","itemsA":["義工","捐款","幫忙"],"itemsB":["受罰","被搶","被騙"]},{"categoryA":"積極","categoryB":"消極","itemsA":["主動解決","尋求幫助","樂觀面對"],"itemsB":["逃避","抱怨","放棄"]},{"categoryA":"原因","categoryB":"結果","itemsA":["下大雨","熬夜","努力學習"],"itemsB":["淹水","精神差","好成績"]},{"categoryA":"內向","categoryB":"外向","itemsA":["獨處","安靜","害羞"],"itemsB":["愛交際","活潑","喜歡人群"]},{"categoryA":"直接","categoryB":"間接","itemsA":["當面說","自己做","本尊"],"itemsB":["透過別人","委託","代理人"]},{"categoryA":"單數","categoryB":"複數","itemsA":["一個人","一顆蘋果","一本書"],"itemsB":["我們","他們","一堆蘋果"]},{"categoryA":"過去","categoryB":"未來","itemsA":["昨天","歷史","上個月"],"itemsB":["明天","明年","科幻"]},{"categoryA":"優點","categoryB":"缺點","itemsA":["善良","誠實","負責"],"itemsB":["懶惰","說謊","自私"]},{"categoryA":"悲劇","categoryB":"喜劇","itemsA":["失敗","死亡","分離"],"itemsB":["成功","團聚","開心"]},{"categoryA":"主動","categoryB":"被動","itemsA":["發起","攻擊","帶領"],"itemsB":["跟隨","防禦","遵守"]},{"categoryA":"真實","categoryB":"虛構","itemsA":["歷史事件","科學定律","新聞"],"itemsB":["童話故事","神話","科幻小說"]},{"categoryA":"優勢","categoryB":"劣勢","itemsA":["資源多","技術好","速度快"],"itemsB":["資金少","經驗不足","動作慢"]},{"categoryA":"肯定","categoryB":"否定","itemsA":["是","可以","對"],"itemsB":["不是","不行","錯"]},{"categoryA":"增加","categoryB":"減少","itemsA":["生長","膨脹","擴大"],"itemsB":["萎縮","縮小","消耗"]},{"categoryA":"複雜","categoryB":"簡單","itemsA":["微積分","精密機器","迷宮"],"itemsB":["一加一","直線","原點"]},{"categoryA":"進口","categoryB":"出口","itemsA":["買入國外商品","付錢給外國","外國車"],"itemsB":["賣給國外","賺外匯","國產外銷"]},{"categoryA":"批發","categoryB":"零售","itemsA":["大盤商","整箱買","工廠直營"],"itemsB":["便利商店","單買一件","散裝"]},{"categoryA":"收入","categoryB":"支出","itemsA":["薪水","中獎","利息"],"itemsB":["買菜","繳水電","付房租"]},{"categoryA":"長期","categoryB":"短期","itemsA":["十年計畫","房貸","氣候變遷"],"itemsB":["週末旅行","陣雨","特賣會"]},{"categoryA":"固定","categoryB":"變動","itemsA":["房屋","山脈","基座"],"itemsB":["流水","薪水獎金","雲朵"]},{"categoryA":"靜止","categoryB":"運動","itemsA":["睡著","停好的車","雕像"],"itemsB":["跑步","飛行的鳥","行駛的車"]}].map((t, i) => ({
    categoryA: t.categoryA, categoryB: t.categoryB,
    items: [
        {id: 'sa-'+i+'-a1', name: t.itemsA[0], category: 'A'},
        {id: 'sa-'+i+'-a2', name: t.itemsA[1], category: 'A'},
        {id: 'sa-'+i+'-a3', name: t.itemsA[2], category: 'A'},
        {id: 'sa-'+i+'-b1', name: t.itemsB[0], category: 'B'},
        {id: 'sa-'+i+'-b2', name: t.itemsB[1], category: 'B'},
        {id: 'sa-'+i+'-b3', name: t.itemsB[2], category: 'B'}
    ]
}));

const generateSentences = (base: string[], count: number) => {
    const list = [...base];
    const subjects = ["哥哥", "妹妹", "小狗", "小貓", "爸爸", "媽媽", "老師", "同學"];
    const verbs = ["喜歡", "討厭", "想要", "正在", "去", "看見"];
    const objects = ["吃蘋果", "玩球", "看書", "睡覺", "畫畫", "唱歌", "跳舞"];
    while(list.length < count) {
        const s = subjects[Math.floor(Math.random() * subjects.length)];
        const v = verbs[Math.floor(Math.random() * verbs.length)];
        const o = objects[Math.floor(Math.random() * objects.length)];
        const sentence = `${s}${v}${o}`;
        if(!list.includes(sentence)) list.push(sentence);
    }
    return list;
};
export const STATIC_SENTENCES = generateSentences([
  "今天天氣真好", "我喜歡吃蘋果", "媽媽去買菜", "小狗在跑步", "花園裡有花", "爸爸看報紙", "弟弟玩積木", "太陽公公出來了",
  "我們要洗手", "大家一起唱歌", "樹上有小鳥", "我會自己穿鞋", "要多喝水", "垃圾不亂丟", "早睡早起身體好"
], 100);
export const STATIC_SENTENCES_ADVANCED = generateSentences([
    "雖然今天下雨，但我們還是很開心", "運動過後要記得補充水分才健康", "過馬路的時候，一定要看紅綠燈", "保持規律的作息，精神才會飽滿",
    "這本書的故事非常精彩有趣", "我們要愛護地球，做好資源回收", "這家餐廳的料理既便宜又美味", "朋友之間要互相幫助，感情才會好",
    "如果不刷牙，牙齒就會蛀掉", "只要努力練習，一定會進步的", "夏天的夜晚，常常可以聽見蟲鳴聲", "我把房間整理得乾乾淨淨",
    "這是一次非常難忘的旅行經驗", "每天運動三十分鐘有益身心健康", "看電影的時候請保持安靜"
], 100);

const generateMarketData = (difficulty: 'NORMAL' | 'ADVANCED', count: number) => {
    const levels: any[] = [];
    const itemsList = [
        {name: "蘋果", icon: "🍎"}, {name: "香蕉", icon: "🍌"}, {name: "麵包", icon: "🍞"}, {name: "牛奶", icon: "🥛"},
        {name: "蛋糕", icon: "🍰"}, {name: "布丁", icon: "🍮"}, {name: "漢堡", icon: "🍔"}, {name: "薯條", icon: "🍟"},
        {name: "可樂", icon: "🥤"}, {name: "三明治", icon: "🥪"}, {name: "便當", icon: "🍱"}, {name: "飯糰", icon: "🍙"},
        {name: "披薩", icon: "🍕"}, {name: "熱狗", icon: "🌭"}, {name: "餅乾", icon: "🍪"}, {name: "甜甜圈", icon: "🍩"},
        {name: "冰淇淋", icon: "🍦"}, {name: "葡萄", icon: "🍇"}, {name: "西瓜", icon: "🍉"}, {name: "橘子", icon: "🍊"},
        {name: "草莓", icon: "🍓"}, {name: "茶", icon: "🍵"}, {name: "咖啡", icon: "☕"}, {name: "果汁", icon: "🍹"}
    ];
    let tries = 0;
    while(levels.length < count && tries < 10000) {
        tries++;
        const item1 = itemsList[Math.floor(Math.random() * itemsList.length)];
        let item2 = itemsList[Math.floor(Math.random() * itemsList.length)];
        while(item2.name === item1.name) item2 = itemsList[Math.floor(Math.random() * itemsList.length)];
        let price1, price2, question, answer, options;
        if (difficulty === 'NORMAL') {
            price1 = (Math.floor(Math.random() * 5) + 1) * 10;
            price2 = (Math.floor(Math.random() * 5) + 1) * 5;
            answer = price1 + price2;
            question = `買一個${item1.name}和一個${item2.name}，共多少錢？`;
            options = [answer, answer + 5, answer - 5].sort(() => 0.5 - Math.random());
        } else {
            price1 = (Math.floor(Math.random() * 10) + 2) * 10;
            price2 = (Math.floor(Math.random() * 10) + 2) * 5;
            answer = 200 - (price1 + price2);
            question = `帶200元買${item1.name}和${item2.name}，會找多少錢？`;
            options = [answer, answer + 10, answer - 10].sort(() => 0.5 - Math.random());
        }
        
        // Ensure strictly no exact same items pair in level history
        const isDuplicate = levels.some(l => 
            (l.items[0].name === item1.name && l.items[1].name === item2.name) ||
            (l.items[0].name === item2.name && l.items[1].name === item1.name)
        );
        if(!isDuplicate) {
            levels.push({
                items: [
                    {name: item1.name, icon: item1.icon, price: price1},
                    {name: item2.name, icon: item2.icon, price: price2}
                ],
                question,
                options,
                correctAnswer: answer
            });
        }
    }
    return levels;
};
export const STATIC_MARKET_LEVELS = generateMarketData('NORMAL', 100);
export const STATIC_MARKET_LEVELS_ADVANCED_FIXED = generateMarketData('ADVANCED', 100);

const generateStepsData = (count: number, difficulty: 'NORMAL' | 'ADVANCED'): StepsLevel[] => {
    const tasks = difficulty === 'NORMAL' ? [{"t":"刷牙","s":["拿牙刷","擠牙膏","刷牙齒","漱口","洗牙刷"]},{"t":"洗手","s":["開水龍頭","沖濕手","抹肥皂","搓揉雙手","沖洗乾淨"]},{"t":"穿襪子","s":["拿襪子","套進腳尖","拉過腳跟","往上拉平"]},{"t":"泡麵","s":["打開碗蓋","撕開調味包","倒入熱水","蓋上等三分鐘"]},{"t":"澆花","s":["拿水壺","裝滿水","走到花盆旁","倒水","放回水壺"]},{"t":"洗臉","s":["弄濕毛巾","輕擦臉頰","擦拭額頭","用水搓洗毛巾","擰乾"]},{"t":"吃香蕉","s":["拿香蕉","剝開外皮","咬一口","吃完","將皮丟垃圾桶"]},{"t":"喝水","s":["拿杯子","打開水壺","倒水入杯","喝水","放下杯子"]},{"t":"戴口罩","s":["分辨正反面","將掛繩勾住耳朵","拉開上下層","壓緊鼻樑條"]},{"t":"擦桌子","s":["拿抹布","沾濕抹布","用力擰乾","來回擦拭","洗淨抹布"]},{"t":"脫鞋子","s":["解開鞋帶","腳跟退出","脫下鞋子","擺放整齊"]},{"t":"梳頭髮","s":["拿梳子","從頭頂梳下","梳順打結處","整理瀏海"]},{"t":"洗澡","s":["脫衣服","開熱水","抹沐浴乳","沖洗乾淨","擦乾身體"]},{"t":"吃藥","s":["準備溫水","拿出藥丸","放入口中","喝水吞下"]},{"t":"綁鞋帶","s":["交叉拉緊","打一個結","折兩個圈","互相穿過拉緊"]},{"t":"剪指甲","s":["拿指甲剪","對準指甲","輕輕壓下","修剪邊緣","丟棄碎屑"]},{"t":"戴手錶","s":["拿起手錶","放在手腕上","穿過錶帶扣","扣上固定"]},{"t":"穿外套","s":["拿外套","穿進左手","穿進右手","拉上拉鍊"]},{"t":"戴帽子","s":["拿起帽子","對準頭部","戴上","調整帽沿"]},{"t":"關門","s":["握住門把","將門拉向自己","聽到喀嚓聲","放開門把"]},{"t":"開窗戶","s":["走到窗邊","解除鎖扣","向旁推開","固定窗戶"]},{"t":"倒垃圾","s":["打包垃圾袋","提著垃圾","走到垃圾桶","丟入垃圾桶"]},{"t":"撕日曆","s":["走到日曆前","捏住當天日曆","往下撕下","丟進垃圾桶"]},{"t":"拉窗簾","s":["走到窗邊","抓住窗簾繩","往旁邊拉","整理窗簾"]},{"t":"開電視","s":["拿遙控器","對準電視","按下電源鍵","選轉台"]},{"t":"戴眼鏡","s":["用雙手拿眼鏡","撐開鏡腳","掛上耳朵","調整鼻墊"]},{"t":"梳洗","s":["準備臉盆","裝溫水","輕輕洗臉","用毛巾擦乾"]},{"t":"穿褲子","s":["拿著褲頭","右腳穿入","左腳穿入","往上拉起","扣上扣子"]},{"t":"盛飯","s":["拿碗","拿飯匙","打開電鍋","盛飯入碗","蓋上電鍋"]},{"t":"切蘋果","s":["洗蘋果","拿刀子","切成兩半","去籽","切小塊"]},{"t":"戴隱形眼鏡","s":["洗手","食指拿鏡片","撐開眼皮","放入眼中","眨眼"]},{"t":"摺被子","s":["攤平被子","對摺一半","再對摺","放床頭"]},{"t":"沖咖啡","s":["拿濾紙","放入咖啡粉","注入熱水","等待滴漏","拿開濾杯"]},{"t":"剝橘子","s":["拿橘子","從頂部摳開","剝下橘皮","拔除白絲","分瓣吃"]},{"t":"掛衣服","s":["拿衣架","穿進衣服","拉平肩膀","掛上衣櫥"]},{"t":"點眼藥水","s":["頭微仰","拉下眼皮","滴入藥水","閉眼休息"]},{"t":"包禮物","s":["準備包裝紙","放入物品","摺疊包裝紙","貼上膠帶","綁上緞帶"]},{"t":"洗餐盒","s":["清除剩菜","滴洗碗精","用海綿刷洗","清水沖淨","倒放晾乾"]},{"t":"裝水壺","s":["轉開蓋子","對準飲水機","按下出水","裝滿停水","鎖緊蓋子"]},{"t":"微波爐加熱","s":["打開爐門","放入食物","關上爐門","設定時間","按下啟動"]},{"t":"量血壓","s":["拉起衣袖","戴上壓脈帶","按下啟動鍵","保持安靜","讀取數值"]},{"t":"綁頭髮","s":["將頭髮集中","用手梳順","套上髮圈","繞圈綁緊"]},{"t":"洗蘋果","s":["開水龍頭","用水沖洗","搓揉表面","關水龍頭","擦乾"]},{"t":"換燈泡","s":["關閉電源","等燈泡冷卻","轉下舊燈泡","轉上新燈泡","開啟電源"]},{"t":"洗頭","s":["弄濕頭髮","抹洗髮乳","按摩頭皮","沖洗乾淨","用毛巾擦乾"]},{"t":"開罐頭","s":["拉起拉環","用力往後拉","完全撕開","倒出內容物"]},{"t":"掃地","s":["拿掃把","將灰塵集中","掃入笨斗","倒入垃圾桶"]},{"t":"削鉛筆","s":["拿鉛筆","插入削鉛筆機","轉動把手","抽出鉛筆"]},{"t":"拖地","s":["水桶裝水","洗拖把","擰乾拖把","來回拖地"]},{"t":"切蛋糕","s":["拿刀子","對準中心","切下","分裝到盤子"]}] : [{"t":"煮水餃","s":["燒水","水滾下水餃","攪拌防沾黏","加一次冷水","浮起後撈出"]},{"t":"寄信","s":["寫信紙","裝入信封","寫上地址","貼上郵票","投入郵筒"]},{"t":"看病","s":["去櫃檯掛號","在候診區等候","進診間看診","拿批價單繳費","到藥局領藥"]},{"t":"搭公車","s":["到站牌等車","看到車招手","上車刷卡","按下車鈴","下車刷卡"]},{"t":"ATM提款","s":["插入提款卡","輸入密碼","輸入金額","取出卡片","拿取鈔票"]},{"t":"洗衣服","s":["深淺色分類","放入洗衣機","倒入洗衣精","按下開關","晾乾衣服"]},{"t":"超市買菜","s":["列購物清單","拿購物籃","挑選商品","到櫃檯結帳","裝入環保袋"]},{"t":"搭捷運","s":["進站刷卡","看指標找月台","排隊上車","注意下車站名","出站刷卡"]},{"t":"炒飯","s":["切好配料","熱鍋倒油","炒香雞蛋","加入白飯翻炒","調味起鍋"]},{"t":"資源回收","s":["沖洗餐盒","分辨材質","壓扁體積","分類投入回收桶","清洗雙手"]},{"t":"手機充電","s":["拿出充電器","插入插座","接上手機","確認充電符號","充滿後拔除"]},{"t":"煮白飯","s":["量取白米","用水洗淨","加適量純水","放入電鍋","按下煮飯鍵"]},{"t":"搭高鐵","s":["上網訂票","到車站取票","進閘門","尋找車廂座位","到達目的地出站"]},{"t":"換床單","s":["拆下舊床單","拿去洗","攤開新床單","套上四個角","拉平整理"]},{"t":"烤吐司","s":["拿出吐司","放入烤箱","設定時間","聽到叮聲","小心取出"]},{"t":"加值悠遊卡","s":["放到加值機上","選擇要加值的金額","放入紙鈔","確認餘額","拿回卡片"]},{"t":"使用微波爐","s":["打開微波爐","放入食物","設定火力與時間","等待運轉結束","戴手套取出食物"]},{"t":"倒垃圾車","s":["聽到音樂","提垃圾下樓","等待垃圾車停妥","將垃圾拋入車內","回家洗手"]},{"t":"叫外送","s":["打開APP","挑選餐廳","選擇餐點","確認地址與結帳","下樓取餐"]},{"t":"逛圖書館","s":["查詢書目","尋找書架編號","找到書籍","到櫃檯借閱","確認歸還日期"]},{"t":"煮咖啡","s":["磨咖啡豆","放濾紙","倒咖啡粉","注熱水悶蒸","等待萃取完成"]},{"t":"洗碗","s":["將廚餘倒乾淨","海綿沾洗碗精","刷洗碗盤","清水沖洗乾淨","放到瀝水架晾乾"]},{"t":"出國搭機","s":["抵達機場","櫃台報到托運行李","安全檢查","過海關","到登機門登機"]},{"t":"看電影","s":["上網訂票","到戲院取票","買爆米花","驗票進場","尋找座位"]},{"t":"煎荷包蛋","s":["開火熱鍋","倒油","打蛋入鍋","翻面","起鍋裝盤"]},{"t":"收包裹","s":["接到通知","準備證件","到便利商店","告訴店員姓名","核對後領取"]},{"t":"泡茶","s":["熱水溫壺","放入茶葉","注入沸水","倒掉第一泡","重新注水等待"]},{"t":"洗車","s":["全車沖水","噴灑泡沫","海綿擦拭","高壓水槍沖淨","擦乾車身"]},{"t":"種植物","s":["準備花盆","放入泥土","播下種子","覆蓋薄土","澆水"]},{"t":"組裝電風扇","s":["拆開包裝","裝上底座","裝上後網與扇葉","鎖緊螺母","裝上前網"]},{"t":"換電池","s":["打開電池蓋","取出舊電池","確認正負極","裝入新電池","蓋上電池蓋"]},{"t":"買衣服","s":["挑選款式","找適合尺寸","進試衣間試穿","確認合身","到櫃檯結帳"]},{"t":"烤肉","s":["生火起炭","放上烤網","鋪上肉片","塗抹烤肉醬","烤熟夾起"]},{"t":"修理腳踏車","s":["檢查破胎處","挖出內胎","貼上補胎片","裝回外胎","打氣"]},{"t":"煮綠豆湯","s":["洗淨綠豆","泡水兩小時","放入電鍋","加水煮熟","加糖調味"]},{"t":"使用吸塵器","s":["插上插頭","選擇吸頭","按下開關","吸地板","清理集塵盒"]},{"t":"燙衣服","s":["衣服攤平","插上熨斗電源","等熨斗變熱","來回熨燙","掛起放涼"]},{"t":"使用飲水機","s":["放好杯子","解除按鈕鎖定","按壓熱水鍵","裝水","放開按鍵"]},{"t":"洗被單","s":["拆下被單","放入洗衣機","選清洗模式","脫水","拿到戶外晾乾"]},{"t":"做三明治","s":["烤吐司","塗打底醬料","放上生菜與肉片","蓋上另一片吐司","對角切半"]},{"t":"加油","s":["騎進加油站","打開油箱蓋","告訴員工加什麼油","付錢","關上油箱蓋"]},{"t":"退貨包裹","s":["商品裝回紙箱","貼上退貨單","拿到超商機器操作","列印小白單交給店員","保留收據"]},{"t":"辦理信用卡","s":["填寫申請書","附上身分證影本","附上財力證明","寄出","等待核卡通知"]},{"t":"剪頭髮","s":["掛號排隊","告知設計師髮型","套上剪髮斗篷","剪髮","吹整頭髮"]},{"t":"清潔冷氣濾網","s":["打開冷氣外蓋","抽出濾網","用清水沖洗","晾乾","裝回冷氣"]},{"t":"去銀行匯款","s":["抽號碼牌","填寫匯款單","等待叫號","單子交給櫃員","確認收據"]},{"t":"自動洗衣店","s":["將衣服放入洗衣機","投入硬幣","選擇洗衣行程","按下啟動","時間到取出"]},{"t":"製作冰塊","s":["清洗製冰盒","倒入開水","小心放入冷凍庫","等待結冰","扭轉製冰盒取出"]},{"t":"吃火鍋","s":["點湯底","拿取沾醬","煮熟蔬菜與肉","撈起沾醬吃","吃甜點"]},{"t":"搭計程車","s":["路邊揮手","開門上車","告知司機目的地","到達後付錢","下車關門"]}];
    const levels: StepsLevel[] = tasks.map((t, i) => ({
        title: t.t,
        steps: t.s.map((text, idx) => ({
            id: 'step-' + difficulty + '-' + i + '-' + idx,
            text: text,
            order: idx + 1
        }))
    }));
    return levels;
};
export const STATIC_STEPS_LEVELS = generateStepsData(100, 'NORMAL');
export const STATIC_STEPS_LEVELS_ADVANCED = generateStepsData(100, 'ADVANCED');

const STATIC_SHADOW_SOURCE = [
  "🐰", "🚗", "🍌", "✈️", "🏀", "🏠", "🌷", "🚲", "🕶️", "☂️", 
  "🕰️", "🐘", "🎸", "🍦", "🦋", "🌵", "🔑", "🐢", "🎩", "🧢",
  "🎓", "👑", "🎒", "👜", "💼", "👓", "🧣", "🧤",
  "🧥", "🧦", "👗", "👘", "👙", "👚",
  "👛", "👞", "👟", "👠", "👢", 
  "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧",
  "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗",
  "🐴", "🦄", "🐝", "🐛", "🐌", "🐞", "🐜", 
  "🕷️", "🕸️", "🦂", "🐍", "🦎",
  "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳"
];
export const STATIC_SHADOW_CONFUSING_SETS = [
    ["🐶", "🐺", "🦊", "🐕"],
    ["🐱", "🐯", "🐆", "🦁"],
    ["🐔", "🦆", "🦅", "🦜", "🐦"],
    ["🚗", "🚕", "🚙", "🚓"],
    ["🍎", "🍅", "🍑", "🍊"],
    ["🐴", "🦄", "🦓", "🐎"],
    ["👕", "👚", "🧥", "👔"],
    ["👟", "👞", "🥾", "👢"],
    ["👓", "🕶️", "🥽"],
    ["🔨", "🪓", "🔧", "🪛"],
    ["📏", "📐", "🖇️", "📎"]
];
export const STATIC_SHADOW_CATEGORIES: Record<string, string[]> = {
    "動物": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐸", "🦁", "🐧", "🦉"],
    "水果與食物": ["🍌", "🍇", "🍓", "🍍", "🍉", "🍒", "🍐", "🍦", "🍩", "🍕", "🌭"],
    "交通": ["🚗", "🚌", "🏎️", "🚑", "🚚", "🚲", "✈️", "🚁", "🚢", "🛵", "🚜", "🚂"],
    "工具": ["🔨", "🔧", "✂️", "🔑", "🔭", "🔬", "⚖️", "🔒", "📎", "📌"], 
    "自然": ["🌵", "🌲", "🌴", "🍁", "🍄", "🌻", "🔥", "⚡", "🌈", "☀️"], 
    "衣物配件": ["👗", "👙", "🧥", "👖", "🧢", "🧣", "🧤", "🧦", "👞", "👠"]
};
const generateShadowData = (): ShadowLevel[] => {
    const levels: ShadowLevel[] = [];
    for(let i=0; i<STATIC_SHADOW_SOURCE.length; i++) {
        const target = STATIC_SHADOW_SOURCE[i];
        const options = [target];
        while(options.length < 4) {
            const rand = STATIC_SHADOW_SOURCE[Math.floor(Math.random() * STATIC_SHADOW_SOURCE.length)];
            if(!options.includes(rand)) options.push(rand);
        }
        options.sort(() => 0.5 - Math.random());
        levels.push({ target, options, correctIndex: options.indexOf(target) });
    }
    return levels;
};
export const STATIC_SHADOW_LEVELS = generateShadowData();
export const STATIC_SHADOW_LEVELS_ADVANCED = (() => {
    const levels: ShadowLevel[] = [];
    const source = STATIC_SHADOW_CONFUSING_SETS; // array of arrays
    for(let i=0; i<50; i++) {
        const setIdx = i % source.length;
        const group = source[setIdx];
        const target = group[0];
        const options = [...group];
        options.sort(() => 0.5 - Math.random());
        const selectedOptions = options.slice(0, 4);
        if (!selectedOptions.includes(target)) {
            selectedOptions[Math.floor(Math.random() * 4)] = target;
        }
        levels.push({ target, options: selectedOptions, correctIndex: selectedOptions.indexOf(target) });
    }
    return levels;
})(); 

const EMOTION_BASE_NORMAL = [
  { question: "收到生日禮物時，你會覺得？", emoji: "🎁", options: ["開心", "生氣", "害怕"], correctAnswer: "開心" },
  { question: "不小心跌倒受傷了，可能會覺得？", emoji: "🤕", options: ["興奮", "難過/痛", "驚喜"], correctAnswer: "難過/痛" },
  { question: "看恐怖電影的時候，通常會感到？", emoji: "👻", options: ["無聊", "害怕", "快樂"], correctAnswer: "害怕" },
  { question: "心愛的玩具被弄壞了，你會？", emoji: "💔", options: ["生氣", "開心", "想睡覺"], correctAnswer: "生氣" },
  { question: "明天要去校外教學，心情是？", emoji: "🚌", options: ["期待", "後悔", "悲傷"], correctAnswer: "期待" },
  { question: "這張臉看起來是什麼情緒？", emoji: "😡", options: ["快樂", "生氣", "驚訝"], correctAnswer: "生氣" },
  { question: "這張臉看起來是什麼情緒？", emoji: "😢", options: ["難過", "平靜", "開心"], correctAnswer: "難過" },
  { question: "這張臉看起來是什麼情緒？", emoji: "😱", options: ["想睡", "驚恐", "高興"], correctAnswer: "驚恐" },
  { question: "朋友生病了，你會對他說？", emoji: "🤒", options: ["祝你早日康復", "你好棒", "我也要生病"], correctAnswer: "祝你早日康復" },
  { question: "看到有人跌倒需要幫忙，你應該？", emoji: "🤝", options: ["嘲笑他", "扶他起來", "假裝沒看到"], correctAnswer: "扶他起來" },
  { question: "吃到最喜歡的冰淇淋時，表情是？", emoji: "🍦", options: ["滿足/開心", "痛苦", "生氣"], correctAnswer: "滿足/開心" },
  { question: "外面打雷閃電很大聲，可能會？", emoji: "⛈️", options: ["害怕/驚嚇", "開心", "想睡覺"], correctAnswer: "害怕/驚嚇" },
  { question: "這張臉看起來是什麼情緒？", emoji: "😂", options: ["大笑", "哭泣", "生氣"], correctAnswer: "大笑" },
  { question: "這張臉看起來是什麼情緒？", emoji: "😴", options: ["想睡覺", "興奮", "驚訝"], correctAnswer: "想睡覺" },
  { question: "不想吃青椒，但是媽媽說一定要吃，你會？", emoji: "🫑", options: ["無奈/不情願", "超開心", "害怕"], correctAnswer: "無奈/不情願" },
  { question: "拚好的拼圖被弟弟弄亂了，你會？", emoji: "🧩", options: ["生氣/挫折", "高興", "驚喜"], correctAnswer: "生氣/挫折" },
  { question: "在公園玩盪鞦韆，飛得很高，心情是？", emoji: "🏞️", options: ["興奮/快樂", "難過", "生氣"], correctAnswer: "興奮/快樂" },
  { question: "這張臉看起來是什麼情緒？", emoji: "🤔", options: ["思考/疑惑", "睡覺", "大笑"], correctAnswer: "思考/疑惑" },
  { question: "弄丟了心愛的娃娃，心情是？", emoji: "🧸", options: ["難過/著急", "開心", "興奮"], correctAnswer: "難過/著急" },
  { question: "考了一百分，媽媽稱讚你，你會？", emoji: "💯", options: ["驕傲/開心", "生氣", "害怕"], correctAnswer: "驕傲/開心" }
];
const EMOTION_BASE_ADVANCED = [
    { question: "雖然比賽輸了，但覺得對手很強，這種感覺是？", options: ["佩服/不甘心", "恐懼", "狂喜"], correctAnswer: "佩服/不甘心" },
    { question: "原本不想去參加聚會，結果去了發現很好玩，這是？", options: ["驚喜/改觀", "憤怒", "後悔"], correctAnswer: "驚喜/改觀" },
    { question: "說了謊話怕被發現，心裡七上八下的感覺是？", options: ["焦慮/心虛", "自信", "興奮"], correctAnswer: "焦慮/心虛" },
    { question: "看到朋友受傷，你心裡也覺得痛痛的，這是？", options: ["同理/心疼", "幸災樂禍", "嫉妒"], correctAnswer: "同理/心疼" },
    { question: "好朋友要搬家去很遠的地方，你會感到？", options: ["不捨/失落", "憤怒", "恐懼"], correctAnswer: "不捨/失落" },
    { question: "努力很久的計畫失敗了，但你知道自己盡力了，這是？", options: ["釋懷/遺憾", "狂喜", "羞愧"], correctAnswer: "釋懷/遺憾" },
    { question: "被老師誤會作弊，但是沒人相信你，你會覺得？", options: ["委屈/無助", "驕傲", "期待"], correctAnswer: "委屈/無助" },
    { question: "看到別人遭遇不幸，卻暗自覺得開心，這種不好的心態是？", options: ["幸災樂禍", "同理心", "悲傷"], correctAnswer: "幸災樂禍" },
    { question: "在大家面前講錯話，大家都看著你，你會覺得？", options: ["尷尬/羞愧", "興奮", "憤怒"], correctAnswer: "尷尬/羞愧" },
    { question: "原本以為會被罵，結果爸媽反而安慰你，你會感到？", options: ["如釋重負/感動", "生氣", "失望"], correctAnswer: "如釋重負/感動" },
    { question: "這張臉看起來是什麼情緒？", emoji: "🙄", options: ["無奈/不以為然", "驚喜", "崇拜"], correctAnswer: "無奈/不以為然" },
    { question: "這張臉看起來是什麼情緒？", emoji: "🤔", options: ["思考/質疑", "生氣", "睡著"], correctAnswer: "思考/質疑" },
    { question: "這張臉看起來是什麼情緒？", emoji: "🤥", options: ["心虛/說謊", "自信", "大笑"], correctAnswer: "心虛/說謊" },
    { question: "這張臉看起來是什麼情緒？", emoji: "😒", options: ["鄙視/不高興", "驚喜", "崇拜"], correctAnswer: "鄙視/不高興" },
    { question: "這張臉看起來是什麼情緒？", emoji: "😬", options: ["尷尬/不知所措", "大笑", "睡著"], correctAnswer: "尷尬/不知所措" },
    { question: "這張臉看起來是什麼情緒？", emoji: "😰", options: ["焦慮/緊張冒汗", "開心", "自信"], correctAnswer: "焦慮/緊張冒汗" },
    { question: "這張臉看起來是什麼情緒？", emoji: "😤", options: ["傲慢/固執", "難過", "害怕"], correctAnswer: "傲慢/固執" },
    { question: "這張臉看起來是什麼情緒？", emoji: "😶", options: ["無言/沉默", "興奮", "憤怒"], correctAnswer: "無言/沉默" },
    { question: "這張臉看起來是什麼情緒？", emoji: "🥺", options: ["委屈/請求", "生氣", "自信"], correctAnswer: "委屈/請求" },
    { question: "這張臉看起來是什麼情緒？", emoji: "🤯", options: ["震驚/腦袋爆炸", "平靜", "想睡"], correctAnswer: "震驚/腦袋爆炸" }
];
export const STATIC_EMOTION_LEVELS: EmotionLevel[] = [{"question":"因為玩具壞掉了，妹妹哭了。","emoji":"😭","options":["傷心","開心","生氣"],"correctAnswer":"傷心"},{"question":"收到了最喜歡的生日禮物！","emoji":"😃","options":["開心","害怕","討厭"],"correctAnswer":"開心"},{"question":"弟弟不小心打破了杯子，怕媽媽罵。","emoji":"😰","options":["害怕/緊張","無聊","生氣"],"correctAnswer":"害怕/緊張"},{"question":"在公園玩了一整個下午的溜滑梯。","emoji":"😆","options":["快樂","悲傷","驚訝"],"correctAnswer":"快樂"},{"question":"媽媽答應週末要去動物園玩。","emoji":"🥰","options":["期待/開心","生氣","無聊"],"correctAnswer":"期待/開心"},{"question":"哥哥搶走我的點心，還不還給我。","emoji":"😡","options":["生氣","害怕","開心"],"correctAnswer":"生氣"},{"question":"突然打雷，發出很大聲的巨響。","emoji":"😱","options":["驚嚇/害怕","想睡","驚喜"],"correctAnswer":"驚嚇/害怕"},{"question":"因為下雨，不能去操場上體育課。","emoji":"😞","options":["失望","興奮","無聊"],"correctAnswer":"失望"},{"question":"同學故意把我的筆丟到地上。","emoji":"😠","options":["生氣","開心","難過"],"correctAnswer":"生氣"},{"question":"畫了一張很漂亮的圖，得到老師稱讚。","emoji":"😊","options":["得意/開心","生氣","害怕"],"correctAnswer":"得意/開心"},{"question":"找不到自己心愛的外套，不知道去哪了。","emoji":"😟","options":["著急","開心","想睡"],"correctAnswer":"著急"},{"question":"看到電視上播出最喜歡的卡通。","emoji":"🤩","options":["興奮","傷心","生氣"],"correctAnswer":"興奮"},{"question":"晚上睡覺時聽到奇怪的聲音。","emoji":"😨","options":["害怕","無聊","開心"],"correctAnswer":"害怕"},{"question":"昨天沒睡好，現在一直打哈欠。","emoji":"🥱","options":["想睡","生氣","驚訝"],"correctAnswer":"想睡"},{"question":"不小心跌倒，膝蓋破皮流血了。","emoji":"😭","options":["痛/難過","開心","無奈"],"correctAnswer":"痛/難過"},{"question":"朋友跟我分享好吃的餅乾。","emoji":"😋","options":["開心/想吃","生氣","害怕"],"correctAnswer":"開心/想吃"},{"question":"排隊排了好久，都還沒輪到我。","emoji":"😩","options":["不耐煩","開心","驚訝"],"correctAnswer":"不耐煩"},{"question":"媽媽做了我最討厭吃的青菜。","emoji":"🤢","options":["討厭","開心","害怕"],"correctAnswer":"討厭"},{"question":"忘記帶作業去學校，怕被老師罵。","emoji":"😰","options":["緊張","開心","無聊"],"correctAnswer":"緊張"},{"question":"周末不用上學，可以睡到自然醒。","emoji":"😌","options":["放鬆","生氣","害怕"],"correctAnswer":"放鬆"},{"question":"玩捉迷藏，到現在都沒被找到。","emoji":"🤭","options":["竊喜","難過","生氣"],"correctAnswer":"竊喜"},{"question":"拼圖拼了好久終於完成了。","emoji":"😎","options":["成就感","無聊","害怕"],"correctAnswer":"成就感"},{"question":"看到一隻很大很可怕的蜘蛛。","emoji":"😖","options":["害怕/噁心","開心","期待"],"correctAnswer":"害怕/噁心"},{"question":"同學一直笑我穿的衣服很奇怪。","emoji":"😳","options":["丟臉/難堪","開心","興奮"],"correctAnswer":"丟臉/難堪"},{"question":"大家都在玩，只有我必須寫功課。","emoji":"😒","options":["不公平/委屈","開心","驚訝"],"correctAnswer":"不公平/委屈"},{"question":"知道阿嬤要來我們家住幾天。","emoji":"🥰","options":["期待","生氣","害怕"],"correctAnswer":"期待"},{"question":"今天都沒有安排活動，不知道要做什麼。","emoji":"😑","options":["無聊","開心","生氣"],"correctAnswer":"無聊"},{"question":"打開便當發現是滿滿的炸雞排！","emoji":"😍","options":["驚喜/開心","害怕","討厭"],"correctAnswer":"驚喜/開心"},{"question":"爸爸不守信用，沒帶我去買玩具。","emoji":"😠","options":["生氣","開心","期待"],"correctAnswer":"生氣"},{"question":"在路上看到兩台車撞在一起。","emoji":"😲","options":["驚訝","無聊","開心"],"correctAnswer":"驚訝"},{"question":"不小心把熱水打翻，差點燙到。","emoji":"😱","options":["驚嚇","開心","想睡"],"correctAnswer":"驚嚇"},{"question":"最好的朋友要轉學去很遠的地方了。","emoji":"😢","options":["難過","生氣","驚喜"],"correctAnswer":"難過"},{"question":"我的冰淇淋不小心掉到地上了。","emoji":"😭","options":["傷心","開心","期待"],"correctAnswer":"傷心"},{"question":"贏了比賽，拿到第一名獎牌。","emoji":"🏆","options":["驕傲/開心","無聊","生氣"],"correctAnswer":"驕傲/開心"},{"question":"上台表演，很多人在看著我。","emoji":"🥶","options":["緊張","想睡","驚訝"],"correctAnswer":"緊張"},{"question":"吃到超酸的檸檬。","emoji":"😖","options":["覺得酸","開心","生氣"],"correctAnswer":"覺得酸"},{"question":"這部電影好好笑，笑到肚子痛。","emoji":"🤣","options":["好笑/開心","害怕","無聊"],"correctAnswer":"好笑/開心"},{"question":"自己一個人走在黑漆漆的巷子裡。","emoji":"😨","options":["害怕","開心","生氣"],"correctAnswer":"害怕"},{"question":"期待已久的包裹終於送到了！","emoji":"🤩","options":["興奮","無聊","難過"],"correctAnswer":"興奮"},{"question":"別人不小心踩到了我的腳。","emoji":"😣","options":["覺得痛","開心","驚喜"],"correctAnswer":"覺得痛"},{"question":"把家裡打掃得很乾淨。","emoji":"✨","options":["滿意","害怕","生氣"],"correctAnswer":"滿意"},{"question":"聽不懂老師上課教的數學題。","emoji":"😕","options":["困惑","開心","得意"],"correctAnswer":"困惑"},{"question":"發現自己穿錯兩隻不一樣的襪子出門。","emoji":"🤦","options":["覺得糗","生氣","開心"],"correctAnswer":"覺得糗"},{"question":"不小心惹媽媽生氣了，她都不跟我講話。","emoji":"🥺","options":["內疚/難過","開心","驚喜"],"correctAnswer":"內疚/難過"},{"question":"等車等了半個小時都沒來。","emoji":"😤","options":["不耐煩","開心","害怕"],"correctAnswer":"不耐煩"},{"question":"聞到垃圾桶發出的臭味。","emoji":"🤮","options":["噁心","開心","期待"],"correctAnswer":"噁心"},{"question":"看到有人亂丟垃圾。","emoji":"😒","options":["反感","開心","驚嚇"],"correctAnswer":"反感"},{"question":"玩瘋了停不下來，一直笑。","emoji":"🤪","options":["興奮/瘋狂","難過","生氣"],"correctAnswer":"興奮/瘋狂"},{"question":"被陌生人一直盯著看。","emoji":"🤔","options":["覺得奇怪","開心","無聊"],"correctAnswer":"覺得奇怪"},{"question":"終於把所有暑假作業寫完了！","emoji":"🙌","options":["輕鬆/解脫","難過","生氣"],"correctAnswer":"輕鬆/解脫"}];
export const STATIC_EMOTION_LEVELS_ADVANCED: EmotionLevel[] = [{"question":"辛苦準備很久的比賽，最後卻落選了。","emoji":"😔","options":["沮喪/挫折","驚喜","憤怒"],"correctAnswer":"沮喪/挫折"},{"question":"看見以前霸凌別人的人，現在居然當上模範生。","emoji":"😠","options":["氣憤/不平","喜悅","期待"],"correctAnswer":"氣憤/不平"},{"question":"朋友沒有邀請我去參加他的生日派對。","emoji":"🥺","options":["失落/被排除","驚嚇","無感"],"correctAnswer":"失落/被排除"},{"question":"在大家面前演講時，突然忘記接下來要說什麼。","emoji":"😳","options":["尷尬/窘迫","驕傲","生氣"],"correctAnswer":"尷尬/窘迫"},{"question":"明明不是我做的錯事，老師卻硬要處罰我。","emoji":"🤬","options":["委屈/憤怒","開心","期待"],"correctAnswer":"委屈/憤怒"},{"question":"本來以為考試考很差，結果竟然滿分！","emoji":"🤯","options":["震驚/難以置信","平靜","想睡"],"correctAnswer":"震驚/難以置信"},{"question":"幫別人保守的秘密，卻聽別人說他到處亂講我的壞話。","emoji":"💔","options":["背叛/心寒","開心","無聊"],"correctAnswer":"背叛/心寒"},{"question":"獨自搬到沒有認識的人的新城市生活。","emoji":"😟","options":["孤單/傍徨","狂喜","憤怒"],"correctAnswer":"孤單/傍徨"},{"question":"看到別人遇到困難，主動上前幫忙解決了。","emoji":"😇","options":["欣慰/助人為樂","嫉妒","害怕"],"correctAnswer":"欣慰/助人為樂"},{"question":"發現自己一直以來都誤會了一個好朋友。","emoji":"😔","options":["自責/懊悔","驚喜","生氣"],"correctAnswer":"自責/懊悔"},{"question":"花了幾千塊買的東西，隔天馬上半價促銷。","emoji":"🤦‍♂️","options":["扼腕/吃虧","開心","期待"],"correctAnswer":"扼腕/吃虧"},{"question":"聽到別人用不雅的字眼辱罵我的家人。","emoji":"😡","options":["暴怒/無法忍受","無聊","驚訝"],"correctAnswer":"暴怒/無法忍受"},{"question":"好朋友交了新朋友後，就常常冷落我。","emoji":"😒","options":["吃醋/不是滋味","狂喜","驚嚇"],"correctAnswer":"吃醋/不是滋味"},{"question":"看了一部結局非常感人又悲傷的電影。","emoji":"😭","options":["感動/鼻酸","無聊","生氣"],"correctAnswer":"感動/鼻酸"},{"question":"發現自己中了頭獎彩券。","emoji":"🤩","options":["狂喜","平靜","難過"],"correctAnswer":"狂喜"},{"question":"在路上遇到以前暗戀過的對象。","emoji":"🫣","options":["緬靦/不知所措","生氣","無聊"],"correctAnswer":"緬靦/不知所措"},{"question":"聽說下周公司可能會裁員。","emoji":"😰","options":["忐忑不安","開心","疲倦"],"correctAnswer":"忐忑不安"},{"question":"完成了一個極度危險且困難的極限挑戰。","emoji":"😤","options":["如釋重負/痛快","害怕","悲傷"],"correctAnswer":"如釋重負/痛快"},{"question":"看到新聞上播報虐待動物的案件。","emoji":"😡","options":["義憤填膺","高興","無聊"],"correctAnswer":"義憤填膺"},{"question":"每天重複一樣的工作，覺得好像看不到未來。","emoji":"😮‍💨","options":["倦怠/迷惘","開心","驚嚇"],"correctAnswer":"倦怠/迷惘"},{"question":"一直努力減肥，站上體重計卻發現變胖了。","emoji":"😫","options":["崩潰/無力","開心","期待"],"correctAnswer":"崩潰/無力"},{"question":"父母一直拿我跟別人成績好的孩子比較。","emoji":"🙄","options":["厭煩","期待","平靜"],"correctAnswer":"厭煩"},{"question":"知道自己最喜歡的樂團要解散了。","emoji":"💔","options":["心碎/惋惜","開心","憤怒"],"correctAnswer":"心碎/惋惜"},{"question":"本來說好一起出遊的朋友，當天卻放鴿子。","emoji":"💢","options":["火大/被敷衍","高興","驚喜"],"correctAnswer":"火大/被敷衍"},{"question":"收到一封來路不明又語帶恐嚇的簡訊。","emoji":"😨","options":["毛骨悚然","開心","放鬆"],"correctAnswer":"毛骨悚然"},{"question":"別人在我背後指指點點，不知道在笑什麼。","emoji":"🤨","options":["猜疑/不自在","開心","感動"],"correctAnswer":"猜疑/不自在"},{"question":"在很安靜的高級餐廳不小心打了一個大嗝。","emoji":"🫠","options":["社死/羞愧","自豪","生氣"],"correctAnswer":"社死/羞愧"},{"question":"發現另一半偷偷看我的手機訊息。","emoji":"😠","options":["不受尊重/不滿","開心","無感"],"correctAnswer":"不受尊重/不滿"},{"question":"看到別人拿到因為特權而得到的升職機會。","emoji":"😒","options":["不平/鄙視","開心","期待"],"correctAnswer":"不平/鄙視"},{"question":"把一個非常複雜的電腦程式成功寫出來並順利運行。","emoji":"😎","options":["充滿成就感","無聊","生氣"],"correctAnswer":"充滿成就感"},{"question":"在外地工作生病了，自己一個人在租屋處吃藥。","emoji":"🥺","options":["心酸/思鄉","高興","期待"],"correctAnswer":"心酸/思鄉"},{"question":"發現自己已經忘記怎麼彈以前很熟練的鋼琴曲。","emoji":"😔","options":["遺憾/失落","開心","驕傲"],"correctAnswer":"遺憾/失落"},{"question":"朋友一直炫耀他新買的昂貴名牌包。","emoji":"🙄","options":["無言/反感","開心","期待"],"correctAnswer":"無言/反感"},{"question":"在很深的水裡游泳，腳突然抽筋。","emoji":"😱","options":["恐慌/生死交關","開心","無聊"],"correctAnswer":"恐慌/生死交關"},{"question":"突然被上司在會議上狠狠地誇獎了一番。","emoji":"😳","options":["受寵若驚","生氣","無聊"],"correctAnswer":"受寵若驚"},{"question":"聽到一件跟我完全無關，但很勁爆的八卦。","emoji":"🤭","options":["好奇/吃瓜","生氣","傷心"],"correctAnswer":"好奇/吃瓜"},{"question":"不小心把熱咖啡灑在面試要穿的白襯衫上。","emoji":"🤬","options":["氣急敗壞","開心","平靜"],"correctAnswer":"氣急敗壞"},{"question":"一直教同一件小事，對方還是聽不懂。","emoji":"😤","options":["抓狂/失去耐性","開心","期待"],"correctAnswer":"抓狂/失去耐性"},{"question":"發現自己相信很久的訊息原來是假新聞。","emoji":"🤡","options":["覺得自己像笨蛋","驕傲","開心"],"correctAnswer":"覺得自己像笨蛋"},{"question":"在森林裡迷路，天色漸漸變暗了。","emoji":"😰","options":["驚惶失措","無聊","開心"],"correctAnswer":"驚惶失措"},{"question":"終於還清了所有的貸款。","emoji":"🕊️","options":["如釋重負","難過","生氣"],"correctAnswer":"如釋重負"},{"question":"看到自己養了很久的植物終於開花。","emoji":"🥹","options":["感動/欣慰","無聊","害怕"],"correctAnswer":"感動/欣慰"},{"question":"別人把我的功勞攬在自己身上去領賞。","emoji":"😡","options":["忿忿不平","高興","期待"],"correctAnswer":"忿忿不平"},{"question":"和許久未見的知心老友聊了一整個下午。","emoji":"😌","options":["充實/溫馨","生氣","擔心"],"correctAnswer":"充實/溫馨"},{"question":"走在路上突然被一隻狗追著叫。","emoji":"😨","options":["受到驚嚇","開心","期待"],"correctAnswer":"受到驚嚇"},{"question":"覺得這個世界沒有人了解我。","emoji":"🫥","options":["孤立無援","開心","得意"],"correctAnswer":"孤立無援"},{"question":"不管怎麼努力，事情依然沒有好轉的跡象。","emoji":"😩","options":["深深的無力感","興奮","開心"],"correctAnswer":"深深的無力感"},{"question":"經過一整天的奔波，終於躺在自己的床上。","emoji":"🫠","options":["癱軟/極度放鬆","生氣","緊張"],"correctAnswer":"癱軟/極度放鬆"},{"question":"買了網購產品，打開卻發現有瑕疵。","emoji":"😒","options":["掃興","開心","驚喜"],"correctAnswer":"掃興"},{"question":"知道明天一定會下大雨，但還是必須出差。","emoji":"😮‍💨","options":["無奈","興奮","期待"],"correctAnswer":"無奈"}];

const generatePatterns = (count: number, difficulty: 'NORMAL' | 'ADVANCED'): PatternLevel[] => {
    const levels: PatternLevel[] = [];
    const maxTries = count * 10;
    let tries = 0;
    
    while(levels.length < count && tries < maxTries) {
        tries++;
        let sequence: string[];
        let options: string[];
        let answer: string;
        
        if (difficulty === 'NORMAL') {
            const symbols = ["🍎", "🍌", "🍇", "🍊", "🐶", "🐱", "🐰", "🦊", "🔴", "🔵", "🟢", "🟡", "🚗", "🚀", "✈️", "⚽", "🏀", "🎾", "🌭", "🍔"];
            const [s1, s2, s3, s4] = symbols.sort(() => 0.5 - Math.random()).slice(0, 4);
            const type = Math.random();
            if (type < 0.25) {
                sequence = [s1, s2, s1, "?"];
                answer = s2;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            } else if (type < 0.5) {
                sequence = [s1, s1, s2, "?"];
                answer = s2;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            } else if (type < 0.75) {
                sequence = [s1, s2, s3, s1, "?"];
                answer = s2;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            } else {
                sequence = [s1, s2, s1, s2, s3, "?"];
                answer = s3;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            }
        } else {
             if (Math.random() > 0.5) {
                const start = Math.floor(Math.random() * 20);
                const step = (Math.floor(Math.random() * 5) + 1);
                sequence = [start.toString(), (start+step).toString(), (start+step*2).toString(), "?"];
                answer = (start+step*3).toString();
                options = [answer, (start+step*3+1).toString(), (start+step*3-1).toString(), (start+step*3+2).toString()].sort(() => 0.5 - Math.random()).slice(0,3);
             } else {
                const dirs = ["⬆️", "➡️", "⬇️", "⬅️"];
                const startIdx = Math.floor(Math.random() * 4);
                const shift = Math.random() > 0.5 ? 1 : 3; // +1 or -1
                sequence = [dirs[startIdx], dirs[(startIdx+shift)%4], dirs[(startIdx+shift*2)%4], "?"];
                answer = dirs[(startIdx+shift*3)%4];
                options = [answer, dirs[(startIdx+shift)%4], dirs[startIdx], dirs[(startIdx+shift*2)%4]].sort(() => 0.5 - Math.random()).slice(0, 3);
                if (!options.includes(answer)) {
                    options[0] = answer;
                    options = options.sort(() => 0.5 - Math.random());
                }
             }
        }
        
        const isDup = levels.some(l => l.sequence.join(',') === sequence.join(',') || l.sequence.join(',') === sequence.join(','));
        if (!isDup && options.includes(answer)) {
            levels.push({ sequence, options, answer });
        }
    }
    return levels;
};

export const STATIC_PATTERN_LEVELS = generatePatterns(100, 'NORMAL');
export const STATIC_PATTERN_LEVELS_ADVANCED = generatePatterns(100, 'ADVANCED');

const generateTimeLevels = (count: number, difficulty: 'NORMAL' | 'ADVANCED'): TimeLevel[] => {
    const levels: TimeLevel[] = [];
    const used = new Set<string>();
    let attempts = 0;
    while(levels.length < count && attempts < 10000) {
        attempts++;
        if (difficulty === 'NORMAL') {
             const h = Math.floor(Math.random() * 12) + 1;
             const m = Math.floor(Math.random() * 6) * 10;
             const timeStr = `${h}:${m === 0 ? '00' : m}`;
             if (used.has(timeStr)) continue;
             used.add(timeStr);

             const d1 = `${(h%12)+1}:${m === 0 ? '00' : m}`;
             const d2 = `${h}:${m === 30 ? '00' : '30'}`;
             const options = [timeStr, d1, d2].sort(() => 0.5 - Math.random());
             levels.push({
                 type: 'CLOCK',
                 question: "請問時鐘是幾點幾分？",
                 clockTime: {hour: h, minute: m},
                 options,
                 correctAnswer: timeStr
             });
        } else {
             if (Math.random() > 0.5) {
                 const h = Math.floor(Math.random() * 12) + 1;
                 const m = Math.floor(Math.random() * 60);
                 const timeStr = `${h}:${m.toString().padStart(2, '0')}`;
                 if (used.has(timeStr)) continue;
                 used.add(timeStr);

                 const mOffset = (m + (Math.floor(Math.random() * 20)+10)) % 60;
                 const d1 = `${(h%12)+1}:${m.toString().padStart(2, '0')}`;
                 const d2 = `${h}:${mOffset.toString().padStart(2, '0')}`;
                 const options = [timeStr, d1, d2].sort(() => 0.5 - Math.random());
                 levels.push({
                     type: 'CLOCK',
                     question: "現在幾點幾分？",
                     clockTime: {hour: h, minute: m},
                     options,
                     correctAnswer: timeStr
                 });
             } else {
                 const h = Math.floor(Math.random() * 10) + 1;
                 const add = Math.floor(Math.random() * 5) + 1;
                 const q = `現在是 ${h}點，${add}小時後是幾點？`;
                 if (used.has(q)) continue;
                 used.add(q);

                 const ans = `${h+add}點`;
                 const d1 = `${h+add+1}點`;
                 const d2 = `${h+add-1}點`;
                 const options = [ans, d1, d2].sort(() => 0.5 - Math.random());
                 levels.push({type: 'MATH', question: q, options, correctAnswer: ans});
             }
        }
    }
    return levels;
};
export const STATIC_TIME_LEVELS = generateTimeLevels(50, 'NORMAL');
export const STATIC_TIME_LEVELS_ADVANCED = generateTimeLevels(50, 'ADVANCED');



// --- ODD ONE OUT - Massive Expansion ---
// Helpers for ODD ONE
const createOddOne = (items: {text:string, icon:string}[], correctIdx: number, reason: string): OddOneLevel => ({
    items, correctIndex: correctIdx, reason
});

const ODD_ONE_NORMAL_POOL: OddOneLevel[] = [
    // Animals vs Others
    createOddOne([{text:"貓", icon:"🐱"}, {text:"狗", icon:"🐶"}, {text:"兔子", icon:"🐰"}, {text:"杯子", icon:"☕"}], 3, "杯子不是動物"),
    createOddOne([{text:"蘋果", icon:"🍎"}, {text:"香蕉", icon:"🍌"}, {text:"車子", icon:"🚗"}, {text:"葡萄", icon:"🍇"}], 2, "車子不是水果"),
    createOddOne([{text:"飛機", icon:"✈️"}, {text:"小鳥", icon:"🐦"}, {text:"蝴蝶", icon:"🦋"}, {text:"大象", icon:"🐘"}], 3, "大象不會飛"),
    createOddOne([{text:"魚", icon:"🐟"}, {text:"蝦子", icon:"🦐"}, {text:"螃蟹", icon:"🦀"}, {text:"公雞", icon:"🐓"}], 3, "公雞不在水裡游"),
    // Colors/Shapes
    createOddOne([{text:"紅色", icon:"🟥"}, {text:"藍色", icon:"🟦"}, {text:"綠色", icon:"🟩"}, {text:"太陽", icon:"☀️"}], 3, "太陽不是顏色"),
    createOddOne([{text:"圓形", icon:"🔵"}, {text:"三角形", icon:"🔺"}, {text:"正方形", icon:"🔲"}, {text:"香蕉", icon:"🍌"}], 3, "香蕉是食物"),
    // Body Parts
    createOddOne([{text:"眼睛", icon:"👁️"}, {text:"鼻子", icon:"👃"}, {text:"耳朵", icon:"👂"}, {text:"足球", icon:"⚽"}], 3, "足球不是五官"),
    createOddOne([{text:"手", icon:"✋"}, {text:"腳", icon:"🦶"}, {text:"嘴巴", icon:"👄"}, {text:"襪子", icon:"🧦"}], 3, "襪子是穿的"),
    // Vehicles
    createOddOne([{text:"汽車", icon:"🚗"}, {text:"公車", icon:"🚌"}, {text:"計程車", icon:"🚕"}, {text:"房子", icon:"🏠"}], 3, "房子不能開"),
    createOddOne([{text:"船", icon:"🚢"}, {text:"獨木舟", icon:"🛶"}, {text:"遊艇", icon:"🛥️"}, {text:"火車", icon:"🚂"}], 3, "火車不在水上"),
    // Furniture/House
    createOddOne([{text:"沙發", icon:"🛋️"}, {text:"床", icon:"🛏️"}, {text:"椅子", icon:"🪑"}, {text:"樹", icon:"🌳"}], 3, "樹是植物"),
    createOddOne([{text:"電視", icon:"📺"}, {text:"冰箱", icon:"🧊"}, {text:"洗衣機", icon:"🧺"}, {text:"蘋果", icon:"🍎"}], 3, "蘋果不是電器"),
    // Clothing
    createOddOne([{text:"上衣", icon:"👕"}, {text:"褲子", icon:"👖"}, {text:"裙子", icon:"👗"}, {text:"牙刷", icon:"🪥"}], 3, "牙刷是刷牙用的"),
    createOddOne([{text:"鞋子", icon:"👟"}, {text:"襪子", icon:"🧦"}, {text:"拖鞋", icon:"🩴"}, {text:"手套", icon:"🧤"}], 3, "手套戴在手上，其他穿在腳上"),
    // Food
    createOddOne([{text:"漢堡", icon:"🍔"}, {text:"薯條", icon:"🍟"}, {text:"披薩", icon:"🍕"}, {text:"盤子", icon:"🍽️"}], 3, "盤子不能吃"),
    createOddOne([{text:"牛奶", icon:"🥛"}, {text:"果汁", icon:"🧃"}, {text:"水", icon:"💧"}, {text:"麵包", icon:"🍞"}], 3, "麵包是吃的，其他是喝的"),
    // Weather/Nature
    createOddOne([{text:"下雨", icon:"🌧️"}, {text:"下雪", icon:"🌨️"}, {text:"陰天", icon:"☁️"}, {text:"雨傘", icon:"☂️"}], 3, "雨傘是用具，其他是天氣"),
    createOddOne([{text:"花", icon:"🌸"}, {text:"草", icon:"🌿"}, {text:"樹", icon:"🌲"}, {text:"石頭", icon:"🪨"}], 3, "石頭不是植物"),
    // School
    createOddOne([{text:"鉛筆", icon:"✏️"}, {text:"橡皮擦", icon:"🧹"}, {text:"尺", icon:"📏"}, {text:"糖果", icon:"🍬"}], 3, "糖果是食物"),
    createOddOne([{text:"書包", icon:"🎒"}, {text:"課本", icon:"📖"}, {text:"筆記本", icon:"📒"}, {text:"枕頭", icon:"🛌"}], 3, "枕頭是用來睡覺的"),
    // Sports
    createOddOne([{text:"籃球", icon:"🏀"}, {text:"足球", icon:"⚽"}, {text:"棒球", icon:"⚾"}, {text:"西瓜", icon:"🍉"}], 3, "西瓜是水果"),
    // Jobs
    createOddOne([{text:"醫生", icon:"👨‍⚕️"}, {text:"護理師", icon:"👩‍⚕️"}, {text:"警察", icon:"👮"}, {text:"病人", icon:"🤒"}], 3, "病人是生病的人"),
    // Tools
    createOddOne([{text:"鐵鎚", icon:"🔨"}, {text:"螺絲起子", icon:"🪛"}, {text:"扳手", icon:"🔧"}, {text:"湯匙", icon:"🥄"}], 3, "湯匙是餐具"),
    // Electronics
    createOddOne([{text:"手機", icon:"📱"}, {text:"電腦", icon:"💻"}, {text:"平板", icon:"📟"}, {text:"報紙", icon:"📰"}], 3, "報紙不是電子產品"),
    // Kitchen
    createOddOne([{text:"鍋子", icon:"🍳"}, {text:"碗", icon:"🥣"}, {text:"盤子", icon:"🍽️"}, {text:"籃球", icon:"🏀"}], 3, "籃球是運動用品"),
];

const ODD_ONE_ADVANCED_POOL: OddOneLevel[] = [
    // Abstract/Function
    createOddOne([{text:"籃球", icon:"🏀"}, {text:"足球", icon:"⚽"}, {text:"排球", icon:"🏐"}, {text:"橄欖球", icon:"🏉"}], 3, "橄欖球不是圓的"),
    createOddOne([{text:"夏天", icon:"🏖️"}, {text:"冬天", icon:"⛄"}, {text:"雨天", icon:"🌧️"}, {text:"秋天", icon:"🍂"}], 2, "雨天是天氣狀況，其他是季節"),
    createOddOne([{text:"鉛筆", icon:"✏️"}, {text:"原子筆", icon:"🖊️"}, {text:"彩色筆", icon:"🖍️"}, {text:"尺", icon:"📏"}], 3, "尺是用來測量的，其他是寫字的"),
    createOddOne([{text:"醫生", icon:"👨‍⚕️"}, {text:"護理師", icon:"👩‍⚕️"}, {text:"病人", icon:"🤒"}, {text:"藥師", icon:"💊"}], 2, "病人是被照顧者，其他是醫療人員"),
    createOddOne([{text:"手機", icon:"📱"}, {text:"電腦", icon:"💻"}, {text:"電視", icon:"📺"}, {text:"信紙", icon:"📄"}], 3, "信紙不需要電"),
    createOddOne([{text:"吉他", icon:"🎸"}, {text:"小提琴", icon:"🎻"}, {text:"烏克麗麗", icon:"🪕"}, {text:"長笛", icon:"🪈"}], 3, "長笛是管樂器(用吹的)，其他是弦樂器"),
    createOddOne([{text:"草莓", icon:"🍓"}, {text:"蘋果", icon:"🍎"}, {text:"櫻桃", icon:"🍒"}, {text:"檸檬", icon:"🍋"}], 3, "檸檬是黃色的，其他是紅色的"),
    createOddOne([{text:"鯨魚", icon:"🐋"}, {text:"海豚", icon:"🐬"}, {text:"海豹", icon:"🦭"}, {text:"鯊魚", icon:"🦈"}], 3, "鯊魚是魚類，其他是哺乳類"),
    createOddOne([{text:"直升機", icon:"🚁"}, {text:"飛機", icon:"✈️"}, {text:"熱氣球", icon:"🎈"}, {text:"風箏", icon:"🪁"}], 3, "風箏不能載人"),
    createOddOne([{text:"太陽", icon:"☀️"}, {text:"燈泡", icon:"💡"}, {text:"蠟燭", icon:"🕯️"}, {text:"鏡子", icon:"🪞"}], 3, "鏡子不會發光"),
    createOddOne([{text:"冰塊", icon:"🧊"}, {text:"冰淇淋", icon:"🍦"}, {text:"雪", icon:"❄️"}, {text:"熱湯", icon:"🍲"}], 3, "熱湯是熱的"),
    createOddOne([{text:"跑步", icon:"🏃"}, {text:"游泳", icon:"🏊"}, {text:"騎車", icon:"🚴"}, {text:"睡覺", icon:"🛌"}], 3, "睡覺是休息，其他是運動"),
    createOddOne([{text:"米飯", icon:"🍚"}, {text:"麵條", icon:"🍜"}, {text:"麵包", icon:"🍞"}, {text:"雞腿", icon:"🍗"}], 3, "雞腿是肉類，其他是澱粉主食"),
    createOddOne([{text:"紅色", icon:"🟥"}, {text:"黃色", icon:"🟨"}, {text:"藍色", icon:"🟦"}, {text:"透明", icon:"🫗"}], 3, "透明不是顏色"),
    createOddOne([{text:"剪刀", icon:"✂️"}, {text:"菜刀", icon:"🔪"}, {text:"美工刀", icon:"🗡️"}, {text:"湯匙", icon:"🥄"}], 3, "湯匙沒有刀刃"),
    createOddOne([{text:"眼睛", icon:"👁️"}, {text:"眼鏡", icon:"👓"}, {text:"隱形眼鏡", icon:"🧿"}, {text:"墨鏡", icon:"🕶️"}], 0, "眼睛是器官，其他是用品"),
    createOddOne([{text:"車子", icon:"🚗"}, {text:"汽油", icon:"⛽"}, {text:"輪胎", icon:"🛞"}, {text:"方向盤", icon:"⭕"}], 0, "車子是整體，其他是零件/燃料"),
    createOddOne([{text:"蝴蝶", icon:"🦋"}, {text:"蜜蜂", icon:"🐝"}, {text:"蜻蜓", icon:"蜻"}, {text:"蜘蛛", icon:"🕷️"}], 3, "蜘蛛有8隻腳(蛛形綱)，其他是昆蟲(6隻腳)"),
    createOddOne([{text:"正方形", icon:"🟥"}, {text:"長方形", icon:"▭"}, {text:"三角形", icon:"🔺"}, {text:"圓形", icon:"🔵"}], 3, "圓形沒有角"),
    createOddOne([{text:"今天", icon:"📅"}, {text:"明天", icon:"🗓️"}, {text:"昨天", icon:"📆"}, {text:"晴天", icon:"☀️"}], 3, "晴天是天氣，其他是時間"),
    createOddOne([{text:"加法", icon:"➕"}, {text:"減法", icon:"➖"}, {text:"乘法", icon:"✖️"}, {text:"書法", icon:"🖌️"}], 3, "書法是藝術，其他是數學運算"),
    createOddOne([{text:"中文", icon:"🇹🇼"}, {text:"英文", icon:"🇺🇸"}, {text:"日文", icon:"🇯🇵"}, {text:"天文", icon:"🔭"}], 3, "天文是科學，其他是語言"),
    createOddOne([{text:"開心", icon:"😄"}, {text:"快樂", icon:"🥳"}, {text:"興奮", icon:"🤩"}, {text:"生氣", icon:"😡"}], 3, "生氣是負面情緒，其他是正面的"),
    createOddOne([{text:"種子", icon:"🌰"}, {text:"發芽", icon:"🌱"}, {text:"開花", icon:"🌸"}, {text:"澆水", icon:"🚿"}], 3, "澆水是動作，其他是植物生長過程"),
    createOddOne([{text:"電風扇", icon:"🌬️"}, {text:"冷氣", icon:"❄️"}, {text:"扇子", icon:"🪭"}, {text:"吹風機", icon:"💨"}], 3, "吹風機吹出的是熱風(通常)，其他是用來降溫"),
  createOddOne([{text: "", icon: "🚗"},{text: "", icon: "🚕"},{text: "", icon: "🏎️"},{text: "", icon: "🚲"}], 3, "只有單車沒有引擎"),
  createOddOne([{text: "", icon: "🐶"},{text: "", icon: "🐱"},{text: "", icon: "🐭"},{text: "", icon: "🐦"}], 3, "只有小鳥有羽毛/會飛"),
  createOddOne([{text: "", icon: "🍎"},{text: "", icon: "🍌"},{text: "", icon: "🍊"},{text: "", icon: "🥦"}], 3, "花椰菜是蔬菜"),
  createOddOne([{text: "", icon: "👕"},{text: "", icon: "👖"},{text: "", icon: "👗"},{text: "", icon: "🎒"}], 3, "背包不是穿在身上的衣服"),
  createOddOne([{text: "", icon: "🏀"},{text: "", icon: "⚽"},{text: "", icon: "🏐"},{text: "", icon: "🏸"}], 3, "只有羽毛球不是圓的"),
  createOddOne([{text: "", icon: "🥛"},{text: "", icon: "☕"},{text: "", icon: "🍵"},{text: "", icon: "🍔"}], 3, "漢堡是吃的"),
  createOddOne([{text: "", icon: "🎸"},{text: "", icon: "🎻"},{text: "", icon: "🎹"},{text: "", icon: "🥁"}], 3, "只有鼓不是用弦發聲的"),
  createOddOne([{text: "", icon: "✈️"},{text: "", icon: "🚁"},{text: "", icon: "🚀"},{text: "", icon: "🚲"}], 3, "只有單車不能飛"),
  createOddOne([{text: "", icon: "🌞"},{text: "", icon: "⭐"},{text: "", icon: "🌙"},{text: "", icon: "☁️"}], 3, "只有雲沒有發亮"),
  createOddOne([{text: "", icon: "🚪"},{text: "", icon: "🪟"},{text: "", icon: "🪑"},{text: "", icon: "📺"}], 3, "只有電視需要插電"),
  createOddOne([{text: "", icon: "🍓"},{text: "", icon: "🍒"},{text: "", icon: "🍉"},{text: "", icon: "🍋"}], 3, "只有檸檬很酸"),
  createOddOne([{text: "", icon: "🚌"},{text: "", icon: "🚑"},{text: "", icon: "🚓"},{text: "", icon: "🚕"}], 0, "只有公車是大眾運輸"),
  createOddOne([{text: "", icon: "🐟"},{text: "", icon: "🦀"},{text: "", icon: "🦐"},{text: "", icon: "🐶"}], 3, "只有狗生活在陸地上"),
  createOddOne([{text: "", icon: "👓"},{text: "", icon: "🕶️"},{text: "", icon: "🥽"},{text: "", icon: "🧣"}], 3, "圍巾不是戴在眼睛上"),
  createOddOne([{text: "", icon: "🌧️"},{text: "", icon: "🌩️"},{text: "", icon: "🌨️"},{text: "", icon: "☀️"}], 3, "只有太陽是好天氣"),
  createOddOne([{text: "", icon: "✂️"},{text: "", icon: "🔪"},{text: "", icon: "🗡️"},{text: "", icon: "🥄"}], 3, "只有湯匙沒辦法切東西"),
  createOddOne([{text: "", icon: "🖊️"},{text: "", icon: "✏️"},{text: "", icon: "🖍️"},{text: "", icon: "📖"}], 3, "書本不是用來寫字的筆"),
  createOddOne([{text: "", icon: "🦋"},{text: "", icon: "🐝"},{text: "", icon: "🐞"},{text: "", icon: "🐛"}], 3, "毛毛蟲還不會飛"),
  createOddOne([{text: "", icon: "🪑"},{text: "", icon: "🛋️"},{text: "", icon: "🛏️"},{text: "", icon: "🚪"}], 3, "門不是用來坐躺的"),
  createOddOne([{text: "", icon: "🎸"},{text: "", icon: "🎺"},{text: "", icon: "🎷"},{text: "", icon: "🥁"}], 0, "吉他不是用吹的或敲的(弦樂器)"),
  createOddOne([{text: "", icon: "🍎"},{text: "", icon: "🍅"},{text: "", icon: "🌶️"},{text: "", icon: "🥒"}], 3, "小黃瓜不是紅色的"),
  createOddOne([{text: "", icon: "🐯"},{text: "", icon: "🦁"},{text: "", icon: "🐆"},{text: "", icon: "🐰"}], 3, "只有兔子是草食溫馴的"),
  createOddOne([{text: "", icon: "🛫"},{text: "", icon: "🚢"},{text: "", icon: "🛥️"},{text: "", icon: "🛶"}], 0, "只有飛機在天上"),
  createOddOne([{text: "", icon: "👦"},{text: "", icon: "👧"},{text: "", icon: "👶"},{text: "", icon: "👴"}], 2, "只有嬰兒還不會走"),
  createOddOne([{text: "", icon: "📱"},{text: "", icon: "💻"},{text: "", icon: "🖥️"},{text: "", icon: "🗞️"}], 3, "報紙不是電子產品"),
  createOddOne([{text: "", icon: "🌺"},{text: "", icon: "🌻"},{text: "", icon: "🌹"},{text: "", icon: "🌲"}], 3, "松樹不開鮮豔的花"),
];


const additionalNormal = [
    createOddOne([{text: "", icon: "🚗"},{text: "", icon: "🚕"},{text: "", icon: "🏎️"},{text: "", icon: "🚲"}], 3, "只有單車沒有引擎"),
    createOddOne([{text: "", icon: "🐶"},{text: "", icon: "🐱"},{text: "", icon: "🐭"},{text: "", icon: "🐦"}], 3, "只有小鳥有羽毛/會飛"),
    createOddOne([{text: "", icon: "🍎"},{text: "", icon: "🍌"},{text: "", icon: "🍊"},{text: "", icon: "🥦"}], 3, "花椰菜是蔬菜"),
    createOddOne([{text: "", icon: "👕"},{text: "", icon: "👖"},{text: "", icon: "👗"},{text: "", icon: "🎒"}], 3, "背包不是穿在身上的衣服"),
    createOddOne([{text: "", icon: "🏀"},{text: "", icon: "⚽"},{text: "", icon: "🏐"},{text: "", icon: "🏸"}], 3, "只有羽毛球不是圓的"),
    createOddOne([{text: "", icon: "🥛"},{text: "", icon: "☕"},{text: "", icon: "🍵"},{text: "", icon: "🍔"}], 3, "漢堡是吃的"),
    createOddOne([{text: "", icon: "🎸"},{text: "", icon: "🎻"},{text: "", icon: "🎹"},{text: "", icon: "🥁"}], 3, "只有鼓不是用弦發聲的"),
    createOddOne([{text: "", icon: "✈️"},{text: "", icon: "🚁"},{text: "", icon: "🚀"},{text: "", icon: "🚲"}], 3, "只有單車不能飛"),
    createOddOne([{text: "", icon: "🌞"},{text: "", icon: "⭐"},{text: "", icon: "🌙"},{text: "", icon: "☁️"}], 3, "只有雲沒有發亮"),
    createOddOne([{text: "", icon: "🚪"},{text: "", icon: "🪟"},{text: "", icon: "🪑"},{text: "", icon: "📺"}], 3, "只有電視需要插電"),
    createOddOne([{text: "", icon: "🍓"},{text: "", icon: "🍒"},{text: "", icon: "🍉"},{text: "", icon: "🍋"}], 3, "只有檸檬很酸"),
    createOddOne([{text: "", icon: "🚌"},{text: "", icon: "🚑"},{text: "", icon: "🚓"},{text: "", icon: "🚕"}], 0, "只有公車是大眾運輸"),
    createOddOne([{text: "", icon: "🐟"},{text: "", icon: "🦀"},{text: "", icon: "🦐"},{text: "", icon: "🐶"}], 3, "只有狗生活在陸地上"),
    createOddOne([{text: "", icon: "👓"},{text: "", icon: "🕶️"},{text: "", icon: "🥽"},{text: "", icon: "🧣"}], 3, "圍巾不是戴在眼睛上"),
    createOddOne([{text: "", icon: "🌧️"},{text: "", icon: "🌩️"},{text: "", icon: "🌨️"},{text: "", icon: "☀️"}], 3, "只有太陽是好天氣"),
    createOddOne([{text: "", icon: "✂️"},{text: "", icon: "🔪"},{text: "", icon: "🗡️"},{text: "", icon: "🥄"}], 3, "只有湯匙沒辦法切東西"),
    createOddOne([{text: "", icon: "🖊️"},{text: "", icon: "✏️"},{text: "", icon: "🖍️"},{text: "", icon: "📖"}], 3, "書本不是用來寫字的筆"),
    createOddOne([{text: "", icon: "🦋"},{text: "", icon: "🐝"},{text: "", icon: "🐞"},{text: "", icon: "🐛"}], 3, "毛毛蟲還不會飛"),
    createOddOne([{text: "", icon: "🪑"},{text: "", icon: "🛋️"},{text: "", icon: "🛏️"},{text: "", icon: "🚪"}], 3, "門不是用來坐躺的"),
    createOddOne([{text: "", icon: "🎸"},{text: "", icon: "🎺"},{text: "", icon: "🎷"},{text: "", icon: "🥁"}], 0, "吉他不是用吹的或敲的(弦樂器)"),
    createOddOne([{text: "", icon: "🍎"},{text: "", icon: "🍅"},{text: "", icon: "🌶️"},{text: "", icon: "🥒"}], 3, "小黃瓜不是紅色的"),
    createOddOne([{text: "", icon: "🐯"},{text: "", icon: "🦁"},{text: "", icon: "🐆"},{text: "", icon: "🐰"}], 3, "只有兔子是草食溫馴的"),
    createOddOne([{text: "", icon: "🛫"},{text: "", icon: "🚢"},{text: "", icon: "🛥️"},{text: "", icon: "🛶"}], 0, "只有飛機在天上"),
    createOddOne([{text: "", icon: "👦"},{text: "", icon: "👧"},{text: "", icon: "👶"},{text: "", icon: "👴"}], 2, "只有嬰兒還不會走"),
    createOddOne([{text: "", icon: "📱"},{text: "", icon: "💻"},{text: "", icon: "🖥️"},{text: "", icon: "🗞️"}], 3, "報紙不是電子產品"),
    createOddOne([{text: "", icon: "🌺"},{text: "", icon: "🌻"},{text: "", icon: "🌹"},{text: "", icon: "🌲"}], 3, "松樹不開鮮豔的花")
];

const additionalAdv = [
    createOddOne([{text: "0", icon: ""},{text: "8", icon: ""},{text: "6", icon: ""},{text: "3", icon: ""}], 3, "只有3沒有封閉的圈圈"),
    createOddOne([{text: "T", icon: ""},{text: "H", icon: ""},{text: "E", icon: ""},{text: "O", icon: ""}], 3, "只有O是完全彎曲的線條"),
    createOddOne([{text: "A", icon: ""},{text: "E", icon: ""},{text: "I", icon: ""},{text: "Z", icon: ""}], 3, "只有Z不是母音字母"),
    createOddOne([{text: "12", icon: ""},{text: "18", icon: ""},{text: "24", icon: ""},{text: "25", icon: ""}], 3, "只有25不是偶數"),
    createOddOne([{text: "9", icon: ""},{text: "16", icon: ""},{text: "25", icon: ""},{text: "30", icon: ""}], 3, "只有30不是完全平方數"),
    createOddOne([{text: "🚗", icon: ""},{text: "🚲", icon: ""},{text: "🛴", icon: ""},{text: "🛹", icon: ""}], 0, "只有汽車有四輪且封閉"),
    createOddOne([{text: "🌲", icon: ""},{text: "🌵", icon: ""},{text: "🌴", icon: ""},{text: "🌸", icon: ""}], 3, "只有花是有花瓣的植物"),
    createOddOne([{text: "🔴", icon: ""},{text: "🛑", icon: ""},{text: "🔺", icon: ""},{text: "🟥", icon: ""}], 0, "只有它沒有任何角"),
    createOddOne([{text: "A", icon: ""},{text: "H", icon: ""},{text: "M", icon: ""},{text: "S", icon: ""}], 3, "只有S是不對稱或曲線"),
    createOddOne([{text: "11", icon: ""},{text: "13", icon: ""},{text: "17", icon: ""},{text: "21", icon: ""}], 3, "21不是質數"),
    createOddOne([{text: "🐧", icon: ""},{text: "🦅", icon: ""},{text: "🦉", icon: ""},{text: "🦇", icon: ""}], 0, "企鵝不會飛"),
    createOddOne([{text: "冰", icon: ""},{text: "雪", icon: ""},{text: "霜", icon: ""},{text: "水", icon: ""}], 3, "只有水是液態"),
    createOddOne([{text: "銅", icon: ""},{text: "鐵", icon: ""},{text: "鋁", icon: ""},{text: "木", icon: ""}], 3, "木頭不是金屬"),
    createOddOne([{text: "公里", icon: ""},{text: "公尺", icon: ""},{text: "公分", icon: ""},{text: "公斤", icon: ""}], 3, "公斤是重量單位"),
    createOddOne([{text: "太陽", icon: ""},{text: "月亮", icon: ""},{text: "星星", icon: ""},{text: "雲朵", icon: ""}], 3, "雲朵在大氣層內"),
    createOddOne([{text: "聽", icon: ""},{text: "看", icon: ""},{text: "聞", icon: ""},{text: "想", icon: ""}], 3, "想不是五官感覺"),
    createOddOne([{text: "紅", icon: ""},{text: "藍", icon: ""},{text: "黃", icon: ""},{text: "綠", icon: ""}], 3, "綠色不是三原色"),
    createOddOne([{text: "鋼琴", icon: ""},{text: "吉他", icon: ""},{text: "小提琴", icon: ""},{text: "鼓", icon: ""}], 3, "鼓沒有弦"),
    createOddOne([{text: "春", icon: ""},{text: "夏", icon: ""},{text: "秋", icon: ""},{text: "晨", icon: ""}], 3, "晨不是季節"),
    createOddOne([{text: "蘋果", icon: ""},{text: "水蜜桃", icon: ""},{text: "櫻桃", icon: ""},{text: "西瓜", icon: ""}], 3, "西瓜沒有明顯單一硬核"),
    createOddOne([{text: "黑", icon: ""},{text: "白", icon: ""},{text: "灰", icon: ""},{text: "彩", icon: ""}], 3, "彩代表多重顏色"),
    createOddOne([{text: "高", icon: ""},{text: "長", icon: ""},{text: "寬", icon: ""},{text: "大", icon: ""}], 3, "大是體積或整體的形容"),
    createOddOne([{text: "3", icon: ""},{text: "5", icon: ""},{text: "7", icon: ""},{text: "9", icon: ""}], 3, "9是合成數"),
    createOddOne([{text: "圓形", icon: ""},{text: "橢圓", icon: ""},{text: "心形", icon: ""},{text: "正方形", icon: ""}], 3, "只有正方形有角"),
    createOddOne([{text: "東", icon: ""},{text: "南", icon: ""},{text: "西", icon: ""},{text: "中", icon: ""}], 3, "中不屬於四方方向"),
    createOddOne([{text: "走", icon: ""},{text: "跑", icon: ""},{text: "跳", icon: ""},{text: "站", icon: ""}], 3, "站是靜止動作")
];

export const STATIC_ODD_ONE_LEVELS = [...ODD_ONE_NORMAL_POOL.slice(0,25), ...additionalNormal];
export const STATIC_ODD_ONE_LEVELS_ADVANCED = [...ODD_ONE_ADVANCED_POOL.slice(0,25), ...additionalAdv];


// --- SOUND GAME - Massive Expansion ---
const SOUND_TYPES = ['HIGH', 'LOW', 'RISE', 'FALL', 'ALARM', 'GAME', 'BOUNCE', 'MAGIC', 'TELEPHONE'] as const;

// Define ALL possible targets. The generator will create a level for EACH target to ensure uniqueness.
const EXPANDED_SOUND_TARGETS: Record<string, {icon: string, label: string}[]> = {
    'HIGH': [
        {icon: "🐦", label: "小鳥"}, {icon: "🐭", label: "老鼠"}, {icon: "🔔", label: "鈴鐺"},
        {icon: "👶", label: "嬰兒哭"}, {icon: "🎻", label: "小提琴"}, {icon: " whistle", label: "哨子"},
        {icon: "🐣", label: "小雞"}, {icon: "🐬", label: "海豚"}, {icon: "🔑", label: "鑰匙聲"}
    ],
    'LOW': [
        {icon: "🦁", label: "獅子"}, {icon: "🥁", label: "大鼓"}, {icon: "🚢", label: "大船"},
        {icon: "🐻", label: "熊吼"}, {icon: "🚜", label: "拖拉機"}, {icon: "🎻", label: "大提琴"},
        {icon: "🐂", label: "牛叫"}, {icon: "🦍", label: "大猩猩"}, {icon: "🚛", label: "卡車"}
    ],
    'RISE': [
        {icon: "🚀", label: "升空"}, {icon: "🎈", label: "氣球飛起"}, {icon: "📈", label: "上升"},
        {icon: "🛫", label: "飛機起飛"}, {icon: "🎢", label: "爬坡"}, {icon: "🌬️", label: "風吹起"},
        {icon: "🪜", label: "爬樓梯"}, {icon: "🪁", label: "風箏"}, {icon: "🌡️", label: "升溫"}
    ],
    'FALL': [
        {icon: "📉", label: "下降"}, {icon: "🛝", label: "溜滑梯"}, {icon: "🍂", label: "落葉"},
        {icon: "🛬", label: "飛機降落"}, {icon: "💧", label: "水滴"}, {icon: "💣", label: "炸彈落下"},
        {icon: "⛷️", label: "滑雪"}, {icon: "📉", label: "跌倒"}, {icon: "🧱", label: "積木倒塌"}
    ],
    'ALARM': [
        {icon: "⏰", label: "鬧鐘"}, {icon: "🚒", label: "消防車"}, {icon: "🚑", label: "救護車"},
        {icon: "🚓", label: "警車"}, {icon: "🚨", label: "警報器"}, {icon: "⏲️", label: "計時器"},
        {icon: "🕰️", label: "大鐘"}, {icon: "📟", label: "呼叫器"}, {icon: "📢", label: "廣播"}
    ],
    'GAME': [
        {icon: "🎮", label: "電動玩具"}, {icon: "👾", label: "外星人"}, {icon: "🤖", label: "機器人"},
        {icon: "🪙", label: "吃金幣"}, {icon: "🍄", label: "吃蘑菇"}, {icon: "🕹️", label: "搖桿"},
        {icon: "🔫", label: "雷射槍"}, {icon: "🆙", label: "升級"}, {icon: "💥", label: "爆炸"}
    ],
    'BOUNCE': [
        {icon: "🏀", label: "拍球"}, {icon: "🦘", label: "袋鼠"}, {icon: "🐇", label: "兔子"},
        {icon: "🎾", label: "網球"}, {icon: "🏓", label: "乒乓球"}, {icon: "🐸", label: "青蛙"},
        {icon: "🛌", label: "跳床"}, {icon: "🤸", label: "跳躍"}, {icon: "🍮", label: "布丁Q彈"}
    ],
    'MAGIC': [
        {icon: "🪄", label: "魔法棒"}, {icon: "✨", label: "亮晶晶"}, {icon: "🧚", label: "仙子"},
        {icon: "🦄", label: "獨角獸"}, {icon: "🔮", label: "水晶球"}, {icon: "🌟", label: "流星"},
        {icon: "🎩", label: "變魔術"}, {icon: "🎆", label: "煙火"}, {icon: "👼", label: "天使"}
    ],
    'TELEPHONE': [
        {icon: "☎️", label: "電話"}, {icon: "📱", label: "手機"}, {icon: "📠", label: "傳真機"},
        {icon: "📞", label: "通話中"}, {icon: "📲", label: "來電"}, {icon: "🛎️", label: "服務鈴"},
        {icon: "🚲", label: "腳踏車鈴"}, {icon: "🏪", label: "超商門鈴"}, {icon: "🚪", label: "門鈴"}
    ]
};

// Flatten to create a unique level for EACH target item
const generateAllSoundLevels = (): SoundLevel[] => {
    const levels: SoundLevel[] = [];
    
    SOUND_TYPES.forEach(type => {
        const targets = EXPANDED_SOUND_TARGETS[type];
        targets.forEach(targetItem => {
            // Generate distinct distractors
            const distractors: {icon: string, label: string, isCorrect: boolean}[] = [];
            while(distractors.length < 3) {
                // Pick a random OTHER type
                const otherType = SOUND_TYPES[Math.floor(Math.random() * SOUND_TYPES.length)];
                if (otherType !== type) {
                    const otherPool = EXPANDED_SOUND_TARGETS[otherType];
                    const dist = otherPool[Math.floor(Math.random() * otherPool.length)];
                    // Prevent duplicate distractors
                    if (!distractors.some(d => d.label === dist.label)) {
                        distractors.push({ ...dist, isCorrect: false });
                    }
                }
            }
            
            // Options array
            const options = [
                { ...targetItem, isCorrect: true },
                ...distractors
            ].sort(() => 0.5 - Math.random());

            levels.push({
                soundType: type,
                targetIcon: targetItem.icon,
                options: options
            });
        });
    });
    
    // Shuffle the entire level deck so we don't get all HIGHs then all LOWs
    return levels.sort(() => 0.5 - Math.random());
};

export const STATIC_SOUND_LEVELS = generateAllSoundLevels();

const generatePuzzleLevels = (count: number, difficulty: 'NORMAL' | 'ADVANCED'): PuzzleLevel[] => {
     const levels: PuzzleLevel[] = [];
     const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"];
     const gridSize = difficulty === 'NORMAL' ? 2 : 3;
     for(let i=0; i<count; i++) {
         const targetImage: string[] = [];
         for(let j=0; j<gridSize*gridSize; j++) targetImage.push(emojis[Math.floor(Math.random()*emojis.length)]);
         levels.push({
             gridSize,
             targetImage,
             scrambled: targetImage.map((c, id) => ({id, content: c})) // Placeholder
         });
     }
     return levels;
};

export const STATIC_PUZZLE_LEVELS = generatePuzzleLevels(100, 'NORMAL');
export const STATIC_PUZZLE_LEVELS_ADVANCED = generatePuzzleLevels(100, 'ADVANCED');
