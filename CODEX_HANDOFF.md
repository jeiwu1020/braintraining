# Codex handoff

- Goal: 統一小遊戲的手機橫向版面，優先完成 `GRID_FOCUS` 類型。
- Phase: 維護／正式介面遷移。
- Current status: `GRID_FOCUS` 已完成 19/19；GuessCard 候選牌總覽 acceptance follow-up 已完成，里程碑待 reviewer gate。
- Shared UI: `GameShell`、`GridFocusLayout`、`GridFocusScreen`。回饋列可用 `feedbackClassName` 依遊戲主題覆寫，但仍須保留、不覆蓋盤面。
- Latest work: 金字塔接龍已接上 `GameShell` + `GridFocusLayout`；SETUP、PLAYING 與 GAMEOVER 使用共同 Shell，金字塔／stock／waste 保留在 playfield，提示置於 support，消除與 timeout 結果使用 reserved feedback／terminal result。GuessCard 另將 NORMAL 24 張與 ADVANCED 52 張候選牌改為全寬固定網格，發問控制改為下方橫向操作列，候選牌不再捲動。
- Latest verification: GuessCard、Pyramid 與 GRID_FOCUS tests 通過，full suite 19 files／53 tests 通過，正式版建置成功；`tsc --noEmit` 仍只被既有 `fixMissingData.ts` 語法錯誤阻擋；`git diff --check` 通過。瀏覽器已實測 GuessCard 640×360 與 844×390 的 NORMAL 24/24、ADVANCED 52/52、直接猜牌與紅色提問排除；候選牌位固定且無 document overflow。
- Remaining `GRID_FOCUS`: 無；19/19 完成。
- Known risk: 正式建置仍有既有的單一主 bundle 超過 500 kB 警告，之後宜另開效能批次處理程式碼分割。
- Data-contract risk: `BOARD_TABLE` 已用於公開 21 點，但目前未列入 `GameLayoutPreset` 型別與五版型規格；棋盤階段開始前需先決定新增或合併。
- Type-check risk: `npm exec -- tsc --noEmit` 目前被既有 `fixMissingData.ts` 的無效字元與未結束 template literal 阻擋，尚未檢查到其餘型別錯誤。
- Next safest task: 停在 GRID_FOCUS 19/19，先由使用者或 ChatGPT Sol 進行里程碑人工 review；確認 GuessCard 的 24/52 候選牌總覽與 Pyramid 的牌面可讀性、SETUP／GAMEOVER、stock／waste、timer 與規則未回歸後，再決定 BOARD 版型的架構與資料契約，勿直接開始 BOARD migration。
