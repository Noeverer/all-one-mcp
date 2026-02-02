# 开发和调试指南

## 快速启动

### 方法一：使用一键脚本（推荐）

#### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

#### Windows
```batch
start.bat
```

脚本会自动检测并使用可用的 HTTP 服务器：
- Python 3（优先）
- Python 2
- Node.js（需要安装 http-server）
- PHP

启动后访问：http://localhost:8000/login.html

### 方法二：使用 npm（需要 Node.js）

```bash
# 安装依赖
npm install

# 开发模式（带热重载）
npm run dev

# 生产模式
npm start
```

### 方法三：手动启动服务器

#### Python 3
```bash
python3 -m http.server 8000
```

#### Python 2
```bash
python -m SimpleHTTPServer 8000
```

#### Node.js (http-server)
```bash
# 全局安装
npm install -g http-server

# 启动
http-server -p 8000

# 或使用 npx（无需安装）
npx http-server -p 8000
```

#### Node.js (live-server，支持热重载）
```bash
# 全局安装
npm install -g live-server

# 启动
live-server --port=3000
```

#### PHP
```bash
php -S localhost:8000
```

### 方法四：直接打开（不推荐，功能受限）

双击 `login.html` 文件或在浏览器中打开。

**注意**：直接打开文件可能会有以下限制：
- LocalStorage 可能无法正常工作
- 某些浏览器安全限制
- 无法测试跨域功能

## 浏览器开发者工具

### 打开开发者工具

| 浏览器 | 快捷键 | 菜单路径 |
|--------|--------|----------|
| Chrome/Edge | `F12` 或 `Ctrl+Shift+I` (Win) / `Cmd+Option+I` (Mac) | 右键 → 检查 |
| Firefox | `F12` 或 `Ctrl+Shift+K` | 右键 → 检查元素 |
| Safari | `Cmd+Option+I` | 开发 → 显示 Web 检查器 |

### 常用标签页

1. **Console（控制台）**
   - 查看 JavaScript 错误和警告
   - 执行 JavaScript 代码
   - 查看 console.log() 输出

2. **Network（网络）**
   - 查看所有网络请求
   - 检查资源加载状态
   - 分析请求/响应

3. **Application（应用）/ Storage（存储）**
   - 查看 LocalStorage
   - 查看 SessionStorage
   - 查看 Cookies
   - 查看 Cache Storage

4. **Elements（元素）/ Inspector（检查器）**
   - 查看和编辑 HTML
   - 查看 CSS 样式
   - 调试布局问题

## 调试技巧

### 1. 控制台调试命令

```javascript
// ============ 认证相关 ============

// 查看当前用户
app.getCurrentUser()

// 查看认证状态
localStorage.getItem('authToken')
localStorage.getItem('currentUser')

// 清除认证数据（模拟退出登录）
localStorage.removeItem('authToken')
localStorage.removeItem('currentUser')
location.reload()

// ============ 用户管理 ============

// 查看所有用户
JSON.parse(localStorage.getItem('users'))

// 添加测试用户
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

// ============ 验证码 ============

// 查看所有验证码
JSON.parse(localStorage.getItem('verificationCodes'))

// 查看特定邮箱的验证码
JSON.parse(localStorage.getItem('verificationCodes') || '{}')['test@example.com']

// ============ 数据管理 ============

// 查看当前用户的知识库
const user = app.getCurrentUser();
if (user) {
    JSON.parse(localStorage.getItem(`knowledge_${user.id}`) || '[]')
}

// 查看当前用户的偏好设置
if (user) {
    JSON.parse(localStorage.getItem(`preferences_${user.id}`) || '[]')
}

// 查看当前用户的文件
if (user) {
    JSON.parse(localStorage.getItem(`files_${user.id}`) || '[]')
}

// 查看当前用户的工具
if (user) {
    JSON.parse(localStorage.getItem(`tools_${user.id}`) || '[]')
}

// ============ 主题 ============

// 查看当前主题
localStorage.getItem('theme')

// 切换主题
app.toggleTheme()

// ============ 清除数据 ============

// 清除所有 LocalStorage 数据（谨慎使用！）
localStorage.clear()

// 清除特定用户的数据
const user = app.getCurrentUser();
if (user) {
    localStorage.removeItem(`knowledge_${user.id}`)
    localStorage.removeItem(`preferences_${user.id}`)
    localStorage.removeItem(`files_${user.id}`)
    localStorage.removeItem(`tools_${user.id}`)
}
```

### 2. 调试登录流程

```javascript
// 1. 检查用户是否存在
const email = 'test@example.com';
const users = JSON.parse(localStorage.getItem('users') || '[]');
const user = users.find(u => u.email === email);
console.log('用户查找结果:', user);

// 2. 模拟登录验证
const password = '123456';
const isPasswordCorrect = user && user.password === password;
console.log('密码是否正确:', isPasswordCorrect);

// 3. 模拟登录成功
if (user && isPasswordCorrect) {
    localStorage.setItem('authToken', 'test-token-' + Date.now());
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('登录成功');
    console.log('Token:', localStorage.getItem('authToken'));
    console.log('用户信息:', JSON.parse(localStorage.getItem('currentUser')));
}
```

### 3. 调试验证码流程

```javascript
// 1. 生成验证码（模拟）
const email = 'test@example.com';
const code = Math.floor(100000 + Math.random() * 900000).toString();
const expiration = Date.now() + 5 * 60 * 1000;

const codes = JSON.parse(localStorage.getItem('verificationCodes') || '{}');
codes[email] = { code, expiration, createdAt: new Date().toISOString() };
localStorage.setItem('verificationCodes', JSON.stringify(codes));

console.log('验证码已生成:', code);
console.log('过期时间:', new Date(expiration));

// 2. 验证验证码
const inputCode = '123456';
const storedCode = codes[email];

if (!storedCode) {
    console.log('错误: 请先发送验证码');
} else if (Date.now() > storedCode.expiration) {
    console.log('错误: 验证码已过期');
} else if (storedCode.code !== inputCode) {
    console.log('错误: 验证码错误');
    console.log('正确的验证码:', storedCode.code);
} else {
    console.log('验证成功!');
}
```

### 4. 调试数据隔离

```javascript
// 创建两个测试用户
const userA = { id: '1111111111', email: 'usera@example.com' };
const userB = { id: '2222222222', email: 'userb@example.com' };

// 用户 A 添加知识
localStorage.setItem(`knowledge_${userA.id}`, JSON.stringify([
    { id: '1', title: '用户A的知识', content: '...' }
]));

// 用户 B 添加知识
localStorage.setItem(`knowledge_${userB.id}`, JSON.stringify([
    { id: '2', title: '用户B的知识', content: '...' }
]));

// 验证数据隔离
console.log('用户A的知识:', JSON.parse(localStorage.getItem(`knowledge_${userA.id}`)));
console.log('用户B的知识:', JSON.parse(localStorage.getItem(`knowledge_${userB.id}`)));
```

### 5. 使用 debugger 断点

在代码中添加 `debugger;` 语句，浏览器会在该位置暂停执行：

```javascript
// 在 auth.js 中
async handleLogin() {
    debugger; // 浏览器会在此处暂停
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    // ...
}
```

**使用步骤：**
1. 在代码中添加 `debugger;`
2. 打开开发者工具
3. 执行会触发该代码的操作
4. 浏览器会在 debugger 处暂停
5. 可以查看变量值、单步执行等

### 6. 添加日志输出

在关键位置添加 console.log：

```javascript
// 在 knowledge.js 中
saveKnowledge() {
    console.log('开始保存知识...');
    const title = document.getElementById('knowledge-title').value;
    console.log('标题:', title);
    
    if (!title || !question || !answer) {
        console.error('表单验证失败');
        return;
    }
    
    console.log('验证通过，保存到 localStorage');
    this.saveKnowledgeToStorage();
    console.log('保存完成');
}
```

## 常见调试场景

### 场景 1: 登录不跳转

**检查步骤：**
1. 打开开发者工具 Console 标签
2. 提交登录表单
3. 查看是否有错误信息

**常见原因：**
- JavaScript 语法错误
- 变量未定义
- LocalStorage 被禁用

**调试命令：**
```javascript
// 检查认证信息
console.log('Token:', localStorage.getItem('authToken'));
console.log('用户:', localStorage.getItem('currentUser'));

// 检查是否有认证错误
console.log('当前页面:', window.location.pathname);
```

### 场景 2: 数据不保存

**检查步骤：**
1. 打开开发者工具 Application 标签
2. 展开 Local Storage
3. 查看数据是否保存

**调试命令：**
```javascript
// 检查 LocalStorage 是否可用
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('LocalStorage 可用');
} catch (e) {
    console.error('LocalStorage 不可用:', e);
}

// 检查存储配额
if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(estimate => {
        console.log('已用空间:', estimate.usage / 1024 / 1024, 'MB');
        console.log('可用空间:', estimate.quota / 1024 / 1024, 'MB');
    });
}
```

### 场景 3: 样式不显示

**检查步骤：**
1. 打开开发者工具 Elements 标签
2. 选择有问题的元素
3. 查看右侧的 Styles 面板

**常见原因：**
- CSS 文件路径错误
- CSS 语法错误
- 选择器优先级问题
- 浏览器缓存

**调试方法：**
```javascript
// 检查 CSS 是否加载
const links = document.querySelectorAll('link[rel="stylesheet"]');
links.forEach(link => {
    console.log('CSS 文件:', link.href);
});

// 检查元素样式
const element = document.querySelector('.navbar');
console.log('元素样式:', window.getComputedStyle(element));
```

### 场景 4: 网络请求失败

**检查步骤：**
1. 打开开发者工具 Network 标签
2. 刷新页面
3. 查看失败的请求（红色）

**调试方法：**
```javascript
// 监听所有网络请求
const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        console.log('请求:', entry.name, '状态:', entry.entryType);
    });
});
observer.observe({ entryTypes: ['resource'] });
```

## 性能调试

### 1. 性能分析

打开开发者工具 Performance 标签：
1. 点击 "Record" 按钮
2. 执行要测试的操作
3. 点击 "Stop" 按钮
4. 查看性能报告

### 2. 内存分析

打开开发者工具 Memory 标签：
1. 选择 "Heap snapshot"
2. 点击 "Take snapshot"
3. 查看内存使用情况

### 3. 渲染性能

打开开发者工具 Rendering 标签（需要启用）：
1. 勾选 "Paint flashing"
2. 查看页面哪些部分在重绘

### 4. 优化建议

打开开发者工具 Lighthouse 标签：
1. 点击 "Generate report"
2. 查看性能、可访问性等建议

## 响应式调试

### 1. 设备模拟

打开开发者工具 Device Toolbar：
- 快捷键: `Ctrl+Shift+M` (Win) / `Cmd+Shift+M` (Mac)
- 或点击工具栏上的设备图标

### 2. 测试不同设备尺寸

| 设备 | 宽度 | 高度 |
|------|------|------|
| 桌面 | 1920px | 1080px |
| 笔记本 | 1366px | 768px |
| 平板 | 768px | 1024px |
| 手机 | 375px | 667px |

### 3. 测试触摸事件

在设备模拟器中：
1. 点击 "..." 菜单
2. 勾选 "Show device frame"
3. 勾选 "Enable touch events"

## 错误处理

### 1. 全局错误捕获

```javascript
// 添加到 main.js
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的 Promise 拒绝:', event.reason);
});
```

### 2. 常见错误类型

| 错误类型 | 描述 | 解决方法 |
|----------|------|----------|
| ReferenceError | 变量未定义 | 检查变量名拼写 |
| TypeError | 类型错误 | 检查变量类型 |
| SyntaxError | 语法错误 | 检查代码语法 |
| NetworkError | 网络错误 | 检查网络连接 |

### 3. 错误日志记录

```javascript
// 创建简单的错误日志系统
const ErrorLogger = {
    log(error, context = {}) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack
            },
            context
        };
        
        const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        logs.push(errorLog);
        localStorage.setItem('errorLogs', JSON.stringify(logs));
        
        console.error('错误已记录:', errorLog);
    },
    
    get() {
        return JSON.parse(localStorage.getItem('errorLogs') || '[]');
    },
    
    clear() {
        localStorage.removeItem('errorLogs');
    }
};

// 使用示例
try {
    // 可能出错的代码
} catch (error) {
    ErrorLogger.log(error, { action: 'login', page: 'login.html' });
}

// 查看错误日志
console.log(ErrorLogger.get());
```

## 测试

### 1. 单元测试

使用 Jest 进行单元测试：

```javascript
// auth.test.js
describe('Auth', () => {
    test('should verify login credentials', () => {
        // 测试代码
    });
});
```

### 2. 集成测试

使用 Cypress 进行集成测试：

```javascript
// cypress/integration/login.spec.js
describe('Login', () => {
    it('should login with valid credentials', () => {
        cy.visit('/login.html');
        cy.get('#login-email').type('test@example.com');
        cy.get('#login-password').type('123456');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/index.html');
    });
});
```

### 3. 手动测试清单

#### 认证功能
- [ ] 用户注册成功
- [ ] 重复邮箱注册失败
- [ ] 密码不一致时注册失败
- [ ] 密码长度不足时注册失败
- [ ] 登录成功
- [ ] 用户不存在时登录失败
- [ ] 密码错误时登录失败
- [ ] 退出登录成功
- [ ] 邮箱验证登录成功
- [ ] 验证码过期时登录失败
- [ ] 验证码错误时登录失败

#### 数据管理
- [ ] 知识条目 CRUD 正常
- [ ] 搜索功能正常
- [ ] 过滤功能正常
- [ ] 分页功能正常
- [ ] 网站偏好 CRUD 正常
- [ ] 优先级排序正常
- [ ] 文件上传正常
- [ ] 文件删除正常
- [ ] 工具 CRUD 正常
- [ ] 工具启用/禁用正常

#### 用户界面
- [ ] 响应式布局正常
- [ ] 主题切换正常
- [ ] 导航正常
- [ ] 模态框正常
- [ ] 消息提示正常
- [ ] 表单验证正常

## 故障排除

### 问题 1: 端口被占用

**错误信息**: `Address already in use` 或 `EADDRINUSE`

**解决方法：**
```bash
# Linux/Mac: 查找占用端口的进程
lsof -i :8000

# Windows: 查找占用端口的进程
netstat -ano | findstr :8000

# 使用其他端口
python3 -m http.server 8080
```

### 问题 2: 浏览器缓存问题

**解决方法：**
1. 打开开发者工具
2. 右键点击刷新按钮
3. 选择 "清空缓存并硬性重新加载"
4. 或勾选 "Disable cache" 选项

### 问题 3: LocalStorage 配额已满

**错误信息**: `QuotaExceededError`

**解决方法：**
```javascript
// 查看存储使用情况
function checkStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    console.log('存储使用:', (total / 1024).toFixed(2), 'KB');
    console.log('配额限制:', (5 * 1024 * 1024).toFixed(2), 'KB');
}

checkStorageUsage();

// 清理旧数据
function cleanOldData() {
    // 清理 7 天前的验证码
    const codes = JSON.parse(localStorage.getItem('verificationCodes') || '{}');
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    for (let email in codes) {
        if (now - new Date(codes[email].createdAt).getTime() > oneWeek) {
            delete codes[email];
        }
    }
    
    localStorage.setItem('verificationCodes', JSON.stringify(codes));
    console.log('旧验证码已清理');
}

cleanOldData();
```

### 问题 4: CORS 错误

**错误信息**: `Access-Control-Allow-Origin`

**解决方法：**
- 使用 HTTP 服务器而不是直接打开文件
- 配置服务器的 CORS 设置

## 最佳实践

### 1. 代码组织
- 保持函数单一职责
- 使用有意义的变量名
- 添加注释说明复杂逻辑

### 2. 错误处理
- 使用 try-catch 捕获错误
- 提供友好的错误提示
- 记录错误日志

### 3. 性能优化
- 避免不必要的 DOM 操作
- 使用事件委托
- 懒加载资源

### 4. 安全性
- 验证所有用户输入
- 不在前端存储敏感信息
- 使用 HTTPS

### 5. 可维护性
- 保持代码简洁
- 遵循编码规范
- 编写文档

## 资源链接

- [MDN Web 文档](https://developer.mozilla.org/)
- [Chrome 开发者工具文档](https://developer.chrome.com/docs/devtools/)
- [JavaScript 教程](https://javascript.info/)
- [CSS 技巧](https://css-tricks.com/)
- [Stack Overflow](https://stackoverflow.com/)
