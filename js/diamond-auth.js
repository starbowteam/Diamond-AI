// ==================== DIAMOND AI v46 — АВТОРИЗАЦИЯ И ПРОФИЛЬ ====================

function getBotAvatarHTML() {
    return `<img src="assets/bot-av.ico" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'fas fa-robot\'></i>'">`;
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
    showToast(t('logout'), '', 'info');
}

// ========== DIAMKEY OAUTH ==========
function redirectToDiamKeyOAuth() {
    const redirect = encodeURIComponent(window.location.origin + window.location.pathname);
    window.location.href = `https://diamkey.ru/oauth.html?redirect=${redirect}&app=Diamond+AI`;
}

async function processOAuthTicket() {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket');
    if (!ticket) return false;
    window.history.replaceState({}, document.title, window.location.pathname);
    try {
        const { data, error } = await supabaseClient.from('oauth_tickets').select('login').eq('ticket', ticket).maybeSingle();
        if (error || !data) { showToast('Тикет недействителен', '', 'error'); return false; }
        const login = data.login;
        await supabaseClient.from('oauth_tickets').delete().eq('ticket', ticket);
        const { data: user, error: userError } = await supabaseClient.from('users').select('*').eq('login', login).maybeSingle();
        if (userError || !user) { showToast('Пользователь не найден', '', 'error'); return false; }
        if (!user.secret_word) {
            const sw = generateFastSecret();
            await supabaseClient.from('users').update({ secret_word: sw }).eq('login', user.login);
            user.secret_word = sw;
        }
        currentUser = {
            login: user.login,
            email: user.email || (user.login+'@diamkey.local'),
            secretWord: user.secret_word,
            name: user.name||'',
            avatar: user.avatar||'',
            description: user.description||'',
            fa_icon: user.fa_icon||'',
            role: user.role||'user'
        };
        localStorage.setItem('diamond_user', JSON.stringify(currentUser));
        tutorialCompleted = user.obuchenie_check === true;
        // НЕ загружаем чаты здесь, это сделает UI
        return true;
    } catch (e) {
        console.error('OAuth ticket error:', e);
        return false;
    }
}
