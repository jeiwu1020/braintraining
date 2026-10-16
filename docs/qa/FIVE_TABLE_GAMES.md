# 五款桌遊候選交付（2026-10-16）

基準：遠端 `main` / 本機 HEAD 均為 `3e843412144ede488e22884d00e1c2bbbecda4e2`，fetch 已核對，工作區起始乾淨。未發現 AGENTS.md 或本地 .agents/skills。沿用 `docs/PLAYGROUND_HANDOFF.md` 的測試流程，保留原首頁、夜市、築牆及職能講座。此輪不 push、merge 或部署。

實作順序：燈塔補給隊 → 四季造園師 → 花燈街區爭鋒 → 小鎮工坊 → 古物拍賣會。每款獨立提交，加入新收藏室，不加入舊遊戲清單。新增美術為獨立 SVG／CSS 向量桌遊圖案，無外部圖片依賴。

## 1. 燈塔補給隊

- 純規則：四港、五航線、四箱船艙、兩行動、九回合；一般8箱／進階10箱。今日與明日海況公開；外海風浪額外耗一行動，整備可抵銷。
- 全團體合作；深藍海圖、可見航線與船位、三燈塔需求、貨艙、有效航行／裝卸／整備／等待，明確下一回合與勝敗結果。
- 完整玩法、三步教學、獨立試做示範；所有動作先預選再確認，取消／Escape 不入帳。沿用 journal replay、版本 token 防連點、同分頁恢復、損壞暫存隔離，重開需確認。
- 規則測試：一般／進階各64種海況種子完整成功航程與重播；期限失敗、最後行動獲勝、風浪／整備、非法航線與超載。
- UI 測試：教學示範、取消、同批連點只提交一次、中斷 remount、重開取消與確認。
- `npm test`：136檔，901 passed / 1 skipped（902項；此時規則檔4項）。之後補入風浪／最後行動測試，focused run 見後續記錄。
- `node node_modules/typescript/bin/tsc --noEmit`：exit 0。`npm run build`：exit 0。
- Chromium 瀏覽器：完整成功局、裝貨取消、重新整理返回續局、重開取消與確認。568×320、667×375、852×393、1440×900 均無 document overflow；所測遊戲按鈕至少44×44，棋盤與控制區獨立捲動。
- 畫面及精確測量：`lighthouse-{568,667,852,1440}.png`、`lighthouse-result.png`、`lighthouse-browser.json`；重現腳本 `lighthouse-browser.mjs`（使用本環境 Playwright 絕對路徑，其他環境需調整）。
- 限制：以上為桌面 Chromium 模擬 viewport，並非手機實機／Safari／iOS 投影。原站 Google Fonts 連線及 favicon 請求可能失敗，另外記錄於 resourceErrors，未因此修改舊站資源。長期策略平衡與實際帶團試玩仍待治療者驗收。
- 補充驗證：focused 2檔6項通過；獨立 reviewer 無 Critical／Important。瀏覽器最終 JSON `errors: []`，resourceErrors 為原站 Google Fonts 受環境網路限制。瀏覽器續局腳本曾在 lazy 畫面尚未就緒前判讀「下一回合」而逾時，已加入畫面就緒等待後重跑通過，無產品修改。

## 2. 四季造園師

- 兩隊輪流從三塊公開三格地形選板、旋轉、選外框左上角座標；新地形與原花園正交相接。一般5×5、每隊6手；進階6×6、每隊8手。
- 同色花圃3格起每格2分，否則1分；入口連通步道每格2分，其他步道1分；封閉空洞每格扣3分。兩隊花園與計分明細可上下查看。
- 手繪向量庭園、玫瑰／金菊與石板符號、座標與合法落點、旋轉圖、落點幽影及提交前總分預覽；可從同一畫面討論不同布局。
- 規則4項：旋轉／重疊／越界、花圃與步道／空洞計分、一般與進階各24局完整對局並重播；UI 1項：旋轉、預覽取消、防連點、完整12手與結果重開取消／確認。
- Chromium 四尺寸及完整局／重新整理續局結果見 `garden-browser.json`；畫面 `garden-{568,667,852,1440}.png` 與 `garden-result.png`。均為桌面瀏覽器模擬，非實機。
- 驗證：全套138檔，907 passed／1 skipped；之後補入一項斷連／略過邊界，focused 2檔6項通過。TypeScript exit 0，production build exit 0。獨立審查無 Critical／Important，建議的直接邊界測試已補上。

## 3. 花燈街區爭鋒

- 四區三次價值開局全部公開，第3／6／9回合評比。兩隊每回合各一手，由上一回合後手先行下一回合。
- 一般8盞／進階6盞預備花燈；一手放1～2盞、從一區移1～2盞到另一區，或等待。資源守恆，三次評比保留布局；只有有燈平手才各取floor(價值/2)，都空為0分。
- 暖光街區向量圖、領先方／兩隊數量、三次公開價值與預估分、預備量、合法目的地、明確評比入帳與繼續／總結果。完整玩法與獨立示範沿用共用確認／暫存保護。
- 規則4項含一般／進階各32局、花燈守恆與恰好三次評比、平手與空區、非法移動／預備不足；UI1項完成21個確認動作，覆蓋取消、防連點、結果恢復、重開取消／確認。
- Chromium：完整21動作對局，放置及移動、取消、重新整理續局、重開；四尺寸文件無溢出且按鈕≥44×44。`lantern-browser.json` 與 `lantern-{568,667,852,1440}.png`、`lantern-result.png`。
- 獨立 review：Critical／Important／Minor 均無。TypeScript exit 0、production build exit 0；短橫向另提供四街區對照表，直接比較兩隊盞數與三次價值，桌面保留街區卡片。
- 回歸過程發現第二款 UI 自動試玩腳本在「需旋轉才有落點」時會重選同板，導致同步迴圈卡住；已修正腳本加入最多四次旋轉及總迴圈上限，產品規則未改。修正後 garden+lantern focused 3檔6項通過，並重新跑全套。
- 首次重跑全套：139檔通過，`minesweeperIndependentProof.test.ts` 兩項（independent mine placement proof／every selectable transform grading）逾時，沒有斷言不符。調查發現前次中止的同步自動試玩 worker 仍占用一核心，已終止該任務 worker，避免干擾其他測試，再做單檔與全套重跑；未變更踩地雷產品或測試。
- 最終全套（第三、四款皆在工作區）：`npm test -- --maxWorkers=1 --no-file-parallelism` 142檔、919 passed／1 skipped，含原踩地雷兩項證明測試；未修改 timeout。先前預設並行的5秒逾時仍保留上方記錄。

## 4. 小鎮工坊

- 五個共用工作站，每天各只能占一次；一般5工作日／每日每隊2位工匠，進階6日／3位。工作或休息各耗1工匠，下一日補工匠、清站、交換先手；材料／成品／升級保留。
- 取材2＋等級（各上限6）；加工每件1木1金、成品上限3；升級2木1金、最高2級；出貨每件4＋2×等級分。加工／出貨可批量1～2件，只用1工匠。最後庫存不換分。
- 工具主題向量封面、木質工作臺、雙方資源與工匠、占站原因、非法操作原因、日結與最終分數；短橫向以緊湊庫存表比較雙方。
- 規則5項與UI1項：一般／進階各32局及重播；占站、資源不足、升級效益、批量耗1工匠、每日先手、終局剩餘資源不加分，預選取消／連點／結果恢復／重開。獨立審查無 Critical／Important；建議的直接邊界測試已補。
- Chromium完整25次確認動作（一般）對局、重新整理續局、取消及重開；四尺寸無整頁溢出，遊戲按鈕≥44×44。證據：`workshop-browser.json`、`workshop-{568,667,852,1440}.png`、`workshop-result.png`。
- 全套單 worker 142檔、919 passed／1 skipped，workshop focused 2檔6項通過；TypeScript與production build通過。仍待真實手機／Safari／帶團策略平衡驗收。

## 5. 古物拍賣會

- 一般6件／每隊18枚遊戲籌碼，進階8件／22枚。全部展品順序、類別及分數公開；沒有私密出價，也不涉及真錢。
- 每次公開叫價加1或退出本件，只有成交後向得標方扣全額。未得標方保留籌碼。尚未叫價時首方退出，另一方可1枚買下或同退流標；每件交換先叫價隊伍。
- 展品基礎分＋每套陶瓷／銅器／書畫5分，剩籌碼不計分。博物館向量插畫、展品與公開全清單、兩隊預算、目前最高叫價、收藏與套組進度、明確成交／流標／最終展覽結果。
- 規則5項與UI1項：一般／進階各48局、預算付款守恆、完整重播、只向得標方扣款、流標／首方退出、無法負擔保護、套組加分；預選取消、連點、競價中斷恢復、整局與重開取消／確認。
- Chromium完整拍賣、取消／重新整理恢復／重開；四尺寸文件無溢出，遊戲按鈕≥44×44。證據：`auction-browser.json`、`auction-{568,667,852,1440}.png`、`auction-result.png`。
- 獨立審查無 Critical／Important／Minor，TypeScript exit 0、production build exit 0。進階最大44枚總付款＋有界退出／換件動作，合法 journal 不會超過80動作上限。

## 最終整合驗證與交付

- `npm test -- --maxWorkers=1 --no-file-parallelism`：144檔，925 passed／1個既有 skipped（926項），105.83秒。五款共29項新增規則／互動測試，400局純規則完整局模擬；每款另有一局正常 Chromium UI 操作驗證。
- `node node_modules/typescript/bin/tsc --noEmit` 與 `npm run build`：exit 0。`git diff --check`：通過。無刪除既有追蹤檔案；App只更新原有入口的介紹文字，舊首頁清單與其他遊戲／講座未修改。
- 五款一般模式均檢查568×320、667×375、852×393與1440×900，document精確對應viewport、所有測量的遊戲按鈕≥44×44，溢出內容在遊戲棋盤／控制面板內捲動。五份JSON皆 `errors: []`；原站Google Fonts網路失敗獨立記錄，不是新增圖片或執行錯誤。
- 五次獨立只讀程式審查無Critical／Important；建議的garden與workshop直接邊界測試均已補上。
- 最後再次fetch：origin/main仍為`3e843412144ede488e22884d00e1c2bbbecda4e2`。分支`work`留在本機供父層審查，未push／merge／部署。

保留限制：未驗證真實手機觸控、Safari／iOS safe-area與投影設備，未做治療者帶團長期平衡測試；瀏覽器證據均明確屬桌面Chromium模擬。預設多worker跑全套時，既有踩地雷proof測試曾因5秒門檻逾時；使用單worker完整全套通過，未調整該測試時限或相關產品。QA腳本使用本環境Playwright路徑與localhost:3000，跨環境重現需調整這兩項。
- 進階設定額外瀏覽器抽查：五款皆在568×320與852×393無文件溢出、按鈕≥44×44；實際確認6×6花園與8件展品。逐款將journal損壞後進入Recovery，確認僅清除本款並保留另一款及舊資料。證據：`advanced-settings-browser.json`、`*-advanced-{568,852}.png`。收藏室畫面：`collection-top.png`、`collection-new-games.png`。
- 入口盒面亦使用與遊戲封面相同的自製向量圖：`assets/playground/*.svg`，可由 `node docs/qa/export-game-art.mjs` 重新匯出。美術整合後10檔29項專項再次通過，production build通過；不依賴AI圖片或外部圖庫。
- 最後用正式build的`vite preview`（localhost:3001）重跑五款進階設定／損壞暫存隔離及拍賣完整一局，全數通過。`BASE_URL`可指定腳本目標；JSON記錄實際baseUrl。五張正式build盒面SVG亦經瀏覽器decode成功（`box-art-browser.json`），收藏室截圖已更新。
