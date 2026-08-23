# TEST_REPORT.md — AutoElite Car Dealership Management System

## Backend Test Results

**Test runner:** Jest 30 + Supertest  
**Database:** Isolated `test.db` (SQLite) — separate from `dev.db`  
**Run command:** `cd backend && npm test`

### Summary

| Metric        | Result |
|---------------|--------|
| Test Suites   | 6 passed, 6 total |
| Tests         | 70 passed, 70 total |
| Failures      | 0 |
| Snapshots     | 0 |
| Duration      | ~6 s |

---

### Test Suite Breakdown

#### `health.test.js` — Server Health
| # | Test |
|---|------|
| 1 | GET /health returns 200 ok |

---

#### `auth.test.js` — Authentication (Registration & Login)
| # | Test |
|---|------|
| 1 | registers a new user and returns 201 with user data |
| 2 | hashes the password — plain text must not be stored |
| 3 | returns 409 when email is already registered |
| 4 | returns 400 when email is missing |
| 5 | returns 400 when password is missing |
| 6 | returns 400 when email format is invalid |
| 7 | returns 400 when password is too short |
| 8 | returns 200 and a JWT token on successful login |
| 9 | returned JWT contains the user id and role |
| 10 | returns 401 when email does not exist |
| 11 | returns 401 when password is incorrect |
| 12 | returns 400 when email is missing (login) |
| 13 | returns 400 when password is missing (login) |

---

#### `vehicles.test.js` — Vehicle CRUD & Authorization
| # | Test |
|---|------|
| 1 | admin can create a vehicle and returns 201 |
| 2 | created vehicle is persisted in the database |
| 3 | returns 403 when a normal USER tries to create a vehicle |
| 4 | returns 401 when no token is provided (create) |
| 5 | returns 400 when make is missing |
| 6 | returns 400 when price is negative |
| 7 | returns 400 when quantity is negative |
| 8 | returns 401 when no token is provided (list) |
| 9 | returns empty array when no vehicles exist |
| 10 | authenticated USER can list all vehicles |
| 11 | authenticated ADMIN can list all vehicles |
| 12 | returned vehicles contain the required fields |
| 13 | ADMIN can delete a vehicle and returns 200 |
| 14 | deleted vehicle no longer exists in the database |
| 15 | deleting one vehicle does not affect other vehicles |
| 16 | returns 403 when USER tries to delete a vehicle |
| 17 | returns 401 when no token is provided (delete) |
| 18 | returns 404 when vehicle does not exist (delete) |
| 19 | ADMIN can update a vehicle and returns 200 |
| 20 | updated vehicle is persisted in the database |
| 21 | returns 403 when USER tries to update a vehicle |
| 22 | returns 401 when no token is provided (update) |
| 23 | returns 404 when vehicle does not exist (update) |
| 24 | returns 400 when price is negative (update) |
| 25 | returns 400 when make is missing (update) |

---

#### `inventory.test.js` — Purchase & Restock
| # | Test |
|---|------|
| 1 | authenticated USER can purchase a vehicle and returns 200 |
| 2 | purchase decreases stock quantity by 1 |
| 3 | ADMIN can also purchase a vehicle |
| 4 | returns 401 when no token is provided (purchase) |
| 5 | returns 404 when vehicle does not exist (purchase) |
| 6 | returns 400 when stock is 0 — cannot purchase out-of-stock vehicle |
| 7 | multiple purchases correctly decrement stock each time |
| 8 | stock cannot go below 0 |
| 9 | ADMIN can restock a vehicle and returns 200 |
| 10 | restock increases stock by the specified quantity |
| 11 | returns 403 when USER tries to restock |
| 12 | returns 401 when no token is provided (restock) |
| 13 | returns 404 when vehicle does not exist (restock) |
| 14 | returns 400 when restock quantity is missing |
| 15 | returns 400 when restock quantity is zero or negative |

---

#### `search.test.js` — Vehicle Search & Filtering
| # | Test |
|---|------|
| 1 | returns 401 when no token is provided |
| 2 | authenticated USER can search vehicles |
| 3 | authenticated ADMIN can search vehicles |
| 4 | filters by make |
| 5 | filters by model |
| 6 | filters by category |
| 7 | filters by minPrice |
| 8 | filters by maxPrice |
| 9 | combines multiple filters |
| 10 | returns empty array when no vehicles match |

---

#### `purchases.test.js` — Purchase Flow & Purchase History
| # | Test |
|---|------|
| 1 | creates a purchase record and decrements stock |
| 2 | returns 400 when out of stock |
| 3 | returns 401 when unauthenticated (purchase) |
| 4 | returns the authenticated user's purchase history |
| 5 | returns 401 when unauthenticated (my-purchases) |
| 6 | returns empty array when user has no purchases |

---

## Frontend Build Results

**Build tool:** Vite 8  
**Run command:** `cd frontend && npm run build`

| Metric             | Result |
|--------------------|--------|
| Build status       | Passed |
| Modules transformed | 84 |
| Build errors       | 0 |
| Output directory   | `frontend/dist/` |
