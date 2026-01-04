FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装 serve 包用于静态文件服务
RUN npm install -g serve

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["serve", "-s", ".", "-l", "3000"]