# 🔧 Electron 安装替代方案

## 方案：使用 npm 替代 pnpm

由于 pnpm 持续遇到权限问题，我们改用 npm。

## 步骤

### 1. 完全清理（需要 sudo）

```bash
cd /Users/lion/Documents/learn/app-jw

# 修复权限
sudo chown -R $(whoami) .

# 删除所有依赖
sudo rm -rf node_modules pnpm-lock.yaml package-lock.json
```

### 2. 使用 npm 安装

```bash
# 使用 npm 安装所有依赖
npm install
```

### 3. 验证安装

```bash
# 检查 electron
npx electron --version

# 应该输出: v28.3.3
```

### 4. 启动应用

```bash
# 使用 npm 启动
npm run dev:electron
```

## 如果 npm 也失败

### 方案 A: 手动下载 Electron

```bash
# 1. 安装其他依赖（跳过 electron）
npm install --ignore-scripts

# 2. 手动安装 electron
npm install electron --force

# 3. 如果还是失败，设置镜像
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm install electron --force
```

### 方案 B: 使用淘宝镜像

```bash
# 设置淘宝镜像
npm config set registry https://registry.npmmirror.com
npm config set electron_mirror https://npmmirror.com/mirrors/electron/

# 重新安装
npm install
```

### 方案 C: 检查网络和磁盘

```bash
# 检查磁盘空间
df -h

# 检查网络连接
curl -I https://registry.npmjs.org

# 检查 npm 缓存
npm cache clean --force
```

## 如果所有方案都失败

可能的原因：
1. 网络问题（无法下载 Electron 二进制文件）
2. 磁盘空间不足
3. 系统权限配置问题
4. 防火墙/代理问题

请提供错误信息，我可以进一步诊断。

---

**推荐**: 先尝试使用 npm，如果失败再尝试设置镜像。
