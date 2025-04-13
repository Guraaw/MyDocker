@echo off
REM Save as C:\MyDocker\run-deploy.bat
echo Deploying contracts...
docker exec -it defi-guralu bash -c "cd workspace && npx hardhat run --network localhost scripts/deploy.js"
echo Completed!
pause