import { autoUpdater } from 'electron-updater'
import { getMainWindow } from './window'

export function setupAutoUpdater() {
  // 配置更新服务器（使用 GitHub Releases）
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // 检查更新
  autoUpdater.checkForUpdatesAndNotify()

  // 发现新版本
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info)
    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send('update-available', info)
    }
  })

  // 没有新版本
  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info)
  })

  // 下载进度
  autoUpdater.on('download-progress', (progress) => {
    console.log(`Download progress: ${progress.percent}%`)
    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send('update-progress', progress)
    }
  })

  // 下载完成
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info)
    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info)
    }
  })

  // 错误处理
  autoUpdater.on('error', (error) => {
    console.error('Update error:', error)
  })

  // 每 4 小时检查一次更新
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify()
  }, 4 * 60 * 60 * 1000)
}
