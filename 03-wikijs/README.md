# Wiki.js 部署指南

## 📋 概述

本项目使用 Docker Compose 部署 Wiki.js,提供一个功能完整、性能优化的在线笔记系统,支持:
- ✅ 适配中等性能机器
- ✅ 自动化 Git 仓库同步
- ✅ 多人协作编辑
- ✅ 随时随地访问
- ✅ 丰富的编辑器功能

## 🚀 快速开始

### 1. 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间

### 2. 基础部署

```bash
# 进入 Wiki.js 目录
cd 03-wikijs

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f wiki

# 访问初始化页面
open http://localhost:3001
```

### 3. 初始化配置

首次访问时,按照向导完成初始化:

1. **管理员账号**
   - 设置管理员邮箱
   - 设置管理员密码
   - 确认密码

2. **站点配置**
   - 站点名称: 例如"我的笔记"
   - 站点描述
   - 选择语言: 简体中文

3. **存储类型**
   - 选择默认的 PostgreSQL (已配置)

4. **Git 仓库** (可选)
   - 暂时跳过,后续在管理界面配置

## ⚙️ 配置 Git 自动同步

### 方式一: 通过管理界面配置

1. 登录 Wiki.js 管理后台
2. 进入 **系统 > Git 存储配置**
3. 填写配置:

```yaml
远程仓库 URL: https://github.com/your-username/your-repo.git
分支: main
认证方式: 根据你的仓库类型选择:
  - 公共仓库: 无需认证
  - 私有 GitHub: Personal Access Token
  - 私有 GitLab: Personal Access Token
用户名: your-username
邮箱: your-email@example.com
自动拉取: ✓
自动推送: ✓
同步间隔: 30 分钟
```

### 方式二: 通过配置文件配置

编辑 `config.yml`:

```yaml
git:
  url: https://github.com/your-username/your-repo.git
  branch: main
  authType: bearer
  # 在环境变量中设置 token
  username: your-username
  email: your-email@example.com
  syncInterval: 30
  autoFetch: true
  autoPush: true
```

设置环境变量:

```bash
# 在 docker-compose.yml 的 wiki 服务中添加
environment:
  GIT_TOKEN: your-personal-access-token
```

### 创建 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限:
   - `repo` - 完整的仓库访问权限
4. 生成并复制 token

### 创建 GitLab Personal Access Token

1. 访问 https://gitlab.com/-/profile/personal_access_tokens
2. 创建新 token
3. 选择权限:
   - `read_repository`
   - `write_repository`
4. 创建并复制 token

## 👥 多人协作配置

### 1. 用户管理

1. 管理员登录
2. 进入 **用户** > **管理**
3. 点击 "创建用户" 或邀请链接

### 2. 权限设置

Wiki.js 提供灵活的权限系统:

- **管理员**: 完全控制权限
- **编辑者**: 可以编辑和创建内容
- **查看者**: 只能查看内容
- **访客**: 受限访问

### 3. 页面权限

每个页面都可以单独设置访问权限:

1. 编辑页面
2. 点击右侧 "页面权限"
3. 设置谁可以查看/编辑

## 🎯 性能优化 (适配中等性能机器)

已配置的优化项:

### Docker 资源限制

编辑 `docker-compose.yml`:

```yaml
wiki:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

### 数据库优化

- 使用 PostgreSQL 15 Alpine (轻量级)
- 配置健康检查
- 数据持久化

### 缓存配置

- Redis 缓存已启用
- 页面缓存时间: 600 秒
- 响应压缩: 启用

### 建议硬件配置

| 配置项 | 最低配置 | 推荐配置 |
|--------|---------|---------|
| CPU | 1 核 | 2 核 |
| 内存 | 2GB | 4GB |
| 存储 | 10GB | 20GB+ |

## 🔒 安全配置

### 1. 修改默认密码

修改 `docker-compose.yml` 中的数据库密码:

```yaml
environment:
  POSTGRES_USER: your-username
  POSTGRES_PASSWORD: your-secure-password
  POSTGRES_DB: wiki
```

### 2. 启用 HTTPS (可选)

使用 Nginx 反向代理:

```bash
# 启动包含 Nginx 的完整服务
docker-compose --profile with-nginx up -d
```

配置 SSL 证书:

```bash
# 将 SSL 证书放置到 nginx/ssl 目录
mkdir -p nginx/ssl
cp /path/to/cert.crt nginx/ssl/
cp /path/to/cert.key nginx/ssl/
```

### 3. 防火墙配置

```bash
# 只允许本地访问
docker-compose.yml 中的 ports 改为:
- "127.0.0.1:3001:3001"
```

## 📊 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f wiki

# 重启服务
docker-compose restart wiki

# 查看状态
docker-compose ps

# 更新 Wiki.js 到最新版本
docker-compose pull wiki
docker-compose up -d wiki

# 备份数据库
docker-compose exec db pg_dump -U wikijs wiki > backup.sql

# 恢复数据库
docker-compose exec -T db psql -U wikijs wiki < backup.sql

# 查看数据卷
docker volume ls | grep wikijs

# 清理数据 (危险操作)
docker-compose down -v
```

## 📁 目录结构

```
03-wikijs/
├── docker-compose.yml      # Docker Compose 配置
├── config.yml              # Wiki.js 配置文件
├── nginx/                  # Nginx 配置 (可选)
│   ├── nginx.conf
│   └── ssl/
├── backups/                # 备份目录
└── README.md              # 本文档
```

## 🔧 故障排查

### 端口冲突

如果 3000 端口已被占用,修改 `docker-compose.yml`:

```yaml
ports:
  - "3002:3001"  # 将主机端口改为 3002
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose ps db

# 查看数据库日志
docker-compose logs db

# 测试数据库连接
docker-compose exec db psql -U wikijs -d wiki -c "SELECT 1"
```

### Git 同步失败

```bash
# 查看同步日志
docker-compose logs wiki | grep -i git

# 检查 token 是否有效
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/user
```

### 性能问题

```bash
# 查看资源使用
docker stats wikijs-app

# 检查缓存状态
docker-compose exec wiki redis-cli info

# 优化配置
# 编辑 config.yml,降低 maxConcurrentConnections
```

## 📚 进阶配置

### 1. 自定义主题

1. 下载主题
2. 放置到 `/wiki/data/themes`
3. 在管理界面启用

### 2. 插件安装

管理界面 > 系统 > 插件市场

推荐插件:
- MathJax - 数学公式支持
- Mermaid - 流程图
- Draw.io - 绘图工具
- PDF Export - PDF 导出

### 3. API 访问

Wiki.js 提供 RESTful API:

```bash
# 获取页面列表
curl http://localhost:3001/api/pages

# 创建页面
curl -X POST http://localhost:3001/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "path": "/test",
    "title": "测试页面",
    "content": "测试内容"
  }'
```

## 🌐 外部访问

### 内网穿透 (临时)

使用 Ngrok:

```bash
ngrok http 3000
```

### 域名配置

1. 购买域名并解析到服务器 IP
2. 配置 Nginx 反向代理 (见 HTTPS 配置)
3. 设置 DNS 记录

### 端口映射

如果服务器有公网 IP:

```bash
# 确保防火墙开放 3000 端口
sudo ufw allow 3000

# 或使用 Cloudflare Tunnel 实现安全访问
```

## 💡 最佳实践

1. **定期备份**
   ```bash
   # 每周备份一次
   0 2 * * 0 cd /path/to/03-wikijs && docker-compose exec db pg_dump -U wikijs wiki > backups/wiki-$(date +\%Y\%m\%d).sql
   ```

2. **监控资源使用**
   - 设置告警
   - 定期检查日志

3. **定期更新**
   ```bash
   # 每月检查更新
   docker-compose pull
   docker-compose up -d
   ```

4. **Git 提交规范**
   - 使用有意义的提交信息
   - 定期审查历史记录

5. **权限管理**
   - 最小权限原则
   - 定期审核用户列表

## 📖 参考资料

- [Wiki.js 官方文档](https://docs.requarks.io/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

## 🆘 获取帮助

如遇到问题,请查看:
1. Wiki.js 官方文档
2. GitHub Issues
3. 社区论坛

## 📝 版本历史

- v1.0.0 - 初始版本,支持基础部署和 Git 同步
