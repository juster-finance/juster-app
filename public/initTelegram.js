function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function initializeMiniApp() {
    const telegramWebApp = window.Telegram?.WebApp;
    
    if (!telegramWebApp)
        return;

    telegramWebApp.disableVerticalSwipes()

    const themeColor = '#1A1A1D';
    telegramWebApp.setHeaderColor(themeColor);
    telegramWebApp.setBackgroundColor(themeColor);
}

(async () => {
    if (!window.TelegramWebviewProxy)
        return

    const scriptURL = 'https://telegram.org/js/telegram-web-app.js';
    try {
        await loadScript(scriptURL);
    } catch (error) {
        console.error('Error loading Telegram script:', error);
    }

    window.onload = async () => {
        initializeMiniApp();
    }
})();
