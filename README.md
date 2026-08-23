# AutoElite — Car Dealership Management System

> A full-stack vehicle inventory and sales platform with role-based access, JWT authentication, and Indian Rupee pricing.

---

## Overview

AutoElite is a web-based car dealership management system that lets customers browse, search, and purchase vehicles while giving administrators full control over inventory. Users register and log in to view available stock, filter by make/model/category/price, complete purchases, and review their purchase history. Admins manage the entire vehicle catalogue — creating, updating, deleting, and restocking vehicles — through a dedicated admin panel.

---

## Features

### User Features

- Register and log in with email and password
- JWT-based session authentication
- Browse the full vehicle inventory
- Search and filter vehicles by make, model, category, and price range
- Purchase an available vehicle (quantity-aware)
- View personal purchase history with price paid and date
- Indian Rupee (₹) pricing throughout
- Secure logout

### Admin Features

- Authenticate as an ADMIN-role user
- Access a dedicated Admin Panel (blocked for regular users)
- Create new vehicles with make, model, category, price, and quantity
- Update existing vehicle details
- Delete vehicles from inventory
- Restock vehicles by adding quantity
- View the full live inventory table

---

## How It Works

**User flow:**
1. Register or log in → JWT token stored in `localStorage`
2. Browse the protected Dashboard → full vehicle inventory
3. Search/filter vehicles by make, model, category, or price
4. Purchase a vehicle → quantity decrements, purchase record created
5. View My Purchases → personal history with preserved price and date

**Admin flow:**
1. Log in with an ADMIN account → JWT token stored in `localStorage`
2. Access the Admin Panel (non-admins are redirected)
3. Create, edit, delete, or restock vehicles via the inventory management UI

---

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React 19, React Router v7, Axios  |
| Build Tool     | Vite 8                            |
| Styling        | Custom CSS (dark navy/gold theme) |
| Backend        | Node.js, Express.js 5             |
| ORM            | Prisma 6                          |
| Database       | SQLite                            |
| Authentication | JSON Web Tokens (JWT)             |
| Password Hash  | bcryptjs                          |
| Testing        | Jest 30, Supertest                |

---

## Architecture

```
Browser (React + Vite)
        │
        │  HTTP requests via Axios (/api/*)
        ▼
Express.js REST API (Node.js)
        │
        ├── authenticate middleware  (JWT verification)
        ├── authorize middleware     (role check: ADMIN)
        │
        ├── /api/auth   → register, login
        └── /api/vehicles → list, search, purchase, my-purchases,
                            create, update, delete, restock
        │
        ▼
Prisma ORM
        │
        ▼
SQLite (dev.db)
  ├── User
  ├── Vehicle
  └── Purchase
```

The frontend proxies all `/api` requests to the backend during development (Vite proxy → `http://localhost:5000`). The JWT token is attached to every authenticated request via an Axios request interceptor. A 401 response automatically clears stored credentials.

---

## Project Structure

```
car-dealership/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # User, Vehicle, Purchase models
│   │   ├── migrations/            # SQL migration history
│   │   └── dev.db                 # SQLite database
│   ├── scripts/
│   │   └── createAdmin.js         # CLI script to create/promote admin users
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── config/
│   │   │   └── database.js        # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── vehicleController.js
│   │   ├── middleware/
│   │   │   ├── authenticate.js    # JWT verification
│   │   │   └── authorize.js       # Role-based access control
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── vehicleRoutes.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── vehicleService.js
│   │   └── validators/
│   │       ├── authValidator.js
│   │       └── vehicleValidator.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── health.test.js
│   │   ├── inventory.test.js
│   │   ├── purchases.test.js
│   │   ├── search.test.js
│   │   ├── vehicles.test.js
│   │   └── helpers/
│   │       ├── loadEnv.js
│   │       └── setupTestDb.js
│   ├── server.js
│   ├── jest.config.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.js           # Axios instance + authAPI + vehiclesAPI
    │   ├── components/
    │   │   └── ProtectedRoute.jsx # ProtectedRoute + AdminRoute guards
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state, login, logout
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── AboutPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── PurchasesPage.jsx
    │   │   └── AdminPage.jsx
    │   ├── utils/
    │   │   └── currency.js        # INR formatter (Intl.NumberFormat)
    │   ├── App.jsx                # Route definitions
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Authentication & Authorization

- **Registration** creates a `USER`-role account with a bcrypt-hashed password.
- **Login** validates credentials and returns a signed JWT.
- **Protected routes** (`/dashboard`, `/purchases`) require a valid JWT; unauthenticated users are redirected to `/login`.
- **Admin routes** (`/admin`) additionally require `role === 'ADMIN'`; non-admin authenticated users are redirected to `/dashboard`.
- On the backend, every protected endpoint passes through the `authenticate` middleware (JWT verification) and, where required, the `authorize('ADMIN')` middleware (role check returning 403 on failure).
- Passwords are never stored in plain text — bcryptjs with a salt round of 10 is used.
- A 401 response from the API automatically clears the stored token and user from `localStorage`.

---

## Purchase Flow

1. An authenticated user selects a vehicle with `quantity > 0` on the Dashboard.
2. `POST /api/vehicles/:id/purchase` is called with the user's JWT.
3. The backend runs a Prisma transaction: vehicle quantity decrements by 1, and a `Purchase` record is created capturing `userId`, `vehicleId`, and the price at time of purchase.
4. If the vehicle is out of stock, the API returns a 400 error.
5. The user can navigate to **My Purchases** (`/purchases`) to see their full history — make, model, category, price paid, and date — ordered newest first.
6. Purchase history is strictly scoped to the logged-in user; no user can see another user's purchases.

---

## Admin Management

From the Admin Panel (`/admin`), an ADMIN user can:

| Action   | Details                                              |
|----------|------------------------------------------------------|
| Create   | Add a vehicle with make, model, category, price, qty |
| Update   | Edit any field of an existing vehicle                |
| Delete   | Remove a vehicle from the inventory                  |
| Restock  | Add a specified quantity to an existing vehicle      |

All four operations are protected on the backend by both `authenticate` and `authorize('ADMIN')` middleware. A regular `USER` token will receive a `403 Forbidden` response.

---

## API Overview

### Auth — `/api/auth`

| Method | Endpoint             | Auth     | Description          |
|--------|----------------------|----------|----------------------|
| POST   | `/api/auth/register` | None     | Register a new user  |
| POST   | `/api/auth/login`    | None     | Log in, receive JWT  |

### Vehicles — `/api/vehicles`

| Method | Endpoint                      | Auth            | Description                        |
|--------|-------------------------------|-----------------|------------------------------------|
| GET    | `/api/vehicles`               | User            | List all vehicles                  |
| GET    | `/api/vehicles/search`        | User            | Search/filter vehicles             |
| GET    | `/api/vehicles/my-purchases`  | User            | Get logged-in user's purchase history |
| POST   | `/api/vehicles`               | Admin           | Create a vehicle                   |
| PUT    | `/api/vehicles/:id`           | Admin           | Update a vehicle                   |
| DELETE | `/api/vehicles/:id`           | Admin           | Delete a vehicle                   |
| POST   | `/api/vehicles/:id/purchase`  | User            | Purchase a vehicle                 |
| POST   | `/api/vehicles/:id/restock`   | Admin           | Restock a vehicle                  |

### Health

| Method | Endpoint  | Auth | Description        |
|--------|-----------|------|--------------------|
| GET    | `/health` | None | Server health check |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone <repository-url>
cd car-dealership
```

### 2. Backend — install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your_strong_secret_here"
PORT=5000
```

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

This applies all migrations in `prisma/migrations/` and creates the `dev.db` SQLite file with the `User`, `Vehicle`, and `Purchase` tables.

### 5. Create an admin account

```bash
node scripts/createAdmin.js admin@example.com yourpassword
```

If the email already exists, the script promotes that user to `ADMIN`.

### 6. Start the backend

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend runs on `http://localhost:5000`.

### 7. Frontend — install dependencies

```bash
cd ../frontend
npm install
```

### 8. Start the frontend

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`. All `/api` requests are proxied to `http://localhost:5000`.

---

## Environment Variables

### `backend/.env`

| Variable       | Description                        | Example                  |
|----------------|------------------------------------|--------------------------|
| `DATABASE_URL` | Prisma SQLite connection string    | `file:./prisma/dev.db`   |
| `JWT_SECRET`   | Secret key used to sign JWTs       | `change_this_to_a_secret`|
| `PORT`         | Port the Express server listens on | `5000`                   |

### `backend/.env.test` (used by Jest)

| Variable       | Description                     |
|----------------|---------------------------------|
| `DATABASE_URL` | Separate SQLite DB for tests    |
| `JWT_SECRET`   | Secret for test token signing   |
| `PORT`         | Port for test server            |

Never commit real secrets to version control.

---

## Testing

The backend test suite uses Jest and Supertest against a dedicated `test.db` database.

```bash
cd backend
npm test
```

Test files:

| File                    | Coverage area                        |
|-------------------------|--------------------------------------|
| `health.test.js`        | Server health endpoint               |
| `auth.test.js`          | Registration and login               |
| `vehicles.test.js`      | Vehicle CRUD and authorization       |
| `inventory.test.js`     | Inventory listing and stock          |
| `search.test.js`        | Vehicle search and filtering         |
| `purchases.test.js`     | Purchase flow and purchase history   |

---

## Build

To produce a production-ready frontend bundle:

```bash
cd frontend
npm run build
```

Output is written to `frontend/dist/`. To preview the production build locally:

```bash
npm run preview
```

---

## Deployment

The project is structured for straightforward deployment:

- **Backend**: Deploy the `backend/` directory to any Node.js host (e.g. Railway, Render, Fly.io). Set the required environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`) in the host's dashboard. Run `npx prisma migrate deploy` as part of the build/release step.
- **Frontend**: Run `npm run build` and deploy the `frontend/dist/` directory to any static host (e.g. Vercel, Netlify). Configure the host to rewrite all routes to `index.html` for client-side routing. Update the Vite proxy (or set `VITE_API_URL`) to point to the deployed backend URL.

> Production deployment has not been verified as part of this repository. The steps above reflect the project's current structure and configuration.

---

## Screenshots

Screenshots have not been added to this repository yet. Suggested placeholders:

| Page            | Description                                      |
|-----------------|--------------------------------------------------|
| Home            | Landing page with navigation                     |
| Login           | Email/password login form                        |
| Dashboard       | Vehicle inventory grid with search and purchase  |
| My Purchases    | Purchase history table with price and date       |
| Admin Panel     | Vehicle management form + inventory table        |

---

## Security Notes

- Passwords are hashed with **bcryptjs** (salt rounds: 10) before storage — plain-text passwords are never persisted.
- All protected API endpoints require a valid **JWT** in the `Authorization: Bearer <token>` header.
- **Role-based authorization** ensures only `ADMIN` users can create, update, delete, or restock vehicles.
- Frontend route guards (`ProtectedRoute`, `AdminRoute`) redirect unauthenticated or unauthorized users before any page renders.
- Purchase history is **user-scoped** — the backend filters by the authenticated user's ID, so users cannot access each other's records.
- Secrets (`JWT_SECRET`, `DATABASE_URL`) are loaded from environment variables and must never be committed to version control.

---

## Future Enhancements

The following are not currently implemented:

- Image uploads for vehicle listings
- Pagination for large inventories
- Email verification on registration
- Password reset flow
- Sales analytics / reporting dashboard
- Multi-currency support

---

## License

License information can be added based on the project's intended distribution.

---

## Author

Author information not specified in this repository.
