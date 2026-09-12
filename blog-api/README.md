# Blog Management REST API

A REST API for a Blog Management Application with three access levels — **Admin**, **User**, and **Guest** — built with Node.js, Express, and Sequelize (MySQL). Supports registration, JWT authentication, role-based authorization, user management, blog CRUD with ownership rules, and public blog search/filtering.

**Author:** Kazi Abu Jafor Arif  
**Batch:** 19 SDET

## Technologies

- Node.js / Express.js (ES Modules)
- MySQL
- Sequelize ORM (all database access goes through Sequelize — no raw SQL)
- `jsonwebtoken` for authentication
- `bcrypt` for password hashing
- `dotenv` for environment configuration
- `cors`
- Postman for API testing

## Architecture

The project follows a layered architecture:

- **Routes** — declare endpoints and wire up middleware; no logic.
- **Controllers** — thin HTTP layer; call a service, then shape the response. Every controller wraps its service call in try/catch and responds with `error.statusCode || 500`.
- **Services** — all business logic and validation. Services throw plain `Error` objects with a `.statusCode` attached (e.g. `error.statusCode = 404`), which controllers catch and turn into the right HTTP response.
- **Models** — Sequelize model definitions and associations.
- **Middlewares** — JWT verification (`authMiddleWare`) and role guarding (`isAdmin`).

## Project Structure

```
blog-api/
├── app.js                   # Express app, middleware, routes
├── server.js                 # DB connection + starts the HTTP server
├── config/
│   └── db.js                 # Sequelize connection to MySQL
├── models/
│   ├── index.js               # Associations (User hasMany Blog / Blog belongsTo User)
│   ├── user.model.js
│   └── blog.model.js
├── controller/
│   ├── auth.controller.js
│   ├── user.controller.js
│   └── blog.controller.js
├── services/
│   ├── auth.services.js
│   ├── user.services.js
│   └── blog.services.js
├── middlewares/
│   └── auth.middleware.js     # authMiddleWare (JWT) + isAdmin (role guard)
├── routes/
│   ├── auth.route.js
│   ├── user.route.js
│   └── blog.route.js
├── utils/
│   ├── validateEmail.js
│   ├── validateFields.js
│   └── createAdmin.js         # CLI helper to promote/create an admin
├── postman/
│   └── Blog-API.postman_collection.json
├── .env.example
├── .gitignore
└── package.json
```

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your own values:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blogdb

SECRET_KEY=your_secret_key
```

`.env` is git-ignored — never commit real credentials.

## Database Setup

1. Make sure MySQL is running locally.
2. Create the database (Sequelize creates the tables for you, but the database itself must exist first):
   ```sql
   CREATE DATABASE blogdb;
   ```
3. Start the server — `sequelize.sync()` in `server.js` automatically creates the `users` and `blogs` tables with the correct columns and foreign key.

## Creating an Admin User

The assignment requires an admin to be created by manually setting `role = admin`. Use the included script instead of editing the database by hand:

```bash
npm run create-admin -- admin@example.com password123 Admin User
```

This either promotes an existing user with that email to `admin`, or creates a brand-new active admin account.

## Running the Server

```bash
npm run dev     # with nodemon, auto-restarts on changes
# or
npm start       # plain node
```

On success:

```
MySQL connection established and models synchronized.
Server is running at http://localhost:5000
```

## Authentication

Protected endpoints require a Bearer token obtained from `/api/auth/login`:

```
Authorization: Bearer <token>
```

## API Endpoints

| # | Method | Endpoint | Access | Purpose |
|---|--------|----------|--------|---------|
| 1 | POST | `/api/auth/register` | Public | Register a new user |
| 2 | POST | `/api/auth/login` | Public | Login and receive a JWT |
| 3 | GET | `/api/users` | Admin | Get all users |
| 4 | GET | `/api/users/:id` | Admin | Get a specific user |
| 5 | PATCH | `/api/users/:id/status` | Admin | Activate/deactivate a user |
| 6 | GET | `/api/users/profile` | User/Admin | Get own profile |
| 7 | PUT | `/api/users/profile/update` | User/Admin | Update own profile (firstname/lastname only) |
| 8 | PATCH | `/api/users/password` | User/Admin | Update own password |
| 9 | POST | `/api/blogs/create` | User/Admin | Create a blog |
| 10 | GET | `/api/blogs` | Public | List/search/filter blogs (`?title=`, `?category=`) |
| 11 | GET | `/api/blogs/:id` | Public | Get a specific blog |
| 12 | PUT | `/api/blogs/update/:id` | User/Admin | Update a blog (own, or any as admin) |
| 13 | DELETE | `/api/blogs/delete/:id` (also `/api/blogs/:id`) | User/Admin | Delete a blog (own, or any as admin) |

## Example Requests / Responses

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true
  }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "firstname": "John", "lastname": "Doe", "email": "john@example.com", "role": "user", "isActive": true }
}
```

### Get All Blogs (public, with author info)

```http
GET /api/blogs?title=playwright&category=Testing
```

```json
[
  {
    "id": 1,
    "blogTitle": "Introduction to Playwright",
    "blog": "This article explains...",
    "category": "Testing",
    "author": { "id": 1, "firstname": "John", "lastname": "Doe" }
  }
]
```

### Forbidden Operation

```json
{
  "message": "You are not authorized to update this blog."
}
```

## Postman

Import `postman/Blog-API.postman_collection.json` into Postman. It covers all 13 endpoints plus tests for: successful/duplicate registration, role-escalation attempts, successful/failed login, deactivated-user login, missing/invalid tokens, admin-vs-user authorization on both users and blogs, blog CRUD, partial title search, category filtering, combined filters, and 404 handling.

**Postman collection:** [Blog Management API](https://kajarif02-5863647.postman.co/workspace/Kazi-Abu-Jafor-Arif's-Workspace~551c39eb-65ea-4f48-889f-094493878cfa/collection/56978012-2ec1c297-d8b7-41cf-b1af-bb7b934275ea?action=share&creator=56978012)

## Common Errors & Fixes

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Unable to connect to the database: ... ECONNREFUSED` | MySQL isn't running or wrong host/port | Start MySQL; check `DB_HOST`/`DB_PORT` in `.env` |
| `Access denied for user` | Wrong `DB_USER`/`DB_PASSWORD` | Update `.env` |
| `Unknown database 'blogdb'` | Database not created yet | Run `CREATE DATABASE blogdb;` in MySQL |
| `401 Invalid or expired token` | Missing/expired/malformed JWT | Log in again and use the fresh token |
| `403` on blog update/delete | Trying to modify another user's blog as a non-admin | Only the owner or an admin can do this |
| `EADDRINUSE` on startup | Another process is already using the port | Stop that process, or change `PORT` in `.env` |
