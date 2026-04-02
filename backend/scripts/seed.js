const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { sampleRecipes } = require('../data/seedData');

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    await Recipe.deleteMany();
    await User.deleteMany();

    const demoUser = await User.create({
      name: 'Demo Chef',
      email: 'demo@recipehub.com',
      password: 'password123'
    });

    const seededRecipes = sampleRecipes.map((recipe) => ({
      ...recipe,
      createdBy: demoUser._id,
      favorites: [],
      ratings: [],
      rating: 0,
      image: ''
    }));

    await Recipe.insertMany(seededRecipes);

    console.log('Seed complete.');
    console.log('Demo login: demo@recipehub.com / password123');
    process.exit(0);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

const destroyDatabase = async () => {
  try {
    await connectDB();
    await Recipe.deleteMany();
    await User.deleteMany();
    console.log('Database cleared.');
    process.exit(0);
  } catch (error) {
    console.error(`Destroy failed: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv.includes('--destroy')) {
  destroyDatabase();
} else {
  seedDatabase();
}
