---
status: complete
created: '2026-01-15'
tags:
  - auth
  - authentication
  - login
  - register
priority: critical
created_at: '2026-01-15T09:09:52.403Z'
updated_at: '2026-01-15T09:14:42.335Z'
completed: '2026-01-15'
---

# 用户身份认证系统

> **Status**: ✅ Complete · **Priority**: Critical · **Created**: 2026-01-15 · **Tags**: auth, authentication, login, register

## Overview

实现完整的用户身份认证功能，包括登录、注册和密码重置功能

## Design

### 技术栈
- HTML5 表单
- JavaScript ES6+ 类架构
- LocalStorage 数据存储
- 模块化认证系统

### 架构设计
- `Auth` 类封装所有认证逻辑
- 支持三种登录方式：密码登录、注册、邮箱验证登录
- 基于 LocalStorage 的用户数据持久化
- Token-based 认证机制

## Plan

### 已完成功能
- [x] 用户登录功能 (邮箱+密码)
- [x] 用户注册功能 (用户名+邮箱+密码)
- [x] 邮箱验证登录功能
- [x] 密码重置功能 (通过邮箱发送重置链接)
- [x] 表单验证 (邮箱格式、密码强度、密码确认)
- [x] 用户数据持久化 (LocalStorage)
- [x] 认证状态管理
- [x] 登录页面 UI (login.html)
- [x] Tab 切换交互

### 实现细节
- `auth.js` (329 行) - 完整认证逻辑
- `login.html` (73 行) - 登录/注册页面
- 集成 `app.showMessage()` 提供用户反馈
- 验证码倒计时功能 (60秒)
- 模态框密码重置功能

## Test

### 已验证功能
- [x] 登录表单验证
- [x] 注册表单验证 (密码一致性检查)
- [x] 邮箱格式验证 (Utils.validateEmail)
- [x] 重复邮箱注册检测
- [x] 密码长度验证 (最少6位)
- [x] 验证码发送模拟
- [x] 密码重置链接发送模拟
- [x] 登录后自动跳转到 index.html
- [x] Tab 切换功能
- [x] 模态框关闭功能 (点击、ESC键)

### 测试数据流
1. 用户注册 → 保存到 `localStorage.users`
2. 用户登录 → 验证凭据 → 设置 `authToken` 和 `currentUser`
3. 访问受保护页面 → `main.js` 检查认证状态
4. 退出登录 → 清除认证数据 → 跳转到 login.html

## Notes

### 当前实现特点
- 使用 Mock 数据模拟后端 API
- 密码未加密存储 (生产环境需要加密)
- 邮箱验证码为模拟实现 (需要实际邮件服务)
- Token 为简单字符串 (生产环境需要 JWT)

### 已知限制
- 无后端 API 集成
- 无真实邮件服务
- 密码未哈希存储
- 无会话过期机制

### 相关文件
- `login.html` - 登录/注册页面
- `js/auth.js` - 认证逻辑
- `js/main.js` - 全局认证检查 (checkAuthStatus)
- `js/profile.js` - 个人信息更新逻辑

---

## 开发指南

### 快速开始

#### 方法一：直接打开（推荐用于快速测试）

1. 在浏览器中直接打开 `login.html`：
   ```bash
   # Linux/Mac
   open login.html

   # Windows
   start login.html
   ```

2. 或者在文件管理器中双击 `login.html` 文件

#### 方法二：使用本地 HTTP 服务器（推荐用于完整功能）

由于浏览器的 CORS 和 LocalStorage 安全限制，建议使用本地 HTTP 服务器：

**选项 1: 使用 Python（推荐）**
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**选项 2: 使用 Node.js**
```bash
# 全局安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8000

# 或直接使用 npx（无需安装）
npx http-server -p 8000
```

**选项 3: 使用 PHP**
```bash
php -S localhost:8000
```

**选项 4: 使用 VS Code Live Server 扩展**
1. 安装 "Live Server" 扩展
2. 右键点击 `login.html`
3. 选择 "Open with Live Server"

启动后，在浏览器中访问：`http://localhost:8000/login.html`

### 一键化启动脚本

项目根目录包含以下一键启动脚本：

#### Linux/Mac: `start.sh`
```bash
#!/bin/bash

# 检查 Python 是否可用
if command -v python3 &> /dev/null; then
    echo "使用 Python 3 启动服务器..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "使用 Python 2 启动服务器..."
    python -m SimpleHTTPServer 8000
elif command -v node &> /dev/null; then
    echo "使用 Node.js 启动服务器..."
    npx http-server -p 8000
else
    echo "错误: 未找到可用的 HTTP 服务器"
    echo "请安装 Python 3, Python 2 或 Node.js"
    exit 1
fi
```

#### Windows: `start.bat`
```batch
@echo off

REM 检查 Python 是否可用
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo 使用 Python 启动服务器...
    python -m http.server 8000
    goto :end
)

REM 检查 Python 3 是否可用
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo 使用 Python 3 启动服务器...
    python3 -m http.server 8000
    goto :end
)

REM 检查 Node.js 是否可用
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo 使用 Node.js 启动服务器...
    npx http-server -p 8000
    goto :end
)

echo 错误: 未找到可用的 HTTP 服务器
echo 请安装 Python 或 Node.js
pause
exit /b 1

:end
```

**使用方法：**
```bash
# Linux/Mac
chmod +x start.sh
./start.sh

# Windows
start.bat
```

### 调试技巧

#### 1. 浏览器开发者工具

**打开开发者工具：**
- Chrome/Edge: `F12` 或 `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Firefox: `F12` 或 `Ctrl+Shift+K`
- Safari: `Cmd+Option+I` (需要先在偏好设置中启用开发者菜单)

**控制台使用：**
```javascript
// 查看当前用户
app.getCurrentUser()

// 查看认证状态
localStorage.getItem('authToken')
localStorage.getItem('currentUser')

// 查看用户列表
JSON.parse(localStorage.getItem('users'))

// 查看验证码
JSON.parse(localStorage.getItem('verificationCodes'))

// 清除所有数据（重新开始）
localStorage.clear()

// 清除认证数据（退出登录模拟）
localStorage.removeItem('authToken')
localStorage.removeItem('currentUser')

// 测试用户注册
localStorage.setItem('users', JSON.stringify([
    {
        id: Date.now(),
        email: 'test@example.com',
        username: 'testuser',
        password: '123456',
        nickname: '测试用户',
        avatar: 'assets/icons/user-avatar.png',
        joinDate: new Date().toISOString()
    }
]))
```

#### 2. 网络请求调试

由于使用 Mock 数据，没有真实的网络请求。如果需要调试：
```javascript
// 在 auth.js 中添加日志
console.log('登录请求:', { email, password });
console.log('用户列表:', users);
console.log('验证结果:', result);
```

#### 3. LocalStorage 调试

在浏览器开发者工具的 Application 标签页（Chrome/Edge）或 Storage 标签页（Firefox）中：
- 展开 Local Storage
- 选择你的网站（如 `http://localhost:8000`）
- 查看和修改存储的数据

**常用的 LocalStorage 键：**
- `authToken`: 认证令牌
- `currentUser`: 当前登录用户信息
- `users`: 所有注册用户列表
- `verificationCodes`: 邮箱验证码（临时）
- `knowledge_{userId}`: 用户的知识库
- `preferences_{userId}`: 用户的检索偏好
- `files_{userId}`: 用户上传的文件
- `tools_{userId}`: 用户的工具集
- `theme`: 主题设置（'light' 或 'dark'）

#### 4. 常见调试场景

**场景 1: 登录失败**
```javascript
// 检查用户是否存在
const users = JSON.parse(localStorage.getItem('users') || '[]');
console.log('注册用户:', users);

// 检查用户对象
const user = users.find(u => u.email === 'test@example.com');
console.log('查找结果:', user);
```

**场景 2: 验证码问题**
```javascript
// 查看验证码
const codes = JSON.parse(localStorage.getItem('verificationCodes') || '{}');
console.log('验证码列表:', codes);

// 检查验证码是否过期
if (codes['test@example.com']) {
    const isExpired = Date.now() > codes['test@example.com'].expiration;
    console.log('验证码过期:', isExpired);
}
```

**场景 3: 数据隔离问题**
```javascript
// 检查不同用户的数据
const userA = '1234567890';
const userB = '0987654321';

console.log('用户A的知识库:', localStorage.getItem(`knowledge_${userA}`));
console.log('用户B的知识库:', localStorage.getItem(`knowledge_${userB}`));
```

#### 5. 错误捕获

在浏览器控制台中查看 JavaScript 错误：
- 红色错误：严重的错误，可能导致功能失败
- 黄色警告：非致命问题，但不应该在生产环境中出现
- 蓝色信息：一般日志信息

**常见错误：**
- `Uncaught ReferenceError`: 变量未定义
- `Uncaught TypeError`: 类型错误（如调用 undefined 的方法）
- `SyntaxError`: 语法错误

### 测试流程

#### 完整测试流程

1. **启动服务器**
   ```bash
   ./start.sh  # Linux/Mac
   # 或
   start.bat    # Windows
   ```

2. **打开浏览器**
   访问 `http://localhost:8000/login.html`

3. **测试注册**
   - 点击"注册"标签
   - 填写：用户名 "testuser"，邮箱 "test@example.com"，密码 "123456"
   - 提交注册
   - 验证跳转到 index.html

4. **测试登录**
   - 退出登录（点击右上角"退出登录"）
   - 重新登录：邮箱 "test@example.com"，密码 "123456"
   - 验证登录成功

5. **测试邮箱验证登录**
   - 退出登录
   - 切换到"邮箱验证"标签
   - 填写邮箱 "newuser@example.com"
   - 点击"发送验证码"
   - 查看控制台获取验证码
   - 输入验证码并提交
   - 验证自动注册并登录

6. **调试数据**
   打开开发者工具 Application → Local Storage，查看存储的数据

#### 自动化测试（可选）

可以使用以下工具进行自动化测试：
- **Cypress**: 端到端测试框架
- **Playwright**: 现代化的 E2E 测试工具
- **Selenium**: 经典的浏览器自动化工具

**Cypress 示例配置：**
```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:8000',
    supportFile: 'cypress/support/e2e.js',
  },
}
```

### 性能优化

#### 生产环境优化

1. **压缩资源**
   ```bash
   # 使用 terser 压缩 JS
   npx terser js/*.js -c -m -o dist/js/
   
   # 使用 cssnano 压缩 CSS
   npx cssnano css/style.css dist/css/
   ```

2. **启用 Gzip 压缩**
   在服务器配置中启用 Gzip 压缩

3. **使用 CDN**
   将静态资源托管到 CDN

4. **代码分割**
   按需加载 JavaScript 模块

#### 开发环境优化

1. **禁用浏览器缓存**
   在开发者工具中勾选 "Disable cache"

2. **使用 Source Maps**
   便于调试压缩后的代码

3. **热重载**
   使用 Live Server 或其他热重载工具

### 部署指南

#### 部署到静态网站托管

**Netlify:**
```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 部署
netlify deploy --prod
```

**Vercel:**
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel --prod
```

**GitHub Pages:**
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支作为源

#### 部署到传统服务器

```bash
# 1. 构建项目（如果有构建步骤）
npm run build

# 2. 上传文件到服务器
scp -r dist/* user@server:/var/www/html/

# 3. 配置 Nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 故障排除

#### 常见问题

**问题 1: 页面空白**
- 检查浏览器控制台是否有错误
- 确认所有 JS 文件路径正确
- 检查网络请求是否成功

**问题 2: 登录不跳转**
- 检查是否有 JavaScript 错误
- 确认 `authToken` 和 `currentUser` 是否保存
- 检查 `main.js` 的认证检查逻辑

**问题 3: 数据不保存**
- 检查浏览器是否禁用了 LocalStorage
- 检查是否有隐私模式或无痕模式
- 检查存储配额是否已满

**问题 4: 样式不显示**
- 确认 CSS 文件路径正确
- 检查网络请求是否成功加载 CSS
- 清除浏览器缓存

**问题 5: 跨域问题**
- 使用 HTTP 服务器而不是直接打开文件
- 检查服务器 CORS 配置

#### 获取帮助

如果遇到问题：
1. 查看浏览器开发者工具的控制台和网络标签
2. 检查本文档的调试技巧部分
3. 查看项目的 GitHub Issues
4. 在相关社区提问并提供详细的错误信息
