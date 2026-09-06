# WebAR PWA 版本

這個資料夾是依照你提供的 `index.html`、`targets.mind` 與 ICON 製作的 PWA 版本。

## 放到既有專案根目錄

請把以下檔案 / 資料夾放在與原本 `data.txt`、`background/`、`images/`、`videos/` 同一層：

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `targets.mind`
- `icons/`

原本專案的以下內容仍要保留：

- `data.txt`
- `background/`
- `images/`
- `videos/`

## PWA 條件

正式網址需使用 HTTPS。GitHub Pages、Netlify、Vercel 等都可以。

第一次開啟仍需要網路，讓 Service Worker 把 A-Frame、MindAR 與實際使用到的素材存進快取。之後已快取內容可在網路不穩時使用；相機本身不需要網路，但瀏覽器仍要求 HTTPS / 已授權相機。

## AR 鏡頭畫質

此版本在 MindAR 開相機前，加入 1280×720 / 30fps 的 `ideal` 偏好。瀏覽器或手機不支援時會自動退回可用解析度，不會硬性要求 720p。

如果要測試 1080p，請在 `index.html` 搜尋：

- `ideal: 1280` 改成 `ideal: 1920`
- `ideal: 720` 改成 `ideal: 1080`

但 1080p 會增加 CPU/GPU、發熱與耗電，部分手機反而會讓 MindAR 辨識 FPS 降低，因此預設使用 720p。
