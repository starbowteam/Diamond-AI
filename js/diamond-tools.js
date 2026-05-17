// ==================== DIAMOND AI v46 — МАСТЕРСКАЯ, ИНСТРУМЕНТЫ, ФОРУМ, OCR ====================

function getToolInfo(toolId) {
    const tools = {
        ai_detect: { icon: 'fa-search', title: t('aiDetect'), color: 'var(--accent)' },
        knowledge_rag: { icon: 'fa-book', title: t('documents'), color: '#3498db' }
    };
    return tools[toolId] || { icon: 'fa-wrench', title: 'Инструмент', color: 'var(--accent)' };
}

async function createToolChatWithGreeting(toolId) {
    const toolChatId = 'tool_' + toolId;
    if (chats.find(c => c.id === toolChatId)) return;
    const toolInfo = getToolInfo(toolId);
    const greetingMsg = toolId === 'ai_detect' ? t('aiDetectGreeting') : t('documentsGreeting');
    const toolChat = {
        id: toolChatId,
        title: toolInfo.title,
        messages: [{
            id: Date.now().toString(),
            role: 'assistant',
            content: greetingMsg,
            timestamp: Date.now(),
            isTyping: false
        }],
        created_at: Date.now(),
        last_activity: Date.now(),
        pinned: false,
        folder_id: null,
        isTool: true,
        toolId: toolId
    };
    chats.unshift(toolChat);
    await saveChatToSupabase(toolChat);
}

async function removeToolChat(toolId) {
    const toolChatId = 'tool_' + toolId;
    const idx = chats.findIndex(c => c.id === toolChatId);
    if (idx !== -1) {
        if (currentChatId === toolChatId) currentChatId = null;
        await deleteChatFromSupabase(toolChatId);
        chats.splice(idx, 1);
    }
}

async function toggleWorkshopTool(toolId) {
    if (toolId !== 'ai_detect' && toolId !== 'knowledge_rag') return;
    workshopTools[toolId] = !workshopTools[toolId];
    saveWorkshopToolsState();
    if (workshopTools[toolId]) {
        await createToolChatWithGreeting(toolId);
        showToast(t('toolActive'), `Чат «${getToolInfo(toolId).title}» активен`, 'success');
    } else {
        await removeToolChat(toolId);
        showToast(t('toolInactive'), `Чат «${getToolInfo(toolId).title}» скрыт`, 'info');
        if (currentChatId === 'tool_' + toolId) renderEmptyState();
    }
    renderWorkshopPage(); renderHistory(); renderChat();
}

function renderWorkshopPage() {
    const container = document.getElementById('workshopPage');
    if (!container) return;
    const aiDetectActive = workshopTools.ai_detect || false;
    const knowledgeRagActive = workshopTools.knowledge_rag || false;
    container.innerHTML = `
        <div class="workshop-banner">
            <div class="workshop-banner-text">
                <h1>${t('masterFull')}</h1>
                <p>Специальные инструменты для расширенной работы с искусственным интеллектом. Включайте нужные тумблеры, чтобы активировать тематические чаты со строгими правилами.</p>
            </div>
            <img src="assets/master.png" alt="Мастерская" class="workshop-banner-img">
        </div>
        <div class="workshop-tools-grid">
            <div class="workshop-tool-card ${aiDetectActive ? 'active' : ''}">
                <div class="workshop-tool-header">
                    <div class="workshop-tool-icon"><i class="fas fa-search"></i></div>
                    <div class="workshop-tool-info"><h3>${t('aiDetect')}</h3><p>${t('aiDetectToolDesc')}</p></div>
                </div>
                <div class="workshop-tool-toggle">
                    <span>${aiDetectActive ? t('toolActive') : t('toolInactive')}</span>
                    <label class="toggle-switch"><input type="checkbox" id="toggle-ai-detect" ${aiDetectActive ? 'checked' : ''}><span class="toggle-slider"></span></label>
                </div>
            </div>
            <div class="workshop-tool-card ${knowledgeRagActive ? 'active' : ''}">
                <div class="workshop-tool-header">
                    <div class="workshop-tool-icon"><i class="fas fa-book"></i></div>
                    <div class="workshop-tool-info"><h3>${t('documents')}</h3><p>${t('documentsToolDesc')}</p></div>
                </div>
                <div class="workshop-tool-toggle">
                    <span>${knowledgeRagActive ? t('toolActive') : t('toolInactive')}</span>
                    <label class="toggle-switch"><input type="checkbox" id="toggle-knowledge-rag" ${knowledgeRagActive ? 'checked' : ''}><span class="toggle-slider"></span></label>
                </div>
            </div>
            <div class="workshop-tool-card disabled">
                <div class="workshop-tool-header"><div class="workshop-tool-icon"><i class="fas fa-code"></i></div><div class="workshop-tool-info"><h3>${t('codeReview')}</h3><p>${t('codeReviewToolDesc')}</p></div></div>
                <div class="workshop-tool-toggle"><span>${t('soon')}</span><label class="toggle-switch"><input type="checkbox" disabled><span class="toggle-slider"></span></label></div>
            </div>
        </div>
        <div class="workshop-forum">
            <h2><i class="fas fa-comments"></i> ${t('forumTitle')}</h2>
            <div class="forum-messages" id="forumMessagesContainer"></div>
            <div class="forum-input-area">
                <textarea id="forumInput" placeholder="${t('forumPlaceholder')}"></textarea>
                <button class="forum-send-btn" id="forumSendBtn" title="${t('send')}"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    document.getElementById('toggle-ai-detect')?.addEventListener('change', (e) => toggleWorkshopTool('ai_detect'));
    document.getElementById('toggle-knowledge-rag')?.addEventListener('change', (e) => toggleWorkshopTool('knowledge_rag'));
    document.getElementById('forumSendBtn')?.addEventListener('click', sendForumMessage);
    document.getElementById('forumInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendForumMessage(); }
    });
    if (!forumLoaded) loadForumMessages();
    else renderForumMessages();
}

// ========== ФОРУМ ==========
async function loadForumMessages() {
    try {
        const { data, error } = await supabaseClient.from('forum_masterk').select('*').order('created_at', { ascending: true });
        if (!error) { forumMessages = data; forumLoaded = true; }
        renderForumMessages();
    } catch(e) { console.warn('Ошибка загрузки форума:', e); }
}

function renderForumMessages() {
    const container = document.getElementById('forumMessagesContainer');
    if (!container) return;
    container.innerHTML = forumMessages.map(m => `
        <div class="forum-message">
            <div class="forum-avatar">${m.user_avatar ? `<img src="${m.user_avatar}">` : '<i class="fas fa-user"></i>'}</div>
            <div class="forum-message-content">
                <div class="forum-message-header">
                    <span class="forum-message-author">${escapeHtml(m.user_name || m.user_login)}</span>
                    <span class="forum-message-time">${new Date(m.created_at).toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' })}</span>
                </div>
                <div class="forum-message-text">${escapeHtml(m.message)}</div>
            </div>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

async function sendForumMessage() {
    const input = document.getElementById('forumInput');
    const text = input.value.trim();
    if (!text || !currentUser) return;
    const tempMsg = {
        user_login: currentUser.login,
        user_name: currentUser.name || currentUser.login,
        user_avatar: currentUser.avatar || '',
        message: text,
        created_at: new Date().toISOString()
    };
    forumMessages.push(tempMsg);
    renderForumMessages();
    input.value = '';
    const { error } = await supabaseClient.from('forum_masterk').insert({
        user_login: currentUser.login,
        user_name: currentUser.name || currentUser.login,
        user_avatar: currentUser.avatar || '',
        message: text
    });
    if (error) {
        showToast('Ошибка', 'Не удалось отправить сообщение', 'error');
        forumMessages.pop();
        renderForumMessages();
    }
}

// ========== ДИНАМИЧЕСКАЯ ЗАГРУЗКА ТЯЖЁЛЫХ БИБЛИОТЕК ==========
const libsLoaded = { tesseract: false, mammoth: false, mermaid: false };

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function ensureTesseract() {
    if (!libsLoaded.tesseract) {
        await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@2/dist/tesseract.min.js');
        libsLoaded.tesseract = true;
    }
}

async function ensureMammoth() {
    if (!libsLoaded.mammoth) {
        await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js');
        libsLoaded.mammoth = true;
    }
}

async function ensureMermaid() {
    if (!libsLoaded.mermaid) {
        await loadScript('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js');
        libsLoaded.mermaid = true;
        if (typeof mermaid !== 'undefined') mermaid.initialize({ startOnLoad: false });
    }
}

// ========== OCR ==========
async function performOCR(file) {
    await ensureTesseract();
    if (typeof Tesseract === 'undefined') {
        showToast(t('fileError'), 'Библиотека распознавания не загружена', 'error');
        throw new Error('Tesseract не загружен');
    }
    try {
        const img = await loadImage(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const val = gray > 128 ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = val;
        }
        ctx.putImageData(imageData, 0, 0);
        const processedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const processedFile = new File([processedBlob], file.name, { type: 'image/png' });

        const result = await Tesseract.recognize(processedFile, 'eng+rus', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const progressBar = document.getElementById('attach-progress');
                    if (progressBar) progressBar.style.width = Math.round(m.progress * 100) + '%';
                }
            }
        });
        return result.data.text || '';
    } catch (e) {
        showToast(t('fileError'), 'Не удалось распознать изображение', 'error');
        throw e;
    }
}

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function readDocx(file) {
    await ensureMammoth();
    if (typeof mammoth === 'undefined') throw new Error('Mammoth не загружен');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
}

// ========== MERMAID РЕНДЕР ==========
async function renderMermaidBlocks(container) {
    await ensureMermaid();
    if (!container || typeof mermaid === 'undefined') return;
    const mermaidBlocks = container.querySelectorAll('pre code.language-mermaid');
    mermaidBlocks.forEach(async (block) => {
        const code = block.textContent;
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        try {
            const { svg } = await mermaid.render(id, code);
            const wrapper = document.createElement('div');
            wrapper.className = 'mermaid-container';
            wrapper.innerHTML = svg;
            block.parentElement.replaceWith(wrapper);
        } catch (e) {
            console.warn('Mermaid render error:', e);
        }
    });
}

// ========== БЛОКИ КОДА И ИХ ДЕЙСТВИЯ ==========
function showCodeRunnerModal(code, language) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container" style="resize: both; overflow: auto;">
            <div class="modal-header">
                <h3><i class="fas fa-play"></i> ${t('codeRun')} (${language || 'текст'})</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <textarea class="code-editor" rows="10" spellcheck="false">${escapeHtml(code)}</textarea>
                <iframe class="runner-iframe" style="width:100%; height:400px; border:1px solid var(--border-color); border-radius:16px; background:#fff;"></iframe>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary run-execute"><i class="fas fa-play"></i> ${t('codeRun')}</button>
                <button class="btn btn-secondary close-modal">${t('cancel')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const editor = modal.querySelector('.code-editor');
    const iframe = modal.querySelector('.runner-iframe');
    const runExecute = modal.querySelector('.run-execute');
    function executeCode() {
        const newCode = editor.value;
        let htmlContent = newCode;
        if (!htmlContent.trim().toLowerCase().includes('<html')) {
            htmlContent = `<html><head><meta charset="UTF-8"><title>Run</title><style>body{background:#1e1e1e;color:#f0f0f0;font-family:monospace;padding:16px;}</style></head><body><pre>${escapeHtml(newCode)}</pre><script>try{${newCode}}catch(e){document.body.innerHTML+='<div style="color:red">Ошибка: '+e.message+'</div>';}<\/script></body></html>`;
        }
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        iframe.src = url;
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    runExecute.addEventListener('click', executeCode);
    modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => modal.remove()));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    executeCode();
}

function enhanceCodeBlocks(container) {
    if (!container) return;
    const preBlocks = container.querySelectorAll('pre');
    preBlocks.forEach(pre => {
        if (pre.parentElement.classList.contains('code-block-wrapper')) return;
        const code = pre.querySelector('code');
        let language = '';
        if (code && code.className) {
            const match = code.className.match(/language-(\w+)/);
            if (match) language = match[1];
        }
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        const header = document.createElement('div');
        header.className = 'code-block-header';
        header.innerHTML = `
            <span><i class="fas fa-code"></i> ${language || 'Скрипт'}</span>
            <div class="code-block-actions">
                <button class="copy-code-btn" title="${t('codeCopy')}"><i class="fas fa-copy"></i> ${t('codeCopy')}</button>
                <button class="download-code-btn" title="${t('codeDownload')}"><i class="fas fa-download"></i> ${t('codeDownload')}</button>
                ${language === 'html' ? `<button class="run-code-btn" title="${t('codeRun')}"><i class="fas fa-play"></i> ${t('codeRun')}</button>` : ''}
            </div>
        `;
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
        const copyBtn = wrapper.querySelector('.copy-code-btn');
        copyBtn.addEventListener('click', () => {
            const text = pre.textContent;
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> ' + t('copy');
                setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i> ' + t('codeCopy'), 2000);
            });
        });
        const downloadBtn = wrapper.querySelector('.download-code-btn');
        downloadBtn.addEventListener('click', () => {
            const text = pre.textContent;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${language || 'script'}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });
        const runBtn = wrapper.querySelector('.run-code-btn');
        if (runBtn) {
            runBtn.addEventListener('click', () => { showCodeRunnerModal(pre.textContent, language); });
        }
    });
}

// ========== ПРИКРЕПЛЕНИЕ ФАЙЛОВ ==========
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}
