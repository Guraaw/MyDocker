@echo off
REM Save as C:\MyDocker\add-alpha.bat
echo Adding ALPHA tokens to your account...
docker exec -it defi-guralu bash -c "cd workspace && npx hardhat run scripts/transferALPHA.js --network localhost"
echo Done!
pause