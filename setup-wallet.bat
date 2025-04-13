@echo off
echo === Wallet Setup ===

set /p WALLET_ADDRESS="Enter your wallet address (0x...): "

echo.
echo Updating transfer scripts with your wallet address: %WALLET_ADDRESS%
echo.

REM Create temporary directory for modified scripts
if not exist temp mkdir temp

REM Update ALPHA transfer script
powershell -Command "(Get-Content workspace\scripts\transferALPHA.js) -replace '0x5Ab1eC604B1A8cff4e50d339863006989d375185', '%WALLET_ADDRESS%' | Set-Content temp\transferALPHA.js"

REM Update BETA transfer script
powershell -Command "(Get-Content workspace\scripts\transferBETA.js) -replace '0x5Ab1eC604B1A8cff4e50d339863006989d375185', '%WALLET_ADDRESS%' | Set-Content temp\transferBETA.js"

REM Update GURA transfer script
powershell -Command "(Get-Content workspace\scripts\transferGura.js) -replace '0x5Ab1eC604B1A8cff4e50d339863006989d375185', '%WALLET_ADDRESS%' | Set-Content temp\transferGura.js"

REM Copy modified scripts back to workspace
copy /Y temp\transferALPHA.js workspace\scripts\transferALPHA.js
copy /Y temp\transferBETA.js workspace\scripts\transferBETA.js
copy /Y temp\transferGura.js workspace\scripts\transferGura.js

echo Wallet address updated successfully.
echo You can now run run-container.bat to deploy the application.

pause 