**PocketLedger API Contract**

This document defines the API between our Next.js frontend and Spring Boot backend. It describes what the frontend sends and what the backend returns, and it matches the code on `main`.

**Base URL:** For local development, the backend runs at `http://localhost:8080/api`. The Next.js frontend runs at `http://localhost:3000`.

**Money:** The frontend sends amounts as strings, for example `"-18.47"`. The backend stores them as `BigDecimal` (`DECIMAL(22,10)` in the database) and returns them as JSON numbers, which can have extra decimal places. The frontend converts them with `Number()` for display.
```json
{
  "amount": "-18.47"
}
```

**Sign convention:** Expenses are negative and income is positive. For example: coffee purchase `-6.75`, paycheck `1200.00`, refund = positive amount. CSV imports should use this format.

**Dates:** Dates use `YYYY-MM-DD`. Months use `YYYY-MM`.

**Currency:** Currencies use three-letter uppercase codes, for example: `USD`, `EUR`, `CNY`.

**Authentication:** Protected endpoints require a JSON Web Token (JWT). The backend returns the token in the JSON response after register or login. The frontend saves it in `localStorage` and sends it with every protected request:
```text
Authorization: Bearer <token>
```
The backend identifies the user from the token. The frontend does not send a `userId` with normal requests. If the token is invalid or expired, the backend returns `401` and the frontend sends the user back to the login page.

**Errors:** Errors use this format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must not be zero."
  }
}
```
Common HTTP status codes and error codes:
- `400` `VALIDATION_ERROR` - A field is missing or breaks a rule. `INVALID_REQUEST` - The JSON could not be read.
- `401` - Not logged in or invalid token. Login returns `INVALID_CREDENTIALS`.
- `403` `FORBIDDEN` - The resource belongs to another user.
- `404` `NOT_FOUND` - Resource not found.
- `409` `EMAIL_TAKEN` - Conflict, such as an email that is already registered. The backend currently uses this code for every `IllegalArgumentException`, so some other conflicts (for example a duplicate category name) also come back as `EMAIL_TAKEN`. The message is still correct.
- `429` `TOO_MANY_ATTEMPTS` - Too many failed logins.
- `503` `FX_UNAVAILABLE` - The exchange rate service is down.
- `500` - Server error.

**Authentication endpoints**

Users create an account with an email and password. The backend hashes passwords with BCrypt before storing them. Register and login do not need a token. All other endpoints do.

**Register:** `POST /api/auth/register`
Request:
```json
{
  "email": "student@okstate.edu",
  "password": "password123"
}
```

The password must be 8 to 72 characters and contain at least one letter and one number. The home currency is not sent. New users start with `USD`.

Response: `201 Created`
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "student@okstate.edu"
  }
}
```
The user is logged in right after registering, so the response includes a token. Settings are not part of this response. Use `GET /api/settings` to read them.

Errors: `400` `VALIDATION_ERROR` if a field is missing or the password breaks a rule. `409` `EMAIL_TAKEN` if the email is already registered.

**Login:** `POST /api/auth/login`

Request:
```json
{
  "email": "student@okstate.edu",
  "password": "password123"
}
```

Response: `200 OK` with the same format as register.

Errors: `401` `INVALID_CREDENTIALS` if the email or password is wrong. The message does not say which one was wrong. `429` `TOO_MANY_ATTEMPTS` if there have been 100 or more failed logins for that email within the last hour. A successful login does not reset this count. The frontend shows "Too many failed login attempts. Please try again in 1 hour."

Failed logins are recorded with the email that was typed and the time. The password that was typed is never stored.

**Logout:** There is no logout endpoint. The frontend deletes the token from `localStorage` and sends the user to the login page.

**Get Settings:** `GET /api/settings`

Response: `200 OK`
```json
{
  "currency": "USD"
}
```

User settings are stored as JSON in the database. `currency` is the user's home currency and is `USD` by default for a new user.

**Update Home Currency:** `PUT /api/settings`

Request:
```json
{
  "currency": "EUR"
}
```

Response: `200 OK` with the same format as `GET /api/settings`. The settings page uses this endpoint when the user changes their home currency. The backend checks that the code is a real currency and saves it. It does not change any stored transactions. The Transactions page converts amounts to the home currency when it shows them (see Exchange rate).

**Transaction**

Transaction format:
```json
{
  "id": 42,
  "amount": -6.75,
  "label": "Coffee",
  "description": null,
  "date": "2026-09-10",
  "categoryId": 3,
  "accountId": 1
}
```
Fields: `amount` = amount in the account's currency, `label` = short name shown in the list (required), `description` = optional longer note (can be `null`), `categoryId` = assigned category, `accountId` = account for the transaction.

**Get Transactions:** `GET /api/transactions?accountId=1`

`accountId` is required. The backend returns the transactions of that account only, and returns `403` if the account belongs to another user. To show all of a user's transactions, the frontend calls this once per account.

Response: `200 OK` (a plain list)
```json
[
  {
    "id": 42,
    "amount": -6.7500000000,
    "label": "Coffee",
    "description": null,
    "date": "2026-09-10",
    "categoryId": 3,
    "accountId": 1
  }
]
```

**Create Transaction:** `POST /api/transactions`

Request:
```json
{
  "date": "2026-09-10",
  "amount": "-6.75",
  "label": "Coffee",
  "description": "",
  "categoryId": 3,
  "accountId": 1
}
```
`date`, `amount`, `label`, `categoryId`, and `accountId` are required. `label` can't be blank and is at most 255 characters. `description` is optional, at most 4095 characters. The account must belong to the user, and the category must be a default category or one of the user's own (otherwise `403`).

Response: `201 Created` and the created transaction.

**Update Transaction:** `PUT /api/transactions/{id}`

Example: `PUT /api/transactions/42`

Request: Same fields as `POST /api/transactions`, except `accountId`. The account of a transaction can't be changed.
```json
{
  "date": "2026-09-10",
  "amount": "-7.25",
  "label": "Coffee",
  "description": "with a muffin",
  "categoryId": 3
}
```

Response: `200 OK` and the updated transaction.

**Delete Transaction:** `POST /api/transactions/{id}`

Example: `POST /api/transactions/42` (no request body)

Response: `204 No Content`

This endpoint uses `POST`, not `DELETE`. Transactions use hard delete, so deleted transactions are permanently removed from the database and cannot be restored.

**Categories**

Every user sees the same 12 default categories (Rent, Utilities, Bills, Groceries, Dining, Entertainment, Transportation, Health and Wellness, Shopping, Education, Income, Other). In the database they belong to a built-in user with id 1. Users can also create their own categories. Categories can't be renamed or deleted. Colors are not stored in the backend; the frontend picks them.

**Get Categories:** `GET /api/categories`

Response: `200 OK` (a plain list of the default categories plus the user's own)
```json
[
  {
    "id": 4,
    "categoryLabel": "Groceries"
  },
  {
    "id": 12,
    "categoryLabel": "Other"
  },
  {
    "id": 23,
    "categoryLabel": "Pets"
  }
]
```

**Create Category:** `POST /api/categories`

Request:
```json
{
  "categoryLabel": "Pets"
}
```

The name can't be blank and is at most 255 characters. Response: `201 Created` with `{ "id", "categoryLabel" }`. If the user already has a category with that name, the backend returns `409`. The backend only checks the user's own categories, so the frontend also blocks names that match a default category.

**Accounts**

For the MVP, accounts support read and create.

**Get Accounts:** `GET /api/accounts`

Response: `200 OK` (a plain list)
```json
[
  {
    "id": 1,
    "name": "Checking",
    "type": "checking"
  },
  {
    "id": 2,
    "name": "Cash",
    "type": "cash"
  }
]
```
Possible account types: `checking`, `savings`, `credit`, `cash`. Accounts don't have a currency yet, so the frontend treats every account as `USD`.

**Create Account:** `POST /api/accounts`

Request:
```json
{
  "name": "Travel Card",
  "type": "credit",
  "settings": "{}"
}
```

`name` is required, at most 50 characters. `type` must be one of the lowercase types above. `settings` is required but is not used yet, so the frontend sends `"{}"`.

Response: `201 Created` and the created account (`{ "id", "name", "type" }`).

**Budgets**
A budget belongs to a user and a month, not to an account. Transactions from all of the user's accounts count toward it.

**Get Monthly Budget:** `GET /api/budgets?month=2026-09`

Response: `200 OK`
```json
{
  "month": "2026-09",
  "totalPlanned": 1450.00,
  "totalSpent": 1187.32,
  "categories": [
    {
      "categoryId": 4,
      "categoryName": "Groceries",
      "planned": 400.00,
      "spent": 312.18,
      "remaining": 87.82
    }
  ]
}
```

Budget values are positive. `spent` is the amount spent in that category for the month, transactions in the Income category are not counted. `remaining` can be negative if the user goes over budget. If the user has no budget for that month, the totals are `0`.

**Save Monthly Budget:** `PUT /api/budgets`

Request:
```json
{
  "month": "2026-09",
  "budgets": [
    {
      "categoryId": 4,
      "amount": "400.00"
    },
    {
      "categoryId": 7,
      "amount": "80.00"
    }
  ]
}
```

Amounts must be `0` or more. The whole month is sent at once, and saving replaces what was there before.

Response: `200 OK` with the same format as `GET /api/budgets`.

**CSV Import**

CSV import is one step: upload the file, and the backend imports the rows.

**Import CSV:** `POST /api/import`

Request type: `multipart/form-data`

Fields: `file` = the CSV file, `accountId` = the account to import into, `categorize` = optional, `true` to let AI pick a category for each row (default `false`).

The first row must be a header with columns whose names contain `date`, `description`, and `amount`. If one is missing, the backend throws `InvalidCsvException`. That exception has no handler in `ApiExceptionHandler` yet, so it currently comes back as a generic `500`. Dates can be `YYYY-MM-DD` or `MM/DD/YYYY`. Amounts can include `$`. The description becomes the transaction's `label`.

Response: `200 OK`
```json
{
  "imported": 271,
  "skipped": 11,
  "failed": 2
}
```

`imported` = rows saved. `skipped` = rows that couldn't be used. `failed` = rows that caused an error while saving. Imported rows go to `Other`, unless `categorize` is `true`, in which case Gemini picks a category and the row goes to `Other` if it can't.

Known limitation: each line is split on every comma, so quoted values that contain commas are not supported yet.

**AI**

**Categorize Transactions:** `POST /api/ai/categorize`

This endpoint re-categorizes existing transactions and saves the new categories. The Transactions page uses it for its "Auto-categorize" button and the per-row AI button.

Request:
```json
{
  "transactionIds": [42, 57, 61]
}
```

Response: `200 OK`
```json
{
  "results": [
    {
      "id": 42,
      "categoryId": 4,
      "source": "ai",
      "confidence": null
    },
    {
      "id": 57,
      "categoryId": 7,
      "source": "ai",
      "confidence": null
    },
    {
      "id": 61,
      "categoryId": 12,
      "source": "default",
      "confidence": null
    }
  ]
}
```
`source` is `ai` when Gemini picked a category and `default` when it didn't and the transaction went to `Other`. `confidence` is always `null`, because Gemini only returns a category, not a score. The backend only accepts categories that belong to the user. If Gemini is unavailable, the transactions go to `Other` with `default`. Transactions owned by another user return `403`.

**Exchange rate**

**Get exchange rate:** `GET /api/fx/rate?from=EUR&to=USD&date=2026-09-10`

Response: `200 OK`
```json
{
  "from": "EUR",
  "to": "USD",
  "date": "2026-09-10",
  "rate": 1.0824
}
```

The backend gets rates from Frankfurter. `date` is the date the rate is actually from. If both currencies are the same, the rate is `1`. If there is no rate for that currency or date, the backend returns `404`. If the provider is down, it returns `503` `FX_UNAVAILABLE`.

The frontend does the conversion: for each transaction, it asks for the rate on that transaction's date, and shows the converted amount and totals in the home currency. Each currency and date is only requested once.

**Assumptions**
1. We use email and password login. The backend returns a JWT in the response body, and the frontend stores it in `localStorage` and sends it as `Authorization: Bearer <token>`. Tokens expire after 24 hours, and the backend signs them with `JWT_SECRET` from `.env`.
2. New users start with `USD` as their home currency. They can change it in Settings using `PUT /api/settings`. Stored transactions are not changed; the Transactions page converts them when it shows them, using the rate from each transaction's date.
3. There is no `categorySource` field on transactions. The only place a source appears is the `POST /api/ai/categorize` response (`ai` or `default`), and it isn't stored. A transaction goes to `Other` when AI can't pick a category, during CSV import or `POST /api/ai/categorize`.
4. There are no saved rules. AI is only used for CSV import (with `categorize=true`) and `POST /api/ai/categorize`. Manual transactions use the category selected by the user (the form starts on `Other`).
5. `Other` is one of the 12 default categories. Categories can't be deleted, so `Other` is always there.
6. Deleting a transaction is a hard delete. Categories and user accounts can't be deleted.
7. Users can change their home currency, but accounts don't have their own currency yet, so every account is treated as `USD`.