#!/usr/bin/env python3
"""
Діагностика GROQ API
"""
import os
from dotenv import load_dotenv

# Завантажуємо змінні середовища
load_dotenv()

def check_environment():
    """Перевіряє змінні середовища"""
    print("🔍 Перевірка змінних середовища:")
    
    api_key = os.getenv('GROQ_API_KEY')
    use_groq = os.getenv('USE_GROQ_API')
    model = os.getenv('GROQ_MODEL')
    
    print(f"  GROQ_API_KEY: {'✅ Встановлено' if api_key else '❌ Відсутній'}")
    print(f"  USE_GROQ_API: {use_groq}")
    print(f"  GROQ_MODEL: {model}")
    
    return api_key, use_groq

def test_groq_import():
    """Тестує імпорт GROQ"""
    print("\n📦 Перевірка бібліотеки GROQ:")
    
    try:
        from groq import Groq
        print("  ✅ GROQ бібліотека імпортована успішно")
        return True
    except ImportError as e:
        print(f"  ❌ Помилка імпорту: {e}")
        return False

def test_groq_connection():
    """Тестує з'єднання з GROQ"""
    print("\n🌐 Тестування з'єднання з GROQ:")
    
    api_key, use_groq = check_environment()
    
    if not api_key:
        print("  ❌ API ключ відсутній")
        return False
    
    if use_groq != 'True':
        print("  ⚠️ GROQ вимкнений в налаштуваннях")
        return False
    
    if not test_groq_import():
        return False
    
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        
        # Простий тест запиту
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "user", "content": "Привіт! Відповідь одним словом: працює"}
            ],
            max_tokens=10
        )
        
        if response.choices:
            result = response.choices[0].message.content.strip()
            print(f"  ✅ GROQ відповів: {result}")
            return True
        else:
            print("  ❌ Порожня відповідь від GROQ")
            return False
            
    except Exception as e:
        print(f"  ❌ Помилка з'єднання: {e}")
        return False

def provide_solutions():
    """Надає рішення проблем"""
    print("\n🛠️ Можливі рішення:")
    print("1. Перевірте API ключ на https://console.groq.com")
    print("2. Переконайтеся що USE_GROQ_API=True в .env")
    print("3. Встановіть останню версію: pip install --upgrade groq")
    print("4. Перезапустіть сервер: python run.py")
    print("5. Перевірте інтернет з'єднання")

def main():
    print("🚀 Діагностика GROQ API")
    print("=" * 50)
    
    # Перевіряємо все по порядку
    api_key, use_groq = check_environment()
    groq_imported = test_groq_import()
    groq_connected = test_groq_connection()
    
    print("\n📊 Підсумок:")
    if groq_connected:
        print("✅ GROQ працює нормально!")
    else:
        print("❌ GROQ недоступний")
        provide_solutions()

if __name__ == '__main__':
    main()