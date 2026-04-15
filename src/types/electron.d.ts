export interface ElectronAPI {
  // 平台信息
  platform: () => Promise<string>
  appVersion: () => Promise<string>

  // 文件操作
  selectFile: (options?: any) => Promise<string | null>
  selectFolder: () => Promise<string | null>

  // 系统通知
  showNotification: (title: string, body: string) => Promise<void>

  // 窗口控制
  minimizeToTray: () => Promise<void>

  // 更新相关
  checkForUpdates: () => Promise<{ available: boolean }>
  onUpdateAvailable: (callback: (info: any) => void) => void
  onUpdateDownloaded: (callback: () => void) => void
  installUpdate: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
