# Інструкції з розгортання AI Асистента

## Локальний запуск

### Швидкий старт
```bash
python run.py
```

### Ручний запуск
```bash
# Встановлення залежностей
pip install -r requirements.txt

# Запуск додатку
python app.py
```

## Структура проекту

```
ai-assistant/
├── app.py                 # Основний Flask додаток
├── assistant_brain.py     # Розширений AI мозок
├── config.py             # Конфігурація
├── run.py                # Скрипт запуску
├── demo_features.py      # Демонстрація можливостей
├── requirements.txt      # Python залежності
├── README.md            # Документація
├── DEPLOYMENT.md        # Інструкції розгортання
├── templates/
│   └── index.html       # HTML шаблон
└── static/
    ├── style.css        # CSS стилі
    └── script.js        # JavaScript логіка
```

## Налаштування середовища

### Змінні середовища
```bash
# Режим розробки
export FLASK_CONFIG=development
export FLASK_DEBUG=True

# Продакшн
export FLASK_CONFIG=production
export FLASK_DEBUG=False
export SECRET_KEY=your-secret-key
```

### Порт та хост
```bash
export HOST=0.0.0.0
export PORT=5000
```

## Розгортання на різних платформах

### Heroku
1. Створіть `Procfile`:
```
web: python app.py
```

2. Встановіть змінні:
```bash
heroku config:set FLASK_CONFIG=production
heroku config:set SECRET_KEY=your-secret-key
```

### Docker
1. Створіть `Dockerfile`:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

2. Збудуйте та запустіть:
```bash
docker build -t ai-assistant .
docker run -p 5000:5000 ai-assistant
```

### VPS/Сервер
1. Встановіть залежності:
```bash
sudo apt update
sudo apt install python3 python3-pip nginx
pip3 install -r requirements.txt
```

2. Налаштуйте systemd сервіс:
```ini
[Unit]
Description=AI Assistant
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/ai-assistant
Environment=FLASK_CONFIG=production
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

3. Налаштуйте Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Тестування

### Запуск демо
```bash
python demo_features.py
```

### Тестування API
```bash
# Тест чату
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Привіт!"}'

# Зміна настрою
curl -X POST http://localhost:5000/mood

# Статистика
curl http://localhost:5000/stats
```

## Моніторинг та логування

### Логи
Логи зберігаються в `assistant.log`

### Метрики
- Кількість повідомлень
- Популярні теми
- Зміни настрою
- Час відповіді

## Безпека

### Рекомендації
- Використовуйте HTTPS в продакшені
- Встановіть rate limiting
- Регулярно оновлюйте залежності
- Використовуйте сильний SECRET_KEY

### Обмеження
- Максимальна довжина повідомлення: 500 символів
- Rate limit: 100 запитів на годину
- Історія розмови: 50 повідомлень

## Розширення функціональності

### Додавання нових можливостей
1. Оновіть `assistant_brain.py`
2. Додайте нові ендпоінти в `app.py`
3. Оновіть фронтенд в `static/`

### Інтеграція з AI API
```python
# Приклад інтеграції з OpenAI
import openai

def get_ai_response(prompt):
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=150
    )
    return response.choices[0].text
```

## Підтримка

Для питань та підтримки:
- Перевірте логи в `assistant.log`
- Запустіть `demo_features.py` для тестування
- Перевірте конфігурацію в `config.py`