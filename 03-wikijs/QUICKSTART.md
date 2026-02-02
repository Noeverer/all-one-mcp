# Wiki.js 快速部署指南

## 🚀 一键启动

```bash
cd 03-wikijs
./start.sh
```

初始化完成后,访问 http://localhost:3001

## ⚙️ 配置 Git 同步

### GitHub 同步

1. 创建 Personal Access Token:
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择 `repo` 权限
   - 复制生成的 token

2. 在 Wiki.js 管理后台配置:
   - 登录管理后台
   - 系统 > Git 存储配置
   - 填写:
     - 远程仓库 URL: `https://github.com/your-username/your-repo.git`
     - 分支: `main`
     - 认证方式: Personal Access Token
     - 用户名: your-username
     - Token: 刚创建的 token
   - 勾选"自动拉取"和"自动推送"
   - 设置同步间隔(建议 30 分钟)

### GitLab 同步

1. 创建 Personal Access Token:
   - 访问 https://gitlab.com/-/profile/personal_access_tokens
   - 创建新 token
   - 选择 `read_repository` 和 `write_repository`
   - 复制生成的 token

2. 配置步骤同 GitHub

## 📋 常用命令

```bash
# 启动服务
./start.sh start

# 查看日志
./start.sh logs

# 备份数据
./start.sh backup

# 恢复数据
./start.sh restore backups/20250116_120000

# 更新 Wiki.js
./start.sh update

# 停止服务
./start.sh stop
```

## 👥 多人协作

1. 管理员登录后台
2. 用户 > 管理 > 创建用户
3. 设置用户权限(管理员/编辑者/查看者)
4. 用户登录后即可协作编辑

## 🔧 性能调优

当前配置已优化,适配中等性能机器:
- 最大并发连接: 20
- 页面缓存: 10 分钟
- 启用响应压缩

如需进一步优化,编辑 `config.yml`

## 📚 更多信息

完整文档请查看: [README.md](README.md)
