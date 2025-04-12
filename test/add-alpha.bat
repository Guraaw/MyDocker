@echo off
REM Save as C:\MyDocker\add-alpha.bat
echo Deploying contracts...
docker exec -it defi-swap bash -c "cd workspace && npx hardhat run scripts/transferALPHA.js --network localhost"
pause