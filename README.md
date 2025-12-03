# Monitoring API & UI

Минималистичный мониторинг-сервис: HTTP-API на Go + Gin с эндпоинтами `/health`, `/ready`, `/metrics` и фронтендом на React + Vite, который отображает состояние сервиса и метрики в простом и наглядном дашборде.

## Возможности

- `/health` — текущее состояние приложения, версия и аптайм.
- `/ready` — состояние готовности (readiness-probe).
- `/metrics` — количество горутин, использование памяти (MB) и число логических CPU.
- Web-UI — дашборд, который:

  - регулярно опрашивает API,
  - показывает статус сервиса,
  - отображает версию, аптайм и метрики в реальном времени.

## Стек

- **Backend**: Go 1.24, Gin 1.11 — один статический бинарник, без зависимостей в рантайме.
- **Frontend**: React 19 + Vite 7, без UI-фреймворков.
- **Node.js**: используется только для сборки фронтенда (Node 22.x).
- **Docker**:

  - Backend: multi-stage build → runtime минимальный distroless-образ.
  - Frontend: сборка на `node:22-alpine`, статика раздаётся через `nginx:1.27-alpine`.

## Как это работает

Go-приложение поднимает HTTP-сервер с тремя маршрутами и считает аптайм с момента запуска.
Фронтенд запрашивает API, подсвечивает статусы и отображает данные на дашборде.
В режиме разработки Vite проксирует `/health`, `/ready`, `/metrics` на `http://localhost:8080`.

## Структура проекта

```
monitoring-api/
├── backend/
│   ├── main.go
│   ├── handlers_test.go
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── App.test.jsx
│   │   ├── main.jsx
│   │   └── setupTests.js
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .gitignore
│   └── .dockerignore
├── .gitignore
└── README.md
```

---

# Запуск без Docker

## Требования

- Go ≥ 1.24
- Node.js ≥ 22
- npm

---

## Backend

Перейти в директорию:

```bash
cd backend
```

Запуск (порт по умолчанию — 8080):

```bash
go run .
```

Запуск на другом порту:

```bash
PORT=9090 go run .
```

Сервер корректно завершает работу при SIGINT/SIGTERM.

---

## Frontend (Vite dev server)

Перейти в директорию:

```bash
cd frontend
```

Установка зависимостей:

```bash
npm ci
```

Запуск dev-сервера (5173 по умолчанию):

```bash
npm run dev
```

Выбор порта:

```bash
npm run dev -- --port 8081
```

Vite автоматически проксирует запросы к API на порт 8080.

---

# Запуск через Docker

## Backend (Go + Gin)

Перейти в директорию:

```bash
cd backend
```

Сборка образа:

```bash
docker build -t monitoring-api .
```

Запуск:

```bash
docker run --rm -p 8080:8080 monitoring-api
```

Запуск на другом порту:

```bash
docker run --rm -e PORT=9090 -p 9090:9090 monitoring-api
```

---

## Frontend (React + Vite + Nginx)

Перейти в директорию:

```bash
cd frontend
```

Сборка образа:

```bash
docker build -t monitoring-ui .
```

Запуск (UI доступен на [http://localhost:8081](http://localhost:8081)):

```bash
docker run --rm -p 8081:80 monitoring-ui
```

---

# Тесты

## Backend

```bash
cd backend
```

Запуск тестов:

```bash
go test ./...
```

Покрытие:

```bash
go test ./... -cover
```

Проверяются корректность HTTP-ответов и поведение `getEnv`.

---

## Frontend

```bash
cd frontend
```

Unit-тесты:

```bash
npm test
```

Watch-режим:

```bash
npm run test:watch
```

Линтер:

```bash
npm run lint
```

---

# Переменные окружения

- `PORT` — порт HTTP-сервера (по умолчанию 8080).
