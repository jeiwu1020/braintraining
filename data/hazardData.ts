export interface HazardScene {
    id: number;
    title: string;
    context: string;
    items: { text: string; isHazard: boolean; explanation: string }[];
}

export const normalScenes: HazardScene[] = [
    {
        id: 1,
        title: "廚房煮飯",
        context: "媽媽正在廚房準備晚餐，瓦斯爐正在煮湯...",
        items: [
            { text: "在旁邊的流理台切菜", isHazard: false, explanation: "這是一般正常的廚房活動。" },
            { text: "打開抽油煙機", isHazard: false, explanation: "保持通風是好習慣。" },
            { text: "接電話後離開廚房去客廳聊天", isHazard: true, explanation: "非常危險！瓦斯爐開著絕對不能離開視線，可能引發火災。" },
            { text: "把洗好的碗盤放在瀝水架上", isHazard: false, explanation: "安全的廚房整理順序。" }
        ]
    },
    {
        id: 2,
        title: "浴室洗澡",
        context: "準備要洗澡，走進浴室裡...",
        items: [
            { text: "地上有剛洗完滴落的一攤水", isHazard: true, explanation: "濕滑的地板很容易造成跌倒，非常危險！應該要先擦乾或穿防滑鞋。" },
            { text: "打開熱水器等水變熱", isHazard: false, explanation: "正常的洗澡步驟。" },
            { text: "把換洗衣物放在架子上", isHazard: false, explanation: "很好的準備工作。" },
            { text: "打開浴室的抽風機", isHazard: false, explanation: "這能幫助保持浴室乾燥。" }
        ]
    },
    {
        id: 3,
        title: "客廳休息",
        context: "晚飯後大家在客廳看電視...",
        items: [
            { text: "沙發上放著幾個抱枕", isHazard: false, explanation: "舒服的休息環境。" },
            { text: "延長線上插滿了各種高耗電電器", isHazard: true, explanation: "太危險了！延長線過載很容易電線走火。" },
            { text: "桌上放著一杯溫水", isHazard: false, explanation: "隨時補充水分很好。" },
            { text: "電視音量開在適中的大小", isHazard: false, explanation: "不會吵到鄰居，很棒。" }
        ]
    },
    {
         id: 4,
         title: "過馬路",
         context: "走到十字路口，準備過馬路...",
         items: [
             { text: "走行人穿越道(斑馬線)", isHazard: false, explanation: "正確，請走斑馬線！" },
             { text: "邊看手機邊過馬路", isHazard: true, explanation: "非常危險！過馬路一定要專心看路況燈號。" },
             { text: "等待綠燈亮起", isHazard: false, explanation: "遵守交通號誌。" },
             { text: "確認左右無來車", isHazard: false, explanation: "即使綠燈也要確認沒有闖紅燈的車。" }
         ]
    },
    {
         id: 5,
         title: "上下樓梯",
         context: "正在走樓梯準備下樓...",
         items: [
             { text: "扶著手扶梯慢慢走", isHazard: false, explanation: "安全的下樓習慣。" },
             { text: "看著階梯一步一步走", isHazard: false, explanation: "可以預防踩空跌倒。" },
             { text: "穿著鞋帶沒綁好且過長的鞋子", isHazard: true, explanation: "危險！鞋帶可能會絆倒自己導致摔下樓梯。" },
             { text: "靠右邊走，讓出走道", isHazard: false, explanation: "良好的禮儀與安全習慣。" }
         ]
    },
    {
         id: 6,
         title: "用火安全",
         context: "冬天到了，家裡有一點冷...",
         items: [
             { text: "多穿一件外套保暖", isHazard: false, explanation: "這是最安全的保暖方法。" },
             { text: "使用有安全標章的電暖器", isHazard: false, explanation: "使用合格電器比較有保障。" },
             { text: "把衣服掛在電暖器上烘乾", isHazard: true, explanation: "非常危險！電暖器高溫很容易讓衣物起火。" },
             { text: "喝一杯溫熱水保暖", isHazard: false, explanation: "好習慣！" }
         ]
    },
    {
         id: 7,
         title: "整理房間",
         context: "週末在房間裡面大掃除...",
         items: [
             { text: "將不用的雜物清掉", isHazard: false, explanation: "保持環境整潔很好。" },
             { text: "把剪刀美工刀用完隨手放在床上", isHazard: true, explanation: "危險！可能會被壓到或割傷，一定要收進抽屜。" },
             { text: "將桌面擦拭乾淨", isHazard: false, explanation: "良好的衛生習慣。" },
             { text: "把書本排在書架上", isHazard: false, explanation: "很棒的收納習慣。" }
         ]
    },
    {
         id: 8,
         title: "搭乘手扶梯",
         context: "在百貨公司搭乘手扶梯到下一層樓...",
         items: [
             { text: "將腳跨出黃色警戒線站立", isHazard: true, explanation: "危險！容易讓衣物或鞋子被捲進手扶梯的縫隙。" },
             { text: "緊握著黑色的扶手帶", isHazard: false, explanation: "這樣有重心比較穩。" },
             { text: "面朝前方站好", isHazard: false, explanation: "隨時注意抵達狀況。" },
             { text: "不推擠別人", isHazard: false, explanation: "保持距離最安全。" }
         ]
    },
    {
         id: 9,
         title: "吃東西",
         context: "正在吃午餐...",
         items: [
             { text: "把大塊的肉切成小塊吃", isHazard: false, explanation: "比較好咀嚼與消化。" },
             { text: "細嚼慢嚥", isHazard: false, explanation: "正確的飲食習慣。" },
             { text: "一邊大笑一邊吞下貢丸", isHazard: true, explanation: "危險！容易導致噎到或食物掉入氣管。" },
             { text: "吃完飯後喝口湯", isHazard: false, explanation: "可以幫助食物吞嚥。" }
         ]
    },
    {
         id: 10,
         title: "服藥安全",
         context: "感覺很不舒服，準備吃藥...",
         items: [
             { text: "看著藥袋上面的名字確認", isHazard: false, explanation: "確認是自己的藥很重要。" },
             { text: "配溫開水吞服", isHazard: false, explanation: "這是最安全的服藥方式。" },
             { text: "把藥丸乾吞下去", isHazard: true, explanation: "危險！藥物可能會卡在食道造成發炎甚至潰瘍。" },
             { text: "按時吃藥", isHazard: false, explanation: "遵守醫囑是正確的。" }
         ]
    },
    {
         id: 11,
         title: "夜間起床",
         context: "睡到一半想上廁所...",
         items: [
             { text: "打開床頭燈或小夜燈", isHazard: false, explanation: "有光線才看得清楚道路。" },
             { text: "坐在床邊等個十秒鐘再站起", isHazard: false, explanation: "可以防止姿勢性低血壓頭暈跌倒。" },
             { text: "摸黑快速奔向廁所", isHazard: true, explanation: "非常危險！夜晚視線不佳很容易踢到東西或滑倒。" },
             { text: "穿上防滑拖鞋", isHazard: false, explanation: "可以預防跌倒。" }
         ]
    },
    {
         id: 12,
         title: "插座放插頭",
         context: "要幫手機充電...",
         items: [
             { text: "手濕濕的去拔插頭", isHazard: true, explanation: "非常危險！可能會觸電。" },
             { text: "確認插頭有插到底", isHazard: false, explanation: "正確的使用方式。" },
             { text: "握著插頭塑膠部分拔起", isHazard: false, explanation: "不要拉電線拔插頭才正確。" },
             { text: "不在插座旁放置水杯", isHazard: false, explanation: "遠離水源較安全。" }
         ]
    },
    {
         id: 13,
         title: "拿高處物品",
         context: "想拿放在櫃子最上層的衛生紙...",
         items: [
             { text: "拿一張有靠背且穩固的椅子站上去", isHazard: false, explanation: "正確的墊高工具。" },
             { text: "請高個子的人幫忙", isHazard: false, explanation: "請人幫忙最安全。" },
             { text: "踩在那種有輪子會滑動的旋轉椅上", isHazard: true, explanation: "非常危險！椅子滾動會導致整個人摔下來。" },
             { text: "確認櫃子不會搖晃", isHazard: false, explanation: "注意環境安全。" }
         ]
    },
    {
         id: 14,
         title: "過期食品",
         context: "冰箱裡有一罐果汁忘記喝了...",
         items: [
             { text: "查看瓶子上的保存期限", isHazard: false, explanation: "非常好的習慣。" },
             { text: "看到過期了就丟掉", isHazard: false, explanation: "不要吃到壞掉的食物。" },
             { text: "覺得應該沒壞，所以大口喝下去", isHazard: true, explanation: "危險！可能會造成嚴重腸胃炎甚至食物中毒。" },
             { text: "倒掉時順便把瓶子洗乾淨回收", isHazard: false, explanation: "好習慣！" }
         ]
    },
    {
         id: 15,
         title: "地震發生",
         context: "突然感覺到房子劇烈搖晃...",
         items: [
             { text: "立刻抱頭躲在堅固的桌子底下", isHazard: false, explanation: "正確的避難動作（趴下、掩護、穩住）。" },
             { text: "趕快去開門確保逃生路線", isHazard: false, explanation: "有時間的話是可以的。" },
             { text: "立刻衝進電梯準備下樓", isHazard: true, explanation: "極度危險！地震時電梯可能故障停電，會被困在裡面！" },
             { text: "遠離玻璃窗戶旁", isHazard: false, explanation: "避免被震碎的玻璃割傷。" }
         ]
    },
    {
         id: 16,
         title: "颱風天出門",
         context: "颱風天風雨交加，你準備外出...",
         items: [
             { text: "出門前確認天氣預報及停班停課資訊", isHazard: false, explanation: "了解天氣狀況能幫助自己做準備。" },
             { text: "穿著雨衣和防水防滑的鞋子", isHazard: false, explanation: "能有效擋雨並防止滑倒。" },
             { text: "撐著傘走在有很多大樹的人行道上", isHazard: true, explanation: "危險！強烈陣風可能會將樹枝吹斷砸傷人，撐傘也容易被風吹走或遮擋視線。" },
             { text: "盡量走騎樓或室內連通道", isHazard: false, explanation: "可減少直接被強風豪雨侵襲。" }
         ]
    },
    {
         id: 17,
         title: "運動前的準備",
         context: "你準備要去操場跑步運動...",
         items: [
             { text: "先做五到十分鐘的伸展拉筋暖身", isHazard: false, explanation: "暖身可以有效預防運動傷害。" },
             { text: "穿著輕便吸汗的運動服與運動鞋", isHazard: false, explanation: "合適的穿著能讓運動更舒適安全。" },
             { text: "完全不喝水，覺得忍到運動完再喝就好", isHazard: true, explanation: "危險！缺乏水分可能會導致脫水甚至中暑。" },
             { text: "確認天氣不會太熱或太冷", isHazard: false, explanation: "適當的天氣才不會對身體造成過度負擔。" }
         ]
    },
    {
         id: 18,
         title: "使用美工刀",
         context: "你正在用美工刀拆很大的網購包裹...",
         items: [
             { text: "把刀片推出很長來割紙箱", isHazard: true, explanation: "非常危險！刀片推太長容易應聲折斷並彈飛割傷眼睛或手。" },
             { text: "刀片只推出一到兩節剛好的長度", isHazard: false, explanation: "這樣施力最穩固安全。" },
             { text: "另一隻手放在刀片行進方向的後方", isHazard: false, explanation: "手不要放在刀口前方，避免滑刀割傷。" },
             { text: "用完立刻把刀片收回", isHazard: false, explanation: "良好的安全習慣。" }
         ]
    },
    {
         id: 19,
         title: "吃火鍋",
         context: "你和家人在餐廳吃著熱騰騰的火鍋...",
         items: [
             { text: "把生肉和熟通用同一雙筷子夾", isHazard: true, explanation: "危險！生食上的細菌會污染熟食，恐造成食物中毒。" },
             { text: "使用專用的公筷和母匙來盛湯夾肉", isHazard: false, explanation: "衛生又安全的好習慣。" },
             { text: "確認桌面上的卡式爐火源附近沒有衛生紙", isHazard: false, explanation: "遠離易燃物可避免火災。" },
             { text: "等湯稍微涼一點再喝", isHazard: false, explanation: "避免燙傷食道和口腔。" }
         ]
    },
    {
         id: 20,
         title: "吃藥時間",
         context: "到了吃感冒藥的時間了...",
         items: [
             { text: "配一大口白開水將藥丸吞下", isHazard: false, explanation: "是最正確安全的服藥方式。" },
             { text: "因為覺得苦，所以配葡萄柚汁一起喝", isHazard: true, explanation: "危險！葡萄柚汁會與多種藥物產生交互作用，可能導致藥物中毒。" },
             { text: "確認藥袋上的名字是自己的", isHazard: false, explanation: "吃錯藥會有不良反應。" },
             { text: "照著藥袋上指示的劑量服用", isHazard: false, explanation: "服用過量或不足都不好。" }
         ]
    },
    {
         id: 21,
         title: "打掃廁所",
         context: "你正準備清洗很久沒掃的浴廁...",
         items: [
             { text: "為了掃更乾淨，把漂白水和鹽酸混在一起用", isHazard: true, explanation: "極度危險！兩者混合會產生有毒的氯氣，吸入會致命！" },
             { text: "戴上橡膠手套保護雙手", isHazard: false, explanation: "避免清潔劑傷害皮膚。" },
             { text: "打開廁所窗戶和抽風機保持通風", isHazard: false, explanation: "可以避免吸入過多化學氣體。" },
             { text: "按照清潔劑瓶身上的說明使用", isHazard: false, explanation: "正確使用最安全。" }
         ]
    },
    {
         id: 22,
         title: "騎腳踏車",
         context: "你騎著腳踏車準備去附近的便利商店...",
         items: [
             { text: "戴上合適的安全帽", isHazard: false, explanation: "保護頭部非常重要。" },
             { text: "晚上騎車時打開前後車燈", isHazard: false, explanation: "讓別人看見你，保障雙方安全。" },
             { text: "邊騎車邊戴著耳機聽很大聲的音樂", isHazard: true, explanation: "危險！聽不到後方來車或環境聲音，容易發生車禍。" },
             { text: "騎在自行車道或靠馬路右側", isHazard: false, explanation: "遵守交通規則。" }
         ]
    },
    {
         id: 23,
         title: "逛大賣場",
         context: "你在大賣場推著購物車買東西...",
         items: [
             { text: "手放開推車，讓它自己在斜坡上滑行", isHazard: true, explanation: "危險！推車會撞到其他人或商品，造成受傷和損壞。" },
             { text: "把比較重的物品放在推車底層", isHazard: false, explanation: "降低重心，推車才不易翻覆。" },
             { text: "留意地板上「小心地滑」的黃色告示牌", isHazard: false, explanation: "有警覺心能避免滑倒。" },
             { text: "慢慢轉彎，確認走道兩側沒有人", isHazard: false, explanation: "避免視線死角撞到人。" }
         ]
    },
    {
         id: 24,
         title: "睡前習慣",
         context: "到了晚上睡覺的時間了...",
         items: [
             { text: "把手機放在床上充電並壓在枕頭底下", isHazard: true, explanation: "危險！手機充電會發熱，被悶住可能導致過熱起火燃燒。" },
             { text: "睡前調暗房間燈光", isHazard: false, explanation: "幫助身體準備進入睡眠。" },
             { text: "確認門窗和瓦斯都有關好", isHazard: false, explanation: "保障居家安全的好習慣。" },
             { text: "手機放在遠離床鋪的桌上充電", isHazard: false, explanation: "安全又能避免半夜滑手機。" }
         ]
    },
    {
         id: 25,
         title: "提重物",
         context: "地上有一個很重的箱子你需要把它搬上桌...",
         items: [
             { text: "直直地彎腰下去把箱子拉起來", isHazard: true, explanation: "危險！直接彎腰提重物非常容易導致腰部椎間盤突出或閃到腰。" },
             { text: "先蹲下，背部打直，用大腿的力量站起來", isHazard: false, explanation: "這是正確且安全的搬重物姿勢。" },
             { text: "把箱子抱靠近身體", isHazard: false, explanation: "這樣比較省力也能維持平衡。" },
             { text: "如果太重就找人幫忙一起搬", isHazard: false, explanation: "不要勉強自己。" }
         ]
    }
];

export const advancedScenes: HazardScene[] = [
    {
        id: 1,
        title: "戶外散步",
        context: "去公園散步，路上的狀況...",
        items: [
            { text: "走在有樹蔭的平坦人行道上", isHazard: false, explanation: "很棒的散步地點選擇。" },
            { text: "綠燈閃爍時快步小跑過馬路", isHazard: true, explanation: "危險！長輩跌倒風險高，綠燈閃爍時應該等下一個綠燈，不應奔跑。" },
            { text: "帶著水壺適時補充水分", isHazard: false, explanation: "很好的保健習慣。" },
            { text: "穿著包覆性好的運動鞋", isHazard: false, explanation: "能保護雙腳的好選擇。" }
        ]
    },
    {
        id: 2,
        title: "使用清潔劑",
        context: "準備要把廁所的黴菌刷洗乾淨...",
        items: [
            { text: "戴上手套與口罩", isHazard: false, explanation: "保護皮膚與呼吸道。" },
            { text: "把漂白水跟鹽酸混在一起用，覺得比較洗得乾淨", isHazard: true, explanation: "極度危險！會產生致命的毒氣(氯氣)，絕對不可混合！" },
            { text: "打開廁所窗戶與抽風機", isHazard: false, explanation: "保持通風非常重要。" },
            { text: "按照標籤說明稀釋漂白水", isHazard: false, explanation: "正確使用清潔用品。" }
        ]
    },
    {
        id: 3,
        title: "高血壓患者保健",
        context: "有高血壓病史的長輩在冬天的早晨...",
        items: [
            { text: "起床前在被窩裡先活動一下手腳", isHazard: false, explanation: "可以讓身體暖機。" },
            { text: "立刻掀開棉被，馬上走到冷空氣中", isHazard: true, explanation: "危險！溫差過大會讓血管瞬間收縮，增加中風風險。" },
            { text: "在床邊放一件外套，起床馬上穿上", isHazard: false, explanation: "保持溫暖是預防心血管疾病的重點。" },
            { text: "起床後喝一杯溫開水", isHazard: false, explanation: "幫助血液循環。" }
        ]
    },
    {
        id: 4,
        title: "陌生來電",
        context: "手機接到一通陌生號碼打來的電話...",
        items: [
            { text: "對方說你的帳戶被凍結，要求點擊簡訊連結", isHazard: true, explanation: "危險！這是標準的詐騙手法，點擊連結會被盜取個資。" },
            { text: "對於不確定的電話，先說先掛掉，然後打給家人確認", isHazard: false, explanation: "提高警覺的好方法。" },
            { text: "如果有疑問，可以撥打165反詐騙專線", isHazard: false, explanation: "正確的求助管道。" },
            { text: "不隨便告訴對方自己的身分證字號", isHazard: false, explanation: "保護自己的個資安全。" }
        ]
    },
    {
        id: 5,
        title: "長照輔具使用",
        context: "使用助行器走路復健時...",
        items: [
            { text: "穿著有防滑底的鞋子", isHazard: false, explanation: "減少滑倒的風險。" },
            { text: "在鋪有許多小地毯的客廳裡走動", isHazard: true, explanation: "危險！助行器很容易卡到地毯邊緣造成跌倒。" },
            { text: "確保助行器的四個腳墊沒有嚴重磨損", isHazard: false, explanation: "定期檢查輔具是很重要的。" },
            { text: "將助行器放在身體正前方", isHazard: false, explanation: "正確的使用姿勢。" }
        ]
    },
    {
        id: 6,
        title: "燙傷處理",
        context: "煮湯時不小心被熱水燙到手...",
        items: [
            { text: "立刻到水龍頭下沖冷水15分鐘", isHazard: false, explanation: "「沖脫泡蓋送」的基礎第一步。" },
            { text: "在傷口上塗抹牙膏、醬油等偏方", isHazard: true, explanation: "危險！會造成組織進一步受損或增加細菌感染風險。" },
            { text: "用乾淨的紗布輕輕蓋住患部", isHazard: false, explanation: "保護傷口。" },
            { text: "如果起水泡，絕對不要弄破", isHazard: false, explanation: "避免感染的正確做法。" }
        ]
    },
    {
        id: 7,
        title: "電動代步車上路",
        context: "阿公騎著醫療用電動代步車出門...",
        items: [
            { text: "開在快車道上跟著汽車一起等紅燈", isHazard: true, explanation: "極危險！電動代步車屬於行人輔具，依法應該走人行道或靠路邊走。" },
            { text: "在車上貼上反光貼紙", isHazard: false, explanation: "可以增加夜間被看到的機會。" },
            { text: "遵守行人交通號誌過馬路", isHazard: false, explanation: "正確的用路觀念。" },
            { text: "轉彎時先看看左右", isHazard: false, explanation: "確保行車安全。" }
        ]
    },
    {
        id: 8,
        title: "糖尿病足防護",
        context: "患有糖尿病的人在日常生活中...",
        items: [
            { text: "每天檢查腳底有沒有小傷口", isHazard: false, explanation: "因為糖尿病患者足部感覺較遲鈍，需要天天視力檢查。" },
            { text: "喜歡光著腳在家裡走來走去", isHazard: true, explanation: "危險！很容易不小心踩到東西受傷而自己卻沒感覺，導致嚴重感染。" },
            { text: "穿著吸汗透氣的純棉襪子", isHazard: false, explanation: "保持足部乾燥與保護。" },
            { text: "洗澡前先用手確認水溫不會太燙", isHazard: false, explanation: "避免燙傷。" }
        ]
    },
    {
        id: 9,
        title: "微波爐使用",
        context: "打算用微波爐加熱便當...",
        items: [
            { text: "把有金屬邊花紋的碗放進去微波", isHazard: true, explanation: "極危險！金屬在微波爐裡會產生火花甚至引起爆炸！" },
            { text: "使用標示『可微波』的玻璃保鮮盒", isHazard: false, explanation: "安全的容器選擇。" },
            { text: "把食物均勻鋪平再加熱", isHazard: false, explanation: "可以熱得比較均勻。" },
            { text: "如果食物有帶殼（如栗子、雞蛋），絕對不放進去", isHazard: false, explanation: "密閉殼類會在內部產生壓力而爆炸。" }
        ]
    },
    {
        id: 10,
        title: "長時間久坐",
        context: "在冷氣房裡連續看了好幾個小時的電視...",
        items: [
            { text: "每小時起來走動倒杯水", isHazard: false, explanation: "很好，避免下肢血液循環不良。" },
            { text: "感覺腿部有些腫脹疼痛，還是繼續坐著不動", isHazard: true, explanation: "危險！這可能是深部靜脈栓塞的徵兆，久坐不動容易造成血栓。" },
            { text: "坐著時稍微轉動腳踝", isHazard: false, explanation: "幫助血液回流。" },
            { text: "保持背部有支撐的良好坐姿", isHazard: false, explanation: "保護脊椎。" }
        ]
    },
    {
        id: 11,
        title: "網路交友",
        context: "你在網路上認識一個說他住國外、長得很帥的網友...",
        items: [
            { text: "對方說生病急需一筆錢，馬上匯過去", isHazard: true, explanation: "危險！涉及金錢幾乎100%是詐騙！" },
            { text: "保護自己的家庭住址與身分證字號", isHazard: false, explanation: "很好的隱私防護意識。" },
            { text: "遇到懷疑的點，可以上網搜尋類似手法的案例", isHazard: false, explanation: "查證是很重要的。" },
            { text: "如果約見面，選擇人多的公共場所", isHazard: false, explanation: "保護自己人身安全。" }
        ]
    },
    {
        id: 12,
        title: "提重物",
        context: "準備把地上的一大箱重物搬起來...",
        items: [
            { text: "彎下腰，雙腿打直直接把箱子拔起來", isHazard: true, explanation: "極危險！這樣的姿勢會讓下背部(腰椎)承受巨大壓力，很容易閃到腰或椎間盤突出。" },
            { text: "蹲下身，讓物品靠近身體", isHazard: false, explanation: "正確的起手勢。" },
            { text: "用大腿的力量站起來", isHazard: false, explanation: "大腿肌肉強壯，可以保護腰部。" },
            { text: "如果太重就推車或找人幫忙", isHazard: false, explanation: "不要逞強是才是最安全的。" }
        ]
    },
    {
        id: 13,
        title: "安眠藥使用",
        context: "最近睡不好，醫生開了安眠藥...",
        items: [
            { text: "配著一小杯紅酒吞服，想說會更好睡", isHazard: true, explanation: "致命危險！酒精會加強安眠藥的鎮靜作用，可能導致呼吸抑制甚至休克！" },
            { text: "吃完藥立刻平躺準備睡覺", isHazard: false, explanation: "吃完藥後可能會頭暈，躺好最安全。" },
            { text: "遵照醫生開的劑量使用", isHazard: false, explanation: "不可以自己隨便加藥。" },
            { text: "半夜起來上廁所時動作放慢", isHazard: false, explanation: "預防安眠藥引起的跌倒。" }
        ]
    },
    {
        id: 14,
        title: "長途開車(或騎車)",
        context: "準備連續開車三個小時返鄉...",
        items: [
            { text: "前一晚睡飽八小時", isHazard: false, explanation: "確保精神狀態良好。" },
            { text: "即使已經頻頻打哈欠點頭，還是咬牙硬開", isHazard: true, explanation: "極其危險！疲勞駕駛的危險程度等同酒駕，極易發生重大車禍！" },
            { text: "每開一個半小時就進休息站休息15分鐘", isHazard: false, explanation: "非常好的適當休息規劃。" },
            { text: "保持車內空氣流通", isHazard: false, explanation: "有助於保持清醒。" }
        ]
    },
    {
        id: 15,
        title: "瓦斯外洩",
        context: "一進家門，聞到很濃的瓦斯臭味...",
        items: [
            { text: "立刻打開電風扇和抽油煙機想把氣味吹走", isHazard: true, explanation: "災難性危險！開啟開關會產生微小火花，瞬間引發氣爆！" },
            { text: "動作輕緩地推開窗戶讓空氣流通", isHazard: false, explanation: "輕推窗戶避免產生金屬摩擦的火花。" },
            { text: "立刻離開現場並在室外打119報警", isHazard: false, explanation: "確保自己在安全的地方再求救。" },
            { text: "關閉瓦斯總開關（如果安全許可的情況下）", isHazard: false, explanation: "可以阻斷洩漏源。" }
        ]
    },
    {
        id: 16,
        title: "處理網購包裹",
        description: "你收到一個印有不明寄件人的包裹，並要求貨到付款...",
        items: [
            { text: "二話不說直接付錢給物流司機", isHazard: true, explanation: "危險！這極高機率是幽靈包裹詐騙，付了錢就很難拿回來。" },
            { text: "先拒收包裹，去查詢近期的訂單紀錄確認", isHazard: false, explanation: "謹慎確認能防範詐騙。" },
            { text: "看外觀包裝是否有奇怪的膠帶痕跡", isHazard: false, explanation: "留意可疑包裹外觀。" },
            { text: "如果不確定，拍照並與家人朋友確認", isHazard: false, explanation: "尋求第三方協助判斷。" }
        ]
    },
    {
        id: 17,
        title: "下載免費軟體",
        description: "你需要一個電腦繪圖軟體，但在網路上找到一個「免費破解版」...",
        items: [
            { text: "立刻點擊下載並全部按「允許安裝」", isHazard: true, explanation: "危險！破解版通常夾帶木馬病毒或勒索軟體，會盜取個資或鎖死電腦。" },
            { text: "去官方網站尋找是否有試用版或學生版", isHazard: false, explanation: "使用官方合法軟體才安全。" },
            { text: "尋求開源(Open Source)的免費替代軟體", isHazard: false, explanation: "安全的替代方案。" },
            { text: "安裝前先用防毒軟體掃描下載的檔案", isHazard: false, explanation: "多一層安全防護。" }
        ]
    },
    {
        id: 18,
        title: "高壓電塔旁活動",
        description: "一群人到郊外放風箏，旁邊有高壓電塔...",
        items: [
            { text: "為了讓風箏飛更高，故意跑到電塔正下方放", isHazard: true, explanation: "極度危險！風箏線若碰到高壓電線會瞬間導電，導致嚴重燒傷甚至死亡。" },
            { text: "遠離電塔，尋找空曠安全的草地", isHazard: false, explanation: "保持安全距離。" },
            { text: "留意頭頂上方是否有其他電線", isHazard: false, explanation: "隨時注意環境風險。" },
            { text: "若風箏不慎卡在樹上，不要貿然攀爬拿取", isHazard: false, explanation: "避免摔傷或觸電。" }
        ]
    },
    {
        id: 19,
        title: "銀行ATM操作",
        description: "你在ATM領錢時，有人一直緊貼在你背後看...",
        items: [
            { text: "覺得沒關係，大方地慢慢按下密碼", isHazard: true, explanation: "危險！密碼被偷瞄可能導致存款被盜領。" },
            { text: "用身體和另一隻手遮住數字鍵盤再按密碼", isHazard: false, explanation: "保護隱私的基本動作。" },
            { text: "請對方退後一點，保持安全距離", isHazard: false, explanation: "勇敢維護自己的權益。" },
            { text: "如果不對勁，立刻取消交易並換一台機器", isHazard: false, explanation: "警覺心高能保護財產。" }
        ]
    },
    {
        id: 20,
        title: "使用公共微波爐",
        description: "在便利商店用公共微波爐加熱午餐...",
        items: [
            { text: "直接把帶有鋁箔包裝的食物放進去微波", isHazard: true, explanation: "危險！金屬在微波爐裡會產生高壓電弧，引起火花甚至爆炸。" },
            { text: "確認餐盒上標有「可微波」的標誌", isHazard: false, explanation: "確保材質安全不釋放毒素。" },
            { text: "微波前先將便當蓋稍微打開一個小縫", isHazard: false, explanation: "讓蒸汽排出避免悶爆。" },
            { text: "拿取時墊著紙巾或毛巾避免燙傷", isHazard: false, explanation: "保護雙手。" }
        ]
    },
    {
        id: 21,
        title: "收到法院傳票簡訊",
        description: "手機突然收到一則稱你「涉嫌洗錢，請點擊連結查看傳票」的簡訊...",
        items: [
            { text: "因為太害怕，立刻點擊連結並輸入身分證字號", isHazard: true, explanation: "危險！這是經典的釣魚簡訊詐騙，點擊連結可能會下載惡意程式或被盜取個資。" },
            { text: "直接將簡訊刪除並封鎖該號碼", isHazard: false, explanation: "不予理會是最好的應對。" },
            { text: "撥打165反詐騙專線查證", isHazard: false, explanation: "尋求官方協助求證。" },
            { text: "自己上網去司法院網站查詢，而不是點簡訊連結", isHazard: false, explanation: "主動從安全管道查證。" }
        ]
    },
    {
        id: 22,
        title: "深山迷路",
        description: "跟朋友爬山時走散了，而且天色開始變暗...",
        items: [
            { text: "為了趕快找到出路，在黑暗中拼命在草叢裡亂跑", isHazard: true, explanation: "極度危險！可能跌落山谷、被蛇咬，且會大量消耗體力並迷失更深。" },
            { text: "留在原地，吹哨子或發出聲響等待救援", isHazard: false, explanation: "原地待援(STOP原則)是迷路時存活率最高的方法。" },
            { text: "穿上保暖衣物，尋找能避風的地方", isHazard: false, explanation: "防止失溫是最重要的生存關鍵。" },
            { text: "手機關閉不必要的APP以節省電量", isHazard: false, explanation: "保留電力對外求救。" }
        ]
    },
    {
        id: 23,
        title: "在國外餐廳點餐",
        description: "你在國外旅行，本身對帶殼海鮮嚴重過敏...",
        items: [
            { text: "看不懂菜單就隨便指一個看起來好吃的", isHazard: true, explanation: "致命危險！如果點到含有過敏原的食物，在外國可能難以及時就醫而休克。" },
            { text: "用手機翻譯軟體確實翻譯每一個食材", isHazard: false, explanation: "謹慎確認成分。" },
            { text: "準備一張當地語言的「我對海鮮嚴重過敏」的字卡給服務生", isHazard: false, explanation: "雙重保障自己的安全。" },
            { text: "隨身攜帶過敏急救藥物（如腎上腺素筆）", isHazard: false, explanation: "以備不時之需。" }
        ]
    },
    {
        id: 24,
        title: "汽車拋錨在高速公路",
        description: "開車在高速公路上，車子突然失去動力停在車道上...",
        items: [
            { text: "所有人都留在車內滑手機等拖吊車來", isHazard: true, explanation: "極度危險！後方車輛極可能煞車不及發生二次追撞，嚴重傷亡！" },
            { text: "立刻按下雙黃燈（危險警告燈）", isHazard: false, explanation: "警告後方來車。" },
            { text: "在車輛後方50-100公尺處放置故障標誌", isHazard: false, explanation: "提早警示後方。" },
            { text: "所有人盡速退到護欄外或安全處所等待救援", isHazard: false, explanation: "人員遠離車道才是最安全的。" }
        ]
    },
    {
        id: 25,
        title: "遇見行為異常的陌生人",
        description: "走在晚上沒什麼人的巷子裡，迎面走來一個大聲自言自語且步伐搖晃的人...",
        items: [
            { text: "覺得好奇，一直盯著他看", isHazard: true, explanation: "危險！一直盯著看可能會激怒對方，引發不可預測的攻擊行為。" },
            { text: "保持鎮定，自然且快速地從他較遠的另一側走過", isHazard: false, explanation: "保持距離，減少衝突機會。" },
            { text: "如果有商店，先走進去商店裡避開", isHazard: false, explanation: "尋找明亮及有人的庇護所。" },
            { text: "把手機拿在手上，隨時準備撥打110", isHazard: false, explanation: "保持警覺，做好求救準備。" }
        ]
    }
];
