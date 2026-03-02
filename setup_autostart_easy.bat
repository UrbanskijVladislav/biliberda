@echo off
echo ========================================
echo   Автозапуск AI Асистента
echo ========================================
echo.

REM Створюємо VBS скрипт
echo Set WshShell = CreateObject("WScript.Shell") > start_hidden.vbs
echo WshShell.Run "pythonw app.py", 0, False >> start_hidden.vbs

echo Створено файл start_hidden.vbs
echo.

REM Запускаємо сервер зараз
echo Запуск сервера...
wscript start_hidden.vbs

echo.
echo ========================================
echo   Готово!
echo ========================================
echo.
echo Сервер запущено!
echo Доступ: http://localhost:5000
echo.
echo Щоб додати в автозапуск:
echo 1. Натисніть Win+R
echo 2. Введіть: shell:startup
echo 3. Скопіюйте файл start_hidden.vbs в папку що відкрилася
echo.
pause
