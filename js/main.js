// 主应用逻辑
class App {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
        this.loadUserData();
        this.applyTheme();
    }

    // 检查认证状态
    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // 如果未登录且不在登录页面，则跳转到登录页面
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        } else {
            // 验证token有效性
            const user = localStorage.getItem('currentUser');
            if (user) {
                this.currentUser = JSON.parse(user);
            } else {
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
            }
        }
    }

    // 绑定事件
    bindEvents() {
        // 主题切换
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // 退出登录
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // 导航链接激活状态
        this.updateActiveNav();
    }

    // 切换主题
    toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        localStorage.setItem('theme', newTheme);
        this.applyTheme();
    }

    // 应用主题
    applyTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }

    // 退出登录
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    // 更新导航激活状态
    updateActiveNav() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 加载用户数据
    loadUserData() {
        if (this.currentUser) {
            // 更新页面中的用户信息
            this.updateUserInfo();
        }
    }

    // 更新用户信息显示
    updateUserInfo() {
        const nameElement = document.getElementById('user-name');
        const emailElement = document.getElementById('user-email');
        
        if (nameElement && this.currentUser) {
            nameElement.textContent = this.currentUser.nickname || this.currentUser.email;
        }
        
        if (emailElement && this.currentUser) {
            emailElement.textContent = this.currentUser.email;
        }
    }

    // 显示消息提示
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // 添加样式
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            color: white;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        // 根据类型设置背景色
        switch(type) {
            case 'success':
                messageEl.style.backgroundColor = 'var(--success-color)';
                break;
            case 'error':
                messageEl.style.backgroundColor = 'var(--danger-color)';
                break;
            default:
                messageEl.style.backgroundColor = 'var(--primary-color)';
        }

        document.body.appendChild(messageEl);

        // 3秒后自动移除
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    // 获取当前用户数据
    getCurrentUser() {
        return this.currentUser;
    }

    // 更新用户数据
    updateUserData(userData) {
        this.currentUser = { ...this.currentUser, ...userData };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateUserInfo();
    }
}

// 工具函数
const Utils = {
    // 格式化日期
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 验证邮箱格式
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // 验证密码强度
    validatePassword(password) {
        // 至少8位，包含大小写字母、数字和特殊字符
        const strongPassword = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
        return strongPassword.test(password);
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);