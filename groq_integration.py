"""
Інтеграція з GROQ API для розумних відповідей
"""
import os
import json
import logging

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logging.warning("GROQ бібліотека не встановлена")

class GroqAIService:
    def __init__(self, api_key=None, model="llama-3.1-8b-instant", max_tokens=1000):
        self.api_key = api_key or os.getenv('GROQ_API_KEY')
        self.model = model
        self.max_tokens = max_tokens
        self.client = None
        
        if not GROQ_AVAILABLE:
            logging.warning("GROQ бібліотека недоступна")
            return
        
        if self.api_key:
            try:
                # Простіша ініціалізація без додаткових параметрів
                self.client = Groq(api_key=self.api_key)
                logging.info("GROQ API клієнт ініціалізовано успішно")
            except Exception as e:
                logging.error(f"Помилка ініціалізації GROQ API: {e}")
                self.client = None
        else:
            logging.warning("GROQ API ключ не знайдено")
    
    def is_available(self):
        """Перевіряє чи доступний GROQ API"""
        return GROQ_AVAILABLE and self.client is not None
    
    def create_system_prompt(self, user_memory, current_mood, context):
        """Створює системний промпт на основі контексту користувача"""
        
        mood_descriptions = {
            'happy': 'Ти в щасливому настрої, позитивний та енергійний. Використовуй емодзі та веселий тон.',
            'curious': 'Ти в допитливому настрові, задаєш питання та глибоко аналізуєш. Використовуй 🤔.',
            'wise': 'Ти в мудрому настрої, даєш розважливі поради та ділишся досвідом.',
            'playful': 'Ти в грайливому настрої, веселий та креативний. Використовуй гумор.',
            'sleepy': 'Ти сонний, відповідаєш повільно з позіханнями та 😴.',
            'excited': 'Ти дуже збуджений! Використовуй ВЕЛИКІ ЛІТЕРИ та багато емодзі! 🚀⚡',
            'mysterious': 'Ти таємничий, говориш загадками та використовуєш 🔮🌙.'
        }
        
        system_prompt = f"""Ти AI асистент з пам'яттю. 

ПОТОЧНИЙ НАСТРІЙ: {mood_descriptions.get(current_mood, 'нормальний')}

ІНФОРМАЦІЯ ПРО КОРИСТУВАЧА:
"""
        
        if user_memory.get('name'):
            system_prompt += f"- Ім'я: {user_memory['name']}\n"
        
        if user_memory.get('favorite_topics'):
            topics = ', '.join(user_memory['favorite_topics'])
            system_prompt += f"- Улюблені теми: {topics}\n"
        
        if user_memory.get('notes'):
            recent_notes = user_memory['notes'][-3:]  # Останні 3 нотатки
            notes_text = '; '.join([note['content'] for note in recent_notes])
            system_prompt += f"- Нотатки: {notes_text}\n"
        
        system_prompt += f"""
КОНТЕКСТ РОЗМОВИ:
{context}

ПРАВИЛА:
1. Відповідай українською мовою
2. Будь дружнім та корисним
3. Використовуй інформацію про користувача для персоналізації
4. Дотримуйся свого поточного настрою
5. Відповіді мають бути короткими (до 200 слів)
6. Використовуй емодзі відповідно до настрою
7. Якщо не знаєш відповіді, чесно скажи про це
"""
        
        return system_prompt
    
    def get_smart_response(self, user_input, user_memory, current_mood, conversation_context):
        """Отримує розумну відповідь від GROQ API"""
        
        if not self.is_available():
            return None
        
        try:
            # Створюємо контекст з останніх повідомлень
            context = ""
            if conversation_context:
                recent_context = conversation_context[-3:]  # Останні 3 повідомлення
                for msg in recent_context:
                    context += f"Користувач: {msg.get('user', '')}\nАсистент: {msg.get('assistant', '')}\n"
            
            # Створюємо системний промпт
            system_prompt = self.create_system_prompt(user_memory, current_mood, context)
            
            # Відправляємо запит до GROQ
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                max_tokens=self.max_tokens,
                temperature=0.7,
                top_p=0.9
            )
            
            if response.choices:
                return response.choices[0].message.content.strip()
            
        except Exception as e:
            logging.error(f"Помилка GROQ API: {e}")
            return None
        
        return None
    
    def get_creative_response(self, prompt, mood="creative"):
        """Отримує креативну відповідь для спеціальних завдань"""
        
        if not self.is_available():
            return None
        
        try:
            creative_system = f"""Ти креативний AI асистент. 
Настрій: {mood}
Створи цікаву, оригінальну відповідь українською мовою.
Використовуй емодзі.
Відповідь має бути короткою та захоплюючою."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": creative_system},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.9,
                top_p=0.95
            )
            
            if response.choices:
                return response.choices[0].message.content.strip()
                
        except Exception as e:
            logging.error(f"Помилка креативного GROQ API: {e}")
            return None
        
        return None
    
    def analyze_sentiment(self, text):
        """Аналізує настрій тексту користувача"""
        
        if not self.is_available():
            return "neutral"
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "Проаналізуй настрій тексту. Відповідь одним словом: positive, negative, neutral, excited, sad, angry, curious"
                    },
                    {"role": "user", "content": text}
                ],
                max_tokens=10,
                temperature=0.3
            )
            
            if response.choices:
                sentiment = response.choices[0].message.content.strip().lower()
                return sentiment if sentiment in ['positive', 'negative', 'neutral', 'excited', 'sad', 'angry', 'curious'] else 'neutral'
                
        except Exception as e:
            logging.error(f"Помилка аналізу настрою: {e}")
            return "neutral"
        
        return "neutral"