// COMPACT AI ASSISTANT
class AIAssistantUI {
    constructor() {
        this.messageCount = 0;
        this.moodChanges = 0;
        // TTS налаштування
        this.ttsEnabled = false;
        this.ttsLang = 'uk-UA';
        this.ttsVoice = null;
        
        // Команди для автодоповнення
        this.commands = {
            'uk': [
                '/help - Показати всі команди',
                '/clear - Очистити чат',
                '/stats - Показати статистику',
                '/joke - Розказати жарт',
                '/weather - Погода',
                '/news - Останні новини',
                '/translate - Перекласти текст',
                '/currency - Курси валют',
                '/calc - Калькулятор',
                '/time - Поточний час',
                '/date - Поточна дата',
                '/mood - Змінити особистість',
                '/lang - Змінити мову'
            ],
            'en': [
                '/help - Show all commands',
                '/clear - Clear chat',
                '/stats - Show statistics',
                '/joke - Tell a joke',
                '/weather - Weather',
                '/news - Latest news',
                '/translate - Translate text',
                '/currency - Exchange rates',
                '/calc - Calculator',
                '/time - Current time',
                '/date - Current date',
                '/mood - Change personality',
                '/lang - Change language'
            ]
        };
        
        this.init();
        this.initTTS();
        this.initAutocomplete();
    }
    
    init() {
        console.log('🔧 Ініціалізація AI Асистента...');
        
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.loading = document.getElementById('loading');
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.querySelector('.main-content');
        
        // File upload elements
        this.fileBtn = document.getElementById('file-btn');
        this.fileInput = document.getElementById('file-input');
        this.attachedFilesContainer = document.getElementById('attached-files');
        this.attachedFiles = [];
        
        // Перевірка елементів
        console.log('📋 Перевірка елементів:');
        console.log('  chatMessages:', this.chatMessages ? '✅' : '❌');
        console.log('  userInput:', this.userInput ? '✅' : '❌');
        console.log('  sendBtn:', this.sendBtn ? '✅' : '❌');
        console.log('  loading:', this.loading ? '✅' : '❌');
        
        if (!this.sendBtn) {
            console.error('❌ ПОМИЛКА: Кнопка відправки не знайдена!');
            return;
        }
        
        if (!this.userInput) {
            console.error('❌ ПОМИЛКА: Поле вводу не знайдене!');
            return;
        }
        
        // Events
        console.log('🔗 Прикріплення обробників подій...');
        
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', (e) => {
                console.log('🖱️ Клік по кнопці відправки', e);
                e.preventDefault();
                e.stopPropagation();
                this.sendMessage();
            });
            console.log('  ✅ sendBtn обробник додано');
        } else {
            console.error('  ❌ sendBtn не знайдено!');
        }
        
        if (this.userInput) {
            this.userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    console.log('⌨️ Enter натиснуто');
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            this.userInput.addEventListener('input', () => this.autoResize());
            console.log('  ✅ userInput обробники додано');
        } else {
            console.error('  ❌ userInput не знайдено!');
        }
        
        // File upload handlers
        if (this.fileBtn && this.fileInput) {
            this.fileBtn.addEventListener('click', () => {
                this.fileInput.click();
            });
            
            this.fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e);
            });
            console.log('  ✅ File upload обробники додано');
        }
        
        // Sidebar toggle
        this.sidebarToggle?.addEventListener('click', () => this.toggleSidebar());
        
        console.log('✅ Ініціалізація завершена!');
        
        // Quick actions
        document.querySelectorAll('[data-message]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.userInput.value = btn.dataset.message;
                this.sendMessage();
            });
        });
        
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'play_game') this.showGameMenu();
                else if (action === 'show_memory') this.showMemory();
                else if (action === 'clear_chat') this.clearChat();
                else if (action === 'clear_memory') this.clearMemory();
            });
        });
        
        // Mood & Export
        document.getElementById('change-mood-btn')?.addEventListener('click', () => this.changeMood());
        document.getElementById('export-btn')?.addEventListener('click', () => this.exportChat());
        document.getElementById('new-chat-btn')?.addEventListener('click', () => this.clearChat());
        
        // TTS controls
        document.getElementById('tts-toggle-btn')?.addEventListener('click', () => this.toggleTTS());
        document.getElementById('tts-lang-btn')?.addEventListener('click', () => this.changeTTSLang());
        
        // About button
        this.initAboutModal();
        
        this.checkStatus();
        this.userInput.focus();
    }
    
    initAutocomplete() {
        // Створюємо елемент для автодоповнення
        const autocompleteDiv = document.createElement('div');
        autocompleteDiv.id = 'autocomplete-suggestions';
        autocompleteDiv.className = 'autocomplete-suggestions';
        this.userInput.parentElement.appendChild(autocompleteDiv);
        
        this.autocompleteDiv = autocompleteDiv;
        
        // Обробка введення для автодоповнення
        this.userInput.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Показуємо підказки тільки якщо починається з /
            if (value.startsWith('/')) {
                this.showAutocomplete(value);
            } else {
                this.hideAutocomplete();
            }
        });
        
        // Закриваємо при кліку поза полем
        document.addEventListener('click', (e) => {
            if (!this.userInput.contains(e.target) && !this.autocompleteDiv.contains(e.target)) {
                this.hideAutocomplete();
            }
        });
        
        // Обробка клавіш для навігації
        this.userInput.addEventListener('keydown', (e) => {
            if (this.autocompleteDiv.style.display === 'block') {
                const items = this.autocompleteDiv.querySelectorAll('.autocomplete-item');
                const activeItem = this.autocompleteDiv.querySelector('.autocomplete-item.active');
                let currentIndex = Array.from(items).indexOf(activeItem);
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentIndex = (currentIndex + 1) % items.length;
                    this.setActiveAutocomplete(items, currentIndex);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
                    this.setActiveAutocomplete(items, currentIndex);
                } else if (e.key === 'Tab' && activeItem) {
                    e.preventDefault();
                    const command = activeItem.dataset.command;
                    this.userInput.value = command + ' ';
                    this.hideAutocomplete();
                    this.userInput.focus();
                }
            }
        });
    }
    
    showAutocomplete(value) {
        const lang = this.ttsLang === 'en-US' ? 'en' : 'uk';
        const commands = this.commands[lang];
        
        // Фільтруємо команди
        const filtered = commands.filter(cmd => 
            cmd.toLowerCase().startsWith(value.toLowerCase())
        );
        
        if (filtered.length === 0) {
            this.hideAutocomplete();
            return;
        }
        
        // Показуємо підказки
        this.autocompleteDiv.innerHTML = '';
        filtered.forEach((cmd, index) => {
            const parts = cmd.split(' - ');
            const command = parts[0];
            const description = parts[1] || '';
            
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            if (index === 0) item.classList.add('active');
            item.dataset.command = command;
            item.innerHTML = `
                <span class="autocomplete-command">${command}</span>
                <span class="autocomplete-desc">${description}</span>
            `;
            
            item.addEventListener('click', () => {
                this.userInput.value = command + ' ';
                this.hideAutocomplete();
                this.userInput.focus();
            });
            
            this.autocompleteDiv.appendChild(item);
        });
        
        this.autocompleteDiv.style.display = 'block';
    }
    
    setActiveAutocomplete(items, index) {
        items.forEach(item => item.classList.remove('active'));
        if (items[index]) {
            items[index].classList.add('active');
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }
    
    hideAutocomplete() {
        this.autocompleteDiv.style.display = 'none';
    }
    
    toggleSidebar() {
        this.sidebar.classList.toggle('hidden');
        this.mainContent.classList.toggle('sidebar-hidden');
    }
    
    autoResize() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = this.userInput.scrollHeight + 'px';
        const count = this.userInput.value.length;
        document.getElementById('char-count').textContent = `${count}/500`;
    }
    
    async sendMessage() {
        console.log('📤 sendMessage викликано');
        
        // Якщо є прикріплені файли, використовуємо інший метод
        if (this.attachedFiles && this.attachedFiles.length > 0) {
            return this.sendMessageWithFiles();
        }
        
        const message = this.userInput.value.trim();
        console.log('📝 Повідомлення:', message);
        if (!message) {
            console.log('⚠️ Повідомлення порожнє, відміна');
            return;
        }
        
        if (this.welcomeScreen) this.welcomeScreen.remove();
        
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.autoResize();
        this.showLoading();
        
        try {
            // Визначаємо поточну мову на основі ttsLang
            const currentLanguage = this.ttsLang === 'en-US' ? 'en' : 'uk';
            
            const res = await fetch('/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    message: message,
                    language: currentLanguage  // Передаємо мову
                })
            });
            
            // Перевірка статусу відповіді
            if (!res.ok) {
                this.hideLoading();
                if (res.status === 401) {
                    // Функція в розробці
                    this.addMessage('🚧 Вибач, ця функція ще в розробці! Скоро буде доступна. Спробуй щось інше! 😊', 'assistant');
                } else {
                    this.addMessage(`⚠️ Помилка сервера (${res.status}). Спробуй ще раз!`, 'assistant');
                }
                return;
            }
            
            const data = await res.json();
            console.log('Response:', data); // DEBUG
            this.hideLoading();
            
            // Перевірка на помилку в даних
            if (data.error) {
                if (data.error.includes('401') || data.error.includes('Unauthorized')) {
                    this.addMessage('🚧 Вибач, генерація зображень ще в розробці! Скоро додам цю можливість. А поки що можу допомогти з чимось іншим! 😊', 'assistant');
                } else {
                    this.addMessage(`⚠️ ${data.error}`, 'assistant');
                }
                return;
            }
            
            // Обробка команди очищення чату
            if (data.action === 'clear_chat') {
                this.clearChat();
                return;
            }
            
            // Обробка TTS команд
            if (data.tts_command) {
                if (data.tts_command === 'enable') {
                    this.ttsEnabled = true;
                    document.getElementById('tts-toggle-btn').textContent = '🔊';
                } else if (data.tts_command === 'disable') {
                    this.ttsEnabled = false;
                    document.getElementById('tts-toggle-btn').textContent = '🔇';
                } else if (data.tts_command === 'change_lang_en') {
                    this.ttsLang = 'en-US';
                    document.getElementById('tts-lang-btn').textContent = '🇬🇧';
                    const voices = speechSynthesis.getVoices();
                    this.ttsVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
                } else if (data.tts_command === 'change_lang_uk') {
                    this.ttsLang = 'uk-UA';
                    document.getElementById('tts-lang-btn').textContent = '🇺🇦';
                    const voices = speechSynthesis.getVoices();
                    this.ttsVoice = voices.find(v => v.lang.startsWith('uk')) || 
                                    voices.find(v => v.lang.startsWith('ru')) || 
                                    voices[0];
                }
            }
            
            this.addMessage(data.response, 'assistant', data.command || false);
            
            // Озвучуємо відповідь
            this.speak(data.response);
            
            if (data.type === 'image' && data.image_url) {
                console.log('Image URL:', data.image_url); // DEBUG
                this.addImageMessage(data.image_url, data.image_prompt);
            }
        } catch (error) {
            console.error('Error:', error); // DEBUG
            this.hideLoading();
            this.addMessage('⚠️ Помилка з\'єднання. Перевір інтернет та спробуй ще раз!', 'assistant');
        }
        this.messageCount++;
    }
    
    addMessage(content, sender, isCommand = false) {
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;
        
        // Додаємо індикатор команди
        const commandIndicator = isCommand ? '<span class="command-indicator"></span>' : '';
        
        // Для користувача - показуємо відразу
        if (sender === 'user') {
            div.innerHTML = `
                <div class="message-avatar">👤</div>
                <div class="message-content">${commandIndicator}${this.formatMessage(content)}</div>
            `;
            this.chatMessages.appendChild(div);
            this.scrollToBottom();
        } else {
            // Для AI - анімація друкування
            div.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">${commandIndicator}<span class="typing-text"></span><span class="typing-cursor">|</span></div>
            `;
            this.chatMessages.appendChild(div);
            this.scrollToBottom();
            
            // Запускаємо анімацію друкування
            const textElement = div.querySelector('.typing-text');
            const cursor = div.querySelector('.typing-cursor');
            this.typeWriter(content, textElement, cursor);
        }
    }
    
    typeWriter(text, element, cursor, speed = 30) {
        // Форматуємо текст (конвертуємо \n в <br>, додаємо bold/italic)
        const formattedText = this.formatMessage(text);
        
        // Розбиваємо на частини (текст і HTML теги)
        const parts = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formattedText;
        
        // Функція для рекурсивного збору тексту та тегів
        const collectParts = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                // Текстовий вузол - додаємо посимвольно
                const text = node.textContent;
                for (let i = 0; i < text.length; i++) {
                    parts.push({ type: 'char', content: text[i] });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // HTML елемент
                if (node.tagName === 'BR') {
                    parts.push({ type: 'tag', content: '<br>' });
                } else if (node.tagName === 'STRONG') {
                    parts.push({ type: 'tag', content: '<strong>' });
                    Array.from(node.childNodes).forEach(collectParts);
                    parts.push({ type: 'tag', content: '</strong>' });
                } else if (node.tagName === 'EM') {
                    parts.push({ type: 'tag', content: '<em>' });
                    Array.from(node.childNodes).forEach(collectParts);
                    parts.push({ type: 'tag', content: '</em>' });
                } else {
                    // Інші теги - просто обробляємо дітей
                    Array.from(node.childNodes).forEach(collectParts);
                }
            }
        };
        
        Array.from(tempDiv.childNodes).forEach(collectParts);
        
        // Анімація друкування
        let index = 0;
        let currentHTML = '';
        
        const type = () => {
            if (index < parts.length) {
                const part = parts[index];
                
                if (part.type === 'char') {
                    // Додаємо символ
                    currentHTML += part.content;
                } else if (part.type === 'tag') {
                    // Додаємо тег
                    currentHTML += part.content;
                }
                
                element.innerHTML = currentHTML;
                index++;
                
                // Прокручуємо вниз
                this.scrollToBottom();
                
                // Швидше для пробілів і тегів
                const delay = (part.type === 'tag' || part.content === ' ') ? speed / 3 : speed;
                setTimeout(type, delay);
            } else {
                // Прибираємо курсор після завершення
                if (cursor) {
                    cursor.style.opacity = '0';
                    setTimeout(() => cursor.remove(), 300);
                }
            }
        };
        
        type();
    }
    
    addImageMessage(url, prompt) {
        console.log('Adding image:', url);
        const div = document.createElement('div');
        div.className = 'message assistant-message';
        
        div.innerHTML = `
            <div class="message-avatar">🎨</div>
            <div class="message-content">
                <img src="${url}" 
                     alt="Generated" 
                     style="max-width:100%;border-radius:12px;margin:1rem 0;display:block"
                     onerror="console.error('Failed to load:', this.src)">
                <small style="color:var(--text-tertiary);display:block;margin-top:0.5rem">📝 ${prompt}</small>
            </div>
        `;
        this.chatMessages.appendChild(div);
        this.scrollToBottom();
    }
    
    formatMessage(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    async changeMood() {
        // Показуємо меню вибору особистості
        this.showPersonalitySelector();
    }
    
    showPersonalitySelector() {
        // Список особистостей з описами
        const personalities = {
            'normal': { emoji: '🤖', name: 'Звичайний', desc: 'Дружній і корисний асистент' },
            'hacker': { emoji: '💻', name: 'Хакер', desc: 'Технічний гік з кіберпанк світу' },
            'scientist': { emoji: '🔬', name: 'Вчений', desc: 'Науковий дослідник' },
            'poet': { emoji: '📜', name: 'Поет', desc: 'Романтик і митець слова' },
            'gamer': { emoji: '🎮', name: 'Геймер', desc: 'Енергійний про-гравець' },
            'philosopher': { emoji: '🧘', name: 'Філософ', desc: 'Мудрець і мислитель' },
            'comedian': { emoji: '😂', name: 'Комік', desc: 'Веселий жартівник' },
            'detective': { emoji: '🕵️', name: 'Детектив', desc: 'Аналітичний розслідувач' },
            'alien': { emoji: '👽', name: 'Інопланетянин', desc: 'Гість з іншої галактики' }
        };
        
        // Створюємо HTML для вибору
        let personalitiesHTML = '';
        for (const [key, info] of Object.entries(personalities)) {
            const isActive = key === this.getCurrentPersonality();
            personalitiesHTML += `
                <div class="personality-card ${isActive ? 'active' : ''}" onclick="ui.selectPersonality('${key}')">
                    <div class="personality-emoji">${info.emoji}</div>
                    <div class="personality-info">
                        <div class="personality-name">${info.name}</div>
                        <div class="personality-desc">${info.desc}</div>
                    </div>
                    ${isActive ? '<div class="personality-check">✓</div>' : ''}
                </div>
            `;
        }
        
        // Показуємо модальне вікно
        const overlay = document.getElementById('modal-overlay');
        const container = overlay.querySelector('.modal-container');
        
        container.className = 'modal-container personality-selector';
        container.innerHTML = `
            <div class="modal-header">
                <span class="modal-icon">🎭</span>
                <h3 class="modal-title">Обери особистість AI</h3>
            </div>
            <div class="modal-body personality-grid">
                ${personalitiesHTML}
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-secondary" onclick="ui.hideModal()">Закрити</button>
            </div>
        `;
        
        overlay.classList.add('show');
        overlay.classList.remove('hiding');
        
        // Закриття по кліку поза вікном
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                this.hideModal();
            }
        };
    }
    
    async selectPersonality(personality) {
        this.hideModal();
        this.showLoading();
        
        try {
            const res = await fetch('/mood/set', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({personality: personality})
            });
            const data = await res.json();
            this.hideLoading();
            
            // Зберігаємо в localStorage
            localStorage.setItem('current_personality', personality);
            
            // Застосовуємо візуальні ефекти
            this.applyPersonalityEffects(data.personality, data.emoji);
            
            document.getElementById('mood-emoji').textContent = data.emoji;
            this.addMessage(data.message, 'assistant');
            this.moodChanges++;
        } catch (error) {
            this.hideLoading();
            this.showError('Помилка зміни особистості');
        }
    }
    
    getCurrentPersonality() {
        // Отримуємо поточну особистість (можна зберігати в localStorage)
        return localStorage.getItem('current_personality') || 'normal';
    }
    
    async showMemory() {
        this.showLoading();
        try {
            const res = await fetch('/memory');
            const data = await res.json();
            this.hideLoading();
            this.addMessage(`🧠 ${data.user_info}`, 'assistant');
        } catch (error) {
            this.hideLoading();
        }
    }
    
    async clearMemory() {
        this.showConfirm('Ви впевнені, що хочете очистити пам\'ять? Всі збережені дані будуть видалені.', async () => {
            this.showLoading();
            try {
                const res = await fetch('/memory', {method: 'DELETE'});
                const data = await res.json();
                this.hideLoading();
                this.addMessage(data.response, 'assistant');
                this.showSuccess('Пам\'ять успішно очищено!');
            } catch (error) {
                this.hideLoading();
                this.showError('Помилка очищення пам\'яті');
            }
        }, 'Очистити пам\'ять?');
    }
    
    clearChat() {
        // Просте підтвердження через браузер
        if (confirm('Ви впевнені, що хочете очистити чат? Всі повідомлення будуть видалені.')) {
            this.chatMessages.innerHTML = '';
            
            // Показуємо welcome screen знову
            const welcomeScreen = document.createElement('div');
            welcomeScreen.className = 'welcome-screen';
            welcomeScreen.id = 'welcome-screen';
            welcomeScreen.innerHTML = `
                <div class="welcome-icon">⚡</div>
                <h1 class="welcome-title">Вітаю в <span class="neon-name">KRAXS</span>!</h1>
                <p class="welcome-subtitle">Цифровий Титан на службі <span class="neon-name">KRATOSX</span></p>
                
                <div class="welcome-cards">
                    <button class="welcome-card" data-message="Розкажи цікавий факт про космос">
                        <div class="card-icon">🌌</div>
                        <div class="card-title">Цікаві факти</div>
                        <div class="card-desc">Дізнайся щось нове</div>
                    </button>
                    <button class="welcome-card" data-message="Намалюй футуристичного робота">
                        <div class="card-icon">🎨</div>
                        <div class="card-title">Генерація зображень</div>
                        <div class="card-desc">Створи унікальну картину</div>
                    </button>
                    <button class="welcome-card" data-action="play_game">
                        <div class="card-icon">🎮</div>
                        <div class="card-title">Ігри</div>
                        <div class="card-desc">Зіграй партію в шахи</div>
                    </button>
                    <button class="welcome-card" data-message="Допоможи з математикою: 156 * 89">
                        <div class="card-icon">🔢</div>
                        <div class="card-title">Обчислення</div>
                        <div class="card-desc">Розв'яжи задачу</div>
                    </button>
                </div>
            `;
            
            this.chatMessages.appendChild(welcomeScreen);
            this.welcomeScreen = welcomeScreen;
            
            // Додаємо обробники для welcome cards
            welcomeScreen.querySelectorAll('[data-message]').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.userInput.value = btn.dataset.message;
                    this.sendMessage();
                });
            });
            
            welcomeScreen.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    if (action === 'play_game') this.showGameMenu();
                });
            });
            
            this.messageCount = 0;
            console.log('✅ Чат очищено!');
        }
    }
    
    exportChat() {
        const messages = this.chatMessages.querySelectorAll('.message');
        let text = `=== AI ASSISTANT CHAT ===\n${new Date().toLocaleString()}\n\n`;
        messages.forEach((msg, i) => {
            const isUser = msg.classList.contains('user-message');
            const content = msg.querySelector('.message-content').textContent;
            text += `[${i + 1}] ${isUser ? 'ТИ' : 'AI'}:\n${content}\n\n`;
        });
        const blob = new Blob([text], {type: 'text/plain'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `chat_${Date.now()}.txt`;
        a.click();
        this.addMessage('📥 Експортовано!', 'assistant');
    }
    
    showGameMenu() {
        const div = document.createElement('div');
        div.className = 'message assistant-message';
        div.innerHTML = `
            <div class="message-avatar">🎮</div>
            <div class="message-content">
                <p><strong>Оберіть гру:</strong></p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;margin-top:1rem">
                    <button onclick="ui.startChess()" style="padding:0.75rem;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer">♟️ Шахи</button>
                    <button onclick="ui.startFool()" style="padding:0.75rem;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer">🃏 Дурень</button>
                    <button onclick="ui.startMinesweeper()" style="padding:0.75rem;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer">💣 Сапер</button>
                    <button onclick="ui.startPoker()" style="padding:0.75rem;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer">🃏 Покер</button>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(div);
        this.scrollToBottom();
    }
    
    startChess() { 
        if (typeof SimpleChess !== 'undefined') {
            this.showDifficultyDialog();
        } else {
            this.addMessage('Завантаження...', 'assistant');
            setTimeout(() => this.showDifficultyDialog(), 100);
        }
    }
    
    startFool() { 
        if (typeof SimpleFool !== 'undefined') {
            this.initFoolGame();
        } else {
            this.addMessage('Завантаження...', 'assistant');
            setTimeout(() => this.initFoolGame(), 100);
        }
    }
    
    startMinesweeper() { 
        if (typeof SimpleMinesweeper !== 'undefined') {
            this.initMinesweeper();
        } else {
            this.addMessage('Завантаження...', 'assistant');
            setTimeout(() => this.initMinesweeper(), 100);
        }
    }
    
    startPoker() { 
        if (typeof SimplePoker !== 'undefined') {
            this.initPoker();
        } else {
            this.addMessage('Завантаження...', 'assistant');
            setTimeout(() => this.initPoker(), 100);
        }
    }
    
    showDifficultyDialog() {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000';
        modal.innerHTML = `
            <div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:16px;padding:2rem;max-width:500px">
                <h2 style="margin-bottom:1rem;text-align:center">♟️ Оберіть складність</h2>
                <div style="display:grid;gap:1rem">
                    <button onclick="ui.startChessWithDifficulty(200);this.closest('[style*=fixed]').remove()" style="padding:1rem;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer">200 ELO - Новачок</button>
                    <button onclick="ui.startChessWithDifficulty(600);this.closest('[style*=fixed]').remove()" style="padding:1rem;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer">600 ELO - Початківець</button>
                    <button onclick="ui.startChessWithDifficulty(1000);this.closest('[style*=fixed]').remove()" style="padding:1rem;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer">1000 ELO - Середній</button>
                    <button onclick="ui.startChessWithDifficulty(2500);this.closest('[style*=fixed]').remove()" style="padding:1rem;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer">2500 ELO - Гросмейстер</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    startChessWithDifficulty(difficulty) {
        this.chessGame = new SimpleChess(difficulty);
        
        const fullscreen = document.createElement('div');
        fullscreen.className = 'game-fullscreen';
        fullscreen.id = 'game-fullscreen';
        
        fullscreen.innerHTML = `
            <div class="game-fullscreen-content">
                <div class="game-header">
                    <h2>♟️ Шахи (${difficulty} ELO)</h2>
                    <button class="game-close-btn" onclick="document.getElementById('game-fullscreen').remove()">✕</button>
                </div>
                <div class="chess-info">
                    <p>Твій хід! Клікай на фігуру, потім на клітинку</p>
                </div>
                <div class="chess-board" id="chess-board"></div>
                <div class="game-controls">
                    <button class="game-btn" onclick="ui.resetChess(${difficulty})">🔄 Нова гра</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(fullscreen);
        setTimeout(() => fullscreen.classList.add('show'), 10);
        this.renderChessBoard();
    }
    
    renderChessBoard() {
        const board = document.getElementById('chess-board');
        if (!board || !this.chessGame) return;
        
        board.innerHTML = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = document.createElement('div');
                cell.className = 'chess-cell ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
                cell.textContent = this.chessGame.board[r][c];
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                if (this.chessGame.selected && this.chessGame.selected.r === r && this.chessGame.selected.c === c) {
                    cell.classList.add('selected');
                }
                
                cell.onclick = () => this.handleChessClick(r, c);
                board.appendChild(cell);
            }
        }
    }
    
    handleChessClick(r, c) {
        if (!this.chessGame) return;
        
        const piece = this.chessGame.board[r][c];
        
        if (this.chessGame.selected) {
            const sel = this.chessGame.selected;
            if (this.chessGame.move(sel.r, sel.c, r, c)) {
                this.chessGame.selected = null;
                this.renderChessBoard();
                this.showToast('Хід зроблено!', '✅');
                
                setTimeout(() => {
                    const aiMove = this.chessGame.aiMove();
                    if (aiMove) {
                        this.renderChessBoard();
                        this.showToast('AI зробив хід', '🤖');
                    }
                }, 500);
            } else {
                this.chessGame.selected = null;
                this.renderChessBoard();
            }
        } else if (piece && this.chessGame.isWhite(piece) && this.chessGame.turn === 'white') {
            this.chessGame.selected = {r, c};
            this.renderChessBoard();
        }
    }
    
    resetChess(difficulty) {
        this.chessGame = new SimpleChess(difficulty);
        this.renderChessBoard();
        this.showToast('Нова гра!', '🔄');
    }
    
    showToast(message, emoji = '✨') {
        const toast = document.createElement('div');
        toast.className = 'game-toast';
        toast.innerHTML = `<span style="font-size:1.5rem;margin-right:0.5rem">${emoji}</span> ${message}`;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    
    initFoolGame() {
        this.foolGame = new SimpleFool();
        
        const fullscreen = document.createElement('div');
        fullscreen.className = 'game-fullscreen';
        fullscreen.innerHTML = `
            <div class="game-fullscreen-content">
                <div class="game-header">
                    <h2>🃏 Дурень</h2>
                    <button class="game-close-btn" onclick="this.closest('.game-fullscreen').remove()">✕</button>
                </div>
                <div style="text-align:center;margin:1rem 0;color:#00ff41">
                    <p>Козир: <span style="font-size:2rem">${this.foolGame.trump.card}</span></p>
                    <p>Карт в колоді: ${this.foolGame.deck.length}</p>
                </div>
                <div style="background:rgba(0,255,65,0.05);padding:2rem;border-radius:12px;margin:1rem 0;min-height:160px;border:1px solid rgba(0,255,65,0.2)">
                    <p style="text-align:center;color:rgba(0,255,65,0.6);margin-bottom:1rem">Стіл</p>
                    <div id="fool-table" class="table-cards"></div>
                </div>
                <div>
                    <p style="margin-bottom:0.5rem;color:#00ff41">Твої карти:</p>
                    <div id="fool-hand" class="card-fan"></div>
                </div>
                <div class="game-controls">
                    <button class="game-btn" onclick="ui.foolTake()">ВЗЯТИ</button>
                    <button class="game-btn" onclick="ui.foolPass()">ПАС</button>
                </div>
            </div>
        `;
        document.body.appendChild(fullscreen);
        setTimeout(() => fullscreen.classList.add('show'), 10);
        this.renderFool();
    }
    
    renderFool() {
        const hand = document.getElementById('fool-hand');
        const table = document.getElementById('fool-table');
        const trumpInfo = document.querySelector('.game-fullscreen-content > div:nth-child(2)');
        
        if (!hand || !this.foolGame) return;
        
        const getSuitClass = (card) => {
            if (card.includes('♥') || card.includes('♦')) return 'hearts';
            return '';
        };
        
        // Update trump and deck info
        if (trumpInfo) {
            trumpInfo.innerHTML = `
                <p>Козир: <span style="font-size:2rem">${this.foolGame.trump.card}</span></p>
                <p>Карт в колоді: ${this.foolGame.deck.length}</p>
                <p style="color:#00ff41;font-weight:bold">Атакує: ${this.foolGame.attacker === 'player' ? 'ТИ' : 'AI'}</p>
            `;
        }
        
        hand.innerHTML = this.foolGame.playerHand.map(cardObj => 
            `<div class="card-3d ${getSuitClass(cardObj.card)}" onclick="ui.foolPlay('${cardObj.card}')">${cardObj.card}</div>`
        ).join('');
        
        table.innerHTML = this.foolGame.table.map(cardObj => 
            `<div class="table-card ${getSuitClass(cardObj.card)}">${cardObj.card}</div>`
        ).join('');
    }
    
    foolPlay(card) {
        // Check if it's player's turn to attack
        if (this.foolGame.attacker !== 'player' && this.foolGame.table.length === 0) {
            this.showToast('Зараз не твій хід!', '❌');
            return;
        }
        
        // If defending, check if can beat
        if (this.foolGame.defending && this.foolGame.table.length > 0) {
            const attackCard = this.foolGame.table[this.foolGame.table.length - 1];
            const cardObj = this.foolGame.playerHand.find(c => c.card === card);
            if (!cardObj || !this.foolGame.canBeat(attackCard, cardObj)) {
                this.showToast('Ця карта не б\'є атакуючу!', '❌');
                return;
            }
        }
        
        if (!this.foolGame.playCard(card, true)) {
            this.showToast('Неможливо зіграти цю карту!', '❌');
            return;
        }
        
        this.renderFool();
        this.showToast('Карту зіграно!', '✅');
        
        // AI's turn
        setTimeout(() => {
            if (this.foolGame.attacker === 'ai' && !this.foolGame.defending) {
                // AI attacks
                const aiCard = this.foolGame.aiAttack();
                if (aiCard) {
                    this.showToast('AI атакує: ' + aiCard.card, '⚔️');
                    this.renderFool();
                }
            } else if (this.foolGame.defending && this.foolGame.attacker === 'player') {
                // AI defends
                const aiCard = this.foolGame.aiDefend();
                if (aiCard) {
                    this.showToast('AI відбив: ' + aiCard.card, '🃏');
                    this.renderFool();
                } else {
                    this.showToast('AI бере карти!', '📥');
                    this.foolGame.takeCards(false);
                    this.foolGame.drawCards();
                    this.renderFool();
                    
                    const winner = this.foolGame.checkWin();
                    if (winner) {
                        setTimeout(() => {
                            this.showToast(winner === 'player' ? 'Ти переміг! 🎉' : 'AI переміг! 😔', '🏆');
                        }, 500);
                    }
                }
            }
        }, 800);
    }
    
    foolTake() {
        if (this.foolGame.table.length === 0) {
            this.showToast('Стіл порожній!', '❌');
            return;
        }
        
        if (!this.foolGame.defending) {
            this.showToast('Зараз не час брати карти!', '❌');
            return;
        }
        
        this.foolGame.takeCards(true);
        this.showToast('Взяв карти', '📥');
        this.foolGame.drawCards();
        this.renderFool();
        
        const winner = this.foolGame.checkWin();
        if (winner) {
            setTimeout(() => {
                this.showToast(winner === 'player' ? 'Ти переміг! 🎉' : 'AI переміг! 😔', '🏆');
            }, 500);
            return;
        }
        
        // AI attacks
        setTimeout(() => {
            const aiCard = this.foolGame.aiAttack();
            if (aiCard) {
                this.showToast('AI атакує: ' + aiCard.card, '⚔️');
                this.renderFool();
            }
        }, 1000);
    }
    
    foolPass() {
        if (this.foolGame.table.length === 0) {
            this.showToast('Стіл порожній!', '❌');
            return;
        }
        
        // Can only pass if all cards are defended (table has even number of cards)
        if (this.foolGame.table.length % 2 !== 0) {
            this.showToast('Не всі карти відбиті!', '❌');
            return;
        }
        
        this.foolGame.clearTable();
        this.foolGame.attacker = this.foolGame.attacker === 'player' ? 'ai' : 'player';
        this.foolGame.drawCards();
        this.showToast('Відбито!', '✅');
        this.renderFool();
        
        const winner = this.foolGame.checkWin();
        if (winner) {
            setTimeout(() => {
                this.showToast(winner === 'player' ? 'Ти переміг! 🎉' : 'AI переміг! 😔', '🏆');
            }, 500);
            return;
        }
        
        // If AI is now attacker, AI attacks
        if (this.foolGame.attacker === 'ai') {
            setTimeout(() => {
                const aiCard = this.foolGame.aiAttack();
                if (aiCard) {
                    this.showToast('AI атакує: ' + aiCard.card, '⚔️');
                    this.renderFool();
                }
            }, 1000);
        }
    }
    
    initMinesweeper() {
        this.mineGame = new SimpleMinesweeper(10, 10, 15);
        
        const fullscreen = document.createElement('div');
        fullscreen.className = 'game-fullscreen';
        fullscreen.innerHTML = `
            <div class="game-fullscreen-content">
                <div class="game-header">
                    <h2>💣 Сапер</h2>
                    <button class="game-close-btn" onclick="this.closest('.game-fullscreen').remove()">✕</button>
                </div>
                <div id="mine-board" style="display:grid;grid-template-columns:repeat(10,1fr);gap:2px;max-width:500px;margin:0 auto"></div>
                <div class="game-controls">
                    <button class="game-btn" onclick="ui.resetMines()">🔄 Нова гра</button>
                </div>
            </div>
        `;
        document.body.appendChild(fullscreen);
        setTimeout(() => fullscreen.classList.add('show'), 10);
        this.renderMines();
    }
    
    renderMines() {
        const board = document.getElementById('mine-board');
        if (!board || !this.mineGame) return;
        
        board.innerHTML = '';
        for (let r = 0; r < this.mineGame.rows; r++) {
            for (let c = 0; c < this.mineGame.cols; c++) {
                const cell = document.createElement('div');
                cell.style.cssText = 'aspect-ratio:1;background:var(--bg-tertiary);border:1px solid var(--border-color);display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:4px';
                
                if (this.mineGame.revealed[r][c]) {
                    const val = this.mineGame.board[r][c];
                    cell.textContent = val === -1 ? '💣' : (val === 0 ? '' : val);
                    cell.style.background = val === -1 ? '#ff4444' : 'var(--bg-primary)';
                } else if (this.mineGame.flags[r][c]) {
                    cell.textContent = '🚩';
                }
                
                cell.onclick = () => {
                    const result = this.mineGame.reveal(r, c);
                    if (result === 'lose') this.showToast('Програв!', '💥');
                    this.renderMines();
                };
                
                cell.oncontextmenu = (e) => {
                    e.preventDefault();
                    this.mineGame.toggleFlag(r, c);
                    this.renderMines();
                };
                
                board.appendChild(cell);
            }
        }
    }
    
    resetMines() {
        this.mineGame = new SimpleMinesweeper(10, 10, 15);
        this.renderMines();
    }
    
    initPoker() {
        this.pokerGame = new SimplePoker();
        this.pokerGame.deal();
        this.pokerWaitingForPlayer = true;
        
        const fullscreen = document.createElement('div');
        fullscreen.className = 'game-fullscreen';
        fullscreen.id = 'poker-fullscreen';
        fullscreen.innerHTML = `
            <div class="game-fullscreen-content poker-table-container">
                <div class="game-header">
                    <h2>🃏 Texas Hold'em Poker</h2>
                    <button class="game-close-btn" onclick="this.closest('.game-fullscreen').remove()">✕</button>
                </div>
                
                <div class="poker-table-wrapper">
                    <!-- Poker Table -->
                    <div class="poker-table">
                        <!-- Center pot and community cards -->
                        <div class="poker-center">
                            <div class="pot-display">
                                <div class="pot-label">БАНК</div>
                                <div class="pot-amount">$<span id="poker-pot">0</span></div>
                            </div>
                            <div id="poker-community" class="community-cards"></div>
                            <div class="stage-display" id="poker-stage">PRE-FLOP</div>
                        </div>
                        
                        <!-- Players around table -->
                        <div id="poker-players" class="poker-players"></div>
                    </div>
                </div>
                
                <!-- Player controls -->
                <div class="poker-controls">
                    <div class="poker-actions">
                        <button class="poker-btn poker-btn-fold" onclick="ui.pokerPlayerAction('fold')">
                            <span class="btn-icon">🚫</span>
                            <span class="btn-text">FOLD</span>
                        </button>
                        <button class="poker-btn poker-btn-check" onclick="ui.pokerPlayerAction('check')">
                            <span class="btn-icon">✓</span>
                            <span class="btn-text">CHECK</span>
                        </button>
                        <button class="poker-btn poker-btn-call" onclick="ui.pokerPlayerAction('call')">
                            <span class="btn-icon">📞</span>
                            <span class="btn-text">CALL</span>
                        </button>
                        <button class="poker-btn poker-btn-raise" onclick="ui.pokerPlayerAction('raise')">
                            <span class="btn-icon">⬆️</span>
                            <span class="btn-text">RAISE</span>
                        </button>
                    </div>
                    <div class="poker-stage-controls">
                        <button class="game-btn" onclick="ui.initPoker()">НОВА ГРА</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(fullscreen);
        setTimeout(() => fullscreen.classList.add('show'), 10);
        this.renderPoker();
        
        // Start AI actions if not player's turn
        setTimeout(() => this.pokerProcessTurn(), 1000);
    }
    
    renderPoker() {
        if (!this.pokerGame) return;
        
        const getSuitClass = (card) => {
            if (card.includes('♥') || card.includes('♦')) return 'hearts';
            return '';
        };
        
        // Update pot
        const potEl = document.getElementById('poker-pot');
        if (potEl) potEl.textContent = this.pokerGame.pot;
        
        // Update stage
        const stageEl = document.getElementById('poker-stage');
        if (stageEl) {
            const stages = {
                'preflop': 'PRE-FLOP',
                'flop': 'FLOP',
                'turn': 'TURN',
                'river': 'RIVER',
                'showdown': 'SHOWDOWN'
            };
            stageEl.textContent = stages[this.pokerGame.stage] || 'PRE-FLOP';
        }
        
        // Update community cards
        const community = document.getElementById('poker-community');
        if (community) {
            community.innerHTML = this.pokerGame.communityCards.map(cardObj => 
                `<div class="poker-card ${getSuitClass(cardObj.card)}">${cardObj.card}</div>`
            ).join('');
        }
        
        // Update players
        const playersEl = document.getElementById('poker-players');
        if (playersEl) {
            playersEl.innerHTML = this.pokerGame.players.map((player, idx) => {
                const isDealer = idx === this.pokerGame.dealerIndex;
                const isCurrent = idx === this.pokerGame.currentPlayerIndex;
                const isPlayer = idx === 0;
                
                return `
                    <div class="poker-player poker-player-${player.position} ${isCurrent ? 'active' : ''} ${player.folded ? 'folded' : ''}">
                        ${isDealer ? '<div class="dealer-chip">D</div>' : ''}
                        <div class="player-info">
                            <div class="player-name">${player.name}</div>
                            <div class="player-chips">$${player.chips}</div>
                            ${player.bet > 0 ? `<div class="player-bet">Ставка: $${player.bet}</div>` : ''}
                        </div>
                        <div class="player-cards">
                            ${isPlayer ? 
                                player.hand.map(c => `<div class="poker-card ${getSuitClass(c.card)}">${c.card}</div>`).join('') :
                                player.folded ? '' : '<div class="poker-card card-back">🂠</div><div class="poker-card card-back">🂠</div>'
                            }
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    pokerProcessTurn() {
        if (!this.pokerGame || this.pokerGame.stage === 'showdown') return;
        
        const currentPlayer = this.pokerGame.players[this.pokerGame.currentPlayerIndex];
        
        // Check if round is complete
        if (this.pokerGame.isRoundComplete()) {
            const activePlayers = this.pokerGame.getActivePlayers();
            
            if (activePlayers.length === 1) {
                // Only one player left, they win
                this.showToast(`${activePlayers[0].name} виграв $${this.pokerGame.pot}!`, '🏆');
                activePlayers[0].chips += this.pokerGame.pot;
                this.pokerGame.pot = 0;
                this.renderPoker();
                
                // Check if game should continue
                const playersWithChips = this.pokerGame.players.filter(p => p.chips > 0);
                if (playersWithChips.length <= 1) {
                    setTimeout(() => {
                        this.showToast('Гра завершена!', '🎉');
                    }, 2000);
                } else {
                    setTimeout(() => {
                        this.pokerGame.dealerIndex = (this.pokerGame.dealerIndex + 1) % this.pokerGame.players.length;
                        this.pokerGame.deal();
                        this.renderPoker();
                        setTimeout(() => this.pokerProcessTurn(), 1000);
                    }, 3000);
                }
                return;
            }
            
            // Move to next stage
            if (this.pokerGame.stage === 'river') {
                const winner = this.pokerGame.showdown();
                this.renderPoker();
                this.showToast(`${winner.name} виграв $${this.pokerGame.pot}!`, '🏆');
                
                // Check if game should continue
                const playersWithChips = this.pokerGame.players.filter(p => p.chips > 0);
                if (playersWithChips.length <= 1) {
                    setTimeout(() => {
                        this.showToast('Гра завершена!', '🎉');
                    }, 2000);
                } else {
                    setTimeout(() => {
                        this.pokerGame.dealerIndex = (this.pokerGame.dealerIndex + 1) % this.pokerGame.players.length;
                        this.pokerGame.deal();
                        this.renderPoker();
                        setTimeout(() => this.pokerProcessTurn(), 1000);
                    }, 3000);
                }
                return;
            } else {
                this.pokerGame.nextStage();
                this.renderPoker();
                const stageNames = {flop: 'Флоп', turn: 'Терн', river: 'Рівер'};
                this.showToast(stageNames[this.pokerGame.stage] || 'Наступний етап', '🃏');
                setTimeout(() => this.pokerProcessTurn(), 1500);
                return;
            }
        }
        
        // If it's player's turn, wait for input
        if (currentPlayer.isHuman && !currentPlayer.folded && currentPlayer.chips > 0) {
            this.pokerWaitingForPlayer = true;
            return;
        }
        
        // AI turn
        this.pokerWaitingForPlayer = false;
        setTimeout(() => {
            const result = this.pokerGame.aiAction(this.pokerGame.currentPlayerIndex);
            
            if (result.action !== 'skip') {
                let message = `${currentPlayer.name}: `;
                if (result.action === 'fold') {
                    message += 'Fold';
                } else if (result.action === 'check') {
                    message += 'Check';
                } else if (result.action === 'call') {
                    message += `Call $${result.amount}`;
                } else if (result.action === 'bet') {
                    message += `Bet $${result.amount}`;
                } else if (result.action === 'raise') {
                    message += `Raise $${result.amount}`;
                }
                
                this.showToast(message, '🤖');
            }
            
            this.renderPoker();
            this.pokerGame.nextPlayer();
            setTimeout(() => this.pokerProcessTurn(), 1200);
        }, 800);
    }
    
    pokerPlayerAction(action) {
        if (!this.pokerWaitingForPlayer) {
            this.showToast('Зачекай свою чергу!', '⏳');
            return;
        }
        
        if (this.pokerGame.currentPlayerIndex !== 0) {
            this.showToast('Не твоя черга!', '❌');
            return;
        }
        
        let success = false;
        let amount = 0;
        
        if (action === 'raise') {
            const minRaise = this.pokerGame.currentBet - this.pokerGame.players[0].bet + this.pokerGame.bigBlind;
            amount = prompt(`Скільки поставити? (мінімум $${minRaise})`, minRaise);
            if (!amount || isNaN(amount)) return;
            amount = parseInt(amount);
            success = this.pokerGame.playerAction('raise', amount);
        } else {
            success = this.pokerGame.playerAction(action);
        }
        
        if (!success) {
            this.showToast('Неможлива дія!', '❌');
            return;
        }
        
        const messages = {
            fold: 'Ти скинув карти',
            check: 'Check',
            call: 'Call',
            raise: `Raise $${amount}`
        };
        
        this.showToast(messages[action] || 'Дія виконана', '✅');
        this.pokerWaitingForPlayer = false;
        this.renderPoker();
        
        this.pokerGame.nextPlayer();
        setTimeout(() => this.pokerProcessTurn(), 1000);
    }
    
    async checkStatus() {
        try {
            const [groq, img] = await Promise.all([
                fetch('/groq-status').then(r => r.json()),
                fetch('/image-status').then(r => r.json())
            ]);
            const groqEl = document.getElementById('groq-status-sidebar');
            const imgEl = document.getElementById('image-status-sidebar');
            if (groqEl) groqEl.textContent = groq.enabled && groq.available ? '🤖' : '⚠️';
            if (imgEl) imgEl.textContent = img.available && img.enabled ? '🎨' : '🔒';
        } catch (error) {}
    }
    
    // ========== TTS МЕТОДИ ==========
    initTTS() {
        if ('speechSynthesis' in window) {
            // Завантажуємо голоси
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
            this.loadVoices();
        } else {
            console.warn('TTS не підтримується браузером');
        }
    }
    
    loadVoices() {
        const voices = speechSynthesis.getVoices();
        // Шукаємо український голос
        this.ttsVoice = voices.find(v => v.lang.startsWith('uk')) || 
                        voices.find(v => v.lang.startsWith('ru')) || 
                        voices[0];
    }
    
    toggleTTS() {
        this.ttsEnabled = !this.ttsEnabled;
        const btn = document.getElementById('tts-toggle-btn');
        if (btn) {
            btn.textContent = this.ttsEnabled ? '🔊' : '🔇';
            btn.title = this.ttsEnabled ? 'Вимкнути озвучку' : 'Увімкнути озвучку';
        }
        this.showToast(
            this.ttsEnabled ? 'Озвучка увімкнена! 🔊' : 'Озвучка вимкнена 🔇',
            this.ttsEnabled ? '🔊' : '🔇'
        );
    }
    
    changeTTSLang() {
        if (this.ttsLang === 'uk-UA') {
            this.ttsLang = 'en-US';
            this.showToast('Language changed to English 🇬🇧', '🌍');
        } else {
            this.ttsLang = 'uk-UA';
            this.showToast('Мову змінено на українську 🇺🇦', '🌍');
        }
        
        // Оновлюємо голос
        const voices = speechSynthesis.getVoices();
        this.ttsVoice = voices.find(v => v.lang.startsWith(this.ttsLang.split('-')[0])) || voices[0];
        
        const btn = document.getElementById('tts-lang-btn');
        if (btn) {
            btn.textContent = this.ttsLang === 'uk-UA' ? '🇺🇦' : '🇬🇧';
        }
    }
    
    speak(text) {
        if (!this.ttsEnabled || !text) return;
        
        // Зупиняємо попереднє озвучування
        speechSynthesis.cancel();
        
        // Спробуємо використати AI TTS
        this.speakWithAI(text);
    }
    
    async speakWithAI(text) {
        try {
            // Перевіряємо статус AI TTS
            const statusRes = await fetch('/ai-tts-status');
            const status = await statusRes.json();
            
            console.log('🔊 AI TTS Status:', status);
            
            if (status.available && status.enabled) {
                console.log('✅ Використовуємо AI TTS');
                // Використовуємо AI TTS
                const lang = this.ttsLang === 'uk-UA' ? 'uk' : 'en';
                const res = await fetch('/generate-speech', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({text, lang})
                });
                
                const result = await res.json();
                console.log('🎙️ AI TTS Result:', result);
                
                if (result.success && result.audio_base64) {
                    console.log('🎵 Відтворюємо AI голос');
                    // Відтворюємо AI голос з base64
                    const audioData = `data:${result.mime_type};base64,${result.audio_base64}`;
                    const audio = new Audio(audioData);
                    audio.volume = 1.0;
                    audio.play().catch(e => {
                        console.error('❌ Помилка відтворення:', e);
                        this.speakWithBrowser(text);
                    });
                    return;
                } else if (result.fallback) {
                    console.log('⚠️ Fallback на браузерний TTS');
                    // Fallback на браузерний TTS
                    this.speakWithBrowser(text);
                }
            } else {
                console.log('⚠️ AI TTS недоступний, використовуємо браузерний');
                // Використовуємо браузерний TTS
                this.speakWithBrowser(text);
            }
        } catch (error) {
            console.error('❌ AI TTS помилка:', error);
            this.speakWithBrowser(text);
        }
    }
    
    speakWithBrowser(text) {
        // Очищуємо текст від емодзі та спецсимволів
        const cleanText = text
            .replace(/[🤖😊🎨💻🔬📜🎮🧘😂🕵️👽✨🌟⭐💡🚀🔥⚡💥🎉🏆❤️💙💚💛💜🧡💗🖤🤍🤎📝📅🧠🌿🌌🃏💣♟️🎯]/g, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .trim();
        
        if (!cleanText) return;
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = this.ttsLang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        if (this.ttsVoice) {
            utterance.voice = this.ttsVoice;
        }
        
        utterance.onerror = (e) => {
            console.error('TTS помилка:', e);
        };
        
        speechSynthesis.speak(utterance);
    }
    
    stopSpeaking() {
        speechSynthesis.cancel();
    }
    
    applyPersonalityEffects(personality, emoji) {
        // Застосовуємо візуальну тему особистості
        if (typeof applyPersonalityTheme === 'function') {
            applyPersonalityTheme(personality);
        }
        
        // Оновлюємо емодзі в топ-барі
        const moodEmoji = document.getElementById('mood-emoji');
        if (moodEmoji) {
            moodEmoji.textContent = emoji;
        }
    }
    // ========== КІНЕЦЬ TTS МЕТОДІВ ==========
    
    // ========== FILE UPLOAD МЕТОДИ ==========
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            // Перевірка розміру (макс 10MB)
            if (file.size > 10 * 1024 * 1024) {
                this.showWarning(`Файл "${file.name}" занадто великий! Максимум 10MB.`);
                return;
            }
            
            // Додаємо файл до списку
            this.attachedFiles.push(file);
            this.renderAttachedFiles();
        });
        
        // Очищуємо input для можливості вибрати той самий файл знову
        event.target.value = '';
    }
    
    renderAttachedFiles() {
        if (this.attachedFiles.length === 0) {
            this.attachedFilesContainer.innerHTML = '';
            return;
        }
        
        this.attachedFilesContainer.innerHTML = this.attachedFiles.map((file, index) => {
            const icon = this.getFileIcon(file.type, file.name);
            const size = this.formatFileSize(file.size);
            
            return `
                <div class="file-preview" data-index="${index}">
                    <span class="file-icon">${icon}</span>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${size}</div>
                    </div>
                    <button class="file-remove" onclick="ui.removeFile(${index})">×</button>
                </div>
            `;
        }).join('');
    }
    
    removeFile(index) {
        this.attachedFiles.splice(index, 1);
        this.renderAttachedFiles();
    }
    
    getFileIcon(type, name) {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type.startsWith('audio/')) return '🎵';
        if (type.includes('pdf')) return '📄';
        if (type.includes('zip') || type.includes('rar') || name.endsWith('.7z')) return '📦';
        if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
        if (type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
        if (type.includes('powerpoint') || name.endsWith('.ppt') || name.endsWith('.pptx')) return '📊';
        if (type.includes('text')) return '📃';
        return '📎';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    async sendMessageWithFiles() {
        const message = this.userInput.value.trim();
        
        if (!message && this.attachedFiles.length === 0) {
            this.showWarning('Напиши повідомлення або прикріпи файл!');
            return;
        }
        
        if (this.welcomeScreen) this.welcomeScreen.remove();
        
        // Показуємо повідомлення користувача
        this.addMessage(message || '📎 Файли', 'user');
        
        // Показуємо прикріплені файли в чаті
        if (this.attachedFiles.length > 0) {
            this.addFilesMessage(this.attachedFiles);
        }
        
        this.userInput.value = '';
        this.autoResize();
        this.showLoading();
        
        try {
            const formData = new FormData();
            formData.append('message', message);
            formData.append('language', this.ttsLang === 'en-US' ? 'en' : 'uk');
            
            // Додаємо файли
            this.attachedFiles.forEach((file, index) => {
                formData.append(`file_${index}`, file);
            });
            
            const res = await fetch('/chat', {
                method: 'POST',
                body: formData
            });
            
            if (!res.ok) {
                this.hideLoading();
                if (res.status === 401) {
                    this.addMessage('🚧 Вибач, обробка файлів ще в розробці! Скоро буде доступна. 😊', 'assistant');
                } else {
                    this.addMessage(`⚠️ Помилка сервера (${res.status}). Спробуй ще раз!`, 'assistant');
                }
                return;
            }
            
            const data = await res.json();
            this.hideLoading();
            
            this.addMessage(data.response, 'assistant', data.command || false);
            this.speak(data.response);
            
            // Очищуємо прикріплені файли
            this.attachedFiles = [];
            this.renderAttachedFiles();
            
        } catch (error) {
            console.error('Error:', error);
            this.hideLoading();
            this.addMessage('⚠️ Помилка з\'єднання. Перевір інтернет та спробуй ще раз!', 'assistant');
        }
        
        this.messageCount++;
    }
    
    addFilesMessage(files) {
        const filesHTML = files.map(file => {
            const icon = this.getFileIcon(file.type, file.name);
            const size = this.formatFileSize(file.size);
            
            return `
                <div class="file-message">
                    <span class="file-message-icon">${icon}</span>
                    <div class="file-message-info">
                        <div class="file-message-name">${file.name}</div>
                        <div class="file-message-meta">${size} • ${file.type || 'Невідомий тип'}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        const div = document.createElement('div');
        div.className = 'message user-message';
        div.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">${filesHTML}</div>
        `;
        this.chatMessages.appendChild(div);
        this.scrollToBottom();
    }
    // ========== КІНЕЦЬ FILE UPLOAD МЕТОДІВ ==========
    
    showLoading() { this.loading.classList.remove('hidden'); }
    hideLoading() { this.loading.classList.add('hidden'); }
    scrollToBottom() { this.chatMessages.scrollTop = this.chatMessages.scrollHeight; }
    
    // Модальне вікно
    showModal(options = {}) {
        const {
            title = 'Повідомлення',
            message = '',
            icon = 'ℹ️',
            type = 'info', // info, success, error, warning, question
            confirmText = 'OK',
            cancelText = 'Скасувати',
            showCancel = false,
            onConfirm = null,
            onCancel = null
        } = options;
        
        const overlay = document.getElementById('modal-overlay');
        const container = overlay.querySelector('.modal-container');
        const iconEl = document.getElementById('modal-icon');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        
        // Встановлюємо іконки за типом
        const icons = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            question: '❓'
        };
        
        // Оновлюємо контент
        iconEl.textContent = icon || icons[type];
        titleEl.textContent = title;
        messageEl.textContent = message;
        confirmBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;
        
        // Показуємо/ховаємо кнопку скасування
        cancelBtn.style.display = showCancel ? 'block' : 'none';
        
        // Встановлюємо тип
        container.className = 'modal-container ' + type;
        
        // Показуємо модальне вікно
        overlay.classList.add('show');
        overlay.classList.remove('hiding');
        
        // Обробники подій
        const handleConfirm = () => {
            this.hideModal();
            if (onConfirm) onConfirm();
        };
        
        const handleCancel = () => {
            this.hideModal();
            if (onCancel) onCancel();
        };
        
        const handleOverlayClick = (e) => {
            if (e.target === overlay) {
                handleCancel();
            }
        };
        
        // Видаляємо старі обробники
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        
        // Отримуємо нові посилання після клонування
        const newConfirmBtn = document.getElementById('modal-confirm');
        const newCancelBtn = document.getElementById('modal-cancel');
        
        // Додаємо нові обробники
        newConfirmBtn.addEventListener('click', handleConfirm);
        newCancelBtn.addEventListener('click', handleCancel);
        overlay.addEventListener('click', handleOverlayClick);
        
        // Фокус на кнопці підтвердження
        setTimeout(() => newConfirmBtn.focus(), 100);
        
        // Обробка Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    hideModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.add('hiding');
        
        setTimeout(() => {
            overlay.classList.remove('show', 'hiding');
        }, 200);
    }
    
    // Швидкі методи для різних типів модальних вікон
    showInfo(message, title = 'Інформація') {
        this.showModal({
            type: 'info',
            title,
            message,
            icon: 'ℹ️'
        });
    }
    
    showSuccess(message, title = 'Успіх') {
        this.showModal({
            type: 'success',
            title,
            message,
            icon: '✅'
        });
    }
    
    showError(message, title = 'Помилка') {
        this.showModal({
            type: 'error',
            title,
            message,
            icon: '❌'
        });
    }
    
    showWarning(message, title = 'Увага') {
        this.showModal({
            type: 'warning',
            title,
            message,
            icon: '⚠️'
        });
    }
    
    showConfirm(message, onConfirm, title = 'Підтвердження') {
        this.showModal({
            type: 'question',
            title,
            message,
            icon: '❓',
            showCancel: true,
            confirmText: 'OK',
            cancelText: 'Скасувати',
            onConfirm
        });
    }
    
    // About Modal
    initAboutModal() {
        const aboutBtn = document.getElementById('about-btn');
        const aboutModalOverlay = document.getElementById('about-modal-overlay');
        const aboutModalClose = document.getElementById('about-modal-close');
        
        if (!aboutBtn || !aboutModalOverlay || !aboutModalClose) {
            console.warn('⚠️ About modal elements not found');
            return;
        }
        
        // Завантажити біографію
        this.loadBiography();
        
        // Відкрити модальне вікно
        aboutBtn.addEventListener('click', () => {
            aboutModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                const modal = aboutModalOverlay.querySelector('.about-modal');
                if (modal) {
                    modal.style.animation = 'modalSlideIn 0.3s ease';
                }
            }, 10);
        });
        
        // Закрити модальне вікно
        const closeModal = () => {
            aboutModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };
        
        aboutModalClose.addEventListener('click', closeModal);
        
        // Закрити при кліку поза модальним вікном
        aboutModalOverlay.addEventListener('click', (e) => {
            if (e.target === aboutModalOverlay) {
                closeModal();
            }
        });
        
        // Закрити при натисканні Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && aboutModalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
        
        console.log('✅ About modal initialized');
    }
    
    async loadBiography() {
        try {
            const response = await fetch('/biography');
            const data = await response.json();
            
            // Оновити вступ легенди
            if (data.legend && data.legend.intro) {
                const legendIntro = document.getElementById('legend-intro');
                if (legendIntro) {
                    legendIntro.innerHTML = data.legend.intro;
                }
            }
            
            // Оновити біографію розробника (KRATOSX)
            if (data.developer && data.developer.content) {
                const developerTitle = document.getElementById('developer-title');
                if (developerTitle) {
                    developerTitle.innerHTML = data.developer.title;
                }
                
                const developerHTML = data.developer.content
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('');
                this.updateDeveloperBio(developerHTML);
            }
            
            // Оновити біографію асистента (KRAXS)
            if (data.assistant && data.assistant.content) {
                const assistantTitle = document.getElementById('assistant-title');
                if (assistantTitle) {
                    assistantTitle.innerHTML = data.assistant.title;
                }
                
                const assistantHTML = data.assistant.content
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('');
                this.updateAssistantBio(assistantHTML);
            }
            
            // Оновити секцію союзу
            if (data.union && data.union.content) {
                const unionTitle = document.getElementById('union-title');
                if (unionTitle) {
                    unionTitle.innerHTML = data.union.title;
                }
                
                const unionHTML = data.union.content
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('');
                const unionBio = document.getElementById('union-bio');
                if (unionBio) {
                    unionBio.innerHTML = unionHTML;
                }
            }
            
            // Оновити девіз
            if (data.motto) {
                const mottoElement = document.getElementById('motto');
                if (mottoElement) {
                    // Додаємо неонове підсвічування до імен у девізі
                    const mottoWithNeon = data.motto
                        .replace(/KRATOSX/g, '<span class="neon-name">KRATOSX</span>')
                        .replace(/KRAXS/g, '<span class="neon-name">KRAXS</span>');
                    mottoElement.innerHTML = mottoWithNeon;
                }
            }
            
            // Оновити версію та рік
            if (data.version) {
                const versionElement = document.querySelector('.about-version');
                if (versionElement) {
                    versionElement.textContent = `Версія ${data.version} • ${data.year || '2024'}`;
                }
            }
            
            // Оновити посилання
            if (data.links) {
                const links = document.querySelectorAll('.about-link');
                if (links.length >= 3) {
                    links[0].href = data.links.github || '#';
                    links[1].href = data.links.documentation || '#';
                    links[2].href = data.links.support || '#';
                }
            }
            
            console.log('✅ Biography loaded successfully');
        } catch (error) {
            console.error('❌ Error loading biography:', error);
        }
    }
    
    updateAssistantBio(bioHTML) {
        const assistantBioElement = document.getElementById('assistant-bio');
        if (assistantBioElement) {
            assistantBioElement.innerHTML = bioHTML;
        }
    }
    
    updateDeveloperBio(bioHTML) {
        const developerBioElement = document.getElementById('developer-bio');
        if (developerBioElement) {
            developerBioElement.innerHTML = bioHTML;
        }
    }
}


// Ініціалізація після завантаження DOM
function initApp() {
    console.log('🚀 Запуск додатку...');
    console.log('📄 readyState:', document.readyState);
    
    try {
        const ui = new AIAssistantUI();
        window.ui = ui;
        console.log('✅ Додаток ініціалізовано успішно!');
        console.log('🔍 Перевірка window.ui:', window.ui);
    } catch (error) {
        console.error('❌ Помилка ініціалізації:', error);
        console.error('Stack trace:', error.stack);
    }
}

// МНОЖИННІ МЕТОДИ ІНІЦІАЛІЗАЦІЇ для надійності
if (document.readyState === 'loading') {
    console.log('⏳ DOM ще завантажується, чекаємо DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initApp);
} else if (document.readyState === 'interactive') {
    console.log('⚡ DOM interactive, ініціалізуємо...');
    initApp();
} else {
    console.log('✅ DOM вже завантажено, ініціалізуємо негайно...');
    initApp();
}

// Додатковий fallback на випадок якщо все інше не спрацювало
window.addEventListener('load', function() {
    if (!window.ui) {
        console.warn('⚠️ Fallback ініціалізація через window.load');
        initApp();
    }
});

// Анімація для модального вікна "Про нас"
const aboutModalStyle = document.createElement('style');
aboutModalStyle.textContent = `
    @keyframes modalSlideIn {
        from {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
        }
        to {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(aboutModalStyle);

