# Go Monitoring API

Минималистичный HTTP‑сервис на Go + Gin с эндпоинтами для проверки состояния, готовности и простых метрик, поддерживающий корректное завершение и конфигурацию порта через переменную PORT.

## Эндпоинты

- /health — состояние приложения, версия и аптайм
  - Браузер: http://localhost:8080/health
  - curl: `curl -s http://localhost:8080/health | jq .`
- /ready — готовность (readiness)
  - Браузер: http://localhost:8080/ready
  - curl: `curl -s http://localhost:8080/ready | jq .`
- /metrics — количество горутин, использование памяти и число CPU
  - Браузер: http://localhost:8080/metrics
  - curl: `curl -s http://localhost:8080/metrics | jq .`

Пример ответов:

```
GET /health
  {
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 21
  }
```

```
GET /ready
  {
  "status": "ready"
  }
```

```
GET /metrics
  {
  "goroutines": 6,
  "memory_usage_mb": 10,
  "cpu_cores": 12
  }
```

## Запуск локально

```
go run main.go
```

По умолчанию сервер слушает порт 8080, изменить можно так:

```
PORT=9090 go run main.go
```

И тогда маршруты будут по http://localhost:9090/health, /ready, /metrics.

## Тесты и покрытие

Запуск юнит‑тестов:

```
go test ./...
```

Просмотр суммарного покрытия:

```
go test ./... -cover
```

Тесты находятся в `handlers_test.go`. Они проверяют:
- корректный HTTP‑статус и JSON‑ответ для `/health`, `/ready`, `/metrics`
- работу функции `getEnv` с установленной и не установленной переменной окружения.

## Запуск в Docker

Сборка образа:

```
docker build -t monitoring-api .
```

Запуск с публикацией порта по умолчанию:

```
docker run --rm -p 8080:8080 monitoring-api
```

Смена порта:

```
docker run --rm -e PORT=9090 -p 9090:9090 monitoring-api
```

## Переменные окружения

- PORT — порт HTTP‑сервера, по умолчанию 8080

## Корректное завершение

Приложение обрабатывает SIGINT и SIGTERM и завершает работу корректно, дожидаясь активных запросов.
