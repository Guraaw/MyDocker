@echo off
REM Save as C:\MyDocker\add-beta.bat
echo Deploying contracts...
docker exec -it defi-swap bash -c "cd workspace && npx hardhat run scripts/transferBETA.js --network localhost"
pause