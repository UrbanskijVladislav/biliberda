#!/usr/bin/env python3
"""
Тест GROQ API інтеграції
"""
import requests
import json

def test_groq_status():
    """Тестує статус GROQ API"""
    try:
        response = requests.get('http://localhost:5000/groq-status')
        if response.status_code == 200:
            data = response.json()
            print("🔍 Статус GROQ API:")
            print(f"  Увімкнено: {data.get('enabled', False)}")
            print(f"  Доступний: {data.get('available', False)}")
            print(f"  Модель: {data.get('model', 'Невідома')}")
            
            if data.get('enabled') and data.get('available'):
                print("✅ GROQ API працює!")
                return True
            else:
                print("⚠️ GROQ API недоступний")
                return False
        else:
            print(f"❌ Помилка HTTP: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Помилка з'єднання: {e}")
        return False

def test_groq_chat():
    """Тестує чат з GROQ"""
    if not test_groq_status():
        return
    
    print("\n💬 Тестування чату з GROQ:")
    
    test_messages = [
        "Привіт! Як справи?",
        "Розкажи про Python",
        "Що таке штучний інтелект?"
    ]
    
    for message in test_messages:
        print(f"\n👤 Користувач: {message}")
        
        try:
            response = requests.post(
                'http://localhost:5000/chat',
                json={'message': message},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"🤖 Асистент: {data['response'][:100]}...")
                print(f"📊 Настрій: {data['mood']} {data['emoji']}")
            else:
                print(f"❌ Помилка: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Помилка: {e}")

if __name__ == '__main__':
    print("🚀 Тестування GROQ API інтеграції")
    print("=" * 50)
    test_groq_chat()