"""
Тестування нових команд та API інтеграцій
"""
from api_integrations import APIIntegrations

def test_all_features():
    print("🧪 Тестування нових функцій AI Асистента\n")
    print("=" * 50)
    
    api = APIIntegrations()
    
    # Тест 1: Погода
    print("\n1️⃣ Тест погоди:")
    print("-" * 50)
    result = api.get_weather('Kyiv', 'uk')
    print(result['message'])
    
    # Тест 2: Переклад
    print("\n2️⃣ Тест перекладу:")
    print("-" * 50)
    result = api.translate_text('Hello, how are you?', 'uk')
    if result['success']:
        print(f"Оригінал: {result['original']}")
        print(f"Переклад: {result['translated']}")
    else:
        print(result['message'])
    
    # Тест 3: Курси валют
    print("\n3️⃣ Тест курсів валют:")
    print("-" * 50)
    result = api.get_exchange_rates('USD', 'uk')
    print(result['message'])
    
    # Тест 4: Калькулятор
    print("\n4️⃣ Тест калькулятора:")
    print("-" * 50)
    expressions = ['2+2', '10*5', '100/4', '(15+5)*2']
    for expr in expressions:
        result = api.calculate(expr)
        if result['success']:
            print(result['message'])
        else:
            print(f"Помилка: {result['message']}")
    
    # Тест 5: Новини
    print("\n5️⃣ Тест новин:")
    print("-" * 50)
    result = api.get_news('ua', 'uk')
    print(result['message'])
    
    print("\n" + "=" * 50)
    print("✅ Тестування завершено!")
    print("\nДля використання в чаті:")
    print("  /weather Київ")
    print("  /translate Hello")
    print("  /currency USD")
    print("  /calc 2+2")
    print("  /news")

if __name__ == '__main__':
    test_all_features()
