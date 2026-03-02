@echo off
chcp 65001 >nul
echo ========================================
echo   Простий автозапуск AI Асистента
echo ========================================
echo.

REM Отримуємо поточну директорію
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

echo 📁 Директорія: %SCRIPT_DIR%
echo.

REM Створюємо VBS скрипт для прихованого запуску
echo 📝 Створення скрипта запуску...
(
echo Set WshShell = CreateObject^("WScript.Shell"^)
echo WshShell.Run "pythonw ""%SCRIPT_DIR%\app.py""", 0, False
) > "%SCRIPT_DIR%\start_hidden.vbs"

echo ✅ Скрипт створено
echo.

REM Створюємо ярлик в автозапуску
echo 🔗 Створення ярлика в автозапуску...
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AIAssistant.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%\start_hidden.vbs'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Save()"

if %errorLevel% equ 0 (
    echo ✅ Ярлик створено успішно!
    echo.
    echo 🚀 Запуск сервера...
    wscript "%SCRIPT_DIR%\start_hidden.vbs"
    
    timeout /t 3 /nobreak >nul
    
    echo.
    echo ========================================
    echo   ✅ Готово!
    echo ========================================
    echo.
    echo Сервер запущено і буде запускатися автоматично!
    echo Доступ: http://localhost:5000
    echo.
    echo Для видалення автозапуску видаліть файл:
    echo %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AIAssistant.lnk
    echo.
) else (
    echo ❌ Помилка створення ярлика!
)

pause
