// Story decisions are teaching branches, never scored or used for diagnosis.
export interface ChoiceFeedback { kind: 'goal_met' | 'useful' | 'partial'; label: string; confirmed: string; missing: string; next: string; detail: string; }
export interface StoryChoice { id: string; text: string; feedback: ChoiceFeedback; retryGuidance: string; }
export interface StoryDecision { type: string; question?: string; choices: StoryChoice[]; hint?: string; feedbackTrigger?: string; advanceRequiresGoalMet?: boolean; }
export interface StoryChallenge extends StoryDecision { id: string; title: string; contextFacts: string[]; budgetSeconds: number; optional: boolean; allOptionsLegitimate: boolean; }
export interface StoryScreen { n: number; chapterId: string; contextFacts: string[]; interaction: StoryDecision; challenge: StoryChallenge | null; }
export const STORY_SCREENS: StoryScreen[] = [
  {
    "n": 1,
    "chapterId": "c1",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": null
  },
  {
    "n": 2,
    "chapterId": "c1",
    "contextFacts": [
      "最近確實有網購。",
      "還沒開原購物App核對。",
      "通知要求補資料，並補付重新配送費。"
    ],
    "interaction": {
      "type": "decision",
      "question": "哪一步最能先確認原本的包裹？",
      "choices": [
        {
          "id": "a",
          "text": "核對寄件名稱與通知格式",
          "feedback": {
            "kind": "partial",
            "label": "已確認一部分，還缺一步",
            "confirmed": "你在檢查訊息外觀。",
            "missing": "外觀還不能確認原訂單。",
            "next": "自己開原購物App，先找訂單。",
            "detail": "自己開原購物App，先找訂單。"
          },
          "retryGuidance": "自己開原購物App，先找訂單。"
        },
        {
          "id": "b",
          "text": "自己開原購物App找訂單",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你回到了原先使用的購物管道。",
            "missing": "有訂單，仍不代表補費通知是真的。",
            "next": "下一步核對這次要求，不急著填資料。",
            "detail": "下一步核對這次要求，不急著填資料。"
          },
          "retryGuidance": "下一步核對這次要求，不急著填資料。"
        },
        {
          "id": "c",
          "text": "問同住家人是否也有訂東西",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你在確認家中是否有人下單。",
            "missing": "還沒核對陳先生這一筆訂單。",
            "next": "把家人的資訊與原訂單一起核對。",
            "detail": "把家人的資訊與原訂單一起核對。"
          },
          "retryGuidance": "把家人的資訊與原訂單一起核對。"
        }
      ],
      "hint": "這一題只先查「有沒有這筆包裹」。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false
    },
    "challenge": null
  },
  {
    "n": 3,
    "chapterId": "c1",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": null
  },
  {
    "n": 4,
    "chapterId": "c1",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": null
  },
  {
    "n": 5,
    "chapterId": "c1",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": null
  },
  {
    "n": 6,
    "chapterId": "c1",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": {
      "type": "decision",
      "question": "只有一般手機，哪個查法最能確認這筆要求？",
      "choices": [
        {
          "id": "a",
          "text": "用原訂購單電話查這筆包裹",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你用原訂購單的管道查個案。",
            "missing": "仍要說清楚通知要求補哪些資料。",
            "next": "請客服確認這筆包裹是否需要補件。",
            "detail": "請客服確認這筆包裹是否需要補件。"
          },
          "retryGuidance": "請客服確認這筆包裹是否需要補件。"
        },
        {
          "id": "b",
          "text": "打165了解常見包裹詐騙",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能取得反詐騙諮詢。",
            "missing": "一般騙法還不能確認這筆包裹。",
            "next": "也聯絡原訂購管道查個案要求。",
            "detail": "也聯絡原訂購管道查個案要求。"
          },
          "retryGuidance": "也聯絡原訂購管道查個案要求。"
        },
        {
          "id": "c",
          "text": "用原訂購單電話問一般補件規則",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能了解一般補件規則。",
            "missing": "規則存在，不等於這次要求成立。",
            "next": "再核對這筆包裹是否符合規則。",
            "detail": "再核對這筆包裹是否符合規則。"
          },
          "retryGuidance": "再核對這筆包裹是否符合規則。"
        }
      ],
      "hint": "題目要確認的是自己的這一筆，不只是一般規則。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false,
      "id": "c1-challenge",
      "title": "換個條件：沒有App也能查",
      "contextFacts": [
        "陳先生只有一般手機，沒有App。",
        "他保留原訂購單，單上有官方電話與訂單資訊。",
        "現在要確認這筆包裹是否真的要補資料。"
      ],
      "budgetSeconds": 60,
      "optional": true,
      "allOptionsLegitimate": true
    }
  },
  {
    "n": 7,
    "chapterId": "c2",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": null
  },
  {
    "n": 8,
    "chapterId": "c2",
    "contextFacts": [
      "模擬App內確有同一筆訂單。",
      "配送狀態為配送中。",
      "訂單頁沒有顯示追加費用。"
    ],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": null
  },
  {
    "n": 9,
    "chapterId": "c2",
    "contextFacts": [
      "原App有同一筆訂單。",
      "目前沒有追加費用資訊。"
    ],
    "interaction": {
      "type": "decision",
      "question": "接下來哪個問題最需要補齊？",
      "choices": [
        {
          "id": "a",
          "text": "原本確實有沒有這筆訂單",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "這是重要的基本資料。",
            "missing": "剛才已在原App找到這筆訂單。",
            "next": "現在把焦點移到通知的補費要求。",
            "detail": "現在把焦點移到通知的補費要求。"
          },
          "retryGuidance": "現在把焦點移到通知的補費要求。"
        },
        {
          "id": "b",
          "text": "包裹目前走到哪個配送站",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "配送位置有助安排收件。",
            "missing": "位置不能回答這次是否該補費。",
            "next": "再查這筆補費要求是否成立。",
            "detail": "再查這筆補費要求是否成立。"
          },
          "retryGuidance": "再查這筆補費要求是否成立。"
        },
        {
          "id": "c",
          "text": "目前資訊不足，先查補費是否成立",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你抓到目前還沒確認的要求。",
            "missing": "仍需要能核對個案的官方回答。",
            "next": "請官方客服查這筆要求與處理入口。",
            "detail": "請官方客服查這筆要求與處理入口。"
          },
          "retryGuidance": "請官方客服查這筆要求與處理入口。"
        }
      ],
      "hint": "把「原訂單」和「這次新增要求」分開看。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false
    },
    "challenge": null
  },
  {
    "n": 10,
    "chapterId": "c2",
    "contextFacts": [
      "姓名、訂單和配送中狀態都相符。",
      "原App沒有追加費用資訊。",
      "現在要核對這次補費要求及付款入口。"
    ],
    "interaction": {
      "type": "decision",
      "question": "哪一步最能確認這則補費要求本身？",
      "choices": [
        {
          "id": "a",
          "text": "到物流官網查包裹目前位置",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能確認包裹配送進度。",
            "missing": "位置還不能確認此次補費。",
            "next": "再請個案客服確認補費與入口。",
            "detail": "再請個案客服確認補費與入口。"
          },
          "retryGuidance": "再請個案客服確認補費與入口。"
        },
        {
          "id": "b",
          "text": "問原App訂單客服：這次補費與入口",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你直接查這筆費用與處理入口。",
            "missing": "客服若未回答，仍不能先付款。",
            "next": "請對方針對這次要求給個案確認。",
            "detail": "請對方針對這次要求給個案確認。"
          },
          "retryGuidance": "請對方針對這次要求給個案確認。"
        },
        {
          "id": "c",
          "text": "到物流官網查一般運費表",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能了解一般費用標準。",
            "missing": "一般費表未必適用這次包裹。",
            "next": "再確認這筆包裹是否有追加費用。",
            "detail": "再確認這筆包裹是否有追加費用。"
          },
          "retryGuidance": "再確認這筆包裹是否有追加費用。"
        }
      ],
      "hint": "問題不是「哪裡可信」，而是「查到的內容對不對題」。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false
    },
    "challenge": null
  },
  {
    "n": 11,
    "chapterId": "c2",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": {
      "type": "decision",
      "question": "這份回覆還沒答補費，下一句最對題？",
      "choices": [
        {
          "id": "a",
          "text": "向物流官方客服查這次追加費用",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你把問題交給回覆指定的個案管道。",
            "missing": "仍要確認這筆費用及官方處理方式。",
            "next": "用原App提供的已確認物流資料查個案。",
            "detail": "用原App提供的已確認物流資料查個案。"
          },
          "retryGuidance": "用原App提供的已確認物流資料查個案。"
        },
        {
          "id": "b",
          "text": "向App客服核對當初運費明細",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能確認原訂單收過哪些費用。",
            "missing": "原費用不能單獨排除此次追加費用。",
            "next": "再向負責配送的官方個案管道確認。",
            "detail": "再向負責配送的官方個案管道確認。"
          },
          "retryGuidance": "再向負責配送的官方個案管道確認。"
        },
        {
          "id": "c",
          "text": "向物流官方客服查預計到件時間",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能安排何時收件。",
            "missing": "到件時間仍沒有回答是否需補費。",
            "next": "同一官方客服可再查這次追加費用。",
            "detail": "同一官方客服可再查這次追加費用。"
          },
          "retryGuidance": "同一官方客服可再查這次追加費用。"
        }
      ],
      "hint": "這次問的是新增費用；原費用與送達時間是不同問題。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false,
      "id": "c2-challenge",
      "title": "客服回覆了，但有回答到問題嗎？",
      "contextFacts": [
        "虛構App客服回覆：平台目前沒有追加費用資料。",
        "客服提供已確認的物流名稱與包裹號，說此次配送問題需向物流官方客服查。",
        "陳先生仍未獲得此次補費與入口的確認。"
      ],
      "budgetSeconds": 60,
      "optional": true,
      "allOptionsLegitimate": true
    }
  },
  {
    "n": 12,
    "chapterId": "c3",
    "contextFacts": [
      "帳號頭像與過往對話都還在。",
      "陳先生有借款訊息出現前就保存的電話。",
      "尚未確認本人，也尚未付款。"
    ],
    "interaction": {
      "type": "decision",
      "question": "哪步最能多一個獨立確認？",
      "choices": [
        {
          "id": "a",
          "text": "用原先存的電話核對這次借款",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你增加不依賴聊天帳號的管道。",
            "missing": "確認本人，仍不代表必須借錢。",
            "next": "核對這次要求後，再自行決定怎麼幫。",
            "detail": "核對這次要求後，再自行決定怎麼幫。"
          },
          "retryGuidance": "核對這次要求後，再自行決定怎麼幫。"
        },
        {
          "id": "b",
          "text": "在這個聊天帳號發起語音通話",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你想取得比文字更多的線索。",
            "missing": "通話仍經由同一個未確認帳號。",
            "next": "再用原先保存的電話或當面確認。",
            "detail": "再用原先保存的電話或當面確認。"
          },
          "retryGuidance": "再用原先保存的電話或當面確認。"
        },
        {
          "id": "c",
          "text": "比對這個帳號以前的聊天紀錄",
          "feedback": {
            "kind": "partial",
            "label": "已確認一部分，還缺一步",
            "confirmed": "你確認對話紀錄有延續。",
            "missing": "還不能證明現在仍是本人操作。",
            "next": "用另一個原先已知管道確認這次要求。",
            "detail": "用另一個原先已知管道確認這次要求。"
          },
          "retryGuidance": "用另一個原先已知管道確認這次要求。"
        }
      ],
      "hint": "問自己：這個新線索是否仍經由同一帳號？",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false
    },
    "challenge": null
  },
  {
    "n": 13,
    "chapterId": "c3",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": null
  },
  {
    "n": 14,
    "chapterId": "c3",
    "contextFacts": [
      "陳先生確實預約過修自行車，但忘了日期。",
      "原預約App仍可開啟。",
      "通知寫明天下午3點、青禾門市；全部名稱與資料虛構。"
    ],
    "interaction": {
      "type": "decision",
      "question": "哪步最能確認自己的這筆預約？",
      "choices": [
        {
          "id": "a",
          "text": "查門市官網的營業時間與地址",
          "feedback": {
            "kind": "partial",
            "label": "已確認一部分，還缺一步",
            "confirmed": "你能確認門市何時開、在哪裡。",
            "missing": "還沒有確認陳先生個人的預約。",
            "next": "回原預約紀錄核對這筆日期與時間。",
            "detail": "回原預約紀錄核對這筆日期與時間。"
          },
          "retryGuidance": "回原預約紀錄核對這筆日期與時間。"
        },
        {
          "id": "b",
          "text": "問原平台客服是否會發這類提醒",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能了解店家的通知慣例。",
            "missing": "會發提醒，不等於這一筆日期正確。",
            "next": "再核對原App中自己的預約紀錄。",
            "detail": "再核對原App中自己的預約紀錄。"
          },
          "retryGuidance": "再核對原App中自己的預約紀錄。"
        },
        {
          "id": "c",
          "text": "核對原App裡這筆預約的時地",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你直接核對本人這筆安排。",
            "missing": "資料若不一致，仍需向原管道確認。",
            "next": "有落差就從原預約管道聯絡店家。",
            "detail": "有落差就從原預約管道聯絡店家。"
          },
          "retryGuidance": "有落差就從原預約管道聯絡店家。"
        }
      ],
      "hint": "店家的資料，和自己的預約資料，不是同一件事。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false
    },
    "challenge": null
  },
  {
    "n": 15,
    "chapterId": "c3",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": {
      "type": "decision",
      "question": "兩份時間不同，哪個查詢最能解開衝突？",
      "choices": [
        {
          "id": "a",
          "text": "向門市官方客服查一般維修時段",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能知道通常何時可維修。",
            "missing": "一般時段不能確認這筆是否更動。",
            "next": "提供這筆預約的差異，請客服查現行時間。",
            "detail": "提供這筆預約的差異，請客服查現行時間。"
          },
          "retryGuidance": "提供這筆預約的差異，請客服查現行時間。"
        },
        {
          "id": "b",
          "text": "從原預約管道查這筆現行時間",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你直接請原管道處理這筆衝突。",
            "missing": "時間確認後，還要保留最新安排。",
            "next": "核對現行時地，再更新自己的提醒。",
            "detail": "核對現行時地，再更新自己的提醒。"
          },
          "retryGuidance": "核對現行時地，再更新自己的提醒。"
        },
        {
          "id": "c",
          "text": "到公車官網查下午的可搭班次",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你先準備下午出門的交通。",
            "missing": "預約是否改下午仍未確認。",
            "next": "先解開預約時間衝突，再定交通。",
            "detail": "先解開預約時間衝突，再定交通。"
          },
          "retryGuidance": "先解開預約時間衝突，再定交通。"
        }
      ],
      "hint": "先處理會影響其他安排的那個未確定資訊。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false,
      "id": "c3-challenge",
      "title": "通知與原紀錄不一致",
      "contextFacts": [
        "原App紀錄是明天上午10點。",
        "通知寫明天下午3點。",
        "陳先生沒有印象曾同意改時間，兩份資料都還沒再確認。"
      ],
      "budgetSeconds": 60,
      "optional": true,
      "allOptionsLegitimate": true
    }
  },
  {
    "n": 16,
    "chapterId": "c3",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": null
  },
  {
    "n": 17,
    "chapterId": "c4",
    "contextFacts": [
      "陳先生自己開原會員App，找到同名兌換活動。",
      "App活動說明沒有提到需要卡片驗證。",
      "訊息卻要求從連結輸入卡片資料作驗證。"
    ],
    "interaction": {
      "type": "decision",
      "question": "哪步最能核對這次「卡片驗證」要求？",
      "choices": [
        {
          "id": "a",
          "text": "在原App核對活動名稱與截止日",
          "feedback": {
            "kind": "partial",
            "label": "已確認一部分，還缺一步",
            "confirmed": "你在核對活動名稱與截止日。",
            "missing": "還沒核對卡片驗證是否需要。",
            "next": "再查這次兌換的資料要求。",
            "detail": "再查這次兌換的資料要求。"
          },
          "retryGuidance": "再查這次兌換的資料要求。"
        },
        {
          "id": "b",
          "text": "在原App查看自己的剩餘點數",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能知道是否有點數可用。",
            "missing": "點數多少不能確認卡片驗證要求。",
            "next": "問官方客服此次兌換是否需卡片驗證。",
            "detail": "問官方客服此次兌換是否需卡片驗證。"
          },
          "retryGuidance": "問官方客服此次兌換是否需卡片驗證。"
        },
        {
          "id": "c",
          "text": "從原App客服查此次兌換資料要求",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你直接核對通知新增的要求。",
            "missing": "還沒獲得確認前，不由訊息輸入。",
            "next": "確認需要什麼，以及正式處理入口。",
            "detail": "確認需要什麼，以及正式處理入口。"
          },
          "retryGuidance": "確認需要什麼，以及正式處理入口。"
        }
      ],
      "hint": "活動、點數與資料要求，是三個不同問題。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false
    },
    "challenge": null
  },
  {
    "n": 18,
    "chapterId": "c4",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": null
  },
  {
    "n": 19,
    "chapterId": "c4",
    "contextFacts": [
      "他已停止操作。",
      "輸入過信用卡資料，目前未見不明交易。",
      "此刻沒有立即人身危險。"
    ],
    "interaction": {
      "type": "decision",
      "question": "哪步最直接把卡片風險交給能處理的人？",
      "choices": [
        {
          "id": "a",
          "text": "打165，詢問判斷與報案方式",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能取得反詐騙諮詢及轉介協助。",
            "missing": "165不能代替銀行處理這張卡風險。",
            "next": "同時或立即接上銀行，不必等諮詢完。",
            "detail": "同時或立即接上銀行，不必等諮詢完。"
          },
          "retryGuidance": "同時或立即接上銀行，不必等諮詢完。"
        },
        {
          "id": "b",
          "text": "立即聯絡發卡銀行的官方即時客服",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你聯絡到能評估卡片保護的單位。",
            "missing": "目前沒交易，仍不能排除資料風險。",
            "next": "說明資料類別與操作時間，依官方指引。",
            "detail": "說明資料類別與操作時間，依官方指引。"
          },
          "retryGuidance": "說明資料類別與操作時間，依官方指引。"
        },
        {
          "id": "c",
          "text": "開銀行App查交易及掛失說明",
          "feedback": {
            "kind": "partial",
            "label": "已確認一部分，還缺一步",
            "confirmed": "你能了解交易現況與求助方式。",
            "missing": "看過說明，不等於銀行已收到通報。",
            "next": "接著立即用官方即時管道聯絡銀行。",
            "detail": "接著立即用官方即時管道聯絡銀行。"
          },
          "retryGuidance": "接著立即用官方即時管道聯絡銀行。"
        }
      ],
      "hint": "看此刻要處理的是卡片風險，還是判斷騙法。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false
    },
    "challenge": null
  },
  {
    "n": 20,
    "chapterId": "c4",
    "contextFacts": [],
    "interaction": {
      "type": "participation_choice",
      "question": "你想怎麼練習這段求助？",
      "choices": [
        {
          "id": "a",
          "text": "照著句型，說明做過哪一步",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你把事件與已做動作說清楚。",
            "missing": "不用在團體裡補上真實資料內容。",
            "next": "再說希望官方協助評估什麼。",
            "detail": "再說希望官方協助評估什麼。"
          },
          "retryGuidance": "再說希望官方協助評估什麼。"
        },
        {
          "id": "b",
          "text": "請陪同者協助整理操作經過",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你使用支持，讓事情更容易說清楚。",
            "missing": "陪同者仍不代替官方處理帳戶。",
            "next": "一起從已確認的官方管道求助。",
            "detail": "一起從已確認的官方管道求助。"
          },
          "retryGuidance": "一起從已確認的官方管道求助。"
        }
      ],
      "hint": "兩種方式都可以，也可以先旁聽。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false
    },
    "challenge": null
  },
  {
    "n": 21,
    "chapterId": "c4",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": {
      "type": "decision",
      "question": "現在先減少卡片持續風險，哪個最直接？",
      "choices": [
        {
          "id": "a",
          "text": "立即聯絡發卡銀行的即時客服",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "銀行能受理這張卡的風險通報。",
            "missing": "處理結果與可採措施仍依銀行評估。",
            "next": "同時保留紀錄，按需要諮詢或報警。",
            "detail": "同時保留紀錄，按需要諮詢或報警。"
          },
          "retryGuidance": "同時保留紀錄，按需要諮詢或報警。"
        },
        {
          "id": "b",
          "text": "打165諮詢詐騙與報案方式",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你能取得反詐騙諮詢與轉介協助。",
            "missing": "這通諮詢不能代替銀行即時處理。",
            "next": "也立即通知銀行；可請陪同者並行協助。",
            "detail": "也立即通知銀行；可請陪同者並行協助。"
          },
          "retryGuidance": "也立即通知銀行；可請陪同者並行協助。"
        },
        {
          "id": "c",
          "text": "到警察機關報案並提供經過",
          "feedback": {
            "kind": "useful",
            "label": "這一步有幫助",
            "confirmed": "你在啟動警方報案與調查程序。",
            "missing": "報案本身不取代銀行的卡片措施。",
            "next": "不要等報案完成，先或同時聯絡銀行。",
            "detail": "不要等報案完成，先或同時聯絡銀行。"
          },
          "retryGuidance": "不要等報案完成，先或同時聯絡銀行。"
        }
      ],
      "hint": "三個都能幫忙，但現在指定的目標是減少卡片風險。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false,
      "id": "c4-challenge",
      "title": "都能求助，哪個先處理當下風險？",
      "contextFacts": [
        "新的教學條件：陳先生已收到一筆不是自己的刷卡通知。",
        "他現在人身安全，需要先減少卡片持續風險。",
        "可以請可信任的人陪同，不必等某個程序全部結束。"
      ],
      "budgetSeconds": 60,
      "optional": true,
      "allOptionsLegitimate": true
    }
  },
  {
    "n": 22,
    "chapterId": "c4",
    "contextFacts": [],
    "interaction": {
      "type": "participation_choice",
      "question": "你想先保留哪一個生活動作？",
      "choices": [
        {
          "id": "a",
          "text": "先停手，再找原本的查詢入口",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你替自己留出確認的時間。",
            "missing": "停下之後，事情仍需要接著查。",
            "next": "選一個原先可信的官方入口。",
            "detail": "選一個原先可信的官方入口。"
          },
          "retryGuidance": "選一個原先可信的官方入口。"
        },
        {
          "id": "b",
          "text": "請可信任的人陪我整理問題",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你選擇使用可取得的支持。",
            "missing": "陪伴不能代替官方確認個案。",
            "next": "一起把問題帶回官方管道。",
            "detail": "一起把問題帶回官方管道。"
          },
          "retryGuidance": "一起把問題帶回官方管道。"
        },
        {
          "id": "c",
          "text": "不確定時，向165諮詢下一步",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你保留了反詐騙求助方式。",
            "missing": "銀行風險與人身危險仍需相應管道。",
            "next": "依當下需要，也聯絡銀行或110。",
            "detail": "依當下需要，也聯絡銀行或110。"
          },
          "retryGuidance": "依當下需要，也聯絡銀行或110。"
        }
      ],
      "hint": "這是選擇支持方法，不是能力測驗。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false
    },
    "challenge": null
  },
  {
    "n": 23,
    "chapterId": "c4",
    "contextFacts": [],
    "interaction": {
      "type": "participation_choice",
      "question": "選一種教回方式。",
      "choices": [
        {
          "id": "a",
          "text": "我用自己的話說一個具體動作",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你把方法換成自己的語言。",
            "missing": "不用背完，也不需要替真假下定論。",
            "next": "補一句：要從哪個原有管道開始？",
            "detail": "補一句：要從哪個原有管道開始？"
          },
          "retryGuidance": "補一句：要從哪個原有管道開始？"
        },
        {
          "id": "b",
          "text": "我照句型念，再補一個查詢入口",
          "feedback": {
            "kind": "goal_met",
            "label": "切中現在要確認的事",
            "confirmed": "你用提示把下一步說出來。",
            "missing": "有提示仍是有效的練習。",
            "next": "把App、原帳單或官方客服說具體。",
            "detail": "把App、原帳單或官方客服說具體。"
          },
          "retryGuidance": "把App、原帳單或官方客服說具體。"
        }
      ],
      "hint": "可以只說一句；旁聽也保留參與進度。",
      "feedbackTrigger": "on_select",
      "advanceRequiresGoalMet": false
    },
    "challenge": null
  },
  {
    "n": 24,
    "chapterId": "c4",
    "contextFacts": [],
    "interaction": {
      "type": "guided_reveal",
      "choices": []
    },
    "challenge": null
  }
];
