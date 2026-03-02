"""
Генерація зображень за допомогою Hugging Face API (БЕЗКОШТОВНО!)
"""
import os
import requests
import logging
from datetime import datetime

class HuggingFaceImageGenerator:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('HUGGINGFACE_API_KEY')
        self.use_generation = os.getenv('USE_IMAGE_GENERATION', 'False').lower() == 'true'
        
        # Використовуємо простішу модель що працює без токена
        self.model = "black-forest-labs/FLUX.1-schnell"
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model}"
        
        if self.api_key and self.api_key != 'your_huggingface_token_here':
            logging.info("Hugging Face генератор з токеном ініціалізовано")
        else:
            logging.info("Hugging Face генератор без токена (публічний API)")
    
    def is_available(self):
        """Перевіряє чи доступна генерація зображень"""
        return self.use_generation
    
    def create_cosmic_prompt(self, user_request, mood="cosmic"):
        """Створює космічний промпт для генерації"""
        
        mood_styles = {
            'happy': 'bright, colorful, joyful',
            'curious': 'mysterious, intriguing',
            'wise': 'ancient, mystical',
            'playful': 'fun, whimsical',
            'sleepy': 'dreamy, peaceful',
            'excited': 'dynamic, energetic',
            'mysterious': 'dark, enigmatic'
        }
        
        style = mood_styles.get(mood, 'beautiful')
        
        # Створюємо простий промпт англійською
        if any(word in user_request.lower() for word in ['програміст', 'код', 'комп\'ютер']):
            prompt = f"cosmic programmer coding in space, {style}, digital art"
        elif any(word in user_request.lower() for word in ['робот', 'ai']):
            prompt = f"futuristic AI robot in space, {style}, sci-fi art"
        elif any(word in user_request.lower() for word in ['планета', 'зірка', 'галактика']):
            prompt = f"beautiful cosmic scene with planets and galaxies, {style}, space art"
        else:
            prompt = f"cosmic space scene with stars and nebula, {style}, space art"
        
        return prompt
    
    def generate_image(self, user_request, mood="cosmic"):
        """Генерує зображення за запитом користувача"""
        
        if not self.is_available():
            logging.warning("Генерація зображень вимкнена")
            return {
                'success': False,
                'error': 'Генерація зображень вимкнена в налаштуваннях'
            }
        
        try:
            prompt = self.create_cosmic_prompt(user_request, mood)
            logging.info(f"Генерація зображення: {prompt}")
            
            headers = {}
            if self.api_key and self.api_key != 'your_huggingface_token_here':
                headers["Authorization"] = f"Bearer {self.api_key}"
            
            payload = {"inputs": prompt}
            
            # Відправляємо запит
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                # Зберігаємо зображення
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"cosmic_{timestamp}.png"
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
            elif response.status_code == 503:
                return {
                    'success': False,
                    'error': 'Модель завантажується... Спробуй через 20 секунд! ⏳'
                }
            else:
                error_text = response.text[:200]
                logging.error(f"Помилка API {response.status_code}: {error_text}")
                return {
                    'success': False,
                    'error': f'Помилка API: {response.status_code}'
                }
            
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Час очікування вичерпано. Спробуй ще раз!'
            }
        except Exception as e:
            logging.error(f"Помилка генерації: {e}")
            return {
                'success': False,
                'error': f'Помилка: {str(e)}'
            }
    
    def analyze_image_request(self, user_input):
        """Аналізує чи просить користувач зображення"""
        image_keywords = [
            'намалюй', 'створи зображення', 'зроби картинку', 'покажи',
            'згенеруй', 'зображення', 'картинка', 'малюнок'
        ]
        
        user_input_lower = user_input.lower()
        
        for keyword in image_keywords:
            if keyword in user_input_lower:
                request_text = user_input_lower.replace(keyword, '').strip()
                return {
                    'is_image_request': True,
                    'request': request_text or user_input,
                    'keyword': keyword
                }
        
        return {'is_image_request': False}
    
    def get_status(self):
        """Повертає статус генератора"""
        return {
            'available': self.is_available(),
            'enabled': self.use_generation,
            'api_configured': True,
            'provider': 'Hugging Face',
            'model': self.model
        }
