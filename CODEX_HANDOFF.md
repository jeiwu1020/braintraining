# Codex handoff

- Goal: 統一小遊戲的手機橫向版面，優先完成 `GRID_FOCUS` 類型。
- Phase: 維護／正式介面遷移。
- Current status: `GRID_FOCUS` 已完成 14/19；本批完成麻將湊牌大師單款 Luna Max benchmark 試點。
- Shared UI: `GameShell`、`GridFocusLayout`、`GridFocusScreen`。回饋列可用 `feedbackClassName` 依遊戲主題覆寫，但仍須保留、不覆蓋盤面。
- Latest work: 已將麻將湊牌大師接上 `GameShell` + `GridFocusLayout`，新增單款 layout／行為契約測試，並同步更新遷移計畫與驗收證據。
- Latest verification: Mahjong target 4/4、GRID_FOCUS 14/14、full suite 41/41 通過，正式版建置成功；640×360 一般未作答、一般作答後、TEAM，以及 844×390 均無頁面溢位、控制項超界或小於 44px 的可操作按鈕。`tsc --noEmit` 仍只被既有 `fixMissingData.ts` 語法錯誤阻擋；`git diff --check` 通過。
- Remaining `GRID_FOCUS`: 拉密魔術牌、歡樂排七接龍、撿紅點、猜猜是哪張牌、金字塔接龍。
- Known risk: 正式建置仍有既有的單一主 bundle 超過 500 kB 警告，之後宜另開效能批次處理程式碼分割。
- Data-contract risk: `BOARD_TABLE` 已用於公開 21 點，但目前未列入 `GameLayoutPreset` 型別與五版型規格；棋盤階段開始前需先決定新增或合併。
- Type-check risk: `npm exec -- tsc --noEmit` 目前被既有 `fixMissingData.ts` 的無效字元與未結束 template literal 阻擋，尚未檢查到其餘型別錯誤。
- Next safest task: 停在麻將試點交付，先由使用者或 ChatGPT Sol 進行人工 review；確認 layout、觸控與規則未回歸後，再決定是否開始拉密魔術牌。
