@echo off
echo Clearing Electron cache...
rd /s /q "%LOCALAPPDATA%\electron" 2>nul
echo Cache cleared!
pause
