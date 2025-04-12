@echo off
REM Save as C:\MyDocker\alpha-gura.bat
echo Deploying contracts...
docker exec -it defi-swap bash -c "cd workspace && npx hardhat run scripts/transferGura.js --network localhost"
pause