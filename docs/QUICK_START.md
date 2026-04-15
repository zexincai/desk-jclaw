# Electron 桌面应用 - 快速启动指南

## 🎯 当前状态

✅ **代码已完成** - 所有核心代码已实现并提交
⏳ **依赖安装中** - pnpm 正在后台安装依赖（遇到权限问题但在重试）

## 📦 依赖安装

### 方法 1: 等待自动完成
pnpm 正在后台重试，可能需要 5-10 分钟完成。

### 方法 2: 手动重试（如果卡住）
```bash
# 停止当前安装
pkill -f pnpm

# 清理缓存
pnpm store prune

# 重新安装
pnpm install
```

### 方法 3: 使用 npm（备选）
```bash
# 如果 pnpm 持续失败，可以尝试 npm
npm install
```

## 🚀 启动开发环境

### 1. 确认依赖已安装
```bash
# 检查是否安装成功
ls node_modules/electron
ls node_modules/vite-plugin-electron
ls node_modules/electron-builder
```

### 2. 启动 Electron 开发模式
```bash
pnpm dev:electron
```

**预期结果**:
- Electron 窗口启动
- 加载 Vue 应用 (http://localhost:5173)
- 开发者工具自动打开
- 系统托盘图标显示

### 3. 测试功能
- [ ] 窗口显示正常
- [ ] 系统托盘图标可见
- [ ] 点击托盘图标切换窗口显示/隐藏
- [ ] 全局快捷键 `Cmd+Shift+J` (Mac) 或 `Ctrl+Shift+J` (Windows) 工作
- [ ] WebSocket 连接正常
- [ ] 所有现有功能正常运行

## 🎨 准备应用图标

### 需要的文件
```
build/
├── icon.icns    # Mac 图标 (1024x1024)
├── icon.ico     # Windows 图标 (256x256)
└── icon.png     # 托盘图标 (256x256)
```

### 制作步骤
1. 准备一张 1024x1024 的 PNG 图片
2. 使用在线工具转换：
   - **Mac**: https://cloudconvert.com/png-to-icns
   - **Windows**: https://cloudconvert.com/png-to-ico
3. 将文件放入 `build/` 目录

### 临时方案（测试用）
如果暂时没有图标，可以使用占位图标：
```bash
# 创建简单的占位图标
# 系统会使用默认 Electron 图标
```

## 🔧 常见问题

### Q: 依赖安装一直失败怎么办？
A: 尝试以下方法：
1. 清理缓存：`pnpm store prune`
2. 删除 node_modules：`rm -rf node_modules`
3. 重新安装：`pnpm install`
4. 或使用 npm：`npm install`

### Q: 启动后窗口空白？
A: 检查：
1. Vite 开发服务器是否运行：`pnpm dev`
2. 端口 5173 是否被占用
3. 查看控制台错误信息

### Q: 系统托盘图标不显示？
A: 需要准备图标文件：
- Mac: `build/icon.png` (16x16 或 32x32)
- Windows: `build/icon.ico`

### Q: 全局快捷键不工作？
A: 检查：
1. 快捷键是否被其他应用占用
2. 查看控制台是否有注册失败的提示

## 📝 开发命令

```bash
# Web 开发（现有方式）
pnpm dev

# Electron 开发
pnpm dev:electron

# 构建 Web 版本
pnpm build

# 构建 Mac 安装包
pnpm build:mac

# 构建 Windows 安装包（需要在 Windows 环境）
pnpm build:win

# 同时构建两个平台
pnpm build:all
```

## 🎯 下一步开发

### 1. 文件拖拽上传
在 `src/components/chat/InputBar.vue` 添加：

```typescript
import { isElectron } from '@/utils/platform'

const setupDragAndDrop = () => {
  const dropZone = inputRef.value

  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.stopPropagation()
    // 添加视觉反馈
  })

  dropZone?.addEventListener('drop', async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isElectron() && e.dataTransfer?.files) {
      const files = Array.from(e.dataTransfer.files)
      for (const file of files) {
        await uploadFile(file)
      }
    }
  })
}

onMounted(() => {
  if (isElectron()) {
    setupDragAndDrop()
  }
})
```

### 2. 系统通知集成
在 `src/composables/useChat.ts` 添加：

```typescript
import { isElectron } from '@/utils/platform'

// 收到新消息时
if (isElectron() && !document.hasFocus()) {
  window.electronAPI.showNotification(
    'JClaw AI',
    message.content.substring(0, 50)
  )
}
```

### 3. 文件选择增强
在需要选择文件的地方：

```typescript
import { isElectron } from '@/utils/platform'

const selectFile = async () => {
  if (isElectron()) {
    const filePath = await window.electronAPI.selectFile({
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
      ]
    })
    if (filePath) {
      // 处理文件
    }
  } else {
    // Web 版本的文件选择
  }
}
```

## 📚 参考文档

- **设计方案**: `docs/superpowers/specs/2026-04-15-electron-desktop-app-design.md`
- **实施说明**: `docs/ELECTRON_IMPLEMENTATION.md`
- **当前状态**: `docs/ELECTRON_STATUS.md`
- **Electron 官方文档**: https://www.electronjs.org/docs
- **Vite Plugin Electron**: https://github.com/electron-vite/vite-plugin-electron

## 💡 提示

1. **开发时**：使用 `pnpm dev:electron` 启动，支持热重载
2. **调试时**：开发者工具会自动打开，可以查看控制台日志
3. **测试时**：先在 Web 模式测试功能，再在 Electron 模式测试桌面特性
4. **打包前**：确保所有功能测试通过，准备好代码签名证书

---

**准备好了吗？** 等依赖安装完成后，运行 `pnpm dev:electron` 启动你的第一个 Electron 应用！
