# Codex handoff

- Goal: 統一小遊戲的手機橫向版面，優先完成 `GRID_FOCUS` 類型並建立可複用的棋盤版型。
- Phase: 維護／正式介面遷移。
- Current status: `GRID_FOCUS` 已完成 19/19；四子棋 `BOARD_SIDEBAR` reference 已通過 reviewer gate，五子棋已完成第二款遷移，整體進度 32/59。
- Shared UI: `GameShell`、`GridFocusLayout`、`GridFocusScreen`、`BoardSidebarLayout`。回饋列可用 `feedbackClassName` 依遊戲主題覆寫，但仍須保留、不覆蓋盤面。
- Latest work: 金字塔接龍已接上 `GameShell` + `GridFocusLayout`；SETUP、PLAYING 與 GAMEOVER 使用共同 Shell，金字塔／stock／waste 保留在 playfield，提示置於 support，消除與 timeout 結果使用 reserved feedback／terminal result。GuessCard 另將 NORMAL 24 張與 ADVANCED 52 張候選牌改為全寬固定網格，發問控制改為下方橫向操作列，候選牌不再捲動。四子棋與五子棋均已接上 `GameShell` + `BoardSidebarLayout`，分別驗證 7×6 欄位操作與 10×10 逐格棋盤。
- Latest verification: GuessCard、Pyramid、Connect Four、Gomoku 與既有 GRID_FOCUS tests 通過，full suite 21 files／59 tests 通過，正式版建置成功；`tsc --noEmit` 仍只被既有 `fixMissingData.ts` 語法錯誤阻擋；`git diff --check` 通過。瀏覽器已實測 GuessCard 640×360 與 844×390 的 NORMAL 24/24、ADVANCED 52/52、直接猜牌與紅色提問排除；候選牌位固定且無 document overflow。
- Latest verification: Connect Four、Gomoku target、catalog、GRID_FOCUS regression 通過；瀏覽器已實測 BOARD_SIDEBAR 在 640×360、844×390、932×430 與 390×844 的代表狀態，四子棋 7×6 與五子棋 10×10 棋盤完整可見，PVE／PVP、逐格／欄位操作、AI 延遲、悔棋、勝利與規則對話框保留。
- Remaining `GRID_FOCUS`: 無；19/19 完成。
- Known risk: 正式建置仍有既有的單一主 bundle 超過 500 kB 警告，之後宜另開效能批次處理程式碼分割。
- Data-contract status: `BOARD_TABLE` contract 已正式化為第六個 layout preset；公開 21 點維持獨立牌桌型版面。`BOARD_SIDEBAR` 的 `BoardSidebarLayout` 已通過四子棋 reference gate，五子棋完成第二款遷移，尚未擴大到其他 BOARD 遊戲。
- Type-check risk: `npm exec -- tsc --noEmit` 目前被既有 `fixMissingData.ts` 的無效字元與未結束 template literal 阻擋，尚未檢查到其餘型別錯誤。
- Next safest task: 先由 reviewer 檢查五子棋第二款 `BOARD_SIDEBAR` 遷移，再決定是否批次遷移下一款棋盤遊戲；保持每款獨立驗證。
