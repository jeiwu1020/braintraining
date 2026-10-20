# 夜市選菜會／築牆競走：獨立電腦難度候選驗收

本檔保留首次實作完成時的候選驗收紀錄；後續提交、部署與回退紀錄另由發布任務保存。

日期：2026-10-20。候選變更留在雲端工作樹供審閱，未 commit、push、開 PR、合併或部署。

## 基準與範圍

- 初始分支 `work`、工作樹乾淨，HEAD `0cf6089`。讀取專案 README、CODEX_HANDOFF、PLAYGROUND_HANDOFF 與現有測試／瀏覽器指引；checkout 未找到 AGENTS.md 或 `.agents/skills` 相關檔。
- fetch 後快轉至最新 `origin/main`：`7157d340c5d9719701e4b70088c6f158dcd701a0`。收尾 `git ls-remote origin refs/heads/main` 再確認仍為此版本。
- 保留此版本夜市訂單說明。本次不改兩個 rules.ts、菜牌數、訂單、分數、牆數或任何遊戲規則；不改另外五款桌遊及選單圖像。
- 分工模型設定為 GPT-6.1 Sol／High；各子任務明確使用相同設定。

## 可觀察的電腦行為

玩法 `normal／advanced` 與可選電腦 `easy／standard／challenge` 分開。設定頁只在單人顯示三個選項及策略說明；兩隊仍完全由人操作。新安裝／未存設定預設「標準」。對局標題顯示電腦設定，窄畫面可省略顯示末端文字但保留完整文字內容。

| 遊戲 | 輕鬆 | 標準 | 挑戰 |
| --- | --- | --- | --- |
| 夜市 | 看自身基本分、飯糰配對潛力；進階仍會看有效訂單。在自身估值距最佳 1.5 分內的合法槽位，用 AI seed 選擇；不做對手否決評估 | 相同自身估值，加上依公開未知菜色數量推估的下一次自身選牌收益，權重 0.35；不搜尋對手反應 | 保留原進階的對手下一手期望收益評估（扣除權重 0.6），一般玩法亦可使用；一般仍沒有訂單加分 |
| 築牆 | 最多 1 層、60ms、6000 節點；只在合法走棋中，選自身最短路長距最佳最多一步的候選，用 AI seed 變化，不主動放牆 | 最多 2 層、180ms、6000 節點；自身路長權重 12、對手路長權重 4，較重自身進度，有限 minimax 前瞻 | 最多 3 層、450ms、6000 節點；保留原本較強路長差／剩牆評估與 minimax，兩種玩法都能使用 |

築牆所有設定與備援優先採用立即到岸的合法走法。沒有依使用者輸贏調整參數，也沒有改分或測量／宣稱人類勝率。

夜市只把 `Observation` 送給 worker／chooser，內容為公開槽位、雙方餐盤、有效訂單、剩餘手數與公開未知菜色總數；不含遊戲 seed、隱藏牌序或卡牌 ID。測試更換遊戲 seed、反轉私有牌庫或使用相同公開局面的不同 seed，決策均相同。

## 舊資料與生命週期

- 保留 v1 session journal 格式和 storage key；新增 optional `settings.aiDifficulty`。缺欄位不補值、不重寫為標準／挑戰。
- 舊一般局維持原一般策略，舊進階局維持原進階策略；連原備援也保留（夜市首個合法槽位、築牆原合法前進選擇）。舊資料存在但缺欄位的設定頁標示「沿用舊版」，三個新選項不假裝已選取；對局標題顯示「舊版電腦」。
- 舊局繼續、重新整理、重開或再玩一局都沿用原設定。使用者在重新設定中明確選擇新難度，才將新欄位寫入下一局。未知或 malformed 難度的 journal 拒絕恢復，走既有隔離式復原流程。
- 重播只依原 seed、玩法與已確認 action journal 重建規則狀態，不重新呼叫 AI。難度不進入棋盤規則狀態。撤回保留 seed，同一個公開局面與相同 AI 工作預算可重現選擇。
- 每局保留既有 `crypto.getRandomValues` 兩個獨立值：遊戲 seed 與 AI seed。夜市每手沿用 `(aiSeed ^ round*97 ^ picks) >>> 0`，築牆使用 `(aiSeed + ply) >>> 0`。不從牌庫 seed 推導隨機選擇。再玩一局重新抽獨立 seed、保留設定並交換先手。
- worker 與備援接收同一難度及每手 AI seed。新夜市備援呼叫相同 chooser；新築牆備援採相同難度估值的一層合法評估。輕鬆 worker／備援的 seed 選擇一致；標準／挑戰備援可能因沒有深層對手反應而較弱，畫面仍標示「使用合法備用選擇」。
- 沿用 useAi 的 2 秒 watchdog、終止 worker 及 token／cancelled 檢查；撤回、重掛、重開、token 重用後的過期回覆不會提交。電腦準備好仍須按「看電腦行動」才提交。

## 驗證結果

最終來源狀態下：

| 項目 | 結果 |
| --- | --- |
| `npm test` | 通過；149 files，1092 passed、1 skipped、0 failed；89.84s |
| `node node_modules/typescript/bin/tsc --noEmit` | 通過，exit 0 |
| `npm run build` | 通過，Vite 6.4.2，29.55s，exit 0 |
| `git diff --check` | 通過 |
| `node docs/qa/ai-difficulty-browser.mjs` | 通過；12 個真正 module-worker 的玩法／難度組合均成功回覆，未走備援 |

既有 skipped 為 `tests/weiqiFacilitatorMatch.test.tsx` 的 `it.runIf(landscape)` 讓子設定測試在非 landscape 分組略過；本次沒有新增 skip。

新增四檔共 156 項測試，均包含於完整測試：

- `aiDifficultySettings.test.tsx`（17）：單人顯示、兩隊隱藏、玩法／難度獨立、新預設、舊局不自動遷移、明確選新設定、恢復／重播、malformed 欄位。
- `nightMarketAiDifficulty.test.ts`（24）：2×3 合法／可重現／隱藏牌序不可辨識、自身與阻擋差異、有效訂單、飯糰有限前瞻、worker 與備援。
- `wallRaceAiDifficulty.test.ts`（17）：2×3 合法／深度上限、seed 變化、固定局面阻擋與深層策略差異、立即獲勝、node／time 中止與 completed depth、legacy、worker。
- `aiDifficultyLifecycle.test.tsx`（98）：兩款全部組合之 worker payload、明確揭示、constructor／error／watchdog 備援、撤回、重掛、過期回覆／相同 token 重用、獨立牌庫 seed、重播、舊局、再玩一局。

策略測試使用固定局面，不推論人類勝率。例如夜市標準拿自身較高分玉米、挑戰拿豆花阻止對手高收益；築牆有標準前進／挑戰選擇戰略牆的局面。深度最大值測試固定時鐘並使用足夠節點／少量候選；另外獨立測試逾時及節點不足時只回報已完成深度，不要求每次都跑滿。

瀏覽器在實際 App／Vite dev 下測兩款設定及遊戲畫面的 1440×900、390×844、640×360、852×393。文件沒有 viewport 外溢，所有量測到的遊戲按鈕至少 44×44；可操作本機捲動。涵蓋教學關閉、規則開關／Escape、預選取消、選單開關、重新設定取消／確認、明確 AI 揭示、兩手撤回、返回／繼續、reload、切換兩隊。`pageerror` 為 0。完整量測與 12 組 action journal 在 `ai-difficulty-browser.json`。

瀏覽器初次發現窄直向築牆既有目標提示左右並排會將格寬擠為 24px；已將直向提示移至棋盤上方，格子恢復足夠尺寸。此次只調整直向版面，不改棋規。重測上述四個尺寸均通過。畫面截圖輸出在 `/tmp/braintraining-ai-qa/`。

測試先觀察缺功能的預期失敗再實作；中間曾修正測試本身非法的築牆終局動作 fixture。早期重複完整測試進程已取消；上述完整 `npm test` 為之後從頭跑完的獨立最終結果。

## 修改檔案

Production（10）：

- `components/playground/Common.tsx`
- `components/playground/NightMarket.tsx`
- `components/playground/WallRace.tsx`
- `components/playground/playground.css`
- `games/playground/types.ts`
- `games/playground/session.ts`
- `games/playground/night-market/ai.ts`
- `games/playground/night-market/ai.worker.ts`
- `games/playground/wall-race/ai.ts`
- `games/playground/wall-race/ai.worker.ts`

Test（4）：上列四個新增測試檔。

QA（3）：本檔、`docs/qa/ai-difficulty-browser.mjs`、`docs/qa/ai-difficulty-browser.json`。

完整含新增檔的審閱 patch：`/workspace/scratch/braintraining-ai-difficulty.patch`；亦可直接檢查工作樹 tracked diff 與 untracked 新檔。

## 剩餘限制與未執行

- 築牆的隨機選擇在固定 seed／候選排序下可重現；標準與挑戰仍有真實時限，CPU 負載可改變最後完成深度，因而同一 seed 單獨不能保證跨機器或不同負載下的未提交 AI 決策完全相同。已提交 action 的儲存／重播仍精確一致。這也是保留原有時間預算搜尋的特性。
- 築牆 worker 失效時的單層備援可能錯過深層威脅；有明示備援，不宣稱具完整搜尋強度。
- 未執行實際手機觸控、Safari／iOS safe-area、長期平衡或人類勝率研究。Chromium viewport 模擬不等同實機。
- 無權限或環境阻礙。未執行任何發布操作。
