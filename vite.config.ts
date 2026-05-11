import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron'

  return {
    plugins: [
      vue(),
      ...(isElectron ? [
        electron([
          {
            entry: 'electron/main.ts',
            onstart(options) {
              // 启动 Electron
              options.startup()
            },
            vite: {
              build: {
                outDir: 'dist-electron',
                rollupOptions: {
                  output: {
                    format: 'cjs',
                    entryFileNames: '[name].js'
                  },
                  external: ['electron']
                }
              }
            }
          },
          {
            entry: 'electron/preload.js',
            onstart(options) {
              // 重新加载渲染进程
              options.reload()
            },
            vite: {
              build: {
                outDir: 'dist-electron',
                rollupOptions: {
                  output: {
                    format: 'cjs',
                    entryFileNames: '[name].js'
                  },
                  external: ['electron']
                }
              }
            }
          }
        ])
      ] : [])
    ],
    server: {
      host: '127.0.0.1',
      port: 5173,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
