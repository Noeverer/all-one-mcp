// 专属工具集管理模块
class ToolsManager {
    constructor() {
        this.tools = [];
        this.init();
    }

    init() {
        this.loadTools();
        this.bindEvents();
        this.renderToolsList();
    }

    bindEvents() {
        // 添加工具按钮
        const addBtn = document.getElementById('add-tool-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // 模态框事件
        this.bindModalEvents();

        // 工具操作事件（使用事件委托）
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('toggle-btn')) {
                const id = e.target.closest('.tool-card').dataset.id;
                this.toggleToolStatus(id);
            } else if (e.target.classList.contains('edit-btn')) {
                const id = e.target.closest('.tool-card').dataset.id;
                this.editTool(id);
            } else if (e.target.classList.contains('delete-btn')) {
                const id = e.target.closest('.tool-card').dataset.id;
                this.deleteTool(id);
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
        const form = document.getElementById('tool-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTool();
            });
        });
    }

    loadTools() {
        // 从localStorage加载工具集
        const user = app.getCurrentUser();
        if (user) {
            const key = `tools_${user.id}`;
            this.tools = JSON.parse(localStorage.getItem(key) || '[]');
        }
    }

    saveToolsToStorage() {
        const user = app.getCurrentUser();
        if (user) {
            const key = `tools_${user.id}`;
            localStorage.setItem(key, JSON.stringify(this.tools));
        }
    }

    renderToolsList() {
        const container = document.getElementById('tools-grid');
        if (!container) return;

        container.innerHTML = this.tools.map(tool => `
            <div class="tool-card" data-id="${tool.id}">
                <div class="tool-header">
                    <h3>${tool.name}</h3>
                    <div class="tool-status ${tool.enabled ? 'active' : 'inactive'}">
                        ${tool.enabled ? '启用' : '禁用'}
                    </div>
                </div>
                <div class="tool-content">
                    <p>${tool.description || '暂无描述'}</p>
                    <div class="tool-isolation">
                        <span class="isolation-status isolated">已隔离</span>
                    </div>
                </div>
                <div class="tool-actions">
                    <button class="action-btn toggle-btn ${tool.enabled ? 'inactive' : 'active'}" data-id="${tool.id}">
                        ${tool.enabled ? '禁用' : '启用'}
                    </button>
                    <button class="action-btn edit-btn" data-id="${tool.id}">编辑</button>
                    <button class="action-btn delete-btn" data-id="${tool.id}">删除</button>
                </div>
            </div>
        `).join('');
    }

    showAddModal() {
        this.currentEditId = null;
        document.getElementById('tool-modal-title').textContent = '添加工具';
        document.getElementById('tool-form').reset();
        document.getElementById('tool-isolation').value = 'iframe';
        document.getElementById('tool-modal').classList.add('active');
    }

    editTool(id) {
        const tool = this.tools.find(t => t.id == id);
        if (!tool) return;

        this.currentEditId = tool.id;
        document.getElementById('tool-modal-title').textContent = '编辑工具';
        document.getElementById('tool-name').value = tool.name;
        document.getElementById('tool-url').value = tool.url;
        document.getElementById('tool-description').value = tool.description || '';
        document.getElementById('tool-isolation').value = tool.isolation || 'iframe';
        
        document.getElementById('tool-modal').classList.add('active');
    }

    deleteTool(id) {
        if (confirm('确定要删除这个工具吗？')) {
            this.tools = this.tools.filter(t => t.id != id);
            this.saveToolsToStorage();
            this.renderToolsList();
            app.showMessage('工具已删除', 'success');
        }
    }

    toggleToolStatus(id) {
        const tool = this.tools.find(t => t.id == id);
        if (!tool) return;

        tool.enabled = !tool.enabled;
        tool.updatedAt = new Date().toISOString();
        this.saveToolsToStorage();
        this.renderToolsList();
        app.showMessage(`工具已${tool.enabled ? '启用' : '禁用'}`, 'success');
    }

    saveTool() {
        const name = document.getElementById('tool-name').value;
        const url = document.getElementById('tool-url').value;
        const description = document.getElementById('tool-description').value;
        const isolation = document.getElementById('tool-isolation').value;

        // 验证输入
        if (!name || !url) {
            app.showMessage('请填写工具名称和URL', 'error');
            return;
        }

        try {
            new URL(url); // 验证URL格式
        } catch (e) {
            app.showMessage('URL格式不正确', 'error');
            return;
        }

        if (this.currentEditId) {
            // 编辑现有工具
            const index = this.tools.findIndex(t => t.id == this.currentEditId);
            if (index !== -1) {
                this.tools[index] = {
                    ...this.tools[index],
                    name,
                    url,
                    description,
                    isolation,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // 添加新工具
            // 检查是否已存在相同的URL
            const existingTool = this.tools.find(t => t.url === url);
            if (existingTool) {
                app.showMessage('该工具URL已存在', 'error');
                return;
            }

            const newTool = {
                id: Date.now().toString(),
                name,
                url,
                description,
                isolation,
                enabled: true, // 新工具默认启用
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.tools.push(newTool);
        }

        this.saveToolsToStorage();
        this.closeModal();
        this.renderToolsList();
        app.showMessage(this.currentEditId ? '工具已更新' : '工具已添加', 'success');
    }

    closeModal() {
        document.getElementById('tool-modal').classList.remove('active');
    }
}

// 初始化工具管理模块
document.addEventListener('DOMContentLoaded', () => {
    new ToolsManager();
});