const fs = require('fs');
const path = require('path');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

const buildImagePath = (file) => (file ? `/uploads/${file.filename}` : '');

const normalizeIngredients = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const syncRating = (recipe) => {
  if (!recipe.ratings.length) {
    recipe.rating = 0;
    return;
  }

  const total = recipe.ratings.reduce((sum, current) => sum + current.value, 0);
  recipe.rating = Number((total / recipe.ratings.length).toFixed(1));
};

const deleteLocalImage = (imagePath) => {
  if (!imagePath) {
    return;
  }

  const normalizedPath = imagePath.replace(/^\/+/, '');
  const absolutePath = path.join(__dirname, '..', normalizedPath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildListQuery = ({ q, category, createdBy, savedBy }) => {
  const query = {};

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = { $regex: `^${category}$`, $options: 'i' };
  }

  if (createdBy) {
    query.createdBy = createdBy;
  }

  if (savedBy) {
    query.favorites = savedBy;
  }

  return query;
};

const listRecipes = async (req, res, next, baseQuery = {}) => {
  try {
    const { q, category, page = '1', limit = '6', sort = 'newest' } = req.query;
    const query = {
      ...baseQuery,
      ...buildListQuery({ q, category })
    };
    const pageNumber = parsePositiveInt(page, 1);
    const pageSize = Math.min(parsePositiveInt(limit, 6), 24);
    const skip = (pageNumber - 1) * pageSize;
    const sortMap = {
      newest: { createdAt: -1 },
      rating: { rating: -1, createdAt: -1 },
      favorites: { favorites: -1, createdAt: -1 }
    };

    const total = await Recipe.countDocuments(query);

    const recipes = await Recipe.find(query)
      .populate('createdBy', 'name email')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(pageSize);

    res.json({
      recipes,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasNextPage: skip + recipes.length < total,
        hasPreviousPage: pageNumber > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

const getRecipes = async (req, res, next) => {
  await listRecipes(req, res, next);
};

const getMyRecipes = async (req, res, next) => {
  await listRecipes(req, res, next, { createdBy: req.user._id });
};

const getSavedRecipes = async (req, res, next) => {
  await listRecipes(req, res, next, { favorites: req.user._id });
};

const getFollowingRecipes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('followingCreators');
    const followingCreators = user?.followingCreators || [];

    await listRecipes(req, res, next, {
      createdBy: { $in: followingCreators.length ? followingCreators : [] }
    });
  } catch (error) {
    next(error);
  }
};

const getFollowingHighlights = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('followingCreators');
    const followingCreators = user?.followingCreators || [];

    if (!followingCreators.length) {
      return res.json({
        highlights: []
      });
    }

    const highlights = await Recipe.find({
      createdBy: { $in: followingCreators }
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({ highlights });
  } catch (error) {
    next(error);
  }
};

const getRecipeStats = async (_req, res, next) => {
  try {
    const [totals] = await Recipe.aggregate([
      {
        $project: {
          category: 1,
          rating: 1,
          favoritesCount: { $size: '$favorites' }
        }
      },
      {
        $group: {
          _id: null,
          totalRecipes: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalFavorites: { $sum: '$favoritesCount' }
        }
      }
    ]);

    const topCategories = await Recipe.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 3 }
    ]);

    res.json({
      totalRecipes: totals?.totalRecipes || 0,
      averageRating: Number((totals?.averageRating || 0).toFixed(1)),
      totalFavorites: totals?.totalFavorites || 0,
      topCategories: topCategories.map((item) => ({
        category: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedCreators = async (_req, res, next) => {
  try {
    const featuredCreators = await Recipe.aggregate([
      {
        $project: {
          createdBy: 1,
          rating: 1,
          favoritesCount: { $size: '$favorites' },
          category: 1
        }
      },
      {
        $group: {
          _id: '$createdBy',
          totalRecipes: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalFavorites: { $sum: '$favoritesCount' },
          signatureCategory: { $first: '$category' }
        }
      },
      { $sort: { totalFavorites: -1, averageRating: -1, totalRecipes: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'creator'
        }
      },
      { $unwind: '$creator' },
      {
        $lookup: {
          from: 'users',
          let: { creatorId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$$creatorId', '$followingCreators'] }
              }
            },
            { $count: 'count' }
          ],
          as: 'followers'
        }
      },
      {
        $project: {
          _id: 1,
          totalRecipes: 1,
          averageRating: { $round: ['$averageRating', 1] },
          totalFavorites: 1,
          signatureCategory: 1,
          creator: {
            _id: '$creator._id',
            name: '$creator.name',
            email: '$creator.email',
            joinedAt: '$creator.createdAt'
          },
          followerCount: {
            $ifNull: [{ $arrayElemAt: ['$followers.count', 0] }, 0]
          }
        }
      }
    ]);

    res.json({
      creators: featuredCreators
    });
  } catch (error) {
    next(error);
  }
};

const getCreatorStats = async (req, res, next) => {
  try {
    const creatorId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [totals] = await Recipe.aggregate([
      { $match: { createdBy: creatorId } },
      {
        $project: {
          category: 1,
          rating: 1,
          favoritesCount: { $size: '$favorites' }
        }
      },
      {
        $group: {
          _id: null,
          totalRecipes: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalFavorites: { $sum: '$favoritesCount' }
        }
      }
    ]);

    const topRecipes = await Recipe.find({ createdBy: creatorId })
      .sort({ rating: -1, createdAt: -1 })
      .limit(5)
      .select('title category rating favorites createdAt');

    const categoryBreakdown = await Recipe.aggregate([
      { $match: { createdBy: creatorId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1, _id: 1 } }
    ]);

    const monthlyTrend = await Recipe.aggregate([
      {
        $match: {
          createdBy: creatorId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          recipesPublished: { $sum: 1 },
          favoritesEarned: { $sum: { $size: '$favorites' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const bestSavedRecipe = await Recipe.findOne({ createdBy: creatorId })
      .sort({ favorites: -1, rating: -1, createdAt: -1 })
      .select('title category rating favorites');

    res.json({
      totalRecipes: totals?.totalRecipes || 0,
      averageRating: Number((totals?.averageRating || 0).toFixed(1)),
      totalFavorites: totals?.totalFavorites || 0,
      categoryBreakdown: categoryBreakdown.map((item) => ({
        category: item._id,
        count: item.count
      })),
      topRecipes: topRecipes.map((recipe) => ({
        _id: recipe._id,
        title: recipe.title,
        category: recipe.category,
        rating: recipe.rating,
        favoritesCount: recipe.favorites.length,
        createdAt: recipe.createdAt
      })),
      monthlyTrend: monthlyTrend.map((item) => ({
        label: `${String(item._id.month).padStart(2, '0')}/${item._id.year}`,
        recipesPublished: item.recipesPublished,
        favoritesEarned: item.favoritesEarned
      })),
      bestSavedRecipe: bestSavedRecipe
        ? {
            title: bestSavedRecipe.title,
            category: bestSavedRecipe.category,
            rating: bestSavedRecipe.rating,
            favoritesCount: bestSavedRecipe.favorites.length
          }
        : null
    });
  } catch (error) {
    next(error);
  }
};

const getCreatorProfile = async (req, res, next) => {
  try {
    const creator = await User.findById(req.params.creatorId).select('name email createdAt');

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found.' });
    }

    const [totals] = await Recipe.aggregate([
      { $match: { createdBy: creator._id } },
      {
        $project: {
          rating: 1,
          favoritesCount: { $size: '$favorites' }
        }
      },
      {
        $group: {
          _id: null,
          totalRecipes: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalFavorites: { $sum: '$favoritesCount' }
        }
      }
    ]);

    const recipes = await Recipe.find({ createdBy: creator._id })
      .populate('createdBy', 'name email')
      .sort({ rating: -1, createdAt: -1 })
      .limit(12);

    const followerCount = await User.countDocuments({ followingCreators: creator._id });

    res.json({
      creator: {
        _id: creator._id,
        name: creator.name,
        email: creator.email,
        joinedAt: creator.createdAt
      },
      stats: {
        totalRecipes: totals?.totalRecipes || 0,
        averageRating: Number((totals?.averageRating || 0).toFixed(1)),
        totalFavorites: totals?.totalFavorites || 0,
        followerCount
      },
      recipes
    });
  } catch (error) {
    next(error);
  }
};

const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'name email');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

const searchRecipes = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const recipes = await Recipe.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

const createRecipe = async (req, res, next) => {
  try {
    const { title, ingredients, instructions, category } = req.body;

    if (!title || !instructions || !category) {
      return res.status(400).json({ message: 'Title, instructions, and category are required.' });
    }

    const recipe = await Recipe.create({
      title,
      ingredients: normalizeIngredients(ingredients),
      instructions,
      category,
      image: buildImagePath(req.file),
      createdBy: req.user._id
    });

    const populatedRecipe = await recipe.populate('createdBy', 'name email');
    res.status(201).json(populatedRecipe);
  } catch (error) {
    next(error);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own recipes.' });
    }

    const { title, ingredients, instructions, category } = req.body;

    recipe.title = title ?? recipe.title;
    recipe.instructions = instructions ?? recipe.instructions;
    recipe.category = category ?? recipe.category;

    if (ingredients !== undefined) {
      recipe.ingredients = normalizeIngredients(ingredients);
    }

    if (req.file) {
      deleteLocalImage(recipe.image);
      recipe.image = buildImagePath(req.file);
    }

    await recipe.save();
    const populatedRecipe = await recipe.populate('createdBy', 'name email');
    res.json(populatedRecipe);
  } catch (error) {
    next(error);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own recipes.' });
    }

    deleteLocalImage(recipe.image);
    await recipe.deleteOne();

    res.json({ message: 'Recipe deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    const userId = req.user._id.toString();
    const index = recipe.favorites.findIndex((favorite) => favorite.toString() === userId);

    if (index >= 0) {
      recipe.favorites.splice(index, 1);
    } else {
      recipe.favorites.push(req.user._id);
    }

    await recipe.save();
    const populatedRecipe = await recipe.populate('createdBy', 'name email');
    res.json(populatedRecipe);
  } catch (error) {
    next(error);
  }
};

const rateRecipe = async (req, res, next) => {
  try {
    const { value } = req.body;
    const parsedValue = Number(value);

    if (!parsedValue || parsedValue < 1 || parsedValue > 5) {
      return res.status(400).json({ message: 'Rating value must be between 1 and 5.' });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    const userId = req.user._id.toString();
    const existingRating = recipe.ratings.find((rating) => rating.user.toString() === userId);

    if (existingRating) {
      existingRating.value = parsedValue;
    } else {
      recipe.ratings.push({
        user: req.user._id,
        value: parsedValue
      });
    }

    syncRating(recipe);
    await recipe.save();

    const populatedRecipe = await recipe.populate('createdBy', 'name email');
    res.json(populatedRecipe);
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
