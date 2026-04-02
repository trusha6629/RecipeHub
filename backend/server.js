const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { validateEnv } = require('./config/env');
const createApp = require('./app');

dotenv.config();

const startServer = async () => {
  try {
    const runtimeConfig = validateEnv();
    await connectDB();
    const app = createApp(runtimeConfig);

    app.listen(runtimeConfig.port, () => {
      console.log(`RecipeHub API listening on port ${runtimeConfig.port}`);
    });
  } catch (error) {
    console.error('Unable to start RecipeHub API:', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

startServer();
