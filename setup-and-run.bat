@echo off

:: Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Downloading and installing Node.js...
    start https://nodejs.org/en/download/
    echo Please install Node.js and rerun this script.
    pause
    exit /b
)

echo Node.js is installed.

:: Install pnpm globally
pnpm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo pnpm is not installed. Installing pnpm globally...
    npm install -g pnpm
)

echo pnpm is installed.

:: Install project dependencies
echo Installing project dependencies...
pnpm install

:: Start the development server
echo Starting the development server...
pnpm dev

pause