@echo off
REM Save as C:\MyDocker\run-all.bat
echo Starting all services...

start cmd /k "cd C:\MyDocker && title Hardhat Node && call build\run-node.bat"
timeout /t 5
start cmd /k "cd C:\MyDocker && title Deploy Contracts && call build\run-deploy.bat" 
timeout /t 5
start cmd /k "cd C:\MyDocker && title Frontend && call build\run-frontend.bat"

echo All services started!
pause