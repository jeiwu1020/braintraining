# 五款桌遊規則提示與選單素材審查（2026-10-20）

狀態：五款規則提示、無字選單圖、重複標題移除及本機驗證均已完成。使用者已授權提交及正常推送 main；實際提交、遠端一致性、部署終態與回退方式另外保存於本機發布紀錄。此文件記錄本機驗證，不宣稱已驗證正式站 UI。

## 基準與範圍

- 專案：`jeiwu1020/braintraining`，本機 `/workspace/braintraining`，發布分支 `main`。
- 起始執行 `git fetch origin main` 並快轉至 `bf6dda8800ed7ed419203a34c52d3da30dc28efe`；本批提交以此為父提交。原 checkout 為 `7157d34`，起始無未提交修改。
- 已檢查 `/workspace/.agents/skills`、專案 `.agents/skills` 與工作區指引；未提供相關 checkout SKILL.md 或 AGENTS.md。已閱讀 `CODEX_HANDOFF.md` 及相關引擎／驗證資料。
- 保留 AI 難度提交與夜市訂單說明。`games/`、AI、資源／分數邏輯、夜市／築牆元件、原盒繪、原 SVG、遊戲內素材均與基準相同。
- `table-games.css` 僅切換這五款選單背景及設定它們的4:3圖區；不修改其他遊戲圖像。`Playground.tsx` 僅移除這五款圖區的重複標題 span，下方 h2、描述與按鈕名稱保留，夜市與築牆 span 保留。

## 規則與引擎核對

| 元件 | 說明變更 | 引擎依據 |
| --- | --- | --- |
| Lighthouse.tsx | 裝貨、航行、卸貨各耗行動；抵達不自動交貨；平穩1行動、風浪只有遠岬航段2行動，有整備自動耗1枚改為1行動；燃料是交付貨物，航行不消耗 | `lighthouse/rules.ts` 的 `sailCost`、`applyLighthouse` |
| Garden.tsx | 整片上下左右連通空白區無法接邊界才算空洞，斜角不算；每格扣3；金菊16＋入口步道4−空洞3＝17分 | `garden/rules.ts` 的 `adjacent`、`scoreGarden` |
| Lantern.tsx | 只在第3／6／9回合雙方行動後評比；兩種難度三次價值開局公開；場上花燈保留、預備不補；價值5且各2盞時各得2 | `lantern/rules.ts` 的 `createLantern`、`applyLantern`、`scoreDistricts` |
| Workshop.tsx | 取材→加工→出貨，只有出貨得分；加工或出貨1／2件都耗1工匠；五站兩隊合計每日各一次；進階6工匠至少1人休息 | `workshop/rules.ts` 的 `createWorkshop`、`workshopError`、`applyWorkshop` |
| Auction.tsx | 出價不立即扣款；得標方付最後價格全額；A1→B2→A3→B退出，A付3、B付0；本件退出不能再競標，剩餘籌碼不加分 | `auction/rules.ts` 的 `applyAuction`、`settle`、`exhibitionScore` |

已使用原引擎另行執行一般／進階的操作與計分例證。花園例子的實際5×5盤面、兩格封閉空洞扣6、空白區接邊界免扣、斜角不連通、花燈三次評比／花燈保留、工坊兩件批次耗1工匠與六工匠五站至少一休息等結果均保留於 `engine-evidence.json`；未修改引擎配合文案。

## 素材取得與完整性

先前 Library 單張及 ZIP 支援下載均失敗；後續使用者明確授權從同一私有 Git 儲存庫取得相同原檔，已解除阻礙。舊失敗紀錄僅作歷史保存於審查包的 `history/` 及 `zip-transfer-status.json`，不代表目前狀態。

使用正常 Git 存取執行 `git fetch origin 2313fce3fc90563cad799d55a2854d60c067c336`，逐檔 `git show` 讀取以下固定提交的精確六檔；未合併、checkout或覆蓋整個素材分支：

- 素材分支：`backup/tabletop-menu-20261020`
- 固定提交：[`2313fce3fc90563cad799d55a2854d60c067c336`](https://github.com/jeiwu1020/braintraining/tree/2313fce3fc90563cad799d55a2854d60c067c336/asset-backup/tabletop-menu-20261020)
- 目錄：`asset-backup/tabletop-menu-20261020/`
- 六檔：`box-lighthouse-preview.png`、`box-garden-preview.png`、`box-lantern-preview.png`、`box-workshop-preview.png`、`box-auction-preview.png`、`manifest.json`
- 本機原檔：`/workspace/tabletop-menu-originals/`；也完整收入審查包 `originals/`。沒有將來源 PNG 放入公開 runtime 目錄。

五張原 PNG 全部1448×1086、RGB、4:3，已確認檔案可讀、PNG解碼有效、逐張實際檢視且沒有嵌入標題；大小及SHA256均與 manifest 一致：

| 原 PNG | bytes | SHA256 |
| --- | ---: | --- |
| lighthouse | 2,818,063 | `f223488c7ed9574de95233bd4d12e6454c110e2fb9d93009cd90975afafc0ae0` |
| garden | 3,197,010 | `1f3b3db35c64bd56cadade9bde1a4d1fb508124cc38887e8c4b29818ce051ec9` |
| lantern | 3,008,348 | `13a36942bde3ba499fbd274d208582ebeb594ed6dade623ce07a82457d058d32` |
| workshop | 2,753,000 | `cbb4826657b96db184d5b43df1c38921010ca9a61553ad7ec22e763ba94b3be4` |
| auction | 2,827,492 | `86f6acfab2f92ccaba63ef524a95bcd8eea76d2f9817b826571e74eba5ecb782` |

## WebP與裁切

使用完整原圖以 Lanczos 等比縮至1000×750，WebP quality 84、method 6；沒有裁圖或改繪。輸出位於 `public/playground/box-{id}.webp`。五張 PNG 共14,603,913 bytes，WebP共1,071,398 bytes，減少約92.7%。

| 遊戲 | WebP bytes | 圖像人工確認 |
| --- | ---: | --- |
| lighthouse | 198,950 | 三座燈塔、船上貨物與海岸均保留 |
| garden | 240,034 | 花園棋盤、入口、步道與周邊地形板均保留 |
| lantern | 233,354 | 三側花燈街區、河道、戲臺均保留 |
| workshop | 191,650 | 工具、材料、兩位工匠與出貨港均保留 |
| auction | 207,410 | 花瓶、銅器、書畫、木槌與籌碼均保留 |

五款圖區固定4:3、置中、background-origin為border-box，使完整構圖保留在邊框內。原有局部捲動維持；夜市與築牆的圖像來源、原檔及專用樣式未改。下方文字標題、描述與開始按鈕清楚，圖區不重複疊標題。來源用途與原始 Library ID 已更新於 `public/playground/ASSETS.md`。

## 驗證通過

以下為圖片接入後、發布提交前重新執行；與前輪通過結果一致：

- `npm test`：149檔通過，1092項通過、1項略過，71.53秒。
- `npm exec -- tsc --noEmit`：exit 0。
- `npm run build`：exit 0，17.15秒。
- `git diff --check`：通過。
- `git apply --reverse --check /workspace/tabletop-review/full.diff`：完整 diff 可對目前結果反向檢查通過。
- 再次執行原引擎例證：全部通過。
- React審查：靜態文案、選單標題條件與五張圖片來源／比例調整，未新增 hooks、狀態、載入邏輯或相依套件。

production build 以本機 `vite preview`（`http://127.0.0.1:4173`）驗證，沒有部署：

- 五張 WebP皆HTTP200、Content-Type為image/webp、瀏覽器成功解碼1000×750。
- 五款×五尺寸＝25組圖像來源及實際4:3圖區比例檢查通過。
- 五款×兩難度×設定／遊玩兩階段×五尺寸＝100組說明視窗檢查通過。
- 尺寸：320×568、390×844、640×360、852×393、1440×900。頁面無水平／垂直溢出，說明視窗在畫面內、內容無水平溢出，長文可捲到底；關閉／Escape／焦點返回正常。
- 教學可取消，返回收藏室後續玩保留進度；五款圖區無重複span、下方標題／描述／操作保留，夜市／築牆span仍在。
- 未預期console error／pageerror為0；既有外部字型／favicon資源錯誤另行記錄，沒有掩蓋新圖片錯誤。
- 人工逐張查看原PNG及五款390px新選單截圖；另確認640px橫向畫面、規則長文及計分例截圖。五款各有390px與640px選單證據，共10張新增選單卡片截圖；全部截圖合計33張。

## 未驗證／限制

- 實體手機、iOS Safari、實體觸控與螢幕閱讀器未驗證；目前為桌面 Chromium 模擬尺寸。
- 外部Google Fonts請求遇到 `net::ERR_TUNNEL_CONNECTION_FAILED`，`/favicon.ico` 為404，共3筆已知資源錯誤。它們來自既有HTML字型引用與缺少favicon，保留於瀏覽器JSON；不影響五張本機新圖成功載入。
- 圖片接入與本機驗證已無阻礙。正式站 UI 與實體 iOS 仍待驗收；部署狀態須以發布紀錄中該提交的 Vercel 狀態為準。

## 審查交付物

- `/workspace/tabletop-review.zip`：完整審查包。
- `/workspace/tabletop-review/full.diff`：包含五張新WebP的完整binary diff，以及所有規則／選單／素材文件與QA檔案。
- `/workspace/tabletop-review/source-verification.json`、`webp-verification.json`：固定來源提交、原檔驗證、輸出大小／雜湊與壓縮參數。
- `/workspace/tabletop-review/originals/`：五張原PNG及manifest；`runtime/`：五張壓縮WebP。
- `/workspace/tabletop-review/browser-results.json`：production preview的100組規則與25組圖像結果。
- `/workspace/tabletop-review/screenshots/menu-{id}-{390|640}.png`：五款新選單畫面；另附目錄總覽與規則視窗。
- `/workspace/tabletop-review/engine-evidence.mjs`、`engine-evidence.json`：可重跑引擎例證與結果。
- `/workspace/tabletop-review/{tests,typecheck,build,browser}.log`：本輪執行紀錄。`focused.log`為前輪16檔／206項相關測試紀錄。
- `docs/qa/tabletop-rules-browser.mjs`：瀏覽器腳本，可由 `BASE_URL` 指定本機伺服器、`QA_OUTPUT`指定輸出目錄。
