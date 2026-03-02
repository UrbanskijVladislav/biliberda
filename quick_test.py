#!/usr/bin/env python3
"""
Швидкий тест асистента
"""
import requests
import time

def test_assistant():
    print("🧪 Швидкий тест асистента")
    print("=" * 30)
    
    test_messages = [
        "Привіт!",
        "Як справи?", 
        "Розкажи жарт"
    ]
    
    for msg in test_messages:
        print(f"\n👤 Тест: {msg}")
        
        try:
            response = requests.post(
                'http://localhost:5000/chat',
                json={'message': msg},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"🤖 Відповідь: {data['response'][:80]}...")
                print(f"📊 Настрій: {data['mood']} {data['emoji']}")
                print("✅ Працює!")
            else:
                print(f"❌ HTTP помилка: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Помилка: {e}")
        
        time.sleep(1)
    
    print("\n🎉 Тест завершено!")

if __name__ == '__main__':
    test_assistant()