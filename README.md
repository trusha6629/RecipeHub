# RecipeHub

RecipeHub is a full-stack MEAN recipe sharing platform with JWT authentication, Multer-based image uploads, favorites, ratings, search, and a polished Angular 20 frontend styled with Tailwind CSS.
Modern full-stack recipe sharing platform with dashboard UI, JWT authentication, image upload, and responsive design using the MEAN stack.

## Stack

- Frontend: Angular 20 standalone components + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs
- Uploads: Multer local storage in `backend/uploads`

## Project Structure

```text
recipeHub/
  backend/
  frontend/
```

## Backend Setup

1. Copy [backend/.env.example](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/.env.example) to `backend/.env`
2. Update `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`
   `JWT_SECRET` should be at least 16 characters long.
3. Optional: start MongoDB only with Docker:

```bash
docker compose up -d
```

This uses [docker-compose.yml](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/docker-compose.yml) and exposes MongoDB on `mongodb://127.0.0.1:27017/recipehub`.

3. Install dependencies:

```bash
npm install --prefix backend
```

4. Start the API:

```bash
npm run dev --prefix backend
```

The API runs on `http://localhost:5000` and serves recipe images from `http://localhost:5000/uploads/<filename>`.
Health check: `GET /api/health`
Readiness check: `GET /api/ready`

## Frontend Setup

1. Install dependencies:

```bash
npm install --prefix frontend
```

2. Start Angular:

```bash
npm run start --prefix frontend
```

The frontend runs on `http://localhost:4200`.

## Full Stack Docker

The repository now includes production-oriented containerization for MongoDB, the Express API, and the Angular frontend served by Nginx.

Start the full stack:

```bash
docker compose up --build -d
```

Access points:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000/api`
- MongoDB: `mongodb://127.0.0.1:27017/recipehub`

The frontend container proxies `/api` and `/uploads` to the backend, so the production Angular build uses relative URLs correctly.

Helpful root scripts:

```bash
npm run docker:up
npm run docker:down
npm run docker:logs
```

Production note:

- the backend now validates required environment variables at startup
- `/api/health` is useful for basic liveness
- `/api/ready` is intended for readiness checks behind Docker/orchestration
- API responses now include an `X-Request-Id` header to help trace failures in logs

## Demo Data

To seed a demo user and starter recipes:

```bash
npm run seed --prefix backend
```

Demo credentials:

- Email: `demo@recipehub.com`
- Password: `password123`

To clear seeded data:

```bash
npm run seed:destroy --prefix backend
```

## Testing

Backend API tests use Jest, Supertest, and an in-memory MongoDB instance, so they run without needing your local database.

Run the backend suite:

```bash
npm run test --prefix backend
```

Or from the repo root:

```bash
npm run test:backend
```

Frontend unit tests use Jest with Angular TestBed and currently cover session/auth state plus unread updates behavior.

Run the frontend suite:

```bash
npm run test --prefix frontend
```

Or from the repo root:

```bash
npm run test:frontend
```

Covered flows include:

- user registration
- user login
- protected recipe creation
- recipe search
- favorites
- ratings
- unauthorized access checks
- frontend auth session persistence
- frontend unread updates state

## Core API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/recipes`
- `GET /api/recipes/search?q=`
- `GET /api/recipes/:id`
- `POST /api/recipes`
- `PUT /api/recipes/:id`
- `DELETE /api/recipes/:id`
- `POST /api/recipes/:id/favorite`
- `POST /api/recipes/:id/rate`

## Notes

- Recipe creation and editing send images with `FormData`
- Uploaded images are validated as images and limited to 2MB
- JWT is stored in `localStorage`
- Protected Angular routes use an auth guard
- Dark mode state is persisted in `localStorage`
- Root helper scripts are available in [package.json](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/package.json)
- Angular uses `localhost:5000` in development and relative `/api` + `/uploads` paths in production builds
