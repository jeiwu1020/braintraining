# Codex handoff

- Goal: 統一小遊戲的手機橫向版面，優先完成 `GRID_FOCUS` 類型。
- Phase: 維護／正式介面遷移。
- Current status: `GRID_FOCUS` 已完成 13/19；本批完成神奇形色牌與繽紛形色棋。
- Shared UI: `GameShell`、`GridFocusLayout`、`GridFocusScreen`。回饋列可用 `feedbackClassName` 依遊戲主題覆寫，但仍須保留、不覆蓋盤面。
- Latest verification: `tests/gridFocusShapeGames.test.tsx` 2/2 通過；667×375 與 844×390 的一般／進階及作答後狀態皆無頁面溢位、控制項超界或小於 44px 的可操作按鈕。
- Remaining `GRID_FOCUS`: 麻將組合、拉密魔術牌、歡樂排七接龍、撿紅點、猜猜是哪張牌、金字塔接龍。
- Known risk: 正式建置仍有既有的單一主 bundle 超過 500 kB 警告，之後宜另開效能批次處理程式碼分割。
- Next safest task: 先遷移規則與牌組結構相近的麻將組合與拉密魔術牌，沿用同一組契約測試與雙尺寸作答後實測。
