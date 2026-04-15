import { BrowserWindow, screen, app } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'

const isDev = process.env.NODE_ENV === 'development'
let mainWindow: BrowserWindow | null = null

// 窗口状态配置文件路径
const stateFilePath = path.join(os.homedir(), '.jclaw', 'window-state.json')

interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized?: boolean
}

// 读取窗口状态
function loadWindowState(): WindowState {
  try {
    if (fs.existsSync(stateFilePath)) {
      const data = fs.readFileSync(stateFilePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load window state:', error)
  }

  // 默认状态
  return {
    width: 1400,
    height: 900
  }
}

// 保存窗口状态
function saveWindowState() {
  if (!mainWindow) return

  try {
    const bounds = mainWindow.getBounds()
    const state: WindowState = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: mainWindow.isMaximized()
    }

    const dir = path.dirname(stateFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2))
  } catch (error) {
    console.error('Failed to save window state:', error)
  }
}

// 验证窗口位置是否在可见区域内
function ensureVisibleOnScreen(state: WindowState): WindowState {
  const displays = screen.getAllDisplays()
  const visible = displays.some(display => {
    const area = display.workArea
    return (
      state.x !== undefined &&
      state.y !== undefined &&
      state.x >= area.x &&
      state.y >= area.y &&
      state.x + state.width <= area.x + area.width &&
      state.y + state.height <= area.y + area.height
    )
  })

  if (!visible) {
    // 如果窗口不在可见区域，重置位置
    delete state.x
    delete state.y
  }

  return state
}

export async function createWindow() {
  const state = ensureVisibleOnScreen(loadWindowState())

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 1000,
    minHeight: 600,
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: process.platform !== 'darwin',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      sandbox: true
    }
  })

  // 加载应用
  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) return

    if (state.isMaximized) {
      mainWindow.maximize()
    }
    mainWindow.show()
  })

  // 保存窗口状态
  mainWindow.on('close', () => {
    saveWindowState()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Mac 特殊处理：关闭窗口不退出应用
  if (process.platform === 'darwin') {
    mainWindow.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault()
        mainWindow?.hide()
      }
    })
  }

  return mainWindow
}

export function getMainWindow() {
  return mainWindow
}
