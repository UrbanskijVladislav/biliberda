#!/usr/bin/env python3
"""
Швидке виправлення GROQ
"""
import os

def fix_groq():
    print("🔧 Швидке виправлення GROQ")
    print("=" * 30)
    
    # Перевіряємо .env файл
    if os.path.exists('.env'):
        with open('.env', 'r', encoding='utf-8') as f:
            content = f.read()
        
        print("📄 Поточні налаштування:")
        for line in content.split('\n'):
            if 'GROQ' in line and not line.startswith('#'):
                print(f"  {line}")
        
        # Перевіряємо чи правильно налаштовано
        if 'USE_GROQ_API=True' in content:
            print("✅ GROQ увімкнений")
        else:
            print("❌ GROQ вимкнений")
            
        if 'GROQ_API_KEY=gsk_' in content:
            print("✅ API ключ встановлено")
        else:
            print("❌ API ключ відсутній")
    
    print("\n🛠️ Автоматичні виправлення:")
    
    # Виправлення 1: Увімкнути GROQ
    print("1. Увімкнення GROQ...")
    try:
        with open('.env', 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'USE_GROQ_API=False' in content:
            content = content.replace('USE_GROQ_API=False', 'USE_GROQ_API=True')
            with open('.env', 'w', encoding='utf-8') as f:
                f.write(content)
            print("   ✅ GROQ увімкнено")
        else:
            print("   ℹ️ GROQ вже увімкнений")
    except Exception as e:
        print(f"   ❌ Помилка: {e}")
    
    # Виправлення 2: Перевірка моделі
    print("2. Перевірка моделі...")
    if 'GROQ_MODEL=' in content:
        print("   ✅ Модель налаштована")
    else:
        print("   ⚠️ Модель не налаштована")
    
    print("\n📋 Інструкції:")
    print("1. Переконайся що API ключ правильний")
    print("2. Перезапусти сервер: Ctrl+C, потім python run.py")
    print("3. Перевір статус на http://localhost:5000")
    print("4. Якщо не працює - асистент використає локальні відповіді")

if __name__ == '__main__':
    fix_groq()