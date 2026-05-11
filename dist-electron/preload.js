const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // 平台信息
  platform: () => ipcRenderer.invoke("get-platform"),
  appVersion: () => ipcRenderer.invoke("get-app-version"),
  // 文件操作
  selectFile: (options) => ipcRenderer.invoke("select-file", options),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  // 系统通知
  showNotification: (title, body) => ipcRenderer.invoke("show-notification", { title, body }),
  // 窗口控制
  minimizeToTray: () => ipcRenderer.invoke("minimize-to-tray"),
  // 更新相关
  checkForUpdates: () => ipcRenderer.invoke("check-updates"),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update-available", (_, info) => callback(info));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("update-downloaded", () => callback());
  },
  installUpdate: () => ipcRenderer.invoke("install-update")
});
