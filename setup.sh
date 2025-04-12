#!/bin/bash

echo "===== 开始安装DeFi Swap依赖 ====="

# 后端依赖安装
echo "安装后端依赖..."
cd /usr/app/workspace
npm install

# 前端依赖安装
echo "安装前端依赖..."
cd /usr/app/workspace/frontend
npm install

echo "===== 所有依赖安装完成 =====" 