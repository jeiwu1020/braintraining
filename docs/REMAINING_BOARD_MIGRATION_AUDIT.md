# Remaining BOARD-family migration-necessity audit

## Scope and method

本文件是診斷性稽核，不代表開始 migration，也不增加完成數。原稽核對象為七款尚未完成 BOARD acceptance 的遊戲；象棋暗棋現已依本文件完成 LIGHT acceptance，其餘六款仍待 reviewer 排程：尋寶迷宮指路、圍棋、播棋、西洋跳棋、奇雞連連與公開 21 點。

實機檢查使用本機開發頁面，主驗收尺寸為 640×360，並檢查 844×390、932×430、390×844 與一個桌面代表尺寸。每款均觀察初始狀態，並在可安全操作時檢查至少一個代表性控制或中途狀態；同時以 DOM 量測 document scroll 尺寸、主要棋盤／桌面區及控制尺寸。以下結論針對「是否需要結構性重做」而非是否完全沒有改善空間。

## Decision matrix

| Game | Preset | Decision | 640×360 | Primary issue | Required fixes | Shared mode selector? | Migration recommendation | Risk |
|---|---|---|---|---|---|---|---|---|
| 尋寶迷宮指路 | BOARD_SIDEBAR | **LIGHT** | Landscape fits; portrait maze collapses/overlaps | Portrait geometry; icon-only labels | Portrait stack/re-size maze; add accessible names; preserve left controls | No (GROUP/FACILITATED) | Keep custom left-controls + maze; targeted responsive/accessibility patch | Low |
| 圍棋 | BOARD_SIDEBAR | **LIGHT** | 9×9 board and panel fit, no document scroll | Many mode/action targets are 23–34px; specialized panel is dense | Increase core touch targets and clarify labels; retain `WeiqiLandscapeLayout` | No (AI/PVP/PUZZLE semantics) | Keep specialized landscape architecture; do not force generic BoardSidebar | Medium |
| 播棋（寶石棋） | BOARD_SIDEBAR | **LIGHT** | Wide board fully visible and touchable | Player labels overlap pit rows/status; current-mode toggle ambiguous | Reserve label bands; use shared two-option mode selector; improve icon labels | Yes | Keep wide table; localized spacing/status fix | Low–medium |
| 象棋暗棋 | BOARD_SIDEBAR | **LIGHT** | 8×4 board clear, no document scroll | Toolbar/mode controls are icon-only and ~30–32px | Shared mode selector, ≥44px core actions, accessible labels | Yes | Keep custom board + toolbar; targeted control patch | Low |
| 西洋跳棋 | BOARD_SIDEBAR | **LIGHT** | 8×8 fits in landscape | Portrait hides side-panel controls; landscape actions ~28px | Expose sidebar/control stack in portrait; enlarge/label core actions; shared selector | Yes | Keep board + move-log architecture; responsive/accessibility patch only | Medium–high gameplay-state risk |
| 奇雞連連 | BOARD_SIDEBAR | **LIGHT** | Board fits; right inventory clips at 640 | Gameplay-critical inventory extends beyond viewport; icon-only mode/actions | Compact inventory/gap at narrow width without shrinking board excessively; shared selector; labels | Yes | Keep board-with-two-inventories composition; targeted narrow-width fix | Medium |
| 公開 21 點 | BOARD_TABLE | **LIGHT** | Setup/play overflow vertically; table remains understandable | Primary setup/action controls below 640 viewport; action buttons ~36px | No (DEALER/PVP semantics differ) | Keep dedicated table; reduce landscape vertical footprint and enlarge actions | Medium |

**Severity legend:** BLOCKER = gameplay unusable; MAJOR = serious usability/layout issue; MINOR = worthwhile polish/consistency; INFO = no action required. No audited game met the evidence threshold for FULL; no blocker was observed.

## 審核原則

標準化不等於每款都必須結構性遷移。`KEEP`、`LIGHT`、`FULL` 都是有效 acceptance 路徑；只有在現有結構無法同時承載主要互動、資訊層級或 640×360 可用性時，才應採 FULL。專用且語意正確的版面可以保留為 documented exception。此次七款均保留其遊戲專屬幾何，建議先以 LIGHT 修正驗收缺口，再由 reviewer 決定是否關閉。

## 逐款稽核

### 尋寶迷宮指路（MazeNavigatorGame）

**Current architecture.** 自製全高 flex-row：左側語音／方向控制，右側 7×9（進階 9×13）迷宮，規則使用 `RulesModal`，勝利時顯示局部 overlay。此 arrangement 與「指令控制＋迷宮表面」的玩法相符，不應為了套用共用元件而改成棋盤側欄。

**640×360 findings.** Landscape 的迷宮約 272×216px，方向鍵約 80×80px、聲控按鈕約 256×78px；document 640×360，沒有水平或垂直 overflow，主要控制可直接操作。初始隨機迷宮與規則按鈕可見。主要 finding：**MAJOR**（portrait-only）與 **MINOR**（accessibility）：直向畫面仍維持左右排列，迷宮被壓成狹窄且多列內容互相遮疊；返回、規則與方向按鈕主要依 icon，缺少明確 accessible name。

**844×390 / 932×430.** Landscape 仍無 document overflow，迷宮與方向控制有額外空間；沒有發現需要 scroll 的主要內容。

**390×844.** 實機畫面可操作方向鍵與返回，但迷宮縮得很小且列高重疊，難以可靠辨識玩家、牆與寶藏；應改為直向堆疊或重新分配尺寸。

**Representative states tested.** 初始隨機迷宮、開啟聲控按鈕、上下左右控制及規則入口；未宣稱已完成勝利路徑的完整手動測試。

**Mode / accessibility / duplication.** 僅 GROUP/FACILITATED，沒有 PVE/PVP，因此不需要 `GameModeSelector`。方向鍵約 80px，觸控尺寸良好；icon-only controls 與部分 10px 輔助文字需要補語意。沒有持續重複的 score/status 區。

**Decision: LIGHT.** 保留左控件＋迷宮。最低修改：只在 portrait 重新排列／提高迷宮格可讀性、補返回／規則／方向按鈕 accessible names，並確認勝利 overlay 在直向仍可用。沒有 FULL 的理由。

### 圍棋（WeiqiGame）

**Current architecture.** `WeiqiLandscapeLayout` 是專用 9×9／13×13／19×19 棋盤與右側控制面板，另有死活題與終局 modal。它的木質棋盤、座標、提子資訊與棋理工具具有圍棋特有語意，適合保留。

**640×360 findings.** 9×9 初始盤完整可見，棋盤約 297×297px，右側 panel 可見，document 640×360；所有主要內容同頁。**MAJOR**：模式、路數、難度與工具按鈕多落在約 23–34px 高，悔棋／虛手／形勢／認輸等核心操作低於理想 touch target。**MINOR**：部分 icon-only 控制及細小文字依位置理解。

**844×390 / 932×430.** 棋盤可放大、無 document overflow；右側 panel 仍清楚，沒有結構性壓縮。

**390×844.** 專用直向版將控制分置上下，9×9 棋盤約 330×330px，座標仍可見，沒有 document overflow；底部工具列偏密但可到達。

**Representative states tested.** 9×9 初始盤、模式／棋盤規格／難度切換、悔棋／虛手／形勢／認輸入口、規則與題目提示 modal。

**Mode / accessibility / duplication.** 使用 AI／PVP／PUZZLE 三種語意，並非單純 PVE/PVP，故 `GameModeSelector` 不直接適用；應保留三模式明確呈現。沒有發現持續重複的底部狀態列。主要風險是小控制，而非棋盤 architecture。

**Decision: LIGHT.** 保留 `WeiqiLandscapeLayout` 作為專用例外。最低修改：將核心操作與模式按鈕提高到可觸控尺寸、補 icon accessible names、確保 640 高度下不因放大控制而壓縮 9×9 盤。不要 FULL 重做。

### 播棋（MancalaGame）

**Current architecture.** 自製寬幅橢圓桌：上下各 6 個 pit，左右兩個 store，座標 A–F，動畫播子與終局 overlay。這種左右對等寬桌比 generic board/sidebar 更符合玩法。

**640×360 findings.** 完整 6+6 pits、兩個 stores、座標與分數可見；pit 約 64×64px，document 640×360，無 overflow。**MAJOR**：桌面頂部的「藍方 (電腦/P2)」與底部「紅方 (你/P1)」文字直接壓到 pit/座標列，降低資訊辨識。**MINOR**：目前模式按鈕只顯示當前「單人／雙人」，返回／重設約 32px。

**844×390 / 932×430.** 桌面按比例放大，完整同頁且 pit 可操作；標籤重疊仍是需要修正的 presentation 問題。

**390×844.** 寬桌縮為約 370px 仍同頁，pit 與 stores 可辨識，但上下 player label 更容易與座標及 pit 靠近。

**Representative states tested.** 初始 4 seeds、下方 P1 pit 選取、模式按鈕、回合訊息與終局 overlay 入口；未以長動畫宣稱完成整局驗證。

**Mode / accessibility / duplication.** 支援 PVE/PVP，應列為日後 `GameModeSelector` LIGHT。回合訊息與 player label 的層級目前互相競爭；需要保留一次清楚的 current turn，而不是再增添底部 feedback。

**Decision: LIGHT.** 保留寬桌。最低修改：為上下 player label 保留獨立 band／移除與座標重疊、改用 persistent 單人／雙人 selector、補返回／重設與 pit accessible names，並維持 sowing animation 的既有尺寸。

### 象棋暗棋（DarkChessGame）

**Acceptance status: LIGHT FIX COMPLETE (2026-09-03).** 本次保留原有架構，只完成共用模式控制、工具列觸控尺寸與 accessible labels；未進行結構性 migration。

**Current architecture.** 自製左側垂直工具列＋中央 4×8 暗棋盤；翻牌前顯示問號，翻牌後顯示棋子，頂部 log/status，規則為可局部捲動 modal。

**640×360 findings.** 8×4 棋盤約 480×235px，32 個棋子按鈕約 50×47px，A–H／1–4 座標與問號清楚，document 640×360 無 overflow。**MAJOR**：模式、悔棋、規則、重設主要是 30–32px icon-only toolbar；使用者需猜圖示，且不符合核心 touch 目標。棋盤本體沒有結構性問題。

**844×390 / 932×430.** 棋盤可放大，無 document overflow；工具列仍偏小但不再擁擠。

**390×844.** 工具列移至頂部，4×8 棋盤完整可見，核心圖示仍缺文字與較大 target。

**Representative states tested.** 初始全覆蓋盤、翻牌入口、模式／悔棋／規則／重設 toolbar；未宣稱已完成一局吃子流程。

**Mode / accessibility / duplication.** 支援 PVE/PVP，應列為 `GameModeSelector` LIGHT。log/status 只在頂部持續呈現，沒有額外重複底部列；問號按鈕需把「翻牌」語意放入 accessible name。

**Decision: LIGHT.** 保留暗棋盤與左工具列。最低修改：以 shared selector 呈現單人／雙人、將核心 toolbar 擴至可觸控尺寸並補 labels，規則 modal 維持 max-height/local scroll。無需 FULL。

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

目前沒有足夠證據把七款直接關為 KEEP；應先由 reviewer 接受本稽核，再針對 **Weiqi**（專用版面已完整且無 overflow）與 **DarkChess**（棋盤幾何完整）確認是否可把控制尺寸視為可接受的 minor polish。若 reviewer 將這些差異視為非阻擋，可在補齊 evidence 後個別關閉 KEEP，不需要改 architecture。

### 2. LIGHT fixes（建議順序）

1. **Mancala**：先修 player label／pit overlap，再導入 shared `GameModeSelector`，風險低且收益明確。
2. **DarkChess**：模式與 toolbar accessible/touch patch，棋盤本體穩定。
3. **Maze**：portrait stack 與 button labels；不涉及棋規。
4. **Gobblet**：640 寬度 inventory clipping，需保護兩側 source inventory。
5. **Checkers**：portrait controls visibility，需小心 animation／Undo。
6. **Blackjack**：setup/playing compacting；維持 BOARD_TABLE 專用語意。
7. **Weiqi**：最後處理密集控制尺寸，因其專用 layout 與三模式語意需要較細緻的 review。

### 3. FULL migrations

本次沒有建議立即 FULL。若後續 LIGHT 修正仍無法在 640×360 同時保留主要互動與可讀性，才應重新提交具體 FULL case；目前不得僅因未使用 `GameShell`／`BoardSidebarLayout` 就升級。

## Audit conclusion

本輪暗棋已完成 LIGHT acceptance；其餘六款仍是 future work candidates，待 reviewer 接受矩陣後再逐款以 KEEP／LIGHT／FULL 路徑關閉或修正。暗棋沒有結構性 migration，僅以既有架構完成標準化。
