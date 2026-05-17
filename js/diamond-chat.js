// ==================== DIAMOND AI v46 — ЧАТЫ И ПАПКИ ====================

async function loadChatsAndFolders() {
    if (!currentUser) return;
    try {
        const [chatsRes, foldersRes] = await Promise.all([
            supabaseClient.from('diamond_chats').select('*').eq('user_login', currentUser.login),
            supabaseClient.from('diamond_folders').select('*').eq('user_login', currentUser.login)
        ]);
        if (chatsRes.error) throw chatsRes.error;
        if (foldersRes.error) throw foldersRes.error;
        chats = chatsRes.data.map(c => {
            const chat = { ...c, messages: c.messages || [], pinned: c.pinned || false };
            if (chat.id && chat.id.startsWith('tool_')) {
                const toolId = chat.id.replace('tool_', '');
                const toolInfo = getToolInfo(toolId);
                if (toolInfo) chat.title = toolInfo.title;
            }
            return chat;
        });
        folders = foldersRes.data;
        chats.sort((a, b) => b.last_activity - a.last_activity);
        currentChatId = chats.length ? chats[0].id : null;
        renderHistory();
        renderChat();
    } catch (e) {
        console.error('Ошибка загрузки чатов/папок:', e);
        showToast(t('errorLoadChats'), '', 'error');
    }
}

async function saveChatToSupabase(chat) {
    if (!currentUser) return;
    const { id, title, created_at, last_activity, pinned, folder_id, messages } = chat;
    let finalTitle = title;
    if (id && id.startsWith('tool_')) {
        const toolId = id.replace('tool_', '');
        const toolInfo = getToolInfo(toolId);
        if (toolInfo) finalTitle = toolInfo.title;
    }
    const { error } = await supabaseClient.from('diamond_chats').upsert({
        id,
        user_login: currentUser.login,
        title: finalTitle,
        created_at,
        last_activity,
        pinned,
        folder_id,
        messages
    });
    if (error) { console.error('Ошибка сохранения чата:', error); }
}

async function saveFolderToSupabase(folder) {
    if (!currentUser) return;
    const { error } = await supabaseClient.from('diamond_folders').upsert({
        id: folder.id,
        user_login: currentUser.login,
        name: folder.name,
        description: folder.description,
        icon: folder.icon,
        color: folder.color,
        created_at: folder.createdAt || folder.created_at || Date.now()
    });
    if (error) { console.error('Ошибка сохранения папки:', error); }
}

async function deleteChatFromSupabase(chatId) {
    if (!currentUser) return;
    const { error } = await supabaseClient.from('diamond_chats').delete().eq('id', chatId).eq('user_login', currentUser.login);
    if (error) { console.error('Ошибка удаления чата:', error); }
    delete chatAttachments[chatId];
}

async function deleteFolderFromSupabase(folderId) {
    if (!currentUser) return;
    const { error } = await supabaseClient.from('diamond_folders').delete().eq('id', folderId).eq('user_login', currentUser.login);
    if (error) { console.error('Ошибка удаления папки:', error); }
}

function generateChatTitle(msg) {
    return msg.length > 50 ? msg.slice(0, 47) + '...' : msg;
}

async function generateChatTitleWithAI(text) {
    if (!mistralApiKey) return generateChatTitle(text);
    try {
        const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${mistralApiKey}` },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [TITLE_GENERATOR_PROMPT, { role: 'user', content: text }],
                temperature: 0.5,
                max_tokens: 20
            })
        });
        if (resp.ok) {
            const data = await resp.json();
            let title = data.choices[0].message.content.trim();
            const lowerTitle = title.toLowerCase();
            if (!title || lowerTitle === 'название чата' || lowerTitle === 'chat title' || lowerTitle === 'название' || lowerTitle === 'title') {
                return generateChatTitle(text);
            }
            return title.length > 50 ? title.slice(0, 47) + '...' : title;
        }
    } catch(e) {}
    return generateChatTitle(text);
}

async function createNewChat() {
    currentChatId = null;
    switchToChatView();
    renderEmptyState();
    clearAttachmentPreview();
}

async function deleteChat(id) {
    if (id && id.startsWith('tool_')) {
        showToast('Нельзя удалить', 'Инструментальные чаты не удаляются', 'warning');
        return;
    }
    const chat = chats.find(c => c.id === id);
    if (chat && confirm(t('confirmDeleteChat'))) {
        await deleteChatFromSupabase(id);
        chats = chats.filter(c => c.id !== id);
        if (currentChatId === id) currentChatId = chats.length ? chats[0].id : null;
        renderHistory();
        renderChat();
        if (chats.length === 0) renderEmptyState();
        showToast('Чат удалён', '', 'success');
    }
}

async function switchChat(id) {
    if (currentChatId && chatAttachments[currentChatId]) {
        // already saved
    }
    currentChatId = id;
    switchToChatView();
    renderChat();
    renderHistory();
    clearAttachmentPreview();
    const att = chatAttachments[id];
    if (att) {
        showAttachmentPreviewFromData(att);
    } else {
        removeAttachmentPreview();
    }
    const input = document.getElementById('user-input');
    if (input) input.style.height = '';
}

async function togglePin(id) {
    const chat = chats.find(c => c.id === id);
    if (chat) {
        chat.pinned = !chat.pinned;
        await saveChatToSupabase(chat);
        renderHistory();
        showToast(chat.pinned ? t('pinChat') : t('unpinChat'), '', 'success');
    }
}

async function renameChat(id, newTitle) {
    if (id && id.startsWith('tool_')) return;
    const chat = chats.find(c => c.id === id);
    if (chat) {
        chat.title = newTitle;
        await saveChatToSupabase(chat);
        renderHistory();
        showToast(t('renameChat'), newTitle, 'success');
    }
}

async function moveChatToFolder(chatId, folderId) {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
        chat.folder_id = folderId || null;
        await saveChatToSupabase(chat);
        renderHistory();
        renderFoldersPage();
        showToast(t('chatMoved'), folderId ? 'В папку' : 'Из папки', 'success');
    }
}

async function createFolder(name, desc, icon, color) {
    const id = Date.now().toString();
    const folder = {
        id,
        name: name.trim(),
        description: desc || '',
        icon: icon || 'fa-folder',
        color: color || '#95a5a6',
        createdAt: Date.now()
    };
    folders.push(folder);
    await saveFolderToSupabase(folder);
    renderFoldersPage();
    showToast(t('createFolderTitle'), name, 'success');
}

async function updateFolder(id, name, desc, icon, color) {
    const f = folders.find(f => f.id === id);
    if (f) {
        f.name = name.trim();
        f.description = desc || '';
        f.icon = icon || 'fa-folder';
        f.color = color || '#95a5a6';
        await saveFolderToSupabase(f);
        renderFoldersPage();
        showToast(t('editFolder'), name, 'success');
    }
}

async function deleteFolder(id) {
    const f = folders.find(f => f.id === id);
    if (f && confirm(t('confirmDeleteFolder'))) {
        await deleteFolderFromSupabase(id);
        folders = folders.filter(f => f.id !== id);
        for (const chat of chats) {
            if (chat.folder_id === id) {
                chat.folder_id = null;
                await saveChatToSupabase(chat);
            }
        }
        renderFoldersPage();
        renderHistory();
        showToast('Папка удалена', f.name, 'info');
    }
}

// ========== ОТПРАВКА СООБЩЕНИЙ ==========

async function sendMessage() {
    const text = document.getElementById('user-input').value.trim();
    const attachment = currentChatId ? chatAttachments[currentChatId] : null;
    if ((!text && !attachment) || isWaitingForResponse) return;
    if (!mistralApiKey) { showToast(t('errorApiKey'), '', 'error'); return; }
    let chat = chats.find(c => c.id === currentChatId);
    if (!chat || chat.messages.length === 0) {
        const now = Date.now();
        const isTool = currentChatId && currentChatId.startsWith('tool_');
        if (isTool) {
            chat = chats.find(c => c.id === currentChatId);
            if (!chat) { showToast('Ошибка', 'Инструментальный чат не найден', 'error'); return; }
        } else {
            chat = {
                id: now.toString(),
                title: generateChatTitle(text || (attachment ? attachment.name : '')),
                messages: [],
                created_at: now,
                last_activity: now,
                pinned: false,
                folder_id: null,
                isTool: false
            };
            chats.unshift(chat);
            currentChatId = chat.id;
            if (attachment) chatAttachments[currentChatId] = attachment;
            await saveChatToSupabase(chat);
            renderHistory();
            document.getElementById('inputArea').style.display = 'flex';
        }
    }

    const userText = text || '';
    const attachmentData = attachment ? { type: attachment.type, name: attachment.name, size: attachment.size } : null;
    await addMessageToDOM('user', userText, true, attachmentData);
    const input = document.getElementById('user-input');
    input.value = '';
    input.style.height = '';
    updateSendButtonState();
    removeAttachmentPreview();
    delete chatAttachments[currentChatId];

    await sendRequest(userText);
}

async function sendRequest(prompt) {
    if (!mistralApiKey || isWaitingForResponse) return;
    isWaitingForResponse = true;
    updateSendButtonState();

    const card = createThinkingCard();
    const anim = startThinkingAnimation(card);
    scrollToBottom();

    let systemPrompt = (currentChatId && currentChatId.startsWith('tool_')) ? TOOL_SYSTEM_PROMPTS[currentChatId.replace('tool_','')] || SYSTEM_PROMPT : SYSTEM_PROMPT;
    const controller = new AbortController();
    currentAbortController = controller;

    let success = false, assistantMessage = '';
    let errorName = null;
    try {
        const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${mistralApiKey}` },
            body: JSON.stringify({ model: AI_MODEL, messages: [systemPrompt, { role: 'user', content: prompt }], temperature: 0.3, max_tokens: 1500 }),
            signal: controller.signal
        });
        if (resp.ok) {
            const data = await resp.json();
            assistantMessage = data.choices[0].message.content;
            success = true;
        }
    } catch (e) {
        errorName = e.name;
        if (e.name === 'AbortError') {
            console.log('Request aborted');
        } else {
            console.warn('Mistral error:', e);
        }
    }

    const generationTime = stopThinkingAnimation(card, anim);

    if (success && assistantMessage) {
        await addMessageToDOM('assistant', assistantMessage, true, null, generationTime);
    } else if (!success && errorName !== 'AbortError') {
        await addMessageToDOM('assistant', '❌ Не удалось получить ответ. Попробуйте позже.', true, null, generationTime);
    }

    isWaitingForResponse = false;
    currentAbortController = null;
    updateSendButtonState();
    scrollToBottom();
}

function stopGeneration() {
    if (currentAbortController) {
        currentAbortController.abort();
    }
}

async function regenerateResponseFromMsg(msg, idx) {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat || isWaitingForResponse) return;

    const msgElement = document.querySelector(`.message.assistant:nth-child(${idx + 1})`);
    if (msgElement) {
        msgElement.style.transition = 'opacity 0.3s ease';
        msgElement.style.opacity = '0';
    }

    const userMsgs = chat.messages.filter(m => m.role === 'user' && !m.isTyping);
    if (userMsgs.length === 0) return;
    const lastUserMsg = userMsgs[userMsgs.length - 1];
    const prompt = lastUserMsg.content;

    isWaitingForResponse = true;
    updateSendButtonState();

    const card = createThinkingCard();
    const anim = startThinkingAnimation(card);
    scrollToBottom();

    let systemPrompt = (chat.id && chat.id.startsWith('tool_')) ? TOOL_SYSTEM_PROMPTS[chat.id.replace('tool_','')] || SYSTEM_PROMPT : SYSTEM_PROMPT;
    const contextMessages = chat.messages.filter(m => !m.isTyping && m !== msg).slice(-15);
    const messagesForAI = [
        systemPrompt,
        ...contextMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt }
    ];

    const controller = new AbortController();
    currentAbortController = controller;
    let success = false, newAnswer = '';
    let errorName = null;
    try {
        const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${mistralApiKey}` },
            body: JSON.stringify({ model: AI_MODEL, messages: messagesForAI, temperature: 0.3, max_tokens: 1500 }),
            signal: controller.signal
        });
        if (resp.ok) {
            const data = await resp.json();
            newAnswer = data.choices[0].message.content;
            success = true;
        }
    } catch (e) {
        errorName = e.name;
        if (e.name === 'AbortError') console.log('Request aborted');
        else console.warn('Mistral error:', e);
    }

    const generationTime = stopThinkingAnimation(card, anim);

    if (msgElement) {
        msgElement.style.opacity = '1';
    }

    if (success && newAnswer) {
        let variants = msg.variants || [msg.content];
        variants.push(newAnswer);
        msg.variants = variants;
        msg.currentVariant = variants.length - 1;
        msg.content = newAnswer;
        msg.generationTime = generationTime;
        await saveChatToSupabase(chat);
    } else if (!success && errorName !== 'AbortError') {
        showToast('Ошибка', 'Не удалось регенерировать ответ', 'error');
    }

    isWaitingForResponse = false;
    currentAbortController = null;
    updateSendButtonState();
    renderChat();
    scrollToBottom();
}

// ========== ПЛАШКА «ДУМАЮ» ==========
function createThinkingCard() {
    const container = document.getElementById('messages-container');
    if (!container) return null;
    const card = document.createElement('div');
    card.className = 'thinking-card';
    card.id = 'thinking-card';
    card.innerHTML = `
        <div class="thinking-card-content">
            <div class="thinking-card-icon"><i class="fas fa-feather-alt"></i></div>
            <div class="thinking-card-text">Думаю…</div>
            <div class="thinking-card-timer">0.0 с</div>
            <button class="thinking-card-cancel" title="Отменить"><i class="fas fa-times"></i></button>
        </div>
    `;
    container.appendChild(card);
    scrollToBottom();

    const cancelBtn = card.querySelector('.thinking-card-cancel');
    cancelBtn.addEventListener('click', () => {
        if (currentAbortController) {
            currentAbortController.abort();
        }
    });
    return card;
}

function startThinkingAnimation(card) {
    const states = [
        { icon: 'fa-feather-alt', text: 'Думаю…' },
        { icon: 'fa-brain', text: 'Анализирую…' },
        { icon: 'fa-pen', text: 'Генерирую ответ…' },
        { icon: 'fa-spinner', text: 'Проверяю факты…' },
        { icon: 'fa-cog', text: 'Форматирую…' },
        { icon: 'fa-comment-dots', text: 'Почти готово…' }
    ];
    let stateIndex = 0;
    const startTime = Date.now();
    const timerEl = card.querySelector('.thinking-card-timer');
    const iconEl = card.querySelector('.thinking-card-icon i');
    const textEl = card.querySelector('.thinking-card-text');

    const timerInterval = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        timerEl.textContent = elapsed + ' ' + t('sec');
    }, 100);

    const stateInterval = setInterval(() => {
        stateIndex = (stateIndex + 1) % states.length;
        const state = states[stateIndex];
        iconEl.className = 'fas ' + state.icon;
        textEl.style.opacity = '0';
        setTimeout(() => {
            textEl.textContent = state.text;
            textEl.style.opacity = '1';
        }, 200);
    }, 1500);

    return { timerInterval, stateInterval, startTime };
}

function stopThinkingAnimation(card, anim) {
    clearInterval(anim.timerInterval);
    clearInterval(anim.stateInterval);
    if (card) {
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 300);
    }
    return ((Date.now() - anim.startTime) / 1000).toFixed(1);
}

// ========== ДОБАВЛЕНИЕ СООБЩЕНИЯ В ЧАТ ==========
async function addMessageToDOM(role, content, save = true, attachment = null, generationTime = null) {
    const timestamp = Date.now();
    const messageId = timestamp + Math.random();
    if (save) {
        const chat = chats.find(c => c.id === currentChatId);
        if (chat) {
            if (!chat.messages) chat.messages = [];
            const msg = { id: messageId, role, content, timestamp, isTyping: false, attachment };
            if (generationTime) msg.generationTime = generationTime;
            chat.messages.push(msg);
            chat.last_activity = timestamp;
            if (role === 'user' && !chat.id.startsWith('tool_') && chat.messages.filter(m => m.role === 'user').length === 1) {
                generateChatTitleWithAI(content).then(title => {
                    chat.title = title;
                    saveChatToSupabase(chat);
                    renderHistory();
                    const headerEl = document.getElementById('chatHeader');
                    if (headerEl) headerEl.innerHTML = `<i class="fas fa-feather-alt"></i> ${escapeHtml(chat.title)}`;
                });
            }
            await saveChatToSupabase(chat);
        }
    }
    renderChat();
    return messageId;
}
