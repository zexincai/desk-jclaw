# Jclaw Desktop 开发运行与打包说明

## 环境要求

| 依赖 | 版本 |
|------|------|
| Node.js | >= 18 |
| pnpm | >= 8 |

```bash
# 安装依赖
pnpm install
```

## 运行调试

### 浏览器模式（纯前端）

仅启动 Vue 前端，不加载 Electron 桌面层。适合 UI 开发调试。

```bash
pnpm dev
```

- 默认地址：`http://127.0.0.1:5173`
- 热更新生效，修改前端代码即时刷新

### Electron 模式（完整桌面应用）

同时启动 Vite 和 Electron 窗口，调试完整的桌面应用功能。

```bash
pnpm dev:electron
```

- 前端同样享受 Vite 热更新
- Electron 主进程修改后会自动重启
- 可调试托盘、快捷键、文件选择、系统通知、自动更新等 Electron 专有功能

## 构建打包

### 环境模式

项目支持多种构建模式，通过 `--mode` 指定环境配置文件（`.env.*`）：

| 命令 | 模式 | 用途 |
|------|------|------|
| `pnpm build` | production | 前端 web 构建 |
| `pnpm build:staging` | staging | 预发环境 |
| `pnpm build:pre` | pre | 预发布环境 |
| `pnpm build:cos` | cos | 腾讯云 COS 部署 |

### Electron 桌面应用打包

```bash
# 打包当前平台的桌面应用（默认）
pnpm build:electron

# 仅打包 macOS
pnpm build:mac

# 仅打包 Windows
pnpm build:win

# 同时打包 macOS + Windows
pnpm build:all
```

- 构建产物输出至 `release/` 目录
- Windows 产物为 `.exe` 安装包，macOS 产物为 `.dmg`
- 打包前会自动执行 TypeScript 类型检查（`vue-tsc`），类型错误会阻断构建

## 项目目录结构

```
jclaw-desktop/
├── electron/           # Electron 主进程
│   ├── main.ts         # 入口：窗口、托盘、快捷键、IPC
│   ├── preload.ts      # 预加载脚本（桥接主进程与渲染进程）
│   └── modules/        # 功能模块
│       ├── window.ts   # 窗口管理
│       ├── tray.ts     # 系统托盘
│       ├── shortcuts.ts # 全局快捷键
│       ├── updater.ts  # 自动更新
│       ├── file.ts     # 文件操作
│       └── notification.ts # 系统通知
├── src/                # Vue 前端
│   ├── api/            # API 请求层
│   ├── components/     # UI 组件
│   ├── composables/    # 组合式函数（状态逻辑）
│   ├── stores/         # Pinia 状态管理
│   ├── utils/          # 工具函数
│   └── views/          # 页面视图
├── build/              # 构建资源（图标等）
├── vite.config.ts      # Vite 构建配置
├── package.json        # 项目配置 & electron-builder 打包配置
└── .env.*              # 各环境配置文件
```

## 注意事项

- **单例应用**：Electron 模式下应用已配置单例锁，重复启动会自动聚焦已有窗口
- **类型检查**：构建前强制 `vue-tsc` 检查，修改代码时确保无类型错误
- **Windows 图标**：打包 Windows 需要 `build/icon.ico`；macOS 需要 `build/icon.icns`
- **主进程调试**：可在 VS Code 中通过 Debug 配置附加到 Electron 进程调试 `electron/main.ts`
