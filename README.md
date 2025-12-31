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
└── assets/
    └── icons/          # 图标资源
```