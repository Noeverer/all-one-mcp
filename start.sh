#!/bin/bash

# 个性化大模型助手用户中心系统 - 一键启动脚本
# 适用于 Linux/Mac 系统

echo "=========================================="
echo "  个性化大模型助手用户中心系统"
echo "  一键启动脚本"
echo "=========================================="
echo ""

# 检查 Python 3 是否可用
if command -v python3 &> /dev/null; then
    echo "✓ 检测到 Python 3"
    echo "正在启动 HTTP 服务器 (端口 8000)..."
    echo ""
    echo "访问地址: http://localhost:8000/login.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
    exit 0
fi

# 检查 Python 2 是否可用
if command -v python &> /dev/null; then
    echo "✓ 检测到 Python 2"
    echo "正在启动 HTTP 服务器 (端口 8000)..."
    echo ""
    echo "访问地址: http://localhost:8000/login.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python -m SimpleHTTPServer 8000
    exit 0
fi

# 检查 Node.js 是否可用
if command -v node &> /dev/null; then
    echo "✓ 检测到 Node.js"
    echo "正在检查 http-server..."
    
    if command -v npx &> /dev/null; then
        echo "正在启动 HTTP 服务器 (端口 8000)..."
        echo ""
        echo "访问地址: http://localhost:8000/login.html"
        echo ""
        echo "按 Ctrl+C 停止服务器"
        echo ""
        npx http-server -p 8000
        exit 0
    else
        echo "✗ npx 未安装"
        echo "请运行: npm install -g http-server"
        exit 1
    fi
fi

# 检查 PHP 是否可用
if command -v php &> /dev/null; then
    echo "✓ 检测到 PHP"
    echo "正在启动 HTTP 服务器 (端口 8000)..."
    echo ""
    echo "访问地址: http://localhost:8000/login.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    php -S localhost:8000
    exit 0
fi

# 都不可用
echo "✗ 错误: 未找到可用的 HTTP 服务器"
echo ""
echo "请安装以下任一工具:"
echo "  - Python 3: https://www.python.org/downloads/"
echo "  - Python 2: https://www.python.org/downloads/"
echo "  - Node.js: https://nodejs.org/"
echo "  - PHP: https://www.php.net/downloads"
echo ""
echo "安装后，您可以:"
echo "  1. 使用 Python: python3 -m http.server 8000"
echo "  2. 使用 Node.js: npx http-server -p 8000"
echo "  3. 使用 PHP: php -S localhost:8000"
echo "  4. 或直接在浏览器中打开 login.html 文件"
exit 1
