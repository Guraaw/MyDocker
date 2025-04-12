@echo off
REM Save as C:\MyDocker\run-node.bat
echo Starting Hardhat node...
docker exec -it defi-swap bash -c "cd workspace && npx hardhat node"
pause