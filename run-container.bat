@echo off
echo === DeFi Swap 启动助手 ===

echo 1. 构建容器（如果是首次运行）
docker-compose build

echo 2. 启动容器
docker-compose up -d

echo 3. 安装依赖
docker exec -it defi-swap bash -c "chmod +x /usr/app/setup.sh && /usr/app/setup.sh"

echo 4. 启动服务
call run-all.bat

echo === 完成！===
echo 前端界面: http://localhost:3000
echo Hardhat节点: http://localhost:8545 