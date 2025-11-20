@echo off
SETLOCAL EnableDelayedExpansion

:: --- FIX FOR GARBLED TEXT ---
chcp 65001 >nul
:: --- END OF FIX ---

:: --- CREATE LOG FILE ---
set "LOG_FILE=server_log.txt"
echo Starting server at %date% %time% > %LOG_FILE%
echo --- >> %LOG_FILE%

:: 1. Check if Node.js is installed
echo Checking for Node.js...
node -v >> %LOG_FILE% 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. >> %LOG_FILE%
    echo Node.js is not installed. Please install it and try again.
    echo Check server_log.txt for details.
    pause
    exit /b
)
echo Node.js is installed.
echo Node.js found. >> %LOG_FILE%

:: 2. Check which package manager is available
echo Checking for package managers...
echo Checking for package managers... >> %LOG_FILE%

:: Check for pnpm first
where pnpm >nul 2>&1
if !errorlevel! equ 0 (
    echo pnpm is installed. Using pnpm...
    echo Using pnpm >> %LOG_FILE%
    echo.
    echo Starting the development server with pnpm...
    echo Running: pnpm dev >> %LOG_FILE%
    echo ---
    echo Your server will start below.
    echo To stop the server, press CTRL+C in this window.
    echo ---
    echo.
    pnpm dev
    goto :end
)

:: Check for npm
where npm >nul 2>&1
if !errorlevel! equ 0 (
    echo pnpm not found. Using npm...
    echo Using npm >> %LOG_FILE%
    echo.
    echo Starting the development server with npm...
    echo Running: npm run dev >> %LOG_FILE%
    echo ---
    echo Your server will start below.
    echo To stop the server, press CTRL+C in this window.
    echo ---
    echo.
    npm run dev
    goto :end
)

:: Neither found
echo [ERROR] Neither pnpm nor npm is installed. >> %LOG_FILE%
echo.
echo ========================================
echo ERROR: No package manager found!
echo ========================================
echo.
echo Please run 'install_all.bat' to install pnpm.
echo Or make sure npm is installed with Node.js.
echo.
echo Check server_log.txt for details.
echo ========================================
pause
exit /b

:end
echo ---
echo Server has been stopped.
echo Server stopped at %date% %time% >> %LOG_FILE%
echo Check server_log.txt if there were any errors.
pause
