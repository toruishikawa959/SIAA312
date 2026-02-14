@echo off
setlocal

:: --- FIX FOR GARBLED TEXT ---
chcp 65001 >nul
:: --- END OF FIX ---

:: --- Log File Setup ---
set "LOG_FILE=installation_log.txt"
:: Clear old log file
echo Starting installation process... > %LOG_FILE%
echo --- >> %LOG_FILE%

:: --- 1. Check for Node.js ---
echo Checking for Node.js...
node -v >> %LOG_FILE% 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. >> %LOG_FILE%
    echo.
    echo --- NODE.JS IS NOT INSTALLED ---
    echo.
    echo Opening the official Node.js download page in your browser...
    echo Please install the "LTS" version. 
    echo.
    start https://nodejs.org/en/download/
    echo ---
    echo After you finish installing Node.js, please CLOSE this window
    echo and run this 'install_all.bat' script again.
    echo ---
    pause
    exit /b
)
echo Node.js is installed. >> %LOG_FILE%
echo Node.js is installed.

:: --- 2. Check for npm ---
echo Checking for npm...
npm -v >> %LOG_FILE% 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not found. Re-installing Node.js might be needed. >> %LOG_FILE%
    echo npm is not found. Please ensure Node.js is installed correctly.
    pause
    exit /b
)
echo npm is installed. >> %LOG_FILE%
echo npm is available.

:: --- 3. Install pnpm globally ---
echo Checking for pnpm...
pnpm -v >> %LOG_FILE% 2>&1
if %errorlevel% neq 0 (
    echo pnpm is not installed. Installing pnpm globally...
    echo [INFO] pnpm not found. Installing globally... >> %LOG_FILE%
    npm install -g pnpm >> %LOG_FILE% 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install pnpm. Check log for details. >> %LOG_FILE%
        echo FAILED to install pnpm. Please check installation_log.txt.
        pause
        exit /b
    )
    echo [INFO] pnpm installed successfully. >> %LOG_FILE%
)
echo pnpm is installed. >> %LOG_FILE%
echo pnpm is installed.

:: --- 4. Install project dependencies ---
echo Installing project dependencies (this may take a moment)...
echo [INFO] Running pnpm install... >> %LOG_FILE%
pnpm install >> %LOG_FILE% 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 'pnpm install' failed. Check log for details. >> %LOG_FILE%
    echo 'pnpm install' FAILED. Please check installation_log.txt.
    pause
    exit /b
)
echo [INFO] 'pnpm install' completed successfully. >> %LOG_FILE%

:: --- PAUSE ---
echo ---
echo 'pnpm install' step is finished. Press any key to continue...
pause
:: --- END PAUSE ---

echo ---
echo ALL INSTALLATIONS COMPLETE.
echo ---
echo You can now run your 'start.bat' file.
echo Check 'installation_log.txt' for full details.
pause