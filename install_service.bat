@echo off
chcp 65001 >nul
echo ========================================
echo   Встановлення AI Асистента як служби
echo ========================================
echo.

REM Перевірка прав адміністратора
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ПОМИЛКА: Потрібні права адміністратора!
    echo Клацніть правою кнопкою на файл та виберіть "Запустити від імені адміністратора"
    pause
    exit /b 1
)

echo ✅ Права адміністратора підтверджено
echo.

REM Отримуємо поточну директорію
set "CURRENT_DIR=%~dp0"
set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"

echo 📁 Директорія проекту: %CURRENT_DIR%
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

REM Встановлюємо NSSM (Non-Sucking Service Manager)
echo 📥 Завантаження NSSM...
if not exist "%CURRENT_DIR%\nssm.exe" (
    echo Завантажте NSSM з https://nssm.cc/download
    echo Розпакуйте nssm.exe в директорію проекту
    echo Або використайте альтернативний метод (Task Scheduler)
    pause
    exit /b 1
)

echo ✅ NSSM знайдено
echo.

REM Створюємо службу
echo 🔧 Створення служби Windows...
"%CURRENT_DIR%\nssm.exe" install AIAssistant python "%CURRENT_DIR%\app.py"
"%CURRENT_DIR%\nssm.exe" set AIAssistant AppDirectory "%CURRENT_DIR%"
"%CURRENT_DIR%\nssm.exe" set AIAssistant DisplayName "AI Асистент"
"%CURRENT_DIR%\nssm.exe" set AIAssistant Description "Автоматичний запуск AI асистента на Flask"
"%CURRENT_DIR%\nssm.exe" set AIAssistant Start SERVICE_AUTO_START

echo.
echo ✅ Служба створена успішно!
echo.
echo 🚀 Запуск служби...
net start AIAssistant

echo.
echo ========================================
echo   ✅ Встановлення завершено!
echo ========================================
echo.
echo Сервер тепер працює автоматично!
echo Доступ: http://localhost:5000
echo.
echo Керування службою:
echo   Запустити:  net start AIAssistant
echo   Зупинити:   net stop AIAssistant
echo   Видалити:   sc delete AIAssistant
echo.
pause
