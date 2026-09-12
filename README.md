<<<<<<< HEAD
# blog-management-frontend-nextjs
A responsive Blog Management frontend built with Next.js and Tailwind CSS, integrated with a REST API for authentication, blog management, user management, search, filtering, and role-based access control.
=======
# Blog Management REST API

A secure REST API for a blog management application, developed for the **API Development Assignment**. The application supports **Guest**, **User**, and **Admin** access levels, with JWT authentication, role-based authorization, user management, blog management, search, and filtering.

**Author:** Kazi Abu Jafor Arif  
**Batch:** 19 SDET  
**Database:** MySQL  
**API testing:** Postman

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt; passwords are never exposed in responses
- Role-based access control for users and admins
- Admin user listing, individual user lookup, and account activation control
- Authenticated profile and password management
- Blog creation, update, and deletion with author-ownership rules
- Public blog listing, detail lookup, title search, and category filtering
- Input validation and meaningful HTTP error responses
- Sequelize-managed MySQL models and user-to-blog relationship

## Access Levels

| Feature | Guest | User | Admin |
| --- | :---: | :---: | :---: |
| Register and log in | Yes | Yes | Yes |
| View, search, and filter blogs | Yes | Yes | Yes |
| Create a blog | No | Yes | Yes |
| Update or delete own blog | No | Yes | Yes |
| Update or delete another user's blog | No | No | Yes |
| View/update own profile and password | No | Yes | Yes |
| View users and manage account status | No | No | Yes |

## Tech Stack

- Node.js and Express 5 (ES modules)
- MySQL and Sequelize ORM
- JSON Web Tokens (`jsonwebtoken`)
- bcrypt
- dotenv and cors
- Postman

## Project Structure

```text
blog-management-rest-api-main/
├── blog-api/                 # Express REST API (source of truth)
└── blog-frontend/            # Next.js + Tailwind frontend
```

### Backend

```text
blog-api/
├── app.js                    # Express configuration and routes
├── server.js                 # Database startup and HTTP server
├── config/db.js              # Sequelize/MySQL configuration
├── controller/               # HTTP request handlers
├── services/                 # Business logic and validation
├── models/                   # User and Blog Sequelize models
├── middlewares/              # JWT, admin-role, and image-upload middleware
├── routes/                   # API route definitions
├── utils/                    # Validation and admin helper utilities
├── uploads/                  # Stored profile images
├── postman/                  # Importable Postman collection
├── .env.example
└── package.json
```

## Prerequisites

- Node.js 18 or newer
- MySQL server
- npm

## Installation and Setup

This repository contains the REST API (`blog-api`) and the Next.js frontend (`blog-frontend`).

### Backend

1. Open the API directory.

   ```bash
   cd blog-api
   npm install
   ```

2. Create the MySQL database.

   ```sql
   CREATE DATABASE blogdb;
   ```

3. Copy `.env.example` to `.env`, then set the values for your local MySQL instance and JWT secret.

   ```env
   PORT=5000

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=blogdb

   SECRET_KEY=your_secret_key
   ```

4. Start the API.

   ```bash
   npm run dev
   # or
   npm start
   ```

The server runs at `http://localhost:5000` by default. On startup, Sequelize synchronizes the `users` and `blogs` tables. The database itself must be created first.

### Frontend

1. Open a second terminal.

   ```bash
   cd blog-frontend
   npm install
   copy .env.example .env.local
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000). The frontend calls `http://localhost:5000/api`.

Required frontend environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Database Model

The API uses two tables:

```text
users (1) ──────< blogs (*)
```

Each blog belongs to one registered user through `blogs.userId`. Sequelize maps record timestamps to `createAt` and `updateAt`.

| Table | Important fields |
| --- | --- |
| `users` | `id`, `firstname`, `lastname`, `email`, `password`, `isActive`, `role`, `createAt`, `updateAt` |
| `blogs` | `id`, `userId`, `blogTitle`, `blog`, `category`, `createAt`, `updateAt` |

New users are active by default and always receive the `user` role. Registration never accepts a client-supplied admin role.

## Creating an Admin

Use the included helper to create an admin or promote an existing user:

```bash
npm run create-admin -- admin@example.com password123 Admin User
```

The helper promotes the matching existing user, or creates a new active admin account when the email is not yet registered.

## Authentication

Log in through `POST /api/auth/login` and send the returned token on protected endpoints:

```http
Authorization: Bearer <token>
```

Inactive users cannot log in. A normal user can manage only their own blogs, while an admin can manage every blog.

## API Endpoints

Base URL: `http://localhost:5000`

| # | Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- | --- |
| 1 | POST | `/api/auth/register` | Public | Register a user |
| 2 | POST | `/api/auth/login` | Public | Log in and receive a JWT |
| 3 | GET | `/api/users` | Admin | List all users |
| 4 | GET | `/api/users/:id` | Admin | Get one user |
| 5 | PATCH | `/api/users/:id/status` | Admin | Activate or deactivate a user |
| 6 | GET | `/api/users/profile` | User/Admin | Get the authenticated profile |
| 7 | PUT | `/api/users/profile/update` | User/Admin | Update own first and last name |
| 8 | PATCH | `/api/users/password` | User/Admin | Update own password |
| 9 | POST | `/api/blogs/create` | User/Admin | Create a blog |
| 10 | GET | `/api/blogs` | Public | List, search, or filter blogs |
| 11 | GET | `/api/blogs/:id` | Public | Get a blog by ID |
| 12 | PUT | `/api/blogs/update/:id` | User/Admin | Update an owned blog or any blog as admin |
| 13 | DELETE | `/api/blogs/delete/:id` | User/Admin | Delete an owned blog or any blog as admin |

`DELETE /api/blogs/:id` is also supported as an alternative delete route.

### Blog Search and Filtering

Blog listing is public and includes safe author information (`id`, `firstname`, and `lastname`). It supports partial title matching and category filtering:

```http
GET /api/blogs?title=playwright
GET /api/blogs?category=Testing
GET /api/blogs?title=playwright&category=Testing
```

## Example Requests

### Register a user

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

### Log in

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create a blog

```http
POST /api/blogs/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "blogTitle": "Introduction to API Testing",
  "blog": "This article explains the fundamentals of API testing.",
  "category": "Testing"
}
```

The blog owner is derived from the token; clients do not submit `userId`.

### Update user status (admin only)

```http
PATCH /api/users/2/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isActive": false
}
```

## Validation, Security, and Status Codes

The API validates required fields, email format, minimum password length, boolean account status, and numeric resource IDs. It uses these common status codes:

| Status | Meaning |
| --- | --- |
| `200` | Successful request |
| `201` | Resource created |
| `400` | Invalid request data or credentials |
| `401` | Missing, invalid, expired, or inactive authentication |
| `403` | Authenticated but not authorized |
| `404` | Route or resource not found |
| `409` | Email already registered |
| `500` | Unexpected server error |

Passwords are hashed before storage and are excluded from all API responses. Keep real credentials in `.env`; it is ignored by Git and must not be committed.

## Postman

Import [postman/Blog-Management-API.postman_collection.json](postman/Blog-Management-API.postman_collection.json) into Postman to exercise authentication, authorization, user management, blog CRUD, search/filtering, and error scenarios.

You can also use the shared [Postman collection](https://kajarif02-5863647.postman.co/workspace/Kazi-Abu-Jafor-Arif's-Workspace~551c39eb-65ea-4f48-889f-094493878cfa/collection/56978012-2ec1c297-d8b7-41cf-b1af-bb7b934275ea?action=share&creator=56978012).


>>>>>>> 7bdd907 (Initial project setup)
