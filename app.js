/* ========== ИНДИКАТОР ГЕНЕРАЦИИ В ЧАТЕ ========== */
.generation-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 24px;
    margin: 0 24px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.generation-indicator-content {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-secondary);
    font-size: 15px;
}
.generation-icon {
    font-size: 20px;
    color: var(--accent);
    animation: penWrite 0.8s ease-in-out infinite alternate;
}
@keyframes penWrite {
    0% { transform: translateY(0) rotate(-10deg); }
    100% { transform: translateY(-4px) rotate(10deg); }
}
.generation-text {
    font-weight: 500;
}
.generation-timer {
    font-size: 12px;
    opacity: 0.7;
    margin-left: auto;
}

/* ========== МЕТКА ВРЕМЕНИ ГЕНЕРАЦИИ ПОД СООБЩЕНИЕМ ========== */
.generation-time-label {
    font-size: 10px;
    color: var(--text-secondary);
    opacity: 0.5;
    text-align: right;
    margin-top: 2px;
    padding: 0 6px;
}
