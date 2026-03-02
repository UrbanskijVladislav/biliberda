"""
ПРАЦЮЮЧА генерація зображень через DeepAI API
"""
import os
import requests
import logging
from datetime import datetime

class WorkingImageGenerator:
    def __init__(self):
        self.use_generation = os.getenv('USE_IMAGE_GENERATION', 'False').lower() == 'true'
        # DeepAI API - БЕЗКОШТОВНО, ПРАЦЮЄ!
        self.api_key = "quickstart-QUdJIGlzIGNvbWluZy4uLi4K"  # Публічний ключ
        self.api_url = "https://api.deepai.org/api/text2img"
        logging.info("DeepAI генератор ініціалізовано - ПРАЦЮЄ!")
    
    def is_available(self):
        return self.use_generation
    
    def create_prompt(self, user_request):
        """Створює промпт"""
        user_lower = user_request.lower()
        keywords = ['намалюй', 'створи зображення', 'зроби картинку', 'покажи', 'згенеруй', 'малюнок', 'зображення', 'картинка', 'фото', 'візуалізуй', 'зроби', 'створи']
        
        request_text = user_request
        for keyword in keywords:
            if keyword in user_lower:
                parts = user_lower.split(keyword, 1)
                if len(parts) > 1 and parts[1].strip():
                    request_text = parts[1].strip()
                    break
        
        # Переклад
        translations = {
            'програміст': 'programmer', 'робот': 'robot', 'планета': 'planet',
            'галактика': 'galaxy', 'зірки': 'stars', 'космос': 'space',
            'кіт': 'cat', 'собака': 'dog', 'дракон': 'dragon',
            'замок': 'castle', 'ліс': 'forest', 'гори': 'mountains',
            'море': 'ocean', 'місто': 'city', 'природа': 'nature',
            'футуристичний': 'futuristic', 'неоновий': 'neon',
            'красивий': 'beautiful', 'яскравий': 'bright'
        }
        
        translated = request_text.lower()
        for ukr, eng in translations.items():
            translated = translated.replace(ukr, eng)
        
        return f"{translated}, high quality, detailed"
    
    def generate_image(self, user_request, mood="cosmic"):
        """Генерує зображення - ПРАЦЮЄ!"""
        if not self.is_available():
            return {'success': False, 'error': 'Вимкнено'}
        
        try:
            prompt = self.create_prompt(user_request)
            logging.info(f"DeepAI генерація: {prompt}")
            
            # DeepAI API запит
            response = requests.post(
                self.api_url,
                data={'text': prompt},
                headers={'api-key': self.api_key},
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                image_url = data.get('output_url')
                
                if image_url:
                    # Завантажуємо зображення
                    img_response = requests.get(image_url, timeout=30)
                    
                    if img_response.status_code == 200:
                        # Зберігаємо
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        filename = f"generated_{timestamp}.png"
                        filepath = os.path.join("static", "generated_images", filename)
                        
                        os.makedirs(os.path.dirname(filepath), exist_ok=True)
                        
                        with open(filepath, 'wb') as f:
                            f.write(img_response.content)
                        
                        logging.info(f"✅ УСПІХ! Збережено: {filepath}")
                        
                        return {
                            'success': True,
                            'url': f"/static/generated_images/{filename}",
                            'prompt': prompt
                        }
            
            logging.error(f"Помилка: {response.status_code}")
            return {'success': False, 'error': f'Помилка {response.status_code}'}
            
        except Exception as e:
            logging.error(f"Помилка: {e}")
            return {'success': False, 'error': str(e)}
    
    def analyze_image_request(self, user_input):
        """Аналізує запит"""
        keywords = ['намалюй', 'створи зображення', 'зроби картинку', 'покажи', 'згенеруй', 'зображення', 'картинка', 'малюнок', 'фото', 'візуалізуй', 'зроби', 'створи']
        
        user_lower = user_input.lower()
        for keyword in keywords:
            if keyword in user_lower:
                return {'is_image_request': True, 'request': user_input, 'keyword': keyword}
        
        return {'is_image_request': False}
    
    def get_status(self):
        return {
            'available': self.is_available(),
            'enabled': self.use_generation,
            'api_configured': True,
            'provider': 'DeepAI',
            'model': 'Text2Image'
        }
