"""
Генерація зображень через Pollinations.ai (БЕЗКОШТОВНО БЕЗ ТОКЕНА!)
"""
import os
import requests
import logging
from datetime import datetime
import urllib.parse

class PollinationsImageGenerator:
    def __init__(self):
        self.use_generation = os.getenv('USE_IMAGE_GENERATION', 'False').lower() == 'true'
        self.api_url = "https://image.pollinations.ai/prompt/"
        logging.info("Pollinations.ai генератор ініціалізовано (БЕЗ ТОКЕНА!)")
    
    def is_available(self):
        """Завжди доступно якщо увімкнено"""
        return self.use_generation
    
    def create_cosmic_prompt(self, user_request, mood="cosmic"):
        """Створює промпт на основі запиту користувача"""
        mood_styles = {
            'happy': 'bright, colorful, joyful',
            'curious': 'mysterious, intriguing, detailed',
            'wise': 'ancient, mystical, wise',
            'playful': 'fun, whimsical, playful',
            'sleepy': 'dreamy, peaceful, soft',
            'excited': 'dynamic, energetic, vibrant',
            'mysterious': 'dark, enigmatic, mysterious'
        }
        
        style = mood_styles.get(mood, 'beautiful, detailed')
        
        # Витягуємо текст після ключового слова
        user_lower = user_request.lower()
        
        # Знаходимо що саме хоче користувач
        keywords = [
            'намалюй', 'створи зображення', 'зроби картинку', 'покажи', 
            'згенеруй', 'малюнок', 'зображення', 'картинка', 'фото',
            'візуалізуй', 'зроби', 'створи', 'покажи мені', 'хочу побачити', 'зобрази'
        ]
        
        request_text = user_request
        for keyword in keywords:
            if keyword in user_lower:
                # Витягуємо текст після ключового слова
                parts = user_lower.split(keyword, 1)
                if len(parts) > 1 and parts[1].strip():
                    request_text = parts[1].strip()
                    break
        
        # Якщо запит дуже короткий, використовуємо весь текст
        if len(request_text) < 3:
            request_text = user_request
        
        # Розширений словник для перекладу
        translations = {
            # Професії та люди
            'програміст': 'programmer coding',
            'програмістка': 'female programmer coding',
            'хакер': 'hacker with computer',
            'робот': 'futuristic robot',
            'людина': 'person',
            'дівчина': 'girl',
            'хлопець': 'boy',
            'чоловік': 'man',
            'жінка': 'woman',
            
            # Космос та природа
            'планета': 'planet in space',
            'галактика': 'galaxy with stars',
            'зірки': 'stars in night sky',
            'космос': 'outer space',
            'всесвіт': 'universe',
            'сонце': 'sun',
            'місяць': 'moon',
            'земля': 'earth planet',
            'небо': 'sky',
            'хмари': 'clouds',
            'дощ': 'rain',
            'сніг': 'snow',
            'блискавка': 'lightning',
            'веселка': 'rainbow',
            
            # Тварини
            'кіт': 'cute cat',
            'кішка': 'cute cat',
            'собака': 'dog',
            'пес': 'dog',
            'дракон': 'dragon',
            'птах': 'bird',
            'риба': 'fish',
            'лев': 'lion',
            'тигр': 'tiger',
            'ведмідь': 'bear',
            'вовк': 'wolf',
            'лисиця': 'fox',
            
            # Місця
            'замок': 'castle',
            'ліс': 'forest',
            'гори': 'mountains',
            'море': 'ocean',
            'озеро': 'lake',
            'річка': 'river',
            'місто': 'city',
            'село': 'village',
            'будинок': 'house',
            'вулиця': 'street',
            'парк': 'park',
            'сад': 'garden',
            
            # Транспорт
            'машина': 'car',
            'автомобіль': 'car',
            'літак': 'airplane',
            'корабель': 'ship',
            'човен': 'boat',
            'ракета': 'rocket',
            'космічний корабель': 'spaceship',
            'велосипед': 'bicycle',
            'мотоцикл': 'motorcycle',
            
            # Об'єкти
            'дерево': 'tree',
            'квітка': 'flower',
            'троянда': 'rose',
            'гора': 'mountain',
            'вогонь': 'fire',
            'вода': 'water',
            'камінь': 'stone',
            'метал': 'metal',
            'скло': 'glass',
            'кристал': 'crystal',
            'діамант': 'diamond',
            
            # Кольори
            'червоний': 'red',
            'синій': 'blue',
            'зелений': 'green',
            'жовтий': 'yellow',
            'чорний': 'black',
            'білий': 'white',
            'сірий': 'gray',
            'рожевий': 'pink',
            'фіолетовий': 'purple',
            'помаранчевий': 'orange',
            'коричневий': 'brown',
            'золотий': 'golden',
            'срібний': 'silver',
            
            # Прикметники
            'великий': 'big',
            'маленький': 'small',
            'високий': 'tall',
            'низький': 'short',
            'товстий': 'thick',
            'тонкий': 'thin',
            'старий': 'old',
            'новий': 'new',
            'гарний': 'beautiful',
            'красивий': 'beautiful',
            'потворний': 'ugly',
            'страшний': 'scary',
            'милий': 'cute',
            'яскравий': 'bright',
            'темний': 'dark',
            'світлий': 'light',
            
            # Стилі
            'matrix': 'matrix digital code green',
            'матриця': 'matrix digital code green',
            'цифровий': 'digital',
            'футуристичний': 'futuristic',
            'неоновий': 'neon glowing',
            'світиться': 'glowing',
            'кіберпанк': 'cyberpunk',
            'фентезі': 'fantasy',
            'реалістичний': 'realistic',
            'мультяшний': 'cartoon style',
            'аніме': 'anime style',
            '3d': '3d render',
            'пікселі': 'pixel art',
            
            # Дії
            'літає': 'flying',
            'біжить': 'running',
            'стоїть': 'standing',
            'сидить': 'sitting',
            'спить': 'sleeping',
            'їсть': 'eating',
            'грає': 'playing',
            'працює': 'working',
            'танцює': 'dancing',
            'співає': 'singing'
        }
        
        # Перекладаємо українські слова
        translated_request = request_text.lower()
        for ukr, eng in translations.items():
            translated_request = translated_request.replace(ukr, eng)
        
        # Створюємо фінальний промпт
        prompt = f"{translated_request}, {style}, high quality, detailed, digital art, 4k, masterpiece"
        
        # Обмежуємо довжину промпту
        if len(prompt) > 250:
            prompt = prompt[:250]
        
        return prompt
    
    def generate_image(self, user_request, mood="cosmic"):
        """Генерує зображення"""
        if not self.is_available():
            return {
                'success': False,
                'error': 'Генерація вимкнена'
            }
        
        try:
            prompt = self.create_cosmic_prompt(user_request, mood)
            logging.info(f"Генерація через Pollinations: {prompt}")
            
            # Кодуємо промпт для URL
            encoded_prompt = urllib.parse.quote(prompt)
            
            # ВИПРАВЛЕНИЙ URL - без параметрів, які викликають помилку 530
            image_url = f"{self.api_url}{encoded_prompt}"
            
            logging.info(f"URL зображення: {image_url}")
            
            # Завантажуємо зображення з більшим timeout
            response = requests.get(image_url, timeout=60, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            if response.status_code == 200:
                # Зберігаємо
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"generated_{timestamp}.png"
                filepath = os.path.join("static", "generated_images", filename)
                
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                logging.info(f"Зображення збережено: {filepath}")
                
                return {
                    'success': True,
                    'filename': filename,
                    'filepath': filepath,
                    'url': f"/static/generated_images/{filename}",
                    'prompt': prompt
                }
            else:
                logging.error(f"Помилка {response.status_code}: {response.text}")
                return {
                    'success': False,
                    'error': f'Помилка {response.status_code} - спробуй ще раз через 10 секунд'
                }
            
        except Exception as e:
            logging.error(f"Помилка: {e}")
            return {
                'success': False,
                'error': f'Помилка: {str(e)}'
            }
    
    def analyze_image_request(self, user_input):
        """Аналізує запит"""
        keywords = [
            'намалюй', 'створи зображення', 'зроби картинку', 'покажи', 
            'згенеруй', 'зображення', 'картинка', 'малюнок', 'фото',
            'візуалізуй', 'image', 'picture', 'draw', 'create', 'generate',
            'зроби', 'створи', 'покажи мені', 'хочу побачити', 'зобрази'
        ]
        
        user_lower = user_input.lower()
        for keyword in keywords:
            if keyword in user_lower:
                return {
                    'is_image_request': True,
                    'request': user_input,
                    'keyword': keyword
                }
        
        return {'is_image_request': False}
    
    def get_status(self):
        """Статус"""
        return {
            'available': self.is_available(),
            'enabled': self.use_generation,
            'api_configured': True,
            'provider': 'Pollinations.ai (БЕЗ ТОКЕНА!)',
            'model': 'Flux'
        }
