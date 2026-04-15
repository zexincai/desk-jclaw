import { globalShortcut } from 'electron'
import { getMainWindow } from './window'

export function registerShortcuts() {
  // 全局快捷键：Cmd/Ctrl+Shift+J
  const shortcut = process.platform === 'darwin' ? 'Command+Shift+J' : 'Ctrl+Shift+J'

  const registered = globalShortcut.register(shortcut, () => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return

    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  if (!registered) {
    console.error(`Failed to register global shortcut: ${shortcut}`)
  } else {
    console.log(`Global shortcut registered: ${shortcut}`)
  }
}
