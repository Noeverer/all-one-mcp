// 认证功能模块
class Auth {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupTabs();
    }

    bindEvents() {
        // 登录表单提交
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // 注册表单提交
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // 邮箱验证表单提交
        const emailForm = document.getElementById('email-form');
        if (emailForm) {
            emailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailLogin();
            });
        }

        // 发送验证码
        const sendVerificationBtn = document.getElementById('send-verification');
        if (sendVerificationBtn) {
            sendVerificationBtn.addEventListener('click', () => this.sendVerificationCode());
        }

        // 忘记密码链接
        const forgotPasswordLink = document.getElementById('forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPassword();
            });
        }
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        // 隐藏所有表单
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        // 移除所有按钮的active类
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 显示选中的表单
        document.getElementById(`${tabName}-form`).classList.add('active');
        
        // 激活选中的按钮
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // 验证输入
        if (!email || !password) {
            app.showMessage('请填写所有必填字段', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            app.showMessage('邮箱格式不正确', 'error');
            return;
        }

        // 模拟登录请求
        try {
            // 这里应该是实际的API调用
            // 模拟登录成功
            const user = {
                id: Date.now(),
                email: email,
                nickname: email.split('@')[0],
                avatar: 'assets/icons/user-avatar.png',
                joinDate: new Date().toISOString()
            };

            // 保存认证信息
            localStorage.setItem('authToken', 'mock-token-' + Date.now());
            localStorage.setItem('currentUser', JSON.stringify(user));

            app.showMessage('登录成功', 'success');
            
            // 延迟跳转以显示消息
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            app.showMessage('登录失败，请检查邮箱和密码', 'error');
        }
    }

    async handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // 验证输入
        if (!username || !email || !password || !confirmPassword) {
            app.showMessage('请填写所有必填字段', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            app.showMessage('邮箱格式不正确', 'error');
            return;
        }

        if (password !== confirmPassword) {
            app.showMessage('两次输入的密码不一致', 'error');
            return;
        }

        if (password.length < 6) {
            app.showMessage('密码长度至少为6位', 'error');
            return;
        }

        // 检查用户是否已存在
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            app.showMessage('该邮箱已被注册', 'error');
            return;
        }

        // 创建新用户
        const newUser = {
            id: Date.now(),
            email: email,
            username: username,
            password: password, // 实际应用中应该加密
            nickname: username,
            avatar: 'assets/icons/user-avatar.png',
            joinDate: new Date().toISOString()
        };

        // 保存用户
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // 自动登录
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        app.showMessage('注册成功', 'success');
        
        // 延迟跳转以显示消息
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    async handleEmailLogin() {
        const email = document.getElementById('email-login').value;
        const code = document.getElementById('verification-code').value;

        if (!email || !code) {
            app.showMessage('请填写邮箱和验证码', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            app.showMessage('邮箱格式不正确', 'error');
            return;
        }

        // 模拟邮箱验证登录
        try {
            // 这里应该是实际的API调用
            // 模拟登录成功
            const user = {
                id: Date.now(),
                email: email,
                nickname: email.split('@')[0],
                avatar: 'assets/icons/user-avatar.png',
                joinDate: new Date().toISOString()
            };

            // 保存认证信息
            localStorage.setItem('authToken', 'mock-token-' + Date.now());
            localStorage.setItem('currentUser', JSON.stringify(user));

            app.showMessage('登录成功', 'success');
            
            // 延迟跳转以显示消息
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            app.showMessage('验证码错误或已过期', 'error');
        }
    }

    async sendVerificationCode() {
        const email = document.getElementById('email-login').value;

        if (!email) {
            app.showMessage('请先填写邮箱', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            app.showMessage('邮箱格式不正确', 'error');
            return;
        }

        // 模拟发送验证码
        try {
            // 这里应该是实际的API调用
            // 模拟发送成功
            app.showMessage('验证码已发送，请查收邮件', 'success');

            // 模拟倒计时
            const btn = document.getElementById('send-verification');
            btn.disabled = true;
            let count = 60;
            const timer = setInterval(() => {
                btn.textContent = `${count}秒后重发`;
                count--;
                if (count < 0) {
                    clearInterval(timer);
                    btn.textContent = '发送验证码';
                    btn.disabled = false;
                }
            }, 1000);
        } catch (error) {
            app.showMessage('发送验证码失败', 'error');
        }
    }

    showForgotPassword() {
        // 创建忘记密码模态框
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>重置密码</h3>
                <form id="forgot-password-form">
                    <div class="input-group">
                        <label for="reset-email">邮箱</label>
                        <input type="email" id="reset-email" name="email" required>
                    </div>
                    <button type="submit" class="btn btn-primary">发送重置链接</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定关闭事件
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // 绑定表单提交事件
        modal.querySelector('#forgot-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordReset();
        });
    }

    async handlePasswordReset() {
        const email = document.getElementById('reset-email').value;

        if (!email) {
            app.showMessage('请填写邮箱', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            app.showMessage('邮箱格式不正确', 'error');
            return;
        }

        // 模拟密码重置
        try {
            // 这里应该是实际的API调用
            app.showMessage('重置链接已发送到您的邮箱', 'success');
            
            // 关闭模态框
            const modal = document.querySelector('.modal');
            if (modal) {
                document.body.removeChild(modal);
            }
        } catch (error) {
            app.showMessage('发送重置链接失败', 'error');
        }
    }
}

// 初始化认证模块
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
});