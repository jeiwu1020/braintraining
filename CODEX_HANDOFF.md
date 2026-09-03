# Codex handoff

- Goal: 統一小遊戲的手機橫向版面，優先完成 `GRID_FOCUS` 類型。
- Phase: 維護／正式介面遷移。
- Current status: `GRID_FOCUS` 已完成 17/19；本批完成拉密魔術牌、歡樂排七接龍與經典撿紅點三款 Luna High migration。
- Shared UI: `GameShell`、`GridFocusLayout`、`GridFocusScreen`。回饋列可用 `feedbackClassName` 依遊戲主題覆寫，但仍須保留、不覆蓋盤面。
- Latest work: 已將拉密魔術牌、歡樂排七接龍與經典撿紅點接上 `GameShell` + `GridFocusLayout`，各新增真正 game component wiring 與答案 resolver 契約測試。
- Latest verification: 三款 target 與 GRID_FOCUS tests 通過，full suite 17 files／47 tests 通過，正式版建置成功；`tsc --noEmit` 仍只被既有 `fixMissingData.ts` 語法錯誤阻擋；`git diff --check` 通過。Chrome 已實測 Rummikub 640×360 未作答、作答後、TEAM 與 844×390，均無頁面溢位且主要控制項至少 44px；Sevens/Chinese Ten 以同一共用 layout contract 與靜態 responsive 檢查驗證。
- Remaining `GRID_FOCUS`: 邏輯猜牌、金字塔接龍。
- Known risk: 正式建置仍有既有的單一主 bundle 超過 500 kB 警告，之後宜另開效能批次處理程式碼分割。
- Data-contract risk: `BOARD_TABLE` 已用於公開 21 點，但目前未列入 `GameLayoutPreset` 型別與五版型規格；棋盤階段開始前需先決定新增或合併。
- Type-check risk: `npm exec -- tsc --noEmit` 目前被既有 `fixMissingData.ts` 的無效字元與未結束 template literal 阻擋，尚未檢查到其餘型別錯誤。
- Next safest task: 停在本批三款交付，先由使用者或 ChatGPT Sol 進行人工 review；確認 layout、觸控與規則未回歸後，再決定是否開始 GuessCard migration。
