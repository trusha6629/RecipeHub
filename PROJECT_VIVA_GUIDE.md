# RecipeHub Viva Guide

This file is a viva and presentation guide for the `RecipeHub` project. It is written for teacher questions, project demonstrations, and oral explanations.

Important note:
- This guide explains the application files created for the project.
- It does not explain `node_modules`, generated build output, temporary logs, or third-party package internals.

## 1. One-Line Project Definition

`RecipeHub` is a full-stack MEAN application where users can register, log in, create recipes with image uploads, search recipes, save favorites, rate dishes, follow creators, and explore analytics.

## 2. Full Form of MEAN

- `M` = MongoDB
- `E` = Express.js
- `A` = Angular
- `N` = Node.js

Why this stack was used:
- JavaScript and TypeScript can be used across the full stack.
- Angular handles a rich single-page frontend.
- Express provides a lightweight backend API.
- MongoDB works well with JSON-like document data such as recipes and users.

## 3. Main Features of RecipeHub

- User registration and login with JWT
- Password hashing with bcrypt
- Recipe create, read, update, delete
- Image upload using Multer
- Search by title and category
- Favorites and ratings
- Creator profiles
- Follow and unfollow creators
- Following feed and updates feed
- Platform analytics and creator analytics
- Tailwind-based modern UI
- Dark mode
- Backend tests and frontend tests

## 4. High-Level Architecture

The project has two major parts:

### Frontend

Angular standalone application.
Responsible for:
- UI rendering
- navigation
- form handling
- API calls
- session state
- route guards
- interceptors

### Backend

Node + Express REST API.
Responsible for:
- authentication
- validation
- business logic
- image upload handling
- database communication
- analytics endpoints

### Database

MongoDB stores:
- users
- recipes

## 5. End-to-End Request Flow

Teacher question: `Explain the full flow when a user creates a recipe.`

Answer:

1. User opens the Angular recipe form page.
2. User fills title, category, ingredients, instructions, and selects an image.
3. Angular creates a `FormData` object.
4. Angular sends the request with `HttpClient`.
5. JWT is attached by the auth interceptor.
6. Express receives the request on `POST /api/recipes`.
7. Auth middleware verifies the JWT.
8. Multer middleware validates and stores the image.
9. Controller creates the recipe in MongoDB.
10. Mongoose stores the document.
11. Express returns the created recipe JSON.
12. Angular shows a toast and redirects to the recipe detail page.

## 6. How Authentication Works

Teacher question: `How does registration work?`

Answer:

1. User sends `name`, `email`, and `password` to `POST /api/auth/register`.
2. Backend checks whether all fields are present.
3. Backend checks whether the email already exists.
4. If valid, Mongoose creates a new `User`.
5. Password is hashed before saving using a Mongoose pre-save hook.
6. Backend generates a JWT token using `jsonwebtoken`.
7. Response returns token plus safe user data.
8. Frontend stores the token and user in `localStorage`.

Teacher question: `How does login work?`

Answer:

1. User sends email and password.
2. Backend finds the user by email.
3. Password is compared using bcrypt.
4. If valid, JWT is generated and returned.
5. Frontend stores the session.

Teacher question: `Why JWT?`

Answer:

JWT allows stateless authentication. The server does not need to store session memory. The client sends the token with every protected request.

## 7. How JWT Protection Works

Relevant file:
[authMiddleware.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/middleware/authMiddleware.js)

What it does:
- checks for `Authorization` header
- verifies token with `JWT_SECRET`
- fetches the user from MongoDB
- attaches the user to `req.user`
- blocks unauthorized requests with `401`

Teacher question: `What is req.user?`

Answer:

After token verification, the authenticated user document is attached to the request object as `req.user`, so controllers can know who is performing the action.

## 8. How Password Security Works

Relevant file:
[User.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/models/User.js)

Important points:
- Passwords are never stored in plain text.
- A Mongoose `pre('save')` hook hashes the password with bcrypt.
- A custom method `matchPassword` compares login input with the stored hashed password.

Teacher question: `Why hash passwords?`

Answer:

Hashing protects user credentials even if the database is exposed. Plain-text password storage is insecure.

## 9. How MongoDB Database Works

Teacher question: `What collections are used?`

Answer:

Main collections:
- `users`
- `recipes`

### User data

Stored fields:
- `_id`
- `name`
- `email`
- `password`
- `followingCreators`
- timestamps

### Recipe data

Stored fields:
- `_id`
- `title`
- `ingredients`
- `instructions`
- `category`
- `rating`
- `image`
- `createdBy`
- `favorites`
- `ratings`
- timestamps

Teacher question: `How are relationships handled in MongoDB?`

Answer:

Relationships are handled using `ObjectId` references:
- `createdBy` references a user
- `favorites` stores user IDs
- `ratings.user` stores user IDs
- `followingCreators` stores creator user IDs

When needed, Mongoose `populate()` is used to load creator details.

## 10. How Recipe Rating Works

Relevant file:
[recipeController.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/controllers/recipeController.js)

Flow:
- User submits a rating from 1 to 5.
- Backend checks whether that user has already rated the recipe.
- If yes, update the existing rating.
- If no, add a new rating object.
- Recalculate average rating.
- Save result in `recipe.rating`.

Teacher question: `Why store both rating array and average rating?`

Answer:

The rating array stores detailed user-level rating data. The `rating` field stores the average rating for faster display and sorting.

## 11. How Favorites Work

Flow:
- Recipe document contains a `favorites` array of user IDs.
- When user clicks save/favorite, backend toggles their user ID in the array.
- If user already exists in favorites, remove it.
- Otherwise add it.

Teacher question: `Why use toggle logic?`

Answer:

It allows the same endpoint to handle both save and unsave behavior cleanly.

## 12. How Image Upload Works

Relevant file:
[uploadMiddleware.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/middleware/uploadMiddleware.js)

What Multer does:
- stores files in `backend/uploads`
- renames files using timestamp and sanitized filename
- accepts only MIME types starting with `image/`
- limits file size to 2MB

Teacher question: `Why store image path in MongoDB instead of the full file?`

Answer:

The actual image file is stored on disk in `uploads`. MongoDB stores only the image path string. This keeps the database lighter and easier to query.

## 13. How Static File Serving Works

Relevant backend line:
- `app.use('/uploads', express.static(...))`

Meaning:
- if a saved image path is `/uploads/abc.jpg`
- browser can access it through `http://localhost:5000/uploads/abc.jpg`

## 14. How Search Works

Teacher question: `How is recipe search implemented?`

Answer:

Search is implemented in backend controller logic using MongoDB regex matching on:
- `title`
- `category`

The frontend sends query text through query parameters.

Examples:
- `/api/recipes/search?q=dinner`
- `/api/recipes?q=vegan`

## 15. How Pagination Works

Teacher question: `How does pagination work in your API?`

Answer:

The backend accepts:
- `page`
- `limit`
- `sort`

It calculates:
- `skip = (page - 1) * limit`

Then MongoDB returns only the needed subset of recipes. The API also returns pagination metadata:
- total
- totalPages
- hasNextPage
- hasPreviousPage

## 16. How Creator Follow System Works

Teacher question: `How do users follow creators?`

Answer:

Each user document has a `followingCreators` array. When a user follows a creator:
- creator ID is added to `followingCreators`
- if already present, it is removed

This powers:
- creator profiles
- following feed
- update notifications
- follower count calculations

## 17. How Analytics Work

Teacher question: `What analytics features did you build?`

Answer:

There are two analytics types:

### Platform analytics

Shows overall stats like:
- total recipes
- average rating
- total favorites
- top categories

### Creator analytics

Shows creator-specific stats like:
- total recipes
- favorites earned
- top recipes
- category breakdown
- monthly trend
- best saved recipe

These are computed using MongoDB aggregation pipelines in the recipe controller.

## 18. How Frontend Routing Works

Relevant file:
[app.routes.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/app.routes.ts)

Important routes:
- `/` -> home
- `/login` -> login page
- `/register` -> register page
- `/recipes/new` -> add recipe
- `/recipes/:id` -> recipe detail
- `/recipes/:id/edit` -> edit recipe
- `/analytics` -> creator analytics
- `/updates` -> following updates
- `/creators/:creatorId` -> creator profile

Teacher question: `Which routes are protected?`

Answer:

Protected routes use `authGuard`, such as:
- analytics
- updates
- add recipe
- edit recipe

## 19. How Interceptors Work

### Auth interceptor

Relevant file:
[auth.interceptor.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/interceptors/auth.interceptor.ts)

What it does:
- reads token from `AuthService`
- adds `Authorization: Bearer <token>` to outgoing requests

### Error interceptor

Relevant file:
[error.interceptor.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/interceptors/error.interceptor.ts)

What it does:
- handles `401` expired-session cases
- clears session
- shows a toast
- handles status `0` network/server unreachable errors

Teacher question: `Why use interceptors instead of writing code in every component?`

Answer:

Interceptors centralize repeated logic like auth headers and error handling, which keeps components cleaner.

## 20. How Form Handling Works

Relevant file:
[recipe-form.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/features/recipes/recipe-form.component.ts)

Important details:
- uses Angular reactive forms
- validates required fields
- supports create and edit mode
- generates image preview before upload
- sends multipart `FormData`
- warns on unsaved changes

Teacher question: `Why use FormData?`

Answer:

Because the form includes both text fields and a file upload, `FormData` is the correct way to send multipart form data to the backend.

## 21. How Unread Updates Work

Relevant file:
[updates.service.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/services/updates.service.ts)

How it works:
- frontend stores the last viewed timestamp in `localStorage`
- following highlights are fetched from the backend
- service compares recipe `createdAt` with `lastViewedAt`
- unread count is calculated
- navbar badge and updates page use this state

Teacher question: `Why is this done on the frontend?`

Answer:

For this project, unread state is user-experience state rather than permanent database state, so storing it locally keeps the implementation simple.

## 22. How Toast Notifications Work

Relevant file:
[toast.service.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/services/toast.service.ts)

What it does:
- stores toast messages in a signal
- supports `success`, `error`, and `info`
- auto-dismisses after a timeout

## 23. How Route Guards Work

Relevant files:
[auth.guard.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/guards/auth.guard.ts)
[pending-changes.guard.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/guards/pending-changes.guard.ts)

Teacher question: `What is the difference between auth guard and pending changes guard?`

Answer:

- `authGuard` prevents unauthorized access to private pages.
- `pendingChangesGuard` warns if the user tries to leave the recipe form with unsaved changes.

## 24. How Backend Startup Works

Relevant files:
[server.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/server.js)
[config/db.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/config/db.js)
[config/env.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/config/env.js)

Flow:
- load environment variables
- validate required environment variables
- connect to MongoDB
- create Express app
- start server

Teacher question: `Why validate env variables?`

Answer:

It prevents the server from starting with broken configuration, which makes deployment issues easier to detect.

## 25. How Backend Security Is Improved

Relevant file:
[app.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/app.js)

Security-related items:
- `helmet` adds secure HTTP headers
- rate limiting protects endpoints from abuse
- auth routes have stricter throttling
- request body size is limited
- CORS restricts allowed origins
- request IDs help trace errors
- readiness and health endpoints help operations

Teacher question: `What is rate limiting?`

Answer:

Rate limiting controls how many requests a client can make in a time window. It reduces abuse and brute-force login attempts.

## 26. How CORS Works in This Project

Teacher question: `What is CORS and why did you need it?`

Answer:

The frontend and backend run on different origins during development, such as:
- frontend on `127.0.0.1:4200`
- backend on `localhost:5000`

Browsers block cross-origin requests unless the backend explicitly allows them. The Express CORS middleware handles this.

## 27. How Health and Readiness Endpoints Work

Teacher question: `What is the difference between health and readiness?`

Answer:

- `/api/health` says the API process is alive and returns metadata.
- `/api/ready` says whether the app is ready to serve requests, especially whether the database is connected.

This is useful in deployment systems and monitoring.

## 28. How Testing Works

### Backend tests

Relevant file:
[api.test.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/tests/api.test.js)

What is tested:
- health and readiness
- register/login
- recipe creation
- search
- favorites
- ratings
- featured creators
- follow system
- unauthorized access

Tools used:
- Jest
- Supertest
- mongodb-memory-server

### Frontend tests

Relevant files:
[auth.service.spec.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/services/auth.service.spec.ts)
[updates.service.spec.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/services/updates.service.spec.ts)

What is tested:
- auth session storage
- logout behavior
- unread update counting
- mark viewed logic

## 29. Docker and Deployment

Relevant files:
[docker-compose.yml](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/docker-compose.yml)
[backend/Dockerfile](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/Dockerfile)
[frontend/Dockerfile](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/Dockerfile)
[frontend/nginx.conf](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/nginx.conf)

Teacher question: `How would you run this in production?`

Answer:

There is Docker support for:
- MongoDB container
- backend container
- frontend container served with Nginx

In production, the frontend uses relative `/api` and `/uploads` paths behind Nginx.

## 30. File-by-File Explanation: Backend

### [backend/server.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/server.js)

Purpose:
- backend entry point
- loads env
- validates config
- connects database
- starts Express server

### [backend/app.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/app.js)

Purpose:
- creates Express app
- sets security middleware
- sets CORS
- sets request parser
- serves uploads
- registers routes
- exposes health and readiness endpoints
- global error handler

### [backend/config/db.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/config/db.js)

Purpose:
- opens MongoDB connection using Mongoose

### [backend/config/env.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/config/env.js)

Purpose:
- validates env variables
- checks required configuration
- parses rate limits and port

### [backend/models/User.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/models/User.js)

Purpose:
- defines user schema
- hashes password
- compares passwords
- returns safe user data without password

### [backend/models/Recipe.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/models/Recipe.js)

Purpose:
- defines recipe schema
- embeds rating schema
- stores favorites, ratings, image path, and creator reference

### [backend/controllers/authController.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/controllers/authController.js)

Purpose:
- register user
- login user
- return current user
- follow or unfollow creators

### [backend/controllers/recipeController.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/controllers/recipeController.js)

Purpose:
- recipe CRUD
- search
- save/favorite
- rating
- pagination
- following feed
- analytics
- featured creators
- creator profile

### [backend/routes/authRoutes.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/routes/authRoutes.js)

Purpose:
- maps auth URLs to auth controller functions

### [backend/routes/recipeRoutes.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/routes/recipeRoutes.js)

Purpose:
- maps recipe URLs to controller functions

### [backend/middleware/authMiddleware.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/middleware/authMiddleware.js)

Purpose:
- protects private routes
- checks JWT and resolves user

### [backend/middleware/uploadMiddleware.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/middleware/uploadMiddleware.js)

Purpose:
- configures image upload handling with Multer

### [backend/data/seedData.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/data/seedData.js)

Purpose:
- contains sample demo data for development

### [backend/scripts/seed.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/scripts/seed.js)

Purpose:
- inserts demo user and recipes into MongoDB

### [backend/tests/api.test.js](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/backend/tests/api.test.js)

Purpose:
- backend integration tests

## 31. File-by-File Explanation: Frontend

### [frontend/src/app/app.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/app.component.ts)

Purpose:
- root component
- usually hosts router outlet, navbar, and toaster

### [frontend/src/app/app.config.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/app.config.ts)

Purpose:
- provides router
- provides `HttpClient`
- registers interceptors

### [frontend/src/app/app.routes.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/app.routes.ts)

Purpose:
- defines route URLs and protected routes

### [frontend/src/app/core/models.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/models.ts)

Purpose:
- TypeScript interfaces for backend response shapes

### [frontend/src/app/core/services/auth.service.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/services/auth.service.ts)

Purpose:
- login/register calls
- session persistence
- current user state
- token access
- follow creator
- logout

### [frontend/src/app/core/services/recipe.service.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/services/recipe.service.ts)

Purpose:
- all recipe-related API calls
- image URL helper

### [frontend/src/app/core/services/theme.service.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/services/theme.service.ts)

Purpose:
- stores and toggles light/dark mode

### [frontend/src/app/core/services/toast.service.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/services/toast.service.ts)

Purpose:
- manages toast notifications

### [frontend/src/app/core/services/updates.service.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/services/updates.service.ts)

Purpose:
- tracks unread updates from followed creators

### [frontend/src/app/core/interceptors/auth.interceptor.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/interceptors/auth.interceptor.ts)

Purpose:
- attaches JWT automatically

### [frontend/src/app/core/interceptors/error.interceptor.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/interceptors/error.interceptor.ts)

Purpose:
- handles common HTTP errors globally

### [frontend/src/app/core/guards/auth.guard.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/guards/auth.guard.ts)

Purpose:
- blocks private routes for guest users

### [frontend/src/app/core/guards/pending-changes.guard.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/core/guards/pending-changes.guard.ts)

Purpose:
- warns before leaving with unsaved changes

### [frontend/src/app/features/layout/navbar.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/features/layout/navbar.component.ts)

Purpose:
- top navigation
- search bar
- theme toggle
- updates badge
- auth action buttons

### [frontend/src/app/features/auth/login.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/features/auth/login.component.ts)

Purpose:
- login page UI and login submission

### [frontend/src/app/features/auth/register.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/features/auth/register.component.ts)

Purpose:
- register page UI and signup submission

### [frontend/src/app/features/recipes/home.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/features/recipes/home.component.ts)

Purpose:
- dashboard
- filters
- sorting
- pagination
- stats
- featured creators
- following preview

### [frontend/src/app/features/recipes/recipe-form.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/features/recipes/recipe-form.component.ts)

Purpose:
- add/edit recipe form
- file upload
- preview
- unsaved changes tracking

### [frontend/src/app/features/recipes/recipe-detail.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/features/recipes/recipe-detail.component.ts)

Purpose:
- single recipe page
- favorite and rating actions

### [frontend/src/app/features/recipes/analytics.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/features/recipes/analytics.component.ts)

Purpose:
- creator analytics dashboard

### [frontend/src/app/features/recipes/creator-profile.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/features/recipes/creator-profile.component.ts)

Purpose:
- public creator profile
- follow button
- creator stats
- creator recipes

### [frontend/src/app/features/recipes/following-updates.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/features/recipes/following-updates.component.ts)

Purpose:
- updates feed from followed creators
- unread and earlier grouping

### [frontend/src/app/shared/components/recipe-card.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/shared/components/recipe-card.component.ts)

Purpose:
- reusable recipe card
- favorite button
- creator link

### [frontend/src/app/shared/components/recipe-card-skeleton.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/shared/components/recipe-card-skeleton.component.ts)

Purpose:
- loading placeholder for recipe cards

### [frontend/src/app/shared/components/toaster.component.ts](/c:/Users/trush/.gemini/antigravity/scratch/recipeHub/frontend/src/app/shared/components/toaster.component.ts)

Purpose:
- renders toast messages from toast service

## 32. Common Teacher Questions and Strong Answers

### `Why did you choose Angular instead of React?`

Answer:
I wanted a structured enterprise-style frontend with routing, forms, guards, interceptors, and strong TypeScript patterns built in.

### `Why did you choose MongoDB instead of MySQL?`

Answer:
Recipes, ratings, favorites, and creator-follow arrays fit naturally into a document model, and MongoDB works very smoothly with JSON-like API data.

### `How is your project scalable?`

Answer:
The backend is separated into models, controllers, routes, and middleware. The frontend is separated into core, feature, and shared layers. The app also supports pagination, route protection, Docker setup, and analytics endpoints.

### `What are the limitations of this project?`

Answer:
- images are stored locally rather than in cloud storage
- unread updates are stored in localStorage, not the database
- deployment was prepared, but live Docker validation was not available in this environment
- frontend test coverage exists but is still limited

### `What would you improve next?`

Answer:
- store images in cloud storage like S3 or Azure Blob
- add E2E testing
- add admin moderation
- add email verification and password reset
- add notification persistence in database

## 33. Best Way to Explain the Project in 1 Minute

`RecipeHub` is a full-stack MEAN recipe sharing platform. The frontend is built with Angular standalone components and Tailwind CSS. The backend is Node.js with Express and MongoDB. Users can register and log in using JWT authentication, create recipes with image upload through Multer, search and filter recipes, save favorites, rate dishes, follow creators, and view analytics. I also added production-style improvements such as route guards, interceptors, request tracing, rate limiting, health and readiness checks, backend tests, and frontend tests.`

## 34. Best Way to Explain the Project in 3 Minutes

Start with:
- what the app does
- what stack you used
- how auth works
- how recipe upload works
- how database relations work
- what advanced features you added
- what security and testing you implemented

Suggested order:
1. project overview
2. architecture
3. auth flow
4. recipe CRUD and image upload
5. analytics and follow system
6. security
7. testing
8. future improvements

## 35. Final Viva Tip

If the teacher asks a very broad question like `Explain the whole project`, answer in layers:

1. purpose of project
2. stack used
3. how login works
4. how recipes are stored and uploaded
5. how frontend and backend communicate
6. what advanced features make it stand out
7. security and testing

That structure keeps your answer clear and professional.
