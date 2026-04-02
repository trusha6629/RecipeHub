export interface User {
  _id: string;
  name: string;
  email: string;
  followingCreators: string[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
  instructions: string;
  category: string;
  rating: number;
  image: string;
  createdBy: User;
  favorites: string[];
  ratings: Array<{ user: string; value: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRecipesResponse {
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface RecipeStats {
  totalRecipes: number;
  averageRating: number;
  totalFavorites: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

export interface FeaturedCreatorsResponse {
  creators: Array<{
    _id: string;
    totalRecipes: number;
    averageRating: number;
    totalFavorites: number;
    signatureCategory: string;
    followerCount: number;
    creator: {
      _id: string;
      name: string;
      email: string;
      joinedAt: string;
    };
  }>;
}

export interface CreatorStats {
  totalRecipes: number;
  averageRating: number;
  totalFavorites: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
  topRecipes: Array<{
    _id: string;
    title: string;
    category: string;
    rating: number;
    favoritesCount: number;
    createdAt: string;
  }>;
  monthlyTrend: Array<{
    label: string;
    recipesPublished: number;
    favoritesEarned: number;
  }>;
  bestSavedRecipe: {
    title: string;
    category: string;
    rating: number;
    favoritesCount: number;
  } | null;
}

export interface CreatorProfile {
  creator: {
    _id: string;
    name: string;
    email: string;
    joinedAt: string;
  };
  stats: {
    totalRecipes: number;
    averageRating: number;
    totalFavorites: number;
    followerCount: number;
  };
  recipes: Recipe[];
}

export interface FollowingHighlightsResponse {
  highlights: Recipe[];
}
