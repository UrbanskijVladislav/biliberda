#!/usr/bin/env python3
"""
Простий тест для AI асистента
"""
import sys
import json
import requests
import time

def test_server_running():
    """Перевіряє, чи працює сервер"""
    try:
        response = requests.get('http://localhost:5000', timeout=5)
        return response.status_code == 200
    except:
        return False

def test_chat_endpoint():
    """Тестує ендпоінт чату"""
    test_messages = [
        "Привіт!",
        "Розкажи про Python",
        "Який час?",
        "Розкажи жарт"
    ]
    
    results = []
    
    for message in test_messages:
        try:
            response = requests.post(
                'http://localhost:5000/chat',
                json={'message': message},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                results.append({
                    'message': message,
                    'response': data.get('response', ''),
                    'mood': data.get('mood', ''),
                    'emoji': data.get('emoji', ''),
                    'status': 'OK'
                })
            else:
                results.append({
                    'message': message,
                    'status': f'ERROR: {response.status_code}'
                })
        except Exception as e:
            results.append({
                'message': message,
                'status': f'ERROR: {str(e)}'
            })
        
        time.sleep(1)  # Пауза між запитами
    
    return results

def test_mood_endpoint():
    """Тестує ендпоінт зміни настрою"""
    try:
        response = requests.post('http://localhost:5000/mood', timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {
                'status': 'OK',
                'mood': data.get('mood', ''),
                'emoji': data.get('emoji', ''),
                'message': data.get('message', '')
            }
        else:
            return {'status': f'ERROR: {response.status_code}'}
    except Exception as e:
        return {'status': f'ERROR: {str(e)}'}

def test_stats_endpoint():
    """Тестує ендпоінт статистики"""
    try:
        response = requests.get('http://localhost:5000/stats', timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {
                'status': 'OK',
                'data': data
            }
        else:
            return {'status': f'ERROR: {response.status_code}'}
    except Exception as e:
        return {'status': f'ERROR: {str(e)}'}

def run_tests():
    """Запускає всі тести"""
    print("🧪 Тестування AI Асистента")
    print("=" * 50)
    
    # Перевіряємо, чи працює сервер
    print("1. Перевірка сервера...")
    if not test_server_running():
        print("❌ Сервер не працює! Запустіть: python run.py")
        return
    print("✅ Сервер працює")
    
    # Тестуємо чат
    print("\n2. Тестування чату...")
    chat_results = test_chat_endpoint()
    for result in chat_results:
        if result['status'] == 'OK':
            print(f"✅ '{result['message']}' -> {result['mood']} {result['emoji']}")
            print(f"   Відповідь: {result['response'][:50]}...")
        else:
            print(f"❌ '{result['message']}' -> {result['status']}")
    
    # Тестуємо зміну настрою
    print("\n3. Тестування зміни настрою...")
    mood_result = test_mood_endpoint()
    if mood_result['status'] == 'OK':
        print(f"✅ Настрій змінено на: {mood_result['mood']} {mood_result['emoji']}")
    else:
        print(f"❌ Помилка зміни настрою: {mood_result['status']}")
    
    # Тестуємо статистику
    print("\n4. Тестування статистики...")
    stats_result = test_stats_endpoint()
    if stats_result['status'] == 'OK':
        print(f"✅ Статистика отримана:")
        print(f"   Всього повідомлень: {stats_result['data'].get('total_messages', 0)}")
        print(f"   Популярні теми: {len(stats_result['data'].get('most_common_topics', []))}")
    else:
        print(f"❌ Помилка отримання статистики: {stats_result['status']}")
    
    print("\n" + "=" * 50)
    print("🎉 Тестування завершено!")

def interactive_test():
    """Інтерактивний тест"""
    print("💬 Інтерактивний тест чату")
    print("Введіть 'exit' для виходу")
    print("-" * 30)
    
    while True:
        message = input("\n👤 Ви: ").strip()
        if message.lower() in ['exit', 'вихід', 'quit']:
            break
        
        if not message:
            continue
        
        try:
            response = requests.post(
                'http://localhost:5000/chat',
                json={'message': message},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"🤖 Асистент ({data['mood']} {data['emoji']}): {data['response']}")
            else:
                print(f"❌ Помилка: {response.status_code}")
        
        except Exception as e:
            print(f"❌ Помилка: {str(e)}")
    
    print("👋 До побачення!")

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'interactive':
        interactive_test()
    else:
        run_tests()