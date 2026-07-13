# Deployment

Проект запускается на Ubuntu 24.04 через Docker Compose.

Текущая схема:

- `caddy`: внешний reverse proxy, порты `80` и `443`, автоматический HTTPS.
- `web`: nginx + собранный React frontend, доступен только внутри Docker-сети.
- `lead-gateway`: backend для `POST /api/lead`.
- `vpn-proxy`: headless Xray SOCKS5 proxy для Telegram Bot API.

## 1. DNS

У регистратора домена создай DNS-записи:

```text
A  @    135.106.139.122
A  www  135.106.139.122
```

Проверить, куда резолвится домен:

```bash
getent ahostsv4 elm-web.ru
getent ahostsv4 www.elm-web.ru
```

Оба имени должны показывать `135.106.139.122`. DNS может обновляться от нескольких минут до нескольких часов.

## 2. Сервер

Подключиться:

```bash
ssh root@135.106.139.122
```

Перейти в проект:

```bash
cd /opt/business_card_for_the_provision_of_digital_services
```

Если Docker уже установлен и старая версия сайта работает, повторно устанавливать Docker не нужно. Достаточно проверить:

```bash
docker --version
docker compose version
```

Открыть HTTP и HTTPS:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

## 3. Первая установка Docker на чистом сервере

Этот раздел нужен только если Docker еще не установлен.

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl git ufw

apt remove -y docker.io docker-compose docker-compose-v2 docker-doc podman-docker containerd runc || true

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
```

## 4. `.env`

Серверный `.env` хранится только на сервере и не коммитится в GitHub.

Если файла еще нет:

```bash
cat > .env <<'EOF'
TELEGRAM_CHAT_ID=PASTE_TELEGRAM_CHAT_ID_HERE
TELEGRAM_BOT_TOKEN=PASTE_TELEGRAM_BOT_TOKEN_HERE
VPN_SUBSCRIPTION_URL=PASTE_VPN_SUBSCRIPTION_URL_HERE

VPN_PROFILE_MATCH=
CORS_ORIGINS=
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX=5
MIN_FORM_TIME_MS=1500
MAX_FORM_AGE_MS=86400000
TELEGRAM_TIMEOUT_MS=15000
EOF

chmod 600 .env
```

Если `.env` уже был создан раньше, просто проверь:

```bash
ls -la .env
```

## 5. Запуск HTTPS-версии

Стянуть свежие изменения:

```bash
git pull origin main
```

Проверить итоговый Docker Compose:

```bash
docker compose config
```

Пересобрать и запустить:

```bash
docker compose up -d --build
docker compose ps
```

Ожидаемые сервисы:

```text
caddy
web
lead-gateway
vpn-proxy
```

## 6. Проверка

Логи Caddy:

```bash
docker compose logs --tail=100 caddy
```

Логи backend:

```bash
docker compose logs --tail=100 lead-gateway
```

Логи VPN/proxy:

```bash
docker compose logs --tail=100 vpn-proxy
```

Проверить HTTP-редирект и HTTPS:

```bash
curl -I http://elm-web.ru
curl -I https://elm-web.ru
curl -I https://www.elm-web.ru
```

Проверить backend через HTTPS:

```bash
curl https://elm-web.ru/api/health
```

Ожидаемый ответ:

```json
{"ok":true}
```

Тестовая отправка заявки:

```bash
STARTED_AT=$(($(date +%s%3N)-3000))

curl -X POST https://elm-web.ru/api/lead \
  -H "Content-Type: application/json" \
  -d "{
    \"source\": \"curl-https-test\",
    \"name\": \"Тест HTTPS\",
    \"phone\": \"+7 (999) 123-45-67\",
    \"email\": \"\",
    \"telegram\": \"\",
    \"message\": \"Проверка заявки через HTTPS\",
    \"page\": \"https://elm-web.ru\",
    \"utm\": {},
    \"honeypot\": \"\",
    \"formStartedAt\": ${STARTED_AT}
  }"
```

Ожидаемый ответ:

```json
{"ok":true,"accepted":true}
```

## 7. Обычное обновление после git push

```bash
ssh root@135.106.139.122
cd /opt/business_card_for_the_provision_of_digital_services
git pull origin main
docker compose config
docker compose up -d --build
docker compose ps
```

## 8. Если сертификат не выпустился

1. Проверь DNS:

```bash
getent ahostsv4 elm-web.ru
getent ahostsv4 www.elm-web.ru
```

2. Проверь, что сервер доступен по 80 и 443:

```bash
ufw status
docker compose ps
```

3. Посмотри логи Caddy:

```bash
docker compose logs -f --tail=200 caddy
```

4. Проверь, что наружу порты публикует только `caddy`, а не старый `web`:

```bash
docker compose ps
```

5. Если DNS только что изменили, подожди 10-30 минут и перезапусти Caddy:

```bash
docker compose restart caddy
```

6. Если была слишком частая серия неудачных попыток выпуска сертификата, Let’s Encrypt может временно ограничить повторные попытки. В этом случае исправь DNS/порты и подожди перед следующим рестартом.

## 9. Безопасность

- Не коммить `.env`, Telegram token и VPN subscription URL.
- Перед продакшеном лучше перевыпустить Telegram bot token через BotFather, если он где-то светился.
- `vpn-proxy` не публикуется наружу и используется только внутри Docker-сети.
- `lead-gateway` не публикуется наружу напрямую; внешний вход идет через Caddy -> nginx -> `/api/lead`.
- Rate limit уже включен через `RATE_LIMIT_MAX`.
- Для нескольких сайтов добавь домены в `CORS_ORIGINS` через запятую, если они будут отправлять заявки на этот же backend с другого origin.
