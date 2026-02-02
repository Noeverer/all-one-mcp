#!/bin/bash

# Wiki.js 启动脚本
# 用于简化部署和管理

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装,请先安装 Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装,请先安装 Docker Compose"
        exit 1
    fi

    print_success "依赖检查通过"
}

# 检查端口占用
check_ports() {
    print_info "检查端口占用..."

    if netstat -tuln 2>/dev/null | grep -q ":3001 "; then
        print_warning "端口 3001 已被占用,请修改 docker-compose.yml 中的端口映射"
    fi

    print_success "端口检查完成"
}

# 创建必要的目录
create_directories() {
    print_info "创建必要的目录..."

    mkdir -p backups
    mkdir -p nginx/ssl

    print_success "目录创建完成"
}

# 生成随机密码
generate_password() {
    openssl rand -base64 16 | tr -d "=+/" | cut -c1-16
}

# 初始化配置
init_config() {
    print_info "初始化配置..."

    if [ ! -f ".env" ]; then
        print_info "创建 .env 文件..."

        # 生成随机密码
        DB_PASSWORD=$(generate_password)
        REDIS_PASSWORD=$(generate_password)

        cat > .env << EOF
# 数据库配置
POSTGRES_USER=wikijs
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=wiki

# Redis 配置
REDIS_PASSWORD=${REDIS_PASSWORD}

# Wiki.js 配置
WIKI_ADMIN_EMAIL=admin@example.com
WIKI_ADMIN_PASSWORD=$(generate_password)
WIKI_SITE_NAME=我的笔记
WIKI_SITE_LANG=zh-CN

# Git 配置 (可选)
GIT_REPO_URL=
GIT_BRANCH=main
GIT_USERNAME=
GIT_EMAIL=
GIT_TOKEN=
EOF

        print_success ".env 文件已创建"
        print_warning "请记得保存默认密码:"
        print_warning "数据库密码: ${DB_PASSWORD}"
        print_warning "管理员密码: $(grep WIKI_ADMIN_PASSWORD .env | cut -d= -f2)"
    else
        print_info ".env 文件已存在,跳过创建"
    fi
}

# 启动服务
start_services() {
    print_info "启动 Wiki.js 服务..."

    # 检查是否已启动
    if docker-compose ps | grep -q "wikijs-app.*Up"; then
        print_warning "服务已在运行中"
        return
    fi

    docker-compose up -d

    print_success "服务启动成功"
}

# 等待服务就绪
wait_for_services() {
    print_info "等待服务就绪..."

    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T wiki curl -sf http://localhost:3001/health &> /dev/null; then
            print_success "Wiki.js 已就绪"
            return
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    echo
    print_error "服务启动超时,请检查日志"
    docker-compose logs wiki
    exit 1
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "=========================================="
    print_success "Wiki.js 部署完成!"
    echo "=========================================="
    echo ""
    echo "访问地址:"
    echo "  本地: http://localhost:3001"
    echo ""
    echo "管理后台:"
    echo "  首次访问需要进行初始化配置"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker-compose logs -f wiki"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
    echo ""
    echo "更多信息请查看: README.md"
    echo "=========================================="
}

# 备份数据
backup_data() {
    print_info "开始备份数据..."

    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # 备份数据库
    print_info "备份数据库..."
    if docker-compose exec -T db pg_dump -U wikijs wiki > "$BACKUP_DIR/wiki.sql" 2>/dev/null; then
        print_success "数据库备份完成"
    else
        print_warning "数据库备份失败,但继续备份其他数据"
    fi

    # 备份文件 (忽略权限问题)
    print_info "备份文件..."
    if docker run --rm -v wikijs-data:/data -v "$(pwd)/$BACKUP_DIR:/backup" \
        alpine sh -c "cd /data && tar czf /backup/data.tar.gz --ignore-failed-read . 2>/dev/null || true"; then
        print_success "文件备份完成"
    else
        print_warning "文件备份失败"
    fi

    # 备份 repo 数据
    print_info "备份 Git 仓库..."
    if docker run --rm -v wikijs-repo:/data -v "$(pwd)/$BACKUP_DIR:/backup" \
        alpine sh -c "cd /data && tar czf /backup/repo.tar.gz --ignore-failed-read . 2>/dev/null || true"; then
        print_success "Git 仓库备份完成"
    else
        print_warning "Git 仓库备份失败 (可能为空)"
    fi

    print_success "备份完成: $BACKUP_DIR"
}

# 恢复数据
restore_data() {
    if [ -z "$1" ]; then
        print_error "请指定备份目录"
        exit 1
    fi

    BACKUP_DIR="$1"

    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "备份目录不存在: $BACKUP_DIR"
        exit 1
    fi

    print_warning "这将覆盖现有数据,是否继续? (y/N)"
    read -r response

    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_info "操作已取消"
        exit 0
    fi

    # 恢复数据库
    if [ -f "$BACKUP_DIR/wiki.sql" ]; then
        print_info "恢复数据库..."
        if docker-compose exec -T db psql -U wikijs wiki < "$BACKUP_DIR/wiki.sql" 2>/dev/null; then
            print_success "数据库恢复完成"
        else
            print_error "数据库恢复失败"
        fi
    else
        print_warning "未找到数据库备份文件"
    fi

    # 恢复文件
    if [ -f "$BACKUP_DIR/data.tar.gz" ]; then
        print_info "恢复文件..."
        if docker run --rm -v wikijs-data:/data -v "$(pwd)/$BACKUP_DIR:/backup" \
            alpine sh -c "cd /data && tar xzf /backup/data.tar.gz 2>/dev/null"; then
            print_success "文件恢复完成"
        else
            print_error "文件恢复失败"
        fi
    else
        print_warning "未找到文件备份"
    fi

    # 恢复 Git 仓库
    if [ -f "$BACKUP_DIR/repo.tar.gz" ]; then
        print_info "恢复 Git 仓库..."
        if docker run --rm -v wikijs-repo:/data -v "$(pwd)/$BACKUP_DIR:/backup" \
            alpine sh -c "cd /data && tar xzf /backup/repo.tar.gz 2>/dev/null"; then
            print_success "Git 仓库恢复完成"
        else
            print_error "Git 仓库恢复失败"
        fi
    else
        print_warning "未找到 Git 仓库备份"
    fi

    print_success "数据恢复完成,建议重启服务"
    echo ""
    echo "运行以下命令重启服务:"
    echo "  docker-compose restart wiki"
}

# 更新 Wiki.js
update_wiki() {
    print_info "更新 Wiki.js..."

    print_info "拉取最新镜像..."
    docker-compose pull wiki

    print_info "重启服务..."
    docker-compose up -d wiki

    wait_for_services

    print_success "Wiki.js 已更新到最新版本"
}

# 清理资源
cleanup() {
    print_warning "这将删除所有数据,是否继续? (y/N)"
    read -r response

    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_info "操作已取消"
        exit 0
    fi

    print_info "停止并删除所有容器..."
    docker-compose down -v

    print_info "删除备份目录..."
    rm -rf backups/*

    print_success "清理完成"
}

# 查看备份内容
list_backup() {
    if [ -z "$1" ]; then
        # 列出所有备份目录
        print_info "可用的备份:"
        echo ""

        if [ ! -d "backups" ] || [ -z "$(ls -A backups 2>/dev/null)" ]; then
            print_warning "没有找到备份"
            return
        fi

        for dir in backups/*/; do
            if [ -d "$dir" ]; then
                BACKUP_NAME=$(basename "$dir")
                BACKUP_TIME=$(stat -c %y "$dir" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
                BACKUP_SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1)

                echo "  📦 $BACKUP_NAME"
                echo "     时间: $BACKUP_TIME"
                echo "     大小: $BACKUP_SIZE"

                # 显示包含的文件
                if [ -f "$dir/wiki.sql" ]; then
                    echo "     ✓ 数据库备份"
                fi
                if [ -f "$dir/data.tar.gz" ]; then
                    DATA_FILES=$(docker run --rm -v "$(pwd)/$dir:/backup" alpine tar tzf /backup/data.tar.gz 2>/dev/null | wc -l)
                    echo "     ✓ 文件备份 ($DATA_FILES 个文件)"
                fi
                if [ -f "$dir/repo.tar.gz" ]; then
                    REPO_FILES=$(docker run --rm -v "$(pwd)/$dir:/backup" alpine tar tzf /backup/repo.tar.gz 2>/dev/null | wc -l)
                    echo "     ✓ Git 仓库备份 ($REPO_FILES 个文件)"
                fi
                echo ""
            fi
        done
    else
        # 查看指定备份的详细内容
        BACKUP_DIR="$1"

        if [ ! -d "$BACKUP_DIR" ]; then
            print_error "备份目录不存在: $BACKUP_DIR"
            return
        fi

        print_info "备份内容: $BACKUP_DIR"
        echo ""

        # 数据库
        if [ -f "$BACKUP_DIR/wiki.sql" ]; then
            DB_SIZE=$(du -h "$BACKUP_DIR/wiki.sql" | cut -f1)
            echo "📊 数据库 (wiki.sql)"
            echo "   大小: $DB_SIZE"
            echo "   行数: $(wc -l < "$BACKUP_DIR/wiki.sql")"
            echo ""
        fi

        # 文件
        if [ -f "$BACKUP_DIR/data.tar.gz" ]; then
            DATA_SIZE=$(du -h "$BACKUP_DIR/data.tar.gz" | cut -f1)
            echo "📁 文件数据 (data.tar.gz)"
            echo "   大小: $DATA_SIZE"
            echo "   内容:"
            docker run --rm -v "$(pwd)/$BACKUP_DIR:/backup" alpine tar tvf /backup/data.tar.gz 2>/dev/null | head -20
            TOTAL_FILES=$(docker run --rm -v "$(pwd)/$BACKUP_DIR:/backup" alpine tar tzf /backup/data.tar.gz 2>/dev/null | wc -l)
            if [ "$TOTAL_FILES" -gt 20 ]; then
                echo "   ... 还有 $((TOTAL_FILES - 20)) 个文件"
            fi
            echo ""
        fi

        # Git 仓库
        if [ -f "$BACKUP_DIR/repo.tar.gz" ]; then
            REPO_SIZE=$(du -h "$BACKUP_DIR/repo.tar.gz" | cut -f1)
            echo "📂 Git 仓库 (repo.tar.gz)"
            echo "   大小: $REPO_SIZE"
            echo "   内容:"
            docker run --rm -v "$(pwd)/$BACKUP_DIR:/backup" alpine tar tvf /backup/repo.tar.gz 2>/dev/null | head -20
            TOTAL_REPO=$(docker run --rm -v "$(pwd)/$BACKUP_DIR:/backup" alpine tar tzf /backup/repo.tar.gz 2>/dev/null | wc -l)
            if [ "$TOTAL_REPO" -gt 20 ]; then
                echo "   ... 还有 $((TOTAL_REPO - 20)) 个文件"
            fi
            echo ""
        fi
    fi
}

# 显示帮助
show_help() {
    echo "Wiki.js 部署和管理脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start     启动服务 (默认)"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  status    查看状态"
    echo "  logs      查看日志"
    echo "  backup    备份数据"
    echo "  restore   恢复数据 (需指定备份目录)"
    echo "  list      查看备份列表"
    echo "  list [备份目录]  查看指定备份的详细内容"
    echo "  update    更新 Wiki.js"
    echo "  cleanup   清理所有数据"
    echo "  help      显示此帮助"
    echo ""
    echo "示例:"
    echo "  $0 start"
    echo "  $0 backup"
    echo "  $0 list              # 查看所有备份"
    echo "  $0 list backups/20250116_120000  # 查看指定备份内容"
    echo "  $0 restore backups/20250116_120000"
}

# 主函数
main() {
    case "${1:-start}" in
        start)
            check_dependencies
            check_ports
            create_directories
            init_config
            start_services
            wait_for_services
            show_access_info
            ;;
        stop)
            print_info "停止服务..."
            docker-compose down
            print_success "服务已停止"
            ;;
        restart)
            print_info "重启服务..."
            docker-compose restart
            wait_for_services
            print_success "服务已重启"
            ;;
        status)
            docker-compose ps
            ;;
        logs)
            docker-compose logs -f wiki
            ;;
        backup)
            backup_data
            ;;
        restore)
            restore_data "$2"
            ;;
        update)
            update_wiki
            ;;
        cleanup)
            cleanup
            ;;
        list|--list)
            list_backup "$2"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
