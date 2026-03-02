"""
Розширений модуль для AI асистента з додатковими можливостями
"""
import random
import datetime
import json
import re
import calendar
import math
from groq_integration import GroqAIService
from working_image_gen import WorkingImageGenerator
from ai_tts import AITextToSpeech

class AdvancedAIBrain:
    def __init__(self, use_groq=False, groq_api_key=None):
        # Ініціалізуємо GROQ сервіс
        self.groq_service = GroqAIService(groq_api_key) if use_groq else None
        self.use_groq = use_groq and self.groq_service and self.groq_service.is_available()
        
        # ПРАЦЮЮЧА генерація зображень!
        self.image_generator = WorkingImageGenerator()
        
        # AI Text-to-Speech
        self.ai_tts = AITextToSpeech()
        
        self.knowledge_base = {
            'programming': {
                'python': [
                    "Python - це потужна мова програмування, відмінна для початківців!",
                    "В Python все є об'єктом. Це робить мову дуже гнучкою!",
                    "Python має чудові бібліотеки для AI: TensorFlow, PyTorch, scikit-learn!"
                ],
                'javascript': [
                    "JavaScript - мова веб-розробки номер один!",
                    "З JavaScript можна створювати як фронтенд, так і бекенд додатки!",
                    "Node.js дозволяє запускати JavaScript на сервері!"
                ],
                'web': [
                    "HTML - це скелет веб-сторінки, CSS - її стиль, а JavaScript - поведінка!",
                    "Адаптивний дизайн важливий для сучасних веб-сайтів!",
                    "Фреймворки як React, Vue, Angular спрощують розробку!"
                ]
            },
            'learning': [
                "Найкращий спосіб вивчити програмування - це практика!",
                "Не бійся робити помилки - вони частина процесу навчання!",
                "Читай код інших розробників - це дуже корисно!",
                "Створюй власні проекти - це найкращий досвід!"
            ],
            'motivation': [
                "Кожен експерт колись був початківцем!",
                "Програмування - це мистецтво вирішення проблем!",
                "Твоя наполегливість приведе тебе до успіху!",
                "Кодинг - це суперсила сучасного світу!"
            ],
            'jokes': [
                "Чому програмісти плутають Хеллоуїн і Різдво? Тому що Oct 31 == Dec 25! 🎃🎄",
                "Скільки програмістів потрібно, щоб замінити лампочку? Жодного, це апаратна проблема! 💡",
                "Чому програмісти не люблять природу? Там забагато багів! 🐛",
                "Що сказав програміст, коли побачив код колеги? 'Це не баг, це фіча!' 😄",
                "Чому програмісти завжди плутають Різдво з Хеллоуїном? Тому що Dec 25 = Oct 31! 🤓",
                "Як програміст рахує овець? 1, 2, 3, 4... stack overflow! 🐑💥",
                "Чому програмісти найкращі? Вони бачать код всюди! 💻",
                "Що спільного між багом в коді та глітчем? Обидва ламають реальність! 🐛"
            ],
            'facts': [
                "Перший комп'ютерний баг був справжньою комахою, знайденою в комп'ютері Harvard Mark II у 1947 році! 🐛",
                "Слово 'алгоритм' походить від імені перського математика Аль-Хорезмі (9 століття)! 📚",
                "Перша програмістка в історії - Ада Лавлейс, яка написала алгоритм для машини Беббіджа у 1843 році! 👩‍💻",
                "Мова програмування Python названа на честь британського комедійного шоу 'Monty Python's Flying Circus'! 🐍",
                "Перший веб-сайт був створений у 1991 році і досі працює: http://info.cern.ch/hypertext/WWW/TheProject.html 🌐",
                "Символ @ використовується в email з 1971 року, його вибрав Рей Томлінсон! 📧",
                "Перший домен .com був зареєстрований 15 березня 1985 року - symbolics.com! 🌍",
                "У світі існує понад 700 мов програмування! 💻",
                "Перший жорсткий диск IBM 305 RAMAC (1956) важив понад тонну і мав ємність 5 МБ! 💾",
                "💡 Цікавий факт: Перший комп'ютерний баг був справжньою комахою!",
                "🖥️ Перший комп'ютер ENIAC важив 27 тонн і займав цілу кімнату!",
                "🔢 У бінарному коді все складається лише з 0 та 1!",
                "⚡ Швидкість світла - 299,792,458 м/с - межа передачі інформації!",
                "🌐 Перший веб-сайт був створений у 1991 році і досі працює!"
            ]
        }
        
        self.personality_traits = {
            'happy': {
                'energy_level': 'high',
                'response_style': 'enthusiastic',
                'emoji_usage': 'frequent'
            },
            'curious': {
                'energy_level': 'medium',
                'response_style': 'questioning',
                'emoji_usage': 'moderate'
            },
            'wise': {
                'energy_level': 'calm',
                'response_style': 'thoughtful',
                'emoji_usage': 'minimal'
            },
            'playful': {
                'energy_level': 'high',
                'response_style': 'fun',
                'emoji_usage': 'creative'
            },
            # НОВІ НАСТРОЇ
            'sleepy': {
                'energy_level': 'low',
                'response_style': 'drowsy',
                'emoji_usage': 'sleepy'
            },
            'excited': {
                'energy_level': 'very_high',
                'response_style': 'energetic',
                'emoji_usage': 'explosive'
            },
            'mysterious': {
                'energy_level': 'medium',
                'response_style': 'enigmatic',
                'emoji_usage': 'mystical'
            }
        }
        
        self.conversation_context = []
        self.user_preferences = {}
        self.last_topic = None  # Для контексту останньої теми
        self.user_memory = {  # НОВА ПАМ'ЯТЬ КОРИСТУВАЧА
            'name': None,
            'favorite_topics': [],
            'notes': [],
            'preferences': {},
            'learning_progress': {},
            'interaction_count': 0,
            'first_meeting': None,
            'last_seen': None,
            # ДОМАШКА: нові поля
            'favorite_color': None,
            'age': None
        }
    
    def analyze_input(self, user_input):
        """Аналізує введення користувача та визначає тип запиту"""
        user_input_lower = user_input.lower()
        
        analysis = {
            'type': 'general',
            'keywords': [],
            'sentiment': 'neutral',
            'complexity': 'simple'
        }
        
        # Визначаємо тип запиту
        if any(word in user_input_lower for word in ['програмування', 'код', 'python', 'javascript', 'html', 'css']):
            analysis['type'] = 'programming'
        elif any(word in user_input_lower for word in ['навчання', 'вчитися', 'як', 'допоможи']):
            analysis['type'] = 'learning'
        elif any(word in user_input_lower for word in ['жарт', 'весело', 'розсміши']):
            analysis['type'] = 'entertainment'
        elif '?' in user_input:
            analysis['type'] = 'question'
        
        # Визначаємо ключові слова
        keywords = re.findall(r'\b\w+\b', user_input_lower)
        analysis['keywords'] = [word for word in keywords if len(word) > 3]
        
        # Визначаємо складність
        if len(user_input.split()) > 10:
            analysis['complexity'] = 'complex'
        elif len(user_input.split()) > 5:
            analysis['complexity'] = 'medium'
        
        return analysis
    
    def generate_smart_response(self, user_input, current_mood, analysis):
        """Генерує розумну відповідь на основі аналізу та пам'яті"""
        # Оновлюємо статистику взаємодії
        self.update_interaction_stats()
        
        # Перевіряємо чи просить користувач зображення
        image_analysis = self.image_generator.analyze_image_request(user_input)
        if image_analysis['is_image_request']:
            return self.handle_image_request(user_input, image_analysis, current_mood)
        
        # Перевіряємо чи є інформація для збереження в пам'ять
        memory_info = self.analyze_user_input_for_memory(user_input)
        if memory_info:
            if memory_info['type'] == 'name':
                return self.save_user_name(memory_info['value'])
            elif memory_info['type'] == 'favorite_topic':
                return self.add_favorite_topic(memory_info['value'])
            elif memory_info['type'] == 'note':
                return self.add_note(memory_info['value'])
            elif memory_info['type'] == 'favorite_color':  # ⭐ ДОМАШКА
                return self.save_favorite_color(memory_info['value'])
            elif memory_info['type'] == 'age':  # ⭐ ДОМАШКА
                return self.save_age(memory_info['value'])
            elif memory_info['type'] == 'delete_all_notes':  # ⭐⭐ ДОМАШКА
                return self.delete_all_notes()
        
        # Спробуємо отримати відповідь від GROQ API
        if self.use_groq:
            try:
                groq_response = self.groq_service.get_smart_response(
                    user_input, 
                    self.user_memory, 
                    current_mood, 
                    self.conversation_context
                )
                if groq_response:
                    # Аналізуємо настрій користувача для майбутніх взаємодій
                    user_sentiment = self.groq_service.analyze_sentiment(user_input)
                    if user_sentiment in ['excited', 'curious']:
                        # Можемо адаптувати поведінку на основі настрою користувача
                        pass
                    
                    return groq_response
            except Exception as e:
                # Логуємо помилку, але продовжуємо з локальними відповідями
                print(f"GROQ помилка: {e}")
                pass
        
        # Якщо GROQ недоступний, використовуємо локальну логіку
        response_parts = []
        
        # Персоналізована відповідь на основі пам'яті
        if self.user_memory['name'] and random.random() < 0.3:  # 30% шанс згадати ім'я
            response_parts.append(f"{self.user_memory['name']},")
        
        # Базова відповідь на основі типу
        if analysis['type'] == 'programming':
            if 'python' in analysis['keywords']:
                response_parts.append(random.choice(self.knowledge_base['programming']['python']))
            elif any(word in analysis['keywords'] for word in ['javascript', 'js']):
                response_parts.append(random.choice(self.knowledge_base['programming']['javascript']))
            elif any(word in analysis['keywords'] for word in ['html', 'css', 'веб']):
                response_parts.append(random.choice(self.knowledge_base['programming']['web']))
            else:
                response_parts.append("Програмування - це захоплююча сфера! Що саме тебе цікавить?")
            
            # Додаємо до улюблених тем якщо ще немає
            if 'programming' not in self.user_memory['favorite_topics']:
                self.user_memory['favorite_topics'].append('programming')
        
        elif analysis['type'] == 'learning':
            response_parts.append(random.choice(self.knowledge_base['learning']))
            if 'learning' not in self.user_memory['favorite_topics']:
                self.user_memory['favorite_topics'].append('learning')
        
        elif analysis['type'] == 'entertainment':
            response_parts.append(random.choice(self.knowledge_base['jokes']))
        
        elif analysis['type'] == 'question':
            response_parts.append("Це цікаве питання! Дай мені подумати...")
        
        # Додаємо відповідь на основі настрою
        mood_response = self.get_mood_specific_addition(current_mood, analysis)
        if mood_response:
            response_parts.append(mood_response)
        
        # Іноді пропонуємо улюблену тему
        if not response_parts and random.random() < 0.4:
            topic_suggestion = self.get_topic_suggestion()
            if topic_suggestion:
                response_parts.append(topic_suggestion)
        
        # Об'єднуємо частини відповіді
        if response_parts:
            return ' '.join(response_parts)
        else:
            return self.get_fallback_response(current_mood)
    
    def handle_image_request(self, user_input, image_analysis, current_mood):
        """Обробляє запит на генерацію зображень"""
        if not self.image_generator.is_available():
            return {
                'type': 'text',
                'content': """🚧 Вибач, генерація зображень ще в розробці!

Я працюю над тим, щоб додати цю можливість. Скоро буде доступна! 

А поки що можу допомогти з:
• Відповідями на питання 💬
• Жартами та історіями 😄
• Іграми (шахи, покер, сапер) 🎮
• Перекладом та розрахунками 🔢

Що б ти хотів спробувати? 😊"""
            }
        
        # Генеруємо зображення
        try:
            result = self.image_generator.generate_image(user_input, current_mood)
            
            if result['success']:
                return {
                    'type': 'image',
                    'content': f"🎨 Ось твоє зображення! Промпт: {result['prompt']}",
                    'image_url': result['url'],
                    'image_prompt': result['prompt']
                }
            else:
                error_msg = result.get('error', '')
                
                # Перевірка на 401 помилку
                if '401' in str(error_msg) or 'Unauthorized' in str(error_msg):
                    return {
                        'type': 'text',
                        'content': """🚧 Вибач, генерація зображень ще в розробці!

Я працюю над налаштуванням API. Скоро все буде готово! 

А поки що можу допомогти з іншими речами:
• Відповідями на питання 💬
• Жартами та цікавими фактами 😄
• Іграми (шахи, покер, сапер, дурень) 🎮
• Перекладом та розрахунками 🔢

Що б ти хотів спробувати? 😊"""
                    }
                else:
                    return {
                        'type': 'text',
                        'content': f"""🤖 Вибач, не вдалося створити зображення 😔

Спробуй ще раз або запитай щось інше!

Я можу допомогти з:
• Відповідями на питання 💬
• Жартами та історіями 😄
• Іграми 🎮
• Перекладом 🌍"""
                    }
        except Exception as e:
            return {
                'type': 'text',
                'content': """🚧 Вибач, генерація зображень тимчасово недоступна!

Працюю над виправленням. Спробуй пізніше! 

А поки що можу допомогти з чимось іншим! 😊"""
            }
    
    
    def get_groq_status(self):
        """Повертає статус GROQ API"""
        return {
            'enabled': self.use_groq,
            'available': self.groq_service.is_available() if self.groq_service else False,
            'model': self.groq_service.model if self.groq_service else None
        }
    
    def get_image_generation_status(self):
        """Повертає статус генерації зображень"""
        return self.image_generator.get_status()
    
    def get_ai_tts_status(self):
        """Повертає статус AI TTS"""
        return self.ai_tts.get_status()
    
    def generate_ai_speech(self, text, lang='uk'):
        """Генерує AI голос для тексту"""
        return self.ai_tts.generate_speech(text, lang)
    
    def get_mood_specific_addition(self, mood, analysis):
        """Додає специфічну для настрою частину відповіді"""
        additions = {
            'happy': [
                "Я так радий, що ти запитав про це! 😊",
                "Це просто чудово! Давай розберемося! ✨",
                "Вау, яке цікаве питання! 🌟"
            ],
            'curious': [
                "Хм, це дуже цікаво... 🤔",
                "Дай мені подумати над цим глибше...",
                "Це питання заслуговує на детальний розгляд! 🧐"
            ],
            'wise': [
                "З мого досвіду можу додати...",
                "Важливо розуміти основи цього питання.",
                "Мудрість полягає в розумінні деталей."
            ],
            'playful': [
                "Ха! Це нагадує мені одну історію! 😄",
                "Давай підійдемо до цього креативно! 🎨",
                "Це може бути дуже весело! 🎉"
            ],
            # НОВІ НАСТРОЇ
            'sleepy': [
                "*позіхає* Ммм... це цікаво... 😴",
                "Вибач, трохи сонний, але спробую допомогти... 💤",
                "Zzz... А? Ах так, питання! *протирає очі* 😪"
            ],
            'excited': [
                "ВАУ! ЦЕ НЕЙМОВІРНО КРУТО!!! �🎆",
                "Я ПРОСТО В ЗАХВАТІ ВІД ЦЬОГО ПИТАННЯ!!! ⚡✨",
                "ЕНЕРГІЯ ПЕРЕПОВНЮЄ МЕНЕ! ДАВАЙ РОЗБЕРЕМОСЯ!!! 🔥💥"
            ],
            'mysterious': [
                "Хм... цікаво... але чи готовий ти до правди? �",
                "Деякі знання приховані не просто так... 🌙✨",
                "Таємниці розкриваються тільки тим, хто готовий... 🗝️"
            ]
        }
        
        return random.choice(additions.get(mood, []))
    
    def get_fallback_response(self, mood):
        """Резервна відповідь, якщо не вдалося згенерувати специфічну"""
        fallbacks = {
            'happy': "Я радий спілкуватися з тобою! Що тебе цікавить? 😊",
            'curious': "Цікаво... Розкажи мені більше! 🤔",
            'wise': "Це цікаве питання. Поділися своїми думками.",
            'playful': "Давай пограємося з ідеями! Що на думці? 😄",
            'sleepy': "Ммм... розкажи мені щось цікаве... 😴",
            'excited': "ВАУ! РОЗКАЖИ БІЛЬШЕ! Я ГОТОВИЙ СЛУХАТИ! 🚀",
            'mysterious': "Твоє питання приховує таємниці... розкажи більше... 🔮"
        }
        
        return fallbacks.get(mood, "Розкажи мені більше про це!")
    
    def update_context(self, user_input, response):
        """Оновлює контекст розмови та визначає тему"""
        # Визначаємо тему на основі ключових слів
        topic = self.extract_topic(user_input)
        if topic:
            self.last_topic = topic
        
        self.conversation_context.append({
            'user': user_input,
            'assistant': response,
            'topic': topic,
            'timestamp': datetime.datetime.now().isoformat()
        })
        
        # Зберігаємо тільки останні 10 повідомлень
        if len(self.conversation_context) > 10:
            self.conversation_context = self.conversation_context[-10:]
    
    def extract_topic(self, user_input):
        """Витягує тему з повідомлення користувача"""
        user_input_lower = user_input.lower()
        
        topics = {
            'programming': ['програмування', 'код', 'python', 'javascript', 'html', 'css', 'розробка'],
            'learning': ['навчання', 'вчитися', 'урок', 'курс', 'освіта'],
            'math': ['математика', 'обчислення', 'рахувати', '+', '-', '*', '/', '='],
            'time': ['час', 'дата', 'сьогодні', 'завтра', 'вчора', 'тиждень', 'місяць'],
            'facts': ['факт', 'цікаво', 'знання', 'інформація'],
            'entertainment': ['жарт', 'весело', 'розваги', 'гра']
        }
        
        for topic, keywords in topics.items():
            if any(keyword in user_input_lower for keyword in keywords):
                return topic
        
        return None
    
    def get_context_response(self, current_input):
        """Генерує відповідь з урахуванням контексту"""
        if not self.last_topic or not self.conversation_context:
            return None
        
        # Якщо користувач продовжує тему
        current_topic = self.extract_topic(current_input)
        
        if current_topic and current_topic == self.last_topic:
            context_responses = {
                'programming': [
                    "Продовжуючи нашу розмову про програмування...",
                    "Як я вже казав про код...",
                    "Повертаючись до програмування..."
                ],
                'learning': [
                    "Щодо навчання, про яке ми говорили...",
                    "Продовжуючи тему освіти...",
                    "Як ми обговорювали раніше..."
                ],
                'math': [
                    "Повертаючись до математики...",
                    "Щодо обчислень, які ми робили...",
                    "Продовжуючи математичну тему..."
                ],
                'facts': [
                    "Ще один цікавий факт...",
                    "Продовжуючи тему фактів...",
                    "Раз вже говоримо про цікаве..."
                ]
            }
            
            if self.last_topic in context_responses:
                return random.choice(context_responses[self.last_topic])
        
        # Якщо користувач змінив тему
        elif current_topic and current_topic != self.last_topic and len(self.conversation_context) > 1:
            topic_names = {
                'programming': 'програмування',
                'learning': 'навчання', 
                'math': 'математику',
                'time': 'час',
                'facts': 'факти',
                'entertainment': 'розваги'
            }
            old_topic_name = topic_names.get(self.last_topic, self.last_topic)
            new_topic_name = topic_names.get(current_topic, current_topic)
            return f"Бачу, ми перейшли від {old_topic_name} до {new_topic_name}. Цікаво!"
        
        return None
    
    def get_time_based_greeting(self):
        """Повертає привітання на основі часу доби"""
        current_hour = datetime.datetime.now().hour
        
        if 5 <= current_hour < 12:
            return "Доброго ранку! ☀️"
        elif 12 <= current_hour < 17:
            return "Добрий день! 🌤️"
        elif 17 <= current_hour < 22:
            return "Добрий вечір! 🌅"
        else:
            return "Доброї ночі! 🌙"
    
    def get_date_info(self, query=None):
        """Повертає інформацію про дату"""
        now = datetime.datetime.now()
        
        if not query:
            return {
                'current_date': now.strftime('%d.%m.%Y'),
                'current_time': now.strftime('%H:%M:%S'),
                'day_of_week': self.get_day_name(now.weekday()),
                'formatted': f"Сьогодні {self.get_day_name(now.weekday())}, {now.strftime('%d %B %Y року')}, час: {now.strftime('%H:%M')}"
            }
        
        # Обробка специфічних запитів про дату
        query_lower = query.lower()
        
        if 'завтра' in query_lower:
            tomorrow = now + datetime.timedelta(days=1)
            return {
                'date': tomorrow.strftime('%d.%m.%Y'),
                'day_of_week': self.get_day_name(tomorrow.weekday()),
                'formatted': f"Завтра буде {self.get_day_name(tomorrow.weekday())}, {tomorrow.strftime('%d %B %Y року')}"
            }
        
        elif 'вчора' in query_lower:
            yesterday = now - datetime.timedelta(days=1)
            return {
                'date': yesterday.strftime('%d.%m.%Y'),
                'day_of_week': self.get_day_name(yesterday.weekday()),
                'formatted': f"Вчора було {self.get_day_name(yesterday.weekday())}, {yesterday.strftime('%d %B %Y року')}"
            }
        
        elif 'тиждень' in query_lower:
            week_start = now - datetime.timedelta(days=now.weekday())
            week_end = week_start + datetime.timedelta(days=6)
            return {
                'week_start': week_start.strftime('%d.%m.%Y'),
                'week_end': week_end.strftime('%d.%m.%Y'),
                'formatted': f"Цей тиждень: з {week_start.strftime('%d.%m')} по {week_end.strftime('%d.%m.%Y')}"
            }
        
        elif 'місяць' in query_lower:
            days_in_month = calendar.monthrange(now.year, now.month)[1]
            return {
                'month': now.strftime('%B %Y'),
                'days_in_month': days_in_month,
                'formatted': f"Цей місяць: {now.strftime('%B %Y року')}, у ньому {days_in_month} днів"
            }
        
        return self.get_date_info()  # Повертаємо базову інформацію
    
    def get_day_name(self, weekday):
        """Повертає назву дня тижня українською"""
        days = ['понеділок', 'вівторок', 'середа', 'четвер', "п'ятниця", 'субота', 'неділя']
        return days[weekday]
    
    def get_random_fact(self):
        """Повертає випадковий цікавий факт"""
        return random.choice(self.knowledge_base['facts'])
    
    def calculate_expression(self, expression):
        """Безпечно обчислює математичний вираз"""
        try:
            # Очищуємо вираз від небезпечних символів
            safe_expression = re.sub(r'[^0-9+\-*/().,\s]', '', expression)
            safe_expression = safe_expression.replace(',', '.')  # Замінюємо кому на крапку
            safe_expression = safe_expression.strip()
            
            if not safe_expression:
                return {
                    'expression': expression,
                    'error': 'Не знайдено математичного виразу',
                    'success': False
                }
            
            # Список дозволених функцій
            allowed_names = {
                'abs': abs, 'round': round, 'min': min, 'max': max,
                'pow': pow, 'sqrt': math.sqrt, 'sin': math.sin, 
                'cos': math.cos, 'tan': math.tan, 'pi': math.pi,
                'e': math.e, 'log': math.log, 'log10': math.log10
            }
            
            # Обчислюємо вираз
            result = eval(safe_expression, {"__builtins__": {}}, allowed_names)
            
            return {
                'expression': expression,
                'result': result,
                'formatted': f"{safe_expression} = {result}",
                'success': True
            }
            
        except ZeroDivisionError:
            return {
                'expression': expression,
                'error': 'Ділення на нуль неможливе!',
                'success': False
            }
        except Exception as e:
            return {
                'expression': expression,
                'error': f'Помилка в обчисленні: не можу розрахувати цей вираз',
                'success': False
            }
    
    def get_common_topics(self):
        """Визначає найпопулярніші теми розмови"""
        topics = {}
        for msg in self.conversation_context:
            words = msg['user'].lower().split()
            for word in words:
                if len(word) > 4:  # Ігноруємо короткі слова
                    topics[word] = topics.get(word, 0) + 1
        
        return sorted(topics.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # МЕТОДИ ДЛЯ РОБОТИ З ПАМ'ЯТТЮ КОРИСТУВАЧА
    def save_user_name(self, name):
        """Зберігає ім'я користувача"""
        self.user_memory['name'] = name.strip().title()
        if not self.user_memory['first_meeting']:
            self.user_memory['first_meeting'] = datetime.datetime.now().isoformat()
        return f"Приємно познайомитися, {self.user_memory['name']}! Я запам'ятаю твоє ім'я! 😊"
    
    def add_favorite_topic(self, topic):
        """Додає улюблену тему користувача"""
        if topic not in self.user_memory['favorite_topics']:
            self.user_memory['favorite_topics'].append(topic)
            return f"Зрозумів! Додав '{topic}' до твоїх улюблених тем! ⭐"
        return f"Я вже знаю, що тебе цікавить '{topic}'! 😊"
    
    def add_note(self, note):
        """Додає нотатку про користувача з датою"""
        current_date = datetime.datetime.now()
        note_data = {
            'content': note,
            'timestamp': current_date.isoformat(),
            'date': current_date.strftime('%Y-%m-%d'),
            'topic': self.last_topic
        }
        self.user_memory['notes'].append(note_data)
        formatted_date = current_date.strftime('%Y-%m-%d')
        return f"Записав нотатку: [{formatted_date}] {note} 📝"
    
    def save_favorite_color(self, color):
        """Зберігає улюблений колір користувача (⭐ ДОМАШКА)"""
        self.user_memory['favorite_color'] = color.strip().lower()
        return f"Чудово! Запам'ятав, що твій улюблений колір - {color}! 🎨"
    
    def save_age(self, age):
        """Зберігає вік користувача (⭐ ДОМАШКА)"""
        self.user_memory['age'] = age
        return f"Зрозумів! Тобі {age} років! 🎂"
    
    def delete_all_notes(self):
        """Видаляє всі нотатки користувача (⭐⭐ ДОМАШКА)"""
        notes_count = len(self.user_memory['notes'])
        self.user_memory['notes'] = []
        return f"Видалив всі нотатки ({notes_count} шт.)! Тепер список чистий! 🧹✨"
    
    def get_user_info(self):
        """Повертає інформацію про користувача"""
        info = []
        
        if self.user_memory['name']:
            info.append(f"👤 Ім'я: {self.user_memory['name']}")
        
        if self.user_memory['age']:
            info.append(f"🎂 Вік: {self.user_memory['age']} років")
        
        if self.user_memory['favorite_color']:
            info.append(f"🎨 Улюблений колір: {self.user_memory['favorite_color']}")
        
        if self.user_memory['favorite_topics']:
            topics = ', '.join(self.user_memory['favorite_topics'])
            info.append(f"⭐ Улюблені теми: {topics}")
        
        if self.user_memory['notes']:
            info.append(f"📝 Нотаток: {len(self.user_memory['notes'])}")
        
        info.append(f"💬 Спілкувань: {self.user_memory['interaction_count']}")
        
        if self.user_memory['first_meeting']:
            first_date = datetime.datetime.fromisoformat(self.user_memory['first_meeting'])
            info.append(f"🗓️ Знайомі з: {first_date.strftime('%d.%m.%Y')}")
        
        return "\n".join(info) if info else "Поки що я нічого не знаю про тебе. Розкажи щось! 😊"
    
    def analyze_user_input_for_memory(self, user_input):
        """Аналізує введення для збереження в пам'ять"""
        user_input_lower = user_input.lower()
        
        # Визначення імені
        name_patterns = [
            r"мене звати (.+)",
            r"моє ім'я (.+)",
            r"я (.+)",
            r"звати мене (.+)"
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, user_input_lower)
            if match:
                name = match.group(1).strip()
                # Очищуємо від зайвих слів
                name = re.sub(r'\b(це|є|то)\b', '', name).strip()
                if len(name) > 0 and len(name) < 20:
                    return {'type': 'name', 'value': name}
        
        # Визначення улюблених тем
        topic_patterns = [
            r"мені подобається (.+)",
            r"я люблю (.+)",
            r"цікавлюся (.+)",
            r"моя улюблена тема (.+)"
        ]
        
        for pattern in topic_patterns:
            match = re.search(pattern, user_input_lower)
            if match:
                topic = match.group(1).strip()
                return {'type': 'favorite_topic', 'value': topic}
        
        # Команда видалення всіх нотаток (⭐⭐ ДОМАШКА)
        if any(phrase in user_input_lower for phrase in ['видали всі нотатки', 'видалити всі нотатки', 'очисти нотатки', 'стерти нотатки']):
            return {'type': 'delete_all_notes', 'value': None}
        
        # Визначення улюбленого кольору (⭐ ДОМАШКА)
        color_patterns = [
            r"мій улюблений колір (.+)",
            r"люблю колір (.+)",
            r"подобається колір (.+)",
            r"улюблений колір (.+)"
        ]
        
        for pattern in color_patterns:
            match = re.search(pattern, user_input_lower)
            if match:
                color = match.group(1).strip()
                return {'type': 'favorite_color', 'value': color}
        
        # Визначення віку (⭐ ДОМАШКА)
        age_patterns = [
            r"мені (\d+) рок",
            r"мені (\d+) років",
            r"мій вік (\d+)",
            r"я маю (\d+) рок"
        ]
        
        for pattern in age_patterns:
            match = re.search(pattern, user_input_lower)
            if match:
                age = int(match.group(1))
                if 5 <= age <= 120:  # Розумні межі віку
                    return {'type': 'age', 'value': age}
        
        # Визначення нотаток
        note_patterns = [
            r"запам'ятай (.+)",
            r"запиши (.+)",
            r"нотатка (.+)"
        ]
        
        for pattern in note_patterns:
            match = re.search(pattern, user_input_lower)
            if match:
                note = match.group(1).strip()
                return {'type': 'note', 'value': note}
        
        return None
    
    def get_personalized_greeting(self):
        """Повертає персоналізоване привітання (⭐ ДОМАШКА - використовує колір)"""
        if self.user_memory['name']:
            greetings = [
                f"Привіт, {self.user_memory['name']}! Радий тебе бачити знову! 😊",
                f"Вітаю, {self.user_memory['name']}! Як справи? 🌟",
                f"О, {self.user_memory['name']}! Чудово, що ти повернувся! 🚀"
            ]
            
            # Додаємо привітання з кольором якщо він є (⭐ ДОМАШКА)
            if self.user_memory['favorite_color']:
                color = self.user_memory['favorite_color']
                color_emojis = {
                    'червоний': '❤️', 'синій': '💙', 'зелений': '💚', 
                    'жовтий': '💛', 'фіолетовий': '💜', 'помаранчевий': '🧡',
                    'рожевий': '💗', 'чорний': '🖤', 'білий': '🤍', 'коричневий': '🤎'
                }
                emoji = color_emojis.get(color, '🎨')
                greetings.append(f"Привіт, {self.user_memory['name']}! Сьогодні все в твоєму улюбленому {color} кольорі! {emoji}")
            
            return random.choice(greetings)
        else:
            return "Привіт! Я ще не знаю твого імені. Як тебе звати? 😊"
    
    def get_topic_suggestion(self):
        """Пропонує тему на основі улюблених"""
        if self.user_memory['favorite_topics']:
            topic = random.choice(self.user_memory['favorite_topics'])
            return f"Може поговоримо про {topic}? Я пам'ятаю, що тебе це цікавить! ⭐"
        return None
    
    def update_interaction_stats(self):
        """Оновлює статистику взаємодії"""
        self.user_memory['interaction_count'] += 1
        self.user_memory['last_seen'] = datetime.datetime.now().isoformat()
    
    def get_conversation_stats(self):
        """Повертає статистику розмови"""
        return {
            'total_messages': len(self.conversation_context),
            'avg_response_length': sum(len(msg['assistant']) for msg in self.conversation_context) / max(len(self.conversation_context), 1),
            'most_common_topics': self.get_common_topics(),
            'last_topic': self.last_topic,
            'context_length': len(self.conversation_context),
            'user_name': self.user_memory['name'],
            'favorite_topics_count': len(self.user_memory['favorite_topics']),
            'notes_count': len(self.user_memory['notes']),
            'interaction_count': self.user_memory['interaction_count']
        }