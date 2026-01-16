#!/bin/bash
# Docker 容器迁移脚本 - 用于内网迁移（并发版）
# 使用方法: bash migrate-docker.sh

set -e

# 配置
BACKUP_DIR="/tmp/docker_migration_backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
IMAGES_DIR="$BACKUP_DIR/images_$TIMESTAMP"
CONTAINERS_DIR="$BACKUP_DIR/containers_config_$TIMESTAMP"
VOLUMES_DIR="$BACKUP_DIR/volumes_$TIMESTAMP"
MAX_PARALLEL=8  # 最大并发数，可根据机器性能调整

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Docker 容器迁移准备工具${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 创建备份目录
echo -e "${YELLOW}[1/5] 创建备份目录...${NC}"
mkdir -p "$IMAGES_DIR"
mkdir -p "$CONTAINERS_DIR"
mkdir -p "$VOLUMES_DIR"
echo -e "${GREEN}✓ 备份目录已创建: $BACKUP_DIR${NC}"
echo ""

# 1. 导出所有镜像（并发）
echo -e "${YELLOW}[2/5] 导出 Docker 镜像 (并发)...${NC}"
export IMAGES_DIR
IMAGE_LIST="/tmp/image_list_${TIMESTAMP}.txt"

docker images --format "{{.Repository}}:{{.Tag}}" | grep -v "<none>" | while read -r image; do
    if [ -n "$image" ]; then
        safe_name=$(echo "$image" | sed 's/[\/:]/_/g' | sed 's/^_//')
        echo "  $image -> ${safe_name}.tar"
        echo "$safe_name|$image" >> "$IMAGE_LIST"
    fi
done

# 使用 xargs 并发导出
if [ -f "$IMAGE_LIST" ]; then
    export IMAGES_DIR
    cat "$IMAGE_LIST" | xargs -P $MAX_PARALLEL bash -c '
        safe_name=$(echo "$1" | cut -d"|" -f1)
        image=$(echo "$1" | cut -d"|" -f2)
        echo "    开始导出: $image"
        if docker save "$image" -o "$IMAGES_DIR/${safe_name}.tar" 2>/dev/null; then
            echo "    ✓ 完成: $safe_name.tar"
        else
            echo "    ✗ 失败: $safe_name.tar" >&2
        fi
    ' _
    rm "$IMAGE_LIST"
fi
echo ""

# 2. 导出容器配置（重新创建命令）
echo -e "${YELLOW}[3/5] 导出容器配置...${NC}"
docker ps -a --format "{{.Names}}" | while read -r container; do
    if [ -n "$container" ]; then
        echo "  导出配置: $container"

        # 获取容器详细信息
        docker inspect "$container" -f '{
            "Name": "{{.Name}}",
            "Image": "{{.Config.Image}}",
            "Cmd": {{json .Config.Cmd}},
            "Env": {{json .Config.Env}},
            "WorkingDir": "{{.Config.WorkingDir}}",
            "ExposedPorts": {{json .Config.ExposedPorts}},
            "HostConfig": {
                "Binds": {{json .HostConfig.Binds}},
                "PortBindings": {{json .HostConfig.PortBindings}},
                "RestartPolicy": {{json .HostConfig.RestartPolicy}},
                "NetworkMode": "{{.HostConfig.NetworkMode}}",
                "Privileged": {{.HostConfig.Privileged}}
            },
            "NetworkSettings": {
                "Networks": {{json .NetworkSettings.Networks}}
            }
        }' > "$CONTAINERS_DIR/${container}.json"

        # 生成 docker run 命令（简化版）
        image=$(docker inspect "$container" -f '{{.Config.Image}}')

        # 更安全的端口映射提取
        ports=$(docker inspect "$container" --format='{{range $p, $conf := .NetworkSettings.Ports}}{{if and $conf (index $conf 0) (index $conf 0).HostPort}}-p {{(index $conf 0).HostPort}}:{{$p}} {{end}}{{end}}')

        volumes=$(docker inspect "$container" -f '{{range $mount := .Mounts}}{{if eq $mount.Type "volume"}}-v {{$mount.Name}}:{{$mount.Destination}} {{end}}{{if eq $mount.Type "bind"}}-v {{$mount.Source}}:{{$mount.Destination}} {{end}}{{end}}')
        env=$(docker inspect "$container" -f '{{range .Config.Env}}-e {{.}} {{end}}')
        name="--name $container"
        restart=$(docker inspect "$container" -f '{{.HostConfig.RestartPolicy.Name}}')

        cat > "$CONTAINERS_DIR/${container}_recreate.sh" <<EOF
#!/bin/bash
# 重新创建容器: $container
docker run -d \\
  $name \\
  --restart $restart \\
  $ports \\
  $volumes \\
  $env \\
  $image
EOF

        chmod +x "$CONTAINERS_DIR/${container}_recreate.sh"

        echo -e "${GREEN}    ✓ 配置导出成功${NC}"
    fi
done
echo ""

# 3. 导出数据卷（并发）
echo -e "${YELLOW}[4/5] 导出数据卷 (并发)...${NC}"
export VOLUMES_DIR TIMESTAMP
VOLUME_LIST="/tmp/volume_list_${TIMESTAMP}.txt"

# 收集所有卷
docker ps -a --format "{{.Names}}" | while read -r container; do
    if [ -n "$container" ]; then
        # 使用 docker inspect 获取挂载的卷信息，通过 json 提取
        docker inspect "$container" --format='{{json .Mounts}}' | jq -r '.[] | select(.Type=="volume") | "\(.Name)"' 2>/dev/null | while read -r volume_name; do
            if [ -n "$volume_name" ] && [ "$volume_name" != "" ] && [ "$volume_name" != "null" ]; then
                # 记录卷信息（非并发）
                docker inspect "$volume_name" > "$VOLUMES_DIR/${volume_name}_info.json" 2>/dev/null
                # 添加到列表去重
                echo "$volume_name" >> "$VOLUME_LIST"
            fi
        done
    fi
done

# 去重并并发导出
if [ -f "$VOLUME_LIST" ]; then
    export VOLUMES_DIR TIMESTAMP
    sort "$VOLUME_LIST" | uniq | xargs -P $MAX_PARALLEL bash -c '
        volume_name="$1"
        echo "    开始导出卷: $volume_name"
        if docker run --rm \
            -v "$volume_name:/volume_data" \
            -v "$VOLUMES_DIR:/backup" \
            alpine \
            tar czf "/backup/${volume_name}_${TIMESTAMP}.tar.gz" -C /volume_data . 2>/dev/null; then
            echo "    ✓ 完成: ${volume_name}_${TIMESTAMP}.tar.gz"
        else
            echo "    ✗ 失败: $volume_name" >&2
        fi
    ' _
    rm "$VOLUME_LIST"
fi
echo ""

# 4. 创建恢复脚本
echo -e "${YELLOW}[5/5] 创建恢复脚本...${NC}"
cat > "$BACKUP_DIR/restore.sh" <<'EOF'
#!/bin/bash
# Docker 容器恢复脚本
# 使用方法: bash restore.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Docker 容器恢复工具${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 导入镜像（并发）
echo -e "${YELLOW}[1/3] 导入 Docker 镜像 (并发)...${NC}"
find ./images_* -name "*.tar" 2>/dev/null | xargs -P $MAX_PARALLEL bash -c '
    echo "  导入: $1"
    if docker load -i "$1" 2>/dev/null; then
        echo "    ✓ 导入成功: $1"
    else
        echo "    ✗ 导入失败: $1" >&2
    fi
' _
echo ""

# 恢复数据卷（并发）
echo -e "${YELLOW}[2/3] 恢复数据卷 (并发)...${NC}"
find ./volumes_* -name "*_info.json" 2>/dev/null | xargs -P $MAX_PARALLEL bash -c '
    info_file="$1"
    volume_name=$(basename "$info_file" "_info.json")
    echo "  创建卷: $volume_name"
    docker volume create "$volume_name" 2>/dev/null || true
    backup_file=$(dirname "$info_file")/${volume_name}_*.tar.gz
    if [ -f "$backup_file" ]; then
        echo "    恢复数据: $backup_file"
        if docker run --rm \
            -v "$volume_name:/volume_data" \
            -v "$(dirname "$info_file"):/backup" \
            alpine \
            sh -c "cd /volume_data && tar xzf /backup/$(basename "$backup_file")" 2>/dev/null; then
            echo "    ✓ 卷恢复成功: $volume_name"
        else
            echo "    ✗ 卷恢复失败: $volume_name" >&2
        fi
    else
        echo "    ⚠ 未找到备份文件: $volume_name" >&2
    fi
' _
echo ""

# 重新创建容器
echo -e "${YELLOW}[3/3] 重新创建容器...${NC}"
find ./containers_config_* -name "*_recreate.sh" | sort | while read -r recreate_script; do
    if [ -f "$recreate_script" ]; then
        echo "  执行: $recreate_script"
        bash "$recreate_script"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}    ✓ 容器创建成功${NC}"
        else
            echo -e "${RED}    ✗ 容器创建失败${NC}"
        fi
    fi
done
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}恢复完成！${NC}"
echo -e "${GREEN}========================================${NC}"
EOF

chmod +x "$BACKUP_DIR/restore.sh"
echo -e "${GREEN}✓ 恢复脚本已创建${NC}"
echo ""

# 5. 创建 README
cat > "$BACKUP_DIR/README.md" <<'EOF'
# Docker 容器迁移备份

此目录包含 Docker 容器、镜像和数据卷的完整备份，用于迁移到内网环境。

## 目录结构

- `images_*`: Docker 镜像文件（.tar 格式）
- `containers_config_*`: 容器配置信息和重新创建脚本
- `volumes_*`: 数据卷备份数据（.tar.gz 格式）
- `restore.sh`: 一键恢复脚本

## 迁移步骤

### 1. 将此目录传输到目标服务器

```bash
# 打包整个备份目录
tar czf docker_migration_backup.tar.gz docker_migration_backup/

# 传输到目标服务器
scp docker_migration_backup.tar.gz user@target-server:/path/to/destination/

# 在目标服务器上解压
tar xzf docker_migration_backup.tar.gz
```

### 2. 在目标服务器上恢复

```bash
cd docker_migration_backup
bash restore.sh
```

### 3. 验证服务状态

```bash
# 检查容器状态
docker ps

# 检查卷状态
docker volume ls

# 检查网络状态
docker network ls
```

## 注意事项

1. **Docker 版本**: 确保目标服务器上的 Docker 版本与源服务器兼容（当前版本: 28.5.1-1）
2. **端口占用**: 确保目标服务器上的相应端口未被占用
3. **网络配置**: 如果需要跨主机通信，需要额外配置网络
4. **权限**: 执行恢复脚本需要 Docker 用户组权限或 sudo 权限
5. **存储空间**: 确保目标服务器有足够的存储空间

## 当前容器列表

EOF

# 添加当前容器信息
docker ps -a >> "$BACKUP_DIR/README.md"

echo -e "${GREEN}✓ README 已创建${NC}"
echo ""

# 打包备份目录
echo -e "${YELLOW}[额外] 打包备份目录...${NC}"
tar czf "/tmp/docker_migration_backup_${TIMESTAMP}.tar.gz" -C /tmp docker_migration_backup/
echo -e "${GREEN}✓ 已打包: /tmp/docker_migration_backup_${TIMESTAMP}.tar.gz${NC}"
echo ""

# 显示备份统计
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}备份完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "备份目录: $BACKUP_DIR"
echo "打包文件: /tmp/docker_migration_backup_${TIMESTAMP}.tar.gz"
echo ""
echo "镜像数量: $(ls -1 $IMAGES_DIR/*.tar 2>/dev/null | wc -l)"
echo "容器数量: $(ls -1 $CONTAINERS_DIR/*_recreate.sh 2>/dev/null | wc -l)"
echo "数据卷数量: $(ls -1 $VOLUMES_DIR/*_info.json 2>/dev/null | wc -l)"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo "1. 下载打包文件: /tmp/docker_migration_backup_${TIMESTAMP}.tar.gz"
echo "2. 将 tar.gz 文件传输到目标服务器"
echo "3. 在目标服务器上解压并执行 restore.sh"
echo ""
