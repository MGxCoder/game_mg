@echo off
title Build Game
echo.
echo  ========================================
echo      Building for Production...
echo  ========================================
echo.
cd /d "%~dp0"
npm run build
echo.
echo  Build complete! Files are in the "build" folder.
echo.
pause
