import { HazardScene } from '../types';

export const normalScenes: HazardScene[] = [
  {
    "id": 1,
    "title": "廚房煮飯",
    "context": "媽媽正在廚房準備晚餐，瓦斯爐正在煮湯...",
    "items": [
      {
        "text": "在旁邊的流理台切菜",
        "isHazard": false,
        "explanation": "這是一般正常的廚房活動。"
      },
      {
        "text": "打開抽油煙機",
        "isHazard": false,
        "explanation": "保持通風是好習慣。"
      },
      {
        "text": "接電話後離開廚房去客廳聊天",
        "isHazard": true,
        "explanation": "非常危險！瓦斯爐開著絕對不能離開視線，可能引發火災。"
      },
      {
        "text": "把洗好的碗盤放在瀝水架上",
        "isHazard": false,
        "explanation": "安全的廚房整理順序。"
      }
    ]
  },
  {
    "id": 2,
    "title": "浴室洗澡",
    "context": "準備要洗澡，走進浴室裡...",
    "items": [
      {
        "text": "地上有剛洗完滴落的一攤水",
        "isHazard": true,
        "explanation": "濕滑的地板很容易造成跌倒，非常危險！應該要先擦乾或穿防滑鞋。"
      },
      {
        "text": "打開熱水器等水變熱",
        "isHazard": false,
        "explanation": "正常的洗澡步驟。"
      },
      {
        "text": "把換洗衣物放在架子上",
        "isHazard": false,
        "explanation": "很好的準備工作。"
      },
      {
        "text": "打開浴室的抽風機",
        "isHazard": false,
        "explanation": "這能幫助保持浴室乾燥。"
      }
    ]
  },
  {
    "id": 3,
    "title": "客廳休息",
    "context": "晚飯後大家在客廳看電視...",
    "items": [
      {
        "text": "沙發上放著幾個抱枕",
        "isHazard": false,
        "explanation": "舒服的休息環境。"
      },
      {
        "text": "延長線上插滿了各種高耗電電器",
        "isHazard": true,
        "explanation": "太危險了！延長線過載很容易電線走火。"
      },
      {
        "text": "桌上放著一杯溫水",
        "isHazard": false,
        "explanation": "隨時補充水分很好。"
      },
      {
        "text": "電視音量開在適中的大小",
        "isHazard": false,
        "explanation": "不會吵到鄰居，很棒。"
      }
    ]
  },
  {
    "id": 4,
    "title": "過馬路",
    "context": "走到十字路口，準備過馬路...",
    "items": [
      {
        "text": "走行人穿越道(斑馬線)",
        "isHazard": false,
        "explanation": "正確，請走斑馬線！"
      },
      {
        "text": "邊看手機邊過馬路",
        "isHazard": true,
        "explanation": "非常危險！過馬路一定要專心看路況燈號。"
      },
      {
        "text": "等待綠燈亮起",
        "isHazard": false,
        "explanation": "遵守交通號誌。"
      },
      {
        "text": "確認左右無來車",
        "isHazard": false,
        "explanation": "即使綠燈也要確認沒有闖紅燈的車。"
      }
    ]
  },
  {
    "id": 5,
    "title": "上下樓梯",
    "context": "正在走樓梯準備下樓...",
    "items": [
      {
        "text": "扶著手扶梯慢慢走",
        "isHazard": false,
        "explanation": "安全的下樓習慣。"
      },
      {
        "text": "看著階梯一步一步走",
        "isHazard": false,
        "explanation": "可以預防踩空跌倒。"
      },
      {
        "text": "穿著鞋帶沒綁好且過長的鞋子",
        "isHazard": true,
        "explanation": "危險！鞋帶可能會絆倒自己導致摔下樓梯。"
      },
      {
        "text": "靠右邊走，讓出走道",
        "isHazard": false,
        "explanation": "良好的禮儀與安全習慣。"
      }
    ]
  },
  {
    "id": 6,
    "title": "用火安全",
    "context": "冬天到了，家裡有一點冷...",
    "items": [
      {
        "text": "多穿一件外套保暖",
        "isHazard": false,
        "explanation": "這是最安全的保暖方法。"
      },
      {
        "text": "使用有安全標章的電暖器",
        "isHazard": false,
        "explanation": "使用合格電器比較有保障。"
      },
      {
        "text": "把衣服掛在電暖器上烘乾",
        "isHazard": true,
        "explanation": "非常危險！電暖器高溫很容易讓衣物起火。"
      },
      {
        "text": "喝一杯溫熱水保暖",
        "isHazard": false,
        "explanation": "好習慣！"
      }
    ]
  },
  {
    "id": 7,
    "title": "整理房間",
    "context": "週末在房間裡面大掃除...",
    "items": [
      {
        "text": "將不用的雜物清掉",
        "isHazard": false,
        "explanation": "保持環境整潔很好。"
      },
      {
        "text": "把剪刀美工刀用完隨手放在床上",
        "isHazard": true,
        "explanation": "危險！可能會被壓到或割傷，一定要收進抽屜。"
      },
      {
        "text": "將桌面擦拭乾淨",
        "isHazard": false,
        "explanation": "良好的衛生習慣。"
      },
      {
        "text": "把書本排在書架上",
        "isHazard": false,
        "explanation": "很棒的收納習慣。"
      }
    ]
  },
  {
    "id": 8,
    "title": "搭乘手扶梯",
    "context": "在百貨公司搭乘手扶梯到下一層樓...",
    "items": [
      {
        "text": "將腳跨出黃色警戒線站立",
        "isHazard": true,
        "explanation": "危險！容易讓衣物或鞋子被捲進手扶梯的縫隙。"
      },
      {
        "text": "緊握著黑色的扶手帶",
        "isHazard": false,
        "explanation": "這樣有重心比較穩。"
      },
      {
        "text": "面朝前方站好",
        "isHazard": false,
        "explanation": "隨時注意抵達狀況。"
      },
      {
        "text": "不推擠別人",
        "isHazard": false,
        "explanation": "保持距離最安全。"
      }
    ]
  },
  {
    "id": 9,
    "title": "吃東西",
    "context": "正在吃午餐...",
    "items": [
      {
        "text": "把大塊的肉切成小塊吃",
        "isHazard": false,
        "explanation": "比較好咀嚼與消化。"
      },
      {
        "text": "細嚼慢嚥",
        "isHazard": false,
        "explanation": "正確的飲食習慣。"
      },
      {
        "text": "一邊大笑一邊吞下貢丸",
        "isHazard": true,
        "explanation": "危險！容易導致噎到或食物掉入氣管。"
      },
      {
        "text": "吃完飯後喝口湯",
        "isHazard": false,
        "explanation": "可以幫助食物吞嚥。"
      }
    ]
  },
  {
    "id": 10,
    "title": "服藥安全",
    "context": "感覺很不舒服，準備吃藥...",
    "items": [
      {
        "text": "看著藥袋上面的名字確認",
        "isHazard": false,
        "explanation": "確認是自己的藥很重要。"
      },
      {
        "text": "配溫開水吞服",
        "isHazard": false,
        "explanation": "這是最安全的服藥方式。"
      },
      {
        "text": "把藥丸乾吞下去",
        "isHazard": true,
        "explanation": "危險！藥物可能會卡在食道造成發炎甚至潰瘍。"
      },
      {
        "text": "按時吃藥",
        "isHazard": false,
        "explanation": "遵守醫囑是正確的。"
      }
    ]
  },
  {
    "id": 11,
    "title": "夜間起床",
    "context": "睡到一半想上廁所...",
    "items": [
      {
        "text": "打開床頭燈或小夜燈",
        "isHazard": false,
        "explanation": "有光線才看得清楚道路。"
      },
      {
        "text": "坐在床邊等個十秒鐘再站起",
        "isHazard": false,
        "explanation": "可以防止姿勢性低血壓頭暈跌倒。"
      },
      {
        "text": "摸黑快速奔向廁所",
        "isHazard": true,
        "explanation": "非常危險！夜晚視線不佳很容易踢到東西或滑倒。"
      },
      {
        "text": "穿上防滑拖鞋",
        "isHazard": false,
        "explanation": "可以預防跌倒。"
      }
    ]
  },
  {
    "id": 12,
    "title": "插座放插頭",
    "context": "要幫手機充電...",
    "items": [
      {
        "text": "手濕濕的去拔插頭",
        "isHazard": true,
        "explanation": "非常危險！可能會觸電。"
      },
      {
        "text": "確認插頭有插到底",
        "isHazard": false,
        "explanation": "正確的使用方式。"
      },
      {
        "text": "握著插頭塑膠部分拔起",
        "isHazard": false,
        "explanation": "不要拉電線拔插頭才正確。"
      },
      {
        "text": "不在插座旁放置水杯",
        "isHazard": false,
        "explanation": "遠離水源較安全。"
      }
    ]
  },
  {
    "id": 13,
    "title": "拿高處物品",
    "context": "想拿放在櫃子最上層的衛生紙...",
    "items": [
      {
        "text": "拿一張有靠背且穩固的椅子站上去",
        "isHazard": false,
        "explanation": "正確的墊高工具。"
      },
      {
        "text": "請高個子的人幫忙",
        "isHazard": false,
        "explanation": "請人幫忙最安全。"
      },
      {
        "text": "踩在那種有輪子會滑動的旋轉椅上",
        "isHazard": true,
        "explanation": "非常危險！椅子滾動會導致整個人摔下來。"
      },
      {
        "text": "確認櫃子不會搖晃",
        "isHazard": false,
        "explanation": "注意環境安全。"
      }
    ]
  },
  {
    "id": 14,
    "title": "過期食品",
    "context": "冰箱裡有一罐果汁忘記喝了...",
    "items": [
      {
        "text": "查看瓶子上的保存期限",
        "isHazard": false,
        "explanation": "非常好的習慣。"
      },
      {
        "text": "看到過期了就丟掉",
        "isHazard": false,
        "explanation": "不要吃到壞掉的食物。"
      },
      {
        "text": "覺得應該沒壞，所以大口喝下去",
        "isHazard": true,
        "explanation": "危險！可能會造成嚴重腸胃炎甚至食物中毒。"
      },
      {
        "text": "倒掉時順便把瓶子洗乾淨回收",
        "isHazard": false,
        "explanation": "好習慣！"
      }
    ]
  },
  {
    "id": 15,
    "title": "地震發生",
    "context": "突然感覺到房子劇烈搖晃...",
    "items": [
      {
        "text": "立刻抱頭躲在堅固的桌子底下",
        "isHazard": false,
        "explanation": "正確的避難動作（趴下、掩護、穩住）。"
      },
      {
        "text": "趕快去開門確保逃生路線",
        "isHazard": false,
        "explanation": "有時間的話是可以的。"
      },
      {
        "text": "立刻衝進電梯準備下樓",
        "isHazard": true,
        "explanation": "極度危險！地震時電梯可能故障停電，會被困在裡面！"
      },
      {
        "text": "遠離玻璃窗戶旁",
        "isHazard": false,
        "explanation": "避免被震碎的玻璃割傷。"
      }
    ]
  },
  {
    "id": 16,
    "title": "颱風天出門",
    "context": "颱風天風雨交加，你準備外出...",
    "items": [
      {
        "text": "出門前確認天氣預報及停班停課資訊",
        "isHazard": false,
        "explanation": "了解天氣狀況能幫助自己做準備。"
      },
      {
        "text": "穿著雨衣和防水防滑的鞋子",
        "isHazard": false,
        "explanation": "能有效擋雨並防止滑倒。"
      },
      {
        "text": "撐著傘走在有很多大樹的人行道上",
        "isHazard": true,
        "explanation": "危險！強烈陣風可能會將樹枝吹斷砸傷人，撐傘也容易被風吹走或遮擋視線。"
      },
      {
        "text": "盡量走騎樓或室內連通道",
        "isHazard": false,
        "explanation": "可減少直接被強風豪雨侵襲。"
      }
    ]
  },
  {
    "id": 17,
    "title": "運動前的準備",
    "context": "你準備要去操場跑步運動...",
    "items": [
      {
        "text": "先做五到十分鐘的伸展拉筋暖身",
        "isHazard": false,
        "explanation": "暖身可以有效預防運動傷害。"
      },
      {
        "text": "穿著輕便吸汗的運動服與運動鞋",
        "isHazard": false,
        "explanation": "合適的穿著能讓運動更舒適安全。"
      },
      {
        "text": "完全不喝水，覺得忍到運動完再喝就好",
        "isHazard": true,
        "explanation": "危險！缺乏水分可能會導致脫水甚至中暑。"
      },
      {
        "text": "確認天氣不會太熱或太冷",
        "isHazard": false,
        "explanation": "適當的天氣才不會對身體造成過度負擔。"
      }
    ]
  },
  {
    "id": 18,
    "title": "使用美工刀",
    "context": "你正在用美工刀拆很大的網購包裹...",
    "items": [
      {
        "text": "把刀片推出很長來割紙箱",
        "isHazard": true,
        "explanation": "非常危險！刀片推太長容易應聲折斷並彈飛割傷眼睛或手。"
      },
      {
        "text": "刀片只推出一到兩節剛好的長度",
        "isHazard": false,
        "explanation": "這樣施力最穩固安全。"
      },
      {
        "text": "另一隻手放在刀片行進方向的後方",
        "isHazard": false,
        "explanation": "手不要放在刀口前方，避免滑刀割傷。"
      },
      {
        "text": "用完立刻把刀片收回",
        "isHazard": false,
        "explanation": "良好的安全習慣。"
      }
    ]
  },
  {
    "id": 19,
    "title": "吃火鍋",
    "context": "你和家人在餐廳吃著熱騰騰的火鍋...",
    "items": [
      {
        "text": "把生肉和熟通用同一雙筷子夾",
        "isHazard": true,
        "explanation": "危險！生食上的細菌會污染熟食，恐造成食物中毒。"
      },
      {
        "text": "使用專用的公筷和母匙來盛湯夾肉",
        "isHazard": false,
        "explanation": "衛生又安全的好習慣。"
      },
      {
        "text": "確認桌面上的卡式爐火源附近沒有衛生紙",
        "isHazard": false,
        "explanation": "遠離易燃物可避免火災。"
      },
      {
        "text": "等湯稍微涼一點再喝",
        "isHazard": false,
        "explanation": "避免燙傷食道和口腔。"
      }
    ]
  },
  {
    "id": 20,
    "title": "吃藥時間",
    "context": "到了吃感冒藥的時間了...",
    "items": [
      {
        "text": "配一大口白開水將藥丸吞下",
        "isHazard": false,
        "explanation": "是最正確安全的服藥方式。"
      },
      {
        "text": "因為覺得苦，所以配葡萄柚汁一起喝",
        "isHazard": true,
        "explanation": "危險！葡萄柚汁會與多種藥物產生交互作用，可能導致藥物中毒。"
      },
      {
        "text": "確認藥袋上的名字是自己的",
        "isHazard": false,
        "explanation": "吃錯藥會有不良反應。"
      },
      {
        "text": "照著藥袋上指示的劑量服用",
        "isHazard": false,
        "explanation": "服用過量或不足都不好。"
      }
    ]
  },
  {
    "id": 21,
    "title": "打掃廁所",
    "context": "你正準備清洗很久沒掃的浴廁...",
    "items": [
      {
        "text": "為了掃更乾淨，把漂白水和鹽酸混在一起用",
        "isHazard": true,
        "explanation": "極度危險！兩者混合會產生有毒的氯氣，吸入會致命！"
      },
      {
        "text": "戴上橡膠手套保護雙手",
        "isHazard": false,
        "explanation": "避免清潔劑傷害皮膚。"
      },
      {
        "text": "打開廁所窗戶和抽風機保持通風",
        "isHazard": false,
        "explanation": "可以避免吸入過多化學氣體。"
      },
      {
        "text": "按照清潔劑瓶身上的說明使用",
        "isHazard": false,
        "explanation": "正確使用最安全。"
      }
    ]
  },
  {
    "id": 22,
    "title": "騎腳踏車",
    "context": "你騎著腳踏車準備去附近的便利商店...",
    "items": [
      {
        "text": "戴上合適的安全帽",
        "isHazard": false,
        "explanation": "保護頭部非常重要。"
      },
      {
        "text": "晚上騎車時打開前後車燈",
        "isHazard": false,
        "explanation": "讓別人看見你，保障雙方安全。"
      },
      {
        "text": "邊騎車邊戴著耳機聽很大聲的音樂",
        "isHazard": true,
        "explanation": "危險！聽不到後方來車或環境聲音，容易發生車禍。"
      },
      {
        "text": "騎在自行車道或靠馬路右側",
        "isHazard": false,
        "explanation": "遵守交通規則。"
      }
    ]
  },
  {
    "id": 23,
    "title": "逛大賣場",
    "context": "你在大賣場推著購物車買東西...",
    "items": [
      {
        "text": "手放開推車，讓它自己在斜坡上滑行",
        "isHazard": true,
        "explanation": "危險！推車會撞到其他人或商品，造成受傷和損壞。"
      },
      {
        "text": "把比較重的物品放在推車底層",
        "isHazard": false,
        "explanation": "降低重心，推車才不易翻覆。"
      },
      {
        "text": "留意地板上「小心地滑」的黃色告示牌",
        "isHazard": false,
        "explanation": "有警覺心能避免滑倒。"
      },
      {
        "text": "慢慢轉彎，確認走道兩側沒有人",
        "isHazard": false,
        "explanation": "避免視線死角撞到人。"
      }
    ]
  },
  {
    "id": 24,
    "title": "睡前習慣",
    "context": "到了晚上睡覺的時間了...",
    "items": [
      {
        "text": "把手機放在床上充電並壓在枕頭底下",
        "isHazard": true,
        "explanation": "危險！手機充電會發熱，被悶住可能導致過熱起火燃燒。"
      },
      {
        "text": "睡前調暗房間燈光",
        "isHazard": false,
        "explanation": "幫助身體準備進入睡眠。"
      },
      {
        "text": "確認門窗和瓦斯都有關好",
        "isHazard": false,
        "explanation": "保障居家安全的好習慣。"
      },
      {
        "text": "手機放在遠離床鋪的桌上充電",
        "isHazard": false,
        "explanation": "安全又能避免半夜滑手機。"
      }
    ]
  },
  {
    "id": 25,
    "title": "提重物",
    "context": "地上有一個很重的箱子你需要把它搬上桌...",
    "items": [
      {
        "text": "直直地彎腰下去把箱子拉起來",
        "isHazard": true,
        "explanation": "危險！直接彎腰提重物非常容易導致腰部椎間盤突出或閃到腰。"
      },
      {
        "text": "先蹲下，背部打直，用大腿的力量站起來",
        "isHazard": false,
        "explanation": "這是正確且安全的搬重物姿勢。"
      },
      {
        "text": "把箱子抱靠近身體",
        "isHazard": false,
        "explanation": "這樣比較省力也能維持平衡。"
      },
      {
        "text": "如果太重就找人幫忙一起搬",
        "isHazard": false,
        "explanation": "不要勉強自己。"
      }
    ]
  },
  {
    "id": 26,
    "title": "在馬路玩耍",
    "context": "在馬路旁邊的騎樓踢足球，球跑到車道上。",
    "items": [
      {
        "text": "請大人去幫忙撿",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "去公園安全的地方玩",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "自己跑去車道上撿球",
        "isHazard": true,
        "explanation": "絕對不能自己跑去撿，會被車撞。"
      },
      {
        "text": "放棄那顆球等車少再說",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      }
    ]
  },
  {
    "id": 27,
    "title": "濕滑的浴室",
    "context": "剛洗完澡，浴室地板積水未乾。",
    "items": [
      {
        "text": "開抽風機保持乾燥",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "把水刮乾淨",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "穿止滑拖鞋慢慢走",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "在裡面奔跑嬉鬧",
        "isHazard": true,
        "explanation": "濕地區奔跑極易滑倒撞傷頭部。"
      }
    ]
  },
  {
    "id": 28,
    "title": "客廳打鬧",
    "context": "在客廳追逐，旁邊有玻璃茶几的尖角。",
    "items": [
      {
        "text": "繞著茶几玩鬼抓人",
        "isHazard": true,
        "explanation": "撞到玻璃尖角可能會嚴重割傷。"
      },
      {
        "text": "乖乖坐著看電視",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "去空曠的地方玩",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "玩靜態拼圖遊戲",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      }
    ]
  },
  {
    "id": 29,
    "title": "熱水壺",
    "context": "桌邊放著剛煮沸的熱水壺，熱氣直冒。",
    "items": [
      {
        "text": "去喝冰箱的冷水",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "等水涼了再說",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "請大人幫忙倒水",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "伸手去摸壺身或倒水",
        "isHazard": true,
        "explanation": "小孩不應自己倒熱水，會嚴重燙傷。"
      }
    ]
  },
  {
    "id": 30,
    "title": "插座拔插",
    "context": "剛洗完手，手還濕著想去拔插頭。",
    "items": [
      {
        "text": "用濕手直接拔插頭",
        "isHazard": true,
        "explanation": "水會導電，濕手拔插頭極易觸電。"
      },
      {
        "text": "先把手擦乾再拔",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "請大人幫忙",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "不碰電器",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      }
    ]
  },
  {
    "id": 31,
    "title": "盪鞦韆",
    "context": "公園裡有人在盪鞦韆盪得很高。",
    "items": [
      {
        "text": "直接從鞦韆正前方跑過去",
        "isHazard": true,
        "explanation": "會被鞦韆撞飛受重傷。"
      },
      {
        "text": "從鞦韆後面很遠的地方繞過",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "等他停下來再走",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "站遠遠的排隊",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      }
    ]
  },
  {
    "id": 32,
    "title": "拿剪刀",
    "context": "美勞課拿到一把鋒利的剪刀。",
    "items": [
      {
        "text": "用完立刻收進筆盒",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "把剪刀放在桌上別亂拿",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "把剪刀尖端朝下握著慢慢走",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "拿著剪刀在教室裡邊跑邊揮舞",
        "isHazard": true,
        "explanation": "跌倒時剪刀會刺傷自己或別人。"
      }
    ]
  },
  {
    "id": 33,
    "title": "下樓梯",
    "context": "學校剛打下課鐘，大家都急著下樓。",
    "items": [
      {
        "text": "扶著扶手慢慢走",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "邊滑手機邊跑下樓",
        "isHazard": true,
        "explanation": "容易踩空滾下樓梯並壓到別人。"
      },
      {
        "text": "不推擠別人",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "把手機收進口袋",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      }
    ]
  },
  {
    "id": 34,
    "title": "廚房炸物",
    "context": "媽媽正在廚房炸雞塊，油熱得劈啪作響。",
    "items": [
      {
        "text": "站在廚房外面等",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "靠很近探頭去看鍋底",
        "isHazard": true,
        "explanation": "熱油噴濺會燙傷臉部。"
      },
      {
        "text": "遠離熱源",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "幫忙佈置外面的餐桌",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      }
    ]
  },
  {
    "id": 35,
    "title": "吃果凍",
    "context": "拿到一個大顆的蒟蒻果凍。",
    "items": [
      {
        "text": "只吃適合小孩的小果凍",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "直接仰頭把整顆吸進去",
        "isHazard": true,
        "explanation": "大顆果凍極易堵住氣管造成窒息。"
      },
      {
        "text": "慢慢咬碎再吞",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "用湯匙切成小塊吃",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      }
    ]
  },
  {
    "id": 36,
    "title": "陌生人給糖",
    "context": "放學時有不認識的叔叔說要給你糖果。",
    "items": [
      {
        "text": "大聲說我不認識你",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "謝謝但拒絕他",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "開心地收下並跟他走",
        "isHazard": true,
        "explanation": "絕對不能拿陌生人東西，可能是壞人。"
      },
      {
        "text": "立刻跑回學校找老師",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      }
    ]
  },
  {
    "id": 37,
    "title": "關門手夾",
    "context": "手扶在門框邊緣站著發呆。",
    "items": [
      {
        "text": "關門前要看旁邊有沒有人",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "輕輕把門拉上",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "隨時注意手的位置不扶門框",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "別人沒注意就用力關門",
        "isHazard": true,
        "explanation": "手沒收回會被門夾斷手指。"
      }
    ]
  },
  {
    "id": 38,
    "title": "陽台攀爬",
    "context": "在十樓陽台，想看樓下的風景但太矮看不到。",
    "items": [
      {
        "text": "不要靠近陽台邊緣",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "從欄杆縫隙往下看",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "搬椅子墊在欄杆旁站上去看",
        "isHazard": true,
        "explanation": "重心不穩會直接墜樓。"
      },
      {
        "text": "請大人抱著看",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      }
    ]
  },
  {
    "id": 39,
    "title": "塑膠袋套頭",
    "context": "發現家裡有一個大塑膠袋覺得很好玩。",
    "items": [
      {
        "text": "跟普通的玩具玩",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "把它拿去當垃圾袋用",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "遠離塑膠袋",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "把它套在頭上當太空人",
        "isHazard": true,
        "explanation": "塑膠袋會阻礙呼吸造成窒息死亡。"
      }
    ]
  },
  {
    "id": 40,
    "title": "沒關火的爐子",
    "context": "瓦斯爐上還在煮湯，但大人跑出門倒垃圾了。",
    "items": [
      {
        "text": "不管它繼續玩自己的玩具",
        "isHazard": true,
        "explanation": "無人看管的爐火容易燒乾引發火災。"
      },
      {
        "text": "先幫忙把爐火關掉",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "趕緊叫其他大人來顧",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "保持注意力在裡面",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      }
    ]
  },
  {
    "id": 41,
    "title": "藥品亂吃",
    "context": "桌上放著五顏六色不知道什麼的藥丸。",
    "items": [
      {
        "text": "以為是糖果就拿起來吃",
        "isHazard": true,
        "explanation": "亂吃成藥或處方藥會導致嚴重中毒。"
      },
      {
        "text": "問大人那是什麼",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "生病聽從醫生指示才吃藥",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "絕對不拿來玩",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      }
    ]
  },
  {
    "id": 42,
    "title": "金屬進微波",
    "context": "想加熱包著鋁箔紙的麵包。",
    "items": [
      {
        "text": "把鋁箔紙拆掉換成可微波的盤子",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "不吃熱的直接吃",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "直接連著鋁箔紙放進微波爐",
        "isHazard": true,
        "explanation": "微波爐放金屬會產生火花引起爆炸火災。"
      },
      {
        "text": "用烤箱加熱",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      }
    ]
  },
  {
    "id": 43,
    "title": "乘車未繫帶",
    "context": "坐在車子後座，覺得安全帶太勒了。",
    "items": [
      {
        "text": "坐好不亂動",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "乖乖繫好安全帶",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "把安全帶解開並在後座站起來",
        "isHazard": true,
        "explanation": "遇到緊急煞車時會直接撞破玻璃飛出去。"
      },
      {
        "text": "坐在兒童安全座椅上",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      }
    ]
  },
  {
    "id": 44,
    "title": "過馬路闖燈",
    "context": "行人號誌綠燈只剩3秒，但你想過去。",
    "items": [
      {
        "text": "拔腿狂奔衝過去",
        "isHazard": true,
        "explanation": "跑到一半變紅燈會被起步的車子撞到。"
      },
      {
        "text": "退回人行道安全處",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "牽好大人的手等候",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "停在路口等下一個綠燈",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      }
    ]
  },
  {
    "id": 45,
    "title": "打雷躲樹下",
    "context": "在公園遇到大雷雨，周圍空曠。",
    "items": [
      {
        "text": "不要撐傘拿金屬物",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "跑到最高的大樹底下躲雨",
        "isHazard": true,
        "explanation": "打雷時在獨立大樹下最容易被雷劈中。"
      },
      {
        "text": "立刻跑進附近的室內",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "蹲低身體減少接觸面積",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      }
    ]
  },
  {
    "id": 46,
    "title": "玩打火機",
    "context": "在抽屜找到一個打火機。",
    "items": [
      {
        "text": "拿其他安全的玩具",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "不能玩火",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "交給大人保管",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "拿來點衛生紙覺得好玩",
        "isHazard": true,
        "explanation": "小小火苗會迅速擴大燒掉房子。"
      }
    ]
  },
  {
    "id": 47,
    "title": "手扶梯探頭",
    "context": "在百貨公司搭手扶梯往上。",
    "items": [
      {
        "text": "注意腳步不滑手機",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      },
      {
        "text": "不跨越黃色警戒線",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "乖乖站好手扶把手",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "把頭伸出扶手外往下看",
        "isHazard": true,
        "explanation": "頭和脖子容易被樓層夾角卡住。"
      }
    ]
  },
  {
    "id": 48,
    "title": "馬路溜冰",
    "context": "剛買了直排輪鞋很興奮。",
    "items": [
      {
        "text": "穿戴好護具再溜",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "直接穿去馬路上溜",
        "isHazard": true,
        "explanation": "無法控制速度且無防備，會被車撞。"
      },
      {
        "text": "去公園安全場地溜",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "在規定區域內練習",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      }
    ]
  },
  {
    "id": 49,
    "title": "誤飲液體",
    "context": "看到洗手台下有一瓶裝在寶特瓶的液體。",
    "items": [
      {
        "text": "以為是飲料直接喝下去",
        "isHazard": true,
        "explanation": "那可能是清潔劑或漂白水，會灼傷食道。"
      },
      {
        "text": "絕對不能喝來路不明的液體",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "拿給大人確認",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "只喝飲水機的水",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      }
    ]
  },
  {
    "id": 50,
    "title": "樓梯間推擠",
    "context": "放學在樓梯遇到同學走很慢。",
    "items": [
      {
        "text": "從後面推他一把叫他快點",
        "isHazard": true,
        "explanation": "被推的人會滾落樓梯嚴重受傷。"
      },
      {
        "text": "說聲借過再走",
        "isHazard": false,
        "explanation": "這是安全的選擇。"
      },
      {
        "text": "在後面耐心等待",
        "isHazard": false,
        "explanation": "這是正確的處理方式。"
      },
      {
        "text": "保持安全距離",
        "isHazard": false,
        "explanation": "這樣做可以避免危險發生。"
      }
    ]
  }
];

export const advancedScenes: HazardScene[] = [
  {
    "id": 1,
    "title": "戶外散步",
    "context": "去公園散步，路上的狀況...",
    "items": [
      {
        "text": "走在有樹蔭的平坦人行道上",
        "isHazard": false,
        "explanation": "很棒的散步地點選擇。"
      },
      {
        "text": "綠燈閃爍時快步小跑過馬路",
        "isHazard": true,
        "explanation": "危險！長輩跌倒風險高，綠燈閃爍時應該等下一個綠燈，不應奔跑。"
      },
      {
        "text": "帶著水壺適時補充水分",
        "isHazard": false,
        "explanation": "很好的保健習慣。"
      },
      {
        "text": "穿著包覆性好的運動鞋",
        "isHazard": false,
        "explanation": "能保護雙腳的好選擇。"
      }
    ]
  },
  {
    "id": 2,
    "title": "使用清潔劑",
    "context": "準備要把廁所的黴菌刷洗乾淨...",
    "items": [
      {
        "text": "戴上手套與口罩",
        "isHazard": false,
        "explanation": "保護皮膚與呼吸道。"
      },
      {
        "text": "把漂白水跟鹽酸混在一起用，覺得比較洗得乾淨",
        "isHazard": true,
        "explanation": "極度危險！會產生致命的毒氣(氯氣)，絕對不可混合！"
      },
      {
        "text": "打開廁所窗戶與抽風機",
        "isHazard": false,
        "explanation": "保持通風非常重要。"
      },
      {
        "text": "按照標籤說明稀釋漂白水",
        "isHazard": false,
        "explanation": "正確使用清潔用品。"
      }
    ]
  },
  {
    "id": 3,
    "title": "高血壓患者保健",
    "context": "有高血壓病史的長輩在冬天的早晨...",
    "items": [
      {
        "text": "起床前在被窩裡先活動一下手腳",
        "isHazard": false,
        "explanation": "可以讓身體暖機。"
      },
      {
        "text": "立刻掀開棉被，馬上走到冷空氣中",
        "isHazard": true,
        "explanation": "危險！溫差過大會讓血管瞬間收縮，增加中風風險。"
      },
      {
        "text": "在床邊放一件外套，起床馬上穿上",
        "isHazard": false,
        "explanation": "保持溫暖是預防心血管疾病的重點。"
      },
      {
        "text": "起床後喝一杯溫開水",
        "isHazard": false,
        "explanation": "幫助血液循環。"
      }
    ]
  },
  {
    "id": 4,
    "title": "陌生來電",
    "context": "手機接到一通陌生號碼打來的電話...",
    "items": [
      {
        "text": "對方說你的帳戶被凍結，要求點擊簡訊連結",
        "isHazard": true,
        "explanation": "危險！這是標準的詐騙手法，點擊連結會被盜取個資。"
      },
      {
        "text": "對於不確定的電話，先說先掛掉，然後打給家人確認",
        "isHazard": false,
        "explanation": "提高警覺的好方法。"
      },
      {
        "text": "如果有疑問，可以撥打165反詐騙專線",
        "isHazard": false,
        "explanation": "正確的求助管道。"
      },
      {
        "text": "不隨便告訴對方自己的身分證字號",
        "isHazard": false,
        "explanation": "保護自己的個資安全。"
      }
    ]
  },
  {
    "id": 5,
    "title": "長照輔具使用",
    "context": "使用助行器走路復健時...",
    "items": [
      {
        "text": "穿著有防滑底的鞋子",
        "isHazard": false,
        "explanation": "減少滑倒的風險。"
      },
      {
        "text": "在鋪有許多小地毯的客廳裡走動",
        "isHazard": true,
        "explanation": "危險！助行器很容易卡到地毯邊緣造成跌倒。"
      },
      {
        "text": "確保助行器的四個腳墊沒有嚴重磨損",
        "isHazard": false,
        "explanation": "定期檢查輔具是很重要的。"
      },
      {
        "text": "將助行器放在身體正前方",
        "isHazard": false,
        "explanation": "正確的使用姿勢。"
      }
    ]
  },
  {
    "id": 6,
    "title": "燙傷處理",
    "context": "煮湯時不小心被熱水燙到手...",
    "items": [
      {
        "text": "立刻到水龍頭下沖冷水15分鐘",
        "isHazard": false,
        "explanation": "「沖脫泡蓋送」的基礎第一步。"
      },
      {
        "text": "在傷口上塗抹牙膏、醬油等偏方",
        "isHazard": true,
        "explanation": "危險！會造成組織進一步受損或增加細菌感染風險。"
      },
      {
        "text": "用乾淨的紗布輕輕蓋住患部",
        "isHazard": false,
        "explanation": "保護傷口。"
      },
      {
        "text": "如果起水泡，絕對不要弄破",
        "isHazard": false,
        "explanation": "避免感染的正確做法。"
      }
    ]
  },
  {
    "id": 7,
    "title": "電動代步車上路",
    "context": "阿公騎著醫療用電動代步車出門...",
    "items": [
      {
        "text": "開在快車道上跟著汽車一起等紅燈",
        "isHazard": true,
        "explanation": "極危險！電動代步車屬於行人輔具，依法應該走人行道或靠路邊走。"
      },
      {
        "text": "在車上貼上反光貼紙",
        "isHazard": false,
        "explanation": "可以增加夜間被看到的機會。"
      },
      {
        "text": "遵守行人交通號誌過馬路",
        "isHazard": false,
        "explanation": "正確的用路觀念。"
      },
      {
        "text": "轉彎時先看看左右",
        "isHazard": false,
        "explanation": "確保行車安全。"
      }
    ]
  },
  {
    "id": 8,
    "title": "糖尿病足防護",
    "context": "患有糖尿病的人在日常生活中...",
    "items": [
      {
        "text": "每天檢查腳底有沒有小傷口",
        "isHazard": false,
        "explanation": "因為糖尿病患者足部感覺較遲鈍，需要天天視力檢查。"
      },
      {
        "text": "喜歡光著腳在家裡走來走去",
        "isHazard": true,
        "explanation": "危險！很容易不小心踩到東西受傷而自己卻沒感覺，導致嚴重感染。"
      },
      {
        "text": "穿著吸汗透氣的純棉襪子",
        "isHazard": false,
        "explanation": "保持足部乾燥與保護。"
      },
      {
        "text": "洗澡前先用手確認水溫不會太燙",
        "isHazard": false,
        "explanation": "避免燙傷。"
      }
    ]
  },
  {
    "id": 9,
    "title": "微波爐使用",
    "context": "打算用微波爐加熱便當...",
    "items": [
      {
        "text": "把有金屬邊花紋的碗放進去微波",
        "isHazard": true,
        "explanation": "極危險！金屬在微波爐裡會產生火花甚至引起爆炸！"
      },
      {
        "text": "使用標示『可微波』的玻璃保鮮盒",
        "isHazard": false,
        "explanation": "安全的容器選擇。"
      },
      {
        "text": "把食物均勻鋪平再加熱",
        "isHazard": false,
        "explanation": "可以熱得比較均勻。"
      },
      {
        "text": "如果食物有帶殼（如栗子、雞蛋），絕對不放進去",
        "isHazard": false,
        "explanation": "密閉殼類會在內部產生壓力而爆炸。"
      }
    ]
  },
  {
    "id": 10,
    "title": "長時間久坐",
    "context": "在冷氣房裡連續看了好幾個小時的電視...",
    "items": [
      {
        "text": "每小時起來走動倒杯水",
        "isHazard": false,
        "explanation": "很好，避免下肢血液循環不良。"
      },
      {
        "text": "感覺腿部有些腫脹疼痛，還是繼續坐著不動",
        "isHazard": true,
        "explanation": "危險！這可能是深部靜脈栓塞的徵兆，久坐不動容易造成血栓。"
      },
      {
        "text": "坐著時稍微轉動腳踝",
        "isHazard": false,
        "explanation": "幫助血液回流。"
      },
      {
        "text": "保持背部有支撐的良好坐姿",
        "isHazard": false,
        "explanation": "保護脊椎。"
      }
    ]
  },
  {
    "id": 11,
    "title": "網路交友",
    "context": "你在網路上認識一個說他住國外、長得很帥的網友...",
    "items": [
      {
        "text": "對方說生病急需一筆錢，馬上匯過去",
        "isHazard": true,
        "explanation": "危險！涉及金錢幾乎100%是詐騙！"
      },
      {
        "text": "保護自己的家庭住址與身分證字號",
        "isHazard": false,
        "explanation": "很好的隱私防護意識。"
      },
      {
        "text": "遇到懷疑的點，可以上網搜尋類似手法的案例",
        "isHazard": false,
        "explanation": "查證是很重要的。"
      },
      {
        "text": "如果約見面，選擇人多的公共場所",
        "isHazard": false,
        "explanation": "保護自己人身安全。"
      }
    ]
  },
  {
    "id": 12,
    "title": "提重物",
    "context": "準備把地上的一大箱重物搬起來...",
    "items": [
      {
        "text": "彎下腰，雙腿打直直接把箱子拔起來",
        "isHazard": true,
        "explanation": "極危險！這樣的姿勢會讓下背部(腰椎)承受巨大壓力，很容易閃到腰或椎間盤突出。"
      },
      {
        "text": "蹲下身，讓物品靠近身體",
        "isHazard": false,
        "explanation": "正確的起手勢。"
      },
      {
        "text": "用大腿的力量站起來",
        "isHazard": false,
        "explanation": "大腿肌肉強壯，可以保護腰部。"
      },
      {
        "text": "如果太重就推車或找人幫忙",
        "isHazard": false,
        "explanation": "不要逞強是才是最安全的。"
      }
    ]
  },
  {
    "id": 13,
    "title": "安眠藥使用",
    "context": "最近睡不好，醫生開了安眠藥...",
    "items": [
      {
        "text": "配著一小杯紅酒吞服，想說會更好睡",
        "isHazard": true,
        "explanation": "致命危險！酒精會加強安眠藥的鎮靜作用，可能導致呼吸抑制甚至休克！"
      },
      {
        "text": "吃完藥立刻平躺準備睡覺",
        "isHazard": false,
        "explanation": "吃完藥後可能會頭暈，躺好最安全。"
      },
      {
        "text": "遵照醫生開的劑量使用",
        "isHazard": false,
        "explanation": "不可以自己隨便加藥。"
      },
      {
        "text": "半夜起來上廁所時動作放慢",
        "isHazard": false,
        "explanation": "預防安眠藥引起的跌倒。"
      }
    ]
  },
  {
    "id": 14,
    "title": "長途開車(或騎車)",
    "context": "準備連續開車三個小時返鄉...",
    "items": [
      {
        "text": "前一晚睡飽八小時",
        "isHazard": false,
        "explanation": "確保精神狀態良好。"
      },
      {
        "text": "即使已經頻頻打哈欠點頭，還是咬牙硬開",
        "isHazard": true,
        "explanation": "極其危險！疲勞駕駛的危險程度等同酒駕，極易發生重大車禍！"
      },
      {
        "text": "每開一個半小時就進休息站休息15分鐘",
        "isHazard": false,
        "explanation": "非常好的適當休息規劃。"
      },
      {
        "text": "保持車內空氣流通",
        "isHazard": false,
        "explanation": "有助於保持清醒。"
      }
    ]
  },
  {
    "id": 15,
    "title": "瓦斯外洩",
    "context": "一進家門，聞到很濃的瓦斯臭味...",
    "items": [
      {
        "text": "立刻打開電風扇和抽油煙機想把氣味吹走",
        "isHazard": true,
        "explanation": "災難性危險！開啟開關會產生微小火花，瞬間引發氣爆！"
      },
      {
        "text": "動作輕緩地推開窗戶讓空氣流通",
        "isHazard": false,
        "explanation": "輕推窗戶避免產生金屬摩擦的火花。"
      },
      {
        "text": "立刻離開現場並在室外打119報警",
        "isHazard": false,
        "explanation": "確保自己在安全的地方再求救。"
      },
      {
        "text": "關閉瓦斯總開關（如果安全許可的情況下）",
        "isHazard": false,
        "explanation": "可以阻斷洩漏源。"
      }
    ]
  },
  {
    "id": 16,
    "title": "處理網購包裹",
    "description": "你收到一個印有不明寄件人的包裹，並要求貨到付款...",
    "items": [
      {
        "text": "二話不說直接付錢給物流司機",
        "isHazard": true,
        "explanation": "危險！這極高機率是幽靈包裹詐騙，付了錢就很難拿回來。"
      },
      {
        "text": "先拒收包裹，去查詢近期的訂單紀錄確認",
        "isHazard": false,
        "explanation": "謹慎確認能防範詐騙。"
      },
      {
        "text": "看外觀包裝是否有奇怪的膠帶痕跡",
        "isHazard": false,
        "explanation": "留意可疑包裹外觀。"
      },
      {
        "text": "如果不確定，拍照並與家人朋友確認",
        "isHazard": false,
        "explanation": "尋求第三方協助判斷。"
      }
    ]
  },
  {
    "id": 17,
    "title": "下載免費軟體",
    "description": "你需要一個電腦繪圖軟體，但在網路上找到一個「免費破解版」...",
    "items": [
      {
        "text": "立刻點擊下載並全部按「允許安裝」",
        "isHazard": true,
        "explanation": "危險！破解版通常夾帶木馬病毒或勒索軟體，會盜取個資或鎖死電腦。"
      },
      {
        "text": "去官方網站尋找是否有試用版或學生版",
        "isHazard": false,
        "explanation": "使用官方合法軟體才安全。"
      },
      {
        "text": "尋求開源(Open Source)的免費替代軟體",
        "isHazard": false,
        "explanation": "安全的替代方案。"
      },
      {
        "text": "安裝前先用防毒軟體掃描下載的檔案",
        "isHazard": false,
        "explanation": "多一層安全防護。"
      }
    ]
  },
  {
    "id": 18,
    "title": "高壓電塔旁活動",
    "description": "一群人到郊外放風箏，旁邊有高壓電塔...",
    "items": [
      {
        "text": "為了讓風箏飛更高，故意跑到電塔正下方放",
        "isHazard": true,
        "explanation": "極度危險！風箏線若碰到高壓電線會瞬間導電，導致嚴重燒傷甚至死亡。"
      },
      {
        "text": "遠離電塔，尋找空曠安全的草地",
        "isHazard": false,
        "explanation": "保持安全距離。"
      },
      {
        "text": "留意頭頂上方是否有其他電線",
        "isHazard": false,
        "explanation": "隨時注意環境風險。"
      },
      {
        "text": "若風箏不慎卡在樹上，不要貿然攀爬拿取",
        "isHazard": false,
        "explanation": "避免摔傷或觸電。"
      }
    ]
  },
  {
    "id": 19,
    "title": "銀行ATM操作",
    "description": "你在ATM領錢時，有人一直緊貼在你背後看...",
    "items": [
      {
        "text": "覺得沒關係，大方地慢慢按下密碼",
        "isHazard": true,
        "explanation": "危險！密碼被偷瞄可能導致存款被盜領。"
      },
      {
        "text": "用身體和另一隻手遮住數字鍵盤再按密碼",
        "isHazard": false,
        "explanation": "保護隱私的基本動作。"
      },
      {
        "text": "請對方退後一點，保持安全距離",
        "isHazard": false,
        "explanation": "勇敢維護自己的權益。"
      },
      {
        "text": "如果不對勁，立刻取消交易並換一台機器",
        "isHazard": false,
        "explanation": "警覺心高能保護財產。"
      }
    ]
  },
  {
    "id": 20,
    "title": "使用公共微波爐",
    "description": "在便利商店用公共微波爐加熱午餐...",
    "items": [
      {
        "text": "直接把帶有鋁箔包裝的食物放進去微波",
        "isHazard": true,
        "explanation": "危險！金屬在微波爐裡會產生高壓電弧，引起火花甚至爆炸。"
      },
      {
        "text": "確認餐盒上標有「可微波」的標誌",
        "isHazard": false,
        "explanation": "確保材質安全不釋放毒素。"
      },
      {
        "text": "微波前先將便當蓋稍微打開一個小縫",
        "isHazard": false,
        "explanation": "讓蒸汽排出避免悶爆。"
      },
      {
        "text": "拿取時墊著紙巾或毛巾避免燙傷",
        "isHazard": false,
        "explanation": "保護雙手。"
      }
    ]
  },
  {
    "id": 21,
    "title": "收到法院傳票簡訊",
    "description": "手機突然收到一則稱你「涉嫌洗錢，請點擊連結查看傳票」的簡訊...",
    "items": [
      {
        "text": "因為太害怕，立刻點擊連結並輸入身分證字號",
        "isHazard": true,
        "explanation": "危險！這是經典的釣魚簡訊詐騙，點擊連結可能會下載惡意程式或被盜取個資。"
      },
      {
        "text": "直接將簡訊刪除並封鎖該號碼",
        "isHazard": false,
        "explanation": "不予理會是最好的應對。"
      },
      {
        "text": "撥打165反詐騙專線查證",
        "isHazard": false,
        "explanation": "尋求官方協助求證。"
      },
      {
        "text": "自己上網去司法院網站查詢，而不是點簡訊連結",
        "isHazard": false,
        "explanation": "主動從安全管道查證。"
      }
    ]
  },
  {
    "id": 22,
    "title": "深山迷路",
    "description": "跟朋友爬山時走散了，而且天色開始變暗...",
    "items": [
      {
        "text": "為了趕快找到出路，在黑暗中拼命在草叢裡亂跑",
        "isHazard": true,
        "explanation": "極度危險！可能跌落山谷、被蛇咬，且會大量消耗體力並迷失更深。"
      },
      {
        "text": "留在原地，吹哨子或發出聲響等待救援",
        "isHazard": false,
        "explanation": "原地待援(STOP原則)是迷路時存活率最高的方法。"
      },
      {
        "text": "穿上保暖衣物，尋找能避風的地方",
        "isHazard": false,
        "explanation": "防止失溫是最重要的生存關鍵。"
      },
      {
        "text": "手機關閉不必要的APP以節省電量",
        "isHazard": false,
        "explanation": "保留電力對外求救。"
      }
    ]
  },
  {
    "id": 23,
    "title": "在國外餐廳點餐",
    "description": "你在國外旅行，本身對帶殼海鮮嚴重過敏...",
    "items": [
      {
        "text": "看不懂菜單就隨便指一個看起來好吃的",
        "isHazard": true,
        "explanation": "致命危險！如果點到含有過敏原的食物，在外國可能難以及時就醫而休克。"
      },
      {
        "text": "用手機翻譯軟體確實翻譯每一個食材",
        "isHazard": false,
        "explanation": "謹慎確認成分。"
      },
      {
        "text": "準備一張當地語言的「我對海鮮嚴重過敏」的字卡給服務生",
        "isHazard": false,
        "explanation": "雙重保障自己的安全。"
      },
      {
        "text": "隨身攜帶過敏急救藥物（如腎上腺素筆）",
        "isHazard": false,
        "explanation": "以備不時之需。"
      }
    ]
  },
  {
    "id": 24,
    "title": "汽車拋錨在高速公路",
    "description": "開車在高速公路上，車子突然失去動力停在車道上...",
    "items": [
      {
        "text": "所有人都留在車內滑手機等拖吊車來",
        "isHazard": true,
        "explanation": "極度危險！後方車輛極可能煞車不及發生二次追撞，嚴重傷亡！"
      },
      {
        "text": "立刻按下雙黃燈（危險警告燈）",
        "isHazard": false,
        "explanation": "警告後方來車。"
      },
      {
        "text": "在車輛後方50-100公尺處放置故障標誌",
        "isHazard": false,
        "explanation": "提早警示後方。"
      },
      {
        "text": "所有人盡速退到護欄外或安全處所等待救援",
        "isHazard": false,
        "explanation": "人員遠離車道才是最安全的。"
      }
    ]
  },
  {
    "id": 25,
    "title": "遇見行為異常的陌生人",
    "description": "走在晚上沒什麼人的巷子裡，迎面走來一個大聲自言自語且步伐搖晃的人...",
    "items": [
      {
        "text": "覺得好奇，一直盯著他看",
        "isHazard": true,
        "explanation": "危險！一直盯著看可能會激怒對方，引發不可預測的攻擊行為。"
      },
      {
        "text": "保持鎮定，自然且快速地從他較遠的另一側走過",
        "isHazard": false,
        "explanation": "保持距離，減少衝突機會。"
      },
      {
        "text": "如果有商店，先走進去商店裡避開",
        "isHazard": false,
        "explanation": "尋找明亮及有人的庇護所。"
      },
      {
        "text": "把手機拿在手上，隨時準備撥打110",
        "isHazard": false,
        "explanation": "保持警覺，做好求救準備。"
      }
    ]
  },
  {
    "id": 26,
    "title": "化學品無標示",
    "context": "化學倉庫裡有幾桶液體沒有貼危害標示。",
    "items": [
      {
        "text": "通報工安人員處理",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "打開蓋子聞味道確認",
        "isHazard": true,
        "explanation": "誤吸有毒氣體或接觸腐蝕液體會致命。"
      },
      {
        "text": "查詢物質安全資料表(SDS)",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "遠離不明廢液",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      }
    ]
  },
  {
    "id": 27,
    "title": "堆高機不當使用",
    "context": "廠區人員為了省事，找堆高機運人。",
    "items": [
      {
        "text": "勸阻同事不當操作",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "站在堆高機或棧板上隨之升空",
        "isHazard": true,
        "explanation": "高處墜落的機率極高，違反職安法規。"
      },
      {
        "text": "搭乘樓梯",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "使用合格的高空作業車",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      }
    ]
  },
  {
    "id": 28,
    "title": "延長線多重串接",
    "context": "辦公室座位不夠，員工把多條延長線串在一起用。",
    "items": [
      {
        "text": "插滿吹風機及暖爐等高耗電設備",
        "isHazard": true,
        "explanation": "絕對會過載發熱並引發電線走火。"
      },
      {
        "text": "重新拉標準獨立電線",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "拔除不用電器",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "使用有過載保護的延長線",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      }
    ]
  },
  {
    "id": 29,
    "title": "逃生門阻擋",
    "context": "大樓管委會嫌麻煩，把安全梯門上鎖。",
    "items": [
      {
        "text": "立刻向建管機關檢舉",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "清除門後雜物",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "要求管委會保持暢通",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "覺得沒關係反正不會有火災",
        "isHazard": true,
        "explanation": "發生火警時無法逃生將導致嚴重傷亡。"
      }
    ]
  },
  {
    "id": 30,
    "title": "夜間無燈騎車",
    "context": "晚上在鄉間小路騎機車，路燈壞掉。",
    "items": [
      {
        "text": "逆向行駛或不開大燈",
        "isHazard": true,
        "explanation": "視線不良極易造成對撞或自摔死亡。"
      },
      {
        "text": "注意反光標誌",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "開大燈並減速慢行",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "靠右側邊緣行駛",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      }
    ]
  },
  {
    "id": 31,
    "title": "高處無安全帶",
    "context": "在三樓外牆進行冷氣維修作業。",
    "items": [
      {
        "text": "貪圖方便不穿戴背負式安全帶",
        "isHazard": true,
        "explanation": "一旦踩空就會直接墜落致死。"
      },
      {
        "text": "確實掛好安全繩防墜",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "搭設安全護欄",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "戴安全帽",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      }
    ]
  },
  {
    "id": 32,
    "title": "大型車內輪差",
    "context": "騎車在預拌混凝土車的右前方停等紅燈。",
    "items": [
      {
        "text": "保持兩公尺以上距離",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "退後讓大車先轉",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "絕對不併行通過路口",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "綠燈一亮立刻起步平行轉彎",
        "isHazard": true,
        "explanation": "大車有內輪差死角，會被捲入車底輾斃。"
      }
    ]
  },
  {
    "id": 33,
    "title": "瓦斯外洩",
    "context": "回到家聞到非常濃烈的瓦斯臭味。",
    "items": [
      {
        "text": "打開電燈開關檢查",
        "isHazard": true,
        "explanation": "開關電器的微小火花會瞬間引爆瓦斯。"
      },
      {
        "text": "輕輕打開窗戶通風",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "立刻離開並打119",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "禁止使用任何火源",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      }
    ]
  },
  {
    "id": 34,
    "title": "粉塵作業場所",
    "context": "在麵粉廠、木材廠的密閉機房內工作。",
    "items": [
      {
        "text": "嚴格禁火並加強通風",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "點火抽菸或使用切割粗糙工具",
        "isHazard": true,
        "explanation": "粉塵瀰漫遇火花會引發嚴重的粉塵爆炸。"
      },
      {
        "text": "戴上防塵口罩",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "清掃積塵",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      }
    ]
  },
  {
    "id": 35,
    "title": "疲勞駕駛",
    "context": "開車上國道已經連開四個小時，頻頻打盹。",
    "items": [
      {
        "text": "硬撐著繼續開想早點到",
        "isHazard": true,
        "explanation": "打瞌睡一秒鐘就會偏離車道釀成連環車禍。"
      },
      {
        "text": "就近下交流道或進休息站睡覺",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "換人駕駛",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "喝咖啡並稍微休息",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      }
    ]
  },
  {
    "id": 36,
    "title": "受困電梯",
    "context": "搭乘老舊電梯突然停電卡在半空中。",
    "items": [
      {
        "text": "保持冷靜",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "用手機求救",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "按緊急通話鈕耐心等待救援",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "強行扳開內部電梯門試圖爬出去",
        "isHazard": true,
        "explanation": "若電梯突然恢復動力，人會被當場夾斷。"
      }
    ]
  },
  {
    "id": 37,
    "title": "火災遭遇濃煙",
    "context": "打開房門發現走廊已經佈滿黑色高溫濃煙。",
    "items": [
      {
        "text": "關門並用濕毛巾塞門縫待援",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "憋氣試圖跑過走廊逃生",
        "isHazard": true,
        "explanation": "吸入一口高溫毒煙就會昏迷窒息死亡。"
      },
      {
        "text": "採低姿勢避開上方濃煙",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "在有窗戶的房間呼救",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      }
    ]
  },
  {
    "id": 38,
    "title": "溺水救援",
    "context": "在溪邊看到朋友落水大聲呼救。",
    "items": [
      {
        "text": "直接跳下水裡試圖拉他",
        "isHazard": true,
        "explanation": "沒有受過救援訓練會被溺水者拖下水雙雙溺斃。"
      },
      {
        "text": "撥打119",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "丟木板、救生圈或繩子給他",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "大聲呼救找救援",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      }
    ]
  },
  {
    "id": 39,
    "title": "動物咬傷",
    "context": "在野外被野生獼猴或流浪狗嚴重咬傷。",
    "items": [
      {
        "text": "觀察動物特徵告知醫師",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "用大量清水沖洗並立刻送醫",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "只用衛生紙擦擦就繼續玩",
        "isHazard": true,
        "explanation": "可能感染狂犬病或破傷風，延誤就醫會致命。"
      },
      {
        "text": "施打疫苗",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      }
    ]
  },
  {
    "id": 40,
    "title": "颱風天觀浪",
    "context": "強襲颱風發布警報，海邊風浪極大。",
    "items": [
      {
        "text": "乖乖待在家裡防颱",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "去海邊觀浪或釣魚",
        "isHazard": true,
        "explanation": "隨時會有瘋狗浪將人捲走，必定喪命。"
      },
      {
        "text": "檢查門窗是否牢固",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "準備手電筒及糧食",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      }
    ]
  },
  {
    "id": 41,
    "title": "下水道缺氧",
    "context": "工人在清洗下水道人孔內部。",
    "items": [
      {
        "text": "不測量氣體直接爬下去",
        "isHazard": true,
        "explanation": "下水道容易氧氣不足或有毒氣，下去即窒息昏迷。"
      },
      {
        "text": "事前以抽風機通風換氣",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "外面有監視人員配置",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "測量氣體濃度安全再進入",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      }
    ]
  },
  {
    "id": 42,
    "title": "高溫熱傷害",
    "context": "夏天正午在建築工地連續曝曬工作四小時。",
    "items": [
      {
        "text": "穿著透氣衣物",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "每小時喝足夠的水並到陰涼處休息",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "注意是否有暈眩症狀",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "為了趕工不喝水不休息",
        "isHazard": true,
        "explanation": "極易引發熱衰竭或熱中暑，嚴重可致死。"
      }
    ]
  },
  {
    "id": 43,
    "title": "機械捲夾",
    "context": "操作車床或會旋轉的動力機械時。",
    "items": [
      {
        "text": "戴手套並穿寬鬆長袖衣服",
        "isHazard": true,
        "explanation": "手套和衣服很容易被捲入機器，扯斷手臂。"
      },
      {
        "text": "穿著合適連身工作服",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "確認緊急停止按鈕可用",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "束緊袖口且不戴手套",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      }
    ]
  },
  {
    "id": 44,
    "title": "電鍍防護",
    "context": "進行電焊作業時覺得面罩太重。",
    "items": [
      {
        "text": "只戴墨鏡或裸眼直視電弧",
        "isHazard": true,
        "explanation": "強烈電弧光會造成電光性眼炎，長期導致失明。"
      },
      {
        "text": "穿戴防護皮手套衣物",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "全程戴好合格的電焊面罩",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "在周圍設置遮光屏",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      }
    ]
  },
  {
    "id": 45,
    "title": "吊車作業",
    "context": "看到工地的大型鐵架正在由起重機吊掛半空中。",
    "items": [
      {
        "text": "從吊掛物正下方走過去",
        "isHazard": true,
        "explanation": "鋼索斷裂或物品掉落會直接把人砸成肉泥。"
      },
      {
        "text": "戴好安全帽",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "繞道而行確保不在作業半徑內",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "聽從現場交管人員指示",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      }
    ]
  },
  {
    "id": 46,
    "title": "實驗室急救",
    "context": "同事眼睛不小心被強效化學洗劑噴到。",
    "items": [
      {
        "text": "沖洗後立刻就醫",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "用手搓揉眼睛",
        "isHazard": true,
        "explanation": "搓揉會擴大傷害，甚至導致角膜灼傷失明。"
      },
      {
        "text": "平時作業須戴護目鏡",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "立刻使用洗眼器大量沖洗15分鐘以上",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      }
    ]
  },
  {
    "id": 47,
    "title": "鍋爐壓力",
    "context": "鍋爐的壓力表已經超過紅線且持續上升。",
    "items": [
      {
        "text": "立刻停機並進行緊急洩壓處置",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "繼續加溫認為等一下就好",
        "isHazard": true,
        "explanation": "壓力過高未洩壓會引發災難性鍋爐爆炸。"
      },
      {
        "text": "定時檢查安全閥",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "疏散現場人員",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      }
    ]
  },
  {
    "id": 48,
    "title": "農藥噴灑",
    "context": "在果園噴灑有毒農藥除草劑。",
    "items": [
      {
        "text": "穿戴全套防護衣及防毒面具",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "噴灑後立刻洗澡更衣",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "順著風向並退後噴灑",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "沒戴口罩，迎風面噴灑",
        "isHazard": true,
        "explanation": "吸入大量農藥霧滴會導致急性中毒。"
      }
    ]
  },
  {
    "id": 49,
    "title": "管線維修",
    "context": "維修有電力的機台內部線路。",
    "items": [
      {
        "text": "使用絕緣手套與工具",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      },
      {
        "text": "切斷電源並掛上'禁止操作'牌 (Lockout/Tagout)",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "不切斷總電源直接用螺絲起子修",
        "isHazard": true,
        "explanation": "直接接觸帶電體會發生嚴重感電事故死亡。"
      },
      {
        "text": "確認無電壓再維修",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      }
    ]
  },
  {
    "id": 50,
    "title": "廠區交通",
    "context": "工廠內有無數大型貨車穿梭進出。",
    "items": [
      {
        "text": "員工邊滑手機邊橫穿車道",
        "isHazard": true,
        "explanation": "注意力分散及大車盲點極易造成輾壓。"
      },
      {
        "text": "走專用人行步道並隨時注意來車",
        "isHazard": false,
        "explanation": "符合安全規範的反應方式。"
      },
      {
        "text": "穿著反光背心提高能見度",
        "isHazard": false,
        "explanation": "這是職場上的正確判斷。"
      },
      {
        "text": "不要在廠區奔跑滑手機",
        "isHazard": false,
        "explanation": "能有效預防工安事故的安全措施。"
      }
    ]
  }
];
