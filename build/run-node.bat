@echo off
REM Ref path
echo Starting Hardhat node...
docker exec -it defi-guralu bash -c "cd workspace && npx hardhat node"
echo Hardhat node started!
pause