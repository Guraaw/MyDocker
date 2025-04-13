@echo off
echo Running Hardhat script...
docker exec -it defi-guralu bash -c "cd workspace/scripts && npx hardhat run hardhat-script.js --network localhost"
echo Done! 
pause