Base URL: `{{baseUrl}}` (set to `http://localhost:3000` when running locally)


1) Create transaction

- Method: POST
- URL: `{{baseUrl}}/api/transactions`
- Headers: `Authorization`, `Content-Type: application/json`
- Body (raw JSON):

```
{
  "type": "expense",
  "amount": 25.5,
  "currency": "USD",
  "category": "<CATEGORY_ID>",
  "description": "Lunch",
  "date": "2026-04-08T12:00:00.000Z",
  "notes": "Optional note"
}
```

Response: `201 Created` with `data.transaction` object.

2) List transactions (filters, sort, pagination)

- Method: GET
- URL: `{{baseUrl}}/api/transactions`
- Query params (optional):
  - `type` = `income|expense`
  - `category` = `<CATEGORY_ID>`
  - `startDate` = `YYYY-MM-DD` or full ISO date
  - `endDate` = `YYYY-MM-DD` or full ISO date
  - `page` = `1` (default)
  - `limit` = `10` (default)
  - `sortBy` = `date|amount|createdAt` (default: `date`)
  - `sortOrder` = `asc|desc` (default: `desc`)

Example:

```
GET {{baseUrl}}/api/transactions?type=expense&startDate=2026-04-01&endDate=2026-04-30&page=1&limit=20
```

Response: `200 OK` with `data.transactions` array and `data.meta` pagination info.

3) Get single transaction

- Method: GET
- URL: `{{baseUrl}}/api/transactions/:id`
- Replace `:id` with the transaction `_id`.

Response: `200 OK` with `data.transaction`.

4) Update transaction

- Method: PUT
- URL: `{{baseUrl}}/api/transactions/:id`
- Headers: `Authorization`, `Content-Type: application/json`
- Body (raw JSON) — only fields to update, e.g.:

```
{
  "amount": 30.0,
  "description": "Updated description"
}
```

Notes: If updating `category` or `type`, the route middlewares will validate category existence and type matching.

5) Delete transaction

- Method: DELETE
- URL: `{{baseUrl}}/api/transactions/:id`

Response: `200 OK` with success message.

6) Totals summary (income / expense)

- Method: GET
- URL: `{{baseUrl}}/api/transactions/summary/total`

Response: `200 OK` with `data.summary` object:

```
{
  "income": 1234.56,
  "expense": 789.01
}
```

