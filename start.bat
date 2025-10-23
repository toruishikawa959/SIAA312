@echo off

:: --- FIX FOR GARBLED TEXT ---
chcp 65001 >nul
:: --- END OF FIX ---

:: 1. Check if Node.js is installed
:: --- THIS IS THE CORRECTED LINE ---
node -v >nul 2>&1
:: --- END OF CORRECTION ---

if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install it and try again.
    pause
    exit /b
)
echo Node.js is installed.

:: 2. Start the development server
echo Starting the development server...
echo ---
echo Your server will start below.
echo To stop the server, press CTRL+C in this window.
echo ---

pnpm dev

echo ---
echo Server has been stopped.
pause