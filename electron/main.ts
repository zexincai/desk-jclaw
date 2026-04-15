import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, Notification, dialog } from 'electron'
import path from 'path'
import { createWindow, getMainWindow } from './modules/window'
import { createTray } from './modules/tray'
import { setupAutoUpdater } from './modules/updater'
import { registerShortcuts } from './modules/shortcuts'

const isDev = process.env.NODE_ENV === 'development'

// 单例锁
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const mainWindow = getMainWindow()
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    // 创建主窗口
    await createWindow()

    // 创建系统托盘
    createTray()

    // 注册全局快捷键
    registerShortcuts()

    // 设置自动更新（生产环境）
    if (!isDev) {
      setupAutoUpdater()
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('will-quit', () => {
    // 注销所有快捷键
    globalShortcut.unregisterAll()
  })
}

// ============ IPC 处理器 ============

// 获取平台信息
ipcMain.handle('get-platform', () => {
  return process.platform
})

// 获取应用版本
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// 选择文件
ipcMain.handle('select-file', async (_, options) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: options?.filters || [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
      { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return result.filePaths[0] || null
})

// 选择文件夹
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  return result.filePaths[0] || null
})

// 显示系统通知
ipcMain.handle('show-notification', (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: path.join(__dirname, '../build/icon.png')
    }).show()
  }
})

// 最小化到托盘
ipcMain.handle('minimize-to-tray', () => {
  const mainWindow = getMainWindow()
  if (mainWindow) {
    mainWindow.hide()
  }
})

// 检查更新
ipcMain.handle('check-updates', async () => {
  // 由 updater 模块处理
  return { available: false }
})
