# WireGuard Web UI

Веб-интерфейс для управления WireGuard VPN. Позволяет легко генерировать конфигурации для клиентов.

## Установка бэкенда на сервер

1. Подключитесь к вашему серверу по SSH

2. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/wireguard-web-ui.git
cd wireguard-web-ui
```

3. Сделайте скрипт установки исполняемым:
```bash
chmod +x install-backend.sh
```

4. Запустите установку:
```bash
sudo ./install-backend.sh
```

Скрипт автоматически:
- Установит Node.js и pnpm
- Настроит WireGuard
- Создаст и запустит systemd сервис
- Настроит файрвол
- Выведет URL для доступа к API

## Установка фронтенда на GitHub Pages

1. Форкните репозиторий на GitHub

2. В настройках репозитория:
   - Перейдите в Settings -> Pages
   - В разделе "Build and deployment" выберите "GitHub Actions"

3. Добавьте секрет VITE_API_URL в настройках репозитория:
   - Перейдите в Settings -> Secrets and variables -> Actions
   - Нажмите "New repository secret"
   - Имя: VITE_API_URL
   - Значение: http://your-server-ip:3001 (URL, который вывел скрипт установки)

GitHub Actions автоматически соберет и задеплоит приложение.

## Управление бэкендом

Просмотр статуса:
```bash
sudo systemctl status wireguard-web
```

Перезапуск:
```bash
sudo systemctl restart wireguard-web
```

Просмотр логов:
```bash
sudo journalctl -u wireguard-web -f
```

## Использование

1. Откройте веб-интерфейс по адресу:
   https://your-username.github.io/wireguard-web-ui/

2. Введите имя устройства (например, "iPhone" или "Laptop")

3. Нажмите "Скачать конфигурацию"

4. Импортируйте скачанный файл .conf в клиент WireGuard

## Безопасность

- Веб-интерфейс доступен через GitHub Pages по HTTPS
- API-сервер защищен файрволом (открыты только порты 3001/tcp и 51820/udp)
- Все конфигурации хранятся на сервере в /etc/wireguard
- Для дополнительной безопасности рекомендуется:
  - Настроить SSL для API (через Nginx)
  - Добавить базовую аутентификацию
  - Ограничить доступ к API по IP
