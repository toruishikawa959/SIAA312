@echo off
SETLOCAL EnableDelayedExpansion

:: --- FIX FOR GARBLED TEXT ---
chcp 65001 >nul
:: --- END OF FIX ---

:: --- CREATE LOG FILE ---
set "LOG_FILE=server_log.txt"
echo Starting server at %date% %time% > %LOG_FILE%
echo --- >> %LOG_FILE%

:: ========================================
:: CLEAN ALL CACHES FOR FRESH START
:: ========================================
echo.
echo ========================================
echo   CLEANING CACHES FOR FRESH START
echo ========================================
echo.

:: 1. Clean Next.js cache
echo [1/5] Cleaning Next.js cache...
echo Cleaning Next.js cache... >> "%LOG_FILE%" 2>&1
if exist ".next" (
    echo   - Removing .next folder...
    rmdir /s /q ".next" >nul 2>&1
    if exist ".next" (
        echo   - Warning: Could not fully remove .next folder (files may be in use)
    ) else (
        echo   - Removed .next folder
    )
) else (
    echo   - .next folder not found (already clean)
)

:: 2. Clean node_modules cache
echo [2/5] Cleaning node_modules/.cache...
echo Cleaning node_modules/.cache... >> "%LOG_FILE%" 2>&1
if exist "node_modules\.cache" (
    echo   - Removing node_modules/.cache...
    rmdir /s /q "node_modules\.cache" >nul 2>&1
    if exist "node_modules\.cache" (
        echo   - Warning: Could not fully remove cache (files may be in use)
    ) else (
        echo   - Removed node_modules/.cache
    )
) else (
    echo   - node_modules/.cache not found
)

:: 3. Clean out directory (if exists)
echo [3/5] Cleaning out directory...
echo Cleaning out directory... >> "%LOG_FILE%" 2>&1
if exist "out" (
    echo   - Removing out folder...
    rmdir /s /q "out" >nul 2>&1
    if exist "out" (
        echo   - Warning: Could not fully remove out folder (files may be in use)
    ) else (
        echo   - Removed out folder
    )
) else (
    echo   - out folder not found
)

:: 4. Clean temp/build artifacts
echo [4/5] Cleaning temp files...
echo Cleaning temp files... >> "%LOG_FILE%" 2>&1
if exist ".turbo" (
    rmdir /s /q ".turbo" >nul 2>&1
    if not exist ".turbo" (
        echo   - Removed .turbo folder
    )
)
if exist "tsconfig.tsbuildinfo" (
    del /q "tsconfig.tsbuildinfo" >nul 2>&1
    if not exist "tsconfig.tsbuildinfo" (
        echo   - Removed tsconfig.tsbuildinfo
    )
)

:: 5. Clean package manager caches (skipped for safety)
echo [5/5] Skipping package manager cache cleaning...
echo Skipping package manager cache cleaning for stability >> "%LOG_FILE%" 2>&1
echo   - Package manager caches preserved (for faster installs)

echo.
echo ========================================
echo   CACHE CLEANING COMPLETE!
echo ========================================
echo.
timeout /t 1 /nobreak >nul

:: ========================================
:: START DEVELOPMENT SERVER
:: ========================================

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
