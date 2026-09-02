# Codex handoff

- Goal: 統一小遊戲的手機橫向版面，優先完成 `GRID_FOCUS` 類型。
- Phase: 維護／正式介面遷移。
- Current status: `GRID_FOCUS` 已完成 13/19；本批完成神奇形色牌與繽紛形色棋。
- Shared UI: `GameShell`、`GridFocusLayout`、`GridFocusScreen`。回饋列可用 `feedbackClassName` 依遊戲主題覆寫，但仍須保留、不覆蓋盤面。
- Latest work: 已新增 `docs/MOBILE_LANDSCAPE_MIGRATION_PLAN.md`，整理 59 款全案進度、剩餘批次、驗收 Gate，以及 Luna Max／Sol 混合分工試點。
- Latest verification: 最近一次程式驗證為 13 個測試檔、37/37 測試通過，正式版建置成功；667×375 與 844×390 的一般／進階及作答後狀態皆無頁面溢位、控制項超界或小於 44px 的可操作按鈕。本次只新增文件，未修改遊戲程式。
- Remaining `GRID_FOCUS`: 麻將組合、拉密魔術牌、歡樂排七接龍、撿紅點、猜猜是哪張牌、金字塔接龍。
- Known risk: 正式建置仍有既有的單一主 bundle 超過 500 kB 警告，之後宜另開效能批次處理程式碼分割。
- Data-contract risk: `BOARD_TABLE` 已用於公開 21 點，但目前未列入 `GameLayoutPreset` 型別與五版型規格；棋盤階段開始前需先決定新增或合併。
- Type-check risk: `npm exec -- tsc --noEmit` 目前被既有 `fixMissingData.ts` 的無效字元與未結束 template literal 阻擋，尚未檢查到其餘型別錯誤。
- Next safest task: 先由使用者或 ChatGPT Sol 審查模型分工方案；若接受 Luna Max 試點，先只遷移麻將湊牌大師，沿用同一組契約測試與雙尺寸作答後實測。
