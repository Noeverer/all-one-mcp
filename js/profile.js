// 个人中心页面逻辑
class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
        this.updateStats();
    }

    bindEvents() {
        // 更换头像按钮
        const changeAvatarBtn = document.getElementById('change-avatar');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => this.changeAvatar());
        }
    }

    loadUserData() {
        const user = app.getCurrentUser();
        if (user) {
            // 更新头像
            const avatarImg = document.getElementById('user-avatar');
            if (avatarImg) {
                avatarImg.src = user.avatar || 'assets/icons/user-avatar.png';
            }

            // 更新用户名和邮箱
            const nameElement = document.getElementById('user-name');
            const emailElement = document.getElementById('user-email');
            
            if (nameElement) {
                nameElement.textContent = user.nickname || user.email.split('@')[0];
            }
            
            if (emailElement) {
                emailElement.textContent = user.email;
            }
        }
    }

    updateStats() {
        // 从localStorage获取数据并更新统计信息
        const user = app.getCurrentUser();
        if (!user) return;

        // 获取知识条目数量
        const knowledgeKey = `knowledge_${user.id}`;
        const knowledge = JSON.parse(localStorage.getItem(knowledgeKey) || '[]');
        const knowledgeCount = document.getElementById('knowledge-count');
        if (knowledgeCount) {
            knowledgeCount.textContent = knowledge.length;
        }

        // 获取工具数量
        const toolsKey = `tools_${user.id}`;
        const tools = JSON.parse(localStorage.getItem(toolsKey) || '[]');
        const toolsCount = document.getElementById('tools-count');
        if (toolsCount) {
            toolsCount.textContent = tools.length;
        }

        // 获取文件数量
        const filesKey = `files_${user.id}`;
        const files = JSON.parse(localStorage.getItem(filesKey) || '[]');
        const filesCount = document.getElementById('files-count');
        if (filesCount) {
            filesCount.textContent = files.length;
        }
    }

    changeAvatar() {
        // 创建文件输入框来选择新头像
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const avatarImg = document.getElementById('user-avatar');
                    if (avatarImg) {
                        avatarImg.src = e.target.result;
                        
                        // 更新用户数据中的头像
                        const user = app.getCurrentUser();
                        if (user) {
                            user.avatar = e.target.result;
                            app.updateUserData(user);
                            app.showMessage('头像已更新', 'success');
                        }
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }
}

// 初始化个人中心页面
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});