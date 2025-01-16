#!/bin/bash

# Проверка наличия root прав
if [ "$EUID" -ne 0 ]; then 
    echo "Пожалуйста, запустите скрипт с правами root (sudo)"
    exit 1
fi

# Установка WireGuard
apt-get update
apt-get install -y wireguard iproute2

# Включение IP-форвардинга напрямую
echo 1 > /proc/sys/net/ipv4/ip_forward

# Создание директории для WireGuard
mkdir -p /etc/wireguard
cd /etc/wireguard

# Генерация ключей
wg genkey | tee privatekey | wg pubkey > publickey
chmod 600 privatekey

# Создание конфигурации сервера
cat > /etc/wireguard/wg0.conf << EOF
[Interface]
PrivateKey = $(cat privatekey)
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Здесь будут добавляться конфигурации клиентов
EOF

chmod 600 /etc/wireguard/wg0.conf

# Запуск WireGuard
ip link add dev wg0 type wireguard
ip addr add 10.0.0.1/24 dev wg0
wg setconf wg0 /etc/wireguard/wg0.conf
ip link set up dev wg0

echo "WireGuard успешно установлен и настроен"
echo "Публичный ключ сервера:"
cat publickey 