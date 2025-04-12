@echo off
REM Save as C:\MyDocker\run-frontend.bat
echo Starting frontend...
docker exec -it defi-swap bash -c "cd workspace/frontend && npm run dev"
pause