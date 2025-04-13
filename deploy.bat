@echo off
echo === DeFi Swap Deployment Helper ===
echo.
echo This script will guide you through the deployment process.
echo.

echo Step 1: Setup your wallet
echo This will update transfer scripts with your wallet address.
echo.
call setup-wallet.bat

echo.
echo Step 2: Deploy the application
echo This will build the Docker container and deploy the application.
echo.
call run-container.bat

echo.
echo === Deployment Complete! ===
echo.
echo You can now interact with the application at:
echo Frontend: http://localhost:3000
echo Hardhat node: http://localhost:8545
echo.
pause 