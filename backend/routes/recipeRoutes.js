const express = require('express');
const {
  getRecipes,
  getMyRecipes,
  getSavedRecipes,
  getFollowingRecipes,
  getFollowingHighlights,
  getRecipeStats,
  getFeaturedCreators,
  getCreatorStats,
  getCreatorProfile,
  getRecipeById,
  searchRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  rateRecipe
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getRecipes);
router.get('/my', protect, getMyRecipes);
router.get('/saved', protect, getSavedRecipes);
router.get('/following', protect, getFollowingRecipes);
router.get('/following/highlights', protect, getFollowingHighlights);
router.get('/stats', getRecipeStats);
router.get('/featured-creators', getFeaturedCreators);
router.get('/creator-stats', protect, getCreatorStats);
router.get('/creator-profile/:creatorId', getCreatorProfile);
router.get('/search', searchRecipes);
router.get('/:id', getRecipeById);
router.post('/', protect, upload.single('image'), createRecipe);
router.put('/:id', protect, upload.single('image'), updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.post('/:id/favorite', protect, toggleFavorite);
router.post('/:id/rate', protect, rateRecipe);

module.exports = router;
