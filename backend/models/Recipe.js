const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    ingredients: {
      type: [String],
      required: true,
      default: []
    },
    instructions: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    ratings: {
      type: [ratingSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Recipe', recipeSchema);
