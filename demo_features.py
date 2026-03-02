"""
Демонстраційні можливості AI асистента
"""

def demo_conversation():
    """Демонстрація можливостей асистента"""
    print("🤖 AI Асистент - Демонстрація можливостей")
    print("=" * 50)
    
    demo_inputs = [
        "Привіт!",
        "Розкажи про Python",
        "Як навчитися програмувати?",
        "Розкажи жарт",
        "Що ти вмієш?",
        "Зміни настрій",
        "Розкажи про веб-розробку"
    ]
    
    from app import assistant
    
    for user_input in demo_inputs:
        print(f"\n👤 Користувач: {user_input}")
        response = assistant.get_response(user_input)
        print(f"🤖 Асистент ({response['mood']} {response['emoji']}): {response['response']}")
        print("-" * 30)

def show_features():
    """Показує всі можливості асистента"""
    features = {
        "🎭 Настрої": [
            "😊 Щасливий - позитивний та енергійний",
            "🤔 Цікавий - допитливий та аналітичний",
            "🧠 Мудрий - розважливий та досвідчений",
            "😄 Грайливий - веселий та креативний"
        ],
        "💬 Типи відповідей": [
            "Відповіді на питання про програмування",
            "Поради щодо навчання",
            "Жарти та розваги",
            "Інформація про час та дату",
            "Мотиваційні повідомлення"
        ],
        "🧠 Розумні функції": [
            "Аналіз типу запиту користувача",
            "Контекстні відповіді",
            "Збереження історії розмови",
            "Статистика використання",
            "Адаптація до часу доби"
        ],
        "🎨 Інтерфейс": [
            "Сучасний адаптивний дизайн",
            "Анімації та ефекти",
            "Швидкі дії",
            "Статистика в реальному часі",
            "Індикатор настрою"
        ]
    }
    
    print("🌟 Можливості AI Асистента")
    print("=" * 50)
    
    for category, items in features.items():
        print(f"\n{category}:")
        for item in items:
            print(f"  • {item}")

def test_moods():
    """Тестує всі настрої асистента"""
    from app import assistant
    
    print("🎭 Тестування настроїв асистента")
    print("=" * 50)
    
    test_message = "Розкажи про програмування"
    
    for mood in assistant.moods.keys():
        assistant.current_mood = mood
        response = assistant.get_response(test_message)
        print(f"\n{response['emoji']} {mood.upper()}:")
        print(f"Відповідь: {response['response']}")
        print("-" * 30)

if __name__ == "__main__":
    print("Виберіть демонстрацію:")
    print("1. Демо розмови")
    print("2. Показати можливості")
    print("3. Тестувати настрої")
    
    choice = input("\nВаш вибір (1-3): ")
    
    if choice == "1":
        demo_conversation()
    elif choice == "2":
        show_features()
    elif choice == "3":
        test_moods()
    else:
        print("Невірний вибір!")
        show_features()