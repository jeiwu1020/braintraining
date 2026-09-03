# Codex handoff

- Goal: 統一小遊戲的手機橫向版面，優先完成 `GRID_FOCUS` 類型並建立可複用的棋盤版型。
- Phase: 維護／正式介面遷移。
- Current status: `GRID_FOCUS` 已完成 19/19；四子棋 `BOARD_SIDEBAR` reference 已通過 reviewer gate，五子棋、黑白棋、數獨與點格棋已完成後續遷移，象棋暗棋以 LIGHT acceptance 保留專用 4×8 架構完成標準化，整體進度 36/59。
- Shared UI: `GameShell`、`GridFocusLayout`、`GridFocusScreen`、`BoardSidebarLayout`、`GameModeSelector`。`BOARD_SIDEBAR` feedback 為 optional；若 sidebar 已持續呈現 current turn／status，底部列只會重複資訊並壓縮棋盤時可省略。支援 PVE／PVP 的遊戲現在統一使用 persistent「單人／雙人」segmented selector，header 不重複顯示模式。
- Latest work: 金字塔接龍已接上 `GameShell` + `GridFocusLayout`；SETUP、PLAYING 與 GAMEOVER 使用共同 Shell，金字塔／stock／waste 保留在 playfield，提示置於 support，消除與 timeout 結果使用 reserved feedback／terminal result。GuessCard 另將 NORMAL 24 張與 ADVANCED 52 張候選牌改為全寬固定網格，發問控制改為下方橫向操作列，候選牌不再捲動。四子棋、五子棋與黑白棋均已接上 `GameShell` + `BoardSidebarLayout`，分別驗證 7×6 欄位、10×10 交叉點與 8×8 cell-based 棋盤。
- Latest verification: GuessCard、Pyramid、Connect Four、Gomoku、Othello 與既有 GRID_FOCUS tests 通過，full suite 25 files／71 tests 通過，正式版建置成功；`tsc --noEmit` 仍只被既有 `fixMissingData.ts` 語法錯誤阻擋；`git diff --check` 通過。瀏覽器已實測 GuessCard 640×360 與 844×390 的 NORMAL 24/24、ADVANCED 52/52、直接猜牌與紅色提問排除；候選牌位固定且無 document overflow。
- Latest verification: Connect Four、Gomoku、Othello、Sudoku、Dots & Boxes、Dark Chess target、catalog、GRID_FOCUS regression 通過；瀏覽器已實測 BOARD_SIDEBAR 在 640×360、844×390、932×430 與 390×844 的代表狀態，四子棋 7×6、五子棋 10×10、黑白棋 8×8、數獨 4×4／9×9、點格棋 5×5 dots／4×4 boxes 與暗棋 4×8 棋盤完整可見。暗棋本輪保留原有專用版面，改用共用 `GameModeSelector`，Back／Undo／Rules／Reset 與模式選項均達 44px 並補 accessible names；PVE/PVP、翻牌、AI 延遲、悔棋與規則流程未改變。四子棋本輪另確認所有孔洞／棋子為 1:1 正圓、A–G 座標列在手機與桌面可見且具對比、sidebar 狀態保留而底部重複 feedback 移除；BoardSidebar 在省略 feedback 時不再保留空白列。四子棋、五子棋、黑白棋與點格棋另已改用共用 `GameModeSelector`，四款均驗證 PVE／PVP 選項同時可見、選取狀態明確、實際切換與 header 去重。黑白棋初始合法步、D3 翻子、PVE／PVP、AI 延遲、悔棋、計數與規則對話框均保留，且省略重複底部 feedback；數獨固定／玩家數字、子區塊邊界、auto／manual target 與數字輸入均保留；點格棋 40 條 edge、方格 ownership、完成方格後續手、PVE／PVP、AI 延遲與悔棋均保留。
- Remaining `GRID_FOCUS`: 無；19/19 完成。
- Known risk: 正式建置仍有既有的單一主 bundle 超過 500 kB 警告，之後宜另開效能批次處理程式碼分割。
- Data-contract status: `BOARD_TABLE` contract 已正式化為第六個 layout preset；公開 21 點維持獨立牌桌型版面。`BOARD_SIDEBAR` 的 `BoardSidebarLayout` 已通過四子棋 reference gate，五子棋、黑白棋、數獨與點格棋完成後續遷移；暗棋未進行結構性 migration，已以 LIGHT acceptance 完成標準化，尚未擴大到其他 BOARD 遊戲。
- Type-check risk: `npm exec -- tsc --noEmit` 目前被既有 `fixMissingData.ts` 的無效字元與未結束 template literal 阻擋，尚未檢查到其餘型別錯誤。
- Next safest task: reviewer 先檢查暗棋 LIGHT acceptance 與 `docs/REMAINING_BOARD_MIGRATION_AUDIT.md` 的其餘六款 BOARD 稽核矩陣，再依 KEEP／LIGHT／FULL 路徑逐款安排工作；標準化不要求每款都做結構性遷移，並保持每款獨立驗證。
