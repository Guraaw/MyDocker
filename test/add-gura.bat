@echo off
echo Adding GURA tokens to your account...
docker exec -it defi-guralu bash -c "cd workspace && npx hardhat run scripts/transferGura.js --network localhost"
echo Done!
pause