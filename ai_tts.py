"""
AI Text-to-Speech через ElevenLabs API
Природний, приємний голос замість роботизованого браузерного TTS
"""
import os
import requests
import logging
from datetime import datetime

class AITextToSpeech:
    def __init__(self):
        self.api_key = os.getenv('ELEVENLABS_API_KEY', '')
        self.use_ai_tts = os.getenv('USE_AI_TTS', 'False').lower() == 'true'
        
        # Голоси ElevenLabs
        self.voices = {
            'uk': 'pNInz6obpgDQGcFmaJgB',  # Adam - чоловічий голос
            'en': '21m00Tcm4TlvDq8ikWAM'   # Rachel - жіночий голос
        }
        
        self.api_url = "https://api.elevenlabs.io/v1/text-to-speech"
        
        logging.info(f"AI TTS ініціалізовано. Увімкнено: {self.use_ai_tts}")
    
    def is_available(self):
        """Перевіряє чи доступний AI TTS"""
        return self.use_ai_tts and self.api_key and self.api_key != 'your_elevenlabs_api_key'
    
    def generate_speech(self, text, lang='uk'):
        """Генерує аудіо через ElevenLabs API"""
        if not self.is_available():
            return {
                'success': False,
                'error': 'AI TTS не налаштовано',
                'fallback': True
            }
        
        try:
            # Очищуємо текст від емодзі
            clean_text = self.clean_text(text)
            
            if not clean_text or len(clean_text) < 2:
                return {'success': False, 'error': 'Текст занадто короткий', 'fallback': True}
            
            # Вибираємо голос
            voice_id = self.voices.get(lang, self.voices['uk'])
            
            # Запит до API
            url = f"{self.api_url}/{voice_id}"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            data = {
                "text": clean_text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
            }
            
            logging.info(f"Генерація AI голосу: {clean_text[:50]}...")
            
            response = requests.post(url, json=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                # Повертаємо аудіо напряму (base64)
                import base64
                audio_base64 = base64.b64encode(response.content).decode('utf-8')
                
                logging.info(f"✅ AI голос згенеровано ({len(response.content)} bytes)")
                
                return {
                    'success': True,
                    'audio_base64': audio_base64,
                    'mime_type': 'audio/mpeg'
                }
            else:
                logging.error(f"ElevenLabs помилка: {response.status_code}")
                return {
                    'success': False,
                    'error': f'API помилка {response.status_code}',
                    'fallback': True
                }
        
        except Exception as e:
            logging.error(f"AI TTS помилка: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback': True
            }
    
    def clean_text(self, text):
        """Очищає текст від емодзі та спецсимволів"""
        import re
        
        # Видаляємо емодзі
        emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"  # емоції
            u"\U0001F300-\U0001F5FF"  # символи
            u"\U0001F680-\U0001F6FF"  # транспорт
            u"\U0001F1E0-\U0001F1FF"  # прапори
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE)
        
        clean = emoji_pattern.sub('', text)
        
        # Видаляємо зайві пробіли
        clean = ' '.join(clean.split())
        
        return clean.strip()
    
    def get_status(self):
        """Повертає статус AI TTS"""
        return {
            'available': self.is_available(),
            'enabled': self.use_ai_tts,
            'api_configured': bool(self.api_key and self.api_key != 'your_elevenlabs_api_key'),
            'provider': 'ElevenLabs',
            'voices': len(self.voices)
        }
