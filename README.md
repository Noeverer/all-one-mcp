# 个性化大模型助手用户中心系统

这是一个完整的用户中心系统，用于实现大模型助手的千人千面功能，支持用户个性化知识记忆、网站检索偏好管理、个人信息管理及专属工具集管理。

## 功能特性

- 用户身份认证（登录/注册/密码重置）
- 知识对存储与管理
- 检索偏好设置
- 个人信息与文件管理
- 专属工具集管理
- 暗黑/明亮模式切换
- 响应式设计

## 快速开始

### 方式一：使用一键脚本（推荐）

#### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

#### Windows
```batch
start.bat
```

脚本会自动检测并使用可用的 HTTP 服务器（Python 3、Python 2、Node.js 或 PHP）。

启动后访问：http://localhost:8000/login.html

### 方式二：使用 npm

```bash
# 安装依赖
npm install

# 开发模式（带热重载）
npm run dev

# 生产模式
npm start
```

### 方式三：手动启动服务器

```bash
# Python 3
python3 -m http.server 8000

# Node.js (需要安装 http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

## 开发和调试

详细的开发、调试和故障排除指南，请查看 [DEVELOPMENT.md](./DEVELOPMENT.md)

主要内容包括：
- 浏览器开发者工具使用
- 调试技巧和命令
- 常见问题解决
- 性能优化
- 测试方法

## 技术栈

- HTML5
- CSS3 (Flexbox/Grid)
- JavaScript (ES6+)
- 本地存储 (LocalStorage)

## 项目结构

```
├── index.html          # 主页面
├── login.html          # 登录/注册页面
├── profile.html        # 个人中心主页
├── knowledge.html      # 知识记忆管理页面
├── preferences.html    # 检索偏好设置页面
├── userinfo.html       # 个人信息管理页面
├── tools.html          # 专属工具集页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── auth.js         # 认证功能
│   ├── knowledge.js    # 知识管理
│   ├── preferences.js  # 偏好设置
│   ├── userinfo.js     # 用户信息
│   ├── tools.js        # 工具管理
│   └── main.js         # 主应用逻辑
├── specs/             # 功能规格文档
│   ├── 001-user-authentication-system/
│   ├── 002-knowledge-pair-management/
│   ├── 003-search-preferences-system/
│   ├── 004-user-profile-management/
│   ├── 005-tools-collection-management/
│   ├── 006-integrated-testing-and-validation/
│   └── 007-修复注册登录跳转和邮箱验证问题/
├── assets/
│   └── icons/         # 图标资源
├── 03-wikijs/         # Wiki.js 在线笔记系统
│   ├── docker-compose.yml
│   ├── config.yml
│   ├── start.sh
│   ├── README.md
│   └── QUICKSTART.md
├── start.sh           # Linux/Mac 一键启动脚本
├── start.bat          # Windows 一键启动脚本
├── DEVELOPMENT.md     # 开发和调试指南
├── DEPLOYMENT.md      # 部署指南
└── README.md          # 项目说明
```

## 子项目

### Wiki.js 在线笔记系统

完整功能的在线笔记部署方案,支持:
- 📝 随时随地访问和编辑笔记
- 🔗 自动化 Git 仓库同步(GitHub/GitLab)
- 👥 多人协作编辑
- ⚡ 性能优化(适配中等性能机器)
- 📊 丰富的编辑器和插件支持

快速开始:
```bash
cd 03-wikijs
./start.sh
```

详细文档: [Wiki.js 部署指南](./03-wikijs/README.md)

## 功能模块

### 001 - 用户身份认证系统
- 用户登录（邮箱+密码）
- 用户注册（用户名+邮箱+密码）
- 邮箱验证登录
- 密码重置
- 表单验证
- Token 认证

### 002 - 知识对存储与管理
- 知识条目 CRUD
- 搜索功能
- 过滤功能
- 分页功能
- 重要性标记

### 003 - 检索偏好设置
- 网站偏好 CRUD
- 优先级排序
- URL 验证
- 同步功能
- 重复检测

### 004 - 用户信息与文件管理
- 个人信息编辑
- 文件上传
- 文件管理
- 文件预览
- 文件类型识别

### 005 - 专属工具集管理
- 工具 CRUD
- 启用/禁用
- 隔离设置
- URL 验证
- 状态管理

## 测试

详细的测试报告请查看各模块的 spec 文档。

## 已知限制

- 无后端 API 集成（使用 Mock 数据）
- 无真实邮件服务（验证码为模拟）
- 密码未加密存储（明文存储在 LocalStorage）
- 无会话过期机制
- 文件上传为模拟实现

## 许可证

MIT License
