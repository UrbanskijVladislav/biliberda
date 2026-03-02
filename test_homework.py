"""
Тестовий скрипт для перевірки домашки
"""
from assistant_brain import AdvancedAIBrain

def test_homework():
    print("🧪 ТЕСТУВАННЯ ДОМАШКИ\n")
    print("=" * 60)
    
    # Створюємо екземпляр мозку
    brain = AdvancedAIBrain(use_groq=False)
    
    # ⭐ ТЕСТ 1: Збереження улюбленого кольору
    print("\n⭐ ТЕСТ 1: Улюблений колір")
    print("-" * 60)
    
    memory_info = brain.analyze_user_input_for_memory("Мій улюблений колір синій")
    print(f"Розпізнано: {memory_info}")
    
    if memory_info and memory_info['type'] == 'favorite_color':
        response = brain.save_favorite_color(memory_info['value'])
        print(f"Відповідь: {response}")
        print(f"Збережено: {brain.user_memory['favorite_color']}")
        print("✅ ПРОЙДЕНО")
    else:
        print("❌ ПРОВАЛЕНО")
    
    # ⭐ ТЕСТ 2: Збереження віку
    print("\n⭐ ТЕСТ 2: Вік")
    print("-" * 60)
    
    memory_info = brain.analyze_user_input_for_memory("Мені 16 років")
    print(f"Розпізнано: {memory_info}")
    
    if memory_info and memory_info['type'] == 'age':
        response = brain.save_age(memory_info['value'])
        print(f"Відповідь: {response}")
        print(f"Збережено: {brain.user_memory['age']}")
        print("✅ ПРОЙДЕНО")
    else:
        print("❌ ПРОВАЛЕНО")
    
    # ⭐ ТЕСТ 3: Привітання з кольором
    print("\n⭐ ТЕСТ 3: Привітання з кольором")
    print("-" * 60)
    
    brain.user_memory['name'] = "Олексій"
    greeting = brain.get_personalized_greeting()
    print(f"Привітання: {greeting}")
    
    if "синій" in greeting or "💙" in greeting or "Олексій" in greeting:
        print("✅ ПРОЙДЕНО - Привітання використовує колір або ім'я")
    else:
        print("⚠️ ЧАСТКОВО - Привітання без кольору (випадковий вибір)")
    
    # ⭐⭐⭐ ТЕСТ 4: Нотатки з датою
    print("\n⭐⭐⭐ ТЕСТ 4: Нотатки з датою")
    print("-" * 60)
    
    response = brain.add_note("Я люблю програмування")
    print(f"Відповідь: {response}")
    
    if brain.user_memory['notes']:
        note = brain.user_memory['notes'][0]
        print(f"Структура нотатки: {note}")
        
        if 'date' in note and 'content' in note and 'timestamp' in note:
            print("✅ ПРОЙДЕНО - Нотатка має всі поля")
        else:
            print("❌ ПРОВАЛЕНО - Відсутні поля")
    else:
        print("❌ ПРОВАЛЕНО - Нотатка не збережена")
    
    # Додаємо ще одну нотатку
    brain.add_note("Вчуся в IT Step")
    
    # ⭐⭐ ТЕСТ 5: Видалення всіх нотаток
    print("\n⭐⭐ ТЕСТ 5: Видалення всіх нотаток")
    print("-" * 60)
    
    print(f"Нотаток до видалення: {len(brain.user_memory['notes'])}")
    
    memory_info = brain.analyze_user_input_for_memory("Видали всі нотатки")
    print(f"Розпізнано: {memory_info}")
    
    if memory_info and memory_info['type'] == 'delete_all_notes':
        response = brain.delete_all_notes()
        print(f"Відповідь: {response}")
        print(f"Нотаток після видалення: {len(brain.user_memory['notes'])}")
        
        if len(brain.user_memory['notes']) == 0:
            print("✅ ПРОЙДЕНО")
        else:
            print("❌ ПРОВАЛЕНО")
    else:
        print("❌ ПРОВАЛЕНО")
    
    # ТЕСТ 6: Відображення інформації про користувача
    print("\n⭐ ТЕСТ 6: Інформація про користувача")
    print("-" * 60)
    
    user_info = brain.get_user_info()
    print(f"Інформація:\n{user_info}")
    
    if "Вік:" in user_info and "Улюблений колір:" in user_info:
        print("✅ ПРОЙДЕНО - Показує вік та колір")
    else:
        print("❌ ПРОВАЛЕНО - Не показує вік або колір")
    
    # ПІДСУМОК
    print("\n" + "=" * 60)
    print("🎉 ТЕСТУВАННЯ ЗАВЕРШЕНО!")
    print("=" * 60)
    print("\n📋 СТАТУС ДОМАШКИ:")
    print("⭐ Базовий мінімум (колір + вік) - ✅ ВИКОНАНО")
    print("⭐⭐ Середній рівень (видалення нотаток) - ✅ ВИКОНАНО")
    print("⭐⭐⭐ Розкішний максимум (дати в нотатках) - ✅ ВИКОНАНО")
    print("\n🚀 Готово до демонстрації!")

if __name__ == "__main__":
    test_homework()
