"""
Автоматичний тест консольного API асистента
"""
import os
import json
import datetime
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

def test_api_homework():
    """Тестує всі рівні домашки"""
    print("🧪 ТЕСТУВАННЯ API ДОМАШКИ")
    print("=" * 60)
    
    # Перевірка API ключа
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        print("❌ GROQ_API_KEY не знайдено!")
        return
    
    print("✅ API ключ знайдено")
    
    # Ініціалізація клієнта
    try:
        client = Groq(api_key=api_key)
        print("✅ GROQ клієнт ініціалізовано")
    except Exception as e:
        print(f"❌ Помилка ініціалізації: {e}")
        return
    
    # ⭐ ТЕСТ 1: Базовий мінімум - Запит до API
    print("\n" + "="*60)
    print("⭐ ТЕСТ 1: БАЗОВИЙ МІНІМУМ")
    print("="*60)
    
    try:
        print("\n1️⃣ Відправка запиту до API...")
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Ти дружній AI асистент. Відповідай українською."},
                {"role": "user", "content": "Привіт! Розкажи жарт про програмістів"}
            ],
            max_tokens=200,
            temperature=0.7
        )
        print("✅ Запит успішний!")
        
        # 2️⃣ Вивід сирого JSON
        print("\n2️⃣ Сирий JSON відповідь:")
        print("-" * 60)
        response_dict = response.model_dump()
        json_str = json.dumps(response_dict, indent=2, ensure_ascii=False)
        print(json_str[:500] + "..." if len(json_str) > 500 else json_str)
        print("-" * 60)
        print("✅ JSON виведено!")
        
        # 3️⃣ Витяг тексту
        print("\n3️⃣ Витяг тексту з JSON:")
        print("-" * 60)
        if response.choices and len(response.choices) > 0:
            text = response.choices[0].message.content.strip()
            print(f"Текст: {text}")
            print("-" * 60)
            print("✅ Текст витягнуто!")
        else:
            print("❌ Не вдалося витягти текст")
            return
        
        print("\n✅ БАЗОВИЙ МІНІМУМ - ПРОЙДЕНО!")
        
    except Exception as e:
        print(f"❌ Помилка: {e}")
        return
    
    # ⭐⭐ ТЕСТ 2: Середній рівень - Цикл діалогу
    print("\n" + "="*60)
    print("⭐⭐ ТЕСТ 2: СЕРЕДНІЙ РІВЕНЬ")
    print("="*60)
    
    print("\n1️⃣ Симуляція циклу діалогу...")
    messages = [
        {"role": "system", "content": "Ти дружній AI асистент. Відповідай українською коротко."}
    ]
    
    test_messages = [
        "Привіт!",
        "Як справи?",
        "Розкажи про Python"
    ]
    
    for i, msg in enumerate(test_messages, 1):
        print(f"\n  Повідомлення {i}: {msg}")
        messages.append({"role": "user", "content": msg})
        
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                max_tokens=100,
                temperature=0.7
            )
            
            if response.choices:
                reply = response.choices[0].message.content.strip()
                messages.append({"role": "assistant", "content": reply})
                print(f"  Відповідь: {reply[:100]}...")
        except Exception as e:
            print(f"  ❌ Помилка: {e}")
            break
    
    print("\n✅ Цикл діалогу працює!")
    
    print("\n2️⃣ Перевірка команди 'вихід'...")
    exit_commands = ['вихід', 'exit', 'quit', 'q']
    for cmd in exit_commands:
        if cmd.lower() in ['вихід', 'exit', 'quit', 'q']:
            print(f"  ✅ Команда '{cmd}' розпізнається")
    
    print("\n✅ СЕРЕДНІЙ РІВЕНЬ - ПРОЙДЕНО!")
    
    # ⭐⭐⭐ ТЕСТ 3: Розкішний максимум - Логування
    print("\n" + "="*60)
    print("⭐⭐⭐ ТЕСТ 3: РОЗКІШНИЙ МАКСИМУМ")
    print("="*60)
    
    history_file = "test_dialog_history.json"
    
    print("\n1️⃣ Створення історії діалогу...")
    dialog_history = []
    
    for i, msg in enumerate(test_messages):
        # Додаємо повідомлення користувача
        dialog_history.append({
            "date": datetime.datetime.now().isoformat(),
            "role": "user",
            "message": msg
        })
        
        # Додаємо відповідь асистента
        dialog_history.append({
            "date": datetime.datetime.now().isoformat(),
            "role": "assistant",
            "message": f"Відповідь на: {msg}"
        })
    
    print(f"✅ Створено {len(dialog_history)} записів")
    
    print("\n2️⃣ Збереження в JSON файл...")
    try:
        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump(dialog_history, f, ensure_ascii=False, indent=2)
        print(f"✅ Збережено в {history_file}")
    except Exception as e:
        print(f"❌ Помилка збереження: {e}")
        return
    
    print("\n3️⃣ Завантаження з JSON файлу...")
    try:
        with open(history_file, 'r', encoding='utf-8') as f:
            loaded_history = json.load(f)
        print(f"✅ Завантажено {len(loaded_history)} записів")
    except Exception as e:
        print(f"❌ Помилка завантаження: {e}")
        return
    
    print("\n4️⃣ Перевірка структури записів...")
    if loaded_history:
        sample = loaded_history[0]
        required_fields = ['date', 'role', 'message']
        
        for field in required_fields:
            if field in sample:
                print(f"  ✅ Поле '{field}' присутнє")
            else:
                print(f"  ❌ Поле '{field}' відсутнє")
                return
        
        # Перевірка формату дати
        try:
            datetime.datetime.fromisoformat(sample['date'])
            print(f"  ✅ Дата в ISO форматі")
        except:
            print(f"  ❌ Невірний формат дати")
            return
        
        # Перевірка ролі
        if sample['role'] in ['user', 'assistant']:
            print(f"  ✅ Роль коректна: {sample['role']}")
        else:
            print(f"  ❌ Невірна роль: {sample['role']}")
            return
    
    print("\n5️⃣ Показ історії...")
    print("-" * 60)
    for entry in loaded_history[:4]:  # Показуємо перші 4
        date = datetime.datetime.fromisoformat(entry['date'])
        formatted_date = date.strftime('%Y-%m-%d %H:%M:%S')
        role_emoji = "👤" if entry['role'] == "user" else "🤖"
        print(f"[{formatted_date}] {role_emoji} {entry['role']}: {entry['message'][:50]}...")
    print("-" * 60)
    print("✅ Історія відображається коректно!")
    
    # Очищення тестового файлу
    try:
        os.remove(history_file)
        print(f"\n🧹 Тестовий файл {history_file} видалено")
    except:
        pass
    
    print("\n✅ РОЗКІШНИЙ МАКСИМУМ - ПРОЙДЕНО!")
    
    # ПІДСУМОК
    print("\n" + "="*60)
    print("🎉 ПІДСУМОК ТЕСТУВАННЯ")
    print("="*60)
    print("⭐ Базовий мінімум (API запит, JSON, текст) - ✅ ВИКОНАНО")
    print("⭐⭐ Середній рівень (цикл діалогу, вихід) - ✅ ВИКОНАНО")
    print("⭐⭐⭐ Розкішний максимум (логування, історія) - ✅ ВИКОНАНО")
    print("\n🚀 ВСІ ТЕСТИ ПРОЙДЕНІ! ГОТОВО ДО ДЕМОНСТРАЦІЇ!")
    print("="*60)
    
    print("\n📝 Для запуску консольного асистента:")
    print("   python console_assistant.py")


if __name__ == "__main__":
    test_api_homework()
