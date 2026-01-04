// 知识记忆管理模块
class KnowledgeManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.allKnowledge = [];
        this.filteredKnowledge = [];
        this.init();
    }

    init() {
        this.loadKnowledge();
        this.bindEvents();
        this.renderKnowledgeList();
    }

    bindEvents() {
        // 添加知识条目按钮
        const addBtn = document.getElementById('add-knowledge-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // 搜索功能
        const searchInput = document.getElementById('knowledge-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.filterKnowledge();
            }, 300));
        }

        // 筛选功能
        const filterSelect = document.getElementById('knowledge-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                this.filterKnowledge();
            });
        }

        // 分页事件
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        if (prevPageBtn) prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));

        // 模态框事件
        this.bindModalEvents();
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
        const form = document.getElementById('knowledge-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveKnowledge();
            });
        }
    }

    loadKnowledge() {
        // 从localStorage加载知识条目
        const user = app.getCurrentUser();
        if (user) {
            const key = `knowledge_${user.id}`;
            this.allKnowledge = JSON.parse(localStorage.getItem(key) || '[]');
            this.filteredKnowledge = [...this.allKnowledge];
        }
    }

    saveKnowledgeToStorage() {
        const user = app.getCurrentUser();
        if (user) {
            const key = `knowledge_${user.id}`;
            localStorage.setItem(key, JSON.stringify(this.allKnowledge));
        }
    }

    renderKnowledgeList() {
        const container = document.getElementById('knowledge-list');
        if (!container) return;

        // 计算当前页的数据
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentKnowledge = this.filteredKnowledge.slice(startIndex, endIndex);

        // 生成HTML
        container.innerHTML = currentKnowledge.map(knowledge => `
            <div class="knowledge-item" data-id="${knowledge.id}">
                <div class="knowledge-content">
                    <h3>${knowledge.title}</h3>
                    <p class="knowledge-question">${knowledge.question}</p>
                    <p class="knowledge-answer">${knowledge.answer}</p>
                </div>
                <div class="knowledge-meta">
                    <span class="knowledge-date">${Utils.formatDate(knowledge.createdAt)}</span>
                    <span class="knowledge-importance ${knowledge.importance}">${knowledge.importance === 'important' ? '重要' : '普通'}</span>
                    <div class="knowledge-actions">
                        <button class="action-btn edit-btn" data-id="${knowledge.id}">编辑</button>
                        <button class="action-btn delete-btn" data-id="${knowledge.id}">删除</button>
                    </div>
                </div>
            </div>
        `).join('');

        // 绑定编辑和删除事件
        this.bindItemEvents();

        // 更新分页信息
        this.updatePagination();
    }

    bindItemEvents() {
        // 编辑按钮事件
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.editKnowledge(id);
            });
        });

        // 删除按钮事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.deleteKnowledge(id);
            });
        });
    }

    showAddModal() {
        this.currentEditId = null;
        document.getElementById('modal-title').textContent = '添加知识条目';
        document.getElementById('knowledge-form').reset();
        document.getElementById('knowledge-modal').classList.add('active');
    }

    editKnowledge(id) {
        const knowledge = this.allKnowledge.find(k => k.id == id);
        if (!knowledge) return;

        this.currentEditId = knowledge.id;
        document.getElementById('modal-title').textContent = '编辑知识条目';
        document.getElementById('knowledge-title').value = knowledge.title;
        document.getElementById('knowledge-question').value = knowledge.question;
        document.getElementById('knowledge-answer').value = knowledge.answer;
        document.getElementById('knowledge-importance').value = knowledge.importance;
        
        document.getElementById('knowledge-modal').classList.add('active');
    }

    deleteKnowledge(id) {
        if (confirm('确定要删除这个知识条目吗？')) {
            this.allKnowledge = this.allKnowledge.filter(k => k.id != id);
            this.saveKnowledgeToStorage();
            this.filterKnowledge();
            app.showMessage('知识条目已删除', 'success');
        }
    }

    saveKnowledge() {
        const title = document.getElementById('knowledge-title').value;
        const question = document.getElementById('knowledge-question').value;
        const answer = document.getElementById('knowledge-answer').value;
        const importance = document.getElementById('knowledge-importance').value;

        if (!title || !question || !answer) {
            app.showMessage('请填写所有必填字段', 'error');
            return;
        }

        if (this.currentEditId) {
            // 编辑现有条目
            const index = this.allKnowledge.findIndex(k => k.id == this.currentEditId);
            if (index !== -1) {
                this.allKnowledge[index] = {
                    ...this.allKnowledge[index],
                    title,
                    question,
                    answer,
                    importance,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // 添加新条目
            const newKnowledge = {
                id: Date.now().toString(),
                title,
                question,
                answer,
                importance,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.allKnowledge.unshift(newKnowledge);
        }

        this.saveKnowledgeToStorage();
        this.closeModal();
        this.filterKnowledge();
        app.showMessage(this.currentEditId ? '知识条目已更新' : '知识条目已添加', 'success');
    }

    closeModal() {
        document.getElementById('knowledge-modal').classList.remove('active');
    }

    filterKnowledge() {
        const searchTerm = document.getElementById('knowledge-search').value.toLowerCase();
        const filterType = document.getElementById('knowledge-filter').value;

        this.filteredKnowledge = this.allKnowledge.filter(knowledge => {
            const matchesSearch = 
                knowledge.title.toLowerCase().includes(searchTerm) ||
                knowledge.question.toLowerCase().includes(searchTerm) ||
                knowledge.answer.toLowerCase().includes(searchTerm);

            let matchesFilter = true;
            if (filterType === 'important') {
                matchesFilter = knowledge.importance === 'important';
            } else if (filterType === 'today') {
                const today = new Date();
                const createdDate = new Date(knowledge.createdAt);
                matchesFilter = 
                    createdDate.getDate() === today.getDate() &&
                    createdDate.getMonth() === today.getMonth() &&
                    createdDate.getFullYear() === today.getFullYear();
            } else if (filterType === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const createdDate = new Date(knowledge.createdAt);
                matchesFilter = createdDate >= oneWeekAgo;
            }

            return matchesSearch && matchesFilter;
        });

        this.currentPage = 1;
        this.renderKnowledgeList();
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredKnowledge.length / this.itemsPerPage);
        
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        this.currentPage = page;
        this.renderKnowledgeList();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredKnowledge.length / this.itemsPerPage);
        const pageInfo = document.getElementById('knowledge-pagination');
        
        if (pageInfo) {
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');
            
            if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
            if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
            
            pageInfo.querySelector('.page-info').textContent = 
                `${this.currentPage} / ${totalPages}`;
        }
    }
}

// 初始化知识管理模块
document.addEventListener('DOMContentLoaded', () => {
    new KnowledgeManager();
});