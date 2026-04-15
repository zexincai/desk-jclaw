# ⚠️ 依赖安装问题解决方案

## 问题描述

Electron 安装不完整，导致启动失败：
```
Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
```

同时遇到 node_modules 权限问题，无法删除某些文件。

## 🔧 解决方案

### 方案 1: 修复权限并重新安装（推荐）

```bash
# 1. 修复 node_modules 权限
sudo chown -R $(whoami) node_modules

# 2. 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 3. 清理 pnpm 缓存
pnpm store prune

# 4. 重新安装所有依赖
pnpm install
```

### 方案 2: 使用 npm 替代 pnpm

```bash
# 1. 修复权限
sudo chown -R $(whoami) node_modules

# 2. 删除现有依赖
rm -rf node_modules package-lock.json pnpm-lock.yaml

# 3. 使用 npm 安装
npm install
```

### 方案 3: 手动安装 Electron

```bash
# 1. 修复权限
sudo chown -R $(whoami) node_modules

# 2. 只删除 electron 相关
rm -rf node_modules/.pnpm/electron*
rm -rf node_modules/electron

# 3. 重新安装 electron
pnpm install electron --force

# 或使用 npm
npm install electron --force
```

## 🎯 验证安装

安装完成后，验证 Electron 是否正确安装：

```bash
# 检查 electron 可执行文件
ls -la node_modules/.bin/electron

# 测试 electron 版本
npx electron --version

# 应该输出: v28.3.3
```

## 🚀 启动应用

验证成功后，启动开发环境：

```bash
pnpm dev:electron
```

## 📋 如果仍然失败

### 完全清理重装

```bash
# 1. 停止所有 node 进程
pkill -f node

# 2. 修复权限
sudo chown -R $(whoami) ~/Documents/learn/app-jw

# 3. 完全清理
cd ~/Documents/learn/app-jw
rm -rf node_modules pnpm-lock.yaml package-lock.json

# 4. 清理全局缓存
pnpm store prune
npm cache clean --force

# 5. 重新安装
pnpm install

# 或使用 npm
npm install
```

## 💡 为什么会出现这个问题？

1. **权限问题**: pnpm 安装过程中遇到权限错误（ERR_PNPM_EACCES）
2. **安装不完整**: Electron 二进制文件未正确下载
3. **文件锁定**: 某些文件被其他进程锁定

## 🔍 检查权限

```bash
# 检查当前目录权限
ls -la node_modules | head -20

# 检查 pnpm store 权限
ls -la ~/Library/pnpm/store

# 如果有权限问题，修复：
sudo chown -R $(whoami) ~/Library/pnpm
sudo chown -R $(whoami) ~/Documents/learn/app-jw
```

## ✅ 预期结果

安装成功后，你应该看到：

```bash
$ npx electron --version
v28.3.3

$ ls node_modules/.bin/electron
node_modules/.bin/electron
```

然后就可以运行 `pnpm dev:electron` 启动应用了。

## 📞 需要帮助？

如果以上方案都不行，可以：

1. 查看完整错误日志
2. 检查系统环境（Node.js 版本、磁盘空间）
3. 尝试在新目录重新 clone 项目

---

**建议**: 先尝试方案 1，如果不行再尝试方案 2。
