@echo off
chcp 65001 >nul
echo ========================================
echo   Видалення автозапуску AI Асистента
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

REM Зупиняємо та видаляємо службу (якщо існує)
echo 🔍 Перевірка служби Windows...
sc query AIAssistant >nul 2>&1
if %errorLevel% equ 0 (
    echo 🛑 Зупинка служби...
    net stop AIAssistant >nul 2>&1
    echo 🗑️ Видалення служби...
    sc delete AIAssistant
    echo ✅ Служба видалена
) else (
    echo ℹ️ Служба не знайдена
)

echo.

REM Видаляємо завдання Task Scheduler (якщо існує)
echo 🔍 Перевірка Task Scheduler...
schtasks /query /tn "AIAssistant" >nul 2>&1
if %errorLevel% equ 0 (
    echo 🗑️ Видалення завдання...
    schtasks /delete /tn "AIAssistant" /f
    echo ✅ Завдання видалене
) else (
    echo ℹ️ Завдання не знайдене
)

echo.
echo ========================================
echo   ✅ Видалення завершено!
echo ========================================
echo.
echo Автозапуск вимкнено. Тепер запускайте сервер вручну через:
echo   python app.py
echo або
echo   python run.py
echo.
pause
