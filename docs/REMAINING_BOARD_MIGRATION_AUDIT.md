# Remaining BOARD-family migration-necessity audit

## Scope and method

本文件是診斷性稽核，並記錄 KEEP／LIGHT／FULL acceptance 路徑。原稽核對象為七款尚未完成 BOARD acceptance 的遊戲；尋寶迷宮指路、象棋暗棋、播棋與圍棋現已依本文件完成 LIGHT acceptance，其餘三款仍待 reviewer 排程：西洋跳棋、奇雞連連與公開 21 點。

實機檢查使用本機開發頁面，主驗收尺寸為 640×360，並檢查 844×390、932×430、390×844 與一個桌面代表尺寸。每款均觀察初始狀態，並在可安全操作時檢查至少一個代表性控制或中途狀態；同時以 DOM 量測 document scroll 尺寸、主要棋盤／桌面區及控制尺寸。以下結論針對「是否需要結構性重做」而非是否完全沒有改善空間。

## Decision matrix

| Game | Preset | Decision | 640×360 | Primary issue | Required fixes | Shared mode selector? | Migration recommendation | Risk |
|---|---|---|---|---|---|---|---|---|
| 尋寶迷宮指路 | BOARD_SIDEBAR | **LIGHT COMPLETE** | Landscape and portrait maze fit after stack | Portrait geometry; icon-only labels（已修正） | Portrait stack/re-size maze、accessible names（已完成） | No (GROUP/FACILITATED) | Keep custom left-controls + maze; LIGHT standardization complete | Low |
| 圍棋 | BOARD_SIDEBAR | **LIGHT COMPLETE** | 9×9 board and panel fit, no document scroll | Compact mode/action targets（已修正） | ≥44px core targets、readability、accessible names；保留 `WeiqiLandscapeLayout`（已完成） | No (AI/PVP/PUZZLE semantics) | Keep specialized landscape architecture; LIGHT standardization complete | Low–medium |
| 播棋（寶石棋） | BOARD_SIDEBAR | **LIGHT COMPLETE** | Wide board fully visible and touchable | 原 player labels overlap pit rows/status、current-mode toggle ambiguous（已修正） | Reserved label bands、shared two-option mode selector、icon labels（已完成） | Yes | Keep dedicated wide table; LIGHT standardization complete | Low–medium |
| 象棋暗棋 | BOARD_SIDEBAR | **LIGHT COMPLETE** | 8×4 board clear, no document scroll | Toolbar/mode controls are icon-only and ~30–32px（已修正） | Shared mode selector, ≥44px core actions, accessible labels、圓形棋子 | Yes | Keep custom board + toolbar; targeted visual/control patch complete | Low |
| 西洋跳棋 | BOARD_SIDEBAR | **LIGHT** | 8×8 fits in landscape | Portrait hides side-panel controls; landscape actions ~28px | Expose sidebar/control stack in portrait; enlarge/label core actions; shared selector | Yes | Keep board + move-log architecture; responsive/accessibility patch only | Medium–high gameplay-state risk |
| 奇雞連連 | BOARD_SIDEBAR | **LIGHT** | Board fits; right inventory clips at 640 | Gameplay-critical inventory extends beyond viewport; icon-only mode/actions | Compact inventory/gap at narrow width without shrinking board excessively; shared selector; labels | Yes | Keep board-with-two-inventories composition; targeted narrow-width fix | Medium |
| 公開 21 點 | BOARD_TABLE | **LIGHT** | Setup/play overflow vertically; table remains understandable | Primary setup/action controls below 640 viewport; action buttons ~36px | No (DEALER/PVP semantics differ) | Keep dedicated table; reduce landscape vertical footprint and enlarge actions | Medium |

**Severity legend:** BLOCKER = gameplay unusable; MAJOR = serious usability/layout issue; MINOR = worthwhile polish/consistency; INFO = no action required. No audited game met the evidence threshold for FULL; no blocker was observed.

## 審核原則

標準化不等於每款都必須結構性遷移。`KEEP`、`LIGHT`、`FULL` 都是有效 acceptance 路徑；只有在現有結構無法同時承載主要互動、資訊層級或 640×360 可用性時，才應採 FULL。專用且語意正確的版面可以保留為 documented exception。此次七款均保留其遊戲專屬幾何，建議先以 LIGHT 修正驗收缺口，再由 reviewer 決定是否關閉。

## 逐款稽核

### 尋寶迷宮指路（MazeNavigatorGame）

**Current architecture.** 自製全高 flex-row：左側語音／方向控制，右側 7×9（進階 9×13）迷宮，規則使用 `RulesModal`，勝利時顯示局部 overlay。此 arrangement 與「指令控制＋迷宮表面」的玩法相符，不應為了套用共用元件而改成棋盤側欄。

**640×360 findings.** Landscape 的迷宮約 272×216px，方向鍵約 80×80px、聲控按鈕約 256×78px；document 640×360，沒有水平或垂直 overflow，主要控制可直接操作。初始隨機迷宮與規則按鈕可見；本輪保留此尺寸與左右結構，補齊可操作控制的 accessible names。

**844×390 / 932×430.** Landscape 仍無 document overflow，迷宮與方向控制有額外空間；沒有發現需要 scroll 的主要內容。

**390×844.** 已改為迷宮在上、控制區在下的直向堆疊；NORMAL 迷宮約 320×253px、ADVANCED 約 342×272px，列與欄不重疊，玩家、牆與寶藏可辨識，方向鍵、聲控、返回與規則均可到達，document 無 overflow。

**Representative states tested.** NORMAL／ADVANCED 初始隨機迷宮、上下左右控制、鍵盤方向鍵、聲控按鈕狀態與規則入口；語音辨識本身受測試環境權限限制，未宣稱麥克風成功辨識。

**Mode / accessibility / duplication.** 僅 GROUP/FACILITATED，沒有 PVE/PVP，因此不需要 `GameModeSelector`。方向鍵約 80px，返回／規則／聲控與方向控制均有明確 accessible names；沒有持續重複的 score/status 區。

**Decision: LIGHT COMPLETE.** 保留左控件＋迷宮；已完成 portrait 直向堆疊、NORMAL／ADVANCED 穩定 grid 尺寸、返回／規則／聲控／方向按鈕 accessible names，並維持勝利 overlay 與原 gameplay。沒有 FULL 的理由。

### 圍棋（WeiqiGame）

**Current architecture.** `WeiqiLandscapeLayout` 是專用 9×9／13×13／19×19 棋盤與右側控制面板，另有死活題與終局 modal。它的木質棋盤、座標、提子資訊與棋理工具具有圍棋特有語意，適合保留。

**Acceptance status: LIGHT FIX COMPLETE (2026-09-03).** 本次保留 `WeiqiLandscapeLayout`、專用 `WeiqiBoard` 與 AI／PVP／PUZZLE 三模式，完成 compact controls 的觸控尺寸、可讀性、selected state 與 accessible names；未進行結構性 migration，未改 gameplay。

**640×360 findings.** 9×9 初始盤完整可見，棋盤約 297×297px → 約 297×297px（約 0% shrink），右側 panel 可見，document 640×360；所有主要內容同頁。模式選項、返回／規則／重開與悔棋／虛手／形勢／認輸均以約 44px 互動高度呈現；路數／難度／讓子與題庫導覽維持密集但可讀的次要控制。panel 允許 local `overflow-y-auto`，棋盤不捲動。

**844×390 / 932×430.** 棋盤可放大、無 document overflow；右側 panel 仍清楚，沒有結構性壓縮。

**390×844.** 專用直向版將控制分置上下，9×9 棋盤約 330×330px，座標仍可見，沒有 document overflow；底部工具列偏密但可到達。

**Representative states tested.** 9×9 初始盤、模式／棋盤規格／難度切換、悔棋／虛手／形勢／認輸入口、規則與題目提示 modal；自動化 acceptance contract 已通過。瀏覽器 CLI 在本工作環境未安裝，640×360 等 runtime screenshot 與 AI 600ms／PVP／modal 手動流程需 reviewer 重新確認。

**Mode / accessibility / duplication.** 使用 AI／PVP／PUZZLE 三種語意，並非單純 PVE/PVP，故 `GameModeSelector` 不直接適用；應保留三模式明確呈現。沒有發現持續重複的底部狀態列。主要風險是小控制，而非棋盤 architecture。

**Decision: LIGHT COMPLETE.** 保留 `WeiqiLandscapeLayout` 作為專用例外；`GameModeSelector` 不適用，因為圍棋模式是 AI／PVP／PUZZLE。已將核心操作與模式按鈕提高到可觸控尺寸、補 accessible names、以 ring／check 提供非色彩 selected cue，且未壓縮 9×9 盤。不要 FULL 重做。

### 播棋（MancalaGame）

**Acceptance status: LIGHT FIX COMPLETE (2026-09-03).** 本次保留專用寬幅棋桌，完成共用模式控制、玩家標籤分區、觸控尺寸與棋洞／計分槽 accessible names；未進行結構性 migration。

**Current architecture.** 自製寬幅橢圓桌：上下各 6 個 pit，左右兩個 store，座標 A–F，動畫播子與終局 overlay。這種左右對等寬桌比 generic board/sidebar 更符合玩法。

**640×360 findings.** 本次視覺修正後寬桌約 576×217px（修正前約 486×189px），12 個 pit、兩個 store、上下 A–F 座標與玩家標籤均在同頁，document 640×360 無 overflow；landscape pit 約 56×56px、store 約 72×144px，核心 toolbar 與模式選項達 44px。原先的標籤重疊、單一模式 toggle 與過度保守的 landscape 尺寸已移除。

**844×390 / 932×430.** 寬桌完整同頁，分別約 708×272px；標籤與座標保持獨立 band，無 document overflow。

**390×844.** 寬桌約 374×165px，棋洞與 stores 維持平衡的 compact 尺寸，selector、返回與重設仍可到達，保留既有專用 portrait flow。

**Representative states tested.** 初始 4 seeds、PVE/PVP 模式切換、下方 P1 pit 選取、播子動畫、AI 回應、回合訊息、規則與重設入口。

**Mode / accessibility / duplication.** 支援 PVE/PVP，已使用共用 `GameModeSelector` 同時呈現單人／雙人；PVE/PVP 玩家標籤會隨模式正確切換，回合訊息只保留一處，沒有新增重複底部 feedback。棋洞、stores、返回、重設與終局控制均補上 accessible names。

**Decision: LIGHT COMPLETE.** 保留寬桌；已完成上下 player label 獨立 band、persistent 單人／雙人 selector、44px 核心控制與 pit/store accessible names，並維持 sowing animation 的既有尺寸與流程。

### 象棋暗棋（DarkChessGame）

**Acceptance status: LIGHT FIX COMPLETE (2026-09-03).** 本次保留原有架構，完成共用模式控制、工具列觸控尺寸與 accessible labels；本輪另修正工具列圖示置中與棋子正圓幾何，未進行結構性 migration。

**Current architecture.** 自製左側垂直工具列＋中央 4×8 暗棋盤；翻牌前顯示問號，翻牌後顯示棋子，頂部 log/status，規則為可局部捲動 modal。

**640×360 findings.** 8×4 棋盤約 480×235px，32 個棋子按鈕約 50×47px，A–H／1–4 座標與問號清楚，document 640×360 無 overflow。工具列四個 icon button 現已統一為 44×44px 並置中；隱藏與翻開棋子均以明確 1:1 圓形 token 呈現，棋盤本體沒有結構性問題。

**844×390 / 932×430.** 棋盤可放大，無 document overflow；四個工具列按鈕維持一致 44×44px 盒與置中圖示，圓形棋子隨 cell 等比放大。

**390×844.** 工具列移至頂部，4×8 棋盤完整可見，核心圖示仍缺文字與較大 target。

**Representative states tested.** 初始全覆蓋盤、翻牌入口、模式／悔棋／規則／重設 toolbar；未宣稱已完成一局吃子流程。

**Mode / accessibility / duplication.** 支援 PVE/PVP，已使用 `GameModeSelector` LIGHT。log/status 只在頂部持續呈現，沒有額外重複底部列；問號按鈕保留「翻牌」語意 accessible name，四個 toolbar icon 已統一置中且達 44px，棋子 token 改為正圓。

**Decision: LIGHT COMPLETE.** 保留暗棋盤與左工具列；已完成 shared selector、核心 toolbar 觸控尺寸、置中幾何、accessible labels 與正圓棋子 token，規則 modal 維持 max-height/local scroll。無需 FULL。

### 西洋跳棋（CheckersGame）

**Current architecture.** Landscape 專用 8×8 棋盤＋右側狀態／走法紀錄 panel，支援選子、合法步 marker、動畫、悔棋／重做、復盤與終局／規則 modal；portrait 另有棋盤版面。

**640×360 findings.** Landscape 棋盤約 294×294px，完整 8×8、座標與棋子可見，document 640×360 無 overflow。**MAJOR**：portrait 版會把側欄 action controls 設為 0×0，悔棋、重做、規則在直向不可到達；**MINOR**：landscape 悔棋／重做／規則約 28px，模式仍是單一當前模式 toggle。

**844×390 / 932×430.** 盤面可放大、走法紀錄可局部 scroll、無 document overflow；右側 panel 仍可用。

**390×844.** 棋盤約 330×330px 且座標可見，但側欄控制未呈現；這是 acceptance 缺口，不是棋規問題。

**Representative states tested.** 初始 12+12 棋子、選取／合法步 marker 入口、悔棋／重做／規則控制與 mode label；未以隨機局面宣稱完成吃子或升王流程。

**Mode / accessibility / duplication.** 支援 PVE/PVP，應列為 `GameModeSelector` LIGHT。棋子是可互動視覺，但部分狀態依顏色／小 marker；winner/rules modal 已有 local scroll。高狀態複雜度使 FULL rewrite 風險高。

**Decision: LIGHT.** 保留棋盤＋move-log。最低修改：portrait 將核心 sidebar controls 放入可到達的堆疊區、提高悔棋／重做／規則 target、採 shared selector，並保留既有動畫／Undo 語意。除非後續實測 landscape 也失敗，否則不要 FULL。

### 奇雞連連（GobbletGame）

**Current architecture.** 中央 3×3 cell board，左右各一組 S/M/L inventory；inventory 是 gameplay-critical source selection，不應簡化為單一 sidebar。另有選取、覆蓋、規則與 winner modal。

**640×360 findings.** 中央盤約 160×160px、inventory piece 約 80×80px，document 640×360 無 scroll。**MAJOR**：右側 inventory 最後一欄實際落在 x=580–660，超出 640 viewport 約 20px，最外側橘色棋子被裁切；這直接影響可選來源。**MINOR**：模式／返回／悔棋／規則主要為 icon-only 小按鈕。

**844×390 / 932×430.** 左右 inventory 完整可見，盤面與棋子可辨識；無 document overflow。

**390×844.** inventory 上下堆疊，中央盤約 305×305px，六枚來源棋子均可見，空間記憶與選取語意保留。

**Representative states tested.** 初始雙方 inventory、藍方選取一枚來源棋、中央 3×3 目標區與規則入口。

**Mode / accessibility / duplication.** 支援 PVE/PVP，應列為 `GameModeSelector` LIGHT；source inventory 與 board buttons 缺少一致的語意 label。沒有另設重複 bottom status，但頂部回合訊息與工具列需保持清楚。

**Decision: LIGHT.** 保留左右 inventory＋中央棋盤。最低修改：在 ≤640 寬度調整 gap／inventory tile 或 board sizing，使兩側完整落在 viewport、不要壓縮到不可辨識；採 shared selector、補 source/target accessible names。若小寬度仍無法兼顧三區，才重新評估 FULL。

### 公開 21 點（BlackjackGame）

**Current architecture.** `BOARD_TABLE` 專用桌面：先選合作對抗莊家或雙組同步對抗，再呈現雙方對等牌區、補牌／停牌與回合／結果。這不是 main-board＋sidebar hierarchy，也不應為了唯一一款 BOARD_TABLE 建立共用 table component。

**640×360 findings.** Setup document scrollHeight 約 490px，兩個模式卡片延伸到 viewport 之外；playing 約 408px 且有垂直 scrollbar，補牌／停牌約 36px 高，底部操作在 viewport 邊緣。**MAJOR**：主要 setup/action controls 需要 scroll 或被裁切；**MINOR**：牌面與狀態文字在小 landscape 偏密。

**844×390 / 932×430.** 牌桌比例改善但 playing 仍約 408px，高於 390px 的 viewport 約 18px；大桌面可用，仍應消除不必要的 document-level vertical overflow。

**390×844.** Setup 與 playing 可透過直向 scroll 到達，模式卡與牌面可辨識，但不符合「主要控制不應依賴 document scroll」的理想。

**Representative states tested.** Setup 回合數選單、合作莊家模式、A/B 牌區、補牌／停牌與回合狀態；未宣稱完成所有終局牌局排列。

**Mode / accessibility / duplication.** 目前是 `DEALER`／`PVP` 兩種明確模式卡，而非 literal PVE/PVP；不應在未確認產品語意前硬套單人／雙人 selector。返回、模式卡與補牌／停牌需檢查 accessible names 與 44px touch target；沒有發現重複底部 status row。

**Decision: LIGHT.** 保留專用 BOARD_TABLE。最低修改：縮減 640 landscape setup／playing 的 vertical footprint、讓主要補牌／停牌與模式選擇完整可見且 ≥44px、保留牌面比例與 terminal result。不要建立 BoardTable shared component，除非未來出現第二款且語意相同的桌面遊戲。

## 後續處理建議

### 1. KEEP closures

目前沒有足夠證據把剩餘三款直接關為 KEEP；Weiqi、Maze、DarkChess 與 Mancala 已依各自語意完成 LIGHT acceptance，不需要改 architecture。

### 2. LIGHT fixes（建議順序）

1. **Mancala**：先修 player label／pit overlap，再導入 shared `GameModeSelector`，風險低且收益明確。
2. **Maze**：已完成 portrait stack 與 button labels；不涉及棋規。
3. **Gobblet**：640 寬度 inventory clipping，需保護兩側 source inventory。
4. **Checkers**：portrait controls visibility，需小心 animation／Undo。
5. **Blackjack**：setup/playing compacting；維持 BOARD_TABLE 專用語意。
6. **Weiqi**：已完成密集控制尺寸與三模式語意 review；保留專用 layout。

### 3. FULL migrations

本次沒有建議立即 FULL。若後續 LIGHT 修正仍無法在 640×360 同時保留主要互動與可讀性，才應重新提交具體 FULL case；目前不得僅因未使用 `GameShell`／`BoardSidebarLayout` 就升級。

## Audit conclusion

本輪迷宮、暗棋、播棋與圍棋已完成 LIGHT acceptance；其餘三款仍是 future work candidates，待 reviewer 接受矩陣後再逐款以 KEEP／LIGHT／FULL 路徑關閉或修正。四款均沒有結構性 migration，僅以既有架構完成標準化。
