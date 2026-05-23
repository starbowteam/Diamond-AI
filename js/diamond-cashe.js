// ==================== DIAMOND CACHE — быстрое локальное хранилище ====================
const DB_NAME = 'diamond_cache';
const DB_VERSION = 1;

// Открываем/создаём базу IndexedDB
function openCacheDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('chats')) {
                db.createObjectStore('chats', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('folders')) {
                db.createObjectStore('folders', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('profile')) {
                db.createObjectStore('profile', { keyPath: 'login' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// ========== ЧАТЫ ==========
async function cacheChats(chatsArray) {
    const db = await openCacheDB();
    const tx = db.transaction('chats', 'readwrite');
    const store = tx.objectStore('chats');
    await store.clear();
    for (const chat of chatsArray) {
        store.put(chat);
    }
    await tx.complete;
}

async function getCachedChats() {
    const db = await openCacheDB();
    const tx = db.transaction('chats', 'readonly');
    const store = tx.objectStore('chats');
    const request = store.getAll();
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ========== ПАПКИ ==========
async function cacheFolders(foldersArray) {
    const db = await openCacheDB();
    const tx = db.transaction('folders', 'readwrite');
    const store = tx.objectStore('folders');
    await store.clear();
    for (const folder of foldersArray) {
        store.put(folder);
    }
    await tx.complete;
}

async function getCachedFolders() {
    const db = await openCacheDB();
    const tx = db.transaction('folders', 'readonly');
    const store = tx.objectStore('folders');
    const request = store.getAll();
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ========== ПРОФИЛЬ ==========
async function cacheProfile(profile) {
    const db = await openCacheDB();
    const tx = db.transaction('profile', 'readwrite');
    const store = tx.objectStore('profile');
    await store.clear();
    store.put(profile);
    await tx.complete;
}

async function getCachedProfile() {
    const db = await openCacheDB();
    const tx = db.transaction('profile', 'readonly');
    const store = tx.objectStore('profile');
    const request = store.getAll();
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            const result = request.result;
            resolve(result.length > 0 ? result[0] : null);
        };
        request.onerror = () => reject(request.error);
    });
}
