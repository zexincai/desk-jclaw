# Electron 桌面应用 - 实施说明

## 当前进度

✅ **已完成**:
1. 目录结构创建
2. 主进程实现 (`electron/main.ts`)
3. 预加载脚本 (`electron/preload.ts`)
4. 功能模块实现:
   - 窗口管理 (window.ts)
   - 系统托盘 (tray.ts)
   - 全局快捷键 (shortcuts.ts)
   - 文件操作 (file.ts)
   - 系统通知 (notification.ts)
   - 自动更新 (updater.ts)
5. 平台检测工具 (`src/utils/platform.ts`)
6. TypeScript 类型定义 (`src/types/electron.d.ts`)
7. Vite 配置更新
8. Electron Builder 配置
9. package.json 脚本配置

⏳ **进行中**:
- 依赖安装 (electron, vite-plugin-electron, electron-builder)

⏳ **待完成**:
1. 添加应用图标 (icon.icns, icon.ico, icon.png)
2. 添加 electron-updater 依赖
3. 修复 window.ts 中的 app 导入
4. 测试开发环境
5. 实现文件拖拽上传功能
6. 集成到现有 Vue 组件

## 下一步操作

### 1. 等待依赖安装完成
```bash
# 检查安装状态
ps aux | grep pnpm
```

### 2. 添加缺失的依赖
```bash
pnpm add -D electron-updater
```

### 3. 修复代码问题

**electron/modules/window.ts** 需要导入 app:
```typescript
import { BrowserWindow, screen, app } from 'electron'
```

### 4. 准备应用图标

需要创建以下图标文件并放入 `build/` 目录:
- **icon.icns**: Mac 图标 (1024x1024 PNG 转换)
- **icon.ico**: Windows 图标 (256x256 PNG 转换)
- **icon.png**: 托盘图标 (256x256 PNG)

可以使用在线工具转换:
- https://cloudconvert.com/png-to-icns (Mac)
- https://cloudconvert.com/png-to-ico (Windows)

### 5. 测试开发环境

```bash
# 启动 Electron 开发模式
pnpm dev:electron
```

### 6. 实现文件拖拽上传

在 `src/components/chat/InputBar.vue` 中添加:
```typescript
import { isElectron } from '@/utils/platform'

// 监听拖拽事件
const handleDrop = async (e: DragEvent) => {
  e.preventDefault()

  if (isElectron() && e.dataTransfer?.files) {
    const files = Array.from(e.dataTransfer.files)
    // 调用现有上传逻辑
    for (const file of files) {
      await uploadFile(file)
    }
  }
}
```

## 已知问题

1. **依赖安装权限错误**: pnpm 遇到 ERR_PNPM_EACCES，正在重试
2. **window.ts 缺少 app 导入**: 需要从 electron 导入 app
3. **缺少应用图标**: 需要手动创建图标文件

## 项目结构

```
app-jw/
├── electron/                    # ✅ Electron 代码
│   ├── main.ts                 # ✅ 主进程
│   ├── preload.ts              # ✅ 预加载脚本
│   └── modules/                # ✅ 功能模块
│       ├── window.ts           # ✅ 窗口管理
│       ├── tray.ts             # ✅ 系统托盘
│       ├── updater.ts          # ✅ 自动更新
│       ├── notification.ts     # ✅ 系统通知
│       ├── shortcuts.ts        # ✅ 全局快捷键
│       └── file.ts             # ✅ 文件操作
├── src/
│   ├── utils/
│   │   └── platform.ts         # ✅ 平台检测
│   └── types/
│       └── electron.d.ts       # ✅ 类型定义
├── build/                      # ⚠️ 需要添加图标
│   ├── entitlements.mac.plist  # ✅ Mac 权限配置
│   ├── icon.icns              # ❌ 待添加
│   ├── icon.ico               # ❌ 待添加
│   └── icon.png               # ❌ 待添加
├── vite.config.ts             # ✅ 已配置
├── electron-builder.json5     # ✅ 已配置
└── package.json               # ✅ 已更新
```

## 开发命令

```bash
# Web 开发
pnpm dev

# Electron 开发
pnpm dev:electron

# 构建 Web 版本
pnpm build

# 构建 Mac 安装包
pnpm build:mac

# 构建 Windows 安装包
pnpm build:win

# 同时构建两个平台
pnpm build:all
```

## 参考文档

- 设计方案: `docs/superpowers/specs/2026-04-15-electron-desktop-app-design.md`
- Electron 文档: https://www.electronjs.org/docs
- Vite Plugin Electron: https://github.com/electron-vite/vite-plugin-electron
