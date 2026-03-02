@echo off
chcp 65001 >nul
echo ========================================
echo   Автозапуск через Task Scheduler
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

REM Створюємо XML файл для Task Scheduler
echo 📝 Створення завдання...
(
echo ^<?xml version="1.0" encoding="UTF-16"?^>
echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^>
echo   ^<RegistrationInfo^>
echo     ^<Description^>Автоматичний запуск AI Асистента при вході в систему^</Description^>
echo   ^</RegistrationInfo^>
echo   ^<Triggers^>
echo     ^<LogonTrigger^>
echo       ^<Enabled^>true^</Enabled^>
echo     ^</LogonTrigger^>
echo   ^</Triggers^>
echo   ^<Principals^>
echo     ^<Principal^>
echo       ^<LogonType^>InteractiveToken^</LogonType^>
echo       ^<RunLevel^>HighestAvailable^</RunLevel^>
echo     ^</Principal^>
echo   ^</Principals^>
echo   ^<Settings^>
echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^>
echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^>
echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^>
echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^>
echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^>
echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^>
echo     ^<IdleSettings^>
echo       ^<StopOnIdleEnd^>false^</StopOnIdleEnd^>
echo       ^<RestartOnIdle^>false^</RestartOnIdle^>
echo     ^</IdleSettings^>
echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^>
echo     ^<Enabled^>true^</Enabled^>
echo     ^<Hidden^>false^</Hidden^>
echo     ^<RunOnlyIfIdle^>false^</RunOnlyIfIdle^>
echo     ^<WakeToRun^>false^</WakeToRun^>
echo     ^<ExecutionTimeLimit^>PT0S^</ExecutionTimeLimit^>
echo     ^<Priority^>7^</Priority^>
echo   ^</Settings^>
echo   ^<Actions Context="Author"^>
echo     ^<Exec^>
echo       ^<Command^>pythonw^</Command^>
echo       ^<Arguments^>"%CURRENT_DIR%\app.py"^</Arguments^>
echo       ^<WorkingDirectory^>%CURRENT_DIR%^</WorkingDirectory^>
echo     ^</Exec^>
echo   ^</Actions^>
echo ^</Task^>
) > "%TEMP%\AIAssistant_Task.xml"

echo ✅ XML файл створено
echo.

REM Імпортуємо завдання
echo 🔧 Реєстрація завдання в Task Scheduler...
schtasks /create /tn "AIAssistant" /xml "%TEMP%\AIAssistant_Task.xml" /f

if %errorLevel% equ 0 (
    echo ✅ Завдання створено успішно!
    echo.
    echo 🚀 Запуск завдання...
    schtasks /run /tn "AIAssistant"
    
    echo.
    echo ========================================
    echo   ✅ Встановлення завершено!
    echo ========================================
    echo.
    echo Сервер тепер запускається автоматично при вході в систему!
    echo Доступ: http://localhost:5000
    echo.
    echo Керування:
    echo   Відкрити Task Scheduler: taskschd.msc
    echo   Видалити завдання: schtasks /delete /tn "AIAssistant" /f
    echo.
) else (
    echo ❌ Помилка створення завдання!
)

REM Видаляємо тимчасовий файл
del "%TEMP%\AIAssistant_Task.xml" >nul 2>&1

pause
