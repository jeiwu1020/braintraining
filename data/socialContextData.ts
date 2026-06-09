import { Scenario } from '../types';

export const normalScenarios: Scenario[] = [
  {
    "id": 1,
    "title": "在餐廳",
    "description": "服務生不小心把水灑到你的桌上，他連忙道歉。你覺得這時候怎麼回應比較適當？",
    "options": [
      {
        "text": "大聲責罵他為什麼這麼不小心",
        "isCorrect": false,
        "feedback": "大聲責罵會讓氣氛變差，對方也已經道歉了。"
      },
      {
        "text": "說「沒關係，請幫我擦一下就好」",
        "isCorrect": true,
        "feedback": "這是一個很有禮貌且能解決問題的回應！"
      },
      {
        "text": "馬上離開餐廳不想吃了",
        "isCorrect": false,
        "feedback": "這是一個太過激烈的反應，只是一點水而已。"
      }
    ]
  },
  {
    "id": 2,
    "title": "遇到認識的人",
    "description": "早上在公園散步時，迎面走來一位認識的鄰居，他看著你。你應該怎麼做？",
    "options": [
      {
        "text": "當作沒看到，把頭轉過去",
        "isCorrect": false,
        "feedback": "這樣有點沒禮貌，會讓對方覺得被忽視。"
      },
      {
        "text": "一直盯著他看，但不說話",
        "isCorrect": false,
        "feedback": "一直盯著看會讓人覺得有壓力或奇怪。"
      },
      {
        "text": "微笑點頭，說聲「早安」",
        "isCorrect": true,
        "feedback": "非常棒！這是一般常見且友善的打招呼方式。"
      }
    ]
  },
  {
    "id": 3,
    "title": "想借東西",
    "description": "參加活動時，你的筆突然沒水了，想跟旁邊的人借一支筆。你要怎麼開口？",
    "options": [
      {
        "text": "請問可以借我一支筆嗎？我用完馬上還你。",
        "isCorrect": true,
        "feedback": "表達清楚、加上請字，並說明會歸還，非常適當。"
      },
      {
        "text": "喂，筆拿來借我用一下！",
        "isCorrect": false,
        "feedback": "太過直接且沒有禮貌，對方可能會不高興。"
      },
      {
        "text": "直接伸手拿他桌上的筆",
        "isCorrect": false,
        "feedback": "未經同意直接拿別人的東西是不尊重的行為。"
      }
    ]
  },
  {
    "id": 4,
    "title": "搭公車",
    "description": "公車上有一位行動不便的老爺爺上車，剛好你坐在博愛座上。你應該怎麼做？",
    "options": [
      {
        "text": "繼續滑手機，假裝沒看到",
        "isCorrect": false,
        "feedback": "這樣沒有發揮同理心喔。"
      },
      {
        "text": "主動站起來說：「爺爺，這裡給您坐」",
        "isCorrect": true,
        "feedback": "非常貼心！主動讓座是很有禮貌的行為。"
      },
      {
        "text": "叫別人讓座給他",
        "isCorrect": false,
        "feedback": "自己有能力時可以自己先做，不需要求別人。"
      }
    ]
  },
  {
    "id": 5,
    "title": "買東西找錯錢",
    "description": "你去便利商店買東西，發現店員少找你十元。你該怎麼辦？",
    "options": [
      {
        "text": "直接把發票摔在桌上叫他賠錢",
        "isCorrect": false,
        "feedback": "態度太凶可能引發衝突。"
      },
      {
        "text": "覺得算了，自己認賠",
        "isCorrect": false,
        "feedback": "不需要委屈自己，可以和平解決。"
      },
      {
        "text": "拿著發票跟店員說：「不好意思，好像少找十元了」",
        "isCorrect": true,
        "feedback": "很棒！溫和地說出問題，通常對方就會立刻處理。"
      }
    ]
  },
  {
    "id": 6,
    "title": "別人跟你打招呼",
    "description": "在走廊上，其他病友或同事主動對你說「早安！」。你應該如何回應？",
    "options": [
      {
        "text": "不理他，直接走開",
        "isCorrect": false,
        "feedback": "這樣會讓對方感到尷尬或不受尊重。"
      },
      {
        "text": "也回應對方：「早安！」",
        "isCorrect": true,
        "feedback": "很好的互動！簡單的回應就能建立好關係。"
      },
      {
        "text": "問他：「你幹嘛一直看我？」",
        "isCorrect": false,
        "feedback": "對方只是打招呼，沒有惡意，這樣問會讓人誤會。"
      }
    ]
  },
  {
    "id": 7,
    "title": "電話響了",
    "description": "朋友打電話來，你接起電話的第一句話說什麼比較好？",
    "options": [
      {
        "text": "「喂？你好，請問什麼事？」",
        "isCorrect": true,
        "feedback": "非常有禮貌的開頭方式！"
      },
      {
        "text": "「幹嘛啦！」",
        "isCorrect": false,
        "feedback": "這會讓對方覺得你在生氣。"
      },
      {
        "text": "都不說話，等對方先講",
        "isCorrect": false,
        "feedback": "接起電話通常要先出聲，對方才知道已經接通了。"
      }
    ]
  },
  {
    "id": 8,
    "title": "朋友送禮物",
    "description": "朋友生日時送了你一個小禮物，你該有什麼反應？",
    "options": [
      {
        "text": "說「我不喜歡這個」",
        "isCorrect": false,
        "feedback": "太直接了，會傷害朋友的心意。"
      },
      {
        "text": "笑著收下並說「謝謝你的禮物！」",
        "isCorrect": true,
        "feedback": "表達感謝是收禮物的基本禮貌喔！"
      },
      {
        "text": "問他「這多少錢買的？」",
        "isCorrect": false,
        "feedback": "問價格容易讓人覺得不禮貌。"
      }
    ]
  },
  {
    "id": 9,
    "title": "不小心撞到人",
    "description": "你在走廊上不小心撞到了別人。你應該怎麼做？",
    "options": [
      {
        "text": "馬上說：「對不起，我不小心的」",
        "isCorrect": true,
        "feedback": "主動道歉能立刻化解尷尬與誤會。"
      },
      {
        "text": "怪對方走路不看路",
        "isCorrect": false,
        "feedback": "這樣會引起不必要的爭吵。"
      },
      {
        "text": "當作沒事繼續走",
        "isCorrect": false,
        "feedback": "撞到人不道歉是非常沒有禮貌的。"
      }
    ]
  },
  {
    "id": 10,
    "title": "別人幫助了你",
    "description": "護理師或朋友幫你撿起掉在地上的東西，你應該怎麼回應？",
    "options": [
      {
        "text": "默默拿走",
        "isCorrect": false,
        "feedback": "這樣對方會覺得你沒有感恩的心。"
      },
      {
        "text": "說：「謝謝你的幫忙。」",
        "isCorrect": true,
        "feedback": "簡單的一句謝謝，能讓幫助你的人覺得開心。"
      },
      {
        "text": "說：「我本來自己拿得到」",
        "isCorrect": false,
        "feedback": "這樣會讓對方的好意受到挫折。"
      }
    ]
  },
  {
    "id": 11,
    "title": "活動遲到",
    "description": "你參加團體活動時遲到了，走進教室時你該怎麼做？",
    "options": [
      {
        "text": "大聲跟每個人打招呼",
        "isCorrect": false,
        "feedback": "這樣會打斷活動進行。"
      },
      {
        "text": "輕聲說「不好意思我遲到了」，然後安靜找位子坐下",
        "isCorrect": true,
        "feedback": "很適當！既有表達歉意，也不影響大家。"
      },
      {
        "text": "生氣地抱怨外面的交通",
        "isCorrect": false,
        "feedback": "遲到是自己的責任，不應該影響團體情緒。"
      }
    ]
  },
  {
    "id": 12,
    "title": "看電視的衝突",
    "description": "你想看新聞，但別人正在看連續劇。你應該怎麼溝通？",
    "options": [
      {
        "text": "請問這台你們還要看多久？等一下可以換新聞嗎？",
        "isCorrect": true,
        "feedback": "很好的溝通方式，彼此商量。"
      },
      {
        "text": "直接走過去把電視轉台",
        "isCorrect": false,
        "feedback": "未經同意轉台會引發衝突！"
      },
      {
        "text": "站在旁邊大聲碎碎唸",
        "isCorrect": false,
        "feedback": "這樣會影響別人看電視，也無法解決問題。"
      }
    ]
  },
  {
    "id": 13,
    "title": "別人向你道歉",
    "description": "朋友不小心拿錯了你的杯子，他跑來向你道歉。你該怎麼回答？",
    "options": [
      {
        "text": "一直罵他連杯子都會拿錯",
        "isCorrect": false,
        "feedback": "對方已經道歉了，再罵會破壞關係。"
      },
      {
        "text": "沒關係，下次注意一下就好。",
        "isCorrect": true,
        "feedback": "非常寬容大度，是很棒的回應！"
      },
      {
        "text": "以後都不跟他講話了",
        "isCorrect": false,
        "feedback": "這樣太極端了，容易失去朋友。"
      }
    ]
  },
  {
    "id": 14,
    "title": "想參加別人的聊天",
    "description": "你看到幾個人在開心地聊天，你也想加入他們，你該怎麼做？",
    "options": [
      {
        "text": "直接插嘴打斷他們講話",
        "isCorrect": false,
        "feedback": "打斷別人很不禮貌喔。"
      },
      {
        "text": "走到旁邊，等他們講到一個段落時問：「我也可以聽嗎？」",
        "isCorrect": true,
        "feedback": "非常好的時機點與禮貌的詢問！"
      },
      {
        "text": "在旁邊一直大聲咳嗽引起注意",
        "isCorrect": false,
        "feedback": "這樣非常突兀且奇怪。"
      }
    ]
  },
  {
    "id": 15,
    "title": "遇到不懂的事",
    "description": "治療師發了一張學習單，但你看不懂上面的說明，你該怎麼做？",
    "options": [
      {
        "text": "直接把學習單揉掉不寫",
        "isCorrect": false,
        "feedback": "這樣就失去了學習的機會。"
      },
      {
        "text": "亂寫一通敷衍過去",
        "isCorrect": false,
        "feedback": "不懂裝懂無法幫助自己進步。"
      },
      {
        "text": "舉手問：「不好意思，請問這裡是什麼意思？我不太懂。」",
        "isCorrect": true,
        "feedback": "勇於發問是非常棒的解決問題方式！"
      }
    ]
  },
  {
    "id": 16,
    "title": "別人心情不好",
    "description": "你看見好朋友坐在角落偷偷流眼淚，看起來心情很差。你該如何處理？",
    "options": [
      {
        "text": "走過去說：「不要難過了啦，多大點事」",
        "isCorrect": false,
        "feedback": "這是否定他的情緒，無法帶來安慰。"
      },
      {
        "text": "在一旁靜靜遞衛生紙給他，問：「你還好嗎？」",
        "isCorrect": true,
        "feedback": "充滿關心又不會給對方太多壓力，很溫暖。"
      },
      {
        "text": "拍照發到群組裡",
        "isCorrect": false,
        "feedback": "絕對不行！這是侵犯隱私與非常不友善的行為。"
      }
    ]
  },
  {
    "id": 17,
    "title": "想上廁所",
    "description": "上課到一半，你突然很想上廁所，你應該怎麼做？",
    "options": [
      {
        "text": "直接衝出教室",
        "isCorrect": false,
        "feedback": "這樣會讓老師擔心發生什麼事。"
      },
      {
        "text": "舉手跟老師說：「不好意思，我想去洗手間。」",
        "isCorrect": true,
        "feedback": "合乎禮節的安全做法。"
      },
      {
        "text": "一直憋著直到下課",
        "isCorrect": false,
        "feedback": "憋尿對身體不好喔。"
      }
    ]
  },
  {
    "id": 18,
    "title": "找不到東西",
    "description": "你發現自己的水壺不見了，很生氣。你該怎麼辦？",
    "options": [
      {
        "text": "懷疑別人偷拿，並大聲質問旁邊的人",
        "isCorrect": false,
        "feedback": "在沒證據前不能隨意指責別人。"
      },
      {
        "text": "先冷靜下來，回想自己最後一次在哪裡用到，並尋求幫忙",
        "isCorrect": true,
        "feedback": "保持冷靜才能有效解決問題。"
      },
      {
        "text": "去拿別人的水壺當作自己的",
        "isCorrect": false,
        "feedback": "這是不對且違規的行為。"
      }
    ]
  },
  {
    "id": 19,
    "title": "借用物品歸還",
    "description": "你跟別人借的剪刀用完了，歸還時應該怎麼做？",
    "options": [
      {
        "text": "直接丟在對方桌上",
        "isCorrect": false,
        "feedback": "這樣非常沒禮貌且有可能弄壞物品。"
      },
      {
        "text": "雙手遞給對方，並說「謝謝你借我」",
        "isCorrect": true,
        "feedback": "非常有禮貌的做法，以後別人還願意借東西給你。"
      },
      {
        "text": "放在他抽屜裡不告訴他",
        "isCorrect": false,
        "feedback": "他可能會以為弄丟了，應該當面歸還。"
      }
    ]
  },
  {
    "id": 20,
    "title": "不想參加活動",
    "description": "今天的團體活動讓你覺得很不舒服或很累，你不想繼續參與，你該怎麼做？",
    "options": [
      {
        "text": "跟帶領者說：「我覺得有點不舒服，可以在旁邊休息一下嗎？」",
        "isCorrect": true,
        "feedback": "清楚表達自己的需求並尊重規則，非常適當。"
      },
      {
        "text": "突然趴在桌上睡覺拒絕溝通",
        "isCorrect": false,
        "feedback": "這樣會讓大家不知道你怎麼了而感到擔心。"
      },
      {
        "text": "故意搗蛋破壞活動進行",
        "isCorrect": false,
        "feedback": "這樣會影響到其他想參與的成員。"
      }
    ]
  },
  {
    "id": 21,
    "title": "想借洗手間",
    "description": "你去別人家作客，突然想上廁所，你應該怎麼問？",
    "options": [
      {
        "text": "直接自己到處走來走去找廁所",
        "isCorrect": false,
        "feedback": "亂闖可能會侵犯主人隱私。"
      },
      {
        "text": "「不好意思，請問洗手間在哪裡？」",
        "isCorrect": true,
        "feedback": "禮貌詢問是尊重主人的表現。"
      },
      {
        "text": "一直憋著都不敢講",
        "isCorrect": false,
        "feedback": "憋尿對身體不好，主人也不會介意這點小事。"
      }
    ]
  },
  {
    "id": 22,
    "title": "對方忘記約定",
    "description": "朋友忘記了你們約好要見面的時間，你打電話給他的時候該怎麼說？",
    "options": [
      {
        "text": "大罵他沒有信用",
        "isCorrect": false,
        "feedback": "每個人都有可能忘記，直接發脾氣會讓場面變僵。"
      },
      {
        "text": "「我們今天有約對嗎？還是你剛好在忙？」",
        "isCorrect": true,
        "feedback": "溫和地確認，給對方解釋的空間。"
      },
      {
        "text": "直接掛電話絕交",
        "isCorrect": false,
        "feedback": "太極端了，一點小事不至於絕交。"
      }
    ]
  },
  {
    "id": 23,
    "title": "被稱讚表現",
    "description": "老師稱讚你今天上課很專心，你該怎麼回應？",
    "options": [
      {
        "text": "「這沒什麼大不了的吧」",
        "isCorrect": false,
        "feedback": "這會讓讚美你的人覺得很尷尬。"
      },
      {
        "text": "「因為今天的課很有趣，謝謝老師！」",
        "isCorrect": true,
        "feedback": "大方接受讚美並給予回饋，是很棒的回應。"
      },
      {
        "text": "裝作沒聽到",
        "isCorrect": false,
        "feedback": "忽略別人的話是不禮貌的。"
      }
    ]
  },
  {
    "id": 24,
    "title": "看到別人掉東西",
    "description": "走在你前面的人錢包掉在地上了，你該怎麼辦？",
    "options": [
      {
        "text": "撿起來放進自己口袋",
        "isCorrect": false,
        "feedback": "這是違法而且不道德的行為！"
      },
      {
        "text": "快步走上前說：「不好意思，你的錢包掉了！」",
        "isCorrect": true,
        "feedback": "熱心助人是最棒的行為。"
      },
      {
        "text": "假裝沒看到走過去",
        "isCorrect": false,
        "feedback": "雖然不犯法，但如果能幫忙提醒會更好。"
      }
    ]
  },
  {
    "id": 25,
    "title": "想換座位",
    "description": "你在看電影時，前面的人太高擋住了視線，旁邊剛好有空位。你該怎麼做？",
    "options": [
      {
        "text": "大聲抱怨前面的人長太高",
        "isCorrect": false,
        "feedback": "長得高不是他的錯，抱怨只會引發紛爭。"
      },
      {
        "text": "默默地換到旁邊的空位上，安靜繼續看",
        "isCorrect": true,
        "feedback": "直接解決問題又不打擾到別人，很棒。"
      },
      {
        "text": "一直踢前面椅背抗議",
        "isCorrect": false,
        "feedback": "這會嚴重干擾別人看電影。"
      }
    ]
  },
  {
    "id": 26,
    "title": "不小心打翻飲料",
    "description": "在朋友家不小心把飲料打翻在沙發上，你該怎麼做？",
    "options": [
      {
        "text": "趕快找衛生紙擦，並誠懇道歉：「真的很對不起，我立刻清理。」",
        "isCorrect": true,
        "feedback": "勇於負責並立刻處理，可以將損害降到最低。"
      },
      {
        "text": "假裝不知道，偷偷溜走",
        "isCorrect": false,
        "feedback": "逃避責任會讓朋友非常生氣。"
      },
      {
        "text": "怪朋友杯子放太滿",
        "isCorrect": false,
        "feedback": "推卸責任是破壞友情的地雷。"
      }
    ]
  },
  {
    "id": 27,
    "title": "沒聽清楚別人的話",
    "description": "對方講話太小聲，你沒有聽清楚，你該怎麼回應？",
    "options": [
      {
        "text": "「蛤？你講話大聲一點啦！」",
        "isCorrect": false,
        "feedback": "語氣太差會讓人不舒服。"
      },
      {
        "text": "「不好意思，剛剛沒聽清楚，可以請你再說一次嗎？」",
        "isCorrect": true,
        "feedback": "這非常有禮貌，對方也會樂意再說一次。"
      },
      {
        "text": "雖然沒聽懂但還是點頭假裝懂",
        "isCorrect": false,
        "feedback": "這容易造成日後的嚴重誤會。"
      }
    ]
  },
  {
    "id": 28,
    "title": "想要先結帳",
    "description": "你在便利商店買一瓶水，但前面的人要繳一大堆帳單，你趕時間，你該怎麼說？",
    "options": [
      {
        "text": "「不好意思，我只有買一瓶水而且很趕時間，請問可以讓我先結帳嗎？謝謝。」",
        "isCorrect": true,
        "feedback": "客氣地詢問，通常大家都會願意通融。"
      },
      {
        "text": "直接插隊把水丟到桌上",
        "isCorrect": false,
        "feedback": "未經同意插隊非常不禮貌。"
      },
      {
        "text": "在後面一直大聲嘆氣",
        "isCorrect": false,
        "feedback": "這樣會給前面的人和店員帶來很大壓力。"
      }
    ]
  },
  {
    "id": 29,
    "title": "拿到不想要的禮物",
    "description": "長輩送了你一件你不喜歡的衣服，你當下該怎麼反應？",
    "options": [
      {
        "text": "直接說「這好醜，我不要」",
        "isCorrect": false,
        "feedback": "這樣直接會很傷長輩的心。"
      },
      {
        "text": "笑著收下說：「謝謝您的心意。」",
        "isCorrect": true,
        "feedback": "先感謝對方的心意，禮貌是最重要的。"
      },
      {
        "text": "當面把它丟進垃圾桶",
        "isCorrect": false,
        "feedback": "這是非常不尊重人的行為。"
      }
    ]
  },
  {
    "id": 30,
    "title": "看診時醫生問診",
    "description": "看醫生時，醫生問你哪裡不舒服，你應該怎麼回答？",
    "options": [
      {
        "text": "「你自己看啊，你是醫生耶」",
        "isCorrect": false,
        "feedback": "醫生需要你的主觀感受來幫助判斷病情。"
      },
      {
        "text": "「我這兩天一直咳嗽，喉嚨也有點痛。」",
        "isCorrect": true,
        "feedback": "清楚敘述自己的症狀，幫助醫生診斷。"
      },
      {
        "text": "悶都不吭聲",
        "isCorrect": false,
        "feedback": "不說話醫生會不知道怎麼幫你喔。"
      }
    ]
  },
  {
    "id": 31,
    "title": "在圖書館找書",
    "description": "你在圖書館找不到想看的書，看到館員在忙，你會怎麼做？",
    "options": [
      {
        "text": "大聲喊他過來",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "安靜地等待館員忙完再輕聲詢問",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "自己亂翻其他抽屜",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      }
    ]
  },
  {
    "id": 32,
    "title": "借筆",
    "description": "上課時發現忘了帶筆，旁邊的同學筆盒有很多支筆。",
    "options": [
      {
        "text": "有禮貌地問同學：「請問可以借我一支筆嗎？」",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "直接拿同學的筆來用",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "一直發出聲音引起注意但不說話",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      }
    ]
  },
  {
    "id": 33,
    "title": "看電影",
    "description": "在電影院看電影時，前面的人一直講話影響到你。",
    "options": [
      {
        "text": "大聲抱怨讓全場都聽到",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      },
      {
        "text": "用力踢對方的椅背",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "輕聲客氣地請對方小聲一點",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      }
    ]
  },
  {
    "id": 34,
    "title": "排隊買早餐",
    "description": "排隊買早餐時，有人不小心踩到你的腳並立刻道歉。",
    "options": [
      {
        "text": "說「沒關係，我不痛」",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "大聲罵他不長眼",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      },
      {
        "text": "生氣地推他一把",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      }
    ]
  },
  {
    "id": 35,
    "title": "操場打球",
    "description": "在操場打球時，不小心把球丟到別人身上。",
    "options": [
      {
        "text": "立刻跑過去真誠地道歉並關心對方",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "裝作沒事跑走",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "怪對方自己不躲開",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      }
    ]
  },
  {
    "id": 36,
    "title": "家庭聚餐",
    "description": "聚餐時上了一道你不喜歡吃的菜。",
    "options": [
      {
        "text": "微笑說自己吃飽了或挑自己喜歡的吃",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "大喊「這好難吃」",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "把菜吐在桌上",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      }
    ]
  },
  {
    "id": 37,
    "title": "搭捷運",
    "description": "捷運上人很多，你看到一位老爺爺上車但沒有位子。",
    "options": [
      {
        "text": "主動站起來並說：「爺爺請坐這裡。」",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "假裝睡覺沒看到",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "跟爺爺說你去別的車廂找位子",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      }
    ]
  },
  {
    "id": 38,
    "title": "便利商店",
    "description": "結帳時發現自己帶的錢不夠。",
    "options": [
      {
        "text": "直接拿著東西跑走",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "跟店員道歉，說有一樣東西先不買了",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "跟店員生氣怪東西太貴",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      }
    ]
  },
  {
    "id": 39,
    "title": "公園玩耍",
    "description": "在公園看到別人玩你想玩的溜滑梯，但他們已經玩很久了。",
    "options": [
      {
        "text": "在旁邊大哭大鬧",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      },
      {
        "text": "直接衝上去把人推開",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "排隊等待，或友善地問「請問我可以一起玩嗎？」",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      }
    ]
  },
  {
    "id": 40,
    "title": "迷路",
    "description": "在百貨公司找不到家人。",
    "options": [
      {
        "text": "隨便跟一個陌生人走",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      },
      {
        "text": "自己跑出百貨公司找",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "找服務台的阿姨叔叔廣播尋人",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      }
    ]
  },
  {
    "id": 41,
    "title": "同學受傷",
    "description": "體育課時，看見同學跑步跌倒破皮了。",
    "options": [
      {
        "text": "當作沒看到走掉",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      },
      {
        "text": "在旁邊大笑他笨",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "扶他起來並陪他去保健室",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      }
    ]
  },
  {
    "id": 42,
    "title": "收到不喜歡的禮物",
    "description": "朋友生日送了你一個不喜歡的玩具。",
    "options": [
      {
        "text": "還是笑著說「謝謝你的心意」",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "當面說「這好醜我不要」",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "立刻丟進垃圾桶",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      }
    ]
  },
  {
    "id": 43,
    "title": "打破東西",
    "description": "在家裡不小心打破了媽媽最喜歡的杯子。",
    "options": [
      {
        "text": "誠實跟媽媽說並道歉，幫忙清理",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "偷偷把碎片藏起來",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "推給家裡的寵物",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      }
    ]
  },
  {
    "id": 44,
    "title": "被誤會",
    "description": "老師以為是你弄亂了教室，但其實不是你。",
    "options": [
      {
        "text": "跟老師大吵大鬧",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "心平氣和地跟老師解釋清楚",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "什麼都不說自己默默生氣",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      }
    ]
  },
  {
    "id": 45,
    "title": "忘記帶作業",
    "description": "到了學校才發現作業放在家裡桌上。",
    "options": [
      {
        "text": "說「我寫了，但是被狗吃掉」",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "怪媽媽沒有幫忙檢查書包",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      },
      {
        "text": "誠實告訴老師，並保證明天補交",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      }
    ]
  },
  {
    "id": 46,
    "title": "公車讓座",
    "description": "有一位孕婦上車，你想讓座給她。",
    "options": [
      {
        "text": "在車上大聲吼叫叫別人讓座",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      },
      {
        "text": "直接把她拉過來按在座位上",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "站起來微笑說：「阿姨請坐。」",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      }
    ]
  },
  {
    "id": 47,
    "title": "超市推車",
    "description": "在超市推購物車不小心撞到別人的推車。",
    "options": [
      {
        "text": "馬上說對不起並確認對方沒有受傷",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      },
      {
        "text": "瞪對方一眼自己走掉",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "推卸責任說是對方走太慢",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      }
    ]
  },
  {
    "id": 48,
    "title": "同學借筆記",
    "description": "同學生病請假，想跟你借昨天的筆記抄。",
    "options": [
      {
        "text": "跟他要求付錢才借",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      },
      {
        "text": "拒絕並嘲笑他活該生病",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "答應借他並關心他的身體",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      }
    ]
  },
  {
    "id": 49,
    "title": "吃午餐",
    "description": "午餐時間，不小心把湯打翻在自己桌上。",
    "options": [
      {
        "text": "把湯撥到地上去就去玩了",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      },
      {
        "text": "大叫並責怪坐在旁邊的同學",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "趕緊拿抹布擦拭，並請同學幫忙拿衛生紙",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      }
    ]
  },
  {
    "id": 50,
    "title": "看醫生",
    "description": "去診所看醫生打針，覺得很害怕。",
    "options": [
      {
        "text": "打護士阿姨",
        "isCorrect": false,
        "feedback": "這不是適當的做法。"
      },
      {
        "text": "在診所尖叫狂奔",
        "isCorrect": false,
        "feedback": "這樣做可能會讓情況變糟。"
      },
      {
        "text": "深呼吸告訴自己很快就好，配合醫生",
        "isCorrect": true,
        "feedback": "很好的回應方式！"
      }
    ]
  }
];

export const advancedScenarios: Scenario[] = [
  {
    "id": 1,
    "title": "職場溝通",
    "description": "同事把一份應該他做的工作推給你，但你自己的工作已經做不完了。你會怎麼處理？",
    "options": [
      {
        "text": "為了不破壞關係，默默接下來做",
        "isCorrect": false,
        "feedback": "這樣會讓自己壓力過大，無法完成原本的工作。"
      },
      {
        "text": "立刻對他發脾氣抱怨這不公平",
        "isCorrect": false,
        "feedback": "這樣會引發衝突，不利於職場和諧。"
      },
      {
        "text": "溫和堅定地說明自己目前的進度，並婉拒他",
        "isCorrect": true,
        "feedback": "非常好！清楚表達自己的底線，同時保持理性溝通。"
      }
    ]
  },
  {
    "id": 2,
    "title": "朋友聚會",
    "description": "幾位朋友在聊天，話題是你完全不懂的領域。你覺得有些被冷落，你可以怎麼做？",
    "options": [
      {
        "text": "坐在旁邊滑手機，不再理他們",
        "isCorrect": false,
        "feedback": "這樣會切斷社交連結，讓自己更加孤立。"
      },
      {
        "text": "虛心發問：「聽起來很有趣，可以多說一點嗎？」",
        "isCorrect": true,
        "feedback": "這是很好的參與方式，能展現好奇心並融入話題。"
      },
      {
        "text": "強行打斷，換成自己想聊的話題",
        "isCorrect": false,
        "feedback": "突然打斷對方會讓人覺得不受尊重。"
      }
    ]
  },
  {
    "id": 3,
    "title": "意見不合",
    "description": "在討論活動計畫時，你的想法被其他人否定了，你感到沮喪。你該如何應對？",
    "options": [
      {
        "text": "質問他們為什麼針對你",
        "isCorrect": false,
        "feedback": "這會將討論上升成個人情緒問題。"
      },
      {
        "text": "深呼吸，嘗試理解他們考量的點，並表達自己的顧慮",
        "isCorrect": true,
        "feedback": "能控制情緒並針對問題本身溝通，是非常成熟的表現。"
      },
      {
        "text": "直接放棄不想參與了",
        "isCorrect": false,
        "feedback": "這樣會失去解決問題的機會，也影響團隊合作。"
      }
    ]
  },
  {
    "id": 4,
    "title": "拒絕的藝術",
    "description": "朋友邀約你週末去唱歌，但你這個週末只想一個人在家好好休息。你該怎麼回應才不會傷害感情？",
    "options": [
      {
        "text": "都不回訊息，裝死",
        "isCorrect": false,
        "feedback": "逃避不是好方法，會讓朋友覺得不被重視。"
      },
      {
        "text": "這週真的比較累想休息，下次有空再約！祝你們玩得開心~",
        "isCorrect": true,
        "feedback": "真誠說明原因並釋出善意，是很棒的拒絕方式！"
      },
      {
        "text": "我才不想去那種無聊的活動",
        "isCorrect": false,
        "feedback": "這充滿了攻擊性，會破壞友誼。"
      }
    ]
  },
  {
    "id": 5,
    "title": "面對批評",
    "description": "主管在會議上指出你的報表有一個錯漏，並且口氣稍重。你該如何反應？",
    "options": [
      {
        "text": "馬上反駁說是其他部門給錯資料",
        "isCorrect": false,
        "feedback": "推卸責任會讓人覺得你不夠成熟。"
      },
      {
        "text": "點頭說「了解，我馬上修正，確認後再交給您」",
        "isCorrect": true,
        "feedback": "專注於解決問題，展現負責的態度。"
      },
      {
        "text": "當場哭了出來，覺得自己很沒用",
        "isCorrect": false,
        "feedback": "這會讓場面很難處理，需要適度練習控制情緒表達。"
      }
    ]
  },
  {
    "id": 6,
    "title": "安慰朋友",
    "description": "朋友最近剛分手，打電話來一直哭。你覺得最好的做法是？",
    "options": [
      {
        "text": "跟著一起把前任大罵一頓",
        "isCorrect": false,
        "feedback": "雖然解氣，但不一定能幫朋友消化情緒。"
      },
      {
        "text": "安靜聽他說，並適時說「我都在這裡陪你」",
        "isCorrect": true,
        "feedback": "陪伴與傾聽是最好的療癒。"
      },
      {
        "text": "馬上叫他去找新對象轉移注意力",
        "isCorrect": false,
        "feedback": "過早轉移話題會讓對方覺得情緒沒被接納。"
      }
    ]
  },
  {
    "id": 7,
    "title": "約會遲到",
    "description": "你和朋友約好要看電影，但因為交通狀況你可能會遲到15分鐘。你該怎麼辦？",
    "options": [
      {
        "text": "等到了再跟他解釋",
        "isCorrect": false,
        "feedback": "對方在這15分鐘會很焦慮且生氣。"
      },
      {
        "text": "提前傳訊息或打電話告知狀況及預計抵達時間",
        "isCorrect": true,
        "feedback": "提早告知能讓對方有心理準備，是很負責的表現。"
      },
      {
        "text": "直接取消不去了",
        "isCorrect": false,
        "feedback": "這樣很不負責任喔。"
      }
    ]
  },
  {
    "id": 8,
    "title": "合作不愉快",
    "description": "跟你同組的夥伴進度一直落後，影響到你們的任務。你該如何溝通？",
    "options": [
      {
        "text": "私下問他：「最近遇到困難了嗎？需要我幫忙哪個部分嗎？」",
        "isCorrect": true,
        "feedback": "帶著善意的關心往往能有效推進進度！"
      },
      {
        "text": "到處跟別人抱怨這個雷隊友",
        "isCorrect": false,
        "feedback": "背後抱怨無助於解決問題，還會破壞信任。"
      },
      {
        "text": "直接跑到他面前大罵他扯後腿",
        "isCorrect": false,
        "feedback": "指責會激發防衛心態，反而讓事情更糟。"
      }
    ]
  },
  {
    "id": 9,
    "title": "話題冷場",
    "description": "跟剛認識的朋友吃飯，聊了幾句後突然不知道說什麼，空氣變得很安靜。你該怎麼辦？",
    "options": [
      {
        "text": "馬上拿手機出來滑，化解尷尬",
        "isCorrect": false,
        "feedback": "滑手機反而像是在拒絕交流。"
      },
      {
        "text": "找個開放式問題，例如：「你週末平常喜歡做些什麼？」",
        "isCorrect": true,
        "feedback": "開放式問題能讓對方多說一點，是很好的話題延伸！"
      },
      {
        "text": "盯著對方看，等對方先開口",
        "isCorrect": false,
        "feedback": "這會給對方不小的壓力。"
      }
    ]
  },
  {
    "id": 10,
    "title": "收到讚美",
    "description": "同事稱讚你：「你今天簡報做得好棒喔！條理很清晰。」你該怎麼回應比較得體？",
    "options": [
      {
        "text": "沒有啦，我很差啦，你太誇張了",
        "isCorrect": false,
        "feedback": "過度否定對方的讚美會讓人接不了話。"
      },
      {
        "text": "謝謝你的肯定！我花了很多時間準備，聽到你這樣說我很開心。",
        "isCorrect": true,
        "feedback": "大方接受讚美並表達感謝，是非常自信得體的表現。"
      },
      {
        "text": "這還用說，我一直都很厲害",
        "isCorrect": false,
        "feedback": "太過自傲可能會讓人反感。"
      }
    ]
  },
  {
    "id": 11,
    "title": "發現別人犯錯",
    "description": "你發現同事交出的一份重要文件中有一個數據寫錯了。你該怎麼做？",
    "options": [
      {
        "text": "在大群組裡直接指出來說他寫錯了",
        "isCorrect": false,
        "feedback": "公開指責會讓對方顏面掃地。"
      },
      {
        "text": "私下傳訊息給他：「這裡的數據好像有點不一樣，要不要再確認一下？」",
        "isCorrect": true,
        "feedback": "給對方留面子，也順利提醒，這是高情商的表現！"
      },
      {
        "text": "假裝沒看到，反正不是我的事",
        "isCorrect": false,
        "feedback": "如果文件很重要，這可能會損害團隊利益。"
      }
    ]
  },
  {
    "id": 12,
    "title": "借錢不還",
    "description": "朋友上個月跟你借了兩千塊，說好發薪水就還，但一直沒有動靜。你該如何開口？",
    "options": [
      {
        "text": "「你到底要不要還錢啊？騙子！」",
        "isCorrect": false,
        "feedback": "雖然生氣，但這樣容易破壞關係。"
      },
      {
        "text": "「不好意思，因為最近手頭有點緊，想問一下上個月借你的那筆錢方便這兩天匯給我嗎？」",
        "isCorrect": true,
        "feedback": "給個台階下，同時堅定表達需要對方還錢的需求。"
      },
      {
        "text": "自認倒楣，不敢要",
        "isCorrect": false,
        "feedback": "要保護自己的權益，練習堅定開口。"
      }
    ]
  },
  {
    "id": 13,
    "title": "受到誤解",
    "description": "主管以為某個失誤是你造成的，把你叫去念了一頓，但其實是別人的錯。你該怎麼處理？",
    "options": [
      {
        "text": "當下立刻拍桌子說：「不是我做的！」",
        "isCorrect": false,
        "feedback": "情緒激動容易讓對方聽不進解釋。"
      },
      {
        "text": "先聽完，等主管說完後冷靜地說：「我可以稍微說明一下當時的情況嗎？」",
        "isCorrect": true,
        "feedback": "等對方情緒發洩完，再冷靜說明事實是最有效的澄清方式。"
      },
      {
        "text": "委屈地把它吞下去，默默背黑鍋",
        "isCorrect": false,
        "feedback": "不澄清可能會讓主管對你的能力產生誤解。"
      }
    ]
  },
  {
    "id": 14,
    "title": "討論受阻",
    "description": "開會時，有同事一直打斷別人的發言，不聽別人說話。身為主持人的你該怎麼辦？",
    "options": [
      {
        "text": "「XX，我們現在是大家輪流發言，請你先聽我把話說完。」",
        "isCorrect": true,
        "feedback": "直接且堅定地設立規則，能有效控制場面。"
      },
      {
        "text": "跟他互罵，比誰比較大聲",
        "isCorrect": false,
        "feedback": "這會讓會議完全失控。"
      },
      {
        "text": "就算了，隨便他講",
        "isCorrect": false,
        "feedback": "這樣會讓其他參與者感到不公平與浪費時間。"
      }
    ]
  },
  {
    "id": 15,
    "title": "不熟的飯局",
    "description": "參加了一個飯局，發現旁邊坐的人你完全不認識。你可以如何開始對話？",
    "options": [
      {
        "text": "只顧著自己低頭吃飯",
        "isCorrect": false,
        "feedback": "雖然安全，但錯失了結交新關係的機會。"
      },
      {
        "text": "你好，我是XX，你是新郎的朋友嗎？",
        "isCorrect": true,
        "feedback": "簡單自我介紹並從共通點（為何來參加）開啟話題，很自然！"
      },
      {
        "text": "一開口就問對方薪水和年紀",
        "isCorrect": false,
        "feedback": "涉及過多隱私的問題非常不適合初次見面。"
      }
    ]
  },
  {
    "id": 16,
    "title": "情緒失控的伴侶",
    "description": "另一半遇到工作挫折回到家，情緒非常暴躁，甚至對你講話很不客氣。你該怎麼辦？",
    "options": [
      {
        "text": "馬上反罵回去：「你態度這麼差我欠你的嗎？」",
        "isCorrect": false,
        "feedback": "這會讓火勢越燒越旺。"
      },
      {
        "text": "「看來你今天很累很煩躁，我先去洗澡，等你準備好想談了再叫我。」",
        "isCorrect": true,
        "feedback": "適時拉開空間，不吸收對方的負情緒，保護自己也讓他冷靜。"
      },
      {
        "text": "一直追問他到底發生什麼事",
        "isCorrect": false,
        "feedback": "在對方情緒高漲時過度追問，會讓他覺得很煩。"
      }
    ]
  },
  {
    "id": 17,
    "title": "推銷電話",
    "description": "接到強迫推銷的電話，對方一直講個不停，你根本沒興趣。你該怎麼處理？",
    "options": [
      {
        "text": "聽他講完半小時再拒絕",
        "isCorrect": false,
        "feedback": "浪費自己的時間。"
      },
      {
        "text": "「不好意思，我目前不需要，現在在忙不方便說話，先掛了，再見。」",
        "isCorrect": true,
        "feedback": "清楚拒絕並設立界線，掛斷電話。"
      },
      {
        "text": "把手機放著讓他講，自己跑去看電視",
        "isCorrect": false,
        "feedback": "這不是一個明確的溝通方式。"
      }
    ]
  },
  {
    "id": 18,
    "title": "承諾跳票",
    "description": "你答應幫忙做一件事，但後來發現自己能力做不到。你該如何面對？",
    "options": [
      {
        "text": "誠實跟對方說：「抱歉，我發現這超出了我的能力，可能要找別人幫忙。」",
        "isCorrect": true,
        "feedback": "誠實面對並提早告知，雖然會讓對方失望，但能將損害降到最低。"
      },
      {
        "text": "就放給它爛，裝死不聯絡",
        "isCorrect": false,
        "feedback": "這會嚴重損害信譽。"
      },
      {
        "text": "硬撐著做，結果把事情搞砸",
        "isCorrect": false,
        "feedback": "這樣反而帶給別人更大的麻煩。"
      }
    ]
  },
  {
    "id": 19,
    "title": "社交倦怠",
    "description": "在已經參加了2小時的派對後，你覺得能量耗盡，非常想回家了。你該怎麼做？",
    "options": [
      {
        "text": "不跟任何人說，直接偷偷溜走",
        "isCorrect": false,
        "feedback": "這樣朋友發現你消失會擔心。"
      },
      {
        "text": "找主辦人說：「謝謝你的邀請，我今晚玩得很開心，但有點累了想先回去休息。」",
        "isCorrect": true,
        "feedback": "禮貌道別並表達感謝，是很得體的提早離開方式。"
      },
      {
        "text": "強迫自己留到最後，結果心情變得很差",
        "isCorrect": false,
        "feedback": "要學會照顧自己的需求，不需要勉強。"
      }
    ]
  },
  {
    "id": 20,
    "title": "被問隱私",
    "description": "過年時親戚一直追問你的薪水多少、什麼時候結婚。你不想回答時可以怎麼說？",
    "options": [
      {
        "text": "「關你什麼事啊？」",
        "isCorrect": false,
        "feedback": "這樣會讓年節氣氛變得非常難堪。"
      },
      {
        "text": "「還過得去啦！對了，聽說表弟最近換工作了，他還適應嗎？」",
        "isCorrect": true,
        "feedback": "打太極並巧妙轉移話題，是很成熟的應對技巧。"
      },
      {
        "text": "為了面子，開始編故事說謊",
        "isCorrect": false,
        "feedback": "說了一個謊，以後要用更多的謊來圓。"
      }
    ]
  },
  {
    "id": 21,
    "title": "團隊中有搭便車的人",
    "description": "分組報告時，有個組員什麼都不做只想掛名。你要怎麼跟他溝通？",
    "options": [
      {
        "text": "「我們把工作分成這幾部分，你覺得你可以負責哪一塊呢？」",
        "isCorrect": true,
        "feedback": "主動分配選擇權，減少推託空間並引導他參與。"
      },
      {
        "text": "直接把他的名字從報告上刪掉",
        "isCorrect": false,
        "feedback": "未經溝通直接刪除可能會引發老師和組員間的糾紛。"
      },
      {
        "text": "在背後跟其他同學一起罵他",
        "isCorrect": false,
        "feedback": "背後罵人無法解決實質的工作分擔問題。"
      }
    ]
  },
  {
    "id": 22,
    "title": "發現朋友說謊",
    "description": "你發現好朋友對你說了一個關於他去哪裡的謊。你該怎麼處理比較好？",
    "options": [
      {
        "text": "直接在IG上限時動態公審他",
        "isCorrect": false,
        "feedback": "這會徹底破壞信任和友情。"
      },
      {
        "text": "找個安靜的地方問：「你說你去圖書館，但我好像在別的地方看到你，發生什麼事了嗎？」",
        "isCorrect": true,
        "feedback": "溫和地提出疑點，給對方解釋的空間而不是直接定罪。"
      },
      {
        "text": "假裝不知道，但以後再也不相信他",
        "isCorrect": false,
        "feedback": "逃避問題會讓心中的疙瘩影響未來的相處。"
      }
    ]
  },
  {
    "id": 23,
    "title": "跨部門溝通不順",
    "description": "另一個部門的同事給的資料總是格式錯誤，導致你必須花很多時間重做。你該怎麼辦？",
    "options": [
      {
        "text": "「為了增加效率，我做了一個簡單的表格範本，以後可以麻煩你填這個嗎？謝謝！」",
        "isCorrect": true,
        "feedback": "提供具體的解決方案，而不是單純抱怨，能有效改善合作。"
      },
      {
        "text": "每次都默默幫他改好",
        "isCorrect": false,
        "feedback": "這樣只會累死自己，問題永遠沒有解決。"
      },
      {
        "text": "直接去跟他的主管告狀",
        "isCorrect": false,
        "feedback": "這可能會讓該同事對你產生極大的敵意。"
      }
    ]
  },
  {
    "id": 24,
    "title": "伴侶的負面情緒爆發",
    "description": "伴侶因為工作壓力大，無緣無故對你講話很不耐煩。你該如何應對？",
    "options": [
      {
        "text": "馬上反擊：「你憑什麼把氣出在我身上？」",
        "isCorrect": false,
        "feedback": "在對方情緒高張時反擊，只會讓衝突升級。"
      },
      {
        "text": "「你看起來很煩躁，我先去旁邊看書，等你覺得比較放鬆我們再聊。」",
        "isCorrect": true,
        "feedback": "劃清界線，不接收對方的負面情緒，同時給予冷靜空間。"
      },
      {
        "text": "一直追問：「你到底在氣什麼？快點告訴我啊！」",
        "isCorrect": false,
        "feedback": "逼迫可能會產生反效果，讓人更焦慮。"
      }
    ]
  },
  {
    "id": 25,
    "title": "被不熟的人開玩笑",
    "description": "新來的同事拿你的外表或身材開了一個不太好笑的玩笑。你會怎麼反應？",
    "options": [
      {
        "text": "陪著一起乾笑，然後心裡很難過",
        "isCorrect": false,
        "feedback": "這會讓對方以為你不在意，下次可能會繼續。"
      },
      {
        "text": "平靜地看著他說：「我不覺得這很好笑，請別拿這開玩笑。」",
        "isCorrect": true,
        "feedback": "堅定且不帶情緒地拒絕，能有效讓對方知道你的紅線。"
      },
      {
        "text": "當場大罵他三字經",
        "isCorrect": false,
        "feedback": "過度反應反而會讓你在職場上顯得情緒失控。"
      }
    ]
  },
  {
    "id": 26,
    "title": "客戶提出無理要求",
    "description": "客戶要求你在週末時趕出一份急件，但不給加班費。你該如何回應？",
    "options": [
      {
        "text": "「這週末我已經有安排了，星期一上班我會優先幫您處理，可以嗎？」",
        "isCorrect": true,
        "feedback": "禮貌但堅定地拒絕，並給出替代方案。"
      },
      {
        "text": "為了保住客戶，只好犧牲整個週末幫他做",
        "isCorrect": false,
        "feedback": "這會慣壞客戶，導致他未來不斷索求。"
      },
      {
        "text": "「想要週末做就給我雙倍錢啊！」",
        "isCorrect": false,
        "feedback": "太過直接的談判會破壞合作氣氛。"
      }
    ]
  },
  {
    "id": 27,
    "title": "朋友過度依賴",
    "description": "一個朋友每天都打好幾個小時的電話向你抱怨生活，讓你覺得很沉重。該怎麼做？",
    "options": [
      {
        "text": "都不接他電話，直接封鎖",
        "isCorrect": false,
        "feedback": "這會突然傷害到朋友，缺乏溝通。"
      },
      {
        "text": "「我這陣子比較忙，晚上只能講15分鐘的電話，之後我需要休息喔。」",
        "isCorrect": true,
        "feedback": "溫和地設立時間界線，保護自己的能量。"
      },
      {
        "text": "繼續聽他講，然後自己壓力大到失眠",
        "isCorrect": false,
        "feedback": "助人之前必須先照顧好自己。"
      }
    ]
  },
  {
    "id": 28,
    "title": "面對他人的比較",
    "description": "同學常跟你炫耀他的成績和新包包，讓你覺得有壓力。你該如何面對？",
    "options": [
      {
        "text": "「哇，真的很不錯耶！對了，你推薦看那部新電影嗎？」",
        "isCorrect": true,
        "feedback": "給予簡短正面回應後立刻轉移話題，不陷入比較的漩渦。"
      },
      {
        "text": "馬上去買一個更貴的包包跟他拚了",
        "isCorrect": false,
        "feedback": "這會掉入無意義的物質競爭中。"
      },
      {
        "text": "嘲笑他的包包像假貨",
        "isCorrect": false,
        "feedback": "這充滿攻擊性，是不健康的交流。"
      }
    ]
  },
  {
    "id": 29,
    "title": "想結束冗長的拜訪",
    "description": "親戚來家裡作客聊了很久都不走，你已經很累了。該怎麼暗示？",
    "options": [
      {
        "text": "開始打哈欠並說：「哎呀，時間過得真快，今天聊得好開心，下次有空再來坐！」",
        "isCorrect": true,
        "feedback": "用總結性的話語暗示聚會結束，得體又不失禮。"
      },
      {
        "text": "直接對他們說：「我想睡覺了，你們趕快走吧。」",
        "isCorrect": false,
        "feedback": "太過直接，很容易讓長輩不開心。"
      },
      {
        "text": "自己跑去房間睡覺，留客人一個人在客廳",
        "isCorrect": false,
        "feedback": "這非常沒有禮貌。"
      }
    ]
  },
  {
    "id": 30,
    "title": "主管朝令夕改",
    "description": "主管昨天朝東，今天又改成朝西，讓你工作很難做。你可以怎麼溝通？",
    "options": [
      {
        "text": "「好的，主管，那我確認一下，現在的優先事項是這個對嗎？」",
        "isCorrect": true,
        "feedback": "透過白紙黑字的確認，釐清優先順序，保護自己不背鍋。"
      },
      {
        "text": "當面嗆他：「你到底想怎樣？想清楚再來好嗎？」",
        "isCorrect": false,
        "feedback": "職場上直接嗆聲對未來的發展不利。"
      },
      {
        "text": "乾脆兩邊都不做，等他定案再說",
        "isCorrect": false,
        "feedback": "消極抵制會被認為工作態度不佳。"
      }
    ]
  },
  {
    "id": 31,
    "title": "專案延期",
    "description": "同事負責的部份進度嚴重落後，影響到你的工作，時間快來不及了。",
    "options": [
      {
        "text": "幫他做完然後到處抱怨",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      },
      {
        "text": "直接在主管面前告狀說他沒能力",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "約他開會，了解他的困難並討論如何調整進度",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      }
    ]
  },
  {
    "id": 32,
    "title": "意見分歧",
    "description": "在會議上，你和另一位資深同事對解決方案有完全不同的看法。",
    "options": [
      {
        "text": "當面批評他的想法很蠢",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "先肯定他的想法，再提出自己的數據與觀點理性討論",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "直接放棄發言隨便他",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 33,
    "title": "臨時加班",
    "description": "老闆下班前五分鐘丟給你一個緊急任務，但你晚上已經和家人約好聚餐。",
    "options": [
      {
        "text": "評估任務緊急程度，說明晚上有事，討論是否能明天一早處理",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "直接摔東西說不幹了",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "默默接下然後讓家人在餐廳白等",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 34,
    "title": "拒絕請託",
    "description": "同事平常愛推卸責任，現在又想把不屬於你的工作塞給你。",
    "options": [
      {
        "text": "直接飆罵他不要臉",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "勉強答應然後自己加班氣得半死",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      },
      {
        "text": "明確但委婉地表明自己手邊有其他重要工作無法幫忙",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      }
    ]
  },
  {
    "id": 35,
    "title": "發現錯誤",
    "description": "你發現主管在給客戶的企劃書裡寫錯了一個重要報價數字。",
    "options": [
      {
        "text": "私下找個時機委婉提醒主管數字可能需要確認",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "在群組裡大聲說出主管的錯誤",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "當作沒看到，反正不是我的錯",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 36,
    "title": "面對批評",
    "description": "客戶對你辛苦做出來的設計非常不滿意，提出很多尖銳的批評。",
    "options": [
      {
        "text": "跟客戶大吵說他不懂藝術",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "當場哭出來跑走",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      },
      {
        "text": "冷靜傾聽客戶需求，記錄重點並詢問修改方向",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      }
    ]
  },
  {
    "id": 37,
    "title": "同事離職",
    "description": "團隊裡一位很有能力的同事突然要離職，士氣有些低落。",
    "options": [
      {
        "text": "到處散播他離職的八卦",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "祝福他並和團隊討論接手工作的方法",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "覺得公司快倒了也跟著提離職",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 38,
    "title": "功勞被搶",
    "description": "你獨立完成的企劃，同事卻在老闆面前暗示是他主導的。",
    "options": [
      {
        "text": "直接在老闆面前跟他對罵",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "默默生悶氣再也不認真工作",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      },
      {
        "text": "在合適場合補充說明自己在其中的具體貢獻與細節",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      }
    ]
  },
  {
    "id": 39,
    "title": "薪資談判",
    "description": "面試到了最後關頭，HR開出來的薪水比你預期的低了一點。",
    "options": [
      {
        "text": "覺得被羞辱直接掉頭就走",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "感謝肯定，並以自身能力和市場行情試著理性爭取",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "委曲求全馬上答應",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 40,
    "title": "會議冷場",
    "description": "你主持線上會議，問問題卻沒有人回應，氣氛很僵。",
    "options": [
      {
        "text": "直接點名詢問特定同事的想法，或改變問題方式",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "生氣地說大家都不配合",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "直接關掉會議室",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 41,
    "title": "設備故障",
    "description": "即將對大客戶簡報，投影機卻突然壞掉無法顯示。",
    "options": [
      {
        "text": "怪罪行政人員沒有把設備修好",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      },
      {
        "text": "慌張大喊完蛋了不知道怎麼辦",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "冷靜致歉，快速將電子檔傳給客戶看，並口頭報告",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      }
    ]
  },
  {
    "id": 42,
    "title": "跨部門溝通",
    "description": "另一個部門的窗口對你的請求總是不理不睬，拖延進度。",
    "options": [
      {
        "text": "每天發十封信去騷擾他",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      },
      {
        "text": "在自己部門大聲咒罵對方",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "打通電話直接溝通，或請雙方主管介入協調",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      }
    ]
  },
  {
    "id": 43,
    "title": "下屬犯錯",
    "description": "你帶的新人犯了一個大錯，導致公司損失。",
    "options": [
      {
        "text": "先一起解決問題，事後再私下檢討並教導預防方法",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "在辦公室公開羞辱他",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "幫他隱瞞不讓上層知道",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 44,
    "title": "資源分配",
    "description": "兩個專案同時需要你，但你分身乏術。",
    "options": [
      {
        "text": "列出兩個專案的優先層級，請主管裁定並協調資源",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "隨便亂做敷衍了事",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "不睡覺硬扛結果雙雙出包",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 45,
    "title": "文化衝突",
    "description": "面對外商客戶，對方的說話方式非常直接，讓你覺得有點受傷。",
    "options": [
      {
        "text": "覺得對方沒禮貌就不理他",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "理解這是文化差異，保持專業並就事論事回應",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "用更刻薄的話反擊回去",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 46,
    "title": "收到惡意投訴",
    "description": "有客戶因為自己的失誤，卻反過來惡意客訴你態度不佳。",
    "options": [
      {
        "text": "覺得委屈直接寫辭呈",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      },
      {
        "text": "打電話去跟客戶對罵",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "提供對話紀錄與證據給主管，冷靜說明原委",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      }
    ]
  },
  {
    "id": 47,
    "title": "同事八卦",
    "description": "午餐時，同事們開始熱烈討論另一位不在場同事的私事。",
    "options": [
      {
        "text": "跟著一起加油添醋",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "立刻跑去通風報信",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      },
      {
        "text": "轉移話題或保持沉默不參與討論",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      }
    ]
  },
  {
    "id": 48,
    "title": "負責人更換",
    "description": "專案做到一半，主管突然被換掉，新主管要求全部重來。",
    "options": [
      {
        "text": "聯合全組罷工抵抗新主管",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "整理目前進度和已確認事項，與新主管開會釐清他的期待",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "什麼都不做等著看笑話",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 49,
    "title": "性騷擾防範",
    "description": "客戶在應酬時開了黃腔，讓現場氣氛很尷尬。",
    "options": [
      {
        "text": "微笑但堅定地把話題拉回公事，或找藉口中途離席",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "為了訂單只能陪笑附和",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      },
      {
        "text": "拿酒潑對方",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      }
    ]
  },
  {
    "id": 50,
    "title": "業績壓力",
    "description": "月底了，業績還差一大截，主管每天緊迫盯人。",
    "options": [
      {
        "text": "重新檢視潛在客戶名單，並嘗試改變推銷策略",
        "isCorrect": true,
        "feedback": "高EQ的成熟處理方式！"
      },
      {
        "text": "壓力太大直接曠職",
        "isCorrect": false,
        "feedback": "這只會委屈自己且無助於解決問題。"
      },
      {
        "text": "為了業績去騙客戶買不需要的東西",
        "isCorrect": false,
        "feedback": "這樣會造成更大的衝突或損害專業形象。"
      }
    ]
  }
];
