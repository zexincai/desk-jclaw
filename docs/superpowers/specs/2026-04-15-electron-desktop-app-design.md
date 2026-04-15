# Electron 桌面应用设计方案

**日期**: 2026-04-15
**目标**: 将现有 Vue 3 Web 应用转换为跨平台桌面应用（Mac + Windows）

## 1. 需求概述

### 功能范围
- **完整功能保留**: WebSocket 实时通信、文件上传（COS）、iframe 业务系统集成、语音录制等
- **桌面增强特性**:
  - 系统托盘：最小化到托盘，点击切换显示/隐藏
  - 全局快捷键：Cmd/Ctrl+Shift+J 唤醒应用
  - 系统通知：新消息原生通知
  - 文件拖拽：拖拽本地文件到窗口上传
- **打包方式**: 独立安装包（Mac .dmg / Windows .exe）
- **自动更新**: 集成自动更新机制
- **窗口样式**: 原生标题栏（Mac 红绿灯 / Windows 系统标题栏）

### 技术选型
**方案**: Electron + vite-plugin-electron

**理由**:
1. 与现有 Vite 构建流程无缝集成
2. 开发体验最好，支持热重载
3. 生态成熟，社区活跃
4. 完整支持所有现有功能

## 2. 架构设计

### 进程模型

```
┌─────────────────────────────────────────────────────────┐
│                     主进程 (Main Process)                 │
│                    Node.js 环境                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 窗口管理  │  │ 系统托盘  │  │ 自动更新  │  │ 文件操作 │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │ IPC 通信
                      │
┌─────────────────────┴───────────────────────────────────┐
│                 预加载脚本 (Preload Script)               │
│              contextBridge 安全桥接层                     │
│  暴露白名单 API: platform, selectFile, notification...   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                渲染进程 (Renderer Process)                │
│                    浏览器环境                            │
│              现有 Vue 3 应用 (95% 无需修改)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ WebSocket │  │ 文件上传  │  │  iframe  │  │ 语音录制 │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 项目结构

```
app-jw/
├── electron/                    # Electron 相关代码
│   ├── main.ts                 # 主进程入口
│   ├── preload.ts              # 预加载脚本
│   └── modules/                # 功能模块
│       ├── window.ts           # 窗口管理
│       ├── tray.ts             # 系统托盘
│       ├── updater.ts          # 自动更新
│       ├── notification.ts     # 系统通知
│       ├── shortcuts.ts        # 全局快捷键
│       └── file.ts             # 文件操作
│
├── src/                        # 现有 Vue 代码（最小改动）
│   ├── utils/
│   │   └── platform.ts         # 新增：平台检测工具
│   └── types/
│       └── electron.d.ts       # 新增：Electron API 类型定义
│
├── build/                      # 打包资源
│   ├── icon.icns              # Mac 图标 (1024x1024)
│   ├── icon.ico               # Windows 图标 (256x256)
│   ├── icon.png               # 托盘图标 (256x256)
│   └── entitlements.mac.plist # Mac 权限配置
│
├── resources/                  # 运行时资源
│   └── (自动更新配置等)
│
├── package.json               # 统一依赖管理
├── vite.config.ts             # Vite 配置（集成 Electron 插件）
└── electron-builder.json5     # Electron Builder 打包配置
```

### 代码组织策略

**同一项目，条件构建**:
- Web 和桌面共享 95% 代码
- 通过环境变量区分构建目标
- 依赖统一管理，避免版本冲突

## 3. 核心功能设计

### 3.1 窗口管理

**初始配置**:
```typescript
{
  width: 1400,
  height: 900,
  minWidth: 1000,
  minHeight: 600,
  titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  frame: process.platform !== 'darwin',
  show: false  // 等待 ready-to-show 事件
}
```

**状态持久化**:
- 保存窗口位置、大小到 `~/.jclaw/window-state.json`
- 下次启动恢复上次状态
- 处理多显示器场景

**生命周期**:
- Mac: 关闭窗口不退出应用（隐藏到托盘）
- Windows: 关闭窗口退出应用（可配置）

### 3.2 系统托盘

**图标**:
- Mac: 使用 Template Image（自动适配深色模式）
- Windows: 使用标准 .ico 图标

**菜单**:
```
┌─────────────────┐
│ 显示窗口         │
│ ─────────────── │
│ 退出 JClaw      │
└─────────────────┘
```

**交互**:
- 左键点击：切换窗口显示/隐藏
- 右键点击：显示菜单
- Mac Dock 图标：始终显示

### 3.3 文件拖拽上传

**实现方式**:
1. 渲染进程监听 `drop` 事件
2. 获取文件路径：`event.dataTransfer.files`
3. 调用现有上传逻辑（复用 COS 上传）

**视觉反馈**:
```typescript
// 拖拽进入
onDragEnter: 显示蓝色边框 + "拖拽文件到此上传"

// 拖拽离开
onDragLeave: 移除高亮

// 释放文件
onDrop: 开始上传，显示进度
```

**支持格式**:
- 图片: jpg, png, gif, webp
- 文档: pdf, doc, docx, txt

### 3.4 系统通知

**触发条件**:
```typescript
if (收到新消息 && !窗口激活状态) {
  显示系统通知
}
```

**通知内容**:
```
标题: JClaw AI
正文: [消息预览前 50 字]
图标: 应用图标
```

**点击行为**:
1. 激活应用窗口
2. 聚焦到对应会话
3. 关闭通知

**权限处理**:
- Mac: 首次使用请求通知权限
- Windows: 默认允许

### 3.5 全局快捷键

**快捷键定义**:
- Mac: `Command+Shift+J`
- Windows: `Ctrl+Shift+J`

**功能**:
- 窗口隐藏时：显示并激活窗口
- 窗口显示时：隐藏窗口

**冲突处理**:
- 注册失败时提示用户
- 提供设置界面自定义快捷键（可选）

### 3.6 自动更新

**更新流程**:
```
应用启动
  ↓
检查更新 (GitHub Releases / 自建服务器)
  ↓
发现新版本
  ↓
后台下载更新包
  ↓
下载完成，显示通知
  ↓
用户点击"立即更新"
  ↓
退出应用并安装
```

**更新策略**:
- 启动时检查（不阻塞启动）
- 每 4 小时检查一次
- 可在设置中关闭自动更新

**版本管理**:
- 使用 `electron-updater`
- 版本号遵循 Semver
- 支持增量更新（仅下载差异）

## 4. 技术实现要点

### 4.1 安全策略

**渲染进程隔离**:
```typescript
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),
  contextIsolation: true,      // 隔离上下文
  nodeIntegration: false,      // 禁用 Node.js
  webSecurity: true,           // 启用 Web 安全
  sandbox: true                // 启用沙箱
}
```

**API 白名单**:
```typescript
// preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  // 平台信息
  platform: () => ipcRenderer.invoke('get-platform'),
  appVersion: () => ipcRenderer.invoke('get-app-version'),

  // 文件操作
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // 系统通知
  showNotification: (title, body) =>
    ipcRenderer.invoke('show-notification', { title, body }),

  // 窗口控制
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),

  // 更新相关
  checkForUpdates: () => ipcRenderer.invoke('check-updates'),
  onUpdateAvailable: (callback) =>
    ipcRenderer.on('update-available', callback)
})
```

### 4.2 代码复用策略

**平台检测**:
```typescript
// src/utils/platform.ts
export const isElectron = () => {
  return typeof window !== 'undefined' &&
         window.electronAPI !== undefined
}

export const getPlatform = async () => {
  if (isElectron()) {
    return await window.electronAPI.platform()
  }
  return 'web'
}
```

**条件功能**:
```typescript
// 在组件中使用
if (isElectron()) {
  // 启用拖拽上传
  setupDragAndDrop()

  // 监听更新事件
  window.electronAPI.onUpdateAvailable((info) => {
    showUpdateDialog(info)
  })
}
```

**现有代码改动**:
- WebSocket: 无需修改
- 文件上传: 增加本地文件路径支持
- iframe: 无需修改
- 语音录制: 无需修改

### 4.3 构建配置

**开发模式**:
```bash
# Web 开发
pnpm dev

# Electron 开发
pnpm dev:electron
```

**生产构建**:
```bash
# Web 构建
pnpm build

# Mac 打包
pnpm build:mac

# Windows 打包
pnpm build:win

# 同时打包
pnpm build:all
```

**Vite 配置**:
```typescript
// vite.config.ts
import electron from 'vite-plugin-electron'

export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron'

  return {
    plugins: [
      vue(),
      ...(isElectron ? [
        electron([
          {
            entry: 'electron/main.ts',
            vite: {
              build: {
                outDir: 'dist-electron',
                rollupOptions: {
                  external: ['electron']
                }
              }
            }
          },
          {
            entry: 'electron/preload.ts',
            onstart(options) {
              options.reload()
            }
          }
        ])
      ] : [])
    ],
    base: isElectron ? './' : '/',
    build: {
      outDir: isElectron ? 'dist' : 'dist-web'
    }
  }
})
```

**Electron Builder 配置**:
```json5
// electron-builder.json5
{
  appId: "com.jclaw.desktop",
  productName: "JClaw AI",
  directories: {
    output: "release"
  },
  files: [
    "dist/**/*",
    "dist-electron/**/*"
  ],
  mac: {
    target: ["dmg", "zip"],
    icon: "build/icon.icns",
    category: "public.app-category.productivity",
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist"
  },
  win: {
    target: ["nsis"],
    icon: "build/icon.ico"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
}
```

### 4.4 性能优化

**启动优化**:
- 延迟加载非关键模块
- 使用 `ready-to-show` 事件避免白屏
- 预加载常用资源

**内存优化**:
- 限制渲染进程数量
- 及时清理未使用的资源
- 监控内存使用情况

**打包优化**:
- 代码分割和懒加载
- 压缩静态资源
- 使用 asar 打包应用代码

## 5. 实施步骤

### 阶段 1: 基础搭建（第 1 天）
1. 安装依赖
2. 创建目录结构
3. 实现主进程基础框架
4. 实现预加载脚本
5. 配置 Vite 和 Electron Builder
6. 验证开发环境可运行

### 阶段 2: 核心功能（第 2 天）
1. 实现窗口管理和状态持久化
2. 实现系统托盘
3. 实现全局快捷键
4. 添加平台检测工具
5. 测试基础功能

### 阶段 3: 增强特性（第 3 天）
1. 实现文件拖拽上传
2. 实现系统通知
3. 集成自动更新
4. 准备打包资源（图标等）
5. 测试所有桌面特性

### 阶段 4: 打包发布（第 4 天）
1. 配置代码签名（Mac）
2. 测试打包流程
3. 生成安装包
4. 在真实环境测试
5. 准备发布文档

## 6. 风险和注意事项

### 技术风险
- **打包体积**: Electron 应用约 150MB，需向用户说明
- **内存占用**: 比 Web 版本高，需优化
- **系统兼容性**: 需在不同系统版本测试

### 开发注意事项
- **安全性**: 严格遵循 Electron 安全最佳实践
- **更新机制**: 需要配置更新服务器
- **代码签名**: Mac 需要 Apple Developer 账号，Windows 需要代码签名证书

### 用户体验
- **首次启动**: 可能需要系统权限（通知、文件访问）
- **更新提示**: 不要过于频繁打扰用户
- **错误处理**: 提供友好的错误提示

## 7. 成功标准

### 功能完整性
- ✅ 所有 Web 功能正常运行
- ✅ 系统托盘可用
- ✅ 全局快捷键生效
- ✅ 文件拖拽上传正常
- ✅ 系统通知显示正确
- ✅ 自动更新流程完整

### 性能指标
- 启动时间 < 3 秒
- 内存占用 < 300MB（空闲状态）
- 打包体积 < 200MB

### 兼容性
- Mac: macOS 10.13+
- Windows: Windows 10+

## 8. 后续优化方向

- 添加应用内更新日志展示
- 支持自定义快捷键
- 添加性能监控和错误上报
- 支持多窗口模式
- 添加离线模式支持
