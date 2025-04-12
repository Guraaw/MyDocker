FROM ubuntu:latest

WORKDIR /usr/app

# 安装基本依赖
RUN apt-get update \
&& apt-get -y install curl \
&& apt-get install -y build-essential \
&& apt-get install -y python3 \
&& curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
&& apt-get install -y nodejs

# 设置工作目录
WORKDIR /usr/app

# 端口暴露
EXPOSE 3000 8545

# 保持容器运行
CMD ["tail", "-f", "/dev/null"]