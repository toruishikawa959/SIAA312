# DEV MODE Installation Script
# This script will set up the complete DEV mode for the bookstore system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Bookstore Dev Mode Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Check if we're in the right directory
if (-not (Test-Path "$projectRoot\package.json")) {
    Write-Host "ERROR: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Project root detected: $projectRoot" -ForegroundColor Green
Write-Host ""

# 1. Copy dev pages
Write-Host "[1/4] Copying dev pages..." -ForegroundColor Yellow

$devPages = @(
    "app\dev\users\page.tsx",
    "app\dev\database\page.tsx",
    "app\dev\data-generator\page.tsx",
    "app\dev\current-year\page.tsx",
    "app\dev\coupons\page.tsx"
)

foreach ($page in $devPages) {
    $source = Join-Path $projectRoot "dev-install\$page"
    $dest = Join-Path $projectRoot $page
    
    if (Test-Path $source) {
        $destDir = Split-Path $dest -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $source $dest -Force
        Write-Host "  ✓ Copied $page" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Source not found: $page" -ForegroundColor Yellow
    }
}

Write-Host ""

# 2. Copy API routes
Write-Host "[2/4] Copying API routes..." -ForegroundColor Yellow

$apiRoutes = @(
    "app\api\dev\users\route.ts",
    "app\api\dev\users\reset-password\route.ts",
    "app\api\dev\database\stats\route.ts",
    "app\api\dev\database\clear\route.ts",
    "app\api\dev\database\export\route.ts",
    "app\api\dev\database\import\route.ts",
    "app\api\dev\data-generator\generate\route.ts",
    "app\api\dev\data-generator\current-year\route.ts",
    "app\api\dev\coupons\generate\route.ts"
)

foreach ($route in $apiRoutes) {
    $source = Join-Path $projectRoot "dev-install\$route"
    $dest = Join-Path $projectRoot $route
    
    if (Test-Path $source) {
        $destDir = Split-Path $dest -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $source $dest -Force
        Write-Host "  ✓ Copied $route" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Source not found: $route" -ForegroundColor Yellow
    }
}

Write-Host ""

# 3. Copy components
Write-Host "[3/4] Copying components..." -ForegroundColor Yellow

$components = @(
    "components\dev-navigation.tsx",
    "components\ui\label.tsx"
)

foreach ($component in $components) {
    $source = Join-Path $projectRoot "dev-install\$component"
    $dest = Join-Path $projectRoot $component
    
    if (Test-Path $source) {
        $destDir = Split-Path $dest -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $source $dest -Force
        Write-Host "  ✓ Copied $component" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Source not found: $component" -ForegroundColor Yellow
    }
}

Write-Host ""

# 4. Install dependencies (if needed)
Write-Host "[4/4] Checking dependencies..." -ForegroundColor Yellow

$requiredPackages = @(
    "@radix-ui/react-label",
    "class-variance-authority"
)

$needInstall = $false
foreach ($package in $requiredPackages) {
    $pattern = "*$package*"
    if (-not (Test-Path "node_modules\.pnpm\$pattern")) {
        Write-Host "  ⚠ Missing package: $package" -ForegroundColor Yellow
        $needInstall = $true
    } else {
        Write-Host "  ✓ Package exists: $package" -ForegroundColor Green
    }
}

if ($needInstall) {
    Write-Host ""
    Write-Host "Installing missing dependencies..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✓ All dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dev Mode Pages Available:" -ForegroundColor Yellow
Write-Host "  • http://localhost:3000/dev/users" -ForegroundColor White
Write-Host "  • http://localhost:3000/dev/database" -ForegroundColor White
Write-Host "  • http://localhost:3000/dev/data-generator" -ForegroundColor White
Write-Host "  • http://localhost:3000/dev/current-year" -ForegroundColor White
Write-Host "  • http://localhost:3000/dev/coupons" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart your dev server: npm run dev" -ForegroundColor White
Write-Host "  2. Visit any dev page above" -ForegroundColor White
Write-Host ""
