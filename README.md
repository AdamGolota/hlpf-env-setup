## Student
- Name: Голота Адам Іванович
- Group: 232/1

## Практичне заняття №5 — JWT Authentication + Guards + RBAC

### Структура репозиторію
```
.
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── auth.controller.ts
│   ├── users/
│   │   ├── user.entity.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── common/
│   │   ├── enums/
│   │   │   └── role.enum.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   └── pipes/
│   │   	└── trim.pipe.ts
│   ├── categories/ ...
│   ├── products/ ...
│   ├── migrations/
│   ├── data-source.ts
│   ├── main.ts
│   └── app.module.ts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Запуск проекту
```bash
cp .env.example .env
docker compose up --build
```

### API Endpoints
| Method | URL | Auth | Role |
|--------|-----|------|------|
| POST | /auth/register | - | - |
| POST | /auth/login | - | - |
| GET | /api/categories | - | - |
| POST | /api/categories | JWT | admin |
| GET | /api/products | - | - |
| POST | /api/products | JWT | admin |
| PATCH | /api/products/:id | JWT | admin |
| DELETE | /api/products/:id | JWT | admin |

### Тест реєстрації
```text
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password123", "name": "Admin"}'

{"id":1,"email":"admin@test.com","name":"Admin","role":"user","createdAt":"2026-05-03T08:15:20.705Z"}%  
```

### Тест логіну
```text
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password123"}'

{"accessToken":"<я сам токен не вставлятиму>"}%     
```

### Тест 401 — запит без токена
```text
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Hacked Product", "price": 1}'

{"message":"Missing authorization token","error":"Unauthorized","statusCode":401}%
```

### Тест 403 — запит з роллю user
```text
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \                    
  -d '{"name": "Blocked Product", "price": 99}'              

{"message":"Insufficient permissions","error":"Forbidden","statusCode":403}%
```

### Тест успішного створення від admin
```text
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \      
  -d '{"name": "Blocked Product", "price": 99}'

{"id":4,"name":"Blocked Product","description":null,"price":99,"stock":0,"isActive":true,"createdAt":"2026-05-03T10:37:59.391Z","updatedAt":"2026-05-03T10:37:59.391Z"}%
```