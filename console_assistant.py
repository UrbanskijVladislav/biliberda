"""
⭐⭐⭐ КОНСОЛЬНИЙ AI АСИСТЕНТ - ДОМАШКА ⭐⭐⭐

Функціонал:
⭐ Базовий: Запит до API, вивід JSON, витяг тексту
⭐⭐ Середній: Цикл діалогу, команда "вихід"
⭐⭐⭐ Розкішний: Логування в dialog_history.json, показ історії
"""

import os
import json
import datetime
from dotenv import load_dotenv
from groq import Groq

# Завантажуємо змінні середовища
load_dotenv()

class ConsoleAIAssistant:
    def __init__(self):
        """Ініціалізація консольного асистента"""
        self.api_key = os.getenv('GROQ_API_KEY')
        self.model = "llama-3.1-8b-instant"
        self.history_file = "dialog_history.json"
        self.dialog_history = []
        
        # Перевіряємо API ключ
        if not self.api_key:
            print("❌ ПОМИЛКА: GROQ_API_KEY не знайдено в .env файлі!")
            print("Додай GROQ_API_KEY=твій_ключ в файл .env")
            exit(1)
        
        # Ініціалізуємо клієнт
        try:
            self.client = Groq(api_key=self.api_key)
            print("✅ GROQ API клієнт успішно ініціалізовано!")
        except Exception as e:
            print(f"❌ Помилка ініціалізації GROQ: {e}")
            exit(1)
        
        # ⭐⭐⭐ Завантажуємо історію діалогу
        self.load_history()
    
    def load_history(self):
        """⭐⭐⭐ РОЗКІШНИЙ МАКСИМУМ: Завантаження історії з файлу"""
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    self.dialog_history = json.load(f)
                print(f"📚 Завантажено {len(self.dialog_history)} повідомлень з історії")
            else:
                print("📝 Створюємо нову історію діалогу")
                self.dialog_history = []
        except Exception as e:
            print(f"⚠️ Помилка завантаження історії: {e}")
            self.dialog_history = []
    
    def save_history(self):
        """⭐⭐⭐ РОЗКІШНИЙ МАКСИМУМ: Збереження історії в файл"""
        try:
            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump(self.dialog_history, f, ensure_ascii=False, indent=2)
            print(f"💾 Історію збережено ({len(self.dialog_history)} повідомлень)")
        except Exception as e:
            print(f"⚠️ Помилка збереження історії: {e}")
    
    def add_to_history(self, role, message):
        """⭐⭐⭐ РОЗКІШНИЙ МАКСИМУМ: Додавання повідомлення в історію"""
        entry = {
            "date": datetime.datetime.now().isoformat(),
            "role": role,
            "message": message
        }
        self.dialog_history.append(entry)
    
    def show_history(self):
        """⭐⭐⭐ РОЗКІШНИЙ МАКСИМУМ: Показ попередньої історії"""
        if not self.dialog_history:
            print("\n📭 Історія діалогу порожня")
            return
        
        print("\n" + "="*60)
        print("📜 ПОПЕРЕДНЯ ІСТОРІЯ ДІАЛОГУ")
        print("="*60)
        
        # Показуємо останні 10 повідомлень
        recent = self.dialog_history[-10:]
        for entry in recent:
            date = datetime.datetime.fromisoformat(entry['date'])
            formatted_date = date.strftime('%Y-%m-%d %H:%M:%S')
            role_emoji = "👤" if entry['role'] == "user" else "🤖"
            role_name = "Ти" if entry['role'] == "user" else "Асистент"
            
            print(f"\n[{formatted_date}] {role_emoji} {role_name}:")
            print(f"  {entry['message']}")
        
        print("\n" + "="*60)
    
    def send_message(self, user_message):
        """⭐ БАЗОВИЙ МІНІМУМ: Відправка запиту до API"""
        try:
            print("\n🚀 Відправляю запит до GROQ API...")
            
            # Створюємо контекст з останніх 5 повідомлень
            messages = [
                {
                    "role": "system",
                    "content": "Ти дружній AI асистент. Відповідай українською мовою, коротко та по суті. Використовуй емодзі."
                }
            ]
            
            # Додаємо контекст з історії
            recent_history = self.dialog_history[-5:]
            for entry in recent_history:
                messages.append({
                    "role": entry['role'],
                    "content": entry['message']
                })
            
            # Додаємо поточне повідомлення
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # ⭐ БАЗОВИЙ: Відправляємо запит
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            # ⭐ БАЗОВИЙ: Виводимо сирий JSON
            print("\n" + "="*60)
            print("📦 СИРИЙ JSON ВІДПОВІДЬ:")
            print("="*60)
            response_dict = response.model_dump()
            print(json.dumps(response_dict, indent=2, ensure_ascii=False))
            print("="*60)
            
            # ⭐ БАЗОВИЙ: Витягуємо текст відповіді
            if response.choices and len(response.choices) > 0:
                assistant_message = response.choices[0].message.content.strip()
                
                print("\n" + "="*60)
                print("💬 ТЕКСТ ВІДПОВІДІ:")
                print("="*60)
                print(assistant_message)
                print("="*60)
                
                # ⭐⭐⭐ РОЗКІШНИЙ: Зберігаємо в історію
                self.add_to_history("user", user_message)
                self.add_to_history("assistant", assistant_message)
                self.save_history()
                
                return assistant_message
            else:
                print("❌ Не вдалося отримати відповідь")
                return None
                
        except Exception as e:
            print(f"\n❌ ПОМИЛКА: {e}")
            return None
    
    def run(self):
        """⭐⭐ СЕРЕДНІЙ РІВЕНЬ: Цикл діалогу"""
        print("\n" + "🌟"*30)
        print("🤖 КОНСОЛЬНИЙ AI АСИСТЕНТ")
        print("🌟"*30)
        print("\n📋 Команди:")
        print("  - 'вихід' або 'exit' - завершити діалог")
        print("  - 'історія' або 'history' - показати історію")
        print("  - 'очистити' або 'clear' - очистити історію")
        print("\n💡 Просто пиши своє повідомлення та натискай Enter!")
        
        # ⭐⭐⭐ РОЗКІШНИЙ: Показуємо попередню історію
        if self.dialog_history:
            show = input("\n📚 Показати попередню історію? (так/ні): ").lower()
            if show in ['так', 'yes', 'y', 'т']:
                self.show_history()
        
        print("\n" + "-"*60)
        
        # ⭐⭐ СЕРЕДНІЙ: Цикл діалогу
        while True:
            try:
                # Отримуємо введення користувача
                user_input = input("\n👤 Ти: ").strip()
                
                # Перевіряємо чи не порожнє
                if not user_input:
                    continue
                
                # ⭐⭐ СЕРЕДНІЙ: Команда виходу
                if user_input.lower() in ['вихід', 'exit', 'quit', 'q']:
                    print("\n👋 До побачення! Історія збережена.")
                    break
                
                # Команда показу історії
                if user_input.lower() in ['історія', 'history', 'h']:
                    self.show_history()
                    continue
                
                # Команда очищення історії
                if user_input.lower() in ['очистити', 'clear', 'c']:
                    confirm = input("⚠️ Видалити всю історію? (так/ні): ").lower()
                    if confirm in ['так', 'yes', 'y', 'т']:
                        self.dialog_history = []
                        self.save_history()
                        print("✅ Історію очищено!")
                    continue
                
                # Відправляємо повідомлення
                response = self.send_message(user_input)
                
                if response:
                    print(f"\n🤖 Асистент: {response}")
                
            except KeyboardInterrupt:
                print("\n\n👋 Перервано користувачем. До побачення!")
                break
            except Exception as e:
                print(f"\n❌ Помилка: {e}")
                continue
        
        print("\n💾 Всього повідомлень в історії: " + str(len(self.dialog_history)))
        print("📁 Історія збережена в: " + self.history_file)


def main():
    """Головна функція"""
    assistant = ConsoleAIAssistant()
    assistant.run()


if __name__ == "__main__":
    main()
