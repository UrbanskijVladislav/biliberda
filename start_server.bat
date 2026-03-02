@echo off
chcp 65001 >nul
echo ========================================
echo   🚀 Запуск AI Асистента
echo ========================================
echo.

REM Перевіряємо наявність Python
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Python не знайдено! Встановіть Python з https://www.python.org/
    pause
    exit /b 1
)

echo ✅ Python знайдено
echo.

REM Перевіряємо наявність залежностей
echo 📦 Перевірка залежностей...
python -c "import flask" >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️ Flask не встановлено. Встановлюю залежності...
    pip install -r requirements.txt
)

echo ✅ Залежності встановлено
echo.

echo 🌐 Запуск сервера на http://localhost:5000
echo 📱 Відкрийте браузер та перейдіть за адресою
echo 🛑 Для зупинки натисніть Ctrl+C
echo.
echo ========================================
echo.

REM Запускаємо сервер
python app.py

pause
