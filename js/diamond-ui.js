// ==================== DIAMOND AI v46 — UI И ИНИЦИАЛИЗАЦИЯ ====================

// ========== РЕНДЕР ИСТОРИИ (с исправленными обработчиками) ==========
function renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    const searchTerm = document.getElementById('history-search')?.value.toLowerCase() || '';
    searchHighlightTerm = searchTerm;
    let filtered = chats;
    if (searchTerm) {
        filtered = chats.filter(c => {
            if (c.title.toLowerCase().includes(searchTerm)) return true;
            if (c.messages && c.messages.some(m => m.content && m.content.toLowerCase().includes(searchTerm))) return true;
            return false;
        });
    }
    const toolChats = filtered.filter(c => c.id && c.id.startsWith('tool_'));
    const normalChats = filtered.filter(c => !toolChats.includes(c));
    const pinnedChats = normalChats.filter(c => c.pinned);
    const pinnedIds = new Set(pinnedChats.map(c => c.id));
    const folderMap = new Map();
    const orphanChats = [];
    normalChats.forEach(c => {
        if (pinnedIds.has(c.id)) return;
        if (c.folder_id) {
            if (!folderMap.has(c.folder_id)) folderMap.set(c.folder_id, []);
            folderMap.get(c.folder_id).push(c);
        } else orphanChats.push(c);
    });
    let html = '';
    if (toolChats.length > 0) {
        html += `<div class="history-group"><div class="history-group-title"><i class="fas fa-wrench"></i> ${t('master')}</div>`;
        toolChats.forEach(c => html += buildToolHistoryItem(c, getToolInfo(c.id.replace('tool_',''))));
        html += '</div>';
    }
    if (pinnedChats.length > 0) {
        html += `<div class="history-group"><div class="history-group-title"><i class="fas fa-thumbtack"></i> ${t('pinned')}</div>`;
        pinnedChats.forEach(c => {
            const folder = (c.folder_id ? folders.find(f => f.id === c.folder_id) : null);
            html += buildHistoryItem(c, folder);
        });
        html += '</div>';
    }
    const sortedFolders = Array.from(folderMap.keys()).map(fid => folders.find(f => f.id === fid)).filter(Boolean);
    sortedFolders.sort((a, b) => a.name.localeCompare(b.name));
    sortedFolders.forEach(folder => {
        const chatsInFolder = folderMap.get(folder.id);
        if (!chatsInFolder || chatsInFolder.length === 0) return;
        html += `<div class="history-group"><div class="history-group-title" style="display:flex; align-items:center; gap:8px;"><i class="fas ${folder.icon}" style="color:${folder.color}"></i> ${escapeHtml(folder.name)}</div>`;
        chatsInFolder.forEach(c => html += buildHistoryItem(c, folder));
        html += '</div>';
    });
    if (orphanChats.length > 0) {
        const groups = { today: [], yesterday: [], older: [] };
        orphanChats.forEach(c => {
            const d = new Date(c.last_activity || c.created_at).setHours(0,0,0,0);
            const today = new Date().setHours(0,0,0,0);
            if (d === today) groups.today.push(c);
            else if (d === today - 86400000) groups.yesterday.push(c);
            else groups.older.push(c);
        });
        for (const g of ['today', 'yesterday', 'older']) {
            if (!groups[g].length) continue;
            html += `<div class="history-group"><div class="history-group-title">${t(g)}</div>`;
            groups[g].forEach(c => html += buildHistoryItem(c, null));
            html += '</div>';
        }
    }
    if (!html) html = `<div style="text-align:center; padding:20px;">${searchTerm ? t('searchNotFound') : t('noChats')}</div>`;
    list.innerHTML = html;

    // Навешиваем обработчики через addEventListener для надёжности
    document.querySelectorAll('.history-item').forEach(el => {
        el.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-actions-hover')) switchChat(el.dataset.id);
        });
    });

    document.querySelectorAll('.rename-chat-hover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showRenameModal(btn.dataset.id);
        });
    });

    document.querySelectorAll('.pin-chat-hover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePin(btn.dataset.id);
        });
    });

    document.querySelectorAll('.delete-chat-hover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const id = btn.dataset.id;
            if (id) {
                deleteChat(id);
            }
        });
    });

    document.querySelectorAll('.move-to-folder-hover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showFolderSelectModal(btn.dataset.id);
        });
    });
}

function buildHistoryItem(chat, folder) {
    const isActive = chat.id === currentChatId;
    const folderColor = folder ? folder.color : 'transparent';
    const folderIcon = folder ? folder.icon : '';
    const folderStyle = folder ? `style="border-left: 3px solid ${folderColor}; padding-left: 9px;"` : '';
    const iconHtml = folder ? `<i class="fas ${folderIcon}" style="color:${folderColor}; margin-right:6px; font-size:12px;"></i>` : '';
    return `
        <div class="history-item ${isActive ? 'active' : ''}" data-id="${chat.id}" ${folderStyle}>
            ${iconHtml}<span class="chat-title">${escapeHtml(chat.title)}</span>
            <div class="chat-actions-hover">
                <button class="chat-action-btn rename-chat-hover" data-id="${chat.id}" title="${t('renameChat')}"><i class="fas fa-pencil-alt"></i></button>
                <button class="chat-action-btn pin-chat-hover" data-id="${chat.id}" title="${chat.pinned ? t('unpinChat') : t('pinChat')}"><i class="fas fa-thumbtack ${chat.pinned ? 'pinned' : ''}"></i></button>
                <button class="chat-action-btn move-to-folder-hover" data-id="${chat.id}" title="${t('moveToFolder')}"><i class="fas fa-folder-open"></i></button>
                <button class="chat-action-btn delete-chat-hover" data-id="${chat.id}" title="${t('deleteChat')}"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
}

function buildToolHistoryItem(chat, toolInfo) {
    const isActive = chat.id === currentChatId;
    const color = toolInfo.color || 'var(--accent)';
    const toolId = chat.id.replace('tool_', '');
    return `
        <div class="history-item tool-chat ${isActive ? 'active' : ''}" data-id="${chat.id}" data-tool-id="${toolId}" style="border-left: 3px solid ${color}; padding-left: 9px;">
            <i class="fas ${toolInfo.icon}" style="color: ${color}; margin-right: 8px; font-size: 14px;"></i>
            <span class="chat-title" style="z-index:1;">${escapeHtml(chat.title)}</span>
        </div>
    `;
}

// ========== РЕНДЕР ЧАТА ==========
function renderChat() {
    const chat = chats.find(c => c.id === currentChatId);
    const headerEl = document.getElementById('chatHeader');
    if (headerEl) {
        headerEl.innerHTML = '';
        headerEl.style.borderColor = 'var(--border-color)';
        headerEl.classList.remove('folder-border');
        if (chat) {
            const folder = chat.folder_id ? folders.find(f => f.id === chat.folder_id) : null;
            if (folder) {
                headerEl.style.borderColor = folder.color;
                headerEl.classList.add('folder-border');
            }
            headerEl.innerHTML = `<i class="fas fa-feather-alt"></i> ${escapeHtml(chat.title)}`;
        } else {
            headerEl.textContent = '';
        }
    }
    if (!chat || !chat.messages || chat.messages.length === 0) {
        renderEmptyState();
        document.getElementById('inputArea').style.display = 'none';
        return;
    }
    document.getElementById('inputArea').style.display = 'flex';
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    let lastDate = null;
    chat.messages.forEach((msg, idx) => {
        if (msg.isTyping) return;
        const date = new Date(msg.timestamp || chat.created_at).toDateString();
        if (date !== lastDate) {
            container.innerHTML += `<div class="date-divider"><span>${formatDateHeader(msg.timestamp || chat.created_at)}</span></div>`;
            lastDate = date;
        }
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.role}`;
        const avatarHTML = msg.role === 'user' ? getUserAvatarHTML() : getBotAvatarHTML();
        let contentHtml = msg.role === 'assistant' ? marked.parse(msg.content) : escapeHtml(msg.content);
        if (searchHighlightTerm) {
            const regex = new RegExp(`(${searchHighlightTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            contentHtml = contentHtml.replace(regex, '<span class="search-highlight">$1</span>');
        }
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content visible';
        contentDiv.innerHTML = contentHtml;

        const wrapper = document.createElement('div');
        wrapper.className = 'message-content-wrapper';
        wrapper.appendChild(contentDiv);

        // Действия для пользователя
        if (msg.role === 'user') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'user-message-actions';
            actionsDiv.innerHTML = `
                <span class="copy-user-action">${t('copyUserAction')}</span>
                <span class="separator">·</span>
                <span class="edit-user-action">${t('editAction')}</span>
            `;
            actionsDiv.querySelector('.copy-user-action').addEventListener('click', () => {
                navigator.clipboard.writeText(msg.content);
                showToast(t('copy'), '', 'success', 1500);
            });
            actionsDiv.querySelector('.edit-user-action').addEventListener('click', () => {
                enterEditMode(msg, idx, messageDiv);
            });
            wrapper.appendChild(actionsDiv);
        }

        // Футер для ассистента
        if (msg.role === 'assistant' && msg.generationTime) {
            const footerDiv = document.createElement('div');
            footerDiv.className = 'message-footer';
            const hasVariants = msg.variants && msg.variants.length > 1;
            const currentVariant = msg.currentVariant || 0;

            footerDiv.innerHTML = `
                <span class="disclaimer">Diamond AI</span>
                <span class="separator">·</span>
                ${hasVariants ? `
                    <span class="variant-switcher">
                        <button class="prev-variant"><i class="fas fa-chevron-left"></i></button>
                        <span class="variant-counter">${currentVariant + 1}/${msg.variants.length}</span>
                        <button class="next-variant"><i class="fas fa-chevron-right"></i></button>
                    </span>
                    <span class="separator">·</span>
                ` : ''}
                <span class="generation-time-label">${t('generatedIn')} ${msg.generationTime} ${t('sec')}</span>
                <span class="separator">·</span>
                <span class="copy-action">${t('copyAction')}</span>
                <span class="separator">·</span>
                <span class="regen-action">${t('regenAction')}</span>
            `;

            footerDiv.querySelector('.disclaimer').addEventListener('click', showDisclaimerModal);
            footerDiv.querySelector('.copy-action').addEventListener('click', () => {
                navigator.clipboard.writeText(msg.content);
                showToast(t('copy'), '', 'success', 1500);
            });
            footerDiv.querySelector('.regen-action').addEventListener('click', () => {
                regenerateResponseFromMsg(msg, idx);
            });

            if (hasVariants) {
                let localIdx = currentVariant;
                const update = (newIdx) => {
                    localIdx = newIdx;
                    contentDiv.innerHTML = marked.parse(msg.variants[newIdx]);
                    const ctr = footerDiv.querySelector('.variant-counter');
                    if (ctr) ctr.textContent = `${newIdx + 1}/${msg.variants.length}`;
                    msg.currentVariant = newIdx;
                    msg.content = msg.variants[newIdx];
                    saveChatToSupabase(chat);
                };
                footerDiv.querySelector('.prev-variant').addEventListener('click', () => {
                    update((localIdx - 1 + msg.variants.length) % msg.variants.length);
                });
                footerDiv.querySelector('.next-variant').addEventListener('click', () => {
                    update((localIdx + 1) % msg.variants.length);
                });
            }

            wrapper.appendChild(footerDiv);
        }

        if (msg.attachment) {
            const attachDiv = document.createElement('div');
            attachDiv.className = 'attachment-card';
            const ext = msg.attachment.type.split('/').pop();
            const logoMap = {
                'png': 'assets/png.png', 'jpg': 'assets/jpg.png', 'jpeg': 'assets/jpg.png',
                'html': 'assets/html.png', 'js': 'assets/js.png', 'css': 'assets/css.png',
                'docx': 'assets/docx.png'
            };
            const logo = logoMap[ext] || 'assets/png.png';
            attachDiv.innerHTML = `
                <div class="attachment-icon"><img src="${logo}" alt="${ext}"></div>
                <div class="attachment-info">
                    <div class="attachment-name">${escapeHtml(msg.attachment.name)}</div>
                    <div class="attachment-meta">${formatFileSize(msg.attachment.size)}</div>
                </div>
            `;
            wrapper.appendChild(attachDiv);
        }

        messageDiv.innerHTML = `<div class="avatar">${avatarHTML}</div>`;
        messageDiv.appendChild(wrapper);
        container.appendChild(messageDiv);
    });
    setTimeout(() => {
        renderMathInElementWithMhchem(container);
        enhanceCodeBlocks(container);
        renderMermaidBlocks(container);
    }, 10);
    scrollToBottom();
}

// ========== РЕДАКТИРОВАНИЕ СООБЩЕНИЯ ==========
function enterEditMode(msg, idx, messageDiv) {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;

    const wrapper = messageDiv.querySelector('.message-content-wrapper');
    const contentDiv = wrapper.querySelector('.message-content');
    const actionsDiv = wrapper.querySelector('.user-message-actions');
    const oldText = msg.content;

    contentDiv.style.display = 'none';
    if (actionsDiv) actionsDiv.style.display = 'none';

    const textarea = document.createElement('textarea');
    textarea.className = 'edit-textarea';
    textarea.value = oldText;
    const editActions = document.createElement('div');
    editActions.className = 'edit-actions';
    editActions.innerHTML = `
        <button class="btn btn-secondary cancel-edit-btn"><i class="fas fa-times"></i> ${t('cancelEdit')}</button>
        <button class="btn btn-primary save-edit-btn"><i class="fas fa-check"></i> ${t('saveEdit')}</button>
    `;
    wrapper.appendChild(textarea);
    wrapper.appendChild(editActions);
    textarea.focus();

    editActions.querySelector('.cancel-edit-btn').addEventListener('click', () => {
        textarea.remove();
        editActions.remove();
        contentDiv.style.display = 'block';
        if (actionsDiv) actionsDiv.style.display = 'flex';
    });

    editActions.querySelector('.save-edit-btn').addEventListener('click', async () => {
        const newText = textarea.value.trim();
        if (!newText) return;
        textarea.remove();
        editActions.remove();
        contentDiv.style.display = 'block';
        if (actionsDiv) actionsDiv.style.display = 'flex';

        msg.content = newText;
        contentDiv.textContent = newText;

        const msgIndex = chat.messages.indexOf(msg);
        if (msgIndex !== -1) {
            const removed = chat.messages.splice(msgIndex + 1);
            let nextElement = messageDiv.nextElementSibling;
            while (nextElement) {
                const toRemove = nextElement;
                nextElement = nextElement.nextElementSibling;
                toRemove.remove();
            }
            await saveChatToSupabase(chat);
        }

        await sendRequest(newText);
    });
}

// ========== ПУСТОЕ СОСТОЯНИЕ ==========
function renderEmptyState() {
    const container = document.getElementById('messages-container');
    container.innerHTML = `<div class="empty-state"><img src="assets/logo.png" class="empty-logo" alt="Diamond AI"><div class="empty-text">${t('emptyChat')}</div><div class="empty-input-area"><div class="input-wrapper"><textarea id="empty-input" placeholder="${placeholderTexts[0]}" rows="1"></textarea><button class="send-btn" id="empty-send-btn" disabled><i class="fas fa-arrow-up"></i></button></div></div></div>`;
    document.getElementById('inputArea').style.display = 'none';
    const headerEl = document.getElementById('chatHeader');
    if (headerEl) headerEl.innerHTML = '';
    const emptyInput = document.getElementById('empty-input'), emptySendBtn = document.getElementById('empty-send-btn');
    if (emptyInput) {
        if (placeholderInterval) clearInterval(placeholderInterval);
        let idx = 0; emptyInput.placeholder = placeholderTexts[0];
        placeholderInterval = setInterval(() => { if(document.activeElement!==emptyInput){emptyInput.style.opacity='0.5';setTimeout(()=>{idx=(idx+1)%placeholderTexts.length;emptyInput.placeholder=placeholderTexts[idx];emptyInput.style.opacity='1';},200);} }, 3000);
        emptyInput.oninput = function() {
            emptySendBtn.disabled = !this.value.trim();
            if (this.value.trim() === '') {
                this.style.height = '';
            } else {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 160) + 'px';
            }
        };
        emptyInput.onkeydown = e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); if(emptySendBtn&&!emptySendBtn.disabled) sendMessageFromEmpty(emptyInput.value);} };
        emptySendBtn.onclick = () => { if(emptyInput.value.trim()) sendMessageFromEmpty(emptyInput.value); };
    }
}

function sendMessageFromEmpty(text) {
    const input = document.getElementById('user-input');
    input.value = text;
    sendMessage();
    const emptyInput = document.getElementById('empty-input');
    if (emptyInput) {
        emptyInput.value = '';
        emptyInput.style.height = '';
    }
}

// ========== РЕНДЕР ПАПОК ==========
function renderFoldersPage() {
    const container = document.getElementById('foldersPage');
    if (!container) return;
    container.innerHTML = `
        <div class="folders-page-header"><h1><i class="fas fa-folder"></i> ${t('folders')}</h1><p>Организуйте чаты по папкам</p></div>
        <div class="folders-list-container" id="foldersListContainer"></div>
        <div class="folders-page-footer">
            <button id="create-folder-page-btn" class="btn btn-primary"><i class="fas fa-plus-circle"></i> ${t('createFolder')}</button>
            <button id="back-to-chat-from-folders" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> ${t('backToChat')}</button>
        </div>
    `;
    document.getElementById('create-folder-page-btn').addEventListener('click', () => { currentEditingFolderId = null; showFolderEditModal(null); });
    document.getElementById('back-to-chat-from-folders').addEventListener('click', switchToChatView);
    const listContainer = document.getElementById('foldersListContainer');
    if (folders.length === 0) { listContainer.innerHTML = `<div class="folder-empty">${t('folderEmpty')}</div>`; return; }
    listContainer.innerHTML = folders.map(f => {
        const count = chats.filter(c => c.folder_id === f.id).length;
        return `
        <div class="folder-card" data-id="${f.id}">
            <div class="folder-icon" style="background:${f.color}20; color:${f.color}"><i class="fas ${f.icon}"></i></div>
            <div class="folder-info">
                <div class="folder-name"><span style="color:${f.color}">${escapeHtml(f.name)}</span></div>
                <div class="folder-description">${escapeHtml(f.description) || 'Нет описания'}</div>
                <div class="folder-stats">${count} чатов</div>
            </div>
            <div class="folder-actions">
                <button class="add-chat-to-folder" data-id="${f.id}" title="${t('addChatToFolder')}"><i class="fas fa-plus"></i></button>
                <button class="view-folder-chats" data-id="${f.id}" title="${t('viewFolderChats')}"><i class="fas fa-comments"></i></button>
                <button class="edit-folder" data-id="${f.id}" title="${t('editFolder')}"><i class="fas fa-edit"></i></button>
                <button class="delete-folder" data-id="${f.id}" title="${t('deleteChat')}"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        `;
    }).join('');
    document.querySelectorAll('.add-chat-to-folder').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); showAddChatToFolderModal(btn.dataset.id); }; });
    document.querySelectorAll('.view-folder-chats').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); const folderId = btn.dataset.id; const folder = folders.find(f => f.id === folderId); if (folder) showFolderChatsModal(folder); }; });
    document.querySelectorAll('.edit-folder').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); currentEditingFolderId = btn.dataset.id; const f = folders.find(f => f.id === currentEditingFolderId); showFolderEditModal(f); }; });
    document.querySelectorAll('.delete-folder').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); deleteFolder(btn.dataset.id); }; });
}

// ========== МОДАЛКИ ПАПОК ==========
function showFolderEditModal(folder = null) {
    const isEdit = folder !== null;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 500px;">
            <div class="modal-header"><h3><i class="fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}"></i> ${isEdit ? t('editFolder') : t('createFolderTitle')}</h3><button class="close-modal"><i class="fas fa-times"></i></button></div>
            <div class="modal-body">
                <div class="form-group" style="margin-bottom: 16px;"><label style="display:block; margin-bottom:6px;">${t('folderName')}</label><input type="text" id="folder-name" placeholder="${t('folderName')}" value="${isEdit ? escapeHtml(folder.name) : ''}" style="width:100%; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:16px; color:white;"></div>
                <div class="form-group" style="margin-bottom: 16px;"><label style="display:block; margin-bottom:6px;">${t('folderDesc')}</label><textarea id="folder-description" rows="2" placeholder="${t('folderDesc')}" style="width:100%; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:16px; color:white;">${isEdit ? escapeHtml(folder.description || '') : ''}</textarea></div>
                <div class="form-group" style="margin-bottom: 16px;"><label style="display:block; margin-bottom:6px;">${t('folderIcon')}</label><div class="icon-selector" id="icon-selector" style="display:grid; grid-template-columns:repeat(6,1fr); gap:8px; background:var(--bg-tertiary); padding:12px; border-radius:16px;"></div></div>
                <div class="form-group"><label style="display:block; margin-bottom:6px;">${t('folderColor')}</label><div class="color-selector" id="color-selector" style="display:flex; gap:12px; flex-wrap:wrap;">
                    <div class="color-option" data-color="#e74c3c" style="background:#e74c3c; width:36px; height:36px; border-radius:50%; cursor:pointer;"></div>
                    <div class="color-option" data-color="#f39c12" style="background:#f39c12; width:36px; height:36px; border-radius:50%; cursor:pointer;"></div>
                    <div class="color-option" data-color="#2ecc71" style="background:#2ecc71; width:36px; height:36px; border-radius:50%; cursor:pointer;"></div>
                    <div class="color-option" data-color="#3498db" style="background:#3498db; width:36px; height:36px; border-radius:50%; cursor:pointer;"></div>
                    <div class="color-option" data-color="#9b59b6" style="background:#9b59b6; width:36px; height:36px; border-radius:50%; cursor:pointer;"></div>
                    <div class="color-option" data-color="#1abc9c" style="background:#1abc9c; width:36px; height:36px; border-radius:50%; cursor:pointer;"></div>
                    <div class="color-option" data-color="#e67e22" style="background:#e67e22; width:36px; height:36px; border-radius:50%; cursor:pointer;"></div>
                    <div class="color-option" data-color="#95a5a6" style="background:#95a5a6; width:36px; height:36px; border-radius:50%; cursor:pointer;"></div>
                </div></div>
            </div>
            <div class="modal-footer"><button id="save-folder-btn" class="btn btn-primary"><i class="fas fa-check"></i> ${t('save')}</button><button class="btn btn-secondary close-modal"><i class="fas fa-times"></i> ${t('cancel')}</button></div>
        </div>
    `;
    document.body.appendChild(modal);
    const icons = ['fa-folder', 'fa-folder-open', 'fa-book', 'fa-graduation-cap', 'fa-code', 'fa-music', 'fa-image', 'fa-video', 'fa-gamepad', 'fa-heart', 'fa-star', 'fa-rocket', 'fa-brain', 'fa-chart-line', 'fa-users', 'fa-calendar'];
    const iconSelector = modal.querySelector('#icon-selector');
    iconSelector.innerHTML = icons.map(icon => `<div class="icon-option" data-icon="${icon}" style="display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:12px; cursor:pointer; background:var(--bg-secondary);"><i class="fas ${icon}"></i></div>`).join('');
    let selectedIcon = isEdit ? folder.icon : 'fa-folder';
    let selectedColor = isEdit ? folder.color : '#95a5a6';
    iconSelector.querySelectorAll('.icon-option').forEach(opt => {
        if (opt.dataset.icon === selectedIcon) opt.style.background = 'var(--bg-hover)';
        opt.onclick = () => {
            iconSelector.querySelectorAll('.icon-option').forEach(o => o.style.background = 'var(--bg-secondary)');
            opt.style.background = 'var(--bg-hover)';
            selectedIcon = opt.dataset.icon;
        };
    });
    modal.querySelectorAll('.color-option').forEach(opt => {
        if (opt.dataset.color === selectedColor) opt.style.border = '2px solid white';
        opt.onclick = () => {
            modal.querySelectorAll('.color-option').forEach(o => o.style.border = 'none');
            opt.style.border = '2px solid white';
            selectedColor = opt.dataset.color;
        };
    });
    const close = () => modal.remove();
    modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', close));
    modal.querySelector('#save-folder-btn').onclick = async () => {
        const name = modal.querySelector('#folder-name').value.trim();
        if (!name) { showToast('Ошибка', 'Введите название', 'warning'); return; }
        const desc = modal.querySelector('#folder-description').value;
        if (isEdit) await updateFolder(folder.id, name, desc, selectedIcon, selectedColor);
        else await createFolder(name, desc, selectedIcon, selectedColor);
        close();
    };
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

function showFolderSelectModal(chatId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 400px;">
            <div class="modal-header"><h3><i class="fas fa-folder-open"></i> ${t('moveToFolder')}</h3><button class="close-modal"><i class="fas fa-times"></i></button></div>
            <div class="modal-body">
                <div class="folder-chats-list" id="folder-options-list">
                    <div class="folder-chat-item" data-id="" style="padding:12px; background:var(--bg-tertiary); border-radius:16px; margin-bottom:8px; cursor:pointer; display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-times-circle"></i><span>Без папки</span>
                    </div>
                    ${folders.map(f => `
                        <div class="folder-chat-item" data-id="${f.id}" style="padding:12px; background:var(--bg-tertiary); border-radius:16px; margin-bottom:8px; cursor:pointer; display:flex; align-items:center; gap:10px;">
                            <i class="fas ${f.icon}" style="color:${f.color}"></i><span>${escapeHtml(f.name)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer"><button class="btn btn-secondary close-modal"><i class="fas fa-arrow-left"></i> ${t('back')}</button></div>
        </div>
    `;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', close));
    modal.querySelectorAll('.folder-chat-item').forEach(item => {
        item.onclick = () => { moveChatToFolder(chatId, item.dataset.id || null); close(); };
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

function showAddChatToFolderModal(folderId) {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    const availableChats = chats.filter(c => c.folder_id !== folderId && !(c.id && c.id.startsWith('tool_')));
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 500px;">
            <div class="modal-header"><h3><i class="fas ${folder.icon}" style="color:${folder.color}"></i> ${t('addChatToFolder')} «${escapeHtml(folder.name)}»</h3><button class="close-modal"><i class="fas fa-times"></i></button></div>
            <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                ${availableChats.length === 0 ? `<p style="text-align:center; padding:20px;">${t('noAvailableChats')}</p>` : 
                availableChats.map(c => `
                    <div class="add-chat-item" data-chat-id="${c.id}" style="padding:12px; background:var(--bg-tertiary); border-radius:16px; margin-bottom:8px; cursor:pointer; display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-comment"></i><span style="flex:1;">${escapeHtml(c.title)}</span><i class="fas fa-plus"></i>
                    </div>
                `).join('')}
            </div>
            <div class="modal-footer"><button class="btn btn-secondary close-modal"><i class="fas fa-arrow-left"></i> ${t('back')}</button></div>
        </div>
    `;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', close));
    modal.querySelectorAll('.add-chat-item').forEach(item => {
        item.addEventListener('click', async () => { const chatId = item.dataset.chatId; await moveChatToFolder(chatId, folderId); close(); });
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

function showFolderChatsModal(folder) {
    const chatsInFolder = chats.filter(c => c.folder_id === folder.id);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 500px;">
            <div class="modal-header"><h3><i class="fas ${folder.icon}" style="color:${folder.color}"></i> ${t('folderChats')} «${escapeHtml(folder.name)}»</h3><button class="close-modal"><i class="fas fa-times"></i></button></div>
            <div class="modal-body">
                <div class="folder-chats-list">
                    ${chatsInFolder.length ? chatsInFolder.map(c => `
                        <div class="folder-chat-item" data-chat-id="${c.id}" style="padding:12px; background:var(--bg-tertiary); border-radius:16px; margin-bottom:8px; cursor:pointer; display:flex; align-items:center; gap:10px;">
                            <i class="fas fa-comment"></i><span style="flex:1;">${escapeHtml(c.title)}</span><i class="fas fa-arrow-right"></i>
                        </div>
                    `).join('') : `<div style="text-align:center; padding:20px; color:var(--text-secondary);">${t('noFolderChats')}</div>`}
                </div>
            </div>
            <div class="modal-footer"><button class="btn btn-secondary close-modal"><i class="fas fa-arrow-left"></i> ${t('back')}</button></div>
        </div>
    `;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', close));
    modal.querySelectorAll('.folder-chat-item').forEach(item => {
        item.onclick = () => { switchChat(item.dataset.chatId); switchToChatView(); close(); };
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

// ========== НАВИГАЦИЯ ПО ВИДАМ ==========
function switchToChatView() { if(placeholderInterval) clearInterval(placeholderInterval); currentView='chat'; document.getElementById('chatView').style.display='flex'; document.getElementById('foldersPage').style.display='none'; document.getElementById('workshopPage').style.display='none'; renderChat(); }
function switchToFoldersView() { currentView='folders'; document.getElementById('chatView').style.display='none'; document.getElementById('foldersPage').style.display='flex'; document.getElementById('workshopPage').style.display='none'; renderFoldersPage(); }
function switchToWorkshopView() { if(placeholderInterval) clearInterval(placeholderInterval); currentView='workshop'; document.getElementById('chatView').style.display='none'; document.getElementById('foldersPage').style.display='none'; document.getElementById('workshopPage').style.display='flex'; renderWorkshopPage(); }

// ========== ДИСКЛЕЙМЕР ==========
function showDisclaimerModal() {
    const overlay = document.createElement('div');
    overlay.className = 'disclaimer-modal-overlay';
    overlay.innerHTML = `
        <div class="disclaimer-modal">
            <div class="disclaimer-modal-icon"><i class="fas fa-book"></i></div>
            <h3>${t('disclaimerTitle')}</h3>
            <p>${t('disclaimerText')}</p>
            <button>${t('disclaimerClose')}</button>
        </div>
    `;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('button').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });
}

// ========== МОДАЛКА ПЕРЕИМЕНОВАНИЯ ЧАТА ==========
function showRenameModal(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chatId.startsWith('tool_')) return;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 400px;">
            <div class="modal-header"><h3><i class="fas fa-pencil-alt"></i> ${t('renameChat')}</h3><button class="close-modal"><i class="fas fa-times"></i></button></div>
            <div class="modal-body"><input type="text" id="rename-input" value="${escapeHtml(chat.title)}" style="width:100%; padding:12px; background: var(--bg-tertiary); border:1px solid var(--border-color); border-radius: 20px; color: white;"></div>
            <div class="modal-footer"><button id="rename-confirm" class="btn btn-primary"><i class="fas fa-check"></i> ${t('save')}</button><button class="btn btn-secondary close-modal"><i class="fas fa-times"></i> ${t('cancel')}</button></div>
        </div>
    `;
    document.body.appendChild(modal);
    const input = modal.querySelector('#rename-input');
    input.focus();
    const close = () => modal.remove();
    modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', close));
    modal.querySelector('#rename-confirm').onclick = async () => {
        const newName = input.value.trim();
        if (newName) await renameChat(chatId, newName);
        close();
    };
    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            const newName = input.value.trim();
            if (newName) renameChat(chatId, newName);
            close();
        }
    };
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

// ========== НАСТРОЙКИ ==========
function showSettingsModal() {
    if (settingsModalOpen) return;
    settingsModalOpen = true;
    const overlay = document.createElement('div');
    overlay.className = 'settings-modal-overlay';
    const sections = [
        { id: 'general', icon: 'fa-cog', title: t('settingsSectionGeneral') },
        { id: 'diamkey', icon: 'fa-key', title: t('settingsDiamKey') },
        { id: 'diamondai', icon: 'fa-gem', title: t('settingsDiamondAI') },
        { id: 'tutorial', icon: 'fa-question-circle', title: t('settingsTutorial') },
        { id: 'privacy', icon: 'fa-shield-alt', title: t('settingsSectionPrivacy') },
        { id: 'about', icon: 'fa-user', title: t('settingsSectionAbout') },
        { id: 'logout', icon: 'fa-sign-out-alt', title: t('settingsLogout') }
    ];
    overlay.innerHTML = `
        <div class="settings-modal">
            <div class="settings-left-panel">
                ${sections.map(s => {
                    let extraClass = '';
                    if (s.id === 'tutorial' && !tutorialCompleted) {
                        extraClass = 'tutorial-tab-highlight';
                    }
                    return `<button data-section="${s.id}" class="${s.id === 'general' ? 'active' : ''} ${extraClass}"><i class="fas ${s.icon}"></i> ${s.title}</button>`;
                }).join('')}
            </div>
            <div class="settings-right-content">
                <div class="settings-section active" id="section-general">
                    <h2><i class="fas fa-cog"></i> ${t('settingsSectionGeneral')}</h2>
                    <div class="settings-language-grid">
                        <button class="settings-lang-btn ${currentLanguage === 'ru' ? 'active' : ''}" data-lang="ru">Русский</button>
                        <button class="settings-lang-btn ${currentLanguage === 'en' ? 'active' : ''}" data-lang="en">English</button>
                    </div>
                    <p style="font-size:12px; color:var(--text-secondary); margin-top:8px;">${t('languageHint')}</p>
                </div>
                <div class="settings-section" id="section-diamkey">
                    <h2><i class="fas fa-key"></i> ${t('settingsDiamKey')}</h2>
                    <p>${t('settingsDiamKeyDesc')}</p>
                    <div class="diamkey-avatar-wrapper" id="diamkeyAvatarWrapper">
                        <img src="${currentUser?.avatar || ''}" alt="Avatar" id="diamkeyAvatarImg" onerror="this.style.display='none'">
                        <div class="diamkey-avatar-overlay"><i class="fas fa-pencil-alt"></i></div>
                    </div>
                    <div class="diamkey-profile-stats">
                        <div class="diamkey-stat-box">
                            <div class="diamkey-stat-number" id="diamkeyTotalChats">0</div>
                            <div class="diamkey-stat-label">${t('diamkeyTotalChats')}</div>
                        </div>
                        <div class="diamkey-stat-box">
                            <div class="diamkey-stat-number" id="diamkeyTotalMessages">0</div>
                            <div class="diamkey-stat-label">${t('diamkeyTotalMessages')}</div>
                        </div>
                    </div>
                    <div class="diamkey-input-group">
                        <label>${t('diamkeyNickname')}</label>
                        <input type="text" id="diamkeyNicknameInput" value="${escapeHtml(currentUser?.name || currentUser?.login || '')}">
                    </div>
                    <div class="diamkey-input-group">
                        <label>${t('diamkeyPassword')}</label>
                        <input type="password" id="diamkeyPasswordInput" placeholder="${t('diamkeyPassword')}">
                    </div>
                    <button class="btn btn-primary diamkey-save-btn" id="diamkeySaveBtn"><i class="fas fa-check"></i> ${t('diamkeySave')}</button>
                </div>
                <div class="settings-section" id="section-diamondai">
                    <h2><i class="fas fa-gem"></i> ${t('settingsDiamondAI')}</h2>
                    <p>${t('settingsDiamondAIDesc')}</p>
                    <a class="settings-link-btn" href="https://diamond-ai.ru" target="_blank"><i class="fas fa-globe"></i> ${t('settingsMainSite')}</a>
                </div>
                <div class="settings-section" id="section-tutorial">
                    <h2><i class="fas fa-question-circle"></i> ${t('settingsTutorial')}</h2>
                    <button class="settings-link-btn" id="settings-tutorial-btn"><i class="fas fa-play"></i> ${t('tutorial')}</button>
                    <p style="font-size:12px; color:var(--text-secondary); margin-top:8px;">${t('tutorialHint')}</p>
                    ${!tutorialCompleted ? `<p style="font-size:12px; color:var(--blink-color); margin-top:4px; animation: softBlink 2s infinite;">${t('tutorialNotCompletedHint')}</p>` : ''}
                </div>
                <div class="settings-section" id="section-privacy">
                    <h2><i class="fas fa-shield-alt"></i> ${t('settingsSectionPrivacy')}</h2>
                    <p>${t('settingsPrivacyText')}</p>
                    <h3>${t('settingsTerms')}</h3>
                    <p>${t('settingsTermsText')}</p>
                </div>
                <div class="settings-section" id="section-about">
                    <h2><i class="fas fa-user"></i> ${t('settingsSectionAbout')}</h2>
                    <p>${t('settingsAboutText')}</p>
                </div>
                <div class="settings-section" id="section-logout">
                    <h2><i class="fas fa-sign-out-alt"></i> ${t('settingsLogout')}</h2>
                    <p>${t('settingsLogoutConfirm')}</p>
                    <button class="settings-link-btn" id="settings-logout-btn" style="border-color: #c0392b; color: #e74c3c;"><i class="fas fa-sign-out-alt"></i> ${t('logout')}</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'settings-close-btn';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    overlay.querySelector('.settings-right-content').style.position = 'relative';
    overlay.querySelector('.settings-right-content').appendChild(closeBtn);

    const closeModal = () => {
        overlay.remove();
        settingsModalOpen = false;
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    overlay.querySelectorAll('.settings-left-panel button').forEach(btn => {
        btn.addEventListener('click', () => {
            overlay.querySelectorAll('.settings-left-panel button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const sectionId = btn.dataset.section;
            overlay.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
            overlay.querySelector(`#section-${sectionId}`).classList.add('active');
        });
    });

    overlay.querySelectorAll('.settings-lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === currentLanguage) return;
            setLanguage(lang);
            overlay.querySelectorAll('.settings-lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            overlay.remove();
            settingsModalOpen = false;
            showSettingsModal();
        });
    });

    const avatarWrapper = document.getElementById('diamkeyAvatarWrapper');
    if (avatarWrapper) {
        avatarWrapper.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = async (ev) => {
                const file = ev.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const avatarData = e.target.result;
                    await supabaseClient.from('users').update({ avatar: avatarData }).eq('login', currentUser.login);
                    currentUser.avatar = avatarData;
                    localStorage.setItem('diamond_user', JSON.stringify(currentUser));
                    document.getElementById('diamkeyAvatarImg').src = avatarData;
                    document.getElementById('diamkeyAvatarImg').style.display = 'block';
                    updateUserPanel();
                    showToast('Аватар обновлён', '', 'success');
                };
                reader.readAsDataURL(file);
            };
            fileInput.click();
        });
    }

    document.getElementById('diamkeySaveBtn').addEventListener('click', async () => {
        const newName = document.getElementById('diamkeyNicknameInput').value.trim();
        const newPass = document.getElementById('diamkeyPasswordInput').value.trim();
        if (!newName) return showToast('Ошибка', 'Никнейм не может быть пустым', 'warning');
        const updates = { name: newName };
        if (newPass) updates.password = newPass;
        await supabaseClient.from('users').update(updates).eq('login', currentUser.login);
        currentUser.name = newName;
        localStorage.setItem('diamond_user', JSON.stringify(currentUser));
        updateUserPanel();
        showToast('Профиль обновлён', '', 'success');
    });

    (async () => {
        try {
            const { data: chatsData } = await supabaseClient.from('diamond_chats').select('id,messages').eq('user_login', currentUser.login);
            const totalChats = chatsData ? chatsData.length : 0;
            const totalMessages = chatsData ? chatsData.reduce((sum, c) => sum + (c.messages ? c.messages.length : 0), 0) : 0;
            document.getElementById('diamkeyTotalChats').textContent = totalChats;
            document.getElementById('diamkeyTotalMessages').textContent = totalMessages;
        } catch(e) {}
    })();

    document.getElementById('settings-tutorial-btn')?.addEventListener('click', () => { closeModal(); startTutorial(); });
    document.getElementById('settings-logout-btn')?.addEventListener('click', () => { closeModal(); logout(); });
}

// ========== ОБУЧЕНИЕ ==========
const tutorialSteps = [
    { title: 'Добро пожаловать в Diamond AI!', html: `<p>Перед вами <strong style="color:var(--accent)">Diamond AI</strong> — ваш личный интеллектуальный помощник, работающий на передовой нейросети. Он способен отвечать на вопросы, решать задачи по математике, физике, химии, программированию, а также вести непринуждённую беседу. Все ваши чаты сохраняются в облаке и синхронизируются через DiamKey, поэтому вы не потеряете ни строчки даже при смене устройства.</p><p>В этом небольшом обучении я покажу основные элементы интерфейса и научу пользоваться главными функциями. Это займёт меньше минуты. Нажимайте <strong>«Далее»</strong>, чтобы продолжить.</p>`, demo: '', interactive: false },
    { title: 'Главный чат', html: `<p>Центральная часть экрана — это <strong style="color:var(--accent)">область диалога</strong>. Здесь отображаются ваши сообщения и ответы ИИ. Под диалогом находится поле ввода — просто начните печатать вопрос и нажмите кнопку отправки (стрелка вверх). ИИ мгновенно приступит к генерации ответа, а вы увидите индикатор печати.</p><p>Когда чат пуст, в поле ввода отображаются примеры запросов — попробуйте нажать на один из них, чтобы быстро начать разговор.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-comment"></i><div><strong>Пример:</strong><br><span style="color:var(--text-secondary)">«Расскажи про теорему Пифагора»</span></div></div>`, interactive: false },
    { title: 'Создание нового чата', html: `<p>Хотите обсудить новую тему, не смешивая её с предыдущими? Нажмите кнопку <strong style="color:var(--accent)">«Новый чат»</strong> (<i class="fas fa-feather-alt"></i>) в левом сайдбаре. Создастся пустой диалог, а после первого сообщения ИИ автоматически придумает для него название. Все чаты сохраняются в вашей учётной записи и будут доступны с любого устройства, где вы войдёте в DiamKey.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-feather-alt"></i><div><strong>Кнопка «Новый чат»</strong><br><span style="color:var(--text-secondary)">Находится в сайдбаре слева</span></div></div>`, interactive: false },
    { title: 'Папки для порядка', html: `<p>Когда чатов становится много, их удобно <strong style="color:var(--accent)">группировать по папкам</strong>. Перейдите на вкладку «Папки» (<i class="fas fa-folder"></i>) в сайдбаре. Там вы можете создавать папки, задавать им иконки и цвета, а затем переносить в них чаты. Например, можно сделать папки «Учёба», «Работа», «Код» и быстро находить нужные диалоги. Папки тоже синхронизируются через DiamKey.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-folder"></i><div><strong>Пример папки:</strong><br><span style="color:var(--text-secondary)">«Учёба», «Работа», «Код»</span></div></div>`, interactive: false },
    { title: 'Мастерская', html: `<p>Раздел <strong style="color:var(--accent)">«Мастерская»</strong> (<i class="fas fa-wrench"></i>) содержит специальные инструменты, расширяющие возможности ИИ. Сейчас там доступен инструмент <strong>«Распознать ИИ»</strong> — он анализирует текст и определяет, написан он человеком или сгенерирован другой нейросетью (GPT, Mistral и др.). В будущем появятся новые инструменты, такие как Code Review и Переводчик.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-wrench"></i><div><strong>Инструмент:</strong><br><span style="color:var(--text-secondary)">«Распознать ИИ» — анализ текста</span></div></div>`, interactive: false },
    { title: 'Твой профиль', html: `<p>В нижней части сайдбара расположена <strong style="color:var(--accent)">панель пользователя</strong>. Здесь отображаются ваш никнейм и аватар. Рядом — кнопка <strong style="color:var(--accent)">шестерёнки</strong> (<i class="fas fa-cog"></i>), открывающая настройки. В настройках можно сменить язык интерфейса, изменить данные профиля DiamKey (аватар, ник, пароль), запустить обучение заново или выйти из аккаунта.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-user-circle"></i><div><strong>Панель пользователя</strong><br><span style="color:var(--text-secondary)">Внизу сайдбара</span></div></div>`, interactive: false },
    { title: 'Поиск по истории', html: `<p>Если чатов накопилось очень много, воспользуйтесь <strong style="color:var(--accent)">поиском</strong> (<i class="fas fa-search"></i>) в верхней части сайдбара. Он ищет не только по названиям чатов, но и внутри самих сообщений, мгновенно фильтруя список. Найденный текст подсвечивается в диалоге.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-search"></i><div><strong>Поиск чатов</strong><br><span style="color:var(--text-secondary)">Мгновенная фильтрация</span></div></div>`, interactive: false },
    { title: 'Готово!', html: `<p>Отлично! Теперь вы знаете основы Diamond AI. Коротко повторим:</p><ul style="padding-left:20px; margin:10px 0;"><li><strong>Чат</strong> — общайтесь с ИИ, задавайте вопросы, решайте задачи</li><li><strong>Папки</strong> — наводите порядок, группируя диалоги</li><li><strong>Мастерская</strong> — включайте дополнительные инструменты</li><li><strong>Поиск</strong> — быстро находите нужные чаты</li><li><strong>Настройки</strong> — управляйте языком, профилем и обучением</li></ul><p>Если что-то забудете, просто нажмите на <strong style="color:var(--accent)">шестерёнку</strong> возле ника и выберите «Обучение». Приятного использования!</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-check-circle" style="color:#2ecc71;"></i><div><strong>Вы молодец!</strong><br><span style="color:var(--text-secondary)">Всё получится!</span></div></div>`, interactive: false }
];

async function startTutorial() {
    if (tutorialActive) return;
    tutorialActive = true;
    tutorialStep = 0;
    const overlay = document.getElementById('tutorialOverlay');
    overlay.style.display = 'flex';
    showTutorialStep();
}

async function closeTutorial() {
    tutorialActive = false;
    document.getElementById('tutorialOverlay').style.display = 'none';
    if (currentUser) {
        await supabaseClient.from('users').update({ obuchenie_check: true }).eq('login', currentUser.login);
        tutorialCompleted = true;
        updateUserPanel();
        if (settingsModalOpen) {
            const existing = document.querySelector('.settings-modal-overlay');
            if (existing) existing.remove();
            settingsModalOpen = false;
            showSettingsModal();
        }
    }
}

function nextTutorialStep() {
    if (tutorialStep < tutorialSteps.length - 1) { tutorialStep++; showTutorialStep(); }
    else closeTutorial();
}

function prevTutorialStep() {
    if (tutorialStep > 0) { tutorialStep--; showTutorialStep(); }
}

function showTutorialStep() {
    const step = tutorialSteps[tutorialStep];
    const overlay = document.getElementById('tutorialOverlay');
    let dots = '';
    for (let i = 0; i < tutorialSteps.length; i++) {
        let cls = '';
        if (i === tutorialStep) cls = 'active';
        else if (i < tutorialStep) cls = 'done';
        dots += `<div class="tutorial-step-dot ${cls}"></div>`;
    }
    const modal = document.createElement('div');
    modal.className = 'tutorial-modal';
    modal.innerHTML = `
        <div class="tutorial-header"><h2>${step.title}</h2></div>
        <div class="tutorial-step-indicator">${dots}</div>
        <div class="tutorial-body">
            <div id="tutorialContent" class="tutorial-fade-text">${step.html}</div>
            ${step.demo ? step.demo : ''}
        </div>
        <div class="tutorial-footer">
            <button class="tutorial-btn" id="tutorialPrev" ${tutorialStep === 0 ? 'style="visibility:hidden"' : ''}><i class="fas fa-arrow-left"></i> ${t('tutorialPrev')}</button>
            <span style="font-size:12px; color:var(--text-secondary);">${tutorialStep + 1} / ${tutorialSteps.length}</span>
            <button class="tutorial-btn primary" id="tutorialNext">${tutorialStep === tutorialSteps.length - 1 ? t('tutorialFinish') : t('tutorialNext')} <i class="fas fa-arrow-right"></i></button>
        </div>
    `;
    overlay.innerHTML = '';
    overlay.appendChild(modal);
    const contentEl = document.getElementById('tutorialContent');
    if (contentEl) {
        requestAnimationFrame(() => {
            contentEl.classList.add('show');
        });
    }
    document.getElementById('tutorialNext').addEventListener('click', nextTutorialStep);
    if (tutorialStep > 0) {
        document.getElementById('tutorialPrev').addEventListener('click', prevTutorialStep);
    }
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
function setupEventListeners() {
    document.getElementById('sidebarToggleBtn')?.addEventListener('click', toggleSidebar);
    document.getElementById('new-chat-btn')?.addEventListener('click', createNewChat);
    document.getElementById('folders-page-btn')?.addEventListener('click', switchToFoldersView);
    document.getElementById('workshop-page-btn')?.addEventListener('click', switchToWorkshopView);
    document.getElementById('collapsedNewChat')?.addEventListener('click', createNewChat);
    document.getElementById('collapsedFolders')?.addEventListener('click', switchToFoldersView);
    document.getElementById('collapsedWorkshop')?.addEventListener('click', switchToWorkshopView);
    document.getElementById('user-input')?.addEventListener('input', function() {
        if (this.value.trim() === '') {
            this.style.height = '';
        } else {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        }
        updateSendButtonState();
    });
    document.getElementById('user-input')?.addEventListener('keydown', e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} });
    document.getElementById('send-btn')?.addEventListener('click', sendMessage);
    document.getElementById('history-search')?.addEventListener('input', renderHistory);
    document.getElementById('settingsBtn')?.addEventListener('click', showSettingsModal);
    document.getElementById('diamkeyOAuthBtn')?.addEventListener('click', redirectToDiamKeyOAuth);
    document.getElementById('tabLogin')?.addEventListener('click', ()=>{ document.getElementById('tabLogin').classList.add('active'); document.getElementById('tabRegister').classList.remove('active'); document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; });
    document.getElementById('tabRegister')?.addEventListener('click', ()=>{ document.getElementById('tabRegister').classList.add('active'); document.getElementById('tabLogin').classList.remove('active'); document.getElementById('registerForm').style.display='block'; document.getElementById('loginForm').style.display='none'; });
    document.getElementById('doLoginBtn')?.addEventListener('click', login);
    document.getElementById('doRegisterBtn')?.addEventListener('click', register);
}

// ========== ПРИКРЕПЛЕНИЕ ФАЙЛОВ ==========
function setupFileAttachment() {
    try {
        const inputWrapper = document.querySelector('.input-wrapper');
        if (!inputWrapper || fileInputEl) return;

        fileInputEl = document.createElement('input');
        fileInputEl.type = 'file';
        fileInputEl.accept = '.png,.jpg,.jpeg,.html,.js,.css,.docx';
        fileInputEl.style.display = 'none';
        document.body.appendChild(fileInputEl);

        const attachBtn = document.createElement('button');
        attachBtn.className = 'attach-btn';
        attachBtn.innerHTML = '<i class="fas fa-paperclip"></i>';
        attachBtn.title = t('attachFile');
        attachBtn.addEventListener('click', () => fileInputEl.click());

        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            inputWrapper.appendChild(attachBtn); // просто добавляем в конец, а не вставляем перед sendBtn
        } else {
            inputWrapper.appendChild(attachBtn);
        }

        fileInputEl.addEventListener('change', handleFileSelect);
    } catch (e) {
        console.warn('Ошибка setupFileAttachment:', e);
    }
}

async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'text/html', 'application/javascript', 'text/css', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.js') && !file.name.endsWith('.css')) {
        showToast(t('fileUnsupported'), t('fileUnsupportedDesc'), 'error');
        fileInputEl.value = '';
        return;
    }

    showAttachmentPreview(file);
    fileInputEl.value = '';

    let content = '';
    const type = file.type;
    try {
        if (type.startsWith('image/')) {
            content = await performOCR(file);
        } else if (type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm')) {
            content = await readFileAsText(file);
        } else if (type === 'application/javascript' || file.name.endsWith('.js')) {
            content = await readFileAsText(file);
        } else if (type === 'text/css' || file.name.endsWith('.css')) {
            content = await readFileAsText(file);
        } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
            content = await readDocx(file);
        } else {
            content = await readFileAsText(file);
        }
    } catch (err) {
        console.error('Ошибка обработки файла:', err);
        showToast(t('fileError'), '', 'error');
        removeAttachmentPreview();
        return;
    }

    const attachment = {
        file: file,
        type: type,
        name: file.name,
        size: file.size,
        content: content
    };

    if (currentChatId) {
        chatAttachments[currentChatId] = attachment;
    }

    updateAttachmentStatus(t('fileReady'));
}

function showAttachmentPreviewFromData(data) {
    let preview = document.querySelector('.attachment-preview-container');
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'attachment-preview-container';
        const inputArea = document.getElementById('inputArea');
        inputArea.parentNode.insertBefore(preview, inputArea);
    }
    const ext = data.name.split('.').pop().toLowerCase();
    const logoMap = {
        'png': 'assets/png.png', 'jpg': 'assets/jpg.png', 'jpeg': 'assets/jpg.png',
        'html': 'assets/html.png', 'js': 'assets/js.png', 'css': 'assets/css.png',
        'docx': 'assets/docx.png'
    };
    const logo = logoMap[ext] || 'assets/png.png';
    preview.innerHTML = `
        <div class="attachment-card">
            <div class="attachment-icon"><img src="${logo}" alt="${ext}"></div>
            <div class="attachment-info">
                <div class="attachment-name">${escapeHtml(data.name)}</div>
                <div class="attachment-meta">${formatFileSize(data.size)}</div>
            </div>
            <div class="attachment-status"><i class="fas fa-check"></i> ${t('fileReady')}</div>
            <button class="attachment-remove" id="attach-remove"><i class="fas fa-times"></i></button>
        </div>
    `;
    document.getElementById('attach-remove').addEventListener('click', () => {
        delete chatAttachments[currentChatId];
        removeAttachmentPreview();
    });
}

function showAttachmentPreview(file) {
    let preview = document.querySelector('.attachment-preview-container');
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'attachment-preview-container';
        const inputArea = document.getElementById('inputArea');
        inputArea.parentNode.insertBefore(preview, inputArea);
    }
    const ext = file.name.split('.').pop().toLowerCase();
    const logoMap = {
        'png': 'assets/png.png', 'jpg': 'assets/jpg.png', 'jpeg': 'assets/jpg.png',
        'html': 'assets/html.png', 'js': 'assets/js.png', 'css': 'assets/css.png',
        'docx': 'assets/docx.png'
    };
    const logo = logoMap[ext] || 'assets/png.png';
    preview.innerHTML = `
        <div class="attachment-card">
            <div class="attachment-icon"><img src="${logo}" alt="${ext}"></div>
            <div class="attachment-info">
                <div class="attachment-name">${escapeHtml(file.name)}</div>
                <div class="attachment-meta">${formatFileSize(file.size)}</div>
                <div class="attachment-progress"><div class="attachment-progress-bar" id="attach-progress"></div></div>
            </div>
            <div class="attachment-status" id="attach-status"><i class="fas fa-spinner fa-spin"></i> ${t('fileProcessing')}</div>
            <button class="attachment-remove" id="attach-remove"><i class="fas fa-times"></i></button>
        </div>
    `;
    document.getElementById('attach-remove').addEventListener('click', () => {
        delete chatAttachments[currentChatId];
        removeAttachmentPreview();
    });
}

function updateAttachmentStatus(status) {
    const statusEl = document.getElementById('attach-status');
    const progressBar = document.getElementById('attach-progress');
    if (statusEl) {
        statusEl.innerHTML = status === t('fileReady') ? `<i class="fas fa-check"></i> ${status}` : status;
    }
    if (progressBar) {
        progressBar.style.width = '100%';
    }
}

function removeAttachmentPreview() {
    const preview = document.querySelector('.attachment-preview-container');
    if (preview) preview.remove();
}

function clearAttachmentPreview() {
    removeAttachmentPreview();
}

// ========== САЙДБАР (исправлен) ==========
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const titleBar = document.getElementById('titleBar');
    const collapsedActions = document.getElementById('collapsedActions');
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        sidebar.classList.toggle('open');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    } else {
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);
        if (titleBar) titleBar.classList.toggle('collapsed', sidebarCollapsed);
        if (collapsedActions) collapsedActions.classList.toggle('show', sidebarCollapsed);
    }

    // Фикс: гарантируем, что сайдабар не уедет за левый край
    if (!sidebar.classList.contains('collapsed') && !sidebar.classList.contains('open')) {
        sidebar.style.transform = '';
        sidebar.style.left = '';
    }
}

// Гарантированно возвращаем сайдабар на место при ресайзе
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    const titleBar = document.getElementById('titleBar');
    const collapsedActions = document.getElementById('collapsedActions');
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        sidebar.classList.remove('collapsed');
        sidebar.style.transform = '';
        sidebar.style.left = '';
        if (titleBar) titleBar.classList.remove('collapsed');
        if (collapsedActions) collapsedActions.classList.remove('show');
    } else {
        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            if (titleBar) titleBar.classList.add('collapsed');
            if (collapsedActions) collapsedActions.classList.add('show');
        } else {
            sidebar.classList.remove('collapsed');
            sidebar.style.transform = '';
            sidebar.style.left = '';
            if (titleBar) titleBar.classList.remove('collapsed');
            if (collapsedActions) collapsedActions.classList.remove('show');
        }
    }
});

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebarToggleBtn');
        if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
});

// ========== ОБНОВЛЕНИЕ КНОПКИ ОТПРАВКИ ==========
function updateSendButtonState() {
    const btn = document.getElementById('send-btn');
    const input = document.getElementById('user-input');
    const hasAttachment = currentChatId && chatAttachments[currentChatId];
    if (btn) btn.disabled = (!input.value.trim() && !hasAttachment) || isWaitingForResponse;
}

// ========== ИСПРАВЛЕННЫЙ LOGOUT ==========
function logout() {
    currentUser = null;
    mistralApiKey = '';
    localStorage.removeItem('diamond_user');
    document.getElementById('mainUI').style.display = 'none';
    document.getElementById('choiceScreen').style.display = 'flex';
    chatAttachments = {};
    if (settingsModalOpen) {
        const overlay = document.querySelector('.settings-modal-overlay');
        if (overlay) overlay.remove();
        settingsModalOpen = false;
    }
    const btn = document.getElementById('diamkeyOAuthBtn');
    if (btn) {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        });
    }
    showToast(t('logout'), '', 'info');
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
(async function() {
    log('Загрузка...');
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').catch(()=>{}); }
    const savedLang = localStorage.getItem('diamond_language');
    if (savedLang && ['ru','en'].includes(savedLang)) currentLanguage = savedLang;
    loadWorkshopToolsState();
    fetchApiKeys().then(() => log('API ключи загружены'));

    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get('ticket');
    const savedUser = localStorage.getItem('diamond_user');

    if (ticket) {
        const ws = document.getElementById('welcomeScreen');
        ws.innerHTML = `
            <div style="text-align:center; color:var(--text-primary); animation: fadeIn 0.5s ease;">
                <i class="fas fa-check-circle" style="font-size:5rem; color:#5d9b7a; animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></i>
                <h2 style="margin-top:20px; font-weight:600;">Вошли! Успешного пользования!</h2>
            </div>
        `;
        ws.style.display = 'flex';
        const startTime = Date.now();
        const oauthSuccess = await processOAuthTicket();
        if (!oauthSuccess) {
            ws.style.display = 'none';
            document.getElementById('choiceScreen').style.display = 'flex';
            return;
        }
        await Promise.all([
            loadChatsAndFolders(),
            refreshUserProfile(),
            loadForumMessages()
        ]);
        if (workshopTools.ai_detect) await createToolChatWithGreeting('ai_detect');
        if (workshopTools.knowledge_rag) await createToolChatWithGreeting('knowledge_rag');
        const elapsed = Date.now() - startTime;
        if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));
        ws.style.display = 'none';
        document.getElementById('choiceScreen').style.display = 'none';
        document.getElementById('mainUI').style.display = 'flex';
        setTimeout(() => document.getElementById('mainUI').classList.add('visible'), 50);
        updateUserPanel();
        setupFileAttachment();
        if (chats.length === 0) renderEmptyState(); else renderChat();
        renderHistory();
        cacheChats(chats);
        cacheFolders(folders);
        cacheProfile(currentUser);
    } else if (savedUser) {
        const cachedProfile = await getCachedProfile();
        const isSameUser = cachedProfile && cachedProfile.login === JSON.parse(savedUser).login;
        if (isSameUser) {
            const cachedChats = await getCachedChats();
            const cachedFolders = await getCachedFolders();
            if (cachedChats && cachedChats.length > 0) {
                currentUser = cachedProfile;
                chats = cachedChats;
                folders = cachedFolders || [];
                document.getElementById('choiceScreen').style.display = 'none';
                document.getElementById('mainUI').style.display = 'flex';
                setTimeout(() => document.getElementById('mainUI').classList.add('visible'), 50);
                updateUserPanel();
                setupFileAttachment();
                if (chats.length === 0) renderEmptyState(); else renderChat();
                renderHistory();
                (async () => {
                    await loadChatsAndFolders();
                    await refreshUserProfile();
                    await loadForumMessages();
                    if (workshopTools.ai_detect) await createToolChatWithGreeting('ai_detect');
                    if (workshopTools.knowledge_rag) await createToolChatWithGreeting('knowledge_rag');
                    renderHistory();
                    renderChat();
                    cacheChats(chats);
                    cacheFolders(folders);
                    cacheProfile(currentUser);
                })();
            } else {
                currentUser = JSON.parse(savedUser);
                await Promise.all([
                    loadChatsAndFolders(),
                    refreshUserProfile(),
                    loadForumMessages()
                ]);
                if (workshopTools.ai_detect) await createToolChatWithGreeting('ai_detect');
                if (workshopTools.knowledge_rag) await createToolChatWithGreeting('knowledge_rag');
                document.getElementById('choiceScreen').style.display = 'none';
                document.getElementById('mainUI').style.display = 'flex';
                setTimeout(() => document.getElementById('mainUI').classList.add('visible'), 50);
                updateUserPanel();
                setupFileAttachment();
                if (chats.length === 0) renderEmptyState(); else renderChat();
                renderHistory();
                cacheChats(chats);
                cacheFolders(folders);
                cacheProfile(currentUser);
            }
        } else {
            currentUser = JSON.parse(savedUser);
            await Promise.all([
                loadChatsAndFolders(),
                refreshUserProfile(),
                loadForumMessages()
            ]);
            if (workshopTools.ai_detect) await createToolChatWithGreeting('ai_detect');
            if (workshopTools.knowledge_rag) await createToolChatWithGreeting('knowledge_rag');
            document.getElementById('choiceScreen').style.display = 'none';
            document.getElementById('mainUI').style.display = 'flex';
            setTimeout(() => document.getElementById('mainUI').classList.add('visible'), 50);
            updateUserPanel();
            setupFileAttachment();
            if (chats.length === 0) renderEmptyState(); else renderChat();
            renderHistory();
            cacheChats(chats);
            cacheFolders(folders);
            cacheProfile(currentUser);
        }
    } else {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('choiceScreen').style.display = 'flex';
        const btn = document.getElementById('diamkeyOAuthBtn');
        if (btn) {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(10px)';
            requestAnimationFrame(() => {
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
            });
        }
    }

    setupEventListeners();
    updateUILanguage();
    updateUserPanel();
    updateSendButtonState();
    if (chats.length) renderHistory();
    document.documentElement.style.setProperty('--collapsed-left-offset', '85px');
    log('Готово');
})();
