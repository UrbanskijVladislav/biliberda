"""
Генерація зображень за допомогою DALL-E API
"""
import os
import requests
import base64
import logging
from datetime import datetime
from PIL import Image
from io import BytesIO

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI бібліотека не встановлена")

class ImageGenerator:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self.client = None
        self.use_generation = os.getenv('USE_IMAGE_GENERATION', 'False').lower() == 'true'
        
        if not OPENAI_AVAILABLE:
            logging.warning("OpenAI бібліотека недоступна")
            return
        
        if self.api_key and self.api_key != 'your_openai_api_key_here':
            try:
                # Простіша ініціалізація без додаткових параметрів
                self.client = OpenAI(api_key=self.api_key)
                logging.info("OpenAI клієнт ініціалізовано успішно")
            except Exception as e:
                logging.error(f"Помилка ініціалізації OpenAI: {e}")
                self.client = None
        else:
            logging.warning("OpenAI API ключ не налаштовано")
    
    def is_available(self):
        """Перевіряє чи доступна генерація зображень"""
        return OPENAI_AVAILABLE and self.client is not None and self.use_generation
    
    def create_cosmic_prompt(self, user_request, mood="cosmic"):
        """Створює космічний промпт для DALL-E"""
        
        mood_styles = {
            'happy': 'bright, colorful, joyful cosmic scene',
            'curious': 'mysterious, intriguing space exploration scene',
            'wise': 'ancient, mystical cosmic wisdom scene',
            'playful': 'fun, whimsical space adventure scene',
            'sleepy': 'dreamy, peaceful night sky scene',
            'excited': 'dynamic, energetic cosmic explosion scene',
            'mysterious': 'dark, enigmatic deep space scene'
        }
        
        style = mood_styles.get(mood, 'beautiful cosmic scene')
        
        # Базові космічні елементи
        cosmic_elements = [
            "stars and galaxies",
            "nebulae and cosmic dust",
            "planets and moons",
            "space stations",
            "astronauts",
            "cosmic phenomena"
        ]
        
        # Створюємо промпт
        if any(word in user_request.lower() for word in ['програміст', 'код', 'комп\'ютер', 'ai']):
            prompt = f"A {style} with a cosmic programmer coding among the stars, futuristic technology, digital art style, high quality, detailed"
        elif any(word in user_request.lower() for word in ['планета', 'зірка', 'галактика']):
            prompt = f"A {style} showing magnificent {user_request.lower()}, space art, cinematic lighting, high resolution"
        elif any(word in user_request.lower() for word in ['робот', 'штучний інтелект']):
            prompt = f"A {style} featuring an AI robot in space, futuristic design, cosmic background, digital art"
        else:
            # Загальний космічний промпт
            prompt = f"A {style} with {', '.join(cosmic_elements[:3])}, space art, vibrant colors, high quality, detailed, cinematic"
        
        return prompt
    
    def generate_image(self, user_request, mood="cosmic", size="1024x1024"):
        """Генерує зображення за запитом користувача"""
        
        if not self.is_available():
            logging.warning("Генерація зображень недоступна")
            return {
                'success': False,
                'error': 'Генерація зображень недоступна. Перевір налаштування OpenAI API.'
            }
        
        try:
            # Створюємо космічний промпт
            prompt = self.create_cosmic_prompt(user_request, mood)
            
            logging.info(f"Генерація зображення з промптом: {prompt}")
            
            # Генеруємо зображення
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size=size,
                quality="standard",
                n=1,
            )
            
            if response.data:
                image_url = response.data[0].url
                
                # Завантажуємо зображення
                img_response = requests.get(image_url, timeout=30)
                if img_response.status_code == 200:
                    # Зберігаємо зображення
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"cosmic_image_{timestamp}.png"
                    filepath = os.path.join("static", "generated_images", filename)
                    
                    # Створюємо папку якщо не існує
                    os.makedirs(os.path.dirname(filepath), exist_ok=True)
                    
                    # Зберігаємо файл
                    with open(filepath, 'wb') as f:
                        f.write(img_response.content)
                    
                    logging.info(f"Зображення збережено: {filepath}")
                    
                    return {
                        'success': True,
                        'filename': filename,
                        'filepath': filepath,
                        'url': f"/static/generated_images/{filename}",
                        'prompt': prompt
                    }
                else:
                    logging.error(f"Помилка завантаження зображення: {img_response.status_code}")
                    return {
                        'success': False,
                        'error': f'Помилка завантаження зображення: HTTP {img_response.status_code}'
                    }
            else:
                logging.error("Порожня відповідь від DALL-E")
                return {
                    'success': False,
                    'error': 'Порожня відповідь від DALL-E API'
                }
            
        except Exception as e:
            logging.error(f"Помилка генерації зображення: {e}")
            return {
                'success': False,
                'error': f'Помилка генерації: {str(e)}'
            }
    
    def analyze_image_request(self, user_input):
        """Аналізує чи просить користувач зображення"""
        image_keywords = [
            'намалюй', 'створи зображення', 'зроби картинку', 'покажи',
            'згенеруй', 'зображення', 'картинка', 'малюнок', 'фото',
            'візуалізуй', 'image', 'picture', 'draw', 'create'
        ]
        
        user_input_lower = user_input.lower()
        
        for keyword in image_keywords:
            if keyword in user_input_lower:
                # Витягуємо що саме малювати
                request_text = user_input_lower.replace(keyword, '').strip()
                return {
                    'is_image_request': True,
                    'request': request_text or user_input,
                    'keyword': keyword
                }
        
        return {'is_image_request': False}
    
    def get_status(self):
        """Повертає статус генератора зображень"""
        return {
            'available': self.is_available(),
            'enabled': self.use_generation,
            'api_configured': self.client is not None,
            'library_installed': OPENAI_AVAILABLE
        }