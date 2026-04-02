const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let User;
let Recipe;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.CLIENT_URL = 'http://localhost:4200';

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGO_URI);

  app = require('../app')();
  User = require('../models/User');
  Recipe = require('../models/Recipe');
});

afterEach(async () => {
  await User.deleteMany();
  await Recipe.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('RecipeHub API', () => {
  test('reports health and readiness', async () => {
    const healthResponse = await request(app).get('/api/health');
    expect(healthResponse.statusCode).toBe(200);
    expect(healthResponse.body.message).toMatch(/RecipeHub API is running/i);
    expect(healthResponse.body.database).toBe('connected');
    expect(healthResponse.body.version).toBe('1.0.0');
    expect(typeof healthResponse.body.uptimeSeconds).toBe('number');
    expect(healthResponse.body.startedAt).toBeTruthy();
    expect(healthResponse.headers['x-request-id']).toBeTruthy();

    const readyResponse = await request(app).get('/api/ready');
    expect(readyResponse.statusCode).toBe(200);
    expect(readyResponse.body.ready).toBe(true);
    expect(readyResponse.body.database).toBe('connected');
    expect(readyResponse.body.version).toBe('1.0.0');
    expect(readyResponse.headers['x-request-id']).toBeTruthy();
  });

  test('registers and logs in a user', async () => {
    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Test Chef',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.body.token).toBeTruthy();
    expect(registerResponse.body.user.email).toBe('test@example.com');

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.token).toBeTruthy();
    expect(loginResponse.body.user.followingCreators).toEqual([]);
  });

  test('creates, searches, favorites, rates, and deletes a recipe', async () => {
    const authResponse = await request(app).post('/api/auth/register').send({
      name: 'Recipe Owner',
      email: 'owner@example.com',
      password: 'password123'
    });

    const token = authResponse.body.token;

    const createResponse = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Spiced Lentil Bowl')
      .field('ingredients', 'Lentils\nOlive oil\nSpinach')
      .field('instructions', 'Cook lentils, season well, and finish with spinach.')
      .field('category', 'Dinner');

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.ingredients).toEqual(['Lentils', 'Olive oil', 'Spinach']);

    const recipeId = createResponse.body._id;

    const searchResponse = await request(app).get('/api/recipes/search').query({ q: 'Dinner' });
    expect(searchResponse.statusCode).toBe(200);
    expect(searchResponse.body).toHaveLength(1);

    const favoriteResponse = await request(app)
      .post(`/api/recipes/${recipeId}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(favoriteResponse.statusCode).toBe(200);
    expect(favoriteResponse.body.favorites).toHaveLength(1);

    const rateResponse = await request(app)
      .post(`/api/recipes/${recipeId}/rate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ value: 5 });

    expect(rateResponse.statusCode).toBe(200);
    expect(rateResponse.body.rating).toBe(5);

    const paginatedResponse = await request(app).get('/api/recipes').query({ page: 1, limit: 6, sort: 'rating' });
    expect(paginatedResponse.statusCode).toBe(200);
    expect(paginatedResponse.body.recipes).toHaveLength(1);
    expect(paginatedResponse.body.pagination.total).toBe(1);
    expect(paginatedResponse.body.pagination.page).toBe(1);

    const myRecipesResponse = await request(app)
      .get('/api/recipes/my')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 6 });
    expect(myRecipesResponse.statusCode).toBe(200);
    expect(myRecipesResponse.body.recipes).toHaveLength(1);

    const savedRecipesResponse = await request(app)
      .get('/api/recipes/saved')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 6 });
    expect(savedRecipesResponse.statusCode).toBe(200);
    expect(savedRecipesResponse.body.recipes).toHaveLength(1);

    const statsResponse = await request(app).get('/api/recipes/stats');
    expect(statsResponse.statusCode).toBe(200);
    expect(statsResponse.body.totalRecipes).toBe(1);
    expect(statsResponse.body.totalFavorites).toBe(1);
    expect(statsResponse.body.averageRating).toBe(5);
    expect(statsResponse.body.topCategories[0].category).toBe('Dinner');

    const featuredCreatorsResponse = await request(app).get('/api/recipes/featured-creators');
    expect(featuredCreatorsResponse.statusCode).toBe(200);
    expect(featuredCreatorsResponse.body.creators).toHaveLength(1);
    expect(featuredCreatorsResponse.body.creators[0].creator.name).toBe('Recipe Owner');
    expect(featuredCreatorsResponse.body.creators[0].totalRecipes).toBe(1);
    expect(featuredCreatorsResponse.body.creators[0].totalFavorites).toBe(1);

    const creatorStatsResponse = await request(app)
      .get('/api/recipes/creator-stats')
      .set('Authorization', `Bearer ${token}`);
    expect(creatorStatsResponse.statusCode).toBe(200);
    expect(creatorStatsResponse.body.totalRecipes).toBe(1);
    expect(creatorStatsResponse.body.totalFavorites).toBe(1);
    expect(creatorStatsResponse.body.topRecipes).toHaveLength(1);
    expect(creatorStatsResponse.body.monthlyTrend.length).toBeGreaterThan(0);
    expect(creatorStatsResponse.body.bestSavedRecipe.title).toBe('Spiced Lentil Bowl');

    const creatorProfileResponse = await request(app).get(`/api/recipes/creator-profile/${authResponse.body.user._id}`);
    expect(creatorProfileResponse.statusCode).toBe(200);
    expect(creatorProfileResponse.body.creator.name).toBe('Recipe Owner');
    expect(creatorProfileResponse.body.stats.totalRecipes).toBe(1);
    expect(creatorProfileResponse.body.recipes).toHaveLength(1);

    const followerAuthResponse = await request(app).post('/api/auth/register').send({
      name: 'Follower',
      email: 'follower@example.com',
      password: 'password123'
    });

    const followResponse = await request(app)
      .post(`/api/auth/follow/${authResponse.body.user._id}`)
      .set('Authorization', `Bearer ${followerAuthResponse.body.token}`);
    expect(followResponse.statusCode).toBe(200);
    expect(followResponse.body.user.followingCreators).toContain(authResponse.body.user._id);

    const featuredCreatorsAfterFollowResponse = await request(app).get('/api/recipes/featured-creators');
    expect(featuredCreatorsAfterFollowResponse.statusCode).toBe(200);
    expect(featuredCreatorsAfterFollowResponse.body.creators[0].followerCount).toBe(1);

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${followerAuthResponse.body.token}`);
    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.body.followingCreators).toContain(authResponse.body.user._id);

    const followingFeedResponse = await request(app)
      .get('/api/recipes/following')
      .set('Authorization', `Bearer ${followerAuthResponse.body.token}`)
      .query({ page: 1, limit: 6 });
    expect(followingFeedResponse.statusCode).toBe(200);
    expect(followingFeedResponse.body.recipes).toHaveLength(1);

    const followingHighlightsResponse = await request(app)
      .get('/api/recipes/following/highlights')
      .set('Authorization', `Bearer ${followerAuthResponse.body.token}`);
    expect(followingHighlightsResponse.statusCode).toBe(200);
    expect(followingHighlightsResponse.body.highlights).toHaveLength(1);

    const deleteResponse = await request(app)
      .delete(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.message).toMatch(/deleted successfully/i);
  });

  test('rejects recipe creation without auth', async () => {
    const response = await request(app).post('/api/recipes').field('title', 'Unauthorized Recipe');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatch(/not authorized/i);
    expect(response.body.requestId).toBeTruthy();
    expect(response.headers['x-request-id']).toBeTruthy();
  });
});
