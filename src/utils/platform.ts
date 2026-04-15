/**
 * 平台检测工具
 */

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

export const getPlatform = async (): Promise<'darwin' | 'win32' | 'linux' | 'web'> => {
  if (isElectron()) {
    return (await window.electronAPI.platform()) as 'darwin' | 'win32' | 'linux'
  }
  return 'web'
}

export const isMac = async (): Promise<boolean> => {
  const platform = await getPlatform()
  return platform === 'darwin'
}

export const isWindows = async (): Promise<boolean> => {
  const platform = await getPlatform()
  return platform === 'win32'
}

export const isWeb = (): boolean => {
  return !isElectron()
}
