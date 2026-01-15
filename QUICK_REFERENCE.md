# 快速参考卡片

## 一键启动

### Linux/Mac
```bash
chmod +x start.sh && ./start.sh
```

### Windows
```batch
start.bat
```

## 常用命令

### npm 命令
```bash
npm install          # 安装依赖
npm start           # 启动服务器
npm run dev         # 开发模式（热重载）
```

### Python 服务器
```bash
python3 -m http.server 8000        # Python 3
python -m SimpleHTTPServer 8000     # Python 2
```

### Node.js 服务器
```bash
npx http-server -p 8000            # 无需安装
npm install -g http-server           # 全局安装
http-server -p 8000                 # 使用
```

### PHP 服务器
```bash
php -S localhost:8000
```

## 浏览器快捷键

### 开发者工具
| 浏览器 | 快捷键 |
|--------|--------|
| Chrome/Edge | `F12` 或 `Ctrl+Shift+I` |
| Firefox | `F12` 或 `Ctrl+Shift+K` |
| Safari | `Cmd+Option+I` |

### 设备模拟
| 操作系统 | 快捷键 |
|---------|--------|
| Windows/Linux | `Ctrl+Shift+M` |
| Mac | `Cmd+Shift+M` |

### 刷新缓存
| 操作 | 快捷键 |
|------|--------|
| 普通刷新 | `F5` / `Ctrl+R` |
| 硬性刷新 | `Ctrl+F5` / `Ctrl+Shift+R` |
| 清空缓存刷新 | `Shift+F5` |

## 控制台调试命令

### 认证相关
```javascript
// 查看当前用户
app.getCurrentUser()

// 查看认证状态
localStorage.getItem('authToken')
localStorage.getItem('currentUser')

// 查看所有用户
JSON.parse(localStorage.getItem('users'))

// 退出登录
localStorage.removeItem('authToken')
localStorage.removeItem('currentUser')
location.reload()
```

### 数据管理
```javascript
// 查看当前用户的知识库
const user = app.getCurrentUser();
JSON.parse(localStorage.getItem(`knowledge_${user.id}`) || '[]')

// 查看当前用户的偏好
JSON.parse(localStorage.getItem(`preferences_${user.id}`) || '[]')

// 查看当前用户的文件
JSON.parse(localStorage.getItem(`files_${user.id}`) || '[]')

// 查看当前用户的工具
JSON.parse(localStorage.getItem(`tools_${user.id}`) || '[]')
```

### 验证码
```javascript
// 查看所有验证码
JSON.parse(localStorage.getItem('verificationCodes') || '{}')

// 查看特定邮箱的验证码
const codes = JSON.parse(localStorage.getItem('verificationCodes') || '{}');
codes['test@example.com']
```

### 主题
```javascript
// 查看当前主题
localStorage.getItem('theme')

// 切换主题
app.toggleTheme()
```

### 清除数据
```javascript
// 清除所有数据（谨慎！）
localStorage.clear()

// 清除特定用户数据
const user = app.getCurrentUser();
localStorage.removeItem(`knowledge_${user.id}`)
localStorage.removeItem(`preferences_${user.id}`)
localStorage.removeItem(`files_${user.id}`)
localStorage.removeItem(`tools_${user.id}`)
```

## LocalStorage 键值

| 键名 | 类型 | 说明 |
|------|------|------|
| `authToken` | string | 认证令牌 |
| `currentUser` | string (JSON) | 当前登录用户信息 |
| `users` | string (JSON array) | 所有注册用户 |
| `verificationCodes` | string (JSON object) | 邮箱验证码 |
| `knowledge_{userId}` | string (JSON array) | 用户的知识库 |
| `preferences_{userId}` | string (JSON array) | 用户的检索偏好 |
| `files_{userId}` | string (JSON array) | 用户上传的文件 |
| `tools_{userId}` | string (JSON array) | 用户的工具集 |
| `theme` | string | 主题设置 ('light' 或 'dark') |

## 文件路径

### HTML 文件
- `login.html` - 登录/注册页面
- `index.html` - 主页面
- `profile.html` - 个人中心
- `knowledge.html` - 知识管理
- `preferences.html` - 检索偏好
- `userinfo.html` - 个人信息
- `tools.html` - 工具集

### JavaScript 文件
- `js/auth.js` - 认证逻辑
- `js/knowledge.js` - 知识管理
- `js/preferences.js` - 偏好设置
- `js/userinfo.js` - 用户信息
- `js/tools.js` - 工具管理
- `js/main.js` - 主应用逻辑
- `js/profile.js` - 个人中心逻辑

### 文档文件
- `README.md` - 项目说明
- `DEVELOPMENT.md` - 开发指南
- `DEPLOYMENT.md` - 部署指南
- `QUICK_REFERENCE.md` - 快速参考（本文件）
- `AGENTS.md` - AI Agent 指令

### Specs 目录
- `specs/001-user-authentication-system/` - 认证系统
- `specs/002-knowledge-pair-management/` - 知识管理
- `specs/003-search-preferences-system/` - 检索偏好
- `specs/004-user-profile-management/` - 用户信息
- `specs/005-tools-collection-management/` - 工具集
- `specs/006-integrated-testing-and-validation/` - 集成测试
- `specs/007-修复注册登录跳转和邮箱验证问题/` - Bug 修复

## 常见错误和解决方法

### 错误：端口被占用
```
Address already in use
```
**解决方法**：
```bash
# 使用其他端口
python3 -m http.server 8080

# 或查找并杀死占用进程
lsof -i :8000 | grep LISTEN
kill -9 <PID>
```

### 错误：LocalStorage 被禁用
```
SecurityError: The operation is insecure
```
**解决方法**：
- 使用 HTTP 服务器而不是直接打开文件
- 检查浏览器隐私设置
- 关闭隐私模式

### 错误：文件未找到
```
File not found: js/auth.js
```
**解决方法**：
- 确认从项目根目录启动服务器
- 检查文件路径是否正确

### 错误：CORS
```
Access-Control-Allow-Origin
```
**解决方法**：
- 使用 HTTP 服务器
- 不要直接打开 HTML 文件

## 性能优化建议

### 开发环境
1. 使用 Live Server 实现热重载
2. 禁用浏览器缓存
3. 使用 Source Maps

### 生产环境
1. 压缩 JavaScript 和 CSS
2. 启用 Gzip 压缩
3. 使用 CDN 加速
4. 实现代码分割

## 测试清单

### 手动测试
- [ ] 用户注册成功
- [ ] 用户登录成功
- [ ] 邮箱验证登录成功
- [ ] 知识条目 CRUD 正常
- [ ] 搜索功能正常
- [ ] 文件上传正常
- [ ] 主题切换正常
- [ ] 响应式布局正常

### 自动化测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] E2E 测试通过

## 有用的链接

- [MDN Web 文档](https://developer.mozilla.org/)
- [JavaScript 教程](https://javascript.info/)
- [CSS 技巧](https://css-tricks.com/)
- [Stack Overflow](https://stackoverflow.com/)
- [GitHub 仓库](https://github.com/)

## 快速问题诊断

### 问题：页面空白
```bash
# 1. 检查控制台错误
# 2. 检查 JS 文件路径
# 3. 检查网络请求
```

### 问题：登录不跳转
```javascript
// 1. 检查认证信息
console.log(localStorage.getItem('authToken'))
console.log(localStorage.getItem('currentUser'))

// 2. 检查是否有 JS 错误
// 打开开发者工具 Console 标签
```

### 问题：数据不保存
```javascript
// 1. 检查 LocalStorage 可用性
try {
    localStorage.setItem('test', 'test');
    console.log('LocalStorage 可用');
} catch (e) {
    console.log('LocalStorage 不可用');
}

// 2. 检查存储配额
if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(estimate => {
        console.log('已用空间:', (estimate.usage / 1024 / 1024).toFixed(2), 'MB');
    });
}
```

### 问题：样式不显示
```javascript
// 1. 检查 CSS 文件是否加载
const link = document.querySelector('link[href="css/style.css"]');
console.log('CSS 文件:', link);

// 2. 检查元素样式
const element = document.querySelector('.navbar');
console.log('元素样式:', window.getComputedStyle(element));
```

## Git 常用命令

```bash
# 查看状态
git status

# 添加文件
git add .

# 提交
git commit -m "描述"

# 推送到远程
git push

# 拉取更新
git pull

# 查看历史
git log --oneline

# 查看分支
git branch

# 切换分支
git checkout <branch-name>
```

## VS Code 快捷键

| 操作 | Windows/Linux | Mac |
|------|-------------|------|
| 打开命令面板 | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| 打开文件 | `Ctrl+P` | `Cmd+P` |
| 查找 | `Ctrl+F` | `Cmd+F` |
| 替换 | `Ctrl+H` | `Cmd+H` |
| 在文件中查找 | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| 终端 | `Ctrl+`` ` | `Cmd+`` ` |
| 侧边栏 | `Ctrl+B` | `Cmd+B` |
| 格式化文档 | `Shift+Alt+F` | `Shift+Option+F` |

## 浏览器兼容性

### 支持的浏览器
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### 需要的 ES6+ 特性
- `class` 关键字
- `async/await`
- `箭头函数`
- `模板字符串`
- `解构赋值`
- `展开运算符`

### LocalStorage 支持
- ✅ 所有现代浏览器
- ✅ 移动浏览器
- ❌ IE 10 及以下（需要 polyfill）

## 获取帮助

### 文档
- 项目 README.md
- DEVELOPMENT.md（开发指南）
- DEPLOYMENT.md（部署指南）
- Specs 目录（各模块文档）

### 社区
- Stack Overflow
- GitHub Issues
- 相关论坛

### 调试
- 浏览器开发者工具
- 控制台日志
- Network 面板

---

**更新日期**: 2026-01-15  
**项目版本**: 1.0.0
