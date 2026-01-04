// 个人信息管理模块
class UserInfoManager {
    constructor() {
        this.files = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadFiles();
        this.bindEvents();
        this.renderFileList();
    }

    bindEvents() {
        // 保存个人信息
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // 文件上传相关事件
        const fileInput = document.getElementById('file-input');
        const browseBtn = document.getElementById('browse-files');
        const uploadArea = document.getElementById('file-upload-area');

        if (fileInput && browseBtn && uploadArea) {
            browseBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary-color)';
                uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.backgroundColor = '';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.backgroundColor = '';
                this.handleFileSelect(e.dataTransfer.files);
            });
        }

        // 模态框事件
        this.bindModalEvents();

        // 文件操作事件（使用事件委托）
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preview-btn')) {
                const id = e.target.closest('.file-item').dataset.id;
                this.previewFile(id);
            } else if (e.target.classList.contains('download-btn')) {
                const id = e.target.closest('.file-item').dataset.id;
                this.downloadFile(id);
            } else if (e.target.classList.contains('delete-btn')) {
                const id = e.target.closest('.file-item').dataset.id;
                this.deleteFile(id);
            }
        });
    }

    bindModalEvents() {
        // 点击关闭模态框
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal')) {
                this.closeModal();
            }
            if (e.target.classList.contains('modal') && e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // 按ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    loadUserData() {
        const user = app.getCurrentUser();
        if (user) {
            // 填充表单
            const nicknameInput = document.getElementById('user-nickname');
            const emailInput = document.getElementById('user-email');
            const bioInput = document.getElementById('user-bio');

            if (nicknameInput) nicknameInput.value = user.nickname || user.email.split('@')[0];
            if (emailInput) emailInput.value = user.email;
            if (bioInput) bioInput.value = user.bio || '';
        }
    }

    saveProfile() {
        const nickname = document.getElementById('user-nickname').value;
        const bio = document.getElementById('user-bio').value;

        if (!nickname) {
            app.showMessage('请输入昵称', 'error');
            return;
        }

        const userData = {
            nickname,
            bio
        };

        app.updateUserData(userData);
        app.showMessage('个人信息已保存', 'success');
    }

    handleFileSelect(files) {
        for (let i = 0; i < files.length; i++) {
            this.uploadFile(files[i]);
        }
    }

    async uploadFile(file) {
        // 显示上传进度
        const progressContainer = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (progressContainer && progressFill && progressText) {
            progressContainer.style.display = 'block';
            progressFill.style.width = '0%';
            progressText.textContent = `正在上传: ${file.name}`;
        }

        // 模拟上传过程
        try {
            // 模拟上传时间
            for (let percent = 0; percent <= 100; percent += 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (progressFill) {
                    progressFill.style.width = percent + '%';
                }
                
                if (progressText) {
                    progressText.textContent = `正在上传: ${file.name} (${percent}%)`;
                }
            }

            // 创建文件对象
            const fileObj = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                type: file.type,
                createdAt: new Date().toISOString()
            };

            this.files.push(fileObj);
            this.saveFilesToStorage();

            // 隐藏进度条
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }

            this.renderFileList();
            app.showMessage(`文件 ${file.name} 上传成功`, 'success');
        } catch (error) {
            // 隐藏进度条
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
            
            app.showMessage(`文件 ${file.name} 上传失败`, 'error');
        }
    }

    loadFiles() {
        const user = app.getCurrentUser();
        if (user) {
            const key = `files_${user.id}`;
            this.files = JSON.parse(localStorage.getItem(key) || '[]');
        }
    }

    saveFilesToStorage() {
        const user = app.getCurrentUser();
        if (user) {
            const key = `files_${user.id}`;
            localStorage.setItem(key, JSON.stringify(this.files));
        }
    }

    renderFileList() {
        const container = document.getElementById('file-list');
        if (!container) return;

        container.innerHTML = this.files.map(file => `
            <div class="file-item" data-id="${file.id}">
                <div class="file-icon">${this.getFileIcon(file.type)}</div>
                <div class="file-info">
                    <h4>${file.name}</h4>
                    <p>${Utils.formatFileSize(file.size)} • ${Utils.formatDate(file.createdAt)}</p>
                </div>
                <div class="file-actions">
                    <button class="action-btn preview-btn">预览</button>
                    <button class="action-btn download-btn">下载</button>
                    <button class="action-btn delete-btn">删除</button>
                </div>
            </div>
        `).join('');
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎬';
        if (fileType.startsWith('audio/')) return '🎵';
        if (fileType === 'application/pdf') return '📄';
        if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
        if (fileType.includes('text') || fileType.includes('javascript') || fileType.includes('json')) return '📝';
        if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
        return '📁';
    }

    previewFile(id) {
        const file = this.files.find(f => f.id == id);
        if (!file) return;

        const modal = document.getElementById('preview-modal');
        const content = document.getElementById('preview-content');
        const title = document.getElementById('preview-title');

        if (!modal || !content || !title) return;

        title.textContent = `预览: ${file.name}`;

        // 根据文件类型显示预览
        if (file.type.startsWith('image/')) {
            // 图片预览
            content.innerHTML = `<img src="${URL.createObjectURL(new Blob([], {type: file.type}))}" alt="${file.name}" style="max-width: 100%; height: auto;">`;
            // 模拟图片加载
            setTimeout(() => {
                content.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">模拟图片预览: ${file.name}</div>`;
            }, 500);
        } else if (file.type === 'application/pdf') {
            // PDF预览
            content.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">PDF预览功能: ${file.name}</div>`;
        } else if (file.type.startsWith('text/')) {
            // 文本文件预览
            content.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">文本文件预览: ${file.name}</div>`;
        } else {
            // 其他类型文件预览
            content.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">不支持的文件类型预览: ${file.type}</div>`;
        }

        modal.classList.add('active');
    }

    downloadFile(id) {
        const file = this.files.find(f => f.id == id);
        if (!file) return;

        // 模拟下载
        app.showMessage(`正在下载 ${file.name}`, 'success');
        
        // 这里应该是实际的下载逻辑
        // 创建一个模拟下载链接
        const a = document.createElement('a');
        a.href = '#';
        a.download = file.name;
        a.click();
    }

    deleteFile(id) {
        if (confirm(`确定要删除文件 ${this.files.find(f => f.id == id)?.name} 吗？`)) {
            this.files = this.files.filter(f => f.id != id);
            this.saveFilesToStorage();
            this.renderFileList();
            app.showMessage('文件已删除', 'success');
        }
    }

    closeModal() {
        document.getElementById('preview-modal').classList.remove('active');
    }
}

// 初始化用户信息管理模块
document.addEventListener('DOMContentLoaded', () => {
    new UserInfoManager();
});