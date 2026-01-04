// 检索偏好设置模块
class PreferencesManager {
    constructor() {
        this.sites = [];
        this.init();
    }

    init() {
        this.loadSites();
        this.bindEvents();
        this.renderSitesList();
    }

    bindEvents() {
        // 添加网站按钮
        const addBtn = document.getElementById('add-site-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // 同步偏好按钮
        const syncBtn = document.getElementById('sync-preferences');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncPreferences());
        }

        // 模态框事件
        this.bindModalEvents();

        // 优先级选择事件（使用事件委托）
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('priority-select')) {
                this.updateSitePriority(e.target.dataset.id, e.target.value);
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

        // 表单提交
        const form = document.getElementById('site-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSite();
            });
        }
    }

    loadSites() {
        // 从localStorage加载网站偏好
        const user = app.getCurrentUser();
        if (user) {
            const key = `preferences_${user.id}`;
            this.sites = JSON.parse(localStorage.getItem(key) || '[]');
        }
    }

    saveSitesToStorage() {
        const user = app.getCurrentUser();
        if (user) {
            const key = `preferences_${user.id}`;
            localStorage.setItem(key, JSON.stringify(this.sites));
        }
    }

    renderSitesList() {
        const container = document.getElementById('site-list');
        if (!container) return;

        // 按优先级排序
        const sortedSites = [...this.sites].sort((a, b) => a.priority - b.priority);

        container.innerHTML = sortedSites.map(site => `
            <div class="site-item" data-id="${site.id}">
                <div class="site-info">
                    <h3>${site.name}</h3>
                    <p>${site.url}</p>
                    <p>${site.description || ''}</p>
                    <div class="site-priority">
                        <label>优先级：</label>
                        <select class="priority-select" data-id="${site.id}">
                            <option value="1" ${site.priority === 1 ? 'selected' : ''}>1 (最高)</option>
                            <option value="2" ${site.priority === 2 ? 'selected' : ''}>2</option>
                            <option value="3" ${site.priority === 3 ? 'selected' : ''}>3</option>
                            <option value="4" ${site.priority === 4 ? 'selected' : ''}>4</option>
                            <option value="5" ${site.priority === 5 ? 'selected' : ''}>5 (最低)</option>
                        </select>
                    </div>
                </div>
                <div class="site-actions">
                    <button class="action-btn edit-btn" data-id="${site.id}">编辑</button>
                    <button class="action-btn delete-btn" data-id="${site.id}">删除</button>
                </div>
            </div>
        `).join('');

        // 绑定编辑和删除事件
        this.bindItemEvents();
    }

    bindItemEvents() {
        // 编辑按钮事件
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.editSite(id);
            });
        });

        // 删除按钮事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.deleteSite(id);
            });
        });
    }

    showAddModal() {
        this.currentEditId = null;
        document.getElementById('site-modal-title').textContent = '添加网站';
        document.getElementById('site-form').reset();
        document.getElementById('site-priority').value = '1';
        document.getElementById('site-modal').classList.add('active');
    }

    editSite(id) {
        const site = this.sites.find(s => s.id == id);
        if (!site) return;

        this.currentEditId = site.id;
        document.getElementById('site-modal-title').textContent = '编辑网站';
        document.getElementById('site-name').value = site.name;
        document.getElementById('site-url').value = site.url;
        document.getElementById('site-description').value = site.description || '';
        document.getElementById('site-priority').value = site.priority;
        
        document.getElementById('site-modal').classList.add('active');
    }

    deleteSite(id) {
        if (confirm('确定要删除这个网站偏好吗？')) {
            this.sites = this.sites.filter(s => s.id != id);
            this.saveSitesToStorage();
            this.renderSitesList();
            app.showMessage('网站偏好已删除', 'success');
        }
    }

    updateSitePriority(id, newPriority) {
        const site = this.sites.find(s => s.id == id);
        if (site) {
            site.priority = parseInt(newPriority);
            this.saveSitesToStorage();
            app.showMessage('优先级已更新', 'success');
        }
    }

    saveSite() {
        const name = document.getElementById('site-name').value;
        const url = document.getElementById('site-url').value;
        const description = document.getElementById('site-description').value;
        const priority = parseInt(document.getElementById('site-priority').value);

        // 验证输入
        if (!name || !url) {
            app.showMessage('请填写网站名称和URL', 'error');
            return;
        }

        try {
            new URL(url); // 验证URL格式
        } catch (e) {
            app.showMessage('URL格式不正确', 'error');
            return;
        }

        if (this.currentEditId) {
            // 编辑现有网站
            const index = this.sites.findIndex(s => s.id == this.currentEditId);
            if (index !== -1) {
                this.sites[index] = {
                    ...this.sites[index],
                    name,
                    url,
                    description,
                    priority,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // 添加新网站
            // 检查是否已存在相同的URL
            const existingSite = this.sites.find(s => s.url === url);
            if (existingSite) {
                app.showMessage('该网站URL已存在', 'error');
                return;
            }

            const newSite = {
                id: Date.now().toString(),
                name,
                url,
                description,
                priority,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.sites.push(newSite);
        }

        this.saveSitesToStorage();
        this.closeModal();
        this.renderSitesList();
        app.showMessage(this.currentEditId ? '网站偏好已更新' : '网站偏好已添加', 'success');
    }

    closeModal() {
        document.getElementById('site-modal').classList.remove('active');
    }

    async syncPreferences() {
        const syncBtn = document.getElementById('sync-preferences');
        const statusDiv = document.getElementById('sync-status');
        
        if (!syncBtn || !statusDiv) return;

        // 显示同步中状态
        syncBtn.disabled = true;
        statusDiv.textContent = '正在同步...';
        statusDiv.className = 'sync-status';

        try {
            // 模拟同步过程
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 这里应该是实际的API调用
            // 模拟同步成功
            statusDiv.textContent = '同步成功！';
            statusDiv.className = 'sync-status success';
            app.showMessage('检索偏好已同步到大模型模块', 'success');
        } catch (error) {
            statusDiv.textContent = '同步失败，请重试';
            statusDiv.className = 'sync-status error';
            app.showMessage('同步失败，请检查网络连接', 'error');
        } finally {
            syncBtn.disabled = false;
            
            // 3秒后清除状态信息
            setTimeout(() => {
                if (statusDiv.textContent !== '正在同步...') {
                    statusDiv.textContent = '';
                    statusDiv.className = 'sync-status';
                }
            }, 3000);
        }
    }
}

// 初始化偏好设置模块
document.addEventListener('DOMContentLoaded', () => {
    new PreferencesManager();
});