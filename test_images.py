#!/usr/bin/env python3
"""
Тест генерації зображень
"""
import os
from dotenv import load_dotenv

# Завантажуємо змінні середовища
load_dotenv()

def test_openai_import():
    """Тестує імпорт OpenAI"""
    try:
        from openai import OpenAI
        print("✅ OpenAI бібліотека імпортована успішно")
        return True
    except ImportError as e:
        print(f"❌ Помилка імпорту OpenAI: {e}")
        return False

def test_openai_connection():
    """Тестує з'єднання з OpenAI"""
    if not test_openai_import():
        return False
    
    api_key = os.getenv('OPENAI_API_KEY')
    use_images = os.getenv('USE_IMAGE_GENERATION')
    
    print(f"\n🔑 API ключ: {'✅ Встановлено' if api_key and api_key != 'your_openai_api_key_here' else '❌ Відсутній'}")
    print(f"🎨 Генерація увімкнена: {use_images}")
    
    if not api_key or api_key == 'your_openai_api_key_here':
        print("❌ OpenAI API ключ не налаштовано")
        return False
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        # Простий тест (не генеруємо зображення, щоб не витрачати кредити)
        print("✅ OpenAI клієнт створено успішно")
        return True
        
    except Exception as e:
        print(f"❌ Помилка створення клієнта: {e}")
        return False

def test_image_generator():
    """Тестує наш генератор зображень"""
    try:
        from image_generator import ImageGenerator
        
        generator = ImageGenerator()
        status = generator.get_status()
        
        print(f"\n📊 Статус генератора:")
        print(f"  Доступний: {status['available']}")
        print(f"  Увімкнений: {status['enabled']}")
        print(f"  API налаштовано: {status['api_configured']}")
        print(f"  Бібліотека встановлена: {status['library_installed']}")
        
        if status['available']:
            print("✅ Генератор зображень готовий до роботи!")
            return True
        else:
            print("❌ Генератор зображень недоступний")
            return False
            
    except Exception as e:
        print(f"❌ Помилка тестування генератора: {e}")
        return False

def main():
    print("🎨 Діагностика генерації зображень")
    print("=" * 50)
    
    # Тестуємо все по порядку
    openai_works = test_openai_connection()
    generator_works = test_image_generator()
    
    print("\n📋 Підсумок:")
    if openai_works and generator_works:
        print("✅ Генерація зображень має працювати!")
        print("💡 Спробуй: 'Намалюй космічного програміста'")
    else:
        print("❌ Є проблеми з генерацією зображень")
        print("\n🛠️ Можливі рішення:")
        print("1. Перевір OpenAI API ключ на https://platform.openai.com")
        print("2. Встанови бібліотеку: pip install openai")
        print("3. Переконайся що USE_IMAGE_GENERATION=True")
        print("4. Перезапусти сервер")

if __name__ == '__main__':
    main()