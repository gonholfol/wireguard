#!/bin/bash

# Проверка root прав
if [ "$EUID" -ne 0 ]; then 
    echo "Пожалуйста, запустите скрипт с правами root (sudo)"
    exit 1
fi

# Установка Node.js и npm
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Установка pnpm
npm install -g pnpm

# Создание директории для приложения
mkdir -p /opt/wireguard-web-ui
cp -r . /opt/wireguard-web-ui/

# Установка зависимостей
cd /opt/wireguard-web-ui
pnpm install

# Установка и настройка WireGuard
bash ./wireguard/setup.sh

# Копирование systemd сервиса
cp wireguard-web.service /etc/systemd/system/

# Перезагрузка systemd и включение сервиса
systemctl daemon-reload
systemctl enable wireguard-web
systemctl start wireguard-web

# Настройка файрвола
ufw allow 3001/tcp
ufw allow 51820/udp

echo "Установка завершена!"
echo "Бэкенд доступен по адресу: http://$(curl -s ifconfig.me):3001"
echo "Не забудьте добавить этот адрес в настройки GitHub Pages (VITE_API_URL)" 