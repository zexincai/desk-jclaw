import { Tray, app, nativeImage, Menu, BrowserWindow } from 'electron'
import path from 'path'
import { getMainWindow } from './window'

let tray: Tray | null = null

export function createTray() {
  const appRoot = app.getAppPath()

  // 图标路径：开发模式在项目根/build，打包后在 app.asar 同级的 build 目录
  const iconFileName = process.platform === 'darwin' ? 'icon.png' : 'icon.ico'
  const iconPath = app.isPackaged
    ? path.join(appRoot, '..', 'build', iconFileName)
    : path.join(appRoot, 'build', iconFileName)

  // Mac 使用 Template Image 以支持深色模式
  let icon = nativeImage.createFromPath(iconPath)
  if (process.platform === 'darwin') {
    icon = icon.resize({ width: 16, height: 16 })
    icon.setTemplateImage(true)
  }

  tray = new Tray(icon)

  tray.setToolTip('JClaw AI')

  // 右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开界面',
      click: () => {
        const mainWindow = getMainWindow()
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        (app as any).isQuitting = true
        BrowserWindow.getAllWindows().forEach(w => w.destroy())
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // 点击托盘图标切换窗口显示/隐藏
  tray.on('click', () => {
    const mainWindow = getMainWindow()
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })

  return tray
}

export function getTray() {
  return tray
}
