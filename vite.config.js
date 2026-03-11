// ═══════════════════════════════════════════════════════════════
// vite.config.js  ──  Vite 構建工具配置文件
//
// 【Vite 是什麼？】
//   開發服務器 + 打包工具，類比 Python 的 Flask dev server + webpack。
//   開發時（npm run dev）：啟動熱重載開發服務器，修改代碼即時刷新。
//   打包時（npm run build）：把所有 JS/CSS 優化壓縮到 dist/ 目錄。
//
// 【本文件的核心配置：開發環境 API 代理】
//   問題：前端直接調用 DashScope（阿里雲 AI API）會遇到「跨域（CORS）」錯誤，
//         因為瀏覽器禁止前端代碼直接請求不同域名的服務器。
//   解決：在開發服務器上設置代理：
//         前端請求 /api/qwen/... → Vite 服務器代理轉發到 DashScope → 返回結果
//         這樣從瀏覽器看，請求的是「同一個服務器」，不存在跨域問題。
//
// 【環境變量】
//   .env 文件（不提交到 git）裡配置：
//     DASHSCOPE_API_KEY=你的API密鑰
//     DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/...（可選）
//   loadEnv() 讀取這些變量，安全地注入到代理配置。
//
// 【生產環境（Vercel）】
//   部署後不走這個代理；Vercel 有 api/qwen/v1/chat/completions.js
//   作為 Serverless Function 處理 API 請求，API Key 通過 Vercel 環境變量配置。
// ═══════════════════════════════════════════════════════════════

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// 默認的 DashScope 服務器地址（中國大陸區域）
const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

// defineConfig 接受一個函數（而不是對象），函數接收 { mode } 參數
// mode = 'development'（npm run dev）或 'production'（npm run build）
export default defineConfig(({ mode }) => {
  // loadEnv：加載 .env 文件中的環境變量
  // 第三個參數 '' 表示不過濾前綴（同時讀取 VITE_ 和非 VITE_ 前綴的變量）
  const env = loadEnv(mode, process.cwd(), '')
  const baseUrl = env.VITE_DASHSCOPE_BASE_URL || env.DASHSCOPE_BASE_URL || DEFAULT_BASE_URL
  // 去掉 URL 末尾的 /v1，得到代理的根地址（Vite proxy 需要域名+端口，不含路徑）
  const proxyTarget = baseUrl.replace(/\/v1\/?$/, '')
  const devKey = env.VITE_DASHSCOPE_API_KEY || env.DASHSCOPE_API_KEY || ''

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Protein Map iPad',
          short_name: 'Protein Map iPad',
          description: '追蹤蛋白質攝取，探索附近健康餐廳',
          theme_color: '#4a7c59',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'landscape',
          scope: '/',
          start_url: '/',
          icons: [
            { src: '/icons/icon-72x72.png',            sizes: '72x72',   type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-96x96.png',            sizes: '96x96',   type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-128x128.png',          sizes: '128x128', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-144x144.png',          sizes: '144x144', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-152x152.png',          sizes: '152x152', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-192x192.png',          sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-384x384.png',          sizes: '384x384', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512x512.png',          sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-192x192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          globIgnores: ['**/logo-modified.png', '**/icon.png'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        // 將 /api/qwen/* 代理至 DashScope（區域由 baseUrl 控制）
        // rewrite：把請求路徑 /api/qwen/v1/... 改為 /v1/...（去掉前綴）
        '/api/qwen': {
          target: proxyTarget,
          changeOrigin: true, // 修改請求頭中的 Host 為目標服務器的域名（必須，否則部分服務器拒絕）
          rewrite: path => path.replace(/^\/api\/qwen/, ''), // 路徑重寫：移除 /api/qwen 前綴
          configure(proxy) {
            // 如果設置了 API Key，在每個代理請求上自動添加 Authorization 頭
            // 這樣前端代碼不需要硬編碼 API Key
            if (!devKey) return
            proxy.on('proxyReq', proxyReq => {
              if (!proxyReq.getHeader('Authorization')) {
                proxyReq.setHeader('Authorization', `Bearer ${devKey}`)
              }
            })
          },
        },
      },
    },
  }
})
