# 部署指南

## Docker 部署

### 前提条件
- 已安装 Docker
- 已安装 Docker Compose

### 构建和运行

1. 构建 Docker 镜像
```bash
docker build -t ai-assistant-frontend .
```

2. 使用 Docker Compose 运行
```bash
docker-compose up -d
```

3. 访问应用
- 打开浏览器访问 `http://localhost:3000`

### 单独使用 Docker 运行
```bash
docker run -d -p 3000:3000 ai-assistant-frontend
```

## 本地开发环境部署

### 前提条件
- 已安装 Node.js (v14 或更高版本)

### 安装和运行

1. 安装 serve 工具
```bash
npm install -g serve
```

2. 启动本地服务器
```bash
serve -s .
```

3. 访问应用
- 打开浏览器访问 `http://localhost:3000`

## 服务器部署

### 使用 Nginx 部署

将项目文件复制到 Nginx 的静态文件目录：

```bash
sudo cp -r /path/to/your/project/* /var/www/html/
```

配置 Nginx 虚拟主机：

```nginx
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

重启 Nginx：
```bash
sudo systemctl restart nginx
```

## 环境变量

项目支持以下环境变量（在生产环境中使用）：

- `NODE_ENV`: 环境模式 (production/development)
- `PORT`: 服务器端口 (默认: 3000)

## 构建说明

这是一个纯前端项目，无需构建步骤。所有文件都是静态资源，可以直接通过任何 HTTP 服务器提供服务。

## 注意事项

1. 由于这是一个前端项目，用户数据存储在浏览器的 localStorage 中，如果需要持久化数据，需要后端 API 支持。
2. 在生产环境中，建议使用 HTTPS 以确保数据安全。
3. 为了更好的性能，可以考虑使用 CDN 来托管静态资源。