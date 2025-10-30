# cashnet-admin-v2

## 🚀 環境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0

## 📦 安裝

```bash
# 使用 pnpm
pnpm install

# CI/CD 或生產環境：
pnpm i --frozen-lockfile
```

## 開發

```bash
pnpm dev
```

## 📂 專案目錄結構

```
.
├── auto-imports.d.ts
├── components.d.ts
├── env.d.ts
├── eslint.config.ts
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public
│   └── favicon.ico
├── README.md
├── src
│   ├── apis/                  # API 請求模組
│   ├── App.vue
│   ├── assets/                # 圖片、icons、字型等（需 import）
│   ├── components/            # 共用元件
│   │   ├── base/              # 原子級元件 (BaseButton, BaseInput...)
│   │   └── shared/            # 跨頁共用複合元件
│   ├── composables/           # Vue composables (useAuth, useFetch...)
│   ├── layouts/               # 不同裝置 Layout
│   │   ├── mobile/
│   │   │   └── MobileLayout.vue
│   │   └── desktop/
│   │       └── DesktopLayout.vue
│   ├── main.ts
│   ├── pages/                 # 路由頁面
│   │   ├── auth/
│   │   │   ├── Login.vue      # 轉接器 (mobile/pc)
│   │   │   ├── Login.m.vue    # H5 (Vant)
│   │   │   └── Login.pc.vue   # PC (Element Plus)
│   │   └── dashboard/
│   │       ├── Dashboard.vue
│   │       ├── Dashboard.m.vue
│   │       └── Dashboard.pc.vue
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   ├── app.ts             # 判斷 isMobile / isDesktop
│   │   └── tabs.ts            # PC 頁籤管理（預留）
│   └── styles/
│       ├── main.css           # Tailwind v4 入口
│       ├── reset.css
│       ├── tokens.css
│       ├── themes.css
│       └── utilities.css
├── tree.txt
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

src/
  app/                  # 應用根層 (App.vue, main.ts, setup/*)
  router/               # Vue Router 設定
  stores/               # Pinia 狀態管理
  styles/               # 全域樣式 (唯一入口 main.css)
    main.css
    reset.css
    tokens.css
    themes.css
    utilities.css
  assets/               # 需打包的資源 (import 使用)
    icons/
    images/
    fonts/
    media/
  pages/                # 路由頁面 (支援 Mobile / Desktop 變體)
    [feature]/
      components/       # 該頁功能專屬子元件
      PageName.vue      # 轉接器 (自動判斷載入 m / pc)
      PageName.m.vue    # Mobile 版
      PageName.pc.vue   # Desktop 版
  components/           # 可共用的 UI 元件
    base/               # 原子級 (BaseButton, BaseInput)
    shared/             # 跨頁複合元件
  composables/          # 共用邏輯 (useXxx)
  services/             # API / SDK / 資料存取層
  utils/                # 純工具函式
  typings/              # 全域型別定義
```
