# DeFi Swap 应用

这个仓库包含一个基于Docker的DeFi交换应用，包括前端和后端组件。

## 项目结构

```
.
├── Dockerfile              # Docker镜像配置
├── docker-compose.yml      # Docker Compose配置
├── setup.sh                # 依赖安装脚本
├── run-all.bat             # 启动所有服务的脚本
├── run-container.bat       # Windows用户启动助手
├── workspace/              # 应用代码目录
│   ├── package.json        # 后端依赖
│   ├── hardhat.config.js   # Hardhat配置
│   ├── scripts/            # 部署脚本
│   ├── contracts/          # 智能合约
│   └── frontend/           # 前端应用
│       └── package.json    # 前端依赖
```

## 前提条件

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)（推荐）

## 快速开始（Windows用户）

1. 克隆此仓库:
   ```
   git clone https://github.com/您的用户名/defi-swap.git
   cd defi-swap
   ```

2. 运行启动脚本:
   ```
   run-container.bat
   ```

## 手动部署步骤

### 1. 使用Docker Compose（推荐）

1. 克隆此仓库:
   ```
   git clone https://github.com/您的用户名/defi-swap.git
   cd defi-swap
   ```

2. 构建并启动容器:
   ```
   docker-compose up -d
   ```

3. 安装依赖:
   ```
   docker exec -it defi-swap bash -c "chmod +x /usr/app/setup.sh && /usr/app/setup.sh"
   ```

4. 启动应用:
   ```
   run-all.bat
   ```

### 2. 使用Docker指令

1. 构建Docker镜像:
   ```
   docker build -t defi-swap-image .
   ```

2. 运行容器:
   ```
   docker run --name=defi-swap -p 3000:3000 -p 8545:8545 -v $(pwd)/workspace:/usr/app/workspace -it defi-swap-image
   ```

3. 在另一个终端中，安装依赖:
   ```
   docker exec -it defi-swap bash -c "chmod +x /usr/app/setup.sh && /usr/app/setup.sh"
   ```

4. 启动应用:
   ```
   run-all.bat
   ```

## 访问应用

- 前端界面: http://localhost:3000
- Hardhat区块链节点: http://localhost:8545

## 故障排除

- 如果前端未启动，查看日志:
  ```
  docker logs defi-swap
  ```
- 访问容器shell:
  ```
  docker exec -it defi-swap bash
  ``` 