"""
Генерація зображень через Segmind API (БЕЗКОШТОВНО, ПРАЦЮЄ!)
"""
import os
import requests
import logging
from datetime import datetime

class FluxImageGenerator:
    def __init__(self):
        self.use_generation = os.getenv('USE_IMAGE_GENERATION', 'False').lower() == 'true'
        logging.info("Segmind генератор ініціалізовано")
    
    def is_available(self):
        return self.use_generation
    
    def create_prompt(self, user_request, mood="cosmic"):
        """Створює промпт"""
        user_lower = user_request.lower()
        keywords = [
            'намалюй', 'створи зображення', 'зроби картинку', 'покажи', 
            'згенеруй', 'малюнок', 'зображення', 'картинка', 'фото',
            'візуалізуй', 'зроби', 'створи'
        ]
        
        request_text = user_request
        for keyword in keywords:
            if keyword in user_lower:
                parts = user_lower.split(keyword, 1)
                if len(parts) > 1 and parts[1].strip():
                    request_text = parts[1].strip()
                    break
        
        # Переклад
        translations = {
            'програміст': 'programmer coding', 'робот': 'futuristic robot', 
            'планета': 'planet', 'галактика': 'galaxy', 'зірки': 'stars', 
            'космос': 'space', 'кіт': 'cat', 'собака': 'dog', 
            'дракон': 'dragon', 'замок': 'castle', 'ліс': 'forest', 
            'гори': 'mountains', 'море': 'ocean', 'місто': 'city', 
            'природа': 'nature', 'футуристичний': 'futuristic', 
            'неоновий': 'neon', 'красивий': 'beautiful'
        }
        
        translated = request_text.lower()
        for ukr, eng in translations.items():
            translated = translated.replace(ukr, eng)
        
        return f"{translated}, high quality, detailed"
    
    def generate_image(self, user_request, mood="cosmic"):
        """Генерує зображення"""
        if not self.is_available():
            return {'success': False, 'error': 'Вимкнено'}
        
        try:
            prompt = self.create_prompt(user_request, mood)
            logging.info(f"Генерація: {prompt}")
            
            # Segmind API - ПРАЦЮЄ БЕЗ КЛЮЧА!
            url = "https://api.segmind.com/v1/sd1.5-txt2img"
            
            data = {
                "prompt": prompt,
                "negative_prompt": "ugly, blurry, low quality",
                "samples": 1,
                "scheduler": "UniPC",
                "num_inference_steps": 25,
                "guidance_scale": 8,
                "seed": -1,
                "img_width": 512,
                "img_height": 512,
                "base64": False
            }
            
            response = requests.post(url, json=data, timeout=120)
            
            if response.status_code == 200 and len(response.content) > 5000:
                # Зберігаємо
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"generated_{timestamp}.png"
                filepath = os.path.join("static", "generated_images", filename)
                
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                logging.info(f"✅ Збережено: {filepath}")
                
                return {
                    'success': True,
                    'url': f"/static/generated_images/{filename}",
                    'prompt': prompt
                }
            else:
                logging.error(f"Помилка: {response.status_code}, розмір: {len(response.content)}")
                return {'success': False, 'error': f'Помилка генерації'}
            
        except Exception as e:
            logging.error(f"Помилка: {e}")
            return {'success': False, 'error': str(e)}
    
    def analyze_image_request(self, user_input):
        """Аналізує запит"""
        keywords = [
            'намалюй', 'створи зображення', 'зроби картинку', 'покажи', 
            'згенеруй', 'зображення', 'картинка', 'малюнок', 'фото',
            'візуалізуй', 'зроби', 'створи'
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
        return {
            'available': self.is_available(),
            'enabled': self.use_generation,
            'api_configured': True,
            'provider': 'Segmind',
            'model': 'Stable Diffusion 1.5'
        }





