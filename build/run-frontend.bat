@echo off
REM Ref path
echo Starting frontend...
docker exec -it defi-guralu bash -c "cd workspace/frontend && npm run dev"
echo Frontend started!
pause