import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'


// https://vitejs.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 3000, // サイズ制限を1000キロバイトに変更
  },
  base: "./",
  plugins: [
    react(),
    VitePWA({
      workbox: {
        // プリキャッシュされるファイルのサイズ制限を 5MB に増やす
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        lang: 'ja',
        name: 'sample cam',
        short_name: 'CAM',
        background_color: '#fff',
        theme_color: '#3cb371',
        display: 'standalone',
	// GitHub Pagesにpushする場合はリポジトリ名を入れる必要がある
        scope: '/vite-project/',
        start_url: '/vite-project/',
        icons: [
          {
            src: 'src/assets/icon.png',
            sizes: '72x72',
            type: 'image/png'
          },
          // 他のサイズも入れる
        ]
      }
    })
  ]})
