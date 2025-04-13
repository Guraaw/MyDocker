@echo off
REM Save as C:\MyDocker\add-beta.bat
echo Adding BETA tokens to your account...
docker exec -it defi-guralu bash -c "cd workspace && npx hardhat run scripts/transferBETA.js --network localhost"
echo Done!
pause