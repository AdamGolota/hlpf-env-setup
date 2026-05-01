## Student
- Name: Голота Адам Іванович
- Group: 232/1

## Практичне заняття №3 — CRUD REST API для MiniShop

### Структура репозиторію
```
.
├── src/
│   ├── categories/
│   │   ├── category.entity.ts
│   │   ├── categories.module.ts
│   │   ├── categories.service.ts
│   │   └── categories.controller.ts
│   ├── products/
│   │   ├── product.entity.ts
│   │   ├── products.module.ts
│   │   ├── products.service.ts
│   │   └── products.controller.ts
│   ├── migrations/
│   │   ├── 1700000001-CreateTables.ts
│   │   └── <timestamp>-AddIsActiveToProducts.ts
│   ├── data-source.ts
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
| Method | URL | Опис |
|--------|-----|------|
| GET | /api/categories | Список категорій |
| GET | /api/categories/:id | Одна категорія |
| POST | /api/categories | Створити категорію |
| PATCH | /api/categories/:id | Оновити категорію |
| DELETE | /api/categories/:id | Видалити категорію |
| GET | /api/products | Список продуктів |
| GET | /api/products/:id | Один продукт |
| POST | /api/products | Створити продукт |
| PATCH | /api/products/:id | Оновити продукт |
| DELETE | /api/products/:id | Видалити продукт |

### Перевірка міграцій
```text
docker compose exec postgres psql -U nestuser -d nestdb -c "\dt"
           List of relations
 Schema |    Name    | Type  |  Owner   
--------+------------+-------+----------
 public | categories | table | nestuser
 public | migrations | table | nestuser
 public | products   | table | nestuser
(3 rows)
```

### Тест створення категорії
```text
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Electronics", "description": "Gadgets and devices"}'

{"id":1,"name":"Electronics","description":"Gadgets and devices","createdAt":"2026-05-01T14:39:56.658Z"}
```

### Тест створення продукту
```text
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "USB Cable", "price": 9.99, "stock": 200}'

{"id":2,"name":"USB Cable","description":null,"price":9.99,"stock":200,"isActive":true,"createdAt":"2026-05-01T14:40:50.723Z","updatedAt":"2026-05-01T14:40:50.723Z"}
```

### Тест отримання продуктів
```text
curl http://localhost:3000/api/products
[{"id":1,"name":"iPhone 15","description":null,"price":"999.99","stock":50,"isActive":true,"category":{"id":1,"name":"Electronics","description":"Gadgets and devices","createdAt":"2026-05-01T14:39:56.658Z"},"createdAt":"2026-05-01T14:40:36.384Z","updatedAt":"2026-05-01T14:40:36.384Z"},{"id":2,"name":"USB Cable","description":null,"price":"9.99","stock":200,"isActive":true,"category":null,"createdAt":"2026-05-01T14:40:50.723Z","updatedAt":"2026-05-01T14:40:50.723Z"}]
```

### Тест 404
```text
curl http://localhost:3000/api/products/999

{"message":"Product #999 not found","error":"Not Found","statusCode":404}
```
