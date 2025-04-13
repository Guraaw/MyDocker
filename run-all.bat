@echo off
REM Ref path
echo Starting all services...

start cmd /k "title Hardhat Node && call build\run-node.bat"
timeout /t 5
start cmd /k "title Deploy Contracts && call build\run-deploy.bat" 
timeout /t 5
start cmd /k "title Frontend && call build\run-frontend.bat"

echo All services started!
pause