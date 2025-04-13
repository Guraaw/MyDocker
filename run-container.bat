@echo off
echo === Test Deployment ===

echo 1. Building container (for first run)
docker-compose build

echo 2. Starting container
docker-compose up -d

echo 3. Copying scripts to container
docker cp workspace/scripts/transferALPHA.js defi-guralu:/usr/app/workspace/scripts/
docker cp workspace/scripts/transferBETA.js defi-guralu:/usr/app/workspace/scripts/
docker cp workspace/scripts/transferGura.js defi-guralu:/usr/app/workspace/scripts/

echo 4. Installing dependencies
docker exec -it defi-guralu bash -c "chmod +x /usr/app/setup.sh && /usr/app/setup.sh"

echo 5. Starting services
call run-all.bat

echo === Complete! ===
pause