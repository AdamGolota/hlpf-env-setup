## Student
- Name: Голота Адам Іванович
- Group: 232/1

## Практичне заняття №6 — Interceptors + Exception Filters + Swagger

### Структура репозиторію
```
.
├── src/
│   ├── auth/ ...
│   ├── users/ ...
│   ├── categories/ ...
│   ├── products/ ...
│   ├── common/
│   │   ├── enums/
│   │   │   └── role.enum.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── pipes/
│   │   	└── trim.pipe.ts
│   ├── migrations/
│   ├── main.ts
│   └── app.module.ts
├── swagger-screenshot.png
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Запуск проекту
```bash
cp .env.example .env
docker compose up --build
```

### Swagger UI
http://localhost:3000/api/docs

![Swagger](swagger-screenshot.png)

### Формат успішної відповіді
```json
{
  "data": { ... },
  "statusCode": 200,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Формат помилки
```json
{
  "error": {
	"code": 400,
	"message": "Validation failed",
	"details": ["name must be longer..."],
	"traceId": "a1b2c3..."
  },
  "timestamp": "2025-01-15T10:31:00.000Z"
}
```

### Приклад логів (LoggingInterceptor)
```text
docker compose logs --tail=5 app
app-1  | [Nest] 29  - 05/03/2026, 11:05:00 AM     LOG [RouterExplorer] Mapped {/api/products, POST} route +0ms
app-1  | [Nest] 29  - 05/03/2026, 11:05:00 AM     LOG [RouterExplorer] Mapped {/api/products/:id, PATCH} route +1ms
app-1  | [Nest] 29  - 05/03/2026, 11:05:00 AM     LOG [RouterExplorer] Mapped {/api/products/:id, DELETE} route +0ms
app-1  | [Nest] 29  - 05/03/2026, 11:05:00 AM     LOG [NestApplication] Nest application successfully started +1ms
app-1  | [Nest] 29  - 05/03/2026, 11:05:02 AM     LOG [HTTP] GET /api/products — 200 — 10ms
```

### Тест помилки з traceId
```text
[Nest] 29  - 05/03/2026, 11:45:02 AM   ERROR [Exception] [f602d959-2672-4df9-8ca2-443f9201b9c7] GET /api/products/999 — 404 — Product #999 not found
```
