#!/bin/bash

echo "===== Installing Dependencies ====="

# Backend dependencies
echo "Installing backend dependencies..."
cd /usr/app/workspace
npm install

# Frontend dependencies
echo "Installing frontend dependencies..."
cd /usr/app/workspace/frontend
npm install

echo "===== All dependencies installed =====" 