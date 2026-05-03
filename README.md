## Student
- Name: Голота Адам Іванович
- Group: 232/1
## Практичне заняття №7 — Redis + Pagination + Filtering

## MiniShop API — Фінальний проєкт

REST API інтернет-магазину на NestJS + PostgreSQL + Redis.

### Технології
- NestJS + TypeScript
- PostgreSQL + TypeORM (міграції, QueryBuilder)
- Redis (кешування з інвалідацією)
- JWT автентифікація + RBAC авторизація
- class-validator + class-transformer
- Swagger / OpenAPI

### Запуск
```bash
cp .env.example .env
docker compose up --build
docker compose run --rm app npm run seed
```

### Swagger UI
http://localhost:3000/api/docs

### API Endpoints

#### Auth
| Method | URL | Auth | Опис |
|--------|-----|------|------|
| POST | /auth/register | - | Реєстрація |
| POST | /auth/login | - | Логін → JWT |

#### Categories
| Method | URL | Auth | Опис |
|--------|-----|------|------|
| GET | /api/categories | - | Список |
| GET | /api/categories/:id | - | Одна |
| POST | /api/categories | admin | Створити |
| PATCH | /api/categories/:id | admin | Оновити |
| DELETE | /api/categories/:id | admin | Видалити |

#### Products
| Method | URL | Auth | Опис |
|--------|-----|------|------|
| GET | /api/products | - | Список + pagination + filter |
| GET | /api/products/:id | - | Один |
| POST | /api/products | admin | Створити |
| PATCH | /api/products/:id | admin | Оновити |
| DELETE | /api/products/:id | admin | Видалити |

#### Orders
| Method | URL | Auth | Опис |
|--------|-----|------|------|
| POST | /api/orders | user | Створити замовлення |
| GET | /api/orders | user | Мої / Всі (admin) |
| GET | /api/orders/:id | user | Одне (ownership) |
| PATCH | /api/orders/:id/status | admin | Змінити статус |
| DELETE | /api/orders/:id | admin | Видалити |

### Тест створення замовлення
```text
adamgolota@Adams-MacBook-Pro hlpf-env-setup % curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"items":[{"productId":1,"quantity":2},{"productId":5,"quantity":1}]}'

{"data":{"id":1,"status":"pending","totalPrice":"2247.00","user":{"id":3},"items":[{"id":1,"quantity":2,"price":"999.00","product":{"id":1,"name":"iPhone 16","description":null,"price":"999.00","stock":48,"isActive":true,"createdAt":"2026-05-03T15:16:47.976Z","updatedAt":"2026-05-03T15:28:59.978Z"}},{"id":2,"quantity":1,"price":"249.00","product":{"id":5,"name":"AirPods Pro","description":null,"price":"249.00","stock":99,"isActive":true,"createdAt":"2026-05-03T15:16:47.979Z","updatedAt":"2026-05-03T15:28:59.978Z"}}],"createdAt":"2026-05-03T15:28:59.978Z"},"statusCode":201,"timestamp":"2026-05-03T15:29:00.012Z"}%    
```

### Тест ownership (403)
```text
curl http://localhost:3000/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $BOB_TOKEN"
{"error":{"code":403,"message":"You can only view your own orders","traceId":"eb330d33-952a-45ad-80d4-fdb030bdc353"},"timestamp":"2026-05-03T16:21:39.816Z"}%
```

### Тест зміни статусу
```text
curl -X PATCH http://localhost:3000/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "confirmed"}'

{"data":{"id":1,"status":"confirmed","totalPrice":"2247.00","items":[{"id":1,"quantity":2,"price":"999.00","product":{"id":1,"name":"iPhone 16","description":null,"price":"999.00","stock":48,"isActive":true,"createdAt":"2026-05-03T15:16:47.976Z","updatedAt":"2026-05-03T15:28:59.978Z"}},{"id":2,"quantity":1,"price":"249.00","product":{"id":5,"name":"AirPods Pro","description":null,"price":"249.00","stock":99,"isActive":true,"createdAt":"2026-05-03T15:16:47.979Z","updatedAt":"2026-05-03T15:28:59.978Z"}}],"createdAt":"2026-05-03T15:28:59.978Z"},"statusCode":200,"timestamp":"2026-05-03T15:58:25.869Z"}%
```

### Тест insufficient stock
```text
curl -X POST http://localhost:3000/api/orders \                  
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"items":[{"productId":1,"quantity":99999}]}'

{"error":{"code":400,"message":"Insufficient stock for \"iPhone 16\": available 48, requested 99999","traceId":"6b98e5ab-83e3-4903-80d5-c419d3afaaaf"},"timestamp":"2026-05-03T16:06:09.660Z"}%                                                                                                                                                         
```
