@echo off
REM Save as C:\MyDocker\run-deploy.bat
echo Deploying contracts...
docker exec -it defi-swap bash -c "cd workspace && npx hardhat run --network localhost scripts/deploy.js"
pause