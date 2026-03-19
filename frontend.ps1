# frontend.ps1
# Prints the current frontend architecture for Super Legit Advance.
# This replaces the old scaffold script, which no longer matched the real project layout.

$frontendPath = ".\frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "frontend directory not found at $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "Super Legit Advance frontend structure" -ForegroundColor Green
Write-Host ""

$topLevel = @(
    "package.json",
    "package-lock.json",
    "Dockerfile",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "jsconfig.json",
    "tsconfig.json",
    "eslint.config.js",
    "jest.config.js",
    "jest.setup.js",
    "babel.config.cjs",
    "index.html",
    ".env.example",
    "public",
    "src"
)

foreach ($item in $topLevel) {
    if (Test-Path (Join-Path $frontendPath $item)) {
        Write-Host "  $item" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "src/" -ForegroundColor Cyan

$srcGroups = @(
    "core",
    "features",
    "shared",
    "styles",
    "__tests__",
    "App.jsx",
    "main.jsx",
    "index.css"
)

foreach ($group in $srcGroups) {
    if (Test-Path (Join-Path $frontendPath "src\$group")) {
        Write-Host "  src/$group" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "feature modules:" -ForegroundColor Cyan

$featurePath = Join-Path $frontendPath "src\features"
Get-ChildItem $featurePath -Directory |
    Sort-Object Name |
    ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor White
    }

Write-Host ""
Write-Host "shared component groups:" -ForegroundColor Cyan

$sharedComponentPath = Join-Path $frontendPath "src\shared\components"
Get-ChildItem $sharedComponentPath -Directory |
    Sort-Object Name |
    ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor White
    }

Write-Host ""
Write-Host "notes:" -ForegroundColor Cyan
Write-Host "  - The frontend is feature-based: feature logic lives under src/features/<feature>." -ForegroundColor Gray
Write-Host "  - Cross-cutting app infrastructure lives under src/core." -ForegroundColor Gray
Write-Host "  - Shared UI primitives live under src/shared/components." -ForegroundColor Gray
