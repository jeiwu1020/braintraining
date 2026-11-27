# 桌遊新樂園圖資

五張圖均為本專案需求產生的獨立 AI 插畫，使用者於 2026-10-15 接受明確漫畫食物風格。沒有使用商業桌遊原盒繪或網路搜尋素材。

- rice.webp / corn.webp / tofu.webp：透明背景漫畫飯糰、烤玉米、豆花，384×384。
- box-night-market.webp / box-wall-race.webp：無字盒繪，1000×750。
- 原生成檔保留 PNG；runtime 使用壓縮 WebP，標題與全部互動控制由 HTML/CSS 呈現。
- 原始來源版本：comic-assets-v3。食物使用乾淨輪廓、簡化陰影，不採半仿真油光。

圖像是裝飾／辨識輔助；牌號、菜名、得分、棋盤座標與隊伍文字均不嵌入圖檔。

## 五款無字選單盒繪（2026-10-20）

以下來源由使用者核准為各遊戲的無字 PNG 預覽。原圖1448×1086，依 manifest 核對 SHA256 與大小、逐張檢視後，完整縮至1000×750並以 WebP quality 84 / method 6壓縮。僅用於選單 `pg-box-art`；輸出檔保留4:3，選單圖框依後續核准改為沿用夜市的高度規則，以 cover 等比裁切、逐圖調整垂直取景，不替換遊戲內素材或原 SVG。

| 遊戲 | 原始 Library 來源 ID | 使用檔案 |
| --- | --- | --- |
| lighthouse | `libfile_b9e0f0b302bc8191a535f26b7cb89322` | `box-lighthouse.webp` |
| garden | `libfile_293904928df88191b1a368308448784d` | `box-garden.webp` |
| lantern | `libfile_11ee9664e4608191a4e5e3e3687f59d0` | `box-lantern.webp` |
| workshop | `libfile_da94b65972ac8191becc295b974be2aa` | `box-workshop.webp` |
| auction | `libfile_f875b1be0c10819186ed219803a047c4` | `box-auction.webp` |

實際取得來源：同一私有儲存庫素材分支 `backup/tabletop-menu-20261020` 的固定提交 [`2313fce3fc90563cad799d55a2854d60c067c336`](https://github.com/jeiwu1020/braintraining/tree/2313fce3fc90563cad799d55a2854d60c067c336/asset-backup/tabletop-menu-20261020)，目錄 `asset-backup/tabletop-menu-20261020/`。原檔為 `box-{id}-preview.png`，雜湊與大小依同目錄 `manifest.json` 驗證；未合併素材分支。

五張 PNG 共14,603,913 bytes，執行用 WebP共1,071,398 bytes（減少約92.7%）。原圖完整保留於素材提交及本機 `/workspace/tabletop-menu-originals/`。夜市、築牆盒繪、原 SVG 與所有遊戲內素材均保留；標題、描述、可存取名稱仍由 HTML 呈現，五款圖區不再重複疊標題。

## 四款新增對戰桌遊無字盒繪與桌面紋理（2026-11-26）

- `box-frog-pond.webp`（1000×750）：池塘跳荷葉手繪風盒繪（無文字）
- `box-cloud-towers.webp`（1000×750）：雲頂雙塔地中海階梯建築盒繪（無文字）
- `box-chef-split.webp`（1000×750）：主廚分雙盤手工甜點分盤盒繪（無文字）
- `box-sumo-push.webp`（1000×750）：擂台推推樂檜木棋盤與陶漆推棋盒繪（無文字）
- `tabletop-wood-linen.webp`（1600×900）：胡桃木與鼠尾草亞麻布共用桌面底圖
