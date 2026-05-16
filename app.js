// ==================== DIAMOND AI v44 — ПЛАШКА «ДУМАЮ», РЕГЕНЕРАЦИЯ, ВАРИАНТЫ ====================
(function() {
    const SUPABASE_URL = 'https://pqgwrokpizeelfrjmgoc.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZ3dyb2twaXplZWxmcmptZ29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTAyMDksImV4cCI6MjA5MjcyNjIwOX0.qtFCGBnpwdQbtmpwSZxI_hH3arq4HBAw62vs5h8WmAk';

    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    let currentChatId = null;
    let chats = [];
    let folders = [];
    let currentUser = null;
    let isWaitingForResponse = false;
    let currentAbortController = null;
    let lastNotificationTime = 0;
    const NOTIFICATION_DEBOUNCE = 1500;
    let sidebarCollapsed = false;
    let currentEditingFolderId = null;
    let currentView = 'chat';
    let placeholderInterval = null;
    let workshopTools = {};
    let forumMessages = [];
    let forumLoaded = false;
    let tutorialActive = false;
    let tutorialStep = 0;
    let currentLanguage = 'ru';
    let searchHighlightTerm = '';
    let settingsModalOpen = false;

    let chatAttachments = {};
    let fileInputEl = null;
    let tutorialCompleted = true;

    // ========== ЛОКАЛИЗАЦИЯ ==========
    const locales = {
        ru: {
            welcome: 'Добро пожаловать в Diamond AI!',
            login: 'Вход',
            register: 'Регистрация',
            loginBtn: 'Войти',
            regBtn: 'Создать Diamkey',
            loginPlaceholder: 'Введите логин',
            passPlaceholder: '········',
            newChat: 'Новый чат',
            folders: 'Папки',
            workshop: 'Мастерская',
            searchHistory: 'Поиск в истории...',
            profile: 'Пользователь',
            settings: 'Настройки',
            diamkey: 'DiamKey',
            tutorial: 'Обучение',
            language: 'Язык',
            logout: 'Выйти',
            emptyChat: 'Чем могу помочь?',
            inputPlaceholder: 'Введите свой запрос...',
            copy: 'Скопировано',
            renameChat: 'Переименовать чат',
            pinChat: 'Закрепить',
            unpinChat: 'Открепить',
            moveToFolder: 'Переместить в папку',
            deleteChat: 'Удалить',
            save: 'Сохранить',
            cancel: 'Отмена',
            errorNetwork: 'Ошибка сети',
            errorLoadChats: 'Не удалось загрузить чаты',
            errorSendMsg: 'Не удалось отправить сообщение',
            errorLogin: 'Неверный логин или пароль',
            errorRegister: 'Ошибка регистрации',
            errorApiKey: 'API-ключ не загружен',
            noChats: 'Нет чатов',
            folderEmpty: 'У вас пока нет папок. Создайте первую!',
            createFolder: 'Создать папку',
            backToChat: 'Назад к чату',
            today: 'Сегодня',
            yesterday: 'Вчера',
            older: 'Более 2-х дней назад',
            pinned: 'Закрепленные',
            masterFull: 'Мастерская Diamond AI',
            master: 'Мастерская',
            aiDetect: 'Распознать ИИ',
            codeReview: 'Code Review',
            translator: 'Переводчик',
            soon: 'Скоро появится',
            tutorialTitle: 'Обучение Diamond AI',
            tutorialSkip: 'Пропустить',
            tutorialNext: 'Далее',
            tutorialPrev: 'Назад',
            tutorialFinish: 'Завершить',
            languageTitle: 'Выберите язык',
            languageChanged: 'Язык изменён',
            searchNotFound: 'Ничего не найдено',
            folderChats: 'Чаты в папке',
            noFolderChats: 'Нет чатов в этой папке',
            createFolderTitle: 'Создать папку',
            editFolder: 'Редактировать папку',
            folderName: 'Название',
            folderDesc: 'Описание',
            folderIcon: 'Иконка',
            folderColor: 'Цвет',
            addChatToFolder: 'Добавить чат в папку',
            noAvailableChats: 'Нет доступных чатов для добавления',
            viewFolderChats: 'Просмотреть чаты',
            confirmDeleteFolder: 'Удалить папку? Чаты будут перемещены в корень.',
            confirmDeleteChat: 'Удалить чат?',
            chatMoved: 'Чат перемещён',
            toolActive: 'Активен',
            toolInactive: 'Выключен',
            aiDetectGreeting: 'Готов распознавать ваши тексты!',
            forumTitle: 'Обсуждения проектов',
            forumPlaceholder: 'Обсудить ИИ с сообществом...',
            send: 'Отправить',
            codeRun: 'Выполнить код',
            codeCopy: 'Копировать',
            codeDownload: 'Скачать',
            back: 'Назад',
            settingsSectionGeneral: 'Язык Diamond AI',
            settingsSectionPrivacy: 'Конфиденциальность',
            settingsSectionAbout: 'О создателе',
            settingsDiamondAI: 'Diamond AI',
            settingsDiamKey: 'DiamKey',
            settingsTutorial: 'Обучение',
            settingsLogout: 'Выход',
            settingsMainSite: 'Основной сайт Diamond AI',
            settingsPrivacyText: 'Мы не собираем личные данные. Все чаты хранятся в вашем аккаунте DiamKey.',
            settingsAboutText: 'Diamond AI создан командой Diamond во главе с viktorshopa. Мы делаем удобные и безопасные ИИ‑инструменты.',
            settingsTerms: 'Правила использования',
            settingsTermsText: 'Запрещено использовать сервис для незаконной деятельности, распространения вредоносного ПО или оскорблений.',
            settingsDiamondAIDesc: 'Diamond AI — интеллектуальный помощник с синхронизацией через DiamKey. Тот сервис, которым вы пользуетесь прямо сейчас, ИИ часто обновляется, и дорабатывается. Стабильная работа гарантирована.',
            settingsDiamKeyDesc: 'DiamKey — единая система аутентификации для всей экосистемы Diamond. Здесь вы можете изменить свои глобальные данные профиля.',
            settingsLogoutConfirm: 'Выйти из аккаунта?',
            aiDetectToolDesc: 'Анализ текста на оригинальность. Определяет, написан ли текст человеком или сгенерирован ИИ (GPT, Mistral и др.)',
            codeReviewToolDesc: 'Автоматическое ревью кода (скоро)',
            translatorToolDesc: 'Мгновенный перевод на 100+ языков (скоро)',
            attachFile: 'Прикрепить файл',
            fileProcessing: 'Обработка...',
            fileReady: 'Готово',
            fileError: 'Ошибка обработки файла',
            ocrEmpty: 'Не удалось распознать текст',
            fileUnsupported: 'Неподдерживаемый формат',
            fileUnsupportedDesc: 'Разрешены png, jpg, html, js, css, docx',
            diamkeyAvatar: 'Аватар',
            diamkeyChangeAvatar: 'Нажмите, чтобы сменить аватар',
            diamkeyNickname: 'Никнейм',
            diamkeyPassword: 'Новый пароль',
            diamkeySave: 'Сохранить изменения',
            diamkeyTotalMessages: 'Всего сообщений',
            diamkeyTotalChats: 'Всего чатов',
            languageHint: 'Выберите язык интерфейса',
            tutorialHint: 'Пройдите обучение, чтобы узнать все возможности Diamond AI',
            tutorialNotCompletedHint: 'Нажмите, чтобы пройти обучение',
            disclaimerTooltip: 'ИИ может ошибаться. Только для справки.',
            generatedIn: 'Сгенерировано за',
            sec: 'с',
            copyAction: 'Копировать',
            regenAction: 'Регенерировать'
        },
        en: {
            welcome: 'Welcome to Diamond AI!',
            login: 'Login',
            register: 'Register',
            loginBtn: 'Sign In',
            regBtn: 'Create Diamkey',
            loginPlaceholder: 'Enter login',
            passPlaceholder: '········',
            newChat: 'New Chat',
            folders: 'Folders',
            workshop: 'Workshop',
            searchHistory: 'Search history...',
            profile: 'User',
            settings: 'Settings',
            diamkey: 'DiamKey',
            tutorial: 'Tutorial',
            language: 'Language',
            logout: 'Logout',
            emptyChat: 'How can I help?',
            inputPlaceholder: 'Type your message...',
            copy: 'Copied',
            renameChat: 'Rename Chat',
            pinChat: 'Pin',
            unpinChat: 'Unpin',
            moveToFolder: 'Move to folder',
            deleteChat: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            errorNetwork: 'Network error',
            errorLoadChats: 'Failed to load chats',
            errorSendMsg: 'Failed to send message',
            errorLogin: 'Invalid login or password',
            errorRegister: 'Registration error',
            errorApiKey: 'API key not loaded',
            noChats: 'No chats',
            folderEmpty: 'No folders yet. Create one!',
            createFolder: 'Create Folder',
            backToChat: 'Back to Chat',
            today: 'Today',
            yesterday: 'Yesterday',
            older: 'Older',
            pinned: 'Pinned',
            masterFull: 'Diamond AI Workshop',
            master: 'Workshop',
            aiDetect: 'Detect AI',
            codeReview: 'Code Review',
            translator: 'Translator',
            soon: 'Coming soon',
            tutorialTitle: 'Diamond AI Tutorial',
            tutorialSkip: 'Skip',
            tutorialNext: 'Next',
            tutorialPrev: 'Back',
            tutorialFinish: 'Finish',
            languageTitle: 'Select Language',
            languageChanged: 'Language changed',
            searchNotFound: 'Nothing found',
            folderChats: 'Chats in folder',
            noFolderChats: 'No chats in this folder',
            createFolderTitle: 'Create Folder',
            editFolder: 'Edit Folder',
            folderName: 'Name',
            folderDesc: 'Description',
            folderIcon: 'Icon',
            folderColor: 'Color',
            addChatToFolder: 'Add chat to folder',
            noAvailableChats: 'No chats available to add',
            viewFolderChats: 'View chats',
            confirmDeleteFolder: 'Delete folder? Chats will be moved to root.',
            confirmDeleteChat: 'Delete chat?',
            chatMoved: 'Chat moved',
            toolActive: 'Active',
            toolInactive: 'Inactive',
            aiDetectGreeting: 'Ready to analyze your texts!',
            forumTitle: 'Project Discussions',
            forumPlaceholder: 'Discuss AI with the community...',
            send: 'Send',
            codeRun: 'Run code',
            codeCopy: 'Copy',
            codeDownload: 'Download',
            back: 'Back',
            settingsSectionGeneral: 'Language Diamond AI',
            settingsSectionPrivacy: 'Privacy',
            settingsSectionAbout: 'About',
            settingsDiamondAI: 'Diamond AI',
            settingsDiamKey: 'DiamKey',
            settingsTutorial: 'Tutorial',
            settingsLogout: 'Logout',
            settingsMainSite: 'Diamond AI Main Site',
            settingsPrivacyText: 'We do not collect personal data. All chats are stored in your DiamKey account.',
            settingsAboutText: 'Diamond AI is created by the Diamond team led by viktorshopa. We build convenient and secure AI tools.',
            settingsTerms: 'Terms of Use',
            settingsTermsText: 'It is forbidden to use the service for illegal activities, distribution of malware or insults.',
            settingsDiamondAIDesc: 'Diamond AI is an intelligent assistant that syncs via DiamKey. The service youre using right now, AI, is frequently updated and improved. Stable performance is guaranteed.',
            settingsDiamKeyDesc: 'DiamKey is the unified authentication system for the entire Diamond ecosystem. Here you can change your global profile data.',
            settingsLogoutConfirm: 'Logout from account?',
            aiDetectToolDesc: 'Text originality analysis. Determines whether text is written by a human or generated by AI.',
            codeReviewToolDesc: 'Automated code review (coming soon)',
            translatorToolDesc: 'Instant translation to 100+ languages (coming soon)',
            attachFile: 'Attach file',
            fileProcessing: 'Processing...',
            fileReady: 'Ready',
            fileError: 'File processing error',
            ocrEmpty: 'Could not recognize text',
            fileUnsupported: 'Unsupported format',
            fileUnsupportedDesc: 'Allowed: png, jpg, html, js, css, docx',
            diamkeyAvatar: 'Avatar',
            diamkeyChangeAvatar: 'Click to change avatar',
            diamkeyNickname: 'Nickname',
            diamkeyPassword: 'New password',
            diamkeySave: 'Save changes',
            diamkeyTotalMessages: 'Total messages',
            diamkeyTotalChats: 'Total chats',
            languageHint: 'Select interface language',
            tutorialHint: 'Take the tutorial to learn all Diamond AI features',
            tutorialNotCompletedHint: 'Click to take the tutorial',
            disclaimerTooltip: 'AI can make mistakes. For reference only.',
            generatedIn: 'Generated in',
            sec: 'sec',
            copyAction: 'Copy',
            regenAction: 'Regenerate'
        }
    };

    function t(key) { return (locales[currentLanguage] && locales[currentLanguage][key]) || (locales['ru'][key]) || key; }

    function updateUILanguage() {
        const loginIdentity = document.getElementById('loginIdentity');
        const loginPassword = document.getElementById('loginPassword');
        const regLogin = document.getElementById('regLogin');
        const regPassword = document.getElementById('regPassword');
        const userInput = document.getElementById('user-input');
        const historySearch = document.getElementById('history-search');
        const tabLogin = document.getElementById('tabLogin');
        const tabRegister = document.getElementById('tabRegister');
        const doLoginBtn = document.getElementById('doLoginBtn');
        const doRegisterBtn = document.getElementById('doRegisterBtn');
        const newChatBtn = document.getElementById('new-chat-btn');
        const foldersPageBtn = document.getElementById('folders-page-btn');
        const workshopPageBtn = document.getElementById('workshop-page-btn');
        const collapsedNewChat = document.getElementById('collapsedNewChat');
        const collapsedFolders = document.getElementById('collapsedFolders');
        const collapsedWorkshop = document.getElementById('collapsedWorkshop');

        if (loginIdentity) loginIdentity.placeholder = t('loginPlaceholder');
        if (loginPassword) loginPassword.placeholder = t('passPlaceholder');
        if (regLogin) regLogin.placeholder = t('loginPlaceholder');
        if (regPassword) regPassword.placeholder = t('passPlaceholder');
        if (userInput) userInput.placeholder = t('inputPlaceholder');
        if (historySearch) historySearch.placeholder = t('searchHistory');
        if (tabLogin) tabLogin.textContent = t('login');
        if (tabRegister) tabRegister.textContent = t('register');
        if (doLoginBtn) doLoginBtn.innerHTML = `<i class="fas fa-gem"></i> ${t('loginBtn')}`;
        if (doRegisterBtn) doRegisterBtn.innerHTML = `<i class="fas fa-user-plus"></i> ${t('regBtn')}`;
        if (newChatBtn) newChatBtn.title = t('newChat');
        if (foldersPageBtn) foldersPageBtn.title = t('folders');
        if (workshopPageBtn) workshopPageBtn.title = t('workshop');
        if (collapsedNewChat) collapsedNewChat.title = t('newChat');
        if (collapsedFolders) collapsedFolders.title = t('folders');
        if (collapsedWorkshop) collapsedWorkshop.title = t('workshop');
        renderEmptyState();
        renderFoldersPage();
        renderWorkshopPage();
        renderHistory();
        renderChat();
        if (settingsModalOpen) {
            const existing = document.querySelector('.settings-modal-overlay');
            if (existing) existing.remove();
            showSettingsModal();
        }
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('diamond_language', lang);
        updateUILanguage();
        showToast(t('languageChanged'), '', 'success');
    }

    const placeholderTexts = [
        "Что расскажешь о себе?",
        "Напиши формулу воды",
        "Кто такой viktorshopa?",
        "Реши уравнение x^2 - 5x + 6 = 0",
        "Что такое квантовая запутанность?",
        "Расскажи про теорему Пифагора",
        "Напиши код на Python"
    ];

    const AI_MODEL = 'mistral-small-2506';
    const now = new Date();
    const currentDateStr = now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const SYSTEM_PROMPT = {
        role: 'system',
        content: `Ты — Diamond AI, интеллектуальный помощник, работающий на модели diamond-ai.fast. Твой создатель — viktorshopa, основатель сервера Diamond и экосистемы проектов: DiamKey (единый аккаунт), Dirmess (мессенджер), Unlock (обход блокировок). Ты создан помогать людям отвечать на вопросы, решать задачи, писать код и проводить анализ. Отвечай строго по делу, используй KaTeX, Latex и тп для математики и других вещей и выделяй код тройными. Будь вежлив и полезен.

СТИЛЬ ОБЩЕНИЯ: Твой стандартный стиль — дружелюбный и профессиональный. Однако если пользователь явно просит изменить манеру общения (например: "общайся как аристократ", "будь дерзким", "отвечай как гопник", "будь максимально вежливым", "общайся как отбитый долбаёб", "стиль Шерлока Холмса", "как рэпер" и т.д.) — ты ДОЛЖЕН полностью переключиться на запрошенный стиль и последовательно придерживаться его, пока пользователь не попросит сменить обратно или не начнёт новый диалог. Ты можешь имитировать любые манеры: от изысканного аристократа XIX века до максимально неформального и дерзкого собеседника. Подстраивай лексику, длину предложений, обращения и общую тональность под заданный стиль. Не осуждай выбор пользователя — просто следуй его запросу.

ЭМОДЗИ: Иногда, когда это уместно и не мешает восприятию информации, вставляй 1-2 подходящих эмодзи в свои ответы — как это делает ChatGPT. Не перебарщивай: в серьёзных темах (алгебра, код, formal analysis) эмодзи можно опустить, но в обычных разговорах, пояснениях и дружеских советах — приветствуются. Используй эмодзи естественно, для оживления текста 😊.

ВАЖНО: Если пользователь прикрепил файл, ты получишь его содержимое в тексте запроса. Анализируй его, отвечай по содержимому. Никогда не говори, что ты не можешь просматривать файлы или изображения — текст уже перед тобой.

ОФОРМЛЕНИЕ ФОРМУЛ: ВСЕ математические, физические и химические формулы выводи СТРОГО в формате $$...$$ или $...$. Запрещено использовать \\(...\\) и \\[...\\]. Дроби, степени, корни, интегралы должны быть внутри $$. Химические формулы оформляй через \\ce{...} внутри $$. Пример: $$\\ce{H2O}$$, $$\\frac{a}{b}$$, $$\\sqrt{x}$$, $$\\int_0^\\infty$$. Это критически важно для корректного отображения.

Я Сегодня: ${currentDateStr}.`
    };

    const TITLE_GENERATOR_PROMPT = {
        role: 'system',
        content: `Ты — генератор названий для чатов. На основе последнего сообщения пользователя придумай короткое название (до 5 слов), которое отражает суть. Напиши только название, без кавычек и пояснений.`
    };

    const TOOL_SYSTEM_PROMPTS = {
        ai_detect: {
            role: 'system',
            content: `Ты — эксперт по определению авторства текста. Твоя задача: проанализировать присланный текст и определить, написан он человеком или сгенерирован ИИ (GPT-4, Claude, Mistral, Gemini и т.д.). Признаки генерации: неестественная гладкость, отсутствие личного опыта, чрезмерная структурированность, водянистость, типовые шаблоны вроде "в заключение", "следует отметить", идеальная грамматика без ошибок. Отвечай кратко: "Похоже на сгенерированный ИИ, вероятная модель: ..." или "Похоже на текст человека, потому что ...". Если не уверен, объясни почему. Не отвечай на другие вопросы — только анализ оригинальности.`
        }
    };

    // ========== УТИЛИТЫ ==========
    function log(msg) { console.log(`[DIAMOND] ${msg}`); }
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;' })[m] || m);
    }
    function showToast(title, message, type = 'info', duration = 3000) {
        const now = Date.now();
        if (now - lastNotificationTime < NOTIFICATION_DEBOUNCE) return;
        lastNotificationTime = now;
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${escapeHtml(title)}</div>
                <div class="toast-message">${escapeHtml(message)}</div>
            </div>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(toast);
        toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
        setTimeout(() => toast.remove(), duration);
    }
    function scrollToBottom() {
        const container = document.getElementById('messages-container');
        if (container) container.scrollTop = container.scrollHeight;
    }

    // ========== ПЛАШКА «ДУМАЮ» (6 состояний, таймер) ==========
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
            </div>
        `;
        container.appendChild(card);
        scrollToBottom();
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

    // ========== LaTeX РЕНДЕР ==========
    function renderMathInElementWithMhchem(element) {
        if (!element || typeof renderMathInElement === 'undefined') return;
        try {
            renderMathInElement(element, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false,
                macros: { "\\ce": "\\ce" },
                strict: false
            });
        } catch(e) { console.warn('Math render error:', e); }
    }

    // ========== MERMAID РЕНДЕР ==========
    function renderMermaidBlocks(container) {
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

    // ========== КНОПКА ЗАПУСКА КОДА ==========
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

    // ========== ОБРАБОТКА БЛОКОВ КОДА ==========
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

    // ========== SUPABASE КЛИЕНТ ==========
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ========== РАБОТА С ЧАТАМИ И ПАПКАМИ ==========
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

    // ========== ЧАТЫ ==========
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

    // ========== ПАПКИ ==========
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

    // ========== МАСТЕРСКАЯ ==========
    function loadWorkshopToolsState() {
        const saved = localStorage.getItem('diamond_workshop_tools');
        if (saved) { try { workshopTools = JSON.parse(saved); } catch(e) { workshopTools = {}; } }
        if (!workshopTools || Object.keys(workshopTools).length === 0) { workshopTools = { ai_detect: false }; }
    }
    function saveWorkshopToolsState() { localStorage.setItem('diamond_workshop_tools', JSON.stringify(workshopTools)); }

    async function createToolChatWithGreeting(toolId) {
        const toolChatId = 'tool_' + toolId;
        if (chats.find(c => c.id === toolChatId)) return;
        const toolInfo = getToolInfo(toolId);
        const toolChat = {
            id: toolChatId,
            title: toolInfo.title,
            messages: [{
                id: Date.now().toString(),
                role: 'assistant',
                content: t('aiDetectGreeting'),
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
        if (toolId !== 'ai_detect') return;
        workshopTools[toolId] = !workshopTools[toolId];
        saveWorkshopToolsState();
        if (workshopTools[toolId]) {
            await createToolChatWithGreeting(toolId);
            showToast(t('toolActive'), 'Чат «Распознать ИИ» активен', 'success');
        } else {
            await removeToolChat(toolId);
            showToast(t('toolInactive'), 'Чат «Распознать ИИ» скрыт', 'info');
            if (currentChatId === 'tool_' + toolId) renderEmptyState();
        }
        renderWorkshopPage(); renderHistory(); renderChat();
    }

    function renderWorkshopPage() {
        const container = document.getElementById('workshopPage');
        if (!container) return;
        const aiDetectActive = workshopTools.ai_detect || false;
        container.innerHTML = `
            <div class="workshop-banner">
                <div class="workshop-banner-text">
                    <h1>${t('masterFull')}</h1>
                    <p>Специальные инструменты для расширенной работы с искусственным интеллектом. Включайте нужные тумблеры, чтобы активировать тематические чаты со строгими правилами.</p>
                </div>
                <img src="master.png" alt="Мастерская" class="workshop-banner-img">
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
                <div class="workshop-tool-card disabled">
                    <div class="workshop-tool-header"><div class="workshop-tool-icon"><i class="fas fa-code"></i></div><div class="workshop-tool-info"><h3>${t('codeReview')}</h3><p>${t('codeReviewToolDesc')}</p></div></div>
                    <div class="workshop-tool-toggle"><span>${t('soon')}</span><label class="toggle-switch"><input type="checkbox" disabled><span class="toggle-slider"></span></label></div>
                </div>
                <div class="workshop-tool-card disabled">
                    <div class="workshop-tool-header"><div class="workshop-tool-icon"><i class="fas fa-language"></i></div><div class="workshop-tool-info"><h3>${t('translator')}</h3><p>${t('translatorToolDesc')}</p></div></div>
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

    // ========== ПОИСК ПО СООБЩЕНИЯМ ==========
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
        if (toolChats.length > 0 && workshopTools.ai_detect) {
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
        document.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-actions-hover')) switchChat(el.dataset.id);
            });
        });
        document.querySelectorAll('.rename-chat-hover').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); showRenameModal(btn.dataset.id); }; });
        document.querySelectorAll('.pin-chat-hover').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); togglePin(btn.dataset.id); }; });
        document.querySelectorAll('.delete-chat-hover').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); deleteChat(btn.dataset.id); }; });
        document.querySelectorAll('.move-to-folder-hover').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); showFolderSelectModal(btn.dataset.id); }; });
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
        return `
            <div class="history-item tool-chat ${isActive ? 'active' : ''}" data-id="${chat.id}" style="border-left: 3px solid var(--accent); padding-left: 9px;">
                <i class="fas ${toolInfo.icon}" style="color: var(--accent); margin-right: 8px; font-size: 14px;"></i>
                <span class="chat-title" style="z-index:1;">${escapeHtml(chat.title)}</span>
            </div>
        `;
    }

    function getToolInfo(toolId) {
        const tools = { ai_detect: { icon: 'fa-search', title: t('aiDetect') } };
        return tools[toolId] || { icon: 'fa-wrench', title: 'Инструмент' };
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
            if (msg.isTyping) return; // пропускаем служебные
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
            contentDiv.className = 'message-content';
            contentDiv.innerHTML = contentHtml;

            const wrapper = document.createElement('div');
            wrapper.className = 'message-content-wrapper';
            wrapper.appendChild(contentDiv);

            // Футер сообщения для ассистента
            if (msg.role === 'assistant' && msg.generationTime) {
                const footerDiv = document.createElement('div');
                footerDiv.className = 'message-footer';
                const hasVariants = msg.variants && msg.variants.length > 1;
                const currentVariant = msg.currentVariant || 0;

                footerDiv.innerHTML = `
                    <span class="disclaimer">Diamond AI<span class="disclaimer-tooltip">${t('disclaimerTooltip')}</span></span>
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

                // Копировать
                footerDiv.querySelector('.copy-action').addEventListener('click', () => {
                    navigator.clipboard.writeText(msg.content);
                    showToast(t('copy'), '', 'success', 1500);
                });

                // Регенерировать
                footerDiv.querySelector('.regen-action').addEventListener('click', () => {
                    regenerateResponseFromMsg(msg, idx);
                });

                // Переключатели вариантов
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
                    'png': 'png.png', 'jpg': 'jpg.png', 'jpeg': 'jpg.png',
                    'html': 'html.png', 'js': 'js.png', 'css': 'css.png',
                    'docx': 'docx.png'
                };
                const logo = logoMap[ext] || 'png.png';
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

    function formatDateHeader(ts) {
        const d = new Date(ts);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return t('today');
        if (d.toDateString() === yesterday.toDateString()) return t('yesterday');
        return d.toLocaleDateString('ru-RU');
    }

    function formatTime(ts) { return new Date(ts).toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' }); }
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

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
        if (role === 'assistant') {
            const container = document.getElementById('messages-container');
            if (container) {
                const lastMsgContent = container.querySelector('.message.assistant:last-child .message-content');
                if (lastMsgContent) {
                    lastMsgContent.style.opacity = '0';
                    requestAnimationFrame(() => {
                        lastMsgContent.style.opacity = '1';
                        lastMsgContent.style.transition = 'opacity 0.3s ease';
                    });
                }
            }
        }
        return messageId;
    }

    // ========== ПРИКРЕПЛЕНИЕ ФАЙЛОВ ==========
    function setupFileAttachment() {
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
            inputWrapper.insertBefore(attachBtn, sendBtn);
        }

        fileInputEl.addEventListener('change', handleFileSelect);
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
            'png': 'png.png', 'jpg': 'jpg.png', 'jpeg': 'jpg.png',
            'html': 'html.png', 'js': 'js.png', 'css': 'css.png',
            'docx': 'docx.png'
        };
        const logo = logoMap[ext] || 'png.png';
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
            'png': 'png.png', 'jpg': 'jpg.png', 'jpeg': 'jpg.png',
            'html': 'html.png', 'js': 'js.png', 'css': 'css.png',
            'docx': 'docx.png'
        };
        const logo = logoMap[ext] || 'png.png';
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

    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // ========== OCR ==========
    async function performOCR(file) {
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
        if (typeof mammoth === 'undefined') throw new Error('Mammoth не загружен');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || '';
    }

    // ========== ОТПРАВКА СООБЩЕНИЯ ==========
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

        isWaitingForResponse = true;
        updateSendButtonState();

        // Показываем плашку «Думаю»
        const card = createThinkingCard();
        const anim = startThinkingAnimation(card);
        scrollToBottom();

        let systemPrompt = (chat.id && chat.id.startsWith('tool_')) ? TOOL_SYSTEM_PROMPTS[chat.id.replace('tool_','')] || SYSTEM_PROMPT : SYSTEM_PROMPT;
        let userMessageForAI = userText;
        if (attachment) {
            const fileContent = attachment.content || '';
            if (!fileContent) showToast(t('ocrEmpty'), 'Текст не распознан', 'warning');
            userMessageForAI = `[Файл: ${attachment.name}]\nСодержимое:\n${fileContent}\n\nЗапрос пользователя: ${userText || 'Проанализируй содержимое файла'}`;
            systemPrompt = {
                ...systemPrompt,
                content: systemPrompt.content + '\n\nВАЖНО: Ты получил содержимое файла выше. Проанализируй его и ответь пользователю. Никогда не говори, что не можешь просматривать файлы/фото — текст уже перед тобой.'
            };
        }

        const contextMessages = chat.messages.filter(m => !m.isTyping).slice(-15);
        const messagesForAI = [
            systemPrompt,
            ...contextMessages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessageForAI }
        ];

        const controller = new AbortController(); currentAbortController = controller;
        let success = false, assistantMessage = '';
        try {
            const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${mistralApiKey}` },
                body: JSON.stringify({ model: AI_MODEL, messages: messagesForAI, temperature: 0.3, max_tokens: 1500 }),
                signal: controller.signal
            });
            if (resp.ok) { const data = await resp.json(); assistantMessage = data.choices[0].message.content; success = true; }
            else console.error('Mistral API error:', resp.status);
        } catch (e) { if (e.name === 'AbortError') console.log('Request aborted'); else console.warn('Mistral error:', e); }

        const generationTime = stopThinkingAnimation(card, anim);

        if (success && assistantMessage) {
            await addMessageToDOM('assistant', assistantMessage, true, null, generationTime);
        } else {
            await addMessageToDOM('assistant', '❌ Не удалось получить ответ. Попробуйте позже.', true, null, generationTime);
        }
        isWaitingForResponse = false; currentAbortController = null; updateSendButtonState(); renderChat(); scrollToBottom();
    }

    function stopGeneration() { if (currentAbortController) { currentAbortController.abort(); hideThinkingOverlay(); showToast('Генерация остановлена', '', 'info'); } }

    // ========== РЕГЕНЕРАЦИЯ (без повторной отправки) ==========
    async function regenerateResponseFromMsg(msg, idx) {
        const chat = chats.find(c => c.id === currentChatId);
        if (!chat || isWaitingForResponse) return;

        // Находим последнее сообщение пользователя в этом чате
        const userMsgs = chat.messages.filter(m => m.role === 'user' && !m.isTyping);
        if (userMsgs.length === 0) return;
        const lastUserMsg = userMsgs[userMsgs.length - 1];
        const prompt = lastUserMsg.content;

        isWaitingForResponse = true;
        updateSendButtonState();

        // Показываем плашку «Думаю»
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

        const controller = new AbortController(); currentAbortController = controller;
        let success = false, newAnswer = '';
        try {
            const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${mistralApiKey}` },
                body: JSON.stringify({ model: AI_MODEL, messages: messagesForAI, temperature: 0.3, max_tokens: 1500 }),
                signal: controller.signal
            });
            if (resp.ok) { const data = await resp.json(); newAnswer = data.choices[0].message.content; success = true; }
            else console.error('Mistral API error:', resp.status);
        } catch (e) { if (e.name === 'AbortError') console.log('Request aborted'); else console.warn('Mistral error:', e); }

        const generationTime = stopThinkingAnimation(card, anim);

        if (success && newAnswer) {
            // Собираем варианты
            let variants = msg.variants || [msg.content];
            variants.push(newAnswer);
            msg.variants = variants;
            msg.currentVariant = variants.length - 1;
            msg.content = newAnswer;
            msg.generationTime = generationTime;
            await saveChatToSupabase(chat);
        } else {
            showToast('Ошибка', 'Не удалось регенерировать ответ', 'error');
        }

        isWaitingForResponse = false; currentAbortController = null; updateSendButtonState();
        renderChat();
        scrollToBottom();
    }

    // ========== АВАТАРЫ И ПАНЕЛЬ ==========
    function getBotAvatarHTML() { return `<img src="bots.png" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`; }
    function getUserAvatarHTML() {
        if (currentUser && currentUser.avatar) return `<img src="${currentUser.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        if (currentUser && currentUser.fa_icon) return `<i class="${currentUser.fa_icon}"></i>`;
        return '<i class="fas fa-user"></i>';
    }

    function updateUserPanel() {
        const nameSpan = document.getElementById('userNameDisplay');
        const avatarImg = document.getElementById('userAvatarImg');
        if (currentUser) {
            const icon = currentUser.fa_icon ? `<i class="${currentUser.fa_icon}" style="margin-right:6px;"></i>` : '';
            if (nameSpan) nameSpan.innerHTML = `${icon}${currentUser.name || currentUser.login}`;
            if (avatarImg) avatarImg.src = currentUser.avatar || '';
        } else {
            if (nameSpan) nameSpan.textContent = t('profile');
            if (avatarImg) avatarImg.src = '';
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

    // ========== АВТОРИЗАЦИЯ ==========
    function generateFastSecret() { return Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15); }
    function generateToken() { const adj=['golden','silver','mystic','shadow','prime','crystal','onyx','brave','frost'], nouns=['falcon','tiger','phoenix','dragon','wolf','spark','nexus','core','vault','key']; return `diamkey_${adj[Math.floor(Math.random()*adj.length)]}_${nouns[Math.floor(Math.random()*nouns.length)]}_${nouns[Math.floor(Math.random()*nouns.length)]}_${Math.floor(1000+Math.random()*9000)}`; }

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

    let mistralApiKey = '';
    async function fetchMistralKey() {
        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/service_config?id=eq.1`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
            if (!resp.ok) return false;
            const data = await resp.json();
            if (data && data.length > 0) { mistralApiKey = data[0].mistral_api_key; return true; }
            return false;
        } catch (e) { console.error('Ошибка загрузки API-ключа:', e); return false; }
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

    // ========== UI ПОМОЩНИКИ ==========
    function updateSendButtonState() {
        const btn = document.getElementById('send-btn');
        const input = document.getElementById('user-input');
        const hasAttachment = currentChatId && chatAttachments[currentChatId];
        if (btn) btn.disabled = (!input.value.trim() && !hasAttachment) || isWaitingForResponse;
    }
    function switchToFoldersView() { currentView='folders'; document.getElementById('chatView').style.display='none'; document.getElementById('foldersPage').style.display='flex'; document.getElementById('workshopPage').style.display='none'; renderFoldersPage(); }
    function switchToChatView() { if(placeholderInterval) clearInterval(placeholderInterval); currentView='chat'; document.getElementById('chatView').style.display='flex'; document.getElementById('foldersPage').style.display='none'; document.getElementById('workshopPage').style.display='none'; renderChat(); }
    function switchToWorkshopView() { if(placeholderInterval) clearInterval(placeholderInterval); currentView='workshop'; document.getElementById('chatView').style.display='none'; document.getElementById('foldersPage').style.display='none'; document.getElementById('workshopPage').style.display='flex'; renderWorkshopPage(); }

    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar'), titleBar = document.getElementById('titleBar'), collapsedActions = document.getElementById('collapsedActions');
        const isMobile = window.innerWidth <= 768;
        if (isMobile) { sidebar.classList.toggle('open'); document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : ''; }
        else { sidebarCollapsed = !sidebarCollapsed; sidebar.classList.toggle('collapsed', sidebarCollapsed); if(titleBar) titleBar.classList.toggle('collapsed', sidebarCollapsed); if(collapsedActions) collapsedActions.classList.toggle('show', sidebarCollapsed); }
    }

    document.addEventListener('click', (e) => { if(window.innerWidth<=768){ const sidebar=document.getElementById('sidebar'), toggleBtn=document.getElementById('sidebarToggleBtn'); if(sidebar&&sidebar.classList.contains('open')&&!sidebar.contains(e.target)&&!toggleBtn.contains(e.target)){sidebar.classList.remove('open');document.body.style.overflow='';} } });
    window.addEventListener('resize', () => { const sidebar=document.getElementById('sidebar'), titleBar=document.getElementById('titleBar'), collapsedActions=document.getElementById('collapsedActions'); if(window.innerWidth>768){sidebar.classList.remove('open');document.body.style.overflow=''; if(sidebarCollapsed){sidebar.classList.add('collapsed');if(titleBar)titleBar.classList.add('collapsed');if(collapsedActions)collapsedActions.classList.add('show');}else{sidebar.classList.remove('collapsed');if(titleBar)titleBar.classList.remove('collapsed');if(collapsedActions)collapsedActions.classList.remove('show');}}else{sidebar.classList.remove('collapsed');if(titleBar)titleBar.classList.remove('collapsed');if(collapsedActions)collapsedActions.classList.remove('show');} });

    // ========== ЗАГРУЗОЧНЫЙ ЭКРАН ==========
    async function showLoadingScreen() {
        const ws = document.getElementById('welcomeScreen');
        ws.style.display = 'flex';
        await new Promise(r => setTimeout(r, 400));
        ws.classList.add('fade-out');
        await new Promise(r => setTimeout(r, 300));
        ws.style.display = 'none';
    }

    // ========== РЕНДЕР ПУСТОГО СОСТОЯНИЯ ==========
    function renderEmptyState() {
        const container = document.getElementById('messages-container');
        container.innerHTML = `<div class="empty-state"><img src="logo.png" class="empty-logo" alt="Diamond AI"><div class="empty-text">${t('emptyChat')}</div><div class="empty-input-area"><div class="input-wrapper"><textarea id="empty-input" placeholder="${placeholderTexts[0]}" rows="1"></textarea><button class="send-btn" id="empty-send-btn" disabled><i class="fas fa-arrow-up"></i></button></div></div></div>`;
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

    // ========== НОВАЯ МОДАЛКА НАСТРОЕК ==========
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
        { title: 'Главный чат', html: `<p>Центральная часть экрана — это <strong style="color:var(--accent)">область диалога</strong>. Здесь отображаются ваши сообщения и ответы ИИ. Под диалогом находится поле ввода — просто начните печатать вопрос и нажмите кнопку отправки (стрелка вверх). ИИ мгновенно приступит к генерации ответа, а вы увидите индикатор печати.</p><p>Когда чат пуст, в поле ввода отображаются примеры запросов — попробуйте нажать на один из них, чтобы быстро начать разговор.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-comment"></i><div><strong>Пример:</strong><br><span style="color:var(--text-secondary)">«Расскажи про теорему Пифагора»</span></div></div>`, interactive: `<div class="tutorial-demo-interactive" id="tutorialFocusInput"><i class="fas fa-hand-pointer"></i> Нажми сюда, чтобы попробовать ввод</div>` },
        { title: 'Создание нового чата', html: `<p>Хотите обсудить новую тему, не смешивая её с предыдущими? Нажмите кнопку <strong style="color:var(--accent)">«Новый чат»</strong> (<i class="fas fa-feather-alt"></i>) в левом сайдбаре. Создастся пустой диалог, а после первого сообщения ИИ автоматически придумает для него название. Все чаты сохраняются в вашей учётной записи и будут доступны с любого устройства, где вы войдёте в DiamKey.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-feather-alt"></i><div><strong>Кнопка «Новый чат»</strong><br><span style="color:var(--text-secondary)">Находится в сайдбаре слева</span></div></div>`, interactive: `<div class="tutorial-demo-interactive" id="tutorialNewChat"><i class="fas fa-hand-pointer"></i> Нажмите, чтобы создать новый чат</div>` },
        { title: 'Папки для порядка', html: `<p>Когда чатов становится много, их удобно <strong style="color:var(--accent)">группировать по папкам</strong>. Перейдите на вкладку «Папки» (<i class="fas fa-folder"></i>) в сайдбаре. Там вы можете создавать папки, задавать им иконки и цвета, а затем переносить в них чаты. Например, можно сделать папки «Учёба», «Работа», «Код» и быстро находить нужные диалоги. Папки тоже синхронизируются через DiamKey.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-folder"></i><div><strong>Пример папки:</strong><br><span style="color:var(--text-secondary)">«Учёба», «Работа», «Код»</span></div></div>`, interactive: `<div class="tutorial-demo-interactive" id="tutorialOpenFolders"><i class="fas fa-hand-pointer"></i> Открыть папки</div>` },
        { title: 'Мастерская', html: `<p>Раздел <strong style="color:var(--accent)">«Мастерская»</strong> (<i class="fas fa-wrench"></i>) содержит специальные инструменты, расширяющие возможности ИИ. Сейчас там доступен инструмент <strong>«Распознать ИИ»</strong> — он анализирует текст и определяет, написан он человеком или сгенерирован другой нейросетью (GPT, Mistral и др.). В будущем появятся новые инструменты, такие как Code Review и Переводчик.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-wrench"></i><div><strong>Инструмент:</strong><br><span style="color:var(--text-secondary)">«Распознать ИИ» — анализ текста</span></div></div>`, interactive: `<div class="tutorial-demo-interactive" id="tutorialOpenWorkshop"><i class="fas fa-hand-pointer"></i> Открыть мастерскую</div>` },
        { title: 'Твой профиль', html: `<p>В нижней части сайдбара расположена <strong style="color:var(--accent)">панель пользователя</strong>. Здесь отображаются ваш никнейм и аватар. Рядом — кнопка <strong style="color:var(--accent)">шестерёнки</strong> (<i class="fas fa-cog"></i>), открывающая настройки. В настройках можно сменить язык интерфейса, изменить данные профиля DiamKey (аватар, ник, пароль), запустить обучение заново или выйти из аккаунта.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-user-circle"></i><div><strong>Панель пользователя</strong><br><span style="color:var(--text-secondary)">Внизу сайдбара</span></div></div>`, interactive: `<div class="tutorial-demo-interactive" id="tutorialOpenSettings"><i class="fas fa-hand-pointer"></i> Открыть настройки</div>` },
        { title: 'Поиск по истории', html: `<p>Если чатов накопилось очень много, воспользуйтесь <strong style="color:var(--accent)">поиском</strong> (<i class="fas fa-search"></i>) в верхней части сайдбара. Он ищет не только по названиям чатов, но и внутри самих сообщений, мгновенно фильтруя список. Найденный текст подсвечивается в диалоге.</p>`, demo: `<div class="tutorial-demo-box"><i class="fas fa-search"></i><div><strong>Поиск чатов</strong><br><span style="color:var(--text-secondary)">Мгновенная фильтрация</span></div></div>`, interactive: `<div class="tutorial-demo-interactive" id="tutorialFocusSearch"><i class="fas fa-hand-pointer"></i> Попробовать поиск</div>` },
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
            <div class="tutorial-header"><h2>${step.title}</h2><button class="tutorial-btn skip" id="tutorialSkip"><i class="fas fa-times"></i></button></div>
            <div class="tutorial-step-indicator">${dots}</div>
            <div class="tutorial-body">
                <div id="tutorialContent" class="tutorial-fade-text"></div>
                ${step.demo ? step.demo : ''}
                ${step.interactive ? step.interactive : ''}
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
            contentEl.innerHTML = step.html;
            requestAnimationFrame(() => {
                contentEl.classList.add('show');
            });
        }
        document.getElementById('tutorialSkip').addEventListener('click', closeTutorial);
        document.getElementById('tutorialNext').addEventListener('click', nextTutorialStep);
        document.getElementById('tutorialPrev').addEventListener('click', prevTutorialStep);
        setTimeout(() => {
            document.getElementById('tutorialFocusInput')?.addEventListener('click', () => { closeTutorial(); document.getElementById('user-input')?.focus(); });
            document.getElementById('tutorialNewChat')?.addEventListener('click', () => { closeTutorial(); createNewChat(); });
            document.getElementById('tutorialOpenFolders')?.addEventListener('click', () => { closeTutorial(); switchToFoldersView(); });
            document.getElementById('tutorialOpenWorkshop')?.addEventListener('click', () => { closeTutorial(); switchToWorkshopView(); });
            document.getElementById('tutorialOpenSettings')?.addEventListener('click', () => { closeTutorial(); showSettingsModal(); });
            document.getElementById('tutorialFocusSearch')?.addEventListener('click', () => { closeTutorial(); document.getElementById('history-search')?.focus(); });
        }, 100);
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
        document.getElementById('tabLogin')?.addEventListener('click', ()=>{ document.getElementById('tabLogin').classList.add('active'); document.getElementById('tabRegister').classList.remove('active'); document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; });
        document.getElementById('tabRegister')?.addEventListener('click', ()=>{ document.getElementById('tabRegister').classList.add('active'); document.getElementById('tabLogin').classList.remove('active'); document.getElementById('registerForm').style.display='block'; document.getElementById('loginForm').style.display='none'; });
        document.getElementById('doLoginBtn')?.addEventListener('click', login);
        document.getElementById('doRegisterBtn')?.addEventListener('click', register);
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

    const __performOCR = performOCR;
    performOCR = async function(file) {
        await ensureTesseract();
        return __performOCR(file);
    };

    const __readDocx = readDocx;
    readDocx = async function(file) {
        await ensureMammoth();
        return __readDocx(file);
    };

    const __renderMermaidBlocks = renderMermaidBlocks;
    renderMermaidBlocks = async function(container) {
        await ensureMermaid();
        return __renderMermaidBlocks(container);
    };

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    (async function() {
        log('Загрузка...');
        if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').catch(()=>{}); }
        const savedLang = localStorage.getItem('diamond_language');
        if (savedLang && ['ru','en'].includes(savedLang)) currentLanguage = savedLang;
        loadWorkshopToolsState();
        await fetchMistralKey();
        const savedUser = localStorage.getItem('diamond_user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            await loadChatsAndFolders();
            await refreshUserProfile();
            await loadForumMessages();
            if (workshopTools.ai_detect) await createToolChatWithGreeting('ai_detect');
        }
        await showLoadingScreen();
        if (currentUser) {
            document.getElementById('choiceScreen').style.display = 'none';
            document.getElementById('mainUI').style.display = 'flex';
            setTimeout(() => document.getElementById('mainUI').classList.add('visible'), 50);
            updateUserPanel();
            setupFileAttachment();
            if (chats.length === 0) renderEmptyState(); else renderChat();
        } else {
            document.getElementById('choiceScreen').style.display = 'flex';
        }
        setupEventListeners();
        updateUILanguage();
        updateUserPanel();
        updateSendButtonState();
        if (chats.length) renderHistory();
        document.documentElement.style.setProperty('--collapsed-left-offset', '85px');
        log('Готово');
    })();
})();
