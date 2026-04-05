@echo off
title Deploy to GitHub Pages
echo.
echo  ========================================
echo      Deploying to GitHub Pages...
echo  ========================================
echo.
cd /d "%~dp0"
npm run deploy
echo.
echo  Deployment complete!
echo.
pause
