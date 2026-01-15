@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 个性化大模型助手用户中心系统 - 一键启动脚本
REM 适用于 Windows 系统

echo ==========================================
echo   个性化大模型助手用户中心系统
echo   一键启动脚本
echo ==========================================
echo.

REM 检查 Python 3 是否可用
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ 检测到 Python 3
    echo 正在启动 HTTP 服务器 (端口 8000)...
    echo.
    echo 访问地址: http://localhost:8000/login.html
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    python3 -m http.server 8000
    goto :end
)

REM 检查 Python 是否可用
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ 检测到 Python
    echo 正在启动 HTTP 服务器 (端口 8000)...
    echo.
    echo 访问地址: http://localhost:8000/login.html
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto :end
)

REM 检查 Node.js 是否可用
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ 检测到 Node.js
    echo 正在检查 http-server...
    
    npx --version >nul 2>&1
    if %errorlevel% == 0 (
        echo 正在启动 HTTP 服务器 (端口 8000)...
        echo.
        echo 访问地址: http://localhost:8000/login.html
        echo.
        echo 按 Ctrl+C 停止服务器
        echo.
        npx http-server -p 8000
        goto :end
    ) else (
        echo ✗ npx 未安装
        echo 请运行: npm install -g http-server
        pause
        exit /b 1
    )
)

REM 检查 PHP 是否可用
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ 检测到 PHP
    echo 正在启动 HTTP 服务器 (端口 8000)...
    echo.
    echo 访问地址: http://localhost:8000/login.html
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    php -S localhost:8000
    goto :end
)

REM 都不可用
echo ✗ 错误: 未找到可用的 HTTP 服务器
echo.
echo 请安装以下任一工具:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo   - PHP: https://www.php.net/downloads
echo.
echo 安装后, 您可以:
echo   1. 使用 Python: python -m http.server 8000
echo   2. 使用 Node.js: npx http-server -p 8000
echo   3. 使用 PHP: php -S localhost:8000
echo   4. 或直接在浏览器中打开 login.html 文件
echo.
pause
exit /b 1

:end
endlocal
