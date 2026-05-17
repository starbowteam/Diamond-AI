// ==================== DIAMOND AI v46 — АВТОРИЗАЦИЯ И ПРОФИЛЬ ====================

function getBotAvatarHTML() {
    return `<img src="../assets/bot-av.ico" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'fas fa-robot\'></i>'">`;
}

function getUserAvatarHTML() {
    if (currentUser && currentUser.avatar) {
        return `<img src="${currentUser.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'fas fa-user\'></i>'">`;
    }
    return '<i class="fas fa-user"></i>';
}

function updateUserPanel() {
    const nameSpan = document.getElementById('userNameDisplay');
    const avatarImg = document.getElementById('userAvatarImg');
    if (currentUser) {
        const icon = currentUser.fa_icon ? `<i class="${currentUser.fa_icon}" style="margin-right:6px;"></i>` : '';
        if (nameSpan) nameSpan.innerHTML = `${icon}${currentUser.name || currentUser.login}`;
        if (avatarImg) {
            if (currentUser.avatar) {
                avatarImg.src = currentUser.avatar;
                avatarImg.style.display = 'block';
                avatarImg.onerror = function() {
                    this.style.display = 'none';
                    this.parentElement.innerHTML = '<i class="fas fa-user default-avatar"></i>';
                };
            } else {
                avatarImg.style.display = 'none';
                avatarImg.parentElement.innerHTML = '<i class="fas fa-user default-avatar"></i>';
            }
        }
    } else {
        if (nameSpan) nameSpan.textContent = t('profile');
        if (avatarImg) {
            avatarImg.style.display = 'none';
            avatarImg.parentElement.innerHTML = '<i class="fas fa-user default-avatar"></i>';
        }
    }
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        if (!tutorialCompleted) {
            settingsBtn.classList.add('blink');
            settingsBtn.classList.add('scale-pulse');
        } else {
            settingsBtn.classList.remove('blink');
            settingsBtn.classList.remove('scale-pulse');
        }
    }
}

async function login() {
    const identity = document.getElementById('loginIdentity')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const btn = document.getElementById('doLoginBtn');
    if (!identity || !password) return showToast(t('errorLogin'), '', 'warning');
    btn.disabled = true;
    try {
        const { data: user, error } = await supabaseClient.from('users').select('*').eq('login', identity).eq('password', password).maybeSingle();
        if (error || !user) { showToast(t('errorLogin'), '', 'error'); return; }
        if (!user.secret_word) { const sw = generateFastSecret(); await supabaseClient.from('users').update({ secret_word: sw }).eq('login', user.login); user.secret_word = sw; }
        currentUser = { login: user.login, email: user.email || (user.login+'@diamkey.local'), secretWord: user.secret_word, name: user.name||'', avatar: user.avatar||'', description: user.description||'', fa_icon: user.fa_icon||'', role: user.role||'user' };
        localStorage.setItem('diamond_user', JSON.stringify(currentUser));
        tutorialCompleted = user.obuchenie_check === true;
        await loadChatsAndFolders(); await refreshUserProfile(); await loadForumMessages();
        document.getElementById('choiceScreen').style.display = 'none';
        document.getElementById('mainUI').style.display = 'flex';
        setTimeout(() => document.getElementById('mainUI').classList.add('visible'), 50);
        updateUserPanel();
        if (workshopTools.ai_detect) await createToolChatWithGreeting('ai_detect');
        if (chats.length === 0) renderEmptyState(); else renderChat();
        renderHistory();
        setupFileAttachment();
    } catch (e) { console.error(e); showToast(t('errorNetwork'), '', 'error'); }
    finally { btn.disabled = false; }
}

async function register() {
    const loginInput = document.getElementById('regLogin')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const btn = document.getElementById('doRegisterBtn');
    if (!loginInput || password.length < 6) return showToast(t('errorRegister'), '', 'warning');
    btn.disabled = true;
    try {
        const { data: exist } = await supabaseClient.from('users').select('login').eq('login', loginInput).maybeSingle();
        if (exist) { showToast('Логин уже занят', '', 'warning'); return; }
        const secretWord = generateFastSecret();
        const email = loginInput + '@diamkey.local';
        const token = generateToken();
        const { error } = await supabaseClient.from('users').insert([{ login: loginInput, email, password, token, secret_word: secretWord, name:'', avatar:'', description:'', fa_icon:'', role:'user', is_admin:false, obuchenie_check: false }]);
        if (error) { showToast(t('errorRegister'), error.message, 'error'); return; }
        currentUser = { login: loginInput, email, secretWord, name:'', avatar:'', description:'', fa_icon:'', role:'user' };
        localStorage.setItem('diamond_user', JSON.stringify(currentUser));
        tutorialCompleted = false;
        await loadChatsAndFolders(); await loadForumMessages();
        document.getElementById('choiceScreen').style.display = 'none';
        document.getElementById('mainUI').style.display = 'flex';
        setTimeout(() => document.getElementById('mainUI').classList.add('visible'), 50);
        updateUserPanel();
        renderEmptyState();
        renderHistory();
        setupFileAttachment();
    } catch (e) { console.error(e); showToast(t('errorNetwork'), '', 'error'); }
    finally { btn.disabled = false; }
}

async function refreshUserProfile() {
    if (!currentUser) return;
    try {
        const { data, error } = await supabaseClient.from('users').select('name, avatar, description, fa_icon, obuchenie_check').eq('login', currentUser.login).maybeSingle();
        if (error) throw error;
        if (data) {
            let changed = false;
            if (data.name !== currentUser.name) { currentUser.name = data.name; changed = true; }
            if (data.avatar !== currentUser.avatar) { currentUser.avatar = data.avatar; changed = true; }
            if (data.description !== currentUser.description) { currentUser.description = data.description; changed = true; }
            if (data.fa_icon !== currentUser.fa_icon) { currentUser.fa_icon = data.fa_icon; changed = true; }
            tutorialCompleted = data.obuchenie_check === true;
            if (changed) { localStorage.setItem('diamond_user', JSON.stringify(currentUser)); updateUserPanel(); }
        }
    } catch (e) { console.warn('[PROFILE] Ошибка синхронизации:', e); }
}

function logout() {
    currentUser = null; mistralApiKey = ''; localStorage.removeItem('diamond_user');
    document.getElementById('mainUI').style.display = 'none';
    document.getElementById('choiceScreen').style.display = 'flex';
    chatAttachments = {};
    if (settingsModalOpen) {
        const overlay = document.querySelector('.settings-modal-overlay');
        if (overlay) overlay.remove();
        settingsModalOpen = false;
    }
    showToast(t('logout'), '', 'info');
}
