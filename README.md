## Student
- Name: Голота Адам Іванович
- Group: 232/1
## Практичне заняття №7 — Redis + Pagination + Filtering


### Запуск проекту
```bash
cp .env.example .env
docker compose up --build
docker compose run --rm app npm run seed
```

### API: GET /api/products

| Параметр | Тип | Default | Опис |
|----------|-----|---------|------|
| page | number | 1 | Номер сторінки |
| pageSize | number | 10 | Елементів на сторінку (max 100) |
| sort | string | createdAt | Поле сортування |
| order | asc/desc | desc | Напрямок |
| categoryId | number | - | Фільтр за категорією |
| minPrice | number | - | Мінімальна ціна |
| maxPrice | number | - | Максимальна ціна |
| search | string | - | Пошук за назвою (ILIKE) |

### Тест пагінації
```text
curl "http://localhost:3000/api/products?page=1&pageSize=5"
{"data":{"items":[{"id":31,"name":"Fresh Product","description":null,"price":"42.00","stock":0,"isActive":true,"category":null,"createdAt":"2026-05-03T14:15:23.040Z","updatedAt":"2026-05-03T14:15:23.040Z"},{"id":30,"name":"Hoodie NestJS v3","description":null,"price":"75.00","stock":75,"isActive":true,"category":{"id":3,"name":"Clothing","description":null,"createdAt":"2026-05-03T13:32:59.248Z"},"createdAt":"2026-05-03T13:32:59.259Z","updatedAt":"2026-05-03T13:32:59.259Z"},{"id":29,"name":"T-Shirt Dev v3","description":null,"price":"45.00","stock":200,"isActive":true,"category":{"id":3,"name":"Clothing","description":null,"createdAt":"2026-05-03T13:32:59.248Z"},"createdAt":"2026-05-03T13:32:59.258Z","updatedAt":"2026-05-03T13:32:59.258Z"},{"id":28,"name":"Laptop Sleeve v3","description":null,"price":"69.00","stock":60,"isActive":true,"category":{"id":2,"name":"Accessories","description":null,"createdAt":"2026-05-03T13:32:59.247Z"},"createdAt":"2026-05-03T13:32:59.258Z","updatedAt":"2026-05-03T13:32:59.258Z"},{"id":27,"name":"MagSafe Charger v3","description":null,"price":"59.00","stock":80,"isActive":true,"category":{"id":2,"name":"Accessories","description":null,"createdAt":"2026-05-03T13:32:59.247Z"},"createdAt":"2026-05-03T13:32:59.258Z","updatedAt":"2026-05-03T13:32:59.258Z"}],"meta":{"page":1,"pageSize":5,"total":31,"totalPages":7}},"statusCode":200,"timestamp":"2026-05-03T14:15:39.132Z"}%                                                                                                                                   
```

### Тест фільтрації
```text
curl "http://localhost:3000/api/products?categoryId=1&minPrice=500"
{"data":{"items":[{"id":24,"name":"iPad Air v3","description":null,"price":"619.00","stock":30,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.257Z","updatedAt":"2026-05-03T13:32:59.257Z"},{"id":23,"name":"MacBook Pro v3","description":null,"price":"2519.00","stock":15,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.257Z","updatedAt":"2026-05-03T13:32:59.257Z"},{"id":22,"name":"Galaxy S24 v3","description":null,"price":"869.00","stock":40,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.257Z","updatedAt":"2026-05-03T13:32:59.257Z"},{"id":21,"name":"iPhone 16 v3","description":null,"price":"1019.00","stock":50,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.256Z","updatedAt":"2026-05-03T13:32:59.256Z"},{"id":14,"name":"iPad Air v2","description":null,"price":"609.00","stock":30,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.254Z","updatedAt":"2026-05-03T13:32:59.254Z"},{"id":13,"name":"MacBook Pro v2","description":null,"price":"2509.00","stock":15,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.254Z","updatedAt":"2026-05-03T13:32:59.254Z"},{"id":12,"name":"Galaxy S24 v2","description":null,"price":"859.00","stock":40,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.254Z","updatedAt":"2026-05-03T13:32:59.254Z"},{"id":11,"name":"iPhone 16 v2","description":null,"price":"1009.00","stock":50,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.253Z","updatedAt":"2026-05-03T13:32:59.253Z"},{"id":4,"name":"iPad Air","description":null,"price":"599.00","stock":30,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.250Z","updatedAt":"2026-05-03T13:32:59.250Z"},{"id":3,"name":"MacBook Pro","description":null,"price":"2499.00","stock":15,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.250Z","updatedAt":"2026-05-03T13:32:59.250Z"}],"meta":{"page":1,"pageSize":10,"total":12,"totalPages":2}},"statusCode":200,"timestamp":"2026-05-03T14:23:07.018Z"}% 
```

### Тест пошуку
```text
curl "http://localhost:3000/api/products?search=mac"
{"data":{"items":[{"id":23,"name":"MacBook Pro v3","description":null,"price":"2519.00","stock":15,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.257Z","updatedAt":"2026-05-03T13:32:59.257Z"},{"id":13,"name":"MacBook Pro v2","description":null,"price":"2509.00","stock":15,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.254Z","updatedAt":"2026-05-03T13:32:59.254Z"},{"id":3,"name":"MacBook Pro","description":null,"price":"2499.00","stock":15,"isActive":true,"category":{"id":1,"name":"Electronics","description":null,"createdAt":"2026-05-03T13:32:59.246Z"},"createdAt":"2026-05-03T13:32:59.250Z","updatedAt":"2026-05-03T13:32:59.250Z"}],"meta":{"page":1,"pageSize":10,"total":3,"totalPages":1}},"statusCode":200,"timestamp":"2026-05-03T14:11:43.533Z"}%
```

### Тест кешування (Redis)
```text
docker compose exec redis redis-cli KEYS "products:*"
1) "products:{\"page\":1,\"pageSize\":5,\"sort\":\"createdAt\",\"order\":\"desc\"}"
```

### Тест інвалідації кешу
```text
adamgolota@Adams-MacBook-Pro hlpf-env-setup % docker compose exec redis redis-cli KEYS "products:*"      
docker compose exec redis redis-cli TTL "products:{\"page\":1,\"pageSize\":5,\"sort\":\"createdAt\",\"order\":\"desc\"}"
  
1) "products:{\"page\":1,\"pageSize\":5,\"sort\":\"createdAt\",\"order\":\"desc\"}"
(integer) 52


adamgolota@Adams-MacBook-Pro hlpf-env-setup % curl -X POST http://localhost:3000/api/products \          
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Fresh Product", "price": 42}'

{"data":{"id":32,"name":"Fresh Product","description":null,"price":42,"stock":0,"isActive":true,"createdAt":"2026-05-03T14:15:54.749Z","updatedAt":"2026-05-03T14:15:54.749Z"},"statusCode":201,"timestamp":"2026-05-03T14:15:54.759Z"}%                                                                                                 

               
adamgolota@Adams-MacBook-Pro hlpf-env-setup % docker compose exec redis redis-cli KEYS "products:*"
docker compose exec redis redis-cli TTL "products:{\"page\":1,\"pageSize\":5,\"sort\":\"createdAt\",\"order\":\"desc\"}"
  
(empty array)
(integer) -2
```

