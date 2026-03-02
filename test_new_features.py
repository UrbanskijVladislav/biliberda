#!/usr/bin/env python3
"""
Тест нових функцій AI асистента
"""
import requests
import time

def test_new_commands():
    """Тестує нові команди: дата, факт, обчислення"""
    print("🧪 Тестування нових команд")
    print("=" * 50)
    
    test_cases = [
        # Тести дати
        {
            'message': 'Яка дата сьогодні?',
            'expected_type': 'date',
            'description': 'Поточна дата'
        },
        {
            'message': 'Що буде завтра?',
            'expected_type': 'date',
            'description': 'Завтрашня дата'
        },
        {
            'message': 'Розкажи про цей тиждень',
            'expected_type': 'date',
            'description': 'Інформація про тиждень'
        },
        
        # Тести фактів
        {
            'message': 'Розкажи цікавий факт',
            'expected_type': 'fact',
            'description': 'Цікавий факт'
        },
        {
            'message': 'Факт про програмування',
            'expected_type': 'fact',
            'description': 'Факт про технології'
        },
        
        # Тести обчислень
        {
            'message': 'Обчисли 25 * 4 + 10',
            'expected_type': 'calculation',
            'description': 'Математичне обчислення'
        },
        {
            'message': 'Скільки буде 100 / 5?',
            'expected_type': 'calculation',
            'description': 'Ділення'
        },
        {
            'message': 'Порахуй (15 + 25) * 2',
            'expected_type': 'calculation',
            'description': 'Обчислення з дужками'
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{i}. {test['description']}")
        print(f"   Запит: '{test['message']}'")
        
        try:
            response = requests.post(
                'http://localhost:5000/chat',
                json={'message': test['message']},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Відповідь: {data['response'][:80]}...")
                print(f"   📊 Настрій: {data['mood']} {data['emoji']}")
                
                if 'command_type' in data:
                    print(f"   🎯 Тип команди: {data['command_type']}")
                
            else:
                print(f"   ❌ Помилка HTTP: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Помилка: {str(e)}")
        
        time.sleep(1)  # Пауза між запитами

def test_new_moods():
    """Тестує нові настрої"""
    print("\n🎭 Тестування нових настроїв")
    print("=" * 50)
    
    # Змінюємо настрій кілька разів
    for i in range(5):
        try:
            response = requests.post('http://localhost:5000/mood', timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"🎭 Настрій {i+1}: {data['mood']} {data['emoji']}")
                print(f"   Повідомлення: {data['message']}")
            time.sleep(1)
        except Exception as e:
            print(f"❌ Помилка зміни настрою: {str(e)}")

def test_context():
    """Тестує контекст розмови"""
    print("\n💭 Тестування контексту розмови")
    print("=" * 50)
    
    conversation = [
        "Розкажи про Python",
        "А що з JavaScript?",
        "Які ще є мови програмування?",
        "Обчисли 5 + 5",
        "А тепер розкажи жарт"
    ]
    
    for i, message in enumerate(conversation, 1):
        print(f"\n{i}. Повідомлення: '{message}'")
        
        try:
            response = requests.post(
                'http://localhost:5000/chat',
                json={'message': message},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Відповідь: {data['response'][:100]}...")
                
                # Перевіряємо чи є контекстні слова
                context_words = ['продовжуючи', 'як я вже казав', 'повертаючись', 'бачу, ми перейшли']
                has_context = any(word in data['response'].lower() for word in context_words)
                
                if has_context:
                    print("   ✅ Контекст виявлено!")
                else:
                    print("   ℹ️ Нова тема або базова відповідь")
                    
            time.sleep(1.5)  # Більша пауза для контексту
            
        except Exception as e:
            print(f"   ❌ Помилка: {str(e)}")

def test_stats():
    """Тестує статистику"""
    print("\n📊 Тестування статистики")
    print("=" * 50)
    
    try:
        response = requests.get('http://localhost:5000/stats', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Статистика отримана:")
            print(f"   📝 Всього повідомлень: {data.get('total_messages', 0)}")
            print(f"   📏 Середня довжина відповіді: {data.get('avg_response_length', 0):.1f}")
            print(f"   🎯 Остання тема: {data.get('last_topic', 'Немає')}")
            print(f"   📚 Довжина контексту: {data.get('context_length', 0)}")
            
            topics = data.get('most_common_topics', [])
            if topics:
                print("   🔥 Популярні теми:")
                for topic, count in topics[:3]:
                    print(f"      • {topic}: {count}")
        else:
            print(f"❌ Помилка отримання статистики: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Помилка: {str(e)}")

def main():
    """Запускає всі тести"""
    print("🚀 Тестування розширених можливостей AI Асистента")
    print("=" * 60)
    
    # Перевіряємо підключення
    try:
        response = requests.get('http://localhost:5000', timeout=5)
        if response.status_code != 200:
            print("❌ Сервер не відповідає! Запустіть: python run.py")
            return
    except:
        print("❌ Сервер недоступний! Запустіть: python run.py")
        return
    
    print("✅ Сервер працює, починаємо тести...\n")
    
    # Запускаємо тести
    test_new_commands()
    test_new_moods()
    test_context()
    test_stats()
    
    print("\n" + "=" * 60)
    print("🎉 Тестування завершено!")
    print("💡 Відкрийте http://localhost:5000 для інтерактивного тестування")

if __name__ == '__main__':
    main()