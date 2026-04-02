import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  CreatorProfile,
  CreatorStats,
  FeaturedCreatorsResponse,
  FollowingHighlightsResponse,
  PaginatedRecipesResponse,
  Recipe,
  RecipeStats
} from '../models';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);

  getRecipes(filters?: {
    q?: string;
    category?: string;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'rating' | 'favorites';
  }) {
    let params = new HttpParams();

    if (filters?.q) {
      params = params.set('q', filters.q);
    }

    if (filters?.category) {
      params = params.set('category', filters.category);
    }

    if (filters?.page) {
      params = params.set('page', filters.page);
    }

    if (filters?.limit) {
      params = params.set('limit', filters.limit);
    }

    if (filters?.sort) {
      params = params.set('sort', filters.sort);
    }

    return this.http.get<PaginatedRecipesResponse>(`${environment.apiUrl}/recipes`, { params });
  }

  getMyRecipes(filters?: {
    q?: string;
    category?: string;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'rating' | 'favorites';
  }) {
    let params = new HttpParams();

    if (filters?.q) {
      params = params.set('q', filters.q);
    }

    if (filters?.category) {
      params = params.set('category', filters.category);
    }

    if (filters?.page) {
      params = params.set('page', filters.page);
    }

    if (filters?.limit) {
      params = params.set('limit', filters.limit);
    }

    if (filters?.sort) {
      params = params.set('sort', filters.sort);
    }

    return this.http.get<PaginatedRecipesResponse>(`${environment.apiUrl}/recipes/my`, { params });
  }

  getSavedRecipes(filters?: {
    q?: string;
    category?: string;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'rating' | 'favorites';
  }) {
    let params = new HttpParams();

    if (filters?.q) {
      params = params.set('q', filters.q);
    }

    if (filters?.category) {
      params = params.set('category', filters.category);
    }

    if (filters?.page) {
      params = params.set('page', filters.page);
    }

    if (filters?.limit) {
      params = params.set('limit', filters.limit);
    }

    if (filters?.sort) {
      params = params.set('sort', filters.sort);
    }

    return this.http.get<PaginatedRecipesResponse>(`${environment.apiUrl}/recipes/saved`, { params });
  }

  getFollowingRecipes(filters?: {
    q?: string;
    category?: string;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'rating' | 'favorites';
  }) {
    let params = new HttpParams();

    if (filters?.q) {
      params = params.set('q', filters.q);
    }

    if (filters?.category) {
      params = params.set('category', filters.category);
    }

    if (filters?.page) {
      params = params.set('page', filters.page);
    }

    if (filters?.limit) {
      params = params.set('limit', filters.limit);
    }

    if (filters?.sort) {
      params = params.set('sort', filters.sort);
    }

    return this.http.get<PaginatedRecipesResponse>(`${environment.apiUrl}/recipes/following`, { params });
  }

  getFollowingHighlights() {
    return this.http.get<FollowingHighlightsResponse>(`${environment.apiUrl}/recipes/following/highlights`);
  }

  getRecipeStats() {
    return this.http.get<RecipeStats>(`${environment.apiUrl}/recipes/stats`);
  }

  getFeaturedCreators() {
    return this.http.get<FeaturedCreatorsResponse>(`${environment.apiUrl}/recipes/featured-creators`);
  }

  getCreatorStats() {
    return this.http.get<CreatorStats>(`${environment.apiUrl}/recipes/creator-stats`);
  }

  getCreatorProfile(creatorId: string) {
    return this.http.get<CreatorProfile>(`${environment.apiUrl}/recipes/creator-profile/${creatorId}`);
  }

  searchRecipes(query: string) {
    const params = new HttpParams().set('q', query);
    return this.http.get<Recipe[]>(`${environment.apiUrl}/recipes/search`, { params });
  }

  getRecipeById(id: string) {
    return this.http.get<Recipe>(`${environment.apiUrl}/recipes/${id}`);
  }

  createRecipe(formData: FormData) {
    return this.http.post<Recipe>(`${environment.apiUrl}/recipes`, formData);
  }

  updateRecipe(id: string, formData: FormData) {
    return this.http.put<Recipe>(`${environment.apiUrl}/recipes/${id}`, formData);
  }

  deleteRecipe(id: string) {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/recipes/${id}`);
  }

  toggleFavorite(id: string) {
    return this.http.post<Recipe>(`${environment.apiUrl}/recipes/${id}/favorite`, {});
  }

  rateRecipe(id: string, value: number) {
    return this.http.post<Recipe>(`${environment.apiUrl}/recipes/${id}/rate`, { value });
  }

  imageUrl(path: string) {
    return path
      ? `${environment.uploadsUrl}${path}`
      : 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80';
  }
}
