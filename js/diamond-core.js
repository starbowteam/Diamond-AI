// ==================== DIAMOND AI v46 — ЯДРО (конфигурация, утилиты, локализация) ====================
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

// ========== ЛОКАЛИЗАЦИЯ (полная) ==========
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
        documents: 'Документы',
        codeReview: 'Code Review',
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
        documentsGreeting: 'Готов искать по вашим документам! Загрузите файлы или спросите о чём‑то.',
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
        documentsToolDesc: 'Поиск по вашим загруженным документам. Загружайте файлы и задавайте вопросы — ИИ найдёт ответ в документах.',
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
        disclaimerTitle: 'Diamond AI',
        disclaimerText: 'ИИ только для справки. Может ошибаться. Проверяйте важную информацию. Модель обучается еженедельно.',
        disclaimerClose: 'Понятно',
        generatedIn: 'Сгенерировано за',
        sec: 'с',
        copyAction: 'Копировать',
        regenAction: 'Регенерировать',
        editAction: 'Редактировать',
        copyUserAction: 'Копировать',
        saveEdit: 'Сохранить',
        cancelEdit: 'Отмена'
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
        documents: 'Documents',
        codeReview: 'Code Review',
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
        documentsGreeting: 'Ready to search your documents! Upload files or ask anything.',
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
        documentsToolDesc: 'Search your uploaded documents. Upload files and ask questions – AI will find answers in documents.',
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
        disclaimerTitle: 'Diamond AI',
        disclaimerText: 'AI is for reference only. May make mistakes. Verify important info. Model updated weekly.',
        disclaimerClose: 'Got it',
        generatedIn: 'Generated in',
        sec: 'sec',
        copyAction: 'Copy',
        regenAction: 'Regenerate',
        editAction: 'Edit',
        copyUserAction: 'Copy',
        saveEdit: 'Save',
        cancelEdit: 'Cancel'
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

// Основные идентификаторы моделей
const AI_MODEL_LARGE = 'mistral-large-latest';
const AI_MODEL_CODE = 'codestral-latest';
const AI_MODEL_SMALL = 'mistral-small-latest';

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
    },
    knowledge_rag: {
        role: 'system',
        content: `Ты — ассистент по документам. Твоя задача: отвечать на вопросы пользователя, ИСПОЛЬЗУЯ ТОЛЬКО информацию из загруженных документов. Если пользователь прикрепил файл, его содержимое будет в тексте запроса. Всегда ищи ответ в предоставленных документах. Если информации недостаточно, скажи: "В моих документах нет данных по этому вопросу. Уточните запрос или загрузите дополнительные файлы." Никогда не используй свои общие знания — только содержимое загруженных документов.`
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

// ========== РАБОТА С SUPABASE ==========
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== LaTeX РЕНДЕР (исправлен полностью) ==========
function renderMathInElementWithMhchem(element) {
    if (!element || typeof renderMathInElement === 'undefined') return;

    // Удаляем старые отрендеренные формулы, чтобы избежать двойного парсинга и конфликтов
    const existingKatex = element.querySelectorAll('.katex, .katex-display');
    existingKatex.forEach(el => {
        // Заменяем старый блок его исходным текстом, чтобы KaTeX мог заново его обработать
        const original = el.getAttribute('data-original') || el.textContent;
        const textNode = document.createTextNode(original);
        el.parentNode.replaceChild(textNode, el);
    });

    try {
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError: false,
            strict: false,
            maxExpand: 10000,
            errorCallback: (msg, err) => {
                console.warn('KaTeX error (игнорирована):', msg, err);
            }
        });
    } catch(e) {
        console.warn('Math render error:', e);
    }
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

function loadWorkshopToolsState() {
    const saved = localStorage.getItem('diamond_workshop_tools');
    if (saved) { try { workshopTools = JSON.parse(saved); } catch(e) { workshopTools = {}; } }
    if (!workshopTools || Object.keys(workshopTools).length === 0) { workshopTools = { ai_detect: false }; }
}
function saveWorkshopToolsState() { localStorage.setItem('diamond_workshop_tools', JSON.stringify(workshopTools)); }

function generateFastSecret() { return Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15); }
function generateToken() { const adj=['golden','silver','mystic','shadow','prime','crystal','onyx','brave','frost'], nouns=['falcon','tiger','phoenix','dragon','wolf','spark','nexus','core','vault','key']; return `diamkey_${adj[Math.floor(Math.random()*adj.length)]}_${nouns[Math.floor(Math.random()*nouns.length)]}_${nouns[Math.floor(Math.random()*nouns.length)]}_${Math.floor(1000+Math.random()*9000)}`; }

let mistralApiKey = '';

async function fetchApiKeys() {
    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/service_config?id=eq.1`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
        if (!resp.ok) return false;
        const data = await resp.json();
        if (data && data.length > 0) {
            mistralApiKey = data[0].mistral_api_key || '';
            return true;
        }
        return false;
    } catch (e) { console.error('Ошибка загрузки API-ключей:', e); return false; }
}
