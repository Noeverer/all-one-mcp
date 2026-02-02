# Wiki.js 笔记系统部署说明

## 📦 已创建的文件

```
03-wikijs/
├── docker-compose.yml      # Docker Compose 配置
├── config.yml              # Wiki.js 配置文件
├── .env.example            # 环境变量示例
├── .gitignore              # Git 忽略配置
├── start.sh                # 一键启动脚本
├── README.md               # 完整部署文档
├── QUICKSTART.md           # 快速开始指南
└── nginx/
    └── nginx.conf          # Nginx 反向代理配置
```

## 🚀 快速部署

### 1. 基础启动

```bash
cd 03-wikijs
./start.sh
```

### 2. 访问配置

- 访问 http://localhost:3001
- 按照向导完成初始化:
  - 创建管理员账号
  - 配置站点信息
  - 选择存储类型(PostgreSQL)

## ⚙️ Git 自动同步配置

### GitHub 同步步骤

1. **创建 Personal Access Token**
   ```
   访问: https://github.com/settings/tokens
   权限: repo
   ```

2. **在 Wiki.js 管理后台配置**
   ```
   路径: 系统 > Git 存储配置
   URL: https://github.com/username/repo.git
   分支: main
   认证: Personal Access Token
   Token: [粘贴 token]
   勾选: 自动拉取、自动推送
   间隔: 30 分钟
   ```

### GitLab 同步步骤

1. **创建 Personal Access Token**
   ```
   访问: https://gitlab.com/-/profile/personal_access_tokens
   权限: read_repository, write_repository
   ```

2. **配置步骤同 GitHub**

## 👥 多人协作

1. 管理员登录
2. 用户 > 管理 > 创建用户
3. 设置权限级别:
   - 管理员: 完全控制
   - 编辑者: 创建和编辑
   - 查看者: 只读
4. 分享访问链接给团队成员

## ⚡ 性能优化

### 已配置的优化

- PostgreSQL 15 Alpine (轻量级数据库)
- Redis 缓存 (启用页面缓存)
- Gzip 压缩 (响应压缩)
- 健康检查 (自动故障恢复)
- 最大并发连接: 20

### 资源限制 (可选)

编辑 `docker-compose.yml`:

```yaml
wiki:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
```

## 🛠️ 常用命令

```bash
# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f wiki

# 重启服务
docker-compose restart wiki

# 备份数据
./start.sh backup

# 恢复数据
./start.sh restore backups/20250116_120000

# 更新版本
./start.sh update
```

## 🔒 安全配置

### 1. 修改默认密码

编辑 `docker-compose.yml`:

```yaml
db:
  environment:
    POSTGRES_PASSWORD: your-secure-password
```

### 2. 启用 HTTPS

```bash
# 启动带 Nginx 的服务
docker-compose --profile with-nginx up -d
```

### 3. 限制访问

```yaml
# 只允许本地访问
ports:
  - "127.0.0.1:3001:3001"
```

## 📁 数据持久化

数据存储在 Docker 卷中:

```bash
# 查看数据卷
docker volume ls | grep wikijs

# 备份数据卷
docker run --rm -v wikijs-data:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/data-backup.tar.gz -C /data .
```

## 🔍 故障排查

### 服务无法启动

```bash
# 查看日志
docker-compose logs

# 检查端口占用
netstat -tuln | grep 3001

# 检查磁盘空间
df -h
```

### Git 同步失败

```bash
# 检查 Git 日志
docker-compose logs wiki | grep git

# 测试 token
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/user
```

## 🌐 外部访问

### 使用 Cloudflare Tunnel (推荐)

```bash
# 安装 cloudflared
# 创建隧道并连接到 3001 端口
```

### 使用 Nginx 反向代理

已在配置中提供,参考 `nginx/nginx.conf`

## 📊 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 1 核 | 2 核 |
| 内存 | 2GB | 4GB |
| 存储 | 10GB | 20GB+ |

## 📖 详细文档

- [完整部署文档](./03-wikijs/README.md)
- [快速开始指南](./03-wikijs/QUICKSTART.md)

## 🆘 获取帮助

遇到问题时:
1. 查看日志: `docker-compose logs -f`
2. 阅读完整文档: `README.md`
3. 参考 Wiki.js 官方文档: https://docs.requarks.io/
