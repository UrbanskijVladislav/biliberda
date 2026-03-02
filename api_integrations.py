"""
API інтеграції для AI асистента
Підтримка: погода, новини, переклад, курси валют
"""
import requests
import os
from datetime import datetime

class APIIntegrations:
    def __init__(self):
        # API ключі (можна додати в .env)
        self.weather_api_key = os.getenv('OPENWEATHER_API_KEY', '')
        self.news_api_key = os.getenv('NEWS_API_KEY', '')
        
    def get_weather(self, city='Kyiv', lang='uk'):
        """Отримує погоду для міста"""
        try:
            # Очищуємо назву міста
            city = city.strip()
            if not city:
                city = 'Kyiv' if lang == 'uk' else 'Kyiv'
            
            # Використовуємо безкоштовний API wttr.in
            url = f"https://wttr.in/{city}?format=j1"
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0'
            })
            
            if response.status_code == 200:
                data = response.json()
                
                # Перевіряємо чи знайдено місто
                if 'current_condition' not in data or not data['current_condition']:
                    if lang == 'uk':
                        return {
                            'success': False,
                            'message': f"❌ Місто '{city}' не знайдено. Спробуй інше написання або англійською."
                        }
                    else:
                        return {
                            'success': False,
                            'message': f"❌ City '{city}' not found. Try different spelling."
                        }
                
                current = data['current_condition'][0]
                
                # Отримуємо дані
                temp = current['temp_C']
                feels_like = current['FeelsLikeC']
                desc = current['weatherDesc'][0]['value']
                humidity = current['humidity']
                wind = current['windspeedKmph']
                
                # Отримуємо назву локації
                location_name = city
                if 'nearest_area' in data and data['nearest_area']:
                    area = data['nearest_area'][0]
                    if 'areaName' in area and area['areaName']:
                        location_name = area['areaName'][0]['value']
                    if 'country' in area and area['country']:
                        country = area['country'][0]['value']
                        location_name = f"{location_name}, {country}"
                
                # Переклад опису погоди
                weather_translations = {
                    'Sunny': 'Сонячно',
                    'Clear': 'Ясно',
                    'Partly cloudy': 'Частково хмарно',
                    'Cloudy': 'Хмарно',
                    'Overcast': 'Похмуро',
                    'Mist': 'Туман',
                    'Patchy rain possible': 'Можливий дощ',
                    'Patchy snow possible': 'Можливий сніг',
                    'Light rain': 'Легкий дощ',
                    'Moderate rain': 'Помірний дощ',
                    'Heavy rain': 'Сильний дощ',
                    'Light snow': 'Легкий сніг',
                    'Moderate snow': 'Помірний сніг',
                    'Heavy snow': 'Сильний сніг',
                    'Fog': 'Туман',
                    'Freezing fog': 'Морозний туман',
                    'Thundery outbreaks possible': 'Можлива гроза'
                }
                
                desc_translated = weather_translations.get(desc, desc) if lang == 'uk' else desc
                
                if lang == 'uk':
                    return {
                        'success': True,
                        'message': f"☀️ Погода в {location_name}:\n"
                                 f"🌡️ Температура: {temp}°C (відчувається як {feels_like}°C)\n"
                                 f"☁️ Опис: {desc_translated}\n"
                                 f"💧 Вологість: {humidity}%\n"
                                 f"💨 Вітер: {wind} км/год"
                    }
                else:
                    return {
                        'success': True,
                        'message': f"☀️ Weather in {location_name}:\n"
                                 f"🌡️ Temperature: {temp}°C (feels like {feels_like}°C)\n"
                                 f"☁️ Description: {desc}\n"
                                 f"💧 Humidity: {humidity}%\n"
                                 f"💨 Wind: {wind} km/h"
                    }
                    
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'message': '⏱️ Час очікування вичерпано. Спробуй ще раз.' if lang == 'uk' else '⏱️ Request timeout. Try again.'
            }
        except requests.exceptions.ConnectionError:
            return {
                'success': False,
                'message': '🌐 Немає з\'єднання з інтернетом.' if lang == 'uk' else '🌐 No internet connection.'
            }
        except Exception as e:
            print(f"Weather API error: {e}")
            return {
                'success': False,
                'message': f'❌ Помилка отримання погоди для "{city}". Перевір назву міста.' if lang == 'uk' else f'❌ Error getting weather for "{city}". Check city name.'
            }
    
    def get_news(self, country='ua', lang='uk', category='general'):
        """Отримує новини"""
        try:
            # Використовуємо безкоштовний RSS feed
            if country == 'ua':
                url = "https://www.pravda.com.ua/rss/"
            else:
                url = "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
            
            # Для простоти повертаємо заглушку
            if lang == 'uk':
                return {
                    'success': True,
                    'message': "📰 Останні новини:\n\n"
                             "Для отримання новин додайте NEWS_API_KEY в .env файл.\n"
                             "Отримати ключ можна на: https://newsapi.org/"
                }
            else:
                return {
                    'success': True,
                    'message': "📰 Latest news:\n\n"
                             "To get news, add NEWS_API_KEY to .env file.\n"
                             "Get key at: https://newsapi.org/"
                }
        except Exception as e:
            return {
                'success': False,
                'message': 'Помилка отримання новин' if lang == 'uk' else 'Error getting news'
            }
    
    def translate_text(self, text, target_lang='en', source_lang='uk'):
        """Перекладає текст"""
        try:
            # Використовуємо безкоштовний API MyMemory
            url = "https://api.mymemory.translated.net/get"
            
            # Визначаємо мову джерела автоматично
            if source_lang == 'auto':
                # Проста евристика: якщо є кирилиця - українська, інакше - англійська
                if any('\u0400' <= c <= '\u04FF' for c in text):
                    source_lang = 'uk'
                else:
                    source_lang = 'en'
            
            params = {
                'q': text,
                'langpair': f'{source_lang}|{target_lang}'
            }
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                translated = data['responseData']['translatedText']
                return {
                    'success': True,
                    'original': text,
                    'translated': translated,
                    'from': source_lang,
                    'to': target_lang
                }
        except Exception as e:
            return {
                'success': False,
                'message': f'Помилка перекладу: {str(e)}'
            }
        
        return {
            'success': False,
            'message': 'Не вдалося перекласти текст'
        }
    
    def get_exchange_rates(self, base='USD', lang='uk'):
        """Отримує курси валют"""
        try:
            # Використовуємо безкоштовний API
            url = f"https://api.exchangerate-api.com/v4/latest/{base}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                rates = data['rates']
                
                # Основні валюти
                main_currencies = ['EUR', 'UAH', 'GBP', 'PLN', 'JPY']
                
                if lang == 'uk':
                    message = f"💱 Курси валют (базова: {base}):\n\n"
                    for currency in main_currencies:
                        if currency in rates and currency != base:
                            message += f"{currency}: {rates[currency]:.2f}\n"
                else:
                    message = f"💱 Exchange rates (base: {base}):\n\n"
                    for currency in main_currencies:
                        if currency in rates and currency != base:
                            message += f"{currency}: {rates[currency]:.2f}\n"
                
                return {
                    'success': True,
                    'message': message,
                    'rates': rates
                }
        except Exception as e:
            return {
                'success': False,
                'message': 'Помилка отримання курсів' if lang == 'uk' else 'Error getting rates'
            }
    
    def calculate(self, expression):
        """Безпечний калькулятор"""
        try:
            # Дозволені символи
            allowed_chars = set('0123456789+-*/()., ')
            if not all(c in allowed_chars for c in expression):
                return {
                    'success': False,
                    'message': 'Недозволені символи в виразі'
                }
            
            # Замінюємо кому на крапку
            expression = expression.replace(',', '.')
            
            # Обчислюємо
            result = eval(expression, {"__builtins__": {}}, {})
            
            return {
                'success': True,
                'expression': expression,
                'result': result,
                'message': f"🔢 {expression} = {result}"
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Помилка обчислення: {str(e)}'
            }
