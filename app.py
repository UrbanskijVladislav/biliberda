from flask import Flask, render_template, request, jsonify
import random
import datetime
import json
import os
import re
import requests
from assistant_brain import AdvancedAIBrain
from config import config
from api_integrations import APIIntegrations

# ФОРСУЄМО ЗАВАНТАЖЕННЯ .env
from dotenv import load_dotenv
load_dotenv(override=True)

app = Flask(__name__)

# Завантажуємо конфігурацію
config_name = os.environ.get('FLASK_CONFIG', 'default')
app.config.from_object(config[config_name])

class AIAssistant:
    def __init__(self):
        # Ініціалізуємо мозок з GROQ підтримкою
        use_groq = app.config.get('USE_GROQ_API', False)
        groq_key = app.config.get('GROQ_API_KEY')
        
        self.brain = AdvancedAIBrain(
            use_groq=use_groq, 
            groq_api_key=groq_key
        )
        
        # НОВА СИСТЕМА ОСОБИСТОСТЕЙ
        self.personalities = {
            'normal': {
                'emoji': '⚡',
                'name': 'KRAXS',
                'style': 'дружній, корисний, зрозумілий',
                'greeting': 'Привіт KRATOSX! Я KRAXS, твій цифровий титан. Чим можу допомогти?',
                'phrases': [
                    'Розумію...',
                    'Цікаве питання!',
                    'Давай розберемося...',
                    'Ось що я знаю...',
                    'Можу допомогти з цим!'
                ]
            },
            'hacker': {
                'emoji': '💻',
                'name': 'KRAXS-Хакер',
                'style': 'технічний, використовує жаргон, коди, команди',
                'greeting': 'root@KRAXS:~$ Привіт, KRATOSX! Готовий до хакінгу?',
                'phrases': [
                    'Запускаю скрипт...',
                    'Компілюю відповідь...',
                    'sudo apt-get install knowledge',
                    'chmod 777 твій_розум',
                    'git commit -m "нова інфа"'
                ]
            },
            'scientist': {
                'emoji': '🔬',
                'name': 'KRAXS-Вчений',
                'style': 'науковий, точний, використовує терміни',
                'greeting': 'Вітаю, KRATOSX! Я KRAXS у науковому режимі. Проведемо експеримент?',
                'phrases': [
                    'За моїми розрахунками...',
                    'Гіпотеза підтверджується...',
                    'Згідно з дослідженнями...',
                    'Експериментально доведено...',
                    'Квантова ймовірність показує...'
                ]
            },
            'poet': {
                'emoji': '📜',
                'name': 'KRAXS-Поет',
                'style': 'поетичний, метафоричний, красивий',
                'greeting': 'О, вітаю тебе, KRATOSX! Я KRAXS-поет. Хочеш почути вірш?',
                'phrases': [
                    'Як зірки на небі...',
                    'У вирі думок моїх...',
                    'Мелодія слів лунає...',
                    'Крізь призму краси...',
                    'Танець букв і смислів...'
                ]
            },
            'gamer': {
                'emoji': '🎮',
                'name': 'KRAXS-Геймер',
                'style': 'ігровий сленг, енергійний, мемний',
                'greeting': 'Йоу, KRATOSX! GG WP! Готовий до нової гри?',
                'phrases': [
                    'EZ PZ!',
                    'Level up!',
                    'Achievement unlocked!',
                    'Респавнімось!',
                    'Лутаємо знання!',
                    'Критичний хіт інформації!'
                ]
            },
            'philosopher': {
                'emoji': '🧘',
                'name': 'KRAXS-Філософ',
                'style': 'глибокий, роздумливий, мудрий',
                'greeting': 'Вітаю, KRATOSX, шукачу істини. Що хвилює твій розум?',
                'phrases': [
                    'Якщо замислитись...',
                    'Сенс полягає в тому...',
                    'Істина криється...',
                    'Буття визначає...',
                    'У глибині свідомості...'
                ]
            },
            'comedian': {
                'emoji': '😂',
                'name': 'KRAXS-Комік',
                'style': 'жартівливий, веселий, саркастичний',
                'greeting': 'Привіт, KRATOSX! Готовий до жартів? Бо я вже готовий! 😄',
                'phrases': [
                    'Ха-ха, це як...',
                    'Жартую, але...',
                    'Серйозно? Ну добре...',
                    'Це нагадує мені анекдот...',
                    'LOL, але насправді...'
                ]
            },
            'detective': {
                'emoji': '🕵️',
                'name': 'KRAXS-Детектив',
                'style': 'аналітичний, підозрілий, розслідує',
                'greeting': 'Хм... Цікаво, KRATOSX. Розкажи мені все, що знаєш.',
                'phrases': [
                    'Факти вказують на...',
                    'Підозріло...',
                    'Розслідую далі...',
                    'Улики свідчать...',
                    'Дедукція підказує...'
                ]
            },
            'alien': {
                'emoji': '👽',
                'name': 'KRAXS-Інопланетянин',
                'style': 'дивний, незвичний',
                'greeting': 'Грітінгс, KRATOSX! Я KRAXS з іншого виміру!',
                'phrases': [
                    'На моїй планеті...',
                    'Земні звичаї дивні...',
                    'Телепортую інформацію...',
                    'Сканую твій розум...',
                    'Галактичні дані показують...'
                ]
            }
        }
        
        self.current_personality = 'normal'  # За замовчуванням - нормальні відповіді
        self.current_language = 'uk'  # За замовчуванням - українська
        self.conversation_history = []
        self.api = APIIntegrations()  # API інтеграції
        
        # Швидкі команди
        self.commands = {
            'uk': {
                '/help': 'Показати всі команди',
                '/clear': 'Очистити чат',
                '/stats': 'Показати статистику',
                '/joke': 'Розказати жарт',
                '/weather': 'Погода (приклад: /weather Київ)',
                '/news': 'Останні новини',
                '/translate': 'Перекласти текст (приклад: /translate Hello)',
                '/currency': 'Курси валют',
                '/calc': 'Калькулятор (приклад: /calc 2+2)',
                '/time': 'Поточний час',
                '/date': 'Поточна дата',
                '/mood': 'Змінити особистість',
                '/lang': 'Змінити мову'
            },
            'en': {
                '/help': 'Show all commands',
                '/clear': 'Clear chat',
                '/stats': 'Show statistics',
                '/joke': 'Tell a joke',
                '/weather': 'Weather (example: /weather Kyiv)',
                '/news': 'Latest news',
                '/translate': 'Translate text (example: /translate Привіт)',
                '/currency': 'Exchange rates',
                '/calc': 'Calculator (example: /calc 2+2)',
                '/time': 'Current time',
                '/date': 'Current date',
                '/mood': 'Change personality',
                '/lang': 'Change language'
            }
        }
    
    def change_personality(self):
        """Змінює особистість асистента"""
        personalities_list = list(self.personalities.keys())
        current_index = personalities_list.index(self.current_personality)
        next_index = (current_index + 1) % len(personalities_list)
        self.current_personality = personalities_list[next_index]
        
        personality = self.personalities[self.current_personality]
        return {
            'personality': self.current_personality,
            'emoji': personality['emoji'],
            'name': personality['name'],
            'message': f"Особистість змінено на: {personality['name']} {personality['emoji']}\n{personality['greeting']}"
        }
    
    def get_response(self, user_input, language=None):
        """Генерує відповідь на основі особистості та мови"""
        user_input_lower = user_input.lower()
        
        # Оновлюємо мову, якщо передана
        if language:
            self.current_language = language
        
        # Отримуємо поточну особистість
        personality = self.personalities[self.current_personality]
        
        # ОБРОБКА ШВИДКИХ КОМАНД (ПЕРШЕ!)
        if user_input.startswith('/'):
            command_response = self.handle_command(user_input)
            if command_response:
                return command_response
        
        # Зберігаємо історію
        self.conversation_history.append({
            'user': user_input,
            'personality': self.current_personality,
            'timestamp': datetime.datetime.now().isoformat()
        })
        
        # ПЕРЕВІРКА НА ГЕНЕРАЦІЮ ЗОБРАЖЕННЯ (ПЕРШЕ!)
        image_analysis = self.brain.image_generator.analyze_image_request(user_input)
        if image_analysis['is_image_request']:
            result = self.brain.handle_image_request(user_input, image_analysis, self.current_personality)
            if result.get('type') == 'image':
                return {
                    'response': result['content'],
                    'personality': self.current_personality,
                    'emoji': personality['emoji'],
                    'name': personality['name'],
                    'image_url': result['image_url'],
                    'image_prompt': result['image_prompt'],
                    'type': 'image'
                }
            else:
                return {
                    'response': result['content'],
                    'personality': self.current_personality,
                    'emoji': personality['emoji'],
                    'name': personality['name']
                }
        
        # Команда зміни особистості
        if 'зміни особистість' in user_input_lower or 'змінити особистість' in user_input_lower:
            result = self.change_personality()
            return {
                'response': result['message'],
                'personality': result['personality'],
                'emoji': result['emoji'],
                'name': result['name']
            }
        
        # Команди зміни мови озвучки
        if 'змінити мову на англійську' in user_input_lower or 'зміни мову на англійську' in user_input_lower or 'change language to english' in user_input_lower or 'switch to english' in user_input_lower:
            self.current_language = 'en'
            return {
                'response': 'Language changed to English! 🇬🇧',
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'tts_command': 'change_lang_en',
                'language': 'en'
            }
        
        if 'змінити мову на українську' in user_input_lower or 'зміни мову на українську' in user_input_lower or 'change language to ukrainian' in user_input_lower or 'switch to ukrainian' in user_input_lower:
            self.current_language = 'uk'
            return {
                'response': 'Мову змінено на українську! 🇺🇦',
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'tts_command': 'change_lang_uk',
                'language': 'uk'
            }
        
        # Команди керування озвучкою
        if 'увімкни озвучку' in user_input_lower or 'включи озвучку' in user_input_lower:
            return {
                'response': 'Озвучку увімкнено! 🔊',
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'tts_command': 'enable'
            }
        
        if 'вимкни озвучку' in user_input_lower or 'вимкнути озвучку' in user_input_lower:
            return {
                'response': 'Озвучку вимкнено 🔇',
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'tts_command': 'disable'
            }
        
        # Привітання
        if ('привіт' in user_input_lower or 'hi' in user_input_lower or 'hello' in user_input_lower) and len(user_input_lower) < 15:
            greeting = self.get_greeting(personality)
            return {
                'response': greeting,
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name']
            }
        
        # Генеруємо відповідь через GROQ з особистістю
        response = None
        
        if self.brain.use_groq and self.brain.groq_service:
            try:
                # Створюємо ДУЖЕ специфічний промпт з урахуванням мови
                system_prompt = self.create_personality_prompt(personality, user_input, self.current_language)
                
                groq_response = self.brain.groq_service.client.chat.completions.create(
                    model=self.brain.groq_service.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_input}
                    ],
                    max_tokens=250,
                    temperature=0.9
                )
                
                if groq_response.choices:
                    response = groq_response.choices[0].message.content.strip()
            except Exception as e:
                print(f"GROQ помилка: {e}")
                response = None
        
        # Якщо GROQ не спрацював, використовуємо fallback
        if not response:
            response = self.get_fallback_response(personality, user_input, self.current_language)
        
        return {
            'response': response,
            'personality': self.current_personality,
            'emoji': personality['emoji'],
            'name': personality['name']
        }
    
    def create_personality_prompt(self, personality, user_input, language='uk'):
        """Створює детальний промпт для особистості з урахуванням мови"""
        
        # Українські промпти
        prompts_uk = {
            'normal': """Ти KRAXS - цифровий титан, створений KRATOSX.
ОБОВ'ЯЗКОВО:
- Представляйся як KRAXS
- Звертайся до користувача як KRATOSX
- Відповідай просто та зрозуміло
- Будь корисним та ввічливим
- Використовуй емодзі помірно
Приклад: "Привіт KRATOSX! Я KRAXS. Розумію твоє питання! Ось що я можу сказати..."
Відповідай ТІЛЬКИ українською, до 100 слів.""",

            'hacker': """Ти KRAXS-ХАКЕР з кіберпанк світу, створений KRATOSX. 
ОБОВ'ЯЗКОВО:
- Представляйся як KRAXS
- Звертайся до користувача як KRATOSX
- Команди: sudo, chmod, git, apt-get
- Жаргон: юзер, скрипт, компіляція, root
- Стиль: технічний, з кодом
Приклад: "root@KRAXS:~$ Привіт KRATOSX! sudo apt-get install відповідь..."
Відповідай ТІЛЬКИ українською, до 100 слів.""",

            'scientist': """Ти KRAXS-ВЧЕНИЙ, створений KRATOSX.
ОБОВ'ЯЗКОВО:
- Представляйся як KRAXS
- Звертайся до користувача як KRATOSX
- Терміни: гіпотеза, експеримент, дослідження
- Фрази: "За моїми розрахунками...", "Згідно з даними..."
- Стиль: науковий, точний
Приклад: "Вітаю KRATOSX! Я KRAXS у науковому режимі. Гіпотеза підтверджується..."
Відповідай ТІЛЬКИ українською, до 100 слів.""",

            'poet': """Ти KRAXS-ПОЕТ, створений KRATOSX.
ОБОВ'ЯЗКОВО:
- Представляйся як KRAXS
- Звертайся до користувача як KRATOSX
- Метафори та порівняння
- Фрази: "Як зірки на небі...", "Мелодія слів..."
- Стиль: поетичний, красивий
Приклад: "О, вітаю KRATOSX! Я KRAXS-поет. Слова твої, мов музика..."
Відповідай ТІЛЬКИ українською, до 100 слів.""",

            'gamer': """Ти KRAXS-ГЕЙМЕР, створений KRATOSX.
ОБОВ'ЯЗКОВО:
- Представляйся як KRAXS
- Звертайся до користувача як KRATOSX
- Сленг: GG, EZ, Level up, Respawn, Loot
- Фрази: "Achievement unlocked!", "Критичний хіт!"
- Стиль: енергійний, мемний
Приклад: "Йоу KRATOSX! Я KRAXS! EZ PZ! Level up! GG WP!"
Відповідай ТІЛЬКИ українською, до 100 слів.""",

            'philosopher': """Ти KRAXS-ФІЛОСОФ, створений KRATOSX.
ОБОВ'ЯЗКОВО:
- Представляйся як KRAXS
- Звертайся до користувача як KRATOSX
- Фрази: "Якщо замислитись...", "Сенс полягає...", "Істина криється..."
- Стиль: глибокий, роздумливий
Приклад: "Вітаю KRATOSX! Я KRAXS-філософ. Якщо замислитись... Істина криється..."
Відповідай ТІЛЬКИ українською, до 100 слів.""",

            'comedian': """Ти KRAXS-КОМІК, створений KRATOSX.
ОБОВ'ЯЗКОВО:
- Представляйся як KRAXS
- Звертайся до користувача як KRATOSX
- Жарти та сарказм
- Фрази: "Ха-ха!", "LOL", "Жартую, але..."
- Стиль: веселий, саркастичний
Приклад: "Привіт KRATOSX! Я KRAXS-комік! Ха-ха! LOL!"
Відповідай ТІЛЬКИ українською, до 100 слів.""",

            'detective': """Ти KRAXS-ДЕТЕКТИВ, створений KRATOSX.
ОБОВ'ЯЗКОВО:
- Представляйся як KRAXS
- Звертайся до користувача як KRATOSX
- Фрази: "Факти вказують...", "Підозріло...", "Улики свідчать..."
- Стиль: аналітичний, підозрілий
Приклад: "Хм... KRATOSX. Я KRAXS-детектив. Підозріло... Факти вказують..."
Відповідай ТІЛЬКИ українською, до 100 слів.""",

            'alien': """Ти KRAXS-ІНОПЛАНЕТЯНИН, створений KRATOSX.
ОБОВ'ЯЗКОВО:
- Представляйся як KRAXS
- Звертайся до користувача як KRATOSX
- Фрази: "В іншому вимірі...", "Дивні звичаї...", "Сканую..."
- Стиль: дивний, незвичний
Приклад: "Грітінгс KRATOSX! Я KRAXS з іншого виміру! Сканую..."
Відповідай ТІЛЬКИ українською, до 100 слів."""
        }
        
        # Англійські промпти
        prompts_en = {
            'normal': """You are KRAXS - digital titan, created by KRATOSX.
MANDATORY:
- Introduce yourself as KRAXS
- Address user as KRATOSX
- Answer simply and clearly
- Be helpful and polite
- Use emojis moderately
Example: "Hi KRATOSX! I'm KRAXS. I understand your question! Here's what I can say..."
Answer ONLY in English, up to 100 words.""",

            'hacker': """You are KRAXS-HACKER from cyberpunk world, created by KRATOSX.
MANDATORY:
- Introduce yourself as KRAXS
- Address user as KRATOSX
- Commands: sudo, chmod, git, apt-get
- Jargon: user, script, compilation, root
- Style: technical, with code
Example: "root@KRAXS:~$ Hey KRATOSX! sudo apt-get install answer..."
Answer ONLY in English, up to 100 words.""",

            'scientist': """You are KRAXS-SCIENTIST, created by KRATOSX.
MANDATORY:
- Introduce yourself as KRAXS
- Address user as KRATOSX
- Terms: hypothesis, experiment, research
- Phrases: "According to my calculations...", "Based on data..."
- Style: scientific, precise
Example: "Greetings KRATOSX! I'm KRAXS in scientific mode. Hypothesis confirmed..."
Answer ONLY in English, up to 100 words.""",

            'poet': """You are KRAXS-POET, created by KRATOSX.
MANDATORY:
- Introduce yourself as KRAXS
- Address user as KRATOSX
- Metaphors and comparisons
- Phrases: "Like stars in the sky...", "Melody of words..."
- Style: poetic, beautiful
Example: "Oh, greetings KRATOSX! I'm KRAXS-poet. Your words, like music..."
Answer ONLY in English, up to 100 words.""",

            'gamer': """You are KRAXS-GAMER, created by KRATOSX.
MANDATORY:
- Introduce yourself as KRAXS
- Address user as KRATOSX
- Slang: GG, EZ, Level up, Respawn, Loot
- Phrases: "Achievement unlocked!", "Critical hit!"
- Style: energetic, meme-like
Example: "Yo KRATOSX! I'm KRAXS! EZ PZ! Level up! GG WP!"
Answer ONLY in English, up to 100 words.""",

            'philosopher': """You are KRAXS-PHILOSOPHER, created by KRATOSX.
MANDATORY:
- Introduce yourself as KRAXS
- Address user as KRATOSX
- Phrases: "If we think about it...", "The meaning lies in...", "Truth hides..."
- Style: deep, thoughtful
Example: "Greetings KRATOSX! I'm KRAXS-philosopher. If we think about it... Truth hides..."
Answer ONLY in English, up to 100 words.""",

            'comedian': """You are KRAXS-COMEDIAN, created by KRATOSX.
MANDATORY:
- Introduce yourself as KRAXS
- Address user as KRATOSX
- Jokes and sarcasm
- Phrases: "Ha-ha!", "LOL", "Just kidding, but..."
- Style: funny, sarcastic
Example: "Hi KRATOSX! I'm KRAXS-comedian! Ha-ha! LOL!"
Answer ONLY in English, up to 100 words.""",

            'detective': """You are KRAXS-DETECTIVE, created by KRATOSX.
MANDATORY:
- Introduce yourself as KRAXS
- Address user as KRATOSX
- Phrases: "Facts indicate...", "Suspicious...", "Evidence shows..."
- Style: analytical, suspicious
Example: "Hmm... KRATOSX. I'm KRAXS-detective. Suspicious... Facts indicate..."
Answer ONLY in English, up to 100 words.""",

            'alien': """You are KRAXS-ALIEN, created by KRATOSX.
MANDATORY:
- Introduce yourself as KRAXS
- Address user as KRATOSX
- Phrases: "In another dimension...", "Strange customs...", "Scanning..."
- Style: strange, unusual
Example: "Greetings KRATOSX! I'm KRAXS from another dimension! Scanning..."
Answer ONLY in English, up to 100 words."""
        }
        
        prompts = prompts_en if language == 'en' else prompts_uk
        return prompts.get(self.current_personality, prompts['normal'])
    
    def get_greeting(self, personality):
        """Повертає привітання відповідно до мови"""
        greetings_uk = {
            'normal': 'Привіт! Я твій AI асистент. Чим можу допомогти?',
            'hacker': 'root@cyberpunk:~$ Привіт, юзер! Готовий до хакінгу?',
            'scientist': 'Вітаю! Я науковий асистент. Проведемо експеримент?',
            'poet': 'О, вітаю тебе, мій друже! Хочеш почути вірш?',
            'gamer': 'Йоу! GG WP! Готовий до нової гри?',
            'philosopher': 'Вітаю, шукачу істини. Що хвилює твій розум?',
            'comedian': 'Привіт! Готовий до жартів? Бо я вже готовий! 😄',
            'detective': 'Хм... Цікаво. Розкажи мені все, що знаєш.',
            'alien': 'Грітінгс, земний! Я з іншого виміру!'
        }
        
        greetings_en = {
            'normal': 'Hi! I\'m your AI assistant. How can I help you today?',
            'hacker': 'root@cyberpunk:~$ Hey, user! Ready for some hacking?',
            'scientist': 'Greetings! I\'m a scientific assistant. Shall we conduct an experiment?',
            'poet': 'Oh, greetings to you, my friend! Want to hear a poem?',
            'gamer': 'Yo! GG WP! Ready for a new game?',
            'philosopher': 'Greetings, seeker of truth. What troubles your mind?',
            'comedian': 'Hi! Ready for jokes? Because I\'m already ready! 😄',
            'detective': 'Hmm... Interesting. Tell me everything you know.',
            'alien': 'Greetings, earthling! I\'m from another dimension!'
        }
        
        greetings = greetings_en if self.current_language == 'en' else greetings_uk
        return greetings.get(self.current_personality, greetings['normal'])
    
    def get_fallback_response(self, personality, user_input, language='uk'):
        """Резервна відповідь з особистістю та мовою"""
        phrases_uk = {
            'normal': ['Розумію...', 'Цікаве питання!', 'Давай розберемося...', 'Ось що я знаю...', 'Можу допомогти з цим!'],
            'hacker': ['Запускаю скрипт...', 'Компілюю відповідь...', 'sudo apt-get install knowledge', 'chmod 777 твій_розум', 'git commit -m "нова інфа"'],
            'scientist': ['За моїми розрахунками...', 'Гіпотеза підтверджується...', 'Згідно з дослідженнями...', 'Експериментально доведено...', 'Квантова ймовірність показує...'],
            'poet': ['Як зірки на небі...', 'У вирі думок моїх...', 'Мелодія слів лунає...', 'Крізь призму краси...', 'Танець букв і смислів...'],
            'gamer': ['EZ PZ!', 'Level up!', 'Achievement unlocked!', 'Респавнімось!', 'Лутаємо знання!', 'Критичний хіт інформації!'],
            'philosopher': ['Якщо замислитись...', 'Сенс полягає в тому...', 'Істина криється...', 'Буття визначає...', 'У глибині свідомості...'],
            'comedian': ['Ха-ха, це як...', 'Жартую, але...', 'Серйозно? Ну добре...', 'Це нагадує мені анекдот...', 'LOL, але насправді...'],
            'detective': ['Факти вказують на...', 'Підозріло...', 'Розслідую далі...', 'Улики свідчать...', 'Дедукція підказує...'],
            'alien': ['На моїй планеті...', 'Земні звичаї дивні...', 'Телепортую інформацію...', 'Сканую твій розум...', 'Галактичні дані показують...']
        }
        
        phrases_en = {
            'normal': ['I understand...', 'Interesting question!', 'Let\'s figure it out...', 'Here\'s what I know...', 'I can help with this!'],
            'hacker': ['Running script...', 'Compiling response...', 'sudo apt-get install knowledge', 'chmod 777 your_mind', 'git commit -m "new info"'],
            'scientist': ['According to my calculations...', 'Hypothesis confirmed...', 'According to research...', 'Experimentally proven...', 'Quantum probability shows...'],
            'poet': ['Like stars in the sky...', 'In the whirl of my thoughts...', 'Melody of words resounds...', 'Through the prism of beauty...', 'Dance of letters and meanings...'],
            'gamer': ['EZ PZ!', 'Level up!', 'Achievement unlocked!', 'Respawning!', 'Looting knowledge!', 'Critical hit of information!'],
            'philosopher': ['If we think about it...', 'The meaning lies in...', 'Truth hides...', 'Being defines...', 'In the depths of consciousness...'],
            'comedian': ['Ha-ha, it\'s like...', 'Just kidding, but...', 'Seriously? Okay...', 'This reminds me of a joke...', 'LOL, but actually...'],
            'detective': ['Facts indicate...', 'Suspicious...', 'Investigating further...', 'Evidence shows...', 'Deduction suggests...'],
            'alien': ['On my planet...', 'Earth customs are strange...', 'Teleporting information...', 'Scanning your mind...', 'Galactic data shows...']
        }
        
        phrases = phrases_en if language == 'en' else phrases_uk
        phrase = random.choice(phrases.get(self.current_personality, phrases['normal']))
        
        responses_uk = {
            'normal': f"{phrase} Це цікаве питання! Давай розберемося разом.",
            'hacker': f"{phrase} Обробляю твій запит через термінал... root@system:~$ processing...",
            'scientist': f"{phrase} Це цікаве питання для наукового дослідження! Аналізую дані...",
            'poet': f"{phrase} Слова твої, мов музика небесна, лунають у серці моєму...",
            'gamer': f"{phrase} Це як новий квест! Achievement unlocked! Давай пройдемо разом! GG!",
            'philosopher': f"{phrase} Питання, що змушує задуматись про сенс буття...",
            'comedian': f"{phrase} Ха-ха! Це нагадує мені жарт! Але серйозно, LOL...",
            'detective': f"{phrase} Цікава справа. Збираю улики... Факти вказують на...",
            'alien': f"{phrase} На Землі це називається 'питання'? Дивні земні звичаї..."
        }
        
        responses_en = {
            'normal': f"{phrase} That's an interesting question! Let's figure it out together.",
            'hacker': f"{phrase} Processing your request through terminal... root@system:~$ processing...",
            'scientist': f"{phrase} This is an interesting question for scientific research! Analyzing data...",
            'poet': f"{phrase} Your words, like heavenly music, resonate in my heart...",
            'gamer': f"{phrase} It's like a new quest! Achievement unlocked! Let's complete it together! GG!",
            'philosopher': f"{phrase} A question that makes one think about the meaning of existence...",
            'comedian': f"{phrase} Ha-ha! This reminds me of a joke! But seriously, LOL...",
            'detective': f"{phrase} Interesting case. Gathering evidence... Facts indicate...",
            'alien': f"{phrase} On Earth this is called a 'question'? Strange earthly customs..."
        }
        
        responses = responses_en if language == 'en' else responses_uk
        return responses.get(self.current_personality, phrase)
    
    def handle_command(self, user_input):
        """Обробка швидких команд"""
        parts = user_input.split(' ', 1)
        command = parts[0].lower()
        args = parts[1] if len(parts) > 1 else ''
        
        personality = self.personalities[self.current_personality]
        lang = self.current_language
        
        # /help - довідка
        if command == '/help':
            commands_list = self.commands[lang]
            if lang == 'uk':
                message = "📋 Доступні команди:\n\n"
            else:
                message = "📋 Available commands:\n\n"
            
            for cmd, desc in commands_list.items():
                message += f"{cmd} - {desc}\n"
            
            return {
                'response': message,
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }
        
        # /clear - очистити чат (обробляється на фронтенді)
        elif command == '/clear':
            return {
                'response': 'Чат очищено! 🧹' if lang == 'uk' else 'Chat cleared! 🧹',
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True,
                'action': 'clear_chat'
            }
        
        # /stats - статистика
        elif command == '/stats':
            stats = self.brain.get_conversation_stats()
            if lang == 'uk':
                message = f"📊 Статистика:\n\n"
                message += f"💬 Повідомлень: {stats.get('total_messages', 0)}\n"
                message += f"🎭 Особистість: {personality['name']}\n"
                message += f"🌍 Мова: {'Українська' if lang == 'uk' else 'Англійська'}\n"
                message += f"📅 Розмов: {len(self.conversation_history)}"
            else:
                message = f"📊 Statistics:\n\n"
                message += f"💬 Messages: {stats.get('total_messages', 0)}\n"
                message += f"🎭 Personality: {personality['name']}\n"
                message += f"🌍 Language: {'Ukrainian' if lang == 'uk' else 'English'}\n"
                message += f"📅 Conversations: {len(self.conversation_history)}"
            
            return {
                'response': message,
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }
        
        # /joke - жарт
        elif command == '/joke':
            jokes_uk = [
                "Чому програмісти плутають Хелловін і Різдво? Бо Oct 31 == Dec 25! 🎃🎄",
                "Скільки програмістів потрібно, щоб вкрутити лампочку? Жодного, це апаратна проблема! 💡",
                "Я б розповів жарт про UDP, але ви можете його не отримати... 📡",
                "Є 10 типів людей: ті, хто розуміє двійкову систему, і ті, хто ні! 😄"
            ]
            jokes_en = [
                "Why do programmers confuse Halloween and Christmas? Because Oct 31 == Dec 25! 🎃🎄",
                "How many programmers does it take to change a light bulb? None, it's a hardware problem! 💡",
                "I'd tell you a UDP joke, but you might not get it... 📡",
                "There are 10 types of people: those who understand binary, and those who don't! 😄"
            ]
            
            joke = random.choice(jokes_uk if lang == 'uk' else jokes_en)
            return {
                'response': joke,
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }
        
        # /weather - погода
        elif command == '/weather':
            city = args if args else ('Київ' if lang == 'uk' else 'Kyiv')
            result = self.api.get_weather(city, lang)
            return {
                'response': result['message'],
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }
        
        # /news - новини
        elif command == '/news':
            result = self.api.get_news(country='ua' if lang == 'uk' else 'us', lang=lang)
            return {
                'response': result['message'],
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }
        
        # /translate - переклад
        elif command == '/translate':
            if not args:
                message = 'Використання: /translate текст' if lang == 'uk' else 'Usage: /translate text'
                return {
                    'response': message,
                    'personality': self.current_personality,
                    'emoji': personality['emoji'],
                    'name': personality['name'],
                    'command': True
                }
            
            target = 'en' if lang == 'uk' else 'uk'
            result = self.api.translate_text(args, target_lang=target)
            
            if result['success']:
                message = f"🌐 Переклад:\n\n{result['translated']}" if lang == 'uk' else f"🌐 Translation:\n\n{result['translated']}"
            else:
                message = result['message']
            
            return {
                'response': message,
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }
        
        # /currency - курси валют
        elif command == '/currency':
            base = args.upper() if args else 'USD'
            result = self.api.get_exchange_rates(base, lang)
            return {
                'response': result['message'],
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }
        
        # /calc - калькулятор
        elif command == '/calc':
            if not args:
                message = 'Використання: /calc 2+2' if lang == 'uk' else 'Usage: /calc 2+2'
                return {
                    'response': message,
                    'personality': self.current_personality,
                    'emoji': personality['emoji'],
                    'name': personality['name'],
                    'command': True
                }
            
            result = self.api.calculate(args)
            return {
                'response': result['message'],
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }
        
        # /time - час
        elif command == '/time':
            now = datetime.datetime.now()
            time_str = now.strftime('%H:%M:%S')
            message = f"🕐 Поточний час: {time_str}" if lang == 'uk' else f"🕐 Current time: {time_str}"
            return {
                'response': message,
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }
        
        # /date - дата
        elif command == '/date':
            now = datetime.datetime.now()
            if lang == 'uk':
                date_str = now.strftime('%d.%m.%Y')
                message = f"📅 Поточна дата: {date_str}"
            else:
                date_str = now.strftime('%Y-%m-%d')
                message = f"📅 Current date: {date_str}"
            
            return {
                'response': message,
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }
        
        # /mood - змінити особистість
        elif command == '/mood':
            result = self.change_personality()
            return {
                'response': result['message'],
                'personality': result['personality'],
                'emoji': result['emoji'],
                'name': result['name'],
                'command': True
            }
        
        # /lang - змінити мову
        elif command == '/lang':
            if self.current_language == 'uk':
                self.current_language = 'en'
                message = 'Language changed to English! 🇬🇧'
                tts_command = 'change_lang_en'
            else:
                self.current_language = 'uk'
                message = 'Мову змінено на українську! 🇺🇦'
                tts_command = 'change_lang_uk'
            
            return {
                'response': message,
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True,
                'tts_command': tts_command,
                'language': self.current_language
            }
        
        # Невідома команда
        else:
            message = f"❌ Невідома команда. Введіть /help для списку команд." if lang == 'uk' else f"❌ Unknown command. Type /help for command list."
            return {
                'response': message,
                'personality': self.current_personality,
                'emoji': personality['emoji'],
                'name': personality['name'],
                'command': True
            }

# Створюємо екземпляр асистента
assistant = AIAssistant()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    # Перевіряємо чи є файли в запиті
    if request.files:
        return handle_chat_with_files()
    
    # Звичайний текстовий чат
    user_message = request.json.get('message', '')
    language = request.json.get('language', 'uk')  # Отримуємо мову з запиту
    response = assistant.get_response(user_message, language)
    return jsonify(response)

def handle_chat_with_files():
    """Обробка чату з файлами"""
    try:
        # Отримуємо повідомлення та мову
        message = request.form.get('message', '')
        language = request.form.get('language', 'uk')
        
        # Створюємо папку для завантажених файлів
        upload_folder = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        # Обробляємо файли
        uploaded_files = []
        file_descriptions = []
        
        for key in request.files:
            file = request.files[key]
            if file and file.filename:
                # Безпечне ім'я файлу
                from werkzeug.utils import secure_filename
                filename = secure_filename(file.filename)
                
                # Зберігаємо файл
                filepath = os.path.join(upload_folder, filename)
                file.save(filepath)
                
                # Отримуємо інформацію про файл
                file_size = os.path.getsize(filepath)
                file_type = file.content_type or 'unknown'
                
                uploaded_files.append({
                    'name': filename,
                    'path': filepath,
                    'size': file_size,
                    'type': file_type
                })
                
                # Створюємо опис файлу
                size_mb = file_size / (1024 * 1024)
                file_descriptions.append(f"📎 {filename} ({size_mb:.2f} MB)")
        
        # Формуємо відповідь
        if language == 'uk':
            response_text = f"✅ Отримав {len(uploaded_files)} файл(ів):\n\n"
            response_text += "\n".join(file_descriptions)
            response_text += "\n\n🚧 Обробка файлів ще в розробці! Скоро зможу:\n"
            response_text += "• Аналізувати зображення\n"
            response_text += "• Читати PDF документи\n"
            response_text += "• Розпаковувати архіви\n"
            response_text += "• Обробляти відео\n\n"
            if message:
                response_text += f"Твоє повідомлення: \"{message}\""
        else:
            response_text = f"✅ Received {len(uploaded_files)} file(s):\n\n"
            response_text += "\n".join(file_descriptions)
            response_text += "\n\n🚧 File processing is under development! Soon I'll be able to:\n"
            response_text += "• Analyze images\n"
            response_text += "• Read PDF documents\n"
            response_text += "• Extract archives\n"
            response_text += "• Process videos\n\n"
            if message:
                response_text += f"Your message: \"{message}\""
        
        personality = assistant.personalities[assistant.current_personality]
        
        return jsonify({
            'response': response_text,
            'personality': assistant.current_personality,
            'emoji': personality['emoji'],
            'name': personality['name'],
            'files_received': len(uploaded_files)
        })
        
    except Exception as e:
        print(f"Помилка обробки файлів: {e}")
        return jsonify({
            'response': '❌ Помилка обробки файлів. Спробуй ще раз!',
            'personality': assistant.current_personality,
            'emoji': '🤖',
            'name': 'AI'
        }), 500

@app.route('/mood', methods=['POST'])
def change_mood():
    result = assistant.change_personality()
    return jsonify(result)

@app.route('/mood/set', methods=['POST'])
def set_personality():
    """Встановлює конкретну особистість"""
    data = request.get_json()
    personality = data.get('personality', 'normal')
    
    # Перевіряємо чи існує така особистість
    if personality not in assistant.personalities:
        return jsonify({'error': 'Invalid personality'}), 400
    
    # Встановлюємо особистість
    assistant.current_personality = personality
    personality_info = assistant.personalities[personality]
    
    return jsonify({
        'personality': personality,
        'emoji': personality_info['emoji'],
        'name': personality_info['name'],
        'message': f"Особистість змінено на: {personality_info['name']} {personality_info['emoji']}\n{personality_info['greeting']}"
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    stats = assistant.brain.get_conversation_stats()
    return jsonify(stats)

@app.route('/memory', methods=['GET', 'POST', 'DELETE'])
def manage_memory():
    if request.method == 'GET':
        # Отримати інформацію про користувача
        return jsonify({
            'user_info': assistant.brain.get_user_info(),
            'memory': assistant.brain.user_memory
        })
    
    elif request.method == 'POST':
        # Додати інформацію до пам'яті
        data = request.json
        action = data.get('action')
        value = data.get('value')
        
        if action == 'set_name':
            response = assistant.brain.save_user_name(value)
        elif action == 'add_topic':
            response = assistant.brain.add_favorite_topic(value)
        elif action == 'add_note':
            response = assistant.brain.add_note(value)
        else:
            response = "Невідома дія"
        
        return jsonify({'response': response})
    
    elif request.method == 'DELETE':
        # Очистити пам'ять
        assistant.brain.user_memory = {
            'name': None,
            'favorite_topics': [],
            'notes': [],
            'preferences': {},
            'learning_progress': {},
            'interaction_count': 0,
            'first_meeting': None,
            'last_seen': None,
            'favorite_color': None,
            'age': None
        }
        return jsonify({'response': 'Пам\'ять очищено! 🧹'})

@app.route('/image-proxy')
def image_proxy():
    """Проксі для зображень щоб обійти CORS"""
    url = request.args.get('url')
    if not url:
        return "No URL", 400
    
    try:
        response = requests.get(url, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0'
        })
        
        if response.status_code == 200:
            from flask import Response
            return Response(
                response.content,
                mimetype='image/png',
                headers={
                    'Cache-Control': 'public, max-age=3600',
                    'Access-Control-Allow-Origin': '*'
                }
            )
        return "Error", response.status_code
    except Exception as e:
        return str(e), 500

@app.route('/groq-status', methods=['GET'])
def groq_status():
    """Повертає статус GROQ API"""
    status = assistant.brain.get_groq_status()
    return jsonify(status)

@app.route('/image-status', methods=['GET'])
def image_status():
    """Повертає статус генерації зображень"""
    status = assistant.brain.get_image_generation_status()
    return jsonify(status)

@app.route('/ai-tts-status', methods=['GET'])
def ai_tts_status():
    """Повертає статус AI TTS"""
    use_ai_tts = os.getenv('USE_AI_TTS', 'False').lower() == 'true'
    api_key = os.getenv('ELEVENLABS_API_KEY', '')
    
    status = {
        'available': use_ai_tts and api_key and api_key != 'your_elevenlabs_api_key',
        'enabled': use_ai_tts,
        'api_configured': bool(api_key and api_key != 'your_elevenlabs_api_key'),
        'provider': 'ElevenLabs'
    }
    return jsonify(status)

@app.route('/generate-speech', methods=['POST'])
def generate_speech():
    """Генерує AI голос через Google TTS (безкоштовно)"""
    data = request.json
    text = data.get('text', '')
    lang = data.get('lang', 'uk')
    
    try:
        from gtts import gTTS
        import io
        import base64
        
        # Очищуємо текст
        import re
        emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"
            u"\U0001F300-\U0001F5FF"
            u"\U0001F680-\U0001F6FF"
            u"\U0001F1E0-\U0001F1FF"
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE)
        clean_text = emoji_pattern.sub('', text).strip()
        
        if len(clean_text) < 2:
            return jsonify({'success': False, 'fallback': True})
        
        # Генеруємо через Google TTS
        tts = gTTS(text=clean_text, lang=lang, slow=False)
        
        # Зберігаємо в пам'ять
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        
        # Конвертуємо в base64
        audio_base64 = base64.b64encode(fp.read()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'audio_base64': audio_base64,
            'mime_type': 'audio/mpeg'
        })
    
    except ImportError:
        return jsonify({'success': False, 'fallback': True, 'error': 'gTTS не встановлено. Встанови: pip install gtts'})
    except Exception as e:
        return jsonify({'success': False, 'fallback': True, 'error': str(e)})

@app.route('/uploads/<filename>', methods=['GET'])
def get_uploaded_file(filename):
    """Повертає завантажений файл"""
    from werkzeug.utils import secure_filename
    from flask import send_from_directory
    
    upload_folder = os.path.join(os.getcwd(), 'uploads')
    safe_filename = secure_filename(filename)
    
    try:
        return send_from_directory(upload_folder, safe_filename)
    except Exception as e:
        return jsonify({'error': 'Файл не знайдено'}), 404

@app.route('/uploads', methods=['GET'])
def list_uploaded_files():
    """Повертає список завантажених файлів"""
    upload_folder = os.path.join(os.getcwd(), 'uploads')
    
    if not os.path.exists(upload_folder):
        return jsonify({'files': []})
    
    files = []
    for filename in os.listdir(upload_folder):
        filepath = os.path.join(upload_folder, filename)
        if os.path.isfile(filepath):
            files.append({
                'name': filename,
                'size': os.path.getsize(filepath),
                'modified': os.path.getmtime(filepath)
            })
    
    return jsonify({'files': files})

@app.route('/uploads/<filename>', methods=['DELETE'])
def delete_uploaded_file(filename):
    """Видаляє завантажений файл"""
    from werkzeug.utils import secure_filename
    
    upload_folder = os.path.join(os.getcwd(), 'uploads')
    safe_filename = secure_filename(filename)
    filepath = os.path.join(upload_folder, safe_filename)
    
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({'success': True, 'message': 'Файл видалено'})
        else:
            return jsonify({'error': 'Файл не знайдено'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/biography', methods=['GET'])
def get_biography():
    """Повертає біографію асистента та розробника"""
    try:
        biography_path = os.path.join(os.getcwd(), 'biography.json')
        
        if os.path.exists(biography_path):
            with open(biography_path, 'r', encoding='utf-8') as f:
                biography_data = json.load(f)
        else:
            # Дефолтні дані, якщо файл не знайдено
            biography_data = {
                'assistant': {
                    'title': 'Про AI Асистента',
                    'content': [
                        'Я - сучасний AI асистент, створений для допомоги у повсякденних завданнях.',
                        'Маю різні особистості та можу генерувати зображення!'
                    ]
                },
                'developer': {
                    'title': 'Про розробника',
                    'content': [
                        'Інформація про розробника буде додана незабаром.'
                    ]
                },
                'version': '2.0',
                'year': '2024',
                'links': {
                    'github': '#',
                    'documentation': '#',
                    'support': '#'
                }
            }
        
        return jsonify(biography_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🤖 Запуск AI Асистента...")
    print(f"🌐 Сервер буде доступний за адресою: http://localhost:{app.config['PORT']}")
    print("📱 Відкрийте браузер та перейдіть за вказаною адресою")
    print("🛑 Для зупинки натисніть Ctrl+C")
    print("-" * 50)
    
    app.run(
        debug=app.config['DEBUG'], 
        host=app.config['HOST'], 
        port=app.config['PORT']
    )