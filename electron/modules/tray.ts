import { Tray, Menu, app, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { getMainWindow } from './window'

// ES modules 兼容
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let tray: Tray | null = null

export function createTray() {
  // 图标路径
  const iconPath = process.platform === 'darwin'
    ? path.join(__dirname, '../../build/icon.png')
    : path.join(__dirname, '../../build/icon.ico')

  // Mac 使用 Template Image 以支持深色模式
  let icon = nativeImage.createFromPath(iconPath)
  if (process.platform === 'darwin') {
    icon = icon.resize({ width: 16, height: 16 })
    icon.setTemplateImage(true)
  }

  tray = new Tray(icon)

  // 设置托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
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
      label: '退出 JClaw',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('JClaw AI')

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
