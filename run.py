#!/usr/bin/env python3
"""
Скрипт для запуску AI асистента
"""
import os
import sys
import webbrowser
import time
from threading import Timer

def open_browser():
    """Відкриває браузер через 2 секунди після запуску"""
    webbrowser.open('http://localhost:5000')

def main():
    print("🚀 Запуск AI Асистента...")
    print("=" * 50)
    
    # Перевіряємо наявність залежностей
    try:
        import flask
        print("✅ Flask встановлено")
    except ImportError:
        print("❌ Flask не встановлено. Встановіть: pip install flask")
        return
    
    # Встановлюємо змінні середовища
    os.environ['FLASK_CONFIG'] = 'development'
    
    print("🌐 Сервер запускається на http://localhost:5000")
    print("📱 Браузер відкриється автоматично через 2 секунди")
    print("🛑 Для зупинки натисніть Ctrl+C")
    print("-" * 50)
    
    # Відкриваємо браузер через 2 секунди
    Timer(2.0, open_browser).start()
    
    # Запускаємо додаток
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 AI Асистент зупинено. До побачення!")
    except Exception as e:
        print(f"❌ Помилка запуску: {e}")

if __name__ == '__main__':
    main()