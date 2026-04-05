@echo off
title Neon Surge Game
echo.
echo  ========================================
echo      NEON SURGE - Starting Game...
echo  ========================================
echo.
cd /d "%~dp0"
start "" http://localhost:3000
npm start
pause
