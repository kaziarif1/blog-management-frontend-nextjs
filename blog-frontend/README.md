# BlogHub Frontend

Next.js (App Router) + Tailwind CSS frontend for the existing Blog Management REST API.

The UI consumes `http://localhost:5000/api`. It does not talk to MySQL and does not use mock blog or user data.

## Setup

```bash
cd blog-frontend
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

`NEXT_PUBLIC_BACKEND_URL` is used to resolve uploaded profile images served from `/uploads`.

The backend must already be running. See `blog-api/README.md`.
