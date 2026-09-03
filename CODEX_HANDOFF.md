# Codex handoff

- Goal: 統一小遊戲的手機橫向版面，優先完成 `GRID_FOCUS` 類型。
- Phase: 維護／正式介面遷移。
- Current status: `GRID_FOCUS` 已完成 18/19；本批完成邏輯猜牌 Luna High migration。
- Shared UI: `GameShell`、`GridFocusLayout`、`GridFocusScreen`。回饋列可用 `feedbackClassName` 依遊戲主題覆寫，但仍須保留、不覆蓋盤面。
- Latest work: 邏輯猜牌已接上 `GameShell` + `GridFocusLayout`，候選牌保留在 playfield，發問控制置於可局部捲動的 support，回答／猜測結果改用 reserved feedback；新增 deterministic initial-card seam 與實際使用的 question-elimination helper。
- Latest verification: GuessCard target 與 GRID_FOCUS tests 通過，full suite 18 files／49 tests 通過，正式版建置成功；`tsc --noEmit` 仍只被既有 `fixMissingData.ts` 語法錯誤阻擋；`git diff --check` 通過。瀏覽器已實測 640×360 NORMAL／ADVANCED、發問鎖定與排除、錯誤直接猜測扣分，以及 844×390 NORMAL／ADVANCED feedback；無 document overflow。
- Remaining `GRID_FOCUS`: 金字塔接龍。
- Known risk: 正式建置仍有既有的單一主 bundle 超過 500 kB 警告，之後宜另開效能批次處理程式碼分割。
- Data-contract risk: `BOARD_TABLE` 已用於公開 21 點，但目前未列入 `GameLayoutPreset` 型別與五版型規格；棋盤階段開始前需先決定新增或合併。
- Type-check risk: `npm exec -- tsc --noEmit` 目前被既有 `fixMissingData.ts` 的無效字元與未結束 template literal 阻擋，尚未檢查到其餘型別錯誤。
- Next safest task: 停在 GuessCard 交付，先由使用者或 ChatGPT Sol 進行人工 review；確認候選牌可讀性、局部捲動、2.5 秒互動鎖定與規則未回歸後，再決定是否開始 Pyramid migration。
