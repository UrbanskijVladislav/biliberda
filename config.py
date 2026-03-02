"""
Конфігурація для AI асистента
"""
import os
from dotenv import load_dotenv

# Завантажуємо змінні середовища
load_dotenv()

class Config:
    # Основні налаштування Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'ai-assistant-secret-key-2024'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Налаштування сервера
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 5000))
    
    # Налаштування GROQ API
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    USE_GROQ_API = os.environ.get('USE_GROQ_API', 'False').lower() == 'true'
    GROQ_MODEL = os.environ.get('GROQ_MODEL', 'llama-3.1-8b-instant')
    MAX_TOKENS = int(os.environ.get('MAX_TOKENS', 1000))
    
    # Налаштування асистента
    MAX_MESSAGE_LENGTH = 500
    MAX_CONVERSATION_HISTORY = 50
    DEFAULT_MOOD = 'happy'
    
    # Налаштування безпеки
    RATE_LIMIT = "100 per hour"  # Обмеження запитів
    
    # Налаштування логування
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = 'assistant.log'

class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    DEBUG = False
    # Додаткові налаштування для продакшену
    
class TestingConfig(Config):
    TESTING = True
    DEBUG = True

# Словник конфігурацій
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}